import {REGISTRY,CATALOG_SHA} from './product-locale-chrome-pins.mjs';
// 08 advisory: 32 exact static sites. Deliberately preserve the V33 JA/EN/GUID search placeholder.
const groups=[
 ['achievementFilter','ach.filter.label','達成状況',[['all','ach.filter.all','すべて'],['complete','ach.filter.complete','達成済み'],['incomplete','ach.filter.incomplete','未達成'],['missing','ach.filter.missing','定義のみ・未保存'],['unknown-source','ach.filter.unknownSource','保存済み・定義UNKNOWN']]],
 ['achievementImageFilter','ach.image.label','実績画像で絞り込み',[['all','ach.image.all','全画像状態'],['exact','ach.image.exact','直接画像あり'],['source-null','ach.image.sourceNull','直接画像 SOURCE_NULL'],['unknown','ach.image.unknown','画像未照合']]],
 ['achievementSort','ach.sort.label','実績の並び順',[['source','ach.sort.source','元の順番'],['name','ach.sort.name','名称順'],['progress-desc','ach.sort.progressDesc','進捗値の大きい順'],['progress-asc','ach.sort.progressAsc','進捗値の小さい順'],['completed-first','ach.sort.completedFirst','達成済みを先頭']]],
 ['collectionStatusFilter','col.filter.label','コレクション収集履歴で絞り込み',[['all','col.filter.all','全カテゴリ'],['has-record','col.filter.hasRecord','収集履歴あり'],['no-record','col.filter.noRecord','収集履歴なし'],['unknown','col.filter.unknown','未照合']]],
 ['collectionSort','col.sort.label','コレクションの並び順',[['source','col.sort.source','定義順'],['name','col.sort.name','名称順'],['record-desc','col.sort.recordDesc','記録ID数の多い順']]]
];
const need=x=>{if(!x)throw Error('PRODUCT_LOCALE_CHROME_CONTRACT');};
const all=[['#achTab > span','text','nav.achievements','アチーブメント'],['#colTab > span','text','nav.collections','コレクション'],['.primary-tabs[role="tablist"]','aria-label','nav.tabs','表示する機能'],['#achievementSearch','aria-label','ach.search.label','実績を検索'],['#collectionSearch','aria-label','col.search.label','コレクションカテゴリを検索'],['#collectionSearch','placeholder','col.search.placeholder','コレクションカテゴリを検索'],...groups.flatMap(([id,key,ja,opts])=>[['#'+id,'aria-label',key,ja],...opts.map(([v,k,t])=>['#'+id+' option[value="'+v+'"]','text',k,t])])];
export const SITES=Object.freeze(all.map(x=>Object.freeze(x)));
const selectorKeys=['locale.label','locale.auto','locale.loading','locale.unverified','error.locale'];
const verified=new WeakSet();
export async function verifyEditorCatalog(bytes,locale,sha256){
 need(typeof locale==='string'&&Object.hasOwn(CATALOG_SHA,locale)&&bytes instanceof Uint8Array&&bytes.length>0&&bytes.length<=65536);
 const input=bytes.slice();need(await sha256(input)===CATALOG_SHA[locale]);const catalog=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(input));
 need(catalog&&Object.getPrototypeOf(catalog)===Object.prototype&&Object.keys(catalog).length===189);
 for(const key of [...SITES.map(x=>x[2]),...selectorKeys])need(Object.hasOwn(catalog,key)&&typeof catalog[key]==='string'&&catalog[key].trim()&&!/[{}]/.test(catalog[key]));
 const pack=Object.freeze({locale,catalog:Object.freeze(catalog)});verified.add(pack);return pack;
}
const read=(n,p)=>p==='text'?n.textContent:n.getAttribute(p);
const write=(n,p,v)=>p==='text'?n.textContent=v:v===null?n.removeAttribute(p):n.setAttribute(p,v);
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
export function createChromeBinding(doc){
 const one=s=>{const ns=doc.querySelectorAll(s);need(ns.length===1);return ns[0];};
 const controls=()=>{
  const a=one('#achTab'),c=one('#colTab'),ap=one('#achPanel'),cp=one('#colPanel'),search=one('#achievementSearch'),col=one('#collectionSearch');
  need(a.tagName==='BUTTON'&&c.tagName==='BUTTON'&&a.getAttribute('role')==='tab'&&c.getAttribute('role')==='tab'&&a.getAttribute('aria-controls')==='achPanel'&&c.getAttribute('aria-controls')==='colPanel'&&search.type==='search'&&col.type==='search'&&search.getAttribute('placeholder')==='日本語名・英語名・GUIDで検索');
  const selects=groups.map(([id,,,opts])=>{const n=one('#'+id);need(n.tagName==='SELECT'&&equal(Array.from(n.options,o=>o.value),opts.map(o=>o[0])));return n;});
  return [a,c,ap,cp,search,col,...selects];
 };
 const originalControls=controls(),nodes=SITES.map(([s])=>one(s));
 const langs=[...new Set(nodes)].map(n=>[n,n.getAttribute('lang')]);
 const slots=SITES.map(([,p],i)=>({n:nodes[i],p,original:read(nodes[i],p),parent:nodes[i].parentElement}));
 need(slots.every((x,i)=>x.original===SITES[i][3]));
 for(const [i,x] of slots.entries())if(x.p==='text')need(x.n.children.length===0);
 slots.push(...langs.map(([n,original])=>({n,p:'lang',original,parent:n.parentElement})));
 let last=slots.map(x=>x.original),active=null,busy=false;
 function identities(){need(equal(controls(),originalControls)&&nodes.every((n,i)=>one(SITES[i][0])===n));}
 function witness(){const [a,c,ap,cp,q,cq,...selects]=originalControls;return [doc.activeElement,a.getAttribute('aria-selected'),c.getAttribute('aria-selected'),a.tabIndex,c.tabIndex,a.className,c.className,ap.hidden,cp.hidden,...[q,cq].flatMap(n=>[n.value,n.selectionStart,n.selectionEnd,n.selectionDirection,n.disabled]),...selects.flatMap(n=>[n.value,n.selectedIndex,n.disabled,n.hidden])];}
 function transact(next,locale){need(!busy);busy=true;const applied=[];try{
  identities();need(slots.every((x,i)=>read(x.n,x.p)===last[i]));const state=witness();
  for(const [i,x] of slots.entries())if(last[i]!==next[i]){applied.push(i);write(x.n,x.p,next[i]);}
  identities();need(equal(witness(),state)&&slots.every((x,i)=>read(x.n,x.p)===next[i]));last=next;active=locale;return true;
 }catch(e){for(const i of applied.reverse()){const x=slots[i];try{if(x.n.isConnected&&x.n.parentElement===x.parent&&read(x.n,x.p)===next[i])write(x.n,x.p,last[i]);}catch{/* no claim of successful rollback of an external sink */}}throw e;}finally{busy=false;}}
 return Object.freeze({get active(){return active},apply(pack){need(verified.has(pack)&&REGISTRY.some(x=>x.id===pack.locale));return transact([...SITES.map(x=>pack.catalog[x[2]]),...langs.map(()=>pack.locale)],pack.locale);},reset(){return transact(slots.map(x=>x.original),null);}});
}
