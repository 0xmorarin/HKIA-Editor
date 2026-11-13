import {RECIPE_EXPANSION4,RECIPE_EXPANSION23,RECIPE_CELEBRATION5} from '../scripts/research/save-native-schema-reader.mjs';
import {planFormal49,FORMAL49_TARGETS,planFormal9,FORMAL9_TARGETS} from './formal49-plan.mjs';
import {dryRunSchemaFormal49} from '../scripts/research/save-transaction-engine.mjs';
import {parseZip} from '../src/zip.js';
import {parseAccount} from '../src/account.js';
import {adaptStructuralSlotForDisplay} from '../src/structural-ui-adapter.js';
import {nativeWriterCapability,commitNativeCrossStoreZip} from '../contracts/04-native-commit-gate.mjs';
import {sha256Hex} from '../scripts/research/native-browser-primitives.mjs';
import {auditZipRawCopyability} from '../scripts/research/save-native-writer-gates.mjs';
import {readSchemaNativeSlotResearch,auditSchemaNativeSlotNoopResearch,dryRunSchemaNativeCrossStoreCommitResearch,dryRunSchemaCollectionZipCommitResearch,dryRunSchemaFormalFamilyBatch} from '../scripts/research/save-transaction-engine.mjs';
import {preparePrivateCrossStoreCommitComponents,planFormalFamilyBatch} from '../scripts/research/save-cross-store-dry-run.mjs';
import localDefs from '../data/local-achievement-definitions.json' with {type:'json'};
import slotDefs from '../data/slot-definitions.json' with {type:'json'};
import metaDefs from '../data/achievement-definitions.json' with {type:'json'};
import itemManifest from '../data/item-collection-crosswalk.json' with {type:'json'};
import definitions from '../data/collection-definitions.json' with {type:'json'};
import parentManifest from '../data/item-parent-crosswalk.json' with {type:'json'};
import achievementSchema from '../docs/02-achievement/ACHIEVEMENT_SCHEMA.json' with {type:'json'};
import linkage from '../contracts/03-linkage-delta.json' with {type:'json'};
import {createCollectionMutationEvidence} from '../src/collection-mutation-semantics.js';
import {inspectCollectionSavedTicks} from '../src/collection-history-extension.js';
import {planCollectionMembershipResearch} from '../scripts/research/01-collection-add-remove-contract.mjs';
import {inspectGeneralAchievementMutation} from '../scripts/research/achievement-mutation-coverage-v14.mjs';
import {inspectRemainingAchievementMutation} from '../scripts/research/02-remaining-achievement-v15.mjs';
import {inspectV15LeafCausal,inspectV15FamilyCausal,inspectV15CollectionCausal} from '../contracts/03-linkage-v15-operation-causal.mjs';
import {dryRunSchemaGeneralAchievementPairResearch} from '../scripts/research/save-transaction-engine.mjs';
import {assessBetaAcquisition} from '../scripts/research/01-collection-v17-beta-contract.mjs';
import {assessExistingRecipeTransition,TARGET as RECIPE_TARGET} from '../scripts/research/01-collection-v16-inventory-transition.mjs';
import acquisitionSource from '../docs/research/01-collection-acquisition-source-v15.json' with {type:'json'};
import {inspectV16FamilyPersistence} from '../contracts/03-linkage-v16-family-persistence.mjs';
import {inspectV18RecipeRecount} from '../contracts/03-linkage-v18-recipe-recount.mjs';
import {devOutputCapability,assertDevOutputAuthorized,betaWriterEnabled,formalFamilyRevokeEnabled,formalFamilyBatchEnabled,formal49Enabled,formal9Enabled} from './dev-output-policy.mjs';

const SLOT='Saves/save_0.save',ACCOUNT='SettingsAccount/settings.json';
const CAUSAL_KEYS=new Set(['achievement_100Fwishes','achievement_beginningCreator','achievement_masterCreator','achievement_beginningBaker']);
const sameField=(a,b)=>['model','guid','documentId','field','expected','next'].every(k=>a[k]===b[k]);
function validateCausalFields(typed,causal){
  requireValue(causal.status==='RESEARCH_ONLY'&&causal.atomicFields.length===typed.length&&causal.atomicFields.every(f=>typed.some(x=>sameField(x,f))), '03 causal plan mismatch: '+(causal.reason??'FIELD_SET'));
  requireValue(causal.causalRequired.every(f=>typed.some(x=>sameField(x,f))), '03 REQUIRED field missing');
  return {classification:causal.counterClassification??'CONDITIONAL',requiredFieldCount:causal.causalRequired.length,scope:causal.scope};
}
                                                                             
                                                                               
                                                                         
const recipeReceipts=new Map(),recipePermits=new Map(),MAX_RECEIPTS=32;
const randomToken=()=>Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
export function validateRecipeOutputPermit(token,revision,request){
  const permit=recipePermits.get(token);
  if(!permit||permit.revision!==revision||permit.request!==JSON.stringify(request))return false;
  if(permit.receipt&&(!permit.reservation||recipeReceipts.get(request.receipt)!==permit.receipt||permit.receipt.reservation!==permit.reservation))return false;
  return true;
}
function receiptRecord(token,revision,documentId,itemId,operation){
  const r=typeof token==='string'&&/^[a-f0-9]{32}$/.test(token)?recipeReceipts.get(token):null;
  return r&&r.zeroRevision===revision&&r.documentId===documentId&&r.itemId===itemId&&r.operation===operation?r:null;
}
function issueRecipeReceipt(owner,originalRevision,zeroRevision,documentId,itemId,operation){
  requireValue(recipeReceipts.size<MAX_RECEIPTS,'Recipe receipt limit reached; close unused issuer sessions');
  const token=randomToken();
  requireValue(!recipeReceipts.has(token),'Recipe receipt collision');
  recipeReceipts.set(token,{owner,originalRevision,zeroRevision,documentId,itemId,operation,reservation:null});
  return token;
}
function revokeRecipeReceipts(owner){for(const [token,r] of recipeReceipts)if(r.owner===owner)recipeReceipts.delete(token);}
const MAX_ARCHIVE=60*1024*1024;
function same(a,b){
  if(a.length!==b.length)return false;
  const x=new DataView(a.buffer,a.byteOffset,a.byteLength),y=new DataView(b.buffer,b.byteOffset,b.byteLength);
  let i=0;for(;i+4<=a.length;i+=4)if(x.getUint32(i)!==y.getUint32(i))return false;
  for(;i<a.length;i++)if(a[i]!==b[i])return false;return true;
}
function requireValue(ok,msg){if(!ok)throw Error(msg);}
function deepFreeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){for(const v of Object.values(x))deepFreeze(v);Object.freeze(x);}return x;}
deepFreeze(localDefs);deepFreeze(slotDefs);deepFreeze(metaDefs);
for(const x of [itemManifest,definitions,parentManifest,achievementSchema,linkage,acquisitionSource])deepFreeze(x);
const catalog={schema:achievementSchema.schema,families:achievementSchema.groups,root:achievementSchema.root,account:achievementSchema.account_achievements,lookup:{byKey:new Map(achievementSchema.achievements.map(x=>[x.key,x])),byGuid:new Map(achievementSchema.achievements.map(x=>[x.guid,x]))}};
function ticks(x){requireValue(typeof x==='bigint'||typeof x==='string'&&/^(?:0|-?[1-9][0-9]*)$/.test(x),'Exact decimal ticks or bigint required');const n=BigInt(x);requireValue(n>=-(1n<<63n)&&n<=(1n<<63n)-1n,'Signed int64 range exceeded');return n.toString();}
function view(bytes){requireValue(bytes instanceof Uint8Array||bytes instanceof ArrayBuffer,'ZIP byte input required');const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);requireValue(b.length>=22&&b.length<=MAX_ARCHIVE,'ZIP size limit exceeded');return b;}
function displayFromSchema(s){
  const adapted=adaptStructuralSlotForDisplay({schema:'HKIA.04.StructuralReadOnly.1',writerEnabled:false,nativeExportAuthorized:false,preservationRequired:true,version:s.version,versionKnown:true,
    readable:{achievement:true,counter:true,'collection-history':true},extraFields:{achievement:0,counter:0},unknownUnionTokens:0,nativeMapIdentityUnverifiedCount:0,
    achievements:s.achievements,counters:s.counters,collectionHistoryEntries:s.collectionHistoryEntries,collectionHistoryCount:s.collectionHistoryEntries.length});
  return deepFreeze(structuredClone({...adapted,nativeSchemaEvidence:{fullLogicalPayloadConsumed:true,typedDictionaryKeysVerified:true,typedDocumentIdsVerified:true,stats:s.stats,collectionVersion:s.collectionVersionNumber,gameAccepted:false},recipeQuantityEvidence:s.version==='3.0.1'&&s.inventoryRecipeRows.length===1&&s.inventoryRecipeRows[0].uniqueId===0&&s.inventoryRecipeRows[0].uniqueData===null?{itemId:5913958,documentId:s.inventoryRecipeRows[0].id,quantity:s.inventoryRecipeRows[0].quantity,projectionOnly:true}:null}));
}
export function readNativeSlotForProductDisplay(bytes){return displayFromSchema(readSchemaNativeSlotResearch(bytes));}
export const nativeProductCapability=()=>Object.freeze({...nativeWriterCapability(),browserCodecAvailable:true,privateEditedCopyVerificationAvailable:true,allowedPreviewOperations:Object.freeze(['collection-key1-ticks','puzzle-goals-complete','collection-key1-add','collection-key1-remove','achievement-timestamp','achievement-progress','collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity','batch-independent-scalars','batch-family-revoke','achievement-formal49-edit','achievement-manual9-revoke']),betaWriterCandidateEnabled:betaWriterEnabled(),productExportAvailable:betaWriterEnabled(),devOutput:devOutputCapability(),allowedFamilyResearchOperations:Object.freeze(['achievement-family-complete','achievement-family-revoke'])});
export async function openNativeProductSession(input,{sameVersionWitnessArchive=null}={}){
  const caller=view(input),source=Uint8Array.from(caller),revision=await sha256Hex(source);
  const layout=await auditZipRawCopyability(source);requireValue(layout.rawMemberCopyLayoutDeterminate,'Unclassified ZIP bytes');
  const zip=parseZip(source),slot=await zip.extract(SLOT),account=await zip.extract(ACCOUNT);
  const accountState=parseAccount(account);
  const s=readSchemaNativeSlotResearch(slot),display=displayFromSchema(s),prefix=await sha256Hex(slot.subarray(0,32));
  const history=new Map(s.collectionHistoryEntries),plans=new WeakMap(),receiptOwner=Symbol('recipe issuer');
  const expansionRow=(itemId,targets=RECIPE_EXPANSION4)=>{
    const rows=s.inventoryRecipeExpansionRows.filter(x=>x.itemId===itemId),r=rows[0];
    return s.version==='3.0.1'&&s.collectionVersionNumber===87&&s.collectionDeprecatedEntries.length===0&&targets.some(t=>t.itemId===itemId)&&rows.length===1&&Number.isInteger(r.id)&&r.id>0&&r.uniqueId===0&&r.uniqueData===null&&[0,1].includes(r.quantity)&&r.span.end-r.span.start===1&&history.has(itemId)&&s.recipeExpansionReferences.some(t=>t.itemId===itemId&&t.celebrated===(targets===RECIPE_CELEBRATION5?1:0)&&t.counter===0)?r:null;
  };
  const expansionTargets=(targets=RECIPE_EXPANSION4)=>targets.flatMap(t=>{const r=expansionRow(t.itemId,targets);return r&&(r.quantity===1||[...recipeReceipts.values()].some(x=>x.zeroRevision===revision&&x.itemId===t.itemId&&x.documentId===r.id&&!x.reservation))?[{itemId:t.itemId,documentId:r.id,quantity:r.quantity}]:[];});
  const recipeAdvisory=request=>inspectV18RecipeRecount({...s,inventoryRows:s.inventoryRecipeRecountRows},request);
  function recipeCapability(){const row=s.inventoryRecipeRows[0];if(s.version!=='3.0.1'||s.inventoryRecipeRows.length!==1||!row||![0,1].includes(row.quantity))return false;
    if(row.quantity===0&&![...recipeReceipts.values()].some(r=>r.zeroRevision===revision&&r.documentId===row.id&&r.itemId===row.itemId&&!r.reservation))return false;
    return recipeAdvisory({operation:'collection-recipe-quantity',itemId:row.itemId,documentId:row.id,expectedQuantity:row.quantity,nextQuantity:1-row.quantity}).status==='STATIC_RECOUNT_PREDICTED';}

                                                                                
                                                                
  const witnesses=new Set();let witnessSnapshot=null;
  async function collectWitnesses(z){
    for(const name of z.entries.keys()){
      if(name!==SLOT&&!/^BackupSaves\/[^/]+\.lbak$/i.test(name))continue;
      try{const b=readSchemaNativeSlotResearch(await z.extract(name));if(b.version===s.version)for(const id of b.collectedItemIds)witnesses.add(id);}catch{                                         }
    }
  }
  if(s.version==='3.0.0'){
    await collectWitnesses(zip);
    if(sameVersionWitnessArchive!==null){
      const witnessCaller=view(sameVersionWitnessArchive),snapshot=Uint8Array.from(witnessCaller);
      const witnessLayout=await auditZipRawCopyability(snapshot);
      requireValue(witnessLayout.rawMemberCopyLayoutDeterminate,'Unclassified witness ZIP bytes');
      await collectWitnesses(parseZip(snapshot));witnessSnapshot=snapshot;
      requireValue(same(witnessCaller,snapshot),'Witness source changed during verification');
    }
  }else requireValue(sameVersionWitnessArchive===null,'Separate witness not needed for same-version catalog');
  let collectionEvidence;let staged=null;const consumed=new WeakSet();
  function membershipEvidence(){return collectionEvidence??=createCollectionMutationEvidence({saveVersion:s.version,historyEntries:s.collectionHistoryEntries,itemManifest,definitions,parentManifest,deprecatedKey0:{state:'PRESENT_MAP',entryCount:s.collectionDeprecatedEntries.length},structuralReadVerified:true});}let closed=false,busy=false;
  function guard(expected){requireValue(!closed,'Native session closed');requireValue(!busy,'Native session busy');requireValue(expected===revision,'Source revision CAS mismatch');requireValue(same(caller,source),'Caller source changed');}
  guard(revision);
  function plan(request){
    guard(request?.expectedRevision);
    let typedPlan,diff,completedAt,familyRequest,batchKeys,recipeEligible=false,familyEligible=false,batchEligible=false,formal49Eligible=false,formal9Eligible=false,recipeExpansionEligible=false,recipeExpansion23Eligible=false,recipeCelebration5Eligible=false;
    if(request.operation==='achievement-manual9-revoke'){
      const result=planFormal9(catalog,s,accountState,request,linkage);typedPlan=result.plan;formal9Eligible=true;
      diff={nativeFields:typedPlan.changes,accountFields:[],requiredScope:'EXPLICIT_MANUAL9_ABSENCE_REVOKE',semanticLinkageVerified:false,causal:result.causal};
    }else if(request.operation==='achievement-formal49-edit'){
      const result=planFormal49(catalog,s,accountState,request,linkage);typedPlan=result.plan;formal49Eligible=true;
      diff={nativeFields:typedPlan.changes,accountFields:typedPlan.accountFields,requiredScope:'EXPLICIT_FORMAL49_EXACT20',semanticLinkageVerified:false,causal:result.causal};
    }else if(request.operation==='batch-family-revoke'){
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','keys'].includes(k)),'Invalid formal batch request');
      batchKeys=structuredClone(request.keys);typedPlan=planFormalFamilyBatch(catalog,s,accountState,batchKeys,linkage);batchEligible=true;
      diff={nativeFields:typedPlan.changes,accountFields:typedPlan.accountFields,requiredScope:'EXPLICIT_V16_DISTINCT_FAMILY_BATCH',semanticLinkageVerified:false,causal:{classification:'CONDITIONAL_PARENT_META',requiredFieldCount:2*batchKeys.length+1,scope:'DISTINCT_V16_FAMILIES_SHARED_ROOT'}};
    }else if(request.operation==='batch-independent-scalars'){
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','edits'].includes(k))&&Array.isArray(request.edits)&&request.edits.length>=2&&request.edits.length<=128,'Expected 2..128 independent scalar operations');
      const allowed=new Set(['collection-key1-ticks','achievement-timestamp','achievement-progress']);
      const fields=[],keys=new Set();
      for(const edit of request.edits){
        requireValue(edit&&allowed.has(edit.operation)&&!Object.hasOwn(edit,'expectedRevision'),'Unsupported batch suboperation');
        const sub=plan({...edit,expectedRevision:revision});
        requireValue(sub.diff.accountFields.length===0&&!sub.diff.membership,'Cross-store/membership batch refused');
        for(const f of sub.diff.nativeFields){const key=f.model+'/'+(f.guid??f.itemId)+'/'+f.field;requireValue(!keys.has(key),'Duplicate batch field');keys.add(key);fields.push(f);}
      }
      requireValue(fields.length<=128,'Batch field limit exceeded');
      typedPlan={version:s.version,changes:fields};diff={nativeFields:fields,accountFields:[],requiredScope:'INDEPENDENT_SCALAR_BATCH',semanticLinkageVerified:false};
    }else if(request.operation==='collection-key1-ticks'){
      requireValue(Array.isArray(request.changes)&&request.changes.length>=1&&request.changes.length<=128,'Expected 1..128 Key1 edits');
      const ids=new Set();const changes=request.changes.map(c=>{
        requireValue(c&&Number.isInteger(c.itemId)&&c.itemId>=-2147483648&&c.itemId<=2147483647&&!ids.has(c.itemId)&&history.has(c.itemId),'Missing or duplicate saved ItemId');ids.add(c.itemId);
        const expected=ticks(c.expected),next=ticks(c.next);requireValue(inspectCollectionSavedTicks(next).state==='CALENDAR_VALUE','New ticks must be a DateTime calendar value');requireValue(history.get(c.itemId)===expected,'Collection tick CAS mismatch');requireValue(next!==expected,'No-change edit rejected');
        return {model:'GameCollectionsTraitModel',field:'CollectablesCollectedTime',itemId:c.itemId,expected,next};
      });
      typedPlan={version:s.version,changes};diff={nativeFields:changes,accountFields:[],requiredScope:'KEY1_EXISTING_TICKS_ONLY',semanticLinkageVerified:false};
    }else if(['collection-key1-add','collection-key1-remove'].includes(request.operation)){
      const add=request.operation==='collection-key1-add';
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','itemId','expectedTicks','newTicks'].includes(k)),'Invalid membership request');
      requireValue(add?request.expectedTicks===null&&request.newTicks!=null:request.expectedTicks!=null&&request.newTicks===null,'Explicit membership CAS required');
      const expected=add?null:ticks(request.expectedTicks),next=add?ticks(request.newTicks):null;
      const membershipRequest={itemId:request.itemId,operation:add?'add':'remove',expectedSaveVersion:s.version,expectedPresent:!add,expectedTicks:expected,newTicks:next};
      const research=planCollectionMembershipResearch(membershipEvidence(),membershipRequest,{sameVersionWitnessIds:[...witnesses]});
      requireValue(inspectV15CollectionCausal(membershipEvidence(),membershipRequest,{sameVersionWitnessIds:[...witnesses]}).status==='RESEARCH_ONLY','03 Collection history scope blocked');
      requireValue(research.codecResearchEligible,'Collection membership blocked: '+research.blockers.join(','));
      const membership={operation:add?'add':'remove',itemId:request.itemId,expected,next};
      typedPlan={version:s.version,changes:[],membership};diff={nativeFields:[],membership,accountFields:[],requiredScope:'KEY1_MEMBERSHIP_HISTORY_ONLY',semanticLinkageVerified:false};
    }else if(['collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity'].includes(request.operation)){
      const is23=request.operation==='collection-recipe-expansion23-quantity',is5=request.operation==='collection-recipe-celebration5-quantity';
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','itemId','documentId','expectedQuantity','nextQuantity','acknowledgeRecipeAvailabilityChange','acknowledgeAchievementAndRewardReference','receipt'].includes(k)),'Invalid recipe expansion request');
      const r=expansionRow(request.itemId,is5?RECIPE_CELEBRATION5:is23?RECIPE_EXPANSION23:RECIPE_EXPANSION4);
      requireValue(r&&r.id===request.documentId&&r.quantity===request.expectedQuantity&&request.nextQuantity===1-r.quantity&&(r.quantity===0||!Object.hasOwn(request,'receipt')),'Recipe expansion exact existing row CAS required');
      requireValue(request.acknowledgeRecipeAvailabilityChange===true&&request.acknowledgeAchievementAndRewardReference===true,'Recipe expansion consent required');
      requireValue(r.quantity===1||receiptRecord(request.receipt,revision,r.id,r.itemId,request.operation),'RESTORE_PROVEN_SAME_ROW_REQUIRED');
      const changes=[{model:'InventoryItem',field:'Quantity',itemId:r.itemId,documentId:r.id,expected:r.quantity,next:1-r.quantity,...(is5?{scope:'CELEBRATION5'}:{})}];
      recipeExpansionEligible=!is23&&!is5;recipeExpansion23Eligible=is23;recipeCelebration5Eligible=is5;
      typedPlan={version:s.version,changes};diff={nativeFields:changes,accountFields:[],requiredScope:is5?'EXPLICIT_RECIPE_CELEBRATION5_EXISTING_ROW':is23?'EXPLICIT_RECIPE_EXPANSION23_EXISTING_ROW':'EXPLICIT_RECIPE_EXPANSION4_EXISTING_ROW',semanticLinkageVerified:false,recipeProjection:{before:r.quantity===1,after:r.quantity===0,historyPreserved:true,gameAccepted:false,advisory:{status:is5?'RELATED_PRESERVE_EXACT_TAG8':'RELATED_ONLY',requiredWrites:[],celebratedGuidMatches:is5?1:0,observedCounterGuidMatches:0,recountPrediction:null,switchAssetParity:false,gameAccepted:false}}};
    }else if(request.operation==='collection-recipe-quantity'){
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','itemId','documentId','expectedQuantity','nextQuantity','acknowledgeRecipeAvailabilityChange','acknowledgeAchievementAndRewardReference','receipt'].includes(k))&&request.itemId===RECIPE_TARGET.itemId&&(request.expectedQuantity===0||!Object.hasOwn(request,'receipt')),'Exact recipe target required');
      const rows=s.inventoryRecipeRows,r=rows[0],fact=acquisitionSource.targets.find(x=>x.itemId===RECIPE_TARGET.itemId);
      requireValue(fact?.guid===RECIPE_TARGET.guid&&fact.itemCategory===17&&!fact.requiresUniqueData&&!fact.groupDlc&&!fact.groupEvent&&!fact.itemDlcPresent&&!fact.itemEventPresent&&fact.releaseVersion==='', 'Recipe definition mismatch');
      const parents=parentManifest.links.filter(x=>x.child_id===RECIPE_TARGET.itemId||x.parent_id===RECIPE_TARGET.itemId);
      requireValue(rows.length===1&&r&&parents.length===0,'Exact existing recipe row required');
      const evidence={...RECIPE_TARGET,version:s.version,definitionVerified:true,parentGraphComplete:true,parentCount:0,childCount:0,gates:'CLEAR_SOURCE_ONLY',key0Empty:s.collectionDeprecatedEntries.length===0,typedInventoryComplete:true,inventoryRows:rows.length,documentId:r.id,uniqueId:r.uniqueId,uniqueData:r.uniqueData,quantity:r.quantity,revision};
      const recipeRequest={...request,operation:'RECIPE_EXISTING_ROW_QUANTITY'};
      const receipt=receiptRecord(request.receipt,revision,r.id,r.itemId,request.operation);
      const beta=assessBetaAcquisition({...evidence,sameRowRestorationVerified:request.expectedQuantity===0&&!!receipt},recipeRequest);
      requireValue(beta.planEligible,'Recipe transition blocked: '+beta.blockers.join(','));
      const assessment=assessExistingRecipeTransition(evidence,recipeRequest);
      requireValue(assessment.researchEligible,'Recipe transition blocked: '+assessment.blockers.join(','));
      const changes=[{model:'InventoryItem',field:'Quantity',itemId:r.itemId,documentId:r.id,expected:request.expectedQuantity,next:request.nextQuantity}];
      const advisory=recipeAdvisory(request);recipeEligible=advisory.status==='STATIC_RECOUNT_PREDICTED';
      typedPlan={version:s.version,changes};diff={nativeFields:changes,accountFields:[],requiredScope:'EXISTING_RECIPE_QUANTITY_ONLY',semanticLinkageVerified:false,recipeProjection:{before:assessment.projectionBefore,after:assessment.projectionAfter,historyPreserved:true,gameAccepted:false,advisory:structuredClone(advisory)}};
    }else if(['achievement-timestamp','achievement-progress'].includes(request.operation)){
      const timestamp=request.operation==='achievement-timestamp';
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','key',timestamp?'completedAt':'progress'].includes(k)),'Invalid achievement request');
      const req={key:request.key,operation:timestamp?'TIMESTAMP':'PROGRESS',...(timestamp?{completedAt:request.completedAt}:{progress:request.progress})};
      let draft=inspectGeneralAchievementMutation(catalog,s,accountState,req,linkage),remaining=false;
      if(timestamp&&draft.status!=='RESEARCH_DRAFT'&&!CAUSAL_KEYS.has(request.key)){
        const other=inspectRemainingAchievementMutation(catalog,s,req);
        if(other.status==='RESEARCH_DRAFT'){draft=other;remaining=true;}
      }
      requireValue(draft.status==='RESEARCH_DRAFT','Achievement operation blocked: '+draft.reason);
      const changes=draft.slotPlan.changes;
      requireValue(draft.accountChanges.length===0&&changes.length===(timestamp?1:2)&&changes.every(c=>timestamp?c.model==='AchievementModel'&&c.field==='CompletedTime':c.field==='CurrentValue')&&(remaining||!draft.changes.some(c=>c.source_key!==request.key)),'Unconfirmed Group/Meta or linkage changes refused');
      const causal=CAUSAL_KEYS.has(request.key)?validateCausalFields(changes,inspectV15LeafCausal(catalog,s,req)):null;
      typedPlan=draft.slotPlan;diff={nativeFields:changes,accountFields:[],requiredScope:timestamp?'ACHIEVEMENT_TIMESTAMP_ONLY':'MANUAL_SCALAR_PAIR_ONLY',semanticLinkageVerified:false,...(causal?{causal}:{}),...(remaining?{timestampContract:'02_REMAINING_V15'}:{})};
    }else if(['achievement-family-complete','achievement-family-revoke'].includes(request.operation)){
      const complete=request.operation==='achievement-family-complete';
      requireValue(Object.keys(request).every(k=>['operation','expectedRevision','key',...(complete?['completedAt','groupCompletedAt']:['progress'])].includes(k)),'Invalid family request');
      familyRequest={key:request.key,operation:complete?'COMPLETE':'REVOKE',...(complete?{completedAt:request.completedAt,groupCompletedAt:request.groupCompletedAt}:{progress:request.progress})};
      const draft=inspectGeneralAchievementMutation(catalog,s,accountState,familyRequest,linkage),causal=inspectV15FamilyCausal(catalog,s,accountState,familyRequest,linkage);
      requireValue(draft.status==='RESEARCH_DRAFT'&&draft.slotPlan.changes.length===8&&draft.accountChanges.length===2,'Only terminal 8+2 family research supported');
      const persistence=inspectV16FamilyPersistence(catalog,s,accountState,familyRequest,linkage);
      let causalSummary;
      if(persistence.status==='RESEARCH_ONLY'){
        requireValue(JSON.stringify(persistence.slotChanges)===JSON.stringify(draft.slotPlan.changes)&&JSON.stringify(persistence.accountChanges)===JSON.stringify(draft.accountChanges),'03 V16 family plan mismatch');
        familyEligible=true;
        causalSummary={classification:'CONDITIONAL_PARENT_META',requiredFieldCount:persistence.requiredWrites.length,scope:persistence.scope};
      }else {requireValue(persistence.status!=='BLOCKED','03 V16 family blocked: '+persistence.reason);causalSummary=validateCausalFields(draft.slotPlan.changes,causal);requireValue(JSON.stringify(causal.accountFields)===JSON.stringify(draft.accountChanges),'03 Account plan mismatch');}
      typedPlan=draft.slotPlan;diff={nativeFields:typedPlan.changes,accountFields:draft.accountChanges.map(x=>({field:x.model==='Achievement'?'Local_RootAchievement.CurrentValue':'Local_RootAchievement.Counter.CurrentValue',expected:x.before,next:x.after})),requiredScope:familyEligible&&formalFamilyRevokeEnabled()?'EXPLICIT_V16_TERMINAL_FAMILY_REVOKE':'EXPLICIT_FAMILY_RESEARCH_ONLY',semanticLinkageVerified:false,causal:causalSummary};
      if(familyEligible)typedPlan={...typedPlan,accountFields:diff.accountFields};
    }else if(request.operation==='puzzle-goals-complete'){
      completedAt=request.completedAt;
      const result=preparePrivateCrossStoreCommitComponents({slotBytes:slot,accountJson:account,localDefs,slotDefs,metaDefs,completedAt,nativeSchema:true});
      typedPlan=result.plan;diff={nativeFields:typedPlan.changes,accountFields:[{field:'Local_RootAchievement.CurrentValue',expected:19,next:20},{field:'Local_RootAchievement.Counter.CurrentValue',expected:19,next:20}],requiredScope:'PUZZLE_GOALS_ONLY',semanticLinkageVerified:true};
    }else throw Error('Unsupported Native product operation');
    const canOutput=devOutputCapability(s.version,s.collectionVersionNumber,recipeEligible,familyEligible,batchEligible,formal49Eligible,formal9Eligible,recipeExpansionEligible,recipeExpansion23Eligible,recipeCelebration5Eligible).authorizedOperations.includes(request.operation);
    const token=deepFreeze({schema:'HKIA.04.ProductNativePlan.1',revision,version:s.version,operation:request.operation,diff,writerEnabled:false,canApply:canOutput,canExport:canOutput});
    plans.set(token,{typedPlan:structuredClone(typedPlan),completedAt,familyRequest:familyRequest&&structuredClone(familyRequest),batchKeys,operation:request.operation,request:structuredClone(request)});return token;
  }
  async function executePrepared(prepared,failAt,devOutput=null){
    return ['achievement-formal49-edit','achievement-manual9-revoke'].includes(prepared.operation)?dryRunSchemaFormal49({zipBytes:source,expectedZipSha256:revision,request:prepared.request,failAt,devOutput}):prepared.batchKeys?dryRunSchemaFormalFamilyBatch({zipBytes:source,expectedZipSha256:revision,keys:prepared.batchKeys,failAt,devOutput}):prepared.familyRequest?dryRunSchemaGeneralAchievementPairResearch({zipBytes:source,expectedZipSha256:revision,request:prepared.familyRequest,failAt,devOutput}):prepared.operation!=='puzzle-goals-complete'?dryRunSchemaCollectionZipCommitResearch({zipBytes:source,expectedZipSha256:revision,plan:prepared.typedPlan,failAt,devOutput}):dryRunSchemaNativeCrossStoreCommitResearch({zipBytes:source,expectedZipSha256:revision,expectedNativeFormatPrefixSha256:prefix,localDefs,slotDefs,metaDefs,completedAt:prepared.completedAt,failAt,devOutput});
  }
  async function verifyEditedCopy(token,expectedRevision,{failAt=null}={}){
    guard(expectedRevision);const prepared=plans.get(token);requireValue(prepared,'Plan not issued by this session');busy=true;
    try{
      const proof=await executePrepared(prepared,failAt);
      requireValue(!closed&&same(caller,source),'Source/session changed during verification');requireValue(proof.editedCopyBlobReopened===true&&proof.zipBytesReturned===false,'Edited-copy verification missing');
      return deepFreeze({...proof,schema:'HKIA.04.ProductNativePreviewProof.1',operation:prepared.operation,mode:'PRIVATE_BROWSER_PREVIEW_ONLY',editedCopyName:'edited-copy.zip',nativeAuthenticationVerified:false,gameAccepted:false,nativeOutputAuthorized:false,nativeWriterEnabled:false,zipBytesReturned:false,writerEnabled:false,canApply:false,canExport:false,saveExported:false});
    }finally{busy=false;}
  }
  function releaseReservation(entry){if(entry?.reservation&&entry.receipt?.reservation===entry.reservation)entry.receipt.reservation=null;}
  function discardStaged(){releaseReservation(staged);staged=null;}
  function publish(entry){
    const {result,receipt,receiptToken,reservation,forward}=entry;
    if(receipt){requireValue(recipeReceipts.get(receiptToken)===receipt&&receipt.reservation===reservation,'Recipe receipt revoked or consumed');recipeReceipts.delete(receiptToken);}
    if(forward){const token=issueRecipeReceipt(receiptOwner,revision,forward.zeroRevision,forward.documentId,forward.itemId,forward.operation);return Object.freeze({...result,recipeRestoreReceipt:Object.freeze({token,zeroRevision:forward.zeroRevision,itemId:forward.itemId,documentId:forward.documentId,scope:'EXACT_EDITED_COPY_SAME_RUNTIME'})});}
    return result;
  }
  async function produceOutput(token,expectedRevision,{failAt=null}={},stage=false){
    guard(expectedRevision);const prepared=plans.get(token);requireValue(prepared,'Plan not issued by this session');requireValue(!consumed.has(token),'Plan already exported');requireValue(!staged,'Undo/reset or export staged edit first');busy=true;
    let entry=null,keep=false,recipePermit=null;
    try{
      requireValue(!prepared.familyRequest||formalFamilyRevokeEnabled()&&prepared.operation==='achievement-family-revoke'&&token.canExport,'DEV_NATIVE_OUTPUT_FAMILY_RESEARCH_ONLY');
      const isRecipe=['collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity'].includes(prepared.operation),request=prepared.request;
      if(isRecipe&&request.expectedQuantity===0){const receipt=receiptRecord(request.receipt,revision,request.documentId,request.itemId,request.operation);requireValue(receipt&&!receipt.reservation,'Recipe receipt unavailable or busy');const reservation=Symbol('recipe restore');receipt.reservation=reservation;entry={receipt,receiptToken:request.receipt,reservation};}
      if(isRecipe){const permit=randomToken();requireValue(recipePermits.size<MAX_RECEIPTS&&!recipePermits.has(permit),'Recipe output permit unavailable');recipePermits.set(permit,{revision,request:JSON.stringify(request),receipt:entry?.receipt??null,reservation:entry?.reservation??null});recipePermit=permit;}
      await assertDevOutputAuthorized({version:s.version,operation:prepared.operation,revision,plan:prepared.typedPlan,source,request:prepared.request,sameVersionWitnessArchive:witnessSnapshot,recipePermit});
      requireValue(!closed&&same(caller,source),'Source/session changed during authorization');
      const output=await executePrepared(prepared,failAt,{operation:prepared.operation,request:prepared.request,sameVersionWitnessArchive:witnessSnapshot,recipePermit});
      requireValue(!closed&&same(caller,source),'Source/session changed during DEV output');
      requireValue(output.devOutputAuthorized===true&&output.file instanceof File&&output.editedCopyBlobReopened===true,'DEV output verification missing');
      const {file,...proof}=output;
      const result=Object.freeze({schema:'HKIA.04.DevEditedCopy.1',file,proof:deepFreeze(proof),revision,operation:prepared.operation,writerEnabled:false,saveExported:false});
      const forward=isRecipe&&request.expectedQuantity===1?{zeroRevision:await sha256Hex(new Uint8Array(await file.arrayBuffer())),documentId:request.documentId,itemId:request.itemId,operation:request.operation}:null;
      requireValue(!closed&&same(caller,source),'Source/session changed before output');
      entry={...entry,result,forward};
      if(stage){staged=entry;keep=true;consumed.add(token);return deepFreeze({schema:'HKIA.04.BetaApplied.1',revision,operation:result.operation,proof:result.proof});}
      const published=publish(entry);consumed.add(token);return published;
    }finally{if(recipePermit)recipePermits.delete(recipePermit);if(!keep)releaseReservation(entry);busy=false;}
  }
  async function restoreRecipeEditedCopy(zeroInput,receiptToken,expectedRevision,{failAt=null,acknowledgeRecipeAvailabilityChange=false,acknowledgeAchievementAndRewardReference=false}={}){
    guard(expectedRevision);requireValue(acknowledgeRecipeAvailabilityChange===true&&acknowledgeAchievementAndRewardReference===true,'Recipe restore consent required');requireValue(!staged,'Undo/reset or export staged edit first');
    const receipt=recipeReceipts.get(receiptToken);requireValue(receipt?.owner===receiptOwner&&receipt.originalRevision===revision&&!receipt.reservation,'Recipe receipt not issued by this live session');
    const zeroCaller=view(zeroInput);busy=true;let child;
    try{child=await openNativeProductSession(zeroCaller);requireValue(!closed&&same(caller,source)&&child.revision===receipt.zeroRevision,'Recipe restore exact candidate revision mismatch');
      const request={operation:receipt.operation,expectedRevision:child.revision,itemId:receipt.itemId,documentId:receipt.documentId,expectedQuantity:0,nextQuantity:1,acknowledgeRecipeAvailabilityChange:true,acknowledgeAchievementAndRewardReference:true,receipt:receiptToken};
      const plan=child.plan(request);await child.apply(plan,child.revision,{failAt});requireValue(!closed&&same(caller,source),'Source/session changed during recipe restore');return child.export(child.revision);
    }finally{child?.close();busy=false;}
  }
  const formalFamilyKeys=betaWriterEnabled()&&formalFamilyRevokeEnabled()&&s.version==='3.0.1'&&s.collectionVersionNumber===87?['achievement_aquariumDisplay','achievement_beginningBarista','achievement_betterMetal'].filter(key=>inspectV16FamilyPersistence(catalog,s,accountState,{key,operation:'REVOKE',progress:0},linkage).status==='RESEARCH_ONLY'):[];
  const formal49Targets=betaWriterEnabled()&&formal49Enabled()?FORMAL49_TARGETS.filter(t=>{try{planFormal49(catalog,s,accountState,{operation:'achievement-formal49-edit',expectedRevision:revision,key:t.key,action:t.action,...(t.action==='REVOKE'?{progress:0}:{completedAt:'2026-11-12T00:00:00.1234567Z'})},linkage);return true;}catch{return false;}}):[];
  const formal9Targets=betaWriterEnabled()&&formal9Enabled()?FORMAL9_TARGETS.filter(t=>{try{planFormal9(catalog,s,accountState,{operation:'achievement-manual9-revoke',expectedRevision:revision,key:t.key,action:'REVOKE',progress:0},linkage);return true;}catch{return false;}}):[];
  const formalBatchEligible=(()=>{if(!formalFamilyBatchEnabled()||formalFamilyKeys.length<2)return false;try{planFormalFamilyBatch(catalog,s,accountState,formalFamilyKeys.slice(0,2),linkage);return true;}catch{return false;}})();
  return Object.freeze({schema:'HKIA.04.ProductNativeSession.1',revision,version:s.version,display,capability:Object.freeze({...nativeProductCapability(),formalFamilyRevokeKeys:Object.freeze(formalFamilyKeys),formal49Targets:Object.freeze(formal49Targets),formal9Targets:Object.freeze(formal9Targets),recipeExpansionTargets:Object.freeze(expansionTargets().map(Object.freeze)),recipeExpansion23Targets:Object.freeze(expansionTargets(RECIPE_EXPANSION23).map(Object.freeze)),recipeCelebration5Targets:Object.freeze(expansionTargets(RECIPE_CELEBRATION5).map(Object.freeze)),devOutput:devOutputCapability(s.version,s.collectionVersionNumber,recipeCapability(),formalFamilyKeys.length>0,formalBatchEligible,formal49Targets.length>0,formal9Targets.length>0,expansionTargets().length>0,expansionTargets(RECIPE_EXPANSION23).length>0,expansionTargets(RECIPE_CELEBRATION5).length>0),productExportAvailable:betaWriterEnabled()&&devOutputCapability(s.version,s.collectionVersionNumber,recipeCapability(),formalFamilyKeys.length>0,formalBatchEligible,formal49Targets.length>0,formal9Targets.length>0,expansionTargets().length>0,expansionTargets(RECIPE_EXPANSION23).length>0,expansionTargets(RECIPE_CELEBRATION5).length>0).authorizedOperations.length>0}),plan,verifyEditedCopy,
    exportDevEditedCopy(token,expectedRevision,options){return produceOutput(token,expectedRevision,options);},
    verifyNoop(expectedRevision){guard(expectedRevision);const proof=auditSchemaNativeSlotNoopResearch(slot);return deepFreeze({...proof,sourceZipByteIdentical:same(caller,source)});},
    apply(token,expectedRevision,options={}){if(!betaWriterEnabled())return commitNativeCrossStoreZip();return produceOutput(token,expectedRevision,options,true);},
    export(expectedRevision){if(!betaWriterEnabled())return commitNativeCrossStoreZip();guard(expectedRevision);requireValue(staged,'No verified staged edit');const result=publish(staged);staged=null;return result;},
    undo(expectedRevision){guard(expectedRevision);discardStaged();return true;},
    reset(expectedRevision){guard(expectedRevision);discardStaged();return true;},
    index(){guard(revision);return display;},preview(token,expectedRevision,options){return verifyEditedCopy(token,expectedRevision,options);},
    restoreRecipeEditedCopy,close(){closed=true;discardStaged();revokeRecipeReceipts(receiptOwner);}});
}
