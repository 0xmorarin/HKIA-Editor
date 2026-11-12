import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {javaScriptComments,cssComments,htmlComments,verifyDist,publicJsonText} from '../scripts/pages-artifact-policy.mjs';

test('JavaScript comments are detected without matching string URLs',()=>{
  assert.equal(javaScriptComments('const url="https://example.com/a/*b*/";').length,0);
  assert.equal(javaScriptComments('const x=1; // line\nconst y=2; /* block */').length,2);
  assert.equal(javaScriptComments('const url=`https://example.com`; const re=/https?:\\/\\/\\w+/;').length,0);
  assert.equal(javaScriptComments('const t=`hello ${ 1 /* hidden */ +2 }`;').length,1);
});

test('CSS and HTML comment syntax is rejected while literals are preserved',()=>{
  assert.equal(cssComments('.x{background:url("https://a/b/*c*/")}').length,0);
  assert.equal(cssComments('/* omitted */ p{color:red}').length,1);
  assert.equal(htmlComments('<p title="<!-- literal -->">test</p>').length,0);
  assert.equal(htmlComments('<p>hi</p><!--comment-->').length,1);
});

test('Pages tree rejects README, private saves, comments, and unknown artifacts',()=>{
  const root=mkdtempSync(join(tmpdir(),'hkia-pages-policy-'));
  try{
    mkdirSync(join(root,'src'));
    writeFileSync(join(root,'index.html'),'<html></html>');
    writeFileSync(join(root,'src','main.js'),'const value=1;');
    assert.equal(verifyDist(root),2);
    writeFileSync(join(root,'src','main.js'),'const value=1; // comment');
    assert.throws(()=>verifyDist(root),/comments prohibited/);
    writeFileSync(join(root,'src','main.js'),'const value=1;');
    writeFileSync(join(root,'README.md'),'no');
    assert.throws(()=>verifyDist(root),/README prohibited/);
    rmSync(join(root,'README.md'));
    writeFileSync(join(root,'Saves.save'),'private');
    assert.throws(()=>verifyDist(root),/private\/archive file prohibited/);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('Inline CSS and JavaScript  are not publishable',()=>{
  const root=mkdtempSync(join(tmpdir(),'hkia-pages-inline-'));
  try{
    writeFileSync(join(root,'index.html'),'<html><script>const x=1; // inline\n</script></html>');
    assert.throws(()=>verifyDist(root),/inline JS comments prohibited/);
    writeFileSync(join(root,'index.html'),'<html><style>/* inline */ .x{}</style></html>');
    assert.throws(()=>verifyDist(root),/inline CSS comments prohibited/);
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('Distribution removes private provenance keys recursively without changing game data',()=>{
  const raw=JSON.stringify({source_drive_id:'synthetic-ref',items:[{id:7,manifest_drive_id:'synthetic-ref',text_drive_id:'synthetic-ref',guid:'keep',source_original_sha256:'keep'}],meta:{driveId:'synthetic-ref',fileUri:'synthetic-ref',libraryFileId:'synthetic-ref'}});
  assert.deepEqual(JSON.parse(publicJsonText(raw)),{items:[{id:7,guid:'keep',source_original_sha256:'keep'}],meta:{}});
  const clean='{ "id": 7 }';assert.equal(publicJsonText(clean),clean);
});
test('Distribution gate rejects private keys and Drive resource links even in nested JSON',()=>{
  const root=mkdtempSync(join(tmpdir(),'hkia-pages-private-'));
  try{writeFileSync(join(root,'index.html'),'<html></html>');const f=join(root,'data.json');
    for(const key of ['source_drive_id','manifest_drive_id','text_drive_id','privateFileId','libraryFileId']){writeFileSync(f,JSON.stringify({nested:[{[key]:'synthetic-ref'}]}));assert.throws(()=>verifyDist(root),/private reference key prohibited/);}
    writeFileSync(f,JSON.stringify({url:'https://drive.google.com/file/d/synthetic-ref/view'}));assert.throws(()=>verifyDist(root),/private reference value prohibited/);
    writeFileSync(f,JSON.stringify({id:7,guid:'keep'}));assert.equal(verifyDist(root),2);
  }finally{rmSync(root,{recursive:true,force:true});}
});

test('Distribution gate rejects decoded private references in JSON keys and values',()=>{
  const root=mkdtempSync(join(tmpdir(),'hkia-pages-decoded-'));
  try{
    writeFileSync(join(root,'index.html'),'<html></html>');const f=join(root,'data.json');
    for(const raw of [
      String.raw`{"nested":{"url":"https:\/\/drive.google.com\/file\/d\/SYNTHETIC_ONLY\/view"}}`,
      String.raw`{"nested":[{"url":"https://drive.google.com/\u0066ile/d/SYNTHETIC_ONLY/view"}]}`,
      String.raw`{"value":"\u006cibfile_synthetic"}`,
      String.raw`{"\u006cibfile_synthetic":7}`,
      String.raw`"\u006cibfile_synthetic"`,
      String.raw`{"value":"\u006cibfile_synthetic","value":"safe"}`,
      String.raw`{"nested":["\u0073ediment:\/\/synthetic"]}`,
    ]){writeFileSync(f,raw);assert.throws(()=>verifyDist(root),/private reference value prohibited/);}
    writeFileSync(f,String.raw`{"nested":{"source\u005fdrive\u005fid":"synthetic"},"nested":{}}`);
    assert.throws(()=>verifyDist(root),/private reference key prohibited/);
    const normal=String.raw`{"nested":[{"id":7,"guid":"keep","unknown":"\u65e5\u672c","source_original_sha256":"keep"}],"url":"https:\/\/example.com\/game"}`;
    writeFileSync(f,normal);assert.equal(verifyDist(root),2);assert.equal(publicJsonText(normal),normal);
    writeFileSync(join(root,'raw.js'),'const x="https://drive.google.com/file/d/SYNTHETIC_ONLY/view";');
    assert.throws(()=>verifyDist(root),/private reference value prohibited/);
  }finally{rmSync(root,{recursive:true,force:true});}
});
