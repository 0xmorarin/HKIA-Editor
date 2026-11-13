<script lang="ts">
 import type {LocaleEntry,LocaleState,Pack,Preference} from './locale-consumer.ts';
 let {entries,state,labels,onchoose}: {entries:readonly LocaleEntry[];state:LocaleState<Pack>;labels:{label:string;auto:string;loading:string;unverified:string;error:string;storageUnavailable:string};onchoose:(p:Preference)=>void}=$props();
 const selected=$derived(state.preference.mode==='manual'?state.preference.locale:'auto');
 function change(event:Event){const control=event.currentTarget as HTMLSelectElement;const value=control.value;control.value=selected;if(value==='auto')onchoose({mode:'auto'});else if(entries.some(r=>r.id===value))onchoose({mode:'manual',locale:value});}
</script>
<div class="locale-preference">
 <label for="hkiaLocale">{labels.label}</label>
 <select id="hkiaLocale" value={selected} onchange={change} disabled={state.status==='IDLE'||state.status==='CLOSED'} aria-describedby="hkiaLocaleNotice" aria-busy={state.status==='LOADING'}>
  <option value="auto">{labels.auto}</option>
  {#each entries as entry (entry.id)}<option value={entry.id} lang={entry.htmlLang}>{entry.nativeName}</option>{/each}
 </select>
 <p id="hkiaLocaleNotice">{labels.unverified}</p>
 {#if state.status==='LOADING'}<p role="status">{labels.loading}</p>{/if}
 {#if state.status==='ERROR'}<p role="alert">{labels.error}</p>{/if}
 {#if state.storage==='UNAVAILABLE'}<p role="status">{labels.storageUnavailable}</p>{/if}
</div>
<style>.locale-preference{display:grid;gap:.4rem;max-width:100%;min-width:0}.locale-preference select{max-width:100%;min-width:0}.locale-preference p{margin:0;overflow-wrap:anywhere}</style>
