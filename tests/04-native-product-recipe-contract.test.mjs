import test from 'node:test';
import assert from 'node:assert/strict';
import {openNativeProductSession} from '../native-product/api.mjs';
import {payload,envelope} from './helpers/04-native-schema-source.mjs';
import {zipLab} from './helpers/04-zip-lab-source.mjs';
const fixture=q=>Uint8Array.from(zipLab({slotBytesOverride:envelope(payload({migrationVersion:87,emptyKey0:true,recipeQuantity:q}))}).zip);
const req=(s,q=1)=>({operation:'collection-recipe-quantity',expectedRevision:s.revision,itemId:5913958,documentId:4,expectedQuantity:q,nextQuantity:1-q,acknowledgeRecipeAvailabilityChange:true,acknowledgeAchievementAndRewardReference:true});
test('V17 recipe contract: 1->0 typed preview only, exact old value and consent',async()=>{
 const raw=fixture(1),before=raw.slice(),s=await openNativeProductSession(raw);
 try{const p=s.plan(req(s));assert.equal(p.diff.nativeFields.length,1);assert.equal(p.diff.nativeFields[0].next,0);assert.equal(p.canExport,false);assert.equal((await s.verifyEditedCopy(p,s.revision)).totalFieldsVerified,1);assert.deepEqual(raw,before);
 for(const field of ['acknowledgeRecipeAvailabilityChange','acknowledgeAchievementAndRewardReference'])assert.throws(()=>s.plan({...req(s),[field]:false}),/CONSENT_REQUIRED/);
 assert.throws(()=>s.plan({...req(s),documentId:5}),/QUANTITY_CAS/);assert.throws(()=>s.plan({...req(s),expectedRevision:'0'.repeat(64)}),/CAS/);
 }finally{s.close();}
});
test('V17 recipe contract: existing zero row is not restoration evidence; forged proof rejected',async()=>{
 const s=await openNativeProductSession(fixture(0));try{assert.throws(()=>s.plan(req(s,0)),/RESTORE_PROVEN_SAME_ROW_REQUIRED/);assert.throws(()=>s.plan({...req(s,0),sameRowRestorationVerified:true}),/Exact recipe target required/);assert.throws(()=>s.plan({...req(s,0),receipt:'0'.repeat(32)}),/RESTORE_PROVEN_SAME_ROW_REQUIRED/);}finally{s.close();}
});
test('recipe output policy blocks unresolved recount independently of writer flag',async()=>{
 const s=await openNativeProductSession(fixture(1));try{const c=s.capability.devOutput.operations.find(x=>x.operation==='collection-recipe-quantity');assert.equal(c.canExport,false);assert(c.blockers.includes('RECIPE_EXACT_RECOUNT_WITNESS_REQUIRED'));assert(c.blockers.includes('RECIPE_RESTORE_PROVEN_SAME_ROW_REQUIRED'));}finally{s.close();}
});
