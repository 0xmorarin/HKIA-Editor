import {buildCollectionReadModel} from './collection-state-contract.js';
import {createCollectionHistoryDisplay,inspectCollectionSavedTicks} from './collection-history-extension.js';

export function assembleCollectionHistoryUI({itemManifest,definitions,parentManifest,collectedItemIds,historyEntries,saveVersion}){
  if(!Array.isArray(collectedItemIds))throw new TypeError('saved collection IDs required');
  if(historyEntries!==null&&historyEntries!==undefined&&!Array.isArray(historyEntries))throw new TypeError('raw saved history pairs required');
  const hasNonCalendar=historyEntries?.some(pair=>{
    if(!Array.isArray(pair)||pair.length!==2)throw new TypeError('invalid history pair');
    return pair[0]<0||inspectCollectionSavedTicks(pair[1]).state!=='CALENDAR_VALUE';
  })??false;
  const model=buildCollectionReadModel({itemManifest,definitions,parentManifest,collectedItemIds,
    historyEntries:hasNonCalendar?null:historyEntries,saveVersion});
  const display=createCollectionHistoryDisplay({model,recordedItemIds:collectedItemIds,
    rawHistoryEntries:historyEntries??null});
  if(display.historyCount!==model.counts.history||display.writerEnabled!==false)throw new Error('history display contract mismatch');
  return Object.freeze({schema:'HKIA.Web05.CollectionHistoryUI.1',model,display,
    fallbackNoCalendar:hasNonCalendar,writerEnabled:false});
}

export function collectionHistoryUiStatus({model,display,itemId}){
  if(model?.schema!=='HKIA.CollectionReadContract.1'||display?.schema!=='HKIA.CollectionHistoryDisplay.2')
    throw new TypeError('typed Collection contracts required');
  const item=model.getItem(itemId),saved=display.getRecordedRow(itemId);
  if(Boolean(saved)!==item.historyRecorded)throw new Error('recorded history presence mismatch');
  const timestamp=saved?.timestamp??null;
  return Object.freeze({schema:'HKIA.Web05.CollectionItemStatus.1',itemId,
    membership:saved?.membership??item.status,recorded:Boolean(saved),
    timestampState:timestamp?.state??'NO_HISTORY_RECORD',rawTicks:timestamp?.rawTicks??null,
    calendar:timestamp?.calendar??null,units:'100ns',dateTimeKind:'UNKNOWN',timeZone:'UNKNOWN',
    utcVerified:false,gateWarnings:saved?.gateWarnings??Object.freeze([]),
    editable:false,exportAuthorized:false});
}
