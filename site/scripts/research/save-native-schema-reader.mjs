                                                                         
                                                                         
                                                                           
                                                                            
                                                                               
   
import {MessagePackReader} from '../../src/save.js';
import SCHEMA from './native-v301-dbroot-schema.json' with {type:'json'};
import RECIPE_EVIDENCE from '../../docs/03-linkage/v18/RECIPE_NATIVE_SOURCE.json' with {type:'json'};
export const RECIPE_EXPANSION4=Object.freeze([
  [167744018,'033d2c68:9ba1dc84:cbf57819:4c6e3f9f'],[167310698,'3d484039:f5903c64:c9322bea:f92c7365'],[297899965,'38023185:3ecfb254:98aee70c:3f60a0d4'],[575014896,'f81c864d:dd748774:cb08c53c:03f2496e']
].map(([itemId,guid])=>Object.freeze({itemId,guid:guid.split(':').map(w=>[...w].reverse().join('')).join(':')})));
export const RECIPE_EXPANSION23=Object.freeze([
  [278946815,'8b92dd3f:0b509ef4:395c95d8:e5b035fd'],
  [470867067,'a91a0df3:81224404:0ab066d1:392e09c5'],
  [650012187,'4b8b9b81:c494b3a4:5a72226a:ef45dec4'],
  [676331574,'12e67e2c:1549da44:c92dce81:4e1af77a'],
  [686416184,'8adbb2c9:282f1c94:d8a4a0b8:0fc7772e'],
  [763159048,'425f05b7:41b72a54:6808e035:74ea619d'],
  [788820261,'61010ceb:d1fca8f4:88f996c8:1a88f625'],
  [823539905,'e624dddb:d1c5ad04:683ad372:0a383486'],
  [924742307,'9c0edd3f:9a021d34:0b6bf6b2:e1e84eaf'],
  [996589226,'cfcb650b:8bc15c14:4ac502dd:b7d89663'],
  [1094683890,'5194993e:da1748c4:99b16c5b:ad0fbc80'],
  [1243081722,'8350f322:bac8aee4:4bda160c:997ed5a2'],
  [1272993231,'6cc94e3e:33ef73b4:4b4ba987:f61e2f7b'],
  [1287994935,'7e17274e:913f5084:aac61f64:3bad7f78'],
  [1358571907,'3f778f19:97d4ab14:095f65fa:8f12933f'],
  [1409872840,'84838ba0:201b4ba4:48c8bbd3:80a5f645'],
  [1426534251,'b30ce5eb:db3ded34:8a991f5e:c6593284'],
  [1743827999,'b30a1c06:b679a414:e8d20ada:1fc3d4cd'],
  [1803731982,'3b93d13f:0ea90b44:6b7f57fe:29c6c290'],
  [1872339478,'c257c5ba:db850a14:0934a57c:a255de3f'],
  [1984595003,'dcc8fef7:fa86cb04:2aee0c3a:16c99e18'],
  [2057550216,'3afa80c6:d08c0684:a8ee9b8b:f2383972'],
  [2097311220,'86865ab2:622ddb34:cb09c6d5:24dfe15f']
].map(([itemId,guid])=>Object.freeze({itemId,guid:guid.split(':').map(w=>[...w].reverse().join('')).join(':')})));
const RECIPE_EXPANSION_ALL=Object.freeze([...RECIPE_EXPANSION4,...RECIPE_EXPANSION23]);
const RECIPE_EXPANSION_IDS=new Set(RECIPE_EXPANSION_ALL.map(t=>t.itemId));
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
                                                                          
                                                                               
                                                                             
export function decodeNativePayloadBySchema(expanded,expectedVersion){
  ensure(expanded instanceof Uint8Array&&expanded.length>0&&expanded.length<=45*1024*1024,'Native payload bounds');
  ensure(VERSIONS.has(expectedVersion),'Unsupported schema version');
  const r=new MessagePackReader(expanded);let nodes=0;
  const stats={documents:0,dictionaries:0,dictionaryEntries:0,hash128Dictionaries:0,hash128Entries:0,compoundDictionaries:0,compoundEntries:0,scalarDictionaries:0,scalarEntries:0,typedDuplicateKeys:0,distinctDocumentTypeIds:0,crossTypeDocumentIdReuses:0};
  const inventoryRecipeRows=[],inventoryRecipeRecountRows=[],inventoryRecipeExpansionRows=[];const models=new Map(),collectionSpans=new Map(),achievements=[],counters=[];
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
    if(type.name==='InventoryItem'&&RECIPE_EXPANSION_IDS.has(a[1])){
                                                                                           
      if(inventoryRecipeExpansionRows.filter(x=>x.itemId===a[1]).length<2)inventoryRecipeExpansionRows.push({id:context?.union==='IDocument'&&context.tag===1&&n===5?a[0]:null,itemId:a[1],uniqueId:a[2],quantity:a[3],uniqueData:a[4],span:spans[3]});
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
    collectedItemIds:collectionHistoryEntries.map(x=>x[0]),collectionHistoryEntries,collectionDeprecatedEntries:collection.key0,inventoryRecipeRows,inventoryRecipeRecountRows,inventoryRecipeExpansionRows,recipeExpansionReferences:RECIPE_EXPANSION_ALL.map(t=>({itemId:t.itemId,celebrated:root[2].filter(x=>x[0]===8).reduce((n,x)=>n+x[1][1].filter(g=>GUID(g)===t.guid).length,0),counter:counters.reduce((n,x)=>n+x.countedGuidWords.filter(g=>GUID(g)===t.guid).length,0)})),models,collectionSpans,collectionMap,stats:Object.freeze(stats),
    fullLogicalPayloadConsumed:true,typedDictionaryKeysVerified:true,typedDocumentIdsVerified:true};
}
