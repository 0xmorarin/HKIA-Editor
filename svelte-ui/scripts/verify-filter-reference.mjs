import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {filterControls,filterIds,createLegacyFilterPort} from '../src/filter-controls.ts';
const root=process.argv[2]??'..';
const html=readFileSync(resolve(root,'index.html'),'utf8');
const app=readFileSync(resolve(root,'src/app.js'),'utf8');
const lines=app.split('\n').filter(s=>s.includes('const onAchievementsFilter=')||s.includes("el('achievementSearch').addEventListener")||s.includes("el('collectionSearch').addEventListener"));
assert.equal(lines.length,3);
const nodes=new Map();let achievementRenders=0,collectionRenders=0,batchClears=0,limit=0;
const state={get achLimit(){return limit},set achLimit(x){limit=x}};
for(const id of filterIds){const c=filterControls[id];const re=new RegExp(`<${c.type==='search'?'input':'select'}\\b[^>]*\\bid="${id}"[^>]*>${c.type==='select'?'[\\s\\S]*?</select>':''}`);const markup=html.match(re)?.[0];assert.ok(markup,id);assert.ok(markup.includes(`aria-label="${c.label}"`),id);if(c.type==='search'){assert.ok(markup.includes('type="search"'));assert.ok(markup.includes('autocomplete="off"'));assert.ok(markup.includes(`placeholder="${c.placeholder}"`));}else{assert.deepEqual([...markup.matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)].map(m=>[m[1],m[2]]),c.options);}
 const listeners=new Map();nodes.set(id,{value:c.initial,hidden:id==='achievementImageFilter',listeners,addEventListener(event,cb){listeners.set(event,cb)}});
}
nodes.set('batchResult',{replaceChildren(){batchClears++}});
vm.runInNewContext(lines.join('\n'),{state,el:id=>nodes.get(id),renderAchievements(){achievementRenders++},renderCollections(){collectionRenders++}});
const read=()=>({...Object.fromEntries(filterIds.map(id=>[id,nodes.get(id).value])),imageVisible:!nodes.get('achievementImageFilter').hidden});
const port=createLegacyFilterPort({read,writeAndDispatch(id,value,event){const node=nodes.get(id);node.value=value;assert.equal(node.listeners.size,1);const cb=node.listeners.get(event);assert.ok(cb,`${id} ${event}`);cb();}});
let transitions=0;
for(const id of filterIds){const c=filterControls[id];if(id==='achievementImageFilter')nodes.get(id).hidden=false;const values=c.type==='search'?['  日本語 GUID  ','']:c.options.map(([v])=>v);for(const value of values){port.change(id,value);assert.equal(port.read()[id],value);transitions++;}}
assert.equal(achievementRenders,16);assert.equal(collectionRenders,9);assert.equal(batchClears,16);assert.equal(limit,120);
console.log(JSON.stringify({controls:7,transitions,achievementRenders,collectionRenders,batchClears,achLimit:limit,source:'actual legacy event registration and callbacks; synthetic DOM/render sinks'}));
