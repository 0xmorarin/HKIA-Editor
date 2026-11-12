   
                                                                                    
                                                                                      
                                                                            
                                                             
   
import {inspectAchievementEditRequest,describeSavedAchievement} from './achievement-edit-policy.mjs';

const GUID=/^[a-f0-9]{8}(?::[a-f0-9]{8}){3}$/i;
const F32MAX=3.4028234663852886e38;
const SLOT='Saves/save_0.save',ACCOUNT='SettingsAccount/settings.json';
const SOURCE_SHA='1bf5fbf7cca8c0cb5084cdb43a1547f6507dc917b5328e46130fa805db4420bf';
const OWN=(v,k)=>Object.prototype.hasOwnProperty.call(v,k);
const canonical=s=>typeof s==='string'?s.toLowerCase():'';
const float32=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=F32MAX&&Math.fround(x)===x;
const fail=(reason,info={})=>({schema:'HKIA.AchievementGroupDraft.3',status:'BLOCKED',reasons:[reason],changes:[],writer_enabled:false,export_enabled:false,...info});
const result=(status,info={})=>({schema:'HKIA.AchievementGroupDraft.3',status,changes:[],writer_enabled:false,export_enabled:false,
  reward_claim_verified:false,game_accepted:false,third_party_sync_verified:false,...info});
const warned=['03_RELATED_NOT_REQUIRED','COUNTED_HISTORY_PRESERVED','NATIVE_LOAD_RECOUNT_UNVERIFIED','REWARD_CLAIM_UNKNOWN',
  'QUEST_UNLOCK_CACHE_UNKNOWN','RAW_TIMESTAMP_PRECISION_REQUIRED','WRITE_AND_EXPORT_DISABLED'];

                                                                                                       
export function inspectAchievementTimestamp100ns(value){
  if(value===null)return {valid:true,state:'UNSET_NIL',precision:'NONE',seconds:null,nanoseconds:null,epochNanoseconds:null};
  if(typeof value!=='string')return {valid:false,reason:'EXPECTED_EXPLICIT_NIL_OR_UTC_STRING'};
  const m=/^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)\.(\d{7})Z$/.exec(value);
  if(!m)return {valid:false,reason:'UTC_7_DIGIT_100NS_REQUIRED'};
  const milliIso=`${m[1]}.${m[2].slice(0,3)}Z`,ms=Date.parse(milliIso);
  if(!Number.isFinite(ms)||new Date(ms).toISOString()!==milliIso)return {valid:false,reason:'INVALID_GREGORIAN_UTC_DATE'};
  const sec=Math.floor(ms/1000),ns=Number(m[2])*100;
  if(sec<0||sec>=2**34||ns<0||ns>=1e9)return {valid:false,reason:'UNSUPPORTED_MSGPACK_TIMESTAMP64_RANGE'};
  return {valid:true,state:'EXPLICIT_UTC_100NS',precision:'100ns',seconds:sec,nanoseconds:ns,
    epochNanoseconds:(BigInt(sec)*1000000000n+BigInt(ns)).toString(),token_encoding:'TIMESTAMP64_CANDIDATE_ONLY'};
}

                                                                                                                        
export function inspectCountedHistoryForScalarDraft(counter){
  if(!counter||typeof counter!=='object'||Array.isArray(counter))return {safe:false,reason:'COUNTER_MISSING_OR_INVALID'};
  if(!OWN(counter,'countedValues')||!OWN(counter,'countedGuids'))return {safe:false,reason:'COUNTER_HISTORY_SHAPE_UNPROVEN'};
  const strings=counter.countedValues,guids=counter.countedGuids;
  if(strings!==null&&(!Array.isArray(strings)||strings.some(s=>typeof s!=='string')))
    return {safe:false,reason:'COUNTED_VALUES_INVALID_SHAPE'};
  if(!Number.isSafeInteger(guids)||guids<0)return {safe:false,reason:'COUNTED_GUIDS_OPAQUE_OR_INVALID'};
  if(strings!==null&&guids>0)return {safe:false,reason:'DUAL_COUNTED_REPRESENTATION_UNRESOLVED',legacy_count:strings.length,guid_count:guids};
  if(guids>0)return {safe:false,reason:'COUNTED_GUIDS_RECOUNT_RISK',guid_count:guids};
  if(strings!==null)return {safe:false,reason:'LEGACY_COUNTED_VALUES_PRESERVE',legacy_count:strings.length};
  if(!float32(counter.current))return {safe:false,reason:'COUNTER_CURRENT_NOT_EXACT_FLOAT32'};
  return {safe:true,kind:'SCALAR_CANDIDATE',guids_present:0,legacy_state:'EXPLICIT_NIL',source_assurance:'STATIC_ONLY'};
}

                                                                                                                   
export function inspectCompletedTimeRawPrecision({completed,rawTimestamp}={}){
  const text=inspectAchievementTimestamp100ns(completed);
  if(!text.valid)return {safe:false,reason:text.reason};
  if(completed===null)return rawTimestamp===null?{safe:true,source:'NIL_TOKEN_VERIFIED'}:
    {safe:false,reason:'NIL_RAW_TOKEN_NOT_VERIFIED'};
  if(!rawTimestamp||!Number.isSafeInteger(rawTimestamp.seconds)||!Number.isSafeInteger(rawTimestamp.nanoseconds)||
      rawTimestamp.nanoseconds<0||rawTimestamp.nanoseconds>=1e9)return {safe:false,reason:'RAW_TIMESTAMP_PROVENANCE_MISSING'};
  if(rawTimestamp.nanoseconds%100!==0)return {safe:false,reason:'RAW_NANOSECOND_SUB_100NS_PRECISION_LOSS'};
  if(rawTimestamp.seconds!==text.seconds||rawTimestamp.nanoseconds!==text.nanoseconds)
    return {safe:false,reason:'RAW_AND_DISPLAY_TIMESTAMP_DIVERGE'};
  return {safe:true,source:'RAW_TIMESTAMP_MATCHED_100NS',seconds:rawTimestamp.seconds,nanoseconds:rawTimestamp.nanoseconds};
}

function index(records){
  if(!Array.isArray(records))return {error:'SAVED_ARRAY_MISSING'};
  const byGuid=new Map(),ids=new Set();
  for(const r of records){
    if(!r||!GUID.test(r.guid)||!Number.isSafeInteger(r.id)||r.id<0)return {error:'INVALID_SAVED_RECORD_IDENTITY'};
    const g=canonical(r.guid);if(byGuid.has(g)||ids.has(r.id))return {error:'DUPLICATE_GUID_OR_DOCUMENT_ID'};
    byGuid.set(g,r);ids.add(r.id);
  }
  return {byGuid};
}
function achState(rec,threshold){
  if(!rec||typeof rec.complete!=='boolean'||!float32(rec.current)||!OWN(rec,'completed'))return 'INVALID_ACHIEVEMENT_STATE';
  if(rec.complete){
    if(rec.current<threshold)return 'COMPLETED_PROGRESS_BELOW_THRESHOLD';
    const date=inspectAchievementTimestamp100ns(rec.completed);if(!date.valid||rec.completed===null)return 'COMPLETED_TIMESTAMP_INVALID_OR_UNSET';
  }else{
    if(rec.current>=threshold)return 'INCOMPLETE_PROGRESS_REACHED_THRESHOLD';
    if(rec.completed!==null)return 'INCOMPLETE_TIMESTAMP_NOT_NIL';
  }
  return null;
}
function add(list,file,model,entry,record,field,before,after){
  if(before!==after)list.push({file,model,source_key:entry.key,source_guid:record.guid,document_id:record.id,
    field,before,after,identity_verified:'SAVED_GUID_AND_DOCUMENT_ID_ONLY',
    raw_timestamp_provenance_required:field==='CompletedTime',apply_authorized:false});
}
function assertAccountRoot(account,root,completedGroups){
  if(!account||typeof account!=='object'||Array.isArray(account)||
      !account.Achievements||!account.Counters||Array.isArray(account.Achievements)||Array.isArray(account.Counters))return 'ACCOUNT_ROOT_STORE_MISSING';
  const aKeys=Object.keys(account.Achievements).map(canonical),cKeys=Object.keys(account.Counters).map(canonical);
  if(new Set(aKeys).size!==aKeys.length||new Set(cKeys).size!==cKeys.length)return 'ACCOUNT_CASE_INSENSITIVE_DUPLICATE_GUID';
  const a=account.Achievements[root.guid],c=account.Counters[root.counter_guid];
  if(!a||!c)return 'ACCOUNT_META_ROOT_ABSENT';
  if(OWN(c,'CountedGuids')&&(!Array.isArray(c.CountedGuids)||c.CountedGuids.length>0))return 'ACCOUNT_ROOT_COUNTED_GUIDS_UNVERIFIED';
  if(OWN(c,'CountedValues')&&c.CountedValues!==null)return 'ACCOUNT_ROOT_LEGACY_COUNTED_VALUES_UNVERIFIED';
  if(a.IsComplete!==false||a.CompletedTime!==null||!Number.isSafeInteger(a.CurrentValue)||
      !Number.isSafeInteger(c.CurrentValue)||a.CurrentValue!==completedGroups||c.CurrentValue!==completedGroups)
    return 'ACCOUNT_ROOT_INCONSISTENT_OR_COMPLETE';
  return null;
}
   
                                                                                              
                                                                                                     
                                                                                
   
export function inspectAchievementGroupDraft(catalog,snapshot,account,request={},linkage={}){
  if(catalog?.schema!=='HKIA.AchievementSemanticCatalog.1'||catalog.families?.length!==63)return fail('CATALOG_NOT_PINNED');
  if(!['3.0.0','3.0.1'].includes(snapshot?.version))return fail('SAVE_VERSION_NOT_VERIFIED');
                                                                                          
  if(linkage?.contract!=='HKIA.LINKAGE.DELTA.20261111.1'||linkage?.source?.sha256!==SOURCE_SHA||
      !Array.isArray(linkage.newRequiredEdges)||linkage.newRequiredEdges.length!==0||
      linkage.autoApply!==false||linkage.writerEnabled!==false)
    return fail('LINKAGE_POLICY_UNVERIFIED_OR_WRITER_ENABLED');
  const reqKeys=new Set(['groupKey','desiredGroupProgress','groupCompletedAt','edits']);
  if(!request||Object.keys(request).some(k=>!reqKeys.has(k)))return fail('UNEXPECTED_GROUP_REQUEST_FIELD');
  const family=catalog.families.find(f=>f.key===request.groupKey),group=catalog.lookup.byKey.get(request.groupKey);
  if(!family||!group||group.rule!=='GROUP_REFERENCES')return fail('UNKNOWN_OR_NON_GROUP_SOURCE_KEY');
  if(family.required_dlc_nonzero||group.required_dlc_nonzero||group.event_year||group.event_path_id)
    return fail('GROUP_DLC_OR_EVENT_GATE_UNVERIFIED');
  if(!Number.isSafeInteger(request.desiredGroupProgress)||request.desiredGroupProgress<0||request.desiredGroupProgress>family.required_count)
    return fail('INVALID_TARGET_GROUP_PROGRESS');
  if(!Array.isArray(request.edits)||request.edits.length<1||request.edits.length>family.required_count)
    return fail('EXPLICIT_MEMBER_EDITS_REQUIRED');
  const A=index(snapshot.achievements),C=index(snapshot.counters);
  if(A.error||C.error)return fail(A.error||C.error);
  const parentA=A.byGuid.get(canonical(group.save_guid)),parentC=C.byGuid.get(canonical(group.counter_save_guid));
  if(!parentA||!parentC)return fail('GROUP_PARENT_OR_COUNTER_NOT_PERSISTED');
  const members=family.member_guids.map(g=>catalog.lookup.byGuid.get(g)), saved=members.map(e=>A.byGuid.get(canonical(e.save_guid)));
  if(saved.some(x=>!x))return fail('GROUP_MEMBER_NOT_PERSISTED');
  for(let i=0;i<members.length;i++){
    const err=achState(saved[i],members[i].configured_threshold);if(err)return fail('GROUP_MEMBER_'+err,{member:members[i].key});
  }
  const before=saved.filter(x=>x.complete).length;
  const e=achState(parentA,family.required_count);if(e)return fail('GROUP_PARENT_'+e);
  const parentHist=inspectCountedHistoryForScalarDraft(parentC);
  if(!parentHist.safe)return fail('GROUP_PARENT_'+parentHist.reason);
  if(parentA.current!==before||parentC.current!==before||parentA.complete!==(before===family.required_count))
    return fail('GROUP_STORED_PROGRESS_DIVERGED');
  let rootCompleted=0,missing=0;
  for(const f of catalog.families){
    const r=A.byGuid.get(canonical(f.save_guid));if(!r){missing++;continue;}
    const sourceGroup=catalog.lookup.byKey.get(f.key);
    const err=achState(r,f.required_count);
    if(err)return fail('ROOT_MEMBER_'+err,{member:sourceGroup.key});
    if(r.complete)rootCompleted++;
  }
  const rootErr=assertAccountRoot(account,catalog.root,rootCompleted);
  if(rootErr)return fail(rootErr);
  const changes=[],used=new Set(),projected=saved.map(x=>x.complete);
  for(const [i,change] of request.edits.entries()){
    if(!change||typeof change!=='object'||Array.isArray(change)||
        Object.keys(change).some(k=>!['key','complete','progress','completedAt'].includes(k)))return fail('INVALID_CHILD_EDIT_SHAPE');
    if(typeof change.key!=='string'||used.has(change.key))return fail('DUPLICATE_OR_INVALID_CHILD_KEY');
    used.add(change.key);
    const j=members.findIndex(e=>e.key===change.key);if(j<0)return fail('CHILD_NOT_IN_GROUP');
    const leaf=members[j],original=saved[j];
    if(leaf.rule!=='MANUAL_INCREMENT'||leaf.counter_storage!=='InGame'||!leaf.counter_enabled||
        leaf.own_counter_state==='UNIQUE_TRACKING'||leaf.required_dlc_nonzero||leaf.event_year||leaf.event_path_id)
      return fail('CHILD_DERIVED_OR_UNVERIFIED_GATE',{member:leaf.key});
    const counter=C.byGuid.get(canonical(leaf.counter_save_guid));
    if(!counter)return fail('CHILD_COUNTER_MISSING',{member:leaf.key});
    const history=inspectCountedHistoryForScalarDraft(counter);
    if(!history.safe)return fail('CHILD_'+history.reason,{member:leaf.key});
    if(counter.current!==original.current)return fail('CHILD_COUNTER_PROGRESS_DIVERGED',{member:leaf.key});
    if(typeof change.complete!=='boolean')return fail('CHILD_COMPLETE_BOOL_REQUIRED');
    let nextProgress,nextTime;
    if(change.complete){
      if(OWN(change,'progress')&&change.progress!==leaf.configured_threshold)return fail('COMPLETED_PROGRESS_MUST_MATCH_SOURCE_THRESHOLD');
      nextProgress=leaf.configured_threshold;
      nextTime=original.complete?original.completed:change.completedAt;
      if(!original.complete&&!inspectAchievementTimestamp100ns(change.completedAt).valid)return fail('CHILD_EXPLICIT_COMPLETION_TIMESTAMP_REQUIRED');
      if(!original.complete&&change.completedAt===null)return fail('CHILD_COMPLETION_TIMESTAMP_CANNOT_BE_NIL');
      if(original.complete&&OWN(change,'completedAt')&&change.completedAt!==original.completed)return fail('TIMESTAMP_ONLY_EDIT_REQUIRES_SEPARATE_DRAFT');
    }else{
      if(!float32(change.progress)||change.progress>=leaf.configured_threshold)return fail('CHILD_EXPLICIT_BELOW_THRESHOLD_PROGRESS_REQUIRED');
      nextProgress=change.progress;nextTime=null;
      if(OWN(change,'completedAt')&&change.completedAt!==null)return fail('INCOMPLETE_TIMESTAMP_MUST_BE_NIL');
    }
    projected[j]=change.complete;
    add(changes,SLOT,'AchievementModel',leaf,original,'IsComplete',original.complete,change.complete);
    add(changes,SLOT,'AchievementModel',leaf,original,'CurrentValue',original.current,nextProgress);
    add(changes,SLOT,'AchievementModel',leaf,original,'CompletedTime',original.completed,nextTime);
    add(changes,SLOT,'GameCounterModel',leaf,counter,'CurrentValue',counter.current,nextProgress);
  }
  const after=projected.filter(Boolean).length;
  if(after!==request.desiredGroupProgress)return fail('EXPLICIT_MEMBERS_DO_NOT_MATCH_TARGET_GROUP_PROGRESS',
    {observed_group:before,computed_group:after,requested_group:request.desiredGroupProgress});
  const beforeComplete=before===family.required_count,afterComplete=after===family.required_count;
  if(!beforeComplete&&afterComplete){
    const t=inspectAchievementTimestamp100ns(request.groupCompletedAt);
    if(!t.valid||request.groupCompletedAt===null)return fail('EXPLICIT_PARENT_COMPLETION_TIMESTAMP_REQUIRED');
  }else if(OWN(request,'groupCompletedAt'))return fail('GROUP_TIMESTAMP_NOT_APPLICABLE_TO_THIS_TRANSITION');
  const groupAfterTime=afterComplete?(beforeComplete?parentA.completed:request.groupCompletedAt):null;
  add(changes,SLOT,'AchievementModel',group,parentA,'IsComplete',parentA.complete,afterComplete);
  add(changes,SLOT,'AchievementModel',group,parentA,'CurrentValue',parentA.current,after);
  add(changes,SLOT,'AchievementModel',group,parentA,'CompletedTime',parentA.completed,groupAfterTime);
  add(changes,SLOT,'GameCounterModel',group,parentC,'CurrentValue',parentC.current,after);
  const rootAfter=rootCompleted+Number(afterComplete)-Number(beforeComplete);
  if(rootAfter>=catalog.root.source_reference_count)return fail('META_ROOT_COMPLETION_EDGE_UNPROVEN');
  if(rootAfter!==rootCompleted){
    const a=account.Achievements[catalog.root.guid],c=account.Counters[catalog.root.counter_guid];
    changes.push({file:ACCOUNT,model:'Achievement',source_key:catalog.root.key,source_guid:catalog.root.guid,
      field:'CurrentValue',before:a.CurrentValue,after:rootAfter,apply_authorized:false});
    changes.push({file:ACCOUNT,model:'Counter',source_key:catalog.root.key,source_guid:catalog.root.counter_guid,
      field:'CurrentValue',before:c.CurrentValue,after:rootAfter,apply_authorized:false});
  }
  if(!changes.length)return result('NO_OP',{group_key:group.key,before,after,root_before:rootCompleted,root_after:rootAfter,
    dependency:'INDEPENDENT_NO_CHANGE',warnings:warned});
  return result('DRAFT_GROUP_BATCH',{group_key:group.key,before,after,root_before:rootCompleted,root_after:rootAfter,
    saved_root_group_count:63-missing,missing_root_group_count:missing,
    changes,linked_field_counts:{slot:changes.filter(x=>x.file===SLOT).length,account:changes.filter(x=>x.file===ACCOUNT).length},
    dependency:'RELATED_UNVERIFIED',warnings:[...warned,'EXPLICIT_CHILD_IDS_REQUIRED','PARENT_COMPLETION_TIME_USER_SUPPLIED',
    'SOURCE_DOCUMENT_ID_BINDING_NOT_INDEPENDENTLY_VERIFIED']});
}

                                                                                               
export function inspectAchievementEditStrictV3(catalog,snapshot,account,request={},linkage={}){
  const v2=inspectAchievementEditRequest(catalog,snapshot,account,request);
  if(v2.status==='BLOCKED'||v2.status==='NO_OP'||request.scope==='Account')return {...v2,
    policy_revision:3,writer_enabled:false,export_enabled:false};
  const entry=catalog.entries.find(e=>canonical(e.save_guid)===canonical(request.guid));
  if(!entry){return {...v2,policy_revision:3,writer_enabled:false,export_enabled:false,
    warnings:[...(v2.warnings||[]),'UNKNOWN_SOURCE_GUID_DEPENDENCIES_UNVERIFIED','RAW_TIMESTAMP_PRECISION_UNVERIFIED']};}
  if(entry.rule!=='MANUAL_INCREMENT'||!['SET_PROGRESS','SET_COMPLETE'].includes(request.mode))return {...v2,
    policy_revision:3,writer_enabled:false,export_enabled:false};
  if(linkage?.contract!=='HKIA.LINKAGE.DELTA.20261111.1'||linkage?.source?.sha256!==SOURCE_SHA||
      !Array.isArray(linkage.newRequiredEdges)||linkage.newRequiredEdges.length||linkage.autoApply!==false||linkage.writerEnabled!==false)
    return fail('LINKAGE_DELTA_NOT_SAFE');
  const A=index(snapshot?.achievements);if(A.error)return fail(A.error);
  const old=A.byGuid.get(canonical(entry.save_guid));if(!old)return fail('TARGET_NOT_SAVED');
                                                                                                      
  if(request.mode==='SET_PROGRESS'&&old.complete)return {...v2,policy_revision:3};
  if(request.mode==='SET_COMPLETE'&&request.complete===old.complete)return {...v2,policy_revision:3};
  const complete=request.mode==='SET_COMPLETE'?request.complete:old.complete;
  const child={key:entry.key,complete};
  if(complete&&!old.complete)child.completedAt=request.timestamp;
  else if(!complete)child.progress=request.progress;
  const family=catalog.families.find(f=>f.key===entry.parent_key);
  if(!family)return fail('MISSING_PARENT_FAMILY');
  const A2=A.byGuid,oldCompleteCount=family.member_guids.filter(g=>A2.get(canonical(catalog.lookup.byGuid.get(g).save_guid))?.complete).length;
  const count=oldCompleteCount+Number(complete)-Number(old.complete);
  const parentCompletionAt=count===family.required_count&&oldCompleteCount!==family.required_count?request.timestamp:undefined;
  const draft=inspectAchievementGroupDraft(catalog,snapshot,account,{groupKey:family.key,desiredGroupProgress:count,
    ...(parentCompletionAt===undefined?{}:{groupCompletedAt:parentCompletionAt}),edits:[child]},linkage);
  if(draft.status==='BLOCKED')return {...draft,policy_revision:3};
                                                                                                
  const trustedPuzzle=v2.linkage_classification==='PUZZLE_CONDITIONAL_REQUIRED_STATIC'&&
    v2.status==='DRAFT_FAMILY_TRANSITION'&&draft.linked_field_counts?.slot===8&&draft.linked_field_counts?.account===2;
  return {...draft,policy_revision:3,dependency:trustedPuzzle?'PUZZLE_CONDITIONAL_REQUIRED_STATIC':'RELATED_UNVERIFIED',
    warnings:trustedPuzzle?[...draft.warnings,'03_STATIC_REQUIRED_NOT_NATIVE_WRITABLE']:draft.warnings};
}

                                                                                              
export function inspectUnknownAchievementDraftV3(catalog,snapshot,account,request){
  const view=describeSavedAchievement(catalog,snapshot,account,{scope:request?.scope||'InGame',guid:request?.guid});
  if(view.status==='BLOCKED')return view;
  if(view.source_key!==null)return fail('KNOWN_GUID_USE_TYPED_POLICY');
  const draft=inspectAchievementEditRequest(catalog,snapshot,account,request);
  if(draft.status==='BLOCKED')return draft;
  return {...draft,policy_revision:3,writer_enabled:false,export_enabled:false,
    warnings:[...(draft.warnings||[]),'UNKNOWN_GUID_NO_THRESHOLD_SOURCE','PRESERVE_UNKNOWN_TOKENS',
      'RAW_TIMESTAMP_PRECISION_UNVERIFIED','NO_COUNTER_OR_GROUP_SYNTHESIS']};
}
export const ACHIEVEMENT_WRITER_ENABLED=false;
