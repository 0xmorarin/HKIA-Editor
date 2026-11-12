import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAccount} from '../src/account.js';
import {parseZip,repackSettingsZip} from '../src/zip.js';

const G='a'.repeat(32);
const H='b'.repeat(32);
const entry=JSON.stringify({IsComplete:false,CurrentValue:0,CompletedTime:null});
const counter=JSON.stringify({CurrentValue:0,CountedValues:null,CountedGuids:[]});
const valid=JSON.stringify({Achievements:{[G]:JSON.parse(entry)},Counters:{[H]:JSON.parse(counter)},Other:{nested:'kept'}});
function crc32(data){let c=-1;for(const b of data){c^=b;for(let j=0;j<8;j++)c=(c&1)?(c>>>1)^0xedb88320:(c>>>1);}return(c^-1)>>>0;}
function u16(x){const v=new Uint8Array(2);new DataView(v.buffer).setUint16(0,x,true);return v;}
function u32(x){const v=new Uint8Array(4);new DataView(v.buffer).setUint32(0,x,true);return v;}
function join(...args){const out=new Uint8Array(args.reduce((n,x)=>n+x.length,0));let p=0;for(const a of args){out.set(a,p);p+=a.length;}return out;}
function zip(json){const raw=new TextEncoder().encode(json);const name=new TextEncoder().encode('SettingsAccount/settings.json');const crc=crc32(raw);const local=join(u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(raw.length),u32(raw.length),u16(name.length),u16(0),name,raw);const central=join(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(raw.length),u32(raw.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(0),name);return join(local,central,u32(0x06054b50),u16(0),u16(0),u16(1),u16(1),u32(central.length),u32(local.length),u16(0));}
const bytes=s=>new TextEncoder().encode(s);

test('Account parser rejects literal duplicate GUID keys',()=>{
  const raw=`{"Achievements":{"${G}":${entry},"${G}":${entry}},"Counters":{"${H}":${counter}}}`;
  assert.throws(()=>parseAccount(raw),/重複/);
});
test('Account parser rejects escaped equivalent duplicate keys and nested unknown duplicates',()=>{
  const escaped=G.slice(0,1)+'\\u0061'+G.slice(2);
  const raw=`{"Achievements":{"${G}":${entry},"${escaped}":${entry}},"Counters":{"${H}":${counter}}}`;
  assert.throws(()=>parseAccount(raw),/重複/);
  const nested=valid.replace('"nested":"kept"','"nested":"kept","nested":"lost"');
  assert.throws(()=>parseAccount(nested),/重複/);
});
test('Account parser rejects case-insensitive duplicate GUID records',()=>{
  const raw=`{"Achievements":{"${G}":${entry},"${G.toUpperCase()}":${entry}},"Counters":{"${H}":${counter}}}`;
  assert.throws(()=>parseAccount(raw),/重複GUID/);
});
test('Account parser rejects duplicate counter keys',()=>{
  const raw=`{"Achievements":{"${G}":${entry}},"Counters":{"${H}":${counter},"${H}":${counter}}}`;
  assert.throws(()=>parseAccount(raw),/重複/);
});
test('Account ZIP writer rejects invalid edited JSON, keeps original bytes',async()=>{
  const original=zip(valid);const before=original.slice();
  await assert.rejects(()=>repackSettingsZip(original,bytes('{}')),/Achievements/);
  await assert.rejects(()=>repackSettingsZip(original,bytes('{')),/SyntaxError|Expected|end of JSON/i);
  assert.deepEqual(original,before);
});
test('Account ZIP writer rejects ambiguous original JSON before producing output',async()=>{
  const duplicate=`{"Achievements":{"${G}":${entry},"${G}":${entry}},"Counters":{"${H}":${counter}}`+'}';
  const source=zip(duplicate);
  await assert.rejects(()=>repackSettingsZip(source,bytes(valid)),/重複/);
});
test('Account ZIP writer preserves valid Account JSON and original bytes',async()=>{
  const source=zip(valid);const original=source.slice();
  const modified=JSON.stringify({...JSON.parse(valid),Other:{nested:'retained',flag:0}});
  const after=await repackSettingsZip(source,bytes(modified));
  assert.deepEqual(source,original);
  const extracted=await parseZip(after).extract('SettingsAccount/settings.json');
  assert.equal(new TextDecoder().decode(extracted),modified);
  assert.equal(parseAccount(extracted).Other.flag,0);
});
