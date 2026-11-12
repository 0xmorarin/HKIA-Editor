   
                                                                                   
                                                                              
                                                                                    
                                                                        
   
import {parseZip} from '../../src/zip.js';
import {parseAccount} from '../../src/account.js';
import {readSave,readSaveStructurally} from '../../src/save.js';
import {dryRunPuzzleGoalsCrossStore,compareV2FormatPrefix,CROSS_STORE_WRITER_ENABLED} from './save-cross-store-dry-run.mjs';
import {NATIVE_SLOT_WRITER_ENABLED} from './save-transaction-engine.mjs';

const MAX_ARCHIVE=60*1024*1024;
const SLOT='Saves/save_0.save';
const ACCOUNT='SettingsAccount/settings.json';
function requireCondition(value,message){if(!value)throw new Error(message);}
function copyInput(input){
  requireCondition(input instanceof Uint8Array||input instanceof ArrayBuffer,'Expected original ZIP bytes');
  const src=input instanceof Uint8Array?input:new Uint8Array(input);
  requireCondition(src.length>0&&src.length<=MAX_ARCHIVE,'ZIP preflight size limit exceeded');
  return src;
}
function unchanged(a,b){return a.length===b.length&&a.every((v,i)=>v===b[i]);}
function freezeSmall(x){return Object.freeze(x);}

async function checkedArchive(input){
  requireCondition(NATIVE_SLOT_WRITER_ENABLED===false&&CROSS_STORE_WRITER_ENABLED===false,'Native Writer must remain disabled');
  const source=copyInput(input),snapshot=source.slice();
  const zip=parseZip(source);
  requireCondition(zip.entries.has(SLOT),'Native save member missing');
  requireCondition(zip.entries.has(ACCOUNT),'Account member missing');
  let accountBytes=null,slotBytes=null,totalExtracted=0,verifiedEntries=0;
  for(const [name,entry] of zip.entries){
    const raw=await zip.extract(name);
    requireCondition(raw instanceof Uint8Array&&raw.length===entry.uncompressed,'Unexpected ZIP member extraction');
    totalExtracted+=raw.length;verifiedEntries++;
    if(name===SLOT)slotBytes=raw;
    else if(name===ACCOUNT)accountBytes=raw;
  }
  requireCondition(verifiedEntries===zip.entries.size,'ZIP member count changed');
  requireCondition(unchanged(snapshot,source),'Original ZIP bytes were mutated');
  return {source,snapshot,zip,accountBytes,slotBytes,totalExtracted,verifiedEntries};
}

export async function auditNativeZipReadOnly(input,{expectedFormatSignature}={}){
  const {source,snapshot,zip,accountBytes,slotBytes,totalExtracted,verifiedEntries}=await checkedArchive(input);
  const account=parseAccount(accountBytes);
  let slot;
  let strict=true;
  try{slot=readSave(slotBytes);}catch(e){
    if(!String(e?.message).includes('未検証の保存バージョン'))throw e;
    slot=readSaveStructurally(slotBytes);strict=false;
  }
  const formatPrefix=compareV2FormatPrefix(slotBytes,expectedFormatSignature);
  requireCondition(formatPrefix.formatSignatureMatch!==false,'Native V2 format signature mismatch');
  requireCondition(unchanged(snapshot,source),'Original ZIP bytes were mutated');
  const known=strict;
  return freezeSmall({
    schema:'HKIA.04.NativeZipReadOnlyPreflight.1',
    mode:'READ_ONLY',
    version:slot.version,versionKnown:known,
    nativeSlot:freezeSmall({recognized:true,achievementCount:slot.achievements.length,counterCount:slot.counters.length,
      collectionHistoryCount:strict?slot.collections?.historyEntries??null:slot.collectionHistoryCount,
      unreadableDomains:strict?0:Object.values(slot.readable).filter(x=>!x).length}),
    account:freezeSmall({recognized:true,achievementCount:Object.keys(account.Achievements).length,counterCount:Object.keys(account.Counters).length}),
    zip:freezeSmall({entryCount:zip.entries.size,nonTargetEntryCount:zip.entries.size-2,crcValidatedEntryCount:verifiedEntries,
      totalExtractedBytes:totalExtracted,originalInputUnmodified:true,noOpSourceBytesPreserved:true}),
    formatSignatureCompared:formatPrefix.formatSignatureCompared,formatSignatureMatch:formatPrefix.formatSignatureMatch,
    typedPlanAllowed:false,
    sourceIdentityPreconditionsVerified:false,linkageRequiredVerified:false,
    integrityVerified:false,unknownFieldsPreservationForEditedOutputVerified:false,
    nativeOutputAuthorized:false,writerEnabled:false,reparseOfEditedZipVerified:false,
    gameAccepted:false,hardwareVerified:false
  });
}
                                                                                                  
export async function probePuzzleGoalsZipTransaction({zipBytes,localDefs,slotDefs,metaDefs,completedAt,leafKey,expectedFormatSignature}={}){
  const {source,snapshot,zip,accountBytes,slotBytes,verifiedEntries}=await checkedArchive(zipBytes);
  parseAccount(accountBytes);
  const prefix=compareV2FormatPrefix(slotBytes,expectedFormatSignature);
  requireCondition(prefix.formatSignatureMatch!==false,'Native V2 format signature mismatch');
  const proof=dryRunPuzzleGoalsCrossStore({slotBytes,accountJson:accountBytes,localDefs,slotDefs,metaDefs,completedAt,leafKey});
  requireCondition(proof.dependency==='CONDITIONAL_REQUIRED'&&proof.totalChangedFields===10&&proof.codecReparseVerified&&proof.accountReparseVerified,
    'Incomplete 03/04 cross-store verification');
  requireCondition(unchanged(snapshot,source),'Original ZIP bytes changed during dry-run');
  return freezeSmall({schema:'HKIA.04.PuzzleGoalsZipDryRun.1',
    dependency:'CONDITIONAL_REQUIRED',version:proof.version,
    slotChangedFields:8,accountChangedFields:2,plannedFieldCount:10,
    zipEntriesValidated:verifiedEntries,zipEntryCount:zip.entries.size,
    oldProgress:proof.before,newProgress:proof.after,
    exactUntouchedSlotTokens:proof.unknownSlotTokensRetained,accountUnknownTokensRetained:proof.unknownAccountTokensRetained,
    reparseValidated:proof.codecReparseVerified&&proof.accountReparseVerified,
    inputZipUnmodified:true,casPassed:true,rollbackOnError:true,
    requiresAtomicZipWriter:true,formatSignatureCompared:prefix.formatSignatureCompared,
    integrityVerified:false,questVerified:false,rewardVerified:false,
    nativeOutputAuthorized:false,writerEnabled:false,gameAccepted:false});
}
export const NATIVE_ZIP_WRITER_ENABLED=false;
