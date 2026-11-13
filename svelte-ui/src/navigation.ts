/** Presentation only. The caller owns activeTab; no save/session/Writer state. */
export type WorkspaceTab = 'achievements' | 'collections';
export const tabs = [
  {id:'achTab', panel:'achPanel', value:'achievements', icon:'🏅', label:'アチーブメント'},
  {id:'colTab', panel:'colPanel', value:'collections', icon:'✿', label:'コレクション'},
] as const;
export interface WorkspaceNavigationPort {
  readonly activeTab: WorkspaceTab;
  selectTab(next: WorkspaceTab): void;
}
export function keyboardTarget(from:WorkspaceTab,key:string):WorkspaceTab|null {
  if(key==='Home') return 'achievements';
  if(key==='End') return 'collections';
  if(key==='ArrowLeft'||key==='ArrowRight') return from==='achievements'?'collections':'achievements';
  return null;
}
export function tabPresentation(active:WorkspaceTab,value:WorkspaceTab) {
  const selected=active===value;
  return {selected,tabIndex:selected?0:-1,hidden:!selected,activeClass:selected?'primary-tab active':'primary-tab'};
}
/** Intents are forwarded even for the current tab, matching legacy renderCollections. */
export function requestTab(port:WorkspaceNavigationPort,next:WorkspaceTab):void {port.selectTab(next);}
