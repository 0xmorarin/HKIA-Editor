import {flushSync,mount,unmount} from 'svelte';
import ProductAchievementRows from './ProductAchievementRows.svelte';
import {createProductAchievementListBridge as bridge} from './product-achievement-list-bridge.ts';
export function createProductAchievementListBridge(doc:Document){return bridge(doc,(host,snapshot,port)=>{
 const instance=mount(ProductAchievementRows,{target:host,props:{snapshot,port}});
 const dispose=()=>{void unmount(instance).catch(()=>{});};try{flushSync();}catch(e){dispose();throw e;}return dispose;
});}
