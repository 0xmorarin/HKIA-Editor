import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {buildAchievementSemanticCatalog,inspectManualAchievementTransition} from '../scripts/research/achievement-semantic-contract.mjs';
const dir=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const json=x=>JSON.parse(readFileSync(resolve(dir,'data',x),'utf8'));
const local=json('local-achievement-definitions.json'),slot=json('slot-definitions.json'),account=json('achievement-definitions.json');
const cat=buildAchievementSemanticCatalog(local,slot,account);
const TIME='2026-11-11T00:00:00.0000000Z';
const puzzle=cat.families.find(x=>x.key==='collection_puzzle');
const target=cat.lookup.byKey.get('achievement_puzzlesInTheStars');
assert.ok(puzzle&&target);
function makeScenario({completedOther=4,targetComplete=false,includeRoot=true}={}){
  const entries=puzzle.member_guids.map(x=>cat.lookup.byGuid.get(x));
  const achievements=entries.map((e,i)=>{
    const isTarget=e.key===target.key;
    const complete=isTarget?targetComplete:entries.filter(t=>t.key!==target.key).indexOf(e)<completedOther;
    return {id:i+1,guid:e.save_guid,complete,current:complete?e.configured_threshold:isTarget?1:0,completed:complete?TIME:null};
  });
  const parent=cat.lookup.byGuid.get(puzzle.guid),completedCount=achievements.filter(x=>x.complete).length;
  achievements.push({id:800,guid:parent.save_guid,complete:completedCount===puzzle.required_count,current:completedCount,completed:completedCount===puzzle.required_count?TIME:null});
  const counters=[{id:400,guid:parent.counter_save_guid,current:completedCount,countedValues:null,countedGuids:0},
    {id:401,guid:target.counter_save_guid,current:targetComplete?target.configured_threshold:1,countedValues:null,countedGuids:0}];
  const accountState={Achievements:{},Counters:{}};
  if(includeRoot){accountState.Achievements[cat.root.guid]={IsComplete:false,CurrentValue:completedCount===puzzle.required_count?1:0,CompletedTime:null};
    accountState.Counters[cat.root.counter_guid]={CurrentValue:completedCount===puzzle.required_count?1:0};}
  return [{version:'3.0.1',achievements,counters},accountState];
}
function plan(opts,scenario=makeScenario()){return inspectManualAchievementTransition(cat,...scenario,{targetKey:target.key,...opts});}

test('820 source definitions, 63 groups, 757 leaves, 851 counters, 31 account source refs',()=>{
  assert.equal(cat.counts.local,820);assert.equal(cat.counts.groups,63);assert.equal(cat.counts.leaves,757);assert.equal(cat.counts.source_counters,851);
  assert.equal(cat.counts.account_meta_counters,16);assert.equal(cat.counts.account_ingame_counters,15);
  assert.equal(new Set(cat.families.flatMap(x=>x.member_guids)).size,757);
  assert.ok(cat.families.every(x=>x.required_count===x.member_guids.length));
  assert.equal(cat.entries.filter(x=>x.rule==='GROUP_REFERENCES').length,63);
  assert.equal(cat.entries.filter(x=>x.rule==='MANUAL_INCREMENT').length,258);
  assert.equal(cat.entries.filter(x=>x.rule==='DERIVED_TRACKER').length,499);
  assert.equal(cat.entries.filter(x=>x.required_dlc_nonzero).length,24);
  assert.equal(cat.entries.filter(x=>x.reward_defined).length,264);
  assert.ok(cat.account.every(x=>x.state_store==='SettingsAccount/settings.json'));
  assert.equal(cat.native_writer_enabled,false);
});
test('Puzzle Goal candidate 8 slot + 2 Account fields; source untouched',()=>{
  const snapshot=makeScenario(),serialized=JSON.stringify(snapshot);
  const result=plan({toComplete:true,completedAt:TIME},snapshot);
  assert.equal(result.status,'RESEARCH_CANDIDATE_ONLY');
  assert.equal(result.group_before,4);assert.equal(result.group_after,5);
  assert.equal(result.candidate_fields.length,10);
  assert.equal(result.candidate_fields.filter(x=>x.file==='Saves/save_0.save').length,8);
  assert.equal(result.candidate_fields.filter(x=>x.file==='SettingsAccount/settings.json').length,2);
  assert.equal(result.root_before,0);assert.equal(result.root_after,1);
  assert.equal(result.writer_enabled,false);assert.equal(result.export_enabled,false);
  assert.equal(JSON.stringify(snapshot),serialized);
});
test('nonterminal group change does not modify Meta root',()=>{
  const result=plan({toComplete:true,completedAt:TIME},makeScenario({completedOther:3}));
  assert.equal(result.status,'RESEARCH_CANDIDATE_ONLY');
  assert.equal(result.group_before,3);assert.equal(result.group_after,4);
  assert.equal(result.candidate_fields.length,6);
  assert.equal(result.candidate_fields.filter(x=>x.file==='SettingsAccount/settings.json').length,0);
  assert.equal(result.root_before,result.root_after);
});
test('reversal is explicitly bounded and requires an uncomplete progress',()=>{
  const scenario=makeScenario({targetComplete:true});
  const result=plan({toComplete:false,uncompleteProgress:1},scenario);
  assert.equal(result.status,'RESEARCH_CANDIDATE_ONLY');
  assert.equal(result.candidate_fields.length,10);assert.equal(result.group_before,5);assert.equal(result.group_after,4);
  assert.equal(result.root_before,1);assert.equal(result.root_after,0);
  assert.ok(result.candidate_fields.some(x=>x.model==='AchievementModel'&&x.field==='CompletedTime'&&x.after===null));
});
test('no-op does not propose any field change',()=>{
  const result=plan({toComplete:false,uncompleteProgress:0});
  assert.equal(result.status,'NO_OP');assert.deepEqual(result.candidate_fields,[]);
});
test('invalid timestamps, missing progress and threshold overflow are blocked',()=>{
  for(const time of ['2026-02-30T00:00:00.0000000Z','2026-11-11T00:00:00Z','2026-11-11T30:00:00.0000000Z','2026-11-11T00:00:00.1234567+00:00']){
    assert.equal(plan({toComplete:true,completedAt:time}).status,'BLOCKED');
  }
  assert.equal(plan({toComplete:false}).status,'BLOCKED');
  assert.equal(plan({toComplete:false,uncompleteProgress:5},makeScenario({targetComplete:true})).status,'BLOCKED');
});
test('missing target, group child, group parent, and Account root are blocked',()=>{
  for(const cut of ['target','child','parent','account']){
    const [s,a]=makeScenario();
    if(cut==='target')s.counters=[];
    if(cut==='child')s.achievements=s.achievements.filter(x=>x.guid!==puzzle.member_guids.map(g=>cat.lookup.byGuid.get(g).save_guid).find(g=>g!==target.save_guid));
    if(cut==='parent')s.achievements=s.achievements.filter(x=>x.guid!==puzzle.save_guid);
    if(cut==='account')delete a.Counters[cat.root.counter_guid];
    assert.equal(plan({toComplete:true,completedAt:TIME},[s,a]).status,'BLOCKED',cut);
  }
});
test('mismatched counters/parent/root and legacy or unique sets are blocked',()=>{
  for(const fault of ['childValue','parentValue','rootValue','legacy','unique','parentUnique']){
    const [s,a]=makeScenario();
    if(fault==='childValue')s.counters[1].current=2;
    if(fault==='parentValue')s.counters[0].current=3;
    if(fault==='rootValue')a.Achievements[cat.root.guid].CurrentValue=2;
    if(fault==='legacy')s.counters[1].countedValues=['unknown'];
    if(fault==='unique')s.counters[1].countedGuids=1;
    if(fault==='parentUnique')s.counters[0].countedGuids=1;
    assert.equal(plan({toComplete:true,completedAt:TIME},[s,a]).status,'BLOCKED',fault);
  }
});
test('derived counter, group and unknown source keys cannot enter manual candidate',()=>{
  const scenario=makeScenario();
  for(const entry of [cat.entries.find(x=>x.rule==='DERIVED_TRACKER'),cat.lookup.byKey.get('collection_puzzle')]){
    assert.equal(inspectManualAchievementTransition(cat,...scenario,{targetKey:entry.key,toComplete:true,completedAt:TIME}).status,'BLOCKED');
  }
  assert.equal(inspectManualAchievementTransition(cat,...scenario,{targetKey:'missing',toComplete:true,completedAt:TIME}).status,'BLOCKED');
});
test('catalog rejects source count, source link and GUID tampering',()=>{
  const cases=[()=>{const x=structuredClone(slot);x.achievement_references.pop();return [local,x,account]},
    ()=>{const x=structuredClone(slot);x.achievement_references[0].group_counter_guid='ffffffffffffffffffffffffffffffff';return [local,x,account]},
    ()=>{const x=structuredClone(local);x.records[0].counter_save_guid='ffffffff:ffffffff:ffffffff:ffffffff';return [x,slot,account]},
    ()=>{const x=structuredClone(account);x[0].counter_guid='ffffffffffffffffffffffffffffffff';return [local,slot,x]},
    ()=>{const x=structuredClone(slot);x.counters[0].save_guid='00000000:00000000:00000000:00000000';return [local,x,account]}];
  for(const setup of cases)assert.throws(()=>buildAchievementSemanticCatalog(...setup()),/CONTRACT/);
});

test('unknown slot version and ambiguous leaf completion thresholds are blocked',()=>{
  const [s,a]=makeScenario();s.version='3.0.2';assert.equal(plan({toComplete:true,completedAt:TIME},[s,a]).status,'BLOCKED');
  s.version='3.0.1';s.achievements.find(x=>x.guid===target.save_guid).current=target.configured_threshold;s.counters[1].current=target.configured_threshold;
  assert.equal(plan({toComplete:true,completedAt:TIME},[s,a]).status,'BLOCKED');
});

test('duplicate saved GUID cannot silently collapse into a coherent map',()=>{
  const [s,a]=makeScenario();s.achievements.push({...s.achievements[0],id:9999});
  assert.equal(plan({toComplete:true,completedAt:TIME},[s,a]).status,'BLOCKED');
});

test('source-generalized dry-run also resolves a non-Puzzle manual family without claiming game verification',()=>{
  const alternative=cat.entries.find(e=>e.rule==='MANUAL_INCREMENT' && e.parent_key!=='collection_puzzle' && !e.required_dlc_nonzero && !e.event_year && !e.event_path_id);
  assert.ok(alternative);
  const family=cat.families.find(f=>f.key===alternative.parent_key);
  assert.ok(family);
  const members=family.member_guids.map((guid,i)=>({e:cat.lookup.byGuid.get(guid),id:i+1}));
  const parent=cat.lookup.byGuid.get(family.guid);
  const s={version:'3.0.1',achievements:members.map(({e,id})=>({id,guid:e.save_guid,complete:false,current:0,completed:null})),
    counters:[{id:111,guid:alternative.counter_save_guid,current:0,countedValues:null,countedGuids:0},
      {id:112,guid:parent.counter_save_guid,current:0,countedValues:null,countedGuids:0}]};
  s.achievements.push({id:300,guid:parent.save_guid,complete:false,current:0,completed:null});
  const a={Achievements:{[cat.root.guid]:{IsComplete:false,CurrentValue:0,CompletedTime:null}},
    Counters:{[cat.root.counter_guid]:{CurrentValue:0}}};
  const out=inspectManualAchievementTransition(cat,s,a,{targetKey:alternative.key,toComplete:true,completedAt:TIME});
  assert.equal(out.status,'RESEARCH_CANDIDATE_ONLY');
  assert.equal(out.candidate_fields.length,6);
  assert.ok(out.candidate_fields.every(f=>f.file==='Saves/save_0.save'));
  assert.equal(out.root_after,0);
  assert.equal(out.writer_enabled,false);
});

test('root 63/63 completion edge remains BLOCKED, even if group source values reconcile',()=>{
  const [s,a]=makeScenario();
  let id=900;
  for(const family of cat.families){
    if(family.key==='collection_puzzle')continue;
    const entry=cat.lookup.byGuid.get(family.guid);
    s.achievements.push({id:id++,guid:entry.save_guid,complete:true,current:family.required_count,completed:TIME});
  }
  a.Achievements[cat.root.guid].CurrentValue=62;
  a.Counters[cat.root.counter_guid].CurrentValue=62;
  const out=plan({toComplete:true,completedAt:TIME},[s,a]);
  assert.equal(out.status,'BLOCKED');
  assert.ok(out.issues.includes('ROOT_COMPLETION_EDGE_NOT_IMPLEMENTED'));
  assert.deepEqual(out.candidate_fields,[]);
});
