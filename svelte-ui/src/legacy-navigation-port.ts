import type { WorkspaceNavigationPort, WorkspaceTab } from './navigation.ts';

/** Read only the legacy navigation projection, never a save/session or editor state. */
export interface LegacyTabSnapshot {
  readonly achievementSelected: string | null;
  readonly collectionSelected: string | null;
  readonly achievementTabIndex: number;
  readonly collectionTabIndex: number;
  readonly achievementHidden: boolean;
  readonly collectionHidden: boolean;
}
export interface LegacyNavigationBinding {
  /** The existing controller supplies a consistent synchronous snapshot. */
  read(): LegacyTabSnapshot;
  /** The existing controller's setTab, including its collection render side effect. */
  setTab(next: WorkspaceTab): void;
  /** Optional caller-owned render invalidation (e.g. a Svelte revision signal). */
  invalidate?(): void;
}
export function activeLegacyTab(s: LegacyTabSnapshot): WorkspaceTab {
  const a=s.achievementSelected==='true' && s.collectionSelected==='false' &&
    s.achievementTabIndex===0 && s.collectionTabIndex===-1 && s.achievementHidden===false && s.collectionHidden===true;
  const c=s.achievementSelected==='false' && s.collectionSelected==='true' &&
    s.achievementTabIndex===-1 && s.collectionTabIndex===0 && s.achievementHidden===true && s.collectionHidden===false;
  if(a) return 'achievements';
  if(c) return 'collections';
  throw new Error('LEGACY_NAVIGATION_INCOHERENT');
}
/** No cached selection, no listeners, no second ProductSession. The host owns DOM and lifecycle. */
export function createLegacyNavigationPort(binding: LegacyNavigationBinding): WorkspaceNavigationPort {
  return {
    get activeTab() {return activeLegacyTab(binding.read());},
    selectTab(next) {
      if(next!=='achievements'&&next!=='collections') throw new Error('LEGACY_NAVIGATION_INVALID_TARGET');
      activeLegacyTab(binding.read());
      // Always forward even a repeated Collections selection, exactly as legacy setTab does.
      try {
        binding.setTab(next);
        if(activeLegacyTab(binding.read())!==next) throw new Error('LEGACY_NAVIGATION_POSTCONDITION');
      } finally {
        binding.invalidate?.();
      }
    }
  };
}
