/** 04 SAVE CORE: independent, read-only post-Writer candidate ZIP verifier.
 * This never produces ZIP/native/Account bytes. Candidate input is supplied by
 * another caller and is not claimed authentic or game-loadable.
 */
import {sha256Hex} from './native-browser-primitives.mjs';
import {parseZip} from '../../src/zip.js';
import {prepareNativeCrossStoreRevisionCASReadOnly} from './save-native-revision-cas.mjs';
import {verifyPuzzleGoalsCrossStoreCandidateReadOnly} from './save-cross-store-dry-run.mjs';
import {auditNativeCandidateRawPreservationReadOnly} from './save-atomic-zip-lab.mjs';

const MAX_ARCHIVE=60*1024*1024;
function ensure(x,message){if(!x)throw Error(message);}
function bytes(x){ensure(x instanceof Uint8Array||x instanceof ArrayBuffer,'Expected ZIP byte input');const b=x instanceof Uint8Array?x:new Uint8Array(x);ensure(b.length>=22&&b.length<=MAX_ARCHIVE,'ZIP size limit exceeded');return b;}
function equal(a,b){return a.length===b.length&&a.every((value,i)=>value===b[i]);}
export const NATIVE_CANDIDATE_WRITER_ENABLED=false;
export async function verifyNativeCrossStoreZipCandidateReadOnly({sourceZipBytes,candidateZipBytes,
  expectedSourceZipSha256,localDefs,slotDefs,metaDefs,completedAt,leafKey='achievement_puzzlesInTheStars',nativeSchema=false}={}){
  ensure(NATIVE_CANDIDATE_WRITER_ENABLED===false,'Native Writer must remain OFF');
  ensure(typeof expectedSourceZipSha256==='string'&&/^[0-9a-f]{64}$/.test(expectedSourceZipSha256),'Full source ZIP SHA-256 CAS required');
  const sourceCaller=bytes(sourceZipBytes),candidateCaller=bytes(candidateZipBytes);
  const source=Uint8Array.from(sourceCaller),candidate=Uint8Array.from(candidateCaller);
  ensure(await sha256Hex(source)===expectedSourceZipSha256,'ZIP revision CAS mismatch');
  ensure(!equal(source,candidate),'No-op Native cross-store candidate is not an edit');
  ensure(typeof nativeSchema==='boolean','Invalid schema research mode');
  if(!nativeSchema){
    const preview=await prepareNativeCrossStoreRevisionCASReadOnly({zipBytes:source,expectedZipSha256:expectedSourceZipSha256,localDefs,slotDefs,metaDefs,completedAt,leafKey});
    ensure(preview.totalPlannedFields===10&&preview.knownRequiredScope==='PUZZLE_GOALS_ONLY','03 REQUIRED preconditions not fully proven');
  }
  // Schema mode uses the same source semantic preconditions inside the
  // candidate verifier below, rather than the incompatible generic Reader.
  const raw=await auditNativeCandidateRawPreservationReadOnly(source,candidate);
  ensure(raw.allNonTargetRawCompressedFramesByteIdentical,'Non-target ZIP frame proof missing');
  const oldZip=parseZip(source),newZip=parseZip(candidate);
  const slot='Saves/save_0.save',account='SettingsAccount/settings.json';
  const [originalSlot,originalAccount,newSlot,newAccount]=await Promise.all([
    oldZip.extract(slot),oldZip.extract(account),newZip.extract(slot),newZip.extract(account)]);
  ensure(originalSlot&&originalAccount&&newSlot&&newAccount,'Missing cross-store members');
  ensure(!equal(originalSlot,newSlot)&&!equal(originalAccount,newAccount),
    'Both REQUIRED Native and Account members must change');
  const semantic=verifyPuzzleGoalsCrossStoreCandidateReadOnly({slotBytes:originalSlot,accountJson:originalAccount,
    candidateSlotBytes:newSlot,candidateAccountJson:newAccount,localDefs,slotDefs,metaDefs,completedAt,leafKey,nativeSchema});
  ensure(semantic.verifiedSlotFields===8&&semantic.verifiedAccountFields===2,
    'Candidate semantic diff is not precisely 8 Slot + 2 Account');
  ensure(equal(sourceCaller,source)&&equal(candidateCaller,candidate),'ZIP input changed during verification');
  return Object.freeze({schema:'HKIA.04.NativeCrossStoreCandidateVerify.1',mode:'READ_ONLY_CANDIDATE_AUDIT',
    version:semantic.version,requiredScope:'PUZZLE_GOALS_ONLY',sourceRevisionCasVerified:true,
    allSourceAndCandidateZipMembersCrcVerified:true,nonTargetRawCompressedFramesByteIdentical:true,
    nonTargetZipCentralFieldsByteIdenticalExceptOffsets:true,zipArchiveCommentByteIdentical:true,
    nativeSlotFieldsVerified:8,accountFieldsVerified:2,totalFieldsVerified:10,
    completeNativeMessagePackDiffExpectedOnly:true,unknownNativeMessagePackTokenBytesRetained:true,
    accountLexicalDiffExpectedOnly:true,sourceInputUnmodified:true,candidateInputUnmodified:true,
    nativeAuthenticationVerified:false,privateRealSaveVerified:false,hardwareVerified:false,
    nativeWriterEnabled:false,nativeOutputAuthorized:false,editedZipReturned:false});
}
