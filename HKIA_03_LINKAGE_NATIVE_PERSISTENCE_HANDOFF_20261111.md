# HKIA Editor — 03 LINKAGE P0 / Native Persistent-Dependency Delta

**STATUS: PARTIAL / CODE-AND-SOURCE-VERIFIED; REAL_DEVICE UNVERIFIED.**

## Source lock / unchanged baseline

- Authoritative input: Google Drive `[PRIVATE_REFERENCE_REMOVED]`, `HKIA_CTRL_Integrated_Candidate_Next_20261111.zip`.
- Source ZIP SHA-256: `83580cee3e2effaee14780d921ba5621b1505774b6e0a349e8f08a61ec1c1a1a`; 161 entries / CRC PASS.
- v3.0.1 Switch `main` SHA-256: `64bd5fb69239f57eb0578a1897a45a3c6f5e187480903f83df503b46bf827bfb`; `dump.cs` SHA-256: `4b4eb6a543722e1dfaf8aad5593e9e1300723aff55e9e750d489744960feb738`.
- Steam v3.0.1 UnityFS `definitions` SHA-256: `ba9f3f97d1598a6923d2f804a704ab356c33866aa2d5f03bf11003735419e9e0`.
- Old accepted 17,284 structural edges **FROZEN**; graph SHA `56d2c16c41f671419c7dcbfbbecf3444866c837b2e2ec7af2a1dee424f06165b`. No regeneration, no mutation, no new unconditional or conditional REQUIRED edges.
- Original real saves, UnityFS, `main`, `dump.cs`, raw private disassembly and personal IDs are **not included** in any deliverable. The extra 171 source Mission bindings contain only game definition GUIDs and source PPtr IDs. Sample-save matching is reported as aggregate counts without individual private saved document IDs or progress.

## P0 new evidence: actual game-side Achievement and Counter persistence routes

The following **four scoped edges were not added to the frozen graph**; they appear only in `contracts/03-linkage-native-writepath-delta.json`. They are `RELATED` evidence of game-side saving, not authorization for this editor to emit changes:

| Route ID | Runtime origin (Storage) | Native write path, v3.0.1 RVA | Serialized target | Class |
|---|---|---|---|---|
| NEW_NATIVE_ACH_META | Achievement, Meta=0 | `0x3838A80` → `0x3838AC0` | `SettingsAccount/settings.json` | RELATED |
| NEW_NATIVE_ACH_SLOT | Achievement, InGame=1 | `0x3838A80` → `0x3838D90` → `0x3E43610` | `DbAchievements` → `AchievementModel.Data` | RELATED |
| NEW_NATIVE_COUNTER_META | Counter, Meta=0 | `0x383A690` → `0x383A6D0` | `SettingsAccount/settings.json` | RELATED |
| NEW_NATIVE_COUNTER_SLOT | Counter, InGame=1 | `0x383A690` → `0x383A9A0` → `0x3E43760` | `DbGameCounters` → `GameCounterModel.Data` | RELATED |

`Achievement.SetCurrentValue 0x72AA280` uses `IAchievementsStorage.SaveAchievement` via virtual dispatch; deferred InGame path writes `AchievementData` (`IsComplete`, `CurrentValue`, `CompletedTime`) from runtime, followed by the database manager. `GameCounter.MakeData 0x72B8E80` and InGame deferred method write `CurrentValue`, `CountedValues=null`, `CountedGuids` into native save model. Branch targets and exact two packed-field instructions are verified by the included read-only Native proof script (which requires locally available private NSO input). **This does not establish a valid external SaveGameV2 envelope or a signed/exportable editor writer.**

## New source-only Mission/Quest dependencies (171) and persisted GUID match (134)

The original UnityFS includes **171** `GameCounterMissionDefinition` source counters. Each `Mission.m_FileID=0 / Mission.m_PathID` was resolved to a real object in the same serialized UnityFS, and that object had the validated `MissionDefinitionAsset` prefix and `SerializedGuid`. Results:

| Metric | Read-only verified |
|---|---:|
| Quest→MissionCounter source relationships | 171 |
| Distinct target MissionDefinitionAsset GUIDs | 170 |
| Source relationships attached to InGame Achievement | 169 |
| Source relationships attached to Account Achievement | 2 |
| Source Mission GUID present in **same-ZIP** v3.0.0 backup MissionDatabaseModel | 134/171 |
| Source Mission GUID present in **same-ZIP** v3.0.1 current MissionDatabaseModel | 134/171 |
| Missing from these snapshots | 37/171, **NOT corrupt by default** |

Concrete fully identified target:

- Achievement `achievement_bringingTheBandBack`, source GUID `2247668b102553140a96cafe03eb600e`.
- Counter `achievement_bringingTheBandBack.GameCounterMissionDefinition`, source GUID `925536a9fa5214642bb8b10ce062975c`, saved counter GUID `9a635529:464125af:c01b8bb2:c579260e` (02 contract).
- Exact source Mission PPtr path ID `4203478303767805141` resolves to `Mis_Tux_TheBandIsBack_Pt4.MissionDefinitionAsset`, GUID `db8493a08eac3e04b9b3b6dfd9cce8e1`.
- v3.0.1 `MissionDatabaseModel.MissionId` was validated against this source GUID using Native-derived **per-8-hex-block nibble reversal**, *not* heuristic word permutations. The matching saved Mission document's individual ID, status, timestamps, tasks and other user values are not bundled.
- `GameCounterMissionDefinition.Tracker.OnMissionCompleted` `0x2FEF3D0` compares the mission definition identity, then follows a runtime counter value update when it matches. `GetCurrentValue 0x2FEF140` is a separate route. This is **runtime RELATED**, and source/actual-save GUID binding is verified for the matched snapshots. It is NOT proof that an editor's Achievement mutation must edit Quest progress.
- Native `MissionDatabaseConverter.SaveMissions 0x28529D0` branches to `SaveMissionsInternal 0x28529E0`. `UpdateCachedMission 0x2852E70` writes MissionDatabaseModel `Status` (`0x2852FAC`) and `CompletedTicks` (`0x285300C`), invokes task serialization (`0x2853068` → `0x2853120`). This proves a **game-side Mission save-model conversion stage**, not the final disk commit or an editor mutation dependency.

`contracts/03-linkage-mission-source-crosswalk.json` contains 171 **source-only** binding rows with exact GUID, PPtr, target names, classification and zero required writes; it does not alter or duplicate the old graph. To reproduce from private original game files, run the provided `scripts/03-linkage-mission-ptr-crosswalk.py` locally with `--repo`, `--serial` and `--out`, and optional `--source-zip`, `--definitions-bundle`, `--save-zip` (the latter only reports aggregate match counts). Do not run private inputs in public CI or commit generated private snapshot results.

## Other Native observations and remaining unknowns

| Dependency | Proven observation | Saved-value classification |
|---|---|---|
| Achievement load → progress | `Achievement.SetLoaded 0x72A9500` skips value recompute for completed records, and on incomplete records follows `CalcCurrentValue` `0x72AA5A0`; only **upward** calculated value may reach `SetCurrentValue` `0x72AA280`, subject to additional comparison guard. No generic downward overwrite is supported on this path. | RELATED; no REQUIRED to mutate source counters based on this alone |
| Unique Counter → current value | `GameCounter.OnCounterLoaded 0x72B7890` reconstructs legacy or GUID history; nonempty modern history can recount scalar. Native `MakeData 0x72B8E80` outputs `CountedValues=null` and `CountedGuids` list. | RELATED; no fabricated CountedGuids, no numerical-only history edits |
| Achievement completion → reward | `AchievementsService.OnAchievementCompleteCallback 0x72AF360` → `MaybeApplyAchievementRewards 0x72AF490` → `ApplyAchievementRewards 0x72AF820` (conditional) and runtime queue. `AchievementData` only Key(0..2) complete/value/time; **no claim bit** in this model. | Runtime RELATED, individual saved claim state UNKNOWN |
| Collection history ↔ inventory | `ServerCollection.OnInventoryItemChanged` branches → `GameCollectionServer.SetCollected`; in same-ZIP backup→active four collected histories appeared while item ID ownership and same-item inventory quantities did not change. | Inventory→Collection runtime RELATED; reverse save mutation UNKNOWN |
| Group / Meta parent | `GameCounterAchievementsDefinition.Tracker.OnAchievementComplete 0x72B61F0` → count `0x72B5BA0`; exact special Puzzle Goals 8-slot+2-Account clone remains research-only. | RELATED (special existing dry-run only); generic REQUIRED UNKNOWN |
| RewardManagerTraitModel | Source persistence Union40 exists, but **not proven** to represent Achievement reward claims; no individual Achievement→claim ledger link. | UNKNOWN |
| Quest / Unlock / Cache | 171 Mission→Counter source relationships above; specific MissionDatabaseModel binding for 134/171 sampled; other Quest, Unlock, Cache write relationships unproven. | Exact source Quest→Counter RELATED; edit-time Quest/Unlock/Cache writes UNKNOWN |

The **509 unchanged MissionDatabaseModel records** in the same-save comparison are **not** grounds for generally labeling Achievement↔Mission as INDEPENDENT. No claim is made about live platform sync, achievement completion replay, reward claim, 32-byte SaveGameV2 prefix authentication, online safety or real hardware acceptance.

## Focused negative cases

1. Unsupported `3.0.2` / unknown format supplied to v3.0.1 RVA dispatch must yield UNKNOWN.
2. Missing source GUID or saved document ID must not authorize an external write despite knowing the runtime Storage branch.
3. Achievement `IsComplete=true` must not be marked as automatically downward-recomputed on the traced `SetLoaded` branch.
4. Incomplete Achievement saved value greater than current derived result must not be assumed to decrease automatically.
5. Nonempty `CountedGuids` must not be fabricated or normalized by scalar `CurrentValue` alone; prior 03 rule retained.
6. Runtime reward callback and queue must not be treated as a persisted claim marker.
7. Source Quest GUID and `MissionDatabaseModel` match do not authorize Quest status/completion timestamp editing.
8. The 37 source missions lacking a sampled Mission saved record must not trigger auto-creation of documents.
9. Unknown source GUID, false matching mission asset or wrong game version must fail closed; names alone are not linkage evidence.
10. Four Collection histories growing without ownership change negate an unconditional reverse inventory write rule; general independence remains unproven.
11. Parent/Group/Meta, reward, inventory, Quest, Unlock and Cache remain excluded from auto-update if evidence is only RELATED.
12. Source GUID, date/time and private game values are not uploaded to public CI, PR or code artifacts.

## 04 / 05 integration contract

**04 SAVE CORE:** Import `contracts/03-linkage-native-writepath.mjs` and `.d.ts`, read the paired JSON contract and source-only 171-row crosswalk. `classifyNativeSavePath` routes native-source evidence to expected Account vs Slot field family with `applyAuthorized=false`; `assessLoadedAchievementRecount` provides guarded state; `resolveMissionSourceBinding` requires 02 exact counter source GUID plus 03 definition crosswalk, and never emits a byte patch. Reuse the existing `03-linkage-persisted-delta` functions for CountedGuids and Collection safety; do not reimplement them. Continue read-only/dry-run with strong preimages and version gate. Never mutate Quest/Unlock/RewardClaim/Cache/Group/Meta merely because this delta is RELATED.

**05 WEB:** Show source Mission relationship and optional presence/unknown state separately from any editable Achievement field. Display `runtime RELATED`, `persistent mutation requirement UNKNOWN`, `37 save record not observed in these samples` without assuming absence/corruption universally. Show Native load-recount direction and uncertainty for incomplete achievements. Reward claim status remains UNKNOWN; do not label as collected/redeemed, and never show writer available. Do not duplicate the old 17,284 graph.

**06 QA:** Use new 41 scoped JS tests and 25 Native opcode/model checks, plus account/slot source baseline tests. Real save readback is non-mutating only. Check exact ID links and 134 match aggregate under private fixtures; do not upload fixtures.

## Observed tests / handoff status

- Focused delta JS: **41 PASS / 0 FAIL**, using read-only generated source crosswalk.
- Native proof: **12 direct branches + 4 exact A64 instruction words + 9 IL2CPP model declarations = 25/25 PASS** against private NSO/dump.cs and candidate ZIP SHA.
- Source-only UnityFS Mission PPtr: **171/171** validated; targets **170**; same-archive backup and active source GUID matches **134/171 in each**.
- Integrated candidate `npm test`: **216 PASS / 36 SKIP / 0 FAIL**. `npm run check`: PASS; `npm run build`: PASS.
- All source and third-party originals remain unchanged. No new Git commit, Writer OFF, Pages OFF, no modified real save created, no hardware/reboot acceptance claimed.

**STREAM=03 LINKAGE** / **BASE_HEAD=SOURCE_DRIVE artifact SHA above; Git HEAD unavailable in this source ZIP** / **SOURCE_HEAD=identical input ZIP, add-only standalone delivery** / **STATUS=PARTIAL**.

**NEXT / DEPENDENCY:** For 04/05 now: consume identified Native storage routing and the 171 exact Quest source relationship warnings. For 03 later: trace game-side reward claim idempotency/persistence using exact callback and Player inventory paths; use real gameplay Before/After and device reload before changing any REQUIRED class. Exact Puzzle Goals atomic research contract is not a game-accepted writer.
