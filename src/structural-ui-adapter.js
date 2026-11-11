import {readSave,readSaveStructurally} from './save.js';
import {assembleCollectionHistoryUI} from './collection-history-ui.js';
import {createCollectionHistoryDisplay} from './collection-history-extension.js';

export const SLOT_DISPLAY_SCHEMA='HKIA.Web05.SlotDisplay.2';
const DOMAINS=['achievement','counter','collection-history'];
const VALIDATED_VERSIONS=new Set(['3.0.0','3.0.1']);

function makeEvidence(save,mode,structural=null){
  const structuralOnly=mode==='STRUCTURAL_READ_ONLY';
  const readable=structuralOnly?structural.readable:Object.freeze({achievement:true,counter:true,'collection-history':true});
  const fields=structuralOnly?structural.extraFields:Object.freeze({achievement:0,counter:0});
  const warnings=[...DOMAINS.filter(d=>readable[d]!==true).map(d=>`DOMAIN_${d.toUpperCase().replace('-','_')}_UNKNOWN`)];
  if(structuralOnly){
    warnings.push('STRUCTURAL_READ_ONLY_NOT_NATIVE_VERIFIED','UNKNOWN_UNION_AND_APPENDED_FIELDS_PRESERVE_RAW',
      'SOURCE_DEFINITIONS_V301_REFERENCE_ONLY','QUEST_UNLOCK_REWARD_CLAIM_UNKNOWN');
    if(!structural.versionKnown)warnings.push('SAVE_VERSION_UNVERIFIED');
  }
  const evidence=Object.freeze({schema:SLOT_DISPLAY_SCHEMA,mode,version:save.version,
    versionKnown:VALIDATED_VERSIONS.has(save.version),readable:Object.freeze({...readable}),
    domainStates:Object.freeze(Object.fromEntries(DOMAINS.map(d=>[d,readable[d]?'READABLE':'UNKNOWN']))),
    extraFields:Object.freeze({...fields}),unknownUnionTokens:structural?.unknownUnionTokens??0,
    preservationRequired:true,writerEnabled:false,nativeExportAuthorized:false,
    accountExportAllowed:!structuralOnly,sourceMembershipVerified:!structuralOnly,
    warnings:Object.freeze(warnings)});
  return Object.freeze({schema:SLOT_DISPLAY_SCHEMA,evidence,save});
}

export function adaptStructuralSlotForDisplay(structural){
  if(structural?.schema!=='HKIA.04.StructuralReadOnly.1'||structural.writerEnabled!==false||structural.nativeExportAuthorized!==false||
     structural.preservationRequired!==true||!structural.readable||typeof structural.version!=='string'||
     !Array.isArray(structural.achievements)||!Array.isArray(structural.counters)||!Array.isArray(structural.collectionHistoryEntries))
    throw new TypeError('unaccepted 04 structural read contract');
  if(DOMAINS.some(d=>typeof structural.readable[d]!=='boolean')||
    !Number.isSafeInteger(structural.unknownUnionTokens)||structural.unknownUnionTokens<0)
    throw new TypeError('incomplete structural domain evidence');
  if(structural.readable.achievement===false&&structural.achievements.length||
     structural.readable.counter===false&&structural.counters.length||
     structural.readable['collection-history']===false&&structural.collectionHistoryEntries.length)
    throw new Error('unreadable domain must not expose guessed records');
  if(!DOMAINS.some(d=>structural.readable[d]))throw new Error('no structurally readable domains');
  const collectionReadable=structural.readable['collection-history'];
  const history=collectionReadable?structural.collectionHistoryEntries:[];
  if(collectionReadable&&(history.length!==structural.collectionHistoryCount||
    history.some(pair=>!Array.isArray(pair)||pair.length!==2||!Number.isInteger(pair[0])||
    pair[0]<-2147483648||pair[0]>2147483647||typeof pair[1]!=='string'||
    !/^(?:0|-[1-9]\d*|[1-9]\d*)$/.test(pair[1]))))throw new Error('unverified structural collection history');
  const save=Object.freeze({version:structural.version,achievements:structural.achievements,
    counters:structural.counters,collections:collectionReadable?Object.freeze({historyEntries:history.length,deprecatedEntries:null}):null,
    collectedItemIds:Object.freeze(history.map(pair=>pair[0])),collectionHistoryEntries:history,
    meta:Object.freeze({header:null}),isStructuralReadOnly:true});
  return makeEvidence(save,'STRUCTURAL_READ_ONLY',structural);
}

export function readSlotForDisplay(bytes){
  try{
    const save=readSave(bytes);
    return makeEvidence(save,'VALIDATED_BASELINE_READ');
  }catch(err){
    if(!/未検証の保存バージョン|モデル構造が不正です/.test(String(err?.message)))throw err;
    const structural=readSaveStructurally(bytes);
    if(structural.versionKnown&&(
      ![structural.extraFields.achievement,structural.extraFields.counter].some(n=>Number.isSafeInteger(n)&&n>0)||
      !DOMAINS.every(d=>structural.readable[d])))throw err;
    return adaptStructuralSlotForDisplay(structural);
  }
}

export function buildCollectionPresentationForSlot({slot,itemManifest,definitions,parentManifest}){
  if(!slot||slot.schema!==SLOT_DISPLAY_SCHEMA)throw new TypeError('slot display evidence required');
  if(!slot.evidence.readable['collection-history'])return Object.freeze({model:null,display:null,referenceOnly:true,unreadable:true});
  const save=slot.save;
  const inputs={itemManifest,definitions,parentManifest,collectedItemIds:save.collectedItemIds,
    historyEntries:save.collectionHistoryEntries};
  if(slot.evidence.mode==='VALIDATED_BASELINE_READ'){
    const result=assembleCollectionHistoryUI({...inputs,saveVersion:save.version});
    return Object.freeze({...result,referenceOnly:false,unreadable:false});
  }
  const reference=assembleCollectionHistoryUI({...inputs,saveVersion:'3.0.1'});
  const model=Object.freeze({...reference.model,saveVersion:save.version,versionCrosswalk:true,
    catalogReferenceVersion:'3.0.1',structuralReadOnly:true,referenceOnly:true});
  const display=createCollectionHistoryDisplay({model,recordedItemIds:save.collectedItemIds,
    rawHistoryEntries:save.collectionHistoryEntries});
  if(display.historyCount!==save.collectionHistoryEntries.length)throw new Error('collection projection count mismatch');
  return Object.freeze({schema:'HKIA.Web05.CollectionHistoryUI.1',model,display,
    referenceOnly:true,unreadable:false,writerEnabled:false});
}

export function structuralDomainMessage(evidence,domain){
  if(evidence?.schema!==SLOT_DISPLAY_SCHEMA||!DOMAINS.includes(domain))throw new TypeError('typed display state required');
  return evidence.readable[domain]?'READABLE（保存構造のみ確認・ゲーム反映未検証）':
    'UNKNOWN（このDomainは構造を認識できず、未保存・未達成・0件とは判断できません）';
}
