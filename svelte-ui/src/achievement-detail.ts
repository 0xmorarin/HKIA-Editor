/** Read-only display projection. Identity and linked facts are owned by the controller. */
export type DetailRecord=Readonly<{guid:string;title:string;kind:'account'|'slot'|'slot-missing';mapped:boolean;complete:boolean|null;current:string|null;completed:string|null|undefined;documentId:string|null}>;
export type DependencyDisplay=Readonly<{requiredConfirmed:0;requiredConditionalCandidate:number;conditionalDescription:string;related:readonly string[];unknown:readonly string[];safeToAutoApply:false;writerAuthorized:false}>;
export type DetailSnapshot=Readonly<{selectedGuid:string|null;record:DetailRecord|null;dependencies:DependencyDisplay|null}>;
export type DetailLine=Readonly<{label:string;value:string}>;
export const EMPTY_DETAIL='一覧から実績を選択してください。';
export const MISSING_HINT='この定義の実績レコードは今回のSave slotに保存されていません。未達成・進捗0・未解放の証拠ではありません。新規レコード生成と保存出力は禁止です。';
export const LINKAGE_HINT='連動更新は0件です。UNKNOWNをゼロまたは未取得とは解釈しません。';
const text=(v:unknown):v is string=>typeof v==='string'&&v.length>0&&v.length<=8192;
const list=(v:unknown):v is readonly string[]=>Array.isArray(v)&&v.length<=128&&v.every(text)&&new Set(v).size===v.length;
export function validateDetail(s:DetailSnapshot):DetailSnapshot{
 if(!s||!(s.selectedGuid===null||text(s.selectedGuid)))throw Error('ACH_DETAIL_INVALID');
 if(s.record===null){if(s.dependencies!==null||s.selectedGuid!==null)throw Error('ACH_DETAIL_STALE_SELECTION');return s}
 const r=s.record,d=s.dependencies;
 if(!r||!text(r.guid)||r.guid!==s.selectedGuid||!text(r.title)||!['account','slot','slot-missing'].includes(r.kind)||typeof r.mapped!=='boolean'||!(r.complete===null||typeof r.complete==='boolean')||!(r.current===null||text(r.current))||!(r.completed===null||r.completed===undefined||text(r.completed))||!(r.documentId===null||text(r.documentId))||r.kind==='slot'&&r.documentId===null||r.kind==='slot-missing'&&(!r.mapped||r.complete!==null||r.current!==null||r.completed!==undefined||r.documentId!==null))throw Error('ACH_DETAIL_RECORD_INVALID');
 if(!d||d.requiredConfirmed!==0||!Number.isSafeInteger(d.requiredConditionalCandidate)||d.requiredConditionalCandidate<0||d.requiredConditionalCandidate>128||typeof d.conditionalDescription!=='string'||d.conditionalDescription.length>8192||Boolean(d.requiredConditionalCandidate)!==Boolean(d.conditionalDescription)||!list(d.related)||!list(d.unknown)||d.safeToAutoApply!==false||d.writerAuthorized!==false)throw Error('ACH_DETAIL_DEPENDENCY_INVALID');
 return s;
}
export function detailPresentation(r:DetailRecord):readonly DetailLine[]{return [
 {label:'GUID',value:r.guid},{label:'定義照合',value:r.mapped?'照合済み':'UNKNOWN（名称未照合）'},
 {label:'状態',value:r.kind==='slot-missing'?'未保存（状態UNKNOWN）':r.complete===true?'達成済み':r.complete===false?'未達成':'UNKNOWN'},
 {label:'進捗',value:r.current===null?'UNKNOWN（保存値なし）':r.current},
 {label:'達成日時',value:r.kind==='slot-missing'?'UNKNOWN（保存値なし）':r.completed===null?'未設定':r.completed===undefined?'UNKNOWN':r.completed}
 ];}
export function dependencyPresentation(d:DependencyDisplay):readonly DetailLine[]{return [{label:'REQUIRED（適用確認済）',value:`${d.requiredConfirmed}項目`},...(d.requiredConditionalCandidate?[{label:'REQUIRED（条件付き候補）',value:`${d.requiredConditionalCandidate}項目・未検証`}]:[]),{label:'RELATED（自動変更なし）',value:`${d.related.length}系統`},{label:'UNKNOWN（変更禁止）',value:`${d.unknown.length}系統`}];}
export interface AchievementDetailPort{read():DetailSnapshot}
export function createAchievementDetailPort(b:{selectedGuid():string|null;read():DetailSnapshot}):AchievementDetailPort{return {read(){const expected=b.selectedGuid(),s=validateDetail(b.read());if(s.selectedGuid!==expected||b.selectedGuid()!==expected)throw Error('ACH_DETAIL_STALE_SELECTION');return s}}}
