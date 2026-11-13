import {parseAccount,changeAchievement,exportAccount} from './account.js';
import {readSlotForDisplay,buildCollectionPresentationForSlot,structuralDomainMessage} from './structural-ui-adapter.js';
import {reconcileCollectionItemIds} from './collection-progress.js';
import {reconcileParentFamilies} from './collection-parent-progress.js';
import {serializedGuidToSlotGuid} from './guid.js';
import {extractSaveSet,repackSettingsZip} from './zip.js';
import {offerFile} from './download.js';
import {accountChangeSet,previewAccountChange,batchAccountPlan,filterSortAchievements,collectionHistoryStatus,SLOT_WRITER_CAPABILITY,WEB05_WRITER_PORT,achievementReadStatus,dependencyInspector,previewNativeAchievementIntent,previewNativeCollectionIntent,inspectCounterDraft} from './ui-state.js';
import {collectionHistoryUiStatus} from './collection-history-ui.js';
import {fingerprintSourceBytes,sourceRevisionSnapshot,inspectRevisionCAS,captureReadOnlyPreview,assessReadOnlyPreview,captureAccountZipExport,inspectAccountZipExport} from './source-revision-ui.js';

import {bindPrivateImageCatalog,imageUi,imageElement} from './image-ui.js';
import {createNativePreviewController,collectionTicksRequest,achievementBatchRequest,nativeOutputStatus,recipeForwardRequest,recipeExpansionForwardRequest,RECIPE_EXPANSION_IDS,recipeExpansion23ForwardRequest,RECIPE_EXPANSION23_IDS,recipeCelebration5ForwardRequest,RECIPE_CELEBRATION5_IDS,bulkTargetReason,bulkSelectionSnapshot,familyRevokeReason,familyRevokeRequest,familyBatchRequest,FORMAL_FAMILY_REVOKE_KEYS,formal49Target,formal49Reason,formal49Request,manual9Target,manual9Reason,manual9Request} from './native-preview-ui.js';

const el=id=>document.getElementById(id);
const state={account:null,accountOriginal:null,accountBaseline:null,history:[],visibleAccountGuids:[],achLimit:120,save:null,saveOriginal:null,slotEvidence:null,source:'account',originalName:null,originalBytes:null,dirty:false,selectedAchievement:null,selectedCollection:null,selectedCollectionDefinition:null,itemManifest:null,parentManifest:null,collectionMatch:null,parentMatch:null,collectionReadModel:null,collectionHistoryDisplay:null,selectedItemId:null,archiveLoaded:false,sourceRevision:null,sourceRevisionError:null,revisionChanged:false,sourceLoadEpoch:0,sourceLoading:false,accountEditGeneration:0,zipExportBusy:false,collections:[],collectionDefinitions:[],achievementDefinitions:new Map(),slotCounterDefinitions:new Map(),slotAchievementDefinitions:new Map(),localAchievementDefinitions:new Map(),slotGroupMembers:new Map(),slotCountersByGuid:new Map(),slotAchievementsByGuid:new Map(),localAchievementLocales:new Map()};
const nativePreview=createNativePreviewController({open:async bytes=>{const mod=await import('../native-product/worker-client.mjs');return mod.openNativeProductWorkerSession(bytes);},live:()=>({bytes:state.originalBytes,revision:state.sourceRevision?.sha256,generation:state.accountEditGeneration,name:state.originalName,eligible:!!state.archiveLoaded&&!!state.originalBytes&&!!state.save&&!!state.account&&!state.sourceLoading&&!state.dirty&&state.sourceRevision?.format==='zip'})});
let nativeNotice='',nativeOpenAttempt=0;
const nativeModuleStaged=()=>document.documentElement.dataset.nativePreview==='staged';
function closeNativePreviewSession(){nativeOpenAttempt++;nativePreview.close();}
function renderNativeSession(){
  const host=el('nativeSessionStatus');if(!host)return;let x=nativePreview.status();if(!x.ready&&!x.busy&&x.revision){closeNativePreviewSession();x=nativePreview.status();}host.replaceChildren();
  host.append(detailLine('Native Preview',x.ready?'Session ready（操作別出力ゲート）':x.busy?'処理中':nativeNotice||(!nativeModuleStaged()?'Native検証モジュール未配置（読取のみ）':'ZIPを選択して検証Sessionを開く')));
  if(x.ready){host.append(detailLine('Version / Slot',x.version+' / Saves/save_0.save'),detailLine('Revision',x.revision),detailLine('Preview capabilities',x.capability.allowedPreviewOperations.join(' / ')),detailLine('Apply / Export',x.staged?'検証済み候補を出力可能':'BLOCKED — 操作別Capability・独立受入・Verifyが必要'));}
  el('openNativePreview').disabled=!nativeModuleStaged()||x.busy||!state.archiveLoaded||!state.originalBytes||!state.save||!state.account||state.sourceLoading||state.dirty||!state.sourceRevision||x.ready;
  el('closeNativePreview').disabled=!x.ready&&!x.busy;
  el('nativeDownload').disabled=!nativePreview.outputStatus().export;
  el('nativeDiscard').disabled=!nativePreview.outputStatus().export;
  if(x.staged)host.append(detailLine('検証済み候補',x.staged.operation+' / 未ダウンロード'));
  if(x.recipeRestore){host.append(detailLine('Recipe復元Receipt','同一Session・この編集済みコピーのみ。ゲーム再保存、別File選択、Session終了、再起動後は復元不可。'),detailLine('復元対象',`ItemId ${x.recipeRestore.itemId} / Document ${x.recipeRestore.documentId} / Quantity 0 → 1`));const c=recipeConsentControls(),restore=node('button','btn-secondary','Recipeを復元して別名出力');restore.type='button';restore.disabled=true;const update=()=>{restore.disabled=!x.recipeRestore.available||!c.accepted();};c.first.addEventListener('change',update);c.second.addEventListener('change',update);restore.addEventListener('click',async()=>{if(restore.disabled)return;const attempt=nativeOpenAttempt,epoch=state.sourceLoadEpoch;try{const pending=nativePreview.restoreRecipe(c.value());renderNativeSession();const file=await pending;if(attempt!==nativeOpenAttempt||epoch!==state.sourceLoadEpoch||!nativePreview.status().ready)return;offerFile(file,'recipe-restored.zip','application/zip');nativeNotice='Recipe復元済みコピーを別名出力。ゲーム受入は未確認。';}catch(e){if(attempt!==nativeOpenAttempt||epoch!==state.sourceLoadEpoch)return;nativeNotice='復元失敗・出力なし：'+e.message;}renderNativeSession();renderCollections();});host.append(c.box,restore);}
  if(nativeNotice&&x.ready)host.append(node('p','editor-hint',nativeNotice));
}
function adoptNativeDisplay(){
  const view=nativePreview.status().display;if(!view||view.schema!=='HKIA.Web05.SlotDisplay.2'||view.evidence?.accountExportAllowed!==false||view.evidence?.writerEnabled!==false||view.nativeSchemaEvidence?.typedDictionaryKeysVerified!==true)throw Error('UNACCEPTED_NATIVE_DISPLAY');
  const model=buildCollectionPresentationForSlot({slot:view,itemManifest:state.itemManifest,definitions:state.collectionDefinitions,parentManifest:state.parentManifest});
  const match=reconcileCollectionItemIds(state.itemManifest,state.collectionDefinitions,view.save.collectedItemIds);
  state.save=view.save;state.slotEvidence=view.evidence;state.collectionMatch=match;state.parentMatch=reconcileParentFamilies(state.parentManifest,match);state.collectionReadModel=model.model;state.collectionHistoryDisplay=model.display;
  state.slotCountersByGuid=new Map(view.save.counters.map(r=>[r.guid.toLowerCase(),r]));state.slotAchievementsByGuid=new Map(view.save.achievements.map(r=>[r.guid.toLowerCase(),r]));showInfo();
}
function recipeConsentControls(){
  const first=document.createElement('input'),second=document.createElement('input');first.type=second.type='checkbox';const box=node('div','recipe-consent');box.append(withChildren('label','checkbox-row',first,node('span','','レシピの利用可否が変わることを理解しました')),withChildren('label','checkbox-row',second,node('span','','実績カウンター・報酬への関連影響は未確認であることを理解しました')));return {box,first,second,accepted:()=>first.checked&&second.checked,value:()=>({acknowledgeRecipeAvailabilityChange:first.checked,acknowledgeAchievementAndRewardReference:second.checked})};
}
function nativePreviewForm(host,{operations,makeRequests,label,recipe=false,selection=null,family=false,formal49=null,manual9=null}){
  if(!nativePreview.status().ready)return false;
  const box=node('section','linked-counter-panel native-product-panel');box.append(node('h5','',label),node('p','editor-hint','検証用の変更案。実際の取得・達成・報酬受取・ゲーム内反映を保証しません。出力には操作別の許可とVerifyが必要です。'));
  const form=node('form','native-dry-form'),select=document.createElement('select');select.setAttribute('aria-label','Native操作');
  for(const [id,title] of operations){const option=node('option','',title);option.value=id;select.append(option);}
  const input=document.createElement('input');input.type='text';input.required=true;input.setAttribute('aria-label','新しい値');input.placeholder='UTC日時 / ticks / 進捗値';
  if(family){input.placeholder='revoke';input.setAttribute('aria-label','達成取消の確認');box.append(detailLine('限定操作','達成済み末端実績1件と親Group・Account rootの連動取消。Slot 8 + Account 2フィールドを同一ZIPで検証。'),node('p','editor-hint','報酬受取・所持品は変更しません。ゲーム再計算・報酬再取得・再保存は未確認。確認欄に revoke と入力してください。'));}
  if(formal49){const eligible=nativePreview.status().capability?.formal49Targets?.some(t=>t.key===formal49.key&&t.action===formal49.action&&t.slotFields===formal49.slotFields&&t.accountFields===formal49.accountFields);box.append(detailLine('Core出力対象',eligible?'対象候補（独立受入・Verify・出力ゲートが必要）':'現在は出力対象外（プレビューのみ・Coreで最終判定）'));const revoke=formal49.action==='REVOKE';input.placeholder=revoke?'revoke':'2026-11-12T00:00:00.1234567Z';input.setAttribute('aria-label',revoke?'Exact20 取消確認':'Exact20 達成日時 UTC');box.append(detailLine('限定操作',`${revoke?'達成取消・進捗0・日時なし':'達成・閾値進捗・UTC日時'} / Slot ${formal49.slotFields} + Account ${formal49.accountFields} フィールド`),node('p','editor-hint',revoke?'revoke と入力。親Groupの進捗、必要時のみAccount rootを連動。':'UTC日時を小数7桁（100ns）で指定。親Groupの進捗を連動。'),node('p','editor-hint','報酬定義なしの受入対象のみ。報酬受取・所持品は変更しません。ゲーム再計算・再保存・副作用は未確認。'));}
  if(manual9){const eligible=nativePreview.status().capability?.formal9Targets?.some(t=>t.key===manual9.key&&t.action==='REVOKE'&&t.slotFields===6&&t.accountFields===0);input.placeholder='revoke';input.setAttribute('aria-label','Manual9 取消確認');box.append(detailLine('Core出力対象',eligible?'対象候補（独立受入・Verify・出力ゲートが必要）':'現在は出力対象外（プレビューのみ・Coreで最終判定）'),detailLine('限定操作','達成取消・進捗0・日時なし / Slot 6 + Account 0 フィールド'),node('p','editor-hint','revoke と入力。親Groupの進捗を連動。欠落Manualメンバーの実績・Counterは生成しません。Accountの原文は保持します。報酬受取・所持品は変更しません。ゲーム再計算・再保存は未確認。'));}
  const consent=recipe?recipeConsentControls():null;if(recipe){input.value='0';input.readOnly=true;input.setAttribute('aria-label','Recipe Quantity 新値');box.append(detailLine('対象','既存Inventory行 Quantity 1 → 0のみ。収集履歴は保持。実取得の一般編集・ゲーム内反映ではありません。'));}
  const run=node('button','btn-secondary','型付きPlan・差分を確認');run.type='submit';const verify=node('button','btn-secondary','再読込Verify（出力なし）');verify.type='button';verify.disabled=true;
  const discard=node('button','btn-secondary','プレビュー破棄');discard.type='button';const apply=node('button','btn-primary','Native Apply');apply.type='button';apply.disabled=true;const outputReason=node('p','editor-hint','');const busyStatus=node('p','editor-hint','');busyStatus.setAttribute('role','status');
  const result=node('div','native-dry-result');result.setAttribute('aria-live','polite');let generation=0,plans=[];const describeOutput=()=>{const c=nativePreview.status().capability;const op=c?.devOutput?.operations?.find(r=>r.operation===(plans.length===1?plans[0].operation:select.value));const gate=plans.length===1?nativePreview.outputStatus(plans[0]):nativeOutputStatus();outputReason.textContent=gate.apply?'Apply可能 — 検証済みの単一Plan':gate.export?'検証済み候補あり — Session欄から出力または破棄':'Apply / Export: BLOCKED — '+(op?.blockers?.join(' / ')||gate.reason||nativeOutputStatus().reason);apply.textContent=gate.apply?'Native Apply':'Native Apply（未受入または未検証）';};const clear=()=>{generation++;plans=[];apply.disabled=true;verify.disabled=true;run.disabled=!!selection&&!selection.snapshot(select.value).ready;select.disabled=false;input.disabled=false;if(consent){consent.first.disabled=false;consent.second.disabled=false;}busyStatus.textContent='';form.setAttribute('aria-busy','false');result.replaceChildren();describeOutput();};
  select.addEventListener('change',()=>{selection?.setOperation(select.value);input.value='';input.placeholder=select.value==='batch-family-revoke'?'revoke':'UTC日時 / ticks / 進捗値';clear();});if(selection)selection.bind(clear,select.value);input.addEventListener('input',clear);discard.addEventListener('click',clear);if(consent){consent.first.addEventListener('change',clear);consent.second.addEventListener('change',clear);}
  form.append(withChildren('label','editor-field',node('span','','操作'),select),withChildren('label','editor-field',node('span','',recipe?'新しいQuantity':'新しい値（削除は remove）'),input),...(consent?[consent.box]:[]),withChildren('div','button-row',run,verify,discard,apply),outputReason,busyStatus,result);box.append(form);host.append(box);if(selection)run.disabled=!selection.snapshot(select.value).ready;describeOutput();
  const live=t=>t===generation&&box.isConnected&&nativePreview.status().ready;
  const setBusy=b=>{selection?.setBusy(b);run.disabled=b||!!selection&&!selection.snapshot(select.value).ready;select.disabled=b;input.disabled=b;if(consent){consent.first.disabled=b;consent.second.disabled=b;}verify.disabled=b||!plans.length;apply.disabled=b||plans.length!==1||!nativePreview.outputStatus(plans[0]).apply;form.setAttribute('aria-busy',String(b));busyStatus.textContent=b?'処理中（原本は変更しません）':'';describeOutput();renderNativeSession();};
  form.addEventListener('submit',async e=>{e.preventDefault();clear();const ticket=generation;setBusy(true);try{const v=input.value.trim();if(!v)throw Error('値を指定してください');if(select.value==='collection-key1-remove'&&v!=='remove')throw Error('履歴削除は remove と入力');if(selection&&!selection.snapshot(select.value).ready)throw Error(selection.snapshot(select.value).reason);const reqs=makeRequests(select.value,v,consent?.value());if(!reqs.length)throw Error('変更対象なし');if(reqs.length>16)throw Error('個別検証は最大16件');const found=[];for(const request of reqs){const p=await nativePreview.plan(request);if(!live(ticket))return;found.push(p);}plans=found;result.append(node('strong','','型付き差分（未適用・保存変更0件）'));if(plans[0]?.operation==='batch-family-revoke')result.append(node('p','editor-hint',`Family原子的取消：Slot ${plans[0].diff.nativeFields.length} + Account 2フィールド（共有rootは1組）。報酬受取・所持品は変更しません。ゲーム再計算・再保存は未確認。`));if(plans[0]?.operation==='batch-independent-scalars')result.append(node('p','editor-hint','原子的な一括Plan：全対象を同一Revisionで検証。1件でも不適合なら全体を拒否します。'));if(plans.length>1)result.append(node('p','editor-hint','独立した個別プレビューです。一括原子的変更・合成出力ではありません。'));
    for(const p of plans){result.append(detailLine('Operation / Scope',p.operation+' / '+p.diff.requiredScope));for(const f of [...p.diff.nativeFields,...p.diff.accountFields,...(p.diff.membership?[p.diff.membership]:[])])result.append(detailLine([f.model,f.guid,f.documentId,f.itemId,f.field].filter(v=>v!==undefined).join(' / ')||f.operation,`${displayValue(f.expected)} → ${displayValue(f.next)}`));if(p.operation==='collection-recipe-celebration5-quantity')result.append(detailLine('Celebration (tag8)','全既存Celebrationデータを順序・raw保持。対象の参照1件・Counter参照0件。実績・報酬の再計算は未確認。'));if(p.diff.recipeProjection){const r=p.diff.recipeProjection;result.append(detailLine('Recipe利用可否（静的投影）',`${r.before} → ${r.after}`),detailLine('履歴','Key0/Key1保持。実績・報酬の関連値は書き換えない。'),detailLine('RELATED / UNKNOWN',`${r.advisory?.status??'UNKNOWN'} / 再計算予測 ${r.advisory?.predictedCounterAfterTrackerRecount??'UNKNOWN'} / ゲーム再保存未確認`));}result.append(detailLine('REQUIRED',p.diff.causal?`${p.diff.causal.requiredFieldCount} fields / ${p.diff.causal.scope}`:p.diff.semanticLinkageVerified?'契約済み連動差分（上記の全フィールド）':`型付き対象範囲 ${p.diff.requiredScope} / 追加の確定連動なし`),detailLine('RELATED / UNKNOWN',['collection-recipe-quantity','collection-recipe-expansion-quantity','collection-recipe-expansion23-quantity','collection-recipe-celebration5-quantity'].includes(p.operation)?'履歴・実績・報酬は書き換えません。ゲーム側の再計算は未確認。':'未承認の関連値・報酬・解放・実取得状態は変更しません'));}
    result.append(detailLine('非対象値','変更対象外。再読込Verifyで確認します。'));}catch(err){if(live(ticket))result.append(node('p','error-message',err.message));}finally{if(ticket===generation&&box.isConnected)setBusy(false);}});
  verify.addEventListener('click',async()=>{const ticket=generation,issued=plans.slice();setBusy(true);try{for(const p of issued){const proof=await nativePreview.verify(p);if(!live(ticket))return;result.append(detailLine('再読込Verify',`${p.operation}: ${proof.totalFieldsVerified} fields / candidate reopened / non-target raw frames preserved / CRC / exact diff / original unchanged / output none`));}result.append(node('p','editor-hint','検証成功。未適用・ダウンロードなし。Native認証・ゲーム受入は未確認です。'));}catch(err){if(live(ticket))result.append(node('p','error-message','検証失敗・候補破棄・出力なし：'+err.message));}finally{if(ticket===generation&&box.isConnected)setBusy(false);}});
  apply.addEventListener('click',async()=>{const ticket=generation,p=plans[0];if(plans.length!==1||!nativePreview.outputStatus(p).apply)return;setBusy(true);try{await nativePreview.apply(p);if(!live(ticket))return;result.append(node('p','editor-hint','候補をApply・再読込検証済み。原本不変。Session欄から別名出力できます。'));}catch(err){if(box.isConnected&&ticket===generation)result.append(node('p','error-message','Apply失敗・候補破棄・出力なし：'+err.message));}finally{if(ticket===generation&&box.isConnected)setBusy(false);renderNativeSession();}});
  return true;
}
function bulkTargetPicker(host,{rows,scopes,initialScope='filtered',operation}){
  const selected=new Set(),byId=new Map(rows.map(row=>[row.id,row]));let scope=initialScope,page=0,busy=false,op=operation,onChange=()=>{};
  const box=node('section','bulk-target-picker'),heading=node('h5','','一括編集の対象を選択'),summary=node('p','editor-hint'),list=node('div','bulk-target-list'),pageInfo=node('span','editor-hint');summary.setAttribute('role','status');summary.setAttribute('aria-live','polite');
  const scopeSelect=document.createElement('select');scopeSelect.setAttribute('aria-label','一括対象の表示範囲');for(const [id,label] of [...Object.entries(scopes),['selected',{label:'選択済み対象を確認'}]]){const o=node('option','',label.label);o.value=id;scopeSelect.append(o);}scopeSelect.value=scope;
  const button=(text,action)=>{const b=node('button','btn-secondary',text);b.type='button';b.addEventListener('click',action);return b;};
  const snapshot=(operation=op)=>bulkSelectionSnapshot(rows,[...selected],operation,nativePreview.status().capability);
  const current=()=>scope==='selected'?[...selected]:scopes[scope].ids;
  const update=()=>{const x=snapshot();summary.textContent=`選択 ${x.targets.length}件 / 上限 ${x.limit}件 · 未対応 ${x.blocked.length}件 · 表示範囲 ${current().length}件。${x.reason??'Coreの型付きPlanで最終判定します。'} 原子的変更は分割しません。`;for(const c of box.querySelectorAll('button,input,select'))c.disabled=busy;prev.disabled=busy||page===0;next.disabled=busy||(page+1)*40>=current().length;};
  const render=()=>{list.replaceChildren();const ids=current();page=Math.min(page,Math.max(0,Math.ceil(ids.length/40)-1));for(const id of ids.slice(page*40,page*40+40)){const r=byId.get(id);const c=document.createElement('input');c.type='checkbox';c.checked=selected.has(id);const reason=bulkTargetReason(r,op,nativePreview.status().capability);const label=node('span','',`${r.label} · ${id} — ${reason??(r.unknownIdentity?'所属未照合・既存履歴日時のみ（Core検証）':'候補・Coreで最終検証')}`);c.addEventListener('change',()=>{if(c.checked)selected.add(id);else selected.delete(id);if(scope==='selected'){render();(list.querySelector('input')??scopeSelect).focus();}else update();onChange();});list.append(withChildren('label','bulk-target-row',c,label));}pageInfo.textContent=`${ids.length? page*40+1:0}–${Math.min(ids.length,page*40+40)} / ${ids.length}件`;update();};
  const choose=button('表示範囲を全選択',()=>{const ids=current().slice();selected.clear();for(const id of ids)selected.add(id);render();onChange();});
  const clear=button('選択をすべて解除',()=>{selected.clear();render();onChange();});
  const prev=button('前の40件',()=>{page--;render();});const next=button('次の40件',()=>{page++;render();});
  scopeSelect.addEventListener('change',()=>{scope=scopeSelect.value;page=0;render();});
  box.append(heading,node('p','editor-hint','選択は明示的に行います。検索・カテゴリ変更時は選択と旧Planを破棄。表示範囲を切り替えても選択は保持し、全選択は選択集合を置き換えます。'),withChildren('label','editor-field',node('span','','表示範囲'),scopeSelect),withChildren('div','button-row',choose,clear),summary,list,withChildren('div','button-row',prev,next,pageInfo));host.append(box);render();
  return {snapshot,bind(fn,operation){onChange=fn;op=operation;render();},setOperation(operation){op=operation;render();},setBusy(value){busy=value;update();}};
}
function renderNativeBatch(filtered,all){
  const host=el('nativeBatch');host.replaceChildren();host.hidden=state.source!=='slot'||!nativePreview.status().ready;if(host.hidden)return;
  const rows=all.map(r=>{const d=state.localAchievementDefinitions.get(r.guid.toLowerCase()),group=slotAchievementGroup(r);return {id:r.guid,key:d?.key,domain:'achievement',saved:r.kind==='slot',complete:r.complete,manual:d?.counter_kind==='GameCounterManualDefinition',familyReason:familyRevokeReason(nativePreview.status(),d?.key),counterPresent:!!d?.counter_save_guid&&state.slotCountersByGuid.has(d.counter_save_guid.toLowerCase()),gated:!!(d?.required_dlc_u32?.some(v=>v!==0)||d?.event_year||d?.event_path_id),group,label:achievementTitle(r)};});
  const groups=new Map();for(const row of rows)if(row.group){if(!groups.has(row.group))groups.set(row.group,[]);groups.get(row.group).push(row.id);}
  const scopes={filtered:{label:'検索・絞り込み対象',ids:filtered.map(r=>r.guid)},all:{label:'全InGame実績（未保存を含む）',ids:rows.map(r=>r.id)}};for(const [group,ids] of groups)scopes['group:'+group]={label:'実績カテゴリ：'+group,ids};
  const familyBatchAvailable=nativePreview.status().version==='3.0.1'&&nativePreview.status().display?.nativeSchemaEvidence?.collectionVersion===87&&nativePreview.status().capability?.allowedPreviewOperations?.includes('batch-family-revoke');
  if(familyBatchAvailable)scopes.formalFamily={label:'限定Family受入対象（3種類）',ids:rows.filter(r=>FORMAL_FAMILY_REVOKE_KEYS.includes(r.key)).map(r=>r.id)};
  const selection=bulkTargetPicker(host,{rows,operation:'achievement-timestamp',scopes});
  if(familyBatchAvailable)host.append(node('p','editor-hint','限定Family一括取消：達成済みの受入対象2〜3件を選択し revoke と入力。親Groupと共有Account rootを連動、報酬受取・所持品は変更しません。'));
  nativePreviewForm(host,{label:'InGame 原子的な一括プレビュー',operations:[['achievement-timestamp','達成日時'],['achievement-progress','進捗'],...(familyBatchAvailable?[['batch-family-revoke','限定Family一括達成取消']]:[])],selection,makeRequests:(op,value)=>[op==='batch-family-revoke'?familyBatchRequest(nativePreview.status(),selection.snapshot(op).targets.map(r=>r.key),value):achievementBatchRequest(selection.snapshot(op).targets.map(r=>r.key),op,value)]});
}
function renderCollectionBulk(host,items,definitionItems,categoryItems){
  const saved=new Map(nativePreview.status().display?.save.collectionHistoryEntries??[]);const catalog=state.itemManifest?.items??[];const byId=new Map(catalog.map(r=>[r.id,r]));for(const id of saved.keys())if(!byId.has(id))byId.set(id,{id,key:`未知ItemId ${id}`});
  const rows=[...byId.values()].map(r=>({id:r.id,domain:'collection',saved:saved.has(r.id),unknownIdentity:!r.guid||!r.collection_guid,label:r.key||`ItemId ${r.id}`}));
  const ids=items=>[...new Set(items.map(r=>r.id))];
  const selection=bulkTargetPicker(host,{rows,operation:'collection-key1-ticks',scopes:{filtered:{label:'検索・絞り込み対象',ids:ids(items)},definition:{label:'このCollection定義の全ItemId',ids:ids(definitionItems)},category:{label:'このカテゴリの全ItemId',ids:ids(categoryItems)},all:{label:'全ItemId（定義＋保存履歴）',ids:rows.map(r=>r.id)}}});
  nativePreviewForm(host,{label:'履歴日時一括プレビュー（既存Key1のみ）',operations:[['collection-key1-ticks','既存履歴日時を変更']],selection,makeRequests:(_op,value)=>[collectionTicksRequest(selection.snapshot().targets.map(r=>r.id),saved,value)]});
}
const categoriesJP={balloons:'風船',birthdays:'誕生日',characterhats:'キャラクターの帽子',clothing:'洋服',comics:'漫画',critters:'生き物',events:'イベント',fish:'魚',fishalmanacs:'魚図鑑',flowers:'花',food:'料理',furniture:'家具',instructions:'作成手順',musicdiscs:'音楽ディスク',plans:'設計図',potions:'ポーション',recipes:'レシピ',tools:'道具',trinkets:'小物',weather:'天候',citytown:'シティタウン',plushpals:'ぬいぐるみ',wheatflourwonderland:'ウィートフラワー・ワンダーランド',teagarden:'ティーガーデン',floorplans:'間取り図'};
function keySuffix(k){return k.replace(/^collections?_group_/,'');}
function titleForCategory(k){const suffix=keySuffix(k);return categoriesJP[suffix]||suffix;}
function node(tag,className,content){const x=document.createElement(tag);if(className)x.className=className;if(content!==undefined)x.textContent=String(content);return x;}
function withChildren(tag,cls,...children){const n=node(tag,cls);for(const child of children)if(child)n.append(child);return n;}
function setTab(name){const ach=name==='achievements';el('achTab').classList.toggle('active',ach);el('colTab').classList.toggle('active',!ach);el('achTab').setAttribute('aria-selected',String(ach));el('colTab').setAttribute('aria-selected',String(!ach));el('achTab').tabIndex=ach?0:-1;el('colTab').tabIndex=ach?-1:0;el('achPanel').hidden=!ach;el('colPanel').hidden=ach;if(!ach)renderCollections();}
function currentFormat(name){return name.toLowerCase().endsWith('.zip')?'zip':name.toLowerCase().endsWith('.json')?'account-json':'save';}
function clearPreviousPreview(){
  for(const id of ['batchResult','editorPanel','colUnknownPanel','collectionDetail'])el(id).replaceChildren();
}
function renderSourceRevision(){
  const host=el('sourceRevisionNotice');host.replaceChildren();
  host.hidden=!(state.sourceRevision||state.sourceRevisionError||state.sourceLoading||state.revisionChanged);
  if(host.hidden)return;
  host.append(node('strong','',state.sourceLoading?'Source revision 確認中・編集レビュー無効':
    state.sourceRevision?'Source revision：ローカルSHA-256観測済み（Native CAS未実行）':'Source revision：UNKNOWN'));
  if(state.sourceRevision){
    const revision=state.sourceRevision;
    host.append(node('p','',`入力形式 ${revision.format} / SHA-256 ${revision.sha256.slice(0,16)}… / 読込世代 ${revision.epoch}`));
    const status=inspectRevisionCAS({expected:revision,current:revision,readEvidence:state.slotEvidence});
    host.append(node('p','',`UIスナップショット照合 ${status.status}。研究用CAS証拠≠実適用許可。Native Apply/Exportは禁止。`));
  }
  if(state.revisionChanged)host.append(node('p','error-message','SOURCE_REVISION_MISMATCH：前回と異なるファイルを選択しました。旧プレビューは破棄済みです。現在の入力から再作成してください。'));
  if(state.sourceRevisionError)host.append(node('p','error-message',`SOURCE_REVISION_UNKNOWN：${state.sourceRevisionError}。Native CAS状態を検証できません。`));
  host.append(node('p','editor-hint','読み込んだバイト列のみの比較です。ディスク上の同時変更やゲーム側での変更を監視せず、Native Writerの整合性・受入を証明しません。'));
}
function nativePreviewBinding(domain){
  if(!state.sourceRevision)return null;
  return captureReadOnlyPreview(state.sourceRevision,{domain,readEvidence:state.slotEvidence});
}
async function inspectLivePreview(binding){
  if(!binding)return inspectRevisionCAS({expected:null,current:null,readEvidence:state.slotEvidence});
  const active=state.sourceRevision;
  if(!active||state.sourceLoading||!state.originalBytes)return assessReadOnlyPreview(binding,null);
  try{
    const bytes=state.originalBytes;
    const sha256=await fingerprintSourceBytes(bytes);
    const updated=state.sourceRevision;
    if(!updated||updated.epoch!==active.epoch||state.sourceLoading||state.originalBytes!==bytes)return assessReadOnlyPreview(binding,updated);
    return assessReadOnlyPreview(binding,sourceRevisionSnapshot({sha256,epoch:updated.epoch,format:updated.format}));
  }catch{return assessReadOnlyPreview(binding,null);}
}
function appendCASReadOnly(host,result){
  const status=result.status==='SOURCE_REVISION_MISMATCH'?'SOURCE_REVISION_CAS_MISMATCH：旧プレビューは無効':result.status==='REVISION_UNKNOWN'?'SOURCE_REVISION_UNKNOWN：照合不能':'UIスナップショット一致（Native CAS未実行）';
  host.append(node('p',result.stale||result.status==='REVISION_UNKNOWN'?'error-message':'editor-hint',status));
  host.append(node('p','error-message',`Native Apply/Export OFF：${result.blockers.join(' / ')}`));
}
function downloadOriginal(){if(state.originalBytes)offerFile(state.originalBytes,state.originalName||'original-backup.bin');}
function downloadAccount(){if(!state.account||state.slotEvidence?.accountExportAllowed===false){error('構造読取専用のSave slotを含むため、編集済みAccountの出力を禁止しています。');return;}try{offerFile(exportAccount(state.account),'settings_edited.json','application/json');setStatus();}catch(e){error(e.message);}}
async function downloadEditedArchive(){
  if(state.zipExportBusy||!state.account||!state.dirty||!state.archiveLoaded||state.slotEvidence?.accountExportAllowed===false)return;
  let binding;
  try{
    const editedAccount=exportAccount(state.account);
    binding=captureAccountZipExport(state);
    const before=inspectAccountZipExport({binding,current:state});
    if(!before.allowed)throw new Error(before.blockers.join(' / '));
    state.zipExportBusy=true;
    clearError();el('downloadZip').textContent='ZIPを検証・生成中…';setStatus();
    const archive=await repackSettingsZip(binding.originalBytes,editedAccount);
    const sha256=await fingerprintSourceBytes(binding.originalBytes);
    const after=inspectAccountZipExport({binding,current:state,verifiedSha256:sha256});
    if(!after.allowed)throw new Error('ACCOUNT_ZIP_EXPORT_CAS_ABORTED：'+after.blockers.join(' / '));
    offerFile(archive,binding.originalName.replace(/\.zip$/i,'')+'_edited.zip','application/zip');
  }catch(e){error('編集済みZIPの出力を中止：'+e.message);}finally{
    state.zipExportBusy=false;el('downloadZip').textContent='編集したZIPを保存';setStatus();
  }
}
function setStatus(){let n=state.account&&state.save?'Account + Save slot':state.account?'Account JSON':state.save?'Save slot':'未読み込み';const block=state.slotEvidence?.accountExportAllowed===false||state.sourceLoading||state.revisionChanged&&state.sourceRevision===null;el('fileStatus').textContent=n+(state.dirty?' • 未保存の変更':'')+(block?' • 構造READ ONLY':'');el('downloadEdited').disabled=!state.account||!state.dirty||block;el('downloadZip').hidden=!state.archiveLoaded;el('downloadZip').disabled=!state.archiveLoaded||!state.account||!state.dirty||block||!state.sourceRevision||state.sourceRevision.format!=='zip'||state.zipExportBusy;}
function displayValue(value){return value===null?'未設定':typeof value==='boolean'?(value?'達成済み':'未達成'):String(value);}
function refreshAccountDirty(){
  state.dirty=Boolean(state.accountBaseline&&accountChangeSet(state.accountBaseline,state.account).length);
  setStatus();renderAccountChangeBar();
}
function rememberAccount(){closeNativePreviewSession();state.accountEditGeneration++;state.history.push(JSON.stringify(state.account));if(state.history.length>30)state.history.shift();}
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
  closeNativePreviewSession();state.accountEditGeneration++;state.account=JSON.parse(state.history.pop());
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
  const expectedRevision=state.sourceRevision;
  const controls=node('div','button-row');const apply=node('button','btn-primary','この差分をAccountに反映');apply.type='button';
  const cancel=node('button','btn-secondary','取消');cancel.type='button';
  apply.addEventListener('click',()=>{
    const cas=inspectRevisionCAS({expected:expectedRevision,current:state.sourceRevision,readEvidence:state.slotEvidence});
    if(cas.stale||state.sourceLoading||(expectedRevision&&!state.sourceRevision)){target.replaceChildren(node('p','error-message','SOURCE_REVISION_CAS_MISMATCH：旧プレビュー無効。ファイルを再読込して変更案を作成してください。'));return;}
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
  closeNativePreviewSession();nativeNotice="";
  const prior=state.sourceRevision;
  const epoch=++state.sourceLoadEpoch;
  state.accountEditGeneration++;
  state.sourceLoading=true;state.sourceRevision=null;state.sourceRevisionError=null;state.revisionChanged=false;
  state.account=null;state.accountBaseline=null;state.accountOriginal=null;state.history=[];
  state.save=null;state.saveOriginal=null;state.slotEvidence=null;state.collectionMatch=null;
  state.parentMatch=null;state.collectionReadModel=null;state.collectionHistoryDisplay=null;
  state.slotCountersByGuid=new Map();state.slotAchievementsByGuid=new Map();
  state.originalBytes=null;state.archiveLoaded=false;state.dirty=false;state.selectedAchievement=null;
  state.selectedItemId=null;state.selectedCollection=null;state.selectedCollectionDefinition=null;
  el('fileInfo').hidden=true;clearPreviousPreview();setStatus();renderSourceRevision();renderNativeSession();renderAchievements();renderCollections();
  if(file.size>60*1024*1024){state.sourceLoading=false;state.sourceRevisionError='60MBを超えるファイルは未対応です';setStatus();renderSourceRevision();error(state.sourceRevisionError);return;}
  let bytes;
  try{bytes=new Uint8Array(await file.arrayBuffer());}
  catch(e){if(epoch!==state.sourceLoadEpoch)return;state.sourceLoading=false;state.sourceRevisionError='ファイルを読み込めません';setStatus();renderSourceRevision();error(e.message);return;}
  if(epoch!==state.sourceLoadEpoch)return;
  let nextRevision=null,revisionError=null;
  try{nextRevision=sourceRevisionSnapshot({sha256:await fingerprintSourceBytes(bytes),epoch,format:currentFormat(file.name)});}
  catch(e){revisionError=e.message;}
  if(epoch!==state.sourceLoadEpoch)return;
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
    if(epoch!==state.sourceLoadEpoch)return;
    state.account=account;state.accountOriginal=accountBytes?.slice()||null;state.accountBaseline=account?structuredClone(account):null;state.history=[];
    state.save=save;state.saveOriginal=saveBytes?.slice()||null;state.slotEvidence=slot?.evidence??null;
    state.collectionMatch=collectionMatch;state.parentMatch=parentMatch;state.collectionReadModel=collectionUI?.model??null;state.collectionHistoryDisplay=collectionUI?.display??null;
    state.slotCountersByGuid=new Map((save?.counters||[]).map(r=>[r.guid.toLowerCase(),r]));
    state.slotAchievementsByGuid=new Map((save?.achievements||[]).map(r=>[r.guid.toLowerCase(),r]));
    state.originalBytes=bytes.slice();state.originalName=file.name;state.archiveLoaded=file.name.toLowerCase().endsWith('.zip');
    state.sourceRevision=nextRevision;state.sourceRevisionError=revisionError;state.revisionChanged=Boolean(prior&&nextRevision&&prior.sha256!==nextRevision.sha256);state.sourceLoading=false;
    for(const id of ['achievementSearch','collectionSearch'])el(id).value='';for(const id of ['achievementFilter','achievementImageFilter','collectionStatusFilter'])el(id).value='all';
    state.source=account?'account':'slot';state.visibleAccountGuids=[];state.achLimit=120;el('batchResult').replaceChildren();state.dirty=false;state.selectedAchievement=null;state.selectedCollectionDefinition=null;state.selectedItemId=null;
    showInfo();renderSourceRevision();renderNativeSession();renderAchievements();renderCollections();
  }catch(e){if(epoch!==state.sourceLoadEpoch)return;state.sourceLoading=false;state.sourceRevision=null;state.sourceRevisionError='読み込み失敗。前のプレビューは無効です';state.originalBytes=null;state.archiveLoaded=false;state.account=null;state.accountBaseline=null;state.save=null;state.slotEvidence=null;state.dirty=false;el('fileInfo').hidden=true;setStatus();renderSourceRevision();renderNativeSession();renderAchievements();renderCollections();error(`読み込み失敗：${e.message}`);}
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
function achievementImageGuid(r){return r.kind==='account'?r.guid:state.localAchievementDefinitions.get(r.guid.toLowerCase())?.guid;}
function achievementArt(r){return imageUi()?.achievement(r.kind==='account'?'account':'slot',achievementImageGuid(r));}
function imageFilterMatch(r,filter){const icon=achievementArt(r);if(filter==='all')return true;return filter==='exact'?icon?.status==='EXACT':filter==='source-null'?icon?.status==='SOURCE_NULL':!icon||icon.status==='NOT_IN_SOURCE_MAP'||icon.status==='EXPORT_FAILED';}
function appendRelatedImage(host,related){
  if(!related)return;
  const label=related.kind==='parent'?'親実績の関連画像':'親カテゴリの関連画像';
  const strip=node('div','media-detail-strip media-related-context');strip.append(imageElement(related.icon,{kind:'related-'+related.kind,size:64,label}),node('span','media-caption',`${label}：${related.parentKey}（本人の直接画像ではありません・ゲーム実行時表示は未検証）`));host.append(strip);
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
  let all=achievements();const allTargets=all;
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
  const searchText=x=>[achievementTitle(x),x.guid,x.id,x.completed,slotAchievementGroup(x),state.localAchievementDefinitions.get(x.guid.toLowerCase())?.key,state.localAchievementDefinitions.get(x.guid.toLowerCase())?.counter_name,localizedAchievement(x,'en')?.title,localizedAchievement(x,'ja')?.description,localizedAchievement(x,'en')?.description,achievementArt(x)?.spritePathId].join(' ');
  all=filterSortAchievements(all,{query:el('achievementSearch').value,filter:el('achievementFilter').value,sort:el('achievementSort').value,searchText});
  el('achievementImageFilter').hidden=!imageUi();
  if(imageUi())all=all.filter(r=>imageFilterMatch(r,el('achievementImageFilter').value));
  state.visibleAccountGuids=state.source==='account'?all.map(x=>x.guid):[];
  renderNativeBatch(all,allTargets);renderNativeSession();
  renderAccountChangeBar();
  const list=el('achievementsList');list.replaceChildren();
  if(all.length===0){list.append(node('p','placeholder',state.source==='slot'&&state.slotEvidence?.readable.achievement===false?'Achievement Domain UNKNOWN：保存済みモデルを認識できません。ゼロ件・未達成とは解釈しません。':acc||save?'条件に一致する記録がありません。':'セーブを読み込むと記録が表示されます。'));renderEditor();return;}
  const fragment=document.createDocumentFragment();
  for(const r of all.slice(0,state.achLimit)){
    const row=node('button','achievement-row');row.type='button';row.classList.toggle('selected',r.guid===state.selectedAchievement);row.setAttribute('aria-label',`${achievementTitle(r)}、${completedLabel(r)}、進捗 ${r.current===null?'UNKNOWN':r.current}`);
    row.classList.toggle('missing-record',r.kind==='slot-missing');
    const known=r.kind==='account'?state.achievementDefinitions.has(r.guid.toLowerCase()):state.localAchievementDefinitions.has(r.guid.toLowerCase());
    if(!known)row.classList.add('unknown-identity');
    const icon=imageUi()?imageElement(achievementArt(r),{kind:'achievement',label:'実績画像'}):node('div',`ach-symbol${r.complete?' done':''}`,r.complete?'✓':'☆');
    const middle=withChildren('div','ach-text',node('strong','',achievementTitle(r)),node('small','',r.kind==='account'?r.guid:r.kind==='slot-missing'?`${r.guid} · 保存レコードなし`:`${r.guid} · Document ${r.id} · 進捗 ${r.current}`),!known?node('small','unknown-tag','名称未照合・保存済みレコード'):null,r.kind==='account'&&imageUi()?.externalAccount(r.guid)?node('small','media-caption','外部画像 UNKNOWN'):null);
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
  if(imageUi()){const art=node('div','media-detail-strip');art.append(imageElement(achievementArt(record),{kind:'achievement',size:64,label:'実績画像'}),node('span','media-caption',`実績画像：${achievementArt(record)?.status??'NOT_IN_SOURCE_MAP'}`));const reward=record.kind==='account'?null:imageUi().reward(achievementImageGuid(record));if(reward?.rewardItemId!=null&&reward.quantity>0)art.append(imageElement(reward.rewardIcon,{kind:'reward',size:64,label:'定義上の報酬画像'}),node('span','media-caption',`報酬アイテム ${reward.rewardItemId} × ${reward.quantity}（受取未判定）`));panel.append(art);if(record.kind==='account'){if(imageUi().externalAccount(record.guid))panel.append(node('p','media-caption media-external-unknown','外部プラットフォーム画像：UNKNOWN_EXTERNAL_ICON（原画像未確認）'));}else appendRelatedImage(panel,imageUi().relatedAchievement(achievementImageGuid(record)));}
  if(record.kind==='slot-missing'){
    panel.append(node('p','editor-hint','この定義の実績レコードは今回のSave slotに保存されていません。未達成・進捗0・未解放の証拠ではありません。新規レコード生成と保存出力は禁止です。'));
    appendDependencies(panel,dependencyInspector({domain:'slot',key:state.localAchievementDefinitions.get(record.guid.toLowerCase())?.key||''}));
    return;
  } 
  if(record.kind==='slot'){
    if(state.slotEvidence?.mode==='STRUCTURAL_READ_ONLY')panel.append(node('p','error-message','構造読取専用：既知フィールドの変更案だけ作成可能です。未検証のマップ構造・Counter・Group・未知Unionは参考情報であり、保存・出力はできません。'));
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
    const nativeBinding=nativePreviewBinding('achievement');
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
    dry.addEventListener('submit',async event=>{event.preventDefault();draftResult.replaceChildren();const cas=await inspectLivePreview(nativeBinding);if(cas.stale||cas.status==='REVISION_UNKNOWN'){appendCASReadOnly(draftResult,cas);return;}try{
      const plan=previewNativeAchievementIntent({record,mapped,sourceKey:detail?.key||'',complete:flag.checked,current:Number(value.value),completed:time.value.trim()||null});
      draftResult.append(node('strong','','変更前 → 変更後（確定変更は0件）'));
      if(plan.fields.length)for(const d of plan.fields)draftResult.append(detailLine(d.field,`${displayValue(d.before)} → ${displayValue(d.after)}`));
      else draftResult.append(node('p','editor-hint','差分なし'));
      const prepared=WEB05_WRITER_PORT.prepareNative({domain:'achievement',saveVersion:state.save?.version??'UNKNOWN',readEvidence:state.slotEvidence});
      draftResult.append(node('p','error-message',`出力禁止：${[...plan.blockers,...prepared.blockers].join(' / ')}`));
      appendCASReadOnly(draftResult,cas);
    }catch(e){draftResult.append(node('p','error-message',e.message));}});
    if(!detail||!nativePreviewForm(section,{label:'Native実績の型付きプレビュー',operations:[['achievement-timestamp','達成日時'],['achievement-progress','進捗'],...(detail.key==='achievement_puzzlesInTheStars'?[['puzzle-goals-complete','限定 Puzzle Goals 連動達成']]:[])],makeRequests:(op,v)=>[op==='achievement-timestamp'?{operation:op,key:detail.key,completedAt:v}:op==='achievement-progress'?{operation:op,key:detail.key,progress:Number(v)}:{operation:op,completedAt:v}]}))section.append(dry);if(detail&&FORMAL_FAMILY_REVOKE_KEYS.includes(detail.key)){const v=nativePreview.status();const reason=familyRevokeReason(v,detail.key);if(v.ready&&!reason&&record.complete===true)nativePreviewForm(section,{label:'限定Family達成取消（正式版候補）',operations:[['achievement-family-revoke','達成取消・連動進捗0']],makeRequests:(_op,v)=>[familyRevokeRequest(nativePreview.status(),detail.key,v)],family:true});else section.append(node('p','editor-hint','限定Family達成取消：'+(reason??'達成済み対象のみ。Coreの前提照合が必要です。')));}
    const manual=detail&&manual9Target(detail.key);if(manual){const v=nativePreview.status(),reason=manual9Reason(v,detail.key);if(v.ready&&!reason){nativePreviewForm(section,{label:'限定Manual9 達成取消（正式版候補）',operations:[['achievement-manual9-revoke','達成取消']],makeRequests:(_op,value)=>[manual9Request(nativePreview.status(),detail.key,value)],manual9:manual});}else section.append(node('p','editor-hint','限定Manual9：'+(reason??'検証Sessionが必要です。')));}
    const exact=detail&&formal49Target(detail.key);if(exact){const v=nativePreview.status(),reason=formal49Reason(v,detail.key);if(v.ready&&!reason){nativePreviewForm(section,{label:'限定Exact20 達成・取消（正式版候補）',operations:[['achievement-formal49-edit',exact.action==='COMPLETE'?'達成':'達成取消']],makeRequests:(_op,value)=>[formal49Request(nativePreview.status(),detail.key,value)],formal49:exact});}else section.append(node('p','editor-hint','限定Exact20：'+(reason??'検証Sessionが必要です。')));}
    panel.append(section);return;
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
    let img=null;if(imageUi())img=imageElement(imageUi().category(cat.guid,cat.key),{kind:'category',size:92,label:'カテゴリ画像'});else if(typeof cat.icon==='string'&&cat.icon.startsWith('./assets/')){img=document.createElement('img');img.src=cat.icon;img.alt='';img.className='collection-icon';img.loading='lazy';img.width=92;img.height=92;}else img=node('span','collection-icon-fallback','画像 UNKNOWN');
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
    if(imageUi()){const media=imageUi().collection(r.guid,r.group);button.prepend(imageElement(media?.directIcon,{kind:'collection',label:'コレクション定義の直接画像'}));button.append(node('small','media-caption','直接画像 SOURCE_NULL'));}
    if(match){const p=sourceParentStats(r.key);button.append(node('span','record-count',`履歴記録ID ${formatSourceCounts(match.recorded.length,match.items.length)}${p?` ／ 親単位・参考 ${p.familyRecorded}/${p.familyTotal}`:''}`));}
    button.addEventListener('click',()=>{state.selectedCollectionDefinition=r.key;renderCollectionDetail();el('collectionDetail').querySelector('.definition-button.active')?.focus();});list.append(button);
  }
  panel.append(list);
  const liveSelected=sourceCollectionStats(state.selectedCollectionDefinition);
  const catalogDefinition=records.find(r=>r.key===state.selectedCollectionDefinition);
  const selected=liveSelected??(imageUi()&&catalogDefinition&&state.itemManifest?{definition:catalogDefinition,items:state.itemManifest.items.filter(r=>r.collection_guid===catalogDefinition.guid&&r.collection_key===catalogDefinition.key),recorded:[]}:null);
  if(!selected){panel.append(node('p','editor-hint',state.slotEvidence?.readable['collection-history']===false?'CollectionHistory Domain UNKNOWN：保存済みの有無を判断できません。':state.save?'選択した定義に対応する保存照合がありません。':'保存記録は未照合です。カテゴリ定義のみ表示しています。'));return;}
  const section=node('section','collection-item-detail');
  const rule=selected.definition;
  const family=sourceParentStats(state.selectedCollectionDefinition);
  appendRelatedImage(section,imageUi()?.relatedCollection(rule.guid,rule.group));
  section.append(node('h5','',state.selectedCollectionDefinition),node('p','',`${liveSelected?`保存履歴ID ${selected.recorded.length}`:'保存履歴 UNKNOWN'} / 定義上のアイテムID ${selected.items.length}。${family?`原本のParentItemだけを統合した参考値 ${family.familyRecorded} / ${family.familyTotal}（ゲーム画面の達成率ではありません）。`:''}${rule.group_items_by_parent?' ゲーム定義は親アイテムでの集約を指定しています。':''}${rule.event_source_defined?' イベント年条件: '+rule.event_year+'。':''}DLC・イベント表示、インベントリーの実行時判定、他カテゴリへの親参照は未再現です。`));
  const toolbar=node('div','toolbar');
  const queryField=withChildren('label','search-wrap');
  const query=document.createElement('input');query.type='search';query.placeholder='内部名・ID・GUID・Sprite PathID';query.setAttribute('aria-label','コレクションアイテムの検索');queryField.append(query);
  const filter=document.createElement('select');filter.setAttribute('aria-label','収集履歴の状態');
  for(const [value,text] of [['all','すべて'],['collected','収集履歴あり'],['missing','収集履歴なし']]){const opt=document.createElement('option');opt.value=value;opt.textContent=text;filter.append(opt);}
  filter.disabled=!liveSelected;toolbar.append(queryField,filter);section.append(toolbar);
  const bulk=node('div','native-collection-bulk');section.append(bulk);
  const count=node('p','collection-list-caption','');const rows=node('div','collection-items-list');
  const itemInspector=node('section','item-inspector');itemInspector.setAttribute('aria-live','polite');
  section.append(count,rows,itemInspector);
  const sortItems=document.createElement('select');sortItems.setAttribute('aria-label','収集アイテムの並び順');
  for(const [value,label] of [['source','定義順'],['name','内部名順'],['id','ID順']]){const opt=node('option','',label);opt.value=value;sortItems.append(opt);}
  toolbar.append(sortItems);
  let limit=100;
  const renderRows=()=>{
    const q=query.value.trim().toLowerCase();const f=filter.value;const ids=state.collectionMatch?.recordedSet;
    const matches=selected.items.filter(item=>{const collected=ids?.has(item.id);return (!q||item.key.toLowerCase().includes(q)||String(item.id).includes(q)||item.guid?.includes(q)||imageUi()?.item(item.id,item.guid,rule.guid).spritePathId===q)&&(f==='all'||!ids||Boolean(collected)===(f==='collected'));});
    if(sortItems.value==='name')matches.sort((a,b)=>a.key.localeCompare(b.key,'ja'));
    if(sortItems.value==='id')matches.sort((a,b)=>a.id-b.id);
    bulk.replaceChildren();if(nativePreview.status().ready)renderCollectionBulk(bulk,matches,selected.items,records.flatMap(r=>sourceCollectionStats(r.key)?.items??[]));
    count.textContent=`該当 ${matches.length}件（${Math.min(matches.length,limit)}件表示）。履歴なしは未取得や未解放を意味しません。日時は保存済み100ns ticksを表示し、UTC・Kindは未検証です。`;
    rows.replaceChildren();const frag=document.createDocumentFragment();
    for(const item of matches.slice(0,limit)){
      const typed=state.collectionReadModel?.getItem(item.id);const collected=typed?.historyRecorded;const row=node('div','collection-item-row');
      if(imageUi())row.append(imageElement(imageUi().item(item.id,item.guid,rule.guid),{kind:'item',label:'アイテム画像'}));
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
  const catalogItem=state.itemManifest?.items.find(x=>x.id===itemId);
  if(imageUi())host.append(imageElement(imageUi().item(itemId,catalogItem?.guid,catalogItem?.collection_guid),{kind:'item',size:64,label:'アイテム画像'}));
  if(!model){if(catalogItem)host.append(node('h5','',catalogItem.key),detailLine('ItemId',itemId),detailLine('定義GUID',catalogItem.guid));host.append(node('p','editor-hint','保存履歴は未照合です。読み込むまで編集案は作成できません。'));return;}
  const item=model.getItem(itemId);
  const stamp=state.collectionHistoryDisplay?collectionHistoryUiStatus({model,display:state.collectionHistoryDisplay,itemId}):null;
  host.append(node('h5','',item.sourceKey||`名称 UNKNOWN / ItemId ${itemId}`),detailLine('ItemId',itemId),detailLine('定義GUID',item.sourceGuid||'UNKNOWN'),detailLine('所属カテゴリ',item.collectionKey||'UNKNOWN'),detailLine('定義照合分類',stamp?.membership??item.status),detailLine('履歴の有無',stamp?.recorded?'記録あり':'記録なし'),
    detailLine('保存日時 raw ticks（100ns / int64）',stamp?.rawTicks??(item.historyRecorded?'UNKNOWN（未露出）':'履歴なし')),
    detailLine('暦表示（タイムゾーン未確認）',stamp?.calendar??(stamp?.recorded?'UNKNOWN':'履歴なし')),
    detailLine('日時分類',stamp?.timestampState??'UNKNOWN'),detailLine('UTC / DateTime.Kind / 時差','UNKNOWN / UNKNOWN / UNKNOWN'));
  if(stamp?.gateWarnings.length)for(const warning of stamp.gateWarnings)host.append(node('p','editor-hint',`RELATED / UNKNOWN: ${warning}`));
  appendDependencies(host,dependencyInspector({domain:'collection',hasCollection:Boolean(item.collectionKey)}));
  const nativeBinding=nativePreviewBinding('collection-history');
  const form=node('form','native-dry-form');form.append(node('h5','','収集履歴の変更案（Writer OFF）'));
  const opLabel=withChildren('label','editor-field',node('span','','仮の操作'));const op=document.createElement('select');
  for(const [val,label] of [['record','履歴を追加'],['remove','履歴を削除'],['set-time','日時を変更']]){const opt=node('option','',label);opt.value=val;op.append(opt);}
  opLabel.append(op);const tickLabel=withChildren('label','editor-field',node('span','','新日時 ticks（DateTime形式、明示値のみ）'));const tick=document.createElement('input');tick.type='text';tick.placeholder='例: 638900000000000000';tickLabel.append(tick);
  const preview=node('button','btn-secondary','差分・禁止理由を確認');preview.type='submit';const result=node('div','native-dry-result');result.setAttribute('aria-live','polite');
  form.append(opLabel,tickLabel,preview,result);op.addEventListener('change',()=>result.replaceChildren());tick.addEventListener('input',()=>result.replaceChildren());
  form.addEventListener('submit',async e=>{e.preventDefault();result.replaceChildren();const cas=await inspectLivePreview(nativeBinding);if(cas.stale||cas.status==='REVISION_UNKNOWN'){appendCASReadOnly(result,cas);return;}try{
    const plan=previewNativeCollectionIntent({model,display:state.collectionHistoryDisplay,itemId,operation:op.value,proposedTicks:tick.value.trim()||null});
    const prepared=WEB05_WRITER_PORT.prepareNative({domain:'collection-history',saveVersion:model.saveVersion,readEvidence:state.slotEvidence});
    result.append(detailLine('履歴の有無',`${plan.before.historyRecorded?'履歴あり':'履歴なし'} → ${plan.afterRecorded?'履歴あり':'履歴なし'}`),detailLine('日時 ticks',`${plan.rawBeforeTicks??'UNKNOWN'} → ${plan.afterTicks??'未設定'}`));
    result.append(node('p','error-message',`書き戻し禁止：${[...plan.blockers,...prepared.blockers].join(' / ')}`));
    appendCASReadOnly(result,cas);
    for(const warning of plan.warnings)result.append(node('p','editor-hint',`RELATED / UNKNOWN: ${warning}`));
  }catch(err){result.append(node('p','error-message',err.message));}});
  if(state.slotEvidence?.mode==='STRUCTURAL_READ_ONLY')host.append(node('p','error-message','構造READ ONLYの収集履歴はv3.0.1カタログの参考照合だけです。編集案は保存・出力不可。新規ID生成、未知UnionやKey0の正規化は行いません。'));
  const saved=new Map(nativePreview.status().display?.save.collectionHistoryEntries??[]);const old=saved.get(itemId);
  if(!nativePreviewForm(host,{label:'Native収集履歴プレビュー（実取得ではない）',operations:old===undefined?[['collection-key1-add','履歴追加']]:[['collection-key1-ticks','履歴日時'],['collection-key1-remove','履歴削除']],makeRequests:(op,v)=>[op==='collection-key1-ticks'?collectionTicksRequest([itemId],saved,v):op==='collection-key1-add'?{operation:op,itemId,expectedTicks:null,newTicks:v}:{operation:op,itemId,expectedTicks:old,newTicks:null}]}))host.append(form);
  const recipeView=nativePreview.status(),recipeRow=recipeView.display?.recipeQuantityEvidence;const expansionRows=recipeView.capability?.recipeExpansionTargets?.filter(r=>r.itemId===itemId);if(RECIPE_EXPANSION_IDS.includes(itemId)&&recipeView.ready&&recipeView.version==='3.0.1'){if(expansionRows?.length===1&&expansionRows[0].quantity===1&&!recipeView.recipeRestore)nativePreviewForm(host,{label:'Recipe4既存行の数量変更（限定）',operations:[['collection-recipe-expansion-quantity','Quantity 1 → 0']],makeRequests:(_op,_v,c)=>[recipeExpansionForwardRequest(expansionRows[0],c)],recipe:true});else host.append(node('p','editor-hint','Recipe4：対象行の条件不一致、または復元Receipt保留中。一般取得・任意復元は未対応。'));}const expansion23Rows=recipeView.capability?.recipeExpansion23Targets?.filter(r=>r.itemId===itemId);if(RECIPE_EXPANSION23_IDS.includes(itemId)&&recipeView.ready&&recipeView.version==='3.0.1'){if(expansion23Rows?.length===1&&expansion23Rows[0].quantity===1&&!recipeView.recipeRestore)nativePreviewForm(host,{label:'Recipe23既存行の数量変更（限定）',operations:[['collection-recipe-expansion23-quantity','Quantity 1 → 0']],makeRequests:(_op,_v,c)=>[recipeExpansion23ForwardRequest(expansion23Rows[0],c)],recipe:true});else host.append(node('p','editor-hint','Recipe23：対象行の条件不一致、または復元Receipt保留中。一般取得・任意復元は未対応。'));}const celebration5Rows=recipeView.capability?.recipeCelebration5Targets?.filter(r=>r.itemId===itemId);if(RECIPE_CELEBRATION5_IDS.includes(itemId)&&recipeView.ready&&recipeView.version==='3.0.1'){if(celebration5Rows?.length===1&&celebration5Rows[0].quantity===1&&!recipeView.recipeRestore)nativePreviewForm(host,{label:'Celebration5既存行の数量変更（限定）',operations:[['collection-recipe-celebration5-quantity','Quantity 1 → 0']],makeRequests:(_op,_v,c)=>[recipeCelebration5ForwardRequest(celebration5Rows[0],c)],recipe:true});else host.append(node('p','editor-hint','Celebration5：対象行の条件不一致、または復元Receipt保留中。一般取得・任意復元は未対応。'));}if(itemId===5913958&&recipeView.ready&&recipeView.version==='3.0.1'&&recipeRow?.itemId===itemId){if(recipeRow.quantity===1&&!recipeView.recipeRestore)nativePreviewForm(host,{label:'Recipe既存行の数量変更（限定）',operations:[['collection-recipe-quantity','Quantity 1 → 0']],makeRequests:(_op,_v,c)=>[recipeForwardRequest(recipeRow,c)],recipe:true});else host.append(node('p','editor-hint','Recipeの一般復元は未対応。同一Sessionの検証済み出力Receiptがある場合のみSession欄から復元できます。'));}
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
    try{bindPrivateImageCatalog({accounts:c,achievements:g.records,categories:a,collections:b,items:e.items,achievementReferences:d.achievement_references});}catch(err){error('非公開画像の照合失敗：'+err.message+'。画像は無効化しました。');}
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
  el('openNativePreview').addEventListener('click',async()=>{nativeNotice='';const epoch=state.sourceLoadEpoch,attempt=++nativeOpenAttempt;if(!nativeModuleStaged())return;const pending=nativePreview.connect();renderNativeSession();try{await pending;if(epoch!==state.sourceLoadEpoch||attempt!==nativeOpenAttempt)return;adoptNativeDisplay();nativeNotice='';}catch(e){if(epoch!==state.sourceLoadEpoch||attempt!==nativeOpenAttempt)return;closeNativePreviewSession();nativeNotice=e.message;}renderNativeSession();renderAchievements();renderCollections();});
  el('closeNativePreview').addEventListener('click',()=>{closeNativePreviewSession();nativeNotice='Session closed / previews discarded';renderNativeSession();renderAchievements();renderCollections();});
  el('nativeDownload').addEventListener('click',async()=>{if(!nativePreview.outputStatus().export)return;const attempt=nativeOpenAttempt,epoch=state.sourceLoadEpoch;try{const pending=nativePreview.exportCopy();renderNativeSession();const file=await pending;if(attempt!==nativeOpenAttempt||epoch!==state.sourceLoadEpoch||!nativePreview.status().ready)return;offerFile(file,'edited-copy.zip','application/zip');nativeNotice='別名コピー出力済み。再読込して確認してください。';}catch(e){if(attempt!==nativeOpenAttempt||epoch!==state.sourceLoadEpoch)return;nativeNotice='出力失敗・候補破棄：'+e.message;}renderNativeSession();renderAchievements();renderCollections();});
  el('nativeDiscard').addEventListener('click',async()=>{if(!nativePreview.outputStatus().export)return;const attempt=nativeOpenAttempt;try{const pending=nativePreview.discardStaged();renderNativeSession();await pending;if(attempt!==nativeOpenAttempt)return;nativeNotice='候補を破棄しました。原本不変。';}catch(e){if(attempt!==nativeOpenAttempt)return;nativeNotice=e.message;}renderNativeSession();renderAchievements();renderCollections();});
  renderNativeSession();
  el('achTab').addEventListener('click',()=>setTab('achievements'));el('colTab').addEventListener('click',()=>setTab('collections'));
  for(const name of ['achTab','colTab'])el(name).addEventListener('keydown',ev=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();const next=ev.key==='Home'?'achTab':ev.key==='End'?'colTab':name==='achTab'?'colTab':'achTab';setTab(next==='colTab'?'collections':'achievements');el(next).focus();}});
  el('saveInput').addEventListener('change',async e=>{await loadFile(e.target.files?.[0]);e.target.value='';});
  el('downloadOriginal').addEventListener('click',downloadOriginal);el('downloadEdited').addEventListener('click',downloadAccount);el('downloadZip').addEventListener('click',downloadEditedArchive);
  const onAchievementsFilter=()=>{state.achLimit=120;el('batchResult').replaceChildren();renderAchievements();};
  el('achievementSearch').addEventListener('input',onAchievementsFilter);el('achievementFilter').addEventListener('change',onAchievementsFilter);el('achievementSort').addEventListener('change',onAchievementsFilter);el('achievementImageFilter').addEventListener('change',onAchievementsFilter);
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
          closeNativePreviewSession();state.accountEditGeneration++;state.history.push(previous);if(state.history.length>30)state.history.shift();
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
