                                                                               
export const LOCALES=Object.freeze(['en','en-GB','ja','de','fr','fr-CA','es','it','nl','pt-BR','ru','tr','ko','zh-Hans','zh-Hant']);
export const VERSIONS=Object.freeze(['3.0.0','3.0.1']);
export const STORAGE_KEY='hkia-editor.locale.preference.v1';
                                                                                    
const aliases=Object.freeze({'en-US':'en','ja-JP':'ja','de-DE':'de','fr-FR':'fr','es-ES':'es','it-IT':'it','nl-NL':'nl','ru-RU':'ru','tr-TR':'tr','ko-KR':'ko','zh-CN':'zh-Hans','zh-SG':'zh-Hans','zh-TW':'zh-Hant','zh-HK':'zh-Hant','zh-MO':'zh-Hant'});
export function resolveLocale(tag,enabled=LOCALES){
 if(typeof tag!=='string'||!tag.trim())return null;
 let canonical;try{canonical=Intl.getCanonicalLocales(tag)[0]}catch{return null}
 const candidate=LOCALES.includes(canonical)?canonical:aliases[canonical];return candidate&&enabled.includes(candidate)?candidate:null;
}
export function resolvePreference(pref,nav,enabled=LOCALES){
 if(!enabled.length)throw new Error('NO_ENABLED_LOCALE');
 if(pref?.mode==='manual'&&enabled.includes(pref.locale))return pref.locale;
 for(const t of [...(Array.isArray(nav?.languages)?nav.languages:[]),nav?.language]){const l=resolveLocale(t,enabled);if(l)return l;}
 return enabled.includes('en')?'en':enabled[0];
}
export function readPreference(storage){try{const p=JSON.parse(storage.getItem(STORAGE_KEY));if(p?.mode==='manual'&&LOCALES.includes(p.locale))return p}catch{}return {mode:'auto'}}
export function writePreference(storage,p){if(p?.mode==='auto'){storage.removeItem(STORAGE_KEY);return}if(p?.mode!=='manual'||!LOCALES.includes(p.locale))throw new Error('INVALID_PREFERENCE');storage.setItem(STORAGE_KEY,JSON.stringify({mode:'manual',locale:p.locale}));}
export function gameText(index,pack,domain,id,field){
 if(!VERSIONS.includes(pack.version)||!LOCALES.includes(pack.locale)||!['title','description'].includes(field))throw new Error('INVALID_GAME_LOOKUP');
 const r=index.get(`${domain}:${id}`);if(!r)return {status:'UNKNOWN_ID',text:null};const ref=r[field];
 if(!ref)return {status:'ABSENT_REF',text:null};if(!Object.hasOwn(pack.strings,ref))return {status:pack.missing[ref]||'MISSING_ID',text:null,ref};
 const text=pack.strings[ref];return {status:text.trim()?'EXACT_TEXT':'EMPTY_TEXT',text,ref,version:pack.version,locale:pack.locale,mappingStatus:pack.version==='3.0.0'?'V301_REFERENCE_KEYS_ONLY':'REFERENCE_DEFINITION',platformNameStatus:r.platformNameStatus};
}
export function indexRecords(rows){const index=new Map();for(const r of rows){const k=`${r.domain}:${r.id}`;if(index.has(k))throw new Error('DUPLICATE_ID');index.set(k,r);}return index;}
export async function verifyPack(bytes,expected,sha256){if(await sha256(bytes)!==expected.sha256)throw new Error('PACK_SHA_MISMATCH');const p=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(p.schema!=='HKIA.Localization.GamePack.1'||p.version!==expected.version||p.locale!==expected.locale||p.identitySha256!==expected.identitySha256)throw new Error('PACK_METADATA_MISMATCH');return p;}
export function createLocaleLoader(fetchVerified){let generation=0;return {async load(version,locale){if(!VERSIONS.includes(version)||!LOCALES.includes(locale))throw new Error('INVALID_PACK_REQUEST');const g=++generation;try{const pack=await fetchVerified(version,locale);return g===generation?{status:'READY',pack}:{status:'STALE'};}catch(error){if(g!==generation)return {status:'STALE'};throw error;}},invalidate(){generation++;}};}
const placeholders=s=>[...new Set([...s.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g)].map(m=>m[1]))].sort().join(',');
export function validateCatalog(reference,catalog){const missing=[],extra=[],invalid=[];for(const [k,v] of Object.entries(reference)){if(!Object.hasOwn(catalog,k)){missing.push(k);continue}if(typeof catalog[k]!=='string'||!catalog[k].trim()||placeholders(v)!==placeholders(catalog[k]))invalid.push(k)}for(const k of Object.keys(catalog))if(!Object.hasOwn(reference,k))extra.push(k);return {missing,extra,invalid};}
export function uiText(catalog,key,params={}){if(!Object.hasOwn(catalog,key))throw new Error('UI_KEY_MISSING:'+key);return catalog[key].replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g,(_,k)=>{if(!Object.hasOwn(params,k))throw new Error('UI_PARAM_MISSING:'+k);return String(params[k])});}
