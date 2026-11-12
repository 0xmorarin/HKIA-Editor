import test from 'node:test';
import assert from 'node:assert/strict';
import {zipLab,sha256} from './helpers/04-zip-lab-source.mjs';
import {prepareNativeCrossStoreRevisionCASReadOnly,NATIVE_CROSS_STORE_COMMIT_ENABLED} from '../scripts/research/save-native-revision-cas.mjs';
const prep=f=>({...f.f,zipBytes:f.zip,expectedZipSha256:sha256(f.zip)});
for(const version of ['3.0.0','3.0.1'])test(`04 ZIP full revision CAS + 03 P0 conditional 8+2 plan ${version}`,async()=>{
  const f=zipLab({version}),source=Buffer.from(f.zip),r=await prepareNativeCrossStoreRevisionCASReadOnly(prep(f));
  assert.equal(r.version,version);assert.equal(r.revisionCasPassed,true);
  assert.equal(r.totalPlannedFields,10);assert.equal(r.knownRequiredScope,'PUZZLE_GOALS_ONLY');
  assert.equal(r.componentDiffExactlyVerified,true);assert.equal(r.rawAccountUnknownTokenRetentionVerified,true);
  assert.equal(r.rawNativeOpaqueTokenRetentionVerified,true);assert.equal(r.zipCopyLayoutVerified,true);
  assert.equal(r.mutatedZipReturned,false);assert.equal(r.nativeOutputAuthorized,false);
  assert.equal(NATIVE_CROSS_STORE_COMMIT_ENABLED,false);assert.ok(Object.isFrozen(r));
  assert.ok(Object.isFrozen(r.blockerCodes));assert.deepEqual(f.zip,source);
  assert.equal(JSON.stringify(r).includes('SettingsAccount'),false);
});
test('04 revision CAS aborts before any cross-store plan if ZIP snapshot changed',async()=>{
  const f=zipLab(),arg=prep(f),before=Buffer.from(f.zip);
  arg.expectedZipSha256='0'.repeat(64);
  await assert.rejects(()=>prepareNativeCrossStoreRevisionCASReadOnly(arg),/revision CAS mismatch/);
  assert.deepEqual(f.zip,before);
});
test('04 revision CAS uses full ZIP identity, not just selected native+Account entry values',async()=>{
  const f=zipLab(),arg=prep(f);
  const mutated=Buffer.from(f.zip);const position=mutated.indexOf(Buffer.from('UNKNOWN-COMMENT-KEEP-EXACT'));
  assert.equal(position,-1);
  const padded=zipLab({comment:true});const checked=prep(padded),altered=Buffer.from(padded.zip);
  const where=altered.indexOf(Buffer.from('UNKNOWN-COMMENT-KEEP-EXACT'));assert.ok(where>0);altered[where]^=0x01;
  await assert.rejects(()=>prepareNativeCrossStoreRevisionCASReadOnly({...checked,zipBytes:altered}),/revision CAS mismatch/);
  assert.deepEqual(checked.zipBytes,padded.zip);
});
test('04 revision CAS unsupported version, false timestamp, unproven 03 linkage all fail closed',async()=>{
  const future=zipLab({version:'3.0.2'});
  await assert.rejects(()=>prepareNativeCrossStoreRevisionCASReadOnly(prep(future)),/未検証の保存バージョン/);
  const f=zipLab();const p=prep(f);
  await assert.rejects(()=>prepareNativeCrossStoreRevisionCASReadOnly({...p,completedAt:'2026-02-30T00:00:00.1234567Z'}));
  await assert.rejects(()=>prepareNativeCrossStoreRevisionCASReadOnly({...p,leafKey:'not_proven'}),/Only the Puzzle Goals/);
  assert.deepEqual(f.zip,p.zipBytes);
});
