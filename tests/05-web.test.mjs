import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  WEB05_WRITER_PORT,achievementReadStatus,dependencyInspector,
  previewNativeAchievementIntent,previewNativeCollectionIntent
} from '../src/ui-state.js';
import {buildCollectionReadModel} from '../src/collection-state-contract.js';

const fixture=n=>JSON.parse(readFileSync(new URL('../data/'+n,import.meta.url)));
const guid='deadbeef000000000000000000000000';
const record={kind:'slot',id:1739,guid,complete:false,current:1,completed:null};
const itemModel=()=>buildCollectionReadModel({
  itemManifest:fixture('item-collection-crosswalk.json'),
  definitions:fixture('collection-definitions.json'),
  parentManifest:fixture('item-parent-crosswalk.json'),
  collectedItemIds:[2000000001],saveVersion:'3.0.1'
});

test('unmapped persisted achievement retains GUID, Document ID, recorded state and unknown definition identity',()=>{
  const state=achievementReadStatus(record,false);
  assert.equal(state.status,'未達成');
  assert.equal(state.timeStatus,'未設定');
  assert.equal(state.label,`実績 GUID ${guid}`);
  assert.equal(state.compatibility.status,'RECOGNIZED_UNMAPPED');
  assert.equal(state.compatibility.applyAuthorized,false);
  assert.equal(state.compatibility.id,1739);
  assert.ok(state.compatibility.createEditIntentAllowed);
  assert.equal(state.nativeEditable,false);
});

test('UNKNOWN persisted status is not normalized to false',()=>{
  assert.equal(achievementReadStatus({...record,complete:null,completed:undefined},false).status,'UNKNOWN');
  assert.equal(achievementReadStatus({...record,complete:null,completed:undefined},false).timeStatus,'UNKNOWN');
});

test('03 classification only marks Puzzle terminal 8 + 2 as conditional candidates',()=>{
  const target=dependencyInspector({domain:'slot',key:'achievement_puzzlesInTheStars',hasCounter:true,hasGroup:true});
  assert.equal(target.requiredConditionalCandidate,10);
  assert.equal(target.requiredConfirmed,0);
  assert.equal(target.safeToAutoApply,false);
  assert.equal(dependencyInspector({domain:'slot',key:'any_other'}).requiredConditionalCandidate,0);
  assert.equal(dependencyInspector({domain:'collection',hasCollection:true}).related.length,1);
  assert.ok(target.unknown.some(x=>x.includes('報酬')));
});

test('dry-run slot achievement diff uses confirmed read fields, never native writer',()=>{
  const plan=previewNativeAchievementIntent({record,mapped:false,sourceKey:'achievement_puzzlesInTheStars',
    complete:true,current:5,completed:'2026-11-11T00:00:00Z'});
  assert.deepEqual(plan.fields.map(x=>x.field),['IsComplete','CurrentValue','CompletedTime']);
  assert.equal(plan.dependencies.requiredConditionalCandidate,10);
  assert.equal(plan.exportAuthorized,false);
  assert.equal(plan.applyAuthorized,false);
  assert.ok(plan.blockers.includes('WRITER_NOT_ACCEPTED'));
  assert.equal(record.complete,false);
  assert.throws(()=>previewNativeAchievementIntent({record,complete:true,current:5,completed:null}),/timestamp/);
  assert.throws(()=>previewNativeAchievementIntent({record,complete:false,current:-1,completed:null}),/invalid proposed/);
});

test('unknown collected ItemId remains queryable and selectable with all blockers surfaced',()=>{
  const model=itemModel();
  assert.deepEqual(model.exceptions.unknownSourceIds,[2000000001]);
  const item=model.getItem(2000000001);
  assert.equal(item.status,'UNKNOWN_SOURCE_ID');
  assert.equal(item.historyRecorded,true);
  assert.equal(item.historyTimeKnown,false);
  const plan=previewNativeCollectionIntent({model,itemId:2000000001,operation:'remove'});
  assert.equal(plan.before.sourceKey,null);
  assert.equal(plan.beforeRecorded,undefined);
  assert.equal(plan.afterRecorded,false);
  assert.ok(plan.blockers.includes('UNKNOWN_ITEM_ID'));
  assert.ok(plan.blockers.includes('HISTORY_TICKS_NOT_EXPOSED_BY_READER'));
  assert.equal(plan.applyAuthorized,false);
  assert.equal(plan.exportAuthorized,false);
  assert.equal(model.getItem(2000000001).historyRecorded,true);
});

test('Collection 01 read model keeps dates UNKNOWN until reader provides them',()=>{
  const model=itemModel();
  assert.equal(model.schema,'HKIA.CollectionReadContract.1');
  assert.equal(model.getItem(2000000001).historyTicks,null);
  assert.equal(model.getItem(2000000001).historyTimeKnown,false);
  assert.equal(model.writerEnabled,false);
});

test('04 unaccepted writer port cannot apply or export even if called directly',()=>{
  assert.equal(WEB05_WRITER_PORT.approved,false);
  assert.equal(WEB05_WRITER_PORT.writerEnabled,false);
  assert.equal(WEB05_WRITER_PORT.prepareOnly,true);
  assert.throws(()=>WEB05_WRITER_PORT.apply({}),/NATIVE_WRITER_NOT_ACCEPTED/);
  assert.throws(()=>WEB05_WRITER_PORT.exportNative({}),/NATIVE_WRITER_NOT_ACCEPTED/);
});

test('all three collection exception classes are retained, with UNKNOWN vs unassigned distinction',()=>{
  const manifest=fixture('item-collection-crosswalk.json');
  const unresolved=manifest.items.find(x=>x.extraction==='unknown');
  const unassigned=manifest.items.find(x=>x.collection_key===null&&x.extraction!=='unknown');
  assert.ok(unresolved&&unassigned);
  const model=buildCollectionReadModel({itemManifest:manifest,definitions:fixture('collection-definitions.json'),parentManifest:fixture('item-parent-crosswalk.json'),
    collectedItemIds:[2000000001,unresolved.id,unassigned.id],saveVersion:'3.0.1'});
  assert.deepEqual(model.exceptions.unknownSourceIds,[2000000001]);
  assert.deepEqual(model.exceptions.historySourceUnresolvedIds,[unresolved.id]);
  assert.deepEqual(model.exceptions.historyExplicitUnassignedIds,[unassigned.id]);
  assert.equal(model.getItem(unresolved.id).status,'UNKNOWN_COLLECTION_MEMBERSHIP');
  assert.equal(model.getItem(unassigned.id).status,'UNASSIGNED_SOURCE_ITEM');
  for(const id of [2000000001,unresolved.id,unassigned.id])assert.equal(model.getItem(id).historyRecorded,true);
});

test('02 known definition missing from saved slot is UNKNOWN, not incomplete or auto-creatable',()=>{
  const missing={kind:'slot-missing',id:null,guid:'5cc234d0:46449dfc:b85b6a92:eb03d8ee',complete:null,current:null,completed:null};
  const status=achievementReadStatus(missing,true);
  assert.equal(status.status,'未保存（状態UNKNOWN）');
  assert.equal(status.timeStatus,'UNKNOWN（保存値なし）');
  assert.equal(status.nativeEditable,false);
  assert.equal(status.compatibility.createEditIntentAllowed,false);
  assert.equal(status.compatibility.applyAuthorized,false);
  assert.ok(status.compatibility.blockers.includes('NEW_RECORD_CREATION_UNVERIFIED'));
  assert.throws(()=>previewNativeAchievementIntent({record:missing,complete:true,current:1,completed:'2026-11-11T00:00:00Z'}),/persisted slot record/);
});
