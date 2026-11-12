import {losslessWebpDimensions} from './lossless-webp.mjs';
import {verifySource,verifyDist} from './pages-artifact-policy.mjs';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
verifySource(new URL('../',import.meta.url).pathname);
const data=x=>JSON.parse(readFileSync(new URL(x,root)));
const texts=data('data/local-achievement-locales.json');const col=data('data/collections.json'),details=data('data/collection-definitions.json'),ach=data('data/achievement-definitions.json'),slot=data('data/slot-definitions.json'),itemIndex=data('data/item-collection-crosswalk.json'),parentIndex=data('data/item-parent-crosswalk.json'),localIndex=data('data/local-achievement-definitions.json');
assert.equal(col.length,25);assert.equal(details.length,181);assert.equal(ach.length,31);assert.equal(slot.schema,'HKIA.SlotDefinitionCrosswalk.1');assert.equal(slot.counters.length,851);assert.equal(slot.achievement_references.length,820);assert.equal(itemIndex.schema,'HKIA.ItemCollectionCrosswalk.1');assert.equal(itemIndex.items.length,12163);assert.equal(itemIndex.counts.mapped_to_collection,10262);assert.equal(parentIndex.schema,'HKIA.ItemParentCrosswalk.1');assert.equal(parentIndex.links.length,5170);assert.equal(parentIndex.counts.unique_parents,445);assert.equal(localIndex.schema,'HKIA.LocalAchievementIndex.1');assert.equal(localIndex.records.length,820);assert.equal(localIndex.counts.rewards_positive,264);assert.equal(localIndex.counts.rewards_zero,556);assert.equal(localIndex.counts.rewards_unique_items,77);assert.equal(texts.schema,'HKIA.LocalAchievementLocales.1');assert.equal(texts.records.length,820);assert.equal(texts.counts.ja_titles,820);assert.equal(texts.counts.en_titles,820);assert.equal(texts.counts.ja_descriptions,720);assert.equal(texts.counts.en_descriptions,720);
let names=new Set(),guids=new Set();for(const c of col){assert(!names.has(c.key));names.add(c.key);assert(!guids.has(c.guid));guids.add(c.guid);assert.equal(details.filter(x=>x.group===c.key).length,c.count);const path=new URL(c.icon.replace(/^\.\//,''),root);const bytes=readFileSync(path);assert.match(c.icon,/\.webp$/);const {width,height,codec}=losslessWebpDimensions(bytes);assert.equal(codec,'VP8L');assert.equal(width,c.width);assert.equal(height,c.height);}
const dist=new URL('../dist/',import.meta.url);
if(existsSync(dist)){const banned=[];function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.save$|\.lbak$|\.bak$|\.zip$|settings\.json$|\.scratch/i.test(e.name))banned.push(p);}}walk(dist.pathname);assert.deepEqual(banned,[]);}
console.log('PASS: 25 valid lossless WebP category icons, 181 matching definitions, 31 Meta achievements, 851 counter IDs, 820 achievement references, 12163 item IDs, 5170 parent links, 820 local-achievement definitions with 264 item rewards, 820 localized titles in JA and EN, no private save fixtures');

if(existsSync(dist))verifyDist(dist.pathname);
