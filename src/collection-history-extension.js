
import {collectionTicksCalendar, assessCollectionEditIntent} from './collection-state-contract.js';

const MAX_PAGE=100;
const MIN_I32=-2147483648, MAX_I32=2147483647;
const MIN_I64=-(1n<<63n), MAX_I64=(1n<<63n)-1n;
const MAX_CALENDAR_TICKS=3155378975999999999n;

function i32(id){
  if(typeof id!=='number'||!Number.isSafeInteger(id)||id<MIN_I32||id>MAX_I32)
    throw new TypeError('collection history ItemId must be signed int32');
  return id;
}


export function normalizeSavedCollectionInt64(value){
  if(typeof value==='number' && !Number.isSafeInteger(value))throw new TypeError('unsafe number would lose int64 precision');
  if(typeof value==='string' && !/^(?:0|-[1-9][0-9]*|[1-9][0-9]*)$/.test(value))throw new TypeError('invalid signed decimal int64');
  if(!['string','bigint','number'].includes(typeof value))throw new TypeError('invalid signed int64 value');
  const n=BigInt(value);
  if(n<MIN_I64||n>MAX_I64)throw new RangeError('outside signed int64 range');
  return n.toString();
}


export function inspectCollectionSavedTicks(value){
  const rawTicks=normalizeSavedCollectionInt64(value),n=BigInt(rawTicks);
  const valid=n>0n&&n<=MAX_CALENDAR_TICKS;
  return Object.freeze({
    rawTicks,
    state:valid?'CALENDAR_VALUE':n===0n?'ZERO_SEMANTICS_UNKNOWN':'OUTSIDE_DATETIME_CALENDAR',
    calendar:valid?collectionTicksCalendar(rawTicks).calendar:null,
    units:'100ns',dateTimeKind:'UNKNOWN',timeZone:'UNKNOWN',utcVerified:false,
    isUnsetVerified:false
  });
}

function rawEntriesMap(input,ids){
  if(input==null)return null;
  if(!Array.isArray(input)&&!(input instanceof Map))throw new TypeError('raw history entries must be Map or pair array');
  const map=new Map();
  for(const pair of input){
    if(!Array.isArray(pair)||pair.length!==2)throw new TypeError('history entry must be [ItemId, ticks]');
    const id=i32(pair[0]);
    if(map.has(id))throw new Error('duplicate history ItemId; raw MessagePack map must also be checked by 04');
    map.set(id,inspectCollectionSavedTicks(pair[1]));
  }
  if(map.size!==ids.size||[...map.keys()].some(id=>!ids.has(id)))throw new Error('history entries / IDs mismatch');
  return map;
}


export function createCollectionHistoryDisplay({model,recordedItemIds,rawHistoryEntries=null}){
  if(model?.schema!=='HKIA.CollectionReadContract.1')throw new TypeError('unexpected collection model version');
  if(!Array.isArray(recordedItemIds))throw new TypeError('recorded IDs must be an array');
  const ids=new Set();
  for(const id of recordedItemIds){i32(id);if(ids.has(id))throw new Error('duplicate recorded ItemId');ids.add(id);}
  if(ids.size!==model.counts.history)throw new Error('model / recorded history count mismatch');
  const raw=rawEntriesMap(rawHistoryEntries,ids);
  const rows=[],byId=new Map();
  const counts={ASSIGNED:0,EXPLICITLY_UNASSIGNED:0,SOURCE_MEMBERSHIP_UNKNOWN:0,UNKNOWN_SOURCE_ID:0,
    CALENDAR_VALUE:0,ZERO_SEMANTICS_UNKNOWN:0,OUTSIDE_DATETIME_CALENDAR:0,TIMESTAMP_NOT_EXPOSED:0};
  for(const id of recordedItemIds){
    const item=model.getItem(id);
    if(!item.historyRecorded)throw new Error('model / recorded presence mismatch');
    const membership=item.status==='HISTORY_RECORDED'?'ASSIGNED':
      item.status==='UNASSIGNED_SOURCE_ITEM'?'EXPLICITLY_UNASSIGNED':
      item.status==='UNKNOWN_COLLECTION_MEMBERSHIP'?'SOURCE_MEMBERSHIP_UNKNOWN':'UNKNOWN_SOURCE_ID';
    const def=item.collectionKey?model.byDefinition.get(item.collectionKey):null;
    if(membership==='ASSIGNED'&&!def)throw new Error('missing definition for source-assigned item');
    const timestamp=raw?.get(id)??(item.historyTimeKnown?inspectCollectionSavedTicks(item.historyTicks):null);
    if(raw&&item.historyTimeKnown&&item.historyTicks!==timestamp.rawTicks)throw new Error('reader and raw history ticks differ');
    const timestampState=timestamp?.state??'TIMESTAMP_NOT_EXPOSED';
    counts[membership]++;counts[timestampState]++;
    const warnings=[];
    if(def?.gates.requiresGroupDlc)warnings.push('DLC_ENTITLEMENT_NOT_VERIFIED');
    if(def?.gates.hasEventReference)warnings.push('EVENT_ACTIVATION_NOT_VERIFIED');
    if(membership!=='ASSIGNED')warnings.push('NO_VERIFIED_COLLECTION_CATEGORY');
    if(model.versionCrosswalk)warnings.push('CATALOG_SAVE_VERSION_DIFFERENT');
    if(timestamp?.state!=='CALENDAR_VALUE')warnings.push('TIMESTAMP_SEMANTICS_NOT_VERIFIED');
    const row=Object.freeze({
      itemId:id,
      
      displayLabel:`Item ID ${id}`,
      technicalKey:item.sourceKey??null,sourceGuid:item.sourceGuid??null,
      historyPresence:'RECORDED',historyRecorded:true,
      membership,categoryKey:def?.group??null,definitionKey:def?.key??null,
      
      uiBucket:membership==='ASSIGNED'?'SOURCE_DEFINITION':'HISTORY_WITHOUT_VERIFIED_CATEGORY',
      sourceParentId:item.parentId,sourceParentRelation:item.parentRelation,
      timestamp:timestamp??Object.freeze({rawTicks:null,state:'TIMESTAMP_NOT_EXPOSED',calendar:null,
        units:'100ns',dateTimeKind:'UNKNOWN',timeZone:'UNKNOWN',utcVerified:false,isUnsetVerified:false}),
      gateWarnings:Object.freeze(warnings),
      entitlementVerified:false,eventEligibleVerified:false,gameCompletionVerified:false,
      editable:false,writerEnabled:false
    });
    rows.push(row);byId.set(id,row);
  }
  const readonlyCounts=Object.freeze(counts);
  return Object.freeze({
    schema:'HKIA.CollectionHistoryDisplay.2',saveVersion:model.saveVersion,sourceVersion:model.sourceVersion,
    counts:readonlyCounts,historyCount:rows.length,writerEnabled:false,
    preservation:Object.freeze({unknownHistoryIds:'PRESERVE',unknownCategory:'PRESERVE_AS_UNASSIGNED',
      deprecatedTraitKey0:'PRESERVE_RAW',unknownTraitFields:'PRESERVE_RAW',
      unknownTopLevelAndZipEntries:'PRESERVE_RAW',verifyCodecByteIdentityRequired:true}),
    getRecordedRow(id){return byId.get(i32(id))??null;},
    listRecorded({offset=0,limit=100,membership='ALL',query=''}={}){
      if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>MAX_PAGE)
        throw new RangeError('invalid history pagination');
      if(membership!=='ALL'&&!['ASSIGNED','EXPLICITLY_UNASSIGNED','SOURCE_MEMBERSHIP_UNKNOWN','UNKNOWN_SOURCE_ID'].includes(membership))
        throw new Error('unknown history membership filter');
      if(typeof query!=='string'||query.length>200)throw new Error('invalid history search');
      const q=query.toLowerCase();
      const matching=rows.filter(r=>(membership==='ALL'||r.membership===membership)&&
        (!q||String(r.itemId).includes(q)||r.technicalKey?.toLowerCase().includes(q)));
      return Object.freeze({total:matching.length,offset,items:Object.freeze(matching.slice(offset,offset+limit))});
    }
  });
}


export function assessCollectionHistoryTransition({model,display,itemId,operation,expectedRecorded,
  expectedTicks=null,proposedTicks=null,expectedSaveVersion}){
  if(model?.schema!=='HKIA.CollectionReadContract.1'||display?.schema!=='HKIA.CollectionHistoryDisplay.2')
    throw new TypeError('collection contracts must be paired');
  const blockers=[],warnings=[];
  if(expectedSaveVersion!==model.saveVersion)blockers.push('STALE_OR_WRONG_SAVE_VERSION');
  const existing=display.getRecordedRow(itemId);
  if(existing?.timestamp.state!=='CALENDAR_VALUE'&&existing?.historyRecorded)
    blockers.push('EXISTING_TIMESTAMP_NOT_A_VERIFIED_CALENDAR_VALUE');
  if(existing?.timestamp.state==='CALENDAR_VALUE'&&expectedTicks!==null){
    let expected;
    try{expected=normalizeSavedCollectionInt64(expectedTicks);}catch{expected=null;}
    if(existing.timestamp.rawTicks!==expected)blockers.push('RAW_TIMESTAMP_COMPARE_AND_SWAP_FAILED');
  }
  let base;
  if(!blockers.includes('EXISTING_TIMESTAMP_NOT_A_VERIFIED_CALENDAR_VALUE')){
    base=assessCollectionEditIntent(model,{itemId,operation,expectedRecorded,expectedTicks,proposedTicks});
    blockers.push(...base.blockers);warnings.push(...base.warnings);
  }else{
    blockers.push('NO_SAFE_EDIT_INTENT_FOR_UNVERIFIED_TIMESTAMP');
  }
  if(existing?.gateWarnings)warnings.push(...existing.gateWarnings);
  
  blockers.push('SOURCE_RAW_TOKEN_PRESERVATION_NOT_VERIFIED','LINKED_SIDE_EFFECTS_NOT_VERIFIED');
  return Object.freeze({schema:'HKIA.CollectionHistoryTransition.2',operation,itemId,
    blockers:Object.freeze([...new Set(blockers)]),warnings:Object.freeze([...new Set(warnings)]),
    preconditions:Object.freeze(['EXACT_SAVE_VERSION','HISTORY_PRESENCE_CAS','RAW_TIMESTAMP_CAS_IF_PRESENT',
      'PROVEN_SOURCE_MEMBERSHIP','EXPLICIT_NEW_100NS_TICKS_IF_RECORDING','EXACT_UNKNOWN_TOKEN_PRESERVATION',
      'REQUIRED_LINKAGE_CONTRACT','FULL_REPARSE_DIFF_VERIFICATION','NATIVE_ACCEPTANCE']),
    after:base?Object.freeze({recorded:base.afterRecorded,rawTicks:base.afterTicks}):null,
    applyAuthorized:false,transactionRequired:true,saveBytes:null});
}


export function assertOpaqueCollectionTokensEqual(before,after){
  const asIndex=(entries)=>{
    if(!Array.isArray(entries))throw new TypeError('token list must be an array');
    const map=new Map();
    for(const entry of entries){
      if(typeof entry?.path!=='string'||!entry.path||!(entry.bytes instanceof Uint8Array)||map.has(entry.path))
        throw new TypeError('invalid or duplicate opaque token path');
      map.set(entry.path,entry.bytes);
    }
    return map;
  };
  const a=asIndex(before),b=asIndex(after);
  if(a.size!==b.size)throw new Error('opaque field was added or removed');
  let bytes=0;
  for(const [path,x] of a){
    const y=b.get(path);
    if(!y||y.length!==x.length||x.some((v,i)=>v!==y[i]))throw new Error(`opaque token changed: ${path}`);
    bytes+=x.byteLength;
  }
  return Object.freeze({verified:true,paths:a.size,bytes,writerEnabled:false});
}
