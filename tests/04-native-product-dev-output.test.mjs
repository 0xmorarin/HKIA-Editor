import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';
import {openNativeProductSession} from '../native-product/api.mjs';
import {devPlanDigest} from '../native-product/dev-output-policy.mjs';
import {parseZip} from '../src/zip.js';
import {readSchemaNativeSlotResearch} from '../scripts/research/save-transaction-engine.mjs';
import {payload,envelope} from './helpers/04-native-schema-source.mjs';
import {zipLab} from './helpers/04-zip-lab-source.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
const fixture=()=>Uint8Array.from(zipLab({slotBytesOverride:envelope(payload({migrationVersion:87,emptyKey0:true}))}).zip);
const request=s=>({operation:'collection-key1-ticks',expectedRevision:s.revision,changes:[{itemId:2,expected:'638000000000000001',next:'638000000000000002'}]});
test('shipped DEV output has no authorization, even after verified preview',async()=>{
 const raw=fixture(),s=await openNativeProductSession(raw),p=s.plan(request(s));
 assert.equal(s.capability.devOutput.authorizedOperations.length,0);assert.equal((await s.verifyEditedCopy(p,s.revision)).zipBytesReturned,false);
 await assert.rejects(s.exportDevEditedCopy(p,s.revision),/DEV_NATIVE_OUTPUT_NOT_AUTHORIZED/);
 await assert.rejects(s.exportDevEditedCopy({...p},s.revision),/not issued/);
 await assert.rejects(s.exportDevEditedCopy(p,'0'.repeat(64)),/CAS/);s.close();await assert.rejects(s.exportDevEditedCopy(p,s.revision),/closed/);
});
test('isolated beta build supports different plans without per-save approval, staging and rollback',async()=>{
 const raw=fixture(),before=raw.slice(),tmp=mkdtempSync(join(tmpdir(),'hkia04-beta-output-'));
 try{
  for(const name of ['native-product','scripts','src','contracts','data','docs','package.json'])cpSync(join(root,name),join(tmp,name),{recursive:true});
  const path=join(tmp,'native-product/dev-output-policy.mjs'),text=readFileSync(path,'utf8');assert.ok(text.includes('const BETA_WRITER_ENABLED=false;'));writeFileSync(path,text.replace('const BETA_WRITER_ENABLED=false;','const BETA_WRITER_ENABLED=true;'));
  const {openNativeProductSession:open}=await import(pathToFileURL(join(tmp,'native-product/api.mjs')).href);
  const {assertDevOutputAuthorized:auth}=await import(pathToFileURL(path).href);
  const s=await open(raw),t=s.plan(request(s));assert.equal(t.canExport,true);
  const typed={version:s.version,changes:t.diff.nativeFields};
  await assert.rejects(auth({version:s.version,operation:t.operation,revision:s.revision,source:raw,request:request(s),plan:{...typed,changes:[{...typed.changes[0],next:'638000000000000003'}]}}),/PLAN_MISMATCH/);
  for(const failAt of ['BEFORE_ASSEMBLY','AFTER_ASSEMBLY','AFTER_REPARSE']){await assert.rejects(s.apply(t,s.revision,{failAt}));assert.throws(()=>s.export(s.revision),/No verified/);}
  const applied=await s.apply(t,s.revision);assert.equal(applied.proof.editedCopyBlobReopened,true);assert.equal('file' in applied,false);
  const result=s.export(s.revision);assert.equal(result.schema,'HKIA.04.DevEditedCopy.1');assert.ok(result.file instanceof File);assert.equal(result.file.name,'edited-copy.zip');
  const after=new Uint8Array(await result.file.arrayBuffer());assert.notDeepEqual(after,raw);const old=parseZip(raw),out=parseZip(after);assert.deepEqual(await old.extract('SettingsAccount/settings.json'),await out.extract('SettingsAccount/settings.json'));assert.equal(new Map(readSchemaNativeSlotResearch(await out.extract('Saves/save_0.save')).collectionHistoryEntries).get(2),'638000000000000002');assert.deepEqual(raw,before);
  await assert.rejects(s.apply(t,s.revision),/already exported/);assert.throws(()=>s.export(s.revision),/No verified/);
  const other=s.plan({...request(s),changes:[{...request(s).changes[0],next:'638000000000000003'}]});await s.apply(other,s.revision);s.undo(s.revision);assert.throws(()=>s.export(s.revision),/No verified/);
  const edits=[{operation:'collection-key1-ticks',changes:request(s).changes},{operation:'collection-key1-ticks',changes:[{itemId:3,expected:'9',next:'638000000000000004'}]}];
  assert.throws(()=>s.plan({operation:'batch-independent-scalars',expectedRevision:s.revision,edits:[edits[0],edits[0]]}),/Duplicate batch field/);
  const batch=s.plan({operation:'batch-independent-scalars',expectedRevision:s.revision,edits});await s.apply(batch,s.revision);const br=s.export(s.revision),bz=parseZip(new Uint8Array(await br.file.arrayBuffer()));assert.equal(new Map(readSchemaNativeSlotResearch(await bz.extract('Saves/save_0.save')).collectionHistoryEntries).get(3),'638000000000000004');
  const pending=s.exportDevEditedCopy(s.plan(request(s)),s.revision);raw[0]^=1;await assert.rejects(pending,/changed/);raw[0]^=1;assert.deepEqual(raw,before);s.close();
  const incompatible=await open(Uint8Array.from(zipLab({slotBytesOverride:envelope(payload())}).zip));assert.equal(incompatible.capability.productExportAvailable,false);await assert.rejects(incompatible.apply(incompatible.plan(request(incompatible)),incompatible.revision),/VERSION_CAS/);incompatible.close();
 }finally{rmSync(tmp,{recursive:true,force:true});}
});

// Same pre-existing synthetic Puzzle fixture, with the logical schema envelope
// instead of the legacy permissive scanner. No game or private save bytes.
import {fixture as puzzleFixture} from './helpers/04-puzzle-goals-source.mjs';
import {readSave} from '../src/save.js';
import {preparePrivateCrossStoreCommitComponents} from '../scripts/research/save-cross-store-dry-run.mjs';
import {sha256Hex} from '../scripts/research/native-browser-primitives.mjs';
const cat=(...xs)=>Buffer.concat(xs.map(x=>Buffer.from(x)));
const b=(...x)=>Buffer.from(x);
function array(...xs){const n=xs.length,h=Buffer.alloc(n<16?1:3);if(n<16)h[0]=0x90|n;else{h[0]=0xdc;h.writeUInt16BE(n,1);}return cat(h,...xs);}
function uint(n){const x=Buffer.alloc(5);x[0]=0xce;x.writeUInt32BE(n,1);return x;}
function float(n){const x=Buffer.alloc(5);x[0]=0xca;x.writeFloatBE(n,1);return x;}
function guid(x){return cat(...x.split(':').map(n=>uint(Number.parseInt(n,16))));}
function document(tag,body){return array(b(tag),body);}
function syntheticPuzzleSlot(f){const old=readSave(f.slotBytes),date=cat(b(0xd6,0xff),uint(1750000000).subarray(1)),docs=[document(18,array(b(0),uint(30001),cat(b(0xa5),Buffer.from('3.0.1'))))];
 for(const a of old.achievements)docs.push(document(16,array(uint(a.id),guid(a.guid),array(b(a.complete?0xc3:0xc2),float(a.current),a.complete?date:b(0xc0)))));
 for(const c of old.counters)docs.push(document(17,array(uint(c.id),guid(c.guid),array(float(c.current),b(0xc0),array()))));
 docs.push(document(32,array(uint(999),guid('00000000:00000000:00000000:00000001'),b(0),array(document(39,array(b(0x80),b(0x80)))))));
 return envelope(array(b(0),uint(1000),array(...docs)));
}
test('synthetic Puzzle 8+2 remains research-only, exact Account+Slot proof and output denied',async()=>{
 const f=puzzleFixture(),slot=syntheticPuzzleSlot(f),raw=Uint8Array.from(zipLab({slotBytesOverride:slot}).zip),before=raw.slice(),revision=await sha256Hex(raw);
 const {dryRunSchemaNativeCrossStoreCommitResearch:run}=await import('../scripts/research/save-transaction-engine.mjs');
 const args={zipBytes:raw,expectedZipSha256:revision,expectedNativeFormatPrefixSha256:await sha256Hex(slot.subarray(0,32)),localDefs:f.localDefs,slotDefs:f.slotDefs,metaDefs:f.metaDefs,completedAt:f.completedAt};
 const out=await run(args);assert.equal(out.totalFieldsVerified,10);assert.equal(out.zipBytesReturned,false);assert.deepEqual(raw,before);
 await assert.rejects(run({...args,devOutput:{operation:'puzzle-goals-complete'}}),/DEV_NATIVE_OUTPUT/);
 for(const failAt of ['BEFORE_ASSEMBLY','AFTER_ASSEMBLY','AFTER_REPARSE'])await assert.rejects(run({...args,failAt}));
});
