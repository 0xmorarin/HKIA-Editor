   
                                                       
                                                                                
                                                                              
                                                                
   
export const MAGIC = Uint8Array.from([0xa1,0xa2,0xf8,0x33,0x3c,0x66,0xec,0x45,0x5b,0xaa,0x2d,0xfc,0x63,0x25,0xc2,0x43,0x7a,0x77,0x9c,0x99,0x06,0xee,0xcf,0xf0,0xc0,0x22,0xe5,0xf6,0xb6,0xca,0x73,0xb8]);
const MAX_INPUT = 25 * 1024 * 1024;
const MAX_OUTPUT = 45 * 1024 * 1024;
const SAFE_VERSIONS = new Set(['3.0.0', '3.0.1']);
const decoder = new TextDecoder('utf-8',{fatal:true});

function toBuffer(x){
  if(x instanceof Uint8Array) return x;
  if(x instanceof ArrayBuffer) return new Uint8Array(x);
  throw new TypeError('Uint8ArrayまたはArrayBufferが必要です');
}
function mapKeyIdentity(key,depth=0){
  if(depth>16)throw new Error('MessagePack map key nesting exceeds validation budget');
  if(key===null)return ['null'];
  if(typeof key==='string')return ['str',key];
  if(typeof key==='boolean')return ['bool',key];
  if(typeof key==='bigint')return ['int',key.toString()];
  if(typeof key==='number'){
    if(Number.isNaN(key))throw new Error('Ambiguous NaN MessagePack map key');
    if(!Number.isFinite(key))throw new Error('Nonfinite MessagePack map key');
    if(Number.isInteger(key)&&Number.isSafeInteger(key))return ['int',BigInt(key).toString()];
    return ['float',Object.is(key,-0)?'0':String(key)];
  }
  if(key instanceof Uint8Array){
    if(key.length>65536)throw new Error('Oversized MessagePack binary map key');
    return ['bin',Array.from(key,b=>b.toString(16).padStart(2,'0')).join('')];
  }
  if(Array.isArray(key)){
    if(key.length>4096)throw new Error('Oversized MessagePack array map key');
    return ['array',key.map(x=>mapKeyIdentity(x,depth+1))];
  }
  if(key&&typeof key==='object'&&key.__timestamp===true){
    return ['timestamp',String(key.seconds),String(key.nanoseconds)];
  }
  if(key&&typeof key==='object'&&Number.isInteger(key.__ext)&&key.bytes instanceof Uint8Array){
    return ['ext',key.__ext,mapKeyIdentity(key.bytes,depth+1)];
  }
  throw new Error('Unsupported complex MessagePack map key');
}

function findMagic(raw){
  let at=-1;
  outer: for(let i=32;i<=raw.length-MAGIC.length;i++){
    for(let j=0;j<MAGIC.length;j++)if(raw[i+j]!==MAGIC[j])continue outer;
    if(at>=0)throw new Error('LZ4 markerが複数あり形式が不明です');
    at=i;
  }
  if(at<32)throw new Error('対応するHKIAセーブのLZ4 markerが見つかりません');
  return at;
}

export function lz4Decompress(input,expected){
  const src=toBuffer(input); if(!Number.isSafeInteger(expected)||expected<0||expected>MAX_OUTPUT)throw new Error('LZ4展開サイズが不正です');
  const dst=new Uint8Array(expected);let i=0,o=0;
  while(i<src.length){
    const token=src[i++];let literals=token>>>4;
    if(literals===15){let b;do{if(i>=src.length)throw new Error('LZ4 literal長が途中で切れています');b=src[i++];literals+=b;}while(b===255);}
    if(i+literals>src.length||o+literals>dst.length)throw new Error('LZ4 literal境界エラー');
    dst.set(src.subarray(i,i+literals),o);i+=literals;o+=literals;
    if(i===src.length)break;
    if(i+2>src.length)throw new Error('LZ4 match offsetが不足しています');
    const distance=src[i]|src[i+1]<<8;i+=2;
    if(distance===0||distance>o)throw new Error('LZ4 match distanceが不正です');
    let match=(token&15)+4;
    if((token&15)===15){let b;do{if(i>=src.length)throw new Error('LZ4 match長が途中で切れています');b=src[i++];match+=b;}while(b===255);}
    if(o+match>dst.length)throw new Error('LZ4 matchが出力を超過しました');
    for(let j=0;j<match;j++)dst[o+j]=dst[o+j-distance];
    o+=match;
  }
  if(o!==expected)throw new Error(`LZ4 length mismatch: ${o} != ${expected}`);
  return dst;
}

                                                                                                  
export class MessagePackReader{
  constructor(bytes){this.b=toBuffer(bytes);this.p=0;this.v=new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);this.nodes=0;}
  remain(n){if(n<0||this.p+n>this.b.length)throw new Error('MessagePackが途中で切れています');}
  u8(){this.remain(1);return this.b[this.p++];}
  u16(){this.remain(2);const r=this.v.getUint16(this.p,false);this.p+=2;return r;}
  u32(){this.remain(4);const r=this.v.getUint32(this.p,false);this.p+=4;return r;}
  i8(){this.remain(1);return this.v.getInt8(this.p++);}
  i16(){this.remain(2);const r=this.v.getInt16(this.p,false);this.p+=2;return r;}
  i32(){this.remain(4);const r=this.v.getInt32(this.p,false);this.p+=4;return r;}
  u64(){this.remain(8);const n=this.v.getBigUint64(this.p,false);this.p+=8;return n<=BigInt(Number.MAX_SAFE_INTEGER)?Number(n):n;}
  i64(){this.remain(8);const n=this.v.getBigInt64(this.p,false);this.p+=8;return n<=BigInt(Number.MAX_SAFE_INTEGER)&&n>=BigInt(Number.MIN_SAFE_INTEGER)?Number(n):n;}
  f32(){this.remain(4);const r=this.v.getFloat32(this.p,false);this.p+=4;return r;}
  f64(){this.remain(8);const r=this.v.getFloat64(this.p,false);this.p+=8;return r;}
  str(n){this.remain(n);let s=decoder.decode(this.b.subarray(this.p,this.p+n));this.p+=n;return s;}
  bin(n){this.remain(n);let r=this.b.slice(this.p,this.p+n);this.p+=n;return r;}
  arr(n,depth){if(n>1_000_000)throw new Error('配列が大きすぎます');const a=[];for(let k=0;k<n;k++)a.push(this.read(depth+1));return a;}
  map(n,depth){if(n>1_000_000)throw new Error('マップが大きすぎます');const a=new Map(),seen=new Set();for(let k=0;k<n;k++){const key=this.read(depth+1);const identity=JSON.stringify(mapKeyIdentity(key));if(identity.length>131072)throw new Error('Oversized MessagePack map key identity');if(seen.has(identity))throw new Error('Duplicate MessagePack map key (ambiguous native dictionary)');seen.add(identity);a.set(key,this.read(depth+1));}return a;}
  ext(n){const code=this.i8();const raw=this.bin(n);
    if(code!==-1)return {__ext:code,bytes:raw};
    const v=new DataView(raw.buffer,raw.byteOffset,raw.byteLength);
    if(n===4)return {__timestamp:true,seconds:v.getUint32(0,false),nanoseconds:0};
    if(n===8){const x=v.getBigUint64(0,false);return {__timestamp:true,seconds:Number(x&0x3ffffffffn),nanoseconds:Number(x>>34n)};}
    if(n===12)return {__timestamp:true,seconds:Number(v.getBigInt64(4,false)),nanoseconds:v.getUint32(0,false)};
    throw new Error('MessagePack timestamp長が不正です');
  }
  read(depth=0){
    if(depth>80)throw new Error('MessagePack nestingが深すぎます');
    if(++this.nodes>2_000_000)throw new Error('MessagePackノード数が多すぎます');
    const op=this.u8();
    if(op<=0x7f)return op;
    if(op>=0xe0)return op-256;
    if((op&0xf0)===0x80)return this.map(op&15,depth);
    if((op&0xf0)===0x90)return this.arr(op&15,depth);
    if((op&0xe0)===0xa0)return this.str(op&31);
    switch(op){
      case 0xc0:return null;
      case 0xc2:return false;
      case 0xc3:return true;
      case 0xc4:return this.bin(this.u8());
      case 0xc5:return this.bin(this.u16());
      case 0xc6:return this.bin(this.u32());
      case 0xc7:return this.ext(this.u8());
      case 0xc8:return this.ext(this.u16());
      case 0xc9:return this.ext(this.u32());
      case 0xca:return this.f32();
      case 0xcb:return this.f64();
      case 0xcc:return this.u8();
      case 0xcd:return this.u16();
      case 0xce:return this.u32();
      case 0xcf:return this.u64();
      case 0xd0:return this.i8();
      case 0xd1:return this.i16();
      case 0xd2:return this.i32();
      case 0xd3:return this.i64();
      case 0xd4:return this.ext(1);
      case 0xd5:return this.ext(2);
      case 0xd6:return this.ext(4);
      case 0xd7:return this.ext(8);
      case 0xd8:return this.ext(16);
      case 0xd9:return this.str(this.u8());
      case 0xda:return this.str(this.u16());
      case 0xdb:return this.str(this.u32());
      case 0xdc:return this.arr(this.u16(),depth);
      case 0xdd:return this.arr(this.u32(),depth);
      case 0xde:return this.map(this.u16(),depth);
      case 0xdf:return this.map(this.u32(),depth);
      default:throw new Error(`未対応のMessagePack tag 0x${op.toString(16)}`);
    }
  }
}

   
                                                                                
                                                                               
                                                                           
                                                                  
                                                         
   
export function inspectSaveGameV2Header(buffer, markerOffset){
  const raw=toBuffer(buffer);
  const pos=markerOffset===undefined?findMagic(raw):markerOffset;
  if(!Number.isInteger(pos)||pos<40||pos>raw.length-MAGIC.length)throw new Error('SaveGameV2ヘッダー範囲が不正です');
  const prefix=raw.subarray(0,pos);
  if(prefix.length<34)throw new Error('SaveGameV2ヘッダーが短すぎます');
  const p=new MessagePackReader(prefix.subarray(32));
  const first=p.read();
  if(!Array.isArray(first)||first.length!==8||!first.slice(0,4).every(isU32))throw new Error('SaveGameV2 Guid／ヘッダー構造が不正です');
  const [, , , ,version,versionInt,createdAt,timePlayed]=first;
  if(typeof version!=='string'||!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version))throw new Error('SaveGameV2バージョン形式が不正です');
  const [major,minor,patch]=version.split('.').map(Number);
  if(![major,minor,patch].every(x=>Number.isInteger(x)&&x>=0&&x<100)||!Number.isSafeInteger(versionInt)||versionInt!==(major*10000+minor*100+patch))throw new Error('SaveGameV2バージョン番号が一致しません');
  if(!Array.isArray(createdAt)||createdAt.length!==2||createdAt[0]?.__timestamp!==true||!Number.isInteger(createdAt[1])||Math.abs(createdAt[1])>840)throw new Error('SaveGameV2作成日時が不正です');
  if(!(typeof timePlayed==='bigint'||Number.isSafeInteger(timePlayed))||timePlayed<0)throw new Error('SaveGameV2プレイ時間が不正です');
  const metadata=p.read();
  if(!(metadata instanceof Map)||metadata.size>256)throw new Error('SaveGameV2 Metadata構造が不正です');
  for(const [key,entry] of metadata){
    if(typeof key!=='string'||key.length>128||!Array.isArray(entry)||entry.length!==2||![0,1,2,3].includes(entry[0])||!Array.isArray(entry[1])||entry[1].length!==1)throw new Error('SaveGameV2 MetadataEntryが不正です');
    const value=entry[1][0];
    if(!(entry[0]===0&&(typeof value==='bigint'||Number.isSafeInteger(value))||entry[0]===1&&typeof value==='number'&&Number.isFinite(value)||entry[0]===2&&typeof value==='string'||entry[0]===3&&typeof value==='boolean'))throw new Error('SaveGameV2 MetadataEntryの型が不正です');
  }
                                                                            
                                                                               
                                                                               
  const ancestorsPart=p.read();
  if(!Array.isArray(ancestorsPart)||ancestorsPart.length>1000||!ancestorsPart.every(isU32))throw new Error('SaveGameV2 Ancestors構造が不正です');
  for(let i=0;i<ancestorsPart.length*3;i++)if(!isU32(p.read()))throw new Error('SaveGameV2 Ancestors Guid値が不正です');
  const platform=p.read();
  if(!Array.isArray(platform)||platform.length!==1||platform[0]!==9)throw new Error('SaveGameV2のSwitchプラットフォーム識別が不正です');
  if(p.p!==p.b.length)throw new Error('SaveGameV2ヘッダー末尾に不明なデータがあります');
  return {
    applicationVersion:version,applicationVersionInt:versionInt,
    platform:'Switch',platformType:9,ancestorCount:ancestorsPart.length,
    metadataEntryCount:metadata.size,headerBytes:pos,
    opaqueSignatureBytes:32,signatureVerified:false,integrityVerified:false,
                                                                                           
    createdAtDefined:createdAt[0].seconds>=0,editable:false
  };
}

function unpackTop(bytes){const r=new MessagePackReader(bytes);const a=[];while(r.p<r.b.length){a.push(r.read());if(a.length>180_000)throw new Error('MessagePack値が多すぎます');}return a;}
                                                                                                              
function summarizeCollectionHistory(root){
  const stack=[root]; let found=null; let visits=0;
  while(stack.length){
    if(++visits>1_000_000)throw new Error('コレクション構造が大きすぎます');
    const x=stack.pop();
    if(Array.isArray(x)){
      if(x.length===2 && x[0]===39 && Array.isArray(x[1]) && x[1].length===2 && x[1][0] instanceof Map && x[1][1] instanceof Map){
        if(found)throw new Error('複数のCollection履歴が存在し形式が不明です');
        found=x[1]; continue;
      }
      for(let i=x.length-1;i>=0;i--)stack.push(x[i]);
    }else if(x instanceof Map){
      for(const v of x.values())stack.push(v);
    }
  }
  if(!found)throw new Error('Collection履歴を特定できません');
  const [deprecated,current]=found;
  for(const [id,ticks] of current){
    if(!Number.isInteger(id)||id<-(2**31)||id>2**31-1||!(typeof ticks==='bigint'||Number.isSafeInteger(ticks))||BigInt(ticks)<-(1n<<63n)||BigInt(ticks)>(1n<<63n)-1n)
      throw new Error('Collection履歴のIDまたは日時が不正です');
  }
  const historyEntries=Object.freeze([...current].map(([id,ticks])=>Object.freeze([id,ticks.toString()])));
  return {summary:{historyEntries:current.size,deprecatedEntries:deprecated.size,kind:'item-id-collected-ticks',editable:false},ids:[...current.keys()],historyEntries};
}
function isU32(x){return Number.isInteger(x)&&x>=0&&x<=0xffffffff;}
function wordsString(w){return w.map(x=>x.toString(16).padStart(8,'0')).join(':');}
function timestampString(x){if(!x)return null; if(x.nanoseconds<0||x.nanoseconds>=1e9)throw new Error('Timestamp範囲不正');const date=new Date(x.seconds*1000);if(!Number.isFinite(date.getTime()))throw new Error('Timestamp範囲不正');return date.toISOString().replace(/\.\d{3}Z$/,'.'+x.nanoseconds.toString().padStart(9,'0').slice(0,7)+'Z');}

export function readSave(buffer,{structuralReadOnly=false}={}){
  if(typeof structuralReadOnly!=='boolean')throw new TypeError('structuralReadOnly must be boolean');
  const raw=toBuffer(buffer);
  if(raw.length>MAX_INPUT)throw new Error('対応上限を超えるセーブサイズです');
  const at=findMagic(raw);
  const headerInfo=inspectSaveGameV2Header(raw,at);
  const wrap=new MessagePackReader(raw.subarray(at+MAGIC.length));
  const header=wrap.u8();let count;
  if((header&0xf0)===0x90)count=header&15;
  else if(header===0xdc)count=wrap.u16();
  else if(header===0xdd)count=wrap.u32();
  else throw new Error('HKIA LZ4 wrapperがMessagePack配列ではありません');
  if(count<2||count>4097)throw new Error('HKIA LZ4ブロック数が不正です');
  const lengthsExt=wrap.read();
  if(lengthsExt?.__ext!==98)throw new Error('HKIA LZ4長さ情報がありません');
  const lengths=unpackTop(lengthsExt.bytes);
  if(lengths.length!==count-1||lengths.some(x=>!Number.isSafeInteger(x)||x<=0||x>65536))throw new Error('LZ4各ブロック長が不正です');
  if(lengths.reduce((a,b)=>a+b,0)>MAX_OUTPUT)throw new Error('セーブの展開サイズが大きすぎます');
  const parts=[];
  for(let i=0;i<lengths.length;i++){
    const part=wrap.read();if(!(part instanceof Uint8Array))throw new Error('LZ4チャンクがバイナリではありません');
    parts.push(lz4Decompress(part,lengths[i]));
  }
  if(wrap.p!==wrap.b.length)throw new Error('セーブの末尾に未解釈バイトがあります');
  const joined=new Uint8Array(lengths.reduce((a,b)=>a+b,0));let offset=0;
  for(const p of parts){joined.set(p,offset);offset+=p.length;}
  const values=unpackTop(joined);
  const version=values[0]?.[2]?.[0]?.[1]?.[2];
  if(!SAFE_VERSIONS.has(version)&&!structuralReadOnly)throw new Error(`未検証の保存バージョン: ${String(version)}`);
  if(typeof version!=='string'||!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version))throw new Error('内部バージョンが不正です');
  if(headerInfo.applicationVersion!==version)throw new Error('SaveGameV2とセーブ内容のバージョンが一致しません');
  let collectionDetail,collectionIssue=false;
  try{collectionDetail=summarizeCollectionHistory(values[0]);}
  catch(e){if(!structuralReadOnly)throw e;collectionIssue=true;collectionDetail={summary:null,ids:[],historyEntries:[]};}
  const {summary:collections,ids:collectedItemIds,historyEntries:collectionHistoryEntries}=collectionDetail;
  const achievements=[],counters=[];const aIds=new Set(),cIds=new Set(),aGuids=new Set(),cGuids=new Set();
  const domainIssues={achievement:false,counter:false};let appendedAchievementFields=0,appendedCounterFields=0,unknownUnions=0;
  for(let i=0;i<values.length;){
    const item=values[i];
    const knownTag=Array.isArray(item)&&item.length===2&&(item[0]===16||item[0]===17);
    if(!knownTag||!Array.isArray(item[1])||item[1].length!==3||!Number.isSafeInteger(item[1][0])||item[1][0]<0){
      if(knownTag){
        if(!structuralReadOnly)throw new Error('Malformed known model union header');
        domainIssues[item[0]===16?'achievement':'counter']=true;
      }
      if(i>0&&Array.isArray(item)&&item.length===2&&Number.isInteger(item[0])&&![16,17].includes(item[0]))unknownUnions++;
      i++;continue;
    }
    const tag=item[0],id=item[1][0];
    const w=[item[1][1],item[1][2],values[i+1],values[i+2]];
    const data=values[i+3];
    if(!w.every(isU32)||!Array.isArray(data)||data.length<3||(!structuralReadOnly&&data.length!==3)){
      if(!structuralReadOnly)throw new Error(`文書${id}のGUID/モデル構造が不正です`);
      domainIssues[tag===16?'achievement':'counter']=true;i+=4;continue;
    }
    if(structuralReadOnly&&data.length>3){if(tag===16)appendedAchievementFields+=data.length-3;else appendedCounterFields+=data.length-3;}
    if(tag===16){
      const savedGuid=wordsString(w);
      if(aIds.has(id)||aGuids.has(savedGuid)||typeof data[0]!=='boolean'||typeof data[1]!=='number'||!Number.isFinite(data[1])||!(data[2]===null||data[2]?.__timestamp===true)){
        if(!structuralReadOnly)throw new Error(`AchievementModel(${id})が不正です`);
        domainIssues.achievement=true;i+=4;continue;
      }
      let completed;
      try{completed=timestampString(data[2]);}
      catch(e){if(!structuralReadOnly)throw e;domainIssues.achievement=true;i+=4;continue;}
      aIds.add(id);aGuids.add(savedGuid);
      achievements.push({id,guid:savedGuid,complete:data[0],current:data[1],completed});
      i+=4;
    }else{
      const savedGuid=wordsString(w);
      if(cIds.has(id)||cGuids.has(savedGuid)||typeof data[0]!=='number'||!Number.isFinite(data[0])||!(data[1]===null||Array.isArray(data[1])&&data[1].every(v=>typeof v==='string'))||!Array.isArray(data[2])||!data[2].every(isU32)){
        if(!structuralReadOnly)throw new Error(`GameCounterModel(${id})が不正です`);
        domainIssues.counter=true;i+=4;continue;
      }
      cIds.add(id);cGuids.add(savedGuid);
      const n=data[2].length;const tail=values.slice(i+4,i+4+3*n);
      if(tail.length!==3*n||!tail.every(isU32)){
        if(!structuralReadOnly)throw new Error(`GameCounterModel(${id})のGUID後続値が不正です`);
        domainIssues.counter=true;i+=4+3*n;continue;
      }
      counters.push({id,guid:savedGuid,current:data[0],countedGuids:n,countedValues:data[1]});
      i+=4+3*n;
    }
  }
  if(!structuralReadOnly&&(!achievements.length||!counters.length))throw new Error('AchievementModel / GameCounterModelが確認できません');
  const readable={achievement:achievements.length>0&&!domainIssues.achievement,counter:counters.length>0&&!domainIssues.counter,
    'collection-history':!collectionIssue};
  if(structuralReadOnly&&!Object.values(readable).some(Boolean))throw new Error('No independently recognized native save domains');
  return {version,achievements:readable.achievement?achievements:[],counters:readable.counter?counters:[],collections,collectedItemIds,collectionHistoryEntries,
    meta:{lz4Blocks:lengths.length,bytes:raw.length,expandedBytes:joined.length,values:values.length,header:headerInfo},raw,
    structural:{unverifiedVersion:!SAFE_VERSIONS.has(version),appendedAchievementFields,appendedCounterFields,unknownUnions,readable}};
}

export function readSaveStructurally(buffer){
  const s=readSave(buffer,{structuralReadOnly:true});
  const known=SAFE_VERSIONS.has(s.version);
  const cloneAchievement=x=>Object.freeze({id:x.id,guid:x.guid,complete:x.complete,current:x.current,completed:x.completed});
  const cloneCounter=x=>Object.freeze({id:x.id,guid:x.guid,current:x.current,countedGuids:x.countedGuids,
    countedValues:x.countedValues===null?null:Object.freeze(x.countedValues.slice())});
  return Object.freeze({schema:'HKIA.04.StructuralReadOnly.1',version:s.version,versionKnown:known,
    state:known?'KNOWN_VERSION_STRUCTURAL':'UNKNOWN_VERSION_STRUCTURAL',
    achievements:Object.freeze(s.achievements.map(cloneAchievement)),
    counters:Object.freeze(s.counters.map(cloneCounter)),
    collectionHistoryEntries:Object.freeze(s.collectionHistoryEntries.map(([id,ticks])=>Object.freeze([id,ticks]))),
    collectionHistoryCount:s.collections?.historyEntries??null,
    readable:Object.freeze({...s.structural.readable}),
    extraFields:Object.freeze({achievement:s.structural.readable.achievement?s.structural.appendedAchievementFields:null,
      counter:s.structural.readable.counter?s.structural.appendedCounterFields:null}),
    unknownUnionTokens:s.structural.unknownUnions,
    preservationRequired:true,unknownFieldSchemaVerified:false,
    timestampUtcVerified:false,signatureVerified:false,integrityVerified:false,
    nativeExportAuthorized:false,writerEnabled:false,gameAccepted:false,hardwareVerified:false});
}
