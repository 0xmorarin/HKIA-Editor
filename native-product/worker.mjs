// Dedicated, browser-only Native product preview worker. All save bytes remain
// inside this worker and its caller's original in-memory snapshot.
import {openNativeProductSession} from './api.mjs';
let session=null,busy=false,opened=false,lastId=0;const plans=new Map();
const send=(id,result,error)=>self.postMessage(error?{id,error}:{id,result});
self.addEventListener('message',async({data:m})=>{
  if(!m||!Number.isSafeInteger(m.id)||m.id<1)return;
  if(m.id<=lastId){send(m.id,null,'Native worker replay');return;}lastId=m.id;
  if(busy){send(m.id,null,'Native worker busy');return;}
  busy=true;
  try{
    let result;
    if(m.kind==='open'){
      if(opened)throw Error('Native worker already opened');opened=true;
      session=await openNativeProductSession(m.input,m.options);
      result={revision:session.revision,version:session.version,display:session.display,capability:session.capability};
    }else{
      if(!session)throw Error('Native worker session missing');
      if(m.kind==='plan'){
        const token=session.plan(m.request);if(plans.size>=128)plans.delete(plans.keys().next().value);
        plans.set(m.id,token);result={handle:m.id,token};
      }else if(m.kind==='verify'){
        const token=plans.get(m.handle);if(!token)throw Error('Native worker plan expired or unknown');
        result=await session.verifyEditedCopy(token,m.expectedRevision,m.options);
      }else if(m.kind==='dev-export'){
        const token=plans.get(m.handle);if(!token)throw Error('Native worker plan expired or unknown');
        result=await session.exportDevEditedCopy(token,m.expectedRevision,m.options);
      }else if(m.kind==='apply'){
        const token=plans.get(m.handle);if(!token)throw Error('Native worker plan expired or unknown');
        result=await session.apply(token,m.expectedRevision,m.options);
      }else if(m.kind==='recipe-restore')result=await session.restoreRecipeEditedCopy(m.input,m.receipt,m.expectedRevision,m.options);
      else if(m.kind==='export')result=session.export(m.expectedRevision);
      else if(m.kind==='undo')result=session.undo(m.expectedRevision);
      else if(m.kind==='reset')result=session.reset(m.expectedRevision);
      else if(m.kind==='noop')result=session.verifyNoop(m.expectedRevision);
      else throw Error('Unsupported Native worker operation');
    }
    send(m.id,result,null);
  }catch(e){send(m.id,null,e instanceof Error?e.message:'Native worker operation rejected');}
  finally{busy=false;}
});
