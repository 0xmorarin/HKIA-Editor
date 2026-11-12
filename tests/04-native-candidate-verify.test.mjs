import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './helpers/04-puzzle-goals-source.mjs';
import {zipLab} from './helpers/04-zip-lab-source.mjs';
import {verifyNativeSlotCandidateAgainstPlanReadOnly} from '../scripts/research/save-transaction-engine.mjs';
import {prepareSyntheticPuzzleGoalsPairForInternalLabOnly,
  verifyPuzzleGoalsCrossStoreCandidateReadOnly} from '../scripts/research/save-cross-store-dry-run.mjs';
import {auditNativeCandidateRawPreservationReadOnly} from '../scripts/research/save-atomic-zip-lab.mjs';
import {verifyNativeCrossStoreZipCandidateReadOnly,NATIVE_CANDIDATE_WRITER_ENABLED} from '../scripts/research/save-native-candidate-verify.mjs';
import {commitNativeCrossStoreZip,nativeWriterCapability,NATIVE_WRITER_ENABLED,
  NativeWriterDisabledError} from '../contracts/04-native-commit-gate.mjs';

function sourcePair(version='3.0.1'){
  const f=fixture(version);
  const pair=prepareSyntheticPuzzleGoalsPairForInternalLabOnly(f);
  return {f,pair};
}
const tx=(f,pair)=>verifyPuzzleGoalsCrossStoreCandidateReadOnly({...f,candidateSlotBytes:pair.slotBytes,
  candidateAccountJson:pair.accountBytes});
for(const version of ['3.0.0','3.0.1'])test(`04 independently verify exact candidate Native expanded bytes and two Account lexical tokens ${version}`,()=>{
  const {f,pair}=sourcePair(version);
  const proof=tx(f,pair);
  assert.equal(proof.schema,'HKIA.04.PuzzleGoalsCandidateVerify.1');
  assert.equal(proof.verifiedSlotFields,8);assert.equal(proof.verifiedAccountFields,2);
  assert.equal(proof.nativeMessagePackExactExpectedDiffOnly,true);
  assert.equal(proof.accountLexicalExactExpectedDiffOnly,true);
  assert.equal(proof.nativeAuthenticated,false);assert.equal(proof.outputBytesReturned,false);
  assert.equal('candidateSlotBytes' in proof,false);assert.ok(Object.isFrozen(proof));
});
test('04 refuse changed unknown native token despite valid model semantics and valid LZ4',()=>{
  const {f,pair}=sourcePair(),candidate=Uint8Array.from(pair.slotBytes);
  const token=Buffer.from('unknown_key'),pos=Buffer.from(candidate).indexOf(token);
  assert.ok(pos>=0,'Synthetic fixture unknown key must be present in LZ4 literal stream');
  candidate[pos+token.length-1]^=1;
  assert.throws(()=>tx(f,{...pair,slotBytes:candidate}),/Candidate MessagePack differs from exact allowed typed diff/);
});
test('04 refuse header-prefix mutation on candidate even though format parser recognizes structure',()=>{
  const {f,pair}=sourcePair(),candidate=Uint8Array.from(pair.slotBytes);
  candidate[0]=1;
  assert.throws(()=>tx(f,{...pair,slotBytes:candidate}),/Candidate Native prefix or metadata changed/);
});
test('04 refuse non-target Account JSON lexical mutation although JSON remains valid',()=>{
  const {f,pair}=sourcePair(),text=new TextDecoder().decode(pair.accountBytes);
  assert.match(text,/OriginalNumber/);
  assert.throws(()=>tx(f,{...pair,accountBytes:new TextEncoder().encode(text.replace('OriginalNumber','OriginalNumbeq'))}),
    /Candidate Account lexical diff exceeds/);
});
test('04 refuse harmless-looking candidate Account whitespace rewrite',()=>{
  const {f,pair}=sourcePair(),text=new TextDecoder().decode(pair.accountBytes);
  assert.throws(()=>tx(f,{...pair,accountBytes:new TextEncoder().encode(text+'\n')}),
    /Candidate Account lexical diff exceeds/);
});
test('04 refuse candidate Native that is only a no-op or unexpected version',()=>{
  const {f,pair}=sourcePair();
  assert.throws(()=>tx(f,{...pair,slotBytes:f.slotBytes}),/Candidate Native slot contains no requested changes/);
  const future=fixture('3.0.2');
  assert.throws(()=>verifyPuzzleGoalsCrossStoreCandidateReadOnly({...future,
    candidateSlotBytes:pair.slotBytes,candidateAccountJson:pair.accountBytes}),/未検証の保存バージョン/);
});
test('04 raw preservation verifier accepts byte-identical no-op copy of all members',async()=>{
  const f=zipLab({descriptor:'signed',extras:true,comment:true,reverseCentral:true,extraMembers:32});
  const p=await auditNativeCandidateRawPreservationReadOnly(f.zip,Buffer.from(f.zip));
  assert.equal(p.membersVerified,37);assert.equal(p.nonTargetMembersVerified,35);
  assert.equal(p.allNonTargetRawCompressedFramesByteIdentical,true);
  assert.equal(p.nativeAuthenticated,false);assert.equal(p.outputBytesReturned,false);
});
test('04 raw verifier rejects changed non-target central comment with valid CRC',async()=>{
  const f=zipLab({extras:true,comment:true}),candidate=Buffer.from(f.zip);
  const at=candidate.indexOf(Buffer.from('opaque-central-comment'));
  assert.ok(at>=0);candidate[at]^=1;
  await assert.rejects(()=>auditNativeCandidateRawPreservationReadOnly(f.zip,candidate),/Unintended central directory byte changed/);
});
test('04 raw verifier rejects changed ZIP archive comment even when all member CRCs remain valid',async()=>{
  const f=zipLab({comment:true}),candidate=Buffer.from(f.zip);
  candidate[candidate.length-1]^=1;
  await assert.rejects(()=>auditNativeCandidateRawPreservationReadOnly(f.zip,candidate),/archive comment differs/);
});
test('04 candidate verifier CAS mismatch rejects before candidate access',async()=>{
  const f=zipLab(),bad=Buffer.from(f.zip);
  await assert.rejects(()=>verifyNativeCrossStoreZipCandidateReadOnly({sourceZipBytes:f.zip,candidateZipBytes:bad,
    expectedSourceZipSha256:'0'.repeat(64),...f.f}),/ZIP revision CAS mismatch/);
});
test('04 candidate verifier refuses unchanged candidate ZIP as no-op',async()=>{
  const f=zipLab();const {sha256}=await import('./helpers/04-zip-lab-source.mjs');
  await assert.rejects(()=>verifyNativeCrossStoreZipCandidateReadOnly({sourceZipBytes:f.zip,candidateZipBytes:Buffer.from(f.zip),
    expectedSourceZipSha256:sha256(f.zip),...f.f}),/No-op Native cross-store/);
});
test('04 browser-safe hard commit boundary has no input reads or side effects',()=>{
  const status=nativeWriterCapability();assert.equal(NATIVE_WRITER_ENABLED,false);
  assert.equal(NATIVE_CANDIDATE_WRITER_ENABLED,false);assert.equal(status.canApply,false);
  assert.equal(status.canExport,false);assert.equal(Object.isFrozen(status.blockers),true);
  const malicious=Object.defineProperty({},'zipBytes',{get(){throw Error('Input was inspected unexpectedly');}});
  assert.throws(()=>commitNativeCrossStoreZip(malicious),(e)=>e instanceof NativeWriterDisabledError&&e.code==='NATIVE_WRITER_DISABLED');
  assert.equal(JSON.stringify(status).includes('zipBytes'),false);
});
test('04 raw candidate verifier rejects reshuffled central directory even with same members and CRC',async()=>{
  const old=zipLab({reverseCentral:false,extras:true,comment:true});
  const reordered=zipLab({reverseCentral:true,extras:true,comment:true});
  await assert.rejects(()=>auditNativeCandidateRawPreservationReadOnly(old.zip,reordered.zip),
    /ZIP central directory ordering changed/);
});
test('04 candidate ZIP verifier refuses corrupt non-target CRC before any semantic acceptance',async()=>{
  const f=zipLab({comment:true}),candidate=Buffer.from(f.zip);
  const central=candidate.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));
  assert.ok(central>0);candidate[central+16]^=0x20;
  const {sha256}=await import('./helpers/04-zip-lab-source.mjs');
  await assert.rejects(()=>verifyNativeCrossStoreZipCandidateReadOnly({sourceZipBytes:f.zip,candidateZipBytes:candidate,
    expectedSourceZipSha256:sha256(f.zip),...f.f}),/ZIP.*CRC|CRC32|ZIP.*一致/);
});
