/**
 * Stream 02, HKIA.AchievementEditPolicy.2. READ-ONLY pure semantic policies.
 * Depends on source-pinned HKIA.AchievementSemanticCatalog.1 from the prior 02 overlay.
 * No ZIP/save mutation, no auto writer, no account mutation, no reward issuance.
 * Caller must separately verify native envelope, document IDs, save version and 03/04 contracts.
 */
import {inspectManualAchievementTransition} from './achievement-semantic-contract.mjs';

const RAW_GUID=/^[a-f0-9]{32}$/i;
const SAVE_GUID=/^[a-f0-9]{8}(?::[a-f0-9]{8}){3}$/i;
const FILE_SLOT='Saves/save_0.save';
const FILE_ACCOUNT='SettingsAccount/settings.json';
const F32_MAX=3.4028234663852886e38;
const LINKAGE_PROVEN_PUZZLE='achievement_puzzlesInTheStars';
const validFloat=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=F32_MAX&&Math.fround(v)===v;
const validAccountNumber=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=F32_MAX;
const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const block=(code,detail={})=>({schema:'HKIA.AchievementEditPlan.2',status:'BLOCKED',reasons:[code],...detail,field_changes:[],writer_enabled:false,export_enabled:false});
const safeClone=x=>JSON.parse(JSON.stringify(x));
function canonical(v){return typeof v==='string'?v.toLowerCase():'';}
function calendarUtc(v){
  if(typeof v!=='string'||!/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d):(\d\d)\.(\d{7})Z$/.test(v))return false;
  const iso=v.slice(0,23)+'Z',t=Date.parse(iso);
  return Number.isFinite(t)&&new Date(t).toISOString()===iso;
}
function calendarAccountUtc(v){
  if(typeof v!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,7})?Z$/.test(v))return false;
  const t=Date.parse(v);return Number.isFinite(t)&&new Date(t).toISOString().slice(0,19)===v.slice(0,19);
}
function timeValid(complete,time,scope){return complete?(scope==='Account'?calendarAccountUtc(time):calendarUtc(time)):time===null;}
function stateValid(state,scope){return state&&typeof state.complete==='boolean'&&(scope==='Account'?validAccountNumber(state.current):validFloat(state.current))&&timeValid(state.complete,state.completed,scope);}
function inspectSet(records,format){
  if(!Array.isArray(records))return {error:'INVALID_RECORD_ARRAY'};
  const byGuid=new Map(),ids=new Set();
  for(const rec of records){
    if(!rec||typeof rec!=='object'||!format.test(rec.guid)||!Number.isSafeInteger(rec.id)||rec.id<0)return {error:'INVALID_RECORD_IDENTITY'};
    const guid=canonical(rec.guid);
    if(byGuid.has(guid)||ids.has(rec.id))return {error:'DUPLICATE_SAVED_RECORD'};
    byGuid.set(guid,rec);ids.add(rec.id);
  }
  return {byGuid};
}
function linkageLabel(key){return key===LINKAGE_PROVEN_PUZZLE?'PUZZLE_CONDITIONAL_REQUIRED_STATIC':'RELATED_UNVERIFIED';}
function safePlan(status,details={}){return {schema:'HKIA.AchievementEditPlan.2',status,writer_enabled:false,export_enabled:false,reward_write_enabled:false,
  hardware_verified:false,game_reflection_verified:false,field_changes:[],...details};}
function hasDifferentRawCaseKeys(map){
  const seen=new Set();
  for(const key of Object.keys(map||{})){const lo=canonical(key);if(seen.has(lo))return true;seen.add(lo);}
  return false;
}

/** Progress-only must not bypass group/root saved-state preconditions. */
function manualProgressGate(catalog,snapshot,account,entry){
  const achievements=inspectSet(snapshot?.achievements,SAVE_GUID),counters=inspectSet(snapshot?.counters,SAVE_GUID);
  if(achievements.error||counters.error)return achievements.error||counters.error;
  const parent=catalog.entries.find(e=>e.key===entry.parent_key);
  const family=catalog.families.find(f=>f.key===entry.parent_key);
  if(!parent||!family)return 'SOURCE_PARENT_MISSING';
  const members=family.member_guids.map(g=>catalog.lookup.byGuid.get(g)).map(e=>achievements.byGuid.get(canonical(e.save_guid)));
  if(members.some(x=>!x))return 'GROUP_MEMBER_RECORD_MISSING';
  if(members.some(x=>!stateValid(x,'InGame')))return 'GROUP_MEMBER_STATE_INVALID';
  const completed=members.filter(x=>x.complete).length;
  const parentA=achievements.byGuid.get(canonical(parent.save_guid));
  const parentC=counters.byGuid.get(canonical(parent.counter_save_guid));
  if(!parentA||!parentC)return 'GROUP_PARENT_OR_COUNTER_MISSING';
  if(!stateValid(parentA,'InGame')||!validFloat(parentC.current)||parentC.countedValues!==null||parentC.countedGuids!==0)return 'GROUP_PARENT_STATE_INVALID';
  if(parentA.current!==completed||parentC.current!==completed||parentA.complete!==(completed===family.required_count))return 'GROUP_PROGRESS_DIVERGED';
  const rootA=account?.Achievements?.[catalog.root.guid],rootC=account?.Counters?.[catalog.root.counter_guid];
  if(!rootA||!rootC)return 'ACCOUNT_META_ROOT_MISSING';
  const sourceGroups=catalog.families.map(f=>achievements.byGuid.get(canonical(f.save_guid)));
  const completedGroups=sourceGroups.filter(x=>x?.complete).length;
  if(rootA.IsComplete!==false||rootA.CompletedTime!==null||rootA.CurrentValue!==completedGroups||rootC.CurrentValue!==completedGroups)return 'ACCOUNT_META_ROOT_DIVERGED';
  return null;
}

/** One source-bound contract for EACH 820 InGame definition and EACH 31 Account definition. */
export function buildAchievementEditFieldContracts(catalog){
  if(catalog?.schema!=='HKIA.AchievementSemanticCatalog.1'||catalog.entries?.length!==820||catalog.account?.length!==31)throw new Error('POLICY: source catalog not pinned');
  const ingame=catalog.entries.map(e=>({
    scope:'InGame',key:e.key,source_guid:e.guid,save_guid:e.save_guid,expected_counter_guid:e.counter_save_guid,
    storage:FILE_SLOT,counter_storage:FILE_SLOT,document_id:'SAVED_RECORD_REQUIRED_UNVERIFIED',
    fields:{IsComplete:'boolean',CurrentValue:'float32',CompletedTime:'MessagePack nil or timestamp64'},
    counter_fields:{CurrentValue:'float32',CountedValues:'preserve',CountedGuids:'preserve'},
    rule:e.rule,source_counter_kind:e.counter_kind,source_threshold:e.configured_threshold,
    effective_threshold:e.rule==='GROUP_REFERENCES'?e.built_in_threshold:e.configured_threshold,
    parent_key:e.parent_key,required_dlc:e.required_dlc_nonzero,event_restriction:!!(e.event_year||e.event_path_id),
    linkage_classification:linkageLabel(e.key),
    proposed_editability:e.rule==='MANUAL_INCREMENT'&&!e.required_dlc_nonzero&&!e.event_year&&!e.event_path_id&&e.own_counter_state!=='UNIQUE_TRACKING'&&e.counter_enabled
      ?'CONDITIONAL_DRY_RUN_ONLY':'READ_ONLY_UNKNOWN_REQUIREMENTS',
    reward_claim_state:'UNKNOWN',native_writer_enabled:false
  }));
  const account=catalog.account.map(e=>({
    scope:'Account',key:e.key,source_guid:e.guid,save_guid:null,storage:FILE_ACCOUNT,counter_storage:e.counter_store,
    fields:{IsComplete:'boolean',CurrentValue:'finite_nonnegative_number',CompletedTime:'UTC string or null'},
    counter_fields:{CurrentValue:'preserve_without_authorized_linkage'},
    rule:e.counter_kind,source_threshold:e.source_threshold,built_in_references:e.built_in_references,
    linkage_classification:e.key==='Local_RootAchievement'?'PUZZLE_CONDITIONAL_REQUIRED_STATIC':'RELATED_UNVERIFIED',
    proposed_editability:'EXISTING_ACCOUNT_EDITOR_ONLY',reward_claim_state:'UNKNOWN',native_writer_enabled:false
  }));
  return {schema:'HKIA.AchievementFieldContracts.2',source_sha256:catalog.source_sha256,local_definition_version:catalog.definition_version,
    counts:{ingame:ingame.length,account:account.length},ingame,account,
    unrecognized_guid_policy:'DISPLAY_RAW_DRAFT_ONLY',missing_record_policy:'ABSENT_NOT_INCOMPLETE',
    save_export_approved:false,writer_enabled:false};
}

/** Display contract: raw unknown GUID is visible, never equated to incomplete. */
export function describeSavedAchievement(catalog,snapshot,account,{scope='InGame',guid}={}){
  if(scope!=='InGame'&&scope!=='Account')return block('UNSUPPORTED_SCOPE');
  if(typeof guid!=='string')return block('GUID_REQUIRED');
  const canon=canonical(guid);
  if(scope==='InGame'){
    if(!SAVE_GUID.test(guid))return block('EXPECTED_SAVED_HASH128_GUID');
    const indexed=inspectSet(snapshot?.achievements,SAVE_GUID);
    if(indexed.error)return block(indexed.error);
    const entry=catalog.entries.find(x=>canonical(x.save_guid)===canon);
    const saved=indexed.byGuid.get(canon);
    const counterState=entry?.counter_save_guid?inspectSet(snapshot?.counters,SAVE_GUID):null;
    const counter=counterState?.byGuid?.get(canonical(entry?.counter_save_guid));
    const category=!saved?(entry?'KNOWN_DEFINITION_NOT_PERSISTED':'UNKNOWN_GUID_NOT_PERSISTED'):(entry?'KNOWN_SOURCE_SAVED':'UNKNOWN_SOURCE_SAVED');
    return {scope,guid,record_status:category,source_key:entry?.key??null,stored_record:saved?{id:saved.id,complete:saved.complete,current:saved.current,completed:saved.completed}:null,
      counter_status:!entry?'UNKNOWN_SOURCE_COUNTER':counterState?.error?'INVALID_COUNTER_INDEX':counter?'SAVED':'MISSING_COUNTER',
      warning:entry?'SOURCE_CATALOG_NOT_GAMEPLAY_PROOF':'UNKNOWN_GUID_NO_NAME_OR_COUNTER_LINK',
      can_show:!!saved,can_prepare_draft:!!saved,can_apply:false,can_export:false};
  }
  if(!RAW_GUID.test(guid))return block('EXPECTED_ACCOUNT_SOURCE_GUID');
  if(!account?.Achievements||typeof account.Achievements!=='object'||Array.isArray(account.Achievements))return block('ACCOUNT_ACHIEVEMENTS_MISSING');
  if(hasDifferentRawCaseKeys(account.Achievements)||hasDifferentRawCaseKeys(account.Counters))return block('ACCOUNT_DUPLICATE_GUID_CASE_COLLISION');
  const byKey=Object.entries(account.Achievements).find(([k])=>canonical(k)===canon),entry=catalog.account.find(x=>canonical(x.guid)===canon);
  return {scope,guid,record_status:byKey?(entry?'KNOWN_SOURCE_SAVED':'UNKNOWN_SOURCE_SAVED'):(entry?'KNOWN_DEFINITION_NOT_PERSISTED':'UNKNOWN_GUID_NOT_PERSISTED'),
    source_key:entry?.key??null,stored_record:byKey?safeClone(byKey[1]):null,counter_status:entry?.counter_store===FILE_SLOT?'INGAME_REFERENCED':entry?'META_REFERENCED':'UNKNOWN_SOURCE_COUNTER',
    warning:entry?'NO_REWARD_OR_PLATFORM_SYNC_GUARANTEE':'UNKNOWN_GUID_NO_OFFICIAL_NAME',
    can_show:!!byKey,can_prepare_draft:!!byKey,can_apply:false,can_export:false};
}

/**
 * One bounded, zero-mutation request. Does NOT authorize a slot or Account writer.
 * req = {scope, guid, mode:'SET_COMPLETE'|'SET_PROGRESS'|'SET_TIMESTAMP', complete?,progress?,timestamp?}
 * Unknown GUIDs may yield a *raw draft* but never guessed counter/parent edits.
 */
export function inspectAchievementEditRequest(catalog,snapshot,account,req={}){
  const {scope='InGame',guid,mode}=req;
  if(!['InGame','Account'].includes(scope))return block('UNSUPPORTED_SCOPE');
  if(!['SET_COMPLETE','SET_PROGRESS','SET_TIMESTAMP'].includes(mode))return block('UNSUPPORTED_EDIT_MODE');
  const view=describeSavedAchievement(catalog,snapshot,account,{scope,guid});
  if(view.status==='BLOCKED')return view;
  if(!view.can_show)return block('MISSING_SAVED_RECORD_NOT_FALSE',{scope,guid,display:view});
  const allowOnly=new Set(['scope','guid','mode','complete','progress','timestamp']);
  if(Object.keys(req).some(k=>!allowOnly.has(k)))return block('UNRECOGNIZED_EDIT_REQUEST_FIELD');
  const old=scope==='InGame'?view.stored_record:{complete:view.stored_record.IsComplete,current:view.stored_record.CurrentValue,completed:view.stored_record.CompletedTime};
  if(!stateValid(old,scope))return block('INVALID_OR_AMBIGUOUS_OLD_STATE',{scope,guid,display:view});
  const desired={complete:old.complete,current:old.current,completed:old.completed};
  if(mode==='SET_COMPLETE'){
    if(typeof req.complete!=='boolean')return block('COMPLETE_BOOLEAN_REQUIRED');
    desired.complete=req.complete;
    if(req.complete){
      if(!(scope==='Account'?calendarAccountUtc(req.timestamp):calendarUtc(req.timestamp)))return block('EXPLICIT_CALENDAR_VALID_UTC_REQUIRED');
      desired.completed=req.timestamp;
    }else{
      desired.completed=null;
      if(!(scope==='Account'?validAccountNumber(req.progress):validFloat(req.progress)))return block('EXPLICIT_VALID_PROGRESS_REQUIRED');
      desired.current=req.progress;
    }
  } else if(mode==='SET_PROGRESS'){
    if(!(scope==='Account'?validAccountNumber(req.progress):validFloat(req.progress)))return block('INVALID_PROGRESS');
    desired.current=req.progress;
  } else {
    if(!old.complete||!(scope==='Account'?calendarAccountUtc(req.timestamp):calendarUtc(req.timestamp)))return block('TIMESTAMP_REQUIRES_COMPLETED_AND_VALID_UTC');
    desired.completed=req.timestamp;
  }
  if(!timeValid(desired.complete,desired.completed,scope))return block('INCONSISTENT_COMPLETED_TIME');
  if(scope==='InGame'&&!['3.0.0','3.0.1'].includes(snapshot?.version))return block('UNVERIFIED_SLOT_VERSION');
  const base={scope,guid,mode,display:view,linkage_classification:'UNKNOWN',warnings:['WRITER_DISABLED','REWARD_RECEIPT_NOT_INFERRED','SAVE_RELOAD_UNVERIFIED']};
  const props=[['IsComplete','complete'],['CurrentValue','current'],['CompletedTime','completed']];
  const changed=props.filter(([_,k])=>old[k]!==desired[k]).map(([field,k])=>({file:scope==='InGame'?FILE_SLOT:FILE_ACCOUNT,
    model:scope==='InGame'?'AchievementModel':'Achievement',source_key:view.source_key,source_guid:guid,field,before:old[k],after:desired[k]}));
  if(!changed.length)return safePlan('NO_OP',{...base,linkage_classification:'INDEPENDENT_NO_CHANGE'});
  if(scope==='Account'){
    if(view.source_key==='Local_RootAchievement')return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,linkage_classification:'RELATED_UNVERIFIED',
      warnings:[...base.warnings,'META_ROOT_DERIVED_COUNTER_CANNOT_BE_EDITED_IN_ISOLATION']});
    return safePlan('DRAFT_ACCOUNT_ONLY',{...base,field_changes:changed,linkage_classification:'RELATED_UNVERIFIED',
      warnings:[...base.warnings,'EXISTING_ACCOUNT_WRITER_NOT_INVOKED','COUNTER_RECONCILIATION_UNVERIFIED']});
  }
  const entry=catalog.entries.find(x=>canonical(x.save_guid)===canonical(guid));
  if(!entry)return safePlan('DRAFT_UNKNOWN_GUID',{...base,field_changes:changed,linkage_classification:'UNKNOWN',
    warnings:[...base.warnings,'UNKNOWN_GUID_COUNTER_PARENT_SOURCE_NOT_RESOLVED']});
  base.linkage_classification=linkageLabel(entry.key);
  base.source_key=entry.key;
  if(entry.rule!=='MANUAL_INCREMENT'||entry.own_counter_state==='UNIQUE_TRACKING'||!entry.counter_enabled||entry.required_dlc_nonzero||entry.event_year||entry.event_path_id){
    return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,warnings:[...base.warnings,'DERIVED_UNIQUE_DLC_EVENT_COUNTER_UNVERIFIED']});
  }
  if(mode==='SET_TIMESTAMP'){
    return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,warnings:[...base.warnings,'TIMESTAMP_REWRITE_NATIVE_SEMANTICS_UNVERIFIED']});
  }
  if(mode==='SET_PROGRESS'&&old.complete){
    return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,warnings:[...base.warnings,'COMPLETED_PROGRESS_CHANGE_NEEDS_FAMILY_RULES']});
  }
  if(mode==='SET_PROGRESS'){
    if(req.progress>=entry.configured_threshold)return block('THRESHOLD_CROSSING_REQUIRES_COMPLETION_TRANSITION',{scope,guid,display:view});
    const counters=inspectSet(snapshot?.counters,SAVE_GUID);
    if(counters.error)return block(counters.error);
    const counter=counters.byGuid.get(canonical(entry.counter_save_guid));
    if(!counter)return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,warnings:[...base.warnings,'LINKED_COUNTER_MISSING']});
    if(!validFloat(counter.current)||counter.current!==old.current)return block('COUNTER_ACHIEVEMENT_DISAGREE');
    if(counter.countedValues!==null||counter.countedGuids!==0)return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,warnings:[...base.warnings,'COUNTER_HISTORY_OPAQUE']});
    const parentGate=manualProgressGate(catalog,snapshot,account,entry);
    if(parentGate)return block(parentGate,{scope,guid,display:view});
    const counterChange={file:FILE_SLOT,model:'GameCounterModel',source_key:entry.key,source_guid:entry.counter_save_guid,
      field:'CurrentValue',before:counter.current,after:req.progress};
    return safePlan('DRAFT_MANUAL_PROGRESS',{...base,field_changes:[...changed,counterChange],warnings:[...base.warnings,'03_RELATED_NOT_PROVEN_REQUIRED']});
  }
  // For complete/incomplete, reuse the existing source-pinned group/root dependency inspector.
  if(req.complete===old.complete)return safePlan('DRAFT_UNVERIFIED',{...base,field_changes:changed,warnings:[...base.warnings,'UNCHANGED_COMPLETION_WITH_TIMESTAMP_REWRITE']});
  const candidate=inspectManualAchievementTransition(catalog,snapshot,account,{targetKey:entry.key,toComplete:req.complete,
    ...(req.complete?{completedAt:req.timestamp}:{uncompleteProgress:req.progress})});
  if(candidate.status==='BLOCKED')return block('FAMILY_VALIDATION_FAILED',{scope,guid,display:view,details:candidate.issues,warnings:candidate.warnings});
  if(candidate.status!=='RESEARCH_CANDIDATE_ONLY')return block('UNEXPECTED_FAMILY_INSPECTOR_RESULT');
  const exactPuzzleStaticScope=entry.key===LINKAGE_PROVEN_PUZZLE&&old.complete===false&&old.current===1&&req.complete===true&&
    candidate.group_before===4&&candidate.group_after===5&&candidate.root_before===19&&candidate.root_after===20&&
    candidate.root_missing_saved_members===9&&candidate.candidate_fields.length===10;
  const classification=exactPuzzleStaticScope?'PUZZLE_CONDITIONAL_REQUIRED_STATIC':'RELATED_UNVERIFIED';
  return safePlan('DRAFT_FAMILY_TRANSITION',{...base,linkage_classification:classification,
    field_changes:candidate.candidate_fields,linked_field_counts:{slot:candidate.candidate_fields.filter(x=>x.file===FILE_SLOT).length,
      account:candidate.candidate_fields.filter(x=>x.file===FILE_ACCOUNT).length},
    warnings:[...base.warnings,...candidate.warnings,'03_REQUIRED_ONLY_FOR_EXACT_PUZZLE_SCOPE','NATIVE_SAVE_WRITER_OFF']});
}
