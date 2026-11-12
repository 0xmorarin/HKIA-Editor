import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {assessCounterLinkage,assessCollectionInventoryLinkage,classifyGamePersistenceCandidate,
  assessAchievementFamilyLinkage,LINKAGE_PERSISTED_GRAPH,LINKAGE_PERSISTED_SCHEMA}
  from '../contracts/03-linkage-persisted-delta.mjs';
const dir=dirname(fileURLToPath(import.meta.url));
const contract=JSON.parse(readFileSync(resolve(dir,'../contracts/03-linkage-persisted-delta.json'),'utf8'));
const pair=JSON.parse(readFileSync(resolve(dir,'../HKIA_03_LINKAGE_PERSISTED_PAIR_AGGREGATE_20261111.json'),'utf8'));
const cp=(over={})=>assessCounterLinkage({sourceOnlyCountUniques:true,savedCurrentValue:35,
  proposedCurrentValue:36,countedGuidsState:'PRESENT',countedGuidsCount:35,
  countedValuesState:'NULL',countedValuesCount:null,saveVersion:'3.0.1',expectedSaveVersion:'3.0.1',...over});

test('immutable graph fingerprint and new REQUIRED=0, no writer export',()=>{
  assert.equal(LINKAGE_PERSISTED_GRAPH.edgeCount,17284);
  assert.equal(contract.frozenGraph.sha256,LINKAGE_PERSISTED_GRAPH.sha256);
  assert.equal(contract.frozenGraph.regenerated,false);
  assert.deepEqual(contract.frozenGraph.newRequiredEdges,[]);
  assert.equal(contract.nativeWriterEnabled,false);
  assert.equal(contract.pagesEnabled,false);
  assert.equal(contract.changedDependencies.length,10);
  assert.ok(contract.changedDependencies.every(e=>e.classification!=='REQUIRED'&&!e.autoUpdate));
});
test('source v3.0.1 call site records preserve both inventory to collection calls',()=>{
 const c=contract.nativeCallEvidence.find(e=>e.id==='N-COL-01');
 assert.deepEqual(c.callRvas,['0x3A9BE8C','0x3A9C13C']);
 assert.equal(c.targetRva,'0x3A9C1F0');
});
test('one-way runtime call does not authorize inventory reverse write',()=>{
  const r=assessCollectionInventoryLinkage({operation:'RECORD',historyWasRecorded:false,
    itemWasAlreadyInInventory:true,inventoryChanged:false,itemIdKnown:true,
    sourceMembershipKnown:true,saveVersion:'3.0.1'});
  assert.equal(r.classification,'RELATED');
  assert.ok(r.warnings.includes('BACKFILL_WITHOUT_NEW_INVENTORY_OWNERSHIP_OBSERVED'));
  assert.ok(r.warnings.includes('COLLECTION_TO_INVENTORY_REVERSE_WRITE_NOT_PROVEN'));
  assert.deepEqual(r.requiredWrites,[]);assert.equal(r.autoApply,false);
});
test('unknown collection item remains unlinked, no inferred source membership',()=>{
  const r=assessCollectionInventoryLinkage({operation:'REMOVE',historyWasRecorded:true,
    itemIdKnown:false,sourceMembershipKnown:false,saveVersion:'3.0.2'});
  assert.ok(r.warnings.includes('SAVE_VERSION_LINKAGE_UNKNOWN'));
  assert.ok(r.warnings.includes('SOURCE_ITEM_ID_UNVERIFIED'));
  assert.ok(r.blockers.includes('COLLECTION_SIDE_EFFECTS_NOT_VERIFIED'));
});
test('counter only scalar edit with nonempty saved CountedGuids is refused',()=>{
  const r=cp();
  assert.equal(r.schema,LINKAGE_PERSISTED_SCHEMA);
  assert.ok(r.blockers.includes('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE'));
  assert.ok(r.warnings.includes('NATIVE_LOAD_MAY_RECOUNT_FROM_GUID_HISTORY'));
  assert.deepEqual(r.requiredWrites,[]);assert.equal(r.saveBytes,null);
});
test('counter no-op does not fabricate a history or executable plan',()=>{
  const r=cp({proposedCurrentValue:35});
  assert.ok(!r.blockers.includes('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE'));
  assert.ok(r.warnings.includes('NO_CHANGE_OR_NON_EDIT'));
  assert.equal(r.applyAuthorized,false);
});
test('saved scalar inconsistent with unique list length fails preimage',()=>{
  const r=cp({savedCurrentValue:35,countedGuidsCount:34});
  assert.ok(r.blockers.includes('UNIQUE_COUNT_VALUE_PREIMAGE_MISMATCH'));
});
test('empty unique list cannot be manufactured from requested scalar',()=>{
  const r=cp({savedCurrentValue:0,proposedCurrentValue:3,countedGuidsCount:0});
  assert.ok(r.blockers.includes('UNIQUE_COUNTER_HISTORY_CONSTRUCTION_UNVERIFIED'));
});
test('source nonunique with history still blocks scalar-only manipulation',()=>{
  const r=cp({sourceOnlyCountUniques:false});
  assert.ok(r.blockers.includes('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE'));
});
test('legacy CountedValues explicitly nonempty blocks scalar-only mutation',()=>{
  const r=cp({sourceOnlyCountUniques:false,countedGuidsState:'NULL',countedGuidsCount:null,
    countedValuesState:'PRESENT',countedValuesCount:5});
  assert.ok(r.blockers.includes('NUMERIC_ONLY_COUNTER_EDIT_UNSAFE'));
  assert.ok(r.warnings.includes('LEGACY_COUNTEDVALUES_MIGRATION_PATH'));
});
test('legacy and CountedGuids simultaneously nonempty is unverified',()=>{
  const r=cp({countedValuesState:'PRESENT',countedValuesCount:35});
  assert.ok(r.blockers.includes('DUAL_COUNTED_HISTORY_MIGRATION_UNPROVEN'));
});
test('unknown/null/absent history shapes are not silently converted to []',()=>{
 for(const state of ['UNKNOWN','ABSENT','NULL']){
   const r=cp({countedGuidsState:state,countedGuidsCount:null});
   assert.equal(r.applyAuthorized,false);
   if(state==='UNKNOWN')assert.ok(r.blockers.includes('COUNTED_HISTORY_STATE_UNKNOWN'));
 }
});
test('unsafe inputs and stale revisions cannot become writer-ready',()=>{
 const bad=cp({proposedCurrentValue:Infinity,saveVersion:'3.0.0'});
 assert.ok(bad.blockers.includes('INVALID_COUNTER_CURRENT_VALUE'));
 assert.ok(bad.blockers.includes('COUNTER_SAVE_VERSION_PRECONDITION_FAILED'));
 assert.equal(bad.writerEnabled,false);
});
test('reward manager is not a verified achievement reward claim ledger',()=>{
 const r=classifyGamePersistenceCandidate('REWARD_MANAGER');
 assert.equal(r.storage,'TraitModel union 40');
 assert.equal(r.classification,'UNKNOWN');
 assert.ok(r.warnings.includes('NOT_AN_ACHIEVEMENT_REWARD_CLAIM_MARKER'));
 assert.deepEqual(r.requiredWrites,[]);
});
test('mission and blackboard models exist but remain UNKNOWN',()=>{
 for(const k of ['MISSION','DAILY_MISSION','BLACKBOARD','PLAYER_TRIGGER','DLC','UNLOCK','CACHE','ACHIEVEMENT_REWARD_CLAIM']){
   const r=classifyGamePersistenceCandidate(k);
   assert.equal(r.classification,'UNKNOWN');
   assert.equal(r.edgeToAchievementOrCollectionVerified,false);
 }
});
test('achievement Group cannot be made directly writable from parent graph',()=>{
 const r=assessAchievementFamilyLinkage({familyType:'GROUP',hasPersistedParent:true,
 hasSavedSiblingSet:true,hasMetaRoot:true,saveVersion:'3.0.1'});
 assert.ok(r.blockers.includes('RUNTIME_DERIVED_VALUE_NOT_DIRECTLY_EDITABLE'));
 assert.equal(r.classification,'RELATED');assert.equal(r.requiredWrites.length,0);
});
test('specific Puzzle preimage does not bypass user/04 writer gate',()=>{
 const r=assessAchievementFamilyLinkage({familyType:'MANUAL',hasPersistedParent:true,
 hasSavedSiblingSet:true,hasMetaRoot:true,exactPuzzlePreimageVerified:true,saveVersion:'3.0.1'});
 assert.equal(r.classification,'RELATED');
 assert.ok(r.warnings.includes('EXACT_PUZZLE_STATIC_PREIMAGE_REQUIRES_SEPARATE_04_ATOMIC_DRY_RUN'));
 assert.equal(r.writerEnabled,false);
});
test('unknown/future version remains blocked, no guessed parent/meta',()=>{
 const r=assessAchievementFamilyLinkage({familyType:'UNKNOWN',hasPersistedParent:false,
 hasSavedSiblingSet:false,hasMetaRoot:false,saveVersion:'3.0.2'});
 assert.ok(r.blockers.includes('UNSUPPORTED_OR_UNVERIFIED_SAVE_VERSION'));
 assert.ok(r.warnings.includes('PARENT_RECORD_OR_BINDING_NOT_VERIFIED'));
});
test('actual private pair evidence is only bounded anonymous aggregate and safe for handoff',()=>{
 assert.equal(pair.schema,'HKIA.LinkagePersistedPairEvidence.1');
 assert.equal(pair.privateInputsEmbedded,false);
 assert.equal(pair.counters.before.source_guid_matches,586);
 assert.equal(pair.counters.after.source_guid_matches,586);
 assert.equal(pair.counters.before.source_unique_history_nonempty,35);
 assert.equal(pair.counters.after.source_unique_history_nonempty,35);
 assert.equal(pair.counters.after.source_unique_scalar_count_mismatches,0);
 assert.equal(pair.counters.changedSourceUniqueOnly,1);
 assert.equal(pair.counters.serializedGuidEntriesDelta,-9);
 assert.equal(pair.otherPersisted.MissionDatabaseModel.changed,0);
 assert.equal(pair.otherPersisted.MissionDatabaseModel.old,509);
 assert.equal(pair.collections.added,4);
 assert.equal(pair.collections.oldInventoryAlreadyHadAddedIds,4);
 assert.equal(pair.collections.addedWithChangedInventoryItemIds,0);
 assert.equal(pair.achievements.changed,0);
 assert.equal(pair.conclusions.causalLinkageProven,false);
 assert.equal(pair.counters.hash128ElementIdentityVerified,false);
});
test('no new persisted REQUIRES assigned merely from pair changed stats',()=>{
  assert.deepEqual(contract.frozenGraph.newRequiredEdges,[]);
  assert.equal(pair.otherPersisted.DailyMissionsModel.changed,1);
  assert.equal(pair.otherPersisted.BlackboardValues.changed,1);
  assert.equal(pair.otherPersisted.RewardManagerTraitModel.claimMarkerVerified,false);
  assert.ok(contract.changedDependencies.filter(e=>e.classification==='UNKNOWN').length>=3);
});
