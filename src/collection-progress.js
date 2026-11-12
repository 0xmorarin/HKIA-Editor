   
                                                                             
                                                                                    
                                                                                    
   
export function reconcileCollectionItemIds(manifest, definitions, recordedIds) {
  if (manifest?.schema !== 'HKIA.ItemCollectionCrosswalk.1' || !Array.isArray(manifest.items))
    throw new Error('アイテム定義索引の形式が不正です');
  if (!Array.isArray(definitions) || !Array.isArray(recordedIds))
    throw new Error('コレクション定義または保存IDの形式が不正です');
  const byKey=new Map(definitions.map(d=>[d.key,{definition:d,items:[],recorded:[]}]));
  if(byKey.size!==definitions.length)throw new Error('コレクション定義に重複したキーがあります');
  const byId=new Map();
  for(const item of manifest.items){
    if (!Number.isSafeInteger(item.id) || item.id<1 || byId.has(item.id))throw new Error('アイテムIDが不正・重複しています');
    byId.set(item.id,item);
    if(item.collection_key){
      const entry=byKey.get(item.collection_key);
      if(!entry || entry.definition.guid!==item.collection_guid)throw new Error('コレクションGUID不一致: '+item.id);
      entry.items.push(item);
    }
  }
  const recordedSet=new Set(recordedIds);
  if(recordedSet.size!==recordedIds.length)throw new Error('収集履歴に重複IDがあります');
  const unknown=[], unassigned=[];
  for(const id of recordedSet){
    const item=byId.get(id);
    if(!item){unknown.push(id);continue;}
    if(!item.collection_key){unassigned.push(item);continue;}
    byKey.get(item.collection_key).recorded.push(item);
  }
  return {
    byKey,byId,recordedSet,unknown,unassigned,
    mappedCount:recordedSet.size-unknown.length-unassigned.length,
    sourceItemCount:byId.size,
                                                                             
    kind:'direct-item-id-reconciliation',
    gameCompletionPercentVerified:false
  };
}
