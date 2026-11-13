<script lang="ts">
 import {itemImagePresentation} from './collection-detail.ts';
 import type {AchievementImage} from './achievement-list.ts';
 let {image,kind}:{image:AchievementImage|null;kind:'item'|'collection'}=$props();
 const presentation=$derived(itemImagePresentation(image));
 const label=$derived(kind==='item'?'アイテム画像':'コレクション定義の直接画像');
 let failedSrc=$state<string|null>(null);
 const failed=$derived(presentation.src!==null&&failedSrc===presentation.src);
</script>
<span class="media-thumb" data-image-kind={kind} data-image-status={failed?'LOAD_FAILED':presentation.status} aria-label={presentation.src&&!failed?label:label+'：画像未確定'} title={presentation.src&&!failed?label:label+'：'+(failed?'LOAD_FAILED':presentation.status)}>
 {#if presentation.src&&!failed}<img src={presentation.src} alt="" width="40" height="40" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-sprite-path-id={presentation.spritePathId} onerror={()=>failedSrc=presentation.src}/>{:else}<span class="media-null-mark" aria-hidden="true">—</span>{/if}
</span>
