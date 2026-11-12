                                                                                 
export const NATIVE_WRITEPATH_SCHEMA = 'HKIA.LinkageNativeWritePathDelta.1';
export const NATIVE_WRITEPATH_SOURCE_SHA = '83580cee3e2effaee14780d921ba5621b1505774b6e0a349e8f08a61ec1c1a1a';
export const FROZEN_GRAPH = Object.freeze({edges:17284,sha256:'56d2c16c41f671419c7dcbfbbecf3444866c837b2e2ec7af2a1dee424f06165b',rebuild:false});
const empty = () => Object.freeze([]);
const freeze = obj => Object.freeze(obj);
function outcome(kind,classification,storageTarget,observedNativeRoute,warnings,blockers=[],targetIds=[]) {
 return freeze({schema:NATIVE_WRITEPATH_SCHEMA,kind,classification,storageTarget,
  observedNativeRoute:freeze([...observedNativeRoute]),targetIds:freeze([...targetIds]),
  warnings:freeze([...warnings]),blockers:freeze([...blockers]),
  requiredWrites:empty(),autoApply:false,applyAuthorized:false,writerEnabled:false,pagesEnabled:false,saveBytes:null});
}
                                                                           
export function classifyNativeSavePath({kind,storage,version='3.0.1',guidVerified=false,documentIdVerified=false}={}) {
 if (!['ACHIEVEMENT','COUNTER'].includes(kind)) throw new TypeError('invalid native persisted kind');
 if (!['Meta','InGame','UNKNOWN'].includes(storage)) throw new TypeError('invalid native persisted storage');
 const validVersion = version==='3.0.1';
 const saved = kind==='ACHIEVEMENT';
 const warnings=['GAME_RUNTIME_WRITE_PATH_ONLY_NOT_EXTERNAL_EDIT_APPROVAL'];
 const blockers=[];
 if (!validVersion) blockers.push('NATIVE_RVA_VERSION_NOT_VERIFIED');
 if (guidVerified!==true) blockers.push('SOURCE_GUID_PRECONDITION_UNVERIFIED');
 if (documentIdVerified!==true) blockers.push('SAVED_DOCUMENT_ID_UNVERIFIED');
 if (storage==='UNKNOWN') blockers.push('STORAGE_CLASS_UNVERIFIED');
 if (!validVersion||storage==='UNKNOWN') return outcome(kind,'UNKNOWN',null,[],warnings,blockers);
 if (storage==='Meta') return outcome(kind,'RELATED','SettingsAccount/settings.json',
  saved?['0x3838A80','0x3838AC0']:['0x383A690','0x383A6D0'],warnings,blockers);
 return outcome(kind,'RELATED','Saves/save_0.save',
  saved?['0x3838A80','0x3838D90','0x3E43610']:['0x383A690','0x383A9A0','0x3E43760'],warnings,blockers);
}
                                                                                           
export function assessLoadedAchievementRecount({version='3.0.1',isComplete,currentValue,computedValue,sourceCounterVerified=false}={}) {
 const blockers=[];
 if (version!=='3.0.1') blockers.push('NATIVE_RVA_VERSION_NOT_VERIFIED');
 if (typeof isComplete!=='boolean'||!Number.isFinite(currentValue)||!Number.isFinite(computedValue))blockers.push('PREIMAGE_MISSING_OR_INVALID');
 if (sourceCounterVerified!==true) blockers.push('COUNTER_SOURCE_UNVERIFIED');
 let candidate='UNDETERMINED';
 if (blockers.every(x=>!['NATIVE_RVA_VERSION_NOT_VERIFIED','PREIMAGE_MISSING_OR_INVALID'].includes(x))) {
  if(isComplete) candidate='COMPLETED_BRANCH_SKIPS_RECALC';
  else if(computedValue<=currentValue) candidate='NO_UPWARD_CHANGE_ON_THIS_PATH';
  else candidate='UPWARD_CANDIDATE_EPSILON_CHECK_UNVERIFIED';
 }
 return freeze({...outcome('ACHIEVEMENT_LOAD','RELATED',null,['0x72A9500','0x72AA5A0','0x72AA280'],
  ['NOT_A_PROOF_OF_GAME_RELOAD_ACCEPTANCE','NO_GENERIC_DECREMENT_RECOUNT','NO_REWARD_REPLAY_GUARANTEE'],blockers),candidate});
}
                                                                              
export function inspectAchievementRewardClaim({achievementDataKeys,completionCallbackObserved=false,hasVerifiedClaimLedger=false}={}) {
 const exactlyThree = Array.isArray(achievementDataKeys)&&achievementDataKeys.length===3&&
   achievementDataKeys.every((v,i)=>v===['IsComplete','CurrentValue','CompletedTime'][i]);
 return outcome('ACHIEVEMENT_REWARD_CLAIM','UNKNOWN',null,
  completionCallbackObserved?['0x72AF360','0x72AF490','0x72AF820']:[],
  ['ACHIEVEMENT_DATA_HAS_NO_CLAIM_FIELD','RUNTIME_REWARD_QUEUE_IS_NOT_CLAIM_LEDGER','REWARD_MANAGER_TRAIT_NOT_PROVEN_TO_BE_CLAIM_MARKER'],
  [...(exactlyThree?[]:['ACHIEVEMENT_DATA_SCHEMA_UNVERIFIED']),...(hasVerifiedClaimLedger?['CLAIM_LEDGER_LINKAGE_STILL_NOT_CROSS_VERIFIED']:['CLAIM_LEDGER_NOT_IDENTIFIED'])]);
}
                                                                                
export function inspectMissionCounterLink({version='3.0.1',achievementKey,sourceAchievementGuid,
 sourceCounterGuid,sourceCounterKind,missionAssetGuid=null,missionDocumentId=null}={}) {
 const id = 'achievement_bringingTheBandBack';
 const eligible=version==='3.0.1' && achievementKey===id&&
  sourceAchievementGuid==='2247668b102553140a96cafe03eb600e'&&
  sourceCounterGuid==='925536a9fa5214642bb8b10ce062975c'&&
  sourceCounterKind==='GameCounterMissionDefinition';
 if(!eligible) return outcome('MISSION_COUNTER','UNKNOWN',null,[],
   ['NAME_SIMILARITY_IS_NOT_EVIDENCE'],['NO_EXACT_SOURCE_COUNTER_BINDING']);
 const linked=typeof missionAssetGuid==='string'&&missionAssetGuid.length>0&&
  typeof missionDocumentId==='string'&&missionDocumentId.length>0;
 return outcome('MISSION_COUNTER',linked?'RELATED':'RELATED',
  'Saves/save_0.save', ['0x2FEF3D0','0x2FEF140'],
  ['MISSION_COMPLETION_TO_COUNTER_RUNTIME_PATH','MISSION_TO_ACHIEVEMENT_PERSISTENCE_DEPENDENCY_UNKNOWN'],
  ['MISSION_ASSET_GUID_TO_SAVE_DOCUMENT_UNVERIFIED'],
  [id,'2247668b102553140a96cafe03eb600e','925536a9fa5214642bb8b10ce062975c']);
}
export function inspectCollectionInventoryDirection({historyAdded,inventoryNewId,quantityChangedForSameId}={}){
 if([historyAdded,inventoryNewId,quantityChangedForSameId].some(v=>typeof v!=='boolean'))
  return outcome('COLLECTION_INVENTORY','UNKNOWN',null,[],[],['DIFF_PREIMAGE_UNVERIFIED']);
 return outcome('COLLECTION_INVENTORY','RELATED',null,['0x3A9BE8C','0x3A9C13C','0x3A9C1F0','0x3AA24C0'],
  ['INVENTORY_EVENT_TO_COLLECTION_RUNTIME_PATH','NO_COLLECTION_TO_INVENTORY_REVERSE_WRITE_PROOF',
   ...(historyAdded&&!inventoryNewId&&!quantityChangedForSameId?['HISTORY_BACKFILL_WITHOUT_INVENTORY_NEW_OWNERSHIP_OBSERVED']:[])],
  ['COLLECTION_EVENT_PERSISTED_WRITE_CONDITION_NOT_PROVEN']);
}
export const FORBIDDEN_AUTOWRITES = freeze(['Quest','Unlock','RewardClaim','Cache','Inventory','Group','Meta','CountedGuids','CountedValues']);

                                                                                    
                                                                                
export function resolveMissionSourceBinding(crosswalk,{counterSourceGuid,missionSourceGuid=null,version='3.0.1'}={}) {
 const valid= crosswalk?.schema==='HKIA.LinkageMissionDefinitionToCounterDelta.1' &&
   crosswalk?.source?.definitionsSHA256==='ba9f3f97d1598a6923d2f804a704ab356c33866aa2d5f03bf11003735419e9e0' &&
   crosswalk?.counts?.sourceMissionCounterLinks===171 && Array.isArray(crosswalk.bindings) && crosswalk.bindings.length===171;
 if(!valid||version!=='3.0.1'||typeof counterSourceGuid!=='string')
  return outcome('MISSION_SOURCE_BINDING','UNKNOWN',null,[],[],['SOURCE_CROSSWALK_UNVERIFIED']);
 const rows=crosswalk.bindings.filter(row=>row.counterSourceGuid===counterSourceGuid);
 if(rows.length!==1 || rows[0].sourceCounterKind!=='GameCounterMissionDefinition' ||
    (missionSourceGuid!==null && rows[0].missionSourceGuid!==missionSourceGuid))
  return outcome('MISSION_SOURCE_BINDING','UNKNOWN',null,[],[],['MISSION_SOURCE_ID_NOT_VERIFIED']);
 const row=rows[0];
 return outcome('MISSION_SOURCE_BINDING','RELATED',null,['0x2FEF3D0','0x2FEF140'],
    ['MISSION_COUNTER_SOURCE_DEFINITION_MATCHED','PERSISTED_MISSION_RECORD_MAY_BE_ABSENT',
     'QUEST_AND_ACHIEVEMENT_WRITE_REQUIREMENT_UNKNOWN'],
    ['NO_MUTATION_CONTRACT_FOR_MISSION_DATABASE'],
    [row.counterSourceGuid,row.missionSourceGuid,...(row.achievementKey?[row.achievementKey]:[])]);
}
