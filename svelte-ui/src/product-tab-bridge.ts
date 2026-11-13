import {activeLegacyTab,createLegacyNavigationPort,type LegacyTabSnapshot} from './legacy-navigation-port.ts';
import {tabs,tabPresentation,type WorkspaceNavigationPort,type WorkspaceTab} from './navigation.ts';

// The existing JS controller remains the only authority for panel visibility, selection,
// filters, catalog, Session and Writer. Svelte owns the two new buttons' event handlers.
export type RenderProductTabs=(host:HTMLDivElement,initial:WorkspaceTab,port:WorkspaceNavigationPort)=>()=>void;
export type TabInstallResult='MOUNTED'|'ALREADY_MOUNTED'|'LEGACY_RETAINED';
const marker='data-hkia-svelte-tabs';
const installed=new WeakMap<Document,HTMLDivElement>();
const require=(ok:unknown):void=>{if(!ok)throw Error('PRODUCT_TAB_DOM_CONTRACT');};
function one(doc:Document,id:string){const all=doc.querySelectorAll<HTMLElement>(`[id="${id}"]`);require(all.length===1);return all[0];}
function tabShape(host:HTMLElement,active:WorkspaceTab){
 require(host.tagName==='DIV'&&host.classList.contains('primary-tabs')&&host.getAttribute('role')==='tablist'&&host.getAttribute('aria-label')==='表示する機能'&&host.children.length===2);
 for(const [i,t] of tabs.entries()){
  const b=host.children[i] as HTMLButtonElement,p=tabPresentation(active,t.value);
  require(b.tagName==='BUTTON'&&b.id===t.id&&b.type==='button'&&b.getAttribute('role')==='tab'&&b.getAttribute('aria-controls')===t.panel&&b.getAttribute('aria-selected')===String(p.selected)&&b.tabIndex===p.tabIndex&&b.className===p.activeClass&&b.children.length===1&&b.children[0].tagName==='SPAN'&&b.children[0].textContent===t.label&&b.textContent?.trim()===`${t.icon} ${t.label}`);
 }
}
function snapshot(a:HTMLElement,c:HTMLElement,ap:HTMLElement,cp:HTMLElement):LegacyTabSnapshot{return {achievementSelected:a.getAttribute('aria-selected'),collectionSelected:c.getAttribute('aria-selected'),achievementTabIndex:a.tabIndex,collectionTabIndex:c.tabIndex,achievementHidden:ap.hidden,collectionHidden:cp.hidden};}
function live(doc:Document){
 const a=one(doc,'achTab'),c=one(doc,'colTab'),ap=one(doc,'achPanel'),cp=one(doc,'colPanel'),host=a.parentElement as HTMLDivElement;
 require(host&&c.parentElement===host&&host.parentElement&&host.parentElement.classList.contains('workspace')&&ap.parentElement===host.parentElement&&cp.parentElement===host.parentElement);
 require(ap.getAttribute('role')==='tabpanel'&&cp.getAttribute('role')==='tabpanel'&&ap.getAttribute('aria-labelledby')==='achTab'&&cp.getAttribute('aria-labelledby')==='colTab');
 const state=snapshot(a,c,ap,cp),active=activeLegacyTab(state);tabShape(host,active);return {a,c,ap,cp,host,state,active};
}
export function installProductTabs(doc:Document,setTab:(next:WorkspaceTab)=>void,render:RenderProductTabs):TabInstallResult{
 let original:ReturnType<typeof live>;try{original=live(doc);}catch{return 'LEGACY_RETAINED';}
 if(installed.has(doc))return installed.get(doc)===original.host?'ALREADY_MOUNTED':'LEGACY_RETAINED';
 if(original.host.hasAttribute(marker))return 'LEGACY_RETAINED';
 const next=original.host.cloneNode(false) as HTMLDivElement;next.setAttribute(marker,'1');
 const focusId=doc.activeElement===original.a?'achTab':doc.activeElement===original.c?'colTab':null;
 let committed=false,cleanup:(()=>void)|undefined;
 const read=()=>{const s=live(doc);require(s.host===(committed?next:original.host)&&s.ap===original.ap&&s.cp===original.cp);return s;};
 const port=createLegacyNavigationPort({read:()=>read().state,setTab(value){require(committed);setTab(value);}});
 try{
  cleanup=render(next,original.active,port);
  require(typeof cleanup==='function');tabShape(next,original.active);
  const before=read();require(before.a===original.a&&before.c===original.c&&before.active===original.active);
  original.host.replaceWith(next);committed=true;
  require(read().active===original.active);
  if(focusId)one(doc,focusId).focus();
  installed.set(doc,next);return 'MOUNTED';
 }catch{
  if(committed){committed=false;next.replaceWith(original.host);if(focusId)one(doc,focusId).focus();}
  try{cleanup?.();}catch{/* detached renderer disposal must not remove the original tabs */}
  return 'LEGACY_RETAINED';
 }
}
