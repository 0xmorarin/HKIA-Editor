import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {resolve} from 'node:path';import {createHash} from 'node:crypto';import {anchors,patchApp,verifyBase,BASE_MANIFEST,APP_SHA} from './prepare-product-collection-items-delta.mjs';
import {createProductCollectionItemsBridge} from '../src/product-collection-items-bridge.mjs';import {make,paint,row} from '../tests/product-collection-items-dom-fixture.mjs';
const root=resolve(process.argv[2]),manifest=readFileSync(process.argv[3]);verifyBase(root,manifest);const app=readFileSync(resolve(root,'src/app.js')),patched=patchApp(app).toString('utf8'),original=app.toString('utf8');let reverse=patched;for(const [before,after] of [...anchors].reverse()){assert.equal(reverse.split(after).length,2);reverse=reverse.replace(after,before);}assert.equal(reverse,original);assert.throws(()=>patchApp(Buffer.from(original+'\n')));assert.match(readFileSync(resolve(root,'index.html'),'utf8'),/<div id="collectionDetail" class="collection-detail" hidden>/);
const extract=s=>s.slice(s.indexOf("  const renderRows=()=>{"),s.indexOf("  query.addEventListener('input',()=>{limit=100;renderRows();}"));
function compareRenderRows(old,next){
 const all=Array.from({length:201},(_,i)=>row(10200-i,{key:'fixture-'+String(i).padStart(3,'0'),history:{kind:'known',status:'EXACT',recorded:i%2===0,showTicks:i%2===0,rawTicks:i%2===0?'9223372036854775807':null,calendar:null},...(i===0?{parent:{id:9999,cross:true}}:{})}));
 const byId=new Map(all.map(r=>[r.id,r]));
 function execute(source,enabled){
  const {doc,section,host:rows}=make(),panel=doc.root,category={key:'fixture-category'},rule={key:'fixture-definition',guid:'fixture-guid'},selected={items:all,definition:rule,recorded:all.filter(r=>r.history.recorded).map(r=>r.id)},records=[rule];
  const state={selectedCollection:category.key,selectedCollectionDefinition:rule.key,selectedItemId:null,collectionMatch:{recordedSet:new Set(selected.recorded)},collectionReadModel:{getItem(id){const r=byId.get(id);return r?{historyRecorded:r.history.recorded,status:r.history.status}:null;}},collectionHistoryDisplay:{},parentMatch:{parentByChild:new Map([[10200,{parent_id:9999,relation:'cross-collection'}]])}};
  const query={value:''},filter={value:'all'},sortItems={value:'source'},bulk=doc.createElement('div'),count=doc.createElement('p'),itemInspector=doc.createElement('section');itemInspector.scrollIntoView=()=>{};section.append(bulk,count,itemInspector);
  const node=(t,c='',v)=>{const n=doc.createElement(t);n.className=c;if(v!==undefined)n.textContent=v;return n;},document=doc,imageUi=()=>null,nativePreview={status:()=>({ready:false})},sourceCollectionStats=()=>null,renderCollectionBulk=()=>{throw Error('writer must be off')},collectionHistoryUiStatus=({itemId})=>({recorded:byId.get(itemId).history.recorded,rawTicks:byId.get(itemId).history.rawTicks,calendar:null});
  const renderCollectionItemInspector=(id,h)=>h.replaceChildren(node('p','','fixture '+id));
  let mounted=0,disposed=0;const productCollectionItems=enabled?createProductCollectionItemsBridge(doc,(h,s,d)=>{paint(h,s,d,true);mounted++;return()=>disposed++;}):null;
  let limit=100;
  const renderRows=new Function('state','query','filter','sortItems','bulk','count','rows','itemInspector','selected','records','rule','category','panel','section','document','node','imageUi','nativePreview','sourceCollectionStats','renderCollectionBulk','collectionHistoryUiStatus','renderCollectionItemInspector','productCollectionItems','limit',source+'\nreturn renderRows;')(state,query,filter,sortItems,bulk,count,rows,itemInspector,selected,records,rule,category,panel,section,document,node,imageUi,nativePreview,sourceCollectionStats,renderCollectionBulk,collectionHistoryUiStatus,renderCollectionItemInspector,productCollectionItems,limit);
  const sig=()=>{const h=section.querySelectorAll('.collection-items-list')[0];if(enabled&&h.getAttribute('data-hkia-svelte-collection-items')!=='1')throw Error('not mounted');return {caption:count.textContent,rows:h.children.map(n=>[n.className,n.textContent]),selected:state.selectedItemId,inspector:itemInspector.textContent};};
  const report=[];renderRows();report.push(sig());section.querySelectorAll('.show-more')[0].click();report.push(sig());section.querySelectorAll('.show-more')[0].click();report.push(sig());section.querySelectorAll('.item-inspect-button')[0].click();report.push(sig());
  for(const [c,v] of [[filter,'missing'],[filter,'collected'],[filter,'all'],[sortItems,'id'],[query,'fixture-000'],[query,'no-match']]){c.value=v;renderRows();report.push(sig());}
  productCollectionItems?.restore();return {report,mounted,disposed};
 }
 const a=execute(old,false),b=execute(next,true);if(JSON.stringify(a.report)!==JSON.stringify(b.report))throw Error('actual renderRows parity mismatch');
 if(b.mounted!==9||b.disposed!==9)throw Error('lifecycle '+JSON.stringify([b.mounted,b.disposed]));
 return {cases:a.report.length,rows:a.report.reduce((n,x)=>n+x.rows.filter(r=>r[0]==='collection-item-row').length,0),mounts:b.mounted,disposals:b.disposed};
}

console.log(JSON.stringify({base:BASE_MANIFEST,app:APP_SHA,after:createHash('sha256').update(patched).digest('hex'),anchors:anchors.length,reversible:true,...compareRenderRows(extract(original),extract(patched))}));
