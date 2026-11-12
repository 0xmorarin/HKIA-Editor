                                                                                     
const isGuid = (x) => typeof x === 'string' && /^[0-9a-f]{32}$/.test(x);
const isItemId = (x) => Number.isSafeInteger(x) && x >= 0;
const isSpriteId = (x) => typeof x === 'string' && /^-?\d+$/.test(x);
const isPrivatePath = (x) =>
  typeof x === 'string' &&
  /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[0-9a-f]{2}\/[0-9a-f]{64}\.webp)$/.test(x);

                                                                                          
export function createPrivateImageResolver(map) {
  if (!map || map.schema !== 'HKIA.ImageMap.1' ||
      map.scope !== 'STEAM_3_0_1_PRIVATE_LOCAL' ||
      map.privacy?.publicDeploymentApproved !== false ||
      map.privacy?.bundlesIncluded !== false ||
      map.privacy?.saveFilesIncluded !== false) {
    throw new Error('Unrecognized or public ImageMap; reject');
  }
  const required = ['accountAchievements', 'inGameAchievements',
    'collectionCategories', 'collectionDefinitions', 'collectionItemIds',
    'achievementRewards', 'rewardItemIcons'];
  for (const key of required) {
    if (!Array.isArray(map[key])) throw new Error(`Bad ImageMap array: ${key}`);
  }
  if (!map.spriteImages || typeof map.spriteImages !== 'object') {
    throw new Error('Missing Sprite path index');
  }

  const unique = (list, keyField, label, validateKey) => {
    const out = new Map();
    for (const item of list) {
      const id = item[keyField];
      if (!validateKey(id) || out.has(id)) throw new Error(`Invalid/duplicate ${label}: ${String(id)}`);
      out.set(id, item);
    }
    return out;
  };
  const accounts = unique(map.accountAchievements, 'guid', 'account GUID', isGuid);
  const ingame = unique(map.inGameAchievements, 'guid', 'in-game GUID', isGuid);
  const categories = unique(map.collectionCategories, 'guid', 'category GUID', isGuid);
  const groups = unique(map.collectionCategories, 'group', 'group key', x => typeof x === 'string' && x.length > 0);
  const collections = unique(map.collectionDefinitions, 'guid', 'collection GUID', isGuid);
  const collectionItems = unique(map.collectionItemIds, 'itemId', 'collection ItemId', isItemId);
  const rewards = unique(map.rewardItemIcons, 'itemId', 'reward ItemId', isItemId);

  for (const [spriteId, sprite] of Object.entries(map.spriteImages)) {
    if (!isSpriteId(spriteId) || sprite.sprite_path_id !== spriteId ||
        !isPrivatePath(sprite.path) || sprite.webp_codec !== 'VP8L' ||
        sprite.pixel_verified !== true) {
      throw new Error(`Unverified sprite definition: ${spriteId}`);
    }
  }
  const resolveIcon = (icon) => {
    if (!icon || !['EXACT', 'EXISTING_VERIFIED', 'SOURCE_NULL', 'SOURCE_NULL_DERIVED', 'EXPORT_FAILED'].includes(icon.status)) {
      throw new Error('Invalid icon state');
    }
    if (icon.status === 'EXACT' || icon.status === 'EXISTING_VERIFIED') {
      if (!isPrivatePath(icon.image) || !isSpriteId(icon.spritePathId)) {
        throw new Error('Invalid source image path or Sprite PathID');
      }
      const s = map.spriteImages[icon.spritePathId];
      if ((icon.status === 'EXACT' && !s) || (s && s.path !== icon.image)) {
        throw new Error(`Source PathID disagreement: ${icon.spritePathId}`);
      }
                                                                              
                                                                                             
      if (icon.status === 'EXISTING_VERIFIED' && !icon.image.startsWith('assets/icons/')) {
        throw new Error('Unverified category image location');
      }
      return Object.freeze({ status: icon.status, image: icon.image, spritePathId: icon.spritePathId });
    }
    return Object.freeze({ status: icon.status, image: null, reason: icon.reason ?? 'not established' });
  };
  const missing = () => Object.freeze({ found: false, status: 'NOT_IN_SOURCE_MAP', image: null });
  const categoryPicture = (collection) => {
    const group = groups.get(collection.group);
    if (!group || collection.categoryImage !== group.icon.image) throw new Error('Category/child mismatch');
    return resolveIcon(group.icon);
  };
                                                                                
  for (const row of map.accountAchievements) resolveIcon(row.icon);
  for (const row of map.inGameAchievements) resolveIcon(row.icon);
  for (const row of map.collectionCategories) resolveIcon(row.icon);
  for (const row of map.collectionDefinitions) {
    resolveIcon(row.directIcon);
    categoryPicture(row);
    if (!Array.isArray(row.itemIds) || row.itemIds.length !== row.itemCount) {
      throw new Error(`Invalid child collection item count: ${row.guid}`);
    }
    for (const id of row.itemIds) {
      const item = collectionItems.get(id);
      if (!item || item.collectionGuid !== row.guid) throw new Error(`Item membership disagreement: ${id}`);
    }
  }
  for (const row of map.collectionItemIds) resolveIcon(row.icon);
  for (const row of map.rewardItemIcons) resolveIcon(row.icon);
  for (const row of map.achievementRewards) {
    const linked = ingame.get(row.guid);
    if (!linked || linked.rewardItemId !== row.rewardItemId) throw new Error(`Reward definition mismatch: ${row.guid}`);
    if (row.rewardItemId != null && !rewards.has(row.rewardItemId)) throw new Error(`Unknown reward item: ${row.rewardItemId}`);
  }
  const achievement = (table, guid) => {
    if (!isGuid(guid)) return missing();
    const row = table.get(guid);
    return row ? Object.freeze({ found: true, guid, key: row.key, icon: resolveIcon(row.icon) }) : missing();
  };
  const item = (table, id) => {
    if (!isItemId(id)) return missing();
    const row = table.get(id);
    return row ? Object.freeze({ found: true, itemId: id, itemGuid: row.itemGuid, icon: resolveIcon(row.icon) }) : missing();
  };
  return Object.freeze({
    accountByGuid: guid => achievement(accounts, guid),
    inGameByGuid: guid => achievement(ingame, guid),
    collectionCategoryByGuid: guid => {
      if (!isGuid(guid)) return missing();
      const row = categories.get(guid);
      return row ? Object.freeze({ found: true, guid, group: row.group, hidden: row.hidden, icon: resolveIcon(row.icon) }) : missing();
    },
    collectionDefinitionByGuid: guid => {
      if (!isGuid(guid)) return missing();
      const row = collections.get(guid);
      return row ? Object.freeze({ found: true, guid, group: row.group,
        directIcon: resolveIcon(row.directIcon), categoryIcon: categoryPicture(row),
        itemIds: Object.freeze([...row.itemIds]) }) : missing();
    },
    collectionItemById: id => item(collectionItems, id),
    rewardItemById: id => item(rewards, id),
    rewardForInGameGuid: guid => {
      if (!isGuid(guid) || !ingame.has(guid)) return missing();
      const row = ingame.get(guid);
      return Object.freeze({ found: true, guid, achievementIcon: resolveIcon(row.icon),
        rewardItemId: row.rewardItemId, quantity: row.rewardQuantity,
        rewardIcon: row.rewardItemId == null ? null : item(rewards, row.rewardItemId).icon,
                                                                         
        rewardReceived: 'UNVERIFIED' });
    },
    coverage: Object.freeze({
      account: accounts.size, inGame: ingame.size,
      category: categories.size, collection: collections.size,
      collectionItems: collectionItems.size, rewardItems: rewards.size,
      sprites: Object.keys(map.spriteImages).length,
    }),
  });
}
