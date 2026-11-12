import test from 'node:test';
import assert from 'node:assert/strict';
import {lz4Decompress} from '../src/save.js';
import {lz4EncodeLiteralOnly} from '../scripts/research/save-envelope-noop.mjs';
import {lz4EncodeBoundedMatch} from '../scripts/research/lz4-match-encoder.mjs';

const toBytes=(size,func)=>Uint8Array.from({length:size},(_,i)=>func(i));
function roundTrip(bytes){
  const before=bytes.slice();
  const encoded=lz4EncodeBoundedMatch(bytes);
  const restored=lz4Decompress(encoded,bytes.length);
  assert.deepEqual(restored,before);
  assert.deepEqual(bytes,before,'caller memory must not be mutated');
  assert.ok(encoded.length<=lz4EncodeLiteralOnly(bytes).length);
  return encoded;
}
test('04 bounded match compressor refuses invalid block sizes/types',()=>{
  assert.throws(()=>lz4EncodeBoundedMatch(new Uint8Array(0)),/outside/);
  assert.throws(()=>lz4EncodeBoundedMatch(new Uint8Array(65537)),/outside/);
  assert.throws(()=>lz4EncodeBoundedMatch([1,2,3]),/Uint8Array/);
});
test('04 bounded match compressor keeps exact 65536-byte decompressed stream',()=>{
  const src=toBytes(65536,i=>i%37);
  const encoded=roundTrip(src);
  assert.ok(encoded.length<1024,'repeating content should not explode into literals');
});
test('04 compresses 64KiB zero blocks and a near-boundary match with minimum trailing literals',()=>{
  for(const n of [13,14,15,16,18,31,128,65535,65536]){
    const encoded=roundTrip(new Uint8Array(n));
    if(n>100)assert.ok(encoded.length<n/3);
  }
});
test('04 compresses overlapping and non-overlapping matches without input aliasing',()=>{
  for(const modulo of [1,2,3,4,5,7,15,31,257])roundTrip(toBytes(4096,i=>i%modulo));
});
test('04 random and high-entropy payloads never expand past literal-only fallback',()=>{
  let state=0x74119ef3;
  for(const n of [16,39,128,1024,8192,65536]){
    const bytes=new Uint8Array(n);
    for(let i=0;i<n;i++){state^=state<<13;state^=state>>>17;state^=state<<5;bytes[i]=state&255;}
    roundTrip(bytes);
  }
});
test('04 literal-only short blocks stay compatible',()=>{
  for(let n=1;n<=12;n++)assert.deepEqual(lz4EncodeBoundedMatch(new Uint8Array(n)),lz4EncodeLiteralOnly(new Uint8Array(n)));
});

test('04 deterministic high-coverage codec sweep across 1..65536 bytes',()=>{
  let seed=0x197e84d3;
  function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;}
  for(let trial=0;trial<96;trial++){
    const size=[1,4,5,12,13,14,15,16,255,256,257,4095,4096,65535,65536,rnd()%65536+1][trial%16];
    const block=new Uint8Array(size);
    const kind=trial%6;
    for(let i=0;i<size;i++){
      if(kind===0)block[i]=rnd()&255;
      else if(kind===1)block[i]=i%17;
      else if(kind===2)block[i]=(i*i)>>>7&255;
      else if(kind===3)block[i]=i<40?0:(i%41);
      else if(kind===4)block[i]=i%2?255:0;
      else block[i]=i%257;
    }
    roundTrip(block);
  }
});
