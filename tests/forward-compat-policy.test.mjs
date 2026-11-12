import test from 'node:test';
import assert from 'node:assert/strict';
import {classifySaveCompatibility,classifyRecordCompatibility} from '../src/forward-compat-policy.js';
const recognized={achievement:'RECOGNIZED',counter:'RECOGNIZED','collection-history':'RECOGNIZED'};
const base={version:'3.0.2',headerVersion:'3.0.2',headerStructureValid:true,wrapperStructureValid:true,domains:recognized};
test('future version with matching typed shape is provisional readable, not authorized writable',()=>{
  const r=classifySaveCompatibility(base);
  assert.equal(r.state,'UNKNOWN_VERSION_STRUCTURAL');
  assert.deepEqual(Object.values(r.readable),[true,true,true]);
  assert.equal(r.nativeExportAuthorized,false);
  assert.equal(r.gameAccepted,false);
});
test('known version with valid shape remains recognized but writer is not silently authorized',()=>{
  const r=classifySaveCompatibility({...base,version:'3.0.1',headerVersion:'3.0.1'});
  assert.equal(r.state,'KNOWN_VERSION_STRUCTURAL');assert.equal(r.nativeExportAuthorized,false);
});
test('unrecognized collection schema does not hide recognized achievements',()=>{
  const r=classifySaveCompatibility({...base,domains:{...recognized,'collection-history':'UNRECOGNIZED'}});
  assert.equal(r.readable.achievement,true);assert.equal(r.readable['collection-history'],false);
  assert.equal(r.completeModelCoverage,false);
});
test('header/body version mismatch fails closed, rather than partial trust',()=>{
  const r=classifySaveCompatibility({...base,headerVersion:'3.0.1'});
  assert.equal(r.state,'REJECTED');assert.deepEqual(Object.values(r.readable),[false,false,false]);
});
test('unknown achievement is identifiable and draft-editable even without localization',()=>{
  const r=classifyRecordCompatibility({domain:'achievement',id:987654,schemaState:'KNOWN_PREFIX_WITH_EXTRAS',sourceIdentityKnown:false,recordAlreadyPersisted:true});
  assert.equal(r.status,'RECOGNIZED_UNMAPPED');assert.equal(r.readable,true);
  assert.equal(r.createEditIntentAllowed,true);assert.equal(r.applyAuthorized,false);
  assert.ok(r.blockers.includes('requiredLinkageResolved'));
  assert.equal(r.preserveUnknownFields,true);
});
test('unknown collection history entry displays raw ItemId and can stage tick edits',()=>{
  const r=classifyRecordCompatibility({domain:'collection-history',id:123456,schemaState:'EXACT',sourceIdentityKnown:false,recordAlreadyPersisted:true});
  assert.match(r.displayLabel,/123456/);assert.ok(r.editableFields.includes('historyTicks'));
  assert.equal(r.createEditIntentAllowed,true);assert.equal(r.applyAuthorized,false);
});
test('unknown binary schema remains opaque and cannot be edited or recreated',()=>{
  const r=classifyRecordCompatibility({domain:'achievement',id:99,schemaState:'UNKNOWN',sourceIdentityKnown:false,recordAlreadyPersisted:true});
  assert.equal(r.status,'OPAQUE');assert.equal(r.createEditIntentAllowed,false);
});
test('unobserved new ID cannot be silently created',()=>{
  const r=classifyRecordCompatibility({domain:'collection-history',id:100,schemaState:'EXACT',sourceIdentityKnown:false,recordAlreadyPersisted:false});
  assert.ok(r.blockers.includes('NEW_RECORD_CREATION_UNVERIFIED'));
});
test('unknown names do not block apply after every independent safety gate is positively verified',()=>{
  const gates={writerApproved:true,versionCodecVerified:true,targetFieldVerified:true,losslessNonTargetVerified:true,reparseDiffVerified:true,nativeAcceptanceVerified:true};
  const r=classifyRecordCompatibility({domain:'achievement',id:'unmapped:abc123',schemaState:'EXACT',sourceIdentityKnown:false,recordAlreadyPersisted:true,requiredLinkageResolved:true,gates});
  assert.equal(r.applyAuthorized,true);assert.equal(r.status,'RECOGNIZED_UNMAPPED');
});
