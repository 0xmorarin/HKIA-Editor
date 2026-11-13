<script lang="ts">
  import CollectionCategoryGrid from './CollectionCategoryGrid.svelte';
  import {createCategoryPort} from './category-grid.ts';
  import {createLegacyCategoryFixture} from './legacy-category-fixture.ts';
  import FilterToolbar from './FilterToolbar.svelte';
  import {createLegacyFilterPort} from './filter-controls.ts';
  import {createLegacyFilterFixture} from './legacy-filter-fixture.ts';
  import WorkspaceNavigation from './WorkspaceNavigation.svelte';
  import { createLegacyNavigationPort } from './legacy-navigation-port.ts';
  import { createLegacyNavigationFixture } from './legacy-navigation-fixture.ts';
  // Detached legacy DOM fixture is the only selection authority. Revision invalidates the view,
  // not a second selection/session. Actual product binding remains a later integration task.
  const fixture=createLegacyNavigationFixture();
  let revision=$state(0);
  const port=createLegacyNavigationPort({read(){void revision;return fixture.read();},setTab:fixture.setTab,invalidate(){revision++;}});
  const filterFixture=createLegacyFilterFixture();
  let filterRevision=$state(0);
  const filterPort=createLegacyFilterPort({read(){void filterRevision;return filterFixture.read();},writeAndDispatch:filterFixture.writeAndDispatch,invalidate(){filterRevision++;}});
  const filterMetrics=$derived.by(()=>{void filterRevision;return filterFixture.metrics();});
  const categoryFixture=createLegacyCategoryFixture(()=>filterPort.read());
  let categoryRevision=$state(0);
  const categoryPort=createCategoryPort({read(){void categoryRevision;return categoryFixture.read();},selectCategory:categoryFixture.selectCategory,invalidate(){categoryRevision++;}});
  const categoryMetrics=$derived.by(()=>{void categoryRevision;return categoryFixture.metrics();});
  const collectionRenders=$derived.by(()=>{void revision;return fixture.collectionRenders();});
</script>
<main class="site-shell" data-legacy-renders={collectionRenders} data-ach-filter-renders={filterMetrics.achievementRenders} data-col-filter-renders={filterMetrics.collectionRenders} data-batch-clears={filterMetrics.batchClears} data-ach-limit={filterMetrics.achLimit} data-category-renders={categoryMetrics.renders}>
  <p>独立UI検証用 / セーブ入力・編集・出力なし</p>
  {#snippet achievements()}
    <div class="panel-header"><div><h3>アチーブメント</h3><p>ファイルを読み込むと達成記録が表示されます。</p></div><span class="count-pill">0件</span></div>
    <FilterToolbar port={filterPort} domain="achievements"/>
    <p class="placeholder">ファイル未読み込み。右上ではなく、上のファイル選択から読み込んでください。</p>
  {/snippet}
  {#snippet collections()}
    <div class="panel-header"><div><h3>コレクション</h3><p>ゲーム定義のアイテムIDと収集履歴を直接照合します。ゲーム内の達成率とは異なります。</p></div><span class="count-pill">{categoryPort.read().totalCategories}カテゴリ</span></div>
    <FilterToolbar port={filterPort} domain="collections"/>
    <CollectionCategoryGrid port={categoryPort} afterSelect={()=>document.getElementById('collectionDetail')?.scrollIntoView({block:'nearest',behavior:'smooth'})}/>
    <div id="collectionDetail" class="collection-detail" hidden={categoryMetrics.selectedKey===null}><h4>検証用カテゴリ詳細</h4><p>{categoryMetrics.selectedKey}</p></div>
  {/snippet}
  <WorkspaceNavigation {port} {achievements} {collections}/>
</main>
