import {verifyCompositeCatalog} from './editor-catalog-composite.mjs';
                                                                                 
export const ITEM_KEYS=Object.freeze(['col.item.inspect','col.item.empty','ach.list.more','col.item.image.label','col.item.image.unverified','col.item.image.status','col.filter.unknown','col.item.history.recorded','col.item.history.absent','col.item.history.status','col.item.ticks','col.item.calendarUnknown','col.item.parent','col.item.parentCross']);
const ja=Object.freeze({'col.item.inspect':'詳細・変更案','col.item.empty':'該当するアイテムはありません。','ach.list.more':'さらに表示（残り {count}件）','col.item.image.label':'アイテム画像','col.item.image.unverified':'{label}：画像未確定','col.item.image.status':'{label}：{status}','col.filter.unknown':'未照合','col.item.history.recorded':'履歴あり','col.item.history.absent':'履歴なし','col.item.history.status':'{status} · {history}','col.item.ticks':'100ns ticks {ticks}','col.item.calendarUnknown':'{calendar}（timezone UNKNOWN）','col.item.parent':'親ID {id}','col.item.parentCross':'親ID {id}（他カテゴリ）'});
const trusted=new WeakSet(), need=x=>{if(!x)throw Error('COLLECTION_ITEMS_LOCALE_CONTRACT');};
const own=(o,k)=>Object.hasOwn(o,k), str=x=>typeof x==='string'&&x.length<=4096, num=x=>Number.isSafeInteger(x)&&x>=0;
const placeholders=s=>[...s.matchAll(/\{([^{}]+)\}/g)].map(x=>x[1]).sort().join('|');
const localImage=/^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
export async function verifyCollectionItemsCatalog(bytes,locale,sha256){
 const {catalog,digest}=await verifyCompositeCatalog(bytes,locale,sha256);
 const strings=Object.freeze(Object.fromEntries(ITEM_KEYS.map(k=>{const v=catalog[k];need(str(v)&&v.length>0&&placeholders(v)===placeholders(ja[k])&&!/[{}]/.test(v.replace(/\{[^{}]+\}/g,'')));return [k,v];})));
 const result=Object.freeze({locale,sha256:digest,strings});trusted.add(result);return result;
}
function capture(input){
 need(input&&Array.isArray(input.rows)&&num(input.total)&&num(input.limit)&&input.limit>=100&&input.limit<=1200&&input.limit%100===0&&input.rows.length===Math.min(input.total,input.limit));
 const seen=new Set(), rows=input.rows.map(r=>{
  need(r&&num(r.id)&&r.id<=2147483647&&!seen.has(r.id)&&str(r.key)&&str(r.guid)&&r.guid.length>0&&typeof r.imageEnabled==='boolean');seen.add(r.id);
  const h=r.history;need(h&&['known','unknown'].includes(h.kind));
  if(h.kind==='known'){need(str(h.status)&&h.status.length>0&&typeof h.recorded==='boolean'&&typeof h.showTicks==='boolean'&&(!h.showTicks||h.recorded)&&(h.rawTicks===null||typeof h.rawTicks==='string'&&/^-?(0|[1-9][0-9]{0,18})$/.test(h.rawTicks)&&BigInt(h.rawTicks)>=-9223372036854775808n&&BigInt(h.rawTicks)<=9223372036854775807n)&&(h.calendar===null||str(h.calendar)&&h.calendar.length>0)&&(h.recorded||h.rawTicks===null&&h.calendar===null));}
  const p=r.parent;need(p===undefined||p&&num(p.id)&&p.id<=2147483647&&typeof p.cross==='boolean');
  const i=r.image;need(i==null||i&&str(i.status)&&i.status.length>0&&(i.image==null||str(i.image))&&(i.spritePathId==null||str(i.spritePathId)));
  return Object.freeze({id:r.id,key:r.key,guid:r.guid,imageEnabled:r.imageEnabled,history:Object.freeze(h.kind==='unknown'?{kind:'unknown'}:{kind:'known',status:h.status,recorded:h.recorded,showTicks:h.showTicks,rawTicks:h.rawTicks,calendar:h.calendar}),parent:p?Object.freeze({id:p.id,cross:p.cross}):null,image:i?Object.freeze({status:i.status,image:i.image??null,spritePathId:i.spritePathId??null}):null});
 });
 const l=input.locale;need(l===null||l&&num(l.epoch)&&trusted.has(l.catalog));
 return Object.freeze({rows:Object.freeze(rows),total:input.total,limit:input.limit,locale:l===null?null:Object.freeze({epoch:l.epoch,catalog:l.catalog})});
}
const equal=(a,b)=>a.total===b.total&&a.limit===b.limit&&JSON.stringify(a.rows)===JSON.stringify(b.rows)&&(a.locale===null?b.locale===null:b.locale!==null&&a.locale.epoch===b.locale.epoch&&a.locale.catalog===b.locale.catalog);
function projection(s){
 const lang=s.locale?.catalog.locale??null,strings=s.locale?.catalog.strings??ja,t=(k,args={})=>strings[k].replace(/\{([^{}]+)\}/g,(_,n)=>{need(own(args,n));return String(args[n]);});
 const n=x=>lang===null?String(x):new Intl.NumberFormat(lang).format(x);
 const rows=s.rows.map(r=>{
  const h=r.history,i=r.image,original=i?.status??'NOT_IN_SOURCE_MAP',known=!!i&&['EXACT','EXISTING_VERIFIED'].includes(original)&&typeof i.image==='string'&&localImage.test(i.image)&&typeof i.spritePathId==='string'&&i.spritePathId.length>0,status=known?original:['EXACT','EXISTING_VERIFIED'].includes(original)?'UNKNOWN':original,label=t('col.item.image.label');
  return Object.freeze({id:r.id,guid:r.guid,name:r.key||'ItemId '+r.id,mark:h.kind==='unknown'?'?':h.recorded?'✓':'—',markClass:h.kind==='unknown'?'unknown-mark':h.recorded?'collected-mark':'missing-mark',status:h.kind==='unknown'?t('col.filter.unknown'):t('col.item.history.status',{status:h.status,history:t(h.recorded?'col.item.history.recorded':'col.item.history.absent')}),ticks:h.kind==='known'&&h.recorded&&h.showTicks?t('col.item.ticks',{ticks:h.rawTicks??'UNKNOWN'})+(h.calendar?' · '+t('col.item.calendarUnknown',{calendar:h.calendar}):''):null,parent:r.parent?t(r.parent.cross?'col.item.parentCross':'col.item.parent',{id:r.parent.id}):null,inspect:t('col.item.inspect'),image:r.imageEnabled?Object.freeze({status,src:known?'./'+i.image:null,spritePathId:known?i.spritePathId:null,label:known?label:t('col.item.image.unverified',{label}),title:known?label:t('col.item.image.status',{label,status})}):null});
 });
 return Object.freeze({lang,rows:Object.freeze(rows),empty:t('col.item.empty'),more:s.total>s.limit?t('ach.list.more',{count:n(s.total-s.limit)}):null});
}
export function projectCollectionItemsLocale(input){return projection(capture(input));}
                                                                                        
                                                                                
export function createCollectionItemsLocaleBinding(doc){
 let busy=false,watermark=null;const witnesses=new WeakMap();
 const owns=h=>h?.tagName==='DIV'&&h.className==='collection-items-list'&&h.getAttribute('data-hkia-svelte-collection-items')==='1'&&h.isConnected&&doc.querySelectorAll('.collection-items-list').length===1&&doc.querySelectorAll('.collection-items-list')[0]===h;
 const sameNodes=(a,b)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
 const val=s=>s.key===null?s.node.data:s.node.getAttribute(s.key);
 const put=(s,v)=>{if(s.key===null)s.node.data=v;else if(v===null)s.node.removeAttribute(s.key);else s.node.setAttribute(s.key,v);};
 function inspect(host,s,p){
  const kids=[...host.children],slots=[],nodes=[...kids];need(kids.length===(s.rows.length||1)+Number(p.more!==null));
  const leaf=(e,tag,cls,expected,localized=false)=>{need(e?.tagName===tag&&e.className===cls&&e.childNodes.length===1&&e.firstChild.nodeType===3);nodes.push(e,e.firstChild);if(localized)slots.push({node:e.firstChild,key:null,expected});else need(e.firstChild.data===expected);};
  const attr=(e,key,expected)=>slots.push({node:e,key,expected});
  if(!s.rows.length)leaf(kids[0],'P','placeholder',p.empty,true);
  s.rows.forEach((r,j)=>{
   const row=kids[j],q=p.rows[j],c=[...row.children];need(row.tagName==='DIV'&&row.className==='collection-item-row'&&row.getAttribute('data-item-id')===String(r.id));let z=0;
   if(q.image){const a=c[z++],m=q.image;need(a?.tagName==='SPAN'&&a.className==='media-thumb media-item'&&a.getAttribute('data-image-kind')==='item'&&a.children.length===1);const child=a.children[0],st=a.getAttribute('data-image-status');need(st===m.status||m.src&&st==='LOAD_FAILED');nodes.push(a,child);
    if(m.src&&st===m.status)need(child.tagName==='IMG'&&child.getAttribute('src')===m.src&&child.getAttribute('data-sprite-path-id')===m.spritePathId&&child.getAttribute('alt')===''&&child.getAttribute('width')==='40'&&child.getAttribute('height')==='40'&&child.getAttribute('loading')==='lazy'&&child.getAttribute('decoding')==='async'&&child.getAttribute('referrerpolicy')==='no-referrer');
    else need(child.tagName==='SPAN'&&child.className==='media-null-mark'&&child.textContent==='—'&&child.getAttribute('aria-hidden')==='true');
    attr(a,'aria-label',m.label);attr(a,'title',m.title);
   }
   leaf(c[z++],'SPAN',q.markClass,q.mark);leaf(c[z++],'SPAN','item-source-name',q.name);leaf(c[z++],'SMALL','item-source-id','ID '+r.id);leaf(c[z++],'SMALL','collection-status',q.status,true);
   if(q.ticks!==null)leaf(c[z++],'SMALL','collection-history-ticks',q.ticks,true);
   const b=c[z++];leaf(b,'BUTTON','btn-secondary item-inspect-button',q.inspect,true);need(b.type==='button'&&!b.disabled);
   if(q.parent!==null)leaf(c[z++],'SMALL','item-source-parent',q.parent,true);need(z===c.length);
  });
  if(p.more!==null){const b=kids.at(-1);leaf(b,'BUTTON','btn-secondary show-more',p.more,true);need(b.type==='button'&&!b.disabled);}
  return {kids,slots,nodes};
 }
 function render(host,read){
  if(busy||!owns(host)||typeof read!=='function')return 'LEGACY_RETAINED';
  busy=true;const parent=host.parentElement,journal=[];
  const chain=node=>{const path=[];for(let n=node;n&&n!==host;n=n.parentNode)path.push([n,n.parentNode]);need(path.length&&path.at(-1)[1]===host);return path;};
  const still=s=>host.isConnected&&host.parentElement===parent&&host.getAttribute('data-hkia-svelte-collection-items')==='1'&&s.path.every(([n,p])=>n.parentNode===p);
  try{
   const input=capture(read()),desired=projection(input),baseline=Object.freeze({...input,locale:null}),old=witnesses.get(host);
   if(input.locale&&watermark)need(input.locale.epoch>watermark.epoch||input.locale.epoch===watermark.epoch&&input.locale.catalog===watermark.catalog);
   const next=inspect(host,input,desired),sameRows=old&&sameNodes(old.kids,next.kids);
   if(sameRows)need(equal({...old.input,locale:null},baseline));
   const prior=inspect(host,input,sameRows?old.projection:projection(baseline));
   need(prior.slots.every(s=>val(s)===s.expected));
   if(sameRows)need(prior.slots.length===old.slots.length&&prior.slots.every((s,i)=>s.node===old.slots[i].node&&s.key===old.slots[i].key));
   const writes=next.slots.map(s=>({...s,actual:val(s),path:chain(s.node)}));
   need(owns(host)&&equal(capture(read()),input)&&sameNodes(inspect(host,input,desired).nodes,next.nodes)&&writes.every(s=>val(s)===s.actual));
   for(const s of writes){if(s.actual===s.expected)continue;need(owns(host)&&still(s)&&val(s)===s.actual);journal.push(s);put(s,s.expected);}
   const after=inspect(host,input,desired);need(owns(host)&&equal(capture(read()),input)&&sameNodes(after.nodes,next.nodes)&&after.slots.every(s=>val(s)===s.expected));
   witnesses.set(host,{kids:next.kids,slots:after.slots,input,projection:desired});if(input.locale)watermark=input.locale;else if(watermark)watermark={epoch:watermark.epoch,catalog:null};return 'APPLIED';
  }catch{for(const s of journal.reverse()){try{if(still(s)&&val(s)===s.expected)put(s,s.actual);}catch{}}return 'LEGACY_RETAINED';}
  finally{busy=false;}
 }
 return Object.freeze({render});
}
