import {parseAccount} from './account.js';
                                                                                           
const MAX_ARCHIVE=60*1024*1024;
const MAX_ENTRY=25*1024*1024;
const MAX_COUNT=2000;
const MAX_TOTAL=60*1024*1024;
                                                                                    
const SUPPORTED_FLAGS=0x0808;
const CRC_TABLE=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);return c>>>0;});
function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=CRC_TABLE[(c^b)&0xff]^(c>>>8);return (c^0xffffffff)>>>0;}
const utf8=new TextDecoder('utf-8',{fatal:true});
function check(view,offset,n){if(offset<0||offset+n>view.byteLength)throw new Error('ZIPの境界が不正です');}
function le16(v,o){check(v,o,2);return v.getUint16(o,true);}
function le32(v,o){check(v,o,4);return v.getUint32(o,true);}
export function parseZip(bytes){
  const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  if(a.length>MAX_ARCHIVE)throw new Error('ZIPサイズが上限を超えています');
  const v=new DataView(a.buffer,a.byteOffset,a.byteLength);
  let eocd=-1;
  for(let i=a.length-22;i>=Math.max(0,a.length-22-65535);i--){
    if(le32(v,i)===0x06054b50&&i+22+le16(v,i+20)===a.length){eocd=i;break;}
  }
  if(eocd<0)throw new Error('ZIP中央ディレクトリが見つかりません');
  const disk=le16(v,eocd+4),centralDisk=le16(v,eocd+6),onDisk=le16(v,eocd+8);
  const total=le16(v,eocd+10),size=le32(v,eocd+12),offset=le32(v,eocd+16);
  if(disk!==0||centralDisk!==0||onDisk!==total||total>MAX_COUNT||total===65535||offset===0xffffffff||size===0xffffffff)throw new Error('ZIP分割／ZIP64は未対応です');
  if(offset+size>eocd)throw new Error('ZIP中央ディレクトリが不正です');
  const entries=new Map();const localRanges=[];let p=offset,totalUncompressed=0;
  for(let i=0;i<total;i++){
    if(le32(v,p)!==0x02014b50)throw new Error('ZIP中央ディレクトリの署名が不正です');
    const flags=le16(v,p+8),method=le16(v,p+10),compressed=le32(v,p+20),uncompressed=le32(v,p+24);
    const checksum=le32(v,p+16),start=p;
    const nameLen=le16(v,p+28),extraLen=le16(v,p+30),commentLen=le16(v,p+32),local=le32(v,p+42);
    check(v,p+46,nameLen+extraLen+commentLen);
    const nameBytes=a.subarray(p+46,p+46+nameLen);
    const name=utf8.decode(nameBytes);
    p+=46+nameLen+extraLen+commentLen;
    if(!name||name.startsWith('/')||name.includes('\\')||/[\u0000-\u001f]/.test(name)||name.split('/').some(z=>z==='..'||z==='.'))throw new Error('ZIP内に危険なパスがあります');
    if(entries.has(name))throw new Error('ZIPに重複ファイル名があります');
    if(uncompressed>MAX_ENTRY)throw new Error('ZIP内のファイルサイズが上限を超えています');
    totalUncompressed+=uncompressed;
    if(totalUncompressed>MAX_TOTAL)throw new Error('ZIP全体の展開サイズが上限を超えています');
    if(flags&~SUPPORTED_FLAGS)throw new Error('未対応のZIPフラグです');
    if(![0,8].includes(method))throw new Error('未対応のZIP圧縮方式です');
    if(le16(v,start+34)!==0||local===0xffffffff||compressed===0xffffffff||uncompressed===0xffffffff)throw new Error('複数ディスクZIP／ZIP64は未対応です');
    if(method===0&&compressed!==uncompressed)throw new Error('非圧縮ZIPのサイズが一致しません');
                                                                            
                                                                               
    if(local+30>offset||le32(v,local)!==0x04034b50)throw new Error('ZIPローカルヘッダーが不正です');
    const localFlags=le16(v,local+6),localMethod=le16(v,local+8);
    const localNameLen=le16(v,local+26),localExtraLen=le16(v,local+28);
    const begin=local+30+localNameLen+localExtraLen,end=begin+compressed;
    if(localFlags!==flags||localMethod!==method||localNameLen!==nameBytes.length||end>offset)throw new Error('ZIP中央／ローカル情報が一致しません');
    if(a.subarray(local+30,local+30+localNameLen).some((b,j)=>b!==nameBytes[j]))throw new Error('ZIP中央／ローカル名が一致しません');
    if(!(flags&8)&&(le32(v,local+14)!==checksum||le32(v,local+18)!==compressed||le32(v,local+22)!==uncompressed))throw new Error('ZIP中央／ローカルサイズ・CRCが一致しません');
    for(const [from,to] of localRanges)if(local<to&&end>from)throw new Error('ZIPローカルエントリーが重複しています');
    localRanges.push([local,end]);
    entries.set(name,{name,method,compressed,uncompressed,local,checksum,time:le16(v,start+12),date:le16(v,start+14),external:le32(v,start+38),internal:le16(v,start+36)});
  }
  if(p!==offset+size)throw new Error('ZIPディレクトリ末尾が一致しません');
  async function extract(name){
    const info=entries.get(name);if(!info)return null;
    const p=info.local;
    if(le32(v,p)!==0x04034b50)throw new Error('ZIPローカルヘッダーが不正です');
    const n=le16(v,p+26),extra=le16(v,p+28),begin=p+30+n+extra;
    check(v,begin,info.compressed);
    const raw=a.subarray(begin,begin+info.compressed);
    let out;
    if(info.method===0)out=raw.slice();
    else{
      if(typeof DecompressionStream==='undefined')throw new Error('ブラウザーがZIP展開に対応していません。先にZIPを解凍してファイルを選択してください');
      const ds=new DecompressionStream('deflate-raw');
      const reader=new Blob([raw]).stream().pipeThrough(ds).getReader();
      const chunks=[];let received=0;
      try{while(true){const {value,done}=await reader.read();if(done)break;received+=value.length;if(received>MAX_ENTRY||received>info.uncompressed)throw new Error('ZIPの展開サイズが不正です');chunks.push(value);}}finally{reader.releaseLock();}
      out=new Uint8Array(received);let o=0;for(const c of chunks){out.set(c,o);o+=c.length;}
    }
    if(out.length!==info.uncompressed)throw new Error('ZIP展開サイズが一致しません');
    if(crc32(out)!==info.checksum)throw new Error('ZIPのCRC32が一致しません');
    return out;
  }
  return {entries,extract};
}
export async function extractSaveSet(data){
  const zip=parseZip(data);
  let accountName=[...zip.entries.keys()].find(n=>n==='SettingsAccount/settings.json');
  let slotName=[...zip.entries.keys()].find(n=>n==='Saves/save_0.save');
  if(!accountName&&!slotName)throw new Error('ZIP内にSettingsAccount/settings.jsonまたはSaves/save_0.saveが見つかりません');
  return {account:accountName?await zip.extract(accountName):null,save:slotName?await zip.extract(slotName):null,entries:zip.entries.size};
}

   
                                                                               
                                                                           
                                                                           
                                                                                
   
export async function repackSettingsZip(originalZip,editedAccount){
  const archive=parseZip(originalZip);
  const target='SettingsAccount/settings.json';
  if(!archive.entries.has(target))throw new Error('ZIP内に編集対象のsettings.jsonがありません');
  const edit=editedAccount instanceof Uint8Array?editedAccount:new Uint8Array(editedAccount);
  if(edit.length>2_000_000)throw new Error('編集後のsettings.jsonが大きすぎます');
  parseAccount(edit);
  parseAccount(await archive.extract(target));
  const enc=new TextEncoder();
  const segments=[],central=[];
  let offset=0,centralLength=0,allSize=0;
  const uint16=(v,o,n)=>v.setUint16(o,n,true);
  const uint32=(v,o,n)=>v.setUint32(o,n>>>0,true);
  for(const [name,info] of archive.entries){
    const raw=name===target?edit:await archive.extract(name);
                                                                                 
    if(name===target)await archive.extract(name);
    allSize+=raw.length;if(allSize>MAX_TOTAL)throw new Error('ZIPの再構築サイズが上限を超えています');
    const path=enc.encode(name);
    if(path.length>65535)throw new Error('ZIPパスが長すぎます');
    const hash=crc32(raw), method=0, utf8=0x800;
    const local=new Uint8Array(30+path.length);const lv=new DataView(local.buffer);
    uint32(lv,0,0x04034b50);uint16(lv,4,20);uint16(lv,6,utf8);uint16(lv,8,method);
    uint16(lv,10,info.time);uint16(lv,12,info.date);uint32(lv,14,hash);
    uint32(lv,18,raw.length);uint32(lv,22,raw.length);uint16(lv,26,path.length);
    local.set(path,30);
    const center=new Uint8Array(46+path.length);const cv=new DataView(center.buffer);
    uint32(cv,0,0x02014b50);uint16(cv,4,20);uint16(cv,6,20);uint16(cv,8,utf8);uint16(cv,10,method);
    uint16(cv,12,info.time);uint16(cv,14,info.date);uint32(cv,16,hash);
    uint32(cv,20,raw.length);uint32(cv,24,raw.length);uint16(cv,28,path.length);
    uint16(cv,36,info.internal);uint32(cv,38,info.external);
    uint32(cv,42,offset);center.set(path,46);
    segments.push(local,raw);central.push(center);centralLength+=center.length;
    offset+=local.length+raw.length;
    if(offset>0xffffffff)throw new Error('ZIP64が必要なサイズは未対応です');
  }
  if(archive.entries.size>65534||offset+centralLength+22>MAX_ARCHIVE)throw new Error('出力ZIPの容量上限を超えています');
  const end=new Uint8Array(22);const e=new DataView(end.buffer);
  uint32(e,0,0x06054b50);uint16(e,8,archive.entries.size);uint16(e,10,archive.entries.size);
  uint32(e,12,centralLength);uint32(e,16,offset);
  const result=new Uint8Array(offset+centralLength+22);let o=0;
  for(const seg of [...segments,...central,end]){result.set(seg,o);o+=seg.length;}
  if(o!==result.length)throw new Error('ZIP出力サイズが一致しません');
                                                                           
  const verified=parseZip(result);
  if(verified.entries.size!==archive.entries.size)throw new Error('ZIPエントリー数が変化しました');
  const back=await verified.extract(target);
  if(back.length!==edit.length||back.some((value,i)=>value!==edit[i]))throw new Error('ZIPの編集内容が一致しません');
  return result;
}
