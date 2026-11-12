import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {classifyNativeSavePath,assessLoadedAchievementRecount,inspectAchievementRewardClaim,
 inspectMissionCounterLink,inspectCollectionInventoryDirection,NATIVE_WRITEPATH_SCHEMA,FROZEN_GRAPH,
 FORBIDDEN_AUTOWRITES} from '../contracts/03-linkage-native-writepath.mjs';
const root=path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data=JSON.parse(fs.readFileSync(path.join(root,'contracts/03-linkage-native-writepath-delta.json')));
const opts={version:'3.0.1',guidVerified:true,documentIdVerified:true};
test('schema fixed and frozen graph unchanged',()=>{assert.equal(NATIVE_WRITEPATH_SCHEMA,'HKIA.LinkageNativeWritePathDelta.1');assert.equal(FROZEN_GRAPH.edges,17284);assert.equal(data.frozenGraph.edgeCount,17284);assert.equal(data.frozenGraph.regenerated,false)});
test('exact source SHA pinned',()=>assert.equal(data.source.sha256,'83580cee3e2effaee14780d921ba5621b1505774b6e0a349e8f08a61ec1c1a1a'));
for(const kind of ['ACHIEVEMENT','COUNTER']){
 for(const storage of ['Meta','InGame']){
  test(`${kind}/${storage}: game-side path known; external edit unauthorized`,()=>{
   const r=classifyNativeSavePath({kind,storage,...opts});
   assert.equal(r.classification,'RELATED');assert.match(r.storageTarget,/settings\.json|save_0\.save/);assert.ok(r.observedNativeRoute.length>=2);
   assert.equal(r.autoApply,false);assert.equal(r.saveBytes,null);assert.equal(r.writerEnabled,false);assert.deepEqual(r.requiredWrites,[]);
  });
 }
}
test('unknown storage no route',()=>{const r=classifyNativeSavePath({kind:'ACHIEVEMENT',storage:'UNKNOWN'});assert.equal(r.classification,'UNKNOWN');assert.equal(r.storageTarget,null)});
test('unknown version no recycled RVA',()=>assert.equal(classifyNativeSavePath({kind:'COUNTER',storage:'InGame',version:'3.0.2'}).classification,'UNKNOWN'));
test('missing document ID cannot authorize write',()=>assert.ok(classifyNativeSavePath({kind:'COUNTER',storage:'InGame',version:'3.0.1',guidVerified:true}).blockers.includes('SAVED_DOCUMENT_ID_UNVERIFIED')));
test('invalid domain rejects',()=>assert.throws(()=>classifyNativeSavePath({kind:'COLLECTION',storage:'InGame'}),TypeError));
test('completed Achievement load skips recount on traced branch',()=>assert.equal(assessLoadedAchievementRecount({isComplete:true,currentValue:0,computedValue:2}).candidate,'COMPLETED_BRANCH_SKIPS_RECALC'));
test('incomplete with smaller derived does not auto-decrement',()=>assert.equal(assessLoadedAchievementRecount({isComplete:false,currentValue:4,computedValue:3}).candidate,'NO_UPWARD_CHANGE_ON_THIS_PATH'));
test('incomplete greater derived only potential update',()=>assert.equal(assessLoadedAchievementRecount({isComplete:false,currentValue:4,computedValue:5}).candidate,'UPWARD_CANDIDATE_EPSILON_CHECK_UNVERIFIED'));
test('invalid current blocks candidate',()=>assert.ok(assessLoadedAchievementRecount({isComplete:false,currentValue:NaN,computedValue:1}).blockers.includes('PREIMAGE_MISSING_OR_INVALID')));
test('different binary version refuses load rule',()=>assert.equal(assessLoadedAchievementRecount({version:'3.0.2',isComplete:false,currentValue:1,computedValue:2}).candidate,'UNDETERMINED'));
test('no AchievementData reward-claim field',()=>{const r=inspectAchievementRewardClaim({achievementDataKeys:['IsComplete','CurrentValue','CompletedTime'],completionCallbackObserved:true});assert.equal(r.classification,'UNKNOWN');assert.deepEqual(r.requiredWrites,[]);assert.equal(r.storageTarget,null)});
test('malformed achievement schema identified',()=>assert.ok(inspectAchievementRewardClaim({achievementDataKeys:['IsComplete']}).blockers.includes('ACHIEVEMENT_DATA_SCHEMA_UNVERIFIED')));
test('claim ledger assertion does not infer relationship',()=>assert.equal(inspectAchievementRewardClaim({achievementDataKeys:['IsComplete','CurrentValue','CompletedTime'],hasVerifiedClaimLedger:true}).classification,'UNKNOWN'));
const mission={achievementKey:'achievement_bringingTheBandBack',sourceAchievementGuid:'2247668b102553140a96cafe03eb600e',sourceCounterGuid:'925536a9fa5214642bb8b10ce062975c',sourceCounterKind:'GameCounterMissionDefinition'};
test('01/02 exact mission-linked achievement obtains runtime RELATED only',()=>{const r=inspectMissionCounterLink(mission);assert.equal(r.classification,'RELATED');assert.ok(r.blockers.includes('MISSION_ASSET_GUID_TO_SAVE_DOCUMENT_UNVERIFIED'));assert.equal(r.autoApply,false)});
test('unknown mission achievement not inferred by name',()=>assert.equal(inspectMissionCounterLink({...mission,sourceCounterGuid:'0000'}).classification,'UNKNOWN'));
test('attacker-supplied mission GUID does not authorize save mutation',()=>assert.equal(inspectMissionCounterLink({...mission,missionAssetGuid:'dummy',missionDocumentId:'dummy'}).applyAuthorized,false));
test('observed collection history + no inventory change remains RELATED',()=>{const r=inspectCollectionInventoryDirection({historyAdded:true,inventoryNewId:false,quantityChangedForSameId:false});assert.equal(r.classification,'RELATED');assert.ok(r.warnings.includes('HISTORY_BACKFILL_WITHOUT_INVENTORY_NEW_OWNERSHIP_OBSERVED'))});
test('unknown collection preimage fails closed',()=>assert.equal(inspectCollectionInventoryDirection({historyAdded:null}).classification,'UNKNOWN'));
test('all new persistence edges are RELATED and autoApply=false',()=>{assert.equal(data.newEvidenceEdges.length,4);assert.ok(data.newEvidenceEdges.every(e=>e.classification==='RELATED'&&!e.autoApply&&e.requiredWrites.length===0&&e.persistenceEdgeVerified))});
test('mission runtime case does not claim persisted link',()=>{assert.equal(data.runtimeOnlyEvidence.length,1);assert.equal(data.runtimeOnlyEvidence[0].persistenceEdgeVerified,false);assert.equal(data.runtimeOnlyEvidence[0].missionSaveDocumentId,null)});
test('unverified claim/quest/unlock/cache remain UNKNOWN',()=>{for(const [k,v] of Object.entries(data.unresolved))assert.equal(v,'UNKNOWN',k)});
test('no 509-mission noncausal INDEPENDENT',()=>assert.equal(data.acceptance.noGenericIndependentInferencesFrom509UnchangedMissions,true));
test('explicit forbidden auto writes',()=>{assert.ok(FORBIDDEN_AUTOWRITES.includes('Quest'));assert.ok(FORBIDDEN_AUTOWRITES.includes('RewardClaim'));assert.ok(FORBIDDEN_AUTOWRITES.includes('Inventory'))});
test('writer/pages/real saves OFF',()=>{assert.equal(data.acceptance.writerEnabled,false);assert.equal(data.acceptance.pagesEnabled,false);assert.equal(data.acceptance.realSaveModified,false)});
import {resolveMissionSourceBinding} from '../contracts/03-linkage-native-writepath.mjs';
const missions=JSON.parse(fs.readFileSync(path.join(root,'contracts/03-linkage-mission-source-crosswalk.json')));
test('Mission source map 171 counters, 170 distinct assets',()=>{
 assert.equal(missions.bindings.length,171);
 assert.equal(new Set(missions.bindings.map(x=>x.missionSourceGuid)).size,170);
 assert.equal(new Set(missions.bindings.map(x=>x.counterSourceGuid)).size,171);
});
test('all mission source IDs are 32 hex nibbles and pointers nonzero',()=>{
 assert.ok(missions.bindings.every(x=>/^[0-9a-f]{32}$/.test(x.counterSourceGuid)&&/^[0-9a-f]{32}$/.test(x.missionSourceGuid)&&x.missionPptrPathId!=='0'));
});
test('169 InGame and 2 account-linked mission counters',()=>{
 assert.equal(missions.bindings.filter(x=>x.achievementKey!==null).length,169);
 assert.equal(missions.bindings.filter(x=>x.accountKey!==null).length,2);
});
test('crosswalk reproducibility 134/171 both save versions aggregate',()=>{
 assert.equal(missions.counts.activeSampleMatchedLinksAggregate,134);
 assert.equal(missions.counts.backupSampleMatchedLinksAggregate,134);
});
test('all quest source links RELATED, never auto-write',()=>{
 for(const item of missions.bindings){assert.equal(item.classification,'RELATED'); assert.equal(item.persistentLinkageRequired,false);assert.deepEqual(item.requiredWrites,[])}
});
test('exact PPtr source mission for bringingTheBandBack',()=>{
 const row=missions.bindings.find(x=>x.counterSourceGuid==='925536a9fa5214642bb8b10ce062975c');
 assert.equal(row.achievementKey,'achievement_bringingTheBandBack');
 assert.equal(row.missionAssetKey,'Mis_Tux_TheBandIsBack_Pt4.MissionDefinitionAsset');
 assert.equal(row.missionSourceGuid,'db8493a08eac3e04b9b3b6dfd9cce8e1');
});
test('known source-only mission PPtr can be inspected but never applied',()=>{
 const r=resolveMissionSourceBinding(missions,{counterSourceGuid:'925536a9fa5214642bb8b10ce062975c'});
 assert.equal(r.classification,'RELATED');assert.equal(r.storageTarget,null);assert.equal(r.autoApply,false);
 assert.ok(r.targetIds.includes('db8493a08eac3e04b9b3b6dfd9cce8e1'));
});
test('unrelated source counter remains UNKNOWN',()=>assert.equal(resolveMissionSourceBinding(missions,{counterSourceGuid:''.padEnd(32,'0')}).classification,'UNKNOWN'));
test('wrong Mission GUID remains UNKNOWN',()=>assert.equal(resolveMissionSourceBinding(missions,{counterSourceGuid:'925536a9fa5214642bb8b10ce062975c',missionSourceGuid:'bad'}).classification,'UNKNOWN'));
test('wrong version refuses reused v3.0.1 Native RVA',()=>assert.equal(resolveMissionSourceBinding(missions,{counterSourceGuid:'925536a9fa5214642bb8b10ce062975c',version:'3.0.2'}).classification,'UNKNOWN'));
test('modified crosswalk count fails closed',()=>assert.equal(resolveMissionSourceBinding({...missions,counts:{...missions.counts,sourceMissionCounterLinks:172}}, {counterSourceGuid:'925536a9fa5214642bb8b10ce062975c'}).classification,'UNKNOWN'));
test('no user saved mission IDs in crosswalk',()=>{
 assert.equal(missions.noUserSavedIdsEmitted,true);
 assert.ok(missions.bindings.every(x=>!Object.keys(x).some(k=>['missionDocumentId','savedProgress','saveDocumentId','sessionUserId','isComplete'].includes(k))));
});
