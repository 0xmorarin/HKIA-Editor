import {flushSync,mount,unmount} from 'svelte';
import ProductCategoryCards from './ProductCategoryCards.svelte';
import {createProductCategoryBridge as bridge} from './product-category-bridge.ts';
export function createProductCategoryBridge(doc:Document){return bridge(doc,(host,snapshot,port)=>{
 const instance=mount(ProductCategoryCards,{target:host,props:{snapshot,port}});
 const dispose=()=>{void unmount(instance).catch(()=>{});};try{flushSync();}catch(e){dispose();throw e;}return dispose;
});}
