import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readdirSync,readFileSync,lstatSync,realpathSync,mkdirSync,writeFileSync,existsSync} from 'node:fs';import {resolve,join,relative,dirname,isAbsolute} from 'node:path';import {fileURLToPath} from 'node:url';
export const BASE_MANIFEST='137cc1cdc1dc783fa4cedadf3e16619a07c9cfa6f6559cb8d2f449b7603120db';
export const APP_SHA='6d1358ee1dd1991a8307dee28a42ffcf617e0af073533a23820f94c630c2bfe5';
export const INDEX_SHA='51e08577d212f9d8f90095ada1d2acd2e6a373d3f9d8e875e8833e107c06dea4';
const sha=b=>createHash('sha256').update(b).digest('hex');
export const anchors=Object.freeze([
  [
    "function renderCollectionDetail(){\n  const panel=el('collectionDetail');",
    "let productCollectionItems=null;\nfunction renderCollectionDetail(){\n  productCollectionItems?.restore();\n  const panel=el('collectionDetail');"
  ],
  [
    "  const renderRows=()=>{\n    const q=query.value.trim().toLowerCase();",
    "  const renderRows=()=>{\n    productCollectionItems?.restore();\n    const q=query.value.trim().toLowerCase();"
  ],
  [
    "    rows.replaceChildren();const frag=document.createDocumentFragment();\n    for(const item of matches.slice(0,limit)){",
    "    rows.replaceChildren();const frag=document.createDocumentFragment();const projection=[];\n    for(const item of matches.slice(0,limit)){"
  ],
  [
    "      if(imageUi())row.append(imageElement(imageUi().item(item.id,item.guid,rule.guid),{kind:'item',label:'アイテム画像'}));",
    "      const media=imageUi(),icon=media?media.item(item.id,item.guid,rule.guid):null;\n      if(media)row.append(imageElement(icon,{kind:'item',label:'アイテム画像'}));\n      let stamp=null;"
  ],
  [
    "if(typed&&state.collectionHistoryDisplay){const stamp=collectionHistoryUiStatus({model:state.collectionReadModel,display:state.collectionHistoryDisplay,itemId:item.id});",
    "if(typed&&state.collectionHistoryDisplay){stamp=collectionHistoryUiStatus({model:state.collectionReadModel,display:state.collectionHistoryDisplay,itemId:item.id});"
  ],
  [
    "      frag.append(row);\n    }\n    if(!matches.length)rows.append",
    "      if(productCollectionItems&&limit<=1200)projection.push({id:item.id,key:item.key||'',guid:item.guid,history:typed?{kind:'known',status:typed.status,recorded:typed.historyRecorded,rawTicks:stamp?.recorded?stamp.rawTicks??null:null,calendar:stamp?.recorded?stamp.calendar??null:null,showTicks:!!stamp?.recorded}:{kind:'unknown'},parent:parent?{id:parent.parent_id,cross:parent.relation==='cross-collection'}:undefined,imageEnabled:!!media,image:icon});\n      frag.append(row);\n    }\n    if(!matches.length)rows.append"
  ],
  [
    "    if(state.selectedItemId!==null&&selected.items.some(x=>x.id===state.selectedItemId))renderCollectionItemInspector(state.selectedItemId,itemInspector);\n  };",
    "    if(state.selectedItemId!==null&&selected.items.some(x=>x.id===state.selectedItemId))renderCollectionItemInspector(state.selectedItemId,itemInspector);\n    if(productCollectionItems)try{productCollectionItems.render(rows,{rows:projection,total:matches.length,limit},()=>state.selectedCollection===category.key&&state.selectedCollectionDefinition===rule.key&&panel.contains(section));}catch{}\n  };"
  ],
  [
    "sortItems.addEventListener('change',()=>{limit=100;renderRows();});renderRows();\n  panel.append(section);",
    "sortItems.addEventListener('change',()=>{limit=100;renderRows();});panel.append(section);renderRows();"
  ],
  [
    "    renderAchievements();renderCollections();\n  }catch(e){error(`同梱アセット読み込み失敗",
    "    try{const {createProductCollectionItems}=await import('./product-collection-items.mjs');productCollectionItems=createProductCollectionItems(document);}catch{}\n    renderAchievements();renderCollections();\n  }catch(e){error(`同梱アセット読み込み失敗"
  ]
]);
export function patchApp(bytes){
 assert.equal(sha(bytes),APP_SHA,'wrong V33 app');let s=bytes.toString('utf8');for(const [before,after] of anchors){assert.equal(s.split(before).length,2,'exact collection items patch anchor');s=s.replace(before,after);}return Buffer.from(s);
}
function walk(root,dir=root){return readdirSync(dir).flatMap(n=>{const p=join(dir,n),s=lstatSync(p);assert.ok(!s.isSymbolicLink(),'symlink');if(s.isDirectory())return walk(root,p);assert.ok(s.isFile(),'nonregular file');return [relative(root,p).split('\\').join('/')];});}
export function verifyBase(root,manifestBytes){
 assert.equal(sha(manifestBytes),BASE_MANIFEST,'wrong fixed V33 manifest');const m=JSON.parse(manifestBytes.toString('utf8'));assert.equal(m.writer,'OFF');assert.equal(m.entries,4146);assert.equal(m.webp,4076);const paths=walk(root).sort();assert.deepEqual(paths,Object.keys(m.files).sort());let bytes=0;for(const p of paths){const b=readFileSync(join(root,p));assert.equal(b.length,m.files[p].bytes,p);assert.equal(sha(b),m.files[p].sha256,p);bytes+=b.length;}assert.equal(bytes,m.bytes);assert.equal(paths.filter(p=>p.endsWith('.webp')).length,4076);assert.equal(m.files['index.html'].sha256,INDEX_SHA);assert.equal(m.files['src/app.js'].sha256,APP_SHA);return m;
}
export function prepare(root,manifestBytes,bundlePath,out){
 const m=verifyBase(root,manifestBytes);assert.ok(!existsSync(out),'fresh delta directory required');const base=realpathSync(root),bundleDir=realpathSync(dirname(bundlePath)),target=join(realpathSync(dirname(out)),out.split(/[\\/]/).at(-1));const outside=p=>{const r=relative(p,target);return r==='..'||r.startsWith('..'+'/')||r.startsWith('..'+'\\')||isAbsolute(r);};assert.ok(outside(base)&&outside(bundleDir),'delta must be outside input trees');assert.deepEqual(walk(bundleDir).sort(),['product-collection-items.mjs'],'unexpected bundle files');
 const bundle=readFileSync(bundlePath);assert.ok(bundle.length>0&&bundle.length<512*1024,'bundle bound');assert.ok(!bundle.toString('utf8').includes('sourceMappingURL='),'source map forbidden');assert.ok(!Object.hasOwn(m.files,'src/product-collection-items.mjs'));
 const app=patchApp(readFileSync(join(root,'src/app.js')));mkdirSync(join(out,'src'),{recursive:true});writeFileSync(join(out,'src/app.js'),app);writeFileSync(join(out,'src/product-collection-items.mjs'),bundle);
 const result={schema:'HKIA.ProductCollectionItemsDelta.1',version:'V33',baseManifestSha256:BASE_MANIFEST,writer:'OFF_UNCHANGED',baseEntries:4146,unchanged:4145,changes:{'src/app.js':{kind:'MOD',before:APP_SHA,after:sha(app),bytes:app.length},'src/product-collection-items.mjs':{kind:'ADD',after:sha(bundle),bytes:bundle.length}},note:'Candidate only; fixed build, actual browser, independent QA and 00 composition required'};writeFileSync(join(out,'delta-manifest.json'),JSON.stringify(result,null,2)+'\n');return result;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url))){
 const [root,manifest,bundle,out]=process.argv.slice(2);assert.ok(root&&manifest&&bundle&&out,'usage: root manifest bundle fresh-output');console.log(JSON.stringify(prepare(resolve(root),readFileSync(manifest),resolve(bundle),resolve(out))));
}
