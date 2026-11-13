import {assertSnapshot,createLegacyFilterPort,filterControls,filterIds,type FilterControlId,type FilterSnapshot} from './filter-controls.ts';
export const filterGroups=[['achievementSearch','achievementFilter','achievementImageFilter','achievementSort'],['collectionSearch'],['collectionStatusFilter','collectionSort']] as const;
export type FilterGroup=0|1|2;
type Control=HTMLInputElement|HTMLSelectElement;
export type FilterIntent=(id:FilterControlId,event:Event)=>void;
export type RenderProductFilters=(host:HTMLElement,group:FilterGroup,initial:FilterSnapshot,intent:FilterIntent)=>()=>void;
export type ProductFilterCallbacks={achievement():void;collection():void};
const marker='data-hkia-svelte-filters';
const installed=new WeakMap<Document,readonly HTMLElement[]>();
const require=(ok:unknown):void=>{if(!ok)throw Error('PRODUCT_FILTER_DOM_CONTRACT');};
function one(doc:Document,id:string){const a=doc.querySelectorAll<HTMLElement>(`[id="${id}"]`);require(a.length===1);return a[0];}
function control(root:HTMLElement,id:FilterControlId){const a=root.querySelectorAll<Control>(`[id="${id}"]`);require(a.length===1);return a[0];}
function validateControl(n:Control,id:FilterControlId){const c=filterControls[id];require(n.id===id&&n.getAttribute('aria-label')===c.label&&!n.disabled);
 if(c.type==='search'){require(n.tagName==='INPUT'&&n.type==='search'&&n.getAttribute('placeholder')===c.placeholder&&n.getAttribute('autocomplete')==='off'&&!n.hidden);}
 else{require(n.tagName==='SELECT'&&(id==='achievementImageFilter'||!n.hidden));const opts=Array.from((n as HTMLSelectElement).options);require(opts.length===c.options.length&&opts.every((o,i)=>o.value===c.options[i][0]&&o.textContent===c.options[i][1]&&!o.disabled));}
}
function searchShape(label:HTMLElement,id:FilterControlId){require(label.tagName==='LABEL'&&label.className===(id==='collectionSearch'?'search-wrap collections-search':'search-wrap')&&label.children.length===2&&label.children[0].tagName==='SPAN'&&label.children[0].getAttribute('aria-hidden')==='true'&&label.children[0].textContent==='⌕'&&label.children[1]===control(label,id));}
function groupShape(host:HTMLElement,g:FilterGroup){const ids=filterGroups[g];if(g===1)searchShape(host,'collectionSearch');else{require(host.tagName==='DIV'&&host.className==='toolbar'&&host.children.length===ids.length);ids.forEach((id,i)=>{if(id==='achievementSearch')searchShape(host.children[i] as HTMLElement,id);else require(host.children[i]===control(host,id));});}for(const id of ids)validateControl(control(host,id),id);}
function snapshot(hosts:readonly HTMLElement[]):FilterSnapshot{const values=Object.fromEntries(filterGroups.flatMap((ids,g)=>ids.map(id=>[id,control(hosts[g],id).value]))) as Record<FilterControlId,string>;return assertSnapshot({...values,imageVisible:!control(hosts[0],'achievementImageFilter').hidden});}
const snapshotKey=(s:FilterSnapshot)=>JSON.stringify([...filterIds.map(id=>s[id]),s.imageVisible]);
function live(doc:Document){const ap=one(doc,'achPanel'),cp=one(doc,'colPanel');const a=one(doc,'achievementSearch'),c=one(doc,'collectionSearch'),sort=one(doc,'collectionSort');const hosts=[a.parentElement?.parentElement,c.parentElement,sort.parentElement] as HTMLElement[];require(hosts.every(Boolean)&&hosts[0].parentElement===ap&&hosts[1].parentElement===cp&&hosts[2].parentElement===cp&&new Set(hosts).size===3);hosts.forEach((h,g)=>groupShape(h,g as FilterGroup));for(const [g,ids] of filterGroups.entries())for(const id of ids)require(one(doc,id)===control(hosts[g],id));return {hosts,panels:[ap,cp],state:snapshot(hosts)};}
export function installProductFilters(doc:Document,callbacks:ProductFilterCallbacks,render:RenderProductFilters):'MOUNTED'|'ALREADY_MOUNTED'|'LEGACY_RETAINED'{
 let original:ReturnType<typeof live>;try{original=live(doc);}catch{return 'LEGACY_RETAINED';}
 const previous=installed.get(doc);if(previous)return previous.every((h,i)=>h===original.hosts[i])?'ALREADY_MOUNTED':'LEGACY_RETAINED';if(original.hosts.some(h=>h.hasAttribute(marker)))return 'LEGACY_RETAINED';
 const next=original.hosts.map(h=>{const n=h.cloneNode(false) as HTMLElement;n.setAttribute(marker,'1');return n;});
 const originalFocus=filterIds.find(id=>doc.activeElement===one(doc,id));const focus=originalFocus?one(doc,originalFocus) as Control:null;const caret=focus?.tagName==='INPUT'?[(focus as HTMLInputElement).selectionStart,(focus as HTMLInputElement).selectionEnd,(focus as HTMLInputElement).selectionDirection] as const:null;
 let committed=false,busy=false;const swapped:number[]=[],disposers:(()=>void)[]=[];const read=()=>{const s=live(doc);require(s.hosts.every((h,i)=>h===(committed?next:original.hosts)[i])&&s.panels.every((p,i)=>p===original.panels[i]));return s;};
 const port=createLegacyFilterPort({read:()=>read().state,writeAndDispatch(id,value,event){require(committed&&event===filterControls[id].event);const before=read().state,n=one(doc,id) as Control;n.value=value;require(n.value===value);if(id.startsWith('achievement'))callbacks.achievement();else callbacks.collection();const after=read().state;require(filterIds.every(other=>other===id||after[other]===before[other]));}});
 const intent:FilterIntent=(id,event)=>{require(committed&&!busy&&Object.hasOwn(filterControls,id)&&event.type===filterControls[id].event);const n=one(doc,id) as Control;require(event.currentTarget===n);busy=true;try{port.change(id,n.value);}finally{busy=false;}};
 const restoreFocus=()=>{if(!originalFocus)return;const n=one(doc,originalFocus) as Control;n.focus();if(caret&&caret[0]!==null&&caret[1]!==null)(n as HTMLInputElement).setSelectionRange(caret[0],caret[1],caret[2]??undefined);};
 try{next.forEach((h,g)=>{const dispose=render(h,g as FilterGroup,original.state,intent);require(typeof dispose==='function');disposers.push(dispose);groupShape(h,g as FilterGroup);});require(snapshotKey(snapshot(next))===snapshotKey(original.state));require(snapshotKey(read().state)===snapshotKey(original.state));
  next.forEach((h,g)=>{original.hosts[g].replaceWith(h);swapped.push(g);});committed=true;require(snapshotKey(read().state)===snapshotKey(original.state));restoreFocus();installed.set(doc,next);return 'MOUNTED';
 }catch{committed=false;for(const g of swapped.reverse())next[g].replaceWith(original.hosts[g]);try{restoreFocus();}catch{}for(const dispose of disposers.reverse())try{dispose();}catch{}return 'LEGACY_RETAINED';}
}
