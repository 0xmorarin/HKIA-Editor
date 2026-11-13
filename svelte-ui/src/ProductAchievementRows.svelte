<script lang="ts">
 import AchievementImage from './AchievementImage.svelte';
 import {rowPresentation,emptyLabel,type AchievementSnapshot,type AchievementPort} from './achievement-list.ts';
 let {snapshot,port}:{snapshot:AchievementSnapshot;port:AchievementPort}=$props();
</script>
{#if snapshot.rows.length===0}<p class="placeholder">{emptyLabel(snapshot)}</p>{/if}
{#each snapshot.rows as r (r.guid)}
 {@const p=rowPresentation(r)}
 <button type="button" class="achievement-row" class:selected={r.guid===snapshot.selectedGuid} class:missing-record={p.missing} class:unknown-identity={p.unknown} data-achievement-guid={r.guid} aria-label={p.aria} onclick={()=>port.select(r.guid)}>
  {#if r.imageEnabled}<AchievementImage image={r.image??null}/>{:else}<div class="ach-symbol" class:done={p.done}>{p.done?'✓':'☆'}</div>{/if}
  <div class="ach-text"><strong>{r.title}</strong><small>{p.subtitle}</small>{#if p.unknown}<small class="unknown-tag">名称未照合・保存済みレコード</small>{/if}{#if r.kind==='account'&&r.externalUnknown}<small class="media-caption">外部画像 UNKNOWN</small>{/if}</div>
  <span class="status-dot" class:complete={p.done}>{p.status}</span>
 </button>
{/each}
{#if snapshot.total>snapshot.limit}<button type="button" class="btn-secondary show-more" onclick={()=>port.more()}>さらに表示（残り {snapshot.total-snapshot.limit}件）</button>{/if}
