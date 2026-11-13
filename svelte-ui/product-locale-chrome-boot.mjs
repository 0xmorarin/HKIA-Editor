import * as runtime from '../localization/runtime.mjs';
import {mountProductLocaleChrome} from './product-locale-chrome.mjs';
const host=document.getElementById('hkiaLocaleChrome');
const sha256=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
const load=async locale=>{if(!runtime.LOCALES.includes(locale))throw Error('LOCALE_NOT_ALLOWED');const u=new URL('../localization/ui/'+locale+'.json',import.meta.url);if(u.origin!==location.origin)throw Error('LOCALE_ORIGIN');const r=await fetch(u,{mode:'same-origin',credentials:'same-origin',cache:'no-store',redirect:'error'});if(!r.ok)throw Error('LOCALE_HTTP');return new Uint8Array(await r.arrayBuffer());};
try{if(!host||!crypto.subtle)throw Error('LOCALE_UNAVAILABLE');mountProductLocaleChrome(host,{doc:document,runtime,storage:{getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k)},browser:()=>navigator,load,sha256});}catch{if(host)host.hidden=true;}
