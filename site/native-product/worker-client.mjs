                                                                           
                                                                             
import {commitNativeCrossStoreZip} from '../contracts/04-native-commit-gate.mjs';
const MAX=60*1024*1024;
function requireValue(ok,message){if(!ok)throw Error(message);}
function view(input){requireValue(input instanceof Uint8Array||input instanceof ArrayBuffer,'ZIP byte input required');const b=input instanceof Uint8Array?input:new Uint8Array(input);requireValue(b.length>=22&&b.length<=MAX,'ZIP size limit exceeded');return b;}
function same(a,b){if(a.length!==b.length)return false;const x=new DataView(a.buffer,a.byteOffset,a.byteLength),y=new DataView(b.buffer,b.byteOffset,b.byteLength);let i=0;for(;i+4<=a.length;i+=4)if(x.getUint32(i)!==y.getUint32(i))return false;for(;i<a.length;i++)if(a[i]!==b[i])return false;return true;}
function freeze(x){if(x&&typeof x==='object'&&!Object.isFrozen(x)){for(const v of Object.values(x))freeze(v);Object.freeze(x);}return x;}
export async function openNativeProductWorkerSession(input,{sameVersionWitnessArchive=null}={}){
  const caller=view(input);let source=Uint8Array.from(caller),closed=false,busy=false,sequence=0,pending=null,info=null;
  const witnessCaller=sameVersionWitnessArchive===null?null:view(sameVersionWitnessArchive),witness=witnessCaller===null?null:Uint8Array.from(witnessCaller);
  const worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module'}),plans=new WeakMap();
  function close(message='Native worker session closed'){
    if(closed)return;closed=true;source=null;worker.terminate();if(pending){const p=pending;pending=null;p.reject(Error(message));}
  }
  worker.addEventListener('error',()=>close('Native worker failed'));
  worker.addEventListener('messageerror',()=>close('Native worker response could not be decoded'));
  worker.addEventListener('message',({data:m})=>{if(!pending||m?.id!==pending.id)return;const p=pending;pending=null;if(m.error)p.reject(Error(m.error));else p.resolve(m.result);});
  function rpc(kind,payload={},transfer=[]){requireValue(!closed&&!pending,'Native worker closed or busy');const id=++sequence;return new Promise((resolve,reject)=>{pending={id,resolve,reject};try{worker.postMessage({id,kind,...payload},transfer);}catch(e){pending=null;reject(e);}});}
  function guard(expected){requireValue(!closed&&!busy,'Native worker closed or busy');requireValue(expected===info.revision,'Source revision CAS mismatch');requireValue(same(caller,source),'Caller source changed');}
  async function checked(kind,expected,payload){guard(expected);busy=true;try{const result=await rpc(kind,payload);requireValue(!closed&&same(caller,source),'Source/session changed during worker operation');return result;}finally{busy=false;}}
  try{
    const transfer=source.slice(),witnessTransfer=witness?.slice()??null;
    info=freeze(await rpc('open',{input:transfer,options:{sameVersionWitnessArchive:witnessTransfer}},[transfer.buffer,...(witnessTransfer?[witnessTransfer.buffer]:[])]));
    requireValue(same(caller,source)&&(!witnessCaller||same(witnessCaller,witness)),'Source changed during worker open');
    return Object.freeze({schema:'HKIA.04.ProductNativeWorkerSession.1',...info,
      async plan(request){const r=await checked('plan',request?.expectedRevision,{request});const token=freeze(r.token);plans.set(token,r.handle);return token;},
      async verifyEditedCopy(token,expectedRevision,options={}){guard(expectedRevision);const handle=plans.get(token);requireValue(handle,'Plan not issued by this worker session');return freeze(await checked('verify',expectedRevision,{handle,expectedRevision,options}));},
      async exportDevEditedCopy(token,expectedRevision,options={}){guard(expectedRevision);const handle=plans.get(token);requireValue(handle,'Plan not issued by this worker session');const result=await checked('dev-export',expectedRevision,{handle,expectedRevision,options});requireValue(result?.schema==='HKIA.04.DevEditedCopy.1'&&result.file instanceof File&&result.file.name==='edited-copy.zip','Invalid DEV File response');return freeze(result);},
      async verifyNoop(expectedRevision){return freeze(await checked('noop',expectedRevision,{expectedRevision}));},
      apply(token,expectedRevision,options={}){if(!info.capability.productExportAvailable)return commitNativeCrossStoreZip();guard(expectedRevision);const handle=plans.get(token);requireValue(handle,'Plan not issued by this worker session');return checked('apply',expectedRevision,{handle,expectedRevision,options}).then(freeze);},
      export(expectedRevision){if(!info.capability.productExportAvailable)return commitNativeCrossStoreZip();return checked('export',expectedRevision,{expectedRevision}).then(result=>{requireValue(result?.schema==='HKIA.04.DevEditedCopy.1'&&result.file instanceof File&&result.file.name==='edited-copy.zip','Invalid beta File response');return freeze(result);});},
      async restoreRecipeEditedCopy(input,receipt,expectedRevision,options={}){guard(expectedRevision);const current=view(input),snapshot=Uint8Array.from(current),transfer=snapshot.slice();busy=true;try{const result=await rpc('recipe-restore',{input:transfer,receipt,expectedRevision,options},[transfer.buffer]);requireValue(!closed&&same(caller,source)&&same(current,snapshot),'Source/session changed during recipe restore');requireValue(result?.schema==='HKIA.04.DevEditedCopy.1'&&result.file instanceof File&&result.file.name==='edited-copy.zip','Invalid recipe restore File response');return freeze(result);}finally{busy=false;}},
      undo(expectedRevision){return checked('undo',expectedRevision,{expectedRevision});},reset(expectedRevision){return checked('reset',expectedRevision,{expectedRevision});},
      index(){guard(info.revision);return info.display;},async preview(token,expectedRevision,options={}){guard(expectedRevision);const handle=plans.get(token);requireValue(handle,'Plan not issued by this worker session');return freeze(await checked('verify',expectedRevision,{handle,expectedRevision,options}));},close(){close();}});
  }catch(e){close();throw e;}
}
