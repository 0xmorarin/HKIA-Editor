/** Display-only projection of already-resolved slot facts. Never infer a save value or edit permission. */
export type CounterRecord=Readonly<{current:string;documentId:string;onlyCountUniques:boolean|null;countedGuidsCount:number;countedValues:Readonly<{kind:'NULL'}|{kind:'ARRAY';count:number}>}>;
export type CounterState=Readonly<{kind:'UNKNOWN'}|{kind:'ABSENT'}|{kind:'RECORDED';record:CounterRecord}>;
export type Child=Readonly<{guid:string;title:string;state:'MISSING'|'COMPLETE'|'INCOMPLETE'|'UNKNOWN';current:string|null}>;
export type Group=Readonly<{guid:string;name:string;definitionGuid:string;referenceCount:number;savedCount:number;completeCount:number;memberCount:number;counterState:'UNKNOWN'|'ABSENT'|'RECORDED';current:string|null}>;
export type Reward=Readonly<{kind:'NONE'}|{kind:'DEFINED';itemId:string;name:string;quantity:string}>;
export type Facts=Readonly<{guid:string;definition:Readonly<{key:string;counterName:string;threshold:string;counterGuid:string;builtInReferences:number|null;counter:CounterState;reward:Reward;groupCondition:boolean;conditionMembers:Readonly<{counterGuid:string;total:number;children:readonly Child[]}>|null;dlcCondition:boolean}>|null;group:Group|null}>;
export type FactsSnapshot=Readonly<{selectedGuid:string|null;facts:Facts|null}>;
export type Line=Readonly<{label:string;value:string}>;
const text=(x:unknown):x is string=>typeof x==='string'&&x.length>0&&x.length<=8192;
const numeric=(x:unknown):x is string=>typeof x==='string'&&x.length<=128&&/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(x);
const positive=(x:unknown):x is string=>typeof x==='string'&&x.length<=20&&/^[1-9]\d*$/.test(x);
const count=(x:unknown):x is number=>typeof x==='number'&&Number.isSafeInteger(x)&&x>=0;
function invalid():never{throw Error('ACH_FACTS_INVALID')}
export function validateFacts(s:FactsSnapshot):FactsSnapshot{
 if(!s||!(s.selectedGuid===null||text(s.selectedGuid)))invalid();
 if(s.facts===null)return s;
 const f=s.facts;if(!f||!text(f.guid)||f.guid!==s.selectedGuid)invalid();
 const d=f.definition;
 if(d!==null){
  if(!d||!text(d.key)||!text(d.counterName)||!numeric(d.threshold)||!text(d.counterGuid)||!(d.builtInReferences===null||count(d.builtInReferences))||typeof d.groupCondition!=='boolean'||typeof d.dlcCondition!=='boolean'||!d.groupCondition&&d.builtInReferences!==null)invalid();
  const c=d.counter;if(!c||!['UNKNOWN','ABSENT','RECORDED'].includes(c.kind))invalid();
  if(c.kind==='RECORDED'){
   const r=c.record;if(!r||!numeric(r.current)||!text(r.documentId)||!(r.onlyCountUniques===null||typeof r.onlyCountUniques==='boolean')||!count(r.countedGuidsCount)||!r.countedValues||!(r.countedValues.kind==='NULL'||r.countedValues.kind==='ARRAY'&&count(r.countedValues.count)))invalid();
  }else if('record' in c)invalid();
  const m=d.conditionMembers;if(m!==null){if(!d.groupCondition||!m||m.counterGuid!==d.counterGuid||!count(m.total)||!Array.isArray(m.children)||m.children.length>128||m.children.length>m.total)invalid();const ids=new Set<string>();for(const child of m.children){if(!child||!text(child.guid)||!text(child.title)||ids.has(child.guid)||!['MISSING','COMPLETE','INCOMPLETE','UNKNOWN'].includes(child.state)||!(child.current===null||numeric(child.current))||child.state==='MISSING'&&child.current!==null||child.state==='INCOMPLETE'&&child.current===null)invalid();ids.add(child.guid);}}
  const reward=d.reward;if(!reward||!(reward.kind==='NONE'&&!('itemId' in reward)&&!('quantity' in reward)||reward.kind==='DEFINED'&&positive(reward.itemId)&&positive(reward.quantity)&&text(reward.name)))invalid();
 }
 const g=f.group;
 if(g!==null){
  if(!g||!text(g.guid)||!text(g.name)||!g.name.split('.')[0]||!text(g.definitionGuid)||!count(g.referenceCount)||!count(g.savedCount)||!count(g.completeCount)||!count(g.memberCount)||g.completeCount>g.savedCount||g.savedCount>g.memberCount||!['UNKNOWN','ABSENT','RECORDED'].includes(g.counterState)||!(g.counterState==='RECORDED'?numeric(g.current):g.current===null))invalid();
 }
 return s;
}
export function counterLines(d:NonNullable<Facts['definition']>):readonly Line[]{
 const c=d.counter;const out:Line[]=[{label:'達成条件カウンター',value:d.counterName},{label:'条件値（シリアライズ値）',value:d.threshold}];
 if(d.builtInReferences!==null)out.push({label:'組み込み完了値（参照実績数）',value:String(d.builtInReferences)});
 out.push({label:'関連カウンターGUID',value:d.counterGuid},{label:'保存済み関連カウンター',value:c.kind==='UNKNOWN'?'UNKNOWN（Counter Domain認識不可）':c.kind==='ABSENT'?'未保存 / 未生成（0とは断定しません）':c.record.current});
 if(c.kind==='RECORDED'){const r=c.record;out.push({label:'関連カウンターDocument ID',value:r.documentId},{label:'OnlyCountUniques（v3.0.1定義）',value:r.onlyCountUniques===null?'UNKNOWN':String(r.onlyCountUniques)},{label:'保存CountedGuids件数',value:String(r.countedGuidsCount)},{label:'保存CountedValues',value:r.countedValues.kind==='NULL'?'null（空配列と異なる）':`${r.countedValues.count}件`});}
 return out;
}
export function rewardLines(reward:Reward):readonly Line[]{return [{label:'定義上のアイテム報酬',value:reward.kind==='DEFINED'?`${reward.name}（ID ${reward.itemId}） × ${reward.quantity}`:'なし（数量0）'},{label:'実際の報酬受取状態',value:reward.kind==='DEFINED'?'未判定（受取記録・付与処理と照合できていません）':'アイテム報酬の定義なし'}];}
export function groupLines(g:Group):readonly Line[]{return [{label:'定義内グループ名',value:g.name.split('.')[0]},{label:'定義の参照数',value:String(g.referenceCount)},{label:'保存済み参照の達成',value:`${g.completeCount}/${g.savedCount}件（未保存 ${g.memberCount-g.savedCount}件）`},{label:'グループカウンターの保存値',value:g.counterState==='UNKNOWN'?'UNKNOWN（Counter Domain認識不可）':g.current??'未保存 / 未生成'},{label:'グループカウンターGUID',value:g.guid},{label:'個別実績の定義参照GUID',value:g.definitionGuid}];}
export function childValue(c:Child):string{return c.state==='MISSING'?'未保存（未達成と断定不可）':c.state==='COMPLETE'?'達成済み':c.state==='INCOMPLETE'?`未達成（進捗 ${c.current}）`:'UNKNOWN';}
export function createFactsPort(b:{selectedGuid():string|null;read():FactsSnapshot}){return {read(){const expected=b.selectedGuid(),s=validateFacts(b.read());if(s.selectedGuid!==expected||b.selectedGuid()!==expected)throw Error('ACH_FACTS_STALE_SELECTION');return s;}};}
