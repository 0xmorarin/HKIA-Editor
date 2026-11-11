   
                                                                                            
                                                                                     
                                                                                        
                                                                                         
   
export function reconcileParentFamilies(parentManifest, collectionMatch) {
  if(parentManifest?.schema!=='HKIA.ItemParentCrosswalk.1' || !Array.isArray(parentManifest.links))
    throw new Error('親アイテム索引の形式が不正です');
  if(!collectionMatch || collectionMatch.kind!=='direct-item-id-reconciliation')
    throw new Error('保存IDの直接照合を先に実施してください');
  const sourceById=collectionMatch.byId;
  const parentByChild=new Map();
  const cross=[];
  const relationCounts={'same-collection':0,'cross-collection':0,'unassigned-child':0};
  for(const link of parentManifest.links){
    const child=sourceById.get(link.child_id),parent=sourceById.get(link.parent_id);
    if(!child||!parent||link.child_id===link.parent_id||parentByChild.has(link.child_id))
      throw new Error('親アイテムの参照先・重複が不正です');
    const expected=child.collection_key&&child.collection_key===parent.collection_key?'same-collection':
      child.collection_key&&parent.collection_key?'cross-collection':'unassigned-child';
    if(link.relation!==expected)throw new Error('親アイテムの所属分類が不一致です');
    parentByChild.set(link.child_id,link);
    relationCounts[expected]++;
    if(expected!=='same-collection')cross.push(link);
  }
  if(parentByChild.size!==parentManifest.counts?.children||
     new Set(parentByChild.values().map(x=>x.parent_id)).size!==parentManifest.counts?.unique_parents||
     Object.keys(relationCounts).some(k=>relationCounts[k]!==parentManifest.counts.relations[k]))
    throw new Error('親アイテム索引の件数が不一致です');
  for(const link of parentByChild.values())if(parentByChild.has(link.parent_id))throw new Error('多階層の親参照を検出しました');
  const byKey=new Map();
  for(const [key,entry] of collectionMatch.byKey){
    const families=new Map();
    for(const item of entry.items){
      const link=parentByChild.get(item.id);
      const familyId=link?.relation==='same-collection'?link.parent_id:item.id;
      let family=families.get(familyId);
      if(!family){family={canonicalId:familyId,memberIds:[],recordedIds:[]};families.set(familyId,family);}
      family.memberIds.push(item.id);
      if(collectionMatch.recordedSet.has(item.id))family.recordedIds.push(item.id);
    }
    byKey.set(key,{familyTotal:families.size,familyRecorded:[...families.values()].filter(x=>x.recordedIds.length).length,families});
  }
  return {schema:'HKIA.ParentFamilyDiagnostic.1',byKey,parentByChild,relationCounts,cross,
    gameCompletionPercentVerified:false,kind:'source-parent-diagnostic'};
}
