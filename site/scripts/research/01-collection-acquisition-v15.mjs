                                                                             
const int32=n=>Number.isInteger(n)&&n>=-2147483648&&n<=2147483647;
const truth=x=>x===true||x===false||x===null;
function requireValue(ok,msg){if(!ok)throw Error(msg);}
export function projectInventoryPredicate({category,entries,complete,identityVerified}){
  requireValue(category===null||int32(category),'INVALID_CATEGORY');
  requireValue(Array.isArray(entries)&&entries.every(x=>int32(x)&&x>=0),'INVALID_QUANTITY');
  requireValue(typeof complete==='boolean'&&typeof identityVerified==='boolean','INVALID_EVIDENCE');
  const mode=category===null?'UNKNOWN':(category&16)!==0?'POSITIVE_QUANTITY':'NONEMPTY_ENTRY_LIST';
  if(!complete||!identityVerified||category===null)return Object.freeze({mode,result:null});
  const quantity=entries.reduce((a,b)=>a+BigInt(b),0n);
  requireValue(quantity<=2147483647n,'QUANTITY_OVERFLOW');
  return Object.freeze({mode,result:mode==='POSITIVE_QUANTITY'?quantity>0n:entries.length>0});
}
export function projectCollectionAcquisition({self,groupByParent,children,childrenComplete,active,historyPresent,historyTicks}){
  requireValue(truth(self)&&truth(active)&&typeof groupByParent==='boolean'&&typeof childrenComplete==='boolean'&&typeof historyPresent==='boolean'&&Array.isArray(children)&&children.every(truth),'INVALID_STATE');
  requireValue(historyPresent?(typeof historyTicks==='string'&&/^(0|-?[1-9][0-9]*)$/.test(historyTicks)&&BigInt(historyTicks)>=-(1n<<63n)&&BigInt(historyTicks)<(1n<<63n)):historyTicks===null,'INVALID_HISTORY');
  const result=self===true||(groupByParent&&children.includes(true))?true:self===false&&(!groupByParent||(childrenComplete&&children.every(x=>x===false)))?false:null;
  const timeSource=result!==true?'NOT_ESTABLISHED':groupByParent&&(children.includes(true)||children.includes(null)||!childrenComplete)?'GROUP_ORDER_DEPENDENT':self!==true?'CHILD_OR_UNKNOWN':!historyPresent||historyTicks==='0'?'RUNTIME_FALLBACK':BigInt(historyTicks)<0n||BigInt(historyTicks)>3155378975999999999n?'UNKNOWN_SAVED_TICKS':'SAVED_TICKS';
  return Object.freeze({staticCollected:result,active,activeCollected:active===true?result:null,timeSource,gameAccepted:false});
}
export function assessCollectionAcquisitionOperation({operation,identityVerified,sourceVersionMatched,key0Empty,gateState,parentContextComplete,before,after}){
  requireValue(['ADD_HISTORY','REMOVE_HISTORY','MARK_COLLECTED','MARK_UNCOLLECTED'].includes(operation),'INVALID_OPERATION');
  requireValue(typeof identityVerified==='boolean'&&typeof sourceVersionMatched==='boolean'&&typeof key0Empty==='boolean'&&typeof parentContextComplete==='boolean'&&['CLEAR','GATED','UNKNOWN'].includes(gateState)&&truth(before)&&truth(after),'INVALID_EVIDENCE');
  const blockers=[];if(!identityVerified)blockers.push('IDENTITY_UNKNOWN');if(!sourceVersionMatched)blockers.push('VERSION_MISMATCH');if(!key0Empty)blockers.push('LEGACY_AMBIGUITY');if(gateState!=='CLEAR')blockers.push('ELIGIBILITY_UNVERIFIED');if(!parentContextComplete)blockers.push('PARENT_CONTEXT_UNKNOWN');
  if(before!==null&&after!==null&&before!==after)blockers.push('HISTORY_ONLY_PREDICATE_INCONSISTENT');
  const gameplay=operation==='MARK_COLLECTED'||operation==='MARK_UNCOLLECTED';
  if(gameplay){if(before===null||after===null)blockers.push('RUNTIME_PREDICATE_UNKNOWN');else if(before!==after)blockers.push('HISTORY_ONLY_CANNOT_CHANGE_PREDICATE');else if(after!==(operation==='MARK_COLLECTED'))blockers.push('OWNERSHIP_OR_PARENT_PREDICATE_CHANGE_REQUIRED');else blockers.push('ALREADY_TARGET_STATE_NO_GAMEPLAY_CHANGE');}
  return Object.freeze({operation,blockers:Object.freeze(blockers),historyDraftEligible:!gameplay&&blockers.length===0,gameplayMutationAuthorized:false,requiredPersistedWrites:Object.freeze([]),writerEnabled:false,canApply:false,canExport:false});
}
