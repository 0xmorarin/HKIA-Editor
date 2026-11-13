<script lang="ts">
 import {tick} from 'svelte';
 import AchievementImage from './AchievementImage.svelte';
 import {emptyLabel,rowPresentation,MAX_VISIBLE,PAGE_SIZE,type AchievementPort} from './achievement-list.ts';
 let {port}:{port:AchievementPort}=$props();
 let list:HTMLDivElement;
 const snapshot=$derived(port.read());
 async function choose(guid:string){port.select(guid);await tick();if(port.read().selectedGuid!==guid)return;const selected=list?.querySelector<HTMLButtonElement>('.achievement-row.selected');if(selected?.dataset.achievementGuid===guid)selected.focus();}
</script>
<div id="achievementsList" bind:this={list}>
 {#if snapshot.rows.length===0}<p class="placeholder">{emptyLabel(snapshot)}</p>{/if}
 {#each snapshot.rows as r (r.guid)}
  {@const p=rowPresentation(r)}
  <button type="button" class="achievement-row" class:selected={r.guid===snapshot.selectedGuid} class:missing-record={p.missing} class:unknown-identity={p.unknown} data-achievement-guid={r.guid} aria-label={p.aria} onclick={()=>choose(r.guid)}>
   {#if r.imageEnabled}<AchievementImage image={r.image??null}/>{:else}<span class="ach-symbol" class:done={p.done} aria-hidden="true">{p.done?'✓':'☆'}</span>{/if}
   <span class="ach-text"><strong>{r.title}</strong><small>{p.subtitle}</small>{#if p.unknown}<small class="unknown-tag">名称未照合・保存済みレコード</small>{/if}{#if r.kind==='account'&&r.externalUnknown}<small class="media-caption">外部画像 UNKNOWN</small>{/if}</span>
   <span class="status-dot" class:complete={p.done}>{p.status}</span>
  </button>
 {/each}
 {#if snapshot.total>snapshot.limit}<button type="button" class="btn-secondary show-more" onclick={()=>port.more()} disabled={snapshot.limit+PAGE_SIZE>MAX_VISIBLE}>{snapshot.limit+PAGE_SIZE>MAX_VISIBLE?'検証用表示上限に到達':`さらに表示（残り ${snapshot.total-snapshot.limit}件）`}</button>{/if}
</div>
