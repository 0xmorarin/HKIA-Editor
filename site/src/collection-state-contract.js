   
                                                                         
                                                                               
                                                                         
                                                                        
   
import {reconcileCollectionItemIds} from './collection-progress.js';
import {reconcileParentFamilies} from './collection-parent-progress.js';

const MAX_DATETIME_TICKS=3155378975999999999n;
const UNIX_EPOCH_TICKS=621355968000000000n;
const TICKS_PER_SECOND=10000000n;
const TICKS_PER_MILLISECOND=10000n;
const MAX_SIGNED_ITEM_ID=2147483647;

                                                                                      
export function normalizeCollectionTicks(value){
  if(typeof value==='number' && (!Number.isSafeInteger(value)||value<0))throw new TypeError('ticks number must be a nonnegative safe integer');
  if(typeof value==='string' && (value.length>19||!/^(?:0|[1-9]\d*)$/.test(value)))throw new TypeError('ticks must be an unsigned decimal string');
  if(typeof value!=='number'&&typeof value!=='string'&&typeof value!=='bigint')throw new TypeError('ticks type is unsupported');
  const ticks=BigInt(value);
  if(ticks<=0n||ticks>MAX_DATETIME_TICKS)throw new RangeError('ticks outside supported DateTime range');
  return ticks.toString();
}

   
                                                                            
                                                                         
   
export function collectionTicksCalendar(value){
  const ticks=BigInt(normalizeCollectionTicks(value));
  const delta=ticks-UNIX_EPOCH_TICKS;
  let milliseconds=delta/TICKS_PER_MILLISECOND;
  if(delta%TICKS_PER_MILLISECOND<0n)milliseconds-=1n;                      
  const date=new Date(Number(milliseconds));
  if(!Number.isFinite(date.getTime()))throw new RangeError('ticks calendar out of range');
  const fractions=(ticks%TICKS_PER_SECOND).toString().padStart(7,'0');
  return {calendar:date.toISOString().slice(0,19)+'.'+fractions,
    precision:'100ns',timeZone:'UNKNOWN',dateTimeKind:'UNKNOWN',ticks:ticks.toString()};
}

function normalizeHistoryEntries(entryList,knownIds){
  if(entryList===undefined || entryList===null)return null;
  if(!(entryList instanceof Map)&&!Array.isArray(entryList))throw new TypeError('history must be a Map or pair array');
  const result=new Map();
  for(const pair of entryList){
    if(!Array.isArray(pair)||pair.length!==2)throw new TypeError('history pair is invalid');
    const [id,ticks]=pair;
    if(!Number.isSafeInteger(id)||id<0||result.has(id))throw new Error('history item ID invalid or duplicate');
    result.set(id,normalizeCollectionTicks(ticks));
  }
  if(result.size!==knownIds.size||[...result.keys()].some(id=>!knownIds.has(id)))throw new Error('history ticks and recorded IDs do not match');
  return result;
}

export function buildCollectionReadModel({itemManifest,definitions,parentManifest,collectedItemIds,historyEntries=null,saveVersion}){
  if(!['3.0.0','3.0.1'].includes(saveVersion))throw new Error('unsupported save version');
  if(!Array.isArray(collectedItemIds))throw new TypeError('collectedItemIds must be an array');
  const direct=reconcileCollectionItemIds(itemManifest,definitions,collectedItemIds);
  const family=reconcileParentFamilies(parentManifest,direct);
  const ticks=normalizeHistoryEntries(historyEntries,direct.recordedSet);
  const knownUnassigned=[],unresolved=[];
  for(const item of direct.unassigned){
    if(item.extraction==='unknown')unresolved.push(item.id);
    else knownUnassigned.push(item.id);
  }
  const sourceUnresolved=itemManifest.items.filter(x=>x.extraction==='unknown');
  if(sourceUnresolved.length!==itemManifest.counts?.unresolved)throw new Error('source unresolved count mismatch');
  const categories=[...new Set(definitions.map(x=>x.group))];
  const byDefinition=new Map();
  for(const def of definitions){
    const source=direct.byKey.get(def.key),group=family.byKey.get(def.key);
    if(!source||!group||def.guid!==source.definition.guid)throw new Error('definition/source mismatch');
    byDefinition.set(def.key,Object.freeze({
      key:def.key,group:def.group,guid:def.guid,
      sourceItemCount:source.items.length,historyRecordedCount:source.recorded.length,
      sourceParentFamilyCount:group.familyTotal,sourceParentFamilyRecordedCount:group.familyRecorded,
                                                                                   
      gates:Object.freeze({requiresGroupDlc:Boolean(def.requires_group_dlc),hasEventReference:Boolean(def.event_source_defined),eventYear:def.event_year,
        sourceHidden:Boolean(def.hidden),hideAllCollectables:Boolean(def.hide_all_collectables),
        eligibility:'UNKNOWN',runtimeVisible:'UNKNOWN'}),
      gamePercentVerified:false,gameCompleteVerified:false,editable:false
    }));
  }
  const sourceById=direct.byId;
  const getItem=(id)=>{
    const item=sourceById.get(id),recorded=direct.recordedSet.has(id);
    const status=!item?'UNKNOWN_SOURCE_ID':item.extraction==='unknown'?'UNKNOWN_COLLECTION_MEMBERSHIP':
      !item.collection_key?'UNASSIGNED_SOURCE_ITEM':recorded?'HISTORY_RECORDED':'NO_HISTORY_RECORD';
    const parent=family.parentByChild.get(id);
    return Object.freeze({id,sourceKey:item?.key??null,sourceGuid:item?.guid??null,
      collectionKey:item?.collection_key??null,collectionGuid:item?.collection_guid??null,
      status,historyRecorded:recorded,historyTicks:recorded?(ticks?.get(id)??null):null,
      historyTimeKnown:recorded&&ticks!==null,
      parentId:parent?.parent_id??null,parentRelation:parent?.relation??null,
      editable:false});
  };
  return Object.freeze({
    schema:'HKIA.CollectionReadContract.1',sourceVersion:itemManifest.version,saveVersion,
    versionCrosswalk:Boolean(itemManifest.version!==saveVersion),
    categories:Object.freeze(categories),byDefinition,
    counts:Object.freeze({categories:categories.length,definitions:byDefinition.size,sourceItems:sourceById.size,
      sourceAssigned:itemManifest.items.filter(x=>Boolean(x.collection_key)).length,
      sourceUnresolved:sourceUnresolved.length,sourceExplicitUnassigned:itemManifest.items.filter(x=>x.collection_key===null&&x.extraction!=='unknown').length,history:direct.recordedSet.size,historyKnownAssigned:direct.mappedCount,
      historyKnownUnassigned:knownUnassigned.length,historyUnresolved:unresolved.length,historyUnknownSource:direct.unknown.length,
      sourceParentLinks:family.parentByChild.size}),
    exceptions:Object.freeze({unknownSourceIds:Object.freeze([...direct.unknown]),
      historySourceUnresolvedIds:Object.freeze(unresolved),historyExplicitUnassignedIds:Object.freeze(knownUnassigned)}),
    gamePercentVerified:false,eligibilityVerified:false,writerEnabled:false,
    getItem,
    listDefinitionItems(key,{offset=0,limit=100,query='',state='all'}={}){
      const d=direct.byKey.get(key);if(!d)throw new Error('unknown collection definition');
      if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>100)throw new RangeError('invalid bounded pagination');
      if(!['all','history-recorded','no-history-record'].includes(state)||typeof query!=='string'||query.length>200)throw new Error('invalid source item filter');
      const q=query.toLowerCase();
      const matched=d.items.filter(x=>(!q||x.key.toLowerCase().includes(q)||String(x.id).includes(q))&&
        (state==='all'||direct.recordedSet.has(x.id)===(state==='history-recorded')));
      return Object.freeze({total:matched.length,offset,items:Object.freeze(matched.slice(offset,offset+limit).map(x=>getItem(x.id)))});
    }
  });
}

   
                                                                              
                                                                      
   
export function assessCollectionEditIntent(model,{itemId,operation,expectedRecorded,expectedTicks=null,proposedTicks=null}){
  if(model?.schema!=='HKIA.CollectionReadContract.1')throw new TypeError('invalid collection read model');
  if(!Number.isSafeInteger(itemId)||itemId<=0||itemId>MAX_SIGNED_ITEM_ID)throw new RangeError('ItemId must be positive signed int32');
  if(!['record','remove','set-time'].includes(operation))throw new Error('unsupported collection edit operation');
  if(typeof expectedRecorded!=='boolean')throw new Error('explicit expectedRecorded is required');
  const before=model.getItem(itemId),blockers=[],warnings=[];
  if(before.status==='UNKNOWN_SOURCE_ID')blockers.push('UNKNOWN_ITEM_ID');
  if(before.status==='UNASSIGNED_SOURCE_ITEM'||before.status==='UNKNOWN_COLLECTION_MEMBERSHIP')blockers.push('UNVERIFIED_COLLECTION_MEMBERSHIP');
  if(before.historyRecorded!==expectedRecorded)blockers.push('STALE_HISTORY_PRESENCE');
  if(before.historyRecorded){
    if(!before.historyTimeKnown)blockers.push('HISTORY_TICKS_NOT_EXPOSED_BY_READER');
    if(expectedTicks===null)blockers.push('EXPECTED_TICKS_REQUIRED');
    else if(before.historyTicks!==normalizeCollectionTicks(expectedTicks))blockers.push('STALE_HISTORY_TICKS');
  }else if(expectedTicks!==null)blockers.push('UNEXPECTED_TICKS_FOR_ABSENT_RECORD');
  let newTicks=null;
  if(operation==='record'||operation==='set-time'){
    if(proposedTicks===null)blockers.push('EXPLICIT_NEW_TICKS_REQUIRED');
    else newTicks=normalizeCollectionTicks(proposedTicks);
  }else if(proposedTicks!==null)blockers.push('REMOVE_MUST_NOT_HAVE_NEW_TICKS');
  const def=before.collectionKey?model.byDefinition.get(before.collectionKey):null;
  if(def?.gates.requiresGroupDlc)warnings.push('DLC_ENTITLEMENT_UNVERIFIED');
  if(def?.gates.hasEventReference)warnings.push('EVENT_ELIGIBILITY_UNVERIFIED');
  warnings.push('INVENTORY_AND_SERVER_RECONCILIATION_UNVERIFIED',
    'PARENT_GROUP_PROGRESS_UNVERIFIED','QUEST_UNLOCK_ACHIEVEMENT_REWARD_LINKAGE_UNVERIFIED',
    'NATIVE_SAVE_ACCEPTANCE_UNVERIFIED');
  if(operation==='record'&&before.historyRecorded||operation==='remove'&&!before.historyRecorded||operation==='set-time'&&!before.historyRecorded||operation==='set-time'&&before.historyTicks===newTicks)blockers.push('NO_OP_OR_INVALID_TRANSITION');
  blockers.push('WRITER_AND_REQUIRED_LINKAGE_NOT_VERIFIED');
  return Object.freeze({schema:'HKIA.CollectionEditIntent.1',itemId,operation,
    expectedRecorded,beforeTicks:before.historyTicks,afterTicks:newTicks,
    beforeRecorded:before.historyRecorded,afterRecorded:operation!=='remove',
    blockers:Object.freeze(blockers),warnings:Object.freeze(warnings),
    transactionRequired:true,applyAuthorized:false,gameOutcomeVerified:false});
}
