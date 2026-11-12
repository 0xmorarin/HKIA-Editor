import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildAchievementSemanticCatalog} from '../scripts/research/achievement-semantic-contract.mjs';
import {inspectAchievementTimestamp100ns,inspectCompletedTimeRawPrecision,inspectCountedHistoryForScalarDraft,
  inspectAchievementGroupDraft,inspectAchievementEditStrictV3,inspectUnknownAchievementDraftV3,ACHIEVEMENT_WRITER_ENABLED}
  from '../scripts/research/achievement-group-edit-v3.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=x=>JSON.parse(readFileSync(resolve(root,'data',x),'utf8'));
const graph=buildAchievementSemanticCatalog(source('local-achievement-definitions.json'),source('slot-definitions.json'),source('achievement-definitions.json'));
const linkage=source('../contracts/03-linkage-delta.json');
const family=graph.families.find(f=>f.key==='collection_puzzle');
const parent=graph.lookup.byKey.get(family.key),target=graph.lookup.byKey.get('achievement_puzzlesInTheStars');
const now='2026-11-11T00:00:00.1234567Z',later='2026-11-12T12:13:14.7654321Z';
function fixture({completedOther=4,targetComplete=false}={}){
  const others=family.member_guids.filter(x=>x!==target.guid);
  const achievements=family.member_guids.map((g,i)=>{
    const def=graph.lookup.byGuid.get(g),completed=def.key===target.key?targetComplete:others.indexOf(g)<completedOther;
    return {guid:def.save_guid,id:i+1,complete:completed,current:completed?def.configured_threshold:def.key===target.key?1:0,
      completed:completed?now:null};
  });
  const n=achievements.filter(x=>x.complete).length;
  achievements.push({guid:parent.save_guid,id:1000,complete:n===family.required_count,current:n,completed:n===family.required_count?now:null});
  let idx=0;
  for(const group of graph.families){if(group.key===family.key)continue;if(idx++>=53)continue;
    const member=graph.lookup.byKey.get(group.key),completed=idx<=19;
    achievements.push({guid:member.save_guid,id:2000+idx,complete:completed,current:completed?group.required_count:0,
      completed:completed?now:null});
  }
  const counters=[{guid:parent.counter_save_guid,id:400,current:n,countedValues:null,countedGuids:0},
    {guid:target.counter_save_guid,id:401,current:targetComplete?target.configured_threshold:1,countedValues:null,countedGuids:0}];
  const sum=19+Number(n===family.required_count);
  const account={Achievements:{[graph.root.guid]:{IsComplete:false,CurrentValue:sum,CompletedTime:null}},
    Counters:{[graph.root.counter_guid]:{CurrentValue:sum}}};
  return [{version:'3.0.1',achievements,counters},account];
}
const groupReq=(edits,desiredGroupProgress,rest={})=>({groupKey:family.key,edits,desiredGroupProgress,...rest});
const childOn=()=>({key:target.key,complete:true,completedAt:later});
const childOff=()=>({key:target.key,complete:false,progress:1});
const groupEdit=(s,a,req,l=linkage)=>inspectAchievementGroupDraft(graph,s,a,req,l);

test('immutable source/03 contract and writer-off',()=>{
  assert.equal(graph.entries.length,820);assert.equal(graph.families.length,63);assert.equal(graph.account.length,31);
  assert.equal(linkage.newRequiredEdges.length,0);assert.equal(linkage.autoApply,false);assert.equal(ACHIEVEMENT_WRITER_ENABLED,false);
});
test('timestamp64 UTC retains 100 ns seven digits without JS Date rounding',()=>{
  const info=inspectAchievementTimestamp100ns(now);
  assert.equal(info.valid,true);assert.equal(info.nanoseconds,123456700);assert.equal(info.precision,'100ns');
  assert.equal(info.epochNanoseconds,(BigInt(info.seconds)*1000000000n+123456700n).toString());
  assert.equal(inspectAchievementTimestamp100ns(null).state,'UNSET_NIL');
});
test('timestamp rejects invalid dates, absent value, offset, sub-precision and negative epoch',()=>{
  for(const v of [undefined,0,'2026-11-11T00:00:00Z','2026-11-11T00:00:00.12345678Z',
    '2026-11-11T00:00:00.1234567+00:00','2026-02-30T00:00:00.0000000Z',
    '1969-12-31T23:59:59.9999999Z','2515-01-01T00:00:00.0000000Z'])
    assert.equal(inspectAchievementTimestamp100ns(v).valid,false,String(v));
});
test('raw timestamp provenance guards ns digits 8/9, raw mismatch and nil vs missing',()=>{
  const info=inspectAchievementTimestamp100ns(now),good={seconds:info.seconds,nanoseconds:info.nanoseconds};
  assert.equal(inspectCompletedTimeRawPrecision({completed:now,rawTimestamp:good}).safe,true);
  assert.equal(inspectCompletedTimeRawPrecision({completed:now,rawTimestamp:{...good,nanoseconds:info.nanoseconds+37}}).reason,'RAW_NANOSECOND_SUB_100NS_PRECISION_LOSS');
  assert.equal(inspectCompletedTimeRawPrecision({completed:now,rawTimestamp:{...good,seconds:info.seconds+1}}).reason,'RAW_AND_DISPLAY_TIMESTAMP_DIVERGE');
  assert.equal(inspectCompletedTimeRawPrecision({completed:now}).reason,'RAW_TIMESTAMP_PROVENANCE_MISSING');
  assert.equal(inspectCompletedTimeRawPrecision({completed:null,rawTimestamp:null}).safe,true);
  assert.equal(inspectCompletedTimeRawPrecision({completed:null}).reason,'NIL_RAW_TOKEN_NOT_VERIFIED');
});
test('counter history scalar classification distinguishes null, [] and dual representations',()=>{
  const base={current:1,countedValues:null,countedGuids:0};
  assert.equal(inspectCountedHistoryForScalarDraft(base).safe,true);
  for(const patch of [
    {countedGuids:1}, {countedValues:[]}, {countedValues:['old']},
    {countedValues:['old'],countedGuids:2}, {countedValues:undefined}, {countedGuids:[]},
    {countedGuids:-1}, {countedGuids:0.1}, {current:NaN}])
    assert.equal(inspectCountedHistoryForScalarDraft({...base,...patch}).safe,false,JSON.stringify(patch));
  assert.equal(inspectCountedHistoryForScalarDraft({...base,countedValues:['old'],countedGuids:2}).reason,
    'DUAL_COUNTED_REPRESENTATION_UNRESOLVED');
});
test('four-of-five to five: exact static 8+2 change only with explicit child and group times',()=>{
  const [s,a]=fixture(),before=JSON.stringify([s,a]);
  const r=groupEdit(s,a,groupReq([childOn()],5,{groupCompletedAt:later}));
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.deepEqual(r.linked_field_counts,{slot:8,account:2});
  assert.equal(r.dependency,'RELATED_UNVERIFIED');assert.equal(r.writer_enabled,false);assert.equal(r.export_enabled,false);
  assert.equal(r.root_before,19);assert.equal(r.root_after,20);assert.equal(r.changes.length,10);
  assert.equal(JSON.stringify([s,a]),before);
});
test('strict v3 single Puzzle bridge retains existing v2 conditional REQUIRED label only',()=>{
  const [s,a]=fixture();const r=inspectAchievementEditStrictV3(graph,s,a,
    {scope:'InGame',guid:target.save_guid,mode:'SET_COMPLETE',complete:true,timestamp:later},linkage);
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.equal(r.dependency,'PUZZLE_CONDITIONAL_REQUIRED_STATIC');
  assert.deepEqual(r.linked_field_counts,{slot:8,account:2});assert.equal(r.writer_enabled,false);
});
test('five-of-five to four reverses group, clears timestamp and decrements root',()=>{
  const [s,a]=fixture({targetComplete:true});const r=groupEdit(s,a,groupReq([childOff()],4));
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.equal(r.before,5);assert.equal(r.after,4);
  assert.deepEqual(r.linked_field_counts,{slot:8,account:2});assert.ok(r.changes.some(c=>c.source_key===parent.key&&c.field==='CompletedTime'&&c.after===null));
});
test('partial group progress 4 to 3 is two slot child/parent counters no Account change',()=>{
  const [s,a]=fixture();const sibling=family.member_guids.map(g=>graph.lookup.byGuid.get(g)).find(x=>x.key!==target.key&&s.achievements.find(r=>r.guid===x.save_guid)?.complete);
  s.counters.push({guid:sibling.counter_save_guid,id:402,current:sibling.configured_threshold,countedValues:null,countedGuids:0});
  const r=groupEdit(s,a,groupReq([{key:sibling.key,complete:false,progress:0}],3));
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.equal(r.before,4);assert.equal(r.after,3);
  assert.deepEqual(r.linked_field_counts,{slot:6,account:0});
});
test('Manual incomplete 1 to 2 leaves group 4/5 and root 19 unaffected',()=>{
  const [s,a]=fixture();const r=groupEdit(s,a,groupReq([{key:target.key,complete:false,progress:2}],4));
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.deepEqual(r.linked_field_counts,{slot:2,account:0});
  const wrapped=inspectAchievementEditStrictV3(graph,s,a,{scope:'InGame',guid:target.save_guid,mode:'SET_PROGRESS',progress:2},linkage);
  assert.equal(wrapped.status,'DRAFT_GROUP_BATCH');assert.equal(wrapped.changes.length,2);
});
test('completed child progress alone and threshold crossing incomplete are rejected',()=>{
  const [s,a]=fixture({targetComplete:true});
  assert.equal(groupEdit(s,a,groupReq([{key:target.key,complete:true,progress:7}],5)).status,'BLOCKED');
  const [s2,a2]=fixture();
  assert.equal(groupEdit(s2,a2,groupReq([{key:target.key,complete:false,progress:5}],4)).status,'BLOCKED');
});
test('Group progress cannot be independently asserted without exact member edits',()=>{
  const [s,a]=fixture();
  assert.equal(groupEdit(s,a,groupReq([],5)).status,'BLOCKED');
  assert.equal(groupEdit(s,a,groupReq([childOn()],4,{groupCompletedAt:later})).reasons[0],
    'EXPLICIT_MEMBERS_DO_NOT_MATCH_TARGET_GROUP_PROGRESS');
  assert.equal(groupEdit(s,a,groupReq([childOn()],5)).reasons[0],
    'EXPLICIT_PARENT_COMPLETION_TIMESTAMP_REQUIRED');
});
test('nonnative child, DLC/event/unique counter and absent linked records fail closed',()=>{
  const [s,a]=fixture();
  const derived=family.member_guids.map(g=>graph.lookup.byGuid.get(g)).find(e=>e.rule!=='MANUAL_INCREMENT');
  if(derived){assert.equal(groupEdit(s,a,groupReq([{key:derived.key,complete:false,progress:0}],4)).status,'BLOCKED');}
  const [s2,a2]=fixture();s2.counters=[];assert.equal(groupEdit(s2,a2,groupReq([childOn()],5,{groupCompletedAt:later})).status,'BLOCKED');
  const [s3,a3]=fixture();s3.counters[1].countedGuids=1;
  assert.equal(groupEdit(s3,a3,groupReq([childOn()],5,{groupCompletedAt:later})).reasons[0],
    'CHILD_COUNTED_GUIDS_RECOUNT_RISK');
});
test('saved child completed below source threshold and incomplete at threshold are impossible',()=>{
  const [s,a]=fixture();s.achievements[0].complete=true;s.achievements[0].current=0;s.achievements[0].completed=now;
  assert.equal(groupEdit(s,a,groupReq([childOn()],5,{groupCompletedAt:later})).status,'BLOCKED');
  const [s2,a2]=fixture();const i=s2.achievements.findIndex(x=>x.guid===target.save_guid);
  s2.achievements[i].current=target.configured_threshold;
  assert.equal(groupEdit(s2,a2,groupReq([childOn()],5,{groupCompletedAt:later})).reasons[0],
    'GROUP_MEMBER_INCOMPLETE_PROGRESS_REACHED_THRESHOLD');
});
test('misaligned group complete/timestamp/progress and parent counted array rejected',()=>{
  for(const modify of [
    ([s])=>s.achievements.find(x=>x.guid===parent.save_guid).current=3,
    ([s])=>s.achievements.find(x=>x.guid===parent.save_guid).complete=true,
    ([s])=>s.achievements.find(x=>x.guid===parent.save_guid).completed=now,
    ([s])=>s.counters[0].countedValues=[],
    ([s])=>s.counters[0].countedGuids=1,
  ]){
    const pair=fixture();modify(pair);assert.equal(groupEdit(...pair,groupReq([childOn()],5,{groupCompletedAt:later})).status,'BLOCKED');
  }
});
test('root mismatch, root complete, and root missing block cross-store editing',()=>{
  for(const modify of [
    ([s,a])=>a.Counters[graph.root.counter_guid].CurrentValue=20,
    ([s,a])=>a.Achievements[graph.root.guid].IsComplete=true,
    ([s,a])=>delete a.Counters[graph.root.counter_guid],
    ([s,a])=>a.Achievements[graph.root.guid.toUpperCase()]={IsComplete:false,CompletedTime:null,CurrentValue:19},
  ]){
    const pair=fixture();modify(pair);assert.equal(groupEdit(...pair,groupReq([childOn()],5,{groupCompletedAt:later})).status,'BLOCKED');
  }
});
test('duplicate ID/GUID, unknown child, forged groupCount and unsupported version rejected',()=>{
  for(const modify of [
    ([s])=>s.achievements.push({...s.achievements[0],id:999}),
    ([s])=>s.counters[1].id=s.counters[0].id,
    ([s])=>s.version='3.0.2',
  ]){
    const pair=fixture();modify(pair);assert.equal(groupEdit(...pair,groupReq([childOn()],5,{groupCompletedAt:later})).status,'BLOCKED');
  }
  const [s,a]=fixture();assert.equal(groupEdit(s,a,groupReq([{key:'NotReal',complete:true,completedAt:later}],5,{groupCompletedAt:later})).status,'BLOCKED');
});
test('invalid timestamp or gratuitous parent timestamp blocked',()=>{
  const [s,a]=fixture();
  assert.equal(groupEdit(s,a,groupReq([{key:target.key,complete:true,completedAt:'2026-02-31T00:00:00.0000000Z'}],5,{groupCompletedAt:later})).status,'BLOCKED');
  assert.equal(groupEdit(s,a,groupReq([{key:target.key,complete:false,progress:2}],4,{groupCompletedAt:later})).status,'BLOCKED');
});
test('noop leaves existing input unmodified and no serialized output',()=>{
  const [s,a]=fixture(),copy=JSON.stringify([s,a]);
  const r=groupEdit(s,a,groupReq([{key:target.key,complete:false,progress:1}],4));
  assert.equal(r.status,'NO_OP');assert.equal(r.changes.length,0);assert.equal(JSON.stringify([s,a]),copy);
});
test('03 unexpected new REQUIRED or autoApply must not bypass policy',()=>{
  const [s,a]=fixture(),req=groupReq([childOn()],5,{groupCompletedAt:later});
  for(const extra of [{newRequiredEdges:[{invented:true}]},{autoApply:true},{writerEnabled:true}])
    assert.equal(groupEdit(s,a,req,{...linkage,...extra}).status,'BLOCKED');
});
test('unknown saved GUID gets raw-only draft with no counter, parent, reward inference',()=>{
  const [s,a]=fixture();const id='abcdef01:23456789:abcdefab:01234567';
  s.achievements.push({id:9999,guid:id,complete:false,current:0,completed:null});
  const r=inspectUnknownAchievementDraftV3(graph,s,a,{scope:'InGame',guid:id,mode:'SET_PROGRESS',progress:1});
  assert.equal(r.status,'DRAFT_UNKNOWN_GUID');assert.equal(r.field_changes.length,1);
  assert.equal(r.field_changes[0].model,'AchievementModel');assert.equal(r.export_enabled,false);
  assert.ok(r.warnings.includes('NO_COUNTER_OR_GROUP_SYNTHESIS'));
});
test('unknown missing GUID does not become an incomplete record',()=>{
  const [s,a]=fixture();const id='abcdef01:23456789:abcdefab:01234567';
  const r=inspectUnknownAchievementDraftV3(graph,s,a,{scope:'InGame',guid:id,mode:'SET_PROGRESS',progress:1});
  assert.equal(r.status,'BLOCKED');
});
test('3 to 5 multi-child terminal completion is explicit, not guessed by target number',()=>{
  const [s,a]=fixture({completedOther:3});
  const other=family.member_guids.map(g=>graph.lookup.byGuid.get(g)).find(e=>e.key!==target.key&&
    !s.achievements.find(r=>r.guid===e.save_guid).complete);
  s.counters.push({id:402,guid:other.counter_save_guid,current:0,countedValues:null,countedGuids:0});
  const r=groupEdit(s,a,groupReq([childOn(),{key:other.key,complete:true,completedAt:later}],5,{groupCompletedAt:later}));
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.equal(r.before,3);assert.equal(r.after,5);
  assert.deepEqual(r.linked_field_counts,{slot:12,account:2});assert.equal(r.changes.length,14);
  const wrong=groupEdit(s,a,groupReq([childOn()],5,{groupCompletedAt:later}));
  assert.equal(wrong.reasons[0],'EXPLICIT_MEMBERS_DO_NOT_MATCH_TARGET_GROUP_PROGRESS');
});
test('5 to 3 multi-child reverse clears both leaf times and group time once',()=>{
  const [s,a]=fixture({targetComplete:true});const other=family.member_guids.map(g=>graph.lookup.byGuid.get(g)).find(e=>e.key!==target.key);
  s.counters.push({id:402,guid:other.counter_save_guid,current:other.configured_threshold,countedValues:null,countedGuids:0});
  const r=groupEdit(s,a,groupReq([childOff(),{key:other.key,complete:false,progress:0}],3));
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.equal(r.before,5);assert.equal(r.after,3);
  assert.deepEqual(r.linked_field_counts,{slot:12,account:2});
  assert.equal(r.changes.filter(c=>c.field==='CompletedTime'&&c.after===null).length,3);
});
test('non-Puzzle Manual group can produce RELATED draft but never inherit Puzzle static REQUIRED',()=>{
  const f=graph.families.find(g=>g.key==='collection_creationStation');assert.ok(f);
  const own=graph.lookup.byKey.get(f.key),all=f.member_guids.map(g=>graph.lookup.byGuid.get(g));
  const achievements=all.map((e,i)=>({id:100+i,guid:e.save_guid,complete:i<all.length-1,
    current:i<all.length-1?e.configured_threshold:0,completed:i<all.length-1?now:null}));
  achievements.push({id:1000,guid:own.save_guid,complete:false,current:all.length-1,completed:null});
  let idx=0;for(const group of graph.families){if(group.key===f.key)continue;if(idx++>=53)continue;
    const e=graph.lookup.byKey.get(group.key),complete=idx<=19;
    achievements.push({id:2000+idx,guid:e.save_guid,complete,current:complete?group.required_count:0,
      completed:complete?now:null});
  }
  const leaf=all.at(-1),slot={version:'3.0.1',achievements,counters:[
    {id:401,guid:own.counter_save_guid,current:all.length-1,countedGuids:0,countedValues:null},
    {id:402,guid:leaf.counter_save_guid,current:0,countedGuids:0,countedValues:null}]};
  const acc={Achievements:{[graph.root.guid]:{IsComplete:false,CurrentValue:19,CompletedTime:null}},
    Counters:{[graph.root.counter_guid]:{CurrentValue:19}}};
  const r=groupEdit(slot,acc,{groupKey:f.key,desiredGroupProgress:all.length,groupCompletedAt:later,
    edits:[{key:leaf.key,complete:true,completedAt:later}]});
  assert.equal(r.status,'DRAFT_GROUP_BATCH');assert.equal(r.dependency,'RELATED_UNVERIFIED');
  assert.deepEqual(r.linked_field_counts,{slot:8,account:2});
});
test('non-Puzzle DLC-gated group is not treated as ordinary manual group',()=>{
  const f=graph.families.find(g=>g.key==='collection_challengeCourses_CTDLC');assert.ok(f.required_dlc_nonzero);
  const [s,a]=fixture();const r=groupEdit(s,a,{groupKey:f.key,desiredGroupProgress:1,
    edits:[{key:f.member_keys[0],complete:true,completedAt:later}]});
  assert.equal(r.status,'BLOCKED');assert.equal(r.reasons[0],'GROUP_DLC_OR_EVENT_GATE_UNVERIFIED');
});
test('bad persisted unrelated root group state prevents unsupported root aggregate draft',()=>{
  const [s,a]=fixture();const unrelated=s.achievements.find(r=>r.id===2001);
  unrelated.current=0;                                                             
  const r=groupEdit(s,a,groupReq([childOn()],5,{groupCompletedAt:later}));
  assert.equal(r.status,'BLOCKED');assert.ok(r.reasons[0].startsWith('ROOT_MEMBER_'));
});
test('no linkage contract, partial contract and wrong baseline are all rejected',()=>{
  const [s,a]=fixture();const req=groupReq([childOn()],5,{groupCompletedAt:later});
  for(const l of [{},{...linkage,source:{sha256:'0'.repeat(64)}},{...linkage,newRequiredEdges:undefined}])
    assert.equal(groupEdit(s,a,req,l).status,'BLOCKED');
});
test('Account Meta root nonempty or non-nil counted history cannot be silently reconciled',()=>{
  for(const patch of [{CountedGuids:['raw']},{CountedValues:[]},{CountedGuids:'not-list'},
    {CountedValues:['legacy']},{CountedGuids:null}]){
    const [s,a]=fixture();Object.assign(a.Counters[graph.root.counter_guid],patch);
    const r=groupEdit(s,a,groupReq([childOn()],5,{groupCompletedAt:later}));
    assert.equal(r.status,'BLOCKED');
  }
});
test('completion draft identifies original Timestamp token provenance gate on all date changes',()=>{
  const [s,a]=fixture();const r=groupEdit(s,a,groupReq([childOn()],5,{groupCompletedAt:later}));
  const dates=r.changes.filter(c=>c.field==='CompletedTime');assert.equal(dates.length,2);
  assert.ok(dates.every(c=>c.raw_timestamp_provenance_required===true&&c.apply_authorized===false));
  assert.ok(r.warnings.includes('RAW_TIMESTAMP_PRECISION_REQUIRED'));
});
test('machine contract stays research-only and matches source-pinned 03 delta',()=>{
  const c=source('../docs/02-achievement/ACHIEVEMENT_EDIT_DELTA_v3.json');
  assert.equal(c.schema,'HKIA.02.AchievementEditDelta.3');assert.equal(c.source.entries,133);
  assert.equal(c.writerEnabled,false);assert.equal(c.saveExportEnabled,false);
  assert.equal(c.linkage.contract,linkage.contract);assert.equal(c.linkage.newRequiredEdges,0);
  assert.ok(c.api.functions.every(f=>f.applyAuthorized===false));
});
