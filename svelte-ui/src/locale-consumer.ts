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
 function publish(next:LocaleState<P>){state=Object.freeze(next);for(const fn of listeners)fn(state)}
 function valid(p:Preference){return p.mode==='auto'||(p.mode==='manual'&&enabled.includes(p.locale))}
 async function request(version:Version,preference:Preference,persist=false):Promise<'READY'|'STALE'|'ERROR'> {
  if(state.status==='CLOSED')throw new Error('LOCALE_CONSUMER_CLOSED');
  if(!['3.0.0','3.0.1'].includes(version)||!valid(preference))throw new Error('INVALID_LOCALE_REQUEST');
  const desired=Object.freeze({...preference}); const locale=runtime.resolvePreference(desired,args.browser(),enabled);
  const entry=entries.find(r=>r.id===locale);if(!entry)throw new Error('INVALID_RESOLVED_LOCALE');
  const g=++generation;publish({...state,status:'LOADING',version,active:state.active?.version===version?state.active:null,error:null});
  if(g!==generation)return 'STALE';
  try {
   const result=await loader.load(version,locale);
   if(g!==generation||result.status==='STALE')return 'STALE';
   if(result.pack.version!==version||result.pack.locale!==locale){publish({...state,status:'ERROR',error:'PACK_MISMATCH'});return 'ERROR'}
   // Commit only verified current request. A failed storage write does not undo the display.
   args.documentLanguage(entry.htmlLang,entry.direction);
   if(persist){try{runtime.writePreference(guarded,desired)}catch{storageState='UNAVAILABLE'}}
   publish({status:'READY',preference:desired,version,active:Object.freeze({version,locale,pack:result.pack}),storage:storageState,error:null});return 'READY';
  }catch{if(g!==generation)return 'STALE';publish({...state,status:'ERROR',storage:storageState,error:'LOAD_FAILED'});return 'ERROR'}
 }
 return Object.freeze({get state(){return state},entries:Object.freeze(entries),subscribe(fn:(s:LocaleState<P>)=>void){listeners.add(fn);fn(state);return ()=>listeners.delete(fn)},start(v:Version){return request(v,state.preference)},choose(p:Preference){if(state.version===null)throw new Error('LOCALE_VERSION_REQUIRED');return request(state.version,p,true)},refreshAuto(){if(state.version===null)throw new Error('LOCALE_VERSION_REQUIRED');return request(state.version,state.preference)},close(){if(state.status==='CLOSED')return;generation++;loader.invalidate();publish({...state,status:'CLOSED',active:null,version:null,error:null});listeners.clear()}});
}
