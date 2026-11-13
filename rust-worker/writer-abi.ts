/** HKE1 development Writer protocol. HKS1 remains read-only. No Save ownership. */
import {encodeRequest,sameStamp,decodeReply,SCHEMA_SHA256,type Stamp,type Command,type Reply} from './session-abi.js';
export const MAX_ARCHIVE=60*1024*1024, MAX_FRAME=4096, MAX_META=32*1024;
export type Edit={kind:'history';item:number;old:bigint;next:bigint}|{kind:'progress';achievement:number;counter:number;oldBits:number;nextBits:number};
export type WriterCommand={op:1;edits:readonly Edit[]}|{op:2|3;plan:bigint}|{op:4|5|6|7|8|9};
export type Rpc={kind:'read';command:Command}|{kind:'write';command:WriterCommand};
export type Scalar={kind:1;value:bigint}|{kind:2;value:number};
export type Diff={kind:1|2|3;id:number;guid:readonly number[]|null;start:number;end:number;old:Scalar;next:Scalar;oldSha:Uint8Array};
export type Plan={id:bigint;version:1|2;base:Uint8Array;schema:Uint8Array;fields:Diff[]};
export type Proof={digest:Uint8Array;bytes:number;fields:number;reusedBlocks:number;reencodedBlocks:number;nonTargetFrames:number};
export type WriterPayload={tag:1;plan:Plan}|{tag:2;plan:Plan;proof:Proof}|{tag:3|4;proof:Proof}|{tag:5|6;digest:Uint8Array;bytes:number}|{tag:7;digest:Uint8Array;edited:boolean};
export type WriterReply={id:bigint;stamp:Stamp;result:{ok:true;payload:WriterPayload}|{ok:false;code:number;inputCode:number}};
export type AnyReply=Reply|WriterReply;
const fail=():never=>{throw Error('HKE1_PROTOCOL')};
const MAX64=(1n<<64n)-1n;
const eq=(a:Uint8Array,b:Uint8Array)=>a.length===b.length&&a.every((x,i)=>x===b[i]);
const hex=(b:Uint8Array)=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
function int(n:number,min:number,max:number){if(!Number.isInteger(n)||n<min||n>max)fail();return n}
function ticks(n:bigint){if(typeof n!=='bigint'||n<-(1n<<63n)||n>(1n<<63n)-1n)fail();return n}
function id64(n:bigint){if(typeof n!=='bigint'||n<=0n||n>MAX64)fail();return n}
export function encodeWriter(id:bigint,stamp:Stamp,c:WriterCommand){const h=encodeRequest(id,stamp,{op:3});h.set([72,75,69,49]);h[4]=c.op;let n=0;if(c.op===1){if(!Array.isArray(c.edits)||c.edits.length<1||c.edits.length>128)fail();n=2+c.edits.reduce((a,e)=>a+(e.kind==='history'?21:e.kind==='progress'?17:fail()),0)}else if(c.op===2||c.op===3)n=8;else if(![4,5,6,7,8,9].includes(c.op))fail();const b=new Uint8Array(78+n);b.set(h);const v=new DataView(b.buffer);let p=78;if(c.op===1){v.setUint16(p,c.edits.length,true);p+=2;for(const e of c.edits){if(e.kind==='history'){b[p++]=1;v.setInt32(p,int(e.item,-2147483648,2147483647),true);p+=4;v.setBigInt64(p,ticks(e.old),true);p+=8;v.setBigInt64(p,ticks(e.next),true);p+=8}else{b[p++]=2;for(const x of [e.achievement,e.counter,e.oldBits,e.nextBits]){v.setUint32(p,int(x,0,0xffffffff),true);p+=4}}}}else if(c.op===2||c.op===3)v.setBigUint64(p,id64(c.plan),true);return b}
class R{p=0;v:DataView;constructor(readonly b:Uint8Array){if(b.length>MAX_META)fail();this.v=new DataView(b.buffer,b.byteOffset,b.byteLength)}take(n:number){if(n<0||this.p+n>this.b.length)fail();const p=this.p;this.p+=n;return p}bytes(n:number){const p=this.take(n);return this.b.slice(p,p+n)}u8(){return this.v.getUint8(this.take(1))}u16(){return this.v.getUint16(this.take(2),true)}u32(){return this.v.getUint32(this.take(4),true)}i32(){return this.v.getInt32(this.take(4),true)}u64(){return this.v.getBigUint64(this.take(8),true)}i64(){return this.v.getBigInt64(this.take(8),true)}bool(){const b=this.u8();if(b>1)fail();return b===1}end(){if(this.p!==this.b.length)fail()}}
function readScalar(r:R):Scalar{const kind=r.u8();if(kind===1)return {kind,value:r.i64()};if(kind===2)return {kind,value:r.u32()};return fail()}
function readPlan(r:R):Plan{const id=id64(r.u64()),version=r.u8();if(version!==1&&version!==2)fail();const base=r.bytes(32),schema=r.bytes(32);if(hex(schema)!==SCHEMA_SHA256)fail();const n=r.u16();if(n<1||n>256)fail();const fields:Diff[]=[];let prev=0;for(let i=0;i<n;i++){const kind=r.u8();if(kind!==1&&kind!==2&&kind!==3)fail();const id=kind===1?r.i32():r.u32(),guid=kind===1?null:Array.from({length:4},()=>r.u32()),start=r.u32(),end=r.u32(),old=readScalar(r),next=readScalar(r);if(start<prev||end<=start||old.kind!==(kind===1?1:2)||next.kind!==old.kind||old.value===next.value)fail();prev=end;fields.push({kind:kind as 1|2|3,id,guid,start,end,old,next,oldSha:r.bytes(32)})}return {id,version:version as 1|2,base,schema,fields}}
function readProof(r:R):Proof{const digest=r.bytes(32),bytes=r.u32(),fields=r.u32(),reusedBlocks=r.u32(),reencodedBlocks=r.u32(),nonTargetFrames=r.u32();if(!bytes||bytes>MAX_ARCHIVE||!fields||fields>256||reencodedBlocks===0||reusedBlocks+reencodedBlocks>4096)fail();return {digest,bytes,fields,reusedBlocks,reencodedBlocks,nonTargetFrames}}
export function decodeWriter(b:Uint8Array):WriterReply{const r=new R(b);if(hex(r.bytes(4))!=='484b4531')fail();const id=id64(r.u64()),runtime=r.bytes(16),generation=r.u64(),revision=r.u64(),present=r.bool(),digest=r.bytes(32);if(runtime.every(x=>x===0)||!present&&(revision!==0n||digest.some(x=>x!==0)))fail();const stamp={runtime,generation,revision,source:present?digest:null};let result:WriterReply['result'];if(!r.bool()){const code=r.u8(),inputCode=r.u8();if(code<1||code>10||code===10&&(inputCode<1||inputCode>11)||code!==10&&inputCode!==0)fail();result={ok:false,code,inputCode}}else{const tag=r.u8();let payload:WriterPayload;if(tag===1)payload={tag,plan:readPlan(r)};else if(tag===2)payload={tag,plan:readPlan(r),proof:readProof(r)};else if(tag===3||tag===4)payload={tag,proof:readProof(r)};else if(tag===5||tag===6){const digest=r.bytes(32),bytes=r.u32();if(bytes===0||bytes>MAX_ARCHIVE)fail();payload={tag,digest,bytes}}else if(tag===7)payload={tag,digest:r.bytes(32),edited:r.bool()};else return fail();result={ok:true,payload}}r.end();return {id,stamp,result}}
function clone(s:Stamp):Stamp{return {runtime:s.runtime.slice(),generation:s.generation,revision:s.revision,source:s.source?.slice()??null}}
const WISH=[0x691edeb3,0xf7434408,0x97075486,0x697c5327],COUNTER=[0x609fbbdd,0xe64a948d,0x5691aebb,0x48382d53];
const guidEq=(a:readonly number[]|null,b:readonly number[]|null)=>a===null||b===null?a===b:a.length===b.length&&a.every((v,i)=>v===b[i]);
const scalarEq=(a:Scalar,b:Scalar)=>a.kind===b.kind&&a.value===b.value;
const planEq=(a:Plan,b:Plan)=>a.id===b.id&&a.version===b.version&&eq(a.base,b.base)&&eq(a.schema,b.schema)&&a.fields.length===b.fields.length&&a.fields.every((x,i)=>{const y=b.fields[i];return x.kind===y.kind&&x.id===y.id&&guidEq(x.guid,y.guid)&&x.start===y.start&&x.end===y.end&&scalarEq(x.old,y.old)&&scalarEq(x.next,y.next)&&eq(x.oldSha,y.oldSha)});
const proofEq=(a:Proof,b:Proof)=>eq(a.digest,b.digest)&&a.bytes===b.bytes&&a.fields===b.fields&&a.reusedBlocks===b.reusedBlocks&&a.reencodedBlocks===b.reencodedBlocks&&a.nonTargetFrames===b.nonTargetFrames;
function matchesEdits(plan:Plan,edits:readonly Edit[]){const expected=new Map<string,{guid:readonly number[]|null;old:Scalar;next:Scalar}>();const add=(kind:number,id:number,guid:readonly number[]|null,old:Scalar,next:Scalar)=>{const key=`${kind}:${id}`;if(expected.has(key))fail();expected.set(key,{guid,old,next})};for(const e of edits){if(e.kind==='history')add(1,e.item,null,{kind:1,value:e.old},{kind:1,value:e.next});else{add(2,e.achievement,WISH,{kind:2,value:e.oldBits},{kind:2,value:e.nextBits});add(3,e.counter,COUNTER,{kind:2,value:e.oldBits},{kind:2,value:e.nextBits})}}if(expected.size!==plan.fields.length)fail();for(const f of plan.fields){const key=`${f.kind}:${f.id}`,e=expected.get(key);if(!e||!guidEq(f.guid,e.guid)||!scalarEq(f.old,e.old)||!scalarEq(f.next,e.next))fail();expected.delete(key)}if(expected.size)fail()}
type Working={digest:Uint8Array;proof:Proof|null};
export class RpcGate{
 #stamp:Stamp;#last=0n;#pending:{id:bigint;rpc:Rpc;stamp:Stamp}|null=null;#dead=false;
 #working:Working|null=null;#undo:Working|null=null;#redo:Working|null=null;#plan:Plan|null=null;#preview:Proof|null=null;#verified=false;#kind:1|2|3|null=null;#version:0|1|2=0;#originalBytes=0;
 constructor(runtime:Uint8Array){this.#stamp={runtime:runtime.slice(),generation:0n,revision:0n,source:null};encodeRequest(1n,this.#stamp,{op:3})}
 get stamp(){return clone(this.#stamp)}get busy(){return this.#pending!==null}kill(){this.#dead=true;this.#pending=null;this.clear()}
 private clear(){this.#working=null;this.#undo=null;this.#redo=null;this.#plan=null;this.#preview=null;this.#verified=false;this.#kind=null;this.#version=0;this.#originalBytes=0}
 begin(rpc:Rpc){if(this.#dead||this.#pending)throw Error('HKE1_BUSY_OR_DEAD');const id=id64(this.#last+1n),stamp=this.stamp,frame=rpc.kind==='read'?encodeRequest(id,stamp,rpc.command):encodeWriter(id,stamp,rpc.command);this.#last=id;this.#pending={id,rpc:structuredClone(rpc),stamp};return {id,frame}}
 finish(meta:Uint8Array,output:Uint8Array|null):AnyReply{const p=this.#pending;if(this.#dead||!p)throw Error('HKE1_NO_PENDING');try{
 const r=p.rpc.kind==='read'?decodeReply(meta):decodeWriter(meta);if(r.id!==p.id||!eq(r.stamp.runtime,p.stamp.runtime))fail();
 if(!r.result.ok){if(output||!sameStamp(r.stamp,p.stamp))fail()}
 else if(p.rpc.kind==='read'){
 const c=p.rpc.command,op=c.op,x=(r as Reply).result;if(!x.ok)throw Error('HKE1_PROTOCOL');const v=x.payload;
 const tag=op===1?1:op===2?2:op===3?3:op===4?4:op===13?5:0;if(v.tag!==tag||output)fail();
 if(op===1||op===2){if(r.stamp.generation!==p.stamp.generation+1n||r.stamp.revision!==0n||(op===1)!==(r.stamp.source!==null))fail();if(op===1){if(v.tag!==1||v.summary.kind!==c.kind||!r.stamp.source)throw Error('HKE1_PROTOCOL');this.clear();this.#kind=c.kind;this.#version=v.summary.version;this.#originalBytes=v.summary.sourceBytes;this.#working={digest:r.stamp.source.slice(),proof:null}}else this.clear()}
 else if(!sameStamp(r.stamp,p.stamp))fail();
 if(c.op===3&&(v.tag!==3||v.summary.kind!==this.#kind||v.summary.version!==this.#version))fail();
 if(c.op===4&&(v.tag!==4||v.domain!==c.domain||v.offset!==c.offset||v.rows.length>c.limit))fail();
 if(c.op===13&&(v.tag!==5||v.kind!==c.kind||v.parent!==c.parent||v.offset!==c.offset||v.rows.length>c.limit))fail();
 }else{
 const c=p.rpc.command,op=c.op,w=(r as WriterReply).result;if(!w.ok)throw Error('HKE1_PROTOCOL');const x=w.payload,tag=op>=7?7:op,mut=op===3||op>=7;
 if(x.tag!==tag||r.stamp.generation!==p.stamp.generation||r.stamp.revision!==p.stamp.revision+(mut?1n:0n)||!p.stamp.source||!r.stamp.source||!eq(r.stamp.source,p.stamp.source)||!this.#working)throw Error('HKE1_PROTOCOL');
 const working=this.#working;
 if(x.tag===5||x.tag===6){if(!output||output.length!==x.bytes)fail()}else if(output)fail();
 if(c.op===1&&x.tag===1){if(x.plan.id!==p.id||x.plan.version!==this.#version||!eq(x.plan.base,working.digest))fail();matchesEdits(x.plan,c.edits);this.#plan=structuredClone(x.plan);this.#preview=null}
 else if(c.op===2&&x.tag===2){if(!this.#plan||c.plan!==this.#plan.id||!planEq(x.plan,this.#plan)||x.plan.fields.length!==x.proof.fields||eq(x.proof.digest,working.digest)||(this.#preview&&!proofEq(this.#preview,x.proof)))fail();this.#preview=structuredClone(x.proof)}
 else if(c.op===3&&x.tag===3){if(!this.#plan||c.plan!==this.#plan.id||!this.#preview||!proofEq(x.proof,this.#preview))fail();this.#undo=working;this.#redo=null;this.#working={digest:x.proof.digest.slice(),proof:structuredClone(x.proof)};this.#plan=null;this.#preview=null;this.#verified=false}
 else if(c.op===4&&x.tag===4){if(!working.proof||!proofEq(x.proof,working.proof))fail();this.#verified=true}
 else if(c.op===5&&x.tag===5){if(!this.#verified||!working.proof||!eq(x.digest,working.digest)||x.bytes!==working.proof.bytes)fail();this.#verified=false}
 else if(c.op===6&&x.tag===6){if(!eq(x.digest,p.stamp.source)||x.bytes!==this.#originalBytes)fail()}
 else if(x.tag===7&&(c.op===7||c.op===8||c.op===9)){const restore=c.op===7?this.#undo:c.op===8?this.#redo:{digest:p.stamp.source,proof:null};if(!restore||eq(restore.digest,working.digest)||!eq(x.digest,restore.digest)||x.edited!==(restore.proof!==null))throw Error('HKE1_PROTOCOL');if(c.op===7){this.#undo=null;this.#redo=working}else{this.#undo=working;this.#redo=null}this.#working=restore;this.#plan=null;this.#preview=null;this.#verified=false}
 else fail();
 }
 this.#stamp=clone(r.stamp);this.#pending=null;return r
 }catch(e){this.kill();throw e}}
}
