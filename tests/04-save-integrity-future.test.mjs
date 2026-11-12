import test from 'node:test';
import assert from 'node:assert/strict';
import {MAGIC,MessagePackReader,readSave,readSaveStructurally,inspectSaveGameV2Header} from '../src/save.js';
import {readSlotForDisplay} from '../src/structural-ui-adapter.js';
import {lz4EncodeLiteralOnly} from '../scripts/research/save-envelope-noop.mjs';
import {auditNativeSlotNoop,dryRunNativeSlotTransaction,NATIVE_SLOT_WRITER_ENABLED} from '../scripts/research/save-transaction-engine.mjs';
import {compareV2FormatPrefix,CROSS_STORE_WRITER_ENABLED} from '../scripts/research/save-cross-store-dry-run.mjs';

                                                                            
const join=(...parts)=>{const out=new Uint8Array(parts.reduce((n,b)=>n+b.length,0));let p=0;for(const b of parts){out.set(b,p);p+=b.length;}return out;};
const u16=n=>Uint8Array.of((n>>>8)&255,n&255);
const u32=n=>Uint8Array.of((n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255);
const uint=n=>join(Uint8Array.of(0xce),u32(n));
const sint=n=>join(Uint8Array.of(0xd2),u32(n));
const int64=n=>{const b=new Uint8Array(9);b[0]=0xd3;new DataView(b.buffer).setBigInt64(1,n,false);return b;};
const fl=n=>{const b=new Uint8Array(5);b[0]=0xca;new DataView(b.buffer).setFloat32(1,n,false);return b;};
const txt=s=>{const b=new TextEncoder().encode(s);if(b.length>31)throw Error('too long synthetic string');return join(Uint8Array.of(0xa0|b.length),b);};
const arr=(...members)=>join(Uint8Array.of(0x90|members.length),...members);
const mpMap=(...entries)=>join(entries.length<16?Uint8Array.of(0x80|entries.length):join(Uint8Array.of(0xde),u16(entries.length)),...entries.flat());
const bool=b=>Uint8Array.of(b?0xc3:0xc2);
const nil=Uint8Array.of(0xc0);
const timestamp=join(Uint8Array.of(0xd6,0xff),u32(1750000000));
const guidA='00000001:00000002:00000003:00000004';
const guidC='00000005:00000006:00000007:00000008';
const rawTickCases=[-(1n<<63n),-1n,0n,9007199254740993n,(1n<<63n)-1n];
const entries=rawTickCases.map((ticks,i)=>[uint(i+1),int64(ticks)]);
function fixture({version='3.0.1',historyEntries=entries,achievementExtra=[],counterExtra=[],unknownTail=true,unknownMap=null,signature=null,collectionOverride=null,achievementFieldsOverride=null,counterFieldsOverride=null,counterGuidTail=[],extraTop=[]}={}){
  const history=mpMap(...historyEntries);
  const key0=mpMap([arr(uint(9),uint(8),uint(7),uint(6)),int64(123456789n)]);
  const collection=collectionOverride??arr(uint(39),arr(key0,history));
  const root=arr(uint(0),uint(0),arr(arr(uint(0),arr(uint(0),uint(0),txt(version)))),collection);
  const achievement=join(arr(uint(16),arr(uint(10),uint(1),uint(2))),uint(3),uint(4),achievementFieldsOverride??arr(bool(false),fl(1),nil,...achievementExtra));
  const counter=join(arr(uint(17),arr(uint(20),uint(5),uint(6))),uint(7),uint(8),counterFieldsOverride??arr(fl(1),nil,arr(),...counterExtra),...counterGuidTail);
  const other=unknownMap??mpMap([txt('opaque'),arr(uint(777),int64(-12n))]);
  const extra=unknownTail?arr(uint(44),arr(uint(99),other)):new Uint8Array();
  const payload=join(root,achievement,...extraTop,counter,extra);
  const chunks=[];for(let i=0;i<payload.length;i+=32768)chunks.push(payload.subarray(i,i+32768));
  const body=join(Uint8Array.of(0x90|(chunks.length+1),0xc8),u16(chunks.length*3),Uint8Array.of(98),
    ...chunks.map(x=>join(Uint8Array.of(0xcd),u16(x.length))),
    ...chunks.map(x=>{const compressed=lz4EncodeLiteralOnly(x);return join(Uint8Array.of(0xc5),u16(compressed.length),compressed);}));
  const components=version.split('.').map(Number);
  const meta=join(arr(uint(0),uint(0),uint(0),uint(0),txt(version),uint(components[0]*10000+components[1]*100+components[2]),arr(timestamp,uint(0)),uint(0)),mpMap(),arr(),arr(uint(9)));
  const raw=join(signature??Uint8Array.from({length:32},(_,i)=>i),meta,MAGIC,body);
  return {raw,payload};
}
const plan=()=>({version:'3.0.1',changes:[
  {model:'AchievementModel',guid:guidA,documentId:10,field:'CurrentValue',expected:1,next:5},
  {model:'GameCounterModel',guid:guidC,documentId:20,field:'CurrentValue',expected:1,next:5}
]});

test('Collection Key1: entire signed int64 span incl >2^53, negative and zero survives read/noop/reparse',()=>{
 const f=fixture(),original=f.raw.slice(),s=readSave(f.raw);
 assert.equal(s.collectionHistoryEntries.length,rawTickCases.length);
 assert.deepEqual(s.collectionHistoryEntries.map(([id,v])=>[id,v]),rawTickCases.map((v,i)=>[i+1,v.toString()]));
 assert.equal(s.collections.historyEntries,5);assert.equal(s.collections.deprecatedEntries,1);
 const noop=auditNativeSlotNoop(f.raw);assert.equal(noop.originalFrameByteIdentical,true);
 const proof=dryRunNativeSlotTransaction(f.raw,plan());assert.equal(proof.changedFieldCount,2);
 assert.equal(proof.copiedAllUneditedTokenBytes,true);assert.equal(proof.readbackVerified,true);
 assert.deepEqual(f.raw,original);
});

test('Duplicate Collection Key1 semantic Map keys encoded differently are rejected before last-key-wins',()=>{
 const duplicate=[...entries.slice(0,1),[sint(1),int64(555n)]];
 const {raw}=fixture({historyEntries:duplicate});
 assert.throws(()=>readSave(raw),/Duplicate MessagePack map key/);
 assert.throws(()=>auditNativeSlotNoop(raw),/Duplicate MessagePack map key/);
 assert.throws(()=>dryRunNativeSlotTransaction(raw,plan()),/Duplicate MessagePack map key/);
});

test('Duplicate unknown opaque Map and array-shaped Hash128 key refuse native read, not silently normalized',()=>{
 const custom=mpMap([txt('different'),uint(1)],[txt('different'),uint(2)]);
 assert.throws(()=>readSave(fixture({unknownMap:custom}).raw),/Duplicate MessagePack map key/);
 const key=arr(uint(1),uint(2),uint(3),uint(4));
 const badKey0=mpMap([key,int64(1n)],[key,int64(2n)]);
 assert.throws(()=>new MessagePackReader(badKey0).read(),/Duplicate MessagePack map key/);
});

test('known-version ambiguous native map decodes only via warning-labeled structural read, while strict writer fails closed',()=>{
  const other=mpMap([txt('opaque'),uint(1)],[txt('opaque'),uint(2)]);
  const source=fixture({unknownMap:other}).raw;
  assert.throws(()=>readSave(source),/Duplicate MessagePack map key/);
  const structural=readSaveStructurally(source);
  assert.ok(structural.nativeMapIdentityUnverifiedCount>0);
  assert.equal(structural.nativeExportAuthorized,false);
  assert.equal('raw' in structural,false);
  const display=readSlotForDisplay(source);
  assert.equal(display.evidence.mode,'STRUCTURAL_READ_ONLY');
  assert.equal(display.evidence.accountExportAllowed,false);
  assert.equal(display.evidence.writerEnabled,false);
  assert.ok(display.evidence.warnings.includes('NATIVE_MAP_IDENTITY_UNVERIFIED_READ_ONLY'));
  assert.throws(()=>dryRunNativeSlotTransaction(source,plan()),/Duplicate MessagePack map key/);
  const dupHistory=fixture({historyEntries:[entries[0],[sint(1),int64(555n)]]}).raw;
  const historyDisplay=readSlotForDisplay(dupHistory);
  assert.equal(historyDisplay.evidence.mode,'STRUCTURAL_READ_ONLY');
  assert.equal(historyDisplay.evidence.readable['collection-history'],false);
  assert.equal(historyDisplay.save.collectionHistoryEntries.length,0);
});

test('Structural map preserves all ordered pairs and rejects ambiguous Collection ancestors',()=>{
 const key=txt('same'), first=arr(uint(39),arr(mpMap(),mpMap([uint(1),int64(111n)]))), second=arr(uint(39),arr(mpMap(),mpMap([uint(2),int64(222n)])));
 const pairMap=mpMap([key,first],[key,second]);
 const reader=new MessagePackReader(pairMap,{allowDuplicateMapKeys:true});const parsed=reader.read();
 assert.equal(parsed.nativeMapPairs.length,2);assert.equal(parsed.nativeDuplicateKeys,1);assert.equal(parsed.nativeMapPairs[0][1][1][1].get(1),111);assert.equal(parsed.nativeMapPairs[1][1][1][1].get(2),222);
 for(const collectionOverride of [pairMap,mpMap([key,first],[key,uint(0)]),mpMap([key,uint(0)],[key,first]),mpMap([key,uint(0)],[key,uint(1)],[txt('other'),arr(first)])]){
   const {raw}=fixture({collectionOverride});assert.throws(()=>readSave(raw),/Duplicate MessagePack map key/);
   const structural=readSaveStructurally(raw);assert.equal(structural.readable['collection-history'],false);assert.equal(structural.collectionHistoryCount,null);assert.equal(structural.collectionHistoryEntries.length,0);assert.equal(structural.writerEnabled,false);
 }
 const valid=readSaveStructurally(fixture({collectionOverride:mpMap([key,first])}).raw);assert.equal(valid.readable['collection-history'],true);assert.deepEqual(valid.collectionHistoryEntries,[[1,'111']]);
});

test('Duplicate metadata Map rejects at parser boundary; valid unusual token tags retained in no-op',()=>{
 const dup=mpMap([txt('k'),uint(3)],[txt('k'),uint(4)]);
 assert.throws(()=>new MessagePackReader(dup).read(),/Duplicate MessagePack map key/);
 const {raw}=fixture();const status=inspectSaveGameV2Header(raw);
 assert.equal(status.applicationVersion,'3.0.1');
 assert.equal(auditNativeSlotNoop(raw).unknownTokenBytesPreserved,true);
});

test('Future version shape read uses separate byte-free adapter; default read and writer remain blocked',()=>{
 const f=fixture({version:'3.0.2',achievementExtra:[uint(424242)],counterExtra:[mpMap([txt('new'),bool(true)])]});
 assert.throws(()=>readSave(f.raw),/未検証の保存バージョン/);
 assert.throws(()=>dryRunNativeSlotTransaction(f.raw,{...plan(),version:'3.0.2'}),/未検証の保存バージョン/);
 const s=readSaveStructurally(f.raw);assert.equal(s.state,'UNKNOWN_VERSION_STRUCTURAL');
 assert.equal(s.versionKnown,false);assert.deepEqual(s.extraFields,{achievement:1,counter:1});
 assert.equal(s.achievements.length,1);assert.equal(s.counters.length,1);
 assert.equal(s.unknownUnionTokens,1);assert.equal(s.collectionHistoryEntries[4][1],rawTickCases[4].toString());
 assert.equal(s.nativeExportAuthorized,false);assert.equal(s.writerEnabled,false);
 assert.equal('raw' in s,false);assert.equal(Object.isFrozen(s.achievements),true);
 assert.equal(readSaveStructurally(f.raw).unknownFieldSchemaVerified,false);
});

test('Read-only structural adapter rejects differing envelope vs inner version and malformed metadata',()=>{
 const f=fixture({version:'3.0.2'});const altered=f.raw.slice();
                                                                                             
 const v=new TextEncoder().encode('3.0.2'),loc=Buffer.from(altered).indexOf(v);assert.ok(loc>32);
 altered[loc+4]='1'.charCodeAt(0);
 assert.throws(()=>readSaveStructurally(altered),/バージョン番号が一致|バージョンが一致/);
 const bad=f.raw.slice();bad[32]=0xc0;assert.throws(()=>readSaveStructurally(bad));
});

test('Known version with appended field is structural read-only, normal reader and change engine refuse',()=>{
 const f=fixture({achievementExtra:[int64((1n<<63n)-1n)]});
 assert.throws(()=>readSave(f.raw),/モデル構造/);
 const s=readSaveStructurally(f.raw);assert.equal(s.versionKnown,true);assert.equal(s.extraFields.achievement,1);
 assert.throws(()=>dryRunNativeSlotTransaction(f.raw,plan()),/モデル構造/);
});

test('CAS failure aborts before export and original opaque tokens and input remain byte-exact',()=>{
 const f=fixture(),old=f.raw.slice(),p=plan();p.changes[1].expected=2;
 assert.throws(()=>dryRunNativeSlotTransaction(f.raw,p),/CAS failed/);
 assert.deepEqual(f.raw,old);assert.equal(NATIVE_SLOT_WRITER_ENABLED,false);assert.equal(CROSS_STORE_WRITER_ENABLED,false);
 const ok=dryRunNativeSlotTransaction(f.raw,plan());
 assert.equal(ok.saveExported,false);assert.equal(ok.requiresCrossStoreAtomicityGate,true);
 assert.ok(!Object.keys(ok).some(k=>k==='raw'||k==='bytes'||k==='zip'||k==='encoded'));
});

test('opaque signature comparison distinguishes fixed marker check from unknown authentication',()=>{
 const sig=Uint8Array.from({length:32},(_,i)=>i);const f=fixture({signature:sig});
 const good=compareV2FormatPrefix(f.raw,sig);assert.equal(good.formatSignatureMatch,true);
 const changed=f.raw.slice();changed[0]^=0xff;
 assert.equal(compareV2FormatPrefix(changed,sig).formatSignatureMatch,false);
 assert.equal(good.integrityVerified,false);
 assert.equal(readSaveStructurally(changed).integrityVerified,false);
});

test('malformed negative map shapes fail closed without changing original bytes',()=>{
 const f=fixture(),bad=f.raw.slice();bad[32]=0x00;
 assert.throws(()=>readSaveStructurally(bad));assert.deepEqual(f.raw,fixture().raw);
 const malformed=Uint8Array.of(0x81,0xa1,0x78);assert.throws(()=>new MessagePackReader(malformed).read());
 const noSignedNaN=join(Uint8Array.of(0x81,0xcb),Uint8Array.of(0x7f,0xf8,0,0,0,0,0,0),Uint8Array.of(0x01));
 assert.throws(()=>new MessagePackReader(noSignedNaN).read(),/NaN/);
});

test('03 RELATED: nonempty CountedGuids and legacy CountedValues refuse scalar-only dry-run without output',()=>{
 const guidList=fixture({counterFieldsOverride:arr(fl(1),nil,arr(uint(123))),counterGuidTail:[uint(0),uint(0),uint(0)]});
 const baseline=guidList.raw.slice();
 assert.equal(readSave(guidList.raw).counters[0].countedGuids,1);
 assert.throws(()=>dryRunNativeSlotTransaction(guidList.raw,plan()),/RELATED counted collection state/);
 assert.deepEqual(guidList.raw,baseline);
 const legacy=fixture({counterFieldsOverride:arr(fl(1),arr(txt('123')),arr())});
 assert.throws(()=>dryRunNativeSlotTransaction(legacy.raw,plan()),/RELATED counted collection state/);
 assert.equal(readSave(legacy.raw).counters[0].countedValues[0],'123');
});

test('future structurally partial: malformed collection trait stays unavailable while achievements/counter remain readable',()=>{
 const f=fixture({version:'3.0.2',collectionOverride:arr(uint(39),arr(uint(5),uint(6)))});
 const s=readSaveStructurally(f.raw);
 assert.deepEqual(s.readable,{achievement:true,counter:true,'collection-history':false});
 assert.equal(s.collectionHistoryCount,null);assert.equal(s.collectionHistoryEntries.length,0);
 assert.equal(s.achievements.length,1);assert.equal(s.counters.length,1);
 assert.equal(s.writerEnabled,false);
});

test('future structurally partial: unexpected known union prefix is not converted to a made-up achievement',()=>{
 const f=fixture({version:'3.0.2',achievementFieldsOverride:arr(uint(2),fl(1),nil)});
 const s=readSaveStructurally(f.raw);
 assert.equal(s.readable.achievement,false);assert.equal(s.achievements.length,0);
 assert.equal(s.readable.counter,true);assert.equal(s.readable['collection-history'],true);
 assert.equal(s.nativeExportAuthorized,false);
});

test('conservative future read rejects unrecognized all-domain structure rather than claiming success',()=>{
 const f=fixture({version:'3.0.2',collectionOverride:arr(uint(39),arr(uint(5),uint(6))),achievementFieldsOverride:arr(uint(2),fl(1),nil),counterFieldsOverride:arr(bool(true),nil,arr())});
 assert.throws(()=>readSaveStructurally(f.raw),/No independently recognized native save domains/);
});

test('5164-element Key1 Map stress: exact int64 history/no-op/transaction preserve all data',()=>{
 const big=Array.from({length:5164},(_,i)=>[uint(i+1),int64(638000000000000000n+BigInt(i)*137n)]);
 const f=fixture({historyEntries:big});
 const before=f.raw.slice();
 const loaded=readSave(f.raw);
 assert.equal(loaded.collections.historyEntries,5164);
 assert.equal(loaded.collectionHistoryEntries[5163][1],String(638000000000000000n+5163n*137n));
 const no=auditNativeSlotNoop(f.raw);assert.equal(no.originalFrameByteIdentical,true);
 const tx=dryRunNativeSlotTransaction(f.raw,plan());assert.equal(tx.readbackVerified,true);
 assert.deepEqual(f.raw,before);
 const ambiguous=big.map(x=>x.slice());ambiguous.push([sint(5164),int64(7n)]);
 assert.throws(()=>readSave(fixture({historyEntries:ambiguous}).raw),/Duplicate MessagePack map key/);
});


test('Document identity: duplicate Achievement GUID with distinct document IDs is rejected',()=>{
 const another=join(arr(uint(16),arr(uint(11),uint(1),uint(2))),uint(3),uint(4),arr(bool(false),fl(1),nil));
 const f=fixture({extraTop:[another]}),baseline=f.raw.slice();
 assert.throws(()=>readSave(f.raw),/AchievementModel.*不正/);
 assert.throws(()=>dryRunNativeSlotTransaction(f.raw,plan()),/AchievementModel.*不正/);
 const structural=readSaveStructurally(f.raw);
 assert.equal(structural.readable.achievement,false);assert.equal(structural.achievements.length,0);
 assert.equal(structural.readable.counter,true);assert.deepEqual(f.raw,baseline);
});

test('Document identity: duplicate Achievement document ID with different GUID is rejected',()=>{
 const another=join(arr(uint(16),arr(uint(10),uint(11),uint(22))),uint(33),uint(44),arr(bool(false),fl(1),nil));
 const f=fixture({extraTop:[another]});
 assert.throws(()=>readSave(f.raw),/AchievementModel.*不正/);
 const structural=readSaveStructurally(f.raw);
 assert.equal(structural.readable.achievement,false);
});

test('Document identity: duplicate Counter GUID with distinct document IDs is rejected',()=>{
 const another=join(arr(uint(17),arr(uint(21),uint(5),uint(6))),uint(7),uint(8),arr(fl(1),nil,arr()));
 const f=fixture({extraTop:[another]});
 assert.throws(()=>readSave(f.raw),/GameCounterModel.*不正/);
 assert.throws(()=>dryRunNativeSlotTransaction(f.raw,plan()),/GameCounterModel.*不正/);
 const structural=readSaveStructurally(f.raw);
 assert.equal(structural.readable.counter,false);assert.equal(structural.counters.length,0);
 assert.equal(structural.readable.achievement,true);
});
