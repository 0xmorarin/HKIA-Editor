   
                                                                        
                                                                        
                                                                                 
                                                                       
   
import {inspectV16FamilyPersistence,ROOT as V16_ROOT} from '../../contracts/03-linkage-v16-family-persistence.mjs';
import {readSave} from '../../src/save.js';
import {parseAccount} from '../../src/account.js';
import {classifySaveCompatibility} from '../../src/forward-compat-policy.js';
import {probeAchievementFamilyTransaction,planAchievementFamilySemanticFromDecodedResearch} from './achievement-family-transaction.mjs';
import {dryRunNativeSlotTransaction,materializeSyntheticSlotForInternalLabOnly,verifyNativeSlotCandidateAgainstPlanReadOnly,verifySchemaNativeSlotCandidateAgainstPlanReadOnly,readSchemaNativeSlotResearch,dryRunSchemaNativeSlotTransactionResearch,NATIVE_SLOT_WRITER_ENABLED} from './save-transaction-engine.mjs';

const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
const GUID32=/^[0-9a-f]{32}$/i;
const VERSIONS=new Set(['3.0.0','3.0.1']);
const MAX_ACCOUNT_CHARS=2_000_000;
function ensure(value,message){if(!value)throw new Error(message);}
function equal(a,b){return a.length===b.length&&a.every((n,i)=>n===b[i]);}
function bytesOf(input){ensure(input instanceof Uint8Array||input instanceof ArrayBuffer,'Expected native slot byte input');return (input instanceof Uint8Array?input:new Uint8Array(input)).slice();}
function accountText(input){
  ensure(typeof input==='string'||input instanceof Uint8Array,'Expected original Account JSON text or Uint8Array');
  const text=typeof input==='string'?input:dec.decode(input);
  ensure(text.length<=MAX_ACCOUNT_CHARS,'Account JSON oversized');
  ensure(!text.startsWith('\ufeff'),'Account BOM unsupported');
  return text;
}
   
                                                                                     
                                                                                    
                                                                                   
   
function numericSpans(text,targets){
  const spans=new Map();let p=0,nodes=0;
  const ws=()=>{while(p<text.length&&/[\x20\t\r\n]/.test(text[p]))p++;};
  function quoted(){
    ensure(text[p]==='"','Expected JSON string');let start=p++;
    while(p<text.length){const c=text[p++];
      if(c==='"')return JSON.parse(text.slice(start,p));
      if(c==='\\'){ensure(p<text.length,'Truncated JSON escape');p++;}
      else ensure(c.charCodeAt(0)>=32,'Control character in JSON string');
    }
    throw new Error('Unterminated JSON string');
  }
  function value(path,depth){
    ensure(depth<=80&&++nodes<=250_000,'JSON structure limit exceeded');ws();const start=p,c=text[p];
    if(c==='{'){
      p++;ws();const keys=new Set();
      if(text[p]!=='}')while(true){
        const key=quoted();ensure(!keys.has(key),'Duplicate JSON key');keys.add(key);
        ws();ensure(text[p++]===':', 'Expected JSON colon');
        value([...path,key],depth+1);ws();
        if(text[p]===','){p++;ws();continue;}break;
      }
      ensure(text[p++]==='}','Expected JSON object terminator');
    }else if(c==='['){
      p++;ws();let index=0;
      if(text[p]!==']')while(true){value([...path,String(index++)],depth+1);ws();if(text[p]===','){p++;ws();continue;}break;}
      ensure(text[p++ ]===']','Expected JSON array terminator');
    }else if(c==='"')quoted();
    else if(c==='-'||(c>='0'&&c<='9')){
      const match=/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(text.slice(p));
      ensure(match,'Malformed JSON number');p+=match[0].length;
      const k=JSON.stringify(path);
      if(targets.has(k)) {ensure(!spans.has(k),'Duplicate target path');spans.set(k,{start,end:p,value:Number(match[0]),original:match[0]});}
    }else{
      const literal=c==='t'?'true':c==='f'?'false':c==='n'?'null':null;
      ensure(literal&&text.startsWith(literal,p),'Malformed JSON value');p+=literal.length;
    }
    ensure(p>start,'Empty JSON token');ws();
  }
  value([],0);ws();ensure(p===text.length,'Unexpected JSON tail');
  ensure(spans.size===targets.size,'Missing numeric Account target');return spans;
}
function rootPaths(root){
  ensure(GUID32.test(root.guid)&&GUID32.test(root.counter_guid),'Source Meta GUID must use 32 hex chars');
  return [['Achievements',root.guid,'CurrentValue'],['Counters',root.counter_guid,'CurrentValue']];
}
function patchAccountNumbers(text,root,oldValue,newValue,allowDecrement=false){
  ensure(Number.isSafeInteger(oldValue)&&oldValue>=0&&Number.isSafeInteger(newValue)&&newValue>=0&&(newValue===oldValue+1||allowDecrement&&newValue===oldValue-1),'Invalid root increment');
  const paths=rootPaths(root),keys=paths.map(p=>JSON.stringify(p)),spans=numericSpans(text,new Set(keys));
  const list=keys.map(k=>{const s=spans.get(k);ensure(s&&s.value===oldValue,'Account root CAS mismatch');return {...s,key:k};}).sort((a,b)=>a.start-b.start);
  let cursor=0,changed='';for(const s of list){ensure(s.start>=cursor,'Overlapping JSON paths');changed+=text.slice(cursor,s.start)+String(newValue);cursor=s.end;}
  changed+=text.slice(cursor);
  const afterSpans=numericSpans(changed,new Set(keys));
  ensure(keys.every(k=>afterSpans.get(k).value===newValue),'Account readback mismatch');
                                                                                              
  const back=[...afterSpans.entries()].map(([key,span])=>({...span,original:spans.get(key).original})).sort((a,b)=>a.start-b.start);
  let rebuilt='',at=0;for(const s of back){rebuilt+=changed.slice(at,s.start)+s.original;at=s.end;}rebuilt+=changed.slice(at);
  ensure(rebuilt===text,'Account non-target token was changed');
  const oldObj=parseAccount(text),newObj=parseAccount(changed);
  for(const [section,guid] of [['Achievements',root.guid],['Counters',root.counter_guid]]){
    ensure(oldObj[section][guid].CurrentValue===oldValue&&newObj[section][guid].CurrentValue===newValue,'Account target semantic mismatch');
  }
  ensure(newObj.Achievements[root.guid].IsComplete===false&&newObj.Achievements[root.guid].CompletedTime===null,'Root completion state must remain incomplete');
  const revert=structuredClone(newObj);
  for(const [section,guid] of [['Achievements',root.guid],['Counters',root.counter_guid]])revert[section][guid].CurrentValue=oldValue;
  ensure(JSON.stringify(revert)===JSON.stringify(oldObj),'Unrelated Account semantic field changed');
  return {accountFieldCount:2,accountOriginalBytes:enc.encode(text).length,accountReparsed:true,accountUnknownOriginalTokensRetained:true,editedText:changed};
}
function resolvedRecord(items,guid,label){
  ensure(typeof guid==='string','Missing saved GUID');const matches=items.filter(x=>x.guid===guid);
  ensure(matches.length===1,`Missing or duplicated ${label} GUID`);return matches[0];
}
function makeSlotPlan(decoded,localDefs,slotDefs,leafKey,completedAt){
  const leaf=localDefs.records.find(x=>x.key===leafKey);
  ensure(leaf?.counter_kind==='GameCounterManualDefinition'&&Number.isSafeInteger(leaf.threshold)&&leaf.threshold>0,'Unsupported leaf condition');
  const link=slotDefs.achievement_references.find(x=>x.guid===leaf.guid);
  ensure(link,'Missing leaf group source link');
  const parent=localDefs.records.find(x=>x.counter_guid===link.group_counter_guid);
  ensure(parent?.counter_kind==='GameCounterAchievementsDefinition','Unsupported parent condition');
  const group=slotDefs.counters.find(x=>x.guid===link.group_counter_guid);
  ensure(group&&Number.isSafeInteger(group.reference_count)&&group.reference_count>=2,'Invalid source group');
  const leafAch=resolvedRecord(decoded.achievements,leaf.save_guid,'leaf achievement');
  const parentAch=resolvedRecord(decoded.achievements,parent.save_guid,'parent achievement');
  const leafCtr=resolvedRecord(decoded.counters,leaf.counter_save_guid,'leaf counter');
  const parentCtr=resolvedRecord(decoded.counters,parent.counter_save_guid,'group counter');
  ensure(leafAch.current===1&&leafCtr.current===1&&parentAch.current===4&&parentCtr.current===4,'Expected observed Puzzle Goals 1/5 and 4/5 case');
  ensure(leaf.threshold===5&&group.reference_count===5,'Puzzle Goals source condition changed');
  const pair=[
    {a:leafAch,c:leafCtr,next:leaf.threshold},
    {a:parentAch,c:parentCtr,next:group.reference_count}
  ];
  const changes=[];
  for(const {a,c,next} of pair){
    ensure(a.complete===false&&a.completed===null,'Achievement must be incomplete');
    ensure(a.current===c.current&&a.current<next,'Achievement and counter mismatch');
    changes.push(
      {model:'AchievementModel',guid:a.guid,documentId:a.id,field:'IsComplete',expected:false,next:true},
      {model:'AchievementModel',guid:a.guid,documentId:a.id,field:'CurrentValue',expected:a.current,next},
      {model:'AchievementModel',guid:a.guid,documentId:a.id,field:'CompletedTime',expected:null,next:completedAt},
      {model:'GameCounterModel',guid:c.guid,documentId:c.id,field:'CurrentValue',expected:c.current,next}
    );
  }
  ensure(changes.length===8,'Unexpected source dependency shape');
  return {version:decoded.version,changes};
}
   
                                                                                  
                                                                                
   
export function classifyFutureNativeShape(evidence){
  const verdict=classifySaveCompatibility(evidence);
  return Object.freeze({version:verdict.version,state:verdict.state,readable:verdict.readable,
    nativeExportAuthorized:false,gameAccepted:false,transactionAllowed:VERSIONS.has(verdict.version)&&verdict.state==='KNOWN_VERSION_STRUCTURAL',
    unknownFieldsMustBePreserved:true});
}
                                                                                     
export function compareV2FormatPrefix(slot,knownNativeSignature){
  const raw=bytesOf(slot);
  ensure(raw.length>=32,'Too-short native slot');
  if(knownNativeSignature===undefined)return Object.freeze({prefixBytes:32,formatSignatureCompared:false,formatSignatureMatch:null,integrityVerified:false});
  ensure(knownNativeSignature instanceof Uint8Array&&knownNativeSignature.length===32,'Pinned native signature must be 32 bytes');
  return Object.freeze({prefixBytes:32,formatSignatureCompared:true,formatSignatureMatch:equal(raw.subarray(0,32),knownNativeSignature),integrityVerified:false});
}
   
                                                                                       
                                                                                
   
export function dryRunPuzzleGoalsCrossStore({slotBytes,accountJson,localDefs,slotDefs,metaDefs,completedAt,leafKey='achievement_puzzlesInTheStars',nativeSchema=false}={}){
  ensure(NATIVE_SLOT_WRITER_ENABLED===false,'Native writer gate unexpectedly enabled');
  ensure(leafKey==='achievement_puzzlesInTheStars','Only the Puzzle Goals conditional contract is implemented');
  const raw=bytesOf(slotBytes),rawCopy=raw.slice(),text=accountText(accountJson);
  const account=parseAccount(text);
  ensure(localDefs?.records?.length===820&&Array.isArray(slotDefs?.counters)&&Array.isArray(slotDefs?.achievement_references)&&Array.isArray(metaDefs),'Missing source definition contract');
  ensure(typeof nativeSchema==='boolean','Invalid schema research mode');
  const decoded=nativeSchema?readSchemaNativeSlotResearch(raw):readSave(raw);
  ensure(VERSIONS.has(decoded.version),'Unverified version cannot execute transaction');
                                                                           
                                                                      
  const semantic=nativeSchema?planAchievementFamilySemanticFromDecodedResearch(decoded,localDefs,slotDefs,metaDefs,account,{leafKey,completedAt}):probeAchievementFamilyTransaction(raw,localDefs,slotDefs,metaDefs,account,{leafKey,completedAt});
  ensure(semantic.changes===8&&semantic.beforeGroup===4&&semantic.afterGroup===5&&semantic.rootMetaCounter?.accountSimulationVerified===true,'Conditional REQUIRED semantic gate failed');
  const root=metaDefs.find(x=>x.key==='Local_RootAchievement');
  ensure(root&&root.guid===semantic.rootMetaCounter.achievementGuid&&root.counter_guid===semantic.rootMetaCounter.counterGuid,'Root dependency identity mismatch');
  ensure(semantic.rootMetaCounter.before===19&&semantic.rootMetaCounter.after===20,'Puzzle Goals root progress differs from observed 19->20 contract');
                                                                                       
  const plan=makeSlotPlan(decoded,localDefs,slotDefs,leafKey,completedAt);
  const codec=nativeSchema?dryRunSchemaNativeSlotTransactionResearch(raw,plan):dryRunNativeSlotTransaction(raw,plan);
  ensure(codec.changedFieldCount===8&&codec.readbackVerified&&codec.copiedAllUneditedTokenBytes&&codec.opaqueMetadataPreserved,'Codec verification gate failed');
  const accountProof=patchAccountNumbers(text,root,19,20);
  ensure(equal(raw,rawCopy),'Native input mutated');
  if(accountJson instanceof Uint8Array)ensure(equal(accountJson,enc.encode(text)),'Account input mutated');
  return Object.freeze({contract:'HKIA.04.PuzzleGoals.CrossStoreDryRun.1',version:decoded.version,
    dependency:'CONDITIONAL_REQUIRED',leafKey,groupKey:semantic.groupKey,
    before:Object.freeze({leafProgress:1,groupProgress:4,rootProgress:19}),
    after:Object.freeze({leafProgress:5,groupProgress:5,rootProgress:20}),
    changedSlotFields:8,changedAccountFields:accountProof.accountFieldCount,totalChangedFields:10,
    slotExpandedByteDelta:codec.changedExpandedBytes-codec.originalExpandedBytes,
    codecReparseVerified:codec.readbackVerified,unknownSlotTokensRetained:codec.copiedAllUneditedTokenBytes,
    accountReparseVerified:accountProof.accountReparsed,unknownAccountTokensRetained:accountProof.accountUnknownOriginalTokensRetained,
    inputsUnmodified:true,casVerified:true,transactionDryRunAtomic:true,
    sourceSignatureOnly:true,integrityVerified:false,hardwareVerified:false,rebootVerified:false,
    writerEnabled:false,slotBytesExported:false,accountBytesExported:false,zipExported:false,
                                                                                        
    futureVersionTransactionAuthorized:false,rewardClaimVerified:false,questProgressVerified:false,gameAccepted:false});
}
                                                                                 
                                                                            
   
export function verifyPuzzleGoalsCrossStoreCandidateReadOnly({slotBytes,accountJson,candidateSlotBytes,
  candidateAccountJson,localDefs,slotDefs,metaDefs,completedAt,leafKey='achievement_puzzlesInTheStars',nativeSchema=false}={}){
  ensure(CROSS_STORE_WRITER_ENABLED===false&&NATIVE_SLOT_WRITER_ENABLED===false,'Writer must remain OFF');
  const source=bytesOf(slotBytes),candidate=bytesOf(candidateSlotBytes);
  const account=accountText(accountJson),newAccount=accountText(candidateAccountJson);
  const proof=dryRunPuzzleGoalsCrossStore({slotBytes:source,accountJson:account,localDefs,slotDefs,metaDefs,completedAt,leafKey,nativeSchema});
  const plan=makeSlotPlan(nativeSchema?readSchemaNativeSlotResearch(source):readSave(source),localDefs,slotDefs,leafKey,completedAt);
  const slot=nativeSchema?verifySchemaNativeSlotCandidateAgainstPlanReadOnly(source,plan,candidate):verifyNativeSlotCandidateAgainstPlanReadOnly(source,plan,candidate);
  const root=metaDefs.find(x=>x.key==='Local_RootAchievement');
  ensure(root,'Missing verified Account root');
  const patch=patchAccountNumbers(account,root,19,20);
  ensure(patch.editedText===newAccount,'Candidate Account lexical diff exceeds two REQUIRED numeric tokens');
  ensure(equal(source,bytesOf(slotBytes))&&equal(candidate,bytesOf(candidateSlotBytes)),
    'Native bytes changed while verifying candidate');
  ensure(proof.changedSlotFields===8&&proof.changedAccountFields===2&&slot.verifiedFieldCount===8,
    'Expected precisely 8 Slot + 2 Account changes');
  return Object.freeze({schema:'HKIA.04.PuzzleGoalsCandidateVerify.1',mode:'READ_ONLY_CANDIDATE_AUDIT',
    version:slot.version,requiredScope:'PUZZLE_GOALS_ONLY',verifiedSlotFields:8,verifiedAccountFields:2,
    nativeMessagePackExactExpectedDiffOnly:true,accountLexicalExactExpectedDiffOnly:true,
    sourceInputUnmodified:true,candidateInputUnmodified:true,
    nativeAuthenticated:false,gameAccepted:false,writerEnabled:false,outputBytesReturned:false});
}
export function prepareSyntheticPuzzleGoalsPairForInternalLabOnly({slotBytes,accountJson,localDefs,slotDefs,metaDefs,completedAt,leafKey}={}){
  const slot=bytesOf(slotBytes),original=accountText(accountJson);
  ensure(slot.length>=32&&slot.subarray(0,32).every(n=>n===0),
    'Synthetic-only zero prefix required; genuine SaveGameV2 is refused');
  ensure(original.includes('"OriginalNumber"')&&original.includes('"NonTarget"')&&original.includes('"\\u0041"'),
    'Synthetic Account fixture fingerprint required');
  const proof=dryRunPuzzleGoalsCrossStore({slotBytes:slot,accountJson:original,localDefs,slotDefs,metaDefs,completedAt,leafKey});
  const decoded=readSave(slot),plan=makeSlotPlan(decoded,localDefs,slotDefs,leafKey??'achievement_puzzlesInTheStars',completedAt);
  const root=metaDefs.find(x=>x.key==='Local_RootAchievement');
  const account=patchAccountNumbers(original,root,19,20);
  const encodedSlot=materializeSyntheticSlotForInternalLabOnly(slot,plan);
  ensure(!equal(encodedSlot,slot)&&account.editedText!==original,'Synthetic pair must be changed');
  return {proof,slotBytes:encodedSlot,accountBytes:enc.encode(account.editedText)};
}
                                                                                       
                                                                                
                                                                                
   
export function preparePrivateCrossStoreCommitComponents({slotBytes,accountJson,localDefs,slotDefs,metaDefs,completedAt,leafKey='achievement_puzzlesInTheStars',nativeSchema=false}={}){
  const slot=bytesOf(slotBytes),text=accountText(accountJson);
  const proof=dryRunPuzzleGoalsCrossStore({slotBytes:slot,accountJson:text,localDefs,slotDefs,metaDefs,completedAt,leafKey,nativeSchema});
  ensure(proof.changedSlotFields===8&&proof.changedAccountFields===2,'Unapproved REQUIRED change');
  const root=metaDefs.find(x=>x.key==='Local_RootAchievement');
  ensure(root,'Missing required Account root');
  const patch=patchAccountNumbers(text,root,19,20);
  const plan=makeSlotPlan(nativeSchema?readSchemaNativeSlotResearch(slot):readSave(slot),localDefs,slotDefs,leafKey,completedAt);
  ensure(plan.changes.length===8&&patch.accountFieldCount===2,'Cross-store field count mismatch');
  return {plan,accountBytes:enc.encode(patch.editedText),proof};
}
                                                                                   
                                                                           
   
export async function prepareGeneralAchievementPairResearch({slotBytes,accountJson,request}={}){
  const {inspectGeneralAchievementMutation}=await import('./achievement-mutation-coverage-v14.mjs');
  const {default:d}=await import('../../docs/02-achievement/ACHIEVEMENT_SCHEMA.json',{with:{type:'json'}});
  const {default:linkage}=await import('../../contracts/03-linkage-delta.json',{with:{type:'json'}});
  const catalog={schema:d.schema,families:d.groups,root:d.root,account:d.account_achievements,lookup:{byKey:new Map(d.achievements.map(x=>[x.key,x])),byGuid:new Map(d.achievements.map(x=>[x.guid,x]))}};
  const text=accountText(accountJson),draft=inspectGeneralAchievementMutation(catalog,readSchemaNativeSlotResearch(slotBytes),parseAccount(text),request,linkage);
  ensure(draft.status==='RESEARCH_DRAFT'&&['COMPLETE','REVOKE'].includes(request.operation)&&draft.accountChanges.length===2&&draft.slotPlan.changes.length>0,'General terminal draft not established');
  const root=catalog.root,aa=draft.accountChanges.find(c=>c.model==='Achievement'&&c.source_guid===root.guid),cc=draft.accountChanges.find(c=>c.model==='Counter'&&c.source_guid===root.counter_guid);
  ensure(aa&&cc&&aa.field==='CurrentValue'&&cc.field==='CurrentValue'&&aa.before===cc.before&&aa.after===cc.after,'Only exact paired Meta root scalars supported');
  const patch=patchAccountNumbers(text,root,aa.before,aa.after,true);
  return {plan:draft.slotPlan,accountBytes:enc.encode(patch.editedText),accountFields:2,accountChanges:draft.accountChanges,classification:'RELATED_STATIC_RESEARCH_ONLY'};
}
export const CROSS_STORE_WRITER_ENABLED=false;

                                                                                       
                                                                                
                                                                     
export function planFormalFamilyBatch(catalog,snapshot,account,keys,linkage){
  ensure(snapshot?.version==='3.0.1'&&snapshot.collectionVersionNumber===87,'Formal batch version unsupported');
  ensure(Array.isArray(keys)&&keys.length>=2&&keys.length<=3&&keys.every(k=>typeof k==='string')&&new Set(keys).size===keys.length,'Expected 2..3 distinct V16 family keys');
  const changes=[],seen=new Set(),groups=new Set();let oldRoot=null;
  for(const key of keys){
    const v=inspectV16FamilyPersistence(catalog,snapshot,account,{key,operation:'REVOKE',progress:0},linkage);
    ensure(v.status==='RESEARCH_ONLY'&&v.slotChanges.length===8&&v.accountChanges.length===2&&v.requiredWrites.length===3,'Formal batch member not eligible');
    ensure(!groups.has(v.target.groupGuid),'Formal batch overlapping parent');groups.add(v.target.groupGuid);
    for(const c of v.slotChanges){const id=JSON.stringify([c.model,c.guid,c.documentId,c.field]);ensure(!seen.has(id),'Formal batch overlapping field');seen.add(id);changes.push(c);}
    const a=v.accountChanges.find(c=>c.model==='Achievement'&&c.source_guid===V16_ROOT.guid),b=v.accountChanges.find(c=>c.model==='Counter'&&c.source_guid===V16_ROOT.counter_guid);
    ensure(a&&b&&a.field==='CurrentValue'&&b.field==='CurrentValue'&&Number.isSafeInteger(a.before)&&a.before===b.before&&a.after===a.before-1&&b.after===a.after,'Formal batch root pair mismatch');
    if(oldRoot===null)oldRoot=a.before;else ensure(oldRoot===a.before,'Formal batch root preimage mismatch');
  }
  ensure(oldRoot>=keys.length,'Formal batch root underflow');
  const accountFields=[{field:'Local_RootAchievement.CurrentValue',expected:oldRoot,next:oldRoot-keys.length},{field:'Local_RootAchievement.Counter.CurrentValue',expected:oldRoot,next:oldRoot-keys.length}];
  return {version:snapshot.version,changes,accountFields};
}
export async function prepareFormalFamilyBatch({slotBytes,accountJson,keys}={}){
  const {default:d}=await import('../../docs/02-achievement/ACHIEVEMENT_SCHEMA.json',{with:{type:'json'}});
  const {default:linkage}=await import('../../contracts/03-linkage-delta.json',{with:{type:'json'}});
  const catalog={schema:d.schema,families:d.groups,root:d.root,account:d.account_achievements,lookup:{byKey:new Map(d.achievements.map(x=>[x.key,x])),byGuid:new Map(d.achievements.map(x=>[x.guid,x]))}};
  const text=accountText(accountJson),plan=planFormalFamilyBatch(catalog,readSchemaNativeSlotResearch(slotBytes),parseAccount(text),keys,linkage);
  let edited=text;const before=plan.accountFields[0].expected;
                                                                                    
  for(let i=0;i<keys.length;i++)edited=patchAccountNumbers(edited,catalog.root,before-i,before-i-1,true).editedText;
  return {plan,accountBytes:enc.encode(edited)};
}

                                                                                        
export async function prepareFormal49({slotBytes,accountJson,request}={}){
 const {planFormalScoped}=await import('../../native-product/formal49-plan.mjs');
 const {default:d}=await import('../../docs/02-achievement/ACHIEVEMENT_SCHEMA.json',{with:{type:'json'}});
 const {default:linkage}=await import('../../contracts/03-linkage-delta.json',{with:{type:'json'}});
 const catalog={schema:d.schema,families:d.groups,root:d.root,account:d.account_achievements,lookup:{byKey:new Map(d.achievements.map(x=>[x.key,x])),byGuid:new Map(d.achievements.map(x=>[x.guid,x]))}};
 const text=accountText(accountJson),{plan}=planFormalScoped(catalog,readSchemaNativeSlotResearch(slotBytes),parseAccount(text),request,linkage);
 return {plan,accountBytes:plan.accountFields.length?enc.encode(patchAccountNumbers(text,catalog.root,plan.accountFields[0].expected,plan.accountFields[0].next,true).editedText):enc.encode(text)};
}
