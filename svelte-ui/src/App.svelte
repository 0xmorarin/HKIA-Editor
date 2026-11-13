<script lang="ts">
  import WorkspaceNavigation from './WorkspaceNavigation.svelte';
  import { createLegacyNavigationPort } from './legacy-navigation-port.ts';
  import { createLegacyNavigationFixture } from './legacy-navigation-fixture.ts';
  // Detached legacy DOM fixture is the only selection authority. Revision invalidates the view,
  // not a second selection/session. Actual product binding remains a later integration task.
  const fixture=createLegacyNavigationFixture();
  let revision=$state(0);
  const port=createLegacyNavigationPort({read(){void revision;return fixture.read();},setTab:fixture.setTab,invalidate(){revision++;}});
  const collectionRenders=$derived.by(()=>{void revision;return fixture.collectionRenders();});
</script>
<main class="site-shell" data-legacy-renders={collectionRenders}>
  <p>独立UI検証用 / セーブ入力・編集・出力なし</p>
  {#snippet achievements()}
    <div class="panel-header"><div><h3>アチーブメント</h3><p>ファイルを読み込むと達成記録が表示されます。</p></div><span class="count-pill">0件</span></div>
    <p class="placeholder">ファイル未読み込み。右上ではなく、上のファイル選択から読み込んでください。</p>
  {/snippet}
  {#snippet collections()}
    <div class="panel-header"><div><h3>コレクション</h3><p>ゲーム定義のアイテムIDと収集履歴を直接照合します。ゲーム内の達成率とは異なります。</p></div><span class="count-pill">25カテゴリ</span></div>
  {/snippet}
  <WorkspaceNavigation {port} {achievements} {collections}/>
</main>
