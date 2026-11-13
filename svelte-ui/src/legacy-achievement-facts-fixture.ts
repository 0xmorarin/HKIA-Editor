import type {DetailSnapshot} from './achievement-detail.ts';
import type {FactsSnapshot} from './achievement-facts.ts';
/** Synthetic view only. Values are not game-derived definitions or Save records. */
export function fixtureFacts(detail:DetailSnapshot):FactsSnapshot{
 const r=detail.record;if(!r||r.kind!=='slot')return {selectedGuid:detail.selectedGuid,facts:null};
 if(!r.mapped)return {selectedGuid:r.guid,facts:{guid:r.guid,definition:null,group:null}};
 const groupCondition=r.guid==='fixture-000';
 return {selectedGuid:r.guid,facts:{guid:r.guid,definition:{key:'fixture-definition',counterName:'fixture-counter',threshold:'10',counterGuid:'fixture-counter-guid',builtInReferences:groupCondition?3:null,groupCondition,conditionMembers:groupCondition?{counterGuid:'fixture-counter-guid',total:3,children:[{guid:'fixture-child-1',title:'検証子実績1',state:'COMPLETE',current:'1'},{guid:'fixture-child-2',title:'検証子実績2',state:'INCOMPLETE',current:'0'},{guid:'fixture-child-3',title:'検証子実績3',state:'MISSING',current:null}]}:null,dlcCondition:false,counter:groupCondition?{kind:'RECORDED',record:{current:'0',documentId:'fixture-counter-doc',onlyCountUniques:null,countedGuidsCount:0,countedValues:{kind:'NULL'}}}:{kind:'ABSENT'},reward:groupCondition?{kind:'DEFINED',itemId:'100',name:'検証報酬',quantity:'2'}:{kind:'NONE'}},group:groupCondition?{guid:'fixture-group-guid',name:'fixture-group.definition',definitionGuid:'fixture-definition-guid',referenceCount:3,savedCount:2,completeCount:1,memberCount:3,counterState:'ABSENT',current:null}:null}};
}
