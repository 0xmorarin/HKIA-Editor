import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {zipLab,sha256} from './helpers/04-zip-lab-source.mjs';
import {dryRunSealedNativeCrossStoreCommitResearch,NATIVE_SLOT_WRITER_ENABLED} from '../scripts/research/save-transaction-engine.mjs';
import {parseZip} from '../src/zip.js';

const zeroPrefixHash=sha256(new Uint8Array(32));
const call=(f,extra={})=>dryRunSealedNativeCrossStoreCommitResearch({
  zipBytes:f.zip,expectedZipSha256:sha256(f.zip),expectedNativeFormatPrefixSha256:zeroPrefixHash,
  ...f.f,...extra
});
for(const version of ['3.0.0','3.0.1'])for(const descriptor of ['none','bare','signed']){
  test(`04 sealed dual-member Native+Account internal commit ${version} ${descriptor}`,async()=>{
    const f=zipLab({version,descriptor,extras:true,comment:true,reverseCentral:true,extraMembers:12});
    const before=Buffer.from(f.zip);
    const proof=await call(f);
    assert.equal(proof.version,version);
    assert.equal(proof.totalFieldsVerified,10);
    assert.equal(proof.unknownNativeTokensPreserved,true);
    assert.equal(proof.allNonTargetRawFramesPreserved,true);
    assert.equal(proof.nativeAuthenticationVerified,false);
    assert.equal(proof.formatSignatureIndependentlyVerified,false);
    assert.equal(proof.gameAccepted,false);
    assert.equal(proof.formatSignatureIsNotAuthentication,true);
    assert.equal(proof.nativeOutputAuthorized,false);
    assert.equal(proof.zipBytesReturned,false);
    assert.deepEqual(f.zip,before);
    assert.ok(Object.isFrozen(proof));
    assert.equal(Object.values(proof).some(x=>x instanceof Uint8Array),false);
    assert.equal(NATIVE_SLOT_WRITER_ENABLED,false);
  });
}
for(const failAt of ['BEFORE_ASSEMBLY','AFTER_ASSEMBLY','AFTER_REPARSE']){
  test(`04 sealed dual-member Native+Account aborts fully at ${failAt}`,async()=>{
    const f=zipLab({descriptor:'signed'}),snapshot=Buffer.from(f.zip);
    await assert.rejects(call(f,{failAt}),/Injected/);
    assert.deepEqual(f.zip,snapshot);
  });
}
test('04 sealed native commit rejects stale ZIP revision, prefix mismatch and unsupported version',async()=>{
  const f=zipLab();
  await assert.rejects(call(f,{expectedZipSha256:'0'.repeat(64)}),/ZIP revision CAS/);
  await assert.rejects(call(f,{expectedNativeFormatPrefixSha256:'a'.repeat(64)}),/format prefix CAS mismatch/);
  const future=zipLab({version:'3.0.2'});
  await assert.rejects(call(future),/未検証の保存バージョン/);
});
test('04 sealed native commit rejects malformed ZIP and unapproved REQUIRED',async()=>{
  const f=zipLab({descriptor:'bare'}),bad=Buffer.from(f.zip);
  const p=bad.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));assert.ok(p>0);bad[p+16]^=1;
  await assert.rejects(call({...f,zip:bad}),/CRC32|CRCが一致しません|descriptor/);
  await assert.rejects(call(f,{leafKey:'arbitrary'}),/Only the Puzzle Goals/);
});
test('04 sealed pipeline supports synthetic nonzero 32-byte prefix but does not authenticate it',async()=>{
  const f=zipLab({deflate:false,descriptor:'none',extraMembers:2});
  const raw=Buffer.from(f.zip),z=parseZip(raw),entry=z.entries.get('Saves/save_0.save');
  assert.ok(entry);assert.equal(entry.method,0);
  const len=raw.readUInt16LE(entry.local+26),ext=raw.readUInt16LE(entry.local+28),start=entry.local+30+len+ext;
  for(let i=0;i<32;i++)raw[start+i]=(i*13+7)&255;
  const crc=(bytes)=>{let x=0xffffffff;for(const b of bytes){x^=b;for(let i=0;i<8;i++)x=x&1?0xedb88320^(x>>>1):x>>>1;}return (x^0xffffffff)>>>0;};
  const slot=raw.subarray(start,start+entry.uncompressed),sum=crc(slot);
  raw.writeUInt32LE(sum,entry.local+14);
  const cd=raw.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));assert.ok(cd>0);raw.writeUInt32LE(sum,cd+16);
  const prefixHash=sha256(slot.subarray(0,32));assert.notEqual(prefixHash,zeroPrefixHash);
  const proof=await call({...f,zip:raw},{expectedNativeFormatPrefixSha256:prefixHash});
  assert.equal(proof.totalFieldsVerified,10);
  assert.equal(proof.nativeAuthenticationVerified,false);
});

test('04 sealed native commit 128 unrelated entries and Account lexical preservation',async()=>{
  const f=zipLab({version:'3.0.1',descriptor:'signed',extraMembers:128,extras:true,comment:true,reverseCentral:true});
  const original=Buffer.from(f.zip);const proof=await call(f);
  assert.equal(proof.allNonTargetRawFramesPreserved,true);
  assert.equal(proof.accountLexicalDiffOnly,true);
  assert.deepEqual(f.zip,original);
});
test('04 sealed native commit rejects Account-only CAS drift and malformed model',async()=>{
  const f=zipLab(),account=String(f.f.accountJson);
  const changed=account.replace(/\"CurrentValue\"\s*:\s*19/, '"CurrentValue":18');
  assert.notEqual(changed,account);
  const input=zipLab({version:'3.0.1'});
  await assert.rejects(call(input,{localDefs:{records:[]}}),/source definition contract|Missing source definition/);
  assert.equal(NATIVE_SLOT_WRITER_ENABLED,false);
});
test('04 hard product commit remains rejected despite private research proof passing',async()=>{
  const f=zipLab();await call(f);
  const {commitNativeCrossStoreZip,nativeWriterCapability}=await import('../contracts/04-native-commit-gate.mjs');
  const capability=nativeWriterCapability();
  assert.equal(capability.writerEnabled,false);
  assert.throws(()=>commitNativeCrossStoreZip(),/NATIVE_WRITER_DISABLED/);
});
