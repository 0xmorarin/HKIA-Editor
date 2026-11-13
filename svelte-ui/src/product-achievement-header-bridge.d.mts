export type Header=Readonly<{guid:string|null;title:string;empty:string|null;lines:readonly Readonly<{label:string;value:string}>[]}>;
export type HeaderDraw=(host:HTMLDivElement,header:Header)=>()=>void;
export function createProductAchievementHeaderBridge(doc:Document,draw:HeaderDraw):{render(panel:HTMLElement,input:Header,readSelected:()=>string|null):'MOUNTED'|'LEGACY_RETAINED'};
