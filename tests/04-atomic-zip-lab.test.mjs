import test from 'node:test';
import assert from 'node:assert/strict';
import {zipLab,sha256} from './helpers/04-zip-lab-source.mjs';
import {dryRunSyntheticRawPreservingZipTransaction,SYNTHETIC_RAW_ZIP_WRITER_ENABLED} from '../scripts/research/save-atomic-zip-lab.mjs';

const run=(f,extra={})=>dryRunSyntheticRawPreservingZipTransaction({zipBytes:f.zip,mutations:f.mutation,...extra});
for(const descriptor of ['none','bare','signed'])test(`04 synthetic atomic ZIP rewrites both lab members, ${descriptor} descriptor, raw frames byte-exact`,async()=>{
  const f=zipLab({descriptor,extras:true,comment:true}),before=Buffer.from(f.zip);
  const r=await run(f);
  assert.equal(r.schema,'HKIA.04.SyntheticAtomicZipProof.1');
  assert.equal(r.changedSyntheticMembers,2);assert.equal(r.untouchedMembers,5);
  assert.equal(r.verifiedMemberCount,7);assert.equal(r.untouchedRawLocalFramesByteIdentical,true);
  assert.equal(r.untouchedCentralFieldsPreservedExceptOffsets,true);assert.equal(r.originalArchiveCommentPreserved,true);
  assert.equal(r.nativeSlotContentUnchanged,true);assert.equal(r.accountContentUnchanged,true);
  assert.equal(r.allMemberCrcRechecked,true);assert.equal(r.zipReassemblyInMemoryVerified,true);
  assert.equal(r.nativeOutputAuthorized,false);assert.equal(r.writerEnabled,false);
  assert.equal(r.exportedZipBytes,false);assert.equal(SYNTHETIC_RAW_ZIP_WRITER_ENABLED,false);
  assert.equal(JSON.stringify(r).includes('LabFixtures'),false);assert.equal('zipBytes' in r,false);
  assert.deepEqual(f.zip,before);
});
test('04 synthetic ZIP honors local-vs-central ordering and stored+compressed input',async()=>{
  for(const deflate of [true,false]){
    const f=zipLab({reverseCentral:true,descriptor:'signed',deflate,extras:true,comment:true});
    const r=await run(f);assert.equal(r.changedSyntheticMembers,2);assert.equal(r.untouchedCentralFieldsPreservedExceptOffsets,true);
  }
});
test('04 raw-copy synthetic stress: 128 non-target compressed members, exact frames retained',async()=>{
  const f=zipLab({extraMembers:128,descriptor:'bare'}),r=await run(f);
  assert.equal(r.changedSyntheticMembers,2);assert.equal(r.untouchedMembers,131);
  assert.equal(r.verifiedMemberCount,133);assert.ok(r.rawNonTargetBytesVerified>1000);
});
test('04 atomic CAS conflict in SECOND target aborts whole transaction without reporting success',async()=>{
  const f=zipLab(),snapshot=Buffer.from(f.zip);f.mutation[1].expectedSha256='0'.repeat(64);
  await assert.rejects(()=>run(f),/CAS mismatch/);assert.deepEqual(f.zip,snapshot);
});
for(const failAt of ['BEFORE_ASSEMBLY','AFTER_ASSEMBLY','AFTER_REPARSE'])test(`04 injected ${failAt} abort preserves complete original, no result`,async()=>{
  const f=zipLab(),original=Buffer.from(f.zip);
  await assert.rejects(()=>run(f,{failAt}),/Injected/);assert.deepEqual(f.zip,original);
});
test('04 cannot modify actual native slot/Account even with correct expected SHA',async()=>{
  const f=zipLab();const a={name:'Saves/save_0.save',expectedSha256:sha256(f.entries.get('Saves/save_0.save')),replacementBytes:Uint8Array.of(0)};
  await assert.rejects(()=>run(f,{mutations:[a,f.mutation[0]]}),/Only laboratory entries/);
  const account={name:'SettingsAccount/settings.json',expectedSha256:sha256(f.entries.get('SettingsAccount/settings.json')),replacementBytes:Uint8Array.of(0)};
  await assert.rejects(()=>run(f,{mutations:[account,f.mutation[0]]}),/Only laboratory entries/);
});
test('04 fails closed without synthetically marked archive even with correct CAS',async()=>{
  const f=zipLab({corruptMarker:true});await assert.rejects(()=>run(f),/Synthetic-only marker missing/);
});
test('04 raw layout with unknown prefix or gap cannot be rewritten',async()=>{
  for(const bad of [{prefix:true},{gap:true}]){const f=zipLab(bad);await assert.rejects(()=>run(f),/Opaque ZIP gaps/);}
});
test('04 CRC-corrupt unrelated compressed member aborts, original input untouched',async()=>{
  const f=zipLab({descriptor:'signed'}),raw=Buffer.from(f.zip);
  const center=raw.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));assert.ok(center>0);
  raw[center+16]^=0xff;const snapshot=Buffer.from(raw);
  await assert.rejects(()=>run({...f,zip:raw}),/CRC32|descriptor/);assert.deepEqual(raw,snapshot);
});
test('04 validates mutation cardinality, duplicate targets, missing members, oversize, and malformed CAS',async()=>{
  const f=zipLab();await assert.rejects(()=>run(f,{mutations:[f.mutation[0]]}),/two to four/);
  await assert.rejects(()=>run(f,{mutations:[f.mutation[0],f.mutation[0]]}),/Duplicate mutation/);
  await assert.rejects(()=>run(f,{mutations:[f.mutation[0],{...f.mutation[1],name:'LabFixtures/missing.bin'}]}),/Mutation entry missing/);
  await assert.rejects(()=>run(f,{mutations:[f.mutation[0],{...f.mutation[1],expectedSha256:'bad'}]}),/SHA-256 CAS token/);
  await assert.rejects(()=>run(f,{mutations:[f.mutation[0],{...f.mutation[1],replacementBytes:new Uint8Array(25*1024*1024+1)}]}),/too large/);
});
test('04 unknown future version remains untouched and never authorizes actual native ZIP write',async()=>{
  const f=zipLab({version:'3.0.2'}),before=f.zip.slice(),r=await run(f);
  assert.equal(r.nativeSlotContentUnchanged,true);assert.equal(r.nativeSaveApplyPerformed,false);assert.equal(r.nativeOutputAuthorized,false);
  assert.deepEqual(f.zip,before);
});
test('04 caller mutates ZIP after invocation: full operation fails closed on source race',async()=>{
  const f=zipLab(),before=Buffer.from(f.zip),job=run(f);
  f.zip[0]^=0x01;
  await assert.rejects(()=>job,/Original ZIP input mutated/);
  assert.notDeepEqual(f.zip,before);
});
test('04 caller mutates replacement buffers after call: transaction uses isolated snapshots',async()=>{
  const f=zipLab(),source=Buffer.from(f.zip),old=Buffer.from(f.mutation[1].replacementBytes);
  const job=run(f);f.mutation[1].replacementBytes.fill(0);
  const result=await job;
  assert.equal(result.changedSyntheticMembers,2);assert.equal(result.sourceCasVerified,true);
  assert.notDeepEqual(f.mutation[1].replacementBytes,old);assert.deepEqual(f.zip,source);
});
