import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import vm from 'node:vm';import {counterLines,rewardLines,groupLines,childValue,validateFacts} from '../src/achievement-facts.ts';import {fixtureFacts} from '../src/legacy-achievement-facts-fixture.ts';
const root=resolve(process.argv[2]??'..'),app=readFileSync(resolve(root,'src/app.js'),'utf8');const {inspectCounterDraft}=await import(pathToFileURL(resolve(root,'src/ui-state.js')));
const slot=app.slice(app.indexOf('function renderEditor(){'),app.indexOf('function formatSourceCounts(',app.indexOf('function renderEditor(){')));const part=(a,b)=>{const start=slot.indexOf(a),end=slot.indexOf(b,start);assert.ok(start>=0&&end>start);return slot.slice(start,end)};
// Execute exact read-only V33 statements; never construct or submit native draft forms.
const code=part("section.append(detailLine('達成条件カウンター'",'        const cf=node(')+'}\n'+part("      section.append(detailLine('定義上のアイテム報酬'","      section.append(node('p','editor-hint','日本語・英語名")+part('    if(group){','    appendDependencies(section,');
const node=(tag,cls='',text='')=>({tag,cls,text:String(text),children:[],append(...n){this.children.push(...n)}});const detailLine=(label,value)=>({label,value:String(value),cls:'detail-line'});let lines=0,children=0;
for(const mode of ['recorded-null','recorded-empty','absent','unknown']){
 const s=fixtureFacts({selectedGuid:'fixture-000',record:{guid:'fixture-000',kind:'slot',mapped:true},dependencies:null}),d=s.facts.definition,g=s.facts.group,m=d.conditionMembers;
 if(mode==='recorded-empty'){d.counter.record.countedValues={kind:'ARRAY',count:0};d.counter.record.onlyCountUniques=false;}
 if(mode==='absent'||mode==='unknown')d.counter={kind:mode==='unknown'?'UNKNOWN':'ABSENT'};
 if(mode==='absent')d.reward={kind:'NONE'};
 const counter=d.counter.kind==='RECORDED'?{guid:d.counterGuid,id:7,current:0,countedGuids:0,countedValues:d.counter.record.countedValues.kind==='NULL'?null:[]}:null;
 if(counter)d.counter.record.documentId='7';
 const detail={counter_name:d.counterName,threshold:d.threshold,counter_kind:'GameCounterAchievementsDefinition',counter_guid:d.counterGuid,counter_save_guid:'saved-counter',reward_quantity:d.reward.kind==='DEFINED'?Number(d.reward.quantity):0,reward_item_name:d.reward.name,reward_item_id:d.reward.itemId,required_dlc_u32:[0]};
 const group={guid:g.guid,name:g.name,reference_count:g.referenceCount,save_guid:'saved-parent'};const ref={guid:g.definitionGuid};const section=node('section');const defs=new Map(m.children.map(c=>[c.guid,{guid:c.guid,key:c.title}]));const memberRefs=m.children.map(c=>({guid:c.guid,save_guid:c.guid}));const parentRefs=[{save_guid:'parent-a'},{save_guid:'parent-b'},{save_guid:'parent-c'}];
 const saved=new Map(m.children.filter(c=>c.state!=='MISSING').map(c=>[c.guid,{complete:c.state==='COMPLETE',current:c.current}]));saved.set('parent-a',{complete:true});saved.set('parent-b',{complete:false});
 const state={slotCounterDefinitions:new Map([[d.counterGuid,{reference_count:d.builtInReferences,only_count_uniques:mode==='recorded-empty'?false:undefined}]]),slotCountersByGuid:new Map(counter?[['saved-counter',counter]]:[]),slotEvidence:{readable:{counter:mode!=='unknown'}},slotGroupMembers:new Map([[d.counterGuid,memberRefs],[g.guid,parentRefs]]),slotAchievementsByGuid:saved,localAchievementDefinitions:defs,localAchievementLocales:new Map()};
 vm.runInNewContext(code,{section,detail,group,ref,state,node,detailLine,inspectCounterDraft});validateFacts(s);
 const actual=section.children.filter(x=>x.cls==='detail-line').map(({label,value})=>({label,value}));const expected=[...counterLines(d),...rewardLines(d.reward),...groupLines(g)];assert.deepEqual(actual,expected);lines+=actual.length;
 const child=section.children.find(x=>x.cls==='linked-counter-panel');assert.ok(child);const actualChild=child.children.filter(x=>x.cls==='detail-line').map(({label,value})=>({label,value}));assert.deepEqual(actualChild,m.children.map(c=>({label:c.title,value:childValue(c)})));children+=actualChild.length;
}
console.log(JSON.stringify({lines,children,cases:4,source:'Actual V33 renderEditor read-only counter/reward/condition members/parent group statements and inspectCounterDraft; synthetic inputs; no edit forms executed'}));
