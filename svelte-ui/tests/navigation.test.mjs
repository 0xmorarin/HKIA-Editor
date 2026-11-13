import assert from 'node:assert/strict';
import {test} from 'node:test';
import {tabs,keyboardTarget,tabPresentation,requestTab} from '../src/navigation.ts';
const values=['achievements','collections'];
test('preserves exact V33 tab identity, labels and panel links',()=>{
  assert.deepEqual(tabs.map(x=>[x.id,x.panel,x.value,x.icon,x.label]),[['achTab','achPanel','achievements','🏅','アチーブメント'],['colTab','colPanel','collections','✿','コレクション']]);
});
for(const current of values){
  test(`${current}: selected state, hidden panel and roving tabindex`,()=>{
    for(const value of values){const selected=current===value;assert.deepEqual(tabPresentation(current,value),{selected,tabIndex:selected?0:-1,hidden:!selected,activeClass:selected?'primary-tab active':'primary-tab'});}
  });
  for(const key of ['ArrowLeft','ArrowRight','Home','End','Tab','Enter','Escape','ArrowUp']){
    test(`${current}: keyboard ${key}`,()=>{const expected=key==='Home'?'achievements':key==='End'?'collections':key==='ArrowLeft'||key==='ArrowRight'?current==='achievements'?'collections':'achievements':null;assert.equal(keyboardTarget(current,key),expected);});
  }
}
test('navigation forwards every command, including same selected tab; no local authority',()=>{let active='achievements';const calls=[];const port={get activeTab(){return active;},selectTab(next){calls.push(next);active=next;}};for(const next of ['achievements','collections','collections','achievements']){requestTab(port,next);assert.equal(port.activeTab,next);}assert.deepEqual(calls,['achievements','collections','collections','achievements']);});
