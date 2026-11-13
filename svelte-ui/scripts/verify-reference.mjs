// Compare actual V33 navigation code, not a rewritten reference implementation.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {tabs,keyboardTarget,tabPresentation} from '../src/navigation.ts';
const root=process.argv[2];if(!root)throw new Error('Usage: node --experimental-strip-types scripts/verify-reference.mjs V33_SOURCE_DIRECTORY');
const app=readFileSync(resolve(root,'src/app.js'),'utf8');
const html=readFileSync(resolve(root,'index.html'),'utf8');
const css=readFileSync(resolve(root,'src/style.css'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(sha(css),'0b7d37cde2933439fb8acf9f5708ab01ceb76d008f03ae2dfb267c9870b863e6');
assert.deepEqual(css,readFileSync(new URL('../src/reference-navigation.css',import.meta.url)));
const setTab=app.match(/^function setTab\(name\).*$/m)?.[0];
const bindings=app.match(/^  el\('achTab'\)\.addEventListener\('click'.*\n  for\(const name of \['achTab','colTab'\]\).*$/m)?.[0];
assert.ok(setTab&&bindings,'actual legacy navigation functions found');
const nodes=new Map();let focus=null,renders=0;
for(const tab of tabs){assert.ok(html.includes(`id="${tab.id}" role="tab" aria-controls="${tab.panel}"`));assert.ok(html.includes(`${tab.icon} <span>${tab.label}</span>`));assert.ok(html.includes(`id="${tab.panel}" class="content-panel" role="tabpanel" aria-labelledby="${tab.id}"`));for(const id of [tab.id,tab.panel]){const events={};nodes.set(id,{events,selected:null,tabIndex:null,hidden:null,active:false,classList:{toggle(_name,flag){nodes.get(id).active=flag;}},setAttribute(name,value){if(name==='aria-selected')this.selected=value==='true';},focus(){focus=id;},addEventListener(name,cb){events[name]=cb;}});}}
vm.runInNewContext(`${setTab}\n${bindings}`,{el:id=>nodes.get(id),renderCollections:()=>{renders++;}});
function verify(expected){for(const tab of tabs){const actual=nodes.get(tab.id),panel=nodes.get(tab.panel),p=tabPresentation(expected,tab.value);assert.equal(actual.selected,p.selected);assert.equal(actual.active,p.selected);assert.equal(actual.tabIndex,p.tabIndex);assert.equal(panel.hidden,p.hidden);}}
let cases=0;
for(const tab of tabs){nodes.get(tab.id).events.click();verify(tab.value);cases++;for(const key of ['ArrowLeft','ArrowRight','Home','End','Tab','Enter','Escape','ArrowUp']){nodes.get(tab.id).events.click();focus=null;let prevented=false;nodes.get(tab.id).events.keydown({key,preventDefault(){prevented=true;}});const next=keyboardTarget(tab.value,key);assert.equal(prevented,next!==null);verify(next??tab.value);assert.equal(focus,next===null?null:tabs.find(t=>t.value===next).id);cases++;}}
assert.ok(renders>0);
console.log(JSON.stringify({legacyCases:cases,actualV33Functions:true,stylesheetSha256:sha(css),appSha256:sha(app),indexSha256:sha(html),collectionRenders:renders}));
