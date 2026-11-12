import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {MAGIC,readSave} from '../src/save.js';
import {lz4EncodeLiteralOnly} from '../scripts/research/save-envelope-noop.mjs';
import {buildCollectionReadModel} from '../src/collection-state-contract.js';
import {createCollectionHistoryDisplay} from '../src/collection-history-extension.js';

const combine=(...parts)=>{const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let pos=0;for(const p of parts){out.set(p,pos);pos+=p.length;}return out;};
const u16=n=>Uint8Array.of(n>>8&255,n&255);
const u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);
const uint=n=>combine(Uint8Array.of(0xce),u32(n));
const f32=n=>{const b=new Uint8Array(5);b[0]=0xca;new DataView(b.buffer).setFloat32(1,n,false);return b;};
const str=s=>{const b=new TextEncoder().encode(s);if(b.length>31)throw new Error('synthetic string too long');return combine(Uint8Array.of(0xa0|b.length),b);};
function msg(x){
  if(x===null)return Uint8Array.of(0xc0);
  if(typeof x==='string')return str(x);
  if(typeof x==='number')return x>=0&&x<128&&Number.isInteger(x)?Uint8Array.of(x):uint(x);
  if(typeof x==='bigint')return combine(Uint8Array.of(0xcf),Uint8Array.from({length:8},(_,i)=>Number(x>>BigInt((7-i)*8)&255n)));
  if(Array.isArray(x))return combine(x.length<16?Uint8Array.of(0x90|x.length):combine(Uint8Array.of(0xdc),u16(x.length)),...x.map(msg));
  if(x instanceof Map)return combine(x.size<16?Uint8Array.of(0x80|x.size):combine(Uint8Array.of(0xde),u16(x.size)),...[...x].flatMap(([k,v])=>[msg(k),msg(v)]));
  throw new Error('invalid synthetic token');
}
const synthetic=()=>{
  const first=638900000000000001n,second=639283917345487311n;
  const history=new Map([[2000000001,first],[2000000002,second]]);
  const top=[0,0,[[0,[0,0,'3.0.1']]],[39,[new Map(),history]]];
  const achievement=combine(msg([16,[10,1,2]]),uint(3),uint(4),Uint8Array.of(0x93,0xc2),f32(1),Uint8Array.of(0xc0));
  const counter=combine(msg([17,[20,5,6]]),uint(7),uint(8),Uint8Array.of(0x93),f32(2),Uint8Array.of(0xc0,0x90));
  const payload=combine(msg(top),achievement,counter);
  const compressed=lz4EncodeLiteralOnly(payload);
  const ext=combine(Uint8Array.of(0xc8),u16(3),Uint8Array.of(98,0xcd),u16(payload.length));
  const frame=combine(Uint8Array.of(0x92),ext,Uint8Array.of(0xc5),u16(compressed.length),compressed);
  const time=combine(Uint8Array.of(0xd6,0xff),u32(1750000000));
  const metadata=combine(Uint8Array.of(0x98),uint(0),uint(0),uint(0),uint(0),str('3.0.1'),uint(30001),combine(Uint8Array.of(0x92),time,Uint8Array.of(0)),Uint8Array.of(0),msg(new Map()),msg([]),msg([9]));
  return {raw:combine(new Uint8Array(32),metadata,MAGIC,frame),first,second};
};
const source=name=>JSON.parse(readFileSync(new URL('../data/'+name+'.json',import.meta.url),'utf8'));

test('readSave exposes original int64 collection ticks exactly without mutating the native slot',()=>{
  const {raw,first,second}=synthetic(),before=raw.slice(),out=readSave(raw);
  assert.equal(out.collections.historyEntries,2);
  assert.deepEqual(out.collectedItemIds,[2000000001,2000000002]);
  assert.deepEqual(out.collectionHistoryEntries,[[2000000001,first.toString()],[2000000002,second.toString()]]);
  assert.ok(Object.isFrozen(out.collectionHistoryEntries));
  assert.ok(out.collectionHistoryEntries.every(Object.isFrozen));
  assert.deepEqual(raw,before);
});

test('collection read model and unknown ItemId UI contract consume lossless ticks without inferring UTC',()=>{
  const {raw,second}=synthetic(),save=readSave(raw);
  const model=buildCollectionReadModel({itemManifest:source('item-collection-crosswalk'),definitions:source('collection-definitions'),parentManifest:source('item-parent-crosswalk'),collectedItemIds:save.collectedItemIds,historyEntries:save.collectionHistoryEntries,saveVersion:save.version});
  assert.equal(model.getItem(2000000002).historyTicks,second.toString());
  assert.equal(model.getItem(2000000002).historyTimeKnown,true);
  const view=createCollectionHistoryDisplay({model,recordedItemIds:save.collectedItemIds,rawHistoryEntries:save.collectionHistoryEntries});
  assert.equal(view.getRecordedRow(2000000002).timestamp.rawTicks,second.toString());
  assert.equal(view.getRecordedRow(2000000002).timestamp.dateTimeKind,'UNKNOWN');
  assert.equal(view.getRecordedRow(2000000002).timestamp.utcVerified,false);
  assert.equal(view.getRecordedRow(2000000002).editable,false);
  assert.equal(model.writerEnabled,false);
});
