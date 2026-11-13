                                                                              
                                                                                
import {sha256Hex} from '../scripts/research/native-browser-primitives.mjs';
const BETA_WRITER_ENABLED=false;
const RECIPE_WRITER_ENABLED=false;
const RECIPE_EXPANSION4_ENABLED=false;
const RECIPE_EXPANSION23_ENABLED=false;
const RECIPE_CELEBRATION5_ENABLED=false;
                                                                           
const FORMAL_FAMILY_REVOKE_ENABLED=false;
const FORMAL_FAMILY_BATCH_ENABLED=false;
const FORMAL49_ENABLED=false;
const FORMAL9_ENABLED=false;
const OPERATIONS=Object.freeze(['collection-key1-ticks','collection-key1-add','collection-key1-remove','achievement-timestamp','achievement-progress','puzzle-goals-complete','achievement-family-complete','achievement-family-revoke','collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity','batch-independent-scalars','batch-family-revoke','achievement-formal49-edit','achievement-manual9-revoke']);
const CANDIDATES=Object.freeze(['collection-key1-ticks','collection-key1-add','collection-key1-remove','achievement-timestamp','achievement-progress','batch-independent-scalars','collection-recipe-quantity']);
const VERSIONS=Object.freeze(['3.0.0','3.0.1']);
const HEX=/^[0-9a-f]{64}$/;
export function betaWriterEnabled(){return BETA_WRITER_ENABLED;}
export function recipeWriterEnabled(){return RECIPE_WRITER_ENABLED;}
export function recipeExpansion4Enabled(){return RECIPE_EXPANSION4_ENABLED;}
export function recipeCelebration5Enabled(){return RECIPE_CELEBRATION5_ENABLED;}
export function recipeExpansion23Enabled(){return RECIPE_EXPANSION23_ENABLED;}
export function formalFamilyRevokeEnabled(){return FORMAL_FAMILY_REVOKE_ENABLED;}
export function formalFamilyBatchEnabled(){return FORMAL_FAMILY_BATCH_ENABLED;}
export function formal49Enabled(){return FORMAL49_ENABLED;}
export function formal9Enabled(){return FORMAL9_ENABLED;}
export function devOutputCapability(version=null,collectionVersion=null,recipeEligible=false,familyEligible=false,batchEligible=false,formal49Eligible=false,formal9Eligible=false,recipeExpansionEligible=false,recipeExpansion23Eligible=false,recipeCelebration5Eligible=false){
 const compatible=version===null||VERSIONS.includes(version)&&collectionVersion===({'3.0.0':83,'3.0.1':87})[version];
 const allowed=operation=>BETA_WRITER_ENABLED&&compatible&&(CANDIDATES.includes(operation)&&(operation!=='collection-recipe-quantity'||version==='3.0.1'&&recipeEligible&&RECIPE_WRITER_ENABLED)||operation==='collection-recipe-expansion-quantity'&&version==='3.0.1'&&recipeExpansionEligible&&RECIPE_EXPANSION4_ENABLED||operation==='collection-recipe-expansion23-quantity'&&version==='3.0.1'&&recipeExpansion23Eligible&&RECIPE_EXPANSION23_ENABLED||operation==='collection-recipe-celebration5-quantity'&&version==='3.0.1'&&recipeCelebration5Eligible&&RECIPE_CELEBRATION5_ENABLED||operation==='achievement-family-revoke'&&version==='3.0.1'&&familyEligible&&FORMAL_FAMILY_REVOKE_ENABLED||operation==='batch-family-revoke'&&version==='3.0.1'&&batchEligible&&FORMAL_FAMILY_REVOKE_ENABLED&&FORMAL_FAMILY_BATCH_ENABLED||operation==='achievement-formal49-edit'&&version==='3.0.1'&&formal49Eligible&&FORMAL49_ENABLED||operation==='achievement-manual9-revoke'&&version==='3.0.1'&&formal9Eligible&&FORMAL9_ENABLED);
 return Object.freeze({mode:BETA_WRITER_ENABLED?'BETA_OFFLINE_OUTPUT':'DEV_OUTPUT_OFF',authorizedOperations:Object.freeze(OPERATIONS.filter(allowed)),operations:Object.freeze(OPERATIONS.map(operation=>Object.freeze({operation,canExport:allowed(operation),versions:['collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity','achievement-family-revoke','batch-family-revoke','achievement-formal49-edit','achievement-manual9-revoke'].includes(operation)?Object.freeze(['3.0.1']):VERSIONS,blockers:Object.freeze([...(BETA_WRITER_ENABLED?[]:['INDEPENDENT_RELEASE_QA_PENDING']),...(!compatible?['COLLECTION_VERSION_NOT_SUPPORTED']:[]),...(['collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity'].includes(operation)&&version==='3.0.0'?['OPERATION_VERSION_NOT_SUPPORTED']:[]),...(!CANDIDATES.includes(operation)&&operation!=='collection-recipe-expansion-quantity'&&operation!=='collection-recipe-expansion23-quantity'&&operation!=='collection-recipe-celebration5-quantity'&&!(operation==='achievement-family-revoke'&&FORMAL_FAMILY_REVOKE_ENABLED&&familyEligible&&version==='3.0.1')&&!(operation==='batch-family-revoke'&&FORMAL_FAMILY_REVOKE_ENABLED&&FORMAL_FAMILY_BATCH_ENABLED&&batchEligible&&version==='3.0.1')&&!(operation==='achievement-formal49-edit'&&FORMAL49_ENABLED&&formal49Eligible&&version==='3.0.1')&&!(operation==='achievement-manual9-revoke'&&FORMAL9_ENABLED&&formal9Eligible&&version==='3.0.1')?['COMPLETION_REWARD_AND_LOAD_ACCEPTANCE_UNVERIFIED']:[]),...(operation==='achievement-manual9-revoke'&&!FORMAL9_ENABLED?['FORMAL9_INDEPENDENT_QA_PENDING']:[]),...(operation==='achievement-manual9-revoke'&&!formal9Eligible?['FORMAL9_EXACT_ABSENCE_PREIMAGE_REQUIRED']:[]),...(operation==='achievement-formal49-edit'&&!FORMAL49_ENABLED?['FORMAL49_INDEPENDENT_QA_PENDING']:[]),...(operation==='achievement-formal49-edit'&&!formal49Eligible?['FORMAL49_EXACT_PREIMAGE_REQUIRED']:[]),...(operation==='batch-family-revoke'&&!FORMAL_FAMILY_BATCH_ENABLED?['FORMAL_FAMILY_BATCH_INDEPENDENT_QA_PENDING']:[]),...(operation==='batch-family-revoke'&&!batchEligible?['DISTINCT_V16_FAMILY_BATCH_PREIMAGE_REQUIRED']:[]),...(operation==='collection-recipe-celebration5-quantity'&&!RECIPE_CELEBRATION5_ENABLED?['RECIPE_CELEBRATION5_INDEPENDENT_QA_PENDING']:[]),...(operation==='collection-recipe-celebration5-quantity'&&!recipeCelebration5Eligible?['RECIPE_CELEBRATION5_EXACT_PREIMAGE_REQUIRED']:[]),...(operation==='collection-recipe-expansion23-quantity'&&!RECIPE_EXPANSION23_ENABLED?['RECIPE_EXPANSION23_INDEPENDENT_QA_PENDING']:[]),...(operation==='collection-recipe-expansion23-quantity'&&!recipeExpansion23Eligible?['RECIPE_EXPANSION23_EXACT_PREIMAGE_REQUIRED']:[]),...(operation==='collection-recipe-expansion-quantity'&&!RECIPE_EXPANSION4_ENABLED?['RECIPE_EXPANSION_INDEPENDENT_QA_PENDING']:[]),...(operation==='collection-recipe-expansion-quantity'&&!recipeExpansionEligible?['RECIPE_EXPANSION_EXACT_PREIMAGE_REQUIRED']:[]),...(operation==='collection-recipe-quantity'&&!recipeEligible?['RECIPE_EXACT_RECOUNT_WITNESS_REQUIRED']:[]),...(operation==='collection-recipe-quantity'&&!RECIPE_WRITER_ENABLED?['RECIPE_INDEPENDENT_QA_PENDING']:[]),...(operation==='collection-recipe-quantity'&&!recipeEligible?['RECIPE_RESTORE_PROVEN_SAME_ROW_REQUIRED']:[])]),warnings:Object.freeze(['GAME_LOAD_UNVERIFIED','ADDITIONAL_NATIVE_AUTHENTICATION_UNKNOWN',...(operation==='achievement-manual9-revoke'?['FORMAL9_EXACT_ABSENCE_ONLY','RUNTIME_SCHEDULING_UNKNOWN']:[]),...(operation==='achievement-formal49-edit'?['FORMAL49_EXACT20_ONLY','REWARD_REPLAY_AND_NATIVE_SCHEDULING_UNKNOWN']:[]),...(operation==='batch-family-revoke'?['FORMAL_DISTINCT_V16_FAMILIES_ONLY','REWARD_REPLAY_AND_NATIVE_SCHEDULING_UNKNOWN']:[]),...(operation==='achievement-family-revoke'?['FORMAL_V16_TERMINAL_ONLY','REWARD_REPLAY_AND_NATIVE_SCHEDULING_UNKNOWN']:[]),...(operation.startsWith('collection-key1-')?['HISTORY_NOT_GAMEPLAY_STATE']:[]),...(operation==='collection-recipe-celebration5-quantity'?['RECIPE_CELEBRATION5_TAG8_PRESERVE','RECIPE_RESTORE_EXACT_EDITED_COPY_ONLY','SWITCH_ASSET_PARITY_AND_RUNTIME_CONSUMERS_UNKNOWN']:[]),...(operation==='collection-recipe-expansion23-quantity'?['RECIPE_EXPANSION23_EXISTING_ROW_ONLY','RECIPE_RESTORE_EXACT_EDITED_COPY_ONLY','SWITCH_ASSET_PARITY_AND_RUNTIME_CONSUMERS_UNKNOWN']:[]),...(operation==='collection-recipe-expansion-quantity'?['RECIPE_EXPANSION4_EXISTING_ROW_ONLY','RECIPE_RESTORE_EXACT_EDITED_COPY_ONLY','SWITCH_ASSET_PARITY_AND_RUNTIME_CONSUMERS_UNKNOWN']:[]),...(operation==='collection-recipe-quantity'?['RECIPE_OWNERSHIP_QUANTITY_ONLY_NOT_GENERAL_ACQUISITION','RECIPE_RESTORE_EXACT_EDITED_COPY_ONLY','RECIPE_RECOUNT_RELATED_ONLY']:[])])}))) });
}
export async function devPlanDigest(plan){return sha256Hex(new TextEncoder().encode(JSON.stringify(plan)));}
                                                                               
                                                                              
                                                                           
export async function assertDevOutputAuthorized({version,operation,revision,plan,source,request,sameVersionWitnessArchive=null,recipePermit=null}={}){
 if(!BETA_WRITER_ENABLED)throw Error('DEV_NATIVE_OUTPUT_NOT_AUTHORIZED');
 if(operation==='collection-recipe-celebration5-quantity'&&(!RECIPE_CELEBRATION5_ENABLED||version!=='3.0.1'))throw Error('DEV_NATIVE_OUTPUT_RECIPE_CELEBRATION5_QA_PENDING_OR_VERSION');
 if(operation==='collection-recipe-expansion23-quantity'&&(!RECIPE_EXPANSION23_ENABLED||version!=='3.0.1'))throw Error('DEV_NATIVE_OUTPUT_RECIPE_EXPANSION23_QA_PENDING_OR_VERSION');
 if(operation==='collection-recipe-expansion-quantity'&&(!RECIPE_EXPANSION4_ENABLED||version!=='3.0.1'))throw Error('DEV_NATIVE_OUTPUT_RECIPE_EXPANSION_QA_PENDING_OR_VERSION');
 if(operation==='collection-recipe-quantity'&&!RECIPE_WRITER_ENABLED)throw Error('DEV_NATIVE_OUTPUT_RECIPE_QA_PENDING');
 const formal49=operation==='achievement-formal49-edit',formal9=operation==='achievement-manual9-revoke';
 if(formal9&&(!FORMAL9_ENABLED||version!=='3.0.1'))throw Error('DEV_NATIVE_OUTPUT_FORMAL9_QA_PENDING_OR_VERSION');
 if(formal49&&(!FORMAL49_ENABLED||version!=='3.0.1'))throw Error('DEV_NATIVE_OUTPUT_FORMAL49_QA_PENDING_OR_VERSION');
 const batch=operation==='batch-family-revoke',family=operation==='achievement-family-revoke'||batch;
 if(batch&&!FORMAL_FAMILY_BATCH_ENABLED)throw Error('DEV_NATIVE_OUTPUT_FAMILY_BATCH_QA_PENDING');
 if(family&&(!FORMAL_FAMILY_REVOKE_ENABLED||version!=='3.0.1'))throw Error('DEV_NATIVE_OUTPUT_FAMILY_RESEARCH_ONLY');
 if(!VERSIONS.includes(version)||!(CANDIDATES.includes(operation)||family||formal49||formal9||operation==='collection-recipe-expansion-quantity'||operation==='collection-recipe-expansion23-quantity'||operation==='collection-recipe-celebration5-quantity')||!HEX.test(revision??'')||plan?.version!==version||request?.operation!==operation||request?.expectedRevision!==revision||!(source instanceof Uint8Array))throw Error('DEV_NATIVE_OUTPUT_UNSUPPORTED');
 const snapshot=Uint8Array.from(source);
 if(await sha256Hex(snapshot)!==revision)throw Error('DEV_NATIVE_OUTPUT_SOURCE_CAS');
 const {openNativeProductSession,validateRecipeOutputPermit}=await import('./api.mjs');
 if(['collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity'].includes(operation)&&!validateRecipeOutputPermit(recipePermit,revision,request))throw Error('DEV_NATIVE_OUTPUT_RECIPE_SESSION_PERMIT_REQUIRED');
 const session=await openNativeProductSession(snapshot,{sameVersionWitnessArchive});
 try{
  if(session.version!==version||session.revision!==revision||session.display.nativeSchemaEvidence.collectionVersion!==({'3.0.0':83,'3.0.1':87})[version])throw Error('DEV_NATIVE_OUTPUT_VERSION_CAS');
  const expected=session.plan(request);if(!expected.canExport)throw Error('DEV_NATIVE_OUTPUT_OPERATION_CAPABILITY');const typed={version,changes:expected.diff.nativeFields,...(expected.diff.membership?{membership:expected.diff.membership}:{}),...(family||formal49||formal9?{accountFields:expected.diff.accountFields}:{})};
  if(await devPlanDigest(typed)!==await devPlanDigest(plan))throw Error('DEV_NATIVE_OUTPUT_PLAN_MISMATCH');
  if(!source.every((b,i)=>b===snapshot[i]))throw Error('DEV_NATIVE_OUTPUT_SOURCE_CHANGED');
  return Object.freeze({version,operation,revision,contract:'VERSION_OPERATION_RUNTIME_CAS',nativeLoadAccepted:false,integrityAccepted:false});
 }finally{session.close();}
}
