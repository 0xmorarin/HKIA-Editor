import {MAGIC} from '../../src/save.js';
import {lz4EncodeLiteralOnly} from '../../scripts/research/save-envelope-noop.mjs';
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
export function fixture({version='3.0.1',historyEntries=entries,achievementExtra=[],counterExtra=[],unknownTail=true,unknownMap=null,signature=null,collectionOverride=null,achievementFieldsOverride=null,counterFieldsOverride=null,counterGuidTail=[]}={}){
  const history=mpMap(...historyEntries);
  const key0=mpMap([arr(uint(9),uint(8),uint(7),uint(6)),int64(123456789n)]);
  const collection=collectionOverride??arr(uint(39),arr(key0,history));
  const root=arr(uint(0),uint(0),arr(arr(uint(0),arr(uint(0),uint(0),txt(version)))),collection);
  const achievement=join(arr(uint(16),arr(uint(10),uint(1),uint(2))),uint(3),uint(4),achievementFieldsOverride??arr(bool(false),fl(1),nil,...achievementExtra));
  const counter=join(arr(uint(17),arr(uint(20),uint(5),uint(6))),uint(7),uint(8),counterFieldsOverride??arr(fl(1),nil,arr(),...counterExtra),...counterGuidTail);
  const other=unknownMap??mpMap([txt('opaque'),arr(uint(777),int64(-12n))]);
  const extra=unknownTail?arr(uint(44),arr(uint(99),other)):new Uint8Array();
  const payload=join(root,achievement,counter,extra);
  const chunks=[];for(let i=0;i<payload.length;i+=32768)chunks.push(payload.subarray(i,i+32768));
  const body=join(Uint8Array.of(0x90|(chunks.length+1),0xc8),u16(chunks.length*3),Uint8Array.of(98),
    ...chunks.map(x=>join(Uint8Array.of(0xcd),u16(x.length))),
    ...chunks.map(x=>{const compressed=lz4EncodeLiteralOnly(x);return join(Uint8Array.of(0xc5),u16(compressed.length),compressed);}));
  const components=version.split('.').map(Number);
  const meta=join(arr(uint(0),uint(0),uint(0),uint(0),txt(version),uint(components[0]*10000+components[1]*100+components[2]),arr(timestamp,uint(0)),uint(0)),mpMap(),arr(),arr(uint(9)));
  const raw=join(signature??Uint8Array.from({length:32},(_,i)=>i),meta,MAGIC,body);
  return {raw,payload};
}

export {arr,uint,fl,bool,nil,int64,mpMap,rawTickCases,guidA,guidC};
