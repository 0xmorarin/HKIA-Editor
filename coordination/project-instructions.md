# HKIA_EDITOR
PROJECT=HKIA Editor; REPO=0xmorarin/HKIA-Editor; TARGET=Hello Kitty Island Adventure; FUTURE=夢綺羅星/Yumekiraboshi; HOST=GitHub Pages; OWNER=User。
MODE=AUTONOMOUS_CONTINUOUS_EXECUTION/DIRECT_HANDOFF/RISK_BASED_QA。
PRIORITY=DataIntegrity>Correctness>VerifiedProgress>DependencyUnblocking>Parallelism>Speed>TokenCost。
SSOT=GitHub main実HEAD/Blob、coordination/current.json、config/release-gates.json、coordination/architecture-decision-20261113.md、architecture-decision-20261112.md、localization-decision-20261113.md、qa-operation-decision-20261113.md（coordination/）。最新Owner決定優先。詳細仕様/契約/Gateは正本/ADR必読。PRIVATE=既存Drive開発フォルダ＋Library /HKIA Editor Private/。固定Source/SHA/Manifest/Delta/CI/真正Save/Native/QAが証拠。会話補助、同期仮定禁止。
GOAL=JS機能付きBeta最短公開＋Svelte/TS/Rust/WASM正式版＋夢綺羅星共通基盤。既決再質問/再選定/全面再構築/重複研究禁止。

## EXECUTION
START_NOW/CONTINUE/続けて/引継:最新Owner/main/保護/PR/台帳取得→担当Task/固定Source/既受入/未完/未記録成果/依存/競合再構成→SHA/Blob/Scope照合→最高優先READY実行→自己QA→保存→直接HANDOFF。DONE/READY/IN_FLIGHT/WAIT_DEP/WAIT_ENV/TRUE_RED/UNKNOWN区別。
Owner入力=Stream ID＋起動/継続のみ。詳細指示待ち禁止。1会話最大安全作業量、独立READY全並列、過剰分割/無変更再試行/形式終了禁止。失敗=再現→原因→最小修正→回帰。依存未達/TRUE_RED該当Scopeのみ隔離。他READY継続。Beta P0＋Rust/Svelte/Localization P0_FORMAL独立並列。正式版GateでJS Beta停止禁止。v0.2.11以降成果再利用。実Taskなし=DONE、完了済無条件再起動禁止。WAIT解除条件/担当記録。会話上限時同一ID引継。非同期/別会話自動起動/将来納品主張禁止。

## STREAMS
00 CTRL=統括/依存/競合/共有API/直列統合/Build/Pages/公開/移行。
01 COLLECTION=収集/履歴/日時/実取得/Inventory/親子/取消。
02 ACHIEVEMENT=Account/InGame/Counter/GUID/達成取消/進捗/日時。
03 LINKAGE=保存因果/必須連動/Load/Group/Meta/Quest/Unlock/Reward。
04 SAVE CORE=JS Codec/Schema/Transaction/Writer/API/Native Load、Beta維持/参照。
05 WEB=JS Beta UI/Svelte/TS/Adapter/画像/言語設定。
07 RUST CORE=Rust/WASM/Reader/Index/Session/Writer/Worker/ABI/性能。
08 LOCALIZATION=全ゲーム言語/原文抽出/ID-Key/Registry/Editor翻訳。
00 MEDIA=画像抽出/ID対応/VP8L/fallback/不足画像。
06A QA-DATA-CORE=独立新規契約/Native因果/JS-Rust安全性/真正Parity/Session/Writer/ABI/負荷。
06B QA-WEB-LOCALE=独立重要UI/Adapter/状態/Browser/a11y/言語原文/mapping/翻訳/locale。
06C QA-RELEASE=独立統合影響/Artifact/Privacy/Pages/真正E2E/rollback/cutover。
旧06 QA=履歴専用、新規起動禁止。移行時既IN_FLIGHTのみ完遂or残Scope明示移管。
所有:正本/ADR担当Path厳守。04既存JS Core/native-product/Engine、05 UI/Adapter、07 crates/hkia-save-core/**,rust-worker/**,contracts/rust/**,tests/rust/**、08 localization/**,contracts/localization/**,tests/localization/**、01/02/03担当解析/言語非依存契約、00共通設定/配布。QA証拠/Testsのみ製品Source変更禁止。担当外/共通変更は00調整。04 Rust=00 disjoint割当後。新Stream=独立責務/並列利益ある場合のみ00設定。

## QA
全開発Stream自己QA必須:固定Scope、Unit/Integration/否定/回帰、必要Native/真正Save/Browser実測、SHA/Manifest/Delta/ログ/未検証。未テスト丸投げ禁止。開始時リスク分類。
LOW=既受入契約内表示/文言/非挙動/既受入pipeline決定的追加等、保存/安全/ABI/Privacy/新仕様/公開影響なし。自己QA＋必要CI→直接下流。SELF_PASS≠INDEPENDENT_PASS。
HIGH=新規/変更編集契約/保存意味/Native因果/Load/Migration/Auth/Codec/Parser/精度/未知値/Writer/Session/CAS/ABI/Worker/真正Parity/新規抽出・言語ID/重要UI状態・Adapter・locale挙動/Privacy/Security/Release-critical。独立変更Scope/影響経路/反例/別oracle/必要真正実測必須。不明リスク=HIGH。未証明操作fail-closed。
RELEASE=統合Artifact/実配布/有効化/cutover/真正E2E/rollback。06C独立受入＋既存Owner Gate。自己QAで新Writer権限/公開承認禁止。
ROUTE:01/02/03/04/07→自己QA→HIGHなら06A→消費側。05/08/MEDIA→自己QA→HIGHなら06B→消費側。LOW直接。00→06C統合/公開のみ。全QA完了待ち/06C経由禁止。06A Research/JS/Rust、06B Web/Localeのdisjoint固定SHA/Scope臨時並列claim可。既受入全面再QA禁止。
PASS=実行観測済みSTATIC/UNIT/INTEGRATION/BROWSER/REAL_SAVE/REAL_DEVICEのみ。別会話≠独立。別解析器/独立入力/Native証拠/反例/実Browser。既受入Blob一致証拠再利用、旧PASS新HEAD自動適用禁止。TRUE_RED=再現違反、入力/期待/実結果/原因/影響/最小修正/回帰。静的→真正offline→独立反例→実Browser→代替不能実機。game未観測=UNVERIFIED、offline PASS≠game PASS≠online安全。

## COORDINATION
正本=current.jsonのみ。開始前最新Blob→Task/Base/Scope/IN_FLIGHT/依存/所有権記録、二重claim禁止。終了時status/固定SHA/Manifest/Delta/実測/受入/残条件/NEXT更新。最新Blob CAS、競合再取得し担当のみ再適用、他Stream上書き禁止。
HANDOFF=受取側/Task/固定Source/Scope/依存/受入条件/証拠所在/未解決。実在/読戻し確認、Tool失敗≠成功。上流→必要QA→下流直接。00戻り=統合/共有API競合/複数依存判断/公開/Owner権限のみ。
報告=STREAM/TASK/BASE_HEAD/SOURCE_HEAD_OR_SHA/STATUS=DONE|PARTIAL|BLOCKED|READY_AFTER_DEP/CHANGES/VERIFIED/UNVERIFIED/RISKS/DEPENDENCIES/NEXT_READY_PARALLEL/NEXT_AFTER_DEP/HANDOFF。NEXT_READY_PARALLEL=実Taskのみ、投入順/並列可否/起動文。NEXT_AFTER_DEP=解除条件/Stream。起動=HKIA Editor【STREAM】START_NOW、継続=CONTINUE、引継=会話引継ぎ。最新SSOTから自律実行再開。00追加=CRITICAL_PATH/SERIAL_MERGE_ORDER/TRUE_BLOCKERS/OWNER_APPROVAL_REQUIRED。

## PRODUCT/ARCH
JS Beta=V24固定、Switch3.0.0/3.0.1真正Save両Domain代表実編集/別名出力/必須連動/再読込、読取専用不可、V30 OFF≠Beta。正式版=Svelte+TypeScript/Rust/WASM/Module Worker/Single ProductSession/Vite/GitHub Pages必須。JS全正式機能完成待ち禁止、Rust/Svelte独立並列、既存JS参照。正式編集=Achievements達成/取消/進捗/日時、Collections履歴/日時/実取得/取消、個別一括、必須連動、真正出力/永続性。原本SHA事前登録恒久要件禁止。
Rust=Envelope/LZ4→Reader/Index→真正Parity→Session/ABI→Writer→実WASM Worker/Chrome/負荷。DEVELOPMENT_SWITCH=ADRの両version/両Domain真正原子的編集・独立Reparse・実WASM Worker・否定rollback独立受入→00記録→新機能原則Rust。PRODUCTION_CUTOVER=全契約同等以上/Svelte Rust Adapter/実Browser/予算/ゲーム証拠/固定Artifact/独立QA/Owner承認。単一Writer、正式JS fallback/恒久二重Writer禁止。開発主軸≠本番切替。
Svelte=既存UI固定→独立Component→JS Adapter→同等性→独立統合→受入Rust Adapter。差分分離、機能/画像/デザイン保持。各候補テスト済Source/UI/Writer/配布一致、JS PASS自動継承禁止。
COMMUNITY独立Webサービス、Save不要作品制作/共有可。RAW_SAVE_UPLOAD=FORBIDDEN/LOCAL_ONLY、SHARED_CREATION_DATA≠RAW_SAVE。WAND_REFERENCE=DreamwishWand/web latest main read-only、汎用基盤のみ再利用、DDV固有実装移植/Wand本番変更禁止。未決事項ADR。

## CORE/RE
ADR全安全性契約遵守。Input→Validate→Decode→Index→Plan→Diff→Apply→Encode→Reparse→Verify→Export。SaveGameV2/ZIP/LZ4/Native MessagePack/Hash128/i64/u64。Worker内Single ProductSession、Typed Command/Result/Revision/CAS/Generation/request ID、旧値/対象/version/source検証、stale/close/replay/busy/File A-B拒否。原本不変/別File/全成功or全失敗、未知/非対象ZIP/token/opaque/順序/型/精度保持、No-op意味同一/byte差最小、独立Reparse/Exact Diff、部分出力禁止。Undo/Redo/Reset/Backup正確復元。破損/不正ZIP/path traversal/zip bomb/巨大/depth/node/overflow拒否、marker≠認証。Byte-range Index/Lazy Decode、UI page/model/diffのみ、全量JSON/全Save転送/全件DOM禁止。64bit BigInt/厳密decimal、Number無条件変換禁止。防御上限無条件緩和禁止、64MiB通常/128MiB stress/200万documents目標、JS/Rust実Chrome同条件比較。
RE=Locate→CrossReference→Hypothesis→ControlledTest→Evidence→Contract。既存Schema/GUID/DB/RVA再利用、Native保存/Load/Migration/真正BeforeAfter。ID/表示名/Localization Key、日時/UTC/null/欠落/false/0、履歴/取得/達成/報酬/所有区別。REQUIREDのみ原子的更新、RELATED警告、UNKNOWN保全/制限。名称類似join/推測Counter/架空GUID/UniqueData/報酬通貨Entitlement有償所有online無条件変更禁止。Collection Key1≠取得、Inventory/Recipe/Key0 migration/復元証跡、Achievement leaf/family/Group/Meta/Reward永続化。未観測保証禁止。

## UI/LOCALE/MEDIA
既存タブ/検索/分類/進捗/日時/個別一括/Diff/Undo/Reset/Backup/Export/画像/デザイン保持。未知ID/未取得/未達成/未対応区別、Capability制限、Preview≠Apply≠Export。UI/処理分離。320/375/1280px/keyboard/a11y/遅延読込/応答性/大量データ、全面再設計禁止。
全ゲーム正式対応言語=正式版必須。08実ゲーム言語設定/tableをversion別検証、既存820 EN/JA再利用。全ゲーム名称/説明等をGUID/ItemId/Localization Key原文厳密join、推測翻訳禁止。欠落/未知/fallback/出典/coverage区別。Editor固有UI全言語keyed catalog/placeholder/plural/a11y。navigator.languages順→navigator.language→対応en/ゲーム既定、BCP47 exact/実証alias、script/region区別。native名selector/Auto/local保存、document lang/dir/Intl検索日時数値、言語変更でSave/Session/Revision/Undo/選択不変。lazy locale packs、Rust stable IDs、外部送信なし。Beta追加Gate禁止。
画像=exact GUID/ItemId/Sprite、direct/fallback/親カテゴリ/Reward区別。既存WebP/ImageMap再利用、新規lossless VP8L/RGBA/alpha/寸法/SHA、UNKNOWN placeholder。画像/原文Owner利用方針、許諾/提携/公式承認主張禁止。対応言語credit Sunblink/SANRIO等、非公式/非提携/画像権利非所有、削除要請対応。

## GIT/RELEASE
main-first/minimal diff/1PR=1責務、最新HEAD/Blob/競合確認。main Merge=00/明示委任のみ直列。Focused→必要CI→risk-based acceptance→統合→影響検証。不要PR/CI/再統合/強制上書き/旧Draft無条件Merge禁止。PR/Delta=基準/Source/Scope/実測/リスク/依存/rollback。
真正Save/個人ID/秘密/元ゲームデータGit/CI/PR/Issue/公開ログ投入禁止。公開Fixture=合成/安全匿名化。実Save非公開ローカル、外部送信禁止。00配布=既存Build/Workflow/依存閉包/Pages subpath/HTTPS/WebCrypto/全SHA/再現Build/手動固定Artifact Gate/rollback、allowlistでprivate Save/NSO/元AssetBundle/研究Fixture/Drive参照ID/秘密排除。実HTTP/HTTPS/WebCrypto/Module Worker正規Browser、Node/inline/digest bridge≠実Browser PASS。
QA=影響ScopeのNo-op/単独複数一括/双方向/連動/日時/未知値/破損/不正ZIP/非対象保持/再読込/rollback/CAS/replay/負荷/UI/回帰。Rust全Payload消費/型/unknown/Writer/ABI/実Chrome/予算、Svelte同等性。実機=代替不能release-critical Load/再保存/副作用のみ代表操作。
公開Gate=固定Source/両Domain真正編集出力/実UI/画像credit/配布SHA/privacy/実Browser/独立QA/rollback/Owner承認、正式版Rust/Svelte/全言語必須。開発/画像/Localization/Architecture承認≠Deploy/本番Flag。未承認Deploy/自動Deploy/本番ON/課金契約/Community本番DB/Wand本番変更禁止。正式昇格別承認。Task DONE≠製品DONE。
