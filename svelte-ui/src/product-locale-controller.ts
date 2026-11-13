import {createLocaleConsumer,type Runtime,type StoragePort,type BrowserLanguage} from './locale-consumer.ts';
import {REGISTRY} from './product-locale-chrome-pins.mjs';
import {createChromeBinding,verifyEditorCatalog,type VerifiedCatalog} from './product-locale-chrome.mjs';
export type EditorPack=Readonly<{version:'3.0.1';locale:string;verified:VerifiedCatalog}>;
// The version here is only a reference for the editor-catalog consumer, never the loaded Save version.
export function createProductLocaleController(args:{doc:Document;runtime:Runtime<EditorPack>;storage:StoragePort;browser:()=>BrowserLanguage;load:(locale:string)=>Promise<Uint8Array>;sha256:(bytes:Uint8Array)=>Promise<string>}){
 const binding=createChromeBinding(args.doc),cache=new Map<string,VerifiedCatalog>();let blocked=false;
 const consumer=createLocaleConsumer({runtime:args.runtime,registry:REGISTRY,storage:args.storage,browser:args.browser,fetchVerified:async(_v,locale)=>{const verified=await verifyEditorCatalog(await args.load(locale),locale,args.sha256);cache.set(locale,verified);return Object.freeze({version:'3.0.1' as const,locale,verified});},documentLanguage:(lang)=>{if(blocked)throw Error('LOCALE_CHROME_BLOCKED');const pack=cache.get(lang);if(!pack)throw Error('LOCALE_CATALOG_NOT_VERIFIED');binding.apply(pack);}});
 // A synchronous external storage callback can reenter after display commit. Restore only the prior accepted generation.
 consumer.subscribe(s=>{if(s.status==='READY')return;try{const old=s.active?.pack.verified;if(old){if(binding.active!==old.locale)binding.apply(old);}else if(binding.active!==null)binding.reset();}catch{blocked=true;}});
 return Object.freeze({consumer,binding,get blocked(){return blocked;}});
}
