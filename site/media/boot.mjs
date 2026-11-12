import {createPrivateImageResolver} from './private-image-resolver.mjs';
import {registerPrivateImageBytes} from '../src/image-ui.js';
const read=async name=>{const r=await fetch(new URL(name,import.meta.url),{cache:'no-store'});if(!r.ok)throw Error('Game image catalog unavailable');return r.arrayBuffer();};
try{const map=await read('./image-map.json');const overlay=await read('./fallback-image-map.delta.json');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',map)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!=="00764f406aaa993d48c80de5fe477fb827869921259f8140fc7a99f800848a29")throw Error('ImageMap SHA mismatch');await registerPrivateImageBytes(map,overlay,createPrivateImageResolver,"4aa6fb824fefe90527d068661f14c4f38333128e1a51419eb63e2ad548ea820b");}catch(err){console.error('Game image verification failed',err);}
await import('../src/app.js');
