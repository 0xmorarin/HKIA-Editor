<script lang="ts">
 import {itemImagePresentation} from './collection-detail.ts';
 import type {AchievementImage} from './achievement-list.ts';
 let {image}:{image:AchievementImage|null}=$props();
 const presentation=$derived(itemImagePresentation(image));
 let failedSrc=$state<string|null>(null);
 const failed=$derived(presentation.src!==null&&failedSrc===presentation.src);
</script>
<span class="media-thumb media-item" data-image-status={failed?'LOAD_FAILED':presentation.status} data-image-kind="item" aria-label={presentation.src?'アイテム画像':'アイテム画像：画像未確定'} title={presentation.src?'アイテム画像':'アイテム画像：'+presentation.status}>
 {#if presentation.src&&!failed}<img src={presentation.src} alt="" width="40" height="40" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-sprite-path-id={presentation.spritePathId} onerror={()=>failedSrc=presentation.src}/>{:else}<span class="media-null-mark" aria-hidden="true">—</span>{/if}
</span>
