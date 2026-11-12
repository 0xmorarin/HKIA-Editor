import type {NativeProductSession,NativeProductRequest,NativeProductPlan,NativeProductProof} from '../contracts/04-native-product-browser.js';
export type NativeProductWorkerSession=Readonly<Omit<NativeProductSession,'schema'|'plan'|'verifyNoop'|'export'|'undo'|'reset'>&{
 schema:'HKIA.04.ProductNativeWorkerSession.1';
 plan(request:NativeProductRequest):Promise<NativeProductPlan>;
 verifyNoop(expectedRevision:string):Promise<ReturnType<NativeProductSession['verifyNoop']>>;
 export(expectedRevision:string):Promise<ReturnType<NativeProductSession['export']>>;
 undo(expectedRevision:string):Promise<true>;reset(expectedRevision:string):Promise<true>;
}>;
export declare function openNativeProductWorkerSession(input:Uint8Array|ArrayBuffer,options?:Readonly<{sameVersionWitnessArchive?:Uint8Array|ArrayBuffer|null}>):Promise<NativeProductWorkerSession>;
