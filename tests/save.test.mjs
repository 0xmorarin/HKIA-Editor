import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {MessagePackReader,lz4Decompress,readSave} from '../src/save.js';
import {parseAccount,changeAchievement,exportAccount,validateRecord} from '../src/account.js';
import {parseZip,extractSaveSet,repackSettingsZip} from '../src/zip.js';
import {deflateRawSync} from 'node:zlib';

const sampleGuid='a'.repeat(32);
function fakeAccount(){return {Achievements:{[sampleGuid]:{IsComplete:false,CurrentValue:5,CompletedTime:null}},Counters:{['b'.repeat(32)]:{CurrentValue:0,CountedValues:null,CountedGuids:[]}},OtherObject:{original:'unknown fields preserved'}};}
test('account changes preserve untouched data and nested unknown keys',()=>{
  const obj=parseAccount(JSON.stringify(fakeAccount()));
  changeAchievement(obj,sampleGuid,{IsComplete:true,CurrentValue:10,CompletedTime:'2026-11-11T08:09:10.1234567Z'});
  const encoded=exportAccount(obj);
  const dec=parseAccount(encoded);
  assert.equal(dec.Achievements[sampleGuid].CurrentValue,10);
  assert.equal(dec.Achievements[sampleGuid].CompletedTime,'2026-11-11T08:09:10.1234567Z');
  assert.equal(dec.OtherObject.original,'unknown fields preserved');
  assert.equal(dec.Counters['b'.repeat(32)].CurrentValue,0);
});
test('invalid dates / inconsistent completion state rejected',()=>{
  assert.throws(()=>validateRecord({IsComplete:true,CurrentValue:1,CompletedTime:null}));
  assert.throws(()=>validateRecord({IsComplete:false,CurrentValue:1,CompletedTime:'2026-11-11T01:00:00Z'}));
  assert.throws(()=>validateRecord({IsComplete:true,CurrentValue:0,CompletedTime:'2026-02-31T12:00:00Z'}));
  assert.throws(()=>validateRecord({IsComplete:true,CurrentValue:Infinity,CompletedTime:'2026-11-11T01:00:00Z'}));
});
test('LZ4 literals, overlaps and malformed offsets',()=>{
  assert.deepEqual([...lz4Decompress(Uint8Array.of(0x30,65,66,67),3)],[65,66,67]);
  assert.equal(new TextDecoder().decode(lz4Decompress(Uint8Array.of(0x32,65,66,67,3,0),9)),'ABCABCABC');
  assert.throws(()=>lz4Decompress(Uint8Array.of(0x00,0,0),4));
});
test('MessagePack arrays and 8-byte timestamps',()=>{
  const mp=Uint8Array.of(0x92,0xc3,0xd7,0xff,0,0,0,0,0,0,0,7);
  const r=new MessagePackReader(mp);const got=r.read();
  assert.equal(got[0],true);assert.equal(got[1].seconds,7);assert.equal(got[1].nanoseconds,0);
});
function crc32(bytes){let crc=-1;for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc&1)?(crc>>>1)^0xedb88320:crc>>>1;}return(crc^-1)>>>0;}
function u16(n){const b=Buffer.alloc(2);b.writeUInt16LE(n);return b;}
function u32(n){const b=Buffer.alloc(4);b.writeUInt32LE(n);return b;}
function makeZip(path,contents){
  const file=Buffer.from(contents);const name=Buffer.from(path);const zipped=deflateRawSync(file);
  const crc=crc32(file);const local=Buffer.concat([u32(0x04034b50),u16(20),u16(0),u16(8),u16(0),u16(0),u32(crc),u32(zipped.length),u32(file.length),u16(name.length),u16(0),name,zipped]);
  const central=Buffer.concat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(8),u16(0),u16(0),u32(crc),u32(zipped.length),u32(file.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(0),name]);
  const eocd=Buffer.concat([u32(0x06054b50),u16(0),u16(0),u16(1),u16(1),u32(central.length),u32(local.length),u16(0)]);
  return Buffer.concat([local,central,eocd]);
}
test('ZIP extracts account JSON without dependencies or remote services',async()=>{
  const raw=JSON.stringify(fakeAccount());const zip=makeZip('SettingsAccount/settings.json',raw);
  const parsed=parseZip(zip);assert.equal(parsed.entries.size,1);
  const saved=await extractSaveSet(zip);assert.equal(saved.save,null);assert.deepEqual(parseAccount(saved.account),JSON.parse(raw));
  const centralOffset=zip.readUInt32LE(zip.length-22+16);zip[centralOffset+16]^=1;await assert.rejects(()=>extractSaveSet(zip),/CRC32|CRC|サイズ/i);
});
test('optional private v3.0.1 fixture (not included in public package)',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const raw=readFileSync(process.env.HKIA_TEST_SAVE);const save=readSave(raw);
  assert.equal(save.version,'3.0.1');assert.equal(save.achievements.length,571);
  assert.equal(save.counters.length,586);
  assert.ok(save.achievements.every(x=>typeof x.complete==='boolean'));
  assert.ok(save.counters.every(x=>Number.isSafeInteger(x.countedGuids)&&x.countedGuids>=0));
  assert.ok(save.collections.historyEntries>0);
  assert.deepEqual({...save.collections,historyEntries:0},{historyEntries:0,deprecatedEntries:0,kind:'item-id-collected-ticks',editable:false});
  if(process.env.HKIA_EXPECT_COLLECTION_V301)assert.equal(save.collections.historyEntries,Number(process.env.HKIA_EXPECT_COLLECTION_V301));
});
test('optional private v3.0.0 fixture (not included in public package)',{skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const raw=readFileSync(process.env.HKIA_TEST_SAVE_V300);const save=readSave(raw);
  assert.equal(save.version,'3.0.0');assert.equal(save.achievements.length,570);assert.equal(save.counters.length,585);
  assert.ok(save.collections.historyEntries>0);
  if(process.env.HKIA_EXPECT_COLLECTION_V300)assert.equal(save.collections.historyEntries,Number(process.env.HKIA_EXPECT_COLLECTION_V300));
});

test('edited ZIP export retains every original member and alters only settings.json',{skip:!process.env.HKIA_TEST_ZIP},async()=>{
  const path=process.env.HKIA_TEST_ZIP;
  const input=new Uint8Array(readFileSync(path));
  const orig=parseZip(input);
  const oldAccount=parseAccount(await orig.extract('SettingsAccount/settings.json'));
  const key=Object.keys(oldAccount.Achievements)[0];
  const before=oldAccount.Achievements[key];
  changeAchievement(oldAccount,key,{IsComplete:!before.IsComplete,CurrentValue:before.CurrentValue+1,CompletedTime:before.IsComplete?null:'2026-11-11T08:30:00Z'});
  const edit=exportAccount(oldAccount);
  const output=await repackSettingsZip(input,edit);
  const rebuilt=parseZip(output);
  assert.deepEqual([...rebuilt.entries.keys()],[...orig.entries.keys()]);
  for(const name of orig.entries.keys()){
    const a=await orig.extract(name),b=await rebuilt.extract(name);
    if(name==='SettingsAccount/settings.json'){assert.deepEqual(b,edit);assert.notDeepEqual(a,b);}
    else assert.deepEqual(a,b,`Unrelated ZIP member changed: ${name}`);
  }
  // Deliberately verify the save-slot's original bytes, not only achievements.
  const origSlot=await orig.extract('Saves/save_0.save');
  const afterSlot=await rebuilt.extract('Saves/save_0.save');
  assert.deepEqual(origSlot,afterSlot);
  assert.equal(readSave(afterSlot).achievements.length,readSave(origSlot).achievements.length);
});
test('ZIP writer refuses malformed archives and preserves the input',async()=>{
  const txt=JSON.stringify(fakeAccount());const zipped=makeZip('SettingsAccount/settings.json',txt);
  const preserved=zipped.slice();
  const decoded=await repackSettingsZip(zipped, new TextEncoder().encode(txt+' '));
  assert.deepEqual(zipped,preserved);
  assert.equal(new TextDecoder().decode(await parseZip(decoded).extract('SettingsAccount/settings.json')),txt+' ');
  assert.throws(()=>parseZip(Uint8Array.of(1,2,3)));
  await assert.rejects(()=>repackSettingsZip(makeZip('other.file',txt),new TextEncoder().encode(txt)),/settings.json/);
});

// Reject malicious/ambiguous archives before writing a new ZIP.
test('ZIP parser rejects inconsistent central/local headers, unsafe flags and disk counts',()=>{
  const base=makeZip('SettingsAccount/settings.json',JSON.stringify(fakeAccount()));
  const end=base.length-22;
  const central=base.readUInt32LE(end+16);
  const corrupt=(at,value)=>{const b=Buffer.from(base);b[at]=value;return b;};
  assert.throws(()=>parseZip(corrupt(30,base[30]^1)),/ローカル名/);
  assert.throws(()=>parseZip(corrupt(8,0)),/中央.*ローカル情報/); // method differs from central
  assert.throws(()=>parseZip(corrupt(6,1)),/中央.*ローカル情報/); // flags differ
  assert.throws(()=>parseZip(corrupt(central+8,1)),/フラグ/); // encryption flag
  assert.throws(()=>parseZip(corrupt(end+6,1)),/ZIP分割/); // central disk nonzero
  assert.throws(()=>parseZip(corrupt(end+8,0)),/ZIP分割/); // disk entry count mismatch
  assert.throws(()=>parseZip(corrupt(central+42,255)),/ローカルヘッダー|境界/);
  assert.deepEqual([...parseZip(base).entries.keys()],['SettingsAccount/settings.json']);
});

test('v3.0.1 typed asset crosswalk has 31 exact Meta achievement/counter condition pairs',()=>{
  const p=JSON.parse(readFileSync(new URL('../data/achievement-definitions.json',import.meta.url)));
  assert.equal(p.length,31);
  const a=new Set(),c=new Set();let meta=0,slot=0;
  for(const r of p){
    assert.match(r.guid,/^[0-9a-f]{32}$/);assert.match(r.counter_guid,/^[0-9a-f]{32}$/);
    assert.ok(Number.isFinite(r.condition_threshold)&&r.condition_threshold>0);
    assert.ok(['Meta','InGame'].includes(r.counter_storage));
    assert.ok(['Internal','Mixed','PureExternal'].includes(r.achievement_type));
    assert.ok(r.counter_definition.endsWith(r.counter_kind));
    assert.equal(r.rewards_count,0);
    assert.ok(!a.has(r.guid)&&!c.has(r.counter_guid));a.add(r.guid);c.add(r.counter_guid);
    if(r.counter_storage==='Meta')meta++;else slot++;
  }
  assert.equal(meta,16);assert.equal(slot,15);
  const root=p.find(r=>r.key==='Local_RootAchievement');
  assert.equal(root.achievement_type,'Internal');assert.equal(root.counter_kind,'AchievementsCounter');
  assert.equal(root.built_in_references,63);
});

test('optional real Account: 16 Meta counter GUIDs resolve; 15 InGame do not appear in Account store',{skip:!process.env.HKIA_TEST_ZIP},async()=>{
  const zipped=parseZip(new Uint8Array(readFileSync(process.env.HKIA_TEST_ZIP)));
  const account=parseAccount(await zipped.extract('SettingsAccount/settings.json'));
  const defs=JSON.parse(readFileSync(new URL('../data/achievement-definitions.json',import.meta.url)));
  assert.equal(defs.filter(d=>d.guid in account.Achievements).length,31);
  assert.equal(defs.filter(d=>d.counter_storage==='Meta'&&d.counter_guid in account.Counters).length,16);
  assert.equal(defs.filter(d=>d.counter_storage==='InGame'&&d.counter_guid in account.Counters).length,0);
  assert.equal(defs.filter(d=>d.counter_storage==='Meta').length,16);
});

import {serializedGuidToSlotGuid,slotGuidToSerializedGuid} from '../src/guid.js';
const slotIndex=JSON.parse(readFileSync(new URL('../data/slot-definitions.json',import.meta.url)));
test('native Unity.Entities Hash128 nibble-little serialization is bijective',()=>{
  const source='bfacaabbffcbdb24896fbc56001423c2';
  const saved='bbaacafb:42bdbcff:65cbf698:2c324100';
  assert.equal(serializedGuidToSlotGuid(source),saved);
  assert.equal(slotGuidToSerializedGuid(saved),source);
  assert.equal(slotGuidToSerializedGuid(serializedGuidToSlotGuid('0123456789abcdef0123456789abcdef')),'0123456789abcdef0123456789abcdef');
  assert.throws(()=>serializedGuidToSlotGuid('not a guid'));
  assert.throws(()=>slotGuidToSerializedGuid('11:22:33'));
});
test('source counter index and achievement references have complete unique GUID crosswalks',()=>{
  assert.equal(slotIndex.schema,'HKIA.SlotDefinitionCrosswalk.1');
  assert.equal(slotIndex.counters.length,851);
  assert.equal(slotIndex.achievement_references.length,820);
  assert.equal(new Set(slotIndex.counters.map(x=>x.save_guid)).size,851);
  assert.equal(new Set(slotIndex.achievement_references.map(x=>x.save_guid)).size,820);
  const counterBySource=new Map(slotIndex.counters.map(x=>[x.guid,x]));
  assert.equal(slotIndex.counters.filter(x=>x.storage==='InGame').length,835);
  assert.equal(slotIndex.counters.filter(x=>x.storage==='Meta').length,16);
  const agg=slotIndex.counters.filter(x=>x.reference_count!=null);
  assert.equal(agg.length,64);
  for(const a of slotIndex.achievement_references){
    assert.equal(serializedGuidToSlotGuid(a.guid),a.save_guid);
    assert.equal(slotGuidToSerializedGuid(a.save_guid),a.guid);
    assert.ok(counterBySource.get(a.group_counter_guid)?.reference_count>=1);
  }
  for(const c of slotIndex.counters)assert.equal(serializedGuidToSlotGuid(c.guid),c.save_guid);
});
test('optional actual v3.0.1: all 571 achievements and 586 counters match definitions exactly', {skip:!process.env.HKIA_TEST_SAVE},()=>{
  const save=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const aIds=new Set(slotIndex.achievement_references.map(x=>x.save_guid));
  const cIds=new Set(slotIndex.counters.filter(x=>x.storage==='InGame').map(x=>x.save_guid));
  assert.equal(save.achievements.length,571);assert.equal(save.counters.length,586);
  assert.equal(save.achievements.filter(x=>aIds.has(x.guid)).length,571);
  assert.equal(save.counters.filter(x=>cIds.has(x.guid)).length,586);
});
test('optional actual v3.0.0: 570 achievements and 585 counters still match v3.0.1 source identities', {skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const save=readSave(readFileSync(process.env.HKIA_TEST_SAVE_V300));
  const aIds=new Set(slotIndex.achievement_references.map(x=>x.save_guid));
  const cIds=new Set(slotIndex.counters.filter(x=>x.storage==='InGame').map(x=>x.save_guid));
  assert.equal(save.achievements.filter(x=>aIds.has(x.guid)).length,570);
  assert.equal(save.counters.filter(x=>cIds.has(x.guid)).length,585);
});
test('optional v3.0.1 ZIP: all 15 InGame counter references of Meta achievements resolve to actual save documents', {skip:!process.env.HKIA_TEST_SAVE||!process.env.HKIA_TEST_ZIP},async()=>{
  const a=JSON.parse(readFileSync(new URL('../data/achievement-definitions.json',import.meta.url)));
  const save=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const savedByGuid=new Map(save.counters.map(x=>[x.guid,x]));
  const ingame=a.filter(x=>x.counter_storage==='InGame');
  assert.equal(ingame.length,15);
  const docs=ingame.map(x=>savedByGuid.get(serializedGuidToSlotGuid(x.counter_guid)));
  assert.equal(docs.filter(Boolean).length,15);
  assert.equal(new Set(docs.map(x=>x.id)).size,15);
});
test('optional v3.0.1 Puzzle cluster: live values reconcile without inventing formal achievement names',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const byCounter=new Map(slot.counters.map(x=>[x.guid,x]));
  const byAchievement=new Map(slot.achievements.map(x=>[x.guid,x]));
  const group=slotIndex.counters.find(x=>x.name==='collection_puzzle.GameCounterAchievementsDefinition');
  assert.ok(group);assert.equal(group.reference_count,5);
  const refs=slotIndex.achievement_references.filter(x=>x.group_counter_guid===group.guid);
  assert.equal(refs.length,5);
  assert.equal(refs.filter(x=>byAchievement.has(x.save_guid)).length,5);
  assert.equal(refs.filter(x=>byAchievement.get(x.save_guid).complete).length,4);
  assert.equal(byCounter.get(group.save_guid)?.current,4);
});

test('optional real v3.0.1: 54/54 saved achievement-group counters equal completed member count',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const achievementsByGuid=new Map(slot.achievements.map(x=>[x.guid,x]));
  const countersByGuid=new Map(slot.counters.map(x=>[x.guid,x]));
  const groups=slotIndex.counters.filter(x=>x.reference_count!==undefined);
  let checked=0;
  for(const group of groups){
    const counter=countersByGuid.get(group.save_guid);
    if(!counter)continue;
    const members=slotIndex.achievement_references.filter(x=>x.group_counter_guid===group.guid);
    const count=members.filter(x=>achievementsByGuid.get(x.save_guid)?.complete).length;
    assert.equal(counter.current,count,`Group mismatch: ${group.name}`);checked++;
  }
  assert.equal(checked,54);
});
test('optional real v3.0.0: 54/54 saved achievement-group counters equal completed member count',{skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE_V300));
  const achievementsByGuid=new Map(slot.achievements.map(x=>[x.guid,x]));
  const countersByGuid=new Map(slot.counters.map(x=>[x.guid,x]));
  const groups=slotIndex.counters.filter(x=>x.reference_count!==undefined);
  let checked=0;
  for(const group of groups){
    const counter=countersByGuid.get(group.save_guid);
    if(!counter)continue;
    const members=slotIndex.achievement_references.filter(x=>x.group_counter_guid===group.guid);
    assert.equal(counter.current,members.filter(x=>achievementsByGuid.get(x.save_guid)?.complete).length,group.name);checked++;
  }
  assert.equal(checked,54);
});

import {reconcileCollectionItemIds} from '../src/collection-progress.js';
const itemIndex=JSON.parse(readFileSync(new URL('../data/item-collection-crosswalk.json',import.meta.url)));
const collectionCatalog=JSON.parse(readFileSync(new URL('../data/collection-definitions.json',import.meta.url)));
test('Steam v3.0.1 item-to-collection source IDs are unique and have exact GUID/primary-key joins',()=>{
  assert.equal(itemIndex.schema,'HKIA.ItemCollectionCrosswalk.1');
  assert.equal(itemIndex.items.length,12163);
  assert.equal(itemIndex.counts.typed_collection_fields,10181);
  assert.equal(itemIndex.counts.paired_fallback,81);
  assert.equal(itemIndex.counts.unresolved,70);
  assert.equal(itemIndex.counts.mapped_to_collection,10262);
  assert.equal(new Set(itemIndex.items.map(x=>x.id)).size,12163);
  assert.equal(new Set(itemIndex.items.map(x=>x.guid)).size,12163);
  const groups=new Map(collectionCatalog.map(r=>[r.key,r]));
  assert.equal(groups.size,181);
  for(const item of itemIndex.items){
    if(item.collection_key)assert.equal(groups.get(item.collection_key)?.guid,item.collection_guid);
    else assert.ok(!item.collection_guid);
  }
});
test('source has grouping and gated DLC/event constraints; never equate direct ID counts with actual UI percent',()=>{
  assert.equal(collectionCatalog.length,181);
  assert.equal(collectionCatalog.filter(x=>x.group_items_by_parent).length,181);
  assert.equal(collectionCatalog.filter(x=>x.requires_group_dlc).length,39);
  assert.equal(new Set(collectionCatalog.filter(x=>x.requires_group_dlc).map(x=>x.group)).size,5);
  assert.deepEqual(collectionCatalog.filter(x=>x.event_source_defined).map(x=>[x.key,x.event_year]).sort(),[
    ['collection_events_hk50',2025],['collection_furniture_racing',3000]
  ]);
  assert.equal(itemIndex.not_authoritative_ui_percent,true);
});
test('pure collected-item reconciliation never infers absent saves or missing source definitions',()=>{
  const first=itemIndex.items.find(x=>x.collection_key);
  const none=itemIndex.items.find(x=>!x.collection_key);
  const result=reconcileCollectionItemIds(itemIndex,collectionCatalog,[first.id,none.id,4294967295]);
  assert.equal(result.kind,'direct-item-id-reconciliation');
  assert.equal(result.gameCompletionPercentVerified,false);
  assert.equal(result.mappedCount,1);
  assert.equal(result.unassigned.length,1);
  assert.deepEqual(result.unknown,[4294967295]);
  assert.equal(result.byKey.get(first.collection_key).recorded.length,1);
  assert.throws(()=>reconcileCollectionItemIds(itemIndex,collectionCatalog,[first.id,first.id]),/重複/);
});
test('optional v3.0.1: entire real collected-time history has exact known item identity and valid collection keys', {skip:!process.env.HKIA_TEST_SAVE},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const result=reconcileCollectionItemIds(itemIndex,collectionCatalog,slot.collectedItemIds);
  assert.equal(slot.collections.historyEntries,5164);
  assert.equal(slot.collectedItemIds.length,5164);
  assert.equal(result.unknown.length,0);
  assert.equal(result.unassigned.length,78);
  assert.equal(result.mappedCount,5086);
  const c=result.byKey.get('collection_citytown_figurines');
  assert.equal(c.items.length,129);assert.equal(c.recorded.length,129);
});
test('optional v3.0.0: entire real collected-time history still resolves to v3.0.1 source item IDs', {skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE_V300));
  const result=reconcileCollectionItemIds(itemIndex,collectionCatalog,slot.collectedItemIds);
  assert.equal(slot.collections.historyEntries,5046);
  assert.equal(result.unknown.length,0);
  assert.equal(result.unassigned.length,78);
  assert.equal(result.mappedCount,4968);
});

// Native ParentItem references are diagnostic only; do not equate saved history
// + source families with runtime UI completion, reward grants or DLC access.
import {reconcileParentFamilies} from '../src/collection-parent-progress.js';
const parentIndex=JSON.parse(readFileSync(new URL('../data/item-parent-crosswalk.json',import.meta.url)));
test('Unity parent PPtr index maps all 5170 children to 445 unique parents and explicitly audits 10 cross-category links',()=>{
  assert.equal(parentIndex.schema,'HKIA.ItemParentCrosswalk.1');
  assert.equal(parentIndex.links.length,5170);
  assert.equal(parentIndex.counts.unique_parents,445);
  const match=reconcileCollectionItemIds(itemIndex,collectionCatalog,[]);
  const p=reconcileParentFamilies(parentIndex,match);
  assert.equal(p.parentByChild.size,5170);
  assert.deepEqual(p.relationCounts,{'same-collection':5160,'cross-collection':9,'unassigned-child':1});
  assert.equal(p.cross.length,10);
  assert.equal(p.gameCompletionPercentVerified,false);
  assert.equal(p.kind,'source-parent-diagnostic');
  assert.equal(p.byKey.size,181);
  assert.ok([...p.byKey.values()].every(r=>r.familyRecorded===0&&r.familyTotal>=1));
  assert.ok([...p.byKey.values()].some(r=>r.familyTotal<r.families.size+1));
});
test('cross-collection parent does NOT move source item into the parent collection; corrupt relations are rejected',()=>{
  const match=reconcileCollectionItemIds(itemIndex,collectionCatalog,[]);
  const m=reconcileParentFamilies(parentIndex,match);
  const cross=m.cross.find(x=>x.relation==='cross-collection');
  assert.ok(cross);
  const child=match.byId.get(cross.child_id),parent=match.byId.get(cross.parent_id);
  assert.notEqual(child.collection_key,parent.collection_key);
  assert.ok(m.byKey.get(child.collection_key).families.has(child.id),'child stays in source collection');
  const copy={...parentIndex,links:[{...parentIndex.links[0],relation:'cross-collection'},...parentIndex.links.slice(1)]};
  assert.throws(()=>reconcileParentFamilies(copy,match),/所属分類/);
});
test('optional v3.0.1 parent source-family reconciliation is bounded, non-authoritative and includes City Town figurines',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const save=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const direct=reconcileCollectionItemIds(itemIndex,collectionCatalog,save.collectedItemIds);
  const result=reconcileParentFamilies(parentIndex,direct);
  assert.equal(result.gameCompletionPercentVerified,false);
  for(const [key,entry] of result.byKey){
    const actual=direct.byKey.get(key);
    assert.ok(entry.familyTotal<=actual.items.length);
    assert.ok(entry.familyRecorded<=entry.familyTotal);
    assert.ok(entry.familyRecorded<=actual.recorded.length);
  }
  const city=result.byKey.get('collection_citytown_figurines');
  assert.ok(city.familyTotal>0);
  assert.equal(city.familyRecorded,city.familyTotal);
});
test('optional v3.0.0 parent source-family reconciliation with v3.0.1 source definitions is bounded',{skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const save=readSave(readFileSync(process.env.HKIA_TEST_SAVE_V300));
  const result=reconcileParentFamilies(parentIndex,reconcileCollectionItemIds(itemIndex,collectionCatalog,save.collectedItemIds));
  assert.equal(result.byKey.size,181);
  assert.equal(result.gameCompletionPercentVerified,false);
});


// Local in-game achievement definitions, source-linked counters, and rewards.
const localIndex=JSON.parse(readFileSync(new URL('../data/local-achievement-definitions.json',import.meta.url)));
const slotDefs=JSON.parse(readFileSync(new URL('../data/slot-definitions.json',import.meta.url)));
test('source 820 LocalAchievementRuntimeData have unique matching GUIDs and resolvable condition counters',()=>{
  assert.equal(localIndex.schema,'HKIA.LocalAchievementIndex.1');
  assert.equal(localIndex.records.length,820);
  assert.equal(localIndex.counts.conditions,820);
  assert.equal(new Set(localIndex.records.map(r=>r.guid)).size,820);
  assert.deepEqual(new Set(localIndex.records.map(r=>r.guid)),new Set(slotDefs.achievement_references.map(r=>r.guid)));
  const byCounter=new Map(slotDefs.counters.map(x=>[x.guid,x]));
  for(const d of localIndex.records){
    assert.equal(d.title_table,300);assert.ok(/^\d+$/.test(d.title_string_id));
    assert.ok(Number.isFinite(d.threshold)&&d.threshold>0);
    const c=byCounter.get(d.counter_guid);
    assert.ok(c,d.key);assert.equal(c.storage,'InGame');assert.equal(c.save_guid,d.counter_save_guid);
  }
});
test('820 typed reward references: 264 with concrete item identities, 556 zero rewards',()=>{
  assert.equal(localIndex.counts.rewards_positive,264);
  assert.equal(localIndex.counts.rewards_zero,556);
  const ids=new Set(itemIndex.items.map(r=>r.id));
  for(const def of localIndex.records){
    if(def.reward_quantity>0){assert.ok(ids.has(def.reward_item_id),def.key);assert.ok(def.reward_item_name);}
    else {assert.equal(def.reward_item_id,null);assert.equal(def.reward_item_name,null);}
  }
  assert.equal(new Set(localIndex.records.filter(x=>x.reward_quantity>0).map(x=>x.reward_item_id)).size,77);
  assert.equal(localIndex.reward_grant_not_proven,true);
  assert.equal(localIndex.no_save_writer,true);
});
test('Puzzle family local names are internally identified, not conflated with localized Puzzle Goals',()=>{
  const keys=new Set(localIndex.records.map(x=>x.key));
  for(const key of ['collection_puzzle','collection_puzzle_CTDLC','collection_figmentpuzzles_CTDLC','achievement_puzzlesInTheStars'])assert.ok(keys.has(key));
  assert.equal(localIndex.title_not_localized,true);
});
test('optional v3.0.1 saved in-game achievement/counter GUIDs resolve to exact source local definitions', {skip:!process.env.HKIA_TEST_SAVE},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const ach=new Map(localIndex.records.map(r=>[r.save_guid,r]));
  const counters=new Set(slotDefs.counters.map(r=>r.save_guid));
  assert.equal(slot.achievements.length,571);assert.equal(slot.counters.length,586);
  for(const entry of slot.achievements)assert.ok(ach.has(entry.guid.toLowerCase()),entry.guid);
  for(const entry of slot.counters)assert.ok(counters.has(entry.guid.toLowerCase()),entry.guid);
});
test('optional v3.0.0 saved in-game achievement GUIDs resolve to v3.0.1 source catalog', {skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const slot=readSave(readFileSync(process.env.HKIA_TEST_SAVE_V300));
  const known=new Set(localIndex.records.map(r=>r.save_guid));
  assert.equal(slot.achievements.length,570);
  for(const entry of slot.achievements)assert.ok(known.has(entry.guid.toLowerCase()),entry.guid);
});

test('built-in group completion counts override misleading serialized threshold of 1',()=>{
  const d=localIndex.records.find(r=>r.key==='collection_puzzle');
  assert.ok(d);assert.equal(d.counter_kind,'GameCounterAchievementsDefinition');
  assert.equal(d.threshold,1);
  const c=slotDefs.counters.find(x=>x.guid===d.counter_guid);
  assert.equal(c.reference_count,5);
  assert.notEqual(c.reference_count,d.threshold);
});

// Game-sourced Babel string table 300, en/ja, with reference-ID provenance.
const localTexts=JSON.parse(readFileSync(new URL('../data/local-achievement-locales.json',import.meta.url)));
test('v3.0.1 Babel language crosswalk covers all 820 titles and 720 defined descriptions in both languages',()=>{
  assert.equal(localTexts.schema,'HKIA.LocalAchievementLocales.1');
  assert.equal(localTexts.version,'3.0.1');
  assert.equal(localTexts.records.length,820);
  assert.deepEqual(localTexts.counts,{records:820,en_titles:820,ja_titles:820,en_descriptions:720,ja_descriptions:720});
  const defs=new Map(localIndex.records.map(r=>[r.guid,r]));
  const texts=new Map(localTexts.records.map(r=>[r.guid,r]));
  assert.equal(texts.size,820);
  assert.deepEqual(new Set(texts.keys()),new Set(defs.keys()));
  for(const [guid,r] of texts){
    const source=defs.get(guid);assert.equal(r.key,source.key);
    for(const lang of ['en','ja']){
      assert.ok(r[lang].title.trim());
      assert.equal(r[lang].description===null,source.description_string_id==='0');
      if(r[lang].description!==null)assert.ok(r[lang].description.trim());
    }
  }
});
test('Puzzle Goals exact English/Japanese title and 5 dependent achievements resolve from source IDs',()=>{
  const puzzle=localTexts.records.find(r=>r.key==='collection_puzzle');
  assert.equal(puzzle.en.title,'Puzzle Goals');
  assert.equal(puzzle.ja.title,'達成しよう: パズル');
  const puzzleDef=localIndex.records.find(r=>r.guid===puzzle.guid);
  const counter=slotIndex.counters.find(c=>c.guid===puzzleDef.counter_guid);
  assert.equal(counter.reference_count,5);
  assert.equal(puzzleDef.threshold,1); // serialized condition is NOT the actual group completion value
  const children=slotIndex.achievement_references.filter(r=>r.group_counter_guid===counter.guid);
  assert.equal(children.length,5);
  const bySource=new Map(localIndex.records.map(r=>[r.guid,r]));
  assert.deepEqual(new Set(children.map(r=>bySource.get(r.guid)?.key)),new Set([
    'achievement_arrivalIntoRuins','achievement_entryLevelExpeditioner','achievement_ruinInvestigator',
    'achievement_masterOfTheRuins','achievement_puzzlesInTheStars'
  ]));
  const missing=localTexts.records.find(r=>r.key==='achievement_puzzlesInTheStars');
  assert.equal(missing.en.title,'Puzzles in the Stars');
  assert.equal(bySource.get(missing.guid).threshold,5);
  assert.equal(bySource.get(missing.guid).reward_quantity,3);
});
test('optional private v3.0.1 Puzzle Goals: four completed and one incomplete at progress 1/5', {skip:!process.env.HKIA_TEST_SAVE},()=>{
  const save=readSave(readFileSync(process.env.HKIA_TEST_SAVE));
  const bySave=new Map(save.achievements.map(r=>[r.guid,r]));
  const group=localIndex.records.find(r=>r.key==='collection_puzzle');
  const counter=slotIndex.counters.find(c=>c.guid===group.counter_guid);
  const members=slotIndex.achievement_references.filter(r=>r.group_counter_guid===counter.guid);
  assert.equal(members.length,5);
  const actual=members.map(m=>bySave.get(m.save_guid));
  assert.ok(actual.every(Boolean));assert.equal(actual.filter(x=>x.complete).length,4);
  const notDone=actual.filter(x=>!x.complete);
  assert.equal(notDone.length,1);
  assert.equal(notDone[0].guid,localIndex.records.find(x=>x.key==='achievement_puzzlesInTheStars').save_guid);
  assert.equal(notDone[0].current,1);
  const c=save.counters.find(r=>r.guid===counter.save_guid);
  assert.equal(c.current,4);
});

test('research-only literal LZ4 encoder handles size boundaries without a slot writer',async()=>{
  const {lz4EncodeLiteralOnly}=await import('../scripts/research/save-envelope-noop.mjs');
  for(const len of [1,14,15,16,269,270,271,4096,65536]){
    const original=Uint8Array.from({length:len},(_,i)=>(i*71+19)&255);
    assert.deepEqual(lz4Decompress(lz4EncodeLiteralOnly(original),len),original);
  }
  assert.throws(()=>lz4EncodeLiteralOnly(new Uint8Array(0)),/Empty/);
});

test('research-only full-envelope byte-identical no-op / literal-only recompression v3.0.0',{skip:!process.env.HKIA_TEST_SAVE_V300},async()=>{
  const {inspectNoopEnvelope}=await import('../scripts/research/save-envelope-noop.mjs');
  const source=new Uint8Array(readFileSync(process.env.HKIA_TEST_SAVE_V300));
  const before=Buffer.from(source);
  const state=inspectNoopEnvelope(source);
  assert.equal(state.version,'3.0.0');assert.equal(state.blocks,34);
  assert.equal(state.originalIdentityVerified,true);assert.equal(state.expandedPayloadIdentityVerified,true);
  assert.equal(state.writerEnabled,false);assert.equal(state.hardwareVerified,false);
  assert.deepEqual(Buffer.from(source),before);
});

test('research-only full-envelope byte-identical no-op / literal-only recompression v3.0.1',{skip:!process.env.HKIA_TEST_SAVE},async()=>{
  const {inspectNoopEnvelope}=await import('../scripts/research/save-envelope-noop.mjs');
  const source=new Uint8Array(readFileSync(process.env.HKIA_TEST_SAVE));
  const before=Buffer.from(source);
  const state=inspectNoopEnvelope(source);
  assert.equal(state.version,'3.0.1');assert.equal(state.blocks,34);
  assert.equal(state.originalIdentityVerified,true);assert.equal(state.expandedPayloadIdentityVerified,true);
  assert.equal(state.writerEnabled,false);assert.equal(state.hardwareVerified,false);
  assert.deepEqual(Buffer.from(source),before);
});

test('research-only envelope refuses corrupt prefix marker and truncated compressed data',{skip:!process.env.HKIA_TEST_SAVE},async()=>{
  const {inspectNoopEnvelope}=await import('../scripts/research/save-envelope-noop.mjs');
  const source=new Uint8Array(readFileSync(process.env.HKIA_TEST_SAVE));
  const copy=source.slice();copy[1018]^=0xff;
  assert.throws(()=>inspectNoopEnvelope(copy));
  const truncated=source.slice(0,source.length-3);
  assert.throws(()=>inspectNoopEnvelope(truncated));
});


test('read-only parser does not authenticate opaque prefix; slot writer must remain disabled',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const source=new Uint8Array(readFileSync(process.env.HKIA_TEST_SAVE));
  const copy=source.slice();copy[0]^=0x01;
  assert.notDeepEqual(copy,source);
  // The parser begins at the 32-byte marker and cannot verify the opaque prefix.
  // This is an explicit missing security/integrity gate, NOT a valid modified save.
  assert.equal(readSave(copy).version,'3.0.1');
});

// SaveGameV2 header is metadata, NOT an authenticated digest. Keep the 32-byte
// opaque prefix untrusted, and validate every typed field we can actually map.
import {inspectSaveGameV2Header} from '../src/save.js';
test('optional real v3.0.1 SaveGameV2 header: version/platform/ancestry and metadata',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const raw=readFileSync(process.env.HKIA_TEST_SAVE),h=inspectSaveGameV2Header(raw);
  assert.equal(h.applicationVersion,'3.0.1');assert.equal(h.applicationVersionInt,30001);
  assert.equal(h.platformType,9);assert.equal(h.platform,'Switch');
  assert.equal(h.headerBytes,1018);assert.equal(h.ancestorCount,40);assert.equal(h.metadataEntryCount,4);
  assert.equal(h.opaqueSignatureBytes,32);assert.equal(h.signatureVerified,false);assert.equal(h.integrityVerified,false);
  assert.deepEqual(readSave(raw).meta.header,h);
});
test('optional real v3.0.0 SaveGameV2 header rejects payload-version mismatch',{skip:!process.env.HKIA_TEST_SAVE_V300},()=>{
  const raw=readFileSync(process.env.HKIA_TEST_SAVE_V300);const h=inspectSaveGameV2Header(raw);
  assert.equal(h.applicationVersion,'3.0.0');assert.equal(h.applicationVersionInt,30000);
  assert.equal(h.platformType,9);assert.equal(h.headerBytes,1018);
  assert.deepEqual(readSave(raw).meta.header,h);
});
test('optional negative header: version, platform, metadata, ancestor and opaque signature',{skip:!process.env.HKIA_TEST_SAVE},()=>{
  const src=readFileSync(process.env.HKIA_TEST_SAVE);
  const changed=(i,v)=>{const x=Buffer.from(src);x[i]=v;return x;};
  const name=Buffer.from('3.0.1');const ver=src.indexOf(name,32);assert.ok(ver>32&&ver<1018);
  assert.throws(()=>readSave(changed(ver+4,0x32)),/バージョン番号|一致/);
  // Last two header tokens are a one-element array containing Switch=9.
  assert.deepEqual(src.subarray(1016,1018),Buffer.from([0x91,0x09]));
  assert.throws(()=>readSave(changed(1017,0x08)),/プラットフォーム/);
  const key=Buffer.from('NumMissionsComplete');const meta=src.indexOf(key,32);assert.ok(meta>32&&meta<1018);
  assert.deepEqual(src.subarray(meta+key.length,meta+key.length+3),Buffer.from([0x92,0xd2,0x00]));
  assert.throws(()=>readSave(changed(meta+key.length+1,0xc0)),/MetadataEntry/);
  const countArray=src.indexOf(Buffer.from([0xdc,0x00,0x28]),100); // array40, length encoding not guaranteed
  if(countArray>0&&countArray<1018)assert.throws(()=>readSave(changed(countArray+2,0x29)),/Ancestors|プラットフォーム|MessagePack/);
  // A changed byte within the first 32 bytes remains structurally readable:
  // this is a documented non-authentication limitation, not a successful native check.
  const flipped=changed(0,src[0]^1);const h=inspectSaveGameV2Header(flipped);
  assert.equal(h.signatureVerified,false);assert.equal(h.integrityVerified,false);
});

// External open-source editors confirm the same save envelope's narrow-edit
// strategy. This test is independent, offline, and produces NO modified save.
test('research-only AchievementModel boolean edit changes one decoded byte v3.0.1 and preserves all other records',{skip:!process.env.HKIA_TEST_SAVE},async()=>{
  const {probeAchievementFlagCodec}=await import('../scripts/research/save-envelope-noop.mjs');
  const original=new Uint8Array(readFileSync(process.env.HKIA_TEST_SAVE));
  const backup=Buffer.from(original);
  const save=readSave(original);
  const target=save.achievements.find(r=>!r.complete);
  assert.ok(target);
  const proof=probeAchievementFlagCodec(original,target.guid);
  assert.equal(proof.guid,target.guid);
  assert.equal(probeAchievementFlagCodec(original,target.guid.toUpperCase()).expandedDiffBytes,1);
  assert.equal(proof.flagBefore,false);assert.equal(proof.flagAfter,true);
  assert.equal(proof.expandedDiffBytes,1);assert.equal(proof.compressedBlockCount,34);
  assert.equal(proof.writerEnabled,false);assert.equal(proof.gameAccepted,false);
  assert.equal(proof.completionConsistencyVerified,false);
  assert.deepEqual(Buffer.from(original),backup);
});
test('research-only AchievementModel boolean edit validates existing v3.0.0 target',{skip:!process.env.HKIA_TEST_SAVE_V300},async()=>{
  const {probeAchievementFlagCodec}=await import('../scripts/research/save-envelope-noop.mjs');
  const raw=readFileSync(process.env.HKIA_TEST_SAVE_V300);
  const target=readSave(raw).achievements.find(r=>r.complete);
  assert.ok(target);
  const proof=probeAchievementFlagCodec(raw,target.guid);
  assert.equal(proof.flagBefore,true);assert.equal(proof.flagAfter,false);
  assert.equal(proof.expandedDiffBytes,1);assert.equal(proof.writerEnabled,false);
});
test('research-only AchievementModel boolean probe rejects nonexistent and malformed GUID',{skip:!process.env.HKIA_TEST_SAVE},async()=>{
  const {probeAchievementFlagCodec}=await import('../scripts/research/save-envelope-noop.mjs');
  const raw=readFileSync(process.env.HKIA_TEST_SAVE);
  assert.throws(()=>probeAchievementFlagCodec(raw,'bogus'),/GUID/);
  assert.throws(()=>probeAchievementFlagCodec(raw,'00000000:00000000:00000000:00000000'),/not an existing/);
});

test('research-only Puzzle Goals counter float32 patch preserves every other saved counter, achievement and collection',{skip:!process.env.HKIA_TEST_SAVE},async()=>{
  const {probeCounterFloatCodec}=await import('../scripts/research/save-envelope-noop.mjs');
  const raw=readFileSync(process.env.HKIA_TEST_SAVE);
  const counter=slotIndex.counters.find(c=>c.guid===localIndex.records.find(a=>a.key==='collection_puzzle').counter_guid);
  const save=readSave(raw),current=save.counters.find(c=>c.guid===counter.save_guid);
  assert.equal(current.current,4);
  const original=Buffer.from(raw);
  const probe=probeCounterFloatCodec(raw,counter.save_guid,5);
  assert.equal(probe.before,4);assert.equal(probe.after,5);
  assert.ok(probe.expandedDiffBytes>=1&&probe.expandedDiffBytes<=4);
  assert.equal(probe.gameAccepted,false);assert.equal(probe.writerEnabled,false);
  assert.equal(probe.completionConsistencyVerified,false);
  assert.deepEqual(raw,original);
});
test('research-only counter float32 probe rejects invalid values and GUIDs',{skip:!process.env.HKIA_TEST_SAVE},async()=>{
  const {probeCounterFloatCodec}=await import('../scripts/research/save-envelope-noop.mjs');
  const raw=readFileSync(process.env.HKIA_TEST_SAVE);
  const counter=readSave(raw).counters.find(c=>c.current===4);
  assert.ok(counter);
  assert.throws(()=>probeCounterFloatCodec(raw,'invalid',5),/GUID/);
  assert.throws(()=>probeCounterFloatCodec(raw,counter.guid,Infinity),/float32/);
  assert.throws(()=>probeCounterFloatCodec(raw,'00000000:00000000:00000000:00000000',5),/not in save/);
  assert.throws(()=>probeCounterFloatCodec(raw,counter.guid,counter.current),/unchanged/);
});

// v0.2.11: research-only two-store completion transaction: leaf + group + Meta root.
// The changed save bytes and edited Account clone are discarded, never exported.
test('research-only Puzzle Goals 8-field transaction and Account Meta root +1 across both real versions',{
  skip:!(process.env.HKIA_TEST_SAVE&&process.env.HKIA_TEST_SAVE_V300&&process.env.HKIA_TEST_ZIP&&process.env.HKIA_TEST_ZIP_V300)
},async()=>{
  const {probeAchievementFamilyTransaction}=await import('../scripts/research/achievement-family-transaction.mjs');
  const local=JSON.parse(readFileSync(new URL('../data/local-achievement-definitions.json',import.meta.url)));
  const defs=JSON.parse(readFileSync(new URL('../data/slot-definitions.json',import.meta.url)));
  const meta=JSON.parse(readFileSync(new URL('../data/achievement-definitions.json',import.meta.url)));
  for(const [path,zipPath,version] of [[process.env.HKIA_TEST_SAVE,process.env.HKIA_TEST_ZIP,'3.0.1'],[process.env.HKIA_TEST_SAVE_V300,process.env.HKIA_TEST_ZIP_V300,'3.0.0']]){
    const input=readFileSync(path),unchanged=Buffer.from(input);
    const accountBytes=(await extractSaveSet(readFileSync(zipPath))).account;
    const account=parseAccount(accountBytes),accountHash=JSON.stringify(account);
    const proof=probeAchievementFamilyTransaction(input,local,defs,meta,account,{
      leafKey:'achievement_puzzlesInTheStars',completedAt:'2026-11-11T00:00:00.0000000Z'
    });
    assert.equal(proof.version,version);
    assert.equal(proof.changes,8);
    assert.equal(proof.beforeGroup,4);assert.equal(proof.afterGroup,5);
    assert.equal(proof.rootMetaCounter.before,19);assert.equal(proof.rootMetaCounter.after,20);
    assert.equal(proof.rootMetaCounter.accountSimulationVerified,true);
    assert.equal(proof.originalExpandedBytes+18,proof.transactedExpandedBytes);
    for(const key of ['sourceBytesUnchanged','recompressedReadbackVerified','unrelatedRecordsVerified','unknownTokensPreserved'])assert.equal(proof[key],true);
    for(const key of ['saveExported','accountMutationPerformed','gameAccepted','writerEnabled','rewardsVerified','hardwareVerified'])assert.equal(proof[key],false);
    assert.deepEqual(input,unchanged);assert.equal(JSON.stringify(account),accountHash);
  }
});
test('research-only Puzzle completion transaction rejects invalid date, source/Account mismatch, and unrelated leaf',{
  skip:!(process.env.HKIA_TEST_SAVE&&process.env.HKIA_TEST_ZIP)
},async()=>{
  const {probeAchievementFamilyTransaction}=await import('../scripts/research/achievement-family-transaction.mjs');
  const input=readFileSync(process.env.HKIA_TEST_SAVE), local=JSON.parse(readFileSync(new URL('../data/local-achievement-definitions.json',import.meta.url)));
  const defs=JSON.parse(readFileSync(new URL('../data/slot-definitions.json',import.meta.url)));
  const meta=JSON.parse(readFileSync(new URL('../data/achievement-definitions.json',import.meta.url)));
  const account=parseAccount((await extractSaveSet(readFileSync(process.env.HKIA_TEST_ZIP))).account);
  const arg={leafKey:'achievement_puzzlesInTheStars',completedAt:'2026-11-11T00:00:00.0000000Z'};
  assert.throws(()=>probeAchievementFamilyTransaction(input,local,defs,meta,account,{...arg,completedAt:'2026-02-31T00:00:00.0000000Z'}),/timestamp|Invalid/i);
  assert.throws(()=>probeAchievementFamilyTransaction(input,local,defs,meta,account,{...arg,completedAt:'2026-11-11T00:00:00Z'}),/Timestamp/);
  assert.throws(()=>probeAchievementFamilyTransaction(input,local,defs,meta,account,{...arg,leafKey:'not_a_real_achievement'}),/Unknown leaf/);
  const altered=structuredClone(account);const root=meta.find(x=>x.key==='Local_RootAchievement');
  altered.Counters[root.counter_guid].CurrentValue=999;
  assert.throws(()=>probeAchievementFamilyTransaction(input,local,defs,meta,altered,arg),/Account root value/);
  const changed=structuredClone(defs);changed.achievement_references=changed.achievement_references.filter(x=>x.guid!=='0b44e1cdbc19fdd4d97add4ac9dc6140');
  assert.throws(()=>probeAchievementFamilyTransaction(input,local,changed,meta,account,arg),/Leaf group/);
});
