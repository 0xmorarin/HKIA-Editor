/** Presentation-only projection. Counts and identity come from the existing controller. */
export type CategoryImage = Readonly<{kind:'mapped';status:string;image?:string|null;spritePathId?:string}|{kind:'legacy';image:string}|{kind:'unknown'}>;
export type CategoryRow = Readonly<{key:string;title:string;description:string;image:CategoryImage}>;
export type CategorySnapshot = Readonly<{rows:readonly CategoryRow[];selectedKey:string|null;totalCategories:number}>;
export interface CategoryPort {read():CategorySnapshot;select(key:string):void}
export interface CategoryBinding {read():CategorySnapshot;selectCategory(key:string):void;invalidate?():void}
const assetPath=/^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
export function categoryImagePresentation(image:CategoryImage){
 if(image.kind==='mapped'){
  const known=['EXACT','EXISTING_VERIFIED'].includes(image.status)&&typeof image.image==='string'&&assetPath.test(image.image)&&typeof image.spritePathId==='string';
  return {mapped:true,src:known?'./'+image.image:null,status:image.status,label:known?'カテゴリ画像':'カテゴリ画像：画像未確定',spritePathId:known?image.spritePathId:undefined};
 }
 return {mapped:false,src:image.kind==='legacy'&&image.image.startsWith('./')&&assetPath.test(image.image.slice(2))?image.image:null,status:'UNKNOWN',label:'カテゴリ画像：画像未確定',spritePathId:undefined};
}
const validText=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=4096;
export function assertCategorySnapshot(s:CategorySnapshot):CategorySnapshot{
 if(!s||!Array.isArray(s.rows)||s.rows.length>512||!Number.isSafeInteger(s.totalCategories)||s.totalCategories<s.rows.length||s.totalCategories>512||!(s.selectedKey===null||validText(s.selectedKey)))throw Error('CATEGORY_SNAPSHOT_INVALID');
 const keys=new Set<string>();for(const r of s.rows){if(!r||!validText(r.key)||!validText(r.title)||!validText(r.description)||keys.has(r.key)||!r.image||!['mapped','legacy','unknown'].includes(r.image.kind)||r.image.kind==='mapped'&&!validText(r.image.status)||r.image.kind==='legacy'&&!validText(r.image.image))throw Error('CATEGORY_ROW_INVALID');keys.add(r.key);}
 return s;
}
export function createCategoryPort(binding:CategoryBinding):CategoryPort{
 return {read:()=>assertCategorySnapshot(binding.read()),select(key){const s=assertCategorySnapshot(binding.read());if(!s.rows.some(r=>r.key===key))throw Error('CATEGORY_NOT_VISIBLE');try{binding.selectCategory(key);if(assertCategorySnapshot(binding.read()).selectedKey!==key)throw Error('CATEGORY_SELECTION_POSTCONDITION');}finally{binding.invalidate?.();}}};
}
export function categoryDescription(input:{matched:boolean;definitionCount:number;recorded:number;total:number;parentMatched:boolean;familyRecorded:number;familyTotal:number}):string{
 for(const v of [input.definitionCount,input.recorded,input.total,input.familyRecorded,input.familyTotal])if(!Number.isSafeInteger(v)||v<0)throw Error('CATEGORY_COUNT_INVALID');
 return input.matched?`収集ID照合 ${input.recorded.toLocaleString()} / ${input.total.toLocaleString()} ID${input.parentMatched?` ／ 親単位・参考 ${input.familyRecorded} / ${input.familyTotal}`:''}`:`未照合 / ${input.definitionCount}件の定義`;
}
