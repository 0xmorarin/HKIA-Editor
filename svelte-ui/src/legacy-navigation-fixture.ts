import type { WorkspaceTab } from './navigation.ts';
import type { LegacyTabSnapshot } from './legacy-navigation-port.ts';

/** Synthetic browser fixture only. Detached DOM, no app initialization or Save/Writer state.
 * The setTab body is byte-pinned to the actual V33 legacy function by verify-legacy-port.mjs.
 * renderCollections counts invocations; it does NOT claim collection content parity.
 */
export function createLegacyNavigationFixture() {
  const nodes: Record<string, HTMLElement> = {
    achTab:document.createElement('button'), colTab:document.createElement('button'),
    achPanel:document.createElement('div'), colPanel:document.createElement('div'),
  };
  const el=(id:string)=>nodes[id];
  let renders=0;
  const renderCollections=()=>{renders++;};
  function setTab(name: WorkspaceTab){const ach=name==='achievements';el('achTab').classList.toggle('active',ach);el('colTab').classList.toggle('active',!ach);el('achTab').setAttribute('aria-selected',String(ach));el('colTab').setAttribute('aria-selected',String(!ach));el('achTab').tabIndex=ach?0:-1;el('colTab').tabIndex=ach?-1:0;el('achPanel').hidden=!ach;el('colPanel').hidden=ach;if(!ach)renderCollections();}
  setTab('achievements');
  const read=():LegacyTabSnapshot=>({
    achievementSelected:el('achTab').getAttribute('aria-selected'), collectionSelected:el('colTab').getAttribute('aria-selected'),
    achievementTabIndex:el('achTab').tabIndex, collectionTabIndex:el('colTab').tabIndex,
    achievementHidden:el('achPanel').hidden, collectionHidden:el('colPanel').hidden,
  });
  return {read,setTab,collectionRenders:()=>renders};
}
