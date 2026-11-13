import {assertCategorySnapshot,categoryImagePresentation,createCategoryPort,type CategoryImage,type CategoryRow,type CategorySnapshot,type CategoryPort} from './category-grid.ts';
/** The V33 controller owns keys, selection, order, counts, image resolution and detail navigation.
 * A bounded per-render projection is never a Save/Session or an independent catalog. */
export type RenderProductCategoryCards=(host:HTMLDivElement,snapshot:CategorySnapshot,port:CategoryPort)=>()=>void;
export type CategoryInstallResult='MOUNTED'|'LEGACY_RETAINED';
const marker='data-hkia-svelte-categories';
const require=(v:unknown):void=>{if(!v)throw Error('PRODUCT_CATEGORY_DOM_CONTRACT');};
const text=(e:Element)=>e.textContent??'';
const attr=(e:Element,k:string)=>e.getAttribute(k);
function imageFrom(node:Element):CategoryImage{
 let result:CategoryImage;
 if(node.tagName==='SPAN'&&node.className==='media-thumb media-category'){
  const status=attr(node,'data-image-status');require(status&&attr(node,'data-image-kind')==='category'&&node.children.length===1);
  const child=node.children[0],src=attr(child,'src');
  if(child.tagName==='IMG'){
   const sprite=attr(child,'data-sprite-path-id');require(src?.startsWith('./')&&sprite!==null&&attr(child,'alt')===''&&attr(child,'width')==='92'&&attr(child,'height')==='92'&&attr(child,'loading')==='lazy'&&attr(child,'decoding')==='async'&&attr(child,'referrerpolicy')==='no-referrer');
   result={kind:'mapped',status:status!,image:src!.slice(2),spritePathId:sprite!};
   const p=categoryImagePresentation(result);require(p.src===src&&attr(node,'aria-label')===p.label&&attr(node,'title')==='カテゴリ画像');
  }else{
   require(child.tagName==='SPAN'&&child.className==='media-null-mark'&&text(child)==='—'&&attr(child,'aria-hidden')==='true');result={kind:'mapped',status:status!,image:null};
   const p=categoryImagePresentation(result);require(p.src===null&&attr(node,'aria-label')===p.label&&attr(node,'title')==='カテゴリ画像：'+status);
  }
 }else if(node.tagName==='IMG'&&node.className==='collection-icon'){
  const src=attr(node,'src');require(src&&attr(node,'alt')===''&&attr(node,'width')==='92'&&attr(node,'height')==='92'&&attr(node,'loading')==='lazy');result={kind:'legacy',image:src!};require(categoryImagePresentation(result).src===src);
 }else{require(node.tagName==='SPAN'&&node.className==='collection-icon-fallback'&&text(node)==='画像 UNKNOWN');result={kind:'unknown'};}
 return Object.freeze(result);
}
function project(host:HTMLDivElement,keys:readonly string[],selectedKey:string|null,totalCategories:number,candidate=false){
 require(host.tagName==='DIV'&&host.id==='collectionGrid'&&host.className==='collection-grid');
 const rows:CategoryRow[]=[],buttons=new Map<string,HTMLButtonElement>();
 if(!keys.length){require(host.children.length===1&&host.children[0].tagName==='P'&&host.children[0].className==='placeholder'&&text(host.children[0])==='該当するカテゴリがありません。');}
 else require(host.children.length===keys.length);
 for(const [i,key] of keys.entries()){
  const b=host.children[i] as HTMLButtonElement;require(b.tagName==='BUTTON'&&b.type==='button'&&b.className===(key===selectedKey?'collection-card selected':'collection-card')&&b.children.length===3&&(!candidate||attr(b,'data-category-key')===key));
  const [img,title,desc]=Array.from(b.children);require(title.tagName==='SPAN'&&title.className==='collection-title'&&desc.tagName==='SMALL'&&desc.className==='collection-meta');
  rows.push(Object.freeze({key,title:text(title),description:text(desc),image:imageFrom(img)}));buttons.set(key,b);
 }
 const snapshot=assertCategorySnapshot(Object.freeze({rows:Object.freeze(rows),selectedKey,totalCategories}));return {snapshot,buttons};
}
const equal=(a:CategorySnapshot,b:CategorySnapshot)=>JSON.stringify(a)===JSON.stringify(b);
export function createProductCategoryBridge(doc:Document,draw:RenderProductCategoryCards){
 let live: {legacy:HTMLDivElement;candidate:HTMLDivElement;dispose:()=>void;token:object}|null=null;
 let snapshot:CategorySnapshot|null=null,busy=false,disabled=false,rendering=false,revision=0;
 function owns(host:HTMLDivElement){const nodes=doc.querySelectorAll('[id="collectionGrid"]');return nodes.length===1&&nodes[0]===host;}
 function dispose(fn:()=>void){try{fn();}catch{/* never remove the legacy fallback */}}
 function restore(){
  snapshot=null;const old=live;if(!old)return;live=null;
  if(!owns(old.candidate)){disabled=true;if(!old.candidate.parentElement)dispose(old.dispose);return;}
  try{old.candidate.replaceWith(old.legacy);require(owns(old.legacy));}catch{disabled=true;return;}
  dispose(old.dispose);
 }
 function render(grid:HTMLDivElement,keys:readonly string[],selectedKey:string|null,totalCategories:number):CategoryInstallResult{
  if(disabled||rendering||live||!owns(grid))return 'LEGACY_RETAINED';
  let original:ReturnType<typeof project>;try{original=project(grid,keys,selectedKey,totalCategories);snapshot=original.snapshot;revision++;}catch{snapshot=null;return 'LEGACY_RETAINED';}
  const parent=grid.parentElement,token={},candidate=grid.cloneNode(false) as HTMLDivElement;candidate.setAttribute(marker,'1');
  const focusKey=[...original.buttons].find(([,b])=>doc.activeElement===b)?.[0];let cleanup:(()=>void)|undefined,committed=false;
  const port=createCategoryPort({read(){require(snapshot!==null);return snapshot!;},selectCategory(key){
   require(!busy&&live?.token===token&&owns(candidate)&&original.buttons.has(key));busy=true;const before=revision;
   try{original.buttons.get(key)!.click();require(revision>before);}finally{busy=false;}
  }});
  rendering=true;try{
   cleanup=draw(candidate,original.snapshot,port);require(typeof cleanup==='function');
   const projected=project(candidate,keys,selectedKey,totalCategories,true);require(equal(projected.snapshot,original.snapshot));
   const before=project(grid,keys,selectedKey,totalCategories);require(snapshot===original.snapshot&&owns(grid)&&grid.parentElement===parent&&equal(before.snapshot,original.snapshot)&&[...original.buttons].every(([key,b])=>before.buttons.get(key)===b));
   grid.replaceWith(candidate);committed=true;require(owns(candidate)&&candidate.parentElement===parent&&equal(project(candidate,keys,selectedKey,totalCategories,true).snapshot,original.snapshot));
   live={legacy:grid,candidate,dispose:cleanup,token};if(focusKey)projected.buttons.get(focusKey)?.focus();return 'MOUNTED';
  }catch{
   live=null;if(committed){try{candidate.replaceWith(grid);require(owns(grid));if(focusKey)original.buttons.get(focusKey)?.focus();}catch{disabled=true;}}
   if(cleanup)dispose(cleanup);return 'LEGACY_RETAINED';
  }finally{rendering=false;}
 }
 return {restore,render};
}
