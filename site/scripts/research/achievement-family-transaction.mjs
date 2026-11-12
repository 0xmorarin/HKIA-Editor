   
                                                                            
                                                                                   
                                                                                        
                                                                                 
                                                                                   
                                                                                 
                                                                             
   
import {MAGIC,MessagePackReader,lz4Decompress,readSave} from '../../src/save.js';
import {lz4EncodeLiteralOnly} from './save-envelope-noop.mjs';
const M32=32768,GUID=/^[0-9a-f]{8}(?::[0-9a-f]{8}){3}$/i;
function assert(ok,msg){if(!ok)throw new Error(msg);}
function concat(parts){const result=new Uint8Array(parts.reduce((n,x)=>n+x.length,0));let at=0;for(const p of parts){result.set(p,at);at+=p.length;}return result;}
function u16(n){return Uint8Array.of(n>>>8&255,n&255);}
function u32(n){return Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);}
function packArray(n){return n<16?Uint8Array.of(0x90|n):n<=65535?concat([Uint8Array.of(0xdc),u16(n)]):concat([Uint8Array.of(0xdd),u32(n)]);}
function packBin(x){return concat([Uint8Array.of(0xc6),u32(x.length),x]);}
function encodeLengths(lengths){const raw=concat(lengths.map(n=>concat([Uint8Array.of(0xcd),u16(n)])));assert(raw.length<=65535,'Length ext overflow');return concat([Uint8Array.of(0xc8),u16(raw.length),Uint8Array.of(98),raw]);}
function findMarker(raw){let found=-1;for(let i=32;i<=raw.length-MAGIC.length;i++){let good=true;for(let j=0;j<MAGIC.length;j++)if(raw[i+j]!==MAGIC[j]){good=false;break;}if(good){assert(found<0,'Multiple LZ4 markers');found=i;}}assert(found>32,'LZ4 marker missing');return found;}
function extractEnvelope(raw){
  const marker=findMarker(raw),r=new MessagePackReader(raw.subarray(marker+MAGIC.length));
  const op=r.u8();const count=(op&0xf0)===0x90?op&15:op===0xdc?r.u16():op===0xdd?r.u32():-1;
  assert(count>=2&&count<=4097,'Invalid block count');
  const ext=r.read();assert(ext?.__ext===98,'Missing length stream');
  const lengths=[],l=new MessagePackReader(ext.bytes);while(l.p<l.b.length)lengths.push(l.read());
  assert(lengths.length===count-1&&lengths.every(x=>Number.isInteger(x)&&x>0&&x<=M32),'Invalid LZ4 lengths');
  const parts=[];for(const n of lengths){const compressed=r.read();assert(compressed instanceof Uint8Array,'Invalid LZ4 block');parts.push(lz4Decompress(compressed,n));}
  assert(r.p===r.b.length,'Unexpected LZ4 tail');return {marker,parts,expanded:concat(parts),lengths};
}
function encodeBody(prefix,joined){
  const parts=[];for(let off=0;off<joined.length;off+=M32)parts.push(joined.subarray(off,Math.min(off+M32,joined.length)));
  const lengths=parts.map(x=>x.length);
  const wrapper=concat([packArray(parts.length+1),encodeLengths(lengths),...parts.map(x=>packBin(lz4EncodeLiteralOnly(x)))]);
  return concat([prefix,MAGIC,wrapper]);
}
function float32Bytes(n){assert(typeof n==='number'&&Number.isFinite(n)&&n>=0&&Math.fround(n)===n,'Not an exact nonnegative float32');const b=new Uint8Array(4);new DataView(b.buffer).setFloat32(0,n,false);return b;}
function timestampBytes(iso){
  assert(typeof iso==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{7}Z$/.test(iso),'Timestamp requires UTC and seven fractional digits');
  const m=/^(.*\.)(\d{7})Z$/.exec(iso);const base=m[1]+'000Z';const secs=Date.parse(base)/1000;
  assert(Number.isInteger(secs)&&secs>=0&&secs<2**34&&new Date(secs*1000).toISOString()===m[1]+'000Z','Invalid timestamp');
  const nanos=Number(m[2])*100;assert(nanos>=0&&nanos<1e9,'Timestamp nanos out of range');
  const word=BigInt(nanos)<<34n|BigInt(secs);const bytes=new Uint8Array(10);bytes[0]=0xd7;bytes[1]=0xff;new DataView(bytes.buffer).setBigUint64(2,word,false);return bytes;
}
function locateRecords(expanded){
  const r=new MessagePackReader(expanded),out=new Map();
  while(r.p<r.b.length){
    const token=r.read();
    if(!Array.isArray(token)||token.length!==2||!Number.isInteger(token[0])||![16,17].includes(token[0])||!Array.isArray(token[1])||token[1].length!==3)continue;
    const [id,w0,w1]=token[1],w2=r.read(),w3=r.read(),fieldStart=r.p,fields=r.read();
    const words=[w0,w1,w2,w3];assert(Number.isInteger(id)&&words.every(x=>Number.isInteger(x)&&x>=0&&x<=0xffffffff),'Invalid record identity');
    assert(Array.isArray(fields)&&fields.length===3,'Invalid record fields');
    const guid=words.map(x=>x.toString(16).padStart(8,'0')).join(':');
    const sub=new MessagePackReader(expanded.subarray(fieldStart,r.p));
    assert(sub.u8()===0x93,'Expected array3 fields');
    const positions=[];
    for(let j=0;j<3;j++){const start=fieldStart+sub.p;const value=sub.read();positions.push({start,end:fieldStart+sub.p,value});}
    assert(sub.p===sub.b.length,'Unparsed record field');
    if(token[0]===17){assert(Array.isArray(fields[2]),'Invalid CountedGuids');for(let j=0;j<fields[2].length*3;j++)r.read();}
    const key=token[0]+'/'+guid;assert(!out.has(key),'Duplicate saved GUID');out.set(key,{id,guid,fields,positions});
  }
  return out;
}
function editPlan(before,localDefs,slotDefs,leafKey,completedAt){
  assert(localDefs?.records?.length===820&&Array.isArray(slotDefs?.achievement_references)&&Array.isArray(slotDefs?.counters),'Expected source catalog');
  const leaf=localDefs.records.find(x=>x.key===leafKey);assert(leaf,'Unknown leaf');
  assert(leaf.counter_kind==='GameCounterManualDefinition'&&leaf.threshold>0,'Not a manual count leaf');
  const relation=slotDefs.achievement_references.find(x=>x.guid===leaf.guid);assert(relation,'Leaf group missing');
  const parent=localDefs.records.find(x=>x.counter_guid===relation.group_counter_guid);assert(parent&&parent.counter_kind==='GameCounterAchievementsDefinition','Parent is not a saved achievement group');
  const group=slotDefs.counters.find(x=>x.guid===relation.group_counter_guid);assert(group&&group.reference_count>=2,'Group definition invalid');
  const members=slotDefs.achievement_references.filter(x=>x.group_counter_guid===group.guid);assert(members.length===group.reference_count,'Group member count mismatch');
  const ach=new Map(before.achievements.map(x=>[x.guid.toLowerCase(),x]));const cnt=new Map(before.counters.map(x=>[x.guid.toLowerCase(),x]));
  const aLeaf=ach.get(leaf.save_guid),aParent=ach.get(parent.save_guid),cLeaf=cnt.get(leaf.counter_save_guid),cGroup=cnt.get(parent.counter_save_guid);
  assert(aLeaf&&aParent&&cLeaf&&cGroup,'Missing saved slot record');
  assert(!aLeaf.complete&&!aParent.complete&&aLeaf.completed===null&&aParent.completed===null,'Already-complete/dated achievement');
  assert(aLeaf.current===cLeaf.current&&aLeaf.current<leaf.threshold,'Leaf progress mismatch');
  assert(cLeaf.countedGuids===0&&cLeaf.countedValues===null,'Leaf counter has extra state');
  assert(cGroup.countedGuids===0&&cGroup.countedValues===null,'Group counter has extra state');
  const found=members.map(m=>ach.get(m.save_guid));assert(found.every(Boolean),'Missing sibling achievement');
  const oldComplete=found.filter(a=>a.complete).length;
  assert(found.filter(a=>!a.complete).length===1&&found.find(a=>!a.complete)?.guid===leaf.save_guid,'Not the sole incomplete group member');
  assert(oldComplete===aParent.current&&oldComplete===cGroup.current,'Group counter not reconciled');
  const newComplete=members.length;
  const rootParents=slotDefs.achievement_references.filter(x=>x.guid===parent.guid);
  assert(rootParents.length===1,'Unexpected ancestor count');
  const rootCounter=slotDefs.counters.find(c=>c.guid===rootParents[0].group_counter_guid);
  assert(rootCounter?.storage==='Meta'&&rootCounter.kind==='AchievementsCounter','Ancestor is not Meta root');
  const rootMembers=slotDefs.achievement_references.filter(x=>x.group_counter_guid===rootCounter.guid);
  assert(rootMembers.length===rootCounter.reference_count,'Meta root member count mismatch');
  const rootCount=rootMembers.filter(m=>ach.get(m.save_guid)?.complete).length;
  assert(rootCount<rootCounter.reference_count,'Meta root already complete');
  return {leaf,parent,cLeaf,cGroup,aLeaf,aParent,rootCount,rootCounter,groupMembers:members.length,newComplete,oldComplete,completedAt};
}
function assertOtherModelsSame(before,after,allowedAch,allowedCounters){
  assert(before.version===after.version,'Version changed');
  assert(before.achievements.length===after.achievements.length&&before.counters.length===after.counters.length,'Record count changed');
  assert(before.collections.historyEntries===after.collections.historyEntries&&before.collections.deprecatedEntries===after.collections.deprecatedEntries,'Collection count changed');
  assert(before.collectedItemIds.length===after.collectedItemIds.length&&before.collectedItemIds.every((v,i)=>v===after.collectedItemIds[i]),'Collection IDs changed');
  assert(JSON.stringify(before.meta.header)===JSON.stringify(after.meta.header),'Header changed');
  const oldA=new Map(before.achievements.map(x=>[x.guid,x]));
  for(const a of after.achievements){const old=oldA.get(a.guid);assert(old&&a.id===old.id,'Achievement identity changed');if(!allowedAch.has(a.guid))assert(JSON.stringify(a)===JSON.stringify(old),'Unrelated AchievementModel changed');}
  const oldC=new Map(before.counters.map(x=>[x.guid,x]));
  for(const c of after.counters){const old=oldC.get(c.guid);assert(old&&c.id===old.id&&c.countedGuids===old.countedGuids&&JSON.stringify(c.countedValues)===JSON.stringify(old.countedValues),'Counter identity/state changed');if(!allowedCounters.has(c.guid))assert(c.current===old.current,'Unrelated GameCounterModel changed');}
}
function verifyAccountRoot(account,metaDefs,rootCounter,rootCount){
  const root=metaDefs.find(x=>x.key==='Local_RootAchievement');
  assert(root&&root.counter_guid===rootCounter.guid&&root.built_in_references===rootCounter.reference_count,'Root Meta definition mismatch');
  const accAch=account?.Achievements?.[root.guid],accCounter=account?.Counters?.[root.counter_guid];
  assert(accAch&&accCounter,'Account root record missing');
  assert(accCounter.CurrentValue===rootCount&&accAch.CurrentValue===rootCount&&!accAch.IsComplete&&accAch.CompletedTime===null,'Account root value does not equal complete members');
                                                                            
                                                                              
  const originalJson=JSON.stringify(account),copy=JSON.parse(originalJson);
  copy.Achievements[root.guid].CurrentValue=rootCount+1;
  copy.Counters[root.counter_guid].CurrentValue=rootCount+1;
  assert(copy.Achievements[root.guid].IsComplete===false&&copy.Achievements[root.guid].CompletedTime===null,'Meta root must remain incomplete');
  assert(JSON.stringify(account)===originalJson,'Private Account object was modified');
  const reverse=JSON.parse(JSON.stringify(copy));
  reverse.Achievements[root.guid].CurrentValue=rootCount;
  reverse.Counters[root.counter_guid].CurrentValue=rootCount;
  assert(JSON.stringify(reverse)===originalJson,'Unrelated Account setting changed');
  return {before:rootCount,after:rootCount+1,achievementGuid:root.guid,counterGuid:root.counter_guid,accountSimulationVerified:true,accountMutationPerformed:false};
}
                                                                         
                                                                                
export function planAchievementFamilySemanticFromDecodedResearch(decoded,localDefs,slotDefs,metaDefs,account,{leafKey,completedAt}){
  const planned=editPlan(decoded,localDefs,slotDefs,leafKey,completedAt);
  timestampBytes(completedAt);
  const accountImpact=verifyAccountRoot(account,metaDefs,planned.rootCounter,planned.rootCount);
  return Object.freeze({changes:8,beforeGroup:planned.oldComplete,afterGroup:planned.newComplete,
    groupKey:planned.parent.key,rootMetaCounter:accountImpact});
}
   
                                                                                
                                                                           
   
export function probeAchievementFamilyTransaction(input,localDefs,slotDefs,metaDefs,account,{leafKey,completedAt}){
  const raw=input instanceof Uint8Array?input:new Uint8Array(input);const sourceCopy=raw.slice();
  const original=readSave(raw);const planned=editPlan(original,localDefs,slotDefs,leafKey,completedAt);
  const accountImpact=verifyAccountRoot(account,metaDefs,planned.rootCounter,planned.rootCount);
  const timeBytes=timestampBytes(completedAt),env=extractEnvelope(raw),positions=locateRecords(env.expanded),hunks=[];
  function hunk(tag,guid,id,index,expected,bytes,label){
    assert(GUID.test(guid),'Bad source GUID');const record=positions.get(tag+'/'+guid);assert(record&&record.id===id,'Document ID/GUID mismatch: '+label);
    const f=record.positions[index];assert(f&&f.value===expected,'Field precondition mismatch: '+label);
    hunks.push({start:f.start,end:f.end,bytes,label});
  }
  for(const [a,current] of [[planned.aLeaf,planned.leaf.threshold],[planned.aParent,planned.newComplete]]){
    const guid=a.guid;
    hunk(16,guid,a.id,0,false,Uint8Array.of(0xc3),'Achievement.IsComplete');
    hunk(16,guid,a.id,1,a.current,concat([Uint8Array.of(0xca),float32Bytes(current)]),'Achievement.CurrentValue');
    hunk(16,guid,a.id,2,null,timeBytes,'Achievement.CompletedTime');
  }
  for(const [c,next] of [[planned.cLeaf,planned.leaf.threshold],[planned.cGroup,planned.newComplete]]){
    hunk(17,c.guid,c.id,0,c.current,concat([Uint8Array.of(0xca),float32Bytes(next)]),'GameCounter.CurrentValue');
  }
  assert(hunks.length===8,'Transaction must have eight field edits');
  hunks.sort((a,b)=>a.start-b.start);
  let pos=0;const parts=[];let touched=0;
  for(const h of hunks){assert(h.start>=pos&&h.end>h.start&&h.end<=env.expanded.length,'Overlapping edit');parts.push(env.expanded.subarray(pos,h.start));parts.push(h.bytes);pos=h.end;touched++;}
  parts.push(env.expanded.subarray(pos));const newRaw=concat(parts);const encoded=encodeBody(raw.subarray(0,env.marker),newRaw);
  const rewrapped=extractEnvelope(encoded);assert(rewrapped.expanded.length===newRaw.length&&rewrapped.expanded.every((n,i)=>n===newRaw[i]),'LZ4 reframe altered payload');
  assert(raw.subarray(0,env.marker).every((n,i)=>encoded[i]===n),'Opaque prefix changed');
  const after=readSave(encoded);
  assertOtherModelsSame(original,after,new Set([planned.aLeaf.guid,planned.aParent.guid]),new Set([planned.cLeaf.guid,planned.cGroup.guid]));
  for(const [a,next] of [[planned.aLeaf,planned.leaf.threshold],[planned.aParent,planned.newComplete]]){
    const got=after.achievements.find(x=>x.guid===a.guid);assert(got?.complete&&got.current===next&&got.completed===completedAt,'Achievement mutation failed readback');
  }
  for(const [c,next] of [[planned.cLeaf,planned.leaf.threshold],[planned.cGroup,planned.newComplete]]){
    const got=after.counters.find(x=>x.guid===c.guid);assert(got?.current===next,'Counter mutation failed readback');
  }
  assert(raw.every((n,i)=>n===sourceCopy[i]),'Input modified');
  return Object.freeze({version:original.version,leafKey,groupKey:planned.parent.key,changes:touched,
    beforeGroup:planned.oldComplete,afterGroup:planned.newComplete,rootMetaCounter:accountImpact,
    originalExpandedBytes:env.expanded.length,transactedExpandedBytes:newRaw.length,
    diffScope:'two AchievementModels (3 fields each), two GameCounterModels (current only)',
    sourceBytesUnchanged:true,recompressedReadbackVerified:true,unrelatedRecordsVerified:true,
    unknownTokensPreserved:true,saveExported:false,accountMutationPerformed:false,
    gameAccepted:false,writerEnabled:false,rewardsVerified:false,hardwareVerified:false,
    remainingBlockers:['Meta root account must be reconciled in an atomic ZIP transaction','Unverified game-level signature or integrity rules','No Switch reload/save/reboot or reward verification']});
}
