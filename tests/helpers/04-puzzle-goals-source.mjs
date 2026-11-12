/* Existing 04 synthetic fixture extracted for independent Writer-gate tests. No private data. */
import assert from 'node:assert/strict';
import {MAGIC,readSave} from '../../src/save.js';
import {lz4EncodeLiteralOnly} from '../../scripts/research/save-envelope-noop.mjs';
const cat=(...p)=>{const b=new Uint8Array(p.reduce((a,x)=>a+x.length,0));let i=0;for(const x of p){b.set(x,i);i+=x.length;}return b;};
const u16=n=>Uint8Array.of(n>>8&255,n&255),u32=n=>Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);
const u32tok=n=>cat(Uint8Array.of(0xce),u32(n));
const f32=n=>{const b=new Uint8Array(5);b[0]=0xca;new DataView(b.buffer).setFloat32(1,n,false);return b;};
const srcGuid=n=>n.toString(16).padStart(32,'0');
const saveGuid=n=>[n,0,0,0].map(x=>x.toString(16).padStart(8,'0')).join(':');
const str=x=>{const b=new TextEncoder().encode(x);return b.length<32?cat(Uint8Array.of(0xa0|b.length),b):cat(Uint8Array.of(0xd9,b.length),b);};
function mp(x){
  if(x===null)return Uint8Array.of(0xc0);if(typeof x==='boolean')return Uint8Array.of(x?0xc3:0xc2);
  if(typeof x==='string')return str(x);
  if(typeof x==='bigint')return cat(Uint8Array.of(x<0n?0xd3:0xcf),Uint8Array.from({length:8},(_,i)=>Number(x>>BigInt((7-i)*8)&255n))); 
  if(typeof x==='number')return Number.isSafeInteger(x)&&x>=0&&x<128?Uint8Array.of(x):x<0?cat(Uint8Array.of(0xd2),u32(x)):u32tok(x);
  if(Array.isArray(x)){const count=x.length;return cat(count<16?Uint8Array.of(0x90|count):cat(Uint8Array.of(0xdc),u16(count)),...x.map(mp));}
  if(x instanceof Map){const count=x.size;return cat(count<16?Uint8Array.of(0x80|count):cat(Uint8Array.of(0xde),u16(count)),...[...x].flatMap(([k,v])=>[mp(k),mp(v)]));}
  throw Error('Unsupported synthetic token');
}
const ts=cat(Uint8Array.of(0xd6,0xff),u32(1750000000));
export function fixture(version='3.0.1',collectionItems=new Map([[2000,1234567890n]])){
  const leafSource=1000,parentSource=2000,rootSource=4000,rootCounter=4001,groupCounter=2001;
  const leaf={key:'achievement_puzzlesInTheStars',guid:srcGuid(leafSource),save_guid:saveGuid(leafSource),counter_guid:srcGuid(1005),counter_save_guid:saveGuid(1005),counter_kind:'GameCounterManualDefinition',threshold:5};
  const parent={key:'collection_puzzle',guid:srcGuid(parentSource),save_guid:saveGuid(parentSource),counter_guid:srcGuid(groupCounter),counter_save_guid:saveGuid(groupCounter),counter_kind:'GameCounterAchievementsDefinition'};
  const siblings=Array.from({length:4},(_,j)=>1001+j),rootSiblings=Array.from({length:62},(_,j)=>3000+j);
  const refs=[...[leafSource,...siblings].map(n=>({guid:srcGuid(n),save_guid:saveGuid(n),group_counter_guid:srcGuid(groupCounter)})),
    ...[parentSource,...rootSiblings].map(n=>({guid:srcGuid(n),save_guid:saveGuid(n),group_counter_guid:srcGuid(rootCounter)}))];
  const slotDefs={achievement_references:refs,counters:[
    {guid:srcGuid(groupCounter),reference_count:5,storage:'InGame',kind:'AchievementsCounter'},
    {guid:srcGuid(rootCounter),reference_count:63,storage:'Meta',kind:'AchievementsCounter'}]};
  const localDefs={records:[leaf,parent,...Array.from({length:818},(_,i)=>({key:`dummy_${i}`}))]};
  const metaDefs=[{key:'Local_RootAchievement',guid:srcGuid(rootSource),counter_guid:srcGuid(rootCounter),built_in_references:63}];
  const achievements=[{n:leafSource,current:1,complete:false},{n:parentSource,current:4,complete:false},
    ...siblings.map(n=>({n,current:1,complete:true})),
    ...rootSiblings.slice(0,53).map((n,i)=>({n,current:i<19?1:0,complete:i<19}))];
  assert.equal(achievements.length,59);
  const counters=[{n:1005,current:1},{n:groupCounter,current:4}];
  let id=0;
  const recordA=({n,current,complete})=>cat(mp([16,[++id,n,0]]),u32tok(0),u32tok(0),Uint8Array.of(0x93,complete?0xc3:0xc2),f32(current),complete?ts:Uint8Array.of(0xc0));
  const recordC=({n,current})=>cat(mp([17,[++id,n,0]]),u32tok(0),u32tok(0),Uint8Array.of(0x93),f32(current),Uint8Array.of(0xc0,0x90));
  const top=[0,0,[[0,[0,0,version]]],[39,[new Map(),collectionItems]]];
  const unknown=cat(mp([44,[1,new Map([['unknown_key',5]])]]));
  const expanded=cat(mp(top),...achievements.map(recordA),...counters.map(recordC),unknown);
  const lens=[];const compressed=[];
  for(let p=0;p<expanded.length;p+=32768){const piece=expanded.subarray(p,p+32768);lens.push(piece.length);compressed.push(lz4EncodeLiteralOnly(piece));}
  const lenExt=cat(Uint8Array.of(0xc8),u16(lens.length*3),Uint8Array.of(98),...lens.map(n=>cat(Uint8Array.of(0xcd),u16(n))));
  const frame=cat(Uint8Array.of(0x90|(lens.length+1)),lenExt,...compressed.map(b=>cat(Uint8Array.of(0xc5),u16(b.length),b)));
                                                                                
                                                                                 
  const metadata=cat(Uint8Array.of(0x98),u32tok(0),u32tok(0),u32tok(0),u32tok(0),str(version),u32tok(Number(version.split('.')[0])*10000+Number(version.split('.')[1])*100+Number(version.split('.')[2])),
    cat(Uint8Array.of(0x92),ts,Uint8Array.of(0)),Uint8Array.of(0),mp(new Map()),mp([]),mp([9]));
  const slotBytes=cat(new Uint8Array(32),metadata,MAGIC,frame);
  const accountJson=`{\n  "Achievements" : {"${srcGuid(rootSource)}": {"IsComplete": false, "CurrentValue": 1.9e1, "CompletedTime": null, "Extra": {"format":"\\u0041"}}},\n  "Counters" : {"${srcGuid(rootCounter)}": {"CurrentValue": 19, "Extra": [true, null, {"number":-2.00e+3}]}},\n  "NonTarget": {"name":"語彙", "OriginalNumber": 4.20e+01, "a": [0,1,2]}\n}`;
  if(version==='3.0.0'||version==='3.0.1')assert.equal(readSave(slotBytes).achievements.length,59);
  return {slotBytes,accountJson,localDefs,slotDefs,metaDefs,completedAt:'2026-11-11T01:02:03.1234567Z'};
}
