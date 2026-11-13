<script lang="ts">
 import {itemPresentation} from './collection-detail.ts';
 import ProductItemImage from './ProductCollectionItemImage.svelte';
 import type {ProductItems} from './product-collection-items-bridge.mjs';
 let {snapshot,dispatch}:{snapshot:ProductItems;dispatch:(id:number|null)=>void}=$props();
</script>
{#each snapshot.rows as row (row.id)}
 {@const p=itemPresentation(row)}
 <div class="collection-item-row" data-item-id={row.id}>
  {#if row.imageEnabled}<ProductItemImage image={row.image??null}/>{/if}
  <span class={p.markClass}>{p.mark}</span><span class="item-source-name">{p.name}</span><small class="item-source-id">ID {row.id}</small><small class="collection-status">{p.status}</small>
  {#if row.history.kind==='known'&&row.history.showTicks&&p.ticks}<small class="collection-history-ticks">{p.ticks}</small>{/if}
  <button type="button" class="btn-secondary item-inspect-button" onclick={()=>dispatch(row.id)}>詳細・変更案</button>
  {#if p.parent}<small class="item-source-parent">{p.parent}</small>{/if}
 </div>
{:else}<p class="placeholder">該当するアイテムはありません。</p>{/each}
{#if snapshot.total>snapshot.limit}<button type="button" class="btn-secondary show-more" onclick={()=>dispatch(null)}>さらに表示（残り {snapshot.total-snapshot.limit}件）</button>{/if}
