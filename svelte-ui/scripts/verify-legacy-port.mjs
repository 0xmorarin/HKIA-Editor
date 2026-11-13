import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import vm from 'node:vm';
import {createLegacyNavigationPort} from '../src/legacy-navigation-port.ts';
const root=process.argv[2]??'..';
const source=readFileSync(resolve(root,'src/app.js'),'utf8');
const legacy=source.match(/^function setTab\(name\).*$/m)?.[0];
assert.ok(legacy,'actual legacy setTab found');
const sha=s=>createHash('sha256').update(s).digest('hex');
assert.equal(sha(legacy),'71bd1573da6be32a489bce0bf9823d49cc64d979f94a9f829ce5f2709892070d');
const fixture=readFileSync(new URL('../src/legacy-navigation-fixture.ts',import.meta.url),'utf8');
const fixtureBody=fixture.match(/^  function setTab\(name: WorkspaceTab\).*$/m)?.[0]?.trim().replace('name: WorkspaceTab','name');
assert.equal(fixtureBody,legacy,'synthetic browser fixture exactly mirrors actual legacy function');
const nodes=new Map();let renders=0,invalidates=0;
for(const id of ['achTab','colTab','achPanel','colPanel']){
 const attrs=new Map();nodes.set(id,{tabIndex:-1,hidden:false,active:false,classList:{toggle(_name,flag){nodes.get(id).active=flag;}},setAttribute(k,v){attrs.set(k,v);},getAttribute(k){return attrs.get(k)??null;}});
}
const el=id=>nodes.get(id);
const setTab=vm.runInNewContext(`${legacy}\nsetTab`,{el,renderCollections:()=>renders++});
const read=()=>({achievementSelected:el('achTab').getAttribute('aria-selected'),collectionSelected:el('colTab').getAttribute('aria-selected'),achievementTabIndex:el('achTab').tabIndex,collectionTabIndex:el('colTab').tabIndex,achievementHidden:el('achPanel').hidden,collectionHidden:el('colPanel').hidden});
setTab('achievements');
const port=createLegacyNavigationPort({read,setTab,invalidate:()=>invalidates++});
let transitions=0;
for(const next of ['achievements','collections','collections','achievements','collections','achievements']){
 port.selectTab(next);assert.equal(port.activeTab,next);assert.equal(el('achTab').active,next==='achievements');assert.equal(el('colTab').active,next==='collections');transitions++;
}
assert.equal(renders,3);assert.equal(invalidates,6);
setTab('collections');assert.equal(port.activeTab,'collections');assert.equal(renders,4);
el('achTab').setAttribute('aria-selected','true');assert.throws(()=>port.selectTab('achievements'),/INCOHERENT/);assert.equal(renders,4);assert.equal(invalidates,6);
console.log(JSON.stringify({actualLegacySha256:sha(legacy),fixtureExact:true,transitions,externalTransition:1,malformedStateDenied:1,collectionRenders:4,invalidates}));
