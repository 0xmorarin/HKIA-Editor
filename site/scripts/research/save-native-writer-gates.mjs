   
                                                                              
                                                                                           
                                                                           
                                                                                 
   
import {parseZip} from '../../src/zip.js';
import {probePuzzleGoalsZipTransaction,NATIVE_ZIP_WRITER_ENABLED} from './save-archive-preflight.mjs';
import {NATIVE_SLOT_WRITER_ENABLED} from './save-transaction-engine.mjs';
import {CROSS_STORE_WRITER_ENABLED} from './save-cross-store-dry-run.mjs';

const MAX_ARCHIVE=60*1024*1024;
const SLOT='Saves/save_0.save',ACCOUNT='SettingsAccount/settings.json';
function requireValue(b,msg){if(!b)throw new Error(msg);}
function readInput(input){
  requireValue(input instanceof Uint8Array||input instanceof ArrayBuffer,'Expected ZIP bytes');
  const x=input instanceof Uint8Array?input:new Uint8Array(input);
  requireValue(x.length>=22&&x.length<=MAX_ARCHIVE,'ZIP input size limit exceeded');
  return x;
}
function same(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
function freezeList(items){return Object.freeze([...items]);}
function readU16(v,i){requireValue(i>=0&&i+2<=v.byteLength,'ZIP raw-layout bounds violation');return v.getUint16(i,true);}
function readU32(v,i){requireValue(i>=0&&i+4<=v.byteLength,'ZIP raw-layout bounds violation');return v.getUint32(i,true);}
function getEocd(v){
  for(let i=v.byteLength-22;i>=Math.max(0,v.byteLength-22-65535);i--){
    if(readU32(v,i)===0x06054b50&&i+22+readU16(v,i+20)===v.byteLength)return i;
  }
  throw Error('ZIP EOCD not found');
}
function dataDescriptor(v,start,info,ceiling){
  const checksum=info.checksum>>>0;
  const exactAt=(i)=>readU32(v,i)===checksum&&readU32(v,i+4)===info.compressed&&readU32(v,i+8)===info.uncompressed;
  const withSignature=(i)=>readU32(v,i)===0x08074b50&&exactAt(i+4);
  const bare=start+12<=ceiling&&exactAt(start);
  const signed=start+16<=ceiling&&withSignature(start);
  requireValue(bare!==signed,'Missing, corrupted or ambiguous ZIP data descriptor');
  return signed?16:12;
}
   
                                                                                
                                                                              
                                                                               
                                                                              
   
export async function auditZipRawCopyability(input){
  requireValue(!NATIVE_ZIP_WRITER_ENABLED&&!NATIVE_SLOT_WRITER_ENABLED&&!CROSS_STORE_WRITER_ENABLED,'Native writer must remain OFF');
  const source=readInput(input),snapshot=source.slice(),raw=snapshot,archive=parseZip(raw);
  requireValue(archive.entries.has(SLOT)&&archive.entries.has(ACCOUNT),'Expected native slot and Account members');
  const v=new DataView(raw.buffer,raw.byteOffset,raw.byteLength),end=getEocd(v);
  const centralOffset=readU32(v,end+16),centralSize=readU32(v,end+12);
  requireValue(centralOffset+centralSize===end,'Unexpected gap between central directory and EOCD');
  const frames=[];let central=centralOffset,descCount=0,signedCount=0,localExtraCount=0,centralExtraCount=0;
  let compressedCount=0,totalExtracted=0,entryCount=0;
  for(const [name,info] of archive.entries){
    requireValue(readU32(v,central)===0x02014b50,'Central ZIP record not found');
    const flags=readU16(v,central+8),method=readU16(v,central+10);
    const n=readU16(v,central+28),extra=readU16(v,central+30),comment=readU16(v,central+32);
    requireValue(readU32(v,central+42)===info.local,'Central ZIP offset mismatch');
    const cEnd=central+46+n+extra+comment;
    requireValue(cEnd<=end,'Central ZIP record crosses EOCD');
    centralExtraCount+=Number(extra!==0);
    const local=info.local;
    requireValue(readU32(v,local)===0x04034b50,'Local ZIP record not found');
    const localExtra=readU16(v,local+28),localName=readU16(v,local+26);
    localExtraCount+=Number(localExtra!==0);
    requireValue(flags===readU16(v,local+6)&&method===readU16(v,local+8),'Local and central flags differ');
    const dataStart=local+30+localName+localExtra,dataEnd=dataStart+info.compressed;
    requireValue(dataEnd<=centralOffset,'Compressed member extends into central directory');
    const descriptor=flags&8?dataDescriptor(v,dataEnd,info,centralOffset):0;
    if(descriptor){descCount++;signedCount+=Number(descriptor===16);}
    frames.push({from:local,to:dataEnd+descriptor,target:name===SLOT||name===ACCOUNT});
    const uncompressed=await archive.extract(name);
    requireValue(uncompressed.length===info.uncompressed,'ZIP extraction count differs');
    totalExtracted+=uncompressed.length;
    compressedCount+=Number(method===8);
    entryCount++;central=cEnd;
  }
  requireValue(entryCount===archive.entries.size&&central===end,'ZIP central directory count or size mismatch');
  frames.sort((a,b)=>a.from-b.from);
  let opaqueGapBytes=0,last=0,nonTargetFrameBytes=0;
  for(const x of frames){requireValue(x.from>=last&&x.to>x.from&&x.to<=centralOffset,'Overlapping ZIP local member ranges');
    opaqueGapBytes+=x.from-last;last=x.to;
    if(!x.target)nonTargetFrameBytes+=x.to-x.from;
  }
  opaqueGapBytes+=centralOffset-last;
  requireValue(same(source,snapshot),'ZIP input changed during analysis');
  const blockers=[];
  if(opaqueGapBytes!==0)blockers.push('UNCLASSIFIED_LOCAL_ZIP_BYTES');
  return Object.freeze({schema:'HKIA.04.ZipRawCopyability.1',mode:'READ_ONLY',
    entryCount,nonTargetEntryCount:entryCount-2,crcValidatedEntryCount:entryCount,
    compressedEntryCount:compressedCount,descriptorCount:descCount,signedDescriptorCount:signedCount,
    localExtraMemberCount:localExtraCount,centralExtraMemberCount:centralExtraCount,
    opaqueGapBytes,nonTargetLocalFrameBytes:nonTargetFrameBytes,totalExtractedBytes:totalExtracted,
    rawFrameRangesNonOverlapping:true,inputUnmodified:true,
    rawMemberCopyLayoutDeterminate:opaqueGapBytes===0,blockers:freezeList(blockers),
    nonTargetEditedOutputByteIdentityVerified:false,atomicOutputVerified:false,
    integrityVerified:false,nativeOutputAuthorized:false,writerEnabled:false});
}

   
                                                                            
                                                                                
                                                                          
   
export async function inspectNativeWriterPlanReadOnly(input){
  requireValue(input&&typeof input==='object'&&!Array.isArray(input),'Expected typed cross-store input');
  const source=readInput(input.zipBytes),snapshot=source.slice();
  const topology=await auditZipRawCopyability(snapshot);
  const proof=await probePuzzleGoalsZipTransaction({...input,zipBytes:snapshot});
  requireValue(proof.plannedFieldCount===10&&proof.reparseValidated&&proof.casPassed&&proof.inputZipUnmodified,'Cross-store CAS/reparse proof missing');
  requireValue(same(source,snapshot),'Input mutated during research plan');
  const blockers=[...topology.blockers,'NATIVE_ATOMIC_ZIP_OUTPUT_NOT_IMPLEMENTED','NATIVE_AUTHENTICATION_NOT_PROVEN',
    'GAME_RELOAD_AND_PERSISTENCE_NOT_TESTED','QUEST_REWARD_INVENTORY_LINKAGE_UNVERIFIED'];
  return Object.freeze({schema:'HKIA.04.NativeWriterPlan.1',mode:'PLAN_DIFF_VERIFY_ONLY',
    version:proof.version,dependency:'CONDITIONAL_REQUIRED',requiredScope:'PUZZLE_GOALS_ONLY',
    phase:Object.freeze({zipPreflight:true,sourceIdentityCas:true,typedPlan:true,typedDiff:true,
      nativeSlotInMemoryApply:true,accountInMemoryApply:true,componentEncode:true,
      componentReparse:true,componentExactDiffVerified:true,inputRollback:true,
      atomicZipEncode:false,editedZipReparse:false,editedZipExactDiffVerified:false,hardwareAcceptance:false}),
    plannedChanges:Object.freeze({nativeSlotFields:8,accountFields:2,total:10,
      before:proof.oldProgress,after:proof.newProgress}),
    untouchedSlotTokensRetained:proof.exactUntouchedSlotTokens,
    untouchedAccountTokensRetained:proof.accountUnknownTokensRetained,
    zipRawCopyable:topology.rawMemberCopyLayoutDeterminate,
    nonTargetEditedZipByteIdentityVerified:false,
    blockers:freezeList(blockers),
    sourceInputUnmodified:true,rollbackOnFailure:true,
    futureVersionWriterAuthorized:false,nativeOutputAuthorized:false,writerEnabled:false,
    gameAccepted:false,hardwareVerified:false});
}
export const NATIVE_WRITER_GATE=false;
