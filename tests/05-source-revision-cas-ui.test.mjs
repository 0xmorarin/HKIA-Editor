import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {
  SOURCE_REVISION_UI_SCHEMA,fingerprintSourceBytes,sourceRevisionSnapshot,
  inspectRevisionCAS,captureReadOnlyPreview,assessReadOnlyPreview
} from '../src/source-revision-ui.js';

const A='a'.repeat(64),B='b'.repeat(64);
const snapshot=(sha256=A,epoch=1,format='zip')=>sourceRevisionSnapshot({sha256,epoch,format});
const evidence=Object.freeze({schema:'HKIA.Web05.SlotDisplay.2',mode:'VALIDATED_BASELINE_READ',
  readable:{achievement:true,counter:true,'collection-history':true},extraFields:{achievement:0,counter:0},unknownUnionTokens:0});

test('browser SHA-256 hashes detached source bytes without modifying them',async()=>{
  const data=new TextEncoder().encode('abc'),before=data.slice();
  assert.equal(await fingerprintSourceBytes(data,webcrypto.subtle),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.deepEqual(data,before);
});

test('no SHA provider and invalid inputs fail closed',async()=>{
  await assert.rejects(fingerprintSourceBytes(new Uint8Array([1]),null),/SHA256_UNAVAILABLE/);
  await assert.rejects(fingerprintSourceBytes([1],webcrypto.subtle),/source byte snapshot/);
  assert.throws(()=>snapshot('x'.repeat(64)),/invalid source revision/);
  assert.throws(()=>snapshot(A,0),/invalid source revision/);
  assert.throws(()=>snapshot(A,1,'other'),/invalid source revision/);
});

test('same source and generation only authorize local read-only snapshot comparison',()=>{
  const s=snapshot();const result=inspectRevisionCAS({expected:s,current:s,readEvidence:evidence});
  assert.equal(s.schema,SOURCE_REVISION_UI_SCHEMA);
  assert.equal(Object.isFrozen(s),true);
  assert.equal(result.status,'LOCAL_SNAPSHOT_MATCH_ONLY');
  assert.equal(result.localSnapshotChecked,true);
  assert.equal(result.nativeCASVerified,false);
  assert.equal(result.nativeApplyAuthorized,false);
  assert.equal(result.nativeExportAuthorized,false);
  assert.ok(result.blockers.includes('NATIVE_CAS_NOT_EXECUTED_IN_BROWSER'));
  assert.ok(result.blockers.includes('ATOMIC_EDITED_ZIP_REPARSE_UNVERIFIED'));
});

test('different zip hash invalidates an old preview (CAS mismatch)',()=>{
  const preview=captureReadOnlyPreview(snapshot(),{domain:'achievement',readEvidence:evidence});
  const result=assessReadOnlyPreview(preview,snapshot(B,2));
  assert.equal(result.status,'SOURCE_REVISION_MISMATCH');
  assert.equal(result.stale,true);
  assert.ok(result.blockers.includes('SOURCE_REVISION_CAS_MISMATCH'));
  assert.ok(result.blockers.includes('STALE_PREVIEW_REJECTED'));
});

test('identical re-imported source hash but different load epoch invalidates preview',()=>{
  const preview=captureReadOnlyPreview(snapshot(),{domain:'collection-history',readEvidence:evidence});
  const result=assessReadOnlyPreview(preview,snapshot(A,2));
  assert.equal(result.status,'SOURCE_REVISION_MISMATCH');
});

test('missing source or untyped read evidence fails closed',()=>{
  assert.equal(inspectRevisionCAS().status,'REVISION_UNKNOWN');
  assert.ok(inspectRevisionCAS().blockers.includes('SOURCE_REVISION_UNKNOWN'));
  assert.throws(()=>captureReadOnlyPreview(null,{domain:'achievement'}),/SOURCE_REVISION_UNKNOWN/);
  assert.throws(()=>captureReadOnlyPreview(snapshot(),{domain:'not-domain'}),/invalid preview domain/);
  assert.throws(()=>inspectRevisionCAS({expected:snapshot(),current:snapshot(),readEvidence:{schema:'WRONG'}}),/invalid read evidence/);
});

test('Account-only JSON fingerprint never implies native cross-store CAS',()=>{
  const s=snapshot(A,1,'account-json');const result=inspectRevisionCAS({expected:s,current:s});
  assert.equal(result.status,'LOCAL_SNAPSHOT_MATCH_ONLY');
  assert.ok(result.blockers.includes('NATIVE_CROSS_STORE_CAS_REQUIRES_ZIP'));
  assert.equal(result.nativeApplyAuthorized,false);
});

test('unknown structural domains and extra union tokens add blockers',()=>{
  const s=snapshot(),read={...evidence,mode:'STRUCTURAL_READ_ONLY',readable:{achievement:true,counter:false,'collection-history':true},unknownUnionTokens:1,extraFields:{achievement:1,counter:0}};
  const result=inspectRevisionCAS({expected:s,current:s,readEvidence:read});
  assert.ok(result.blockers.includes('STRUCTURAL_READ_ONLY'));
  assert.ok(result.blockers.includes('DOMAIN_UNKNOWN'));
  assert.ok(result.blockers.includes('OPAQUE_UNION_FIELDS'));
});

test('research-only proof cannot enable application or export',()=>{
  const s=snapshot();const proof={schema:'HKIA.04.NativeCrossStoreRevisionCAS.1',mode:'READ_ONLY',writerEnabled:false,nativeOutputAuthorized:false,mutatedZipReturned:false,revisionCasPassed:true};
  const result=assessReadOnlyPreview(captureReadOnlyPreview(s,{domain:'counter',researchEvidence:proof}),s);
  assert.equal(result.researchReadOnlyEvidence,true);
  assert.ok(result.blockers.includes('RESEARCH_PROOF_IS_NOT_EXPORT_AUTHORIZATION'));
  assert.equal(result.nativeApplyAuthorized,false);
  assert.equal(result.nativeExportAuthorized,false);
  assert.throws(()=>inspectRevisionCAS({expected:s,current:s,researchEvidence:{...proof,writerEnabled:true}}),/untrusted native CAS evidence/);
});

test('no node research modules imported by browser UI, and stale preview guarded in UI',()=>{
  const src=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const adapter=readFileSync(new URL('../src/source-revision-ui.js',import.meta.url),'utf8');
  assert.match(src,/fingerprintSourceBytes/);
  assert.match(src,/inspectLivePreview\(nativeBinding\)/);
  assert.match(src,/SOURCE_REVISION_CAS_MISMATCH/);
  assert.doesNotMatch(src+adapter,/from ['"]\.{1,2}\/.*(?:research|node:)/);
  assert.match(adapter,/nativeApplyAuthorized:false,nativeExportAuthorized:false/);
});

test('baseline CSS mobile fileStatus 320px fix is retained',()=>{
  const css=readFileSync(new URL('../src/style.css',import.meta.url),'utf8');
  assert.match(css,/#fileStatus\{[^}]*overflow-wrap:anywhere/);
  assert.match(css,/#fileStatus\{[^}]*word-break:break-word/);
});
