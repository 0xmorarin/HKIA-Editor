import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {payload} from './helpers/04-native-schema-source.mjs';
import {decodeNativePayloadBySchema as decode} from '../scripts/research/save-native-schema-reader.mjs';
import {createCollectionMutationEvidence} from '../src/collection-mutation-semantics.js';
import {planCollectionMembershipResearch,mutateCollectionPayloadResearch,locateCollectionKey1} from '../scripts/research/01-collection-add-remove-contract.mjs';
const read=n=>JSON.parse(readFileSync(new URL('../data/'+n+'.json',import.meta.url)));
const itemManifest=read('item-collection-crosswalk'),definitions=read('collection-definitions'),parentManifest=read('item-parent-crosswalk');
const ids=itemManifest.items.filter(i=>i.collection_key&&definitions.some(d=>d.key===i.collection_key&&!d.requires_group_dlc&&!d.event_source_defined)&&!parentManifest.links.some(p=>p.child_id===i.id&&['cross-collection','unassigned-child'].includes(p.relation))).slice(0,3).map(i=>i.id);
test('exact independent V15 stale Key0 rejection and forged detached decoder',()=>{
const old=payload(),version='3.0.1',parsed=decode(old,version);
const int=n=>{const b=Buffer.alloc(5);b[0]=0xd2;b.writeInt32BE(n,1);return b;};
let current=Buffer.from(old);for(const [j,[id]] of [...parsed.collectionHistoryEntries.entries()].reverse()){const start=parsed.collectionSpans.get(id).start;assert.equal(current[start-1],id);current=Buffer.concat([current.subarray(0,start-1),int(ids[j]),current.subarray(start)]);}
const cur=decode(current,version);assert.equal(cur.collectionDeprecatedEntries.length,2);const key1=locateCollectionKey1(current,cur);const start=key1.start-59;assert.equal(current[start],0x82);
const baseline=Buffer.concat([current.subarray(0,start),Buffer.from([0x80]),current.subarray(key1.start)]),base=decode(baseline,version);assert.equal(base.collectionDeprecatedEntries.length,0);assert.deepEqual(base.collectionHistoryEntries,cur.collectionHistoryEntries);
const ev=d=>createCollectionMutationEvidence({saveVersion:version,historyEntries:d.collectionHistoryEntries,itemManifest,definitions,parentManifest,deprecatedKey0:{state:'PRESENT_MAP',entryCount:d.collectionDeprecatedEntries.length},structuralReadVerified:true});
const req={itemId:ids[2],operation:'add',expectedSaveVersion:version,expectedPresent:false,newTicks:'639283917345487311'};
const plan=planCollectionMembershipResearch(ev(base),req),fresh=planCollectionMembershipResearch(ev(cur),req);assert.equal(plan.codecResearchEligible,true);assert.equal(fresh.codecResearchEligible,false);assert(fresh.blockers.includes('LEGACY_MIGRATION_CONFLICT_UNRESOLVED'));
assert.equal(mutateCollectionPayloadResearch(baseline,base,ev(base),plan,decode).proof.key1Delta,1);
let observed;try{const r=mutateCollectionPayloadResearch(current,cur,ev(cur),plan,decode);const changed=decode(r.payload,version);observed={accepted:true,oldKey0:cur.collectionDeprecatedEntries.length,newKey0:changed.collectionDeprecatedEntries.length,key1Delta:changed.collectionHistoryEntries.length-cur.collectionHistoryEntries.length,writerEnabled:r.proof.writerEnabled,applyAuthorized:r.proof.applyAuthorized};}catch(e){observed={accepted:false};}
console.log(JSON.stringify({baselineKey0:0,currentKey0:2,sameKey1:true,baselinePlanEligible:plan.codecResearchEligible,freshPlanEligible:fresh.codecResearchEligible,freshBlocker:'LEGACY_MIGRATION_CONFLICT_UNRESOLVED',expected:'REJECT',observed}));assert.equal(observed.accepted,false,'STALE_KEY0_PLAN_MUST_REJECT');

assert.throws(()=>mutateCollectionPayloadResearch(current,base,ev(base),plan,decode),/LEGACY_MIGRATION/);
assert.throws(()=>mutateCollectionPayloadResearch(baseline,base,ev(base),{...plan},decode),/UNISSUED/);
});
