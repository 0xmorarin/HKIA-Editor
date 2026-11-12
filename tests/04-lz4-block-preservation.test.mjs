import test from 'node:test';
import assert from 'node:assert/strict';
import {zipLab,sha256} from './helpers/04-zip-lab-source.mjs';
import {dryRunSealedNativeCrossStoreCommitResearch} from '../scripts/research/save-transaction-engine.mjs';
import {fixture} from './helpers/04-puzzle-goals-source.mjs';
import {MAGIC,MessagePackReader,readSave,lz4Decompress} from '../src/save.js';
import {lz4EncodeLiteralOnly} from '../scripts/research/save-envelope-noop.mjs';
import {dryRunNativeSlotTransaction,materializeSyntheticSlotForInternalLabOnly} from '../scripts/research/save-transaction-engine.mjs';

const cat=(...a)=>{const b=new Uint8Array(a.reduce((n,x)=>n+x.length,0));let i=0;for(const x of a){b.set(x,i);i+=x.length;}return b;};
const u16=n=>Uint8Array.of(n>>>8&255,n&255),u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);
function decodeWrapper(slot){
  let marker=-1;for(let i=32;i<=slot.length-MAGIC.length;i++)if(slot.subarray(i,i+MAGIC.length).every((x,j)=>x===MAGIC[j])){assert.equal(marker,-1);marker=i;}
  assert.ok(marker>32);
  const r=new MessagePackReader(slot.subarray(marker+MAGIC.length)),arr=r.read();
  assert.equal(r.p,r.b.length);assert.ok(Array.isArray(arr));
  assert.equal(arr[0].__ext,98);
  const lr=new MessagePackReader(arr[0].bytes),lengths=[];
  while(lr.p<lr.b.length)lengths.push(lr.read());
  assert.equal(lengths.length,arr.length-1);
  const expanded=cat(...lengths.map((n,i)=>lz4Decompress(arr[i+1],n)));
  return {header:slot.subarray(0,marker),expanded,lengths,compressed:arr.slice(1)};
}
function lz4RepeatedA(n){
  assert.ok(n>=25);
  let ext=n-25;const more=[];
  while(ext>=255){more.push(255);ext-=255;}
  more.push(ext);
  // Valid LZ4: one literal, offset-1 match, final five literal bytes.
  return Uint8Array.of(0x1f,0x41,0x01,0x00,...more,0x50,0x41,0x41,0x41,0x41,0x41);
}
function encodeWrapper(header,expanded,cuts){
  assert.equal(cuts.reduce((a,n)=>a+n,0),expanded.length);
  assert.ok(cuts.every(n=>Number.isSafeInteger(n)&&n>0&&n<=65536));
  const lengthWords=cat(...cuts.map(n=>n===65536?cat(Uint8Array.of(0xce),u32(n)):cat(Uint8Array.of(0xcd),u16(n))));
  const lengthsExt=cat(Uint8Array.of(0xc8),u16(lengthWords.length),Uint8Array.of(98),lengthWords);
  let start=0;const blocks=[];
  for(const n of cuts){const block=expanded.subarray(start,start+n);
    const comp=block.length>=25&&block.every(v=>v===0x41)?lz4RepeatedA(block.length):lz4EncodeLiteralOnly(block);
    blocks.push(cat(Uint8Array.of(0xc6),u32(comp.length),comp));start+=n;}
  const a=cuts.length+1;
  const arrayHeader=a<16?Uint8Array.of(0x90|a):cat(Uint8Array.of(0xdc),u16(a));
  return cat(header,MAGIC,arrayHeader,lengthsExt,...blocks);
}
function paddedFixture({straddle=false,blockSize=65536}={}){
  const f=fixture('3.0.1'),old=decodeWrapper(f.slotBytes);
  const filler=new Uint8Array(220000).fill(0x41);
  // A purely synthetic, otherwise unrelated opaque union token.
  const unknown=cat(Uint8Array.of(0x92,0x2c,0x92,0x01,0xc6),u32(filler.length),filler);
  const expanded=cat(old.expanded,unknown);
  let lengths;
  if(straddle){
    const token=Uint8Array.of(0xca,0x3f,0x80,0,0),at=expanded.findIndex((x,i)=>x===token[0]&&expanded.subarray(i,i+5).every((v,j)=>v===token[j]));
    assert.ok(at>0);const cut=at+2;lengths=[cut];let rest=expanded.length-cut;while(rest>0){const n=Math.min(blockSize,rest);lengths.push(n);rest-=n;}
  }else{lengths=[];let rest=expanded.length;while(rest>0){const n=Math.min(blockSize,rest);lengths.push(n);rest-=n;}}
  const raw=encodeWrapper(old.header,expanded,lengths);
  assert.deepEqual(decodeWrapper(raw).expanded,expanded,'Reassembled synthetic LZ4 blocks must exactly recover expanded MessagePack');
  assert.equal(readSave(raw).version,'3.0.1');
  return {raw,leaf:f.localDefs.records[0]};
}
function plan(f,field='CompletedTime'){
  const row=readSave(f.raw).achievements.find(x=>x.guid===f.leaf.save_guid);
  assert.ok(row);
  return {version:'3.0.1',changes:[{model:'AchievementModel',guid:row.guid,documentId:row.id,field,
    expected:field==='CurrentValue'?1:null,next:field==='CurrentValue'?2:'2026-11-11T01:02:03.1234567Z'}]};
}

test('64 KiB touched block is split, all later compressed blocks remain byte-exact',()=>{
  const f=paddedFixture(),source=f.raw.slice(),before=decodeWrapper(f.raw),p=plan(f);
  assert.equal(before.lengths[0],65536);
  const proof=dryRunNativeSlotTransaction(f.raw,p),written=materializeSyntheticSlotForInternalLabOnly(f.raw,p),after=decodeWrapper(written);
  assert.equal(proof.touchedBlockOnlyReencode,true);
  assert.equal(proof.untouchedCompressedLz4BlocksByteIdentical,before.compressed.length-1);
  assert.equal(proof.reencodedLz4Blocks,2);assert.equal(proof.encodedLz4Blocks,before.compressed.length+1);
  assert.deepEqual(after.compressed.slice(-3),before.compressed.slice(-3));
  assert.ok(before.compressed.at(-1).length<400,'Untouched LZ4 match block must stay compressed');
  assert.deepEqual(after.expanded.subarray(-2048),before.expanded.subarray(-2048));
  assert.equal(after.expanded.length,before.expanded.length+9);
  assert.equal(readSave(written).achievements.find(x=>x.guid===f.leaf.save_guid).complete,false);
  assert.deepEqual(f.raw,source);
});

test('straddling typed float32 field re-encodes only adjoining block group',()=>{
  const f=paddedFixture({straddle:true}),before=decodeWrapper(f.raw),p=plan(f,'CurrentValue');
  const proof=dryRunNativeSlotTransaction(f.raw,p),written=materializeSyntheticSlotForInternalLabOnly(f.raw,p),after=decodeWrapper(written);
  assert.equal(proof.modifiedLz4Regions,1);
  assert.ok(proof.reencodedLz4Blocks>=2);
  assert.equal(proof.untouchedCompressedLz4BlocksByteIdentical,before.compressed.length-2);
  assert.deepEqual(after.compressed.slice(-2),before.compressed.slice(-2));
  assert.equal(readSave(written).achievements.find(x=>x.guid===f.leaf.save_guid).current,2);
});

test('CAS failure on multi-block source aborts without touching original',()=>{
  const f=paddedFixture(),copy=f.raw.slice(),p=plan(f);p.changes[0].expected='2026-11-10T01:02:03.1234567Z';
  assert.throws(()=>dryRunNativeSlotTransaction(f.raw,p),/CAS failed/);
  assert.deepEqual(f.raw,copy);
});

test('sealed cross-store research reports real recompressed-block accounting without exporting Native bytes',async()=>{
  const f=zipLab({version:'3.0.1',descriptor:'signed',extraMembers:16});
  const proof=await dryRunSealedNativeCrossStoreCommitResearch({
    zipBytes:f.zip,expectedZipSha256:sha256(f.zip),
    expectedNativeFormatPrefixSha256:sha256(new Uint8Array(32)),...f.f
  });
  assert.ok(proof.nativeReencodedLz4Blocks>=1);
  assert.ok(proof.nativeOriginalLz4BlockCount>=1);
  assert.ok(proof.nativeEncodedLz4BlockCount>=proof.nativeOriginalLz4BlockCount);
  assert.equal(proof.nativeOutputAuthorized,false);
  assert.equal(proof.zipBytesReturned,false);
  assert.equal(Object.values(proof).some(v=>v instanceof Uint8Array),false);
});


test('source-native 32KiB framing: length-growing timestamp touches only 32KiB partitions',()=>{
  const f=paddedFixture({blockSize:32768}),before=decodeWrapper(f.raw),p=plan(f);
  assert.ok(before.lengths.length>=6);
  assert.equal(Math.max(...before.lengths),32768);
  const original=f.raw.slice();
  const proof=dryRunNativeSlotTransaction(f.raw,p);
  const edited=materializeSyntheticSlotForInternalLabOnly(f.raw,p);
  const after=decodeWrapper(edited);
  assert.ok(after.lengths.every(n=>n>0&&n<=32768));
  assert.equal(proof.reencodedLz4Blocks,2);
  assert.equal(proof.untouchedCompressedLz4BlocksByteIdentical,before.compressed.length-1);
  assert.deepEqual(after.compressed.slice(-4),before.compressed.slice(-4));
  assert.deepEqual(f.raw,original);
});

test('source-native 32KiB framing: fixed-size progress replacement keeps every length token',()=>{
  const f=paddedFixture({blockSize:32768}),before=decodeWrapper(f.raw),p=plan(f,'CurrentValue');
  const proof=dryRunNativeSlotTransaction(f.raw,p);
  const edited=materializeSyntheticSlotForInternalLabOnly(f.raw,p);
  const after=decodeWrapper(edited);
  assert.deepEqual(after.lengths,before.lengths);
  assert.equal(proof.reencodedLz4Blocks,1);
  assert.equal(proof.untouchedCompressedLz4BlocksByteIdentical,before.compressed.length-1);
  assert.deepEqual(after.compressed.slice(1),before.compressed.slice(1));
  assert.equal(readSave(edited).achievements.find(x=>x.guid===f.leaf.save_guid).current,2);
});
