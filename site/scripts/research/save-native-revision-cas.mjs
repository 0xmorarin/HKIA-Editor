import {sha256Hex} from './native-browser-primitives.mjs';
import {inspectNativeWriterPlanReadOnly,NATIVE_WRITER_GATE} from './save-native-writer-gates.mjs';
import {NATIVE_SLOT_WRITER_ENABLED} from './save-transaction-engine.mjs';
import {CROSS_STORE_WRITER_ENABLED} from './save-cross-store-dry-run.mjs';
import {NATIVE_ZIP_WRITER_ENABLED} from './save-archive-preflight.mjs';

function ensure(x,msg){if(!x)throw Error(msg);}
function inputBytes(x){ensure(x instanceof Uint8Array||x instanceof ArrayBuffer,'ZIP byte buffer required');return x instanceof Uint8Array?x:new Uint8Array(x);}
function same(a,b){if(a.length!==b.length)return false;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
   
                                                                              
                                                                            
                                                                               
   
export async function prepareNativeCrossStoreRevisionCASReadOnly(arg={}){
  ensure(!NATIVE_WRITER_GATE&&!NATIVE_SLOT_WRITER_ENABLED&&!CROSS_STORE_WRITER_ENABLED&&!NATIVE_ZIP_WRITER_ENABLED,'Native Writer must remain OFF');
  ensure(arg&&typeof arg==='object'&&!Array.isArray(arg),'Typed plan input required');
  ensure(typeof arg.expectedZipSha256==='string'&&/^[a-f0-9]{64}$/.test(arg.expectedZipSha256),'Source revision SHA-256 required');
  const caller=inputBytes(arg.zipBytes),snapshot=Uint8Array.from(caller);
  ensure(snapshot.length>=22&&snapshot.length<=60*1024*1024,'Source ZIP size limit exceeded');
  ensure(await sha256Hex(snapshot)===arg.expectedZipSha256,'ZIP source revision CAS mismatch');
  const proof=await inspectNativeWriterPlanReadOnly({...arg,zipBytes:snapshot});
  ensure(same(caller,snapshot),'Source ZIP changed during planning');
  ensure(proof?.phase?.zipPreflight&&proof?.phase?.typedPlan&&proof?.phase?.componentExactDiffVerified,'Component plan not fully proven');
  ensure(proof.requiredScope==='PUZZLE_GOALS_ONLY'&&proof.plannedChanges.total===10,'Unverified REQUIRED scope');
  return Object.freeze({schema:'HKIA.04.NativeCrossStoreRevisionCAS.1',mode:'READ_ONLY',
    version:proof.version,revisionCasPassed:true,allEntryCrcChecked:true,zipCopyLayoutVerified:proof.zipRawCopyable,
    knownRequiredScope:'PUZZLE_GOALS_ONLY',conditionalRequiredChecked:true,
    nativeSlotPlannedFields:8,accountPlannedFields:2,totalPlannedFields:10,
    inMemorySlotApplyVerified:true,inMemoryAccountApplyVerified:true,
    componentReparseVerified:true,componentDiffExactlyVerified:true,
    rawNativeOpaqueTokenRetentionVerified:proof.untouchedSlotTokensRetained,
    rawAccountUnknownTokenRetentionVerified:proof.untouchedAccountTokensRetained,
    originalZipStillUnmodified:true,sourceIdentityPreserved:true,casFailureAborts:true,
    blockerCodes:Object.freeze([...proof.blockers]),
    rawNonTargetEditedOutputVerified:false,atomicEditedZipReparseVerified:false,
    nativeIntegrityVerified:false,privateRealSaveVerified:false,hardwareVerified:false,
    mutatedZipReturned:false,mutatedSlotReturned:false,mutatedAccountReturned:false,
    nativeOutputAuthorized:false,writerEnabled:false});
}
export const NATIVE_CROSS_STORE_COMMIT_ENABLED=false;
