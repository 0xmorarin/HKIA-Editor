import test from 'node:test';
import {createProductAchievementHeaderBridge} from '../src/product-achievement-header-bridge.mjs';
import {make,paint,sample} from './product-achievement-header-dom-fixture.mjs';
const cases=[];
function scenario(name,fn){cases.push([name,fn]);}
function eq(a,b){if(a!==b)throw Error('assert '+String(a)+' != '+String(b));}
function yes(x){if(!x)throw Error('assert false');}
function setup(h=sample(),draw){const {doc,panel}=make();paint(panel,h);let selected=h.guid,disposed=0;const bridge=createProductAchievementHeaderBridge(doc,draw??((stage,s)=>{paint(stage,s);return()=>{disposed++;};}));return {doc,panel,h,bridge,read:()=>selected,select:v=>{selected=v;},disposed:()=>disposed};}
const render=s=>s.bridge.render(s.panel,s.h,s.read);
scenario('static header, exact decimal and seven-digit time, same panel',()=>{const s=setup(),old=s.panel.children[0];eq(render(s),'MOUNTED');eq(s.doc.getElementById(),s.panel);yes(s.panel.children[0]!==old);eq(s.panel.children[4].children[1].textContent,'9007199254740993');eq(s.panel.children[5].children[1].textContent,'2026-01-01T00:00:00.1234567Z');eq(s.disposed(),1);eq(render(s),'LEGACY_RETAINED');});
scenario('empty header',()=>{const s=setup({guid:null,title:'達成記録の詳細',empty:'一覧から実績を選択してください。',lines:[]});eq(render(s),'MOUNTED');eq(s.panel.children.length,2);});
scenario('zero remains zero',()=>{const s=setup(sample('zero','0'));eq(render(s),'MOUNTED');eq(s.panel.children[4].children[1].textContent,'0');});
scenario('unknown remains unknown',()=>{const h=sample('unknown','UNKNOWN（保存値なし）');h.lines[2].value='UNKNOWN';const s=setup(h);eq(render(s),'MOUNTED');eq(s.panel.children[3].children[1].textContent,'UNKNOWN');});
scenario('stale selection retains original',()=>{const s=setup(),old=s.panel.children[0];s.select('different');eq(render(s),'LEGACY_RETAINED');eq(s.panel.children[0],old);});
scenario('duplicate panel retains original',()=>{const s=setup();s.doc.panels.push(s.doc.createElement('div'));eq(render(s),'LEGACY_RETAINED');eq(s.disposed(),0);});
scenario('wrong candidate text retained and disposed',()=>{let n=0;const s=setup(sample(),(stage,h)=>{paint(stage,h);stage.children[4].children[1].textContent='0';return()=>n++;});const old=s.panel.children[0];eq(render(s),'LEGACY_RETAINED');eq(s.panel.children[0],old);eq(n,1);});
scenario('wrong candidate attributes retained',()=>{const s=setup(sample(),(stage,h)=>{paint(stage,h);stage.children[0].setAttribute('title','extra');return()=>{};});eq(render(s),'LEGACY_RETAINED');});
scenario('newer selection during draw retains controller DOM',()=>{let s;s=setup(sample(),(stage,h)=>{paint(stage,h);s.select('next');return()=>{};});eq(render(s),'LEGACY_RETAINED');});
scenario('same selection new render during draw retains newer DOM',()=>{let s,newNode;s=setup(sample(),(stage,h)=>{paint(stage,h);s.panel.replaceChildren();paint(s.panel,h);newNode=s.panel.children[0];return()=>{};});eq(render(s),'LEGACY_RETAINED');eq(s.panel.children[0],newNode);});
scenario('reentrant draw refused',()=>{let s;s=setup(sample(),(stage,h)=>{eq(render(s),'LEGACY_RETAINED');paint(stage,h);return()=>{};});eq(render(s),'MOUNTED');});
scenario('unexpected tail or malformed identity never replaced',()=>{const s=setup();s.panel.append(s.doc.createElement('form'));eq(render(s),'LEGACY_RETAINED');eq(s.panel.children.length,7);const t=setup();t.h.lines[0].value='other';eq(render(t),'LEGACY_RETAINED');});
scenario('cleanup failure retains original',()=>{const s=setup(sample(),(stage,h)=>{paint(stage,h);return()=>{throw Error('cleanup');};});eq(render(s),'LEGACY_RETAINED');});
scenario('draw failure retains original',()=>{const s=setup(sample(),()=>{throw Error('draw');});eq(render(s),'LEGACY_RETAINED');});
scenario('repeated controller render has no retained component state',()=>{const s=setup();eq(render(s),'MOUNTED');s.panel.removeAttribute('data-hkia-svelte-achievement-header');s.panel.replaceChildren();paint(s.panel,s.h);eq(render(s),'MOUNTED');eq(s.disposed(),2);});

scenario('wrong host element rejected; actual V33 is ASIDE',()=>{const s=setup();s.panel.tagName='DIV';eq(render(s),'LEGACY_RETAINED');eq(s.disposed(),0);});
for(const [name,fn] of cases)test(name,fn);
