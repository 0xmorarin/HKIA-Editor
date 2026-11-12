import {projectInventoryPredicate} from './01-collection-acquisition-v15.mjs';
export const TARGET=Object.freeze({version:'3.0.1',itemId:5913958,guid:'ba9885df3b8198041b4ce5617db825eb',category:17});
// Research eligibility is not product authorization. Caller evidence must be independently checked against the typed source and pinned definition.
export function assessExistingRecipeTransition(e,r){
 const blockers=[];
 if(!e||!r||e.version!==TARGET.version||e.itemId!==TARGET.itemId||e.guid!==TARGET.guid||e.category!==TARGET.category)blockers.push('EXACT_TARGET_BUILD_REQUIRED');
 if(!e||e.definitionVerified!==true||e.parentGraphComplete!==true||e.parentCount!==0||e.childCount!==0||e.gates!=='CLEAR_SOURCE_ONLY')blockers.push('SOURCE_CONTEXT_UNVERIFIED');
 if(!e||e.key0Empty!==true||e.typedInventoryComplete!==true||e.inventoryRows!==1||e.uniqueId!==0||e.uniqueData!==null||!Number.isInteger(e.documentId)||e.documentId<0||e.documentId>2147483647)blockers.push('EXISTING_SIMPLE_ROW_REQUIRED');
 if(!r||!e||r.documentId!==e.documentId||r.expectedQuantity!==e.quantity||!((r.expectedQuantity===1&&r.nextQuantity===0)||(r.expectedQuantity===0&&r.nextQuantity===1)))blockers.push('QUANTITY_CAS_OR_TRANSITION_INVALID');
 if(r?.operation!=='RECIPE_EXISTING_ROW_QUANTITY')blockers.push('OPERATION_NOT_SUPPORTED');
 if(r?.expectedRevision!==e?.revision||typeof e?.revision!=='string'||!/^[0-9a-f]{64}$/.test(e.revision))blockers.push('REVISION_CAS');
 const ok=blockers.length===0;
 return Object.freeze({researchEligible:ok,blockers:Object.freeze(blockers),requiredField:ok?'IDocument[1].InventoryItem.Key3.Quantity':null,projectionBefore:ok?projectInventoryPredicate({category:17,entries:[r.expectedQuantity],complete:true,identityVerified:true}).result:null,projectionAfter:ok?projectInventoryPredicate({category:17,entries:[r.nextQuantity],complete:true,identityVerified:true}).result:null,historyPolicy:'PRESERVE_EXISTING_KEY1_AND_KEY0',recipeOwnershipAlsoChanges:true,nativeGameObserved:false,productAuthorized:false,writerEnabled:false});
}
