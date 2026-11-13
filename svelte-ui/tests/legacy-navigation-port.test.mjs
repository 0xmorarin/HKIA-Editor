import assert from 'node:assert/strict';
import {test} from 'node:test';
import {activeLegacyTab,createLegacyNavigationPort} from '../src/legacy-navigation-port.ts';
const snapshot=(tab)=>({achievementSelected:String(tab==='achievements'),collectionSelected:String(tab==='collections'),achievementTabIndex:tab==='achievements'?0:-1,collectionTabIndex:tab==='collections'?0:-1,achievementHidden:tab!=='achievements',collectionHidden:tab!=='collections'});
test('legacy snapshot is sole selection authority; external transition immediately visible',()=>{
 let s=snapshot('achievements');const calls=[];let invalidates=0;
 const port=createLegacyNavigationPort({read:()=>s,setTab:next=>{calls.push(next);s=snapshot(next)},invalidate:()=>invalidates++});
 assert.equal(port.activeTab,'achievements');s=snapshot('collections');assert.equal(port.activeTab,'collections');
 port.selectTab('collections');port.selectTab('achievements');assert.deepEqual(calls,['collections','achievements']);assert.equal(invalidates,2);assert.equal(port.activeTab,'achievements');
});
for(const [field,value] of Object.entries({achievementSelected:'false',collectionSelected:'true',achievementTabIndex:-1,collectionTabIndex:0,achievementHidden:true,collectionHidden:false})){
 test(`incoherent ${field} fails closed before legacy mutation`,()=>{const s={...snapshot('achievements'),[field]:value};let calls=0;const port=createLegacyNavigationPort({read:()=>s,setTab:()=>calls++});assert.throws(()=>port.activeTab,/INCOHERENT/);assert.throws(()=>port.selectTab('collections'),/INCOHERENT/);assert.equal(calls,0)});
}
test('invalid target denied before legacy mutation',()=>{let calls=0;const port=createLegacyNavigationPort({read:()=>snapshot('achievements'),setTab:()=>calls++});assert.throws(()=>port.selectTab('unknown'),/INVALID_TARGET/);assert.equal(calls,0)});
test('legacy no-effect is rejected, never caches requested state',()=>{let invalidates=0;const port=createLegacyNavigationPort({read:()=>snapshot('achievements'),setTab:()=>{},invalidate:()=>invalidates++});assert.throws(()=>port.selectTab('collections'),/POSTCONDITION/);assert.equal(port.activeTab,'achievements');assert.equal(invalidates,1)});
test('legacy exception propagates; caller notified to reread, no false success',()=>{const error=new Error('legacy failure');let invalidates=0;const port=createLegacyNavigationPort({read:()=>snapshot('achievements'),setTab:()=>{throw error},invalidate:()=>invalidates++});assert.throws(()=>port.selectTab('collections'),e=>e===error);assert.equal(invalidates,1);assert.equal(port.activeTab,'achievements')});
test('valid snapshots explicitly typed',()=>{assert.equal(activeLegacyTab(snapshot('achievements')),'achievements');assert.equal(activeLegacyTab(snapshot('collections')),'collections')});
