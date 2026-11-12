/** 02-owned, V14 research-only adapter. No mutation, export, or Writer authorization.
 * Reuses v3 group/Meta validation; uses native capped achievement progress vs
 * cumulative Manual counter semantics. Exact old values remain in all CAS plans. */
import {inspectAchievementGroupDraft,inspectAchievementTimestamp100ns,inspectCompletedTimeRawPrecision,inspectCountedHistoryForScalarDraft} from './achievement-group-edit-v3.mjs';
const SLOT='Saves/save_0.save', ACCOUNT='SettingsAccount/settings.json';
const exact=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&Math.fround(x)===x;
// Native load uses an approximate threshold comparison; keep a conservative
// margin (2x observed relative coefficient), not a claim of exact Unity epsilon.
const safelyBelow=(x,t)=>exact(x)&&x<t&&(t-x)>2e-6*t;
const validTime=x=>x!==null&&inspectAchievementTimestamp100ns(x).valid;
const fail=reason=>({status:'BLOCKED',reason,changes:[],slotPlan:null,writerEnabled:false,applyAuthorized:false,rewardReceipt:'UNKNOWN'});
const base={schema:'HKIA.02.MutationCoverage.V14.1',writerEnabled:false,applyAuthorized:false,rewardReceipt:'UNKNOWN',gameAccepted:false};
/** Saved snapshot must come from V14 schema reader. Catalog is the existing
 * semantic catalog, not a user-generated crosswalk. Request is one explicit operation. */
export function inspectGeneralAchievementMutation(catalog,snapshot,account,request,linkage){
 if(!request||typeof request!=='object'||Array.isArray(request)||Object.keys(request).some(k=>!['key','operation','progress','completedAt','groupCompletedAt'].includes(k)))return fail('INVALID_REQUEST');
 if(!['COMPLETE','REVOKE','PROGRESS','TIMESTAMP'].includes(request.operation))return fail('UNKNOWN_OPERATION');
 if(!snapshot?.fullLogicalPayloadConsumed||!snapshot.typedDocumentIdsVerified||!snapshot.typedDictionaryKeysVerified||!(snapshot.models instanceof Map))return fail('V14_TYPED_READ_REQUIRED');
 const e=catalog?.lookup?.byKey?.get(request.key);if(!e)return fail('UNKNOWN_SOURCE_GUID_OR_KEY');
 if(e.parent_key==='collection_puzzle')return fail('EXISTING_PUZZLE_SCOPE_EXCLUDED');
 if(e.rule!=='MANUAL_INCREMENT'||e.counter_kind!=='GameCounterManualDefinition'||e.counter_storage!=='InGame'||!e.counter_enabled||e.own_counter_state==='UNIQUE_TRACKING'||e.required_dlc_nonzero||e.event_year||e.event_path_id)return fail('DERIVED_UNIQUE_OR_GATED_COUNTER');
 // The current single-counter catalog is accepted; do not infer account sharing by names.
 if(catalog.account?.some(a=>a.counter_guid===e.counter_guid))return fail('ACCOUNT_COUNTER_SHARED');
 if(!Array.isArray(catalog.account)||catalog.account.length!==31)return fail('ACCOUNT_SOURCE_CONTRACT_MISSING');
 const aa=snapshot.achievements.filter(x=>x.guid===e.save_guid),cc=snapshot.counters.filter(x=>x.guid===e.counter_save_guid);
 if(aa.length!==1||cc.length!==1)return fail('MISSING_OR_AMBIGUOUS_SAVED_PAIR');
 const a=aa[0],c=cc[0],t=e.configured_threshold;
 if(!exact(t)||t<=0||!exact(a.current)||!exact(c.current)||typeof a.complete!=='boolean')return fail('INVALID_SCALAR_STATE');
 if(!inspectCountedHistoryForScalarDraft(c).safe||!Array.isArray(c.countedGuidWords)||c.countedGuidWords.length!==0)return fail('COUNTED_HISTORY_OR_SHAPE');
 const model=snapshot.models.get('16/'+a.guid),cm=snapshot.models.get('17/'+c.guid);
 if(model?.id!==a.id||cm?.id!==c.id||model.spans?.length!==3||cm.spans?.length!==3||model.spans[0].value!==a.complete||model.spans[1].value!==a.current||cm.spans[0].value!==c.current||cm.spans[1].value!==null||!Array.isArray(cm.spans[2].value)||cm.spans[2].value.length!==0)return fail('TYPED_TOKEN_IDENTITY_MISMATCH');
 if(!inspectCompletedTimeRawPrecision({completed:a.completed,rawTimestamp:model.spans[2].value}).safe)return fail('RAW_TIMESTAMP_MISMATCH');
 if(a.complete?!(a.current===t&&c.current>=t&&validTime(a.completed)):!(safelyBelow(a.current,t)&&a.current===c.current&&a.completed===null))return fail('ACHIEVEMENT_COUNTER_STATE_INCONSISTENT');
 const group=catalog.families.find(f=>f.key===e.parent_key),p=group&&snapshot.achievements.find(x=>x.guid===group.save_guid);if(!group||!p)return fail('GROUP_MISSING');
 const op=request.operation;let nextComplete=a.complete,nextProgress=a.current,nextTime=a.completed;
 if(op==='COMPLETE'){if(a.complete||request.progress!==undefined||!validTime(request.completedAt))return fail('COMPLETE_REQUIRES_INCOMPLETE_AND_EXPLICIT_TIME');nextComplete=true;nextProgress=t;nextTime=request.completedAt;}
 if(op==='REVOKE'){if(!a.complete||!safelyBelow(request.progress,t)||request.completedAt!==undefined)return fail('REVOKE_REQUIRES_COMPLETE_AND_BELOW_THRESHOLD_PROGRESS');nextComplete=false;nextProgress=request.progress;nextTime=null;}
 if(op==='PROGRESS'){if(a.complete||!safelyBelow(request.progress,t)||request.completedAt!==undefined)return fail('PROGRESS_REQUIRES_INCOMPLETE_BELOW_THRESHOLD');nextProgress=request.progress;}
 if(op==='TIMESTAMP'){if(!a.complete||!validTime(request.completedAt)||request.progress!==undefined)return fail('TIME_REQUIRES_COMPLETE_AND_EXPLICIT_TIME');nextTime=request.completedAt;}
 const desired=p.current+Number(nextComplete)-Number(a.complete);
 // v3 verifies all group members + Account Meta root. Its legacy equal-counter
 // guard is evaluated against a *local virtual* capped value only for a valid
 // completed overflow; the actual original counter is retained for all CAS.
 const normalized=c.current===a.current?snapshot:{...snapshot,counters:snapshot.counters.map(x=>x===c?{...x,current:a.current}:x)};
 const edit={key:e.key,complete:nextComplete,progress:nextProgress,completedAt:op==='TIMESTAMP'?a.completed:nextTime};
 const req={groupKey:group.key,desiredGroupProgress:desired,edits:[edit]};
 if(request.groupCompletedAt!==undefined)req.groupCompletedAt=request.groupCompletedAt;
 const draft=inspectAchievementGroupDraft(catalog,normalized,account,req,linkage);
 if(!['DRAFT_GROUP_BATCH','NO_OP'].includes(draft.status))return fail(draft.reasons?.[0]??'V3_GROUP_GUARD');
 let changes=draft.changes.map(x=>({...x}));
 if(op==='TIMESTAMP'&&nextTime!==a.completed)changes.push({file:SLOT,model:'AchievementModel',source_key:e.key,source_guid:a.guid,document_id:a.id,field:'CompletedTime',before:a.completed,after:nextTime,apply_authorized:false});
 // Restore real old value only for the exact edited Counter; no artificial normalization is exported.
 for(const x of changes)if(x.file===SLOT&&x.model==='GameCounterModel'&&x.source_guid===c.guid&&x.document_id===c.id&&x.field==='CurrentValue')x.before=c.current;
 for(const x of changes)if(x.file===SLOT){const tag=x.model==='AchievementModel'?16:17;const m=snapshot.models.get(tag+'/'+x.source_guid);const k={IsComplete:0,CurrentValue:tag===16?1:0,CompletedTime:2}[x.field];if(!m||m.id!==x.document_id||k===undefined)return fail('CAS_DOCUMENT_BINDING');const old=m.spans[k]?.value;if(x.field==='CompletedTime'){if(!inspectCompletedTimeRawPrecision({completed:x.before,rawTimestamp:old}).safe)return fail('CAS_TIMESTAMP_BINDING');}else if(old!==x.before)return fail('CAS_VALUE_BINDING');}
 const slotChanges=changes.filter(x=>x.file===SLOT).map(x=>({model:x.model,documentId:x.document_id,guid:x.source_guid,field:x.field,expected:x.before,next:x.after}));
 const accountChanges=changes.filter(x=>x.file===ACCOUNT);
 return {...base,status:changes.length?'RESEARCH_DRAFT':'NO_OP',operation:op,target:{sourceKey:e.key,achievementGuid:e.guid,saveGuid:e.save_guid,counterGuid:e.counter_guid,counterSaveGuid:e.counter_save_guid},changes,slotPlan:{version:snapshot.version,changes:slotChanges},accountChanges,
 classification:{leafCounter:op==='TIMESTAMP'?'INDEPENDENT_FOR_THIS_FIELD_PLAN':'REQUIRED_STATIC_CONSISTENCY_CANDIDATE',group:nextComplete!==a.complete?'RELATED_STATIC_PLAN':'INDEPENDENT_FOR_THIS_FIELD_PLAN',meta:accountChanges.length?'RELATED_STATIC_PLAN':'NO_CHANGE_IN_PLAN',history:'PRESERVE',reward:'UNKNOWN',quest:'UNKNOWN'},
 warning:['NOT_PRODUCTION_AUTHORIZED','NO_NEW_03_REQUIRED_EDGE','REWARD_RECEIPT_AND_REPLAY_UNKNOWN','NO_NATIVE_GAME_ACCEPTANCE',...(c.current>a.current?['COMPLETED_COUNTER_OVERSHOOT_PRESERVED_UNLESS_EXPLICIT_REVOKE']:[])]};
}
