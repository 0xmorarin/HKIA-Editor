import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readdirSync,readFileSync,lstatSync,realpathSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';import {resolve,join,relative,dirname,isAbsolute} from 'node:path';import {fileURLToPath} from 'node:url';
export const BASE_MANIFEST='564a5fc19b479931a616a3ce0fdc8f1c02b71b072fb84d9683cb5147029bf7f6';
export const APP_SHA='b736e11af8c527f497a1c975e1479aa3f6c5b7204fd8b6c44cc098921060d56d';
export const INDEX_SHA='51e08577d212f9d8f90095ada1d2acd2e6a373d3f9d8e875e8833e107c06dea4';
const sha=b=>createHash('sha256').update(b).digest('hex');
export function patchApp(bytes){
 assert.equal(sha(bytes),APP_SHA,'wrong V30 app');const s=bytes.toString('utf8'),end='  renderAchievements();\n}\nbootstrap();\n';assert.ok(s.endsWith(end),'bootstrap anchor');
 const hook="  try{const {mountProductTabs}=await import('./product-tabs.mjs');mountProductTabs(document,setTab);}catch{}\n";
 return Buffer.from(s.slice(0,-end.length)+'  renderAchievements();\n'+hook+'}\nbootstrap();\n');
}
function walk(root,dir=root){return readdirSync(dir).flatMap(n=>{const p=join(dir,n),s=lstatSync(p);assert.ok(!s.isSymbolicLink(),'symlink');if(s.isDirectory())return walk(root,p);assert.ok(s.isFile(),'nonregular file');return [relative(root,p).split('\\').join('/')];});}
export function verifyBase(root,manifestBytes){
 assert.equal(sha(manifestBytes),BASE_MANIFEST,'wrong fixed V30 manifest');const m=JSON.parse(manifestBytes.toString('utf8'));assert.equal(m.writer,'OFF');assert.equal(m.entries,4146);assert.equal(m.webp,4076);const paths=walk(root).sort();assert.deepEqual(paths,Object.keys(m.files).sort());let bytes=0;for(const p of paths){const b=readFileSync(join(root,p));assert.equal(b.length,m.files[p].bytes,p);assert.equal(sha(b),m.files[p].sha256,p);bytes+=b.length;}assert.equal(bytes,m.bytes);assert.equal(paths.filter(p=>p.endsWith('.webp')).length,4076);assert.equal(m.files['index.html'].sha256,INDEX_SHA);assert.equal(m.files['src/app.js'].sha256,APP_SHA);return m;
}
export function prepare(root,manifestBytes,bundlePath,out){
 const m=verifyBase(root,manifestBytes);assert.ok(!existsSync(out),'fresh delta directory required');const base=realpathSync(root),bundleDir=realpathSync(dirname(bundlePath)),target=join(realpathSync(dirname(out)),out.split(/[\\/]/).at(-1));const outside=p=>{const r=relative(p,target);return r==='..'||r.startsWith('..'+'/')||r.startsWith('..'+'\\')||isAbsolute(r);};assert.ok(outside(base)&&outside(bundleDir),'delta must be outside input trees');assert.deepEqual(walk(bundleDir).sort(),['product-tabs.mjs'],'unexpected bundle files');
 const bundle=readFileSync(bundlePath);assert.ok(bundle.length>0&&bundle.length<512*1024,'bundle bound');assert.ok(!bundle.toString('utf8').includes('sourceMappingURL='),'source map forbidden');assert.ok(!Object.hasOwn(m.files,'src/product-tabs.mjs'));
 const app=patchApp(readFileSync(join(root,'src/app.js')));mkdirSync(join(out,'src'),{recursive:true});writeFileSync(join(out,'src/app.js'),app);writeFileSync(join(out,'src/product-tabs.mjs'),bundle);
 const result={schema:'HKIA.ProductTabsDelta.1',baseManifestSha256:BASE_MANIFEST,writer:'OFF_UNCHANGED',baseEntries:4146,unchanged:4145,changes:{'src/app.js':{kind:'MOD',before:APP_SHA,after:sha(app),bytes:app.length},'src/product-tabs.mjs':{kind:'ADD',after:sha(bundle),bytes:bundle.length}},note:'Candidate only; fixed build, actual browser, independent QA and 00 composition required'};writeFileSync(join(out,'delta-manifest.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){
 const [root,manifest,bundle,out]=process.argv.slice(2);assert.ok(root&&manifest&&bundle&&out,'usage: root manifest bundle fresh-output');console.log(JSON.stringify(prepare(resolve(root),readFileSync(manifest),resolve(bundle),resolve(out))));
}
