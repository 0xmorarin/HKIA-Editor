<script lang="ts">
  import type { Snippet } from 'svelte';
  import { tabs, keyboardTarget, tabPresentation, requestTab, type WorkspaceNavigationPort, type WorkspaceTab } from './navigation.ts';
  let { port, achievements, collections }: {port:WorkspaceNavigationPort;achievements:Snippet;collections:Snippet} = $props();
  let tablist: HTMLDivElement;
  function keydown(event:KeyboardEvent,from:WorkspaceTab) {
    const next=keyboardTarget(from,event.key);
    if(next===null) return;
    event.preventDefault();
    requestTab(port,next);
    tablist?.querySelector<HTMLButtonElement>(next==='achievements'?'#achTab':'#colTab')?.focus();
  }
</script>
<section class="workspace" aria-label="実績とコレクション">
  <div bind:this={tablist} class="primary-tabs" role="tablist" aria-label="表示する機能">
    {#each tabs as tab (tab.value)}
      {@const presentation=tabPresentation(port.activeTab,tab.value)}
      <button id={tab.id} role="tab" aria-controls={tab.panel} aria-selected={presentation.selected} class={presentation.activeClass} tabindex={presentation.tabIndex} type="button" onclick={()=>requestTab(port,tab.value)} onkeydown={(event)=>keydown(event,tab.value)}>{tab.icon} <span>{tab.label}</span></button>
    {/each}
  </div>
  <section id="achPanel" class="content-panel" role="tabpanel" aria-labelledby="achTab" hidden={port.activeTab!=='achievements'}>{@render achievements()}</section>
  <section id="colPanel" class="content-panel" role="tabpanel" aria-labelledby="colTab" hidden={port.activeTab!=='collections'}>{@render collections()}</section>
</section>
