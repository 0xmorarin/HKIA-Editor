/**
 * SOURCE-ONLY HKIA achievement contract + READ-ONLY dependency impact checker.
 * No ZIP/save writer, no byte editing, no reward grants, no external calls.
 * The catalog is version pinned to the provided v3.0.1 Unity definition crosswalk;
 * callers must separately verify a v3.0.0/v3.0.1 save's GUID and Document ID.
 */
import {serializedGuidToSlotGuid} from '../../src/guid.js';
const GUID=/^[0-9a-f]{32}$/i;
const GUIDSAVE=/^[0-9a-f]{8}(?::[0-9a-f]{8}){3}$/i;
const ROOT='Local_RootAchievement';
const GROUP='GameCounterAchievementsDefinition';
const MANUAL='GameCounterManualDefinition';
function invariant(value,msg){if(!value)throw new Error('CONTRACT: '+msg);}
function uniqueMap(arr,key,label){const m=new Map();for(const e of arr){const k=e[key];invariant(typeof k==='string'&&k.length>0,label+' missing '+key);invariant(!m.has(k),label+' duplicate '+key+': '+k);m.set(k,e);}return m;}
function float32(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&Math.fround(value)===value;}
function dateUTC(value){
  if(typeof value!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{7}Z$/.test(value))return false;
  const [_,base,frac]=/^(.*\.)(\d{7})Z$/.exec(value)||[];
  if(!base)return false;
  const iso=base+frac.slice(0,3)+'Z',milliseconds=Date.parse(iso);
  return Number.isFinite(milliseconds)&&new Date(milliseconds).toISOString()===iso;
}
function counterStateClean(c){return c&&c.countedValues===null&&c.countedGuids===0;}
function achievementStateClean(a){return a&&typeof a.complete==='boolean'&&float32(a.current)&&((a.completed===null&&!a.complete)||(typeof a.completed==='string'&&a.complete));}
export function buildAchievementSemanticCatalog(localDefs,slotDefs,accountDefs){
  const local=localDefs?.records,refs=slotDefs?.achievement_references,counters=slotDefs?.counters;
  invariant(localDefs?.version==='3.0.1'&&slotDefs?.version==='3.0.1','unsupported definition version');
  invariant(Array.isArray(local)&&local.length===820,'expected 820 LocalAchievement definitions');
  invariant(Array.isArray(refs)&&refs.length===820,'expected 820 source group references');
  invariant(Array.isArray(counters)&&counters.length===851,'expected 851 source counters');
  invariant(Array.isArray(accountDefs)&&accountDefs.length===31,'expected 31 Account achievements');
  const locals=uniqueMap(local,'guid','local');const refMap=uniqueMap(refs,'guid','reference');
  const counterMap=uniqueMap(counters,'guid','counter');const byKey=uniqueMap(local,'key','local key');
  uniqueMap(counters,'save_guid','saved counter identity');
  for(const c of counters)invariant(GUID.test(c.guid)&&GUIDSAVE.test(c.save_guid)&&serializedGuidToSlotGuid(c.guid)===c.save_guid,'counter Hash128 transform mismatch: '+c.name);
  for(const ref of refs)invariant(GUID.test(ref.guid)&&GUIDSAVE.test(ref.save_guid)&&serializedGuidToSlotGuid(ref.guid)===ref.save_guid,'achievement Hash128 transform mismatch');
  const byOwnedCounter=uniqueMap(local,'counter_guid','local owner counter');
  const accMap=uniqueMap(accountDefs,'guid','Account');const accByCounter=uniqueMap(accountDefs,'counter_guid','Account counter');
  const root=accountDefs.find(x=>x.key===ROOT);
  invariant(root?.counter_kind==='AchievementsCounter'&&root.counter_storage==='Meta'&&root.built_in_references===63,'Meta root absent or wrong');
  const rootCounter=counterMap.get(root.counter_guid);
  invariant(rootCounter?.kind==='AchievementsCounter'&&rootCounter?.storage==='Meta'&&rootCounter.reference_count===63,'Meta root counter mismatch');
  const children=new Map();for(const ref of refs){const group=counterMap.get(ref.group_counter_guid);invariant(group&&[GROUP,'AchievementsCounter'].includes(group.kind),'reference group counter missing');if(!children.has(group.guid))children.set(group.guid,[]);children.get(group.guid).push(ref.guid);}
  const groupDefs=local.filter(x=>x.counter_kind===GROUP);
  invariant(groupDefs.length===63&&local.length-groupDefs.length===757,'expected two-level hierarchy');
  const rootMembers=children.get(root.counter_guid)||[];
  invariant(rootMembers.length===63&&new Set(rootMembers).size===63,'Meta root group membership invalid');
  for(const member of rootMembers)invariant(locals.get(member)?.counter_kind===GROUP,'Meta root member is not a group');
  const families=[];
  for(const owner of groupDefs){
    const sourceCounter=counterMap.get(owner.counter_guid);
    invariant(sourceCounter?.kind===GROUP,'group source counter wrong');
    const members=children.get(owner.counter_guid)||[];
    invariant(members.length===sourceCounter.reference_count&&members.length>0,'group member count mismatch: '+owner.key);
    invariant(rootMembers.includes(owner.guid),'group missing Meta root parent: '+owner.key);
    const leaves=members.map(g=>{const item=locals.get(g);invariant(item&&item.counter_kind!==GROUP,'unsupported nested group or dangling leaf: '+owner.key);return item;});
    families.push({key:owner.key,guid:owner.guid,save_guid:owner.save_guid,counter_guid:owner.counter_guid,counter_save_guid:owner.counter_save_guid,
      completion_rule:'ALL_SOURCE_MEMBER_ACHIEVEMENTS',required_count:members.length,member_guids:members,member_keys:leaves.map(x=>x.key),
      reward_defined:owner.reward_quantity>0,required_dlc_nonzero:owner.required_dlc_u32.some(Boolean)});
  }
  const familyByMember=new Map(),familyByGuid=uniqueMap(families,'guid','family');
  for(const f of families){for(const g of f.member_guids){invariant(!familyByMember.has(g),'multiple group owners');familyByMember.set(g,f);}}
  invariant(familyByMember.size===757,'unassigned lower achievement');
  const entries=local.map(def=>{
    invariant(GUID.test(def.guid)&&GUIDSAVE.test(def.save_guid)&&GUID.test(def.counter_guid)&&GUIDSAVE.test(def.counter_save_guid)&&serializedGuidToSlotGuid(def.guid)===def.save_guid&&serializedGuidToSlotGuid(def.counter_guid)===def.counter_save_guid,'invalid source identity: '+def.key);
    const storedCounter=counterMap.get(def.counter_guid),parentRef=refMap.get(def.guid);
    invariant(storedCounter&&storedCounter.save_guid===def.counter_save_guid&&storedCounter.kind===def.counter_kind,'local counter GUID or kind mismatch: '+def.key);
    invariant(parentRef&&parentRef.save_guid===def.save_guid,'local achievement GUID mismatch: '+def.key);
    const parent=def.counter_kind===GROUP?{key:ROOT,guid:root.guid,counter_guid:root.counter_guid,required_count:63,storage:'Meta'}:familyByMember.get(def.guid);
    invariant(parent&&parentRef.group_counter_guid===parent.counter_guid,'parent pointer mismatch: '+def.key);
    invariant(float32(def.threshold)&&def.threshold>0,'invalid completion threshold: '+def.key);
    const isGroup=def.counter_kind===GROUP;
    const method=isGroup?'GROUP_REFERENCES':def.counter_kind===MANUAL?'MANUAL_INCREMENT':'DERIVED_TRACKER';
    return {
      key:def.key,guid:def.guid,save_guid:def.save_guid,counter_guid:def.counter_guid,counter_save_guid:def.counter_save_guid,
      counter_kind:def.counter_kind,counter_storage:storedCounter.storage,counter_enabled:storedCounter.enabled,
      rule:method,configured_threshold:def.threshold,built_in_threshold:isGroup?parent&&families.find(f=>f.guid===def.guid)?.required_count:null,
      parent_key:parent.key,parent_guid:parent.guid,parent_counter_guid:parent.counter_guid,
      own_counter_state:storedCounter.only_count_uniques===true?'UNIQUE_TRACKING':'UNDETERMINED_OR_SCALAR',
      required_dlc_nonzero:def.required_dlc_u32.some(Boolean),event_year:def.event_year,event_path_id:def.event_path_id,
      reward_defined:def.reward_quantity>0,reward_item_id:def.reward_item_id,reward_quantity:def.reward_quantity,
      local_contract:isGroup?'DERIVED_GROUP_ONLY':method==='MANUAL_INCREMENT'?'CONDITIONAL_RESEARCH_ONLY':'READ_ONLY_PENDING_UPSTREAM_PROOF'
    };
  });
  const entryByKey=uniqueMap(entries,'key','entry'),entryByGuid=uniqueMap(entries,'guid','entry');
  const countKinds={};for(const e of entries)countKinds[e.counter_kind]=(countKinds[e.counter_kind]||0)+1;
  const account=accountDefs.map(a=>{
    invariant(GUID.test(a.guid)&&GUID.test(a.counter_guid),'invalid account GUID: '+a.key);
    const counter=counterMap.get(a.counter_guid);
    invariant(counter&&counter.kind===a.counter_kind&&counter.storage===a.counter_storage,'account source counter mismatch: '+a.key);
    return {key:a.key,guid:a.guid,counter_guid:a.counter_guid,counter_save_guid:counter.save_guid,
      state_store:'SettingsAccount/settings.json',counter_store:a.counter_storage==='Meta'?'SettingsAccount/settings.json':'Saves/save_0.save',
      counter_kind:a.counter_kind,achievement_type:a.achievement_type,source_threshold:a.condition_threshold,
      built_in_references:a.built_in_references,external_progress_not_guaranteed:a.achievement_type==='PureExternal'};
  });
  invariant(account.filter(x=>x.counter_store==='SettingsAccount/settings.json').length===16&&account.filter(x=>x.counter_store==='Saves/save_0.save').length===15,'unexpected Meta/InGame split');
  invariant(account.every(a=>accMap.has(a.guid)&&accByCounter.has(a.counter_guid)),'Account index mismatch');
  return {schema:'HKIA.AchievementSemanticCatalog.1',definition_version:'3.0.1',source_sha256:localDefs.source_original_sha256,
    root:{key:ROOT,guid:root.guid,counter_guid:root.counter_guid,source_reference_count:63},
    counts:{local:entries.length,groups:families.length,leaves:familyByMember.size,account:account.length,account_meta_counters:16,account_ingame_counters:15,source_counters:counters.length,by_counter_kind:countKinds},
    families,entries,account,
    lookup:{byKey:entryByKey,byGuid:entryByGuid,byFamilyGuid:familyByGuid},
    source_assurance:'SOURCE_CROSSWALK_ONLY',native_writer_enabled:false};
}
/**
 * A read-only diagnostic. Even READY_RESEARCH is NOT permission to write a save.
 * The returned field list represents candidate dependencies, not a verified patch.
 */
export function inspectManualAchievementTransition(catalog,snapshot,accountState,{targetKey,toComplete,completedAt,uncompleteProgress}={}){
  const issue=[],warning=[],diff=[];
  const block=reason=>issue.push(reason);
  const entry=catalog.lookup.byKey.get(targetKey);
  if(!entry)return {status:'BLOCKED',issues:['UNKNOWN_SOURCE_KEY'],warnings:[],candidate_fields:[],writer_enabled:false};
  if(entry.rule!=='MANUAL_INCREMENT')block('NON_MANUAL_TRACKER');
  if(!entry.counter_enabled)block('DISABLED_SOURCE_COUNTER');
  if(!['3.0.0','3.0.1'].includes(snapshot?.version))block('UNVERIFIED_SAVE_VERSION');
  if(entry.required_dlc_nonzero||entry.event_year||entry.event_path_id)block('EVENT_OR_DLC_CONDITION_NOT_PROVEN');
  if(typeof toComplete!=='boolean')block('TARGET_STATE_REQUIRED');
  if(toComplete===true&&!dateUTC(completedAt))block('EXPLICIT_VALID_UTC_TIME_REQUIRED');
  if(toComplete===false&&(!float32(uncompleteProgress)||uncompleteProgress>=entry.configured_threshold))block('EXPLICIT_LOWER_PROGRESS_REQUIRED');
  const achievementRecords=snapshot?.achievements||[],counterRecords=snapshot?.counters||[];
  const aMap=new Map(achievementRecords.map(x=>[x.guid,x]));
  const cMap=new Map(counterRecords.map(x=>[x.guid,x]));
  if(aMap.size!==achievementRecords.length||cMap.size!==counterRecords.length)block('SAVED_GUID_DUPLICATION');
  const a=aMap.get(entry.save_guid),c=cMap.get(entry.counter_save_guid);
  if(!a||!c){block('TARGET_RECORD_NOT_SAVED');return {targetKey,status:'BLOCKED',issues:issue,warnings:warning,candidate_fields:[],writer_enabled:false};}
  if(!Number.isInteger(a.id)||!Number.isInteger(c.id)||a.guid!==entry.save_guid||c.guid!==entry.counter_save_guid)block('SAVED_IDENTITY_INVALID');
  if(!achievementStateClean(a)||!float32(c.current))block('TARGET_STORED_STATE_INVALID');
  if(a.current!==c.current)block('TARGET_ACHIEVEMENT_COUNTER_DISAGREE');
  if(a.complete&&a.current<entry.configured_threshold||!a.complete&&a.current>=entry.configured_threshold)block('TARGET_THRESHOLD_STATE_AMBIGUOUS');
  if(!counterStateClean(c))block('COUNTER_HAS_UNIQUE_OR_LEGACY_STATE');
  if(a.complete===toComplete)return {targetKey,status:issue.length?'BLOCKED':'NO_OP',issues:issue,warnings:warning,candidate_fields:[],writer_enabled:false};
  const fam=catalog.families.find(x=>x.key===entry.parent_key);
  if(!fam){block('GROUP_MISSING');return {targetKey,status:'BLOCKED',issues:issue,warnings:warning,candidate_fields:[],writer_enabled:false};}
  const parentEntry=catalog.lookup.byGuid.get(fam.guid);
  const parentA=aMap.get(parentEntry.save_guid),parentC=cMap.get(parentEntry.counter_save_guid);
  if(!parentA||!parentC)block('SAVED_PARENT_OR_COUNTER_MISSING');
  if(parentA&&!achievementStateClean(parentA))block('PARENT_ACHIEVEMENT_STATE_INVALID');
  if(parentC&&!float32(parentC.current))block('PARENT_COUNTER_STATE_INVALID');
  if(parentC&&!counterStateClean(parentC))block('PARENT_COUNTER_HAS_UNIQUE_OR_LEGACY_STATE');
  const members=fam.member_guids.map(g=>catalog.lookup.byGuid.get(g)).map(e=>aMap.get(e.save_guid));
  if(members.some(x=>!x))block('GROUP_CHILD_RECORD_ABSENT');
  if(members.some(x=>x&&!achievementStateClean(x)))block('GROUP_CHILD_STATE_INVALID');
  const completeBefore=members.filter(x=>x?.complete).length;
  const completeAfter=completeBefore+(toComplete?1:-1);
  const parentWasComplete=completeBefore===fam.required_count;
  const parentWillComplete=completeAfter===fam.required_count;
  if(parentA&&parentC&&(parentA.current!==completeBefore||parentC.current!==completeBefore||parentA.complete!==parentWasComplete))block('PARENT_PROGRESS_NOT_RECONCILED');
  const rootDef=catalog.root;
  const accountRootAchievement=accountState?.Achievements?.[rootDef.guid],accountRootCounter=accountState?.Counters?.[rootDef.counter_guid];
  if(!accountRootAchievement||!accountRootCounter)block('ACCOUNT_ROOT_RECORD_ABSENT');
  const groups=catalog.families.map(f=>aMap.get(f.save_guid));
  const presentGroups=groups.filter(Boolean),completedGroups=presentGroups.filter(x=>x.complete).length;
  const missingGroups=groups.length-presentGroups.length;
  if(missingGroups)warning.push('ROOT_GROUP_MEMBERS_ABSENT_IN_SAVE:'+missingGroups);
  if(accountRootAchievement&&accountRootCounter&&(
    accountRootAchievement.CurrentValue!==completedGroups||accountRootCounter.CurrentValue!==completedGroups||
    accountRootAchievement.IsComplete!==false||accountRootAchievement.CompletedTime!==null
  ))block('ACCOUNT_ROOT_PROGRESS_NOT_RECONCILED');
  const rootAfter=completedGroups+(parentWillComplete?1:0)-(parentWasComplete?1:0);
  if(rootAfter>=rootDef.source_reference_count||accountRootAchievement?.IsComplete===true)block('ROOT_COMPLETION_EDGE_NOT_IMPLEMENTED');
  if(issue.length)return {targetKey,status:'BLOCKED',issues:issue,warnings:warning,candidate_fields:[],writer_enabled:false};
  const targetProgress=toComplete?entry.configured_threshold:uncompleteProgress;
  // These are semantic fields only. Their serialization, game effects and atomic ZIP commit are not authorized.
  const slot='Saves/save_0.save',acc='SettingsAccount/settings.json';
  function add(file,model,sourceKey,field,oldValue,newValue){if(oldValue!==newValue)diff.push({file,model,source_key:sourceKey,field,before:oldValue,after:newValue});}
  add(slot,'AchievementModel',targetKey,'IsComplete',a.complete,toComplete);
  add(slot,'AchievementModel',targetKey,'CurrentValue',a.current,targetProgress);
  add(slot,'AchievementModel',targetKey,'CompletedTime',a.completed,toComplete?completedAt:null);
  add(slot,'GameCounterModel',targetKey,'CurrentValue',c.current,targetProgress);
  add(slot,'AchievementModel',parentEntry.key,'CurrentValue',parentA.current,completeAfter);
  add(slot,'GameCounterModel',parentEntry.key,'CurrentValue',parentC.current,completeAfter);
  if(parentWasComplete!==parentWillComplete){
    add(slot,'AchievementModel',parentEntry.key,'IsComplete',parentA.complete,parentWillComplete);
    add(slot,'AchievementModel',parentEntry.key,'CompletedTime',parentA.completed,parentWillComplete?completedAt:null);
    add(acc,'Achievement',rootDef.key,'CurrentValue',accountRootAchievement.CurrentValue,completedGroups+(parentWillComplete?1:-1));
    add(acc,'Counter',rootDef.key,'CurrentValue',accountRootCounter.CurrentValue,completedGroups+(parentWillComplete?1:-1));
  }
  warning.push('GAME_LOAD_RECALCULATION_UNVERIFIED','UPSTREAM_GAMEPLAY_STATE_UNVERIFIED','REWARD_RECEIPT_NOT_INFERRED','NATIVE_SAVE_AUTH_UNVERIFIED');
  return {targetKey,status:'RESEARCH_CANDIDATE_ONLY',issues:[],warnings:warning,candidate_fields:diff,
    parent_key:parentEntry.key,group_before:completeBefore,group_after:completeAfter,group_required:fam.required_count,
    root_before:completedGroups,root_after:rootAfter,
    root_missing_saved_members:missingGroups,writer_enabled:false,export_enabled:false,verified_game_effect:false};
}
