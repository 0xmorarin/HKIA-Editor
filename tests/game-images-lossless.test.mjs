import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {tmpdir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {losslessWebpDimensions} from '../scripts/lossless-webp.mjs';
import {inspectFile} from '../scripts/pages-artifact-policy.mjs';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const collections=JSON.parse(readFileSync(join(root,'data/collections.json'),'utf8'));
const provenance=JSON.parse(readFileSync(join(root,'data/icon-provenance.json'),'utf8'));
const origin=new Map(provenance.map(x=>[x.key,x]));

test('all 25 local game icons are WebP VP8L with correct dimensions and provenance hashes',()=>{
  assert.equal(collections.length,25);
  for(const c of collections){
    assert.match(c.icon,/\.webp$/);
    const path=join(root,c.icon);
    assert.ok(existsSync(path));
    const bytes=readFileSync(path);
    assert.deepEqual(losslessWebpDimensions(bytes),{width:c.width,height:c.height,codec:'VP8L'});
    assert.equal(createHash('sha256').update(bytes).digest('hex'),origin.get(c.key).display_webp_sha256);
    assert.equal(origin.get(c.key).display_webp_codec,'VP8L');
    assert.doesNotThrow(()=>inspectFile(path));
  }
});

test('lossy, animated, malformed, and non-WebP assets are refused',()=>{
  const riff=(tag,payload)=>{
    const chunk=Buffer.alloc(8+payload.length+(payload.length&1));
    chunk.write(tag,0,'ascii');chunk.writeUInt32LE(payload.length,4);payload.copy(chunk,8);
    const bytes=Buffer.alloc(12+chunk.length);
    bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WEBP',8);chunk.copy(bytes,12);
    return bytes;
  };
  assert.throws(()=>losslessWebpDimensions(riff('VP8 ',Buffer.alloc(8))),/lossless VP8L/);
  assert.throws(()=>losslessWebpDimensions(riff('ANIM',Buffer.alloc(8))),/lossless VP8L/);
  assert.throws(()=>losslessWebpDimensions(Buffer.from('PNG data')),/Invalid WebP/);
  const truncated=riff('VP8L',Buffer.from([0x2f,0,0,0,0])).subarray(0,-1);
  assert.throws(()=>losslessWebpDimensions(truncated),/RIFF length/);
});

test('Pages file inspection rejects PNG files and lossy WebP even with valid extension',()=>{
  const dir=mkdtempSync(join(tmpdir(),'hkia-webp-'));
  try{
    const png=join(dir,'game-icon.png');
    writeFileSync(png,Buffer.from('PNG input'));
    assert.throws(()=>inspectFile(png),/must use lossless WebP/);
    const lossy=join(dir,'game-icon.webp');
    const bytes=Buffer.alloc(12+8+8);
    bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WEBP',8);
    bytes.write('VP8 ',12);bytes.writeUInt32LE(8,16);
    writeFileSync(lossy,bytes);
    assert.throws(()=>inspectFile(lossy),/lossless VP8L/);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
