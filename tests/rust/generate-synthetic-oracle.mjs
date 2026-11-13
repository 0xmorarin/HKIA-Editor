// Run only against pinned V18 reference source; all fixtures are synthetic.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const [root,out]=process.argv.slice(2);if(!root||!out)throw Error('V18_ROOT OUTPUT_FIXTURE_DIRECTORY required');
const load=relative=>import(pathToFileURL(path.join(root,relative)).href);
const {payload,envelope}=await load('tests/helpers/04-native-schema-source.mjs');
const {fixture}=await load('tests/helpers/04-puzzle-goals-source.mjs');
const {MAGIC}=await load('src/save.js');
const {lz4EncodeBoundedMatch}=await load('scripts/research/lz4-match-encoder.mjs');
const {lz4EncodeLiteralOnly}=await load('scripts/research/save-envelope-noop.mjs');
const {readSchemaNativeSlotResearch:read}=await load('scripts/research/save-transaction-engine.mjs');
const marker=Buffer.from(MAGIC);const cat=(...p)=>Buffer.concat(p.map(x=>Buffer.from(x)));const b=(...v)=>Buffer.from(v);const prefix=Buffer.from(envelope(payload()).subarray(0,32));
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n);return b;};
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b;};
const pack=(p,version='3.0.1',chunkSize=32768,encode=lz4EncodeLiteralOnly)=>{
 const original=Buffer.from(fixture(version).slotBytes);prefix.copy(original);const header=original.subarray(0,original.indexOf(marker));
 const chunks=[];for(let i=0;i<p.length;i+=chunkSize)chunks.push(p.subarray(i,i+chunkSize));
 const count=chunks.length+1;const ah=count<16?b(0x90|count):cat(b(0xdc),u16(count));
 const lengths=cat(...chunks.map(x=>cat(b(0xce),u32(x.length))));
 return cat(header,marker,ah,b(0xc8),u16(lengths.length),b(98),lengths,...chunks.map(x=>{const c=encode(x);return cat(b(0xc6),u32(c.length),c)}));
};
const cases=[];fs.mkdirSync(out,{recursive:true});
function add(name,raw,ok,decoded=null){
 let state,error;try{state=read(raw)}catch(e){error=e.message;}
 assert.equal(Boolean(state),ok,`${name}: ${error}`);
 const file=name+'.bin';fs.writeFileSync(path.join(out,file),raw);
 if(state){assert(decoded);fs.writeFileSync(path.join(out,name+'.decoded'),decoded);}
 cases.push({name,ok,error:error??null,rawBytes:raw.length,decodedBytes:decoded?.length??null,expected:state?{documents:state.stats.documents,achievements:state.achievements,counters:state.counters,collections:state.collectionHistoryEntries,deprecated:state.collections.deprecatedEntries,dictionaryEntries:state.stats.dictionaryEntries,models:[...state.models.values()].map(({id,tag,guid,spans})=>({id,tag,guid,spans:spans.map(({start,end})=>[start,end])})),collectionSpans:[...state.collectionSpans.entries()].map(([id,{start,end}])=>[id,start,end])}:null});
}
for(const v of ['3.0.0','3.0.1']){const p=payload({version:v});add('valid-'+v,pack(p,v),true,p);}
const p=payload({collectionEntries:[[1,-(1n<<63n)],[2,9007199254740993n],[3,(1n<<63n)-1n]]});add('exact-ticks-multiblock',pack(p,'3.0.1',23),true,p);
add('match-compression',pack(p,'3.0.1',65536,lz4EncodeBoundedMatch),true,p);
const base=payload();
const ts=cat(b(0xc7,12,0xff),u32(123456700),Buffer.from('00000000684ee180','hex'));
const guid=(...w)=>cat(...w.map(x=>cat(b(0xce),u32(x))));
const countFields=cat(b(0x93,0xa1,0x61,0xa1,0x61,0xa1,0x62),b(0x93),guid(1,2,3,4),guid(1,2,3,4),guid(1,2,3,5));
const complex=cat(base.subarray(0,50),ts,base.subarray(51,81),countFields,base.subarray(83));
add('counted-guid-duplicates-and-time',pack(complex),true,complex);
add('nil-counter-string',pack(cat(base.subarray(0,81),b(0x91,0xc0),base.subarray(82))),false);
add('invalid-native-timestamp',pack(cat(base.subarray(0,50),b(0xc7,12,0xff),u32(123456701),Buffer.from('00000000684ee180','hex'),base.subarray(51))),false);
for(const k of ['duplicateHash','duplicateCompound','duplicateInt','duplicateDoc','unknown','appended','floatKey'])add(k,pack(payload({[k]:true})),false);
add('payload-tail',pack(cat(payload(),b(0))),false);
add('payload-version-mismatch',pack(payload({version:'3.0.0'}),'3.0.1'),false);
const raw=pack(payload()); const m=raw.indexOf(marker);const body=m+marker.length;
add('envelope-tail',cat(raw,b(0)),false);add('truncated',raw.subarray(0,-1),false);add('duplicate-marker',cat(raw,marker),false);
const mod=(name,at,val)=>{const x=Buffer.from(raw);x[at]=val;add(name,x,false);};
mod('prefix-mismatch',0,raw[0]^1);mod('invalid-array',body,0xc0);mod('invalid-ext-type',body+4,97);mod('invalid-size-zero',body+5,0); // first length integer token becomes 0
mod('invalid-marker',m,raw[m]^1);mod('invalid-header-width',32,0x97);
const audit=JSON.stringify({reference:'V18 JS readSchemaNativeSlotResearch',cases},null,2)+'\n';fs.writeFileSync(path.join(out,'oracle.json'),audit);
console.log(JSON.stringify({cases:cases.length,accepted:cases.filter(x=>x.ok).length,rejected:cases.filter(x=>!x.ok).length,syntheticOnly:true}));
