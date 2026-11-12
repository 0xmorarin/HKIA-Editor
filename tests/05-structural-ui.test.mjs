import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readSave,readSaveStructurally} from '../src/save.js';
import {readSlotForDisplay,adaptStructuralSlotForDisplay,buildCollectionPresentationForSlot,structuralDomainMessage} from '../src/structural-ui-adapter.js';
import {WEB05_WRITER_PORT,inspectCounterDraft,previewNativeCollectionIntent,previewNativeAchievementIntent} from '../src/ui-state.js';
import {fixture,arr,uint,fl,bool,nil,rawTickCases} from './helpers/05-synthetic-slot.mjs';

const data=name=>JSON.parse(readFileSync(new URL('../data/'+name,import.meta.url)));
const catalogs={itemManifest:data('item-collection-crosswalk.json'),definitions:data('collection-definitions.json'),parentManifest:data('item-parent-crosswalk.json')};
const projection=slot=>buildCollectionPresentationForSlot({slot,...catalogs});

const future={version:'3.0.2',achievementExtra:[uint(42)],counterExtra:[uint(99)]};

test('validated 3.0.1 uses original strict reader and existing CollectionHistoryDisplay.2',()=>{
  const raw=fixture({unknownTail:false}).raw, slot=readSlotForDisplay(raw);
  assert.equal(slot.schema,'HKIA.Web05.SlotDisplay.2');assert.equal(slot.evidence.mode,'VALIDATED_BASELINE_READ');
  assert.deepEqual(slot.evidence.readable,{achievement:true,counter:true,'collection-history':true});
  assert.equal(slot.evidence.accountExportAllowed,true);assert.equal(slot.evidence.nativeExportAuthorized,false);
  assert.equal(slot.save.meta.header.applicationVersion,'3.0.1');
  const hist=projection(slot);
  assert.equal(hist.referenceOnly,false);assert.equal(hist.display.schema,'HKIA.CollectionHistoryDisplay.2');
  assert.equal(hist.display.getRecordedRow(3).timestamp.rawTicks,'0');
  assert.equal(hist.display.getRecordedRow(1).timestamp.state,'OUTSIDE_DATETIME_CALENDAR');
  assert.equal(hist.display.writerEnabled,false);
});

test('future 3.0.2 structurally recognized prefix is shown without claiming a new supported version',()=>{
  const original=fixture(future).raw, old=original.slice();
  assert.throws(()=>readSave(original),/未検証の保存バージョン/);
  const slot=readSlotForDisplay(original);
  assert.equal(slot.evidence.mode,'STRUCTURAL_READ_ONLY');assert.equal(slot.evidence.version,'3.0.2');
  assert.equal(slot.evidence.versionKnown,false);assert.equal(slot.evidence.accountExportAllowed,false);
  assert.equal(slot.evidence.readable.achievement,true);assert.equal(slot.evidence.readable.counter,true);
  assert.equal(slot.evidence.readable['collection-history'],true);
  assert.equal(slot.evidence.extraFields.achievement,1);assert.equal(slot.evidence.extraFields.counter,1);
  assert.equal(slot.evidence.unknownUnionTokens,1);assert.equal(slot.evidence.nativeExportAuthorized,false);
  assert.equal('raw' in slot.save,false);assert.equal(slot.save.achievements.length,1);
  assert.deepEqual(slot.save.collectionHistoryEntries.map(x=>x[1]),rawTickCases.map(String));
  assert.deepEqual(original,old);assert.equal(Object.isFrozen(slot.evidence),true);
  assert.match(structuralDomainMessage(slot.evidence,'collection-history'),/READABLE/);
});

test('future source-reference projection preserves raw int64 and unknown ItemId for dry-run only',()=>{
  const slot=readSlotForDisplay(fixture(future).raw), hist=projection(slot);
  assert.equal(hist.referenceOnly,true);assert.equal(hist.model.saveVersion,'3.0.2');
  assert.equal(hist.model.catalogReferenceVersion,'3.0.1');
  assert.equal(hist.model.versionCrosswalk,true);assert.equal(hist.display.saveVersion,'3.0.2');
  assert.equal(hist.display.getRecordedRow(1).timestamp.rawTicks,rawTickCases[0].toString());
  assert.equal(hist.display.getRecordedRow(5).timestamp.rawTicks,rawTickCases[4].toString());
  assert.equal(hist.display.getRecordedRow(3).timestamp.calendar,null);
  assert.equal(hist.display.getRecordedRow(4).timestamp.timeZone,'UNKNOWN');
  assert.ok(hist.display.getRecordedRow(5).gateWarnings.includes('CATALOG_SAVE_VERSION_DIFFERENT'));
  const attempt=previewNativeCollectionIntent({model:hist.model,display:hist.display,itemId:4,operation:'remove'});
  assert.equal(attempt.exportAuthorized,false);assert.ok(attempt.blockers.includes('NATIVE_WRITER_NOT_ACCEPTED'));
});

test('future synthetic unknown persisted ItemId is selectable via typed projection and never writable',()=>{
  const save=fixture({...future,historyEntries:[[uint(2000000001),new Uint8Array([0xd3,0,0,0,0,0,0,0,42])]]}).raw;
  const slot=readSlotForDisplay(save),hist=projection(slot);
  assert.deepEqual(hist.model.exceptions.unknownSourceIds,[2000000001]);
  const unknown=hist.display.getRecordedRow(2000000001);
  assert.equal(unknown.membership,'UNKNOWN_SOURCE_ID');assert.equal(unknown.timestamp.rawTicks,'42');
  const intent=previewNativeCollectionIntent({model:hist.model,display:hist.display,itemId:2000000001,operation:'remove'});
  assert.equal(intent.applyAuthorized,false);assert.ok(intent.blockers.includes('UNKNOWN_ITEM_ID'));
  assert.equal(WEB05_WRITER_PORT.prepareNative({domain:'collection-history',saveVersion:'3.0.2',readEvidence:slot.evidence}).exportAuthorized,false);
});

test('known version with appended union field becomes structural read-only and disables account output',()=>{
  const f=fixture({version:'3.0.1',achievementExtra:[uint(42)],unknownTail:false});
  assert.throws(()=>readSave(f.raw),/モデル構造/);
  const slot=readSlotForDisplay(f.raw);
  assert.equal(slot.evidence.versionKnown,true);assert.equal(slot.evidence.mode,'STRUCTURAL_READ_ONLY');
  assert.equal(slot.evidence.extraFields.achievement,1);assert.equal(slot.evidence.accountExportAllowed,false);
  assert.ok(WEB05_WRITER_PORT.prepareNative({domain:'achievement',saveVersion:'3.0.1',readEvidence:slot.evidence}).blockers.includes('OPAQUE_UNION_FIELDS_REQUIRE_RAW_PRESERVATION'));
});

test('future partial collection failure marks domain UNKNOWN without empty-history projection',()=>{
  const slot=readSlotForDisplay(fixture({...future,collectionOverride:arr(uint(39),arr(uint(1),uint(2)))}).raw);
  assert.equal(slot.evidence.readable['collection-history'],false);assert.equal(slot.save.collections,null);
  assert.equal(slot.save.collectionHistoryEntries.length,0);
  const p=projection(slot);assert.equal(p.unreadable,true);assert.equal(p.display,null);
  assert.match(structuralDomainMessage(slot.evidence,'collection-history'),/UNKNOWN/);
  const prep=WEB05_WRITER_PORT.prepareNative({domain:'collection-history',saveVersion:'3.0.2',readEvidence:slot.evidence});
  assert.ok(prep.blockers.includes('TARGET_DOMAIN_UNKNOWN'));
});

test('future malformed Achievement or Counter is isolated, never replaced with fabricated incomplete states',()=>{
  const ach=readSlotForDisplay(fixture({...future,achievementFieldsOverride:arr(uint(1),fl(1),nil)}).raw);
  assert.equal(ach.evidence.readable.achievement,false);assert.equal(ach.save.achievements.length,0);
  assert.equal(ach.evidence.readable.counter,true);
  const ctr=readSlotForDisplay(fixture({...future,counterFieldsOverride:arr(bool(true),nil,arr())}).raw);
  assert.equal(ctr.evidence.readable.counter,false);assert.equal(ctr.save.counters.length,0);
  assert.equal(ctr.evidence.readable.achievement,true);
  assert.ok(WEB05_WRITER_PORT.prepareNative({domain:'counter',saveVersion:'3.0.2',readEvidence:ctr.evidence}).blockers.includes('TARGET_DOMAIN_UNKNOWN'));
});

test('all domains unreadable is a hard failure, not a fake partially loaded save',()=>{
  const f=fixture({...future,collectionOverride:arr(uint(39),arr(uint(4),uint(5))),achievementFieldsOverride:arr(uint(1),fl(1),nil),counterFieldsOverride:arr(bool(true),nil,arr())});
  assert.throws(()=>readSlotForDisplay(f.raw),/No independently recognized native save domains/);
});

test('invalid header/body and opaque contract cannot be bypassed by the presentation reader',()=>{
  const f=fixture(future),bad=f.raw.slice();bad[0]^=0x7f;
  assert.equal(readSlotForDisplay(bad).evidence.nativeExportAuthorized,false);
  const dup=readSaveStructurally(f.raw);
  assert.throws(()=>adaptStructuralSlotForDisplay({...dup,writerEnabled:true}),/unaccepted/);
  assert.throws(()=>adaptStructuralSlotForDisplay({...dup,readable:{achievement:false,counter:false,'collection-history':false}}),/unreadable domain|no structurally readable/);
  assert.throws(()=>WEB05_WRITER_PORT.prepareNative({domain:'counter',saveVersion:'3.0.1',readEvidence:readSlotForDisplay(f.raw).evidence}),/stale/);
  assert.throws(()=>WEB05_WRITER_PORT.apply({}),/NATIVE_WRITER_NOT_ACCEPTED/);
  assert.throws(()=>WEB05_WRITER_PORT.exportNative({}),/NATIVE_WRITER_NOT_ACCEPTED/);
});

test('CountedGuids and legacy CountedValues scalar draft warns no guessed GUIDs or recount',()=>{
  const def={only_count_uniques:true};
  const counted={id:25,guid:'00000001:00000002:00000003:00000004',current:6,countedGuids:5,countedValues:null};
  const plan=inspectCounterDraft({counter:counted,definition:def,proposedCurrentValue:7});
  assert.equal(plan.onlyCountUniques,true);assert.equal(plan.countedGuidsCount,5);
  assert.ok(plan.blockers.includes('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE'));
  assert.ok(plan.blockers.includes('UNIQUE_COUNT_VALUE_PREIMAGE_MISMATCH'));
  assert.ok(plan.blockers.includes('UNIQUE_HISTORY_CONSTRUCTION_UNKNOWN'));
  assert.equal(plan.applyAuthorized,false);assert.equal(plan.exportAuthorized,false);
  const legacy=inspectCounterDraft({counter:{...counted,current:5,countedGuids:0,countedValues:['x']},definition:null,proposedCurrentValue:9});
  assert.equal(legacy.countedValuesState,'PRESENT');assert.ok(legacy.blockers.includes('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE'));
  assert.ok(legacy.warnings.includes('SOURCE_COUNTER_UNIQUENESS_UNKNOWN'));
  const untouched=inspectCounterDraft({counter:{...counted,current:0,countedGuids:0,countedValues:null},proposedCurrentValue:1});
  assert.equal(untouched.countedValuesState,'NULL');assert.ok(untouched.blockers.includes('NATIVE_WRITER_NOT_ACCEPTED'));
});

test('unknown structurally persisted achievement remains a field-level draft with no native export',()=>{
  const slot=readSlotForDisplay(fixture(future).raw);
  const record={...slot.save.achievements[0],kind:'slot'};
  const intent=previewNativeAchievementIntent({record,sourceKey:'',mapped:false,complete:true,current:5,completed:'2026-11-11T00:00:00Z'});
  assert.equal(intent.fields.length,3);assert.equal(intent.exportAuthorized,false);
  assert.equal(WEB05_WRITER_PORT.prepareNative({domain:'achievement',saveVersion:slot.save.version,readEvidence:slot.evidence}).applyAuthorized,false);
});
