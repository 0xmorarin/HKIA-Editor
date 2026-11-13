<script lang="ts">
 import {achievementImagePresentation,type AchievementImage} from './achievement-list.ts';
 let {image}:{image:AchievementImage|null}=$props();
 const presentation=$derived(achievementImagePresentation(image));
 let failedSrc=$state<string|null>(null);
 const failed=$derived(presentation.src!==null&&failedSrc===presentation.src);
</script>
<span class="media-thumb media-achievement" data-image-status={failed?'LOAD_FAILED':presentation.status} data-image-kind="achievement" aria-label={presentation.src&&!failed?'実績画像':'実績画像：画像未確定'} title={presentation.src&&!failed?'実績画像':'実績画像：'+(failed?'LOAD_FAILED':presentation.status)}>
 {#if presentation.src&&!failed}<img src={presentation.src} alt="" width="40" height="40" loading="lazy" decoding="async" referrerpolicy="no-referrer" data-sprite-path-id={presentation.spritePathId} onerror={()=>failedSrc=presentation.src}/>{:else}<span class="media-null-mark" aria-hidden="true">—</span>{/if}
</span>
