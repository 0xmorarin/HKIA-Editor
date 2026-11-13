export type VerifiedCatalog=Readonly<{locale:string;catalog:Readonly<Record<string,string>>}>;
export const SITES:readonly (readonly [string,string,string,string])[];
export function verifyEditorCatalog(bytes:Uint8Array,locale:string,sha256:(bytes:Uint8Array)=>Promise<string>):Promise<VerifiedCatalog>;
export function createChromeBinding(doc:Document):{readonly active:string|null;apply(pack:VerifiedCatalog):boolean;reset():boolean};
