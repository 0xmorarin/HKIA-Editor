import {assessExistingRecipeTransition} from './01-collection-v16-inventory-transition.mjs';
const MAX=2147483647;
export function allocateProviderDocumentId(nextId,documentIds){
 if(!Number.isInteger(nextId)||nextId<0||nextId>=MAX||!Array.isArray(documentIds)||!documentIds.every(x=>Number.isInteger(x)&&x>=0&&x<=MAX))throw Error('ALLOCATOR_INVALID');
 if(documentIds.some(x=>x>nextId))throw Error('STALE_NEXT_ID');
 const result=nextId+1;if(documentIds.includes(result))throw Error('DOCUMENT_ID_COLLISION');return result;
}
export function assessBetaAcquisition(e,r){
 const blockers=[];if(r?.operation!=='RECIPE_EXISTING_ROW_QUANTITY')return Object.freeze({capability:'UNSUPPORTED_ACQUISITION',blockers:Object.freeze(['NO_PROVEN_OWNERSHIP_TRANSACTION']),productAuthorized:false,canExport:false});
 const base=assessExistingRecipeTransition(e,r);blockers.push(...base.blockers);
 if(r.acknowledgeRecipeAvailabilityChange!==true)blockers.push('RECIPE_AVAILABILITY_CONSENT_REQUIRED');
 if(r.acknowledgeAchievementAndRewardReference!==true)blockers.push('CROSS_DOMAIN_REFERENCE_CONSENT_REQUIRED');
 if(r.expectedQuantity===0&&e?.sameRowRestorationVerified!==true)blockers.push('RESTORE_PROVEN_SAME_ROW_REQUIRED');
 if(e?.documentId===0)blockers.push('NONZERO_DOCUMENT_ID_REQUIRED');
 const planEligible=blockers.length===0;
 return Object.freeze({capability:planEligible?'EXACT_RECIPE_OWNERSHIP_RESEARCH_CANDIDATE':'BLOCKED',planEligible,blockers:Object.freeze(blockers),requiredCandidate:planEligible?'IDocument[1].InventoryItem.Key3.Quantity':null,preserve:Object.freeze(['DocumentId','ItemId','UniqueId','UniqueData','DbRoot.NextId','Key0','Key1','Achievement','GameCounter','Quest','Reward','Unlock','Entitlement','all non-target tokens']),productAuthorized:false,canExport:false,nativeGameObserved:false});
}
