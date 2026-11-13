import {categoryDescription,type CategorySnapshot,type CategoryRow} from './category-grid.ts';
import type {FilterSnapshot} from './filter-controls.ts';
/** Synthetic, detached fixture. No game IDs, asset bytes, save fields or product session. */
export function createLegacyCategoryFixture(readFilters:()=>FilterSnapshot){
 const data=[{key:'fixture-a',title:'検証カテゴリ A',count:2,recorded:0,total:4},{key:'fixture-b',title:'検証カテゴリ B',count:3,recorded:2,total:5},{key:'fixture-c',title:'検証カテゴリ C',count:1,recorded:0,total:0}];
 let selectedKey:string|null=null,detailKey:string|null=null,renders=0;
 function read():CategorySnapshot{
  const f=readFilters();const query=f.collectionSearch.trim().toLowerCase();let visible=data.filter(r=>[r.title,r.key].join(' ').toLowerCase().includes(query));
  // Fixture has no Save, so every category is unmatched. Never turn no Save into zero history.
  if(f.collectionStatusFilter!=='all'&&f.collectionStatusFilter!=='unknown')visible=[];
  if(f.collectionSort==='name')visible.sort((a,b)=>a.title.localeCompare(b.title,'ja'));
  const rows:CategoryRow[]=visible.map(r=>({key:r.key,title:r.title,description:categoryDescription({matched:false,definitionCount:r.count,recorded:r.recorded,total:r.total,parentMatched:false,familyRecorded:0,familyTotal:0}),image:{kind:'unknown'}}));
  return {rows,selectedKey,totalCategories:data.length};
 }
 return {read,selectCategory(key:string){selectedKey=key;detailKey=null;renders++;},metrics:()=>({selectedKey,detailKey,renders})};
}
