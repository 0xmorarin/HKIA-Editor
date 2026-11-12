import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/04-puzzle-goals-source.mjs';
import {readSave} from '../src/save.js';
import {dryRunNativeSlotTransaction,NATIVE_SLOT_WRITER_ENABLED} from '../scripts/research/save-transaction-engine.mjs';
import {CROSS_STORE_WRITER_ENABLED} from '../scripts/research/save-cross-store-dry-run.mjs';

const tick=(expected,next,itemId=2000)=>({model:'GameCollectionsTraitModel',field:'CollectablesCollectedTime',itemId,expected,next});
const plan=(version,changes)=>({version,changes});
const guid=(id)=>[id,0,0,0].map(n=>n.toString(16).padStart(8,'0')).join(':');

test('existing Collection Key1 100ns int64 is modified in memory and exactly reparsed without exported bytes',()=>{
  const f=fixture(),source=f.slotBytes.slice();
  const x=dryRunNativeSlotTransaction(f.slotBytes,plan('3.0.1',[tick('1234567890','9007199254740993')]));
  assert.equal(x.changedFieldCount,1);assert.deepEqual(x.changedModels,['GameCollectionsTraitModel']);
  assert.equal(x.fields[0].itemId,2000);assert.equal(x.fields[0].next,'9007199254740993');
  assert.equal(x.readbackVerified,true);assert.equal(x.copiedAllUneditedTokenBytes,true);
  assert.equal(x.saveExported,false);assert.equal(x.writerEnabled,false);assert.equal(x.gameAccepted,false);
  for(const forbidden of ['encoded','raw','zip','bytes'])assert.ok(!(forbidden in x));
  assert.deepEqual(f.slotBytes,source);
});

test('independent Achievement, Counter and Collection typed CAS can share one in-memory transaction',()=>{
  const f=fixture(),source=f.slotBytes.slice(),c=[
    {model:'AchievementModel',guid:guid(1000),documentId:1,field:'CurrentValue',expected:1,next:5},
    {model:'GameCounterModel',guid:guid(1005),documentId:60,field:'CurrentValue',expected:1,next:5},
    tick(1234567890n,-1n),
  ];
  // Saved document IDs are derived from this known synthetic fixture only.
  const decoded=readSave(f.slotBytes);
  c[0].documentId=decoded.achievements.find(x=>x.guid===guid(1000)).id;
  c[1].documentId=decoded.counters.find(x=>x.guid===guid(1005)).id;
  const proof=dryRunNativeSlotTransaction(f.slotBytes,plan('3.0.1',c));
  assert.equal(proof.changedFieldCount,3);assert.deepEqual(proof.changedModels,
    ['AchievementModel','GameCollectionsTraitModel','GameCounterModel']);
  const changedCollection=proof.fields.find(x=>x.model==='GameCollectionsTraitModel');
  assert.equal(changedCollection.itemId,2000);assert.equal(changedCollection.next,'-1');
  assert.equal(proof.readbackVerified,true);assert.deepEqual(f.slotBytes,source);
});

test('Collection Key1 typed write supports zero and signed int64 extrema with exact decimal strings',()=>{
  const cases=['0','-9223372036854775808','9223372036854775807'];
  for(const value of cases){
    const f=fixture();const p=dryRunNativeSlotTransaction(f.slotBytes,plan('3.0.1',[tick('1234567890',value)]));
    assert.equal(p.fields[0].next,value);assert.equal(p.readbackVerified,true);
  }
});

test('Collection Key1 CAS rejects missing ItemId, old value mismatch, unsafe number, out-of-range and no-op',()=>{
  const f=fixture(),before=f.slotBytes.slice(),v='3.0.1';
  for(const edits of [
    [tick('1234567890','1',999)], [tick('1','2')], [tick(1234567890,'1')],
    [tick('1234567890',1234567890123456789)], [tick('1234567890','9223372036854775808')],
    [tick('1234567890','-9223372036854775809')], [tick('1234567890','1234567890')],
    [tick('1234567890','1'),tick('1234567890','2')],
    [{...tick('1234567890','2'),documentId:23}],
  ])assert.throws(()=>dryRunNativeSlotTransaction(f.slotBytes,plan(v,edits)));
  assert.deepEqual(f.slotBytes,before);
});

test('Collection Key1 write refuses unknown version and does not authorize reward/inventory side effects',()=>{
  const f=fixture('3.0.2'),old=f.slotBytes.slice();
  assert.throws(()=>dryRunNativeSlotTransaction(f.slotBytes,plan('3.0.2',[tick('1234567890','1')])));
  assert.equal(NATIVE_SLOT_WRITER_ENABLED,false);assert.equal(CROSS_STORE_WRITER_ENABLED,false);
  assert.deepEqual(f.slotBytes,old);
});

test('5164 signed-int64 collection entries across LZ4 blocks: two existing Key1 ticks change, all others remain exact',()=>{
  const records=new Map(Array.from({length:5164},(_,i)=>[i+1,638000000000000000n+BigInt(i)*137n]));
  records.set(-1,-1n);
  const f=fixture('3.0.1',records),original=f.slotBytes.slice(),before=readSave(original);
  assert.equal(before.collections.historyEntries,5165);
  const first=records.get(1).toString(),last=records.get(5164).toString();
  const res=dryRunNativeSlotTransaction(f.slotBytes,plan('3.0.1',[
    tick(first,'9007199254740993',1),tick(last,'-9223372036854775808',5164),tick('-1','0',-1)
  ]));
  assert.equal(res.changedFieldCount,3);assert.equal(res.copiedAllUneditedTokenBytes,true);
  assert.equal(res.readbackVerified,true);assert.ok(res.originalLz4Blocks>1);
  assert.deepEqual(f.slotBytes,original);
});
