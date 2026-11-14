import {createCollectionItemsLocaleBinding,verifyCollectionItemsCatalog} from './product-collection-items-locale.mjs';
                                                                                   
                                                                  
export function createProductCollectionItemsLocalePort(doc){
 const binding=createCollectionItemsLocaleBinding(doc);let live=null,generation=null,invalid=false,busy=false;
 const need=x=>{if(!x)throw Error('PRODUCT_ITEMS_LOCALE_PORT');};
 const own=s=>{const all=doc.querySelectorAll('.collection-items-list');return live===s&&s.current()&&s.section.isConnected&&s.host.isConnected&&s.host.parentElement===s.section&&all.length===1&&all[0]===s.host&&s.host.getAttribute('data-hkia-svelte-collection-items')==='1';};
 const freeze=input=>Object.freeze({total:input.total,limit:input.limit,rows:Object.freeze(input.rows.map(r=>Object.freeze({...r,history:Object.freeze({...r.history}),parent:r.parent?Object.freeze({...r.parent}):undefined,image:r.image?Object.freeze({...r.image}):r.image})))});
 function paint(s,g){if(busy)return 'LEGACY_RETAINED';busy=true;try{if(!own(s))return 'LEGACY_RETAINED';const input=Object.freeze({...s.input,locale:g});return binding.render(s.host,()=>{need(own(s));return input;});}catch{return 'LEGACY_RETAINED';}finally{busy=false;}}
 function clear(){live=null;invalid=false;}
 function invalidate(){live=null;invalid=true;}
 function attach(section,input,current){
  if(busy||live||typeof current!=='function'){invalidate();return 'LEGACY_RETAINED';}
  try{const all=doc.querySelectorAll('.collection-items-list');need(all.length===1);const host=all[0];need(host.tagName==='DIV'&&host.parentElement===section&&host.getAttribute('data-hkia-svelte-collection-items')==='1'&&current());
   const s=Object.freeze({section,host,input:freeze(input),current});live=s;invalid=false;
   const result=paint(s,generation);if(result!=='APPLIED')invalidate();return result;
  }catch{invalidate();return 'LEGACY_RETAINED';}
 }
 function paintLocale(g){
  if(busy||invalid)return 'LEGACY_RETAINED';
                                                                                
                                                                            
  if(live&&paint(live,g)!=='APPLIED')return 'LEGACY_RETAINED';
  generation=g;return 'APPLIED';
 }
 return Object.freeze({verifyItemsCatalog:verifyCollectionItemsCatalog,paintLocale,clear,invalidate,attach});
}
