import assert from 'node:assert/strict';
import {tabs,tabPresentation} from '../src/navigation.ts';
// DOM double for focused transition/ownership tests, not browser evidence.
class Element{
 constructor(tag,doc){this.tagName=tag.toUpperCase();this.doc=doc;this.children=[];this.parentElement=null;this.attrs=new Map();this.text='';this.hidden=false;this.tabIndex=-1;this.handlers=new Map();this.classList={contains:c=>this.className.split(' ').includes(c),toggle:(c,on)=>{const s=new Set(this.className.split(' ').filter(Boolean));on?s.add(c):s.delete(c);this.className=[...s].join(' ');}};}
 get id(){return this.getAttribute('id')??'';}set id(v){this.setAttribute('id',v);}get className(){return this.getAttribute('class')??'';}set className(v){this.setAttribute('class',v);}get type(){return this.getAttribute('type')??'';}get textContent(){return this.text+this.children.map(c=>c.textContent).join('');}
 setAttribute(k,v){this.attrs.set(k,String(v));}getAttribute(k){return this.attrs.get(k)??null;}hasAttribute(k){return this.attrs.has(k);}
 append(...nodes){for(const n of nodes){n.parentElement=this;this.children.push(n);}}cloneNode(){const n=new Element(this.tagName,this.doc);n.attrs=new Map(this.attrs);return n;}
 replaceWith(n){const p=this.parentElement;assert.ok(p);p.children[p.children.indexOf(this)]=n;n.parentElement=p;this.parentElement=null;}
 focus(){this.doc.activeElement=this;}addEventListener(k,f){this.handlers.set(k,f);}click(){this.handlers.get('click')?.();}
}
function make(active='achievements'){
 const doc={activeElement:null,createElement(tag){return new Element(tag,this);},querySelectorAll(sel){const id=sel.match(/^\[id="(.+)"\]$/)?.[1];const out=[];const visit=e=>{if(e.id===id)out.push(e);e.children.forEach(visit);};visit(this.root);return out;},getElementById(id){return this.querySelectorAll(`[id="${id}"]`)[0]??null;}};
 const el=tag=>doc.createElement(tag),workspace=el('section'),host=el('div');doc.root=workspace;workspace.className='workspace';host.className='primary-tabs';host.setAttribute('role','tablist');host.setAttribute('aria-label','表示する機能');workspace.append(host);
 function draw(target,initial,onClick){for(const t of tabs){const b=el('button'),s=el('span'),p=tabPresentation(initial,t.value);b.id=t.id;b.className=p.activeClass;b.tabIndex=p.tabIndex;b.setAttribute('type','button');b.setAttribute('role','tab');b.setAttribute('aria-controls',t.panel);b.setAttribute('aria-selected',String(p.selected));b.text=t.icon+' ';s.text=t.label;b.append(s);b.addEventListener('click',()=>onClick(t.value));target.append(b);}}
 const panels=tabs.map(t=>{const p=el('section');p.id=t.panel;p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby',t.id);p.hidden=t.value!==active;workspace.append(p);return p;});
 let calls=[],renders=0,disposes=0;const setTab=name=>{calls.push(name);for(const t of tabs){const b=doc.getElementById(t.id),p=tabPresentation(name,t.value);b.className=p.activeClass;b.tabIndex=p.tabIndex;b.setAttribute('aria-selected',String(p.selected));doc.getElementById(t.panel).hidden=p.hidden;}if(name==='collections')renders++;};
 draw(host,active,setTab);const render=(target,initial,port)=>{draw(target,initial,v=>port.selectTab(v));return ()=>{disposes++;};};
 return {doc,host,panels,workspace,render,setTab,calls,renders:()=>renders,disposes:()=>disposes,draw};
}
export {make};
