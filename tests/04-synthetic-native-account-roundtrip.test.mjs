import test from 'node:test';
import assert from 'node:assert/strict';
import {zipLab,sha256} from './helpers/04-zip-lab-source.mjs';
import {dryRunSyntheticNativeAccountZipRoundTrip} from '../scripts/research/save-atomic-zip-lab.mjs';
import {materializeSyntheticSlotForInternalLabOnly,NATIVE_SLOT_WRITER_ENABLED} from '../scripts/research/save-transaction-engine.mjs';
import {NATIVE_CROSS_STORE_COMMIT_ENABLED} from '../scripts/research/save-native-revision-cas.mjs';
import {CROSS_STORE_WRITER_ENABLED} from '../scripts/research/save-cross-store-dry-run.mjs';

const run=(f,other={})=>dryRunSyntheticNativeAccountZipRoundTrip({zipBytes:f.zip,expectedZipSha256:sha256(f.zip),...f.f,...other});
for(const version of ['3.0.0','3.0.1'])for(const descriptor of ['none','bare','signed'])test(`04 SYNTHETIC native+Account ZIP 8+2 atomic reparse ${version} ${descriptor}`,async()=>{
  const f=zipLab({version,descriptor,extras:true,comment:true,reverseCentral:true,extraMembers:4}),snapshot=Buffer.from(f.zip);
  const result=await run(f);
  assert.equal(result.totalFieldsVerified,10);assert.equal(result.nativeSlotFieldsVerified,8);assert.equal(result.accountFieldsVerified,2);
  assert.equal(result.allZipMembersReparsed,true);assert.equal(result.rawNonTargetFramesByteIdentical,true);
  assert.equal(result.nativeUnknownMessagePackTokenBytesRetained,true);assert.equal(result.accountUnknownJsonLexicalTokensRetained,true);
  assert.equal(result.collectionSignedInt64TicksUnchanged,true);assert.equal(result.nativeAuthenticated,false);
  assert.equal(result.selectedModelSemanticDiffVerified,true);assert.equal(result.allUnselectedAchievementAndCounterRecordsUnchanged,true);
  assert.equal(result.nativeOutputAuthorized,false);assert.equal(result.realSaveVerified,false);assert.equal(result.exportedZipBytes,false);
  assert.equal(result.writerEnabled,false);assert.equal('built' in result,false);assert.ok(Object.isFrozen(result));
  assert.equal(JSON.stringify(result).includes('settings.json'),false);assert.deepEqual(f.zip,snapshot);
  assert.equal(NATIVE_SLOT_WRITER_ENABLED,false);assert.equal(NATIVE_CROSS_STORE_COMMIT_ENABLED,false);assert.equal(CROSS_STORE_WRITER_ENABLED,false);
});
for(const failAt of ['BEFORE_ASSEMBLY','AFTER_ASSEMBLY','AFTER_REPARSE'])test(`04 synthetic native+Account rollback at ${failAt}`,async()=>{
  const f=zipLab({descriptor:'signed'}),original=Buffer.from(f.zip);
  await assert.rejects(()=>run(f,{failAt}),/Injected/);assert.deepEqual(f.zip,original);
});
test('04 full ZIP revision CAS blocks changed comment even when Native+Account entries are identical',async()=>{
  const f=zipLab({comment:true}),p=Buffer.from(f.zip),before=Buffer.from(f.zip);
  const where=p.indexOf(Buffer.from('UNKNOWN-COMMENT-KEEP-EXACT'));assert.ok(where>=0);p[where]^=1;
  await assert.rejects(()=>run({...f,zip:p},{expectedZipSha256:sha256(f.zip)}),/ZIP revision CAS mismatch/);
  assert.deepEqual(f.zip,before);
});
test('04 synthetic native cross-store is hard-denied for future versions, corrupted ZIP, and missing fixture marker',async()=>{
  const future=zipLab({version:'3.0.2'});await assert.rejects(()=>run(future),/未検証の保存バージョン/);
  const corrupted=zipLab(),bytes=Buffer.from(corrupted.zip);let where=bytes.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));assert.ok(where>0);bytes[where+16]^=1;
  await assert.rejects(()=>run({...corrupted,zip:bytes}),/CRC32|descriptor|CRCが一致しません/);
  const wrong=zipLab({corruptMarker:true});await assert.rejects(()=>run(wrong),/Synthetic-only marker missing/);
});
test('04 original native format signature is not accepted as synthetic-only zero-prefix witness',()=>{
  const f=zipLab();const raw=Buffer.from(f.f.slotBytes);raw[0]=0x01;
  assert.throws(()=>materializeSyntheticSlotForInternalLabOnly(raw,{version:'3.0.1',changes:[]}),/Synthetic-only zero prefix/);
});
test('04 source linkage or Account CAS failure aborts before any complete ZIP result',async()=>{
  const f=zipLab(),original=Buffer.from(f.zip);
  await assert.rejects(()=>run(f,{completedAt:'2026-02-30T01:02:03.1234567Z'}));
  await assert.rejects(()=>run(f,{leafKey:'not_proven'}),/Only the Puzzle Goals/);
  assert.deepEqual(f.zip,original);
});

test('04 synthetic Native+Account with 128 unknown ZIP members retains all raw frames',async()=>{
  const f=zipLab({version:'3.0.1',descriptor:'signed',extraMembers:128,extras:true,comment:true});
  const r=await run(f);assert.equal(r.allZipMembersReparsed,true);
  assert.equal(r.nonTargetZipMembersUnchanged,true);assert.equal(r.exportedZipBytes,false);
});
test('04 synthetic Native+Account rejects caller ZIP race and never returns a candidate',async()=>{
  const f=zipLab({extraMembers:10,descriptor:'bare'}),job=run(f);f.zip[3]^=1;
  await assert.rejects(()=>job,/Original ZIP input mutated|Source mutated/);
});
