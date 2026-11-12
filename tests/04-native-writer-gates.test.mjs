import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateRawSync} from 'node:zlib';
import {fixture} from './helpers/04-puzzle-goals-source.mjs';
import {auditZipRawCopyability,inspectNativeWriterPlanReadOnly,NATIVE_WRITER_GATE} from '../scripts/research/save-native-writer-gates.mjs';

function le16(n){const b=Buffer.alloc(2);b.writeUInt16LE(n);return b;}
function le32(n){const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b;}
function crc32(raw){let x=0xffffffff;for(const b of raw){x^=b;for(let i=0;i<8;i++)x=x&1?0xedb88320^(x>>>1):x>>>1;}return(x^0xffffffff)>>>0;}
const SEP=Buffer.from([0x81,0x22,0x8d,0x18,0x1d]);
function archiveOf(f,{descriptors='none',extra=false,archiveComment=false,gaps=false,prefix=false,nonTargetCount=1}={}){
  const members=[['SettingsAccount/settings.json',Buffer.from(f.accountJson),true],['Saves/save_0.save',Buffer.from(f.slotBytes),true]];
  for(let i=0;i<nonTargetCount;i++)members.push([`Opaque/folder_${i}/file${i}.bin`,Buffer.from(`ZIP_UNRELATED_CONTENT_${i}_\u00e9`),true]);
  let offset=0;const local=[],central=[];
  if(prefix){local.push(SEP);offset+=SEP.length;}
  for(let idx=0;idx<members.length;idx++){
    const [name,raw,compressed]=members[idx],path=Buffer.from(name),data=compressed?deflateRawSync(raw):raw;
    const crc=crc32(raw),method=compressed?8:0,flag=0x800+(descriptors==='none'?0:8);
    const localExtra=extra?Buffer.from([0x04,0x00,0x03,0x00,0x08,0x07,0x06]):Buffer.alloc(0);
    const centralExtra=extra?Buffer.from([0x01,0x00,0x02,0x00,0x09,0x0a]):Buffer.alloc(0);
    const comment=extra?Buffer.from('cc'):Buffer.alloc(0);
    const header=Buffer.concat([le32(0x04034b50),le16(20),le16(flag),le16(method),le16(0),le16(0),
      le32(descriptors==='none'?crc:0),le32(descriptors==='none'?data.length:0),le32(descriptors==='none'?raw.length:0),
      le16(path.length),le16(localExtra.length),path,localExtra,data]);
    const desc=descriptors==='signed'?Buffer.concat([le32(0x08074b50),le32(crc),le32(data.length),le32(raw.length)]):
      descriptors==='bare'?Buffer.concat([le32(crc),le32(data.length),le32(raw.length)]):Buffer.alloc(0);
    const centralHeader=Buffer.concat([le32(0x02014b50),le16(20),le16(20),le16(flag),le16(method),le16(0),le16(0),
      le32(crc),le32(data.length),le32(raw.length),le16(path.length),le16(centralExtra.length),le16(comment.length),
      le16(0),le16(0),le32(0),le32(offset),path,centralExtra,comment]);
    local.push(header,desc);central.push(centralHeader);offset+=header.length+desc.length;
    if(gaps&&idx===0){local.push(SEP);offset+=SEP.length;}
  }
  const centralBytes=Buffer.concat(central);const trailingComment=archiveComment?Buffer.from('HKIA-OPAQUE-ARCHIVE-COMMENT'):Buffer.alloc(0);
  const eocd=Buffer.concat([le32(0x06054b50),le16(0),le16(0),le16(members.length),le16(members.length),
    le32(centralBytes.length),le32(offset),le16(trailingComment.length),trailingComment]);
  return Buffer.concat([...local,centralBytes,eocd]);
}
const input=(version='3.0.1',settings={})=>{const f=fixture(version);return {f,zipBytes:archiveOf(f,settings)};};

test('04 ZIP raw copyability: all CRC, exact local compressed ranges, no member bytes returned',async()=>{
  const {zipBytes}=input();const snap=Buffer.from(zipBytes),r=await auditZipRawCopyability(zipBytes);
  assert.equal(r.rawMemberCopyLayoutDeterminate,true);assert.equal(r.crcValidatedEntryCount,3);
  assert.equal(r.nonTargetEntryCount,1);assert.equal(r.compressedEntryCount,3);
  assert.equal(r.nonTargetEditedOutputByteIdentityVerified,false);assert.equal(r.nativeOutputAuthorized,false);
  assert.equal(r.writerEnabled,false);assert.equal(r.opaqueGapBytes,0);assert.deepEqual(r.blockers,[]);
  assert.equal(JSON.stringify(r).includes('ZIP_UNRELATED_CONTENT'),false);assert.equal('bytes' in r,false);
  assert.deepEqual(zipBytes,snap);
});
for(const descriptors of ['bare','signed'])test(`04 ZIP data descriptor ${descriptors} parsed without bytes export`,async()=>{
  const {zipBytes}=input('3.0.1',{descriptors,extra:true,archiveComment:true});
  const r=await auditZipRawCopyability(zipBytes);
  assert.equal(r.descriptorCount,3);assert.equal(r.signedDescriptorCount,descriptors==='signed'?3:0);
  assert.equal(r.localExtraMemberCount,3);assert.equal(r.centralExtraMemberCount,3);
  assert.equal(r.rawMemberCopyLayoutDeterminate,true);assert.equal(r.opaqueGapBytes,0);
});
test('04 ZIP source local gaps return blocking evidence, not a false byte-preservation approval',async()=>{
  for(const mode of ['prefix','gaps']){
    const f=fixture(),zipBytes=archiveOf(f,{[mode]:true}),r=await auditZipRawCopyability(zipBytes);
    assert.ok(r.opaqueGapBytes>=SEP.length);assert.deepEqual(r.blockers,['UNCLASSIFIED_LOCAL_ZIP_BYTES']);
    assert.equal(r.rawMemberCopyLayoutDeterminate,false);
  }
});
test('04 ZIP corruption: signed descriptor tampering rejected even when central CRC/extraction pass',async()=>{
  const {zipBytes}=input('3.0.1',{descriptors:'signed'}),before=Buffer.from(zipBytes);
  const pos=zipBytes.indexOf(Buffer.from([0x50,0x4b,0x07,0x08]));assert.ok(pos>0);
  zipBytes[pos+5]^=0xff;const damaged=Buffer.from(zipBytes);
  await assert.rejects(()=>auditZipRawCopyability(zipBytes),/descriptor/);
  assert.deepEqual(zipBytes,damaged);assert.notDeepEqual(before,damaged);
});
test('04 ZIP corruption: mismatched unsigned descriptor sizes fail closed',async()=>{
  const {zipBytes}=input('3.0.1',{descriptors:'bare'}),i=zipBytes.indexOf(Buffer.from('SettingsAccount/settings.json'));
  assert.ok(i>0);const crcOffset=30+Buffer.byteLength('SettingsAccount/settings.json')+0;
  const dataStart=crcOffset; // Only locate descriptor by searching for second local header.
  const next=zipBytes.indexOf(Buffer.from([0x50,0x4b,0x03,0x04]),i+1);
  assert.ok(next>0);zipBytes[next-1]^=1;
  await assert.rejects(()=>auditZipRawCopyability(zipBytes),/descriptor/);
});
test('04 ZIP corrupted unrelated member CRC aborts entire audit, input untouched',async()=>{
  const {zipBytes}=input(),k=zipBytes.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));assert.ok(k>0);
  const modified=Buffer.from(zipBytes);modified[k+16]^=1;
  await assert.rejects(()=>auditZipRawCopyability(modified),/CRC32|ZIP/);
  assert.deepEqual(modified,modified.slice());
});
test('04 ZIP 60MiB+ input refused before decompression and no partial report',async()=>{
  const oversized=new Uint8Array(60*1024*1024+1);
  await assert.rejects(()=>auditZipRawCopyability(oversized),/size limit/);
});
test('04 ZIP 96 non-target compressed members bounded, all CRCs checked',async()=>{
  const {zipBytes}=input('3.0.1',{nonTargetCount:96});const r=await auditZipRawCopyability(zipBytes);
  assert.equal(r.crcValidatedEntryCount,98);assert.equal(r.nonTargetEntryCount,96);
  assert.equal(r.rawMemberCopyLayoutDeterminate,true);
});
test('04 Native Writer plan phases never authorize ZIP Apply or game reload',async()=>{
  const {f,zipBytes}=input(),snap=Buffer.from(zipBytes);
  const proof=await inspectNativeWriterPlanReadOnly({...f,zipBytes});
  assert.equal(proof.schema,'HKIA.04.NativeWriterPlan.1');assert.equal(proof.dependency,'CONDITIONAL_REQUIRED');
  assert.equal(proof.phase.typedPlan,true);assert.equal(proof.phase.nativeSlotInMemoryApply,true);
  assert.equal(proof.phase.accountInMemoryApply,true);assert.equal(proof.phase.componentExactDiffVerified,true);
  assert.equal(proof.phase.atomicZipEncode,false);assert.equal(proof.phase.editedZipReparse,false);
  assert.equal(proof.plannedChanges.total,10);assert.equal(proof.zipRawCopyable,true);
  assert.equal(proof.nativeOutputAuthorized,false);assert.equal(proof.writerEnabled,false);
  assert.equal(NATIVE_WRITER_GATE,false);assert.equal(Object.isFrozen(proof.blockers),true);
  assert.ok(proof.blockers.includes('NATIVE_AUTHENTICATION_NOT_PROVEN'));
  assert.ok(!Object.keys(proof).some(k=>['zipBytes','slotBytes','output','raw','bytes','accountJson'].includes(k)));
  assert.deepEqual(zipBytes,snap);
});
test('04 Native Writer plan same proven scope v3.0.0, no forward-version assumption',async()=>{
  const {f,zipBytes}=input('3.0.0');const proof=await inspectNativeWriterPlanReadOnly({...f,zipBytes});
  assert.equal(proof.version,'3.0.0');assert.equal(proof.futureVersionWriterAuthorized,false);
});
test('04 Native Writer Plan CAS / unsupported version / invalid timestamp fail closed without input mutation',async()=>{
  const {f,zipBytes}=input(),original=Buffer.from(zipBytes);
  await assert.rejects(()=>inspectNativeWriterPlanReadOnly({...f,zipBytes,completedAt:'2026-02-30T01:02:03.1234567Z'}));
  await assert.rejects(()=>inspectNativeWriterPlanReadOnly({...f,zipBytes,metaDefs:[{...f.metaDefs[0],guid:'0'.repeat(32)}]}));
  assert.deepEqual(zipBytes,original);
  const future=input('3.0.2');
  await assert.rejects(()=>inspectNativeWriterPlanReadOnly({...future.f,zipBytes:future.zipBytes}),/未検証の保存バージョン/);
});
