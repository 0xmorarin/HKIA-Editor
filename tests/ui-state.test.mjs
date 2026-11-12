import test from 'node:test';
import assert from 'node:assert/strict';
import {accountChangeSet,previewAccountChange,batchAccountPlan,filterSortAchievements,collectionHistoryStatus,SLOT_WRITER_CAPABILITY} from '../src/ui-state.js';
import {changeAchievement} from '../src/account.js';
const a='a'.repeat(32),b='b'.repeat(32);
function account(){return {Achievements:{[a]:{IsComplete:false,CurrentValue:1,CompletedTime:null,Unrelated:'keep'},[b]:{IsComplete:true,CurrentValue:2,CompletedTime:'2026-11-11T00:00:00Z'}},Counters:{},Other:'keep'};}
test('account previews are immutable, validate completion time, and never propose linked native edits',()=>{
  const data=account();const original=JSON.stringify(data);
  const plan=previewAccountChange(data,a,{IsComplete:true,CompletedTime:'2026-11-11T00:00:00Z'});
  assert.deepEqual(plan.fields.map(x=>x.field),['IsComplete','CompletedTime']);
  assert.deepEqual(plan.linkedChanges,[]);
  assert.equal(JSON.stringify(data),original);
  assert.throws(()=>previewAccountChange(data,a,{IsComplete:true,CompletedTime:null}),/達成状態/);
  assert.throws(()=>previewAccountChange(data,a,{IsComplete:true,CompletedTime:'2026-02-31T00:00:00Z'}),/実在するUTC/);
});
test('account diff excludes unknown fields and normalizes reversal to no-op',()=>{
  const original=account(),updated=structuredClone(original);
  changeAchievement(updated,a,{IsComplete:true,CurrentValue:5,CompletedTime:'2026-11-11T00:00:00Z'});
  assert.equal(accountChangeSet(original,updated).length,1);
  assert.deepEqual(accountChangeSet(original,updated)[0].fields.map(x=>x.field),['IsComplete','CurrentValue','CompletedTime']);
  changeAchievement(updated,a,{IsComplete:false,CurrentValue:1,CompletedTime:null});
  assert.deepEqual(accountChangeSet(original,updated),[]);
});
test('bulk applies only matching Account records, preserves unrelated counters and already-complete timestamps',()=>{
  const data=account();const before=JSON.stringify(data),ts='2026-11-11T01:02:03Z';
  const plan=batchAccountPlan(data,[a,b],true,ts);
  assert.equal(plan.count,1);assert.equal(plan.edits[0].guid,a);
  assert.equal(JSON.stringify(data),before);
  const cloned=structuredClone(data);for(const e of plan.edits)changeAchievement(cloned,e.guid,e.after);
  assert.equal(cloned.Achievements[b].CompletedTime,'2026-11-11T00:00:00Z');
  assert.equal(cloned.Achievements[a].CompletedTime,ts);
  assert.equal(cloned.Other,'keep');
  assert.throws(()=>batchAccountPlan(data,[a],true,null),/達成状態/);
  assert.throws(()=>batchAccountPlan(data,[a,a],true,ts),/重複/);
});
test('sorting and filtering preserve stable source order and never coerce unknown to false',()=>{
  const items=[{guid:'a',complete:true,current:3},{guid:'b',complete:false,current:4},{guid:'c',complete:null,current:4}];
  assert.deepEqual(filterSortAchievements(items,{filter:'incomplete'}).map(x=>x.guid),['b']);
  assert.deepEqual(filterSortAchievements(items,{sort:'progress-desc'}).map(x=>x.guid),['b','c','a']);
  assert.deepEqual(filterSortAchievements(items,{query:'B',searchText:x=>x.guid}).map(x=>x.guid),['b']);
});
test('collection history before loading is UNKNOWN, not missing; native writer is fail-closed',()=>{
  assert.equal(collectionHistoryStatus(false,10,0),'unknown');
  assert.equal(collectionHistoryStatus(true,10,0),'no-record');
  assert.equal(collectionHistoryStatus(true,0,0),'undefined');
  assert.equal(collectionHistoryStatus(true,10,4),'partial');
  assert.equal(collectionHistoryStatus(true,10,10),'all-recorded');
  assert.equal(SLOT_WRITER_CAPABILITY.enabled,false);
});
