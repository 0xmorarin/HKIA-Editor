/// <reference lib="webworker" />
/** Isolated development Worker. No network access or JS Writer. Module supplied as compiled code. */
import {WasmTransport} from './wasm-transport.js';
import {decodeWriter,MAX_ARCHIVE,MAX_FRAME} from './writer-abi.js';
const worker=self as unknown as DedicatedWorkerGlobalScope;
let state:'new'|'init'|'ready'|'dead'='new',transport:WasmTransport|null=null,busy=false;
const fatal=()=>{state='dead';transport=null;worker.postMessage({type:'fatal'});worker.close()};
const eq=(a:Uint8Array,b:Uint8Array)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
worker.onmessage=async(e:MessageEvent)=>{const d=e.data;try{if(state==='dead')return;if(d?.type==='init'){if(state!=='new'||!(d.module instanceof WebAssembly.Module)||!(d.runtime instanceof Uint8Array))throw Error('INIT');state='init';transport=await WasmTransport.create(d.module,d.runtime);state='ready';worker.postMessage({type:'ready'});return}if(state!=='ready'||!transport||busy)throw Error('BUSY_OR_NOT_READY');if(d?.type!=='call'||!(d.frame instanceof Uint8Array)||d.frame.length<78||d.frame.length>MAX_FRAME||!(d.input===null||d.input instanceof Uint8Array)||d.input?.length>MAX_ARCHIVE)throw Error('RPC');busy=true;const {meta,output,memoryBytes}=transport.invoke(d.frame,d.input);if(output){const r=decodeWriter(meta);if(!r.result.ok||(r.result.payload.tag!==5&&r.result.payload.tag!==6)||r.result.payload.bytes!==output.length)throw Error('OUTPUT');const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',output));if(!eq(digest,r.result.payload.digest))throw Error('OUTPUT_DIGEST')}const transfers:Transferable[]=[meta.buffer];if(output)transfers.push(output.buffer);worker.postMessage({type:'reply',meta,output,memoryBytes},transfers);busy=false}catch{fatal()}};
