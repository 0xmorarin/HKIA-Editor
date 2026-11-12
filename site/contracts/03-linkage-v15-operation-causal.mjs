                                                                              
                                                                           
                                                                            
                                                                           
   
import {inspectAchievementTimestamp100ns as time,inspectCompletedTimeRawPrecision as rawTime,inspectCountedHistoryForScalarDraft as scalar} from '../scripts/research/achievement-group-edit-v3.mjs';
import {inspectGeneralAchievementMutation} from '../scripts/research/achievement-mutation-coverage-v14.mjs';
import {planCollectionMembershipResearch} from '../scripts/research/01-collection-add-remove-contract.mjs';
export const SOURCE_SHA='da13fd74de031c45eb6463b36a421be4e06fdb095025125ce6af63e30f94afe3';
export const SCHEMA='HKIA.03.V15.OperationCausal.1';
                                                                                 
const identities=Object.freeze({
 achievement_100Fwishes:['3bede1968044347f684570797235c796','ddbbf906d849a46ebbea196535d28384','691edeb3:f7434408:97075486:697c5327','609fbbdd:e64a948d:5691aebb:48382d53',100,'collection_fwishingGoals'],
 achievement_beginningCreator:['b3d02c52568fec84eb7b6c0bf1b52c8a','53fbce6be84f501478aae2a7ca921554','25c20d3b:48cef865:b0c6b7be:a8c25b1f','b6ecbf35:4105f48e:7a2eaa87:455129ac',5,'collection_creationStation'],
 achievement_masterCreator:['56122bd199acddd44b6f7a13f953172e','89d667351fa67234388716ec724aab0d','1db22165:4dddca99:31a7f6b4:e271359f','53766d98:43276af1:ce617883:d0baa427',100,'collection_creationStation'],
 achievement_beginningBaker:['56bdf56e11f454a9d821d773daa69c61','2d04f188f4a4b432e8b15b18ff2ba2fd','e65fdb65:9a454f11:377d128d:16c96aad','881f40d2:234b4a4f:81b51b8e:df2ab2ff',3,'collection_chef']
});
const exact=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&Math.fround(x)===x;
const below=(p,t)=>exact(p)&&p<t&&t-p>2e-6*t;
const explicitTime=x=>typeof x==='string'&&time(x).valid;
const guards={schema:SCHEMA,sourceSha256:SOURCE_SHA,writerEnabled:false,applyAuthorized:false,canExport:false,gameAccepted:false,pagesEnabled:false,requiredGraphEdges:Object.freeze([]),nativeAuthVerified:false};
const block=reason=>({...guards,status:'BLOCKED',reason,atomicFields:[],causalRequired:[],related:[],warnings:[]});
const own=(x,k)=>Object.hasOwn(x,k);
const field=(tag,row,name,expected,next)=>({model:tag===16?'AchievementModel':'GameCounterModel',guid:row.guid,documentId:row.id,field:name,expected,next});
function identity(catalog,request){
 if(!catalog||catalog.schema!=='HKIA.AchievementSemanticCatalog.1'||catalog.lookup?.byKey?.size!==820||!Array.isArray(catalog.account)||catalog.account.length!==31)return null;
 const k=request.key;if(!own(identities,k))return null;const e=catalog.lookup.byKey.get(k),i=identities[k];
 if(!e||[e.guid,e.counter_guid,e.save_guid,e.counter_save_guid,e.configured_threshold,e.parent_key].some((x,n)=>x!==i[n]))return null;
 if(e.rule!=='MANUAL_INCREMENT'||e.counter_kind!=='GameCounterManualDefinition'||e.counter_storage!=='InGame'||!e.counter_enabled||e.own_counter_state==='UNIQUE_TRACKING'||e.required_dlc_nonzero||e.event_year||e.event_path_id)return null;
 if(catalog.account.some(a=>a.counter_guid===e.counter_guid)||[...catalog.lookup.byKey.values()].filter(a=>a.counter_guid===e.counter_guid).length!==1)return null;
 return e;
}
function row(snapshot,tag,guid){
 const a=(tag===16?snapshot.achievements:snapshot.counters);if(!Array.isArray(a))return null;
 const matches=a.filter(x=>x.guid===guid);if(matches.length!==1)return null;const r=matches[0];
 if(!Number.isSafeInteger(r.id)||r.id<0||a.filter(x=>x.id===r.id).length!==1)return null;
 const m=snapshot.models.get(`${tag}/${guid}`);if(!m||m.tag!==tag||m.id!==r.id||m.guid!==guid||m.spans?.length!==3)return null;
 if(tag===16){if(m.spans[0].value!==r.complete||m.spans[1].value!==r.current||!rawTime({completed:r.completed,rawTimestamp:m.spans[2].value}).safe)return null;}
 else if(m.spans[0].value!==r.current||m.spans[1].value!==null||!Array.isArray(m.spans[2].value)||m.spans[2].value.length!==0||!scalar(r).safe||!Array.isArray(r.countedGuidWords)||r.countedGuidWords.length!==0)return null;
 return r;
}
                                                                             
                                                                              
                                                                                
export function inspectCappedReload({version,threshold,savedComplete,savedProgress,counterValue}={}){
 if(!['3.0.0','3.0.1'].includes(version)||!exact(threshold)||threshold<=0||typeof savedComplete!=='boolean'||!exact(savedProgress)||!exact(counterValue))return {status:'UNKNOWN',reason:'INVALID_OR_UNSUPPORTED_STATE'};
 if(savedComplete)return {status:'COMPLETE_SKIP',normalizedProgress:threshold,calculated:Math.min(counterValue,threshold),nativeStatic:version==='3.0.1'};
 if(!below(savedProgress,threshold))return {status:'UNKNOWN',reason:'NEAR_OR_AT_THRESHOLD_FLAG_RECONSTRUCTION'};
 const c=Math.min(counterValue,threshold),gap=c-savedProgress;
 if(gap>2e-6*threshold)return {status:'UPWARD_RECOUNT',normalizedProgress:savedProgress,calculated:c,completes:c===threshold,nativeStatic:version==='3.0.1'};
 return {status:gap<=0?'NO_DOWNWARD_RECOUNT':'APPROXIMATE_BOUNDARY_UNKNOWN',normalizedProgress:savedProgress,calculated:c,nativeStatic:version==='3.0.1'};
}
                                                                                 
                                                                                 
export function inspectV15LeafCausal(catalog,snapshot,request){
 if(!request||typeof request!=='object'||Array.isArray(request)||Object.keys(request).some(k=>!['key','operation','progress','completedAt'].includes(k)))return block('INVALID_REQUEST');
 if(!['PROGRESS','COMPLETE','REVOKE','TIMESTAMP'].includes(request.operation))return block('UNKNOWN_OPERATION');
 if(!['3.0.0','3.0.1'].includes(snapshot?.version)||!snapshot.fullLogicalPayloadConsumed||!snapshot.typedDictionaryKeysVerified||!snapshot.typedDocumentIdsVerified||!(snapshot.models instanceof Map))return block('TYPED_READ_REQUIRED');
 const e=identity(catalog,request);if(!e)return block('OUTSIDE_PINNED_MANUAL_SCOPE_OR_SHARED_COUNTER');
 const a=row(snapshot,16,e.save_guid),t=e.configured_threshold;
                                                                             
 if(request.operation==='TIMESTAMP'){
  if(!a||a.complete!==true||a.current!==t||!explicitTime(a.completed)||!explicitTime(request.completedAt)||own(request,'progress'))return block('TIMESTAMP_INPUT');
  const fields=a.completed===request.completedAt?[]:[field(16,a,'CompletedTime',a.completed,request.completedAt)];
  return {...guards,status:fields.length?'RESEARCH_ONLY':'NO_OP',operation:'TIMESTAMP',version:snapshot.version,target:{sourceKey:e.key,achievementGuid:e.guid,counterGuid:e.counter_guid,saveGuid:e.save_guid,counterSaveGuid:e.counter_save_guid},atomicFields:fields,causalRequired:[],counterClassification:'INDEPENDENT_FOR_THIS_FIELD_PLAN',related:[],warnings:['NATIVE_GAME_ACCEPTANCE_UNVERIFIED','REWARD_QUEST_UNLOCK_CACHE_UNKNOWN'],preserve:['all counters','all ancestors','non-target fields','all other stores'],scope:'LEAF_TIMESTAMP_ONLY',gameplaySideEffects:'UNKNOWN'};
 }
 const c=row(snapshot,17,e.counter_save_guid);
 if(!a||!c||!exact(a.current)||!exact(c.current)||typeof a.complete!=='boolean')return block('IDENTITY_OR_SCALAR_HISTORY');
 if(a.complete?!(a.current===t&&c.current>=t&&explicitTime(a.completed)):!(below(a.current,t)&&a.current===c.current&&a.completed===null))return block('PREIMAGE_NOT_COHERENT');
 const op=request.operation;let p=a.current,f=a.complete,d=a.completed,cv=c.current;
 if(op==='PROGRESS'){if(a.complete||!below(request.progress,t)||own(request,'completedAt'))return block('PROGRESS_INPUT');p=cv=request.progress;}
 if(op==='COMPLETE'){if(a.complete||!explicitTime(request.completedAt)||own(request,'progress'))return block('COMPLETE_INPUT');f=true;p=cv=t;d=request.completedAt;}
 if(op==='REVOKE'){if(!a.complete||!below(request.progress,t)||own(request,'completedAt'))return block('REVOKE_INPUT');f=false;p=cv=request.progress;d=null;}
 const primary=[field(16,a,'IsComplete',a.complete,f),field(16,a,'CurrentValue',a.current,p),field(16,a,'CompletedTime',a.completed,d)].filter(x=>x.expected!==x.next);
 const counter=field(17,c,'CurrentValue',c.current,cv),changedCounter=counter.expected!==counter.next;
 const oldCounterReload=inspectCappedReload({version:snapshot.version,threshold:t,savedComplete:f,savedProgress:p,counterValue:c.current});
 const newCounterReload=inspectCappedReload({version:snapshot.version,threshold:t,savedComplete:f,savedProgress:p,counterValue:cv});
 const causal=changedCounter&&snapshot.version==='3.0.1'&&oldCounterReload.status==='UPWARD_RECOUNT';
 return {...guards,status:primary.length||changedCounter?'RESEARCH_ONLY':'NO_OP',operation:op,version:snapshot.version,target:{sourceKey:e.key,achievementGuid:e.guid,counterGuid:e.counter_guid,saveGuid:a.guid,counterSaveGuid:c.guid},
  atomicFields:[...primary,...(changedCounter?[counter]:[])],causalRequired:causal?[{...counter,classification:'REQUIRED',scope:'STATIC_RELOAD_TARGET',condition:'unchanged capped counter causes a definite upward recount of requested incomplete leaf',nativeRvas:['0x72AA664','0x72AA670','0x72A9554','0x72A95D8','0x72A9608','0x72AA43C','0x3838A80']}]:[],
  counterClassification:causal?'REQUIRED_STATIC_RELOAD_TARGET':'RELATED_EXACT_PAIR_POLICY',oldCounterReload,newCounterReload,
  related: f!==a.complete?['GROUP_COUNT','META_IF_PARENT_COMPLETION_FLIPS']:[],warnings:['NATIVE_GAME_ACCEPTANCE_UNVERIFIED','REWARD_QUEST_UNLOCK_CACHE_UNKNOWN',...(snapshot.version==='3.0.0'?['NATIVE_RVA_V301_ONLY']:[]),...(op==='COMPLETE'||op==='REVOKE'?['LEAF_ONLY_NOT_FAMILY_COHERENT','REWARD_REPLAY_UNKNOWN']:[])],
  preserve:['CountedValues','CountedGuids','non-target fields','all other stores'],scope:'LEAF_STATE_EXACT_PAIR',gameplaySideEffects:'UNKNOWN'};
}
                                                                              
                                                                                 
export function inspectV15FamilyCausal(catalog,snapshot,account,request,linkage){
 if(!request||!['COMPLETE','REVOKE'].includes(request.operation))return block('FAMILY_STATUS_TRANSITION_ONLY');
 const {groupCompletedAt,...leafReq}=request;const leaf=inspectV15LeafCausal(catalog,snapshot,leafReq);if(leaf.status!=='RESEARCH_ONLY')return block(leaf.reason??'LEAF_PREIMAGE');
 const d=inspectGeneralAchievementMutation(catalog,snapshot,account,request,linkage);if(d.status!=='RESEARCH_DRAFT')return block(d.reason??'FAMILY_DRAFT_REJECTED');
 const other=d.slotPlan.changes.filter(x=>x.guid!==leaf.target.saveGuid&&x.guid!==leaf.target.counterSaveGuid);
 if(leaf.atomicFields.some(x=>!d.slotPlan.changes.some(y=>x.guid===y.guid&&x.documentId===y.documentId&&x.field===y.field&&x.expected===y.expected&&x.next===y.next)))return block('LEAF_DRAFT_MISMATCH');
 return {...guards,status:'RESEARCH_ONLY',version:snapshot.version,operation:request.operation,scope:'EXPLICIT_FAMILY_COHERENT',target:leaf.target,atomicFields:d.slotPlan.changes,accountFields:d.accountChanges,
  causalRequired:leaf.causalRequired,related:['GROUP_SAVE_COUNTER_RECOUNT','META_ROOT_IF_PARENT_FLIPS'],familySnapshotRequired:[...other,...d.accountChanges],
  parentLinkage:'RELATED',metaLinkage:'RELATED',warnings:['FAMILY_AND_ROOT_TARGET_FIELDS_MUST_BE_ATOMIC','PARENT_ACHIEVEMENT_DECREASE_NOT_AUTOMATIC','GROUP_INIT_RECOUNT_CONDITIONAL','ACCOUNT_SLOT_JOINT_GENERIC_ZIP_UNVERIFIED','REWARD_QUEST_UNLOCK_CACHE_UNKNOWN','NATIVE_GAME_ACCEPTANCE_UNVERIFIED'],
  preserve:['non-target fields','CountedValues','CountedGuids'],gameplaySideEffects:'UNKNOWN'};
}
                                                                           
export function inspectV15CollectionCausal(evidence,request,options={}){
 try{const p=planCollectionMembershipResearch(evidence,request,options);if(!p.codecResearchEligible)return {...block('COLLECTION_RESEARCH_GATE'),blockers:p.blockers};
 return {...guards,status:'RESEARCH_ONLY',scope:'HISTORY_ONLY',operation:request.operation,itemId:request.itemId,plan:p,atomicFields:[],causalRequired:[],related:['INVENTORY_PREDICATE','PARENT_OR_CHILD_COLLECTION','UNLOCK_ACTIVE_PARTITION','RUNTIME_GROUP_AGGREGATE'],warnings:['HISTORY_NOT_GAMEPLAY_COLLECTED','OWNED_ITEM_MAY_BACKFILL_AFTER_REMOVE','INVENTORY_FALSE_MAY_HIDE_ADDED_HISTORY','KEY0_MIGRATION_PRESERVE','DLC_EVENT_ELIGIBILITY_UNKNOWN','NATIVE_GAME_ACCEPTANCE_UNVERIFIED'],preserve:['Key0','all non-target Key1 pairs','Inventory','other models'],gameplaySideEffects:'UNKNOWN'};
 }catch{return block('COLLECTION_RESEARCH_GATE');}
}
