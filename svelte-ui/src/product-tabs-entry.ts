import {flushSync,mount,unmount} from 'svelte';
import ProductTabBar from './ProductTabBar.svelte';
import {installProductTabs} from './product-tab-bridge.ts';
import type {WorkspaceTab} from './navigation.ts';

export function mountProductTabs(doc:Document,setTab:(next:WorkspaceTab)=>void){
 return installProductTabs(doc,setTab,(host,initialTab,port)=>{
  const instance=mount(ProductTabBar,{target:host,props:{initialTab,port}});
  const dispose=()=>{void unmount(instance).catch(()=>{});};
  try{flushSync();}catch(err){dispose();throw err;}
  return dispose;
 });
}
