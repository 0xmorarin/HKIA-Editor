<script lang="ts">
 import ItemImage from './ItemImage.svelte';
 import {tick} from 'svelte';
 import {itemPresentation,listCaption,ITEM_PAGE,ITEM_VIEW_LIMIT,type DetailPort,type ItemFilter} from './collection-detail.ts';
 let {port}:{port:DetailPort}=$props();
 const snapshot=$derived(port.read());
 let panel:HTMLDivElement;
 async function choose(key:string){port.selectDefinition(key);await tick();if(port.read().definitionKey===key)panel?.querySelector<HTMLButtonElement>('.definition-button.active')?.focus();}
 async function inspect(id:number){port.inspect(id);await tick();if(port.read().selectedItem?.id===id)panel?.querySelector('.item-inspector')?.scrollIntoView({block:'nearest'});}
 function filter(change:Partial<ItemFilter>){port.filter({...port.read().filter,...change});}
</script>
<div id="collectionDetail" class="collection-detail" bind:this={panel} hidden={snapshot.categoryKey===null}>
 {#if snapshot.categoryKey!==null}
 <h4>{snapshot.title}</h4><p>{snapshot.categoryDescription}</p>
 <div class="definition-list">
 {#each snapshot.definitions as d (d.key)}
 <button type="button" class="definition-item definition-button" class:active={d.key===snapshot.definitionKey} data-definition-key={d.key} aria-pressed={d.key===snapshot.definitionKey} onclick={()=>choose(d.key)}><strong>{d.key}</strong><small>{d.guid}</small>{#if d.directImageNull}<ItemImage image={{status:"SOURCE_NULL"}} kind="collection"/><small class="media-caption">直接画像 SOURCE_NULL</small>{/if}{#if d.description!==null}<span class="record-count">{d.description}</span>{/if}</button>
 {/each}
 </div>
 {#if snapshot.definitionKey===null}<p class="editor-hint">{snapshot.hint}</p>
 {:else}
 <section class="collection-item-detail">
 <h5>{snapshot.definitionKey}</h5><p>{snapshot.detailDescription}</p>
 <div class="toolbar">
 <label class="search-wrap"><input type="search" placeholder="内部名・ID・GUID・Sprite PathID" aria-label="コレクションアイテムの検索" value={snapshot.filter.query} oninput={(e)=>filter({query:e.currentTarget.value})}/></label>
 <select aria-label="収集履歴の状態" value={snapshot.filter.history} disabled={!snapshot.matched} onchange={(e)=>filter({history:e.currentTarget.value as ItemFilter['history']})}><option value="all">すべて</option><option value="collected">収集履歴あり</option><option value="missing">収集履歴なし</option></select>
 <select aria-label="収集アイテムの並び順" value={snapshot.filter.sort} onchange={(e)=>filter({sort:e.currentTarget.value as ItemFilter['sort']})}><option value="source">定義順</option><option value="name">内部名順</option><option value="id">ID順</option></select>
 </div>
 <p class="collection-list-caption">{listCaption(snapshot.total,snapshot.limit)}</p>
 <div class="collection-items-list">
 {#each snapshot.rows as row (row.id)}
 {@const p=itemPresentation(row)}
 <div class="collection-item-row" data-item-id={row.id}><ItemImage image={row.image??null} kind="item"/><span class={p.markClass}>{p.mark}</span><span class="item-source-name">{p.name}</span><small class="item-source-id">ID {row.id}</small><small class="collection-status">{p.status}</small>{#if p.ticks}<small class="collection-history-ticks">{p.ticks}</small>{/if}<button type="button" class="btn-secondary item-inspect-button" onclick={()=>inspect(row.id)}>詳細・変更案</button>{#if p.parent}<small class="item-source-parent">{p.parent}</small>{/if}</div>
 {:else}<p class="placeholder">該当するアイテムはありません。</p>{/each}
 {#if snapshot.total>snapshot.limit}<button type="button" class="btn-secondary show-more" disabled={snapshot.limit+ITEM_PAGE>ITEM_VIEW_LIMIT} onclick={()=>port.more()}>さらに表示（残り {snapshot.total-snapshot.limit}件）</button>{/if}
 </div>
 <section class="item-inspector" aria-live="polite">
 {#if snapshot.selectedItem}
 {@const r=snapshot.selectedItem}
 <ItemImage image={r.image??null} kind="item"/><h5>{itemPresentation(r).name}</h5><div class="detail-line"><b>ItemId</b>{r.id}</div><div class="detail-line"><b>定義GUID</b>{r.guid}</div><div class="detail-line"><b>履歴の有無</b>{r.history.kind==='unknown'?'未照合':r.history.recorded?'記録あり':'記録なし'}</div>
 {#if r.history.kind==='known'}<div class="detail-line"><b>保存日時 raw ticks（100ns / int64）</b>{r.history.recorded?r.history.rawTicks??'UNKNOWN（未露出）':'履歴なし'}</div><div class="detail-line"><b>暦表示（タイムゾーン未確認）</b>{r.history.calendar??'UNKNOWN'}</div><div class="detail-line"><b>UTC / DateTime.Kind / 時差</b>UNKNOWN / UNKNOWN / UNKNOWN</div>{/if}
 <p class="editor-hint">{r.history.kind==='unknown'?'保存履歴は未照合です。読み込むまで編集案は作成できません。':'独立UI検証用：変更案・保存処理は無効です。'}</p>
 {/if}
 </section>
 </section>
 {/if}
 {/if}
</div>
