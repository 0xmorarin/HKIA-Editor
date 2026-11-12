import {readFileSync,readdirSync,lstatSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyDist} from './pages-artifact-policy.mjs';
const [rootArg,manifestArg,expectedManifestSha]=process.argv.slice(2);
if(!rootArg||!manifestArg||!expectedManifestSha||!/^\w{64}$/.test(expectedManifestSha))throw Error('Expected site directory, manifest and pinned manifest SHA-256');
const root=resolve(rootArg),sha=b=>createHash('sha256').update(b).digest('hex'),raw=readFileSync(manifestArg);
if(sha(raw)!==expectedManifestSha)throw Error('Manifest SHA mismatch');
const m=JSON.parse(raw);if(m.schema!=='HKIA.BetaArtifactPreparation.1'||!m.files||!Number.isInteger(m.entries))throw Error('Invalid artifact manifest');
const paths=[];function walk(dir){for(const n of readdirSync(dir)){const p=join(dir,n),s=lstatSync(p);if(s.isSymbolicLink())throw Error('Symlink prohibited');if(s.isDirectory())walk(p);else if(s.isFile())paths.push(relative(root,p).replaceAll('\\','/'));else throw Error('Unexpected file type');}}walk(root);
if(paths.length!==m.entries||Object.keys(m.files).length!==paths.length)throw Error('Artifact entry count mismatch');
for(const p of paths){const b=readFileSync(join(root,p)),r=m.files[p];if(!r||r.bytes!==b.length||r.sha256!==sha(b))throw Error('Artifact mismatch: '+p);}
if(paths.filter(p=>p.endsWith('.webp')).length!==m.webp)throw Error('WebP count mismatch');
verifyDist(root);
console.log(JSON.stringify({manifestSha:expectedManifestSha,entries:paths.length,webp:m.webp,verified:true,state:m.state,writer:m.writer}));
