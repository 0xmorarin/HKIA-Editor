/** Read-only bounded view; the controller owns identity, selection and paging. */
export const PAGE_SIZE=120;
export const MAX_VISIBLE=1200; // Isolated UI bound, not a save or production capability limit.
export type AchievementImage=Readonly<{status:string;image?:string|null;spritePathId?:string}>;
const localImage=/^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
export function achievementImagePresentation(icon?:AchievementImage|null){const status=icon?.status??'NOT_IN_SOURCE_MAP';const known=!!icon&&['EXACT','EXISTING_VERIFIED'].includes(status)&&typeof icon.image==='string'&&localImage.test(icon.image)&&typeof icon.spritePathId==='string'&&icon.spritePathId.length>0;return {status:known?status:['EXACT','EXISTING_VERIFIED'].includes(status)?'UNKNOWN':status,src:known?'./'+icon.image:null,spritePathId:known?icon.spritePathId:undefined};}

export type AchievementRow=Readonly<{guid:string;title:string;kind:'account'|'slot'|'slot-missing';sourceKnown:boolean;complete:boolean|null;current:string|null;id:string|null;imageEnabled:boolean;image?:AchievementImage|null;externalUnknown:boolean}>;
export type AchievementSnapshot=Readonly<{rows:readonly AchievementRow[];selectedGuid:string|null;total:number;limit:number;empty:'unloaded'|'no-match'|'unreadable'}>;
export interface AchievementBinding{read():AchievementSnapshot;selectGuid(guid:string):void;showMore():void;invalidate?():void}
export interface AchievementPort{read():AchievementSnapshot;select(guid:string):void;more():void}
const text=(x:unknown):x is string=>typeof x==='string'&&x.length>0&&x.length<=4096;
export function statusLabel(r:AchievementRow){return r.kind==='slot-missing'?'未保存（状態UNKNOWN）':r.complete===true?'達成済み':r.complete===false?'未達成':'UNKNOWN';}
export function rowPresentation(r:AchievementRow){return {status:statusLabel(r),aria:`${r.title}、${statusLabel(r)}、進捗 ${r.current??'UNKNOWN'}`,subtitle:r.kind==='account'?r.guid:r.kind==='slot-missing'?`${r.guid} · 保存レコードなし`:`${r.guid} · Document ${r.id} · 進捗 ${r.current}`,missing:r.kind==='slot-missing',unknown:!r.sourceKnown,done:r.complete===true};}
export function emptyLabel(s:AchievementSnapshot){return s.empty==='unreadable'?'Achievement Domain UNKNOWN：保存済みモデルを認識できません。ゼロ件・未達成とは解釈しません。':s.empty==='no-match'?'条件に一致する記録がありません。':'セーブを読み込むと記録が表示されます。';}
export function validateSnapshot(s:AchievementSnapshot):AchievementSnapshot{
 if(!s||!Array.isArray(s.rows)||!Number.isSafeInteger(s.total)||s.total<0||!Number.isSafeInteger(s.limit)||s.limit<PAGE_SIZE||s.limit%PAGE_SIZE!==0||s.rows.length!==Math.min(s.total,s.limit)||s.limit>MAX_VISIBLE||s.rows.length>MAX_VISIBLE||!(s.selectedGuid===null||text(s.selectedGuid))||!['unloaded','no-match','unreadable'].includes(s.empty))throw Error('ACHIEVEMENT_SNAPSHOT_INVALID');
 const keys=new Set<string>();for(const r of s.rows){if(!r||!text(r.guid)||!text(r.title)||!['account','slot','slot-missing'].includes(r.kind)||typeof r.sourceKnown!=='boolean'||!(r.complete===null||typeof r.complete==='boolean')||!(r.current===null||text(r.current))||!(r.id===null||text(r.id))||typeof r.imageEnabled!=='boolean'||typeof r.externalUnknown!=='boolean'||r.image!=null&&(!text(r.image.status)||r.image.image!=null&&typeof r.image.image!=='string'||r.image.spritePathId!=null&&typeof r.image.spritePathId!=='string')||keys.has(r.guid)||r.kind==='slot-missing'&&(!r.sourceKnown||r.complete!==null||r.current!==null||r.id!==null)||r.kind==='slot'&&r.id===null)throw Error('ACHIEVEMENT_ROW_INVALID');keys.add(r.guid);}
 return s;
}
export function createAchievementPort(b:AchievementBinding):AchievementPort{
 const read=()=>validateSnapshot(b.read());return {read,select(guid){if(!read().rows.some(r=>r.guid===guid))throw Error('ACHIEVEMENT_NOT_VISIBLE');try{b.selectGuid(guid);if(read().selectedGuid!==guid)throw Error('ACHIEVEMENT_SELECTION_POSTCONDITION');}finally{b.invalidate?.();}},more(){const before=read();if(before.total<=before.limit)throw Error('ACHIEVEMENT_NO_MORE');if(before.limit+PAGE_SIZE>MAX_VISIBLE)throw Error('ACHIEVEMENT_VIEW_LIMIT');try{b.showMore();const after=read();if(after.limit!==before.limit+PAGE_SIZE||after.selectedGuid!==before.selectedGuid||after.total!==before.total)throw Error('ACHIEVEMENT_PAGE_POSTCONDITION');}finally{b.invalidate?.();}}};
}
