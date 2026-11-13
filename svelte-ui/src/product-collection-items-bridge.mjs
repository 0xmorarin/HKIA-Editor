/** Single disposable projection; legacy controller owns all selection, pagination and mutation. */
const MARK='data-hkia-svelte-collection-items';
const need=x=>{if(!x)throw Error('PRODUCT_COLLECTION_ITEMS_CONTRACT');};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const int=x=>Number.isSafeInteger(x)&&x>=0;
function signature(e){
 const a=Array.from(e.attributes).filter(x=>x.name!=='data-item-id'&&!(x.name==='class'&&!x.value)).map(x=>[x.name,x.value]).sort((x,y)=>x[0].localeCompare(y[0]));
 const c=Array.from(e.children);return [e.tagName,a,c.length?Array.from(e.childNodes).filter(n=>n.nodeType===3&&n.textContent?.trim()).map(n=>n.textContent):e.textContent,c.map(signature)];
}
function read(host,s,candidate=false){
 need(host.tagName==='DIV'&&host.className==='collection-items-list');
 const kids=Array.from(host.children),more=s.total>s.limit;need(kids.length===(s.rows.length||1)+Number(more));
 const buttons=new Map();
 if(!s.rows.length)need(kids[0].tagName==='P'&&kids[0].className==='placeholder');
 for(const [i,r] of s.rows.entries()){
  const row=kids[i];need(row.tagName==='DIV'&&row.className==='collection-item-row'&&(!candidate||row.getAttribute('data-item-id')===String(r.id)));
  const ids=row.querySelectorAll('.item-source-id'),bs=row.querySelectorAll('.item-inspect-button');need(ids.length===1&&ids[0].textContent==='ID '+r.id&&bs.length===1&&bs[0].tagName==='BUTTON'&&bs[0].type==='button'&&!bs[0].disabled);buttons.set(r.id,bs[0]);
 }
 const next=more?kids.at(-1):null;if(next)need(next.tagName==='BUTTON'&&next.className==='btn-secondary show-more'&&next.type==='button'&&!next.disabled);
 return {buttons,next,sig:kids.map(signature)};
}
function validate(s){
 need(s&&Array.isArray(s.rows)&&int(s.total)&&int(s.limit)&&s.limit>=100&&s.limit%100===0&&s.limit<=1200&&s.rows.length===Math.min(s.total,s.limit));
 const ids=new Set();for(const r of s.rows){need(r&&int(r.id)&&!ids.has(r.id)&&typeof r.key==='string'&&typeof r.guid==='string'&&r.guid.length>0&&typeof r.imageEnabled==='boolean'&&r.history&&['known','unknown'].includes(r.history.kind));ids.add(r.id);if(r.history.kind==='known'){need(typeof r.history.status==='string'&&typeof r.history.recorded==='boolean'&&typeof r.history.showTicks==='boolean'&&(!r.history.showTicks||r.history.recorded)&& (r.history.rawTicks===null||typeof r.history.rawTicks==='string'&&/^-?(0|[1-9][0-9]{0,18})$/.test(r.history.rawTicks)&&BigInt(r.history.rawTicks)>=-9223372036854775808n&&BigInt(r.history.rawTicks)<=9223372036854775807n));}}
 return Object.freeze({...s,rows:Object.freeze(s.rows.map(r=>Object.freeze({...r,history:Object.freeze({...r.history}),parent:r.parent?Object.freeze({...r.parent}):undefined,image:r.image?Object.freeze({...r.image}):r.image})))});
}
export function createProductCollectionItemsBridge(doc,draw){
 let live=null,drawing=false,busy=false;
 const dispose=f=>{try{f();}catch{}};
 const owns=h=>h.isConnected&&doc.querySelectorAll('.collection-items-list').length===1&&doc.querySelectorAll('.collection-items-list')[0]===h;
 function restore(){const x=live;if(!x)return;live=null;if(x.candidate.parentElement===x.parent){try{x.candidate.replaceWith(x.legacy);}catch{}}dispose(x.cleanup);}
 function render(host,input,current){
  if(drawing||live||!owns(host)||typeof current!=='function')return 'LEGACY_RETAINED';
  let s,old;try{s=validate(input);need(current());old=read(host,s);}catch{return 'LEGACY_RETAINED';}
  if(s.limit===1200&&s.total>s.limit)return 'LEGACY_RETAINED';
  const stage=host.cloneNode(false),parent=host.parentElement,token={};stage.setAttribute(MARK,'1');
  let cleanup,committed=false;
  const dispatch=(id)=>{if(busy||live?.token!==token||!owns(stage))return;busy=true;try{if(!current()||live?.token!==token||!owns(stage))return;const b=id===null?old.next:old.buttons.get(id);if(!b)return;b.click();}finally{busy=false;}};
  drawing=true;try{
   cleanup=draw(stage,s,dispatch);need(typeof cleanup==='function');const next=read(stage,s,true);need(eq(next.sig,old.sig));
   const before=read(host,s);need(owns(host)&&current()&&host.parentElement===parent&&eq(before.sig,old.sig)&&before.next===old.next&&[...old.buttons].every(([k,b])=>before.buttons.get(k)===b));
   host.replaceWith(stage);committed=true;need(owns(stage)&&stage.parentElement===parent&&eq(read(stage,s,true).sig,old.sig));
   live={legacy:host,candidate:stage,cleanup,token,parent};return 'MOUNTED';
  }catch{if(committed&&owns(stage)){try{stage.replaceWith(host);}catch{}}if(cleanup)dispose(cleanup);return 'LEGACY_RETAINED';}finally{drawing=false;}
 }
 return {render,restore};
}
