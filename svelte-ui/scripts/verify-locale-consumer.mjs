// Private execution: accepted 08 runtime and registry paths supplied by operator.
// No game pack, private locator, or asset bytes in public source/CI.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {createLocaleConsumer} from '../src/locale-consumer.ts';
const [runtimePath,registryPath]=process.argv.slice(2);
if(!runtimePath||!registryPath)throw new Error('REQUIRE_ACCEPTED_RUNTIME_AND_REGISTRY');
const runtime=await import(pathToFileURL(resolve(runtimePath)).href);
const registry=JSON.parse(await readFile(registryPath,'utf8')).sourceLocaleInventory;
assert.equal(registry.length,15);
const cases=[];
const run=async(name,fn)=>{await fn();cases.push(name)};
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return {promise,resolve,reject}};
const make=(opts={})=>{const values=new Map(),writes=[],langs=[],calls=[];let nav=opts.nav??{languages:['xx','ja-JP'],language:'en-US'};const storage={getItem(k){if(opts.readDenied)throw Error('denied');return values.get(k)??null},setItem(k,v){if(opts.writeDenied)throw Error('denied');writes.push([k,v]);values.set(k,v)},removeItem(k){if(opts.removeDenied)throw Error('denied');writes.push([k,null]);values.delete(k)}};if(opts.pref)values.set(runtime.STORAGE_KEY,JSON.stringify(opts.pref));const c=createLocaleConsumer({runtime,registry,storage,browser:()=>nav,fetchVerified:async(v,l)=>{calls.push([v,l]);return opts.fetch?opts.fetch(v,l):{version:v,locale:l}},documentLanguage:(l,d)=>langs.push([l,d])});return {c,values,writes,langs,calls,setNav:n=>nav=n}};
await run('ordered browser default and alias',async()=>{const x=make();assert.equal(await x.c.start('3.0.1'),'READY');assert.equal(x.c.state.active.locale,'ja');assert.deepEqual(x.langs,[['ja','ltr']]);assert.equal(x.writes.length,0)});
await run('manual persists only after verified load',async()=>{const x=make();await x.c.start('3.0.0');await x.c.choose({mode:'manual',locale:'fr-CA'});assert.equal(x.c.state.active.locale,'fr-CA');assert.deepEqual(JSON.parse(x.values.get(runtime.STORAGE_KEY)),{mode:'manual',locale:'fr-CA'});assert.equal(x.writes.length,1)});
await run('manual startup and Auto restores ordered browser',async()=>{const x=make({pref:{mode:'manual',locale:'zh-Hant'},nav:{languages:['zh-CN'],language:'en'}});await x.c.start('3.0.1');assert.equal(x.c.state.active.locale,'zh-Hant');await x.c.choose({mode:'auto'});assert.equal(x.c.state.active.locale,'zh-Hans');assert.equal(x.values.has(runtime.STORAGE_KEY),false)});
await run('ambiguous zh not collapsed, navigator.language fallback',async()=>{const x=make({nav:{languages:['zh','xx'],language:'en-GB'}});await x.c.start('3.0.1');assert.equal(x.c.state.active.locale,'en-GB')});
await run('unsupported preference and invalid version reject without load',async()=>{const x=make();await x.c.start('3.0.1');await assert.rejects(x.c.choose({mode:'manual',locale:'xx'}),/INVALID_LOCALE_REQUEST/);await assert.rejects(x.c.start('3.1.0'),/INVALID_LOCALE_REQUEST/);assert.equal(x.calls.length,1)});
await run('read denied auto, write denied still ready and explicit',async()=>{const x=make({readDenied:true,writeDenied:true});assert.equal(x.c.state.storage,'UNAVAILABLE');await x.c.start('3.0.1');assert.equal(await x.c.choose({mode:'manual',locale:'en'}),'READY');assert.equal(x.c.state.storage,'UNAVAILABLE');assert.equal(x.c.state.active.locale,'en');assert.equal(x.values.size,0)});
await run('remove denied auto remains active with warning',async()=>{const x=make({pref:{mode:'manual',locale:'en'},removeDenied:true});await x.c.start('3.0.1');await x.c.choose({mode:'auto'});assert.equal(x.c.state.active.locale,'ja');assert.equal(x.c.state.storage,'UNAVAILABLE');assert.equal(x.values.has(runtime.STORAGE_KEY),true)});
await run('late rejection cannot surface after newer ready',async()=>{const old=deferred(),x=make({fetch:(v,l)=>l==='ja'?old.promise:Promise.resolve({version:v,locale:l})});const a=x.c.start('3.0.0');assert.equal(await x.c.choose({mode:'manual',locale:'en'}),'READY');old.reject(Error('stale'));assert.equal(await a,'STALE');assert.equal(x.c.state.active.locale,'en');assert.equal(x.c.state.error,null);assert.equal(x.writes.length,1)});
await run('late success and version switch cannot expose old pack',async()=>{const old=deferred(),x=make({fetch:(v,l)=>v==='3.0.0'?old.promise:Promise.resolve({version:v,locale:l})});const a=x.c.start('3.0.0');await x.c.start('3.0.1');old.resolve({version:'3.0.0',locale:'ja'});assert.equal(await a,'STALE');assert.equal(x.c.state.active.version,'3.0.1')});
await run('current rejection retains prior same-version display and preference',async()=>{const x=make({fetch:(v,l)=>l==='en'?Promise.reject(Error('bad')):Promise.resolve({version:v,locale:l})});await x.c.start('3.0.1');assert.equal(await x.c.choose({mode:'manual',locale:'en'}),'ERROR');assert.equal(x.c.state.error,'LOAD_FAILED');assert.equal(x.c.state.active.locale,'ja');assert.equal(x.c.state.preference.mode,'auto');assert.equal(x.writes.length,0)});
await run('wrong pack metadata rejected',async()=>{const x=make({fetch:async()=>({version:'3.0.0',locale:'en'})});assert.equal(await x.c.start('3.0.1'),'ERROR');assert.equal(x.c.state.error,'PACK_MISMATCH');assert.equal(x.c.state.active,null);assert.equal(x.langs.length,0)});
await run('close invalidates pending reject',async()=>{const d=deferred(),x=make({fetch:()=>d.promise});const a=x.c.start('3.0.1');x.c.close();d.reject(Error('late'));assert.equal(await a,'STALE');assert.equal(x.c.state.status,'CLOSED');assert.equal(x.c.state.active,null);await assert.rejects(x.c.start('3.0.1'),/CLOSED/)});
await run('all 15 exact registry IDs and native names, no language collapse',async()=>{const x=make();await x.c.start('3.0.1');for(const r of registry){await x.c.choose({mode:'manual',locale:r.id});assert.equal(x.c.state.active.locale,r.id);assert.deepEqual(x.langs.at(-1),[r.htmlLang,r.direction])}assert.equal(x.c.entries.length,15);assert.equal(x.writes.length,15)});
await run('reentrant subscriber newer request wins before loader start',async()=>{const x=make();let newer;const unsub=x.c.subscribe(s=>{if(s.status==='LOADING'&&!newer){unsub();newer=x.c.choose({mode:'manual',locale:'en'})}});assert.equal(await x.c.start('3.0.1'),'STALE');assert.equal(await newer,'READY');assert.deepEqual(x.calls,[['3.0.1','en']])});
// Optional private accepted pack integration: verify only representative consumer loads, not a full data re-QA.
if(process.argv[4]){
 const root=process.argv[4],manifest=JSON.parse(await readFile(resolve(root,'localization/evidence/manifest.json'),'utf8'));
 const sha=async b=>createHash('sha256').update(b).digest('hex');
 const identitySha256=await sha(await readFile(resolve(root,'localization/game/identity-index.json')));
 const verified=async(v,l)=>{const path=`localization/game/packs/${v}/${l}.json`,pin=manifest.files.find(x=>x.path===path);assert.ok(pin);return runtime.verifyPack(await readFile(resolve(root,path)),{sha256:pin.sha256,version:v,locale:l,identitySha256},sha)};
 await run('representative accepted real pack consumer binding two versions',async()=>{const x=make({fetch:verified});await x.c.start('3.0.1');assert.equal(x.c.state.active.pack.schema,'HKIA.Localization.GamePack.1');assert.equal(x.c.state.active.locale,'ja');x.setNav({languages:['zh-TW']});await x.c.start('3.0.0');assert.equal(x.c.state.active.locale,'zh-Hant');assert.equal(x.c.state.active.version,'3.0.0');assert.equal(x.c.state.active.pack.identitySha256,identitySha256);assert.equal(x.writes.length,0)});
}
console.log(JSON.stringify({cases,pass:cases.length,fail:0,scope:'accepted runtime/registry actual execution; synthetic pack/storage/document sinks; no production session or browser'}));
