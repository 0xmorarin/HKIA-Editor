import {verifySource,verifyDist,publicJsonText} from './pages-artifact-policy.mjs';
import {cpSync,mkdirSync,rmSync,copyFileSync,writeFileSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
verifySource(root);
const out=join(root,'dist');rmSync(out,{recursive:true,force:true});mkdirSync(out,{recursive:true});
for(const x of ['index.html','.nojekyll'])copyFileSync(join(root,x),join(out,x));
for(const d of ['src','data','assets'])cpSync(join(root,d),join(out,d),{recursive:true});
function sanitizeData(dir){for(const entry of readdirSync(dir,{withFileTypes:true})){const p=join(dir,entry.name);if(entry.isDirectory())sanitizeData(p);else if(entry.isFile()&&p.endsWith('.json')){const raw=readFileSync(p,'utf8'),clean=publicJsonText(raw);if(clean!==raw)writeFileSync(p,clean);}}}
sanitizeData(join(out,'data'));
verifyDist(out);
console.log('Static site built to dist/ using explicit allowlist; no saves or tests copied');
