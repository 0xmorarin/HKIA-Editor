import {deflateRawSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import {fixture} from './04-puzzle-goals-source.mjs';

function le16(n){const b=Buffer.alloc(2);b.writeUInt16LE(n);return b;}
function le32(n){const b=Buffer.alloc(4);b.writeUInt32LE(n>>>0);return b;}
function crc32(raw){let x=0xffffffff;for(const b of raw){x^=b;for(let i=0;i<8;i++)x=x&1?0xedb88320^(x>>>1):x>>>1;}return(x^0xffffffff)>>>0;}
const b=x=>Buffer.from(x);
export const marker='HKIA-04-SYNTHETIC-ZIP-TEST-ONLY';
export const sha256=x=>createHash('sha256').update(x).digest('hex');
export function zipLab({descriptor='none',extras=false,comment=false,reverseCentral=false,gap=false,prefix=false,extraMembers=2,version='3.0.1',corruptMarker=false,deflate=true,slotBytesOverride=null}={}){
  const f=fixture(version);
  const members=[
    ['Saves/save_0.save',b(slotBytesOverride??f.slotBytes)],
    ['SettingsAccount/settings.json',b(f.accountJson)],
    ['LabFixtures/QA_SYNTHETIC_MARKER.txt',b(corruptMarker?'WRONG':marker)],
    ['LabFixtures/alpha.bin',b('lab old alpha: 𐄷')],
    ['LabFixtures/beta.bin',b('lab old beta: 世界')],
  ];
  for(let i=0;i<extraMembers;i++)members.push([`Unknown/keep${i}.bin`,b(`unknown #${i}`)]);
  let offset=0;const locals=[],central=[];
  if(prefix){locals.push(b('UNRECOGNIZED ZIP PREFIX'));offset+=locals[0].length;}
  for(const [name,raw] of members){
    const nameBytes=b(name),zipped=deflate?deflateRawSync(raw):raw,method=deflate?8:0;
    const crc=crc32(raw),flag=0x800+(descriptor!=='none'?8:0);
    const localExtra=extras?b([0x55,0x54,0x02,0x00,0x11,0x12]):Buffer.alloc(0);
    const centerExtra=extras?b([0x55,0x54,0x02,0x00,0x11,0x12]):Buffer.alloc(0);
    const centerComment=extras?b('opaque-central-comment'):Buffer.alloc(0);
    const rawHead=Buffer.concat([le32(0x04034b50),le16(20),le16(flag),le16(method),le16(0),le16(0),
      le32(descriptor==='none'?crc:0),le32(descriptor==='none'?zipped.length:0),le32(descriptor==='none'?raw.length:0),
      le16(nameBytes.length),le16(localExtra.length),nameBytes,localExtra,zipped]);
    let desc=Buffer.alloc(0);
    if(descriptor!=='none'){desc=Buffer.concat([...(descriptor==='signed'?[le32(0x08074b50)]:[]),le32(crc),le32(zipped.length),le32(raw.length)]);}
    const centralEntry=Buffer.concat([le32(0x02014b50),le16(20),le16(20),le16(flag),le16(method),le16(0),le16(0),
      le32(crc),le32(zipped.length),le32(raw.length),le16(nameBytes.length),le16(centerExtra.length),le16(centerComment.length),
      le16(0),le16(0),le32(0),le32(offset),nameBytes,centerExtra,centerComment]);
    locals.push(rawHead,desc);central.push(centralEntry);offset+=rawHead.length+desc.length;
    if(gap&&name==='LabFixtures/alpha.bin'){locals.push(b('UNCLASSIFIED'));offset+=12;}
  }
  if(reverseCentral)central.reverse();
  const centralBytes=Buffer.concat(central),trailingComment=comment?b('UNKNOWN-COMMENT-KEEP-EXACT'):Buffer.alloc(0);
  const eocd=Buffer.concat([le32(0x06054b50),le16(0),le16(0),le16(members.length),le16(members.length),
    le32(centralBytes.length),le32(offset),le16(trailingComment.length),trailingComment]);
  const zip=Buffer.concat([...locals,centralBytes,eocd]);
  const entries=new Map(members);
  return {zip,f,entries,mutation:[
    {name:'LabFixtures/alpha.bin',expectedSha256:sha256(entries.get('LabFixtures/alpha.bin')),replacementBytes:b('NEW_ALPHA_123')},
    {name:'LabFixtures/beta.bin',expectedSha256:sha256(entries.get('LabFixtures/beta.bin')),replacementBytes:b('NEW_BETA_456_MORE')},
  ]};
}
