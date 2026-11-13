<script lang="ts">
  import {tabs,keyboardTarget,tabPresentation,requestTab,type WorkspaceNavigationPort,type WorkspaceTab} from './navigation.ts';
  let {initialTab,port}:{initialTab:WorkspaceTab;port:WorkspaceNavigationPort}=$props();
  // Initial attributes only. The legacy setTab owns subsequent DOM state; no second state or effect.
  function keydown(event:KeyboardEvent,from:WorkspaceTab){
    const next=keyboardTarget(from,event.key);
    if(next===null)return;
    event.preventDefault();
    const host=(event.currentTarget as HTMLButtonElement).parentElement;
    requestTab(port,next);
    host?.querySelector<HTMLButtonElement>(next==='achievements'?'#achTab':'#colTab')?.focus();
  }
</script>
{#each tabs as tab (tab.value)}
  {@const presentation=tabPresentation(initialTab,tab.value)}
  <button id={tab.id} role="tab" aria-controls={tab.panel} aria-selected={presentation.selected} class={presentation.activeClass} tabindex={presentation.tabIndex} type="button" onclick={()=>requestTab(port,tab.value)} onkeydown={(event)=>keydown(event,tab.value)}>{tab.icon} <span>{tab.label}</span></button>
{/each}
