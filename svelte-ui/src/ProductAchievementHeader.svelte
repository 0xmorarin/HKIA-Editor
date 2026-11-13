<script lang="ts">
 import type {Header} from './product-achievement-header-bridge.mjs';
 let {header}:{header:Header}=$props();
</script>
<h4>{header.title}</h4>
{#if header.empty!==null}<p>{header.empty}</p>{:else}
 {#each header.lines as line (line.label)}<div class="detail-line"><b>{line.label}</b><span>{line.value}</span></div>{/each}
{/if}
