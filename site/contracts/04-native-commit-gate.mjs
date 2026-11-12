                                                                                       
export const NATIVE_WRITER_ENABLED=false;
export function nativeWriterCapability(){
  return Object.freeze({schema:'HKIA.04.NativeCommitGate.1',mode:'READ_ONLY',writerEnabled:false,
    canApply:false,canExport:false,gameAcceptanceVerified:false,
    blockers:Object.freeze(['PRIVATE_REAL_SAVE_NOT_VERIFIED','NATIVE_INTEGRITY_NOT_PROVEN',
      'INDEPENDENT_QA_NOT_ACCEPTED','REAL_DEVICE_NOT_ACCEPTED'])});
}
export class NativeWriterDisabledError extends Error {
  constructor(){super('NATIVE_WRITER_DISABLED');this.name='NativeWriterDisabledError';this.code='NATIVE_WRITER_DISABLED';}
}
export function commitNativeCrossStoreZip(){
                                                                                    
  throw new NativeWriterDisabledError();
}
