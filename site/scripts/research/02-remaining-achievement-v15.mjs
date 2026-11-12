                                                                                                         
import {inspectAchievementTimestamp100ns,inspectCompletedTimeRawPrecision} from './achievement-group-edit-v3.mjs';
const base={schema:'HKIA.02.Remaining.V15.1',writerEnabled:false,applyAuthorized:false,gameAccepted:false,rewardReceipt:'UNKNOWN'};
const blocked=reason=>({...base,status:'BLOCKED',reason,slotPlan:null,accountChanges:[]});
const f32=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&Math.fround(v)===v;
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const validGuidWords=w=>Array.isArray(w)&&w.length===4&&w.every(v=>Number.isInteger(v)&&v>=0&&v<=0xffffffff);
export function inspectCountedHistoryV15(c){
 if(!c||!f32(c.current)||!Object.hasOwn(c,'countedValues')||!Array.isArray(c.countedGuidWords)||!Number.isSafeInteger(c.countedGuids)||c.countedGuids!==c.countedGuidWords.length||!c.countedGuidWords.every(validGuidWords)||!(c.countedValues===null||Array.isArray(c.countedValues)&&c.countedValues.every(v=>typeof v==='string')))return {valid:false,reason:'HISTORY_SHAPE'};
 const n=new Set(c.countedGuidWords.map(w=>w.join(':'))).size;
 const legacy=c.countedValues===null?'NIL':c.countedValues.length?'NONEMPTY':'EMPTY';
 const kind=c.countedGuids?(legacy==='NIL'?'GUID_ONLY':'DUAL'):legacy==='NIL'?'NO_HISTORY': 'LEGACY_ONLY_OR_EMPTY';
 return {valid:true,kind,legacy,guidCount:c.countedGuids,distinctGuidCount:n,duplicates:n!==c.countedGuids,recountMatches:c.countedGuids>0?c.current===c.countedGuids:null,distinctMatches:n>0?c.current===n:null,scalarChangeAllowed:false,historyChangeAllowed:false,classification:'RELATED_PRESERVE_EXACTLY'};
}
                                                                                         
                                                                                                                  
export function inspectRemainingAchievementMutation(catalog,snapshot,request){
 if(!request||typeof request!=='object'||Array.isArray(request)||Object.keys(request).some(k=>!['key','operation','completedAt'].includes(k)))return blocked('REQUEST_SHAPE');
 const e=catalog?.lookup?.byKey?.get(request.key);
 if(catalog?.schema!=='HKIA.AchievementSemanticCatalog.1'||catalog.lookup?.byKey?.size!==820||!e)return blocked('SOURCE_CATALOG_OR_KEY');
 if(e.parent_key==='collection_puzzle'||e.rule==='GROUP_REFERENCES'||!(e.rule==='DERIVED_TRACKER'||e.rule==='MANUAL_INCREMENT'&&e.own_counter_state==='UNIQUE_TRACKING'))return blocked('EXISTING_OR_UNSUPPORTED_SCOPE');
 if(request.operation!=='TIMESTAMP')return blocked('DERIVED_OR_UNIQUE_STATE_MUTATION_UNPROVEN');
 if(e.required_dlc_nonzero||e.event_year||e.event_path_id||!e.counter_enabled||e.counter_storage!=='InGame')return blocked('DLC_EVENT_OR_COUNTER_GATE');
 if(!['3.0.0','3.0.1'].includes(snapshot?.version)||!snapshot.fullLogicalPayloadConsumed||!snapshot.typedDocumentIdsVerified||!snapshot.typedDictionaryKeysVerified||!(snapshot.models instanceof Map))return blocked('TYPED_SNAPSHOT_REQUIRED');
 const find=(rows,g)=>{const r=rows?.filter(x=>x.guid===g);return r?.length===1?r[0]:null;};
 const a=find(snapshot.achievements,e.save_guid),c=find(snapshot.counters,e.counter_save_guid),t=e.configured_threshold;
 if(!a||!c||!f32(t)||t<=0||a.complete!==true||a.current!==t||!f32(c.current))return blocked('SAVED_COMPLETE_STATE_OR_PAIR');
 const m=snapshot.models.get('16/'+a.guid),cm=snapshot.models.get('17/'+c.guid);
 if(m?.id!==a.id||cm?.id!==c.id||m.spans?.length!==3||cm.spans?.length!==3||m.spans[0].value!==true||m.spans[1].value!==a.current||cm.spans[0].value!==c.current||!eq(cm.spans[1].value,c.countedValues)||!eq(cm.spans[2].value,c.countedGuidWords))return blocked('TOKEN_BINDING');
 const h=inspectCountedHistoryV15(c);if(!h.valid||h.duplicates||h.kind==='DUAL'||h.legacy!=='NIL'||h.recountMatches===false)return blocked('AMBIGUOUS_OR_LEGACY_HISTORY');
 const old=inspectAchievementTimestamp100ns(a.completed),next=inspectAchievementTimestamp100ns(request.completedAt);
 if(!old.valid||a.completed===null||!next.valid||request.completedAt===null||!inspectCompletedTimeRawPrecision({completed:a.completed,rawTimestamp:m.spans[2].value}).safe)return blocked('TIMESTAMP_PRECISION');
                                                                            
 const g=catalog.families?.find(x=>x.key===e.parent_key);const ge=catalog.lookup.byKey.get(e.parent_key);const p=g&&find(snapshot.achievements,g.save_guid);
 if(!g||!ge||g.required_dlc_nonzero||ge.required_dlc_nonzero||ge.event_year||ge.event_path_id||!p||!g.member_guids?.includes(e.guid))return blocked('PARENT_UNKNOWN_OR_GATED');
 const pm=snapshot.models.get('16/'+p.guid);
 if(pm?.id!==p.id||pm.spans?.length!==3||pm.spans[0].value!==p.complete||pm.spans[1].value!==p.current||!Number.isSafeInteger(p.current)||p.current<0||typeof p.complete!=='boolean'||p.current>g.required_count||p.complete!==(p.current===g.required_count)||!inspectCompletedTimeRawPrecision({completed:p.completed,rawTimestamp:pm.spans[2].value}).safe||p.complete!==(p.completed!==null))return blocked('PARENT_STATE');
 if(p.complete){const pt=inspectAchievementTimestamp100ns(p.completed);if(BigInt(next.epochNanoseconds)>BigInt(pt.epochNanoseconds))return blocked('PARENT_CHRONOLOGY');}
 const changes=a.completed===request.completedAt?[]:[{model:'AchievementModel',documentId:a.id,guid:a.guid,field:'CompletedTime',expected:a.completed,next:request.completedAt}];
 return {...base,status:changes.length?'RESEARCH_DRAFT':'NO_OP',operation:'TIMESTAMP',target:{key:e.key,sourceGuid:e.guid,saveGuid:a.guid,counterGuid:e.counter_guid,counterSaveGuid:c.guid,kind:e.counter_kind},slotPlan:{version:snapshot.version,changes},accountChanges:[],history:h,classification:{timestamp:'PRIMARY_ONLY',counter:'PRESERVE',parent:'NO_CHANGE_IN_PLAN',meta:'NO_CHANGE_IN_PLAN',reward:'UNKNOWN',quest:'UNKNOWN'},warnings:['NO_COMPLETION_TRANSITION','NO_NATIVE_GAME_ACCEPTANCE','REWARD_CLAIM_UNKNOWN','DERIVED_VALUE_NOT_EDITED','FULL_SOURCE_REVISION_CAS_REQUIRED']};
}
