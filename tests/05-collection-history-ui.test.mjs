import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assembleCollectionHistoryUI,collectionHistoryUiStatus} from '../src/collection-history-ui.js';
import {WEB05_WRITER_PORT,previewNativeCollectionIntent} from '../src/ui-state.js';
const data=n=>JSON.parse(readFileSync(new URL(`../data/${n}.json`,import.meta.url)));
const itemManifest=data('item-collection-crosswalk');
const definitions=data('collection-definitions');
const parentManifest=data('item-parent-crosswalk');
const assigned=itemManifest.items.find(r=>r.collection_key&&r.extraction!=='unknown');
const unassigned=itemManifest.items.find(r=>r.collection_key===null&&r.extraction!=='unknown');
const unknown=1999999999;
const ticks='639283917345487311';
const make=(ids,entries,saveVersion='3.0.1')=>assembleCollectionHistoryUI({itemManifest,definitions,parentManifest,
  collectedItemIds:ids,historyEntries:entries,saveVersion});

test('01 CollectionHistoryDisplay.2 is connected to the UI without losing raw ticks or unknown item identity',()=>{
  const {model,display}=make([assigned.id,unassigned.id,unknown],[[assigned.id,ticks],[unassigned.id,ticks],[unknown,ticks]]);
  assert.equal(display.schema,'HKIA.CollectionHistoryDisplay.2');
  assert.equal(display.counts.CALENDAR_VALUE,3);
  assert.equal(display.counts.EXPLICITLY_UNASSIGNED,1);
  assert.equal(display.counts.UNKNOWN_SOURCE_ID,1);
  for(const id of [assigned.id,unassigned.id,unknown]){
    const row=collectionHistoryUiStatus({model,display,itemId:id});
    assert.equal(row.rawTicks,ticks);
    assert.equal(row.calendar,'2026-10-23T22:35:34.5487311');
    assert.equal(row.units,'100ns');assert.equal(row.timeZone,'UNKNOWN');assert.equal(row.dateTimeKind,'UNKNOWN');
    assert.equal(row.utcVerified,false);assert.equal(row.exportAuthorized,false);
  }
  assert.equal(collectionHistoryUiStatus({model,display,itemId:unknown}).membership,'UNKNOWN_SOURCE_ID');
  assert.equal(collectionHistoryUiStatus({model,display,itemId:unassigned.id}).membership,'EXPLICITLY_UNASSIGNED');
  assert.equal(display.getRecordedRow(unknown).technicalKey,null);
});

test('missing history and saved zero/negative timestamps are not conflated, read-only fallback keeps exact int64',()=>{
  const ids=[assigned.id,unassigned.id,unknown];
  const view=make(ids,[[assigned.id,'0'],[unassigned.id,'-1'],[unknown,ticks]]);
  assert.equal(view.fallbackNoCalendar,true);
  assert.equal(view.display.counts.ZERO_SEMANTICS_UNKNOWN,1);
  assert.equal(view.display.counts.OUTSIDE_DATETIME_CALENDAR,1);
  const zero=collectionHistoryUiStatus({...view,itemId:assigned.id});
  const negative=collectionHistoryUiStatus({...view,itemId:unassigned.id});
  const regular=collectionHistoryUiStatus({...view,itemId:unknown});
  assert.equal(zero.recorded,true);assert.equal(zero.rawTicks,'0');assert.equal(zero.calendar,null);
  assert.equal(negative.recorded,true);assert.equal(negative.rawTicks,'-1');
  assert.equal(regular.rawTicks,ticks);assert.equal(regular.calendar,'2026-10-23T22:35:34.5487311');
  const blocked=previewNativeCollectionIntent({model:view.model,display:view.display,itemId:assigned.id,operation:'remove'});
  assert.equal(blocked.rawBeforeTicks,'0');assert.equal(blocked.applyAuthorized,false);assert.equal(blocked.exportAuthorized,false);
  assert.ok(blocked.blockers.includes('EXISTING_TIMESTAMP_NOT_A_VERIFIED_CALENDAR_VALUE'));
  const empty=make([],null);
  assert.equal(collectionHistoryUiStatus({...empty,itemId:assigned.id}).timestampState,'NO_HISTORY_RECORD');
});

test('saved int64 precision boundary, malformed or duplicate pairs are rejected before UI state can change',()=>{
  assert.throws(()=>make([assigned.id],[[assigned.id,639283917345487311]]),/precision/);
  assert.throws(()=>make([assigned.id],[[assigned.id,'9223372036854775808']]),/range/);
  assert.throws(()=>make([assigned.id],[[assigned.id,ticks],[assigned.id,ticks]]),/duplicate/);
  assert.throws(()=>make([assigned.id],[[unknown,ticks]]),/do not match|mismatch/);
  assert.throws(()=>make([assigned.id,assigned.id],[[assigned.id,ticks]]),/duplicate|重複/);
});

test('new reader timestamp contract tracks CAS and does not authorize unknown item edits',()=>{
  const view=make([unknown],[[unknown,ticks]]);
  const attempt=previewNativeCollectionIntent({model:view.model,display:view.display,itemId:unknown,operation:'remove'});
  assert.equal(attempt.rawBeforeTicks,ticks);
  assert.equal(attempt.timestampState,'CALENDAR_VALUE');
  assert.ok(attempt.blockers.includes('UNKNOWN_ITEM_ID'));
  assert.ok(attempt.blockers.includes('SOURCE_RAW_TOKEN_PRESERVATION_NOT_VERIFIED'));
  assert.ok(attempt.blockers.includes('LINKED_SIDE_EFFECTS_NOT_VERIFIED'));
  assert.equal(attempt.applyAuthorized,false);
  assert.equal(attempt.exportAuthorized,false);
  assert.equal(view.display.getRecordedRow(unknown).timestamp.rawTicks,ticks);
});

test('04 typed WriterPort boundary remains fail-closed for both domains even with prepared native requests',()=>{
  for(const domain of ['achievement','collection-history']){
    const result=WEB05_WRITER_PORT.prepareNative({domain,saveVersion:'3.0.1'});
    assert.equal(result.domain,domain);assert.equal(result.applyAuthorized,false);
    assert.equal(result.exportAuthorized,false);assert.equal(result.saveBytes,null);
    assert.deepEqual(result.blockers,['NATIVE_WRITER_NOT_ACCEPTED']);
  }
  assert.throws(()=>WEB05_WRITER_PORT.prepareNative({domain:'account',saveVersion:'3.0.1'}),/typed/);
  assert.throws(()=>WEB05_WRITER_PORT.apply({}),/NATIVE_WRITER_NOT_ACCEPTED/);
  assert.throws(()=>WEB05_WRITER_PORT.exportNative({}),/NATIVE_WRITER_NOT_ACCEPTED/);
});
