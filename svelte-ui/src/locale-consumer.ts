/** Display-only consumer of the accepted 08 runtime. No Save or Session dependency. */
export type Preference = {mode:'auto'} | {mode:'manual';locale:string};
export type LocaleEntry = Readonly<{id:string;nativeName:string;htmlLang:string;direction:'ltr'|'rtl'}>;
export type Version = '3.0.0'|'3.0.1';
export type Pack = Readonly<{version:Version;locale:string}>;
export type StoragePort = Pick<Storage,'getItem'|'setItem'|'removeItem'>;
export type BrowserLanguage = Readonly<{languages?:readonly string[];language?:string}>;
export type Runtime<P extends Pack> = {
 readPreference(storage:StoragePort):Preference;
 writePreference(storage:StoragePort,pref:Preference):void;
 resolvePreference(pref:Preference,nav:BrowserLanguage,enabled:readonly string[]):string;
 createLocaleLoader(fetchVerified:(v:Version,l:string)=>Promise<P>):{load(v:Version,l:string):Promise<{status:'READY';pack:P}|{status:'STALE'}>;invalidate():void};
};
export type LocaleState<P extends Pack> = Readonly<{
 status:'IDLE'|'LOADING'|'READY'|'ERROR'|'CLOSED'; preference:Preference; version:Version|null;
 active:Readonly<{locale:string;version:Version;pack:P}>|null; storage:'AVAILABLE'|'UNAVAILABLE'; error:'LOAD_FAILED'|'PACK_MISMATCH'|null;
}>;
export function createLocaleConsumer<P extends Pack>(args:{runtime:Runtime<P>;registry:readonly LocaleEntry[];storage:StoragePort;browser:()=>BrowserLanguage;fetchVerified:(v:Version,l:string)=>Promise<P>;documentLanguage:(lang:string,dir:'ltr'|'rtl')=>void}) {
 const {runtime,storage,registry}=args;
 const entries=registry.map(r=>Object.freeze({...r}));
 const enabled=Object.freeze(entries.map(r=>r.id));
 if(!enabled.length||new Set(enabled).size!==enabled.length||entries.some(r=>!r.id||!r.nativeName||!r.htmlLang||!['ltr','rtl'].includes(r.direction))) throw new Error('INVALID_LOCALE_REGISTRY');
 let storageState:'AVAILABLE'|'UNAVAILABLE'='AVAILABLE';
 const guarded:StoragePort={getItem(k){try{return storage.getItem(k)}catch(e){storageState='UNAVAILABLE';throw e}},setItem(k,v){try{storage.setItem(k,v)}catch(e){storageState='UNAVAILABLE';throw e}},removeItem(k){try{storage.removeItem(k)}catch(e){storageState='UNAVAILABLE';throw e}}};
 let pref=runtime.readPreference(guarded); if(pref.mode==='manual'&&!enabled.includes(pref.locale))pref={mode:'auto'};
 let state:LocaleState<P>=Object.freeze({status:'IDLE',preference:Object.freeze({...pref}),version:null,active:null,storage:storageState,error:null});
 let generation=0;const loader=runtime.createLocaleLoader(args.fetchVerified);const listeners=new Set<(s:LocaleState<P>)=>void>();
 function current(g:number){return g===generation&&state.status!=='CLOSED'}
 function publish(next:LocaleState<P>){const snapshot=Object.freeze(next);state=snapshot;for(const fn of listeners){if(state!==snapshot)break;fn(snapshot)}}
 function valid(p:Preference){return p.mode==='auto'||(p.mode==='manual'&&enabled.includes(p.locale))}
 // The accepted runtime writes one preference key. Stage the write before calling the
 // external synchronous StoragePort. If it reenters and invalidates this request,
 // compensate only our exact written value; never overwrite a different external value.
 // Sinks must be synchronous, truthful storage operations. Failed compensation is
 // reported as unavailable, not as a successful persistence or READY state.
 function persistCurrent(g:number,desired:Preference){
  let mutation:{key:string;value:string|null}|undefined;
  const stage=(key:string,value:string|null)=>{if(mutation)throw Error('MULTIPLE_PREFERENCE_WRITES');mutation={key,value}};
  try{runtime.writePreference({getItem(){throw Error('UNEXPECTED_PREFERENCE_READ')},setItem:stage,removeItem:k=>stage(k,null)},desired)}catch{if(current(g))storageState='UNAVAILABLE';return}
  if(!current(g))return;
  if(!mutation){storageState='UNAVAILABLE';return}
  const {key,value}=mutation;
  let previous:string|null;
  try{previous=storage.getItem(key)}catch{if(current(g))storageState='UNAVAILABLE';return}
  if(!current(g))return;
  try{if(value===null)storage.removeItem(key);else storage.setItem(key,value)}catch{if(current(g))storageState='UNAVAILABLE'}
  if(current(g))return;
  // A nested request cannot finish its awaited load within this synchronous stack.
  // Compare-and-restore is best effort, including a sink that wrote then threw.
  try{if(storage.getItem(key)===value&&previous!==value){if(previous===null)storage.removeItem(key);else storage.setItem(key,previous)}}catch{storageState='UNAVAILABLE'}
 }
 async function request(version:Version,preference:Preference,persist=false):Promise<'READY'|'STALE'|'ERROR'> {
  if(state.status==='CLOSED')throw new Error('LOCALE_CONSUMER_CLOSED');
  if(!['3.0.0','3.0.1'].includes(version)||!valid(preference))throw new Error('INVALID_LOCALE_REQUEST');
  const desired=Object.freeze({...preference});const g=++generation;
  let locale:string;let entry:LocaleEntry;
  try{
   const nav=args.browser();if(!current(g))return 'STALE';
   locale=runtime.resolvePreference(desired,nav,enabled);if(!current(g))return 'STALE';
   const resolved=entries.find(r=>r.id===locale);if(!resolved)throw new Error('INVALID_RESOLVED_LOCALE');entry=resolved;
  }catch(e){if(!current(g))return 'STALE';throw e}
  try{
   publish({...state,status:'LOADING',version,active:state.active?.version===version?state.active:null,error:null});
   if(!current(g))return 'STALE';
   const result=await loader.load(version,locale);
   if(!current(g)||result.status==='STALE')return 'STALE';
   if(result.pack.version!==version||result.pack.locale!==locale){publish({...state,status:'ERROR',error:'PACK_MISMATCH'});return current(g)?'ERROR':'STALE'}
   const prior=state.active;
   // A document setter already invoked cannot be cancelled. If reentry leaves an
   // older displayed pack, restore that pack's language; CLOSED has no active pack.
   const restoreDocument=()=>{if(state.status==='CLOSED'||!prior||state.active!==prior)return;const old=entries.find(r=>r.id===prior.locale);if(old)try{args.documentLanguage(old.htmlLang,old.direction)}catch{/* external sink failure; no stale state commit */}};
   try{args.documentLanguage(entry.htmlLang,entry.direction)}catch(e){if(!current(g)){restoreDocument();return 'STALE'}throw e}
   if(!current(g)){restoreDocument();return 'STALE'}
   if(persist)persistCurrent(g,desired);
   if(!current(g)){restoreDocument();return 'STALE'}
   publish({status:'READY',preference:desired,version,active:Object.freeze({version,locale,pack:result.pack}),storage:storageState,error:null});return current(g)?'READY':'STALE';
  }catch{if(!current(g))return 'STALE';publish({...state,status:'ERROR',storage:storageState,error:'LOAD_FAILED'});return current(g)?'ERROR':'STALE'}
 }
 return Object.freeze({get state(){return state},entries:Object.freeze(entries),subscribe(fn:(s:LocaleState<P>)=>void){listeners.add(fn);fn(state);return ()=>listeners.delete(fn)},start(v:Version){return request(v,state.preference)},choose(p:Preference){if(state.version===null)throw new Error('LOCALE_VERSION_REQUIRED');return request(state.version,p,true)},refreshAuto(){if(state.version===null)throw new Error('LOCALE_VERSION_REQUIRED');return request(state.version,state.preference)},close(){if(state.status==='CLOSED')return;generation++;loader.invalidate();publish({...state,status:'CLOSED',active:null,version:null,error:null});listeners.clear()}});
}
