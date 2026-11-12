export const SOURCE_REVISION_UI_SCHEMA='HKIA.Web05.SourceRevisionDisplay.1';
const SHA256=/^[a-f0-9]{64}$/;
const NATIVE_BLOCKERS=Object.freeze(['NATIVE_WRITER_NOT_ACCEPTED','NATIVE_CAS_NOT_EXECUTED_IN_BROWSER','ATOMIC_EDITED_ZIP_REPARSE_UNVERIFIED']);

export async function fingerprintSourceBytes(bytes,subtle=globalThis.crypto?.subtle){
  if(!(bytes instanceof Uint8Array))throw new TypeError('source byte snapshot required');
  if(!subtle||typeof subtle.digest!=='function')throw new Error('SOURCE_SHA256_UNAVAILABLE');
  const digest=new Uint8Array(await subtle.digest('SHA-256',bytes.slice()));
  return Array.from(digest,b=>b.toString(16).padStart(2,'0')).join('');
}

export function sourceRevisionSnapshot({sha256,epoch,format}){
  if(typeof sha256!=='string'||!SHA256.test(sha256)||!Number.isSafeInteger(epoch)||epoch<1||
     !['zip','account-json','save'].includes(format))throw new TypeError('invalid source revision snapshot');
  return Object.freeze({schema:SOURCE_REVISION_UI_SCHEMA,sha256,epoch,format});
}

export function inspectRevisionCAS({expected=null,current=null,readEvidence=null,researchEvidence=null}={}){
  if(expected!==null&&expected.schema!==SOURCE_REVISION_UI_SCHEMA)throw new TypeError('invalid expected source revision');
  if(current!==null&&current.schema!==SOURCE_REVISION_UI_SCHEMA)throw new TypeError('invalid current source revision');
  if(readEvidence!==null&&readEvidence.schema!=='HKIA.Web05.SlotDisplay.2')throw new TypeError('invalid read evidence');
  if(researchEvidence!==null&&(researchEvidence.schema!=='HKIA.04.NativeCrossStoreRevisionCAS.1'||researchEvidence.mode!=='READ_ONLY'||
    researchEvidence.writerEnabled!==false||researchEvidence.nativeOutputAuthorized!==false||researchEvidence.mutatedZipReturned!==false))
    throw new TypeError('untrusted native CAS evidence');
  const mismatch=!!(expected&&current&&(expected.epoch!==current.epoch||expected.sha256!==current.sha256||expected.format!==current.format));
  const status=!expected||!current?'REVISION_UNKNOWN':mismatch?'SOURCE_REVISION_MISMATCH':'LOCAL_SNAPSHOT_MATCH_ONLY';
  const blockers=[...NATIVE_BLOCKERS];
  if(status==='REVISION_UNKNOWN')blockers.push('SOURCE_REVISION_UNKNOWN');
  if(mismatch)blockers.push('SOURCE_REVISION_CAS_MISMATCH','STALE_PREVIEW_REJECTED');
  if(current?.format!=='zip')blockers.push('NATIVE_CROSS_STORE_CAS_REQUIRES_ZIP');
  if(readEvidence?.mode==='STRUCTURAL_READ_ONLY')blockers.push('STRUCTURAL_READ_ONLY');
  if(readEvidence?.readable&&Object.values(readEvidence.readable).some(x=>x!==true))blockers.push('DOMAIN_UNKNOWN');
  if(readEvidence&&(readEvidence.unknownUnionTokens>0||Object.values(readEvidence.extraFields||{}).some(n=>n>0)))blockers.push('OPAQUE_UNION_FIELDS');
  if(researchEvidence)blockers.push('RESEARCH_PROOF_IS_NOT_EXPORT_AUTHORIZATION');
  return Object.freeze({schema:'HKIA.Web05.CASReadOnlyDisplay.1',status,stale:mismatch,
    expectedRevision:expected?.sha256??null,currentRevision:current?.sha256??null,
    localSnapshotChecked:status==='LOCAL_SNAPSHOT_MATCH_ONLY',nativeCASVerified:false,
    researchReadOnlyEvidence:researchEvidence!==null,
    blockers:Object.freeze([...new Set(blockers)]),nativeApplyAuthorized:false,nativeExportAuthorized:false});
}

export function captureReadOnlyPreview(revision,{domain,readEvidence=null,researchEvidence=null}={}){
  if(!['achievement','counter','collection-history','account'].includes(domain))throw new TypeError('invalid preview domain');
  if(revision?.schema!==SOURCE_REVISION_UI_SCHEMA)throw new Error('SOURCE_REVISION_UNKNOWN');
  return Object.freeze({schema:'HKIA.Web05.CASPreview.1',domain,source:revision,readEvidence,researchEvidence});
}

export function assessReadOnlyPreview(preview,current){
  if(preview?.schema!=='HKIA.Web05.CASPreview.1')throw new TypeError('unbound preview');
  return inspectRevisionCAS({expected:preview.source,current,readEvidence:preview.readEvidence,researchEvidence:preview.researchEvidence});
}

export function captureAccountZipExport({originalBytes,originalName,account,sourceRevision,sourceLoadEpoch,accountEditGeneration}){
  if(!(originalBytes instanceof Uint8Array)||!account||sourceRevision?.schema!==SOURCE_REVISION_UI_SCHEMA||sourceRevision.format!=='zip'||
    sourceRevision.epoch!==sourceLoadEpoch||!Number.isSafeInteger(accountEditGeneration)||accountEditGeneration<0||
    typeof originalName!=='string'||!originalName.toLowerCase().endsWith('.zip'))throw new Error('ACCOUNT_ZIP_SOURCE_REVISION_UNAVAILABLE');
  return Object.freeze({schema:'HKIA.Web05.AccountZipExportCAS.1',originalBytes,originalName,
    sourceRevision,sourceLoadEpoch,accountEditGeneration,accountSerialized:JSON.stringify(account)});
}

export function inspectAccountZipExport({binding,current,verifiedSha256=null}){
  if(binding?.schema!=='HKIA.Web05.AccountZipExportCAS.1')throw new TypeError('invalid Account ZIP export binding');
  const blockers=[];
  if(!current?.account||!current.dirty||!current.archiveLoaded||current.sourceLoading||current.slotEvidence?.accountExportAllowed===false)
    blockers.push('ACCOUNT_ZIP_EXPORT_NOT_ELIGIBLE');
  if(!current?.sourceRevision||current.sourceRevision.schema!==SOURCE_REVISION_UI_SCHEMA||
     current.sourceRevision.format!=='zip'||current.sourceRevision.epoch!==current.sourceLoadEpoch||
     current.sourceLoadEpoch!==binding.sourceLoadEpoch||current.originalBytes!==binding.originalBytes||
     current.sourceRevision.sha256!==binding.sourceRevision.sha256||current.originalName!==binding.originalName)
    blockers.push('SOURCE_REVISION_CAS_MISMATCH');
  if(current?.accountEditGeneration!==binding.accountEditGeneration||
     (current.account&&JSON.stringify(current.account)!==binding.accountSerialized))
    blockers.push('ACCOUNT_EDIT_GENERATION_MISMATCH');
  if(verifiedSha256!==null&&verifiedSha256!==binding.sourceRevision.sha256)blockers.push('SOURCE_BYTES_SHA256_MISMATCH');
  return Object.freeze({allowed:blockers.length===0,blockers:Object.freeze(blockers)});
}
