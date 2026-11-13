<script lang="ts">
  import AchievementList from './AchievementList.svelte';
  import {createAchievementPort} from './achievement-list.ts';
  import {createLegacyAchievementFixture} from './legacy-achievement-fixture.ts';
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
  const filterPort=createLegacyFilterPort({read(){void filterRevision;return filterFixture.read();},writeAndDispatch(id,value,event){filterFixture.writeAndDispatch(id,value,event);if(id.startsWith('achievement')){achievementFixture.resetPaging();achievementRevision++;}},invalidate(){filterRevision++;}});
  const achievementFixture=createLegacyAchievementFixture(()=>filterPort.read());
  let achievementRevision=$state(0);
  const achievementPort=createAchievementPort({read(){void achievementRevision;return achievementFixture.read();},selectGuid:achievementFixture.selectGuid,showMore:achievementFixture.showMore,invalidate(){achievementRevision++;}});
  const achievementMetrics=$derived.by(()=>{void achievementRevision;return achievementFixture.metrics();});
  const filterMetrics=$derived.by(()=>{void filterRevision;return filterFixture.metrics();});
  const categoryFixture=createLegacyCategoryFixture(()=>filterPort.read());
  let categoryRevision=$state(0);
  const categoryPort=createCategoryPort({read(){void categoryRevision;return categoryFixture.read();},selectCategory:categoryFixture.selectCategory,invalidate(){categoryRevision++;}});
  const categoryMetrics=$derived.by(()=>{void categoryRevision;return categoryFixture.metrics();});
  const collectionRenders=$derived.by(()=>{void revision;return fixture.collectionRenders();});
</script>
<main class="site-shell" data-legacy-renders={collectionRenders} data-ach-filter-renders={filterMetrics.achievementRenders} data-col-filter-renders={filterMetrics.collectionRenders} data-batch-clears={filterMetrics.batchClears} data-ach-limit={filterMetrics.achLimit} data-category-renders={categoryMetrics.renders} data-ach-selects={achievementMetrics.selects} data-ach-more={achievementMetrics.moreCount}>
  <p>独立UI検証用 / セーブ入力・編集・出力なし</p>
  {#snippet achievements()}
    <div class="panel-header"><div><h3>アチーブメント</h3><p>合成データによる実績一覧の表示検証です。</p></div><span class="count-pill">{achievementPort.read().total}件</span></div>
    <FilterToolbar port={filterPort} domain="achievements"/>
    <AchievementList port={achievementPort}/>
    <div id="editorPanel" aria-live="polite"><p>検証用選択：{achievementMetrics.selectedGuid??'未選択'}</p></div>
  {/snippet}
  {#snippet collections()}
    <div class="panel-header"><div><h3>コレクション</h3><p>ゲーム定義のアイテムIDと収集履歴を直接照合します。ゲーム内の達成率とは異なります。</p></div><span class="count-pill">{categoryPort.read().totalCategories}カテゴリ</span></div>
    <FilterToolbar port={filterPort} domain="collections"/>
    <CollectionCategoryGrid port={categoryPort} afterSelect={()=>document.getElementById('collectionDetail')?.scrollIntoView({block:'nearest',behavior:'smooth'})}/>
    <div id="collectionDetail" class="collection-detail" hidden={categoryMetrics.selectedKey===null}><h4>検証用カテゴリ詳細</h4><p>{categoryMetrics.selectedKey}</p></div>
  {/snippet}
  <WorkspaceNavigation {port} {achievements} {collections}/>
</main>
