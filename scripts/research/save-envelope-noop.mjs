/**
 * HKIA Switch v3.0.0 / v3.0.1 STRUCTURAL NO-OP RESEARCH ONLY.
 * This module does not write to disk, edit saved fields, or enable the browser slot writer.
 * It preserves all opaque metadata and MessagePack token bytes. A separate synthetic
 * literal-only LZ4 recompression proves the decompressor and block-framing roundtrip;
 * it is NOT a valid/hardware-tested modified save file.
 */
import {MAGIC, MessagePackReader, lz4Decompress, readSave} from '../../src/save.js';

function toBytes(x){if(x instanceof Uint8Array)return x;if(x instanceof ArrayBuffer)return new Uint8Array(x);throw new TypeError('Uint8Array required');}
function matchMagic(raw){
  let found=-1;
  for(let i=32;i<=raw.length-MAGIC.length;i++){
    let equal=true;for(let j=0;j<MAGIC.length;j++)if(raw[i+j]!==MAGIC[j]){equal=false;break;}
    if(equal){if(found>=0)throw new Error('Duplicate marker');found=i;}
  }
  if(found<0)throw new Error('No marker');return found;
}
function same(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
function concat(parts){let n=0;for(const p of parts)n+=p.length;const b=new Uint8Array(n);let i=0;for(const p of parts){b.set(p,i);i+=p.length;}return b;}
function u32be(n){return Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);}
function encodeBin(x){const len=x.length;return len<=255?concat([Uint8Array.of(0xc4,len),x]):len<=65535?concat([Uint8Array.of(0xc5,len>>>8,len&255),x]):concat([Uint8Array.of(0xc6),u32be(len),x]);}
export function lz4EncodeLiteralOnly(x){
  // LZ4 block with exactly one terminal sequence and no match. It is deliberately
  // not optimized; the roundtrip is a serialization probe, not a production codec.
  const n=x.length;if(n===0)throw new Error('Empty LZ4 block');
  if(n<15)return concat([Uint8Array.of(n<<4),x]);
  const parts=[Uint8Array.of(0xf0)];let left=n-15;
  while(left>=255){parts.push(Uint8Array.of(255));left-=255;}
  parts.push(Uint8Array.of(left),x);return concat(parts);
}
function readEnvelope(raw){
  const marker=matchMagic(raw);const wrapper=new MessagePackReader(raw.subarray(marker+MAGIC.length));
  const arrayStart=wrapper.p;let count;const op=wrapper.u8();
  if((op&0xf0)===0x90)count=op&15;
  else if(op===0xdc)count=wrapper.u16();
  else if(op===0xdd)count=wrapper.u32();
  else throw new Error('Invalid wrapper array');
  if(count<2||count>4097)throw new Error('Invalid block count');
  const arrayHeader=wrapper.b.slice(arrayStart,wrapper.p);
  const extStart=wrapper.p;const lengthsExt=wrapper.read();const lengthsToken=wrapper.b.slice(extStart,wrapper.p);
  if(lengthsExt?.__ext!==98)throw new Error('No LZ4 lengths ext');
  const lr=new MessagePackReader(lengthsExt.bytes);const lengths=[];
  while(lr.p<lr.b.length)lengths.push(lr.read());
  if(lengths.length!==count-1||lengths.some(v=>!Number.isSafeInteger(v)||v<1||v>65536))throw new Error('Invalid block lengths');
  if(lengths.reduce((a,b)=>a+b,0)>45*1024*1024)throw new Error('Output too large');
  const tokens=[],expanded=[];let originalCompressedSize=0;
  for(const expected of lengths){
    const start=wrapper.p;const chunk=wrapper.read();
    if(!(chunk instanceof Uint8Array))throw new Error('Invalid compressed block');
    tokens.push(wrapper.b.slice(start,wrapper.p));
    expanded.push(lz4Decompress(chunk,expected));originalCompressedSize+=chunk.length;
  }
  if(wrapper.p!==wrapper.b.length)throw new Error('Trailing data in wrapper');
  return {marker,raw,arrayHeader,lengthsToken,tokens,expanded,originalCompressedSize};
}
export function inspectNoopEnvelope(input){
  const raw=toBytes(input);
  // Validate the full game-save model before inspecting lower-level blocks.
  const save=readSave(raw);
  const s=readEnvelope(raw);
  const originalReassembled=concat([raw.subarray(0,s.marker),MAGIC,s.arrayHeader,s.lengthsToken,...s.tokens]);
  if(!same(raw,originalReassembled))throw new Error('Byte-exact original-frame no-op failed');
  const literalOnly=concat([raw.subarray(0,s.marker),MAGIC,s.arrayHeader,s.lengthsToken,...s.expanded.map(x=>encodeBin(lz4EncodeLiteralOnly(x)))]);
  const other=readEnvelope(literalOnly);
  if(!same(concat(s.expanded),concat(other.expanded)))throw new Error('Recompressed payload differs');
  const sourceInfo=readSave(literalOnly);
  if(sourceInfo.version!==save.version||sourceInfo.achievements.length!==save.achievements.length||sourceInfo.counters.length!==save.counters.length||sourceInfo.collections.historyEntries!==save.collections.historyEntries)throw new Error('Semantic summary mismatch');
  return {
    version:save.version, markerOffset:s.marker, blocks:s.expanded.length,
    expandedBytes:s.expanded.reduce((n,p)=>n+p.length,0),
    originalCompressedBytes:s.originalCompressedSize, literalOnlyFileBytes:literalOnly.length,
    originalIdentityVerified:true, expandedPayloadIdentityVerified:true,
    opaqueMetadataBytesPreserved:s.marker, changedCompressedRepresentation:!same(raw,literalOnly),
    // Never expose the literalOnly file: its game-level integrity/auth checks are unverified.
    writerEnabled:false, hardwareVerified:false
  };
}

/**
 * RESEARCH-ONLY byte-location proof. Locate one AchievementModel union-16
 * and flip ONLY its MessagePack bool token IN MEMORY. Any recompressed save
 * is deliberately discarded: a plausible structural re-encode is NOT an
 * authentic save, and achievement progress/counter/rewards are not reconciled.
 *
 * Relevant independent source comparison: github.com/0xmorarin/HKIA-DLC-Patcher
 * and github.com/capibawa/HKIA-Save-Platform-Patcher. Neither implementation
 * is copied: this probe uses our existing byte scanner and literal-only codec.
 */
export function probeAchievementFlagCodec(input, targetGuid){
  const raw=toBytes(input);
  if(!/^[0-9a-f]{8}(?::[0-9a-f]{8}){3}$/i.test(targetGuid))throw new Error('Invalid target slot GUID');
  const original=readSave(raw);
  const target=original.achievements.find(x=>x.guid.toLowerCase()===targetGuid.toLowerCase());
  if(!target)throw new Error('GUID is not an existing AchievementModel');
  const s=readEnvelope(raw);
  const expanded=concat(s.expanded);
  const reader=new MessagePackReader(expanded);
  let matches=0,flagByte=-1;
  while(reader.p<reader.b.length){
    const token=reader.read();
    if(!Array.isArray(token)||token.length!==2||token[0]!==16||!Array.isArray(token[1])||token[1].length!==3)continue;
    const [documentId,w0,w1]=token[1];
    const w2=reader.read(),w3=reader.read();
    const dataAt=reader.p;
    const fields=reader.read();
    if([w0,w1,w2,w3].some(x=>!Number.isInteger(x)||x<0||x>0xffffffff))throw new Error('Malformed achievement identifier');
    if(!Array.isArray(fields)||fields.length!==3||typeof fields[0]!=='boolean')throw new Error('Malformed achievement data');
    const guid=[w0,w1,w2,w3].map(n=>n.toString(16).padStart(8,'0')).join(':');
    if(guid.toLowerCase()!==targetGuid.toLowerCase())continue;
    if(documentId!==target.id||fields[0]!==target.complete)throw new Error('Save identity mismatch');
    matches++;
    // For this known formatter AchievementData is an array3, immediately
    // followed by IsComplete encoded as one MessagePack boolean byte.
    if(expanded[dataAt]!==0x93||![0xc2,0xc3].includes(expanded[dataAt+1]))throw new Error('Unsupported achievement token encoding');
    flagByte=dataAt+1;
  }
  if(matches!==1||flagByte<0)throw new Error(`Expected one matching AchievementModel, got ${matches}`);
  const replacement=expanded.slice();replacement[flagByte]^=1;
  if(!([0xc2,0xc3].includes(replacement[flagByte])))throw new Error('Boolean-only patch failed');
  let diffs=0;
  for(let i=0;i<expanded.length;i++)if(expanded[i]!==replacement[i])diffs++;
  if(diffs!==1)throw new Error('More than one byte changed');
  let offset=0;
  const changedBlocks=[];
  for(const chunk of s.expanded){
    const bytes=replacement.subarray(offset,offset+chunk.length);
    changedBlocks.push(encodeBin(lz4EncodeLiteralOnly(bytes)));
    offset+=chunk.length;
  }
  if(offset!==replacement.length)throw new Error('Block lengths changed');
  const encoded=concat([raw.subarray(0,s.marker),MAGIC,s.arrayHeader,s.lengthsToken,...changedBlocks]);
  const readback=readSave(encoded);
  const after=readback.achievements.find(x=>x.guid.toLowerCase()===targetGuid.toLowerCase());
  if(!after||after.id!==target.id||after.complete===target.complete||after.current!==target.current||after.completed!==target.completed)throw new Error('Changed achievement failed readback');
  if(readback.achievements.length!==original.achievements.length||readback.counters.length!==original.counters.length||readback.collections.historyEntries!==original.collections.historyEntries)throw new Error('Unexpected save layout change');
  // Preserve and validate all other achievement states, not just counts.
  const oldMap=new Map(original.achievements.map(a=>[a.guid,a]));
  for(const a of readback.achievements){
    const b=oldMap.get(a.guid);
    if(!b||a.id!==b.id||a.current!==b.current||a.completed!==b.completed||(a.guid.toLowerCase()!==targetGuid.toLowerCase()&&a.complete!==b.complete))throw new Error('Unrelated achievement changed');
  }
  // Do NOT return encoded/replacement/source bytes: they are intentionally
  // unreachable from the caller, UI, or any downloadable artifact.
  return Object.freeze({
    version:original.version,documentId:target.id,guid:target.guid,
    flagBefore:target.complete,flagAfter:after.complete,
    expandedDiffBytes:diffs,compressedBlockCount:s.expanded.length,
    originalNotMutated:true,decodedReadbackVerified:true,
    gameAccepted:false,writerEnabled:false,hardwareVerified:false,
    completionConsistencyVerified:false,rewardsVerified:false
  });
}

/**
 * Inspect an existing float32 GameCounterModel (union-17), change only the
 * four float32 payload bytes in memory, reframe the LZ4, read back and discard.
 * This does not alter CountedValues, CountedGuids, achievements or rewards.
 */
export function probeCounterFloatCodec(input, targetGuid, nextValue){
  const raw=toBytes(input);
  if(!/^[0-9a-f]{8}(?::[0-9a-f]{8}){3}$/i.test(targetGuid))throw new Error('Invalid counter GUID');
  if(typeof nextValue!=='number'||!Number.isFinite(nextValue)||nextValue<0||Math.fround(nextValue)!==nextValue)throw new Error('Counter replacement is not lossless float32');
  const original=readSave(raw);
  const target=original.counters.find(x=>x.guid.toLowerCase()===targetGuid.toLowerCase());
  if(!target)throw new Error('Counter GUID is not in save');
  if(target.current===nextValue)throw new Error('Counter replacement is unchanged');
  const s=readEnvelope(raw),expanded=concat(s.expanded),reader=new MessagePackReader(expanded);
  let matches=0,floatAt=-1;
  while(reader.p<reader.b.length){
    const tag=reader.read();
    if(!Array.isArray(tag)||tag.length!==2||tag[0]!==17||!Array.isArray(tag[1])||tag[1].length!==3)continue;
    const [id,w0,w1]=tag[1],w2=reader.read(),w3=reader.read(),dataAt=reader.p,fields=reader.read();
    if([w0,w1,w2,w3].some(x=>!Number.isInteger(x)||x<0||x>0xffffffff)||!Array.isArray(fields)||fields.length!==3||!Array.isArray(fields[2]))throw new Error('Malformed GameCounterModel');
    for(let i=0;i<fields[2].length*3;i++)reader.read();
    const guid=[w0,w1,w2,w3].map(n=>n.toString(16).padStart(8,'0')).join(':');
    if(guid.toLowerCase()!==targetGuid.toLowerCase())continue;
    if(id!==target.id||fields[0]!==target.current)throw new Error('Counter identity mismatch');
    if(expanded[dataAt]!==0x93||expanded[dataAt+1]!==0xca)throw new Error('Unsupported counter value token');
    floatAt=dataAt+2;matches++;
  }
  if(matches!==1||floatAt<0)throw new Error(`Expected one matching counter, got ${matches}`);
  const replacement=expanded.slice();
  new DataView(replacement.buffer,replacement.byteOffset,replacement.byteLength).setFloat32(floatAt,nextValue,false);
  let diffs=0;for(let i=0;i<expanded.length;i++)if(expanded[i]!==replacement[i])diffs++;
  if(diffs<1||diffs>4)throw new Error('Counter change exceeded float32 payload');
  let offset=0;const blocks=[];
  for(const chunk of s.expanded){const bytes=replacement.subarray(offset,offset+chunk.length);blocks.push(encodeBin(lz4EncodeLiteralOnly(bytes)));offset+=chunk.length;}
  if(offset!==replacement.length)throw new Error('Unexpected block size');
  const encoded=concat([raw.subarray(0,s.marker),MAGIC,s.arrayHeader,s.lengthsToken,...blocks]);
  const afterSave=readSave(encoded);
  const after=afterSave.counters.find(x=>x.guid.toLowerCase()===targetGuid.toLowerCase());
  if(!after||after.id!==target.id||after.current!==nextValue||after.countedGuids!==target.countedGuids)throw new Error('Counter readback mismatch');
  const beforeCounters=new Map(original.counters.map(x=>[x.guid,x]));
  for(const x of afterSave.counters){const y=beforeCounters.get(x.guid);if(!y||x.id!==y.id||x.countedGuids!==y.countedGuids||x.guid!==target.guid&&x.current!==y.current)throw new Error('Other counter changed');}
  const beforeAchievements=new Map(original.achievements.map(x=>[x.guid,x]));
  for(const x of afterSave.achievements){const y=beforeAchievements.get(x.guid);if(!y||x.id!==y.id||x.complete!==y.complete||x.current!==y.current||x.completed!==y.completed)throw new Error('Achievement side effect');}
  if(afterSave.collections.historyEntries!==original.collections.historyEntries)throw new Error('Collection side effect');
  return Object.freeze({version:original.version,guid:target.guid,documentId:target.id,before:target.current,after:after.current,
    expandedDiffBytes:diffs,originalNotMutated:true,decodedReadbackVerified:true,
    gameAccepted:false,writerEnabled:false,completionConsistencyVerified:false,rewardsVerified:false});
}
