                                                                               
import {planCollectionMutation,verifyCollectionSemanticDelta} from '../../src/collection-mutation-semantics.js';
import {MessagePackReader} from '../../src/save.js';
const exact = x=>typeof x==='bigint'||typeof x==='string'&&/^-?(0|[1-9][0-9]*)$/.test(x);
const check=(p,m)=>{if(!p)throw new Error(m);};
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
                                                                                               
const issuedPlans=new WeakMap();
const snapshot=e=>JSON.stringify({version:e.saveVersion,catalog:e.catalogVersion,key0:e.deprecatedKey0,history:e.getEntries()});
export function planCollectionMembershipResearch(evidence,request,{sameVersionWitnessIds=[]}={}){
  check(request&&['add','remove'].includes(request.operation),'ADD_REMOVE_ONLY');
  check(request.expectedTicks==null||exact(request.expectedTicks),'EXACT_OLD_TICKS_REQUIRED');
  check(request.newTicks==null||exact(request.newTicks),'EXACT_NEW_TICKS_REQUIRED');
  const draft=planCollectionMutation(evidence,request),row=evidence.getItem(request.itemId),blockers=[...draft.issues];
  if(!evidence.knownFixtureVersion)blockers.push('UNSUPPORTED_VERSION');
  if(evidence.deprecatedKey0.state!=='PRESENT_MAP')blockers.push('KEY0_SHAPE_UNKNOWN');
  if(evidence.deprecatedKey0.entryCount!==0)blockers.push('LEGACY_MIGRATION_CONFLICT_UNRESOLVED');
  if(row.membership!=='SOURCE_ASSIGNED')blockers.push('MEMBERSHIP_NOT_VERIFIED');
  if(request.operation==='add'&&!evidence.catalogVersionMatches&&!sameVersionWitnessIds.includes(request.itemId))blockers.push('CROSS_VERSION_ADD_WITHOUT_WITNESS');
  if(row.sourceDlcGate||row.sourceEventGate)blockers.push('SOURCE_GATE_UNVERIFIED');
  if(row.sourceParentRelation==='cross-collection'||row.sourceParentRelation==='unassigned-child')blockers.push('PARENT_RELATION_UNVERIFIED');
  const plan=Object.freeze({schema:'HKIA.CollectionMembershipResearch.1',draft,codecResearchEligible:!blockers.length,blockers:Object.freeze([...new Set(blockers)]),
    semantics:'HISTORY_ONLY',itemLevelEligibility:'UNKNOWN',gameCompletionVerified:false,nativeAcceptanceVerified:false,writerEnabled:false,applyAuthorized:false});
  issuedPlans.set(plan,{request:Object.freeze({...request}),witnesses:Object.freeze([...sameVersionWitnessIds]),snapshot:snapshot(evidence),row:JSON.stringify(row)});
  return plan;
}
function readHeader(r){const x=r.u8();return (x&0xf0)===0x80?x&15:x===0xde?r.u16():x===0xdf?r.u32():-1;}
function concat(...parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;for(const p of parts){out.set(p,at);at+=p.length;}return out;}
function header(n){check(n>=0&&n<=1000000,'MAP_COUNT_RANGE');if(n<16)return Uint8Array.of(0x80|n);const a=new Uint8Array(n<=65535?3:5);a[0]=n<=65535?0xde:0xdf;const v=new DataView(a.buffer);if(a.length===3)v.setUint16(1,n);else v.setUint32(1,n);return a;}
function pair(id,ticks){const a=new Uint8Array(14),v=new DataView(a.buffer);a[0]=0xd2;v.setInt32(1,id);a[5]=0xd3;v.setBigInt64(6,BigInt(ticks));return a;}
                                                                                
export function locateCollectionKey1(payload,decoded){
 const entries=decoded.collectionHistoryEntries,spans=decoded.collectionSpans;
 check(entries.length>0&&entries.length===spans.size,'NONEMPTY_TYPED_SPANS_REQUIRED');
 const first=spans.get(entries[0][0]),found=[];
 for(let start=Math.max(0,first.start-14);start<first.start;start++){
  try{const r=new MessagePackReader(payload);r.p=start;if(readHeader(r)!==entries.length)continue;const body=r.p,positions=new Map();
   for(const [id,t] of entries){const at=r.p,k=r.read(),s=spans.get(id);check(k===id&&r.p===s.start,'KEY_SPAN_MISMATCH');const val=r.read();check(String(val)===t&&r.p===s.end,'VALUE_SPAN_MISMATCH');positions.set(id,{start:at,end:r.p});}
   found.push({start,body,end:r.p,positions});
  }catch{}
 }
 check(found.length===1,'KEY1_SPAN_NOT_UNIQUE');return found[0];
}
export function mutateCollectionPayloadResearch(payload,decoded,evidence,plan,decode){
 check(plan?.schema==='HKIA.CollectionMembershipResearch.1'&&plan.codecResearchEligible&&!plan.applyAuthorized,'RESEARCH_GATE');
 check(decoded.version===evidence.saveVersion,'VERSION_CAS');
 const draft=plan.draft,old=decoded.collectionHistoryEntries;
 check(JSON.stringify(old)===JSON.stringify(evidence.getEntries()),'PAYLOAD_CAS');
 const issued=issuedPlans.get(plan);check(issued,'UNISSUED_RESEARCH_PLAN');
                                                                          
 const current=decode(payload,decoded.version);
 check(current.version===decoded.version&&JSON.stringify(current.collectionHistoryEntries)===JSON.stringify(old),'PAYLOAD_CAS');
 check(Array.isArray(current.collectionDeprecatedEntries)&&current.collectionDeprecatedEntries.length===0&&
   Array.isArray(decoded.collectionDeprecatedEntries)&&decoded.collectionDeprecatedEntries.length===0&&
   evidence.deprecatedKey0.state==='PRESENT_MAP'&&evidence.deprecatedKey0.entryCount===0,'LEGACY_MIGRATION_CONFLICT_UNRESOLVED');
 check(snapshot(evidence)===issued.snapshot&&JSON.stringify(evidence.getItem(draft.itemId))===issued.row,'STALE_RESEARCH_EVIDENCE');
 const fresh=planCollectionMembershipResearch(evidence,issued.request,{sameVersionWitnessIds:issued.witnesses});
 check(fresh.codecResearchEligible,'STALE_RESEARCH_GATE');
 decoded=current;
 const m=locateCollectionKey1(payload,decoded),add=draft.operation==='add',pos=m.positions.get(draft.itemId);
 check(add?!pos:!!pos,'PRESENCE_CAS');
 const body=add?concat(payload.subarray(m.body,m.end),pair(draft.itemId,draft.after.rawTicks)):concat(payload.subarray(m.body,pos.start),payload.subarray(pos.end,m.end));
 const next=concat(payload.subarray(0,m.start),header(old.length+(add?1:-1)),body,payload.subarray(m.end));
 const parsed=decode(next,decoded.version),n=locateCollectionKey1(next,parsed);
 check(same(payload.subarray(0,m.start),next.subarray(0,n.start))&&same(payload.subarray(m.end),next.subarray(n.end)),'NON_TARGET_BYTES_CHANGED');
 verifyCollectionSemanticDelta(evidence,draft,parsed.collectionHistoryEntries);
 for(const [id,span] of m.positions){if(id===draft.itemId)continue;const other=n.positions.get(id);check(other&&same(payload.subarray(span.start,span.end),next.subarray(other.start,other.end)),'NON_TARGET_PAIR_BYTES_CHANGED');}
 check(JSON.stringify(decoded.collectionDeprecatedEntries,(_,v)=>typeof v==='bigint'?String(v):v)===JSON.stringify(parsed.collectionDeprecatedEntries,(_,v)=>typeof v==='bigint'?String(v):v),'KEY0_CHANGED');
 return {payload:next,proof:{key1Delta:add?1:-1,nonTargetPayloadBytesIdentical:true,key0Preserved:true,reparsed:true,writerEnabled:false,applyAuthorized:false}};
}
