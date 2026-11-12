import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCollectionReadModel} from '../src/collection-state-contract.js';
import {normalizeSavedCollectionInt64,inspectCollectionSavedTicks,createCollectionHistoryDisplay,
  assessCollectionHistoryTransition,assertOpaqueCollectionTokensEqual} from '../src/collection-history-extension.js';
const json=n=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url)));
const items=json('item-collection-crosswalk'),defs=json('collection-definitions'),parents=json('item-parent-crosswalk');
const assigned=items.items.find(i=>i.collection_key&&i.extraction!=='unknown');
const unassigned=items.items.find(i=>i.collection_key===null&&i.extraction!=='unknown');
const unresolved=items.items.find(i=>i.extraction==='unknown');
const tick='639283917345487311';
const model=(ids=[],entries=null,version='3.0.1')=>buildCollectionReadModel({itemManifest:items,definitions:defs,parentManifest:parents,
  collectedItemIds:ids,historyEntries:entries,saveVersion:version});
const view=(ids=[],entries=null,version='3.0.1',withModelEntries=false)=>{
  const m=model(ids,withModelEntries?entries:null,version);
  return {m,view:createCollectionHistoryDisplay({model:m,recordedItemIds:ids,rawHistoryEntries:entries})};
};

test('new display contract extends old model and lists known unassigned + source-unresolved + unknown IDs individually',()=>{
 const unknownId=1999999999;
 const ids=[assigned.id,unassigned.id,unresolved.id,unknownId];
 const {m,view:v}=view(ids,ids.map(id=>[id,tick]));
 assert.equal(m.schema,'HKIA.CollectionReadContract.1');
 assert.equal(v.schema,'HKIA.CollectionHistoryDisplay.2');
 assert.equal(v.historyCount,4);
 assert.deepEqual([v.counts.ASSIGNED,v.counts.EXPLICITLY_UNASSIGNED,v.counts.SOURCE_MEMBERSHIP_UNKNOWN,v.counts.UNKNOWN_SOURCE_ID],[1,1,1,1]);
 for(const id of ids){const r=v.getRecordedRow(id);assert.equal(r.itemId,id);assert.equal(r.displayLabel,`Item ID ${id}`);assert.equal(r.historyRecorded,true);assert.equal(r.editable,false);assert.equal(r.timestamp.utcVerified,false);}
 assert.equal(v.getRecordedRow(unknownId).technicalKey,null);
 assert.equal(v.getRecordedRow(unknownId).categoryKey,null);
 assert.equal(v.getRecordedRow(unassigned.id).definitionKey,null);
 assert.equal(v.getRecordedRow(unknownId).uiBucket,'HISTORY_WITHOUT_VERIFIED_CATEGORY');
 assert.equal(v.listRecorded({membership:'EXPLICITLY_UNASSIGNED'}).items[0].itemId,unassigned.id);
 assert.equal(v.listRecorded({query:String(unknownId)}).total,1);
 assert.equal(v.getRecordedRow(333),null);
});

test('signed int64 is exact; zero/noncalendar values stay distinguishable without asserting unset or UTC',()=>{
 assert.equal(normalizeSavedCollectionInt64('-9223372036854775808'),'-9223372036854775808');
 assert.equal(normalizeSavedCollectionInt64('9223372036854775807'),'9223372036854775807');
 assert.equal(inspectCollectionSavedTicks(tick).calendar,'2026-10-23T22:35:34.5487311');
 assert.equal(inspectCollectionSavedTicks(tick).units,'100ns');
 assert.equal(inspectCollectionSavedTicks('0').state,'ZERO_SEMANTICS_UNKNOWN');
 assert.equal(inspectCollectionSavedTicks('-1').state,'OUTSIDE_DATETIME_CALENDAR');
 assert.equal(inspectCollectionSavedTicks('3155378976000000000').state,'OUTSIDE_DATETIME_CALENDAR');
 assert.equal(inspectCollectionSavedTicks('0').isUnsetVerified,false);
 assert.throws(()=>normalizeSavedCollectionInt64('9223372036854775808'),/range/);
 assert.throws(()=>normalizeSavedCollectionInt64(639283917345487311),/precision/);
 assert.throws(()=>normalizeSavedCollectionInt64('01'),/decimal/);
 const {view:v}=view([assigned.id,unassigned.id],[[assigned.id,'0'],[unassigned.id,'-1']]);
 assert.equal(v.historyCount,2);
 assert.equal(v.getRecordedRow(assigned.id).historyPresence,'RECORDED');
 assert.equal(v.getRecordedRow(assigned.id).timestamp.state,'ZERO_SEMANTICS_UNKNOWN');
 assert.equal(v.getRecordedRow(unassigned.id).timestamp.state,'OUTSIDE_DATETIME_CALENDAR');
});

test('raw history map must match original ID list and refuse duplicate/unsafe key types',()=>{
 assert.throws(()=>view([assigned.id],[[assigned.id,tick],[assigned.id,tick]]),/duplicate/);
 assert.throws(()=>view([assigned.id],[[unassigned.id,tick]]),/mismatch/);
 assert.throws(()=>view([assigned.id],[[assigned.id,Number(tick)]]),/precision/);
 assert.throws(()=>view([assigned.id],[[String(assigned.id),tick]]),/signed int32/);
 assert.throws(()=>view([assigned.id,assigned.id],[]),/重複|duplicate/);
 const {view:v}=view([-1,0],[[0,'0'],[-1,tick]]);
 assert.equal(v.historyCount,2);
 assert.equal(v.counts.UNKNOWN_SOURCE_ID,2);
});

test('model-provided and independent raw reader timestamps must match; missing exposure does not invent dates',()=>{
 const {view:v}=view([assigned.id],null);
 assert.equal(v.getRecordedRow(assigned.id).timestamp.state,'TIMESTAMP_NOT_EXPOSED');
 const m=model([assigned.id],[[assigned.id,tick]]);
 assert.throws(()=>createCollectionHistoryDisplay({model:m,recordedItemIds:[assigned.id],rawHistoryEntries:[[assigned.id,'639283917345487312']]}),/differ/);
 const accepted=createCollectionHistoryDisplay({model:m,recordedItemIds:[assigned.id]});
 assert.equal(accepted.getRecordedRow(assigned.id).timestamp.rawTicks,tick);
});

test('source-defined DLC/Event conditions are warnings only, and version mismatch is labeled',()=>{
 const dlcDef=defs.find(x=>x.requires_group_dlc),eventDef=defs.find(x=>x.event_source_defined);
 assert.ok(dlcDef&&eventDef);
 const dlcItem=items.items.find(x=>x.collection_key===dlcDef.key),eventItem=items.items.find(x=>x.collection_key===eventDef.key);
 assert.ok(dlcItem&&eventItem);
 const {view:v}=view([dlcItem.id,eventItem.id],[[dlcItem.id,tick],[eventItem.id,tick]],'3.0.0');
 assert.ok(v.getRecordedRow(dlcItem.id).gateWarnings.includes('DLC_ENTITLEMENT_NOT_VERIFIED'));
 assert.ok(v.getRecordedRow(eventItem.id).gateWarnings.includes('EVENT_ACTIVATION_NOT_VERIFIED'));
 assert.ok(v.getRecordedRow(eventItem.id).gateWarnings.includes('CATALOG_SAVE_VERSION_DIFFERENT'));
 assert.equal(v.getRecordedRow(dlcItem.id).entitlementVerified,false);
 assert.equal(v.getRecordedRow(eventItem.id).eventEligibleVerified,false);
});

test('transition CAS reuses prior intent, never produces writer bytes or approves add/remove',()=>{
 const {m,view:v}=view([assigned.id],[[assigned.id,tick]],'3.0.1',true);
 const base={model:m,display:v,itemId:assigned.id,operation:'remove',expectedRecorded:true,expectedTicks:tick,expectedSaveVersion:'3.0.1'};
 const removed=assessCollectionHistoryTransition(base);
 assert.equal(removed.applyAuthorized,false);assert.equal(removed.saveBytes,null);
 assert.equal(removed.after.recorded,false);
 assert.ok(removed.blockers.includes('WRITER_AND_REQUIRED_LINKAGE_NOT_VERIFIED'));
 assert.ok(removed.blockers.includes('LINKED_SIDE_EFFECTS_NOT_VERIFIED'));
 const wrong=assessCollectionHistoryTransition({...base,expectedSaveVersion:'3.0.0',expectedTicks:'639283917345487312'});
 assert.ok(wrong.blockers.includes('STALE_OR_WRONG_SAVE_VERSION'));
 assert.ok(wrong.blockers.includes('RAW_TIMESTAMP_COMPARE_AND_SWAP_FAILED'));
 const {m:unknownM,view:unknownV}=view([unassigned.id],[[unassigned.id,tick]],'3.0.1',true);
 const rejected=assessCollectionHistoryTransition({model:unknownM,display:unknownV,itemId:unassigned.id,
    operation:'remove',expectedRecorded:true,expectedTicks:tick,expectedSaveVersion:'3.0.1'});
 assert.ok(rejected.blockers.includes('UNVERIFIED_COLLECTION_MEMBERSHIP'));
 const {m:zeroM,view:zeroV}=view([assigned.id],[[assigned.id,'0']]);
 const zero=assessCollectionHistoryTransition({model:zeroM,display:zeroV,itemId:assigned.id,
    operation:'remove',expectedRecorded:true,expectedTicks:'0',expectedSaveVersion:'3.0.1'});
 assert.ok(zero.blockers.includes('EXISTING_TIMESTAMP_NOT_A_VERIFIED_CALENDAR_VALUE'));
});

test('read model + display preserve ordering of unknown saved records with bounded listing',()=>{
 const ids=[1999999999,assigned.id,unassigned.id,unresolved.id];
 const {view:v}=view(ids);
 assert.deepEqual(v.listRecorded({limit:2}).items.map(x=>x.itemId),ids.slice(0,2));
 assert.deepEqual(v.listRecorded({offset:2,limit:2}).items.map(x=>x.itemId),ids.slice(2));
 assert.equal(v.counts.TIMESTAMP_NOT_EXPOSED,4);
 assert.throws(()=>v.listRecorded({limit:101}),/pagination/);
 assert.throws(()=>v.listRecorded({membership:'INVENTORY'}),/membership/);
 assert.throws(()=>v.listRecorded({query:'x'.repeat(201)}),/search/);
});

test('opaque unknown field and deprecated token preservation is exact, including additions/removals',()=>{
 const before=[{path:'trait/39/key0/deprecated',bytes:Uint8Array.from([0x80])},
   {path:'trait/39/key7/unknown',bytes:Uint8Array.from([0xc4,0x02,0x01,0x02])},
   {path:'zip/member/other',bytes:Uint8Array.from([1,2,3])}];
 const copy=before.map(x=>({path:x.path,bytes:x.bytes.slice()}));
 const valid=assertOpaqueCollectionTokensEqual(before,copy);
 assert.equal(valid.verified,true);assert.equal(valid.paths,3);assert.equal(valid.writerEnabled,false);
 copy[1].bytes[2]^=1;
 assert.throws(()=>assertOpaqueCollectionTokensEqual(before,copy),/changed/);
 assert.throws(()=>assertOpaqueCollectionTokensEqual(before,copy.slice(0,2)),/added or removed/);
 assert.throws(()=>assertOpaqueCollectionTokensEqual(before,[...before,before[0]]),/duplicate/);
});

const privatePath=process.env.HKIA_COLLECTION_PRIVATE_FIXTURE;
const local=privatePath?JSON.parse(readFileSync(privatePath,'utf8')):null;
for(const ver of ['3.0.0','3.0.1']){
 test(`private v${ver} original history 78 known explicitly unassigned, zero unknown (optional)`,{skip:!local},()=>{
   const source=local[ver];assert.equal(source.schema,'HKIA.PrivateCollectionHistoryAudit.1');
   const ids=source.history.map(pair=>pair[0]);
   const m=model(ids,null,ver);
   const d=createCollectionHistoryDisplay({model:m,recordedItemIds:ids,rawHistoryEntries:source.history});
   assert.equal(d.historyCount,ver==='3.0.0'?5046:5164);
   assert.equal(d.counts.EXPLICITLY_UNASSIGNED,78);
   assert.equal(d.counts.UNKNOWN_SOURCE_ID,0);assert.equal(d.counts.SOURCE_MEMBERSHIP_UNKNOWN,0);
   assert.equal(d.counts.ZERO_SEMANTICS_UNKNOWN,0);
   assert.equal(d.counts.OUTSIDE_DATETIME_CALENDAR,0);
   assert.equal(d.counts.CALENDAR_VALUE,d.historyCount);
   const entries=d.listRecorded({membership:'EXPLICITLY_UNASSIGNED',limit:100}).items;
   assert.equal(entries.length,78);
   for(const row of entries){assert.equal(row.definitionKey,null);assert.equal(row.historyRecorded,true);assert.equal(row.editable,false);assert.equal(row.timestamp.utcVerified,false);}
 });
}

test('private two-version 78-item membership, timestamp and source-prefix stability (optional)',{skip:!local},()=>{
  const old=new Map(local['3.0.0'].history),current=new Map(local['3.0.1'].history);
  const keys=items.items.filter(x=>old.has(x.id)&&current.has(x.id)&&x.collection_key===null&&x.extraction!=='unknown');
  assert.equal(keys.length,78);
  const groups={};
  for(const x of keys){
    assert.equal(old.get(x.id),current.get(x.id));
    groups[x.key.split('_')[1]]=(groups[x.key.split('_')[1]]??0)+1;
  }
  assert.deepEqual(groups,{blueprint:32,trinket:24,recipe:13,furn:7,creation:2});
  const parentIds=new Set(parents.links.map(x=>x.child_id));
  const referencedParents=new Set(parents.links.map(x=>x.parent_id));
  for(const x of keys){assert.equal(parentIds.has(x.id),false);assert.equal(referencedParents.has(x.id),false);}
});
