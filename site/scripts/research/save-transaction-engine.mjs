   
                                                                     
                                                                                       
                                                                                              
                                                                                                
   
import {MAGIC,MessagePackReader,lz4Decompress,readSave,inspectSaveGameV2Header} from '../../src/save.js';
import {sha256Hex} from './native-browser-primitives.mjs';
import {decodeNativePayloadBySchema,RECIPE_EXPANSION4,RECIPE_EXPANSION23,RECIPE_CELEBRATION5} from './save-native-schema-reader.mjs';
import {lz4EncodeLiteralOnly} from './save-envelope-noop.mjs';
import {lz4EncodeBoundedMatch} from './lz4-match-encoder.mjs';

const GUID=/^[0-9a-f]{8}(?::[0-9a-f]{8}){3}$/i;
const MAX_EXPANDED=45*1024*1024;
const MAX_CHANGES=128;
const MAX_BLOCKS=4096;
function failUnless(condition,msg){if(!condition)throw new Error(msg);}
function copyBytes(raw){if(!(raw instanceof Uint8Array)&&!(raw instanceof ArrayBuffer))throw new TypeError('Save must be byte array');return Uint8Array.from(raw instanceof Uint8Array?raw:new Uint8Array(raw));}
function equal(a,b){return a.length===b.length&&a.every((x,i)=>x===b[i]);}
function join(parts){const length=parts.reduce((n,x)=>n+x.length,0);failUnless(length<=MAX_EXPANDED+8*1024*1024,'Excessive in-memory output');const out=new Uint8Array(length);let at=0;for(const part of parts){out.set(part,at);at+=part.length;}return out;}
function u16(n){return Uint8Array.of(n>>>8&255,n&255);}
function u32(n){return Uint8Array.of(n>>>24&255,n>>>16&255,n>>>8&255,n&255);}
function packArray(n){failUnless(n>1&&n<=MAX_BLOCKS+1,'Invalid LZ4 chunk count');return n<16?Uint8Array.of(0x90|n):n<=65535?join([Uint8Array.of(0xdc),u16(n)]):join([Uint8Array.of(0xdd),u32(n)]);}
function packBin(bytes){return join([Uint8Array.of(0xc6),u32(bytes.length),bytes]);}
function packLengths(lengths){
  const raw=join(lengths.map(n=>{
    failUnless(Number.isSafeInteger(n)&&n>0&&n<=65536,'Invalid LZ4 block length');
    return n<=65535?join([Uint8Array.of(0xcd),u16(n)]):join([Uint8Array.of(0xce),u32(n)]);
  }));
  failUnless(raw.length<=65535,'Length extension overflow');
  return join([Uint8Array.of(0xc8),u16(raw.length),Uint8Array.of(98),raw]);
}
function getMarker(raw){let marker=-1;for(let i=32;i<=raw.length-MAGIC.length;i++){
  if(!equal(raw.subarray(i,i+MAGIC.length),MAGIC))continue;
  failUnless(marker<0,'Duplicate LZ4 signature');marker=i;
}failUnless(marker>32,'Missing LZ4 signature');return marker;}
function extract(raw){
  const marker=getMarker(raw),r=new MessagePackReader(raw.subarray(marker+MAGIC.length));
  const start=r.p,op=r.u8();let count;
  if((op&0xf0)===0x90)count=op&15;else if(op===0xdc)count=r.u16();else if(op===0xdd)count=r.u32();else throw new Error('Invalid LZ4 MessagePack wrapper');
  failUnless(count>=2&&count<=MAX_BLOCKS+1,'Invalid LZ4 block count');const arrayHeader=r.b.slice(start,r.p);
  const extStart=r.p,ext=r.read(),lengthsToken=r.b.slice(extStart,r.p);
  failUnless(ext?.__ext===98,'Missing expected length ext');const lr=new MessagePackReader(ext.bytes),lengths=[];
  while(lr.p<lr.b.length){lengths.push(lr.read());failUnless(lengths.length<=MAX_BLOCKS,'Too many LZ4 length tokens');}
  failUnless(lengths.length===count-1&&lengths.every(n=>Number.isSafeInteger(n)&&n>=1&&n<=65536),'Invalid LZ4 length stream');
  failUnless(lengths.reduce((a,b)=>a+b,0)<=MAX_EXPANDED,'Expanded data too large');
  const tokenBytes=[],blocks=[];
  for(const n of lengths){const at=r.p,compressed=r.read();failUnless(compressed instanceof Uint8Array,'Nonbinary chunk');tokenBytes.push(r.b.slice(at,r.p));blocks.push(lz4Decompress(compressed,n));}
  failUnless(r.p===r.b.length,'Unexpected wrapper tail');
  return {marker,arrayHeader,lengthsToken,tokenBytes,blocks,expanded:join(blocks)};
}
                                                                                
                                                                           
const V2_FORMAT_PREFIX=Uint8Array.from([0x13,0x5b,0x4a,0xa4,0xf7,0x02,0xa4,0x5d,0x1c,0xc5,0x62,0xae,0xb5,0xa3,0x86,0xed,0x5d,0x17,0xe1,0xfd,0x58,0x8f,0x42,0x4d,0xcf,0xc5,0x9d,0x2e,0x14,0x0c,0xf5,0x97]);
function schemaState(raw,env){
  failUnless(raw.length<=25*1024*1024&&equal(raw.subarray(0,32),V2_FORMAT_PREFIX),'Native format signature mismatch');
  const header=inspectSaveGameV2Header(raw,env.marker);
  const decoded=decodeNativePayloadBySchema(env.expanded,header.applicationVersion);
  return {...decoded,meta:{header}};
}
                                                                                       
export function readSchemaNativeSlotResearch(input){const raw=copyBytes(input);return schemaState(raw,extract(raw));}
function readResearchState(raw,env,schemaMode){return schemaMode?schemaState(raw,env):readSave(raw);}
function encode(prefix,expanded){
  const blocks=[];for(let i=0;i<expanded.length;i+=32768)blocks.push(expanded.subarray(i,Math.min(i+32768,expanded.length)));
  failUnless(blocks.length>0&&blocks.length<=MAX_BLOCKS,'Invalid encoded chunk count');
  const packed=join([packArray(blocks.length+1),packLengths(blocks.map(b=>b.length)),...blocks.map(b=>packBin(lz4EncodeLiteralOnly(b)))]);
  return join([prefix,MAGIC,packed]);
}

                                                                    
                                                                                
                                                                               
                                                                              
                                                                             
   
function encodePatchedBlocks(raw,env,changes){
  const lengths=env.blocks.map(b=>b.length),bounds=[0];
  for(const n of lengths)bounds.push(bounds.at(-1)+n);
  failUnless(bounds.at(-1)===env.expanded.length,'Source LZ4 block lengths differ');
  const touched=new Uint8Array(lengths.length);
  for(const c of changes){
    let intersects=0;
    for(let i=0;i<lengths.length;i++){
      if(c.start<bounds[i+1]&&c.end>bounds[i]){touched[i]=1;intersects++;}
    }
    failUnless(intersects>=1,'Changed field lies outside source LZ4 blocks');
  }
  const outputLengths=[],tokens=[];let reused=0,reencoded=0,reusedBytes=0,affectedGroups=0;
  const blockLimit=lengths.some(n=>n>32768)?65536:32768;
  for(let i=0;i<lengths.length;){
    if(!touched[i]){
      outputLengths.push(lengths[i]);tokens.push(env.tokenBytes[i]);
      reused++;reusedBytes+=env.tokenBytes[i].length;i++;continue;
    }
    const startIndex=i;while(i<lengths.length&&touched[i])i++;
    affectedGroups++;
    const first=bounds[startIndex],end=bounds[i],parts=[];
    let cursor=first,groupChanges=0;
    for(const c of changes){
      if(c.start>=end||c.end<=first)continue;
      failUnless(c.start>=first&&c.end<=end&&c.start>=cursor,
        'Unbounded or overlapping cross-block typed change');
      parts.push(env.expanded.subarray(cursor,c.start),c.bytes);
      cursor=c.end;groupChanges++;
    }
    failUnless(groupChanges>=1,'Touched LZ4 region has no typed edits');
    parts.push(env.expanded.subarray(cursor,end));
    const edited=join(parts),sourceGroupLengths=lengths.slice(startIndex,i);
    const outputGroupLengths=edited.length===end-first?sourceGroupLengths:(()=>{
      const result=[];for(let at=0;at<edited.length;at+=blockLimit)result.push(Math.min(blockLimit,edited.length-at));
      return result;
    })();
    let at=0;
    for(const n of outputGroupLengths){
      const block=edited.subarray(at,at+n);at+=n;
      outputLengths.push(n);tokens.push(packBin(lz4EncodeBoundedMatch(block)));reencoded++;
    }
    failUnless(at===edited.length,'Edited LZ4 region length mismatch');
  }
  failUnless(outputLengths.length>=1&&outputLengths.length<=MAX_BLOCKS,'Invalid patched LZ4 block count');
  const exactLengths=outputLengths.length===lengths.length&&outputLengths.every((n,i)=>n===lengths[i]);
  const header=outputLengths.length===env.tokenBytes.length?env.arrayHeader:packArray(outputLengths.length+1);
  const lengthToken=exactLengths?env.lengthsToken:packLengths(outputLengths);
  const encoded=join([raw.subarray(0,env.marker),MAGIC,header,lengthToken,...tokens]);
  return {encoded,reused,reencoded,reusedBytes,originalBlocks:lengths.length,
    outputBlocks:outputLengths.length,modifiedGroups:affectedGroups,
    originalUnmodifiedLz4TokensByteIdentical:reused>0};
}
function normalizeDate(x){
  if(x===null)return null;
  failUnless(typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{7}Z$/.test(x),'UTC timestamp with 7 fractional digits required');
  const milliseconds=x.slice(0,-5)+'Z';                                                                         
  const parsed=Date.parse(milliseconds);failUnless(Number.isFinite(parsed)&&new Date(parsed).toISOString()===milliseconds,'Invalid UTC calendar date');
  return x;
}
function serializeTimestamp(x){
  if(x===null)return Uint8Array.of(0xc0);
  normalizeDate(x);
  const ms=Date.parse(x.slice(0,-5)+'Z'),seconds=Math.floor(ms/1000),nano=Number(x.slice(-8,-1))*100;
  failUnless(seconds>=0&&seconds<2**34&&nano>=0&&nano<1e9,'Timestamp out of range');
  const b=new Uint8Array(10);b.set([0xd7,0xff]);new DataView(b.buffer).setBigUint64(2,BigInt(nano)<<34n|BigInt(seconds),false);return b;
}
function asDate(v){
  if(v===null)return null;
  failUnless(v?.__timestamp===true&&Number.isSafeInteger(v.seconds)&&Number.isInteger(v.nanoseconds)&&v.nanoseconds>=0&&v.nanoseconds<1e9,'Unexpected timestamp token');
  const dt=new Date(v.seconds*1000);failUnless(Number.isFinite(dt.getTime()),'Unsupported date');
  return dt.toISOString().slice(0,-4)+String(v.nanoseconds).padStart(9,'0').slice(0,7)+'Z';
}
function toF32Token(n){
  failUnless(typeof n==='number'&&Number.isFinite(n)&&n>=0&&Math.fround(n)===n,'Value must be exact nonnegative float32');
  const b=new Uint8Array(5);b[0]=0xca;new DataView(b.buffer).setFloat32(1,n,false);return b;
}
function locateModels(expanded){
  const r=new MessagePackReader(expanded),models=new Map();
  while(r.p<r.b.length){
    const tag=r.read();
    if(!Array.isArray(tag)||tag.length!==2||![16,17].includes(tag[0])||!Array.isArray(tag[1])||tag[1].length!==3)continue;
    const [id,w0,w1]=tag[1],w2=r.read(),w3=r.read(),start=r.p,data=r.read();
    failUnless(Number.isSafeInteger(id)&&id>=0&&[w0,w1,w2,w3].every(n=>Number.isInteger(n)&&n>=0&&n<=0xffffffff),'Invalid saved model ID/GUID');
    failUnless(Array.isArray(data)&&data.length===3,'Invalid saved model fields');
    const tokenReader=new MessagePackReader(expanded.subarray(start,r.p));
    failUnless(tokenReader.u8()===0x93,'Unexpected field array encoding');const spans=[];
    for(let j=0;j<3;j++){const fieldStart=start+tokenReader.p,value=tokenReader.read();spans.push({start:fieldStart,end:start+tokenReader.p,value});}
    failUnless(tokenReader.p===tokenReader.b.length,'Unexpected model field tail');
    if(tag[0]===17){failUnless(Array.isArray(data[2])&&data[2].every(n=>Number.isInteger(n)&&n>=0&&n<=0xffffffff),'Invalid counted GUID list');for(let i=0;i<3*data[2].length;i++)failUnless(Number.isInteger(r.read()),'Invalid CountedGuids flattened tail');}
    const guid=[w0,w1,w2,w3].map(n=>n.toString(16).padStart(8,'0')).join(':');const key=tag[0]+'/'+guid;
    failUnless(!models.has(key),'Duplicate saved model GUID');models.set(key,{id,tag:tag[0],guid,spans});
  }
  return models;
}
                                                                                
                                                                              
                                                                               
function locateCollectionHistoryTicks(expanded){
  const reader=new MessagePackReader(expanded),seen=new Map();let found=0,nodes=0;
  function length(kind){
    const op=reader.u8();
    if(kind==='array'){
      if((op&0xf0)===0x90)return op&15;
      if(op===0xdc)return reader.u16();
      if(op===0xdd)return reader.u32();
    }else{
      if((op&0xf0)===0x80)return op&15;
      if(op===0xde)return reader.u16();
      if(op===0xdf)return reader.u32();
    }
    throw new Error('Collection Key1 unexpected MessagePack container type');
  }
  const isArray=()=>{const op=reader.b[reader.p];return (op&0xf0)===0x90||op===0xdc||op===0xdd;};
  const isMap=()=>{const op=reader.b[reader.p];return (op&0xf0)===0x80||op===0xde||op===0xdf;};
  function scan(depth){
    failUnless(depth<=80&&++nodes<=1_000_000,'Collection token scan budget exceeded');
    if(isArray()){
      const count=length('array');failUnless(count<=1_000_000,'Collection array too large');
      if(count===2&&!isArray()&&!isMap()){
        const first=reader.p,possible=reader.read();
        if(possible===39){
          failUnless(++found===1,'Ambiguous duplicate collection union39');
          failUnless(isArray()&&length('array')===2,'Malformed collection union39 fields');
          const deprecated=reader.read();failUnless(deprecated instanceof Map,'Missing deprecated Key0 collection map');
          failUnless(isMap(),'Missing Collection Key1 map');
          const size=length('map');failUnless(size<=1_000_000,'Collection history map too large');
          for(let i=0;i<size;i++){
            const id=reader.read(),start=reader.p,value=reader.read();
            failUnless(Number.isInteger(id)&&id>=-(2**31)&&id<=2**31-1,'Invalid Key1 signed int32 ItemId');
            failUnless(typeof value==='bigint'||Number.isSafeInteger(value),'Invalid Key1 signed int64 ticks');
            const tick=BigInt(value);failUnless(tick>=-(1n<<63n)&&tick<=(1n<<63n)-1n,'Key1 ticks outside int64');
            failUnless(!seen.has(id),'Duplicate Collection ItemId');
            seen.set(id,{start,end:reader.p,value:tick.toString()});
          }
          return;
        }
        reader.p=first;
      }
      for(let i=0;i<count;i++)scan(depth+1);
    }else if(isMap()){
      const count=length('map');failUnless(count<=1_000_000,'Collection nested map too large');
      for(let i=0;i<count;i++){reader.read();scan(depth+1);}
    }else reader.read();
  }
  scan(0);
  failUnless(found===1,'Collection union39 not found');
  return seen;
}
function canonicalInt64Ticks(value){
  failUnless(typeof value==='bigint'||typeof value==='string'&&/^(?:0|-?[1-9][0-9]*)$/.test(value),
    'Collection ticks must be exact bigint or canonical decimal string; number is unsafe');
  const n=BigInt(value);failUnless(n>=-(1n<<63n)&&n<=(1n<<63n)-1n,'Collection ticks out of signed int64 range');
  return n.toString();
}
function parseCollectionTickChange(c,collection,expanded){
  failUnless(c.field==='CollectablesCollectedTime'&&Number.isInteger(c.itemId)&&c.itemId>=-(2**31)&&c.itemId<=2**31-1,
    'Only existing Collection Key1 ItemId ticks are supported');
  failUnless(!Object.hasOwn(c,'guid')&&!Object.hasOwn(c,'documentId'),'Collection history must not invent GUID/Document ID');
  failUnless(Object.hasOwn(c,'expected')&&Object.hasOwn(c,'next'),'Explicit Collection ticks CAS required');
  const span=collection?.get(c.itemId);failUnless(span,'Missing saved Collection Key1 ItemId');
  const expected=canonicalInt64Ticks(c.expected),next=canonicalInt64Ticks(c.next);
  failUnless(span.value===expected,'CAS failed: Collection ticks differ from expected');
  failUnless(next!==expected,'No-change Collection tick edit is not allowed');
  const bytes=new Uint8Array(9);bytes[0]=0xd3;new DataView(bytes.buffer).setBigInt64(1,BigInt(next),false);
  return {start:span.start,end:span.end,bytes,model:'GameCollectionsTraitModel',field:c.field,itemId:c.itemId,expected,next};
}
const FIELD_MAP={AchievementModel:{tag:16,fields:['IsComplete','CurrentValue','CompletedTime']},GameCounterModel:{tag:17,fields:['CurrentValue']}};
function parseChange(c,models,expanded,collection,original){
  failUnless(c&&typeof c==='object'&&!Array.isArray(c),'Invalid field change');
  if(c.model==='InventoryItem'){
    const celebration=RECIPE_CELEBRATION5.some(t=>t.itemId===c.itemId);
    failUnless(celebration?c.scope==='CELEBRATION5':!Object.hasOwn(c,'scope'),'Recipe exact operation scope required');
    const expandedTarget=(celebration||RECIPE_EXPANSION4.some(t=>t.itemId===c.itemId)||RECIPE_EXPANSION23.some(t=>t.itemId===c.itemId));
    const rows=c.itemId===5913958?original?.inventoryRecipeRows:expandedTarget?original?.inventoryRecipeExpansionRows.filter(x=>x.itemId===c.itemId):null;
    failUnless(original?.version==='3.0.1'&&original.collectionDeprecatedEntries.length===0&&rows?.length===1&&c.field==='Quantity'&&(c.itemId===5913958||expandedTarget&&original.collectionVersionNumber===87&&original.recipeExpansionReferences.some(t=>t.itemId===c.itemId&&t.celebrated===(celebration?1:0)&&t.counter===0)&&original.collectionHistoryEntries.some(([id])=>id===c.itemId)),'Recipe exact scope required');
    const r=rows[0];failUnless(r.id===c.documentId&&r.uniqueId===0&&r.uniqueData===null&&r.quantity===c.expected&&((c.expected===0&&c.next===1)||(c.expected===1&&c.next===0)),'Recipe quantity CAS or transition invalid');
    failUnless(r.span.end-r.span.start===1&&expanded[r.span.start]===c.expected,'Recipe quantity token shape');
    return {start:r.span.start,end:r.span.end,bytes:Uint8Array.of(c.next),model:c.model,field:c.field,id:r.id,itemId:c.itemId,expected:c.expected,next:c.next};
  }
  if(c.model==='GameCollectionsTraitModel')return parseCollectionTickChange(c,collection,expanded);
  const schema=FIELD_MAP[c.model];
  failUnless(schema&&schema.fields.includes(c.field),'Unsupported model field; CountedValues/CountedGuids/collection edits are blocked');
  failUnless(typeof c.guid==='string'&&GUID.test(c.guid),'Invalid GUID');
  failUnless(Number.isSafeInteger(c.documentId)&&c.documentId>=0,'Invalid document ID');
  const record=models.get(schema.tag+'/'+c.guid.toLowerCase());
  failUnless(record?.id===c.documentId,'Document ID and GUID do not match the saved record');
                                                                             
                                                                                   
  if(c.model==='GameCounterModel'){
    const legacy=record.spans[1]?.value,guids=record.spans[2]?.value;
    failUnless(legacy===null&&Array.isArray(guids)&&guids.length===0,
      'RELATED counted collection state present; scalar-only counter edit is not authorized');
  }
  const index=schema.fields.indexOf(c.field),span=record.spans[index];
  failUnless(Object.hasOwn(c,'expected')&&Object.hasOwn(c,'next'),'Explicit CAS expected and next values required');
  let observed,bytes;
  if(c.field==='IsComplete'){
    failUnless(typeof c.expected==='boolean'&&typeof c.next==='boolean','IsComplete must be boolean');
    failUnless(span.end-span.start===1&&[0xc2,0xc3].includes(expanded[span.start]),'Unexpected boolean tag');
    observed=span.value;bytes=Uint8Array.of(c.next?0xc3:0xc2);
  }else if(c.field==='CompletedTime'){
    failUnless(c.expected===null||typeof c.expected==='string','Invalid CAS date');
    observed=asDate(span.value);normalizeDate(c.expected);bytes=serializeTimestamp(c.next);
    failUnless(expanded[span.start]===0xc0||[0xd6,0xd7,0xc7].includes(expanded[span.start]),'Unsupported source timestamp encoding');
  }else{
    failUnless(expanded[span.start]===0xca&&span.end-span.start===5,'Unexpected float32 tag; refuse canonicalization');
    toF32Token(c.expected);bytes=toF32Token(c.next);observed=span.value;
  }
  failUnless(observed===c.expected,'CAS failed: saved field differs from expected value');
  failUnless(observed!==c.next,'No-change edit not allowed; use full no-op audit');
  return {start:span.start,end:span.end,bytes,model:c.model,field:c.field,guid:record.guid,id:record.id,expected:c.expected,next:c.next};
}
export function structuralEqual(a,b){
  if(Object.is(a,b))return true;
  if(typeof a!==typeof b||a==null||b==null)return false;
  if(a instanceof Uint8Array&&b instanceof Uint8Array)return equal(a,b);
  if(Array.isArray(a)&&Array.isArray(b))return a.length===b.length&&a.every((v,i)=>structuralEqual(v,b[i]));
  if(a instanceof Map&&b instanceof Map)return a.size===b.size&&[...a].every(([k,v])=>b.has(k)&&structuralEqual(v,b.get(k)));
  if(typeof a==='object'&&typeof b==='object'){
    const ak=Object.keys(a),bk=Object.keys(b);return ak.length===bk.length&&ak.every(k=>Object.hasOwn(b,k)&&structuralEqual(a[k],b[k]));
  }
  return false;
}
                                                                              
                                                                            
function membershipSplices(original,expanded,m){
  const map=original.collectionMap;
  failUnless(map&&map.count===original.collectionHistoryEntries.length&&original.collectionDeprecatedEntries.length===0,'Key1 membership requires empty legacy Key0 and typed map');
  failUnless(m&&['add','remove'].includes(m.operation)&&Number.isInteger(m.itemId)&&m.itemId>=-2147483648&&m.itemId<=2147483647,'Invalid membership request');
  const rows=original.collectionHistoryEntries,old=new Map(rows),add=m.operation==='add',pos=map.pairs.get(m.itemId);
  failUnless(add?!pos&&m.expected===null:!!pos&&old.get(m.itemId)===m.expected,'Membership presence/tick CAS mismatch');
  const next=add?String(m.next):null;
  if(add)failUnless(typeof m.next==='string'&&/^[1-9][0-9]*$/.test(m.next)&&BigInt(m.next)<=3155378975999999999n,'Collection calendar ticks required');
  else failUnless(m.next===null,'Removal must not set ticks');
  const n=map.count+(add?1:-1);failUnless(n>=0&&n<=1000000,'Map count bounds');
  const head=n<16?Uint8Array.of(0x80|n):n<=65535?join([Uint8Array.of(0xde),u16(n)]):join([Uint8Array.of(0xdf),u32(n)]);
  const part=(start,end,bytes)=>({start,end,bytes,model:'GameCollectionsTraitModel',field:'CollectablesCollectedTimeMembership',itemId:m.itemId,expected:m.expected,next});
  let changes;
  if(add){const pair=new Uint8Array(14),v=new DataView(pair.buffer);pair[0]=0xd2;v.setInt32(1,m.itemId);pair[5]=0xd3;v.setBigInt64(6,BigInt(next));
    if(map.count===0)changes=[part(map.start,map.body,join([head,pair]))];
    else{const last=map.pairs.get(rows.at(-1)[0]);changes=[part(map.start,map.body,head),part(last.start,last.end,join([expanded.subarray(last.start,last.end),pair]))];}
  }else changes=[part(map.start,map.body,head),part(pos.start,pos.end,new Uint8Array(0))];
  return {changes,expectedRows:add?[...rows,[m.itemId,next]]:rows.filter(([id])=>id!==m.itemId),delta:add?1:-1};
}
function compareState(before,after,changes,membership=null){
  failUnless(before.version===after.version,'Version changed');
  failUnless(JSON.stringify(before.meta.header)===JSON.stringify(after.meta.header),'Metadata changed');
  failUnless(before.achievements.length===after.achievements.length&&before.counters.length===after.counters.length,'Saved record count changed');
  failUnless(before.collections.historyEntries+(membership?.delta??0)===after.collections.historyEntries&&before.collections.deprecatedEntries===after.collections.deprecatedEntries,'Collection history count changed');
  failUnless(membership?structuralEqual(after.collectionHistoryEntries,membership.expectedRows):equal(before.collectedItemIds,after.collectedItemIds),'Collection history IDs/ticks changed');
  if(before.fullLogicalPayloadConsumed){
    failUnless(after.fullLogicalPayloadConsumed&&structuralEqual(membership?{...before.stats,dictionaryEntries:before.stats.dictionaryEntries+membership.delta,scalarEntries:before.stats.scalarEntries+membership.delta}:before.stats,after.stats),'Native typed dictionary/document structure changed');
    failUnless(structuralEqual(before.collectionDeprecatedEntries,after.collectionDeprecatedEntries),'Collection Key0 changed');
  }
  const collectionChanges=changes.filter(c=>c.model==='GameCollectionsTraitModel');
  if(membership)failUnless(structuralEqual(after.collectionHistoryEntries,membership.expectedRows),'Membership semantic diff mismatch');
  else if(collectionChanges.length===0)failUnless(structuralEqual(before.collectionHistoryEntries,after.collectionHistoryEntries),'Collection Key1 int64 ticks changed');
  else{
    const afterTicks=new Map(after.collectionHistoryEntries);
    failUnless(afterTicks.size===before.collectionHistoryEntries.length,'Collection history ItemId identities changed');
    const edited=new Map(collectionChanges.map(c=>[c.itemId,c]));
    failUnless(edited.size===collectionChanges.length,'Duplicate Collection tick plan ItemId');
    for(const [id,tick] of before.collectionHistoryEntries){
      const target=edited.get(id);
      failUnless(afterTicks.has(id),'Collection ItemId missing after reparse');
      failUnless(afterTicks.get(id)===(target?target.next:tick),'Collection Key1 non-target or edited tick differs');
      if(target)failUnless(tick===target.expected,'Collection tick CAS mismatch after readback');
    }
  }
  const recipeChanges=changes.filter(c=>c.model==='InventoryItem');
  if(recipeChanges.length){
    const c=recipeChanges[0],rows=x=>c.itemId===5913958?x.inventoryRecipeRows:x.inventoryRecipeExpansionRows.filter(r=>r.itemId===c.itemId),b=rows(before),a=rows(after);
    failUnless(recipeChanges.length===1&&b.length===1&&a.length===1&&a[0].id===b[0].id&&a[0].itemId===b[0].itemId&&a[0].uniqueId===b[0].uniqueId&&structuralEqual(a[0].uniqueData,b[0].uniqueData)&&a[0].quantity===c.next,'Recipe readback mismatch');
  }
  const allowed=new Map(changes.map(c=>[c.model+'/'+c.guid+'/'+c.field,c]));
  for(const [models,fields,type] of [[before.achievements,['complete','current','completed'],'AchievementModel'],[before.counters,['current','countedGuids','countedValues','countedGuidWords'],'GameCounterModel']]){
    const afterModels=type==='AchievementModel'?after.achievements:after.counters;
    const afterMap=new Map(afterModels.map(x=>[x.guid,x]));
    for(const old of models){const now=afterMap.get(old.guid);failUnless(now&&now.id===old.id,'Model identity changed');
      for(const field of fields){const named={complete:'IsComplete',current:'CurrentValue',completed:'CompletedTime'}[field]??field;
        const c=allowed.get(type+'/'+old.guid+'/'+named);
        if(c)failUnless(now[field]===c.next,'Changed field failed readback');
        else failUnless(structuralEqual(now[field],old[field]),'Unrelated saved field changed');
      }
    }
  }
}
function baseResult(before,envelope){return {version:before.version,blocks:envelope.blocks.length,originalExpandedBytes:envelope.expanded.length,metadataBytes:envelope.marker,opaquePrefixBytes:32,writerEnabled:false,saveExported:false,signatureVerified:false,integrityVerified:false,hardwareVerified:false,semanticLinkageVerified:false,gameAccepted:false};}
                                                                                       
function auditNativeSlotNoopWithMode(input,schemaMode){
  const raw=copyBytes(input),env=extract(raw),original=readResearchState(raw,env,schemaMode);
  const reconstructed=join([raw.subarray(0,env.marker),MAGIC,env.arrayHeader,env.lengthsToken,...env.tokenBytes]);
  failUnless(equal(raw,reconstructed),'Byte-exact wrapper no-op failed');
  const encoded=encode(raw.subarray(0,env.marker),env.expanded),afterEnv=extract(encoded),after=readResearchState(encoded,afterEnv,schemaMode),expandedAgain=afterEnv.expanded;
  failUnless(equal(env.expanded,expandedAgain),'LZ4 literal-only readback altered decoded tokens');
  compareState(original,after,[]);
  failUnless(equal(raw.subarray(0,env.marker),encoded.subarray(0,env.marker)),'Metadata changed');
  return Object.freeze({...baseResult(original,env),originalFrameByteIdentical:true,typedReparseVerified:true,decodedPayloadByteIdentical:true,unknownTokenBytesPreserved:true,...(schemaMode?{nativeSchemaVerified:true,formatSignatureMatched:true,typedDictionaryStats:original.stats}: {})});
}
                                                                                               
export function auditNativeSlotNoop(input){return auditNativeSlotNoopWithMode(input,false);}
export function auditSchemaNativeSlotNoopResearch(input){return auditNativeSlotNoopWithMode(input,true);}
function runNativeSlotResearchTransaction(input,plan,schemaMode=false){
  const raw=copyBytes(input),env=extract(raw),original=readResearchState(raw,env,schemaMode);
  failUnless(plan&&Array.isArray(plan.changes)&&plan.changes.length<=MAX_CHANGES&&(plan.changes.length>=1||schemaMode&&plan.membership),'Expected 1..128 typed changes or one membership operation');
  failUnless(!plan.membership||schemaMode&&plan.changes.length===0,'Membership cannot mix with scalar changes');
  failUnless(plan.version===original.version,'Plan save version mismatch');
  const modelMap=schemaMode?original.models:locateModels(env.expanded);
  const collection=plan.changes.some(c=>c.model==='GameCollectionsTraitModel')?(schemaMode?original.collectionSpans:locateCollectionHistoryTicks(env.expanded)):null;
  const membership=plan.membership?membershipSplices(original,env.expanded,plan.membership):null;
  const celebrationPlan=plan.changes.some(c=>c.scope==='CELEBRATION5');
  failUnless(!celebrationPlan||schemaMode&&plan.changes.length===1&&plan.changes[0].model==='InventoryItem','Celebration5 single typed change only');
  const changes=membership?membership.changes:plan.changes.map(c=>parseChange(c,modelMap,env.expanded,collection,schemaMode?original:null));
  changes.sort((a,b)=>a.start-b.start);
  const parts=[];let cursor=0;
  for(const c of changes){failUnless(c.start>=cursor&&c.end>c.start,'Duplicate or overlapping field edits');parts.push(env.expanded.subarray(cursor,c.start),c.bytes);cursor=c.end;}
  parts.push(env.expanded.subarray(cursor));const changed=join(parts);
                                                                                         
  const patched=encodePatchedBlocks(raw,env,changes);
  const encoded=patched.encoded;
  failUnless(equal(raw.subarray(0,env.marker),encoded.subarray(0,env.marker)),'Opaque header or metadata changed');
  const recovered=extract(encoded);failUnless(equal(changed,recovered.expanded),'Recompression failed exact token readback');
  const decoded=readResearchState(encoded,recovered,schemaMode);compareState(original,decoded,changes,membership);
  if(celebrationPlan){const a=original.celebrationSpans,b=decoded.celebrationSpans;failUnless(a.length>0&&a.length===b.length&&a.every((x,i)=>x.id===b[i].id&&equal(env.expanded.subarray(x.start,x.end),recovered.expanded.subarray(b[i].start,b[i].end))),'Celebration5 raw tag8 preservation failed');}
                                                                                                    
  let oldCursor=0,newCursor=0;
  for(const c of changes){const n=c.start-oldCursor;failUnless(equal(env.expanded.subarray(oldCursor,c.start),changed.subarray(newCursor,newCursor+n)),'Unknown/non-target token changed');
    oldCursor=c.end;newCursor+=n+c.bytes.length;}
  failUnless(equal(env.expanded.subarray(oldCursor),changed.subarray(newCursor)),'Trailing unknown data changed');
  failUnless(equal(raw,copyBytes(input)),'Original Native input changed during research');
  const proof=Object.freeze({...baseResult(original,env),...(schemaMode?{nativeSchemaVerified:true,formatSignatureMatched:true,typedDictionaryStats:original.stats,fullNativePayloadConsumed:true}:{}),changedFieldCount:membership?1:changes.length,originalExpandedBytes:env.expanded.length,changedExpandedBytes:changed.length,
    changedModels:[...new Set(changes.map(c=>c.model))].sort(),
    originalLz4Blocks:patched.originalBlocks,encodedLz4Blocks:patched.outputBlocks,
    untouchedCompressedLz4BlocksByteIdentical:patched.reused,
    reencodedLz4Blocks:patched.reencoded,modifiedLz4Regions:patched.modifiedGroups,
    copiedUntouchedCompressedTokenBytes:patched.reusedBytes,
    touchedBlockOnlyReencode:true,
    fields:Object.freeze((membership?[changes[0]]:changes).map(c=>Object.freeze({model:c.model,field:c.field,documentId:c.id,guid:c.guid,itemId:c.itemId,expected:c.expected,next:c.next}))),
    copiedAllUneditedTokenBytes:true,opaqueMetadataPreserved:true,readbackVerified:true,originalInputUnmodified:true,...(celebrationPlan?{celebrationTag8RawPreserved:true}:{}),
                                                                                       
    requiresSemanticLinkageApproval:true,requiresCrossStoreAtomicityGate:true});
  return {proof,encoded};
}
export function dryRunNativeSlotTransaction(input,plan){
  return runNativeSlotResearchTransaction(input,plan).proof;
}
export function dryRunSchemaNativeSlotTransactionResearch(input,plan){
  return runNativeSlotResearchTransaction(input,plan,true).proof;
}
                                                                              
                                                                              
                                                                                  
                                                           
   
function verifyNativeSlotCandidateWithMode(sourceSlot,plan,candidateSlot,schemaMode){
  failUnless(NATIVE_SLOT_WRITER_ENABLED===false,'Native writer gate must remain OFF');
  const source=copyBytes(sourceSlot),candidate=copyBytes(candidateSlot);
  const expected=runNativeSlotResearchTransaction(source,plan,schemaMode);
  const sourceEnvelope=extract(source),actualEnvelope=extract(candidate),expectedEnvelope=extract(expected.encoded);
  failUnless(!equal(sourceEnvelope.expanded,actualEnvelope.expanded),'Candidate Native slot contains no requested changes');
  failUnless(equal(source.subarray(0,sourceEnvelope.marker),candidate.subarray(0,actualEnvelope.marker)),
    'Candidate Native prefix or metadata changed');
  failUnless(equal(actualEnvelope.expanded,expectedEnvelope.expanded),
    'Candidate MessagePack differs from exact allowed typed diff');
  const after=readResearchState(candidate,actualEnvelope,schemaMode);
  failUnless(after.version===plan.version,'Candidate Native version changed');
  failUnless(equal(source,copyBytes(sourceSlot))&&equal(candidate,copyBytes(candidateSlot)),
    'Verifier input changed while being checked');
  return Object.freeze({schema:'HKIA.04.NativeCandidateTokenVerify.1',mode:'READ_ONLY_CANDIDATE_AUDIT',
    version:after.version,verifiedFieldCount:expected.proof.changedFieldCount,
    originalHeaderByteIdentical:true,completeExpandedMessagePackExpectedDiffOnly:true,
    unknownTokenBytesPreserved:true,...(expected.proof.celebrationTag8RawPreserved?{celebrationTag8RawPreserved:true}:{}),sourceInputUnmodified:true,candidateInputUnmodified:true,
    nativeAuthenticated:false,gameAccepted:false,writerEnabled:false,outputBytesReturned:false});
}
export function verifyNativeSlotCandidateAgainstPlanReadOnly(sourceSlot,plan,candidateSlot){return verifyNativeSlotCandidateWithMode(sourceSlot,plan,candidateSlot,false);}
export function verifySchemaNativeSlotCandidateAgainstPlanReadOnly(sourceSlot,plan,candidateSlot){return verifyNativeSlotCandidateWithMode(sourceSlot,plan,candidateSlot,true);}
export function materializeSyntheticSlotForInternalLabOnly(input,plan){
  failUnless(NATIVE_SLOT_WRITER_ENABLED===false,'Native Writer unexpectedly enabled');
  const snapshot=copyBytes(input);
  failUnless(snapshot.length>=32&&snapshot.subarray(0,32).every(n=>n===0),
    'Synthetic-only zero prefix required; genuine SaveGameV2 is refused');
  return runNativeSlotResearchTransaction(snapshot,plan).encoded;
}
                                                                                 
                                                                                   
                                                                                          
   
async function runSealedNativeCrossStoreCommitResearch({zipBytes,expectedZipSha256,
  expectedNativeFormatPrefixSha256,localDefs,slotDefs,metaDefs,completedAt,
  leafKey='achievement_puzzlesInTheStars',failAt=null,devOutput=null}={},schemaMode=false){
  failUnless(NATIVE_SLOT_WRITER_ENABLED===false,'Native product writer must be disabled');
  failUnless(devOutput===null||schemaMode,'DEV output requires typed Native schema');
  const {parseZip}=await import('../../src/zip.js');
  const {preparePrivateCrossStoreCommitComponents}=await import('./save-cross-store-dry-run.mjs');
  const {runSealedPrivateNativePairAssembly}=await import('./save-atomic-zip-lab.mjs');
  const {auditNativeZipReadOnly}=await import('./save-archive-preflight.mjs');
  failUnless(typeof expectedZipSha256==='string'&&/^[a-f0-9]{64}$/.test(expectedZipSha256),'Source ZIP revision required');
  failUnless(typeof expectedNativeFormatPrefixSha256==='string'&&/^[a-f0-9]{64}$/.test(expectedNativeFormatPrefixSha256),'Native prefix digest required');
  const original=copyBytes(zipBytes),caller=bytesViewForResearch(zipBytes);
  failUnless(original.length<=60*1024*1024&&(await sha256Hex(original))===expectedZipSha256,'Source ZIP revision CAS mismatch');
  if(schemaMode){const {auditZipRawCopyability}=await import('./save-native-writer-gates.mjs');const layout=await auditZipRawCopyability(original);failUnless(layout.rawMemberCopyLayoutDeterminate,'Unclassified ZIP raw bytes');}else await auditNativeZipReadOnly(original);
  const zip=parseZip(original),slot=await zip.extract('Saves/save_0.save');
  const account=await zip.extract('SettingsAccount/settings.json');
  failUnless(slot&&account&&slot.length>=32,'Native and Account members required');
  failUnless((await sha256Hex(slot.subarray(0,32)))===expectedNativeFormatPrefixSha256,'Pinned Native format prefix CAS mismatch');
  const prepared=preparePrivateCrossStoreCommitComponents({slotBytes:slot,accountJson:account,
    localDefs,slotDefs,metaDefs,completedAt,leafKey,nativeSchema:schemaMode});
  const slotCandidate=runNativeSlotResearchTransaction(slot,prepared.plan,schemaMode);
  failUnless(slotCandidate.proof.changedFieldCount===8&&slotCandidate.proof.opaqueMetadataPreserved,
    'Native codec did not verify exact required changes');
  const proof=await runSealedPrivateNativePairAssembly({zipBytes:original,slotBytes:slotCandidate.encoded,
    accountBytes:prepared.accountBytes,originalSlot:slot,originalAccount:account,
    expectedZipSha256,localDefs,slotDefs,metaDefs,completedAt,leafKey,failAt,nativeSchema:schemaMode,devOutput,plan:prepared.plan});
  failUnless(equal(caller,original),'Caller ZIP mutated during private transaction');
  return Object.freeze({...proof,version:prepared.plan.version,
    nativeOriginalLz4BlockCount:slotCandidate.proof.originalLz4Blocks,
    nativeEncodedLz4BlockCount:slotCandidate.proof.encodedLz4Blocks,
    nativeReencodedLz4Blocks:slotCandidate.proof.reencodedLz4Blocks,
    nativeUnchangedCompressedLz4BlocksPreserved:slotCandidate.proof.untouchedCompressedLz4BlocksByteIdentical,
    nativeUntouchedCompressedTokenBytesCopied:slotCandidate.proof.copiedUntouchedCompressedTokenBytes,
    callerSuppliedPrefixDigestMatched:true,formatSignatureIndependentlyVerified:schemaMode,
    ...(schemaMode?{nativeSchemaVerified:true,typedDictionaryStats:slotCandidate.proof.typedDictionaryStats}:{}),
    formatSignatureIsNotAuthentication:true,gameAccepted:false,
    preflightAndBothMemberCASVerified:true});
}
export async function dryRunSealedNativeCrossStoreCommitResearch(arg){return runSealedNativeCrossStoreCommitResearch(arg,false);}
export async function dryRunSchemaNativeCrossStoreCommitResearch(arg){return runSealedNativeCrossStoreCommitResearch(arg,true);}
function bytesViewForResearch(input){
  failUnless(input instanceof Uint8Array||input instanceof ArrayBuffer,'ZIP byte input required');
  return input instanceof Uint8Array?input:new Uint8Array(input);
}
export const NATIVE_SLOT_WRITER_ENABLED=false;

export async function dryRunSchemaCollectionZipCommitResearch({zipBytes,expectedZipSha256,plan,failAt=null,devOutput=null}={}){
  plan=structuredClone(plan);
  failUnless(Array.isArray(plan?.changes)&&plan.changes.length<=MAX_CHANGES&&(plan.membership&&plan.changes.length===0||plan.changes.length>0&&plan.changes.every(c=>c?.model==='GameCollectionsTraitModel'&&c.field==='CollectablesCollectedTime'||!plan.membership&&((c?.model==='AchievementModel'&&['CompletedTime','CurrentValue'].includes(c.field))||(c?.model==='GameCounterModel'&&c.field==='CurrentValue')||(c?.model==='InventoryItem'&&c.field==='Quantity')))),'Unsupported single-slot typed plan');
  const caller=bytesViewForResearch(zipBytes),source=copyBytes(caller);
  failUnless(source.length<=60*1024*1024&&/^[a-f0-9]{64}$/.test(expectedZipSha256??'')&&await sha256Hex(source)===expectedZipSha256,'Source ZIP revision CAS mismatch');
  const {parseZip}=await import('../../src/zip.js');
  const {auditZipRawCopyability}=await import('./save-native-writer-gates.mjs');
  const layout=await auditZipRawCopyability(source);failUnless(layout.rawMemberCopyLayoutDeterminate,'Unclassified ZIP raw bytes');
  const slot=await parseZip(source).extract('Saves/save_0.save');
  const candidate=runNativeSlotResearchTransaction(slot,plan,true);
  const {runSealedPrivateNativeSlotAssembly}=await import('./save-atomic-zip-lab.mjs');
  const proof=await runSealedPrivateNativeSlotAssembly({zipBytes:source,slotBytes:candidate.encoded,originalSlot:slot,expectedZipSha256,plan,failAt,devOutput});
  failUnless(equal(caller,source),'Caller ZIP mutated during private transaction');
  return proof;
}

                                                                             
                                                
export async function dryRunSchemaGeneralAchievementPairResearch({zipBytes,expectedZipSha256,request,failAt=null,devOutput=null}={}){
  request=structuredClone(request);devOutput=devOutput===null?null:structuredClone(devOutput);const caller=bytesViewForResearch(zipBytes),source=copyBytes(caller);
  failUnless(source.length<=60*1024*1024&&await sha256Hex(source)===expectedZipSha256,'Source ZIP revision CAS mismatch');
  const {parseZip}=await import('../../src/zip.js');
  const {auditZipRawCopyability}=await import('./save-native-writer-gates.mjs');
  failUnless((await auditZipRawCopyability(source)).rawMemberCopyLayoutDeterminate,'Unclassified ZIP raw bytes');
  const z=parseZip(source),slot=await z.extract('Saves/save_0.save'),account=await z.extract('SettingsAccount/settings.json');
  const {prepareGeneralAchievementPairResearch}=await import('./save-cross-store-dry-run.mjs');
  const prepared=await prepareGeneralAchievementPairResearch({slotBytes:slot,accountJson:account,request});
  const candidate=runNativeSlotResearchTransaction(slot,prepared.plan,true);
  const {runSealedPrivateGeneralAchievementPairAssembly}=await import('./save-atomic-zip-lab.mjs');
  const proof=await runSealedPrivateGeneralAchievementPairAssembly({zipBytes:source,slotBytes:candidate.encoded,accountBytes:prepared.accountBytes,originalSlot:slot,originalAccount:account,expectedZipSha256,request,failAt,devOutput});
  failUnless(equal(caller,source),'Caller ZIP changed during general pair');return proof;
}

export async function dryRunSchemaFormalFamilyBatch({zipBytes,expectedZipSha256,keys,failAt=null,devOutput=null}={}){
  keys=structuredClone(keys);devOutput=devOutput===null?null:structuredClone(devOutput);const caller=bytesViewForResearch(zipBytes),source=copyBytes(caller);
  failUnless(source.length<=60*1024*1024&&await sha256Hex(source)===expectedZipSha256,'Source ZIP revision CAS mismatch');
  const {parseZip}=await import('../../src/zip.js');
  const {auditZipRawCopyability}=await import('./save-native-writer-gates.mjs');
  failUnless((await auditZipRawCopyability(source)).rawMemberCopyLayoutDeterminate,'Unclassified ZIP raw bytes');
  const z=parseZip(source),slot=await z.extract('Saves/save_0.save'),account=await z.extract('SettingsAccount/settings.json');
  const {prepareFormalFamilyBatch}=await import('./save-cross-store-dry-run.mjs');
  const prepared=await prepareFormalFamilyBatch({slotBytes:slot,accountJson:account,keys});
  const candidate=runNativeSlotResearchTransaction(slot,prepared.plan,true);
  const {runSealedPrivateFormalFamilyBatchAssembly}=await import('./save-atomic-zip-lab.mjs');
  const proof=await runSealedPrivateFormalFamilyBatchAssembly({zipBytes:source,slotBytes:candidate.encoded,accountBytes:prepared.accountBytes,originalSlot:slot,originalAccount:account,expectedZipSha256,keys,failAt,devOutput});
  failUnless(equal(caller,source),'Caller ZIP changed during formal batch');return proof;
}

export async function dryRunSchemaFormal49({zipBytes,expectedZipSha256,request,failAt=null,devOutput=null}={}){
 request=structuredClone(request);devOutput=devOutput===null?null:structuredClone(devOutput);const caller=bytesViewForResearch(zipBytes),source=copyBytes(caller);
 failUnless(request?.expectedRevision===expectedZipSha256&&source.length<=60*1024*1024&&await sha256Hex(source)===expectedZipSha256,'Source ZIP revision CAS mismatch');
 const {parseZip}=await import('../../src/zip.js');const {auditZipRawCopyability}=await import('./save-native-writer-gates.mjs');
 failUnless((await auditZipRawCopyability(source)).rawMemberCopyLayoutDeterminate,'Unclassified ZIP raw bytes');
 const z=parseZip(source),slot=await z.extract('Saves/save_0.save'),account=await z.extract('SettingsAccount/settings.json');
 const {prepareFormal49}=await import('./save-cross-store-dry-run.mjs');const prepared=await prepareFormal49({slotBytes:slot,accountJson:account,request});
 const candidate=runNativeSlotResearchTransaction(slot,prepared.plan,true);
 const {runSealedPrivateFormal49Assembly}=await import('./save-atomic-zip-lab.mjs');
 const proof=await runSealedPrivateFormal49Assembly({zipBytes:source,slotBytes:candidate.encoded,accountBytes:prepared.accountBytes,expectedZipSha256,request,failAt,devOutput});
 failUnless(equal(caller,source),'Caller ZIP changed during Formal49');return proof;
}
