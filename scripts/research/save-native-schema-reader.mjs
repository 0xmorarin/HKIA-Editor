/** Version-pinned Native DbRoot research reader. This is NOT the generic
 * MessagePack reader: the game emits four scalar tokens for one Hash128.
 * Every logical container entry is consumed using the IL2CPP field schema.
 * Unknown types, unions, extra fields and duplicate *typed* dictionary keys
 * fail closed. No Native writer/export or public browser import is authorized.
 */
import {MessagePackReader} from '../../src/save.js';
import SCHEMA from './native-v301-dbroot-schema.json' with {type:'json'};
import RECIPE_EVIDENCE from '../../docs/03-linkage/v18/RECIPE_NATIVE_SOURCE.json' with {type:'json'};
const RECIPE_MEMBER_IDS=new Set(RECIPE_EVIDENCE.items.map(x=>x.itemId));
function freezeSchema(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){for(const v of Object.values(x))freezeSchema(v);Object.freeze(x);}return x;}
freezeSchema(SCHEMA);
const LIMITS={int:[-2147483648n,2147483647n],uint:[0n,4294967295n],long:[-(1n<<63n),(1n<<63n)-1n],ulong:[0n,(1n<<64n)-1n],short:[-32768n,32767n],ushort:[0n,65535n],byte:[0n,255n],sbyte:[-128n,127n]};
const MAX_NODES=2_000_000,MAX_CONTAINER=1_000_000;
const VERSIONS=new Set(['3.0.0','3.0.1']);
const SHOP='ShopManagerTraitModel.ShopItemKey';
const GUID=x=>x.map(n=>n.toString(16).padStart(8,'0')).join(':');
function ensure(ok,message){if(!ok)throw Error(message);}
function isInt(v,lo,hi){return (typeof v==='bigint'||Number.isSafeInteger(v))&&BigInt(v)>=lo&&BigInt(v)<=hi;}
function exactDate(v){if(v===null)return null;ensure(v?.__timestamp===true&&Number.isSafeInteger(v.seconds)&&Number.isInteger(v.nanoseconds)&&v.nanoseconds>=0&&v.nanoseconds<1e9&&v.nanoseconds%100===0,'Invalid Native DateTime');const d=new Date(v.seconds*1000);ensure(Number.isFinite(d.getTime()),'Native DateTime outside JS range');return d.toISOString().replace(/\.\d{3}Z$/,'.'+String(v.nanoseconds).padStart(9,'0').slice(0,7)+'Z');}
const nameOf=t=>typeof t==='string'?t:t[0]==='type'?SCHEMA.types[t[1]]?.name:t[0];
function typedIdentity(spec,value){
  if(spec==='Hash128'||spec==='SaveGameGuid'){
    ensure(Array.isArray(value)&&value.length===4&&value.every(x=>isInt(x,0n,4294967295n)),'Invalid Hash128 dictionary key');
    return 'h:'+GUID(value);
  }
  if(spec==='string'){ensure(typeof value==='string','Invalid string dictionary key');return 's:'+value;}
  if(typeof spec==='string'&&LIMITS[spec]){ensure(isInt(value,...LIMITS[spec]),'Invalid integer dictionary key');return 'i:'+String(value);}
  if(Array.isArray(spec)&&spec[0]==='type'){
    const type=SCHEMA.types[spec[1]];if(type?.enum)return typedIdentity(type.enum,value);
    if(type?.name===SHOP){ensure(Array.isArray(value)&&value.length===3,'Invalid ShopItemKey dictionary key');return 'shop:'+typedIdentity('Hash128',value[0])+'/'+typedIdentity('Hash128',value[1])+'/'+typedIdentity('int',value[2]);}
  }
  throw Error('Unsupported Native dictionary key schema');
}
/** Parse all logical DbRoot documents and dictionaries. Only target model
 * spans and known typed state are returned to the internal transaction engine.
 * Non-target objects are never serialized from these intermediate values. */
export function decodeNativePayloadBySchema(expanded,expectedVersion){
  ensure(expanded instanceof Uint8Array&&expanded.length>0&&expanded.length<=45*1024*1024,'Native payload bounds');
  ensure(VERSIONS.has(expectedVersion),'Unsupported schema version');
  const r=new MessagePackReader(expanded);let nodes=0;
  const stats={documents:0,dictionaries:0,dictionaryEntries:0,hash128Dictionaries:0,hash128Entries:0,compoundDictionaries:0,compoundEntries:0,scalarDictionaries:0,scalarEntries:0,typedDuplicateKeys:0,distinctDocumentTypeIds:0,crossTypeDocumentIdReuses:0};
  const inventoryRecipeRows=[],inventoryRecipeRecountRows=[];const models=new Map(),collectionSpans=new Map(),achievements=[],counters=[];
  let collection=null,version=null,collectionMap=null,collectionVersionNumber=null;
  function fail(message){throw Error('Native schema: '+message);}
  function header(kind){const op=r.u8();let n;
    if(kind==='array'){if((op&0xf0)===0x90)n=op&15;else if(op===0xdc)n=r.u16();else if(op===0xdd)n=r.u32();}
    else {if((op&0xf0)===0x80)n=op&15;else if(op===0xde)n=r.u16();else if(op===0xdf)n=r.u32();}
    if(n===undefined||n>MAX_CONTAINER)fail('invalid '+kind+' header');return n;}
  function integer(lo,hi,label){const op=r.b[r.p];if(!(op<=0x7f||op>=0xe0||(op>=0xcc&&op<=0xd3)))fail('invalid integer token '+label);const v=r.read();if(!isInt(v,lo,hi))fail('invalid '+label);return v;}
  function read(spec,depth=0,context=null){
    if(depth>80||++nodes>MAX_NODES)fail('logical traversal budget');
    const start=r.p;
    if(typeof spec==='string'){
      if(spec==='Hash128'||spec==='SaveGameGuid'){
        const v=[];for(let i=0;i<4;i++){v.push(integer(0n,4294967295n,'Hash128 UInt32 word'));}return v;
      }
      if(LIMITS[spec])return integer(...LIMITS[spec],spec);
      if(['string','byte[]','DateTime','float','bool'].includes(spec)){
        const op=r.b[r.p];if(spec==='float'&&op!==0xca)fail('invalid Single token');if(spec==='DateTime'&&![0xd6,0xd7,0xc7].includes(op))fail('invalid DateTime token');
        const v=r.read();if(spec==='string'&&!(v===null||typeof v==='string')||spec==='byte[]'&&!(v===null||v instanceof Uint8Array)||spec==='DateTime'&&v?.__timestamp!==true||spec==='float'&&!(typeof v==='number'&&Number.isFinite(v))||spec==='bool'&&typeof v!=='boolean')fail('invalid '+spec);return v;
      }
      if(['Vector3','Quaternion','Color'].includes(spec)){
        const n=spec==='Vector3'?3:4;if(header('array')!==n)fail('vector width');return Array.from({length:n},()=>read('float',depth+1));
      }
      if(spec==='FixedString128Bytes'){const v=r.read();if(typeof v!=='string')fail('fixed string');return v;}
      fail('unsupported primitive '+spec);
    }
    const [kind,...args]=spec;
    if(kind==='Nullable'){if(r.b[r.p]===0xc0){r.p++;return null;}return read(args[0],depth+1,context);}
    if(['array','List','HashSet','IEnumerable'].includes(kind)){
      if(r.b[r.p]===0xc0){r.p++;return null;}const n=header('array'),a=[];
      for(let i=0;i<n;i++)a.push(read(args[0],depth+1,context));return a;
    }
    if(kind==='Dictionary'){
      if(r.b[r.p]===0xc0){r.p++;return null;}const mapStart=r.p,n=header('map'),bodyStart=r.p,a=[],keys=new Set();
      if(context==='collection-key1'){ensure(collectionMap===null,'Duplicate Collection Key1 map');collectionMap={start:mapStart,body:bodyStart,end:null,count:n,pairs:new Map()};}
      stats.dictionaries++;stats.dictionaryEntries+=n;
      const type=args[0],isHash=type==='Hash128',isCompound=nameOf(type)===SHOP;
      if(isHash){stats.hash128Dictionaries++;stats.hash128Entries+=n;}else if(isCompound){stats.compoundDictionaries++;stats.compoundEntries+=n;}else{stats.scalarDictionaries++;stats.scalarEntries+=n;}
      for(let i=0;i<n;i++){
        const pairStart=r.p,key=read(type,depth+1),id=typedIdentity(type,key);
        if(keys.has(id))fail('Duplicate typed Native dictionary key');keys.add(id);
        const valueStart=r.p,value=read(args[1],depth+1);
        a.push([key,value]);
        if(context==='collection-key1'){
          ensure(!collectionSpans.has(key),'Duplicate Collection ItemId');
          collectionSpans.set(key,{start:valueStart,end:r.p,value:String(value)});
          collectionMap.pairs.set(key,{start:pairStart,end:r.p});
        }
      }if(context==='collection-key1')collectionMap.end=r.p;return a;
    }
    if(kind!=='type')fail('unsupported schema descriptor');
    const type=SCHEMA.types[args[0]];if(!type)fail('unknown schema type');
    if(type.enum)return read(type.enum,depth+1,context);
    if(r.b[r.p]===0xc0){r.p++;return null;}
    if(Object.keys(type.union).length){
      if(header('array')!==2)fail('union width');const tag=read('int',depth+1);const branch=type.union[tag];
      if(!branch)fail('unknown union tag '+type.name);const v=read(branch,depth+1,{union:type.name,tag});
      return [tag,v];
    }
    const n=header('array'),keys=Object.keys(type.fields).map(Number),count=keys.length?Math.max(...keys)+1:0;
    if(n>count)fail('appended fields in '+type.name);
    const targetData=type.name==='AchievementData'||type.name==='GameCounterData';
    const a=[],spans=[];
    for(let i=0;i<n;i++){
      const at=r.p;let v;
      if(type.fields[i])v=read(type.fields[i],depth+1,type.name==='GameCollectionsTraitModel'&&i===1?'collection-key1':null);
      else {if(r.u8()!==0xc0)fail('non-nil unassigned field '+type.name);v=null;}
      a.push(v);if(targetData||type.name==='InventoryItem')spans.push({start:at,end:r.p,value:v});
    }
    if(type.name==='InventoryItem'&&RECIPE_MEMBER_IDS.has(a[1])&&inventoryRecipeRecountRows.length<25){
      inventoryRecipeRecountRows.push({documentId:context?.union==='IDocument'&&context.tag===1&&n===5?a[0]:null,itemId:a[1],uniqueId:a[2],quantity:a[3],uniqueData:a[4]});
    }
    if(type.name==='InventoryItem'&&a[1]===5913958){
      if(context?.union!=='IDocument'||context.tag!==1||n!==5)fail('invalid recipe inventory row');
      inventoryRecipeRows.push({id:a[0],itemId:a[1],uniqueId:a[2],quantity:a[3],uniqueData:a[4],span:spans[3]});
    }
    if(targetData){if(n!==3)fail('known record field count');return {values:a,spans};}
    if(type.name==='AchievementModel'||type.name==='GameCounterModel'){
      const tag=type.name==='AchievementModel'?16:17;
      if(context?.union!=='IDocument'||context.tag!==tag||n!==3||!Array.isArray(a[1])||!a[2]?.spans||!Number.isInteger(a[0])||a[0]<0)fail('invalid target document');
      const guid=GUID(a[1]),key=tag+'/'+guid,fields=a[2].values;
      if(models.has(key))fail('duplicate saved model GUID');
      const modelSpans=a[2].spans.map(s=>({...s}));
      if(tag===17){
        if(!Array.isArray(fields[2]))fail('invalid CountedGuids');
        if(fields[1]!==null&&(!Array.isArray(fields[1])||!fields[1].every(v=>typeof v==='string')))fail('invalid CountedValues');
        // The existing edit engine only authorizes counters with no counted state.
        // Preserve complete flattened GUID identities, not merely the count.
        modelSpans[2].value=fields[2];
        counters.push({id:a[0],guid,current:fields[0],countedGuids:fields[2].length,countedValues:fields[1],countedGuidWords:fields[2]});
      }else achievements.push({id:a[0],guid,complete:fields[0],current:fields[1],completed:exactDate(fields[2])});
      models.set(key,{id:a[0],tag,guid,spans:modelSpans});
    }
    if(type.name==='GameCollectionsTraitModel'){
      if(context?.union!=='TraitModel'||context.tag!==39||collection!==null||n!==2||!Array.isArray(a[0])||!Array.isArray(a[1]))fail('invalid/duplicate Collection trait');
      collection={key0:a[0],key1:a[1],spanCount:collectionSpans.size};
    }
    if(type.name==='CollectionVersion'){
      if(context?.union!=='IDocument'||context.tag!==18||version!==null||n!==3||typeof a[2]!=='string')fail('invalid/duplicate version document');version=a[2];collectionVersionNumber=a[1];
    }
    return a;
  }
  const root=read(SCHEMA.root);
  ensure(r.p===r.b.length,'Native schema: unconsumed payload tail');
  ensure(Array.isArray(root)&&root.length===3&&Array.isArray(root[2])&&root[2].length>0,'Native schema: invalid DbRoot');
  ensure(version===expectedVersion,'Native schema: header/payload version mismatch');
  ensure(collection&&collection.spanCount===collection.key1.length&&achievements.length&&counters.length,'Native schema: required domains absent');
  const ids=new Set(),untyped=new Set();
  for(const doc of root[2]){
    ensure(Array.isArray(doc)&&Array.isArray(doc[1])&&Number.isInteger(doc[1][0])&&doc[1][0]>=0,'Native schema: missing document Id');
    const key=doc[0]+'/'+doc[1][0];ensure(!ids.has(key),'Native schema: duplicate typed document Id');ids.add(key);
    if(untyped.has(doc[1][0]))stats.crossTypeDocumentIdReuses++;untyped.add(doc[1][0]);
  }
  stats.documents=root[2].length;stats.distinctDocumentTypeIds=ids.size;
  const collectionHistoryEntries=collection.key1.map(([id,tick])=>[id,String(tick)]);
  return {version,collectionVersionNumber,achievements,counters,collections:{historyEntries:collectionHistoryEntries.length,deprecatedEntries:collection.key0.length,kind:'item-id-collected-ticks',editable:false},
    collectedItemIds:collectionHistoryEntries.map(x=>x[0]),collectionHistoryEntries,collectionDeprecatedEntries:collection.key0,inventoryRecipeRows,inventoryRecipeRecountRows,models,collectionSpans,collectionMap,stats:Object.freeze(stats),
    fullLogicalPayloadConsumed:true,typedDictionaryKeysVerified:true,typedDocumentIdsVerified:true};
}
