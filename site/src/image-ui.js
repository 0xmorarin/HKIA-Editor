let privateMedia=null;
const missing=Object.freeze({status:'NOT_IN_SOURCE_MAP',image:null});
const guid=x=>typeof x==='string'&&/^[a-f0-9]{32}$/i.test(x)?x.toLowerCase():null;
const safePath=x=>typeof x==='string'&&/^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/.test(x);
const knownIcon=x=>x&&['EXACT','EXISTING_VERIFIED'].includes(x.status)&&safePath(x.image);
export function validateFallbackOverlay(map,overlay,baseSha,catalog){
  const fail=()=>{throw Error('Fallback overlay identity mismatch');};
  const require=x=>{if(!x)fail();};
  require(overlay?.schema==='HKIA.ImageMap.FallbackDelta.1'&&overlay.privateOnly===true&&overlay.runtimeVerified===false&&overlay.steamNativeVerified===false&&/^[a-f0-9]{64}$/.test(baseSha)&&overlay.baseImageMapSha256===baseSha);
  const index=rows=>{require(Array.isArray(rows));const m=new Map();for(const r of rows){require(guid(r.guid)===r.guid&&!m.has(r.guid));m.set(r.guid,r);}return m;};
  const ai=index(map.inGameAchievements),ci=index(map.collectionDefinitions),gi=index(map.collectionCategories),ac=index(map.accountAchievements);
  const local=index(catalog.achievements),refs=index(catalog.achievementReferences),categories=index(catalog.categories),collections=index(catalog.collections),accounts=index(catalog.accounts);
  const parentCounts=new Map(),groupCounts=new Map();
  for(const r of local.values())parentCounts.set(r.counter_guid,(parentCounts.get(r.counter_guid)||0)+1);
  for(const r of refs.values())groupCounts.set(r.group_counter_guid,(groupCounts.get(r.group_counter_guid)||0)+1);
  const coverage=(rows,base,field,status)=>{const result=index(rows);const expected=[...base.values()].filter(r=>r[field]?.status===status);require(result.size===expected.length&&expected.every(r=>result.has(r.guid)));return result;};
  const a=coverage(overlay.inGameAchievements,ai,'icon','SOURCE_NULL'),c=coverage(overlay.collectionDefinitions,ci,'directIcon','SOURCE_NULL_DERIVED'),e=coverage(overlay.accountAchievements,ac,'icon','SOURCE_NULL');
  const related=(d,p)=>{require(d?.context==='ALWAYS_SHOW_ICON_VM_ONLY'&&knownIcon(p?.icon)&&d.image===p.icon.image&&d.spritePathId===p.icon.spritePathId&&typeof d.spritePathId==='string');return Object.freeze({status:p.icon.status,image:p.icon.image,spritePathId:p.icon.spritePathId});};
  const outA=new Map(),outC=new Map(),outE=new Set();
  for(const r of a.values()){
    const b=ai.get(r.guid),d=r.detail,p=ai.get(d?.parentGuid),child=refs.get(r.guid),parent=local.get(d?.parentGuid);
    require(r.key===b.key&&r.direct==='SOURCE_NULL'&&r.list?.status==='NO_MODEL_ICON'&&r.sourceChildCount===0&&d?.status==='PARENT_ICON'&&d.nativeNavigation==='LEAF_NO_CHILDREN_SHOWDETAILS_GUARD'&&r.guid!==d.parentGuid&&child&&parent&&p&&local.has(r.guid)&&!groupCounts.has(local.get(r.guid).counter_guid)&&parentCounts.get(d.parentCounterGuid)===1&&d.parentKey===p.key&&parent.key===p.key&&child.group_counter_guid===d.parentCounterGuid&&parent.counter_guid===d.parentCounterGuid&&p.counterGuid===d.parentCounterGuid&&r.completionNotification?.status==='NO_MODEL_ICON'&&r.completionNotification?.viewRendering==='UNVERIFIED');
    outA.set(r.guid,Object.freeze({kind:'parent',icon:related(d,p),parentGuid:p.guid,parentKey:p.key}));
  }
  for(const r of c.values()){
    const b=ci.get(r.guid),d=r.detail,p=gi.get(d?.parentGuid),source=collections.get(r.guid),category=categories.get(d?.parentGuid);
    require(r.key===b.key&&r.direct==='SOURCE_NULL_DERIVED'&&r.list?.status==='NO_MODEL_ICON'&&r.sourceHidden===true&&b.hidden===true&&source?.hidden===true&&r.sourceItemCount===b.itemCount&&d?.status==='PARENT_CATEGORY_ICON'&&d.nativeNavigation==='SOURCE_HIDDEN_RUNTIME_REACHABILITY_UNVERIFIED'&&p&&category&&p.group===b.group&&category.key===b.group&&source.group===b.group);
    outC.set(r.guid,Object.freeze({kind:'category',icon:related(d,p),parentGuid:p.guid,parentKey:p.group}));
  }
  for(const r of e.values()){
    const b=ac.get(r.guid),source=accounts.get(r.guid);
    require(r.key===b.key&&r.direct==='SOURCE_NULL'&&r.sourceType===2&&source?.achievement_type==='PureExternal'&&r.inGameStickers?.status==='NOT_IN_LOCAL_TREE'&&r.platformAchievement?.status==='UNKNOWN_EXTERNAL_ICON'&&r.platformAchievement.steamAchievementId===(source.steam_achievement||null)&&!ai.has(r.guid)&&!refs.has(r.guid));outE.add(r.guid);
  }
  return Object.freeze({achievement:(id)=>outA.get(guid(id))??null,collection:(id)=>outC.get(guid(id))??null,external:(id)=>outE.has(guid(id)),counts:Object.freeze({inGame:outA.size,collection:outC.size,account:outE.size})});
}
export async function registerPrivateImageBytes(rawMap,rawOverlay,createResolver,expectedOverlaySha){
  privateMedia=null;
  const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
  const mapBytes=new Uint8Array(rawMap).slice(),overlayBytes=rawOverlay?new Uint8Array(rawOverlay).slice():null;
  const baseSha=await digest(mapBytes);
  const map=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(mapBytes));
  let overlay=null;
  if(overlayBytes){if(await digest(overlayBytes)!==expectedOverlaySha)throw Error('Fallback overlay SHA mismatch');overlay=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(overlayBytes));if(overlay.baseImageMapSha256!==baseSha)throw Error('Fallback base SHA mismatch');}
  registerPrivateImageInput(map,createResolver(map),overlay,baseSha);
}
export function createImageUi(map,resolver,catalog,overlay=null,baseSha=null){
  const check=(rows,source,key,sourceKey,predicate)=>{
    const index=new Map(source.map(x=>[x[sourceKey],x]));
    if(index.size!==source.length||rows.length!==source.length)throw Error('ImageMap catalog count mismatch: '+key);
    for(const row of rows){const matched=index.get(row[key]);if(!matched||!predicate(row,matched))throw Error('ImageMap catalog identity mismatch: '+key);}
  };
  check(map.accountAchievements,catalog.accounts,'guid','guid',(r,s)=>r.key===s.key);
  check(map.inGameAchievements,catalog.achievements,'guid','guid',(r,s)=>r.key===s.key&&r.counterGuid===s.counter_guid&&r.rewardItemId===s.reward_item_id&&r.rewardQuantity===s.reward_quantity);
  check(map.collectionCategories,catalog.categories,'guid','guid',(r,s)=>r.group===s.key&&r.icon.image===s.icon.replace(/^\.\//,''));
  check(map.collectionDefinitions,catalog.collections,'guid','guid',(r,s)=>r.key===s.key&&r.group===s.group);
  const linked=catalog.items.filter(x=>x.collection_guid);
  check(map.collectionItemIds,linked,'itemId','id',(r,s)=>r.itemGuid===s.guid&&r.collectionGuid===s.collection_guid&&r.collectionKey===s.collection_key&&r.itemKey===s.key);
  const sourceItems=new Map(catalog.items.map(x=>[x.id,x]));
  for(const r of map.rewardItemIcons){const s=sourceItems.get(r.itemId);if(!s||s.guid!==r.itemGuid||s.key!==r.itemKey)throw Error('ImageMap reward identity mismatch');}
  const itemRows=new Map(map.collectionItemIds.map(x=>[x.itemId,x]));
  const groups=new Map(map.collectionCategories.map(x=>[x.guid,x]));
  const defs=new Map(map.collectionDefinitions.map(x=>[x.guid,x]));
  const use=x=>x?.found?x.icon:missing;
  const accounts=new Set(map.accountAchievements.map(x=>x.guid)),achievements=new Set(map.inGameAchievements.map(x=>x.guid));
  const accountCache=new Map(),achievementCache=new Map(),categoryCache=new Map(),collectionCache=new Map(),itemCache=new Map(),rewardCache=new Map();
  const cached=(cache,key,read)=>{if(!cache.has(key))cache.set(key,read());return cache.get(key);};
  const fallback=overlay?validateFallbackOverlay(map,overlay,baseSha,catalog):null;
  return Object.freeze({
    relatedAchievement(id){return fallback?.achievement(id)??null;},
    relatedCollection(id,group){const d=defs.get(guid(id));return d&&d.group===group?fallback?.collection(id)??null:null;},
    externalAccount(id){return fallback?.external(id)??false;},
    fallbackCoverage:fallback?.counts??null,
    achievement(kind,id){const k=guid(id);return kind==='account'?(accounts.has(k)?cached(accountCache,k,()=>use(resolver.accountByGuid(k))):missing):(achievements.has(k)?cached(achievementCache,k,()=>use(resolver.inGameByGuid(k))):missing);},
    category(id,key){const g=groups.get(guid(id));return g&&g.group===key?cached(categoryCache,g.guid,()=>use(resolver.collectionCategoryByGuid(g.guid))):missing;},
    collection(id,group){const d=defs.get(guid(id));return d&&d.group===group?cached(collectionCache,d.guid,()=>resolver.collectionDefinitionByGuid(d.guid)):null;},
    item(id,itemGuid,collectionGuid){const row=itemRows.get(id);return row&&row.itemGuid===guid(itemGuid)&&row.collectionGuid===guid(collectionGuid)?cached(itemCache,id,()=>use(resolver.collectionItemById(id))):missing;},
    reward(id){const k=guid(id);return achievements.has(k)?cached(rewardCache,k,()=>{const r=resolver.rewardForInGameGuid(k);return r.found?r:null;}):null;},
    coverage:resolver.coverage
  });
}
export function registerPrivateImageInput(map,resolver,overlay=null,baseSha=null){privateMedia={map,resolver,overlay,baseSha,ui:null};}
export function bindPrivateImageCatalog(catalog){if(!privateMedia)return null;privateMedia.ui=null;privateMedia.ui=createImageUi(privateMedia.map,privateMedia.resolver,catalog,privateMedia.overlay,privateMedia.baseSha);return privateMedia.ui;}
export function imageUi(){return privateMedia?.ui??null;}
export function imageElement(icon,{kind='item',size=40,label='画像'}={}){
  const box=document.createElement('span');box.className='media-thumb media-'+kind;box.dataset.imageStatus=icon?.status??'NOT_IN_SOURCE_MAP';box.dataset.imageKind=kind;
  box.setAttribute('aria-label',label+(knownIcon(icon)?'':'：画像未確定'));box.title=knownIcon(icon)?label:label+'：'+(icon?.status??'NOT_IN_SOURCE_MAP');
  const fallback=()=>{box.replaceChildren();const mark=document.createElement('span');mark.className='media-null-mark';mark.textContent='—';mark.setAttribute('aria-hidden','true');box.append(mark);};
  if(!knownIcon(icon)){fallback();return box;}
  const img=document.createElement('img');img.alt='';img.width=size;img.height=size;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.dataset.spritePathId=icon.spritePathId;img.src='./'+icon.image;img.addEventListener('error',()=>{box.dataset.imageStatus='LOAD_FAILED';fallback();},{once:true});box.append(img);return box;
}
