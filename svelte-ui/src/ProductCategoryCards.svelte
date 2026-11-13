<script lang="ts">
 import CategoryImage from './CategoryImage.svelte';
 import type {CategoryPort,CategorySnapshot} from './category-grid.ts';
 let {snapshot,port}:{snapshot:CategorySnapshot;port:CategoryPort}=$props();
</script>
{#if snapshot.rows.length===0}<p class="placeholder">該当するカテゴリがありません。</p>{/if}
{#each snapshot.rows as row (row.key)}
 <button type="button" class="collection-card" class:selected={snapshot.selectedKey===row.key} data-category-key={row.key} onclick={()=>port.select(row.key)}>
  <CategoryImage image={row.image}/><span class="collection-title">{row.title}</span><small class="collection-meta">{row.description}</small>
 </button>
{/each}
