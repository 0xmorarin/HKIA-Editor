/** A disposable, static Svelte header projection. The controller owns all state and forms. */
const MARK='data-hkia-svelte-achievement-header';
const LABELS=['GUID','定義照合','状態','進捗','達成日時'];
const text=v=>typeof v==='string'&&v.length>0&&v.length<=8192;
const require=v=>{if(!v)throw Error('PRODUCT_ACH_HEADER_CONTRACT');};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function signature(e){
 const attrs=Array.from(e.attributes).filter(a=>!(a.name==='class'&&!a.value)).map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]));
 const children=Array.from(e.children);
 return [e.tagName,attrs,children.length?Array.from(e.childNodes).filter(n=>n.nodeType===3&&n.textContent?.trim()).map(n=>n.textContent):e.textContent,children.map(signature)];
}
function projection(nodes,h){
 require(nodes.length===(h.empty?2:6)&&nodes[0].tagName==='H4'&&nodes[0].textContent===h.title);
 if(h.empty){require(nodes[1].tagName==='P'&&nodes[1].textContent===h.empty);return nodes.map(signature);}
 for(let i=0;i<5;i++){const n=nodes[i+1],line=h.lines[i];require(n.tagName==='DIV'&&n.className==='detail-line'&&n.children.length===2&&n.children[0].tagName==='B'&&n.children[1].tagName==='SPAN'&&n.children[0].textContent===line.label&&n.children[1].textContent===line.value);}
 return nodes.map(signature);
}
export function createProductAchievementHeaderBridge(doc,draw){
 let busy=false;
 const owns=p=>p?.tagName==='DIV'&&p.id==='editorPanel'&&doc.querySelectorAll('[id="editorPanel"]').length===1&&doc.getElementById('editorPanel')===p;
 return {render(panel,input,readSelected){
  if(busy||!owns(panel)||panel.hasAttribute(MARK))return 'LEGACY_RETAINED';
  busy=true;let cleanup,started=false,old=[];
  try{
   require(input&&typeof readSelected==='function'&&text(input.title)&&Array.isArray(input.lines));
   const h=Object.freeze({guid:input.guid,title:input.title,empty:input.empty,lines:Object.freeze(input.lines.map(x=>Object.freeze({label:x.label,value:x.value})))});
   require(h.guid===null?text(h.empty)&&h.lines.length===0: text(h.guid)&&h.empty===null&&h.lines.length===5&&h.lines.every((x,i)=>x.label===LABELS[i]&&text(x.value))&&h.lines[0].value===h.guid);
   require(readSelected()===h.guid);
   old=Array.from(panel.children);require(panel.childNodes.length===old.length);
   const sig=projection(old,h),stage=doc.createElement('div');
   cleanup=draw(stage,h);require(typeof cleanup==='function');
   const drawn=Array.from(stage.children);require(equal(projection(drawn,h),sig));
   // Clone only static elements: no event handlers, Svelte anchors or reactive state cross the boundary.
   const next=drawn.map(n=>n.cloneNode(true));require(equal(projection(next,h),sig));
   const dispose=cleanup;cleanup=undefined;dispose();
   require(owns(panel)&&readSelected()===h.guid&&!panel.hasAttribute(MARK)&&panel.childNodes.length===old.length&&old.every((n,i)=>panel.children[i]===n)&&equal(projection(old,h),sig));
   started=true;panel.replaceChildren(...next);require(owns(panel)&&next.every((n,i)=>panel.children[i]===n)&&equal(projection(Array.from(panel.children),h),sig));
   panel.setAttribute(MARK,'1');return 'MOUNTED';
  }catch{
   if(started&&owns(panel)){try{panel.replaceChildren(...old);panel.removeAttribute(MARK);}catch{}}
   if(cleanup){try{cleanup();}catch{}}
   return 'LEGACY_RETAINED';
  }finally{busy=false;}
 }};
}
