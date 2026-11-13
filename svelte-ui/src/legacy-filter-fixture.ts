import {filterControls,filterIds,type FilterControlId,type FilterSnapshot} from './filter-controls.ts';
/** Detached controls, not a live product binding. Exact legacy callback order, synthetic side effects. */
export function createLegacyFilterFixture(){
  const controls=new Map<FilterControlId,HTMLInputElement|HTMLSelectElement>();
  let achievementRenders=0,collectionRenders=0,batchClears=0,achLimit=0;
  for(const id of filterIds){
    const c=filterControls[id];
    const el=document.createElement(c.type==='search'?'input':'select');
    if(c.type==='search') (el as HTMLInputElement).type='search';
    else for(const [value,label] of c.options){const option=document.createElement('option');option.value=value;option.textContent=label;el.append(option);}
    el.value=c.initial;el.hidden=id==='achievementImageFilter';controls.set(id,el);
    el.addEventListener(c.event,()=>{if(id.startsWith('achievement')){achLimit=120;batchClears++;achievementRenders++;}else collectionRenders++;});
  }
  function get(id:FilterControlId){const el=controls.get(id);if(!el)throw new Error('MISSING_LEGACY_CONTROL');return el;}
  function read():FilterSnapshot {return {...Object.fromEntries(filterIds.map(id=>[id,get(id).value])),imageVisible:!get('achievementImageFilter').hidden} as FilterSnapshot;}
  return {read,writeAndDispatch(id:FilterControlId,value:string,event:'input'|'change'){const el=get(id);el.value=value;el.dispatchEvent(new Event(event));},
    metrics(){return {achievementRenders,collectionRenders,batchClears,achLimit};},
    setImageVisible(visible:boolean){get('achievementImageFilter').hidden=!visible;}};
}
