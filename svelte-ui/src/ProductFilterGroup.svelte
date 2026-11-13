<script lang="ts">
 import {filterControls,achievementSelects,collectionSelects,type FilterSnapshot} from './filter-controls.ts';
 import type {FilterGroup,FilterIntent} from './product-filter-bridge.ts';
 let {group,initial,intent}:{group:FilterGroup;initial:FilterSnapshot;intent:FilterIntent}=$props();
 // Initial attributes only. Existing controller owns subsequent DOM values and visibility.
</script>
{#snippet search(id:'achievementSearch'|'collectionSearch')}
 <span aria-hidden="true">⌕</span><input {id} type="search" placeholder={filterControls[id].placeholder} autocomplete="off" aria-label={filterControls[id].label} value={initial[id]} oninput={e=>intent(id,e)}/>
{/snippet}
{#snippet selectControl(id:(typeof achievementSelects)[number]|(typeof collectionSelects)[number])}
 <select {id} aria-label={filterControls[id].label} hidden={id==='achievementImageFilter'&&!initial.imageVisible} value={initial[id]} onchange={e=>intent(id,e)}>{#each filterControls[id].options as [value,label] (value)}<option {value}>{label}</option>{/each}</select>
{/snippet}
{#if group===0}<label class="search-wrap">{@render search('achievementSearch')}</label>{#each achievementSelects as id (id)}{@render selectControl(id)}{/each}
{:else if group===1}{@render search('collectionSearch')}
{:else}{#each collectionSelects as id (id)}{@render selectControl(id)}{/each}{/if}
