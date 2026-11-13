<script lang="ts">
 import {tick} from 'svelte';
 import CategoryImage from './CategoryImage.svelte';
 import type {CategoryPort} from './category-grid.ts';
 let {port,afterSelect}:{port:CategoryPort;afterSelect:()=>void}=$props();
 let grid:HTMLDivElement;
 const snapshot=$derived(port.read());
 async function choose(key:string){
  port.select(key);await tick();
  // Never restore focus to a removed or superseded selection.
  if(port.read().selectedKey!==key)return;
  const current=grid?.querySelector<HTMLButtonElement>('.collection-card.selected');
  if(current?.dataset.categoryKey!==key)return;
  current.focus();afterSelect();
 }
</script>
<div id="collectionGrid" class="collection-grid" bind:this={grid}>
 {#if snapshot.rows.length===0}<p class="placeholder">該当するカテゴリがありません。</p>{/if}
 {#each snapshot.rows as row (row.key)}
 <button type="button" class="collection-card" class:selected={snapshot.selectedKey===row.key} data-category-key={row.key} onclick={()=>choose(row.key)}>
  {#key row.image}<CategoryImage image={row.image}/>{/key}
  <span class="collection-title">{row.title}</span><small class="collection-meta">{row.description}</small>
 </button>
 {/each}
</div>
