import {parseAccount,changeAchievement,exportAccount} from './account.js';
import {readSlotForDisplay,buildCollectionPresentationForSlot,structuralDomainMessage} from './structural-ui-adapter.js';
import {reconcileCollectionItemIds} from './collection-progress.js';
import {reconcileParentFamilies} from './collection-parent-progress.js';
import {serializedGuidToSlotGuid} from './guid.js';
import {extractSaveSet,repackSettingsZip} from './zip.js';
import {offerFile} from './download.js';
import {accountChangeSet,previewAccountChange,batchAccountPlan,filterSortAchievements,collectionHistoryStatus,SLOT_WRITER_CAPABILITY,WEB05_WRITER_PORT,achievementReadStatus,dependencyInspector,previewNativeAchievementIntent,previewNativeCollectionIntent,inspectCounterDraft} from './ui-state.js';
import {collectionHistoryUiStatus} from './collection-history-ui.js';

const el=id=>document.getElementById(id);
const state={account:null,accountOriginal:null,accountBaseline:null,history:[],visibleAccountGuids:[],achLimit:120,save:null,saveOriginal:null,slotEvidence:null,source:'account',originalName:null,originalBytes:null,dirty:false,selectedAchievement:null,selectedCollection:null,selectedCollectionDefinition:null,itemManifest:null,parentManifest:null,collectionMatch:null,parentMatch:null,collectionReadModel:null,collectionHistoryDisplay:null,selectedItemId:null,archiveLoaded:false,collections:[],collectionDefinitions:[],achievementDefinitions:new Map(),slotCounterDefinitions:new Map(),slotAchievementDefinitions:new Map(),localAchievementDefinitions:new Map(),slotGroupMembers:new Map(),slotCountersByGuid:new Map(),slotAchievementsByGuid:new Map(),localAchievementLocales:new Map()};
const categoriesJP={balloons:'風船',birthdays:'誕生日',characterhats:'キャラクターの帽子',clothing:'洋服',comics:'漫画',critters:'生き物',events:'イベント',fish:'魚',fishalmanacs:'魚図鑑',flowers:'花',food:'料理',furniture:'家具',instructions:'作成手順',musicdiscs:'音楽ディスク',plans:'設計図',potions:'ポーション',recipes:'レシピ',tools:'道具',trinkets:'小物',weather:'天候',citytown:'シティタウン',plushpals:'ぬいぐるみ',wheatflourwonderland:'ウィートフラワー・ワンダーランド',teagarden:'ティーガーデン',floorplans:'間取り図'};
function keySuffix(k){return k.replace(/^collections?_group_/,'');}
function titleForCategory(k){const suffix=keySuffix(k);return categoriesJP[suffix]||suffix;}
function node(tag,className,content){const x=document.createElement(tag);if(className)x.className=className;if(content!==undefined)x.textContent=String(content);return x;}
function withChildren(tag,cls,...children){const n=node(tag,cls);for(const child of children)if(child)n.append(child);return n;}
function setTab(name){const ach=name==='achievements';el('achTab').classList.toggle('active',ach);el('colTab').classList.toggle('active',!ach);el('achTab').setAttribute('aria-selected',String(ach));el('colTab').setAttribute('aria-selected',String(!ach));el('achTab').tabIndex=ach?0:-1;el('colTab').tabIndex=ach?-1:0;el('achPanel').hidden=!ach;el('colPanel').hidden=ach;if(!ach)renderCollections();}
function downloadOriginal(){if(state.originalBytes)offerFile(state.originalBytes,state.originalName||'original-backup.bin');}
function downloadAccount(){if(!state.account||state.slotEvidence?.accountExportAllowed===false){error('構造読取専用のSave slotを含むため、編集済みAccountの出力を禁止しています。');return;}try{offerFile(exportAccount(state.account),'settings_edited.json','application/json');setStatus();}catch(e){error(e.message);}}
async function downloadEditedArchive(){
  if(!state.account||!state.dirty||!state.archiveLoaded||state.slotEvidence?.accountExportAllowed===false)return;
  try{
    clearError();el('downloadZip').disabled=true;el('downloadZip').textContent='ZIPを検証・生成中…';
    const archive=await repackSettingsZip(state.originalBytes,exportAccount(state.account));
    const original=state.originalName||'HKIA-backup.zip';
    offerFile(archive,original.replace(/\.zip$/i,'')+'_edited.zip','application/zip');
  }catch(e){error('編集済みZIPの作成に失敗：'+e.message);}finally{el('downloadZip').textContent='編集したZIPを保存';setStatus();}
}
function setStatus(){let n=state.account&&state.save?'Account + Save slot':state.account?'Account JSON':state.save?'Save slot':'未読み込み';const block=state.slotEvidence?.accountExportAllowed===false;el('fileStatus').textContent=n+(state.dirty?' • 未保存の変更':'')+(block?' • 構造READ ONLY':'');el('downloadEdited').disabled=!state.account||!state.dirty||block;el('downloadZip').hidden=!state.archiveLoaded;el('downloadZip').disabled=!state.archiveLoaded||!state.account||!state.dirty||block;}
function displayValue(value){return value===null?'未設定':typeof value==='boolean'?(value?'達成済み':'未達成'):String(value);}
function refreshAccountDirty(){
  state.dirty=Boolean(state.accountBaseline&&accountChangeSet(state.accountBaseline,state.account).length);
  setStatus();renderAccountChangeBar();
}
function rememberAccount(){state.history.push(JSON.stringify(state.account));if(state.history.length>30)state.history.shift();}
function renderAccountChangeBar(){
  const bar=el('accountChangeBar'),bulk=el('accountBatch');
  const eligible=!!state.account&&state.source==='account';
  bar.hidden=!eligible;bulk.hidden=!eligible;
  if(!eligible)return;
  const changes=accountChangeSet(state.accountBaseline,state.account);
  el('accountChangeCount').textContent=`原本から ${changes.length}実績・${changes.reduce((n,r)=>n+r.fields.length,0)}項目を変更`;
  el('undoAccount').disabled=!state.history.length;el('resetAccount').disabled=!changes.length;
  const list=el('accountDiffList');list.replaceChildren();
  if(!changes.length){list.append(node('p','editor-hint','原本からの実質的な変更はありません。'));return;}
  for(const diff of changes){
    const line=node('div','diff-entry');line.append(node('strong','',state.achievementDefinitions.get(diff.guid.toLowerCase())?.key||diff.guid));
    for(const field of diff.fields)line.append(detailLine(field.label,`${displayValue(field.before)} → ${displayValue(field.after)}`));
    list.append(line);
  }
}
function restorePreviousAccount(){
  if(!state.history.length)return;
  state.account=JSON.parse(state.history.pop());
  refreshAccountDirty();renderAchievements();
}
function resetAccount(){
  if(!state.accountBaseline||!state.dirty||!window.confirm('Accountの未保存変更をすべて破棄し、読み込み時の内容に戻しますか？'))return;
  rememberAccount();state.account=structuredClone(state.accountBaseline);
  refreshAccountDirty();renderAchievements();
}
function renderReview(target,edits,onApply){
  target.replaceChildren();
  const box=node('section','review-panel');box.append(node('strong','',`適用前の差分：${edits.length}件`));
  box.append(node('p','editor-hint','変更先：SettingsAccount/settings.jsonのみ。確定連動変更 0件。関連カウンター・報酬・Save slot は更新しません。実機反映は未検証です。'));
  appendDependencies(box,dependencyInspector({domain:'account',hasCounter:true}));
  const list=node('div','review-list');
  for(const edit of edits.slice(0,25)){
    const entry=node('div','diff-entry');entry.append(node('strong','',state.achievementDefinitions.get(edit.guid.toLowerCase())?.key||edit.guid));
    for(const field of edit.fields)entry.append(detailLine(field.label,`${displayValue(field.before)} → ${displayValue(field.after)}`));
    list.append(entry);
  }
  if(edits.length>25)list.append(node('p','editor-hint',`残り ${edits.length-25}件。すべての対象は同じ変更条件で検証されます。`));
  box.append(list);
  const snapshot=JSON.stringify(state.account);
  const controls=node('div','button-row');const apply=node('button','btn-primary','この差分をAccountに反映');apply.type='button';
  const cancel=node('button','btn-secondary','取消');cancel.type='button';
  apply.addEventListener('click',()=>{
    if(JSON.stringify(state.account)!==snapshot){target.replaceChildren(node('p','error-message','プレビュー作成後にAccountが変更されました。変更内容を再確認してください。'));return;}
    onApply();
  },{once:true});cancel.addEventListener('click',()=>target.replaceChildren());
  controls.append(apply,cancel);box.append(controls);target.append(box);
}
function error(message){const e=el('loadError');e.hidden=false;e.textContent=String(message||'不明なエラー');}
function clearError(){el('loadError').hidden=true;el('loadError').textContent='';}
function showInfo(){const a=state.account?Object.keys(state.account.Achievements).length:0;const s=state.slotEvidence?.readable.achievement===false?'UNKNOWN（Domain認識不可）':state.save?.achievements.length??0;el('fileInfo').hidden=false;el('loadDescription').textContent=`読み込み完了：Account実績 ${a}件、Save slot実績 ${s}。保存ファイルは端末外へ送信しません。`;
  const h=state.save?.meta?.header;
  if(h)el('loadDescription').textContent+=` SaveGameV2: ${h.applicationVersion}（内部番号${h.applicationVersionInt}）、${h.platform}、先祖履歴${h.ancestorCount}件、メタデータ${h.metadataEntryCount}件を型付き照合済み。先頭32バイトの認証・改ざん検知は未検証です。`;
  const notice=el('slotReadNotice');notice.hidden=!state.slotEvidence;
  if(state.slotEvidence){const ev=state.slotEvidence;notice.replaceChildren();
    notice.append(node('strong','',ev.mode==='STRUCTURAL_READ_ONLY'?'STRUCTURAL READ ONLY（保存・出力禁止）':'既知バージョンの読取（Native Writer OFF）'),
      node('p','',`Version ${ev.version} ／ Achievement ${structuralDomainMessage(ev,'achievement')} ／ Counter ${structuralDomainMessage(ev,'counter')} ／ CollectionHistory ${structuralDomainMessage(ev,'collection-history')}`));
    if(ev.mode==='STRUCTURAL_READ_ONLY')notice.append(node('p','','未検証構造の追加Unionフィールド Achievement '+(ev.extraFields.achievement??'UNKNOWN')+'件 / Counter '+(ev.extraFields.counter??'UNKNOWN')+'件、未知Union '+ev.unknownUnionTokens+'件。原本を保持し、未知部分の消去・初期化・書戻しを禁止します。v3.0.1の名称とカテゴリは参考照合です。'));
    for(const warning of ev.warnings)notice.append(node('small','',warning+' '));
  }
  setStatus();}
async function loadFile(file){
  clearError();if(!file)return;
  if(file.size>60*1024*1024){error('60MBを超えるファイルは未対応です');return;}
  const bytes=new Uint8Array(await file.arrayBuffer());
  let accountBytes=null,saveBytes=null;
  try{
    if(file.name.toLowerCase().endsWith('.zip')){
      const set=await extractSaveSet(bytes);accountBytes=set.account;saveBytes=set.save;
    }else if(file.name.toLowerCase().endsWith('.json')) accountBytes=bytes;
    else if(/\.(save|bak|lbak)$/i.test(file.name))saveBytes=bytes;
    else throw new Error('対応ファイルはZIP、settings.json、.save、.bak、.lbakです');
    const account=accountBytes?parseAccount(accountBytes):null;
    const slot=saveBytes?readSlotForDisplay(saveBytes):null;
    const save=slot?.save??null;
    const collectionMatch=slot?.evidence.readable['collection-history']&&state.itemManifest?reconcileCollectionItemIds(state.itemManifest,state.collectionDefinitions,save.collectedItemIds):null;
    const parentMatch=collectionMatch&&state.parentManifest?reconcileParentFamilies(state.parentManifest,collectionMatch):null;
    const collectionUI=slot&&state.itemManifest&&state.parentManifest?buildCollectionPresentationForSlot({slot,itemManifest:state.itemManifest,definitions:state.collectionDefinitions,parentManifest:state.parentManifest}):null;
    state.account=account;state.accountOriginal=accountBytes?.slice()||null;state.accountBaseline=account?structuredClone(account):null;state.history=[];
    state.save=save;state.saveOriginal=saveBytes?.slice()||null;state.slotEvidence=slot?.evidence??null;
    state.collectionMatch=collectionMatch;state.parentMatch=parentMatch;state.collectionReadModel=collectionUI?.model??null;state.collectionHistoryDisplay=collectionUI?.display??null;
    state.slotCountersByGuid=new Map((save?.counters||[]).map(r=>[r.guid.toLowerCase(),r]));
    state.slotAchievementsByGuid=new Map((save?.achievements||[]).map(r=>[r.guid.toLowerCase(),r]));
    state.originalBytes=bytes.slice();state.originalName=file.name;state.archiveLoaded=file.name.toLowerCase().endsWith('.zip');
    for(const id of ['achievementSearch','collectionSearch'])el(id).value='';for(const id of ['achievementFilter','collectionStatusFilter'])el(id).value='all';
    state.source=account?'account':'slot';state.visibleAccountGuids=[];state.achLimit=120;el('batchResult').replaceChildren();state.dirty=false;state.selectedAchievement=null;state.selectedCollectionDefinition=null;state.selectedItemId=null;
    showInfo();renderAchievements();renderCollections();
  }catch(e){error(`読み込み失敗：${e.message}`);}
}
function achievements(){
  if(state.source==='account')return Object.entries(state.account?.Achievements||{}).map(([guid,r])=>({id:guid,guid,complete:r.IsComplete,current:r.CurrentValue,completed:r.CompletedTime,kind:'account',sourceKnown:state.achievementDefinitions.has(guid.toLowerCase())}));
  if(!state.save||state.slotEvidence?.readable.achievement===false)return [];
  const saved=state.save.achievements.map(r=>({...r,kind:'slot',guid:r.guid,sourceKnown:state.localAchievementDefinitions.has(r.guid.toLowerCase())}));
  const keys=new Set(saved.map(r=>r.guid.toLowerCase()));
  const missing=[...state.localAchievementDefinitions.values()].filter(d=>!keys.has(d.save_guid)).map(d=>({id:null,guid:d.save_guid,complete:null,current:null,completed:null,kind:'slot-missing',sourceKnown:true}));
  return [...saved,...missing];
}
function slotAchievementGroup(r){
  const ref=state.slotAchievementDefinitions.get(r.guid.toLowerCase());
  return ref?state.slotCounterDefinitions.get(ref.group_counter_guid)?.name.split('.')[0]:null;
}
function localizedAchievement(r,locale='ja'){
  const detail=state.localAchievementDefinitions.get(r.guid.toLowerCase());
  const text=detail?state.localAchievementLocales.get(detail.guid):null;
  return text?.[locale]||null;
}
function achievementTitle(r){
  if(r.kind==='account')return state.achievementDefinitions.get(r.guid.toLowerCase())?.key || '実績 GUID '+r.guid;
  const detail=state.localAchievementDefinitions.get(r.guid.toLowerCase());
  if(detail)return localizedAchievement(r,'ja')?.title || localizedAchievement(r,'en')?.title || detail.key;
  const group=slotAchievementGroup(r);
  return group?`${group} · #${r.id}`:`実績 GUID ${r.guid}`;
}
function completedLabel(r){return r.kind==='slot-missing'?'未保存（状態UNKNOWN）':r.complete===true?'達成済み':r.complete===false?'未達成':'UNKNOWN';}
function appendDependencies(host,deps){
  const panel=node('section','dependency-inspector');panel.append(node('h5','','03 LINKAGE 依存確認（表示のみ）'));
  panel.append(detailLine('REQUIRED（適用確認済）',`${deps.requiredConfirmed}項目`));
  if(deps.requiredConditionalCandidate)panel.append(detailLine('REQUIRED（条件付き候補）',`${deps.requiredConditionalCandidate}項目・未検証`),node('p','editor-hint',deps.conditionalDescription));
  panel.append(detailLine('RELATED（自動変更なし）',`${deps.related.length}系統`),detailLine('UNKNOWN（変更禁止）',`${deps.unknown.length}系統`));
  for(const [label,values] of [['RELATED',deps.related],['UNKNOWN',deps.unknown]])for(const val of values)panel.append(node('p','dependency-line',`${label}: ${val}`));
  panel.append(node('p','editor-hint','連動更新は0件です。UNKNOWNをゼロまたは未取得とは解釈しません。'));host.append(panel);
}

function renderAchievements(){
  const acc=!!state.account,save=!!state.save;
  el('sourceSwitch').hidden=!(acc&&save);
  el('accountSource').disabled=!acc;el('slotSource').disabled=!save;
  el('accountSource').classList.toggle('active',state.source==='account');el('slotSource').classList.toggle('active',state.source==='slot');
  let all=achievements();
  const done=all.filter(x=>x.complete).length;
  el('achCount').textContent=`${all.length}件`;
  el('achSubTitle').textContent=state.source==='account'?'SettingsAccountのMeta実績。関連カウンターはAccountとSave slotに分かれます。':state.slotEvidence?.readable.achievement===false?'Achievement Domain UNKNOWN：解析不能。未保存・未達成や件数0とは判断できません。':'保存済み実績とv3.0.1の820件の定義を区別して表示します。未保存は未達成を意味しません。未検証バージョンの名称・条件は参考照合のみです。';
  const linked=el('achLinkedInfo');linked.hidden=!acc||state.source!=='account';
  if(!linked.hidden){
    const refs=[...state.achievementDefinitions.values()];
    const accountN=refs.filter(r=>r.counter_storage==='Meta').length;
    const slotN=refs.filter(r=>r.counter_storage==='InGame').length;
    linked.textContent=`解析済み定義 ${refs.length}件：関連カウンターはAccount ${accountN}件 / Save slot ${slotN}件。InGame ${slotN}件のGUIDも対応済み（実セーブ未読込の場合、値は未表示）。報酬・プラットフォーム実績は自動同期しません。`;
  }
  el('achSummary').hidden=!all.length;
  el('achSummary').replaceChildren(...[['表示対象',all.length],['保存済み',all.filter(x=>x.kind!=='slot-missing').length],['達成済み',done],['未達成（保存値）',all.filter(x=>x.complete===false).length],['未保存・状態UNKNOWN',all.filter(x=>x.kind==='slot-missing').length]].map(([label,value])=>withChildren('div','metric',node('strong','',value),node('span','',label))));
  const searchText=x=>[achievementTitle(x),x.guid,x.id,x.completed,slotAchievementGroup(x),state.localAchievementDefinitions.get(x.guid.toLowerCase())?.key,state.localAchievementDefinitions.get(x.guid.toLowerCase())?.counter_name,localizedAchievement(x,'en')?.title,localizedAchievement(x,'ja')?.description,localizedAchievement(x,'en')?.description].join(' ');
  all=filterSortAchievements(all,{query:el('achievementSearch').value,filter:el('achievementFilter').value,sort:el('achievementSort').value,searchText});
  state.visibleAccountGuids=state.source==='account'?all.map(x=>x.guid):[];
  renderAccountChangeBar();
  const list=el('achievementsList');list.replaceChildren();
  if(all.length===0){list.append(node('p','placeholder',state.source==='slot'&&state.slotEvidence?.readable.achievement===false?'Achievement Domain UNKNOWN：保存済みモデルを認識できません。ゼロ件・未達成とは解釈しません。':acc||save?'条件に一致する記録がありません。':'セーブを読み込むと記録が表示されます。'));renderEditor();return;}
  const fragment=document.createDocumentFragment();
  for(const r of all.slice(0,state.achLimit)){
    const row=node('button','achievement-row');row.type='button';row.classList.toggle('selected',r.guid===state.selectedAchievement);row.setAttribute('aria-label',`${achievementTitle(r)}、${completedLabel(r)}、進捗 ${r.current===null?'UNKNOWN':r.current}`);
    row.classList.toggle('missing-record',r.kind==='slot-missing');
    const known=r.kind==='account'?state.achievementDefinitions.has(r.guid.toLowerCase()):state.localAchievementDefinitions.has(r.guid.toLowerCase());
    if(!known)row.classList.add('unknown-identity');
    const icon=node('div',`ach-symbol${r.complete?' done':''}`,r.complete?'✓':'☆');
    const middle=withChildren('div','ach-text',node('strong','',achievementTitle(r)),node('small','',r.kind==='account'?r.guid:r.kind==='slot-missing'?`${r.guid} · 保存レコードなし`:`${r.guid} · Document ${r.id} · 進捗 ${r.current}`),!known?node('small','unknown-tag','名称未照合・保存済みレコード'):null);
    const status=node('span',`status-dot${r.complete?' complete':''}`,completedLabel(r));
    row.append(icon,middle,status);row.addEventListener('click',()=>{state.selectedAchievement=r.guid;renderAchievements();el('achievementsList').querySelector('.achievement-row.selected')?.focus();});fragment.append(row);
  }
  list.append(fragment);
  if(all.length>state.achLimit){
    const more=node('button','btn-secondary show-more',`さらに表示（残り ${all.length-state.achLimit}件）`);more.type='button';
    more.addEventListener('click',()=>{state.achLimit+=120;renderAchievements();});list.append(more);
  }
  renderEditor();
}
function detailLine(name,value){return withChildren('div','detail-line',node('b','',name),node('span','',value));}
function renderEditor(){
  const panel=el('editorPanel');panel.replaceChildren();
  const record=achievements().find(r=>r.guid===state.selectedAchievement);
  if(!record){panel.append(node('h4','','達成記録の詳細'),node('p','','一覧から実績を選択してください。'));return;}
  const mapped=record.kind==='account'?state.achievementDefinitions.has(record.guid.toLowerCase()):state.localAchievementDefinitions.has(record.guid.toLowerCase());
  const readStatus=achievementReadStatus(record,mapped);
  panel.append(node('h4','',achievementTitle(record)),detailLine('GUID',record.guid),detailLine('定義照合',mapped?'照合済み':'UNKNOWN（名称未照合）'),detailLine('状態',readStatus.status),detailLine('進捗',record.current===null?'UNKNOWN（保存値なし）':record.current),detailLine('達成日時',readStatus.timeStatus));
  if(record.kind==='slot-missing'){
    panel.append(node('p','editor-hint','この定義の実績レコードは今回のSave slotに保存されていません。未達成・進捗0・未解放の証拠ではありません。新規レコード生成と保存出力は禁止です。'));
    appendDependencies(panel,dependencyInspector({domain:'slot',key:state.localAchievementDefinitions.get(record.guid.toLowerCase())?.key||''}));
    return;
  } 
  if(record.kind==='slot'){
    if(state.slotEvidence?.mode==='STRUCTURAL_READ_ONLY')panel.append(node('p','error-message','構造読取専用：既知フィールドの変更案だけ作成可能です。新バージョンの定義・Counter・Group・未知Unionは参考情報であり、保存・出力はできません。'));
    const ref=state.slotAchievementDefinitions.get(record.guid.toLowerCase());
    const group=ref?state.slotCounterDefinitions.get(ref.group_counter_guid):null;
    const section=node('section','linked-counter-panel');
    section.append(node('h5','','収集・達成グループとの対応（読み取りのみ）'));
    section.append(detailLine('Document ID',record.id));
    const detail=state.localAchievementDefinitions.get(record.guid.toLowerCase());
    if(detail){
      section.append(node('h5','','個別実績の定義と連動する保存値（読み取りのみ）'));
      section.append(detailLine('内部定義名',detail.key));
      const jp=localizedAchievement(record,'ja'),en=localizedAchievement(record,'en');
      if(jp?.title)section.append(detailLine('日本語正式名',jp.title));
      if(en?.title)section.append(detailLine('英語正式名',en.title));
      if(jp?.description)section.append(detailLine('日本語の説明',jp.description));
      if(en?.description)section.append(detailLine('英語の説明',en.description));
      section.append(detailLine('タイトルのローカライズ参照',`${detail.title_table}:${detail.title_string_id}`));
      section.append(detailLine('説明文の参照ID',detail.description_string_id==='0'?'なし':detail.description_string_id));
      section.append(detailLine('達成条件カウンター',detail.counter_name));
      section.append(detailLine('条件値（シリアライズ値）',detail.threshold));
      const countDef=state.slotCounterDefinitions.get(detail.counter_guid);
      if(detail.counter_kind==='GameCounterAchievementsDefinition'&&countDef?.reference_count!=null){
        section.append(detailLine('組み込み完了値（参照実績数）',countDef.reference_count));
        section.append(node('p','editor-hint','このグループ種別は参照実績の件数を組み込み完了値として計算します。シリアライズ条件値だけで達成判定しません。'));
      }
      section.append(detailLine('関連カウンターGUID',detail.counter_guid));
      const c=state.slotCountersByGuid.get(detail.counter_save_guid);
      const counterUnknown=state.slotEvidence?.readable.counter===false;
      section.append(detailLine('保存済み関連カウンター',counterUnknown?'UNKNOWN（Counter Domain認識不可）':c?c.current:'未保存 / 未生成（0とは断定しません）'));
      if(c)section.append(detailLine('関連カウンターDocument ID',c.id));
      if(c){
        const counterDraft=inspectCounterDraft({counter:c,definition:countDef,proposedCurrentValue:c.current});
        section.append(detailLine('OnlyCountUniques（v3.0.1定義）',counterDraft.onlyCountUniques===null?'UNKNOWN':counterDraft.onlyCountUniques?'true':'false'),
          detailLine('保存CountedGuids件数',counterDraft.countedGuidsCount),
          detailLine('保存CountedValues',counterDraft.countedValuesState==='NULL'?'null（空配列と異なる）':counterDraft.countedValuesCount+'件'),
          node('p','editor-hint',`RELATED: ${counterDraft.warnings.join(' / ')}。Counterだけの数値変更やGroupだけの進捗変更は適用不可。`));
        const cf=node('form','native-dry-form');const field=withChildren('label','editor-field',node('span','','関連Counterの変更案（保存不可）'));
        const next=document.createElement('input');next.type='number';next.min='0';next.step='any';next.value=String(c.current);field.append(next);
        const inspect=node('button','btn-secondary','Counter差分・条件を確認');inspect.type='submit';
        const response=node('div','native-dry-result');response.setAttribute('aria-live','polite');cf.append(field,inspect,response);
        next.addEventListener('input',()=>response.replaceChildren());
        cf.addEventListener('submit',e=>{e.preventDefault();response.replaceChildren();try{
          if(next.value.trim()==='')throw new Error('値が必要です');
          const plan=inspectCounterDraft({counter:c,definition:countDef,proposedCurrentValue:Number(next.value)});
          const prep=WEB05_WRITER_PORT.prepareNative({domain:'counter',saveVersion:state.save.version,readEvidence:state.slotEvidence});
          response.append(detailLine('CurrentValue',`${plan.before} → ${plan.after}`),
            node('p','error-message',`保存・出力禁止：${[...plan.blockers,...prep.blockers].join(' / ')}`));
        }catch(err){response.append(node('p','error-message',err.message));}});section.append(cf);
      }

      if(c&&record.complete&&detail.counter_kind!=='GameCounterAchievementsDefinition'&&c.current<detail.threshold)section.append(node('p','editor-hint','達成済みですが、現在のカウンターは定義条件値未満です。進捗は履歴や再計算の影響を受ける可能性があります。'));
      section.append(detailLine('定義上のアイテム報酬',detail.reward_quantity>0?`${detail.reward_item_name}（ID ${detail.reward_item_id}） × ${detail.reward_quantity}`:'なし（数量0）'));
      section.append(detailLine('実際の報酬受取状態',detail.reward_quantity>0?'未判定（受取記録・付与処理と照合できていません）':'アイテム報酬の定義なし'));
      if(detail.counter_kind==='GameCounterAchievementsDefinition'){
        section.append(node('p','editor-hint','02 Group条件：全子実績の明示選択・子の保存済み状態照合・それぞれの達成日時・親Counter・Account Meta rootの整合性が必要です。Group CurrentValue単独編集は禁止。一般Group REQUIRED連動はUNKNOWNです。'));
        const refs=state.slotGroupMembers.get(detail.counter_guid)||[];
        if(refs.length){
          const childList=node('section','linked-counter-panel');
          childList.append(node('h5','',`構成する実績 ${refs.length}件（保存済み状態の照合）`));
          for(const child of refs){
            const saved=state.slotAchievementsByGuid.get(child.save_guid);
            const def=state.localAchievementDefinitions.get(child.save_guid);
            const localized=def?state.localAchievementLocales.get(def.guid):null;
            childList.append(detailLine(localized?.ja?.title||localized?.en?.title||def?.key||child.guid,saved?(saved.complete?'達成済み':`未達成（進捗 ${saved.current}）`):'未保存（未達成と断定不可）'));
          }
          section.append(childList);
        }
      }
      if(detail.required_dlc_u32.some(Boolean))section.append(node('p','editor-hint','この定義にはDLC条件があります。所有権や表示条件は独立して検証が必要です。'));
      section.append(node('p','editor-hint','日本語・英語名はv3.0.1のBabel原文です。報酬の定義は保存済み所持数や受取済み状態を保証しません。'));
    }else section.append(node('p','editor-hint','個別実績の定義は未確認です。'));
    if(group){
      const members=state.slotGroupMembers.get(group.guid)||[];
      const saved=members.map(m=>state.slotAchievementsByGuid.get(m.save_guid)).filter(Boolean);
      const finished=saved.filter(m=>m.complete).length;
      const groupCounter=state.slotCountersByGuid.get(group.save_guid);
      section.append(detailLine('定義内グループ名',group.name.split('.')[0]));
      section.append(detailLine('定義の参照数',group.reference_count));
      section.append(detailLine('保存済み参照の達成',`${finished}/${saved.length}件（未保存 ${members.length-saved.length}件）`));
      section.append(detailLine('グループカウンターの保存値',groupCounter?groupCounter.current:'未保存 / 未生成'));
      section.append(detailLine('グループカウンターGUID',group.guid));
      section.append(detailLine('個別実績の定義参照GUID',ref.guid));
      section.append(node('p','editor-hint','定義内グループ名は個別実績の正式名称ではありません。カウンターは未保存でも正常な場合があります。'));
    }else section.append(node('p','editor-hint','このGUIDの定義参照は未確認です。'));
    appendDependencies(section,dependencyInspector({domain:'slot',key:detail?.key||'',hasCounter:Boolean(detail),hasGroup:Boolean(group)}));
    section.append(node('p','editor-hint',SLOT_WRITER_CAPABILITY.reason));
    const dry=node('form','native-dry-form');dry.append(node('h5','','変更案の確認（保存・出力不可）'));
    const completeLabel=withChildren('label','editor-field',node('span','','変更後の達成状態'));
    const flag=document.createElement('input');flag.type='checkbox';flag.checked=record.complete===true;completeLabel.append(flag);
    const currentLabel=withChildren('label','editor-field',node('span','','変更後の進捗値'));
    const value=document.createElement('input');value.type='number';value.min='0';value.step='any';value.required=true;value.value=String(record.current);currentLabel.append(value);
    const timeLabel=withChildren('label','editor-field',node('span','','変更後の日時（UTC）'));
    const time=document.createElement('input');time.type='text';time.value=record.completed||'';time.placeholder='2026-11-11T00:00:00Z';timeLabel.append(time);
    const draftResult=node('div','native-dry-result');draftResult.setAttribute('aria-live','polite');
    const makeDraft=node('button','btn-secondary','保存不可の差分を確認');makeDraft.type='submit';
    const cancelDraft=node('button','btn-secondary','入力を元に戻す');cancelDraft.type='button';
    cancelDraft.addEventListener('click',()=>{flag.checked=record.complete===true;value.value=String(record.current);time.value=record.completed||'';draftResult.replaceChildren();});
    flag.addEventListener('change',()=>{if(!flag.checked)time.value='';dry.querySelector('.native-dry-result').replaceChildren();});
    for(const field of [value,time])field.addEventListener('input',()=>draftResult.replaceChildren());
    dry.append(completeLabel,currentLabel,timeLabel,withChildren('div','button-row',makeDraft,cancelDraft),draftResult);
    dry.addEventListener('submit',event=>{event.preventDefault();draftResult.replaceChildren();try{
      const plan=previewNativeAchievementIntent({record,mapped,sourceKey:detail?.key||'',complete:flag.checked,current:Number(value.value),completed:time.value.trim()||null});
      draftResult.append(node('strong','','変更前 → 変更後（確定変更は0件）'));
      if(plan.fields.length)for(const d of plan.fields)draftResult.append(detailLine(d.field,`${displayValue(d.before)} → ${displayValue(d.after)}`));
      else draftResult.append(node('p','editor-hint','差分なし'));
      const prepared=WEB05_WRITER_PORT.prepareNative({domain:'achievement',saveVersion:state.save?.version??'UNKNOWN',readEvidence:state.slotEvidence});
      draftResult.append(node('p','error-message',`出力禁止：${[...plan.blockers,...prepared.blockers].join(' / ')}`));
    }catch(e){draftResult.append(node('p','error-message',e.message));}});
    section.append(dry);panel.append(section);return;
  }
  const definition=state.achievementDefinitions.get(record.guid.toLowerCase());
  if(definition?.counter_guid){
    const section=node('section','linked-counter-panel');
    section.append(node('h5','','関連カウンター（実ゲーム定義から特定）'));
    section.append(detailLine('カウンター種別',definition.counter_kind));
    section.append(detailLine('保存領域',definition.counter_storage==='Meta'?'Account / SettingsAccount': 'InGame / save_0.save'));
    section.append(detailLine('カウンターGUID',definition.counter_guid));
    section.append(detailLine('定義の条件値',definition.condition_threshold));
    section.append(detailLine('実績の種別',definition.achievement_type));
    if(definition.built_in_references!==null){
      section.append(detailLine('参照先アチーブメント数',definition.built_in_references));
      section.append(node('p','editor-hint','このカウンターには組み込み完了値があります。条件値だけで達成可否を判断しないでください。'));
    }
    if(definition.counter_storage==='Meta'){
      const c=Object.entries(state.account?.Counters||{}).find(([guid])=>guid.toLowerCase()===definition.counter_guid)?.[1];
      section.append(detailLine('セーブ内カウンター値',c?c.CurrentValue:'未保存 / 検証対象'));
      if(c&&Number.isFinite(c.CurrentValue)&&c.CurrentValue<definition.condition_threshold){
        section.append(node('p','editor-hint','カウンター値が定義条件値より小さい状態です。達成フラグだけ変更しても整合性は保証できません。'));
      }
    }else{
      const wordGuid=serializedGuidToSlotGuid(definition.counter_guid);
      const counter=state.slotCountersByGuid.get(wordGuid);
      if(counter){
        section.append(detailLine('InGame保存カウンター値',counter.current));
        section.append(detailLine('InGame Document ID',counter.id));
        section.append(detailLine('カウント済みGUID数',counter.countedGuids));
        if(counter.current<definition.condition_threshold)section.append(node('p','editor-hint','InGameの保存値は定義の条件値を下回っています。'));
      }else section.append(node('p','editor-hint',state.slotEvidence?.readable.counter===false?'Counter Domain UNKNOWN：値・件数の解釈不可。':state.save?'対象カウンターはこのセーブには保存されていません（未生成の可能性。値0とは断定しません）。':'InGameカウンターの保存値を表示するにはSave slotを読み込んでください。'));

    }
    section.append(node('p','editor-hint',`今回のMeta実績定義に含まれる報酬エントリー：${definition.rewards_count}件（別の報酬経路やプラットフォーム同期は未検証）`));
    panel.append(section);
  }
  appendDependencies(panel,dependencyInspector({domain:'account',hasCounter:Boolean(definition?.counter_guid)}));
  panel.append(node('p','editor-hint','注意：Account実績の変更だけでは、関連カウンター・アイテム報酬・プラットフォーム実績の同期は保証されません。実機反映は未検証です。'));
  const form=node('form');form.autocomplete='off';
  const completeLabel=withChildren('label','editor-field',node('span','','達成状態'));
  const check=document.createElement('input');check.type='checkbox';check.checked=record.complete;const checkRow=withChildren('span','checkbox-row',check,node('span','',record.complete?'達成済み':'未達成'));completeLabel.append(checkRow);
  const numberLabel=withChildren('label','editor-field',node('span','','現在の進捗値'));
  const number=document.createElement('input');number.type='number';number.step='any';number.min='0';number.value=String(record.current);number.required=true;numberLabel.append(number);
  const dateLabel=withChildren('label','editor-field',node('span','','達成日時（UTC、ISO 8601）'));
  const time=document.createElement('input');time.type='text';time.placeholder='2026-11-11T00:00:00Z';time.value=record.completed||'';dateLabel.append(time);
  const hint=node('p','editor-hint','例：2026-08-25T10:30:46.8012402Z。7桁の小数秒まで維持します。未達成の場合は空欄です。');
  check.addEventListener('change',()=>{
    checkRow.querySelector('span').textContent=check.checked?'達成済み':'未達成';
    if(check.checked&&!time.value.trim())time.value=new Date().toISOString();
    if(!check.checked)time.value='';
  });
  const saveButton=node('button','btn-primary','変更内容を確認');saveButton.type='submit';
  const cancelButton=node('button','btn-secondary','入力を取り消す');cancelButton.type='button';cancelButton.addEventListener('click',renderEditor);
  const fieldError=node('p','error-message');fieldError.hidden=true;fieldError.setAttribute('role','alert');
  const review=node('div','');
  form.append(completeLabel,numberLabel,dateLabel,hint,withChildren('div','button-row',saveButton,cancelButton),fieldError,review);
  for(const input of [check,number,time])input.addEventListener('input',()=>review.replaceChildren());
  form.addEventListener('submit',event=>{
    event.preventDefault();fieldError.hidden=true;review.replaceChildren();
    try{
      const val=Number(number.value);if(number.value.trim()===''||!Number.isFinite(val))throw new Error('進捗値が不正です');
      const proposed=previewAccountChange(state.account,record.guid,{IsComplete:check.checked,CurrentValue:val,CompletedTime:time.value.trim()||null});
      if(!proposed.fields.length){review.append(node('p','editor-hint','変更差分はありません。'));return;}
      renderReview(review,[proposed],()=>{
        try{rememberAccount();changeAchievement(state.account,record.guid,proposed.after);refreshAccountDirty();renderAchievements();}
        catch(e){state.account=JSON.parse(state.history.pop());fieldError.textContent=e.message;fieldError.hidden=false;}
      });
    }catch(e){fieldError.textContent=e.message;fieldError.hidden=false;}
  });
  panel.append(form);
}
function formatSourceCounts(recorded,total){return `${recorded.toLocaleString()} / ${total.toLocaleString()} ID`;}
function sourceCollectionStats(key){
  const m=state.collectionMatch;return m?.byKey.get(key)||null;
}
function sourceParentStats(key){return state.parentMatch?.byKey.get(key)||null;}
function renderCollections(){
  const query=el('collectionSearch').value.trim().toLowerCase();
  const grid=el('collectionGrid');grid.replaceChildren();
  let all=state.collections.filter(c=>[titleForCategory(c.key),c.key,c.sprite,c.guid].join(' ').toLowerCase().includes(query));
  const categoryStats=c=>state.collectionDefinitions.filter(r=>r.group===c.key).reduce((o,r)=>{const m=sourceCollectionStats(r.key);o.total+=m?.items.length||0;o.recorded+=m?.recorded.length||0;return o;},{total:0,recorded:0});
  const statusFilter=el('collectionStatusFilter').value;
  if(statusFilter!=='all')all=all.filter(c=>{const v=categoryStats(c);const status=collectionHistoryStatus(Boolean(state.collectionMatch),v.total,v.recorded);return statusFilter==='unknown'?status==='unknown':statusFilter==='has-record'?v.recorded>0&&Boolean(state.collectionMatch):status==='no-record';});
  const sort=el('collectionSort').value;
  if(sort==='name')all.sort((a,b)=>titleForCategory(a.key).localeCompare(titleForCategory(b.key),'ja'));
  if(sort==='record-desc')all.sort((a,b)=>categoryStats(b).recorded-categoryStats(a).recorded||a.order-b.order);
  el('colCount').textContent=`${state.collections.length}カテゴリ`;
  const hist=el('colHistoryInfo');hist.hidden=!state.save;
  if(state.save){
    const m=state.collectionMatch;
    const sourceNote=state.slotEvidence?.mode==='STRUCTURAL_READ_ONLY'?' ※構造READ ONLY。カテゴリ・名称はv3.0.1定義による参考照合で、新版の所属・DLC/Event条件はUNKNOWN。':state.save.version==='3.0.1'?'':' ※定義はv3.0.1基準で、v3.0.0の分母とは異なり得ます。';
    hist.textContent=state.slotEvidence?.readable['collection-history']===false?'CollectionHistory Domain UNKNOWN：履歴の有無・取得率・日時は未判定。既存画像・定義は参考表示のみ。':m?`収集履歴 ${state.save.collections.historyEntries.toLocaleString()}件：アイテム定義 ${m.sourceItemCount.toLocaleString()}件、履歴の既知ID ${(state.save.collections.historyEntries-m.unknown.length).toLocaleString()}/${state.save.collections.historyEntries.toLocaleString()}件、コレクション所属 ${m.mappedCount.toLocaleString()}件、所属未設定 ${m.unassigned.length}件、未知ID ${m.unknown.length}件。これはゲーム内の達成率ではありません。${sourceNote}`:
      `収集履歴 ${state.save.collections?.historyEntries?.toLocaleString()??'UNKNOWN'}件（アイテム定義を読み込み中。編集不可）`;
    if(state.collectionHistoryDisplay){const display=state.collectionHistoryDisplay;
      hist.textContent+=` 保存された日時は100ns ticks（int64）です。日付は暦への変換表示であり UTC / DateTime.Kind / タイムゾーンは UNKNOWN。日時未露出 ${display.counts.TIMESTAMP_NOT_EXPOSED}件、0の意味UNKNOWN ${display.counts.ZERO_SEMANTICS_UNKNOWN}件、暦範囲外 ${display.counts.OUTSIDE_DATETIME_CALENDAR}件。`;}

  }
  renderUnknownCollectionIds();
  if(!all.length){grid.append(node('p','placeholder','該当するカテゴリがありません。'));return;}
  const frag=document.createDocumentFragment();
  for(const cat of all){
    const button=node('button','collection-card');button.type='button';button.classList.toggle('selected',state.selectedCollection===cat.key);
    let img=null;if(typeof cat.icon==='string'&&cat.icon.startsWith('./assets/')){img=document.createElement('img');img.src=cat.icon;img.alt='';img.className='collection-icon';img.loading='lazy';img.width=92;img.height=92;}else img=node('span','collection-icon-fallback','画像 UNKNOWN');
    const entries=state.collectionDefinitions.filter(x=>x.group===cat.key);
    const summary=entries.reduce((o,rec)=>{const m=sourceCollectionStats(rec.key);o.total+=m?.items.length||0;o.recorded+=m?.recorded.length||0;return o;},{total:0,recorded:0});
    const family=entries.reduce((o,r)=>{const p=sourceParentStats(r.key);o.total+=p?.familyTotal||0;o.recorded+=p?.familyRecorded||0;return o;},{total:0,recorded:0});
    const description=state.collectionMatch?`収集ID照合 ${formatSourceCounts(summary.recorded,summary.total)}${state.parentMatch?` ／ 親単位・参考 ${family.recorded} / ${family.total}`:''}`:`未照合 / ${cat.count}件の定義`;
    button.append(img,node('span','collection-title',titleForCategory(cat.key)),node('small','collection-meta',description));
    button.addEventListener('click',()=>{state.selectedCollection=cat.key;state.selectedCollectionDefinition=null;renderCollections();el('collectionGrid').querySelector('.collection-card.selected')?.focus();el('collectionDetail').scrollIntoView({block:'nearest',behavior:'smooth'});});frag.append(button);
  }
  grid.append(frag);renderCollectionDetail();
}
function renderCollectionDetail(){
  const panel=el('collectionDetail');
  const category=state.collections.find(c=>c.key===state.selectedCollection);
  if(!category){panel.hidden=true;return;}panel.hidden=false;panel.replaceChildren();
  const records=state.collectionDefinitions.filter(x=>x.group===category.key);
  panel.append(node('h4','',titleForCategory(category.key)),node('p','',`カテゴリGUID: ${category.guid} ／ 定義 ${records.length} 件。保存IDの直接照合に加え、UnityのParentItem参照だけを用いた参考集計を表示しています。ゲーム実行時の取得・DLC・イベント判定は再現していません。${records.some(r=>r.requires_group_dlc)?' このカテゴリにはDLC条件が設定されています。':''}`));
  const list=node('div','definition-list');
  for(const r of records){
    const match=sourceCollectionStats(r.key);
    const button=node('button','definition-item definition-button');button.type='button';
    button.classList.toggle('active',r.key===state.selectedCollectionDefinition);
    button.append(node('strong','',r.key),node('small','',r.guid));
    if(match){const p=sourceParentStats(r.key);button.append(node('span','record-count',`履歴記録ID ${formatSourceCounts(match.recorded.length,match.items.length)}${p?` ／ 親単位・参考 ${p.familyRecorded}/${p.familyTotal}`:''}`));}
    button.addEventListener('click',()=>{state.selectedCollectionDefinition=r.key;renderCollectionDetail();el('collectionDetail').querySelector('.definition-button.active')?.focus();});list.append(button);
  }
  panel.append(list);
  const selected=sourceCollectionStats(state.selectedCollectionDefinition);
  if(!selected){panel.append(node('p','editor-hint',state.slotEvidence?.readable['collection-history']===false?'CollectionHistory Domain UNKNOWN：保存済みの有無を判断できません。':state.save?'選択した定義に対応する保存照合がありません。':'保存記録は未照合です。カテゴリ定義のみ表示しています。'));return;}
  const section=node('section','collection-item-detail');
  const rule=selected.definition;
  const family=sourceParentStats(state.selectedCollectionDefinition);
  section.append(node('h5','',state.selectedCollectionDefinition),node('p','',`保存履歴ID ${selected.recorded.length} / 定義上のアイテムID ${selected.items.length}。${family?`原本のParentItemだけを統合した参考値 ${family.familyRecorded} / ${family.familyTotal}（ゲーム画面の達成率ではありません）。`:''}${rule.group_items_by_parent?' ゲーム定義は親アイテムでの集約を指定しています。':''}${rule.event_source_defined?' イベント年条件: '+rule.event_year+'。':''}DLC・イベント表示、インベントリーの実行時判定、他カテゴリへの親参照は未再現です。`));
  const toolbar=node('div','toolbar');
  const queryField=withChildren('label','search-wrap');
  const query=document.createElement('input');query.type='search';query.placeholder='内部アイテム名またはアイテムIDで検索';query.setAttribute('aria-label','コレクションアイテムの検索');queryField.append(query);
  const filter=document.createElement('select');filter.setAttribute('aria-label','収集履歴の状態');
  for(const [value,text] of [['all','すべて'],['collected','収集履歴あり'],['missing','収集履歴なし']]){const opt=document.createElement('option');opt.value=value;opt.textContent=text;filter.append(opt);}
  toolbar.append(queryField,filter);section.append(toolbar);
  const count=node('p','collection-list-caption','');const rows=node('div','collection-items-list');
  const itemInspector=node('section','item-inspector');itemInspector.setAttribute('aria-live','polite');
  section.append(count,rows,itemInspector);
  const sortItems=document.createElement('select');sortItems.setAttribute('aria-label','収集アイテムの並び順');
  for(const [value,label] of [['source','定義順'],['name','内部名順'],['id','ID順']]){const opt=node('option','',label);opt.value=value;sortItems.append(opt);}
  toolbar.append(sortItems);
  let limit=100;
  const renderRows=()=>{
    const q=query.value.trim().toLowerCase();const f=filter.value;const ids=state.collectionMatch?.recordedSet;
    const matches=selected.items.filter(item=>{const collected=ids?.has(item.id);return (!q||item.key.toLowerCase().includes(q)||String(item.id).includes(q))&&(f==='all'||!ids||Boolean(collected)===(f==='collected'));});
    if(sortItems.value==='name')matches.sort((a,b)=>a.key.localeCompare(b.key,'ja'));
    if(sortItems.value==='id')matches.sort((a,b)=>a.id-b.id);
    count.textContent=`該当 ${matches.length}件（${Math.min(matches.length,limit)}件表示）。履歴なしは未取得や未解放を意味しません。日時は保存済み100ns ticksを表示し、UTC・Kindは未検証です。`;
    rows.replaceChildren();const frag=document.createDocumentFragment();
    for(const item of matches.slice(0,limit)){
      const typed=state.collectionReadModel?.getItem(item.id);const collected=typed?.historyRecorded;const row=node('div','collection-item-row');
      row.append(node('span',!typed?'unknown-mark':collected?'collected-mark':'missing-mark',!typed?'?':collected?'✓':'—'),node('span','item-source-name',item.key||`ItemId ${item.id}`),node('small','item-source-id',`ID ${item.id}`),node('small','collection-status',typed?`${typed.status} · ${typed.historyRecorded?'履歴あり':'履歴なし'}`:'未照合'));
      if(typed&&state.collectionHistoryDisplay){const stamp=collectionHistoryUiStatus({model:state.collectionReadModel,display:state.collectionHistoryDisplay,itemId:item.id});
        if(stamp.recorded)row.append(node('small','collection-history-ticks',`100ns ticks ${stamp.rawTicks??'UNKNOWN'}${stamp.calendar?' · '+stamp.calendar+'（timezone UNKNOWN）':''}`));}
      const inspect=node('button','btn-secondary item-inspect-button','詳細・変更案');inspect.type='button';inspect.addEventListener('click',()=>{state.selectedItemId=item.id;renderCollectionItemInspector(item.id,itemInspector);itemInspector.scrollIntoView({block:'nearest'});});row.append(inspect);
      const parent=state.parentMatch?.parentByChild.get(item.id);if(parent)row.append(node('small','item-source-parent',`親ID ${parent.parent_id}${parent.relation==='cross-collection'?'（他カテゴリ）':''}`));
      frag.append(row);
    }
    if(!matches.length)rows.append(node('p','placeholder','該当するアイテムはありません。'));else rows.append(frag);
    if(matches.length>limit){const more=node('button','btn-secondary show-more',`さらに表示（残り ${matches.length-limit}件）`);more.type='button';more.addEventListener('click',()=>{limit+=100;renderRows();});rows.append(more);}
    if(state.selectedItemId!==null&&selected.items.some(x=>x.id===state.selectedItemId))renderCollectionItemInspector(state.selectedItemId,itemInspector);
  };
  query.addEventListener('input',()=>{limit=100;renderRows();});filter.addEventListener('change',()=>{limit=100;renderRows();});sortItems.addEventListener('change',()=>{limit=100;renderRows();});renderRows();
  panel.append(section);
}
function renderCollectionItemInspector(itemId,host){
  host.replaceChildren();const model=state.collectionReadModel;
  if(!model){host.append(node('p','editor-hint','保存履歴は未照合です。読み込むまで編集案は作成できません。'));return;}
  const item=model.getItem(itemId);
  const stamp=state.collectionHistoryDisplay?collectionHistoryUiStatus({model,display:state.collectionHistoryDisplay,itemId}):null;
  host.append(node('h5','',item.sourceKey||`名称 UNKNOWN / ItemId ${itemId}`),detailLine('ItemId',itemId),detailLine('定義GUID',item.sourceGuid||'UNKNOWN'),detailLine('所属カテゴリ',item.collectionKey||'UNKNOWN'),detailLine('定義照合分類',stamp?.membership??item.status),detailLine('履歴の有無',stamp?.recorded?'記録あり':'記録なし'),
    detailLine('保存日時 raw ticks（100ns / int64）',stamp?.rawTicks??(item.historyRecorded?'UNKNOWN（未露出）':'履歴なし')),
    detailLine('暦表示（タイムゾーン未確認）',stamp?.calendar??(stamp?.recorded?'UNKNOWN':'履歴なし')),
    detailLine('日時分類',stamp?.timestampState??'UNKNOWN'),detailLine('UTC / DateTime.Kind / 時差','UNKNOWN / UNKNOWN / UNKNOWN'));
  if(stamp?.gateWarnings.length)for(const warning of stamp.gateWarnings)host.append(node('p','editor-hint',`RELATED / UNKNOWN: ${warning}`));
  appendDependencies(host,dependencyInspector({domain:'collection',hasCollection:Boolean(item.collectionKey)}));
  const form=node('form','native-dry-form');form.append(node('h5','','収集履歴の変更案（Writer OFF）'));
  const opLabel=withChildren('label','editor-field',node('span','','仮の操作'));const op=document.createElement('select');
  for(const [val,label] of [['record','履歴を追加'],['remove','履歴を削除'],['set-time','日時を変更']]){const opt=node('option','',label);opt.value=val;op.append(opt);}
  opLabel.append(op);const tickLabel=withChildren('label','editor-field',node('span','','新日時 ticks（DateTime形式、明示値のみ）'));const tick=document.createElement('input');tick.type='text';tick.placeholder='例: 638900000000000000';tickLabel.append(tick);
  const preview=node('button','btn-secondary','差分・禁止理由を確認');preview.type='submit';const result=node('div','native-dry-result');result.setAttribute('aria-live','polite');
  form.append(opLabel,tickLabel,preview,result);op.addEventListener('change',()=>result.replaceChildren());tick.addEventListener('input',()=>result.replaceChildren());
  form.addEventListener('submit',e=>{e.preventDefault();result.replaceChildren();try{
    const plan=previewNativeCollectionIntent({model,display:state.collectionHistoryDisplay,itemId,operation:op.value,proposedTicks:tick.value.trim()||null});
    const prepared=WEB05_WRITER_PORT.prepareNative({domain:'collection-history',saveVersion:model.saveVersion,readEvidence:state.slotEvidence});
    result.append(detailLine('履歴の有無',`${plan.before.historyRecorded?'履歴あり':'履歴なし'} → ${plan.afterRecorded?'履歴あり':'履歴なし'}`),detailLine('日時 ticks',`${plan.rawBeforeTicks??'UNKNOWN'} → ${plan.afterTicks??'未設定'}`));
    result.append(node('p','error-message',`書き戻し禁止：${[...plan.blockers,...prepared.blockers].join(' / ')}`));
    for(const warning of plan.warnings)result.append(node('p','editor-hint',`RELATED / UNKNOWN: ${warning}`));
  }catch(err){result.append(node('p','error-message',err.message));}});
  if(state.slotEvidence?.mode==='STRUCTURAL_READ_ONLY')host.append(node('p','error-message','未検証Versionの収集履歴はv3.0.1カタログの参考照合だけです。編集案は保存・出力不可。新規ID生成、未知UnionやKey0の正規化は行いません。'));
  host.append(form);
}
function renderUnknownCollectionIds(){
  const host=el('colUnknownPanel');host.replaceChildren();const model=state.collectionReadModel;
  const unknown=model?[...new Set([...model.exceptions.unknownSourceIds,...model.exceptions.historySourceUnresolvedIds,...model.exceptions.historyExplicitUnassignedIds])]:[];
  host.hidden=!unknown.length;
  if(!unknown.length)return;
  host.append(node('h4','',`未照合・所属不明 Collection ItemId ${unknown.length}件`),node('p','editor-hint',`定義に存在しない ID ${model.exceptions.unknownSourceIds.length}件、所属未確定 ID ${model.exceptions.historySourceUnresolvedIds.length}件、カテゴリ未割当 ID ${model.exceptions.historyExplicitUnassignedIds.length}件。履歴から除外・削除せず選択可能です。名称・アイコン・日時が未確認なら UNKNOWN と表示します。`));
  const query=document.createElement('input');query.type='search';query.setAttribute('aria-label','未知 ItemId を検索');query.placeholder='ItemId で検索';
  const list=node('div','unknown-item-list');const detail=node('section','unknown-item-detail');host.append(query,list,detail);
  const render=()=>{const filtered=unknown.filter(id=>String(id).includes(query.value.trim()));list.replaceChildren();
    const frag=document.createDocumentFragment();for(const id of filtered.slice(0,100)){
      const stored=state.collectionHistoryDisplay?.getRecordedRow(id);
      const button=node('button','btn-secondary',`ItemId ${id} • ${stored?.membership??model.getItem(id).status} • 100ns ${stored?.timestamp.rawTicks??'UNKNOWN'}`);button.type='button';button.addEventListener('click',()=>{state.selectedItemId=id;renderCollectionItemInspector(id,detail);});frag.append(button);
    }list.append(frag);if(filtered.length>100)list.append(node('p','editor-hint',`残り ${filtered.length-100}件。ID検索で個別に選択してください。`));
  };query.addEventListener('input',render);render();
}
async function bootstrap(){
  try{
    const [a,b,c,d,e,f,g,h]=await Promise.all(['./data/collections.json','./data/collection-definitions.json','./data/achievement-definitions.json','./data/slot-definitions.json','./data/item-collection-crosswalk.json','./data/item-parent-crosswalk.json','./data/local-achievement-definitions.json','./data/local-achievement-locales.json'].map(async url=>{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error('リソースの取得に失敗: '+url);return r.json();}));
    if(a.length!==25||b.length!==181||c.length!==31||d.schema!=='HKIA.SlotDefinitionCrosswalk.1'||d.counters.length!==851||d.achievement_references.length!==820||e.schema!=='HKIA.ItemCollectionCrosswalk.1'||e.items.length!==12163||f.schema!=='HKIA.ItemParentCrosswalk.1'||f.links.length!==5170||g.schema!=='HKIA.LocalAchievementIndex.1'||g.records.length!==820||h.schema!=='HKIA.LocalAchievementLocales.1'||h.records.length!==820||h.counts.ja_titles!==820||h.counts.en_titles!==820)throw new Error('同梱定義データの件数が一致しません');
    state.collections=a;state.collectionDefinitions=b;state.itemManifest=e;state.parentManifest=f;
    state.collectionMatch=state.save&&state.slotEvidence?.readable['collection-history']?reconcileCollectionItemIds(e,b,state.save.collectedItemIds):null;
    state.parentMatch=state.collectionMatch?reconcileParentFamilies(f,state.collectionMatch):null;
    const collectionUI=state.save?buildCollectionPresentationForSlot({slot:{schema:'HKIA.Web05.SlotDisplay.2',evidence:state.slotEvidence,save:state.save},itemManifest:e,definitions:b,parentManifest:f}):null;
    state.collectionReadModel=collectionUI?.model??null;state.collectionHistoryDisplay=collectionUI?.display??null;
    state.achievementDefinitions=new Map(c.map(r=>[r.guid.toLowerCase(),r]));
    state.slotCounterDefinitions=new Map(d.counters.map(r=>[r.guid,r]));
    state.slotAchievementDefinitions=new Map(d.achievement_references.map(r=>[r.save_guid,r]));
    state.localAchievementDefinitions=new Map(g.records.map(r=>[r.save_guid,r]));
    state.localAchievementLocales=new Map(h.records.map(r=>[r.guid,r]));
    state.slotGroupMembers=new Map();
    for(const r of d.achievement_references){
      const old=state.slotGroupMembers.get(r.group_counter_guid)||[];old.push(r);state.slotGroupMembers.set(r.group_counter_guid,old);
    }
    renderAchievements();renderCollections();
  }catch(e){error(`同梱アセット読み込み失敗：${e.message}。ローカル表示はHTTPサーバー経由で開いてください。`);}
  el('achTab').addEventListener('click',()=>setTab('achievements'));el('colTab').addEventListener('click',()=>setTab('collections'));
  for(const name of ['achTab','colTab'])el(name).addEventListener('keydown',ev=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();const next=ev.key==='Home'?'achTab':ev.key==='End'?'colTab':name==='achTab'?'colTab':'achTab';setTab(next==='colTab'?'collections':'achievements');el(next).focus();}});
  el('saveInput').addEventListener('change',async e=>{await loadFile(e.target.files?.[0]);e.target.value='';});
  el('downloadOriginal').addEventListener('click',downloadOriginal);el('downloadEdited').addEventListener('click',downloadAccount);el('downloadZip').addEventListener('click',downloadEditedArchive);
  const onAchievementsFilter=()=>{state.achLimit=120;el('batchResult').replaceChildren();renderAchievements();};
  el('achievementSearch').addEventListener('input',onAchievementsFilter);el('achievementFilter').addEventListener('change',onAchievementsFilter);el('achievementSort').addEventListener('change',onAchievementsFilter);
  el('collectionSearch').addEventListener('input',renderCollections);el('collectionStatusFilter').addEventListener('change',renderCollections);el('collectionSort').addEventListener('change',renderCollections);
  el('undoAccount').addEventListener('click',restorePreviousAccount);el('resetAccount').addEventListener('click',resetAccount);
  el('batchToggle').addEventListener('click',()=>{const controls=el('batchControls');controls.hidden=!controls.hidden;el('batchToggle').setAttribute('aria-expanded',String(!controls.hidden));});
  el('batchState').addEventListener('change',()=>{el('batchResult').replaceChildren();});
  el('batchTimestamp').addEventListener('input',()=>el('batchResult').replaceChildren());
  el('batchPreview').addEventListener('click',()=>{
    const target=el('batchResult');target.replaceChildren();
    if(state.source!=='account'||!state.account){target.append(node('p','error-message','Account編集モードではありません。'));return;}
    try{
      const completed=el('batchState').value==='complete';
      const plan=batchAccountPlan(state.account,state.visibleAccountGuids,completed,el('batchTimestamp').value.trim()||null);
      if(!plan.count){target.append(node('p','editor-hint','変更対象はありません。'));return;}
      renderReview(target,plan.edits,()=>{
        const previous=JSON.stringify(state.account);
        try{
          const clone=JSON.parse(previous);
          for(const item of plan.edits)changeAchievement(clone,item.guid,item.after);
          state.history.push(previous);if(state.history.length>30)state.history.shift();
          state.account=clone;refreshAccountDirty();renderAchievements();target.replaceChildren();
        }catch(e){target.replaceChildren(node('p','error-message',e.message));}
      });
    }catch(e){target.append(node('p','error-message',e.message));}
  });
  el('accountSource').addEventListener('click',()=>{state.source='account';state.selectedAchievement=null;state.achLimit=120;el('batchResult').replaceChildren();renderAchievements();});
  el('slotSource').addEventListener('click',()=>{state.source='slot';state.selectedAchievement=null;state.achLimit=120;el('batchResult').replaceChildren();renderAchievements();});
  const drop=el('dropArea');
  drop.addEventListener('dragover',e=>{e.preventDefault();drop.classList.add('drag');});drop.addEventListener('dragleave',()=>drop.classList.remove('drag'));
  drop.addEventListener('drop',async e=>{e.preventDefault();drop.classList.remove('drag');await loadFile(e.dataTransfer?.files?.[0]);});
  renderAchievements();
}
bootstrap();
