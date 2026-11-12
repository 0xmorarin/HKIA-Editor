/** 00 CTRL: fixture-free, local-only regression of Account ZIP write scope. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {deflateRawSync} from 'node:zlib';
import {parseZip,repackSettingsZip} from '../src/zip.js';

const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16LE(n);return b;};
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b;};
function crc32(b){let c=0xffffffff;for(const v of b){c^=v;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);}return(c^0xffffffff)>>>0;}
function syntheticArchive(members){
  const locals=[],centrals=[],centralOffsets=new Map();let offset=0,centralSize=0;
  for(const [name,rawValue,compressed] of members){
    const raw=Buffer.from(rawValue),nameBytes=Buffer.from(name,'utf8');
    const method=compressed?8:0,data=compressed?deflateRawSync(raw):raw,hash=crc32(raw);
    const local=Buffer.concat([u32(0x04034b50),u16(20),u16(0x800),u16(method),u16(0),u16(0),u32(hash),u32(data.length),u32(raw.length),u16(nameBytes.length),u16(0),nameBytes,data]);
    const center=Buffer.concat([u32(0x02014b50),u16(20),u16(20),u16(0x800),u16(method),u16(0),u16(0),u32(hash),u32(data.length),u32(raw.length),u16(nameBytes.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameBytes]);
    centralOffsets.set(name,centralSize);locals.push(local);centrals.push(center);offset+=local.length;centralSize+=center.length;
  }
  const end=Buffer.concat([u32(0x06054b50),u16(0),u16(0),u16(members.length),u16(members.length),u32(centralSize),u32(offset),u16(0)]);
  return {bytes:Buffer.concat([...locals,...centrals,end]),centralStart:offset,centralOffsets};
}
const account='SettingsAccount/settings.json';
const slot='Saves/save_0.save';
const backup='Saves/save_0.lbak';
const extra='Other/unknown.bin';
const originalAccount=Buffer.from(JSON.stringify({Achievements:{['a'.repeat(32)]:{IsComplete:false,CurrentValue:0,CompletedTime:null}},Counters:{},Unknown:{deep:{keep:'yes'}}}));
const editedAccount=Buffer.from(JSON.stringify({Achievements:{['a'.repeat(32)]:{IsComplete:true,CurrentValue:1,CompletedTime:'2026-11-11T00:00:00Z'}},Counters:{},Unknown:{deep:{keep:'yes'}}}));
const members=[[account,originalAccount,true],[slot,Buffer.from([0,0xff,0x80,1,2,3,0,0xfe]),true],[backup,Buffer.from('unchanged original backup'),false],[extra,Buffer.from([0x00,0x00,0xff,0x10,0xff,0x00]),true]];

test('CTRL synthetic ZIP: complete preservation of non-target members and original input',async()=>{
  const input=syntheticArchive(members).bytes;const inputBackup=Buffer.from(input);
  const output=await repackSettingsZip(input,editedAccount);
  assert.deepEqual(input,inputBackup,'original ZIP mutated');
  const source=parseZip(input),result=parseZip(output);
  assert.deepEqual([...result.entries.keys()],[...source.entries.keys()]);
  for(const name of source.entries.keys()){
    const old=await source.extract(name),fresh=await result.extract(name);
    if(name===account){assert.deepEqual(Buffer.from(fresh),editedAccount);assert.notDeepEqual(Buffer.from(fresh),Buffer.from(old));}
    else assert.deepEqual(Buffer.from(fresh),Buffer.from(old),`non-target changed: ${name}`);
  }
});

test('CTRL synthetic ZIP: failure is atomic even for corrupt unrelated member CRC',async()=>{
  const {bytes,centralStart,centralOffsets}=syntheticArchive(members);
  const input=Buffer.from(bytes);
  input[centralStart+centralOffsets.get(extra)+16]^=0x01; // Corrupt only unrelated central CRC.
  const preserved=Buffer.from(input);
  await assert.rejects(()=>repackSettingsZip(input,editedAccount),/CRC32|CRC/);
  assert.deepEqual(input,preserved,'invalid source mutated after rejected export');
});

function verifyPagesWorkflowState(template, active, gates){
  assert.ok(template.length > 0, 'disabled template required');
  const d=gates?.distribution;
  if(active===null){
    assert.notEqual(d?.githubPages,'ON','Pages ON requires the approved active workflow');
    return;
  }
  assert.equal(d?.githubPages,'ON','active Pages workflow requires Owner gate ON');
  assert.equal(d?.nativeSaveWriter,'ON_PROVEN_BETA_CAPABILITIES');
  const a=d.publicValidation?.approvedArtifact;
  assert.match(a?.commit??'',/^[0-9a-f]{40}$/);
  assert.match(a?.manifestSha256??'',/^[0-9a-f]{64}$/);
  assert.deepEqual(active,template,'active workflow must exactly match the fixed manual template');
}

test('CTRL publication gate: OFF baseline or explicitly approved exact manual Pages workflow; never included in local dist',()=>{
  const root=new URL('../',import.meta.url);
  const template=readFileSync(new URL('.github/workflows/pages.yml.disabled',root));
  const activePath=new URL('.github/workflows/pages.yml',root);
  const gatePath=new URL('config/release-gates.json',root);
  verifyPagesWorkflowState(template,existsSync(activePath)?readFileSync(activePath):null,existsSync(gatePath)?JSON.parse(readFileSync(gatePath,'utf8')):null);
  const build=readFileSync(new URL('scripts/build-site.mjs',root),'utf8');
  assert.match(build,/\['src','data','assets'\]/);
  assert.ok(!build.includes('scripts/research'));
});

test('CTRL publication gate: synthetic activation accepts only exact manually approved workflow and fixed artifact',()=>{
  const template=Buffer.from('synthetic manual template');
  const approved={distribution:{githubPages:'ON',nativeSaveWriter:'ON_PROVEN_BETA_CAPABILITIES',publicValidation:{approvedArtifact:{commit:'a'.repeat(40),manifestSha256:'b'.repeat(64)}}}};
  verifyPagesWorkflowState(template,null,{distribution:{githubPages:'OFF'}});
  verifyPagesWorkflowState(template,template,approved);
  for(const gates of [null,{distribution:{githubPages:'OFF'}},{distribution:{githubPages:'ON',nativeSaveWriter:'OFF'}}, {distribution:{...approved.distribution,publicValidation:{approvedArtifact:{commit:'bad',manifestSha256:'b'.repeat(64)}}}}, {distribution:{...approved.distribution,publicValidation:{approvedArtifact:{commit:'a'.repeat(40),manifestSha256:'bad'}}}}])assert.throws(()=>verifyPagesWorkflowState(template,template,gates));
  assert.throws(()=>verifyPagesWorkflowState(template,Buffer.from('different'),approved));
  assert.throws(()=>verifyPagesWorkflowState(template,null,approved));
});
