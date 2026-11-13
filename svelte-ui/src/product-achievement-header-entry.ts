import {flushSync,mount,unmount} from 'svelte';
import ProductAchievementHeader from './ProductAchievementHeader.svelte';
import {detailPresentation,EMPTY_DETAIL,type DetailRecord} from './achievement-detail.ts';
import {createProductAchievementHeaderBridge,type Header} from './product-achievement-header-bridge.mjs';
export function createProductAchievementHeader(doc:Document){
 const bridge=createProductAchievementHeaderBridge(doc,(host,header)=>{
  const instance=mount(ProductAchievementHeader,{target:host,props:{header}});
  const dispose=()=>{void unmount(instance).catch(()=>{});};
  try{flushSync();}catch(e){dispose();throw e;}return dispose;
 });
 return {render(panel:HTMLDivElement,record:DetailRecord|null,readSelected:()=>string|null){
  const header:Header=record===null?{guid:null,title:'達成記録の詳細',empty:EMPTY_DETAIL,lines:[]}:{guid:record.guid,title:record.title,empty:null,lines:detailPresentation(record)};
  return bridge.render(panel,header,readSelected);
 }};
}
