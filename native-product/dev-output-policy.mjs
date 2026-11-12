// Build-owned functional beta switch. The release candidate remains OFF until
// independent QA. No user-specific approval records or runtime caller override.
import {sha256Hex} from '../scripts/research/native-browser-primitives.mjs';
const BETA_WRITER_ENABLED=false;
const RECIPE_WRITER_ENABLED=false;
const OPERATIONS=Object.freeze(['collection-key1-ticks','collection-key1-add','collection-key1-remove','achievement-timestamp','achievement-progress','puzzle-goals-complete','achievement-family-complete','achievement-family-revoke','collection-recipe-quantity','batch-independent-scalars']);
const CANDIDATES=Object.freeze(['collection-key1-ticks','collection-key1-add','collection-key1-remove','achievement-timestamp','achievement-progress','batch-independent-scalars','collection-recipe-quantity']);
const VERSIONS=Object.freeze(['3.0.0','3.0.1']);
const HEX=/^[0-9a-f]{64}$/;
export function betaWriterEnabled(){return BETA_WRITER_ENABLED;}
export function recipeWriterEnabled(){return RECIPE_WRITER_ENABLED;}
export function devOutputCapability(version=null,collectionVersion=null,recipeEligible=false){
 const compatible=version===null||VERSIONS.includes(version)&&collectionVersion===({'3.0.0':83,'3.0.1':87})[version];
 const allowed=operation=>BETA_WRITER_ENABLED&&compatible&&CANDIDATES.includes(operation)&&(operation!=='collection-recipe-quantity'||version==='3.0.1'&&recipeEligible&&RECIPE_WRITER_ENABLED);
 return Object.freeze({mode:BETA_WRITER_ENABLED?'BETA_OFFLINE_OUTPUT':'DEV_OUTPUT_OFF',authorizedOperations:Object.freeze(OPERATIONS.filter(allowed)),operations:Object.freeze(OPERATIONS.map(operation=>Object.freeze({operation,canExport:allowed(operation),versions:operation==='collection-recipe-quantity'?Object.freeze(['3.0.1']):VERSIONS,blockers:Object.freeze([...(BETA_WRITER_ENABLED?[]:['INDEPENDENT_RELEASE_QA_PENDING']),...(!compatible?['COLLECTION_VERSION_NOT_SUPPORTED']:[]),...(operation==='collection-recipe-quantity'&&version==='3.0.0'?['OPERATION_VERSION_NOT_SUPPORTED']:[]),...(!CANDIDATES.includes(operation)?['COMPLETION_REWARD_AND_LOAD_ACCEPTANCE_UNVERIFIED']:[]),...(operation==='collection-recipe-quantity'&&!recipeEligible?['RECIPE_EXACT_RECOUNT_WITNESS_REQUIRED']:[]),...(operation==='collection-recipe-quantity'&&!RECIPE_WRITER_ENABLED?['RECIPE_INDEPENDENT_QA_PENDING']:[]),...(operation==='collection-recipe-quantity'&&!recipeEligible?['RECIPE_RESTORE_PROVEN_SAME_ROW_REQUIRED']:[])]),warnings:Object.freeze(['GAME_LOAD_UNVERIFIED','ADDITIONAL_NATIVE_AUTHENTICATION_UNKNOWN',...(operation.startsWith('collection-key1-')?['HISTORY_NOT_GAMEPLAY_STATE']:[]),...(operation==='collection-recipe-quantity'?['RECIPE_OWNERSHIP_QUANTITY_ONLY_NOT_GENERAL_ACQUISITION','RECIPE_RESTORE_EXACT_EDITED_COPY_ONLY','RECIPE_RECOUNT_RELATED_ONLY']:[])])}))) });
}
export async function devPlanDigest(plan){return sha256Hex(new TextEncoder().encode(JSON.stringify(plan)));}
// Re-derive the exact plan from the supplied original using the shared product
// planner, not a caller assertion, raw plan, or user-specific allowlist. This
// function is also called at the final File boundary in the ZIP assembler.
export async function assertDevOutputAuthorized({version,operation,revision,plan,source,request,sameVersionWitnessArchive=null,recipePermit=null}={}){
 if(!BETA_WRITER_ENABLED)throw Error('DEV_NATIVE_OUTPUT_NOT_AUTHORIZED');
 if(operation==='collection-recipe-quantity'&&!RECIPE_WRITER_ENABLED)throw Error('DEV_NATIVE_OUTPUT_RECIPE_QA_PENDING');
 if(!VERSIONS.includes(version)||!CANDIDATES.includes(operation)||!HEX.test(revision??'')||plan?.version!==version||request?.operation!==operation||request?.expectedRevision!==revision||!(source instanceof Uint8Array))throw Error('DEV_NATIVE_OUTPUT_UNSUPPORTED');
 const snapshot=Uint8Array.from(source);
 if(await sha256Hex(snapshot)!==revision)throw Error('DEV_NATIVE_OUTPUT_SOURCE_CAS');
 const {openNativeProductSession,validateRecipeOutputPermit}=await import('./api.mjs');
 if(operation==='collection-recipe-quantity'&&!validateRecipeOutputPermit(recipePermit,revision,request))throw Error('DEV_NATIVE_OUTPUT_RECIPE_SESSION_PERMIT_REQUIRED');
 const session=await openNativeProductSession(snapshot,{sameVersionWitnessArchive});
 try{
  if(session.version!==version||session.revision!==revision||session.display.nativeSchemaEvidence.collectionVersion!==({'3.0.0':83,'3.0.1':87})[version])throw Error('DEV_NATIVE_OUTPUT_VERSION_CAS');
  const expected=session.plan(request);if(!expected.canExport)throw Error('DEV_NATIVE_OUTPUT_OPERATION_CAPABILITY');const typed={version,changes:expected.diff.nativeFields,...(expected.diff.membership?{membership:expected.diff.membership}:{})};
  if(await devPlanDigest(typed)!==await devPlanDigest(plan))throw Error('DEV_NATIVE_OUTPUT_PLAN_MISMATCH');
  if(!source.every((b,i)=>b===snapshot[i]))throw Error('DEV_NATIVE_OUTPUT_SOURCE_CHANGED');
  return Object.freeze({version,operation,revision,contract:'VERSION_OPERATION_RUNTIME_CAS',nativeLoadAccepted:false,integrityAccepted:false});
 }finally{session.close();}
}
