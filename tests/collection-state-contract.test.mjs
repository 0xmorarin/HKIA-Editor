import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildCollectionReadModel,normalizeCollectionTicks,collectionTicksCalendar,assessCollectionEditIntent} from '../src/collection-state-contract.js';
const data=name=>JSON.parse(readFileSync(new URL(`../data/${name}.json`,import.meta.url)));
const items=data('item-collection-crosswalk'),defs=data('collection-definitions'),parents=data('item-parent-crosswalk');
const first=items.items.find(x=>x.collection_key&&x.extraction!=='unknown');
const empty=items.items.find(x=>x.collection_key===null && x.extraction!=='unknown');
const unknown=items.items.find(x=>x.extraction==='unknown');
const tick='639283917345487311';
const model=(ids=[],entries=null,version='3.0.1')=>buildCollectionReadModel({itemManifest:items,definitions:defs,parentManifest:parents,
  collectedItemIds:ids,historyEntries:entries,saveVersion:version});

test('all 25/181 and original 12163/5170 manifests are reused without inventing game progress',()=>{
 const m=model();assert.equal(m.counts.categories,25);assert.equal(m.counts.definitions,181);
 assert.equal(m.counts.sourceItems,12163);assert.equal(m.counts.sourceAssigned,10262);
 assert.equal(m.counts.sourceUnresolved,70);assert.equal(m.counts.sourceExplicitUnassigned,1831);assert.equal(m.counts.sourceParentLinks,5170);
 assert.equal(m.byDefinition.size,181);assert.equal(m.gamePercentVerified,false);
 assert.equal(m.eligibilityVerified,false);assert.equal(m.writerEnabled,false);
 assert.equal([...m.byDefinition.values()].filter(x=>x.gates.requiresGroupDlc).length,39);
 assert.equal([...m.byDefinition.values()].filter(x=>x.gates.hasEventReference).length,2);
});

test('history status never conflates missing records, unknown source, unassigned, or unresolved fields',()=>{
 const m=model([first.id,empty.id,unknown.id,1999999999]);
 assert.equal(m.getItem(first.id).status,'HISTORY_RECORDED');
 assert.equal(m.getItem(empty.id).status,'UNASSIGNED_SOURCE_ITEM');
 assert.equal(m.getItem(unknown.id).status,'UNKNOWN_COLLECTION_MEMBERSHIP');
 assert.equal(m.getItem(1999999999).status,'UNKNOWN_SOURCE_ID');
 const another=items.items.find(x=>x.collection_key&&x.id!==first.id);
 assert.equal(m.getItem(another.id).status,'NO_HISTORY_RECORD');
 assert.deepEqual(m.counts.historyKnownAssigned,1);
 assert.deepEqual(m.counts.historyKnownUnassigned,1);
 assert.deepEqual(m.counts.historyUnresolved,1);
 assert.deepEqual(m.counts.historyUnknownSource,1);
});

test('precise calendar survives .NET ticks with 100ns precision; makes no UTC claim',()=>{
 assert.deepEqual(collectionTicksCalendar(tick),{calendar:'2026-10-23T22:35:34.5487311',precision:'100ns',timeZone:'UNKNOWN',dateTimeKind:'UNKNOWN',ticks:tick});
 assert.equal(collectionTicksCalendar('1').calendar,'0001-01-01T00:00:00.0000001');
 assert.equal(normalizeCollectionTicks(639283917345487311n),tick);
 for(const bad of [0,-1,1.5,Number(tick),'1.2','-1','01',null,'3155378976000000000','9'.repeat(10000)])assert.throws(()=>normalizeCollectionTicks(bad));
});

test('typed history ensures exact same IDs, refuses duplicate or stale/disparate timestamps',()=>{
 const m=model([first.id],[[first.id,tick]]);
 assert.equal(m.getItem(first.id).historyTicks,tick);
 assert.equal(m.getItem(first.id).historyTimeKnown,true);
 assert.throws(()=>model([first.id],[[first.id,tick],[first.id,tick]]),/duplicate/);
 assert.throws(()=>model([first.id],[[empty.id,tick]]),/do not match/);
 assert.throws(()=>model([first.id],[]),/do not match/);
});

test('source-reference counts and bounded item pagination never imply runtime completion',()=>{
 const m=model([first.id],[[first.id,tick]],'3.0.0');
 assert.equal(m.versionCrosswalk,true);
 assert.equal(m.byDefinition.get(first.collection_key).gamePercentVerified,false);
 const a=m.listDefinitionItems(first.collection_key,{limit:1,state:'history-recorded'});
 assert.equal(a.total,1);assert.equal(a.items.length,1);assert.equal(a.items[0].id,first.id);
 assert.throws(()=>m.listDefinitionItems(first.collection_key,{limit:101}),/pagination/);
 assert.throws(()=>m.listDefinitionItems('bogus'),/unknown collection/);
});

test('edit-intent remains non-writing and stale guards reject unsafe hypotheses',()=>{
 const m=model([first.id],[[first.id,tick]]);
 const a=assessCollectionEditIntent(m,{itemId:first.id,operation:'remove',expectedRecorded:true,expectedTicks:tick});
 assert.equal(a.applyAuthorized,false);assert.equal(a.transactionRequired,true);
 assert.equal(a.beforeTicks,tick);assert.equal(a.afterRecorded,false);
 assert.ok(a.blockers.includes('WRITER_AND_REQUIRED_LINKAGE_NOT_VERIFIED'));
 const stale=assessCollectionEditIntent(m,{itemId:first.id,operation:'remove',expectedRecorded:true,expectedTicks:'639283917345487312'});
 assert.ok(stale.blockers.includes('STALE_HISTORY_TICKS'));
 const changed=assessCollectionEditIntent(m,{itemId:first.id,operation:'set-time',expectedRecorded:true,expectedTicks:tick,proposedTicks:'639283917345487312'});
 assert.equal(changed.afterRecorded,true);assert.equal(changed.afterTicks,'639283917345487312');assert.equal(changed.applyAuthorized,false);
 const b=assessCollectionEditIntent(model(),{itemId:first.id,operation:'record',expectedRecorded:false,proposedTicks:tick});
 assert.equal(b.afterTicks,tick);assert.equal(b.applyAuthorized,false);
 const missingTick=assessCollectionEditIntent(model([first.id]),{itemId:first.id,operation:'remove',expectedRecorded:true,expectedTicks:tick});
 assert.ok(missingTick.blockers.includes('HISTORY_TICKS_NOT_EXPOSED_BY_READER'));
 assert.throws(()=>assessCollectionEditIntent(m,{itemId:0,operation:'remove',expectedRecorded:true}),/ItemId/);
});
