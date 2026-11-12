   
                                                           
                                                                                 
   
export const FORWARD_COMPAT_CONTRACT = 'HKIA.ForwardCompatibility.1';
const VALIDATED_BASE_VERSIONS = new Set(['3.0.0','3.0.1']);
const DOMAINS = ['achievement','counter','collection-history'];
const MODEL_STATES = new Set(['RECOGNIZED','ABSENT','UNRECOGNIZED']);
const RECORD_SCHEMA_STATES = new Set(['EXACT','KNOWN_PREFIX_WITH_EXTRAS','UNKNOWN']);
const RECORD_DOMAINS = new Set(['achievement','counter','collection-history']);
const REQUIRED_GATES = ['writerApproved','versionCodecVerified','targetFieldVerified','requiredLinkageResolved','losslessNonTargetVerified','reparseDiffVerified','nativeAcceptanceVerified'];

                                                                                                   
export function classifySaveCompatibility({version,headerVersion,headerStructureValid,wrapperStructureValid,domains}){
  if(typeof version!=='string'||!/^\d+\.\d+\.\d+$/.test(version))throw new TypeError('version must be X.Y.Z');
  if(typeof headerVersion!=='string'||typeof headerStructureValid!=='boolean'||typeof wrapperStructureValid!=='boolean')throw new TypeError('explicit envelope evidence is required');
  if(!domains||typeof domains!=='object'||Array.isArray(domains))throw new TypeError('typed domain evidence is required');
  for(const domain of DOMAINS)if(!MODEL_STATES.has(domains[domain]))throw new TypeError(`missing/invalid domain evidence: ${domain}`);
  const versionKnown=VALIDATED_BASE_VERSIONS.has(version);
  const fatal=headerVersion!==version||!headerStructureValid||!wrapperStructureValid;
  const readable=Object.fromEntries(DOMAINS.map(k=>[k,!fatal&&domains[k]==='RECOGNIZED']));
  const anyReadable=Object.values(readable).some(Boolean);
  const state=fatal||!anyReadable?'REJECTED':versionKnown?'KNOWN_VERSION_STRUCTURAL':'UNKNOWN_VERSION_STRUCTURAL';
  return Object.freeze({schema:FORWARD_COMPAT_CONTRACT,version,versionKnown,state,
    readable:Object.freeze(readable),completeModelCoverage:DOMAINS.every(k=>readable[k]),
                                                                             
    nativeExportAuthorized:false,gameAccepted:false,unknownFieldsMustBePreserved:true,
    issues:Object.freeze([
      ...(headerVersion!==version?['HEADER_BODY_VERSION_MISMATCH']:[]),
      ...(!headerStructureValid?['HEADER_STRUCTURE_INVALID']:[]),
      ...(!wrapperStructureValid?['WRAPPER_STRUCTURE_INVALID']:[]),
      ...DOMAINS.filter(k=>domains[k]==='UNRECOGNIZED').map(k=>`UNRECOGNIZED_${k.toUpperCase().replace('-','_')}`),
      ...(!versionKnown?['VERSION_NOT_NATIVE_VALIDATED']:[])
    ])});
}

   
                                                                              
                                                                               
                                                                                   
   
export function classifyRecordCompatibility({domain,id,schemaState,sourceIdentityKnown,recordAlreadyPersisted,requiredLinkageResolved=false,gates={}}){
  if(!RECORD_DOMAINS.has(domain)||!RECORD_SCHEMA_STATES.has(schemaState))throw new TypeError('invalid record classification');
  if(!((typeof id==='string'&&id.length>0&&id.length<=160)||(Number.isSafeInteger(id)&&id>=0)))throw new TypeError('missing stable record identifier');
  if(typeof sourceIdentityKnown!=='boolean'||typeof recordAlreadyPersisted!=='boolean'||typeof requiredLinkageResolved!=='boolean')throw new TypeError('explicit state evidence required');
  const recognized=schemaState!=='UNKNOWN';
  const displayLabel=sourceIdentityKnown?null:domain==='collection-history'?`収集履歴 ItemId ${id}`:`${domain==='achievement'?'実績':'カウンター'} ID ${id}`;
  const createEditIntentAllowed=recognized&&recordAlreadyPersisted;
  const missing=REQUIRED_GATES.filter(k=>k==='requiredLinkageResolved'?!requiredLinkageResolved:gates[k]!==true);
  const applyAuthorized=createEditIntentAllowed&&missing.length===0;
  return Object.freeze({schema:FORWARD_COMPAT_CONTRACT,domain,id,
    status:recognized?(sourceIdentityKnown?'MAPPED':'RECOGNIZED_UNMAPPED'):'OPAQUE',
    readable:recognized,displayLabel,createEditIntentAllowed,applyAuthorized,
    editableFields:recognized?(domain==='achievement'?Object.freeze(['IsComplete','CurrentValue','CompletedTime']):domain==='counter'?Object.freeze(['CurrentValue']):Object.freeze(['historyPresence','historyTicks'])):Object.freeze([]),
    preserveUnknownFields:true,mayRebuildUnknownRecords:false,
    blockers:Object.freeze([
      ...(!recognized?['SCHEMA_UNRECOGNIZED']:[]),
      ...(recognized&&!recordAlreadyPersisted?['NEW_RECORD_CREATION_UNVERIFIED']:[]),
      ...(createEditIntentAllowed?missing:[])
    ])});
}
