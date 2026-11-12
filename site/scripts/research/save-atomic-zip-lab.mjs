import {sha256Hex} from './native-browser-primitives.mjs';
import {parseZip} from '../../src/zip.js';
import {auditZipRawCopyability,NATIVE_WRITER_GATE} from './save-native-writer-gates.mjs';
import {NATIVE_SLOT_WRITER_ENABLED,structuralEqual} from './save-transaction-engine.mjs';
import {CROSS_STORE_WRITER_ENABLED,prepareSyntheticPuzzleGoalsPairForInternalLabOnly} from './save-cross-store-dry-run.mjs';
import {NATIVE_ZIP_WRITER_ENABLED} from './save-archive-preflight.mjs';
import {assertDevOutputAuthorized} from '../../native-product/dev-output-policy.mjs';

const MAX_ARCHIVE=60*1024*1024;
const MAX_ENTRY=25*1024*1024;
const MAX_TOTAL=60*1024*1024;
const MAX_COUNT=2000;
const SLOT='Saves/save_0.save';
const PRIVATE_KINDS=new Set(['SEALED_PRIVATE_PAIR','SEALED_PRIVATE_SLOT']);
const NATIVE_KINDS=new Set(['NATIVE_PAIR',...PRIVATE_KINDS]);
const ACCOUNT='SettingsAccount/settings.json';
const MARKER='LabFixtures/QA_SYNTHETIC_MARKER.txt';
const MARKER_CONTENT='HKIA-04-SYNTHETIC-ZIP-TEST-ONLY';
const UTF8=new TextEncoder();
const TABLE=Uint32Array.from({length:256},(_,i)=>{let x=i;for(let j=0;j<8;j++)x=(x&1)?(x>>>1)^0xedb88320:x>>>1;return x>>>0;});
function ensure(x,message){if(!x)throw Error(message);}
function bytes(input){ensure(input instanceof Uint8Array||input instanceof ArrayBuffer,'Expected binary input');return input instanceof Uint8Array?input:new Uint8Array(input);}
function equal(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
function crc32(x){let h=0xffffffff;for(const b of x)h=TABLE[(h^b)&255]^(h>>>8);return (h^0xffffffff)>>>0;}
function view(x){return new DataView(x.buffer,x.byteOffset,x.byteLength);}
function u16(v,p){ensure(p>=0&&p+2<=v.byteLength,'ZIP read exceeds bounds');return v.getUint16(p,true);}
function u32(v,p){ensure(p>=0&&p+4<=v.byteLength,'ZIP read exceeds bounds');return v.getUint32(p,true);}
function put16(v,p,x){v.setUint16(p,x,true);}
function put32(v,p,x){v.setUint32(p,x>>>0,true);}
function eocd(v){for(let i=v.byteLength-22;i>=Math.max(0,v.byteLength-22-65535);i--){if(u32(v,i)===0x06054b50&&i+22+u16(v,i+20)===v.byteLength)return i;}throw Error('ZIP EOCD missing');}
function combined(chunks,length){ensure(Number.isSafeInteger(length)&&length<=MAX_ARCHIVE,'Rebuilt ZIP too large');const out=new Uint8Array(length);let i=0;for(const x of chunks){ensure(i+x.length<=out.length,'Invalid ZIP chunk length');out.set(x,i);i+=x.length;}ensure(i===out.length,'Rebuilt ZIP length differs');return out;}
function namesAndRanges(snapshot,archive){
  const v=view(snapshot),end=eocd(v),offset=u32(v,end+16),size=u32(v,end+12);
  ensure(offset+size===end,'Noncanonical central directory offset');
  const central=[],locals=[];let p=offset;
  for(const [name,info] of archive.entries){
    ensure(u32(v,p)===0x02014b50,'Central directory record missing');
    const n=u16(v,p+28),x=u16(v,p+30),c=u16(v,p+32),to=p+46+n+x+c;
    ensure(to<=end,'Central directory overflow');
    const local=info.local,nameLen=u16(v,local+26),extraLen=u16(v,local+28);
    const dataStart=local+30+nameLen+extraLen,dataEnd=dataStart+info.compressed;
    const flag=u16(v,local+6),signed=(flag&8)&&u32(v,dataEnd)===0x08074b50;
    const endOfFrame=dataEnd+((flag&8)?(signed?16:12):0);
    ensure(endOfFrame<=offset,'Local frame exceeds central directory');
    const record={name,info,centralStart:p,centralEnd:to,localStart:local,headerEnd:dataStart,frameEnd:endOfFrame,flag,signed};
    central.push(record);locals.push(record);p=to;
  }
  ensure(p===end,'Central directory tail mismatch');
  locals.sort((a,b)=>a.localStart-b.localStart);
  let previous=0;for(const r of locals){ensure(r.localStart===previous,'Unclassified ZIP bytes between local records');previous=r.frameEnd;}
  ensure(previous===offset,'Unclassified ZIP bytes before central directory');
  return {central,locals,end,offset,comment:snapshot.slice(end+22)};
}
function centralIdentity(source,rewritten,isMutation){
  ensure(source.length===rewritten.length,'Central record length changed');
  for(let i=0;i<source.length;i++){
    if(i>=42&&i<46)continue;
    if(isMutation&&((i>=10&&i<12)||(i>=16&&i<28)))continue;
    ensure(source[i]===rewritten[i],'Unintended central directory byte changed');
  }
}
function writeOneTarget(raw,record,replacement){
  const {info,flag,signed}=record;
  const local=raw.slice(record.localStart,record.headerEnd),v=view(local);
  const newSize=replacement.length,hash=crc32(replacement);
  ensure(newSize<=MAX_ENTRY,'Replacement member too large');
  put16(v,8,0);
  if(flag&8){put32(v,14,0);put32(v,18,0);put32(v,22,0);}else{put32(v,14,hash);put32(v,18,newSize);put32(v,22,newSize);}
  const descriptor=(flag&8)?new Uint8Array(signed?16:12):new Uint8Array(0);
  if(descriptor.length){const d=view(descriptor),shift=signed?4:0;if(signed)put32(d,0,0x08074b50);put32(d,shift,hash);put32(d,shift+4,newSize);put32(d,shift+8,newSize);}
  const center=raw.slice(record.centralStart,record.centralEnd),c=view(center);
  put16(c,10,0);put32(c,16,hash);put32(c,20,newSize);put32(c,24,newSize);
  return {parts:[local,replacement,descriptor],center};
}
function plain(a){return Object.freeze({...a});}
   
                                                                                
                                                                                 
                                                                              
   
async function executeSyntheticZipAssembly({zipBytes,mutations,failAt=null}={},kind){
  ensure([NATIVE_WRITER_GATE,NATIVE_SLOT_WRITER_ENABLED,CROSS_STORE_WRITER_ENABLED,NATIVE_ZIP_WRITER_ENABLED].every(x=>x===false),'Native Writer must remain OFF');
  const caller=bytes(zipBytes);ensure(caller.length<=MAX_ARCHIVE,'Input ZIP exceeds size limit');const raw=Uint8Array.from(caller);
  ensure(Array.isArray(mutations)&&(kind==='SEALED_PRIVATE_SLOT'?mutations.length===1:NATIVE_KINDS.has(kind)?mutations.length===2:mutations.length>=2&&mutations.length<=4),'Expected two to four simultaneous synthetic changes');
  if(kind==='SEALED_PRIVATE_SLOT')ensure(mutations[0]?.name===SLOT,'Only the selected Native slot may change');
  else if(NATIVE_KINDS.has(kind))ensure(new Set(mutations.map(m=>m.name)).size===2&&mutations.some(m=>m.name===SLOT)&&mutations.some(m=>m.name===ACCOUNT),'Synthetic Native+Account pair required');
  ensure(failAt===null||['BEFORE_ASSEMBLY','AFTER_ASSEMBLY','AFTER_REPARSE'].includes(failAt),'Unsupported failure phase');
  const validated=new Map();
  for(const change of mutations){
    ensure(change&&typeof change.name==='string'&&(NATIVE_KINDS.has(kind)?[SLOT,ACCOUNT].includes(change.name):change.name.startsWith('LabFixtures/')&&change.name!==MARKER),'Only laboratory entries may be changed');
    ensure(!validated.has(change.name),'Duplicate mutation entry');
    ensure(typeof change.expectedSha256==='string'&&/^[0-9a-f]{64}$/.test(change.expectedSha256),'Missing exact SHA-256 CAS token');
    const replacement=Uint8Array.from(bytes(change.replacementBytes));ensure(replacement.length<=MAX_ENTRY,'Replacement member too large');
    validated.set(change.name,{expectedSha256:change.expectedSha256,replacement});
  }
  const layoutProof=await auditZipRawCopyability(raw);
  ensure(layoutProof.rawMemberCopyLayoutDeterminate&&layoutProof.opaqueGapBytes===0,'Opaque ZIP gaps or corrupt layout');
  const archive=parseZip(raw);
  ensure(archive.entries.size<=MAX_COUNT&&archive.entries.has(SLOT)&&archive.entries.has(ACCOUNT),'Required immutable native members missing');
  if(!PRIVATE_KINDS.has(kind)){
    const marker=await archive.extract(MARKER);
    ensure(marker&&equal(marker,UTF8.encode(MARKER_CONTENT)),'Synthetic-only marker missing');
  }
  if(kind==='NATIVE_PAIR'){const originalSlot=await archive.extract(SLOT);ensure(originalSlot.length>=32&&originalSlot.subarray(0,32).every(n=>n===0),'Genuine SaveGameV2 prefix rejected');}
  let total=0;
  for(const [name,info] of archive.entries){
    const target=validated.get(name);
    if(target){const before=await archive.extract(name);ensure(await sha256Hex(before)===target.expectedSha256, 'Synthetic member SHA-256 CAS mismatch');
      ensure(!equal(before,target.replacement),'No-op mutation is not an edit');total+=target.replacement.length;
    }else total+=info.uncompressed;
    ensure(total<=MAX_TOTAL,'Synthetic expanded ZIP exceeds limit');
  }
  ensure([...validated.keys()].every(name=>archive.entries.has(name)),'Mutation entry missing');
  const {central,locals,comment}=namesAndRanges(raw,archive);
  ensure(failAt!=='BEFORE_ASSEMBLY','Injected pre-assembly rollback');
  const localChunks=[],centrals=new Map(),startByName=new Map();let offset=0,untouchedFrameBytes=0;
  for(const record of locals){
    startByName.set(record.name,offset);
    const target=validated.get(record.name);
    if(target){const replacement=writeOneTarget(raw,record,target.replacement);centrals.set(record.name,replacement.center);
      for(const part of replacement.parts){localChunks.push(part);offset+=part.length;}
    }else{
      const original=raw.slice(record.localStart,record.frameEnd);localChunks.push(original);offset+=original.length;
      untouchedFrameBytes+=original.length;
    }
    ensure(offset<=MAX_ARCHIVE,'Raw ZIP local frames exceed archive limit');
  }
  ensure(failAt!=='AFTER_ASSEMBLY','Injected assembly rollback');
  const centralChunks=[];let centralSize=0;
  for(const record of central){
    const orig=raw.subarray(record.centralStart,record.centralEnd);
    const out=centrals.get(record.name)??orig.slice();const v=view(out);
    put32(v,42,startByName.get(record.name));
    centralIdentity(orig,out,validated.has(record.name));
    centralChunks.push(out);centralSize+=out.length;
  }
  const eocdOrig=raw.subarray(raw.length-22-comment.length),end=Uint8Array.from(eocdOrig),e=view(end);
  put32(e,12,centralSize);put32(e,16,offset);
  ensure(comment.length===u16(e,20),'ZIP comment length mismatch');
  const built=combined([...localChunks,...centralChunks,end],offset+centralSize+end.length);
  const verified=parseZip(built);
  ensure(verified.entries.size===archive.entries.size,'Rebuilt member count differs');
  let changed=0,unmodified=0;
  for(const [name] of archive.entries){
    const reparse=await verified.extract(name),mutation=validated.get(name);
    if(mutation){ensure(equal(reparse,mutation.replacement),'Changed synthetic member reparse differs');changed++;}
    else{const before=await archive.extract(name);ensure(equal(before,reparse),'Unchanged member decompressed bytes differ');unmodified++;}
  }
  ensure(failAt!=='AFTER_REPARSE','Injected reparse rollback');
  const newLayout=namesAndRanges(built,verified),oldByName=new Map(locals.map(r=>[r.name,r]));
  let copiedBytes=0;
  for(const record of newLayout.locals){
    if(validated.has(record.name))continue;
    const old=oldByName.get(record.name);
    const from=raw.subarray(old.localStart,old.frameEnd),to=built.subarray(record.localStart,record.frameEnd);
    ensure(equal(from,to),'Non-target raw compressed frame changed');copiedBytes+=from.length;
  }
  ensure(copiedBytes===untouchedFrameBytes,'Raw copied byte count changed');
  ensure(equal(newLayout.comment,comment),'ZIP archive comment differs');
  ensure(equal(caller,raw),'Original ZIP input mutated');
  ensure(changed===validated.size&&unmodified===archive.entries.size-validated.size,'Atomic member coverage mismatch');
  if(!NATIVE_KINDS.has(kind))ensure(equal(await archive.extract(SLOT),await verified.extract(SLOT))&&equal(await archive.extract(ACCOUNT),await verified.extract(ACCOUNT)),'Native slot or Account changed');
  const proof=plain({schema:'HKIA.04.SyntheticAtomicZipProof.1',mode:'SYNTHETIC_MEMORY_ONLY',
    changedSyntheticMembers:changed,untouchedMembers:unmodified,verifiedMemberCount:archive.entries.size,
    untouchedRawLocalFramesByteIdentical:true,untouchedCentralFieldsPreservedExceptOffsets:true,
    originalArchiveCommentPreserved:true,allMemberCrcRechecked:true,allModifiedMembersReparsed:true,
    nativeSlotContentUnchanged:kind==='LAB',accountContentUnchanged:kind==='LAB',rawNonTargetBytesVerified:copiedBytes,
    zipReassemblyInMemoryVerified:true,atomicFailureNoResult:true,sourceCasVerified:true,sourceUnmodified:true,
    nativeSaveApplyPerformed:false,actualNativeZipEdited:false,writerEnabled:false,realSaveVerified:false,
    nativeOutputAuthorized:false,exportedZipBytes:false});
  return {proof,built};
}
                                                                                  
                                                                             
                                                                                
   
async function auditNativeCandidateRawPreservation(originalZip,candidateZip,slotOnly=false){
  ensure([NATIVE_WRITER_GATE,NATIVE_SLOT_WRITER_ENABLED,CROSS_STORE_WRITER_ENABLED,NATIVE_ZIP_WRITER_ENABLED].every(x=>x===false),'Native Writer must remain OFF');
  const source=bytes(originalZip),candidate=bytes(candidateZip);
  ensure(source.length<=MAX_ARCHIVE&&candidate.length<=MAX_ARCHIVE,'ZIP input size limit exceeded');
  const original=Uint8Array.from(source),after=Uint8Array.from(candidate);
  const a=await auditZipRawCopyability(original),b=await auditZipRawCopyability(after);
  ensure(a.rawMemberCopyLayoutDeterminate&&b.rawMemberCopyLayoutDeterminate,'Raw ZIP member layout is ambiguous');
  const oldZip=parseZip(original),newZip=parseZip(after);
  ensure(oldZip.entries.size===newZip.entries.size,'ZIP member count differs');
  const x=namesAndRanges(original,oldZip),y=namesAndRanges(after,newZip);
  ensure(x.central.length===y.central.length,'ZIP central count differs');
  ensure(x.central.every((r,i)=>r.name===y.central[i].name),'ZIP central directory ordering changed');
  ensure(x.locals.every((r,i)=>r.name===y.locals[i].name),'ZIP local frame ordering changed');
  ensure(equal(x.comment,y.comment),'ZIP archive comment differs');
  const oldByName=new Map(x.locals.map(r=>[r.name,r]));
  const newByName=new Map(y.locals.map(r=>[r.name,r]));
  const oldC=new Map(x.central.map(r=>[r.name,r]));
  const newC=new Map(y.central.map(r=>[r.name,r]));
  const targets=new Set(slotOnly?[SLOT]:[SLOT,ACCOUNT]);let untouched=0,rawBytes=0;
  for(const [name,record] of oldByName){
    const newer=newByName.get(name),oldCentral=oldC.get(name),newCentral=newC.get(name);
    ensure(newer&&oldCentral&&newCentral,'ZIP member identity differs');
    centralIdentity(original.subarray(oldCentral.centralStart,oldCentral.centralEnd),
      after.subarray(newCentral.centralStart,newCentral.centralEnd),targets.has(name));
    if(targets.has(name))continue;
    const beforeFrame=original.subarray(record.localStart,record.frameEnd);
    const afterFrame=after.subarray(newer.localStart,newer.frameEnd);
    ensure(equal(beforeFrame,afterFrame),'Non-target ZIP raw frame changed');
    rawBytes+=beforeFrame.length;untouched++;
  }
  ensure(newByName.size===oldByName.size&&oldByName.has(SLOT)&&oldByName.has(ACCOUNT),
    'Required Native and Account entries missing');
  ensure(equal(source,original)&&equal(candidate,after),'ZIP input changed during candidate verification');
  return plain({schema:'HKIA.04.NativeCandidateRawPreservation.1',mode:'READ_ONLY_CANDIDATE_AUDIT',
    membersVerified:oldZip.entries.size,nonTargetMembersVerified:untouched,
    nonTargetRawBytesVerified:rawBytes,originalArchiveCommentByteIdentical:true,
    nonTargetCentralFieldsByteIdenticalExceptOffset:true,
    allNonTargetRawCompressedFramesByteIdentical:true,allSourceAndCandidateCrcsValid:true,
    sourceUnmodified:true,candidateUnmodified:true,nativeAuthenticated:false,
    nativeOutputAuthorized:false,writerEnabled:false,outputBytesReturned:false});
}
export async function auditNativeCandidateRawPreservationReadOnly(originalZip,candidateZip){return auditNativeCandidateRawPreservation(originalZip,candidateZip);}
export async function dryRunSyntheticRawPreservingZipTransaction(arg={}){
  return (await executeSyntheticZipAssembly(arg,'LAB')).proof;
}
                                                                                                            
export async function dryRunSyntheticNativeAccountZipRoundTrip({zipBytes,expectedZipSha256,localDefs,slotDefs,metaDefs,completedAt,leafKey,failAt=null}={}){
  const caller=bytes(zipBytes),raw=Uint8Array.from(caller);
  ensure(typeof expectedZipSha256==='string'&&/^[a-f0-9]{64}$/.test(expectedZipSha256),'Full ZIP revision CAS required');
  ensure(await sha256Hex(raw)===expectedZipSha256,'Full ZIP revision CAS mismatch');
  const initial=parseZip(raw),marker=await initial.extract(MARKER);
  ensure(marker&&equal(marker,UTF8.encode(MARKER_CONTENT)),'Synthetic-only marker missing');
  const beforeSlot=await initial.extract(SLOT),beforeAccount=await initial.extract(ACCOUNT);
  ensure(beforeSlot&&beforeAccount,'Synthetic Native/Account members missing');
  const pair=prepareSyntheticPuzzleGoalsPairForInternalLabOnly({slotBytes:beforeSlot,accountJson:beforeAccount,localDefs,slotDefs,metaDefs,completedAt,leafKey});
  const result=await executeSyntheticZipAssembly({zipBytes:raw,failAt,mutations:[
    {name:SLOT,expectedSha256:await sha256Hex(beforeSlot),replacementBytes:pair.slotBytes},
    {name:ACCOUNT,expectedSha256:await sha256Hex(beforeAccount),replacementBytes:pair.accountBytes},
  ]},'NATIVE_PAIR');
  const rebuilt=parseZip(result.built),slot=await rebuilt.extract(SLOT),account=await rebuilt.extract(ACCOUNT);
  const {readSave}=await import('../../src/save.js');
  const {parseAccount}=await import('../../src/account.js');
  const before=readSave(beforeSlot),after=readSave(slot);
  const beforeAccountData=parseAccount(beforeAccount),afterAccountData=parseAccount(account);
  ensure(equal(slot,pair.slotBytes)&&equal(account,pair.accountBytes),'Cross-store target reparse differs');
  ensure(before.collections.historyEntries===after.collections.historyEntries&&before.collections.deprecatedEntries===after.collections.deprecatedEntries,'Collection counts changed');
  ensure(before.collectionHistoryEntries.length===after.collectionHistoryEntries.length&&before.collectionHistoryEntries.every((x,i)=>x[0]===after.collectionHistoryEntries[i][0]&&x[1]===after.collectionHistoryEntries[i][1]),'Opaque Collection int64 history changed');
  ensure(after.achievements.length===before.achievements.length&&after.counters.length===before.counters.length,'Native model shape changed');
  ensure(structuralEqual(before.meta.header,after.meta.header),'Native metadata changed');
  ensure(equal(before.collectedItemIds,after.collectedItemIds),'Collection item IDs changed');
  const leaf=localDefs.records.find(x=>x.key==='achievement_puzzlesInTheStars');
  const group=localDefs.records.find(x=>x.counter_guid===slotDefs.achievement_references.find(y=>y.guid===leaf.guid)?.group_counter_guid);
  ensure(leaf&&group,'Verified Puzzle Goals persisted identities missing');
  const desired=new Map([
    [leaf.save_guid,{before:1,after:5}],
    [group.save_guid,{before:4,after:5}],
  ]);
  const counterDesired=new Map([
    [leaf.counter_save_guid,{before:1,after:5}],
    [group.counter_save_guid,{before:4,after:5}],
  ]);
  let achievementDiffs=0,counterDiffs=0;
  for(let i=0;i<before.achievements.length;i++){
    const a=before.achievements[i],b=after.achievements[i],t=desired.get(a.guid);
    ensure(a.guid===b.guid&&a.id===b.id,'Achievement identity changed');
    if(!t)ensure(structuralEqual(a,b),'Unrelated Achievement changed');
    else{ensure(!a.complete&&a.current===t.before&&a.completed===null,'Unexpected original Achievement state');
      ensure(b.complete&&b.current===t.after&&b.completed===completedAt,'Incorrect edited Achievement state');achievementDiffs++;}
  }
  for(let i=0;i<before.counters.length;i++){
    const a=before.counters[i],b=after.counters[i],t=counterDesired.get(a.guid);
    ensure(a.guid===b.guid&&a.id===b.id,'Counter identity changed');
    if(!t)ensure(structuralEqual(a,b),'Unrelated GameCounter changed');
    else{ensure(a.current===t.before&&b.current===t.after,'Edited GameCounter progress incorrect');
      ensure(structuralEqual(a.countedValues,b.countedValues)&&structuralEqual(a.countedGuids,b.countedGuids),'RELATED counter history changed');counterDiffs++;}
  }
  ensure(achievementDiffs===2&&counterDiffs===2,'Exact selected model count mismatch');

  const root=metaDefs.find(x=>x.key==='Local_RootAchievement');
  ensure(root&&beforeAccountData.Achievements[root.guid].CurrentValue===19&&afterAccountData.Achievements[root.guid].CurrentValue===20&&beforeAccountData.Counters[root.counter_guid].CurrentValue===19&&afterAccountData.Counters[root.counter_guid].CurrentValue===20,'Account target semantic readback changed');
  ensure(pair.proof.changedSlotFields===8&&pair.proof.changedAccountFields===2&&pair.proof.unknownSlotTokensRetained&&pair.proof.unknownAccountTokensRetained,'03+04 native/account semantic or opaque token proof missing');
  const {verifyNativeCrossStoreZipCandidateReadOnly}=await import('./save-native-candidate-verify.mjs');
  const independent=await verifyNativeCrossStoreZipCandidateReadOnly({
    sourceZipBytes:raw,candidateZipBytes:result.built,expectedSourceZipSha256:await sha256Hex(raw),
    localDefs,slotDefs,metaDefs,completedAt,leafKey});
  ensure(independent.totalFieldsVerified===10&&independent.completeNativeMessagePackDiffExpectedOnly&&
    independent.nonTargetRawCompressedFramesByteIdentical,'Independent candidate verifier failed');
  ensure(equal(caller,raw),'Source mutated during synthetic verification');
  return plain({schema:'HKIA.04.SyntheticNativeAccountAtomicProof.1',mode:'SYNTHETIC_ONLY',version:pair.proof.version,
    nativeSlotFieldsVerified:8,accountFieldsVerified:2,totalFieldsVerified:10,
    originalZipRevisionCasVerified:true,allZipMembersReparsed:true,rawNonTargetFramesByteIdentical:true,
    nativeUnknownMessagePackTokenBytesRetained:true,accountUnknownJsonLexicalTokensRetained:true,
    collectionSignedInt64TicksUnchanged:true,nonTargetZipMembersUnchanged:true,
    allUnselectedAchievementAndCounterRecordsUnchanged:true,selectedModelSemanticDiffVerified:true,
    sourceUnmodified:true,rollbackOnFailure:true,createdZipOnlyInPrivateMemory:true,
    realSaveVerified:false,nativeAuthenticated:false,gameAccepted:false,
    writerEnabled:false,nativeOutputAuthorized:false,exportedZipBytes:false});
}
                                                                                  
                                                                              
                                                                           
   
export async function runSealedPrivateNativePairAssembly({zipBytes,slotBytes,accountBytes,
  originalSlot,originalAccount,expectedZipSha256,localDefs,slotDefs,metaDefs,completedAt,
  leafKey,failAt=null,nativeSchema=false,devOutput=null,plan=null}={}){
  const source=Uint8Array.from(bytes(zipBytes));
  if(devOutput!==null){devOutput=structuredClone(devOutput);plan=structuredClone(plan);ensure(nativeSchema&&devOutput.operation==='puzzle-goals-complete','DEV pair requires pinned Puzzle scope');}
  ensure(await sha256Hex(source)===expectedZipSha256,'Full ZIP revision CAS mismatch');
  const assembled=await executeSyntheticZipAssembly({zipBytes:source,failAt,mutations:[
    {name:SLOT,expectedSha256:await sha256Hex(originalSlot),replacementBytes:slotBytes},
    {name:ACCOUNT,expectedSha256:await sha256Hex(originalAccount),replacementBytes:accountBytes}
  ]},'SEALED_PRIVATE_PAIR');
  const {verifyNativeCrossStoreZipCandidateReadOnly}=await import('./save-native-candidate-verify.mjs');
  const {file,reopened}=await reopenEditedCopy(assembled.built);
  const verified=await verifyNativeCrossStoreZipCandidateReadOnly({sourceZipBytes:source,
    candidateZipBytes:reopened,expectedSourceZipSha256:expectedZipSha256,
    localDefs,slotDefs,metaDefs,completedAt,leafKey,nativeSchema});
  ensure(verified.totalFieldsVerified===10&&verified.unknownNativeMessagePackTokenBytesRetained,
    'Candidate ZIP failed cross-store semantic verification');
  const proof=Object.freeze({schema:'HKIA.04.SealedNativeCrossStoreRoundTrip.1',
    mode:'PRIVATE_IN_MEMORY_RESEARCH_ONLY',sourceRevisionCasVerified:true,editedCopyBlobReopened:true,
    nativeSlotFieldsVerified:8,accountFieldsVerified:2,totalFieldsVerified:10,
    allZipEntriesReparsed:true,sourceAndCandidateCrcVerified:true,
    allNonTargetRawFramesPreserved:true,accountLexicalDiffOnly:true,
    expandedMessagePackExactExpectedDiffOnly:true,
    unknownNativeTokensPreserved:true,originalInputUnmodified:true,
    nativeAuthenticationVerified:false,realSaveVerified:false,hardwareVerified:false,
    nativeOutputAuthorized:false,nativeWriterEnabled:false,zipBytesReturned:false,
    accountBytesReturned:false,nativeBytesReturned:false});
  if(devOutput!==null){
    const {verifySchemaNativeSlotCandidateAgainstPlanReadOnly}=await import('./save-transaction-engine.mjs');
    const original=await parseZip(source).extract(SLOT),candidate=await parseZip(reopened).extract(SLOT);
    ensure(verifySchemaNativeSlotCandidateAgainstPlanReadOnly(original,plan,candidate).verifiedFieldCount===8,'DEV pair approved plan differs from candidate');
  }
  ensure(equal(source,bytes(zipBytes)),'Source ZIP changed during pair verification');
  const result=await finishVerifiedCandidate(proof,file,devOutput,plan,expectedZipSha256,source);
  ensure(equal(source,bytes(zipBytes)),'Source ZIP changed during candidate finalization');return result;
}
async function reopenEditedCopy(bytes){
  const file=new File([bytes],'edited-copy.zip',{type:'application/zip'});
  const reopened=new Uint8Array(await file.arrayBuffer());
  ensure(file.name==='edited-copy.zip'&&equal(bytes,reopened),'Edited-copy File readback mismatch');
  return {file,reopened};
}
                                                                           
                                                                    
async function finishVerifiedCandidate(proof,file,devOutput,plan,revision,source){
  if(devOutput===null)return proof;
  ensure(devOutput&&typeof devOutput.operation==='string'&&proof.editedCopyBlobReopened===true&&proof.sourceAndCandidateCrcVerified===true&&proof.allNonTargetRawFramesPreserved===true&&proof.expandedMessagePackExactExpectedDiffOnly===true,'DEV candidate proof incomplete');
  await assertDevOutputAuthorized({version:plan?.version,operation:devOutput.operation,revision,plan,source,request:devOutput.request,sameVersionWitnessArchive:devOutput.sameVersionWitnessArchive??null,recipePermit:devOutput.recipePermit??null});
  ensure(file instanceof File&&file.name==='edited-copy.zip'&&file.type==='application/zip','DEV output File mismatch');
  return Object.freeze({...proof,file,zipBytesReturned:true,nativeOutputAuthorized:true,devOutputAuthorized:true});
}
export async function runSealedPrivateNativeSlotAssembly({zipBytes,slotBytes,originalSlot,expectedZipSha256,plan,failAt=null,devOutput=null}={}){
  plan=structuredClone(plan);devOutput=devOutput===null?null:structuredClone(devOutput);
  ensure(Array.isArray(plan?.changes)&&(plan.membership&&plan.changes.length===0||plan.changes.length>0&&plan.changes.every(c=>c?.model==='GameCollectionsTraitModel'&&c.field==='CollectablesCollectedTime'||c?.model==='AchievementModel'&&['CompletedTime','CurrentValue'].includes(c.field)||c?.model==='GameCounterModel'&&c.field==='CurrentValue'||c?.model==='InventoryItem'&&c.field==='Quantity')),'Unsupported single-slot typed plan');
  const source=Uint8Array.from(bytes(zipBytes));
  ensure(await sha256Hex(source)===expectedZipSha256,'Full ZIP revision CAS mismatch');
  const assembled=await executeSyntheticZipAssembly({zipBytes:source,failAt,mutations:[
    {name:SLOT,expectedSha256:await sha256Hex(originalSlot),replacementBytes:slotBytes}
  ]},'SEALED_PRIVATE_SLOT');
  const {file,reopened}=await reopenEditedCopy(assembled.built);
  const raw=await auditNativeCandidateRawPreservation(source,reopened,true);
  const slot=await parseZip(reopened).extract(SLOT);
  const {verifySchemaNativeSlotCandidateAgainstPlanReadOnly}=await import('./save-transaction-engine.mjs');
  const semantic=verifySchemaNativeSlotCandidateAgainstPlanReadOnly(originalSlot,plan,slot);
  ensure(raw.allNonTargetRawCompressedFramesByteIdentical&&semantic.completeExpandedMessagePackExpectedDiffOnly,'Single slot verification failed');
  ensure(equal(source,bytes(zipBytes)),'Source ZIP changed during slot verification');
  const proof=Object.freeze({schema:'HKIA.04.PrivateSlotZipProof.1',version:semantic.version,
    nativeSlotFieldsVerified:semantic.verifiedFieldCount,accountFieldsVerified:0,totalFieldsVerified:semantic.verifiedFieldCount,
    allNonTargetRawFramesPreserved:true,sourceAndCandidateCrcVerified:true,expandedMessagePackExactExpectedDiffOnly:true,
    editedCopyBlobReopened:true,accountRawFramePreserved:true,originalInputUnmodified:true,
    nativeAuthenticationVerified:false,gameAccepted:false,nativeOutputAuthorized:false,nativeWriterEnabled:false,zipBytesReturned:false});
  const result=await finishVerifiedCandidate(proof,file,devOutput,plan,expectedZipSha256,source);
  ensure(equal(source,bytes(zipBytes)),'Source ZIP changed during candidate finalization');return result;
}
                                                                          
                                                                                
                                                                         
export async function runSealedPrivateGeneralAchievementPairAssembly({zipBytes,slotBytes,accountBytes,originalSlot,originalAccount,expectedZipSha256,request,failAt=null,devOutput=null}={}){
  const source=Uint8Array.from(bytes(zipBytes));request=structuredClone(request);devOutput=devOutput===null?null:structuredClone(devOutput);
  if(devOutput!==null)ensure(devOutput.operation==='achievement-family-revoke'&&request.operation==='REVOKE'&&devOutput.request?.key===request.key&&devOutput.request?.progress===request.progress,'DEV_NATIVE_OUTPUT_FAMILY_REQUEST_MISMATCH');
  ensure(await sha256Hex(source)===expectedZipSha256,'Full ZIP revision CAS mismatch');
  const assembled=await executeSyntheticZipAssembly({zipBytes:source,failAt,mutations:[
    {name:SLOT,expectedSha256:await sha256Hex(originalSlot),replacementBytes:slotBytes},
    {name:ACCOUNT,expectedSha256:await sha256Hex(originalAccount),replacementBytes:accountBytes}
  ]},'SEALED_PRIVATE_PAIR');
  const {file,reopened}=await reopenEditedCopy(assembled.built),raw=await auditNativeCandidateRawPreservation(source,reopened);
  const z=parseZip(reopened),old=parseZip(source),[beforeSlot,beforeAccount,newSlot,newAccount]=await Promise.all([old.extract(SLOT),old.extract(ACCOUNT),z.extract(SLOT),z.extract(ACCOUNT)]);
  const {prepareGeneralAchievementPairResearch}=await import('./save-cross-store-dry-run.mjs');
  const {verifySchemaNativeSlotCandidateAgainstPlanReadOnly}=await import('./save-transaction-engine.mjs');
  const expected=await prepareGeneralAchievementPairResearch({slotBytes:beforeSlot,accountJson:beforeAccount,request});
  const semantic=verifySchemaNativeSlotCandidateAgainstPlanReadOnly(beforeSlot,expected.plan,newSlot);
  ensure(equal(newAccount,expected.accountBytes)&&raw.allNonTargetRawCompressedFramesByteIdentical&&semantic.completeExpandedMessagePackExpectedDiffOnly,'General cross-store exact diff failed');
  ensure(equal(source,bytes(zipBytes)),'Caller ZIP changed');
  const proof=Object.freeze({schema:'HKIA.04.GeneralAchievementPairResearch.1',version:semantic.version,nativeSlotFieldsVerified:semantic.verifiedFieldCount,accountFieldsVerified:2,totalFieldsVerified:semantic.verifiedFieldCount+2,editedCopyBlobReopened:true,allNonTargetRawFramesPreserved:true,sourceAndCandidateCrcVerified:true,accountLexicalDiffOnly:true,expandedMessagePackExactExpectedDiffOnly:true,originalInputUnmodified:true,requiredScope:devOutput===null?'RELATED_STATIC_RESEARCH_ONLY':'EXPLICIT_V16_TERMINAL_FAMILY_REVOKE',nativeAuthenticationVerified:false,writerEnabled:false,nativeOutputAuthorized:false,zipBytesReturned:false,gameAccepted:false});
  const plan={...expected.plan,accountFields:expected.accountChanges.map(x=>({field:x.model==='Achievement'?'Local_RootAchievement.CurrentValue':'Local_RootAchievement.Counter.CurrentValue',expected:x.before,next:x.after}))};
  const result=await finishVerifiedCandidate(proof,file,devOutput,plan,expectedZipSha256,source);
  ensure(equal(source,bytes(zipBytes)),'Caller ZIP changed during general pair finalization');return result;
}
export const SYNTHETIC_RAW_ZIP_WRITER_ENABLED=false;

                                                                      
export async function runSealedPrivateFormalFamilyBatchAssembly({zipBytes,slotBytes,accountBytes,originalSlot,originalAccount,expectedZipSha256,keys,failAt=null,devOutput=null}={}){
  const source=Uint8Array.from(bytes(zipBytes));keys=structuredClone(keys);devOutput=devOutput===null?null:structuredClone(devOutput);
  if(devOutput!==null)ensure(devOutput.operation==='batch-family-revoke'&&JSON.stringify(devOutput.request?.keys)===JSON.stringify(keys),'DEV_NATIVE_OUTPUT_BATCH_REQUEST_MISMATCH');
  ensure(await sha256Hex(source)===expectedZipSha256,'Full ZIP revision CAS mismatch');
  const assembled=await executeSyntheticZipAssembly({zipBytes:source,failAt,mutations:[
    {name:SLOT,expectedSha256:await sha256Hex(originalSlot),replacementBytes:slotBytes},
    {name:ACCOUNT,expectedSha256:await sha256Hex(originalAccount),replacementBytes:accountBytes}
  ]},'SEALED_PRIVATE_PAIR');
  const {file,reopened}=await reopenEditedCopy(assembled.built),raw=await auditNativeCandidateRawPreservation(source,reopened);
  const old=parseZip(source),z=parseZip(reopened),[beforeSlot,beforeAccount,newSlot,newAccount]=await Promise.all([old.extract(SLOT),old.extract(ACCOUNT),z.extract(SLOT),z.extract(ACCOUNT)]);
  const {prepareFormalFamilyBatch}=await import('./save-cross-store-dry-run.mjs');
  const {verifySchemaNativeSlotCandidateAgainstPlanReadOnly}=await import('./save-transaction-engine.mjs');
  const expected=await prepareFormalFamilyBatch({slotBytes:beforeSlot,accountJson:beforeAccount,keys});
  const semantic=verifySchemaNativeSlotCandidateAgainstPlanReadOnly(beforeSlot,expected.plan,newSlot);
  ensure(equal(newAccount,expected.accountBytes)&&raw.allNonTargetRawCompressedFramesByteIdentical&&semantic.completeExpandedMessagePackExpectedDiffOnly,'Formal batch cross-store exact diff failed');
  ensure(equal(source,bytes(zipBytes)),'Caller ZIP changed');
  const proof=Object.freeze({schema:'HKIA.04.FormalFamilyBatchProof.1',version:semantic.version,nativeSlotFieldsVerified:semantic.verifiedFieldCount,accountFieldsVerified:2,totalFieldsVerified:semantic.verifiedFieldCount+2,editedCopyBlobReopened:true,allNonTargetRawFramesPreserved:true,sourceAndCandidateCrcVerified:true,accountLexicalDiffOnly:true,expandedMessagePackExactExpectedDiffOnly:true,originalInputUnmodified:true,requiredScope:'EXPLICIT_V16_DISTINCT_FAMILY_BATCH',nativeAuthenticationVerified:false,writerEnabled:false,nativeOutputAuthorized:false,zipBytesReturned:false,gameAccepted:false});
  const result=await finishVerifiedCandidate(proof,file,devOutput,expected.plan,expectedZipSha256,source);
  ensure(equal(source,bytes(zipBytes)),'Caller ZIP changed during batch finalization');return result;
}

                                                                                        
                                                                                                
export async function runSealedPrivateFormal49Assembly({zipBytes,slotBytes,accountBytes,expectedZipSha256,request,failAt=null,devOutput=null}={}){
 const source=Uint8Array.from(bytes(zipBytes));request=structuredClone(request);devOutput=devOutput===null?null:structuredClone(devOutput);
 ensure(request?.expectedRevision===expectedZipSha256&&await sha256Hex(source)===expectedZipSha256,'Full ZIP revision CAS mismatch');
 if(devOutput!==null)ensure(['achievement-formal49-edit','achievement-manual9-revoke'].includes(devOutput.operation)&&devOutput.operation===request.operation&&JSON.stringify(devOutput.request)===JSON.stringify(request),'DEV_NATIVE_OUTPUT_FORMAL49_REQUEST_MISMATCH');
 const old=parseZip(source),[beforeSlot,beforeAccount]=await Promise.all([old.extract(SLOT),old.extract(ACCOUNT)]);
 const {prepareFormal49}=await import('./save-cross-store-dry-run.mjs');const expected=await prepareFormal49({slotBytes:beforeSlot,accountJson:beforeAccount,request});
 ensure(equal(expected.accountBytes,accountBytes),'Formal49 Account candidate mismatch');
 const pair=expected.plan.accountFields.length===2;
 const mutations=[{name:SLOT,expectedSha256:await sha256Hex(beforeSlot),replacementBytes:slotBytes}];
 if(pair)mutations.push({name:ACCOUNT,expectedSha256:await sha256Hex(beforeAccount),replacementBytes:accountBytes});
 const assembled=await executeSyntheticZipAssembly({zipBytes:source,failAt,mutations},pair?'SEALED_PRIVATE_PAIR':'SEALED_PRIVATE_SLOT');
 const {file,reopened}=await reopenEditedCopy(assembled.built),raw=await auditNativeCandidateRawPreservation(source,reopened,!pair);
 const z=parseZip(reopened),[newSlot,newAccount]=await Promise.all([z.extract(SLOT),z.extract(ACCOUNT)]);
 const {verifySchemaNativeSlotCandidateAgainstPlanReadOnly}=await import('./save-transaction-engine.mjs');const semantic=verifySchemaNativeSlotCandidateAgainstPlanReadOnly(beforeSlot,expected.plan,newSlot);
 ensure(equal(newAccount,expected.accountBytes)&&raw.allNonTargetRawCompressedFramesByteIdentical&&semantic.completeExpandedMessagePackExpectedDiffOnly,'Formal49 exact diff failed');
 ensure(equal(source,bytes(zipBytes)),'Caller ZIP changed');
 const proof=Object.freeze({schema:'HKIA.04.Formal49Proof.1',version:semantic.version,nativeSlotFieldsVerified:semantic.verifiedFieldCount,accountFieldsVerified:expected.plan.accountFields.length,totalFieldsVerified:semantic.verifiedFieldCount+expected.plan.accountFields.length,editedCopyBlobReopened:true,allNonTargetRawFramesPreserved:true,sourceAndCandidateCrcVerified:true,expandedMessagePackExactExpectedDiffOnly:true,originalInputUnmodified:true,...(pair?{accountLexicalDiffOnly:true}:{accountRawFramePreserved:true}),requiredScope:request.operation==='achievement-manual9-revoke'?'EXPLICIT_MANUAL9_ABSENCE_REVOKE':'EXPLICIT_FORMAL49_EXACT20',nativeAuthenticationVerified:false,writerEnabled:false,nativeOutputAuthorized:false,zipBytesReturned:false,gameAccepted:false});
 const result=await finishVerifiedCandidate(proof,file,devOutput,expected.plan,expectedZipSha256,source);
 ensure(equal(source,bytes(zipBytes)),'Caller ZIP changed during Formal49 finalization');return result;
}
