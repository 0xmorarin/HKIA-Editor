import {mount,unmount,flushSync} from 'svelte';
import ProductLocaleChrome from './ProductLocaleChrome.svelte';
import {createProductLocaleController} from './product-locale-controller.ts';
export function mountProductLocaleChrome(host:HTMLElement,args:Parameters<typeof createProductLocaleController>[0]){const controller=createProductLocaleController(args);const instance=mount(ProductLocaleChrome,{target:host,props:{controller}});try{flushSync();}catch(e){void unmount(instance).catch(()=>{});throw e;}return ()=>{void unmount(instance).catch(()=>{});};}
