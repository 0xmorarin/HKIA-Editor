import {validateRecord} from './account.js';
import {classifyRecordCompatibility} from './forward-compat-policy.js';
import {assessCollectionEditIntent} from './collection-state-contract.js';
import {assessCollectionHistoryTransition} from './collection-history-extension.js';

const EDIT_FIELDS=['IsComplete','CurrentValue','CompletedTime'];
const labels={IsComplete:'達成状態',CurrentValue:'現在の進捗値',CompletedTime:'達成日時（UTC）'};
export const SLOT_WRITER_CAPABILITY=Object.freeze({enabled:false,reason:'Save slot / Collections writer は未受入です。元セーブの変更・出力はできません。',dependencyStatus:'UNKNOWN'});

export function accountChangeSet(original,updated){
  if(!original||!updated)return [];
  const changes=[];
  for(const [guid,after] of Object.entries(updated.Achievements||{})){
    const before=original.Achievements?.[guid];
    if(!before)throw new Error('原本に存在しない実績を編集できません');
    const fields=EDIT_FIELDS.filter(field=>before[field]!==after[field]).map(field=>({field,label:labels[field],before:before[field],after:after[field]}));
    if(fields.length)changes.push({guid,fields});
  }
  if(Object.keys(original.Achievements||{}).length!==Object.keys(updated.Achievements||{}).length)throw new Error('実績の増減は未対応です');
  return changes;
}

export function previewAccountChange(account,guid,changes){
  const previous=account?.Achievements?.[guid];
  if(!previous)throw new Error('対象GUIDが見つかりません');
  const next={...previous,...changes};
  validateRecord(next);
  const fields=EDIT_FIELDS.filter(field=>previous[field]!==next[field]).map(field=>({field,label:labels[field],before:previous[field],after:next[field]}));
  return {guid,fields,after:next,linkedChanges:[],warnings:[
    '関連カウンター・グループ進捗・報酬・実績同期は自動更新されません。',
    'Account にのみ適用します。Save slot は変更しません。'
  ]};
}

export function batchAccountPlan(account,guids,complete,timestamp){
  if(!account||!Array.isArray(guids)||!guids.length||guids.length>1000)throw new Error('対象実績を選択してください');
  const unique=new Set(guids);
  if(unique.size!==guids.length)throw new Error('対象GUIDが重複しています');
  const edits=[];
  for(const guid of guids){
    const current=account.Achievements?.[guid];
    if(!current)throw new Error('未保存の実績は一括編集できません');
    if(current.IsComplete===complete)continue;
    const proposed=previewAccountChange(account,guid,{IsComplete:complete,CompletedTime:complete?timestamp:null});
    if(proposed.fields.length)edits.push(proposed);
  }
  return {edits,count:edits.length,scope:'Account/Achievements',linkedChanges:[],
    warnings:['関連カウンターや Save slot の変更は含みません。達成条件・報酬・プラットフォーム反映は未検証です。']};
}

export function filterSortAchievements(rows,{query='',filter='all',sort='source',searchText}={}){
  const q=query.trim().toLocaleLowerCase();
  const entries=rows.filter(row=>{
    if(filter==='complete'&&row.complete!==true)return false;
    if(filter==='incomplete'&&row.complete!==false)return false;
    if(filter==='missing'&&row.kind!=='slot-missing')return false;
    if(filter==='unknown-source'&&row.sourceKnown!==false)return false;
    return !q||String(searchText?searchText(row):`${row.guid} ${row.id}`).toLocaleLowerCase().includes(q);
  });
  if(sort==='source')return entries;
  return entries.map((row,index)=>({row,index})).sort((a,b)=>{
    const label=(row)=>String(searchText?searchText(row):row.guid).toLocaleLowerCase();
    let result=0;
    if(sort==='name')result=label(a.row).localeCompare(label(b.row),'ja');
    else if(sort==='progress-desc')result=(Number(b.row.current)||0)-(Number(a.row.current)||0);
    else if(sort==='progress-asc')result=(Number(a.row.current)||0)-(Number(b.row.current)||0);
    else if(sort==='completed-first')result=Number(b.row.complete===true)-Number(a.row.complete===true);
    return result||a.index-b.index;
  }).map(x=>x.row);
}

export function collectionHistoryStatus(loaded,memberCount,recordedCount){
  if(!loaded)return 'unknown';
  if(memberCount===0)return 'undefined';
  if(recordedCount===0)return 'no-record';
  if(recordedCount>=memberCount)return 'all-recorded';
  return 'partial';
}


export const WEB05_WRITER_PORT=Object.freeze({
  schema:'HKIA.Web05.WriterPort.1',
  approved:false,
  writerEnabled:false,
  supportedNativeDomains:Object.freeze(['achievement','counter','collection-history']),
  prepareOnly:true,
  prepareNative(request){
    if(!request||!['achievement','counter','collection-history'].includes(request.domain)||typeof request.saveVersion!=='string')throw new TypeError('typed native request required');
    const evidence=request.readEvidence;
    if(evidence!==undefined&&(evidence?.schema!=='HKIA.Web05.SlotDisplay.2'||evidence.version!==request.saveVersion))
      throw new TypeError('stale or untyped 04 reader evidence');
    const blockers=['NATIVE_WRITER_NOT_ACCEPTED'];
    if(evidence?.mode==='STRUCTURAL_READ_ONLY')blockers.push('STRUCTURAL_READ_ONLY_NO_NATIVE_EXPORT');
    if(evidence&&evidence.readable[request.domain]!==true)blockers.push('TARGET_DOMAIN_UNKNOWN');
    if(evidence&&(evidence.unknownUnionTokens>0||Object.values(evidence.extraFields).some(n=>n>0)))
      blockers.push('OPAQUE_UNION_FIELDS_REQUIRE_RAW_PRESERVATION');
    return Object.freeze({schema:'HKIA.Web05.WriterPrepare.1',domain:request.domain,saveVersion:request.saveVersion,
      readerSchema:evidence?.schema??null,requiredApi:'04_ACCEPTED_NATIVE_ATOMIC_TRANSACTION',
      blockers:Object.freeze(blockers),applyAuthorized:false,exportAuthorized:false,saveBytes:null});
  },
  apply(){throw new Error('NATIVE_WRITER_NOT_ACCEPTED');},
  exportNative(){throw new Error('NATIVE_WRITER_NOT_ACCEPTED');}
});

export function inspectCounterDraft({counter,definition=null,proposedCurrentValue}={}){
  if(!counter||typeof counter.guid!=='string'||!Number.isSafeInteger(counter.id)||
    typeof counter.current!=='number'||!Number.isFinite(counter.current)||
    typeof proposedCurrentValue!=='number'||!Number.isFinite(proposedCurrentValue)||proposedCurrentValue<0)
    throw new TypeError('typed saved counter preimage required');
  const count=counter.countedGuids;
  const legacy=counter.countedValues;
  if(!Number.isSafeInteger(count)||count<0||!(legacy===null||Array.isArray(legacy)))
    throw new TypeError('unrecognized counted history');
  const onlyCountUniques=typeof definition?.only_count_uniques==='boolean'?definition.only_count_uniques:null;
  const blockers=['NATIVE_WRITER_NOT_ACCEPTED'];
  const warnings=['RELATED: CountedGuids / CountedValues must be preserved',
    'UNKNOWN: Quest / Reward claim / Unlock / Cache',
    'UNKNOWN: native load-time counter recalculation'];
  if(count>0||legacy?.length>0)blockers.push('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE');
  if(onlyCountUniques===true&&count!==counter.current)blockers.push('UNIQUE_COUNT_VALUE_PREIMAGE_MISMATCH');
  if(onlyCountUniques===true&&proposedCurrentValue!==counter.current)blockers.push('UNIQUE_HISTORY_CONSTRUCTION_UNKNOWN');
  if(onlyCountUniques===null)warnings.push('SOURCE_COUNTER_UNIQUENESS_UNKNOWN');
  return Object.freeze({schema:'HKIA.Web05.CounterDraft.1',domain:'counter',id:counter.id,guid:counter.guid,
    before:counter.current,after:proposedCurrentValue,onlyCountUniques,
    countedGuidsCount:count,countedValuesState:legacy===null?'NULL':'PRESENT',
    countedValuesCount:legacy?.length??null,changed:counter.current!==proposedCurrentValue,
    blockers:Object.freeze(blockers),warnings:Object.freeze(warnings),applyAuthorized:false,exportAuthorized:false});
}

export function achievementReadStatus(record,sourceKnown){
  if(!record||!['slot','account','slot-missing'].includes(record.kind))throw new TypeError('invalid achievement record');
  if(record.kind==='slot-missing')return Object.freeze({status:'未保存（状態UNKNOWN）',timeStatus:'UNKNOWN（保存値なし）',mapped:true,label:null,nativeEditable:false,unrecognizedSource:false,
    compatibility:classifyRecordCompatibility({domain:'achievement',id:record.guid,schemaState:'EXACT',sourceIdentityKnown:true,recordAlreadyPersisted:false,requiredLinkageResolved:false,gates:{writerApproved:false}})});
  const status=record.complete===true?'達成済み':record.complete===false?'未達成':'UNKNOWN';
  const timeStatus=record.completed===null?'未設定':typeof record.completed==='string'?record.completed:'UNKNOWN';
  const compatibility=record.kind==='slot'?classifyRecordCompatibility({
    domain:'achievement',id:record.id,schemaState:'EXACT',sourceIdentityKnown:Boolean(sourceKnown),
    recordAlreadyPersisted:true,requiredLinkageResolved:false,gates:{writerApproved:false}
  }):null;
  return Object.freeze({status,timeStatus,mapped:Boolean(sourceKnown),
    label:sourceKnown?null:`実績 GUID ${record.guid}`,compatibility,
    nativeEditable:false,unrecognizedSource:!sourceKnown});
}

export function dependencyInspector({domain,key='',hasCounter=false,hasGroup=false,hasCollection=false}={}){
  if(!['account','slot','collection'].includes(domain))throw new TypeError('invalid dependency domain');
  const puzzle=domain==='slot'&&['achievement_puzzlesInTheStars','collection_puzzle'].includes(key);
  const related=[
    ...(domain==='account'?['Account 定義の関連カウンター（保存値との連動未検証）']:[]),
    ...(hasCounter?['実績カウンター・保存済み進捗']:[]),
    ...(hasGroup?['グループ進捗・親実績']:[]),
    ...(hasCollection?['収集履歴とコレクション定義の表示集計']:[])
  ];
  const unknown=domain==='collection'?
    ['収集日時の100ns保存値は取得可能。UTC / DateTime.Kindと解放条件はUNKNOWN','インベントリー・Quest・Unlock・報酬・Cache']:
    ['報酬の受取状態','Quest・Unlock・Cache・プラットフォーム同期'];
  return Object.freeze({schema:'HKIA.Web05.DependencyDisplay.1',domain,
    requiredConfirmed:0,requiredConditionalCandidate:puzzle?10:0,
    conditionalDescription:puzzle?'Puzzle Goals 終端達成の旧実測条件のみ：slot 8項目 + Account 2項目。現在の入力に対する条件検証と原子的出力は未実装。':'',
    related:Object.freeze(related),unknown:Object.freeze(unknown),
    independent:Object.freeze(['名称・カテゴリ画像など表示上の参照']),
    safeToAutoApply:false,writerAuthorized:false
  });
}

export function previewNativeAchievementIntent({record,mapped=false,sourceKey='',complete,current,completed}){
  if(!record||record.kind!=='slot'||typeof record.guid!=='string'||!Number.isSafeInteger(record.id))throw new TypeError('persisted slot record required');
  if(typeof complete!=='boolean'||typeof current!=='number'||!Number.isFinite(current)||current<0)throw new TypeError('invalid proposed achievement state');
  if(completed!==null&&(typeof completed!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?Z$/.test(completed)||!Number.isFinite(Date.parse(completed))))throw new TypeError('explicit UTC ISO timestamp required');
  if(complete&&completed===null)throw new Error('completion timestamp required');
  if(!complete&&completed!==null)throw new Error('incomplete achievement cannot have completion timestamp');
  const fields=[['IsComplete',record.complete,complete],['CurrentValue',record.current,current],['CompletedTime',record.completed,completed]]
    .filter(([,before,after])=>before!==after).map(([field,before,after])=>Object.freeze({field,before,after}));
  const deps=dependencyInspector({domain:'slot',key:sourceKey,hasCounter:Boolean(sourceKey),hasGroup:Boolean(sourceKey)});
  return Object.freeze({schema:'HKIA.Web05.NativeDryRun.1',domain:'achievement',id:record.id,guid:record.guid,
    mapped:Boolean(mapped),fields:Object.freeze(fields),dependencies:deps,
    blockers:Object.freeze(['WRITER_NOT_ACCEPTED','REQUIRED_LINKAGE_NOT_VALIDATED','GAME_ACCEPTANCE_NOT_VERIFIED']),
    applyAuthorized:false,exportAuthorized:false});
}

export function previewNativeCollectionIntent({model,display=null,itemId,operation,proposedTicks=null}){
  const before=model?.getItem(itemId);
  if(!before)throw new TypeError('item read model required');
  const recorded=display?.getRecordedRow(itemId)??null;
  const intent=display?assessCollectionHistoryTransition({model,display,itemId,operation,
    expectedRecorded:before.historyRecorded,expectedTicks:recorded?.timestamp.rawTicks??null,
    proposedTicks,expectedSaveVersion:model.saveVersion}):assessCollectionEditIntent(model,{itemId,operation,
    expectedRecorded:before.historyRecorded,expectedTicks:before.historyTicks,proposedTicks});
  const compat=classifyRecordCompatibility({domain:'collection-history',id:itemId,schemaState:'EXACT',
    sourceIdentityKnown:before.status!=='UNKNOWN_SOURCE_ID',recordAlreadyPersisted:before.historyRecorded,
    requiredLinkageResolved:false,gates:{writerApproved:false}});
  return Object.freeze({schema:'HKIA.Web05.NativeDryRun.1',domain:'collection-history',id:itemId,
    before,operation,rawBeforeTicks:recorded?.timestamp.rawTicks??before.historyTicks,
    timestampState:recorded?.timestamp.state??(before.historyRecorded?'TIMESTAMP_NOT_EXPOSED':'NO_HISTORY_RECORD'),
    afterRecorded:display?intent.after?.recorded??before.historyRecorded:intent.afterRecorded,
    afterTicks:display?intent.after?.rawTicks??null:intent.afterTicks,
    compatibility:compat,dependencies:dependencyInspector({domain:'collection',hasCollection:Boolean(before.collectionKey)}),
    blockers:Object.freeze([...new Set([...intent.blockers,...compat.blockers,'NATIVE_WRITER_NOT_ACCEPTED'])]),warnings:intent.warnings,
    applyAuthorized:false,exportAuthorized:false});
}
