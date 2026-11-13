<script lang="ts">
  import WorkspaceNavigation from './WorkspaceNavigation.svelte';
  import type { WorkspaceNavigationPort, WorkspaceTab } from './navigation.ts';
  // Synthetic harness only: real product will supply its existing UI controller port.
  let activeTab:WorkspaceTab=$state('achievements');
  const port:WorkspaceNavigationPort={get activeTab(){return activeTab;},selectTab(next){activeTab=next;}};
</script>
<main class="site-shell">
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
