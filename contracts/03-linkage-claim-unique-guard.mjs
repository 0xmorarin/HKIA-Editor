/** Add-only evidence boundary. All results are read-only; no save bytes or patches. */
import {inspectAchievementRewardClaim, assessLoadedAchievementRecount, inspectCollectionInventoryDirection, resolveMissionSourceBinding} from './03-linkage-native-writepath.mjs';
export const SCHEMA='HKIA.LinkageClaimUniqueGuard.1';
export const SOURCE_SHA='6c76f61bffa6ad5e33806a73c499eafe056fa45a7070f5039f2a12923deec832';
export const V301_NSO_SHA='64bd5fb69239f57eb0578a1897a45a3c6f5e187480903f83df503b46bf827bfb';
export const FROZEN=Object.freeze({structuralEdges:17284,missionRefs:171,nativeStorageRoutes:4,newRequired:0,graphSHA:'56d2c16c41f671419c7dcbfbbecf3444866c837b2e2ec7af2a1dee424f06165b'});
const freeze=(v)=>Object.freeze(v);
const freezeList=(v)=>freeze([...new Set(v)]);
function result({domain,classification='UNKNOWN',fact='UNVERIFIED',warnings=[],blockers=[],evidence=[],details={}}){
 return freeze({schema:SCHEMA,domain,classification,fact,warnings:freezeList(warnings),blockers:freezeList(blockers),nativeRvas:freezeList(evidence),details:freeze({...details}),requiredWrites:freeze([]),autoApply:false,applyAuthorized:false,writerEnabled:false,pagesEnabled:false,saveBytes:null});
}
const versionKnown=v=>v==='3.0.1';
const isF32=v=>typeof v==='number'&&Number.isFinite(v)&&Math.fround(v)===v;
/** `serviceReady` never serves as a claim witness: it only selects a runtime delivery branch. */
export function inspectAchievementRewardPersistence({version='3.0.1',achievementDataKeys=['IsComplete','CurrentValue','CompletedTime'],rewardManagerFields=['LastUpdateTicks','Rewards'],rewardRowFields=['ItemId','UniqueDefinitionId','DisplayOnly','Quantity'],rewardServiceReady=null,claimLedgerVerified=false,sourceGuidVerified=false}={}){
 const old=inspectAchievementRewardClaim({achievementDataKeys,completionCallbackObserved:versionKnown(version),hasVerifiedClaimLedger:claimLedgerVerified});
 const exactA=Array.isArray(achievementDataKeys)&&JSON.stringify(achievementDataKeys)===JSON.stringify(['IsComplete','CurrentValue','CompletedTime']);
 const exactM=Array.isArray(rewardManagerFields)&&JSON.stringify(rewardManagerFields)===JSON.stringify(['LastUpdateTicks','Rewards']);
 const exactR=Array.isArray(rewardRowFields)&&JSON.stringify(rewardRowFields)===JSON.stringify(['ItemId','UniqueDefinitionId','DisplayOnly','Quantity']);
 const b=[];
 if(!versionKnown(version))b.push('UNVERIFIED_NATIVE_VERSION');
 if(!exactA||!exactM||!exactR)b.push('REWARD_SCHEMA_UNVERIFIED');
 if(sourceGuidVerified!==true)b.push('SOURCE_ACHIEVEMENT_ID_UNVERIFIED');
 b.push('NO_PER_ACHIEVEMENT_PERSISTED_CLAIM_BINDING','AT_MOST_ONCE_REWARD_ISSUANCE_UNVERIFIED');
 if(claimLedgerVerified===true)b.push('CALLER_ASSERTED_LEDGER_NOT_INDEPENDENTLY_CROSS_VERIFIED');
 const w=['REWARD_QUEUE_IN_MEMORY_NOT_PERSISTED_CLAIM','REWARD_MANAGER_TRAIT_NOT_ACHIEVEMENT_CLAIM_WITNESS','LOADED_COMPLETION_DOES_NOT_PROVE_REWARD_REPLAY'];
 if(rewardServiceReady===false) w.push('RUNTIME_REWARD_QUEUE_BRANCH_MAY_APPLY');
 if(rewardServiceReady===true) w.push('RUNTIME_DIRECT_REWARD_DISPATCH_BRANCH_MAY_APPLY');
 if(rewardServiceReady===null) w.push('RUNTIME_REWARD_SERVICE_STATE_UNKNOWN');
 return result({domain:'ACHIEVEMENT_REWARD_CLAIM',classification:'UNKNOWN',fact:exactA&&exactM&&exactR&&versionKnown(version)?'NATIVE_RUNTIME_QUEUE_AND_SCHEMA_VERIFIED':'UNVERIFIED',warnings:[...old.warnings,...w],blockers:b,evidence:versionKnown(version)?['0x72AF490','0x72AF5D8','0x72AF718','0x72AF73C','0x72AF820']:[],details:{sourceGuidVerified,claimLedgerVerified:false,rewardServiceReady}});
}
/** Counted GUID values must be explicitly sourced from the raw typed model; preserve list order and duplicates. */
export function inspectUniqueCounterReload({version='3.0.1',sourceGuidVerified=false,onlyCountUniques,loadedCurrentValue,rawGuids=null,rawGuidsVerified=false,legacyCountedValues=null}={}){
 const blockers=[],warnings=[];
 if(!versionKnown(version))blockers.push('UNVERIFIED_NATIVE_VERSION');
 if(sourceGuidVerified!==true)blockers.push('COUNTER_SOURCE_GUID_UNVERIFIED');
 if(onlyCountUniques!==true)blockers.push('ONLY_COUNT_UNIQUES_NOT_VERIFIED');
 if(!isF32(loadedCurrentValue)||loadedCurrentValue<0)blockers.push('INVALID_SAVED_FLOAT32_PREIMAGE');
 if(legacyCountedValues!==null)blockers.push('LEGACY_HISTORY_PRESENT_OR_NOT_PROVEN_NULL');
 if(rawGuidsVerified!==true||!Array.isArray(rawGuids))blockers.push('RAW_COUNTED_GUID_IDENTITIES_UNVERIFIED');
 let setSize=null,rawSize=null,duplicates=null;
 if(Array.isArray(rawGuids)){
  rawSize=rawGuids.length;
  if(!rawGuids.every(x=>typeof x==='string'&&/^[a-f0-9]{32}$/i.test(x)))blockers.push('INVALID_RAW_HASH128_CANONICAL_ID');
  else {setSize=new Set(rawGuids.map(x=>x.toLowerCase())).size;duplicates=rawSize-setSize;}
 }
 if(setSize!==null&&duplicates>0) warnings.push('HASHSET_COLLAPSES_DUPLICATE_GUIDS','PRESERVE_GUID_LIST_DUPLICATES');
 if(setSize!==null&&isF32(loadedCurrentValue)&&rawSize>0&&loadedCurrentValue!==Math.fround(rawSize)) warnings.push('NATIVE_LOAD_RECOUNT_CAN_OVERRIDE_SCALAR');
 if(setSize===0)warnings.push('EMPTY_GUID_LIST_RETAINS_LOADED_SCALAR');
 if(setSize!==null&&setSize>0)warnings.push('NATIVE_NONEMPTY_GUID_LIST_RECOUNTS_SCALAR');
 warnings.push('COUNTER_HISTORY_DO_NOT_SYNTHESIZE_GUIDS');
 return result({domain:'COUNTER_UNIQUE_LOAD',classification:blockers.length?'UNKNOWN':'RELATED',fact:blockers.length?'UNVERIFIED':'NATIVE_SOURCE_SCOPED',warnings,blockers,evidence:versionKnown(version)?['0x72B7988','0x72B79C4','0x72B7A1C','0x72B7A20','0x72B808C','0x72B8094']:[],details:{rawSize,setSize,duplicates,loadedCurrentValue,nativeRecountValue:setSize!==null&&rawSize>0?Math.fround(rawSize):null,scalarWouldBeOverridden:blockers.length===0&&setSize!==null&&rawSize>0&&isF32(loadedCurrentValue)&&Math.fround(rawSize)!==loadedCurrentValue}});
}
/** Compose 03-owned read-only evidence with 01/02; do not reimplement their planner. */
export function inspectLinkedEditGate({version='3.0.1',kind,sourceGuidVerified=false,documentIdVerified=false,claimWitnessVerified=false,saveReparseVerified=false,nativeGameReloadVerified=false,connectedModel='UNKNOWN'}={}){
 if(!['ACHIEVEMENT','COUNTER','COLLECTION','MISSION'].includes(kind))throw new TypeError('unsupported domain');
 const blockers=['LINKAGE_REQUIRES_GAME_SIDE_PREIMAGE_CAUSAL_PROOF'];
 if(!versionKnown(version))blockers.push('NATIVE_RVA_VERSION_NOT_VERIFIED');
 if(!sourceGuidVerified)blockers.push('SOURCE_ID_NOT_VERIFIED');
 if(!documentIdVerified)blockers.push('SAVED_DOCUMENT_ID_NOT_VERIFIED');
 if(!claimWitnessVerified)blockers.push('CLAIM_WITNESS_NOT_VERIFIED');
 if(!saveReparseVerified)blockers.push('REPARSE_NOT_VERIFIED');
 if(!nativeGameReloadVerified)blockers.push('GAME_RELOAD_NOT_VERIFIED');
 return result({domain:`${kind}_CROSSMODEL_MUTATION`,classification:'UNKNOWN',fact:'NO_CAUSAL_REQUIRED_PROOF',blockers,warnings:[`NO_INFERRED_${connectedModel}_PERSISTED_MUTATION`,'STATIC_DRAFT_IS_NOT_GAME_ACCEPTED'],details:{kind,connectedModel}});
}
export const EXISTING_03_COMPOSITION=freeze({recount:assessLoadedAchievementRecount,mission:resolveMissionSourceBinding,inventory:inspectCollectionInventoryDirection});
