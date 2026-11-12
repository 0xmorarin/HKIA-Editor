import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCollectionMutationEvidence,planCollectionMutation,verifyCollectionSemanticDelta}
  from '../src/collection-mutation-semantics.js';
import {readSave} from '../src/save.js';
import {reconcileCollectionItemIds} from '../src/collection-progress.js';
import {reconcileParentFamilies} from '../src/collection-parent-progress.js';
const fixture=name=>JSON.parse(readFileSync(new URL('../data/'+name+'.json',import.meta.url)));
const items=fixture('item-collection-crosswalk'),defs=fixture('collection-definitions'),parents=fixture('item-parent-crosswalk');
const tick='639283917345487311',next='639283917345487312';
const assigned=items.items.find(x=>x.collection_key && !defs.find(d=>d.key===x.collection_key)?.requires_group_dlc && !defs.find(d=>d.key===x.collection_key)?.event_source_defined);
const unassigned=items.items.find(x=>x.collection_key===null&&x.extraction!=='unknown');
const dlcDef=defs.find(d=>d.requires_group_dlc),eventDef=defs.find(d=>d.event_source_defined);
const dlcItem=items.items.find(x=>x.collection_key===dlcDef.key),eventItem=items.items.find(x=>x.collection_key===eventDef.key);
const parentLink=parents.links.find(x=>x.relation==='same-collection');
const make=(entries=[],options={})=>createCollectionMutationEvidence({saveVersion:options.version??'3.0.1',historyEntries:entries,
  itemManifest:items,definitions:defs,parentManifest:parents,
  deprecatedKey0:options.key0??{state:'PRESENT_MAP',entryCount:0},structuralReadVerified:true});
const plan=(e,operation,itemId,{old=null,after=null,present=true,version=e.saveVersion}={})=>
  planCollectionMutation(e,{itemId,operation,expectedSaveVersion:version,expectedPresent:present,
    expectedTicks:old,newTicks:after});

test('Key1 metadata and Key0 state remain distinct; no migration, no writer',()=>{
  const e=make([[assigned.id,tick]],{key0:{state:'PRESENT_MAP',entryCount:2}});
  assert.equal(e.deprecatedKey0.entryCount,2);
  assert.equal(e.deprecatedKey0.tokenBytesPreserved,false);
  assert.equal(e.deprecatedKey0.migrate,false);
  assert.equal(e.deprecatedKey0.defaultIfMissing,false);
  assert.equal(e.getItem(assigned.id).rawTicks,tick);
  assert.equal(e.writerEnabled,false);
  assert.throws(()=>make([], {key0:{state:'ABSENT',entryCount:0}}),/mismatch/);
  const absent=make([], {key0:{state:'ABSENT',entryCount:null}});
  assert.equal(absent.deprecatedKey0.state,'ABSENT');
  assert.equal(absent.deprecatedKey0.defaultIfMissing,false);
});

test('existing unknown ID still appears, is draft-editable, never applied',()=>{
  const unknown=2000000000,e=make([[unknown,tick]]),row=e.getItem(unknown);
  assert.equal(row.label,`Item ID ${unknown}`);
  assert.equal(row.membership,'UNKNOWN_SOURCE_ID');
  assert.equal(row.categoryKey,null);
  assert.equal(row.recorded,true);
  assert.equal(row.rawTicks,tick);
  const p=plan(e,'set-time',unknown,{old:tick,after:next});
  assert.equal(p.canDraft,true);assert.equal(p.applyAuthorized,false);
  assert.ok(p.applyBlockers.includes('REQUIRED_LINKAGE_NOT_ESTABLISHED'));
  const verified=verifyCollectionSemanticDelta(e,p,[[unknown,next]]);
  assert.equal(verified.semanticKey1DeltaVerified,true);
  assert.equal(verified.deprecatedKey0OpaqueWitnessVerified,false);
  assert.equal(verified.unknownFieldsPreservedInNativeBytes,false);
});

test('absent unknown ID cannot be fabricated; known assigned absent can draft add only',()=>{
  const e=make([]);
  const rejected=plan(e,'add',2000000000,{present:false,after:tick});
  assert.ok(rejected.issues.includes('NEW_RECORD_REQUIRES_VERIFIED_SOURCE_MEMBERSHIP'));
  const accepted=plan(e,'add',assigned.id,{present:false,after:tick});
  assert.equal(accepted.canDraft,true);assert.equal(accepted.applyAuthorized,false);
  assert.equal(verifyCollectionSemanticDelta(e,accepted,[[assigned.id,tick]]).untouchedOrderAndTicksVerified,true);
  assert.throws(()=>verifyCollectionSemanticDelta(e,accepted,[[assigned.id,tick],[1234,tick]]),/append exactly one/);
  const noCategory=plan(e,'add',unassigned.id,{present:false,after:tick});
  assert.equal(noCategory.canDraft,false);
});

test('remove only target ItemId and preserve existing map order and other exact ticks',()=>{
  const unknown=2000000000,e=make([[assigned.id,tick],[unknown,next],[unassigned.id,tick]]);
  const p=plan(e,'remove',unknown,{old:next});
  assert.equal(p.canDraft,true);assert.equal(p.after.recorded,false);
  const proof=verifyCollectionSemanticDelta(e,p,[[assigned.id,tick],[unassigned.id,tick]]);
  assert.equal(proof.untouchedOrderAndTicksVerified,true);
  assert.throws(()=>verifyCollectionSemanticDelta(e,p,[[unassigned.id,tick],[assigned.id,tick]]),/order changed/);
  assert.throws(()=>verifyCollectionSemanticDelta(e,p,[[assigned.id,next],[unassigned.id,tick]]),/ticks changed/);
  assert.throws(()=>verifyCollectionSemanticDelta(e,p,[[assigned.id,tick],[unknown,next],[unassigned.id,tick]]),/remove must/);
});

test('set-time exact 100ns difference, signed 64-bit, no change, stale CAS, unknown UTC',()=>{
  const e=make([[assigned.id,tick]]),r=e.getItem(assigned.id);
  assert.equal(r.timestamp.units,'100ns');assert.equal(r.timestamp.utcVerified,false);
  const ok=plan(e,'set-time',assigned.id,{old:tick,after:next});
  assert.equal(ok.canDraft,true);assert.equal(ok.after.rawTicks,next);
  assert.ok(ok.warnings.includes('UTC_AND_UNSET_SEMANTICS_UNKNOWN'));
  assert.ok(plan(e,'set-time',assigned.id,{old:next,after:tick}).issues.includes('OLD_TICKS_CAS_MISMATCH'));
  assert.ok(plan(e,'set-time',assigned.id,{old:tick,after:tick}).issues.includes('NO_CHANGE'));
  assert.ok(plan(e,'set-time',assigned.id,{old:tick,after:'0'}).issues.includes('NEW_TICKS_NOT_PROVEN_CALENDAR'));
  assert.ok(plan(e,'set-time',assigned.id,{old:tick,after:639283917345487311}).issues.includes('NEW_TICKS_INVALID_INT64'));
  assert.ok(plan(e,'set-time',assigned.id,{old:tick,after:'9223372036854775808'}).issues.includes('NEW_TICKS_INVALID_INT64'));
  assert.equal(verifyCollectionSemanticDelta(e,ok,[[assigned.id,next]]).writerEnabled,false);
});

test('malformed and duplicated decoded keys rejected; raw MessagePack duplication still 04 responsibility',()=>{
  assert.throws(()=>make([[1,tick],[1,tick]]),/duplicate/);
  assert.throws(()=>make([[1,tick],[2,next],'bad']),/pair/);
  assert.throws(()=>make([[2147483648,tick]]),/signed int32/);
  assert.throws(()=>make([[1,639283917345487311]]),/unsafe number/);
  assert.throws(()=>createCollectionMutationEvidence({saveVersion:'3.0.1',historyEntries:[],itemManifest:items,definitions:defs,parentManifest:parents,
    deprecatedKey0:{state:'PRESENT_MAP',entryCount:0}}),/typed envelope/);
});

test('raw zero/negative/out-of-calendar ticks are retained as typed, not inferred unset',()=>{
  const e=make([[assigned.id,'0'],[unassigned.id,'-1'],[2000000000,'9223372036854775807']]);
  assert.equal(e.getItem(assigned.id).timestamp.state,'ZERO_SEMANTICS_UNKNOWN');
  assert.equal(e.getItem(unassigned.id).timestamp.state,'OUTSIDE_DATETIME_CALENDAR');
  assert.equal(e.getItem(2000000000).rawTicks,'9223372036854775807');
  assert.equal(e.getItem(2000000000).timestamp.timeZone,'UNKNOWN');
  const p=plan(e,'remove',assigned.id,{old:'0'});
  assert.equal(p.canDraft,true);assert.equal(p.applyAuthorized,false);
  assert.ok(e.getItem(assigned.id).warnings.includes('SAVED_TICKS_SEMANTICS_UNKNOWN'));
});

test('Key0 and unknown opaque raw witnesses checked exactly; no full-coverage claim',()=>{
  const e=make([[assigned.id,tick]],{key0:{state:'PRESENT_MAP',entryCount:1}}),p=plan(e,'set-time',assigned.id,{old:tick,after:next});
  const raw=[{path:'trait/39/key0/deprecated',bytes:Uint8Array.of(0x81,0x01,0x02)},
    {path:'trait/39/unknown-field',bytes:Uint8Array.of(0xc4,0x01,0xff)}];
  const after=raw.map(x=>({path:x.path,bytes:x.bytes.slice()}));
  const proof=verifyCollectionSemanticDelta(e,p,[[assigned.id,next]],{opaqueBefore:raw,opaqueAfter:after});
  assert.equal(proof.deprecatedKey0OpaqueWitnessVerified,true);
  assert.equal(proof.completeRawTokenCoverageVerified,false);
  after[0].bytes[2]^=1;
  assert.throws(()=>verifyCollectionSemanticDelta(e,p,[[assigned.id,next]],{opaqueBefore:raw,opaqueAfter:after}),/changed/);
  assert.throws(()=>verifyCollectionSemanticDelta(e,p,[[assigned.id,next]],{
    opaqueBefore:raw.slice(1),opaqueAfter:raw.slice(1)}),/Key0 token witness required/);
});

test('DLC/Event/hidden gates are warnings + apply blockers, never entitlement claims',()=>{
  const e=make([[dlcItem.id,tick],[eventItem.id,tick]]);
  const dlc=e.getItem(dlcItem.id),event=e.getItem(eventItem.id);
  assert.equal(dlc.sourceDlcGate,true);assert.ok(dlc.warnings.includes('DLC_ENTITLEMENT_UNVERIFIED'));
  assert.equal(event.sourceEventGate,true);
  assert.equal(event.sourceEventYear,eventDef.event_year);
  const p1=plan(e,'remove',dlcItem.id,{old:tick}),p2=plan(e,'remove',eventItem.id,{old:tick});
  assert.equal(p1.canDraft,true);assert.equal(p2.canDraft,true);
  assert.ok(p1.applyBlockers.includes('DLC_ENTITLEMENT_UNVERIFIED'));
  assert.ok(p2.applyBlockers.includes('EVENT_ELIGIBILITY_UNVERIFIED'));
  assert.equal(p1.applyAuthorized,false);assert.equal(p2.applyAuthorized,false);
});

test('Parent cross-collection relation and source progress are diagnostic-only',()=>{
  const e=make([[parentLink.child_id,tick]]),row=e.getItem(parentLink.child_id);
  assert.equal(row.sourceParentId,parentLink.parent_id);
  assert.equal(row.sourceParentRelation,'same-collection');
  const p=plan(e,'remove',parentLink.child_id,{old:tick});
  assert.equal(p.affectedSource.parentId,parentLink.parent_id);
  assert.equal(p.affectedSource.progressMayRecompute,true);
  assert.equal(p.affectedSource.groupOrGameCompletionVerified,false);
  assert.equal(p.linkage.find(x=>x.target==='SourceParentFamilyAndCategoryDisplay').autoUpdate,false);
  assert.equal(p.linkage.find(x=>x.target==='Achievement/Counter/Quest/Unlock/Reward/Cache').classification,'UNKNOWN');
});


test('source parent family diagnostic is not a persisted counter: two sibling IDs may count as one family',()=>{
  const links=parents.links.filter(x=>x.relation==='same-collection');
  const pair=links.find(x=>links.some(y=>y!==x&&y.parent_id===x.parent_id));
  assert.ok(pair);
  const sibling=links.find(x=>x!==pair&&x.parent_id===pair.parent_id);
  const source=items.items.find(x=>x.id===pair.child_id);
  assert.equal(source.collection_key,items.items.find(x=>x.id===sibling.child_id).collection_key);
  const once=reconcileParentFamilies(parents,reconcileCollectionItemIds(items,defs,[pair.child_id]));
  const twice=reconcileParentFamilies(parents,reconcileCollectionItemIds(items,defs,[pair.child_id,sibling.child_id]));
  const prev=once.byKey.get(source.collection_key),now=twice.byKey.get(source.collection_key);
  assert.equal(prev.familyRecorded,now.familyRecorded);
  assert.equal(prev.familyRecorded,1);
  assert.equal(prev.familyTotal,now.familyTotal);
  const e=make([[pair.child_id,tick]]);
  const edit=plan(e,'add',sibling.child_id,{present:false,after:next});
  assert.equal(edit.canDraft,true);
  assert.equal(edit.affectedSource.groupOrGameCompletionVerified,false);
  assert.equal(edit.applyAuthorized,false);
});

test('3.0.0 and future 3.0.2 typed history read without inherited native edit authorization',()=>{
  for(const ver of ['3.0.0','3.0.2']){
    const e=make([[2000000000,tick]],{version:ver});
    const item=e.getItem(2000000000);
    assert.equal(item.rawTicks,tick);assert.equal(item.label,'Item ID 2000000000');
    const p=plan(e,'set-time',2000000000,{old:tick,after:next});
    assert.equal(p.canDraft,true);assert.equal(p.applyAuthorized,false);
    assert.equal(e.catalogVersionMatches,ver==='3.0.1');
    assert.ok(item.warnings.includes('CATALOG_VERSION_DIFFERENT_FROM_SAVE'));
    if(ver==='3.0.2')assert.ok(p.applyBlockers.includes('NEW_VERSION_NATIVE_CODEC_UNVERIFIED'));
  }
});

test('pagination includes all unknown/sourceless saved IDs, original order, no names/images needed',()=>{
  const e=make([[2000000000,tick],[unassigned.id,tick],[assigned.id,next]]);
  assert.deepEqual(e.list({limit:2}).items.map(x=>x.itemId),[2000000000,unassigned.id]);
  assert.equal(e.list({membership:'UNKNOWN_SOURCE_ID'}).total,1);
  assert.equal(e.list({query:'2000000000'}).items[0].sourceGuid,null);
  assert.throws(()=>e.list({limit:101}),/pagination/);
  assert.throws(()=>e.list({query:'x'.repeat(201)}),/query/);
});

const pathA=process.env.HKIA_TEST_SAVE_V300, pathB=process.env.HKIA_TEST_SAVE;
test('private real v3.0.0 / v3.0.1 typed Key1/Key0 and version-delta evidence (non-packaged)',
  {skip:!(pathA&&pathB)},()=>{
    const a=readSave(readFileSync(pathA)),b=readSave(readFileSync(pathB));
    assert.equal(a.version,'3.0.0');assert.equal(b.version,'3.0.1');
    assert.equal(a.collections.deprecatedEntries,0);assert.equal(b.collections.deprecatedEntries,0);
    assert.equal(a.collectionHistoryEntries.length,5046);assert.equal(b.collectionHistoryEntries.length,5164);
    const eA=make(a.collectionHistoryEntries,{version:'3.0.0'}),eB=make(b.collectionHistoryEntries);
    assert.equal(eA.list({membership:'UNKNOWN_SOURCE_ID'}).total,0);
    assert.equal(eB.list({membership:'UNKNOWN_SOURCE_ID'}).total,0);
    const before=new Map(a.collectionHistoryEntries),current=new Map(b.collectionHistoryEntries);
    const common=[...before.keys()].filter(x=>current.has(x)),adds=[...current.keys()].filter(x=>!before.has(x));
    assert.equal(common.length,5046);assert.equal(adds.length,118);
    assert.equal(common.filter(x=>before.get(x)!==current.get(x)).length,0);
    for(const r of eB.list({limit:1}).items){assert.equal(r.timestamp.units,'100ns');assert.equal(r.timestamp.utcVerified,false);}
  });

const backupPath=process.env.HKIA_TEST_SAVE_V300_BACKUP;
test('same ZIP v3.0.0 backup -> v3.0.1 active: only four Key1 IDs added, no history timestamp changed',
  {skip:!(backupPath&&pathB)},()=>{
    const before=readSave(readFileSync(backupPath)),after=readSave(readFileSync(pathB));
    assert.equal(before.version,'3.0.0');assert.equal(after.version,'3.0.1');
    assert.equal(before.collections.historyEntries,5160);assert.equal(after.collections.historyEntries,5164);
    assert.equal(before.collections.deprecatedEntries,0);assert.equal(after.collections.deprecatedEntries,0);
    const old=new Map(before.collectionHistoryEntries),current=new Map(after.collectionHistoryEntries);
    const additions=[...current.keys()].filter(id=>!old.has(id));
    const removals=[...old.keys()].filter(id=>!current.has(id));
    assert.equal(additions.length,4);assert.equal(removals.length,0);
    for(const [id,ticks] of old)assert.equal(current.get(id),ticks);
    assert.equal(before.achievements.length,after.achievements.length);
    assert.equal(before.counters.length,after.counters.length);
    const evidence=make(after.collectionHistoryEntries);
    for(const id of additions){assert.equal(evidence.getItem(id).recorded,true);
      assert.equal(evidence.getItem(id).rawTicks,current.get(id));}
  });
