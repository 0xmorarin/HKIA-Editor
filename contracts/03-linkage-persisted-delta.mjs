   
                                                                              
                                                                                    
                                                                               
   
export const LINKAGE_PERSISTED_SCHEMA = 'HKIA.LinkagePersistedDelta.1';
export const LINKAGE_PERSISTED_GRAPH = Object.freeze({edgeCount:17284,sha256:'56d2c16c41f671419c7dcbfbbecf3444866c837b2e2ec7af2a1dee424f06165b',regenerated:false});
const statuses = new Set(['REQUIRED','RELATED','INDEPENDENT','UNKNOWN']);
const counterInts = (n) => Number.isSafeInteger(n) && n >= 0;
const freeze = a => Object.freeze(a);
const unique = a => freeze([...new Set(a)]);

function result(domain,classification,blockers,warnings,relatedFields=[]){
  if(!statuses.has(classification)) throw new Error('unknown linkage classification');
  return freeze({schema:LINKAGE_PERSISTED_SCHEMA,domain,classification,
    blockers:unique(blockers),warnings:unique(warnings),
    relatedFields:freeze([...relatedFields]),
    requiredWrites:freeze([]),autoApply:false,applyAuthorized:false,
    writerEnabled:false,pagesEnabled:false,saveBytes:null});
}

   
                                                                                        
                                                                                             
   
export function assessCounterLinkage({sourceOnlyCountUniques=null,savedCurrentValue,
  proposedCurrentValue, countedGuidsCount=null, countedValuesCount=null,
  countedGuidsState='UNKNOWN', countedValuesState='UNKNOWN',
  expectedSaveVersion=null,saveVersion=null}={}){
  const blockers=[],warnings=[];
  const states=['ABSENT','NULL','PRESENT','UNKNOWN'];
  if(!states.includes(countedGuidsState)||!states.includes(countedValuesState))
    throw new TypeError('invalid Counted field state');
  if(sourceOnlyCountUniques!==null&&typeof sourceOnlyCountUniques!=='boolean')
    throw new TypeError('OnlyCountUniques must be bool or null');
  const validCurrent = Number.isFinite(savedCurrentValue) && savedCurrentValue>=0;
  const validProposed=Number.isFinite(proposedCurrentValue) && proposedCurrentValue>=0;
  if(!validCurrent||!validProposed)blockers.push('INVALID_COUNTER_CURRENT_VALUE');
  if(expectedSaveVersion!==null&&saveVersion!==expectedSaveVersion)
    blockers.push('COUNTER_SAVE_VERSION_PRECONDITION_FAILED');
  if(countedGuidsState==='PRESENT'&&!counterInts(countedGuidsCount))
    blockers.push('INVALID_GUID_LIST_LENGTH');
  if(countedValuesState==='PRESENT'&&!counterInts(countedValuesCount))
    blockers.push('INVALID_LEGACY_LIST_LENGTH');
  if(countedGuidsState==='UNKNOWN'||countedValuesState==='UNKNOWN')
    blockers.push('COUNTED_HISTORY_STATE_UNKNOWN');
  const newValue=validCurrent&&validProposed&&savedCurrentValue!==proposedCurrentValue;
  const guidsPresent=countedGuidsState==='PRESENT'&&counterInts(countedGuidsCount)&&countedGuidsCount>0;
  const legacyPresent=countedValuesState==='PRESENT'&&counterInts(countedValuesCount)&&countedValuesCount>0;
  if(guidsPresent&&legacyPresent)blockers.push('DUAL_COUNTED_HISTORY_MIGRATION_UNPROVEN');
  if(sourceOnlyCountUniques===true&&countedGuidsState==='PRESENT'&&validCurrent&&
     savedCurrentValue!==countedGuidsCount)
    blockers.push('UNIQUE_COUNT_VALUE_PREIMAGE_MISMATCH');
  if(newValue&&(guidsPresent||legacyPresent))blockers.push('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE');
  if(newValue&&sourceOnlyCountUniques===true&&countedGuidsState==='PRESENT'&&countedGuidsCount===0)
    blockers.push('UNIQUE_COUNTER_HISTORY_CONSTRUCTION_UNVERIFIED');
  if(sourceOnlyCountUniques===null)warnings.push('SOURCE_COUNTER_UNIQUENESS_UNKNOWN');
  if(guidsPresent)warnings.push('NATIVE_LOAD_MAY_RECOUNT_FROM_GUID_HISTORY');
  if(legacyPresent)warnings.push('LEGACY_COUNTEDVALUES_MIGRATION_PATH');
  if(newValue)warnings.push('NO_NATIVE_ACCEPTED_COUNTER_WRITER');
  if(!newValue)warnings.push('NO_CHANGE_OR_NON_EDIT');
                                                                               
                                                                       
  return result('COUNTER','RELATED',blockers,warnings,
    ['GameCounterModel.CurrentValue','GameCounterModel.CountedGuids','GameCounterModel.CountedValues']);
}

                                                              
export function assessCollectionInventoryLinkage({operation,historyWasRecorded,
  itemWasAlreadyInInventory=null,inventoryChanged=null,itemIdKnown=null,
  sourceMembershipKnown=null,saveVersion='UNKNOWN'}={}){
  if(!['RECORD','REMOVE','SET_TIME','INSPECT'].includes(operation))
    throw new TypeError('unsupported collection operation');
  const blockers=[],warnings=[];
  if(typeof historyWasRecorded!=='boolean')blockers.push('HISTORY_PREIMAGE_UNKNOWN');
  if(itemIdKnown!==true)warnings.push('SOURCE_ITEM_ID_UNVERIFIED');
  if(sourceMembershipKnown!==true)warnings.push('SOURCE_COLLECTION_MEMBERSHIP_UNVERIFIED');
  if(!['3.0.0','3.0.1'].includes(saveVersion))warnings.push('SAVE_VERSION_LINKAGE_UNKNOWN');
  warnings.push('INVENTORY_TO_COLLECTION_RUNTIME_CALLBACK_OBSERVED');
  warnings.push('COLLECTION_TO_INVENTORY_REVERSE_WRITE_NOT_PROVEN');
  if(itemWasAlreadyInInventory===true&&operation==='RECORD')
    warnings.push('BACKFILL_WITHOUT_NEW_INVENTORY_OWNERSHIP_OBSERVED');
  if(inventoryChanged===false&&operation==='RECORD')
    warnings.push('INVENTORY_CAN_BE_UNCHANGED_WHILE_HISTORY_GROWS');
  if(operation!=='INSPECT')blockers.push('COLLECTION_SIDE_EFFECTS_NOT_VERIFIED');
  return result('COLLECTION_INVENTORY','RELATED',blockers,warnings,
    ['GameCollectionsTraitModel.CollectablesCollectedTime','InventoryItem.ItemId','InventoryItem.Quantity']);
}

                                                                                    
export function classifyGamePersistenceCandidate(kind){
  const candidates={
    MISSION:{model:'MissionDatabaseModel',storage:'IDocument union 2',fields:['Id','MissionId','Status','Tasks','CompletedTicks']},
    DAILY_MISSION:{model:'DailyMissionsModel',storage:'IDocument union 4',fields:['LastResetTicks','TotalCompleted','DailyMissions']},
    BLACKBOARD:{model:'BlackboardValues',storage:'IDocument union 15',fields:['saved typed values']},
    REWARD_MANAGER:{model:'RewardManagerTraitModel',storage:'TraitModel union 40',fields:['LastUpdateTicks','Rewards.ItemId','Rewards.Quantity']},
    PLAYER_TRIGGER:{model:'PlayerTriggerSeen',storage:'IDocument union 9',fields:['recorded trigger identity']},
    DLC:{model:'DlcModel',storage:'IDocument union 30',fields:['entitlement-related persisted model']},
    ACHIEVEMENT_REWARD_CLAIM:{model:null,storage:null,fields:[]},
    UNLOCK:{model:null,storage:null,fields:[]},
    CACHE:{model:null,storage:null,fields:[]}
  };
  const item=candidates[kind];
  if(!item)throw new TypeError('unknown persistence candidate');
  return freeze({schema:LINKAGE_PERSISTED_SCHEMA,kind,model:item.model,storage:item.storage,
    fields:freeze([...item.fields]),classification:'UNKNOWN',edgeToAchievementOrCollectionVerified:false,
    warnings:unique(['MODEL_PRESENCE_DOES_NOT_PROVE_TARGET_SPECIFIC_LINKAGE',
      ...(kind==='REWARD_MANAGER'?['NOT_AN_ACHIEVEMENT_REWARD_CLAIM_MARKER']:[])]),
    autoApply:false,requiredWrites:freeze([]),writerEnabled:false});
}

                                                                              
export function assessAchievementFamilyLinkage({familyType,hasPersistedParent,hasSavedSiblingSet,
  hasMetaRoot,exactPuzzlePreimageVerified=false,saveVersion=null}={}){
  if(!['MANUAL','DERIVED','GROUP','ACCOUNT','UNKNOWN'].includes(familyType))
    throw new TypeError('invalid achievement family');
  const blockers=[],warnings=[];
  if(!['3.0.0','3.0.1'].includes(saveVersion))blockers.push('UNSUPPORTED_OR_UNVERIFIED_SAVE_VERSION');
  if(familyType==='GROUP'||familyType==='DERIVED')blockers.push('RUNTIME_DERIVED_VALUE_NOT_DIRECTLY_EDITABLE');
  if(hasPersistedParent!==true)warnings.push('PARENT_RECORD_OR_BINDING_NOT_VERIFIED');
  if(hasSavedSiblingSet!==true)warnings.push('SIBLING_SAVE_SET_NOT_VERIFIED');
  if(hasMetaRoot!==true)warnings.push('META_ROOT_CROSS_STORE_NOT_VERIFIED');
  if(exactPuzzlePreimageVerified)
    warnings.push('EXACT_PUZZLE_STATIC_PREIMAGE_REQUIRES_SEPARATE_04_ATOMIC_DRY_RUN');
  warnings.push('ACHIEVEMENT_LOAD_PROGRESS_RECALCULATION_POSSIBLE');
  warnings.push('REWARD_CLAIM_AND_BACKEND_SYNCHRONIZATION_UNKNOWN');
  return result('ACHIEVEMENT_FAMILY', 'RELATED',blockers,warnings,
    ['AchievementModel.CurrentValue','GameCounterModel.CurrentValue','SettingsAccount.Counters','SettingsAccount.Achievements']);
}
