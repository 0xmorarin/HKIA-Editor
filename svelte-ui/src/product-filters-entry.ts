import {flushSync,mount,unmount} from 'svelte';
import ProductFilterGroup from './ProductFilterGroup.svelte';
import {installProductFilters,type ProductFilterCallbacks} from './product-filter-bridge.ts';
export function mountProductFilters(doc:Document,callbacks:ProductFilterCallbacks){return installProductFilters(doc,callbacks,(host,group,initial,intent)=>{const instance=mount(ProductFilterGroup,{target:host,props:{group,initial,intent}});const dispose=()=>{void unmount(instance).catch(()=>{});};try{flushSync();}catch(err){dispose();throw err;}return dispose;});}
