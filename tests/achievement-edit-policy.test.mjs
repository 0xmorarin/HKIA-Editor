import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildAchievementSemanticCatalog} from '../scripts/research/achievement-semantic-contract.mjs';
import {buildAchievementEditFieldContracts,describeSavedAchievement,inspectAchievementEditRequest} from '../scripts/research/achievement-edit-policy.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=name=>JSON.parse(readFileSync(resolve(root,'data',name),'utf8'));
const catalog=buildAchievementSemanticCatalog(input('local-achievement-definitions.json'),input('slot-definitions.json'),input('achievement-definitions.json'));
const contracts=buildAchievementEditFieldContracts(catalog);
const timestamp='2026-11-11T00:00:00.0000000Z',time2='2026-11-12T00:00:00.0000000Z';
const unknown='abcdef01:23456789:abcdefab:01234567';
const unknownAccountGuid='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const puzzle=catalog.lookup.byKey.get('achievement_puzzlesInTheStars');
const parent=catalog.lookup.byKey.get('collection_puzzle');
const family=catalog.families.find(f=>f.key===parent.key);
assert.ok(puzzle&&parent&&family);
function scenario({completedOther=4,targetComplete=false,otherCompletedGroups=19}={}){
  const achievements=family.member_guids.map((g,i)=>{
    const e=catalog.lookup.byGuid.get(g);
    const isTarget=e.key===puzzle.key;
    const others=family.member_guids.filter(x=>x!==puzzle.guid);
    const complete=isTarget?targetComplete:others.indexOf(g)<completedOther;
    return {id:i+1,guid:e.save_guid,complete,current:complete?e.configured_threshold:isTarget?1:0,completed:complete?timestamp:null};
  });
  const groupCount=achievements.filter(a=>a.complete).length,groupComplete=groupCount===family.required_count;
  achievements.push({id:1000,guid:parent.save_guid,complete:groupComplete,current:groupCount,completed:groupComplete?timestamp:null});
  let groupIndex=0;
  for(const f of catalog.families){if(f.key===family.key)continue;
    const e=catalog.lookup.byGuid.get(f.guid);
    if(groupIndex++>=53)continue; // 54 saved groups in prior private samples; 9 truly absent
    const complete=groupIndex<=otherCompletedGroups;
    achievements.push({id:2000+groupIndex,guid:e.save_guid,complete,current:complete?f.required_count:0,completed:complete?timestamp:null});
  }
  const counters=[
    {id:400,guid:parent.counter_save_guid,current:groupCount,countedValues:null,countedGuids:0},
    {id:401,guid:puzzle.counter_save_guid,current:targetComplete?puzzle.configured_threshold:1,countedValues:null,countedGuids:0}
  ];
  const count=otherCompletedGroups+(groupComplete?1:0);
  const account={Achievements:{[catalog.root.guid]:{IsComplete:false,CurrentValue:count,CompletedTime:null}},Counters:{[catalog.root.counter_guid]:{CurrentValue:count}}};
  return [{version:'3.0.1',achievements,counters},account];
}
const request=(s,a,extras={})=>inspectAchievementEditRequest(catalog,s,a,{scope:'InGame',guid:puzzle.save_guid,mode:'SET_COMPLETE',complete:true,timestamp,...extras});
test('one explicit contract for every 820 local and 31 account definition',()=>{
  assert.deepEqual(contracts.counts,{ingame:820,account:31});
  assert.equal(new Set(contracts.ingame.map(x=>x.save_guid)).size,820);
  assert.equal(new Set(contracts.account.map(x=>x.source_guid)).size,31);
  assert.ok(contracts.ingame.every(x=>x.storage==='Saves/save_0.save'&&x.fields.IsComplete==='boolean'));
  assert.ok(contracts.account.every(x=>x.storage==='SettingsAccount/settings.json'&&x.native_writer_enabled===false));
});
test('source Group uses member count rather than serialized 1 threshold',()=>{
  const e=contracts.ingame.find(x=>x.key==='collection_puzzle');
  assert.equal(e.rule,'GROUP_REFERENCES');assert.equal(e.effective_threshold,5);assert.equal(e.proposed_editability,'READ_ONLY_UNKNOWN_REQUIREMENTS');
});
test('source Manual is conditional dry run, other derived families not auto editable',()=>{
  assert.equal(contracts.ingame.find(x=>x.key===puzzle.key).proposed_editability,'CONDITIONAL_DRY_RUN_ONLY');
  assert.ok(contracts.ingame.some(x=>x.rule==='DERIVED_TRACKER'&&x.proposed_editability==='READ_ONLY_UNKNOWN_REQUIREMENTS'));
  assert.ok(contracts.ingame.every(x=>x.reward_claim_state==='UNKNOWN'));
});
test('read-only view distinguishes saved and absent known definitions',()=>{
  const [s,a]=scenario();
  const known=describeSavedAchievement(catalog,s,a,{guid:puzzle.save_guid});
  assert.equal(known.record_status,'KNOWN_SOURCE_SAVED');assert.equal(known.counter_status,'SAVED');
  const missing=describeSavedAchievement(catalog,s,a,{guid:catalog.entries.find(x=>x.key!==puzzle.key&&x.key!=='collection_puzzle'&&!s.achievements.some(v=>v.guid===x.save_guid)).save_guid});
  assert.equal(missing.record_status,'KNOWN_DEFINITION_NOT_PERSISTED');assert.equal(missing.can_prepare_draft,false);
});
test('unknown saved GUID is displayed raw with no inferred source counter',()=>{
  const [s,a]=scenario();s.achievements.push({id:9009,guid:unknown,complete:false,current:0,completed:null});
  const v=describeSavedAchievement(catalog,s,a,{guid:unknown});
  assert.equal(v.record_status,'UNKNOWN_SOURCE_SAVED');assert.equal(v.source_key,null);assert.equal(v.counter_status,'UNKNOWN_SOURCE_COUNTER');
  const p=inspectAchievementEditRequest(catalog,s,a,{guid:unknown,mode:'SET_PROGRESS',progress:1});
  assert.equal(p.status,'DRAFT_UNKNOWN_GUID');assert.equal(p.field_changes.length,1);assert.equal(p.export_enabled,false);
});
test('unknown absent GUID is NOT interpreted as incomplete',()=>{
  const [s,a]=scenario();const p=inspectAchievementEditRequest(catalog,s,a,{guid:unknown,mode:'SET_PROGRESS',progress:1});
  assert.equal(p.status,'BLOCKED');assert.ok(p.reasons.includes('MISSING_SAVED_RECORD_NOT_FALSE'));
});
test('strict Puzzle positive candidate retains 03 exact static required scope, 8+2 field list',()=>{
  const [s,a]=scenario();const saved=JSON.stringify([s,a]);const p=request(s,a);
  assert.equal(p.status,'DRAFT_FAMILY_TRANSITION');assert.equal(p.linkage_classification,'PUZZLE_CONDITIONAL_REQUIRED_STATIC');
  assert.deepEqual(p.linked_field_counts,{slot:8,account:2});assert.equal(p.field_changes.length,10);
  assert.equal(p.writer_enabled,false);assert.equal(JSON.stringify([s,a]),saved);
});
test('reverse completion returns 8+2 dry-run fields but is not proven REQUIRED',()=>{
  const [s,a]=scenario({targetComplete:true});const p=request(s,a,{complete:false,progress:1});
  assert.equal(p.status,'DRAFT_FAMILY_TRANSITION');assert.equal(p.linkage_classification,'RELATED_UNVERIFIED');
  assert.deepEqual(p.linked_field_counts,{slot:8,account:2});
  assert.ok(p.field_changes.some(x=>x.field==='CompletedTime'&&x.after===null));
});
test('manual partial progress 1→2 changes exactly achievement+counter and not parents',()=>{
  const [s,a]=scenario();const p=inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_PROGRESS',progress:2});
  assert.equal(p.status,'DRAFT_MANUAL_PROGRESS');assert.deepEqual(p.field_changes.map(x=>x.model),['AchievementModel','GameCounterModel']);
  assert.ok(p.field_changes.every(x=>x.field==='CurrentValue'&&x.file==='Saves/save_0.save'));
});
test('manual progress does not cross threshold without changing state',()=>{
  const [s,a]=scenario();const p=inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_PROGRESS',progress:5});
  assert.equal(p.status,'BLOCKED');assert.ok(p.reasons.includes('THRESHOLD_CROSSING_REQUIRES_COMPLETION_TRANSITION'));
});
test('manual progress fails closed on missing group member and divergent Account root',()=>{
  for(const modify of [
    ([s])=>s.achievements.splice(0,1),
    ([s,a])=>{a.Counters[catalog.root.counter_guid].CurrentValue++;},
    ([s])=>{s.counters[0].current=0;},
    ([s,a])=>{delete a.Achievements[catalog.root.guid];}
  ]){
    const pair=scenario();modify(pair);const [s,a]=pair;
    assert.equal(inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_PROGRESS',progress:2}).status,'BLOCKED');
  }
});
test('unknown, missing and history-carrying counters never get synthesized',()=>{
  for(const change of [
    s=>{s.counters=[];},
    s=>{s.counters[1].countedGuids=1;},
    s=>{s.counters[1].countedValues=['legacy'];}
  ]){
    const [s,a]=scenario();change(s);const p=inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_PROGRESS',progress:2});
    assert.equal(p.status,'DRAFT_UNVERIFIED');assert.equal(p.field_changes.length,1);
  }
});
test('unknown in-game GUID never implies a companion counter or parent write',()=>{
  const [s,a]=scenario();s.achievements.push({id:9009,guid:unknown,complete:false,current:2,completed:null});
  const p=inspectAchievementEditRequest(catalog,s,a,{guid:unknown,mode:'SET_COMPLETE',complete:true,timestamp});
  assert.equal(p.status,'DRAFT_UNKNOWN_GUID');assert.ok(p.field_changes.every(x=>x.model==='AchievementModel'));
});
test('timestamp-only draft requires already complete state and calendar-valid UTC',()=>{
  const [s,a]=scenario({targetComplete:true});let p=inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_TIMESTAMP',timestamp:time2});
  assert.equal(p.status,'DRAFT_UNVERIFIED');assert.equal(p.field_changes.length,1);
  const [s2,a2]=scenario();p=inspectAchievementEditRequest(catalog,s2,a2,{guid:puzzle.save_guid,mode:'SET_TIMESTAMP',timestamp:time2});
  assert.equal(p.status,'BLOCKED');
});
test('invalid calendar dates and uncompletion without explicit progress are rejected',()=>{
  const [s,a]=scenario();
  for(const t of ['2026-02-30T00:00:00.0000000Z','2026-11-11T00:00:00Z','2026-11-11T00:00:00.0000000+00:00'])
    assert.equal(request(s,a,{timestamp:t}).status,'BLOCKED');
  const [s2,a2]=scenario({targetComplete:true});assert.equal(request(s2,a2,{complete:false,progress:undefined}).status,'BLOCKED');
});
test('Account edit is separate; source counter/store never guessed or written here',()=>{
  const [s,a]=scenario();const accountGuid=catalog.root.guid;
  const p=inspectAchievementEditRequest(catalog,s,a,{scope:'Account',guid:accountGuid,mode:'SET_PROGRESS',progress:20});
  assert.equal(p.status,'DRAFT_UNVERIFIED');assert.equal(p.field_changes.length,1);
  assert.equal(p.field_changes[0].file,'SettingsAccount/settings.json');assert.equal(p.export_enabled,false);
});
test('unknown Account GUID existing record supports schema-only draft; absent stays absent',()=>{
  const [s,a]=scenario();a.Achievements[unknownAccountGuid]={IsComplete:false,CurrentValue:0.1,CompletedTime:null};
  let p=inspectAchievementEditRequest(catalog,s,a,{scope:'Account',guid:unknownAccountGuid,mode:'SET_PROGRESS',progress:0.2});
  assert.equal(p.status,'DRAFT_ACCOUNT_ONLY');assert.equal(p.field_changes.length,1);
  delete a.Achievements[unknownAccountGuid];p=inspectAchievementEditRequest(catalog,s,a,{scope:'Account',guid:unknownAccountGuid,mode:'SET_PROGRESS',progress:0.2});
  assert.equal(p.status,'BLOCKED');
});
test('Account current numeric and timestamps follow Account JSON type (not forced float32/7-digit)',()=>{
  const [s,a]=scenario();a.Achievements[unknownAccountGuid]={IsComplete:true,CurrentValue:0.1,CompletedTime:'2026-11-11T00:00:00.1Z'};
  const p=inspectAchievementEditRequest(catalog,s,a,{scope:'Account',guid:unknownAccountGuid,mode:'SET_TIMESTAMP',timestamp:'2026-11-12T00:00:00.2Z'});
  assert.equal(p.status,'DRAFT_ACCOUNT_ONLY');
});
test('collision, bad document id, duplicate id and wrong slot version block',()=>{
  const [s,a]=scenario();s.achievements.push({...s.achievements[0],id:999});
  assert.equal(request(s,a).status,'BLOCKED');
  const [s2,a2]=scenario();s2.achievements[0].id=s2.achievements[1].id;
  assert.equal(request(s2,a2).status,'BLOCKED');
  const [s3,a3]=scenario();s3.version='3.0.2';assert.equal(request(s3,a3).status,'BLOCKED');
  const [s4,a4]=scenario();a4.Achievements[catalog.root.guid.toUpperCase()]={IsComplete:false,CurrentValue:19,CompletedTime:null};
  assert.equal(inspectAchievementEditRequest(catalog,s4,a4,{scope:'Account',guid:catalog.root.guid,mode:'SET_PROGRESS',progress:20}).status,'BLOCKED');
});
test('no-op and unknown request keys do not change source',()=>{
  const [s,a]=scenario();const before=JSON.stringify([s,a]);
  let p=inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_PROGRESS',progress:1});
  assert.equal(p.status,'NO_OP');
  p=inspectAchievementEditRequest(catalog,s,a,{guid:puzzle.save_guid,mode:'SET_PROGRESS',progress:2,extra:'bad'});
  assert.equal(p.status,'BLOCKED');assert.equal(JSON.stringify([s,a]),before);
});
test('non-Puzzle Manual can draft progress but 03 does not promote to REQUIRED',()=>{
  const [s,a]=scenario();
  const available=new Set(s.achievements.map(x=>x.guid));
  const leaf=catalog.entries.find(e=>e.rule==='MANUAL_INCREMENT'&&e.configured_threshold>2&&e.parent_key!==parent.key&&
    !e.required_dlc_nonzero&&!e.event_year&&!e.event_path_id&&e.counter_enabled&&e.own_counter_state!=='UNIQUE_TRACKING'&&
    available.has(catalog.lookup.byKey.get(e.parent_key).save_guid));
  assert.ok(leaf);
  const f=catalog.families.find(x=>x.key===leaf.parent_key),parentOfLeaf=catalog.lookup.byKey.get(f.key);
  const record=s.achievements.find(x=>x.guid===parentOfLeaf.save_guid);
  if(record.complete){a.Achievements[catalog.root.guid].CurrentValue--;a.Counters[catalog.root.counter_guid].CurrentValue--;}
  record.complete=false;record.current=0;record.completed=null;
  s.achievements.push(...f.member_guids.map((g,i)=>({id:10000+i,guid:catalog.lookup.byGuid.get(g).save_guid,complete:false,current:0,completed:null})));
  s.counters.push({id:9000,guid:leaf.counter_save_guid,current:0,countedValues:null,countedGuids:0},
    {id:9001,guid:parentOfLeaf.counter_save_guid,current:0,countedValues:null,countedGuids:0});
  const out=inspectAchievementEditRequest(catalog,s,a,{guid:leaf.save_guid,mode:'SET_PROGRESS',progress:1});
  assert.equal(out.status,'DRAFT_MANUAL_PROGRESS');assert.equal(out.linkage_classification,'RELATED_UNVERIFIED');
  assert.equal(out.field_changes.length,2);assert.equal(out.export_enabled,false);
});
test('derived/unique conditions only produce draft with unresolved linkage',()=>{
  const [s,a]=scenario();
  const entry=catalog.entries.find(e=>e.rule==='DERIVED_TRACKER');assert.ok(entry);
  s.achievements.push({id:30000,guid:entry.save_guid,complete:false,current:0,completed:null});
  const out=inspectAchievementEditRequest(catalog,s,a,{guid:entry.save_guid,mode:'SET_PROGRESS',progress:1});
  assert.equal(out.status,'DRAFT_UNVERIFIED');assert.equal(out.linkage_classification,'RELATED_UNVERIFIED');
  assert.equal(out.field_changes.length,1);assert.equal(out.export_enabled,false);
});
