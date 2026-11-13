<script lang="ts">
  import {filterControls,achievementSelects,collectionSelects,type FilterControlId,type FilterPort} from './filter-controls.ts';
  let {port,domain}: {port:FilterPort;domain:'achievements'|'collections'}=$props();
  const view=$derived(port.read());
  function change(id:FilterControlId,event:Event){
    const target=event.currentTarget as HTMLInputElement|HTMLSelectElement;
    port.change(id,target.value);
  }
</script>
{#snippet search(id:'achievementSearch'|'collectionSearch')}
  <label class={id==='collectionSearch'?'search-wrap collections-search':'search-wrap'}><span aria-hidden="true">⌕</span><input {id} type="search" placeholder={filterControls[id].placeholder} autocomplete="off" aria-label={filterControls[id].label} value={view[id]} oninput={(e)=>change(id,e)}></label>
{/snippet}
{#snippet selectControl(id:(typeof achievementSelects)[number]|(typeof collectionSelects)[number])}
  <select {id} aria-label={filterControls[id].label} hidden={id==='achievementImageFilter'&&!view.imageVisible} value={view[id]} onchange={(e)=>change(id,e)}>
    {#each filterControls[id].options as [value,label] (value)}<option {value}>{label}</option>{/each}
  </select>
{/snippet}
{#if domain==='achievements'}
  <div class="toolbar">{@render search('achievementSearch')}{#each achievementSelects as id (id)}{@render selectControl(id)}{/each}</div>
{:else}
  {@render search('collectionSearch')}
  <div class="toolbar">{#each collectionSelects as id (id)}{@render selectControl(id)}{/each}</div>
{/if}
