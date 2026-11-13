import {createAchievementPort,validateSnapshot,MAX_VISIBLE,PAGE_SIZE,type AchievementSnapshot,type AchievementPort} from './achievement-list.ts';
/** Product controller remains sole authority. A validated detached projection is disposable. */
export type Draw=(host:HTMLDivElement,snapshot:AchievementSnapshot,port:AchievementPort)=>()=>void;
const require=(v:unknown)=>{if(!v)throw Error('PRODUCT_ACH_LIST_CONTRACT');};
// Compare all element attributes, text and structure; ignore only the candidate stable-ID annotation.
function signature(e:Element):unknown {
 const attributes=Array.from(e.attributes).filter(a=>a.name!=='data-achievement-guid'&&!(a.name==='class'&&!a.value)).map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]));
 const children=Array.from(e.children);return [e.tagName,attributes,children.length?Array.from(e.childNodes).filter(n=>n.nodeType===3&&n.textContent?.trim()).map(n=>n.textContent):e.textContent,children.map(signature)];
}
const equal=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
function project(host:HTMLDivElement,s:AchievementSnapshot,candidate=false){
 require(host.tagName==='DIV'&&host.id==='achievementsList'&&host.className==='achievement-list');
 const more=s.total>s.limit;const children=Array.from(host.children);require(children.length===(s.rows.length||1)+Number(more));
 const buttons=new Map<string,HTMLButtonElement>();
 if(!s.rows.length)require(children[0].tagName==='P'&&children[0].className==='placeholder');
 for(const [i,r] of s.rows.entries()){
  const b=children[i] as HTMLButtonElement;require(b.tagName==='BUTTON'&&b.type==='button'&&b.classList.contains('achievement-row')&&b.classList.contains('selected')===(r.guid===s.selectedGuid)&&(!candidate||b.getAttribute('data-achievement-guid')===r.guid));buttons.set(r.guid,b);
 }
 const next=more?children.at(-1) as HTMLButtonElement:null;if(next)require(next.tagName==='BUTTON'&&next.type==='button'&&next.className==='btn-secondary show-more'&&!next.disabled);
 return {buttons,next,signature:children.map(signature)};
}
export function createProductAchievementListBridge(doc:Document,draw:Draw){
 let live:{legacy:HTMLDivElement;candidate:HTMLDivElement;dispose:()=>void;token:object}|null=null;
 let snapshot:AchievementSnapshot|null=null,revision=0,busy=false,drawing=false,disabled=false;
 const owns=(h:HTMLDivElement)=>{const a=doc.querySelectorAll('[id="achievementsList"]');return a.length===1&&a[0]===h;};
 const dispose=(fn:()=>void)=>{try{fn();}catch{}};
 function restore(){snapshot=null;const x=live;if(!x)return;live=null;if(!owns(x.candidate)){disabled=true;if(!x.candidate.parentElement)dispose(x.dispose);return;}try{x.candidate.replaceWith(x.legacy);require(owns(x.legacy));}catch{disabled=true;return;}dispose(x.dispose);}
 function render(host:HTMLDivElement,input:AchievementSnapshot):'MOUNTED'|'LEGACY_RETAINED'{
  if(disabled||drawing||live||!owns(host))return 'LEGACY_RETAINED';
  let old:ReturnType<typeof project>;let s:AchievementSnapshot;try{s=validateSnapshot(input);s=Object.freeze({...s,rows:Object.freeze(s.rows.map(r=>Object.freeze({...r,image:r.image?Object.freeze({...r.image}):r.image})))});old=project(host,s);snapshot=s;revision++;}catch{snapshot=null;return 'LEGACY_RETAINED';}
  // The production legacy controller is NOT constrained by the isolated R4 bound.
  if(s.limit>=MAX_VISIBLE&&s.total>s.limit)return 'LEGACY_RETAINED';
  const parent=host.parentElement,token={},candidate=host.cloneNode(false) as HTMLDivElement;candidate.setAttribute('data-hkia-svelte-achievements','1');
  const focus=[...old.buttons].find(([,b])=>doc.activeElement===b)?.[0];let cleanup:(()=>void)|undefined,committed=false;
  function dispatch(button:HTMLButtonElement){require(!busy&&live?.token===token&&owns(candidate));busy=true;const before=revision;try{button.click();require(revision>before);}finally{busy=false;}}
  const port=createAchievementPort({read(){require(snapshot!==null);return snapshot!;},selectGuid(guid){const b=old.buttons.get(guid);require(b);dispatch(b!);},showMore(){require(old.next);dispatch(old.next!);}});
  drawing=true;try{
   cleanup=draw(candidate,s,port);require(typeof cleanup==='function');const next=project(candidate,s,true);require(equal(old.signature,next.signature));
   const before=project(host,s);require(snapshot===s&&owns(host)&&host.parentElement===parent&&equal(before.signature,old.signature)&&before.next===old.next&&[...old.buttons].every(([k,b])=>before.buttons.get(k)===b));
   host.replaceWith(candidate);committed=true;require(owns(candidate)&&candidate.parentElement===parent&&equal(project(candidate,s,true).signature,old.signature));live={legacy:host,candidate,dispose:cleanup,token};if(focus)next.buttons.get(focus)?.focus();return 'MOUNTED';
  }catch{live=null;if(committed){try{candidate.replaceWith(host);require(owns(host));if(focus)old.buttons.get(focus)?.focus();}catch{disabled=true;}}if(cleanup)dispose(cleanup);return 'LEGACY_RETAINED';}finally{drawing=false;}
 }
 return {restore,render};
}
