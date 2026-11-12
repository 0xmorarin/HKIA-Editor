import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {captureAccountZipExport,inspectAccountZipExport,fingerprintSourceBytes,sourceRevisionSnapshot} from '../src/source-revision-ui.js';

const sha='a'.repeat(64);
const revision=(epoch=1,hash=sha)=>sourceRevisionSnapshot({sha256:hash,epoch,format:'zip'});
function setup(){
  const source={originalBytes:new Uint8Array([1,2,3]),originalName:'save.zip',account:{Achievements:{a:{IsComplete:false}},Counters:{}},
    sourceRevision:revision(),sourceLoadEpoch:1,accountEditGeneration:2,dirty:true,archiveLoaded:true,sourceLoading:false,slotEvidence:null};
  return {source,binding:captureAccountZipExport(source)};
}
function verify(change,sha256=sha){const {source,binding}=setup();change(source);return inspectAccountZipExport({binding,current:source,verifiedSha256:sha256});}

test('stable Account ZIP source permits account-only export after SHA comparison',()=>{
  const {source,binding}=setup();const result=inspectAccountZipExport({binding,current:source,verifiedSha256:sha});
  assert.equal(result.allowed,true);assert.deepEqual(result.blockers,[]);assert.equal(Object.isFrozen(result),true);
});
test('source switch, even equal bytes, fails file-object CAS',()=>{
  const result=verify(s=>{s.originalBytes=s.originalBytes.slice();});
  assert.equal(result.allowed,false);assert.ok(result.blockers.includes('SOURCE_REVISION_CAS_MISMATCH'));
});
test('new load generation invalidates completed ZIP',()=>{
  const result=verify(s=>{s.sourceLoadEpoch=2;s.sourceRevision=revision(2);});
  assert.ok(result.blockers.includes('SOURCE_REVISION_CAS_MISMATCH'));
});
test('source fingerprint mismatch rejects byte mutation',()=>{
  const result=verify(()=>{},'b'.repeat(64));
  assert.ok(result.blockers.includes('SOURCE_BYTES_SHA256_MISMATCH'));
});
test('rename while repack pending rejects old filename',()=>{
  const result=verify(s=>{s.originalName='other.zip';});
  assert.ok(result.blockers.includes('SOURCE_REVISION_CAS_MISMATCH'));
});
test('Undo and redo invalidate a preview even after identical final Account state',()=>{
  const result=verify(s=>{s.accountEditGeneration=4;});
  assert.ok(result.blockers.includes('ACCOUNT_EDIT_GENERATION_MISMATCH'));
});
test('batch mutation cannot bypass edit generation with a directly mutated object',()=>{
  const result=verify(s=>{s.account.Achievements.a.IsComplete=true;});
  assert.ok(result.blockers.includes('ACCOUNT_EDIT_GENERATION_MISMATCH'));
});
test('dirty reset cancels export even if former data is retained',()=>{
  const result=verify(s=>{s.dirty=false;});
  assert.ok(result.blockers.includes('ACCOUNT_ZIP_EXPORT_NOT_ELIGIBLE'));
});
test('starting another file import invalidates an in-flight export',()=>{
  const result=verify(s=>{s.sourceLoading=true;});
  assert.ok(result.blockers.includes('ACCOUNT_ZIP_EXPORT_NOT_ELIGIBLE'));
});
test('unsupported structural read mode blocks output',()=>{
  const result=verify(s=>{s.slotEvidence={accountExportAllowed:false};});
  assert.ok(result.blockers.includes('ACCOUNT_ZIP_EXPORT_NOT_ELIGIBLE'));
});
test('missing or account-JSON source revision cannot be used to export ZIP',()=>{
  const {source}=setup();source.sourceRevision=null;
  assert.throws(()=>captureAccountZipExport(source),/ACCOUNT_ZIP_SOURCE_REVISION_UNAVAILABLE/);
  source.sourceRevision=sourceRevisionSnapshot({sha256:sha,epoch:1,format:'account-json'});
  assert.throws(()=>captureAccountZipExport(source),/ACCOUNT_ZIP_SOURCE_REVISION_UNAVAILABLE/);
});
test('ineligible filename and invalid generation are rejected',()=>{
  const {source}=setup();source.originalName='settings.json';
  assert.throws(()=>captureAccountZipExport(source),/ACCOUNT_ZIP_SOURCE_REVISION_UNAVAILABLE/);
  source.originalName='save.zip';source.accountEditGeneration=-1;
  assert.throws(()=>captureAccountZipExport(source),/ACCOUNT_ZIP_SOURCE_REVISION_UNAVAILABLE/);
});
test('late snapshot without current account is rejected',()=>{
  const result=verify(s=>{s.account=null;});
  assert.ok(result.blockers.includes('ACCOUNT_ZIP_EXPORT_NOT_ELIGIBLE'));
});
test('actual SHA-256 of initial source and mutation differs',async()=>{
  const bytes=new Uint8Array([1,2,3]);const original=await fingerprintSourceBytes(bytes,webcrypto.subtle);bytes[0]=4;
  assert.notEqual(await fingerprintSourceBytes(bytes,webcrypto.subtle),original);
});
test('only account ZIP export touches 05 UI; native Writer remains disabled',()=>{
  const src=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
  const guard=readFileSync(new URL('../src/source-revision-ui.js',import.meta.url),'utf8');
  assert.match(src,/ACCOUNT_ZIP_EXPORT_CAS_ABORTED/);
  assert.match(src,/const sha256=await fingerprintSourceBytes\(binding\.originalBytes\)/);
  assert.match(src,/state\.zipExportBusy/);
  assert.match(src,/state\.accountEditGeneration\+\+/);
  assert.match(guard,/SOURCE_REVISION_CAS_MISMATCH/);
  assert.doesNotMatch(src+guard,/from ['"](?:node:|\.\/scripts\/research)/);
  assert.match(guard,/nativeApplyAuthorized:false,nativeExportAuthorized:false/);
});
