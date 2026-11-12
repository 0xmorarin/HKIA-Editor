import test from 'node:test';import assert from 'node:assert/strict';import {projectInventoryPredicate as p,projectCollectionAcquisition as c,assessCollectionAcquisitionOperation as a} from '../scripts/research/01-collection-acquisition-v15.mjs';
const inv=(category,entries,complete=true,identityVerified=true)=>p({category,entries,complete,identityVerified});
const state=(self,opts={})=>c({self,groupByParent:false,children:[],childrenComplete:true,active:true,historyPresent:false,historyTicks:null,...opts});
const op=(operation,before,after,opts={})=>a({operation,identityVerified:true,sourceVersionMatched:true,key0Empty:true,gateState:'CLEAR',parentContextComplete:true,before,after,...opts});
test('Recipe is bit 0x10, not category name or equality',()=>{assert.equal(inv(17,[0]).result,false);assert.equal(inv(16,[1]).result,true);assert.equal(inv(0,[0]).result,true);assert.equal(inv(1048832,[]).result,false);});
test('list presence differs from positive quantity',()=>{assert.equal(inv(3,[0,0]).result,true);assert.equal(inv(17,[0,1]).result,true);assert.equal(inv(17,[]).result,false);});
test('unknown runtime projection is not false',()=>{assert.equal(inv(17,[1],false).result,null);assert.equal(inv(17,[1],true,false).result,null);assert.equal(inv(null,[1]).result,null);});
test('malformed and overflow quantities fail closed',()=>{assert.throws(()=>inv(17,[-1]));assert.throws(()=>inv(17,[1.5]));assert.throws(()=>inv(17,[2147483647,1]));});
test('history alone cannot satisfy self predicate',()=>{assert.equal(state(false,{historyPresent:true,historyTicks:'638000000000000001'}).staticCollected,false);});
test('positive predicate plus no history uses fallback',()=>{assert.equal(state(true).staticCollected,true);assert.equal(state(true).timeSource,'RUNTIME_FALLBACK');});
test('zero history is present but runtime fallback',()=>{assert.equal(state(true,{historyPresent:true,historyTicks:'0'}).timeSource,'RUNTIME_FALLBACK');});
test('child can satisfy grouped parent',()=>{assert.equal(state(false,{groupByParent:true,children:[true],historyPresent:false}).staticCollected,true);assert.equal(state(false,{children:[true]}).staticCollected,false);});
test('incomplete children cannot prove uncollected',()=>{assert.equal(state(false,{groupByParent:true,children:[false],childrenComplete:false}).staticCollected,null);assert.equal(state(false,{groupByParent:true,children:[null]}).staticCollected,null);});
test('inactive state not exposed as active collected',()=>{assert.equal(state(true,{active:false}).activeCollected,null);assert.equal(state(true,{active:null}).activeCollected,null);});
test('no gameplay authorization from a history operation',()=>{assert.equal(op('ADD_HISTORY',false,false).historyDraftEligible,true);assert.equal(op('REMOVE_HISTORY',true,true).gameplayMutationAuthorized,false);assert.equal(op('MARK_COLLECTED',false,false).blockers.includes('OWNERSHIP_OR_PARENT_PREDICATE_CHANGE_REQUIRED'),true);});
test('already collected is no-op, cancellation needs predicate change',()=>{assert.ok(op('MARK_COLLECTED',true,true).blockers.includes('ALREADY_TARGET_STATE_NO_GAMEPLAY_CHANGE'));assert.ok(op('MARK_UNCOLLECTED',true,true).blockers.includes('OWNERSHIP_OR_PARENT_PREDICATE_CHANGE_REQUIRED'));});
test('gates, unknown identity, version, Key0 and parent fail closed',()=>{for(const x of [{gateState:'GATED'},{gateState:'UNKNOWN'},{identityVerified:false},{sourceVersionMatched:false},{key0Empty:false},{parentContextComplete:false}])assert.equal(op('ADD_HISTORY',true,true,x).historyDraftEligible,false);});
test('bad ticks and malformed tri-state rejected',()=>{assert.throws(()=>state(true,{historyPresent:true,historyTicks:'01'}));assert.throws(()=>state(true,{historyPresent:true,historyTicks:'9223372036854775808'}));assert.throws(()=>state('true'));});

test('negative or out-of-calendar ticks preserved as unknown',()=>{for(const historyTicks of ['-1','3155378976000000000'])assert.equal(state(true,{historyPresent:true,historyTicks}).timeSource,'UNKNOWN_SAVED_TICKS');});

test('group date precedence is not inferred from self history',()=>assert.equal(state(true,{groupByParent:true,children:[true],historyPresent:true,historyTicks:'638000000000000001'}).timeSource,'GROUP_ORDER_DEPENDENT'));

test('history-only state transition claim rejected',()=>{assert.equal(op('ADD_HISTORY',false,true).historyDraftEligible,false);assert.equal(op('REMOVE_HISTORY',true,false).historyDraftEligible,false);});
