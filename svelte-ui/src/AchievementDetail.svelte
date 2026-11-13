<script lang="ts">
 import {detailPresentation,dependencyPresentation,EMPTY_DETAIL,MISSING_HINT,LINKAGE_HINT,type AchievementDetailPort} from './achievement-detail.ts';
 let {port}:{port:AchievementDetailPort}=$props();
 const snapshot=$derived(port.read());
</script>
<div id="editorPanel" aria-live="polite">
 {#if snapshot.record===null}
  <h4>達成記録の詳細</h4><p>{EMPTY_DETAIL}</p>
 {:else}
  {@const record=snapshot.record}
  <h4>{record.title}</h4>
  {#each detailPresentation(record) as line (line.label)}<div class="detail-line"><b>{line.label}</b><span>{line.value}</span></div>{/each}
  {#if record.kind==='slot-missing'}<p class="editor-hint">{MISSING_HINT}</p>{:else if record.kind==='slot'}<div class="detail-line"><b>Document ID</b><span>{record.documentId}</span></div>{/if}
  {#if snapshot.dependencies}
   {@const deps=snapshot.dependencies}
   <section class="dependency-inspector">
    <h5>03 LINKAGE 依存確認（表示のみ）</h5>
    {#each dependencyPresentation(deps) as line (line.label)}<div class="detail-line"><b>{line.label}</b><span>{line.value}</span></div>{#if line.label==='REQUIRED（条件付き候補）'}<p class="editor-hint">{deps.conditionalDescription}</p>{/if}{/each}
    {#each deps.related as value (value)}<p class="dependency-line">RELATED: {value}</p>{/each}
    {#each deps.unknown as value (value)}<p class="dependency-line">UNKNOWN: {value}</p>{/each}
    <p class="editor-hint">{LINKAGE_HINT}</p>
   </section>
  {/if}
 {/if}
</div>
