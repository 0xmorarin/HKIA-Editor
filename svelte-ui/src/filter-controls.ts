/** Presentation contract pinned to V33 index.html and app.js event bindings. */
export const filterControls = {
  achievementSearch: {type:'search', label:'実績を検索', placeholder:'日本語名・英語名・GUIDで検索', event:'input', initial:''},
  achievementFilter: {type:'select', label:'達成状況', event:'change', initial:'all', options:[['all','すべて'],['complete','達成済み'],['incomplete','未達成'],['missing','定義のみ・未保存'],['unknown-source','保存済み・定義UNKNOWN']]},
  achievementImageFilter: {type:'select', label:'実績画像で絞り込み', event:'change', initial:'all', options:[['all','全画像状態'],['exact','直接画像あり'],['source-null','直接画像 SOURCE_NULL'],['unknown','画像未照合']]},
  achievementSort: {type:'select', label:'実績の並び順', event:'change', initial:'source', options:[['source','元の順番'],['name','名称順'],['progress-desc','進捗値の大きい順'],['progress-asc','進捗値の小さい順'],['completed-first','達成済みを先頭']]},
  collectionSearch: {type:'search', label:'コレクションカテゴリを検索', placeholder:'コレクションカテゴリを検索', event:'input', initial:''},
  collectionStatusFilter: {type:'select', label:'コレクション収集履歴で絞り込み', event:'change', initial:'all', options:[['all','全カテゴリ'],['has-record','収集履歴あり'],['no-record','収集履歴なし'],['unknown','未照合']]},
  collectionSort: {type:'select', label:'コレクションの並び順', event:'change', initial:'source', options:[['source','定義順'],['name','名称順'],['record-desc','記録ID数の多い順']]},
} as const;
export type FilterControlId = keyof typeof filterControls;
export type FilterSnapshot = Readonly<Record<FilterControlId,string>> & {readonly imageVisible:boolean};
export const filterIds=Object.keys(filterControls) as FilterControlId[];
export const achievementSelects=['achievementFilter','achievementImageFilter','achievementSort'] as const;
export const collectionSelects=['collectionStatusFilter','collectionSort'] as const;
export function validateValue(id: FilterControlId,value: unknown): value is string {
  if(typeof value!=='string') return false;
  const c=filterControls[id];
  return c.type==='search'||c.options.some(([v])=>v===value);
}
export function assertSnapshot(s: FilterSnapshot): FilterSnapshot {
  if(!s||typeof s.imageVisible!=='boolean'||filterIds.some(id=>!validateValue(id,s[id]))) throw new Error('LEGACY_FILTER_INCOHERENT');
  return s;
}
export interface FilterPort {read():FilterSnapshot; change(id:FilterControlId,value:string):void}
export interface LegacyFilterBinding {read():FilterSnapshot; writeAndDispatch(id:FilterControlId,value:string,event:'input'|'change'):void; invalidate?():void}
/** Legacy controls own values. Never retain a second set of filter or save state. */
export function createLegacyFilterPort(binding:LegacyFilterBinding):FilterPort {
  return {read:()=>assertSnapshot(binding.read()),change(id,value){
    if(!Object.hasOwn(filterControls,id)||!validateValue(id,value)) throw new Error('LEGACY_FILTER_INVALID_INTENT');
    const before=assertSnapshot(binding.read());
    if(id==='achievementImageFilter'&&!before.imageVisible) throw new Error('LEGACY_FILTER_HIDDEN');
    try {
      binding.writeAndDispatch(id,value,filterControls[id].event);
      if(assertSnapshot(binding.read())[id]!==value) throw new Error('LEGACY_FILTER_POSTCONDITION');
    } finally {binding.invalidate?.();}
  }};
}
