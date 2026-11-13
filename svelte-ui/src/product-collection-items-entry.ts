import {flushSync,mount,unmount} from 'svelte';
import ProductCollectionItems from './ProductCollectionItems.svelte';
import {createProductCollectionItemsBridge} from './product-collection-items-bridge.mjs';
export function createProductCollectionItems(doc:Document){return createProductCollectionItemsBridge(doc,(host,snapshot,dispatch)=>{
 const instance=mount(ProductCollectionItems,{target:host,props:{snapshot,dispatch}});
 const dispose=()=>{void unmount(instance).catch(()=>{});};try{flushSync();}catch(e){dispose();throw e;}return dispose;
});}
