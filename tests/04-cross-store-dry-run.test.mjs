import test from 'node:test';
import assert from 'node:assert/strict';
import {MAGIC,readSave} from '../src/save.js';
import {lz4EncodeLiteralOnly} from '../scripts/research/save-envelope-noop.mjs';
import {dryRunPuzzleGoalsCrossStore,compareV2FormatPrefix,classifyFutureNativeShape,CROSS_STORE_WRITER_ENABLED} from '../scripts/research/save-cross-store-dry-run.mjs';

                                                                      
const cat=(...p)=>{const b=new Uint8Array(p.reduce((a,x)=>a+x.length,0));let i=0;for(const x of p){b.set(x,i);i+=x.length;}return b;};
const u16=n=>Uint8Array.of(n>>8&255,n&255),u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);
const u32tok=n=>cat(Uint8Array.of(0xce),u32(n));
const f32=n=>{const b=new Uint8Array(5);b[0]=0xca;new DataView(b.buffer).setFloat32(1,n,false);return b;};
const srcGuid=n=>n.toString(16).padStart(32,'0');
const saveGuid=n=>[n,0,0,0].map(x=>x.toString(16).padStart(8,'0')).join(':');
const str=x=>{const b=new TextEncoder().encode(x);return b.length<32?cat(Uint8Array.of(0xa0|b.length),b):cat(Uint8Array.of(0xd9,b.length),b);};
function mp(x){
  if(x===null)return Uint8Array.of(0xc0);if(typeof x==='boolean')return Uint8Array.of(x?0xc3:0xc2);
  if(typeof x==='string')return str(x);
  if(typeof x==='bigint')return cat(Uint8Array.of(0xcf),Uint8Array.from({length:8},(_,i)=>Number(x>>BigInt((7-i)*8)&255n)));
  if(typeof x==='number')return Number.isSafeInteger(x)&&x>=0&&x<128?Uint8Array.of(x):u32tok(x);
  if(Array.isArray(x)){const count=x.length;return cat(count<16?Uint8Array.of(0x90|count):cat(Uint8Array.of(0xdc),u16(count)),...x.map(mp));}
  if(x instanceof Map){const count=x.size;return cat(count<16?Uint8Array.of(0x80|count):cat(Uint8Array.of(0xde),u16(count)),...[...x].flatMap(([k,v])=>[mp(k),mp(v)]));}
  throw Error('Unsupported synthetic token');
}
const ts=cat(Uint8Array.of(0xd6,0xff),u32(1750000000));
function fixture(version='3.0.1'){
  const leafSource=1000,parentSource=2000,rootSource=4000,rootCounter=4001,groupCounter=2001;
  const leaf={key:'achievement_puzzlesInTheStars',guid:srcGuid(leafSource),save_guid:saveGuid(leafSource),counter_guid:srcGuid(1005),counter_save_guid:saveGuid(1005),counter_kind:'GameCounterManualDefinition',threshold:5};
  const parent={key:'collection_puzzle',guid:srcGuid(parentSource),save_guid:saveGuid(parentSource),counter_guid:srcGuid(groupCounter),counter_save_guid:saveGuid(groupCounter),counter_kind:'GameCounterAchievementsDefinition'};
  const siblings=Array.from({length:4},(_,j)=>1001+j),rootSiblings=Array.from({length:62},(_,j)=>3000+j);
  const refs=[...[leafSource,...siblings].map(n=>({guid:srcGuid(n),save_guid:saveGuid(n),group_counter_guid:srcGuid(groupCounter)})),
    ...[parentSource,...rootSiblings].map(n=>({guid:srcGuid(n),save_guid:saveGuid(n),group_counter_guid:srcGuid(rootCounter)}))];
  const slotDefs={achievement_references:refs,counters:[
    {guid:srcGuid(groupCounter),reference_count:5,storage:'InGame',kind:'AchievementsCounter'},
    {guid:srcGuid(rootCounter),reference_count:63,storage:'Meta',kind:'AchievementsCounter'}]};
  const localDefs={records:[leaf,parent,...Array.from({length:818},(_,i)=>({key:`dummy_${i}`}))]};
  const metaDefs=[{key:'Local_RootAchievement',guid:srcGuid(rootSource),counter_guid:srcGuid(rootCounter),built_in_references:63}];
  const achievements=[{n:leafSource,current:1,complete:false},{n:parentSource,current:4,complete:false},
    ...siblings.map(n=>({n,current:1,complete:true})),
    ...rootSiblings.slice(0,53).map((n,i)=>({n,current:i<19?1:0,complete:i<19}))];
  assert.equal(achievements.length,59);
  const counters=[{n:1005,current:1},{n:groupCounter,current:4}];
  let id=0;
  const recordA=({n,current,complete})=>cat(mp([16,[++id,n,0]]),u32tok(0),u32tok(0),Uint8Array.of(0x93,complete?0xc3:0xc2),f32(current),complete?ts:Uint8Array.of(0xc0));
  const recordC=({n,current})=>cat(mp([17,[++id,n,0]]),u32tok(0),u32tok(0),Uint8Array.of(0x93),f32(current),Uint8Array.of(0xc0,0x90));
  const top=[0,0,[[0,[0,0,version]]],[39,[new Map(),new Map([[2000,1234567890n]])]]];
  const unknown=cat(mp([44,[1,new Map([['unknown_key',5]])]]));
  const expanded=cat(mp(top),...achievements.map(recordA),...counters.map(recordC),unknown);
  const lens=[];const compressed=[];
  for(let p=0;p<expanded.length;p+=32768){const piece=expanded.subarray(p,p+32768);lens.push(piece.length);compressed.push(lz4EncodeLiteralOnly(piece));}
  const lenExt=cat(Uint8Array.of(0xc8),u16(lens.length*3),Uint8Array.of(98),...lens.map(n=>cat(Uint8Array.of(0xcd),u16(n))));
  const frame=cat(Uint8Array.of(0x90|(lens.length+1)),lenExt,...compressed.map(b=>cat(Uint8Array.of(0xc5),u16(b.length),b)));
                                                                                
                                                                                 
  const metadata=cat(Uint8Array.of(0x98),u32tok(0),u32tok(0),u32tok(0),u32tok(0),str(version),u32tok(Number(version.split('.')[0])*10000+Number(version.split('.')[1])*100+Number(version.split('.')[2])),
    cat(Uint8Array.of(0x92),ts,Uint8Array.of(0)),Uint8Array.of(0),mp(new Map()),mp([]),mp([9]));
  const slotBytes=cat(new Uint8Array(32),metadata,MAGIC,frame);
  const accountJson=`{\n  "Achievements" : {"${srcGuid(rootSource)}": {"IsComplete": false, "CurrentValue": 1.9e1, "CompletedTime": null, "Extra": {"format":"\\u0041"}}},\n  "Counters" : {"${srcGuid(rootCounter)}": {"CurrentValue": 19, "Extra": [true, null, {"number":-2.00e+3}]}},\n  "NonTarget": {"name":"語彙", "OriginalNumber": 4.20e+01, "a": [0,1,2]}\n}`;
  if(version==='3.0.0'||version==='3.0.1')assert.equal(readSave(slotBytes).achievements.length,59);
  return {slotBytes,accountJson,localDefs,slotDefs,metaDefs,completedAt:'2026-11-11T01:02:03.1234567Z'};
}
const run=x=>dryRunPuzzleGoalsCrossStore(x);
test('conditional REQUIRED: 8 slot + 2 Account numeric tokens validated and atomic dry-run',()=>{
  const f=fixture(),raw=f.slotBytes.slice(),acct=f.accountJson;
  const result=run(f);
  assert.equal(result.dependency,'CONDITIONAL_REQUIRED');assert.equal(result.totalChangedFields,10);
  assert.equal(result.changedSlotFields,8);assert.equal(result.changedAccountFields,2);
  assert.deepEqual(result.before,{leafProgress:1,groupProgress:4,rootProgress:19});
  assert.deepEqual(result.after,{leafProgress:5,groupProgress:5,rootProgress:20});
  assert.equal(result.slotExpandedByteDelta,18);assert.equal(result.accountReparseVerified,true);
  assert.equal(result.unknownSlotTokensRetained,true);assert.equal(result.unknownAccountTokensRetained,true);
  assert.equal(result.writerEnabled,false);assert.equal(result.slotBytesExported,false);assert.equal(result.accountBytesExported,false);
  assert.equal('raw' in result,false);assert.equal('account' in result,false);assert.deepEqual(f.slotBytes,raw);assert.equal(f.accountJson,acct);
});
test('CAS abort Account root mismatch happens after independent slot proof, without modifying either input',()=>{
  const f=fixture(),saved=f.slotBytes.slice(),acct=f.accountJson.replace('"CurrentValue": 19,','"CurrentValue": 18,');
  assert.throws(()=>run({...f,accountJson:acct}),/Account root value does not equal complete members/);
  assert.deepEqual(f.slotBytes,saved);assert.equal(f.accountJson.includes('1.9e1'),true);
});
test('conditional group mismatch rejects incomplete sibling and does not produce partial output',()=>{
  const f=fixture(),refs=f.slotDefs.achievement_references;
  f.slotDefs={...f.slotDefs,achievement_references:refs.slice(1)};
  assert.throws(()=>run(f));
});
test('invalid timestamp, unsupported leaf, malformed/duplicate Account fields are rejected',()=>{
  const f=fixture();assert.throws(()=>run({...f,completedAt:'2026-02-30T01:02:03.1234567Z'}));
  assert.throws(()=>run({...f,leafKey:'unmapped_puzzle'}));
  assert.throws(()=>run({...f,accountJson:f.accountJson.replace('"CurrentValue": 1.9e1,','"CurrentValue": 19,"CurrentValue":19,')}));
  assert.throws(()=>run({...f,accountJson:f.accountJson.slice(0,-3)}));
});
test('wrong Account root candidate is rejected, no JSON normalization or byte leaks',()=>{
  const f=fixture();f.metaDefs=[{...f.metaDefs[0],guid:srcGuid(999)}];
  assert.throws(()=>run(f));
});
test('format prefix can be compared to an explicitly pinned native signature without claiming auth',()=>{
  const f=fixture(),signature=f.slotBytes.slice(0,32);
  const good=compareV2FormatPrefix(f.slotBytes,signature);assert.equal(good.formatSignatureMatch,true);
  const forged=f.slotBytes.slice();forged[0]^=1;
  const bad=compareV2FormatPrefix(forged,signature);assert.equal(bad.formatSignatureMatch,false);
  assert.equal(bad.integrityVerified,false);assert.equal(good.integrityVerified,false);
  assert.equal(compareV2FormatPrefix(f.slotBytes).formatSignatureCompared,false);
});
test('future structure classification permits read-intent only, never native transaction',()=>{
  const recognized={achievement:'RECOGNIZED',counter:'RECOGNIZED','collection-history':'RECOGNIZED'};
  const r=classifyFutureNativeShape({version:'3.0.2',headerVersion:'3.0.2',headerStructureValid:true,wrapperStructureValid:true,domains:recognized});
  assert.equal(r.state,'UNKNOWN_VERSION_STRUCTURAL');assert.equal(r.readable.achievement,true);
  assert.equal(r.transactionAllowed,false);assert.equal(r.nativeExportAuthorized,false);
  assert.equal(CROSS_STORE_WRITER_ENABLED,false);
});
test('negative: no hidden Account/ZIP output, no changes to caller-supplied Account bytes',()=>{
  const f=fixture(),arr=new TextEncoder().encode(f.accountJson),before=arr.slice();
  const r=run({...f,accountJson:arr});assert.deepEqual(arr,before);
  assert.equal(r.zipExported,false);assert.equal(r.transactionDryRunAtomic,true);assert.equal(r.gameAccepted,false);
});

test('synthetic v3.0.0 uses the same validated typed 10-field transaction, not a new version assumption',()=>{
  const f=fixture('3.0.0'),r=run(f);assert.equal(r.version,'3.0.0');assert.equal(r.totalChangedFields,10);assert.equal(r.writerEnabled,false);
});
test('new unknown 3.0.2 envelope with unchanged model shape cannot bypass native writer/version gate',()=>{
  const f=fixture('3.0.2');assert.throws(()=>run(f),/未検証の保存バージョン/);
});

import {deflateRawSync} from 'node:zlib';
import {auditNativeZipReadOnly,probePuzzleGoalsZipTransaction,NATIVE_ZIP_WRITER_ENABLED} from '../scripts/research/save-archive-preflight.mjs';
const le16=n=>{const b=Buffer.alloc(2);b.writeUInt16LE(n);return b;};
const le32=n=>{const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b;};
function crc32ForFixture(bytes){let x=0xffffffff;for(const b of bytes){x^=b;for(let i=0;i<8;i++)x=(x&1)?(0xedb88320^(x>>>1)):(x>>>1);}return(x^0xffffffff)>>>0;}
function fakeZip(members){
  let offset=0,totalCentral=0;const local=[],central=[];
  for(const [name,value,compress] of members){
    const raw=Buffer.from(value),nameBytes=Buffer.from(name,'utf8'),data=compress?deflateRawSync(raw):raw,crc=crc32ForFixture(raw),method=compress?8:0;
    const header=Buffer.concat([le32(0x04034b50),le16(20),le16(0x800),le16(method),le16(0),le16(0),le32(crc),le32(data.length),le32(raw.length),le16(nameBytes.length),le16(0),nameBytes,data]);
    const directory=Buffer.concat([le32(0x02014b50),le16(20),le16(20),le16(0x800),le16(method),le16(0),le16(0),le32(crc),le32(data.length),le32(raw.length),le16(nameBytes.length),le16(0),le16(0),le16(0),le16(0),le32(0),le32(offset),nameBytes]);
    local.push(header);central.push(directory);offset+=header.length;totalCentral+=directory.length;
  }
  const end=Buffer.concat([le32(0x06054b50),le16(0),le16(0),le16(members.length),le16(members.length),le32(totalCentral),le32(offset),le16(0)]);
  return Buffer.concat([...local,...central,end]);
}
function zippedFixture(f=fixture()){
  return fakeZip([['SettingsAccount/settings.json',new TextEncoder().encode(f.accountJson),true],
    ['Saves/save_0.save',f.slotBytes,true],['Saves/save_0.lbak',Uint8Array.of(1,2,3,4),false],
    ['Other/private-non-target.bin',new TextEncoder().encode('UNRELATED_MEMBER_GUARD_04'),false]]);
}

test('ZIP preflight validates every member CRC without exposing user data or changing original',async()=>{
  const f=fixture(),data=zippedFixture(f),original=Buffer.from(data);
  const result=await auditNativeZipReadOnly(data);
  assert.equal(result.schema,'HKIA.04.NativeZipReadOnlyPreflight.1');
  assert.deepEqual(result.zip,{entryCount:4,nonTargetEntryCount:2,crcValidatedEntryCount:4,
    totalExtractedBytes:Buffer.byteLength(f.accountJson)+f.slotBytes.length+4+Buffer.byteLength('UNRELATED_MEMBER_GUARD_04'),
    originalInputUnmodified:true,noOpSourceBytesPreserved:true});
  assert.equal(result.version,'3.0.1');assert.equal(result.versionKnown,true);
  assert.equal(result.nativeOutputAuthorized,false);assert.equal(result.integrityVerified,false);
  assert.equal(NATIVE_ZIP_WRITER_ENABLED,false);assert.equal('bytes' in result,false);
  assert.equal(JSON.stringify(result).includes('unknown_key'),false);
  assert.deepEqual(data,original);
});

test('03 conditional REQUIRED ZIP dry-run confirms 8+2, no partial ZIP or account output',async()=>{
  const f=fixture(),data=zippedFixture(f),snapshot=Buffer.from(data);
  const result=await probePuzzleGoalsZipTransaction({...f,zipBytes:data});
  assert.equal(result.schema,'HKIA.04.PuzzleGoalsZipDryRun.1');
  assert.equal(result.plannedFieldCount,10);assert.equal(result.slotChangedFields,8);assert.equal(result.accountChangedFields,2);
  assert.equal(result.zipEntriesValidated,4);assert.equal(result.reparseValidated,true);
  assert.equal(result.exactUntouchedSlotTokens,true);assert.equal(result.accountUnknownTokensRetained,true);
  assert.equal(result.nativeOutputAuthorized,false);assert.equal(result.requiresAtomicZipWriter,true);
  assert.deepEqual(data,snapshot);
  assert.ok(!JSON.stringify(result).includes('UNRELATED_MEMBER_GUARD_04'));
});

test('ZIP preflight rejects bad unrelated CRC and does not leave partial changes',async()=>{
  const f=fixture(),bad=zippedFixture(f);const i=bad.indexOf(Buffer.from('UNRELATED_MEMBER_GUARD_04'));
  assert.ok(i>0);bad[i]^=1;const before=Buffer.from(bad);
  await assert.rejects(()=>auditNativeZipReadOnly(bad),/CRC32|CRC/);
  await assert.rejects(()=>probePuzzleGoalsZipTransaction({...f,zipBytes:bad}),/CRC32|CRC/);
  assert.deepEqual(bad,before);
});

test('ZIP cross-store CAS failure aborts and keeps all original source bytes',async()=>{
  const f=fixture(),original=f.accountJson.replace('"CurrentValue": 19,','"CurrentValue": 18,');
  const corrupted=zippedFixture({...f,accountJson:original});const before=Buffer.from(corrupted);
  await assert.rejects(()=>probePuzzleGoalsZipTransaction({...f,zipBytes:corrupted}),/Account root value does not equal complete members/);
  assert.deepEqual(corrupted,before);
});

test('future version native slot ZIP is read-only and cannot execute conditional plan',async()=>{
  const f=fixture('3.0.2'),zip=zippedFixture(f);const result=await auditNativeZipReadOnly(zip);
  assert.equal(result.version,'3.0.2');assert.equal(result.versionKnown,false);
  assert.equal(result.typedPlanAllowed,false);assert.equal(result.nativeOutputAuthorized,false);
  await assert.rejects(()=>probePuzzleGoalsZipTransaction({...f,zipBytes:zip}),/未検証の保存バージョン/);
});

test('optional pinned V2 format signature rejects mismatch, without claiming authentication',async()=>{
  const f=fixture(),zip=zippedFixture(f),sig=f.slotBytes.slice(0,32),changed=sig.slice();changed[0]^=1;
  const valid=await auditNativeZipReadOnly(zip,{expectedFormatSignature:sig});
  assert.equal(valid.formatSignatureCompared,true);assert.equal(valid.formatSignatureMatch,true);assert.equal(valid.integrityVerified,false);
  await assert.rejects(()=>auditNativeZipReadOnly(zip,{expectedFormatSignature:changed}),/format signature mismatch/);
});

test('ZIP preflight rejects oversized central member and malformed missing member',async()=>{
  const f=fixture(),zip=zippedFixture(f),before=Buffer.from(zip);
  const at=zip.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));assert.ok(at>0);
  const oversized=Buffer.from(zip);oversized.writeUInt32LE(61*1024*1024,at+24);
  await assert.rejects(()=>auditNativeZipReadOnly(oversized),/上限|サイズ/);
  const missing=fakeZip([['SettingsAccount/settings.json',new TextEncoder().encode(f.accountJson),false]]);
  await assert.rejects(()=>auditNativeZipReadOnly(missing),/Native save member missing/);
  assert.deepEqual(zip,before);
});

import {inspectPrivateFixtureBuffersReadOnly} from '../scripts/research/save-private-fixture-audit.mjs';
test('private fixture offline classifier returns aggregates only, never names, GUIDs, times, or save bytes',async()=>{
  const f=fixture(),archive=zippedFixture(f),snapshot=Buffer.from(archive);
  const result=await inspectPrivateFixtureBuffersReadOnly([f.slotBytes,archive]);
  assert.equal(result.inputFiles,2);assert.equal(result.archives,1);
  assert.equal(result.crcCheckedMembers,4);assert.equal(result.slotRecords,3);
  assert.equal(result.accepted.strict,2);
  assert.equal(result.nativeOutputAuthorized,false);assert.equal(result.writerEnabled,false);
  assert.equal(JSON.stringify(result).includes('settings.json'),false);
  assert.equal(JSON.stringify(result).includes('puzzlesInTheStars'),false);
  assert.deepEqual(archive,snapshot);
});
