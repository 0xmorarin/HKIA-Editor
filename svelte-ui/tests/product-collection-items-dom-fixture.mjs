export class E{
 constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.attrs=new Map();this.children=[];this.parentElement=null;this.content='';this.clickHandler=null;this.disabled=false;}
 get attributes(){return [...this.attrs].map(([name,value])=>({name,value}));}get childNodes(){return [...(this.content?[{nodeType:3,textContent:this.content}]:[]),...this.children];}
 get textContent(){return this.content+this.children.map(x=>x.textContent).join('');}set textContent(v){this.replaceChildren();this.content=String(v);}
 get className(){return this.attrs.get('class')??'';}set className(v){this.setAttribute('class',v);}
 get type(){return this.attrs.get('type')??'';}set type(v){this.setAttribute('type',v);}
 get isConnected(){return this===this.doc.root||!!this.parentElement?.isConnected;}
 setAttribute(k,v){this.attrs.set(k,String(v));}getAttribute(k){return this.attrs.get(k)??null;}
 append(...xs){for(const n of xs){if(n.tagName==='FRAGMENT'){this.append(...n.children.slice());continue;}if(n.parentElement)n.parentElement.children=n.parentElement.children.filter(x=>x!==n);n.parentElement=this;this.children.push(n);}}
 replaceChildren(...xs){for(const n of this.children)n.parentElement=null;this.children=[];this.content='';this.append(...xs);}
 replaceWith(n){const p=this.parentElement;if(!p)throw Error('detached');p.children[p.children.indexOf(this)]=n;n.parentElement=p;this.parentElement=null;}
 cloneNode(){const n=new E(this.tagName,this.doc);n.attrs=new Map(this.attrs);return n;}
 contains(n){return n===this||this.children.some(x=>x.contains(n));}
 querySelectorAll(s){const out=[];const visit=n=>{if(s.startsWith('.')&&n.className.split(' ').includes(s.slice(1)))out.push(n);n.children.forEach(visit);};this.children.forEach(visit);return out;}
 addEventListener(t,f){if(t==='click')this.clickHandler=f;}click(){this.clickHandler?.();}
}
export function make(){const doc={createElement(t){return new E(t,this);},createDocumentFragment(){return new E('fragment',this);},querySelectorAll(s){return this.root.querySelectorAll(s);}};doc.root=doc.createElement('main');const section=doc.createElement('section'),host=doc.createElement('div');host.className='collection-items-list';doc.root.append(section);section.append(host);return {doc,section,host};}
export function node(doc,t,c='',v){const n=doc.createElement(t);if(c)n.className=c;if(v!==undefined)n.textContent=v;return n;}
export function paint(host,s,dispatch,candidate=false){
 const d=host.doc,n=(t,c,v)=>node(d,t,c,v);
 for(const r of s.rows){const row=n('div','collection-item-row');if(candidate)row.setAttribute('data-item-id',r.id);
 const h=r.history;row.append(n('span',h.kind==='unknown'?'unknown-mark':h.recorded?'collected-mark':'missing-mark',h.kind==='unknown'?'?':h.recorded?'✓':'—'),n('span','item-source-name',r.key||'ItemId '+r.id),n('small','item-source-id','ID '+r.id),n('small','collection-status',h.kind==='unknown'?'未照合':h.status+' · '+(h.recorded?'履歴あり':'履歴なし')));
 if(h.kind==='known'&&h.showTicks)row.append(n('small','collection-history-ticks','100ns ticks '+(h.rawTicks??'UNKNOWN')+(h.calendar?' · '+h.calendar+'（timezone UNKNOWN）':'')));
 const b=n('button','btn-secondary item-inspect-button','詳細・変更案');b.type='button';b.addEventListener('click',()=>dispatch(r.id));row.append(b);if(r.parent)row.append(n('small','item-source-parent','親ID '+r.parent.id+(r.parent.cross?'（他カテゴリ）':'')));host.append(row);}
 if(!s.rows.length)host.append(n('p','placeholder','該当するアイテムはありません。'));
 if(s.total>s.limit){const b=n('button','btn-secondary show-more','さらに表示（残り '+(s.total-s.limit)+'件）');b.type='button';b.addEventListener('click',()=>dispatch(null));host.append(b);}
}
export const row=(id,extra={})=>({id,key:'fixture-'+id,guid:'g-'+id,history:{kind:'unknown'},imageEnabled:false,...extra});
