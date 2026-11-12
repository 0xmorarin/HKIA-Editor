import test from 'node:test';
import assert from 'node:assert/strict';
import {MAGIC, readSave} from '../src/save.js';
import {lz4EncodeLiteralOnly} from '../scripts/research/save-envelope-noop.mjs';
import {auditNativeSlotNoop,dryRunNativeSlotTransaction,NATIVE_SLOT_WRITER_ENABLED} from '../scripts/research/save-transaction-engine.mjs';

// Intentionally synthetic data; test fixture contains no personal save/game binaries.
const concat=(...parts)=>{const result=new Uint8Array(parts.reduce((n,x)=>n+x.length,0));let at=0;for(const part of parts){result.set(part,at);at+=part.length;}return result;};
const u16=n=>Uint8Array.of(n>>>8&255,n&255),u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);
const f32=n=>{const a=new Uint8Array(5);a[0]=0xca;new DataView(a.buffer).setFloat32(1,n,false);return a;};
const str=s=>{const x=new TextEncoder().encode(s);assert.ok(x.length<32);return concat(Uint8Array.of(0xa0|x.length),x);};
const array=a=>concat(Uint8Array.of(0x90|a.length),...a.map(mp));
const map=m=>concat(Uint8Array.of(0x80|m.size),...[...m].flatMap(([k,v])=>[mp(k),mp(v)]));
function mp(x){
  if(x===null)return Uint8Array.of(0xc0);
  if(x===true)return Uint8Array.of(0xc3);
  if(x===false)return Uint8Array.of(0xc2);
  if(typeof x==='string')return str(x);
  if(x instanceof Map)return map(x);
  if(Array.isArray(x))return array(x);
  if(x instanceof Uint8Array)return concat(Uint8Array.of(0xc4,x.length),x);
  if(typeof x==='number')return Number.isInteger(x)&&x>=0&&x<128?Uint8Array.of(x):u32Token(x);
  if(typeof x==='bigint')return concat(Uint8Array.of(0xcf),Uint8Array.from({length:8},(_,i)=>Number(x>>BigInt((7-i)*8)&255n)));
  throw Error('Invalid synthetic data');
}
const u32Token=n=>concat(Uint8Array.of(0xce),u32(n));
const lengthsExt=lengths=>{const body=concat(...lengths.map(n=>concat(Uint8Array.of(0xcd),u16(n))));return concat(Uint8Array.of(0xc8),u16(body.length),Uint8Array.of(98),body);};
function syntheticSave(){
  const now=concat(Uint8Array.of(0xd6,0xff),u32(1750000000));
  const head=concat(Uint8Array.of(0x98),u32Token(0),u32Token(0),u32Token(0),u32Token(0),str('3.0.1'),u32Token(30001),concat(Uint8Array.of(0x92),now,Uint8Array.of(0)),Uint8Array.of(0),mp(new Map()),mp([]),mp([9]));
  const root=[0,0,[[0,[0,0,'3.0.1']]],[39,[new Map(),new Map([[2000,1234567890n]])]]];
  const achievementGuid='00000001:00000002:00000003:00000004';
  const counterGuid='00000005:00000006:00000007:00000008';
  const secondAchievementGuid='00000009:0000000a:0000000b:0000000c';
  const secondCounterGuid='0000000d:0000000e:0000000f:00000010';
  const expanded=concat(mp(root),mp([16,[10,1,2]]),u32Token(3),u32Token(4),concat(Uint8Array.of(0x93,0xc2),f32(1),Uint8Array.of(0xc0)),mp([17,[20,5,6]]),u32Token(7),u32Token(8),concat(Uint8Array.of(0x93),f32(1),Uint8Array.of(0xc0,0x90)),mp([16,[11,9,10]]),u32Token(11),u32Token(12),concat(Uint8Array.of(0x93,0xc2),f32(4),Uint8Array.of(0xc0)),mp([17,[21,13,14]]),u32Token(15),u32Token(16),concat(Uint8Array.of(0x93),f32(4),Uint8Array.of(0xc0,0x90)),mp([44,[1,new Uint8Array([1,2,3])]]));
  const split=Math.floor(expanded.length/2),parts=[expanded.subarray(0,split),expanded.subarray(split)];
  const frame=concat(Uint8Array.of(0x93),lengthsExt(parts.map(b=>b.length)),...parts.map(b=>{const z=lz4EncodeLiteralOnly(b);return concat(Uint8Array.of(0xc5),u16(z.length),z);}));
  const raw=concat(new Uint8Array(32),head,MAGIC,frame);
  return {raw,achievementGuid,counterGuid,secondAchievementGuid,secondCounterGuid};
}
function patchPlan({achievementGuid,counterGuid},version='3.0.1'){
  return {version,changes:[
    {model:'AchievementModel',guid:achievementGuid,documentId:10,field:'IsComplete',expected:false,next:true},
    {model:'AchievementModel',guid:achievementGuid,documentId:10,field:'CurrentValue',expected:1,next:5},
    {model:'AchievementModel',guid:achievementGuid,documentId:10,field:'CompletedTime',expected:null,next:'2026-11-11T01:02:03.1234567Z'},
    {model:'GameCounterModel',guid:counterGuid,documentId:20,field:'CurrentValue',expected:1,next:5},
  ]};
}
test('synthetic valid native slot parses without test fixture content entering public site',()=>{
  const {raw}=syntheticSave(),decoded=readSave(raw);assert.equal(decoded.version,'3.0.1');assert.equal(decoded.achievements.length,2);assert.equal(decoded.counters.length,2);assert.equal(decoded.collections.historyEntries,1);
});
test('full no-op retains every original wrapper byte and unknown decoded token',()=>{
  const {raw}=syntheticSave(),copy=raw.slice(),result=auditNativeSlotNoop(raw);
  assert.equal(result.originalFrameByteIdentical,true);assert.equal(result.decodedPayloadByteIdentical,true);
  assert.equal(result.unknownTokenBytesPreserved,true);assert.equal(result.writerEnabled,false);
  assert.deepEqual(raw,copy);assert.equal('encoded' in result,false);
});
test('CAS transaction 4 fields, timestamp growth, unknown preservation, no save bytes returned',()=>{
  const fixture=syntheticSave(),copy=fixture.raw.slice(),result=dryRunNativeSlotTransaction(fixture.raw,patchPlan(fixture));
  assert.equal(result.changedFieldCount,4);assert.equal(result.changedExpandedBytes-result.originalExpandedBytes,9);
  assert.equal(result.readbackVerified,true);assert.equal(result.copiedAllUneditedTokenBytes,true);assert.equal(result.requiresCrossStoreAtomicityGate,true);
  assert.equal(result.writerEnabled,false);assert.equal(result.saveExported,false);assert.equal('raw' in result,false);assert.deepEqual(fixture.raw,copy);
});
test('eight-field group-style atomic in-memory proof, both timestamps grow 18 bytes in aggregate',()=>{
  const f=syntheticSave(),saved=f.raw.slice(),p=patchPlan(f),second=[
    {model:'AchievementModel',guid:f.secondAchievementGuid,documentId:11,field:'IsComplete',expected:false,next:true},
    {model:'AchievementModel',guid:f.secondAchievementGuid,documentId:11,field:'CurrentValue',expected:4,next:5},
    {model:'AchievementModel',guid:f.secondAchievementGuid,documentId:11,field:'CompletedTime',expected:null,next:'2026-11-11T01:02:03.1234567Z'},
    {model:'GameCounterModel',guid:f.secondCounterGuid,documentId:21,field:'CurrentValue',expected:4,next:5},
  ];
  p.changes.push(...second);
  const r=dryRunNativeSlotTransaction(f.raw,p);
  assert.equal(r.changedFieldCount,8);assert.equal(r.changedExpandedBytes-r.originalExpandedBytes,18);
  assert.equal(r.fields.length,8);assert.equal(r.readbackVerified,true);assert.deepEqual(f.raw,saved);
});
test('atomic abort on later failed CAS makes no change to the supplied original',()=>{
  const f=syntheticSave(),saved=f.raw.slice(),p=patchPlan(f);
  p.changes[3].expected=999;
  assert.throws(()=>dryRunNativeSlotTransaction(f.raw,p),/CAS failed/);
  assert.deepEqual(f.raw,saved);
});
test('negative: no-op-only report, malformed/unsupported CAS, overlapping changes, invalid dates',()=>{
  const f=syntheticSave(),plan=patchPlan(f);const reject=(changes,version='3.0.1')=>assert.throws(()=>dryRunNativeSlotTransaction(f.raw,{version,changes}));
  reject([]);reject(plan.changes,'3.0.0');
  reject([plan.changes[0],plan.changes[0]]);reject([{...plan.changes[0],documentId:99}]);
  reject([{...plan.changes[0],guid:'abcdefgh'}]);reject([{...plan.changes[0],expected:true}]);
  reject([{...plan.changes[1],next:1.1}]);reject([{...plan.changes[1],next:1}]);
  reject([{...plan.changes[2],next:'2026-02-30T01:02:03.1234567Z'}]);
  reject([{...plan.changes[2],next:'2026-11-11T01:02:03Z'}]);
  reject([{...plan.changes[0],model:'GameCollectionsTraitModel'}]);
  reject([{...plan.changes[3],field:'CountedGuids'}]);
  assert.equal(NATIVE_SLOT_WRITER_ENABLED,false);
});
test('negative: changed opaque 32-byte prefix still structurally parses but authenticity is never claimed',()=>{
  const f=syntheticSave(),a=f.raw.slice();a[0]=1;
  const result=auditNativeSlotNoop(a);assert.equal(result.signatureVerified,false);assert.equal(result.integrityVerified,false);assert.equal(result.hardwareVerified,false);
});
test('negative: structural tampering with marker or wrapper is rejected',()=>{
  const f=syntheticSave(),a=f.raw.slice();a[32]=0xc0;
  assert.throws(()=>auditNativeSlotNoop(a));
  const b=f.raw.slice();const found=b.findIndex((x,i)=>x===MAGIC[0]&&b.subarray(i,i+MAGIC.length).every((v,j)=>v===MAGIC[j]));
  assert.ok(found>32);b[found]=0;assert.throws(()=>dryRunNativeSlotTransaction(b,patchPlan(f)));
});
