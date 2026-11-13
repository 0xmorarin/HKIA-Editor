<script lang="ts">
 import {counterLines,rewardLines,groupLines,childValue,type FactsSnapshot} from './achievement-facts.ts';
 let {port}:{port:{read():FactsSnapshot}}=$props();
 const snapshot=$derived(port.read());
</script>
{#if snapshot.facts}
 {@const facts=snapshot.facts}
 <section class="linked-counter-panel" id="achievementFacts" aria-label="収集・達成グループとの対応（読み取りのみ）">
  <h5>収集・達成グループとの対応（読み取りのみ）</h5>
  {#if facts.definition}
   {@const d=facts.definition}
   <h5>個別実績の定義と連動する保存値（読み取りのみ）</h5>
   <div class="detail-line"><b>内部定義名</b><span>{d.key}</span></div>
   {#each counterLines(d) as line (line.label)}<div class="detail-line"><b>{line.label}</b><span>{line.value}</span></div>{/each}
   {#if d.builtInReferences!==null}<p class="editor-hint">このグループ種別は参照実績の件数を組み込み完了値として計算します。シリアライズ条件値だけで達成判定しません。</p>{/if}
   {#each rewardLines(d.reward) as line (line.label)}<div class="detail-line"><b>{line.label}</b><span>{line.value}</span></div>{/each}
   {#if d.groupCondition}<p class="editor-hint">02 Group条件：全子実績の明示選択・子の保存済み状態照合・それぞれの達成日時・親Counter・Account Meta rootの整合性が必要です。Group CurrentValue単独編集は禁止。一般Group REQUIRED連動はUNKNOWNです。</p>{/if}
   {#if d.conditionMembers}
    {@const m=d.conditionMembers}
    <section class="linked-counter-panel" aria-label="構成する実績（保存済み状態の照合）">
     <h5>構成する実績 {m.children.length}/{m.total}件（保存済み状態の照合）</h5>
     {#each m.children as child (child.guid)}<div class="detail-line"><b>{child.title}</b><span>{childValue(child)}</span></div>{/each}
    </section>
   {/if}
   {#if d.dlcCondition}<p class="editor-hint">この定義にはDLC条件があります。所有権や表示条件は独立して検証が必要です。</p>{/if}
  {:else}<p class="editor-hint">個別実績の定義は未確認です。</p>{/if}
  {#if facts.group}
   {@const g=facts.group}
   {#each groupLines(g) as line (line.label)}<div class="detail-line"><b>{line.label}</b><span>{line.value}</span></div>{/each}
   <p class="editor-hint">定義内グループ名は個別実績の正式名称ではありません。カウンターは未保存でも正常な場合があります。</p>

  {:else}<p class="editor-hint">このGUIDの定義参照は未確認です。</p>{/if}
 </section>
{/if}
