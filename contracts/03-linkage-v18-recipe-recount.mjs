/** Scope-limited, pure research advisory. Inputs must be derived by the sealed
 * typed Session; this function never grants write/restore authorization. */
import EVIDENCE from '../docs/03-linkage/v18/RECIPE_NATIVE_SOURCE.json' with {type:'json'};
export const BASE_V18='7a44a54c17518366f6b136a4f83c5403507ada9308a451f6dbdd2c43a74f23a9';
export const RECIPE_TARGET=Object.freeze({version:'3.0.1',itemId:5913958,sourceGuid:'ba9885df3b8198041b4ce5617db825eb',saveGuid:'fd5889ab:408918b3:165ec4b1:be528bd7',counterSaveGuid:'de22a1aa:4ede2950:fffab9bc:c283c6f3',achievementSaveGuid:'dd9d6553:a541b660:697b0eb8:a6879185',threshold:16});
const ITEMS=Object.freeze(EVIDENCE.items.map(x=>Object.freeze({...x})));
const ids=new Map(ITEMS.map(x=>[x.itemId,x.saveGuid]));
const allGuids=new Set(ITEMS.map(x=>x.saveGuid));
const validWord=x=>Number.isInteger(x)&&x>=0&&x<=0xffffffff;
const guid=words=>Array.isArray(words)&&words.length===4&&words.every(validWord)?words.map(x=>x.toString(16).padStart(8,'0')).join(':'):null;
const validId=x=>Number.isInteger(x)&&x>0&&x<=2147483647;
const base=()=>({writerEnabled:false,applyAuthorized:false,gameAccepted:false,autoApply:false,requiredWrites:[],newStructuralEdges:0,rewardClaim:'UNKNOWN',questUnlockCache:'UNKNOWN',restoreAuthorization:'04_ONLY'});
const answer=(status,reason,extra={})=>Object.freeze({...base(),status,reason,...extra});
/** Inputs are only an internal projection. The exact current witness requires
 * all 24 known rows, with no duplicate IDs or legacy counted values. On 0->1
 * we do not validate the receipt here: only 04's trusted Session can. */
export function inspectV18RecipeRecount(input,request){
 if(!request||request.itemId!==RECIPE_TARGET.itemId||request.operation!=='collection-recipe-quantity'||input?.version!=='3.0.1')return answer('NOT_IN_SCOPE','INDEPENDENT_OR_UNPINNED_OPERATION');
 if(input?.fullLogicalPayloadConsumed!==true||input.typedDocumentIdsVerified!==true||input.typedDictionaryKeysVerified!==true||!Array.isArray(input.inventoryRows)||!Array.isArray(input.counters)||!Array.isArray(input.achievements))return answer('UNKNOWN','TYPED_SNAPSHOT_REQUIRED');
 if(!validId(request.documentId)||!((request.expectedQuantity===1&&request.nextQuantity===0)||(request.expectedQuantity===0&&request.nextQuantity===1)))return answer('UNKNOWN','INVALID_TRANSITION');
 const rows=input.inventoryRows.filter(x=>x&&ids.has(x.itemId));
 if(rows.length!==24||new Set(rows.map(x=>x.itemId)).size!==24||new Set(rows.map(x=>x.documentId)).size!==24||rows.some(x=>!validId(x.documentId)||x.uniqueId!==0||x.uniqueData!==null||!Number.isInteger(x.quantity)||x.quantity<0||x.quantity>2147483647))return answer('UNKNOWN','MEMBER_ROWS_NOT_EXACT');
 const target=rows.find(x=>x.itemId===RECIPE_TARGET.itemId);
 if(target.documentId!==request.documentId||target.quantity!==request.expectedQuantity)return answer('UNKNOWN','ROW_CAS_MISMATCH');
 // All other 23 rows must remain positive. This is not a general recipe editor.
 if(rows.some(x=>x.itemId!==RECIPE_TARGET.itemId&&x.quantity<=0))return answer('UNKNOWN','OTHER_MEMBER_NOT_POSITIVE');
 const counters=input.counters.filter(x=>x?.guid===RECIPE_TARGET.counterSaveGuid),achievements=input.achievements.filter(x=>x?.guid===RECIPE_TARGET.achievementSaveGuid);
 if(counters.length!==1||achievements.length!==1)return answer('UNKNOWN','SAVED_COUNTER_OR_ACHIEVEMENT_MISSING_OR_AMBIGUOUS');
 const c=counters[0],a=achievements[0];
 if(c.countedValues!==null||!Array.isArray(c.countedGuidWords)||c.countedGuidWords.length!==c.countedGuids||c.current!==c.countedGuids)return answer('UNKNOWN','COUNTER_PREIMAGE_MISMATCH');
 const g=c.countedGuidWords.map(guid);if(g.some(x=>x===null||!allGuids.has(x))||new Set(g).size!==g.length)return answer('UNKNOWN','COUNTER_GUIDS_UNKNOWN_OR_DUPLICATE');
 if(a.complete!==true||a.current!==16)return answer('UNKNOWN','ACHIEVEMENT_PREIMAGE_NOT_COMPLETE');
 const before=request.expectedQuantity===1?24:23,after=request.nextQuantity===1?24:23;
 // Restore may start before the game's recount (still 24), or after it (23,
 // target absent); no receipt or output authorization inferred from either.
 const completeSet=g.length===24&&g.every(x=>allGuids.has(x));
 const recountedSet=g.length===23&&!g.includes(RECIPE_TARGET.saveGuid)&&g.every(x=>allGuids.has(x));
 if(request.expectedQuantity===1?!completeSet:!(completeSet||recountedSet))return answer('UNKNOWN','COUNTER_MEMBERSHIP_NOT_WITNESSED');
 return answer('STATIC_RECOUNT_PREDICTED','EXACT_24_RECIPE_MEMBER_WITNESS',{
   classification:'RELATED',staticInventoryCountBefore:before,staticInventoryCountAfter:after,storedCounterBefore:c.current,
   predictedCounterAfterTrackerRecount:after,achievementThreshold:16,achievementStaysCompleteUnderModel:true,
   // No additional cross-model writes; 01/04 own the Quantity transaction.
   preserve:['GameCounterModel.CurrentValue','GameCounterModel.CountedValues','GameCounterModel.CountedGuids','AchievementModel','Collection.Key0','Collection.Key1','Parent/Meta','Quest/Unlock/Reward/Cache','all non-target tokens'],
   warnings:['RUNTIME_RECOUNT_MAY_SAVE_COUNTER_AFTER_LOAD','ACTUAL_LOAD_SAVE_ORDER_UNVERIFIED','SWITCH_ASSET_PARITY_UNVERIFIED','RECIPE_AVAILABILITY_CHANGES','REWARD_CLAIM_UNKNOWN',...(request.expectedQuantity===0?['RESTORE_REQUIRES_TRUSTED_SAME_ROW_RECEIPT']:[])],
   immediateNegativeInventoryEventIgnored:true,expectedNewCounterPersistence:'IF_TRACKER_RECOUNT_REACHES_SAVECOUNTER',gameLoadObserved:false});
}
