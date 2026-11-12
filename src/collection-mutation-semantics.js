import {inspectCollectionSavedTicks, normalizeSavedCollectionInt64, assertOpaqueCollectionTokensEqual}
  from './collection-history-extension.js';

const MIN_ITEM = -(2**31), MAX_ITEM = 2**31 - 1;
const MAX_HISTORY = 1_000_000;
const KNOWN_SAVES = new Set(['3.0.0', '3.0.1']);
const OPERATIONS = new Set(['add', 'remove', 'set-time']);
const LINKAGE = Object.freeze([
  Object.freeze({target:'GameCollectionsTraitModel.Key1',classification:'PRIMARY',autoUpdate:false}),
  Object.freeze({target:'GameCollectionsTraitModel.Key0Deprecated',classification:'RELATED',autoUpdate:false}),
  Object.freeze({target:'InventoryItem',classification:'RELATED',autoUpdate:false}),
  Object.freeze({target:'SourceParentFamilyAndCategoryDisplay',classification:'RELATED',autoUpdate:false}),
  Object.freeze({target:'Achievement/Counter/Quest/Unlock/Reward/Cache',classification:'UNKNOWN',autoUpdate:false}),
  Object.freeze({target:'DLC/EventEligibility',classification:'RELATED',autoUpdate:false}),
]);

function signedItemId(id) {
  if (!Number.isInteger(id) || id < MIN_ITEM || id > MAX_ITEM)
    throw new TypeError('ItemId must be exact signed int32');
  return id;
}
function plainObject(x){return x !== null && typeof x==='object' && !Array.isArray(x);}
function versionString(x){if(typeof x!=='string'||!/^\d+\.\d+\.\d+$/.test(x))throw new TypeError('save version missing');return x;}
function pairs(input) {
  if (!(Array.isArray(input) || input instanceof Map)) throw new TypeError('history entries must be array or Map');
  if (input.size>MAX_HISTORY||input.length>MAX_HISTORY)throw new RangeError('history too large');
  const seen=new Set(),out=[];
  for(const entry of input){
    if(!Array.isArray(entry)||entry.length!==2)throw new TypeError('history pair [ItemId,ticks] required');
    const id=signedItemId(entry[0]);
    if(seen.has(id))throw new Error('duplicate ItemId in decoded history; 04 must also reject duplicate raw MessagePack keys');
    seen.add(id);
    out.push(Object.freeze([id,normalizeSavedCollectionInt64(entry[1])]));
  }
  return Object.freeze(out);
}
function copyWarnings(list){return Object.freeze([...new Set(list)]);}
function lookupItem(byId,id){return byId.get(id)??null;}
function key0Evidence(input) {
  if(!plainObject(input)||!['PRESENT_MAP','ABSENT','UNRECOGNIZED'].includes(input.state))
    throw new TypeError('explicit deprecated Key0 state required');
  if(input.state==='PRESENT_MAP'&&(!Number.isSafeInteger(input.entryCount)||input.entryCount<0))
    throw new TypeError('deprecated Key0 map count required');
  if(input.state!=='PRESENT_MAP'&&input.entryCount!==null)throw new TypeError('Key0 state/count mismatch');
  return Object.freeze({state:input.state,entryCount:input.entryCount,
    tokenBytesPreserved:false,migrate:false,defaultIfMissing:false});
}

export function createCollectionMutationEvidence({saveVersion, historyEntries, itemManifest,
  definitions, parentManifest, deprecatedKey0, structuralReadVerified=false}) {
  versionString(saveVersion);
  if(structuralReadVerified!==true)throw new Error('typed envelope/union39 read evidence required');
  const entries=pairs(historyEntries), history=new Map(entries);
  if(itemManifest?.schema!=='HKIA.ItemCollectionCrosswalk.1'||!Array.isArray(itemManifest.items))
    throw new TypeError('source item catalog invalid');
  if(!Array.isArray(definitions)||parentManifest?.schema!=='HKIA.ItemParentCrosswalk.1'||!Array.isArray(parentManifest.links))
    throw new TypeError('collection/parent source catalog invalid');
  const sourceById=new Map();
  for(const item of itemManifest.items){
    if(!Number.isSafeInteger(item.id)||item.id<=0||item.id>MAX_ITEM||sourceById.has(item.id))
      throw new Error('duplicate/invalid source ItemId');
    sourceById.set(item.id,item);
  }
  const defByKey=new Map();
  for(const def of definitions){if(typeof def.key!=='string'||defByKey.has(def.key))throw new Error('duplicate/invalid definition');defByKey.set(def.key,def);}
  const parentByChild=new Map();
  for(const ref of parentManifest.links){
    if(parentByChild.has(ref.child_id))throw new Error('duplicate source parent link');
    parentByChild.set(ref.child_id,ref);
  }
  const legacy=key0Evidence(deprecatedKey0);
  const catalogVersion=versionString(itemManifest.version);
  const catalogVersionMatches=catalogVersion===saveVersion;
  const supportedNativeFixtureVersion=KNOWN_SAVES.has(saveVersion);
  const describe = (id) => {
    signedItemId(id);
    const source=lookupItem(sourceById,id),parent=parentByChild.get(id)??null;
    const def=source?.collection_key?defByKey.get(source.collection_key)??null:null;
    const state=source===null?'UNKNOWN_SOURCE_ID':source.extraction==='unknown'? 'SOURCE_MEMBERSHIP_UNKNOWN':
      source.collection_key? (def&&def.guid===source.collection_guid?'SOURCE_ASSIGNED':'SOURCE_RELATION_MISMATCH') :
      'EXPLICITLY_UNASSIGNED';
    const raw=history.get(id),recorded=history.has(id),timestamp=recorded?inspectCollectionSavedTicks(raw):null;
    const warnings=[];
    if(!supportedNativeFixtureVersion)warnings.push('NEW_SAVE_VERSION_NOT_NATIVE_VERIFIED');
    if(!catalogVersionMatches)warnings.push('CATALOG_VERSION_DIFFERENT_FROM_SAVE');
    if(state!=='SOURCE_ASSIGNED')warnings.push('COLLECTION_MEMBERSHIP_NOT_VERIFIED');
    if(recorded&&timestamp.state!=='CALENDAR_VALUE')warnings.push('SAVED_TICKS_SEMANTICS_UNKNOWN');
    if(def?.requires_group_dlc)warnings.push('DLC_ENTITLEMENT_UNVERIFIED');
    if(def?.event_source_defined)warnings.push('EVENT_ELIGIBILITY_UNVERIFIED');
    if(def?.hidden||def?.hide_all_collectables)warnings.push('HIDDEN_VISIBILITY_RULE_UNVERIFIED');
    if(parent?.relation==='cross-collection'||parent?.relation==='unassigned-child')
      warnings.push('CROSS_COLLECTION_PARENT_FAMILY_UNVERIFIED');
    return Object.freeze({schema:'HKIA.CollectionSemanticRow.1',itemId:id,
      label:source?.key??`Item ID ${id}`,sourceKey:source?.key??null,sourceGuid:source?.guid??null,
      categoryKey:def?.group??null,definitionKey:def?.key??null,membership:state,
      recorded,rawTicks:raw??null,timestamp,sourceParentId:parent?.parent_id??null,
      sourceParentRelation:parent?.relation??null,sourceGroupByParent:def?.group_items_by_parent===true,
      sourceDlcGate:Boolean(def?.requires_group_dlc),sourceEventGate:Boolean(def?.event_source_defined),
      sourceEventYear:def?.event_source_defined?def.event_year:null,
      sourceHidden:Boolean(def?.hidden),sourceHideCollectables:Boolean(def?.hide_all_collectables),
      warnings:copyWarnings(warnings),gameProgressVerified:false,
      canDraftExistingRecord:recorded,applyAuthorized:false});
  };
  return Object.freeze({schema:'HKIA.CollectionMutationEvidence.1',saveVersion,catalogVersion,
    knownFixtureVersion:supportedNativeFixtureVersion,catalogVersionMatches,
    historyCount:entries.length,deprecatedKey0:legacy,linkage:LINKAGE,writerEnabled:false,
    structuralReadVerified:true,rawMapKeyUniquenessVerified:false,rawOpaqueCoverageVerified:false,
    getItem:describe,
    getEntries(){return entries;},
    list({offset=0,limit=100,query='',membership='ALL'}={}){
      if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>100)
        throw new RangeError('invalid pagination');
      if(typeof query!=='string'||query.length>200)throw new TypeError('invalid query');
      if(!['ALL','SOURCE_ASSIGNED','EXPLICITLY_UNASSIGNED','SOURCE_MEMBERSHIP_UNKNOWN','UNKNOWN_SOURCE_ID','SOURCE_RELATION_MISMATCH'].includes(membership))
        throw new TypeError('invalid membership');
      const q=query.toLowerCase(),found=[];
      for(const [id] of entries){const row=describe(id);
        if((membership==='ALL'||row.membership===membership)&&(!q||String(id).includes(q)||row.label.toLowerCase().includes(q)))found.push(row);
      }
      return Object.freeze({total:found.length,offset,items:Object.freeze(found.slice(offset,offset+limit))});
    }
  });
}

export function planCollectionMutation(evidence,{itemId,operation,expectedSaveVersion,
  expectedPresent,expectedTicks=null,newTicks=null}={}){
  if(evidence?.schema!=='HKIA.CollectionMutationEvidence.1')throw new TypeError('wrong evidence schema');
  signedItemId(itemId);
  if(!OPERATIONS.has(operation)||typeof expectedPresent!=='boolean')throw new TypeError('explicit operation/presence CAS required');
  const row=evidence.getItem(itemId),issues=[],warnings=[...row.warnings];
  if(expectedSaveVersion!==evidence.saveVersion)issues.push('SAVE_VERSION_CAS_MISMATCH');
  if(row.recorded!==expectedPresent)issues.push('PRESENCE_CAS_MISMATCH');
  if(expectedPresent){
    if(expectedTicks===null||expectedTicks===undefined)issues.push('OLD_TICKS_CAS_REQUIRED');
    else {
      try{if(normalizeSavedCollectionInt64(expectedTicks)!==row.rawTicks)issues.push('OLD_TICKS_CAS_MISMATCH');}
      catch{issues.push('OLD_TICKS_CAS_INVALID');}
    }
  } else if(expectedTicks!==null&&expectedTicks!==undefined)issues.push('UNEXPECTED_OLD_TICKS');
  let proposed=null;
  if(operation==='add'||operation==='set-time'){
    if(newTicks===null||newTicks===undefined)issues.push('EXPLICIT_NEW_TICKS_REQUIRED');
    else {try{proposed=inspectCollectionSavedTicks(newTicks);
      if(proposed.state!=='CALENDAR_VALUE')issues.push('NEW_TICKS_NOT_PROVEN_CALENDAR');}
      catch{issues.push('NEW_TICKS_INVALID_INT64');}}
  }else if(newTicks!==null&&newTicks!==undefined)issues.push('REMOVE_CANNOT_REPLACE_TICKS');
  if(operation==='add'){
    if(row.recorded)issues.push('ALREADY_RECORDED');
    if(row.membership!=='SOURCE_ASSIGNED')issues.push('NEW_RECORD_REQUIRES_VERIFIED_SOURCE_MEMBERSHIP');
  }
  if(operation==='remove'&&!row.recorded)issues.push('MISSING_TARGET_RECORD');
  if(operation==='set-time'){
    if(!row.recorded)issues.push('MISSING_TARGET_RECORD');
    else if(proposed?.rawTicks===row.rawTicks)issues.push('NO_CHANGE');
  }
  if(!evidence.catalogVersionMatches)warnings.push('CROSS_VERSION_SOURCE_MAPPING_NOT_AUTHORITATIVE');
  if(row.sourceDlcGate)warnings.push('DLC_GATE_REQUIRES_RUNTIME_EVIDENCE_FOR_APPLY');
  if(row.sourceEventGate)warnings.push('EVENT_GATE_REQUIRES_RUNTIME_EVIDENCE_FOR_APPLY');
  warnings.push('INVENTORY_RECONCILIATION_UNVERIFIED','PARENT_AND_CATEGORY_PROGRESS_DIAGNOSTIC_ONLY',
    'COLLECTION_TO_ACHIEVEMENT_QUEST_UNLOCK_REWARD_CACHE_UNKNOWN',
    'KEY0_MIGRATION_SEMANTICS_UNKNOWN','UTC_AND_UNSET_SEMANTICS_UNKNOWN');
  const canDraft=issues.length===0;
  const after=operation==='remove'?Object.freeze({recorded:false,rawTicks:null}):
    Object.freeze({recorded:true,rawTicks:proposed?.rawTicks??null});
  return Object.freeze({schema:'HKIA.CollectionMutationPlan.1',itemId,operation,saveVersion:evidence.saveVersion,
    expected:Object.freeze({recorded:expectedPresent,rawTicks:expectedPresent?row.rawTicks:null}),
    after,canDraft,issues:copyWarnings(issues),warnings:copyWarnings(warnings),
    affectedSource:Object.freeze({categoryKey:row.categoryKey,definitionKey:row.definitionKey,
      parentId:row.sourceParentId,groupByParent:row.sourceGroupByParent,progressMayRecompute:true,
      groupOrGameCompletionVerified:false}),
    linkage:LINKAGE,writerEnabled:false,applyAuthorized:false,saveBytes:null,
    applyBlockers:copyWarnings(['WRITER_DISABLED','REQUIRED_LINKAGE_NOT_ESTABLISHED',
      'KEY0_AND_UNKNOWN_TOKENS_RAW_PRESERVATION_NOT_VERIFIED','NATIVE_SAVE_ACCEPTANCE_NOT_VERIFIED',
      ...(!evidence.knownFixtureVersion?['NEW_VERSION_NATIVE_CODEC_UNVERIFIED']:[]),
      ...(row.sourceDlcGate?['DLC_ENTITLEMENT_UNVERIFIED']:[]),
      ...(row.sourceEventGate?['EVENT_ELIGIBILITY_UNVERIFIED']:[]),
      ...(!canDraft?issues:[])])});
}

export function verifyCollectionSemanticDelta(evidence,plan,afterEntries,{opaqueBefore=null,opaqueAfter=null}={}){
  if(evidence?.schema!=='HKIA.CollectionMutationEvidence.1'||plan?.schema!=='HKIA.CollectionMutationPlan.1'
      ||!plan.canDraft||plan.saveVersion!==evidence.saveVersion)throw new Error('invalid draft plan');
  const before=evidence.getEntries(),after=pairs(afterEntries);
  const original=new Map(before),newMap=new Map(after);
  const id=plan.itemId,oldPos=before.findIndex(e=>e[0]===id),newPos=after.findIndex(e=>e[0]===id);
  if(plan.expected.recorded!==original.has(id)||plan.expected.recorded && original.get(id)!==plan.expected.rawTicks)
    throw new Error('precondition snapshot conflict');
  if(plan.operation==='add'){
    if(oldPos!==-1||newPos!==before.length||after.length!==before.length+1)throw new Error('add must append exactly one new key');
  }else if(plan.operation==='remove'){
    if(oldPos<0||newPos!==-1||after.length!==before.length-1)throw new Error('remove must affect exactly one key');
  }else if(oldPos<0||newPos!==oldPos||after.length!==before.length)
    throw new Error('set-time must preserve key position');
  if(plan.operation!=='remove'&&newMap.get(id)!==plan.after.rawTicks)throw new Error('wrong proposed ticks');
  const expectedOrder=before.filter(e=>e[0]!==id).map(e=>e[0]);
  const actualOrder=after.filter(e=>e[0]!==id).map(e=>e[0]);
  if(expectedOrder.length!==actualOrder.length||expectedOrder.some((x,i)=>actualOrder[i]!==x))
    throw new Error('untouched history key/order changed');
  for(const [key,ticks] of before)if(key!==id&&newMap.get(key)!==ticks)
    throw new Error(`untouched history ticks changed: ${key}`);
  let rawOpaqueWitnessVerified=false,rawOpaquePaths=0;
  if(opaqueBefore!==null||opaqueAfter!==null){
    if(opaqueBefore===null||opaqueAfter===null)throw new Error('unpaired opaque witnesses');
    const check=assertOpaqueCollectionTokensEqual(opaqueBefore,opaqueAfter);
    if(!opaqueBefore.some(x=>x.path==='trait/39/key0/deprecated'))
      throw new Error('deprecated Key0 token witness required');
    rawOpaqueWitnessVerified=true;rawOpaquePaths=check.paths;
  }
  return Object.freeze({schema:'HKIA.CollectionSemanticDeltaProof.1',itemId:id,operation:plan.operation,
    semanticKey1DeltaVerified:true,untouchedOrderAndTicksVerified:true,
    deprecatedKey0OpaqueWitnessVerified:rawOpaqueWitnessVerified,rawOpaquePaths,
    completeRawTokenCoverageVerified:false,unknownFieldsPreservedInNativeBytes:false,
    writerEnabled:false,applyAuthorized:false,saveBytes:null});
}
