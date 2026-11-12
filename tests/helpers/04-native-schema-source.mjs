import {fixture} from './04-puzzle-goals-source.mjs';
import {MAGIC} from '../../src/save.js';
import {lz4EncodeLiteralOnly} from '../../scripts/research/save-envelope-noop.mjs';
const cat=(...p)=>Buffer.concat(p.map(x=>Buffer.from(x)));
const b=(...a)=>Buffer.from(a);
const uint=n=>{const v=Buffer.alloc(5);v[0]=0xce;v.writeUInt32BE(n,1);return v;};
const f=n=>{const v=Buffer.alloc(5);v[0]=0xca;v.writeFloatBE(n,1);return v;};
const long=n=>{const v=Buffer.alloc(9);v[0]=0xd3;v.writeBigInt64BE(n,1);return v;};
const str=s=>cat(b(0xa0|s.length),Buffer.from(s));
const arr=(...xs)=>cat(b(0x90|xs.length),...xs);
const guid=(...w)=>cat(...w.map(uint));
const doc=(tag,body)=>arr(b(tag),body);
const key=(n)=>arr(guid(1,2,3,4),guid(5,6,7,8),b(n));
const pair=(k,v)=>cat(k,v);
const dict=(...p)=>{const n=p.length,h=Buffer.alloc(n<16?1:n<=65535?3:5);if(n<16)h[0]=0x80|n;else if(n<=65535){h[0]=0xde;h.writeUInt16BE(n,1);}else{h[0]=0xdf;h.writeUInt32BE(n,1);}return Buffer.concat([h,...p]);};
export function payload({duplicateHash=false,duplicateCompound=false,duplicateInt=false,duplicateDoc=false,unknown=false,appended=false,floatKey=false,version='3.0.1',emptyKey0=false,collectionEntries=null,migrationVersion=30001,recipeQuantity=null}={}){
 const a=doc(16,arr(b(1),guid(1,0,0,1),arr(b(0xc2),f(1),b(0xc0))));
 const c=doc(17,arr(b(1),guid(1,0,0,2),arr(f(2),b(0xc0),arr())));
 const key0=emptyKey0?dict():dict(pair(guid(1,2,3,4),long(11n)),pair(guid(1,2,3,duplicateHash?4:5),long(12n)));
 const key1=collectionEntries===null?dict(pair(floatKey?f(2):b(2),long(638000000000000001n)),pair(duplicateInt?uint(2):b(3),long(9n))):dict(...collectionEntries.map(([id,t])=>pair(uint(id),long(BigInt(t)))));
 const col=doc(39,arr(key0,key1));
 const shop=doc(35,arr(long(0n),arr(),arr(),arr(),dict(pair(key(1),b(1)),pair(key(duplicateCompound?1:2),b(2)))));
 const object=doc(32,arr(b(3),guid(0,0,0,3),b(0),arr(col,shop)));
 const ver=doc(18,arr(b(0),uint(migrationVersion),str(version)));
 return arr(b(0),b(4),arr(ver,a,c,object,...(recipeQuantity===null?[]:[doc(1,arr(b(4),uint(5913958),b(0),b(recipeQuantity),b(0xc0)))]),...(duplicateDoc?[a]:[]),...(unknown?[doc(99,arr())]:[])),...(appended?[b(0)]:[]));
}
const prefix=Buffer.from('135b4aa4f702a45d1cc562aeb5a386ed5d17e1fd588f424dcfc59d2e140cf597','hex');
export function envelope(p){const old=Buffer.from(fixture().slotBytes),m=old.indexOf(Buffer.from(MAGIC));prefix.copy(old,0);const packed=lz4EncodeLiteralOnly(p);const len=Buffer.alloc(2);len.writeUInt16BE(p.length);const clen=Buffer.alloc(2);clen.writeUInt16BE(packed.length);return cat(old.subarray(0,m),MAGIC,b(0x92,0xc8,0,3,98,0xcd),len,b(0xc5),clen,packed);}
