import {parentPort} from 'node:worker_threads';
const messages=[];globalThis.self={postMessage:m=>parentPort.postMessage(m),addEventListener:(kind,fn)=>{if(kind==='message')messages.push(fn);}};
await import('../../native-product/worker.mjs');
parentPort.on('message',data=>{for(const fn of messages)fn({data});});
