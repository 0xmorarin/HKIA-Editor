import {achievementImagePresentation,type AchievementImage} from './achievement-list.ts';
/** Bounded display contract. The binding owns category, definition, filters, selection and source evidence. */
export const ITEM_PAGE=100;
export const ITEM_VIEW_LIMIT=1200; // isolated fixture bound only
export type History=Readonly<{kind:'unknown'}|{kind:'known';status:string;recorded:boolean;rawTicks:string|null;calendar:string|null}>;
export type ItemRow=Readonly<{id:number;key:string;guid:string;history:History;parent?:{id:number;cross:boolean};spritePathId?:string;image?:AchievementImage|null}>;
export type DefinitionRow=Readonly<{key:string;guid:string;description:string|null;directImageNull:boolean}>;
export type ItemFilter=Readonly<{query:string;history:'all'|'collected'|'missing';sort:'source'|'name'|'id'}>;
export type DetailSnapshot=Readonly<{categoryKey:string|null;title:string;categoryDescription:string;definitions:readonly DefinitionRow[];definitionKey:string|null;detailDescription:string;hint:string;matched:boolean;filter:ItemFilter;rows:readonly ItemRow[];total:number;limit:number;selectedItem:ItemRow|null}>;
export interface DetailBinding{read():DetailSnapshot;selectDefinition(key:string):void;changeFilter(filter:ItemFilter):void;inspect(id:number):void;showMore():void;invalidate?():void}
const text=(v:unknown):v is string=>typeof v==='string'&&v.length<=4096;
const nonempty=(v:unknown):v is string=>text(v)&&v.length>0;
const id=(v:unknown):v is number=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=2147483647;
const int64=(s:unknown)=>typeof s==='string'&&/^-?(0|[1-9][0-9]{0,18})$/.test(s)&&BigInt(s)>=-9223372036854775808n&&BigInt(s)<=9223372036854775807n;
export function validFilter(f:ItemFilter){return !!f&&text(f.query)&&['all','collected','missing'].includes(f.history)&&['source','name','id'].includes(f.sort);}
export const itemImagePresentation=achievementImagePresentation;
export function itemPresentation(r:ItemRow){const h=r.history;return {mark:h.kind==='unknown'?'?':h.recorded?'✓':'—',markClass:h.kind==='unknown'?'unknown-mark':h.recorded?'collected-mark':'missing-mark',name:r.key||`ItemId ${r.id}`,status:h.kind==='unknown'?'未照合':`${h.status} · ${h.recorded?'履歴あり':'履歴なし'}`,ticks:h.kind==='known'&&h.recorded?`100ns ticks ${h.rawTicks??'UNKNOWN'}${h.calendar?' · '+h.calendar+'（timezone UNKNOWN）':''}`:null,parent:r.parent?`親ID ${r.parent.id}${r.parent.cross?'（他カテゴリ）':''}`:null};}
export function listCaption(total:number,limit:number){return `該当 ${total}件（${Math.min(total,limit)}件表示）。履歴なしは未取得や未解放を意味しません。日時は保存済み100ns ticksを表示し、UTC・Kindは未検証です。`;}
function validRow(r:ItemRow){if(!r||!id(r.id)||!text(r.key)||!nonempty(r.guid)||!r.history||!['known','unknown'].includes(r.history.kind)||r.parent!==undefined&&(!id(r.parent.id)||typeof r.parent.cross!=='boolean')||r.spritePathId!==undefined&&!nonempty(r.spritePathId)||r.image!=null&&(!nonempty(r.image.status)||r.image.image!=null&&typeof r.image.image!=='string'||r.image.spritePathId!=null&&typeof r.image.spritePathId!=='string'))return false;const h=r.history;return h.kind==='unknown'||(nonempty(h.status)&&typeof h.recorded==='boolean'&&(h.rawTicks===null||int64(h.rawTicks))&&(h.calendar===null||nonempty(h.calendar))&&(h.recorded||h.rawTicks===null&&h.calendar===null));}
// Canonical scalar projections are captured BEFORE invoking a binding. They cannot
// be altered by a binding mutating a reused row/filter object in place.
const rowKey=(r:ItemRow)=>JSON.stringify([r.id,r.key,r.guid,r.history.kind==='unknown'?['unknown']:['known',r.history.status,r.history.recorded,r.history.rawTicks,r.history.calendar],r.parent?[r.parent.id,r.parent.cross]:null,r.spritePathId??null,r.image?[r.image.status,r.image.image??null,r.image.spritePathId??null]:null]);
const selectedKey=(s:DetailSnapshot)=>s.selectedItem===null?null:rowKey(s.selectedItem);
const filterKey=(f:ItemFilter)=>JSON.stringify([f.query,f.history,f.sort]);
const prefixKeys=(s:DetailSnapshot)=>s.rows.map(rowKey);
const samePrefix=(keys:readonly string[],s:DetailSnapshot)=>s.rows.length>=keys.length&&keys.every((k,i)=>k===rowKey(s.rows[i]));
export function validateDetail(s:DetailSnapshot):DetailSnapshot{
 if(!s||!(s.categoryKey===null||nonempty(s.categoryKey))||!text(s.title)||!text(s.categoryDescription)||!text(s.detailDescription)||!text(s.hint)||!Array.isArray(s.definitions)||s.definitions.length>512||!(s.definitionKey===null||nonempty(s.definitionKey))||typeof s.matched!=='boolean'||!validFilter(s.filter)||!s.matched&&s.filter.history!=='all'||!Array.isArray(s.rows)||!Number.isSafeInteger(s.total)||s.total<0||!Number.isSafeInteger(s.limit)||s.limit<ITEM_PAGE||s.limit>ITEM_VIEW_LIMIT||s.limit%ITEM_PAGE!==0||s.rows.length!==Math.min(s.total,s.limit)||s.categoryKey===null&&(s.definitions.length!==0||s.definitionKey!==null)||s.definitionKey===null&&(s.total!==0||s.selectedItem!==null))throw Error('COLLECTION_DETAIL_INVALID');
 const keys=new Set<string>();for(const d of s.definitions){if(!d||!nonempty(d.key)||!nonempty(d.guid)||!(d.description===null||text(d.description))||typeof d.directImageNull!=='boolean'||keys.has(d.key))throw Error('COLLECTION_DEFINITION_INVALID');keys.add(d.key);}if(s.definitionKey!==null&&!keys.has(s.definitionKey))throw Error('COLLECTION_DEFINITION_NOT_IN_CATEGORY');
 const ids=new Set<number>();for(const r of s.rows){if(!validRow(r)||ids.has(r.id)||!s.matched&&r.history.kind!=='unknown'||s.filter.history!=='all'&&(r.history.kind!=='known'||r.history.recorded!==(s.filter.history==='collected')))throw Error('COLLECTION_ITEM_INVALID');ids.add(r.id);}if(s.selectedItem!==null){if(!validRow(s.selectedItem)||!s.matched&&s.selectedItem.history.kind!=='unknown')throw Error('COLLECTION_INSPECTOR_INVALID');const visible=s.rows.find(r=>r.id===s.selectedItem?.id);if(visible&&rowKey(visible)!==rowKey(s.selectedItem))throw Error('COLLECTION_INSPECTOR_INVALID');}return s;
}
export function createDetailPort(b:DetailBinding){
 const read=()=>validateDetail(b.read());
 // One validation witness, not a second selection owner. V33 retains the inspected
 // ID across definitions; the binding alone decides which definition contains it.
 let witness:{category:string;definition:string;matched:boolean;id:number;row:string}|null=null;
 const observe=(s:DetailSnapshot)=>{if(s.categoryKey===null||s.definitionKey===null||witness&&(witness.category!==s.categoryKey||witness.matched!==s.matched))witness=null;if(s.categoryKey!==null&&s.definitionKey!==null&&s.selectedItem!==null)witness={category:s.categoryKey,definition:s.definitionKey,matched:s.matched,id:s.selectedItem.id,row:rowKey(s.selectedItem)};return s;};
 const invoke=(fn:()=>void,check:(s:DetailSnapshot)=>boolean)=>{try{fn();const after=read();if(!check(after))throw Error('COLLECTION_DETAIL_POSTCONDITION');return after;}finally{b.invalidate?.();}};
 const anchor=(s:DetailSnapshot)=>({categoryKey:s.categoryKey,definitionKey:s.definitionKey,matched:s.matched,filter:filterKey(s.filter),selected:selectedKey(s),total:s.total,limit:s.limit});
 const sameScope=(a:DetailSnapshot,s:ReturnType<typeof anchor>)=>a.categoryKey===s.categoryKey&&a.definitionKey===s.definitionKey&&a.matched===s.matched;
 return {read:()=>observe(read()),
  selectDefinition(key:string){const s=observe(read());if(!s.definitions.some(d=>d.key===key))throw Error('COLLECTION_DEFINITION_NOT_VISIBLE');const before=anchor(s),prior=witness;observe(invoke(()=>b.selectDefinition(key),a=>{
   if(a.categoryKey!==before.categoryKey||a.matched!==before.matched||a.definitionKey!==key||a.limit!==ITEM_PAGE||a.filter.query!==''||a.filter.history!=='all'||a.filter.sort!=='source')return false;
   if(key===before.definitionKey)return selectedKey(a)===before.selected&&(before.selected===null||a.total>0);
   // A different definition may retain the exact old identity only if membership
   // is visible or was observed for that same definition. No arbitrary new selection.
   const visible=prior&&a.rows.find(r=>r.id===prior.id);
   if(visible&&rowKey(visible)!==prior!.row)return false;
   const expected=prior&&a.total>0&&(visible||prior.definition===key)?prior.row:null;
   return selectedKey(a)===expected;
  }));},
  filter(f:ItemFilter){const s=read();if(!s.definitionKey||!validFilter(f)||!s.matched&&f.history!=='all')throw Error('COLLECTION_FILTER_DENIED');const before=anchor(s),desired={...f},expected=filterKey(desired);invoke(()=>b.changeFilter(desired),a=>sameScope(a,before)&&a.limit===ITEM_PAGE&&filterKey(a.filter)===expected&&selectedKey(a)===before.selected);},
  inspect(id:number){const s=read(),row=s.rows.find(r=>r.id===id);if(!row)throw Error('COLLECTION_ITEM_NOT_VISIBLE');const before=anchor(s),target=rowKey(row),prefix=prefixKeys(s);invoke(()=>b.inspect(id),a=>sameScope(a,before)&&a.total===before.total&&a.limit===before.limit&&filterKey(a.filter)===before.filter&&samePrefix(prefix,a)&&selectedKey(a)===target);},
  more(){const s=read();if(s.total<=s.limit||s.limit+ITEM_PAGE>ITEM_VIEW_LIMIT)throw Error('COLLECTION_PAGE_DENIED');const before=anchor(s),prefix=prefixKeys(s);invoke(b.showMore,a=>sameScope(a,before)&&a.total===before.total&&a.limit===before.limit+ITEM_PAGE&&filterKey(a.filter)===before.filter&&selectedKey(a)===before.selected&&samePrefix(prefix,a));}
 };
}
export type DetailPort=ReturnType<typeof createDetailPort>;
/** Exact legacy query/sort behavior; fixture only. Production controller supplies bounded rows. */
export function filterFixtureItems(items:readonly ItemRow[],f:ItemFilter,matched:boolean){const q=f.query.trim().toLowerCase();const rows=items.filter(r=>(!q||r.key.toLowerCase().includes(q)||String(r.id).includes(q)||r.guid.includes(q)||r.spritePathId===q)&&(f.history==='all'||matched&&r.history.kind==='known'&&r.history.recorded===(f.history==='collected')));if(f.sort==='name')rows.sort((a,b)=>a.key.localeCompare(b.key,'ja'));if(f.sort==='id')rows.sort((a,b)=>a.id-b.id);return rows;}
