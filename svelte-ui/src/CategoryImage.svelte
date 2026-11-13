<script lang="ts">
 import {categoryImagePresentation,type CategoryImage} from './category-grid.ts';
 let {image}:{image:CategoryImage}=$props();
 const presentation=$derived(categoryImagePresentation(image));
 let failedSrc=$state<string|null>(null);
 const failed=$derived(presentation.src!==null&&failedSrc===presentation.src);
</script>
{#if presentation.mapped}
 <span class="media-thumb media-category" data-image-status={failed?'LOAD_FAILED':presentation.status} data-image-kind="category" aria-label={presentation.label} title={presentation.src?'カテゴリ画像':'カテゴリ画像：'+presentation.status}>
 {#if presentation.src&&!failed}<img src={presentation.src} alt="" width="92" height="92" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-sprite-path-id={presentation.spritePathId} onerror={()=>failedSrc=presentation.src}/>{:else}<span class="media-null-mark" aria-hidden="true">—</span>{/if}
 </span>
{:else if presentation.src&&!failed}
 <img class="collection-icon" src={presentation.src} alt="" loading="lazy" width="92" height="92" onerror={()=>failedSrc=presentation.src}/>
{:else}<span class="collection-icon-fallback">画像 UNKNOWN</span>{/if}
