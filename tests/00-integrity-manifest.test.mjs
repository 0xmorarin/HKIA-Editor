import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname,'..');
const entries = JSON.parse(readFileSync(resolve(root,'SHA256_MANIFEST.json'),'utf8')).safeFiles;
test('all source-pinned 03 manifest records have matching SHA-256 and sizes',()=>{
  assert.ok(Object.keys(entries).length>=8);
  for(const [p,record] of Object.entries(entries)){
    const data=readFileSync(resolve(root,p));
    assert.equal(data.length,record.bytes,p);
    assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256,p);
  }
});
