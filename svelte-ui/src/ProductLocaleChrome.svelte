<script lang="ts">
 import {onMount} from 'svelte';
 import LocaleSelector from './LocaleSelector.svelte';
 import type {createProductLocaleController} from './product-locale-controller.ts';
 import type {Preference} from './locale-consumer.ts';
 let {controller}:{controller:ReturnType<typeof createProductLocaleController>}=$props();
 const {consumer}=controller;let state=$state(consumer.state);
 const catalog=$derived(state.active?.pack.verified.catalog);
 const labels=$derived({label:catalog?.['locale.label']??'Language',auto:catalog?.['locale.auto']??'Automatic (browser)',loading:catalog?.['locale.loading']??'Loading language data…',unverified:catalog?.['locale.unverified']??'Language availability in game settings is not verified.',error:catalog?.['error.locale']??'Language data could not be verified.',storageUnavailable:'Language preference could not be stored.'});
 onMount(()=>{const off=consumer.subscribe(s=>state=s);void consumer.start('3.0.1');return()=>{off();consumer.close();}});
 function choose(p:Preference){void consumer.choose(p);}
</script>
<div data-hkia-locale-chrome={state.active?.locale??''} data-locale-status={state.status} lang={state.active?.locale??'en'}>
 <LocaleSelector entries={consumer.entries} {state} {labels} onchoose={choose}/>
 <p lang="en">Preview: tab and filter labels only. Other text remains unchanged. Achievement search still uses Japanese, English and GUIDs.</p>
</div>
