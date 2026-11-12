import test from 'node:test';
import assert from 'node:assert/strict';
import {createImageUi,bindPrivateImageCatalog,registerPrivateImageInput,imageUi} from '../src/image-ui.js';
const G=n=>n.toString(16).padStart(32,'0');
const image={status:'EXACT',image:'assets/media/sprites/ab/'+'a'.repeat(64)+'.webp',spritePathId:'-9223372036854775808'};
const nil={status:'SOURCE_NULL',image:null};
const group='collection_group_test';
function fixture(){
 const map={accountAchievements:[{guid:G(1),key:'account',icon:image}],inGameAchievements:[{guid:G(2),key:'slot',counterGuid:G(3),rewardItemId:42,rewardQuantity:2,icon:nil}],collectionCategories:[{guid:G(4),group,icon:{...image,image:'assets/icons/category.webp',status:'EXISTING_VERIFIED'}}],collectionDefinitions:[{guid:G(5),key:'collection',group,directIcon:{status:'SOURCE_NULL_DERIVED',image:null},itemIds:[42]}],collectionItemIds:[{itemId:42,itemGuid:G(6),collectionGuid:G(5),collectionKey:'collection',itemKey:'item',icon:image}],rewardItemIcons:[{itemId:42,itemGuid:G(6),itemKey:'item',icon:image}]};
 const catalog={accounts:[{guid:G(1),key:'account'}],achievements:[{guid:G(2),key:'slot',counter_guid:G(3),reward_item_id:42,reward_quantity:2}],categories:[{guid:G(4),key:group,icon:'./assets/icons/category.webp'}],collections:[{guid:G(5),key:'collection',group}],items:[{id:42,guid:G(6),key:'item',collection_guid:G(5),collection_key:'collection'},{id:99,guid:G(7),key:'unassigned',collection_guid:null}]};
 const hit=x=>x?{found:true,icon:x.icon}:({found:false});
 let count=0;
 const resolver={accountByGuid:k=>(count++,hit(map.accountAchievements.find(x=>x.guid===k))),inGameByGuid:k=>hit(map.inGameAchievements.find(x=>x.guid===k)),collectionCategoryByGuid:k=>hit(map.collectionCategories.find(x=>x.guid===k)),collectionDefinitionByGuid:k=>({found:true,...map.collectionDefinitions.find(x=>x.guid===k)}),collectionItemById:k=>hit(map.collectionItemIds.find(x=>x.itemId===k)),rewardForInGameGuid:k=>k===G(2)?{found:true,achievementIcon:nil,rewardIcon:image,rewardItemId:42,quantity:2,rewardReceived:'UNVERIFIED'}:{found:false},coverage:{account:1}};
 return {map,catalog,resolver,calls:()=>count};
}
test('exact account GUID cache, slot domain and SOURCE_NULL remain distinct',()=>{const f=fixture();const ui=createImageUi(f.map,f.resolver,f.catalog);assert.equal(ui.achievement('account',G(1)),image);assert.equal(ui.achievement('account',G(1)),image);assert.equal(f.calls(),1);assert.equal(ui.achievement('slot',G(1)).status,'NOT_IN_SOURCE_MAP');assert.equal(ui.achievement('slot',G(2)),nil);assert.equal(ui.achievement('slot','slot').image,null);});
test('item lookup requires all three exact identities and never parent fallback',()=>{const f=fixture();const ui=createImageUi(f.map,f.resolver,f.catalog);assert.equal(ui.item(42,G(6),G(5)),image);for(const args of [[42,G(6),G(4)],[42,G(7),G(5)],[99,G(7),G(5)],['42',G(6),G(5)]])assert.equal(ui.item(...args).image,null);});
test('category and definition images remain separate',()=>{const f=fixture();const ui=createImageUi(f.map,f.resolver,f.catalog);assert.equal(ui.category(G(4),group).status,'EXISTING_VERIFIED');assert.equal(ui.category(G(4),'wrong').image,null);assert.equal(ui.collection(G(5),group).directIcon.status,'SOURCE_NULL_DERIVED');assert.equal(ui.collection(G(5),'wrong'),null);});
test('reward is separate and never an achievement-icon fallback',()=>{const f=fixture();const ui=createImageUi(f.map,f.resolver,f.catalog);const r=ui.reward(G(2));assert.equal(r.achievementIcon.image,null);assert.equal(r.rewardIcon,image);assert.equal(r.rewardReceived,'UNVERIFIED');assert.equal(ui.reward(G(1)),null);});
for(const [label,mutate] of [['wrong achievement GUID',f=>f.map.inGameAchievements[0].guid=G(9)],['wrong reward quantity',f=>f.map.inGameAchievements[0].rewardQuantity=3],['wrong category path',f=>f.map.collectionCategories[0].icon.image='assets/icons/wrong.webp'],['wrong collection parent',f=>f.map.collectionDefinitions[0].group='other'],['wrong ItemId membership',f=>f.map.collectionItemIds[0].collectionGuid=G(4)],['wrong item GUID',f=>f.map.collectionItemIds[0].itemGuid=G(7)],['wrong reward GUID',f=>f.map.rewardItemIcons[0].itemGuid=G(7)]])test('reject '+label,()=>{const f=fixture();mutate(f);assert.throws(()=>createImageUi(f.map,f.resolver,f.catalog),/mismatch/);});
test('invalid rebind cannot retain previously bound images',()=>{const f=fixture();registerPrivateImageInput(f.map,f.resolver);bindPrivateImageCatalog(f.catalog);assert.ok(imageUi());f.catalog.accounts[0].key='wrong';assert.throws(()=>bindPrivateImageCatalog(f.catalog));assert.equal(imageUi(),null);});

import {validateFallbackOverlay,registerPrivateImageBytes} from '../src/image-ui.js';
import {createHash} from 'node:crypto';
const shaBytes=x=>createHash('sha256').update(x).digest('hex');
function fallbackFixture(){
 const f=fixture(),{map,catalog}=f;
 map.accountAchievements.push({guid:G(8),key:'external',icon:nil});catalog.accounts.push({guid:G(8),key:'external',achievement_type:'PureExternal',steam_achievement:''});
 map.inGameAchievements.push({guid:G(9),key:'parent',counterGuid:G(10),rewardItemId:null,rewardQuantity:0,icon:image});catalog.achievements.push({guid:G(9),key:'parent',counter_guid:G(10),reward_item_id:null,reward_quantity:0});
 catalog.achievementReferences=[{guid:G(2),group_counter_guid:G(10)},{guid:G(9),group_counter_guid:G(11)}];
 map.collectionDefinitions[0].hidden=true;map.collectionDefinitions[0].itemCount=1;catalog.collections[0].hidden=true;
 const baseSha=shaBytes(JSON.stringify(map));
 const detail={image:image.image,spritePathId:image.spritePathId,context:'ALWAYS_SHOW_ICON_VM_ONLY'};
 const overlay={schema:'HKIA.ImageMap.FallbackDelta.1',privateOnly:true,runtimeVerified:false,steamNativeVerified:false,baseImageMapSha256:baseSha,inGameAchievements:[{guid:G(2),key:'slot',direct:'SOURCE_NULL',list:{status:'NO_MODEL_ICON'},sourceChildCount:0,detail:{...detail,status:'PARENT_ICON',parentGuid:G(9),parentKey:'parent',parentCounterGuid:G(10),nativeNavigation:'LEAF_NO_CHILDREN_SHOWDETAILS_GUARD'},completionNotification:{status:'NO_MODEL_ICON',viewRendering:'UNVERIFIED'}}],collectionDefinitions:[{guid:G(5),key:'collection',direct:'SOURCE_NULL_DERIVED',list:{status:'NO_MODEL_ICON'},sourceHidden:true,sourceItemCount:1,detail:{...detail,status:'PARENT_CATEGORY_ICON',parentGuid:G(4),image:'assets/icons/category.webp',nativeNavigation:'SOURCE_HIDDEN_RUNTIME_REACHABILITY_UNVERIFIED'}}],accountAchievements:[{guid:G(8),key:'external',direct:'SOURCE_NULL',sourceType:2,inGameStickers:{status:'NOT_IN_LOCAL_TREE'},platformAchievement:{status:'UNKNOWN_EXTERNAL_ICON',steamAchievementId:null}}]};
 return {...f,overlay,baseSha};
}
test('fallback stays detail-only and separate from direct and reward icons',()=>{const f=fallbackFixture();const ui=createImageUi(f.map,f.resolver,f.catalog,f.overlay,f.baseSha);assert.deepEqual(ui.fallbackCoverage,{inGame:1,collection:1,account:1});assert.equal(ui.achievement('slot',G(2)).image,null);assert.equal(ui.relatedAchievement(G(2)).icon.image,image.image);assert.equal(ui.relatedAchievement(G(9)),null);assert.equal(ui.reward(G(2)).rewardItemId,42);assert.equal(ui.collection(G(5),group).directIcon.image,null);assert.equal(ui.relatedCollection(G(5),group).parentGuid,G(4));assert.equal(ui.relatedCollection(G(5),'bad'),null);assert.equal(ui.externalAccount(G(8)),true);assert.equal(ui.externalAccount(G(1)),false);});
for(const [label,mutate] of [
 ['stale raw map SHA',f=>f.overlay.baseImageMapSha256='0'.repeat(64)],
 ['wrong schema',f=>f.overlay.schema='other'],
 ['runtime assertion',f=>f.overlay.runtimeVerified=true],
 ['duplicate GUID',f=>f.overlay.inGameAchievements.push(f.overlay.inGameAchievements[0])],
 ['missing coverage',f=>f.overlay.collectionDefinitions=[]],
 ['wrong domain',f=>f.overlay.inGameAchievements[0].guid=G(8)],
 ['wrong parent counter',f=>f.overlay.inGameAchievements[0].detail.parentCounterGuid=G(11)],
 ['wrong parent edge',f=>f.catalog.achievementReferences[0].group_counter_guid=G(11)],
 ['nonleaf',f=>f.catalog.achievementReferences[1].group_counter_guid=G(3)],
 ['path mismatch',f=>f.overlay.inGameAchievements[0].detail.image='assets/icons/category.webp'],
 ['traversal',f=>{f.overlay.inGameAchievements[0].detail.image='../x.webp';f.map.inGameAchievements[1].icon={...image,image:'../x.webp'};}],
 ['Sprite PathID type',f=>f.overlay.inGameAchievements[0].detail.spritePathId=Number(image.spritePathId)],
 ['category wrong parent',f=>f.overlay.collectionDefinitions[0].detail.parentGuid=G(9)],
 ['category wrong group',f=>f.catalog.categories[0].key='wrong'],
 ['external source changed',f=>f.catalog.accounts[1].achievement_type='Local'],
 ['external ID changed',f=>f.overlay.accountAchievements[0].platformAchievement.steamAchievementId='unknown'],
 ['list substitution',f=>f.overlay.inGameAchievements[0].list.status='PARENT_ICON']
])test('fallback rejects '+label,()=>{const f=fallbackFixture();mutate(f);assert.throws(()=>validateFallbackOverlay(f.map,f.overlay,f.baseSha,f.catalog),/mismatch/);});
test('raw bytes CAS checks raw map and overlay digests, not parsed JSON',async()=>{const f=fallbackFixture(),raw=Buffer.from(JSON.stringify(f.map)),o=Buffer.from(JSON.stringify(f.overlay));await registerPrivateImageBytes(raw,o,()=>f.resolver,shaBytes(o));assert.ok(bindPrivateImageCatalog(f.catalog));await assert.rejects(registerPrivateImageBytes(Buffer.from(JSON.stringify(f.map,null,1)),o,()=>f.resolver,shaBytes(o)),/base SHA/);assert.equal(imageUi(),null);await assert.rejects(registerPrivateImageBytes(raw,Buffer.concat([o,Buffer.from(' ')]),()=>f.resolver,shaBytes(o)),/overlay SHA/);assert.equal(imageUi(),null);});
