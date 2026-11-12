                                                                           
export const BASE_V20='33ece2e6eb8347eec1d254b73bcd21da57b88023ff19cde9f786e68621ac298d';
const safe=n=>Number.isSafeInteger(n)&&n>=0&&n<=16777216;
const base=()=>({applyAuthorized:false,writerEnabled:false,gameAccepted:false,actualScheduling:'UNKNOWN',finalSaveObserved:false,requiredWrites:[],autoApply:false});
const unknown=reason=>({...base(),status:'UNKNOWN',reason});
                                                                      
                                                                                              
                                                                                        
export function inspectAlwaysRunModel(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||input.version!=='3.0.1'||input.store!=='Slot')return unknown('UNVERIFIED_VERSION_OR_STORE');
 const {kind,lookup,threshold,progress,complete,completeTimePresent,counterCurrent,groupMemberFlags}=input;
 if(lookup==='NATIVE_LOOKUP_MISS')return {...base(),status:'CONDITIONAL_DELETE_REQUEST',classification:'RELATED',model:'AchievementModel',preserveEditorRecord:true,warning:'GAME_MAY_DELETE_IF_NATIVE_RUNTIME_LOOKUP_FAILS'};
 if(lookup!=='RESOLVED_SINGLE_CONDITION'||!safe(threshold)||threshold===0||!safe(progress)||typeof complete!=='boolean'||typeof completeTimePresent!=='boolean'||!safe(counterCurrent))return unknown('UNVERIFIED_CONDITION_OR_FIELD');
 if(kind!=='SINGLE_NON_GROUP'&&kind!=='SINGLE_GROUP')return unknown('UNVERIFIED_COUNTER_KIND');
 let nextCounter=counterCurrent,nextProgress,nextComplete,timeAction;
 if(kind==='SINGLE_GROUP'){
  if(threshold>10000||counterCurrent>10000)return unknown('GROUP_FLOAT_TOLERANCE_OUTSIDE_PINNED_SLICE');
  if(!Array.isArray(groupMemberFlags)||groupMemberFlags.length!==threshold||groupMemberFlags.some(x=>typeof x!=='boolean'))return unknown('COMPLETE_MEMBER_WITNESS_REQUIRED');
  nextCounter=groupMemberFlags.filter(Boolean).length;nextProgress=Math.min(nextCounter,threshold);nextComplete=nextCounter>=threshold;
 }else{
  if(groupMemberFlags!==undefined)return unknown('UNEXPECTED_GROUP_MEMBERS');
  if(complete){return {...base(),status:'STATIC_MODEL_PREDICTION',classification:'RELATED',nextCounter,nextProgress:threshold,nextComplete:true,timeAction:'PRESERVE',counterWrite:false,achievementFields:['CurrentValue'],normalLoadDistinct:true};}
  nextProgress=Math.min(counterCurrent,threshold);nextComplete=counterCurrent>=threshold;
 }
 timeAction=nextComplete?(complete&&completeTimePresent?'PRESERVE':'SET_MIGRATION_UTC_NOW'):'CLEAR_NULL';
 return {...base(),status:'STATIC_MODEL_PREDICTION',classification:'RELATED',nextCounter,nextProgress,nextComplete,timeAction,counterWrite:kind==='SINGLE_GROUP'&&nextCounter!==counterCurrent,achievementFields:['CurrentValue','IsComplete','CompletedTime'],normalLoadDistinct:true};
}
                                                                               
                                                                                                  
export function assessAlwaysRunManualTarget(input){
 const r=inspectAlwaysRunModel(input);if(r.status!=='STATIC_MODEL_PREDICTION'||input.kind!=='SINGLE_NON_GROUP'||input.counterKind!=='GameCounterManualDefinition'||input.complete!==false||!safe(input.targetProgress)||input.targetProgress>=input.threshold||input.progress!==input.targetProgress)return unknown('OUTSIDE_EXACT_MANUAL_TARGET');
 const mismatch=r.nextProgress!==input.targetProgress;
 return {...r,status:'STATIC_MANUAL_TARGET',targetMatches:!mismatch,requiredWrites:mismatch?[{model:'GameCounterModel',field:'CurrentValue',classification:'REQUIRED',condition:'EXACT_INCOMPLETE_TARGET_IF_MIGRATION_RUNS_WITH_RESOLVED_SINGLE_MANUAL_CONDITION',reason:'migration reads counter and replaces progress in either direction'}]:[],targetCounterValue:input.targetProgress};
}
                                                                                     
export function inspectMigrationDefinitionRisk(input){
 if(input?.version!=='3.0.1'||input.store!=='Slot'||!['AchievementModel','GameCounterModel'].includes(input.model))return unknown('UNVERIFIED_SCOPE');
 return {...base(),status:input.nativeLookup==='MISS'?'CONDITIONAL_DELETE_REQUEST':'UNKNOWN',classification:input.nativeLookup==='MISS'?'RELATED':'UNKNOWN',model:input.model,preserveEditorRecord:true,warning:'OFFLINE_CATALOG_ABSENCE_IS_NOT_NATIVE_LOOKUP_MISS'};
}
