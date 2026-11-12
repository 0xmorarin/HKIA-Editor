   
                                                                                 
                                                                                      
                                                                                   
   
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {parseZip} from '../../src/zip.js';
import {readSave,readSaveStructurally} from '../../src/save.js';

function classifyError(e){
  const s=String(e?.message??'');
  if(/Duplicate MessagePack map key/.test(s))return 'DUPLICATE_MAP';
  if(/重複|Duplicate saved model/.test(s))return 'DUPLICATE_IDENTITY';
  if(/バージョン/.test(s))return 'VERSION_OR_HEADER';
  if(/LZ4|MessagePack|GUID|モデル|Collection/.test(s))return 'NATIVE_STRUCTURE';
  if(/ZIP|CRC|展開サイズ/.test(s))return 'ARCHIVE_OR_CRC';
  return 'UNCLASSIFIED';
}
function inspectSlot(raw,counts){
  counts.slotRecords++;
  try{
    let item,kind='strict';
    try{item=readSave(raw);}catch(e){
      if(!String(e?.message??'').includes('未検証の保存バージョン'))throw e;
      item=readSaveStructurally(raw);kind='structural';
    }
    counts.accepted[kind]++;
    const v=item.version;
    if(/^\d{1,2}\.\d{1,2}\.\d{1,2}$/.test(v))counts.versionCounts[v]=(counts.versionCounts[v]??0)+1;
  }catch(e){const label=classifyError(e);counts.rejected[label]=(counts.rejected[label]??0)+1;}
}
async function scanBuffer(raw,counts){
  if(!(raw instanceof Uint8Array))throw Error('Expected bytes');
  if(raw.length>=4&&raw[0]===0x50&&raw[1]===0x4b){
    const zip=parseZip(raw);
    counts.archives++;
    for(const [name] of zip.entries){
      const bytes=await zip.extract(name);
      counts.crcCheckedMembers++;
      if(/\.save$|\.lbak$/i.test(name))inspectSlot(bytes,counts);
    }
  }else inspectSlot(raw,counts);
}
export async function inspectPrivateFixtureBuffersReadOnly(buffers){
  if(!Array.isArray(buffers)||!buffers.length||buffers.length>16)throw Error('Expected 1-16 local fixture inputs');
  const counts={inputFiles:buffers.length,archives:0,crcCheckedMembers:0,slotRecords:0,
    accepted:{strict:0,structural:0},rejected:{},versionCounts:{},
    nativeOutputAuthorized:false,writerEnabled:false,containsPersonalIdentifiers:false};
  for(const raw of buffers)await scanBuffer(raw,counts);
  return Object.freeze({...counts,accepted:Object.freeze(counts.accepted),rejected:Object.freeze(counts.rejected),
    versionCounts:Object.freeze(counts.versionCounts)});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const files=process.argv.slice(2);
  if(!files.length||files.length>16){console.error('Provide 1-16 local private fixtures');process.exitCode=2;}
  else{
    try{
      const inputs=[];for(const file of files){const input=await readFile(file);inputs.push(input);}
      console.log(JSON.stringify(await inspectPrivateFixtureBuffersReadOnly(inputs)));
    }catch{console.error('Private fixture audit failed; no raw error or filename logged');process.exitCode=1;}
  }
}
