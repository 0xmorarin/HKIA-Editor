import type {ItemRow} from './collection-detail.ts';
export type ProductItem=ItemRow & Readonly<{imageEnabled:boolean;history:ItemRow['history'] & {showTicks?:boolean}}>;
export type ProductItems=Readonly<{rows:readonly ProductItem[];total:number;limit:number}>;
export type Draw=(host:HTMLDivElement,s:ProductItems,dispatch:(id:number|null)=>void)=>()=>void;
export function createProductCollectionItemsBridge(doc:Document,draw:Draw):{render(host:HTMLDivElement,s:ProductItems,current:()=>boolean):'MOUNTED'|'LEGACY_RETAINED';restore():void};
