import {PAGE_SIZE,type AchievementRow,type AchievementSnapshot} from './achievement-list.ts';
import type {FilterSnapshot} from './filter-controls.ts';
/** Synthetic only. No game IDs, Save, Writer or session. */
export function createLegacyAchievementFixture(filters:()=>FilterSnapshot){
 const data:AchievementRow[]=Array.from({length:241},(_,i)=>({guid:`fixture-${String(i).padStart(3,'0')}`,title:`検証実績 ${String(i).padStart(3,'0')}`,kind:i%4===2?'slot-missing':'slot',sourceKnown:i%4!==3,complete:i%4===2?null:i%4===0,current:i%4===2?null:String(i),id:i%4===2?null:String(i),imageEnabled:false,externalUnknown:false}));
 let limit=PAGE_SIZE,selectedGuid:string|null=null,selects=0,moreCount=0;
 function read():AchievementSnapshot{const f=filters(),q=f.achievementSearch.trim().toLocaleLowerCase();let rows=data.filter(r=>(!q||`${r.title} ${r.guid} ${r.id}`.toLocaleLowerCase().includes(q))&&(f.achievementFilter==='all'||f.achievementFilter==='complete'&&r.complete===true||f.achievementFilter==='incomplete'&&r.complete===false||f.achievementFilter==='missing'&&r.kind==='slot-missing'||f.achievementFilter==='unknown-source'&&!r.sourceKnown));
 // Synthetic values are bounded small integers. Production ordering remains in its controller.
 if(f.achievementSort==='name')rows.sort((a,b)=>a.title.localeCompare(b.title,'ja'));else if(f.achievementSort==='progress-desc')rows.sort((a,b)=>Number(b.current)-Number(a.current));else if(f.achievementSort==='progress-asc')rows.sort((a,b)=>Number(a.current)-Number(b.current));else if(f.achievementSort==='completed-first')rows.sort((a,b)=>Number(b.complete===true)-Number(a.complete===true));
 return {rows:rows.slice(0,limit),total:rows.length,limit,selectedGuid,empty:'no-match'};}
 return {read,selectGuid(guid:string){selectedGuid=guid;selects++;},showMore(){limit+=PAGE_SIZE;moreCount++;},resetPaging(){limit=PAGE_SIZE;},metrics(){return {selects,moreCount,selectedGuid};}};
}
