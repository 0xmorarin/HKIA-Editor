/** 03 V16 Family-only advisory. Does not authorize or export bytes. */
import {inspectGeneralAchievementMutation} from '../scripts/research/achievement-mutation-coverage-v14.mjs';
export const BASE_V16='bd4e445b1ed015f84abdf23a242f7eb4684a086964e23398eff1bc28a6b00441';
export const ROOT=Object.freeze({guid:'dcb4dc9a140d9dc40865478985e26e21',counter_guid:'7487ba9dd0440b34cb0b45d9877456f9',source_reference_count:63});
const pins=Object.freeze({
 achievement_aquariumDisplay:['86400a032404b463a87c3275f1a211d5','30a00468:364b4042:5723c78a:5d112a1f','291117f9305d74ae9bd9d8cffc900d98','9f711192:ea47d503:fc8d9db9:89d009cf','collection_decoration','4ed8b95faa1ad4f1daf9ec9dde6e784e','f59b8de4:1f4da1aa:d9ce9fad:e487e6ed','31ed9d9b6a7cf49268394ec134d2658b','b9d9de13:294fc7a6:1ce49386:b8562d43',6],
 achievement_beginningBarista:['2832276c30774413b96b07422babb5aa','c6722382:31447703:2470b69b:aa5bbab2','aa94c11493fed465093ac4170afa2b19','411c49aa:564def39:714ca390:91b2afa0','collection_chef','c1329ebd43ad84f86a73af1e9c3b9ccd','dbe9231c:8f48da34:e1fa37a6:dcc9b3c9','f75e705c9a5f54197bec229565cefbf9','c507e57f:9145f5a9:5922ceb7:9fbfec56',20],
 achievement_betterMetal:['536af4a98a0994bb18ae2c5faf89509a','9a4fa635:bb4990a8:f5c2ea81:a90598fa','59de5b9274e7df548a6b6e635f40c7ea','29b5ed95:45fd7e47:36e6b6a8:ae7c04f5','collection_crafting','02c3015df13864b5181d01e72cea7401','d5103c20:5b46831f:7e10d181:1047aec2','47c0aa8da40cc40ff87d4d5dd0bbcfe6','d8aa0c74:f04cc04a:d5d4d78f:6efcbb0d',14]
});
const off=()=>({writerEnabled:false,applyAuthorized:false,gameAccepted:false,rewardClaim:'UNKNOWN',questUnlockCache:'UNKNOWN',newStructuralEdges:0});
const outside=reason=>({...off(),status:'NOT_IN_SCOPE',reason,requiredWrites:[],snapshotRequired:[],slotChanges:[],accountChanges:[]});
const blocked=reason=>({...outside(reason),status:'BLOCKED'});
const integer=(x,top)=>Number.isSafeInteger(x)&&x>=0&&x<=top;
/** Exact integer counts only. Models the normal load normalization/recount branches,
 * not the full game schedule or physical persistence. No approximate float boundary. */
export function inspectFamilyLoadTarget(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))return {status:'UNKNOWN'};
 const {version,threshold,savedComplete,savedProgress,counterVisible,targetProgress}=input;
 if(version!=='3.0.1'||!integer(threshold,10000)||threshold<1||typeof savedComplete!=='boolean'||!integer(savedProgress,threshold)||!integer(counterVisible,threshold)||!integer(targetProgress,threshold)||targetProgress===threshold)return {status:'UNKNOWN'};
 const normalized=savedComplete?threshold:savedProgress;
 const complete=normalized===threshold;
 const after=complete?threshold:Math.max(normalized,counterVisible);
 return {status:'STATIC_BRANCH',normalized,normalizedComplete:complete,after,afterComplete:after===threshold,targetMatches:after===targetProgress,downwardRecount:false,actualScheduling:'UNKNOWN'};
}
/** Calls existing 02 for full member, slot token and Account CAS plan. Never
 * declares a leaf-only operation blocked; this API is for explicitly requested
 * coherent terminal-family revoke on the three new v3.0.1 identities only. */
export function inspectV16FamilyPersistence(catalog,snapshot,account,request,linkage){
 if(!request||typeof request!=='object'||Array.isArray(request)||typeof request.key!=='string'||request.operation!=='REVOKE'||!Object.hasOwn(pins,request.key))return outside('INDEPENDENT_OR_UNPINNED_OPERATION');
 if(snapshot?.version!=='3.0.1')return outside('NATIVE_VERSION_NOT_VERIFIED');
 if(request.progress!==0||Object.keys(request).some(k=>!['key','operation','progress'].includes(k)))return blocked('REQUEST_NOT_PINNED_REVOKE');
 if(!snapshot.fullLogicalPayloadConsumed||!snapshot.typedDocumentIdsVerified||!snapshot.typedDictionaryKeysVerified||!(snapshot.models instanceof Map))return blocked('TYPED_SNAPSHOT_REQUIRED');
 if(!(catalog?.lookup?.byKey instanceof Map)||!Array.isArray(catalog?.families)||!Array.isArray(catalog?.account))return blocked('SOURCE_IDENTITY_MISMATCH');
 const pin=pins[request.key],e=catalog.lookup.byKey.get(request.key),g=catalog.families.find(x=>x.key===pin[4]),r=catalog.root;
 if(!e||!g||!r||[e.guid,e.save_guid,e.counter_guid,e.counter_save_guid,e.parent_key,g.guid,g.save_guid,g.counter_guid,g.counter_save_guid,g.required_count].some((x,i)=>x!==pin[i])||e.configured_threshold!==1||r.guid!==ROOT.guid||r.counter_guid!==ROOT.counter_guid||r.source_reference_count!==63)return blocked('SOURCE_IDENTITY_MISMATCH');
 let draft;try{draft=inspectGeneralAchievementMutation(catalog,snapshot,account,request,linkage)}catch{return blocked('UPSTREAM_CONTRACT_REJECTED')}if(draft.status!=='RESEARCH_DRAFT')return blocked(draft.reason??'02_FAMILY_REJECTED');
 const slot=draft.slotPlan.changes,acct=draft.accountChanges,t=g.required_count,p=t-1;
 const sf=(id,field)=>slot.find(x=>x.guid===id&&x.field===field), af=id=>acct.find(x=>x.source_guid===id&&x.field==='CurrentValue');
 const flag=sf(g.save_guid,'IsComplete'),val=sf(g.save_guid,'CurrentValue'),date=sf(g.save_guid,'CompletedTime'),ctr=sf(g.counter_save_guid,'CurrentValue'),rootA=af(ROOT.guid),rootC=af(ROOT.counter_guid);
 if(!flag||flag.expected!==true||flag.next!==false||!val||val.expected!==t||val.next!==p||!date||typeof date.expected!=='string'||date.next!==null||!ctr||ctr.expected!==t||ctr.next!==p||acct.length!==2||!rootA||!rootC||!integer(rootA.before,62)||rootA.before<1||rootA.after!==rootA.before-1||rootC.before!==rootA.before||rootC.after!==rootA.after)return blocked('TERMINAL_FAMILY_PREIMAGE_OR_PLAN_MISMATCH');
 const rq=(field,scope,reason)=>({field,classification:'REQUIRED',scope,reason});
 const requiredWrites=[rq(flag,'NORMAL_LOAD_PARENT_INCOMPLETE','saved true selects threshold before count; parent will remain complete'),rq(val,'NORMAL_LOAD_PARENT_INCOMPLETE','false flag with old threshold reconstructs complete'),rq(rootA,'NORMAL_LOAD_ROOT_EXACT_LOWER_PROGRESS','old higher root progress is not decreased by normal reload or negative counter event')];
 return {...off(),status:'RESEARCH_ONLY',scope:'EXPLICIT_TERMINAL_FAMILY_REVOKE',target:{leafKey:e.key,leafGuid:e.guid,leafSaveGuid:e.save_guid,groupKey:g.key,groupGuid:g.guid,groupSaveGuid:g.save_guid,groupCounterGuid:g.counter_guid,groupCounterSaveGuid:g.counter_save_guid,rootGuid:ROOT.guid,rootCounterGuid:ROOT.counter_guid},slotChanges:slot,accountChanges:acct,requiredWrites,snapshotRequired:[...slot,...acct],related:[{field:ctr,condition:'OLD_COUNTER_VISIBLE_AT_PARENT_RECOUNT',classification:'RELATED',risk:'STATIC_UPWARD_RECOUNT_IF_VISIBLE'},{field:rootC,condition:'OLD_COUNTER_VISIBLE_AT_ROOT_RECOUNT',classification:'RELATED',risk:'STATIC_UPWARD_RECOUNT_IF_VISIBLE'}],timestampPolicy:'NIL_FOR_EXPLICIT_INCOMPLETE_SNAPSHOT_NOT_NEW_NATIVE_REQUIRED',conditions:['immutable joint slot/account revision and exact CAS','all members and current root validated by 02','no partial export, no other store changes','does not establish game acceptance or global callback order'],warnings:['GROUP_TRACKER_INIT_MAY_COMPLETE_ASYNCHRONOUSLY','ONLOADED_BEFORE_ACHIEVEMENT_RECOUNT','ACTUAL_GLOBAL_LOAD_ORDER_UNKNOWN','ACCOUNT_SLOT_ATOMIC_PRODUCT_EXPORT_UNVERIFIED','LEAF_REWARD_REPLAY_UNKNOWN'],parentRewardDefinition:g.reward_defined,leafRewardDefinition:e.reward_defined};
}
