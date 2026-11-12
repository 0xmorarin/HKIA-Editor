import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve,relative} from 'node:path';
import {javaScriptComments,verifyDist,publicJsonText} from './pages-artifact-policy.mjs';
const [rootArg,outArg]=process.argv.slice(2),root=resolve(rootArg),out=resolve(outArg);
const allowed=new Set([
'contracts/03-linkage-v16-family-persistence.mjs','contracts/03-linkage-v18-recipe-recount.mjs','docs/03-linkage/v18/RECIPE_NATIVE_SOURCE.json','docs/research/01-collection-acquisition-source-v15.json','contracts/03-linkage-delta.json','contracts/03-linkage-v15-operation-causal.mjs','contracts/04-native-commit-gate.mjs',
'docs/02-achievement/ACHIEVEMENT_SCHEMA.json','native-product/api.mjs','native-product/dev-output-policy.mjs','native-product/worker-client.mjs','native-product/worker.mjs',
...['01-collection-acquisition-v15','01-collection-v16-inventory-transition','01-collection-v17-beta-contract','01-collection-add-remove-contract','02-remaining-achievement-v15','achievement-edit-policy','achievement-family-transaction','achievement-group-edit-v3','achievement-mutation-coverage-v14','achievement-semantic-contract','lz4-match-encoder','native-browser-primitives','save-archive-preflight','save-atomic-zip-lab','save-cross-store-dry-run','save-envelope-noop','save-native-candidate-verify','save-native-revision-cas','save-native-schema-reader','save-native-writer-gates','save-transaction-engine'].map(x=>'scripts/research/'+x+'.mjs'),
'scripts/research/native-v301-dbroot-schema.json']);
const strip=s=>{for(const {start,end} of javaScriptComments(s).reverse())s=s.slice(0,start)+s.slice(start,end).replace(/[^\r\n]/g,' ')+s.slice(end);return s;};
const seen=new Set(),todo=['native-product/api.mjs','native-product/worker-client.mjs','native-product/worker.mjs'];
while(todo.length){const p=todo.pop();if(seen.has(p))continue;seen.add(p);if(!allowed.has(p)&&!/^src\/[\w-]+\.js$|^data\/[\w-]+\.json$/.test(p))throw Error('Dependency not approved: '+p);
const raw=readFileSync(resolve(root,p),'utf8'),json=p.endsWith('.json'),s=json?publicJsonText(JSON.stringify(JSON.parse(raw))):strip(raw);
if(!json){for(const match of s.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)['"]([^'"\n]+)['"]/g)){const spec=match[1];if(!spec.startsWith('.'))throw Error('Nonlocal import: '+p);todo.push(relative(root,resolve(root,dirname(p),spec)).replaceAll('\\','/'));}}
if(allowed.has(p)){const dest=resolve(out,p);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,s);}}
if([...allowed].some(p=>!seen.has(p)))throw Error('Unexpected unused allowlist entry');
const resolver=resolve(out,'media/private-image-resolver.mjs');writeFileSync(resolver,strip(readFileSync(resolver,'utf8')));
console.log(JSON.stringify({modules:seen.size,additional:allowed.size,paths:[...seen].sort()}));
verifyDist(out);
