<script lang="ts">
 import {onMount} from 'svelte';
 import LocaleSelector from './LocaleSelector.svelte';
 import {createLocaleConsumer,type LocaleEntry,type Pack,type Preference,type Runtime,type StoragePort} from './locale-consumer.ts';
 // Synthetic browser-only fixture: deliberately not the 08 runtime or game registry.
 const registry:readonly LocaleEntry[]=[{id:'en',nativeName:'English',htmlLang:'en',direction:'ltr'},{id:'ja',nativeName:'日本語',htmlLang:'ja',direction:'ltr'},{id:'zh-Hant',nativeName:'繁體中文',htmlLang:'zh-Hant',direction:'ltr'}];
 const runtime:Runtime<Pack>={readPreference(s){try{const p=JSON.parse(s.getItem('fixture-locale')??'null');return p?.mode==='manual'?p:{mode:'auto'}}catch{return {mode:'auto'}}},writePreference(s,p){if(p.mode==='auto')s.removeItem('fixture-locale');else s.setItem('fixture-locale',JSON.stringify(p))},resolvePreference(p,n,e){if(p.mode==='manual')return p.locale;return [...(n.languages??[]),n.language].find(l=>l&&e.includes(l))??'en'},createLocaleLoader(fetch){let g=0;return {async load(v,l){const id=++g;try{const pack=await fetch(v,l);return id===g?{status:'READY',pack}:{status:'STALE'}}catch(e){if(id!==g)return {status:'STALE'};throw e}},invalidate(){g++}}}};
 const storage:StoragePort={getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k)};
 const consumer=createLocaleConsumer({runtime,registry,storage,browser:()=>({languages:['en']}),fetchVerified:async(v,l)=>({version:v,locale:l}),documentLanguage:(l,d)=>{document.documentElement.lang=l;document.documentElement.dir=d}});
 let state=$state(consumer.state);const labels={label:'Language',auto:'Automatic (browser)',loading:'Loading…',unverified:'Synthetic preview, not game language certification.',error:'Language load failed.',storageUnavailable:'Preference could not be stored.'};
 onMount(()=>{const unsubscribe=consumer.subscribe(s=>state=s);void consumer.start('3.0.1');return ()=>{unsubscribe();consumer.close()}});
 function choose(p:Preference){void consumer.choose(p)}
</script>
<main data-locale={state.active?.locale??''} data-status={state.status} data-storage={state.storage}>
 <h1>Locale consumer fixture</h1><LocaleSelector entries={consumer.entries} {state} {labels} onchoose={choose}/>
 <p>Read-only synthetic UI. No save input or session.</p>
</main>
<style>main{max-width:48rem;margin:auto;padding:1rem;box-sizing:border-box;font-family:system-ui,sans-serif}h1{font-size:1.25rem}</style>
