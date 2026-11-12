                                                                     
const textDecoder=new TextDecoder('utf-8',{fatal:true});
const encoder=new TextEncoder();
const GUID=/^[a-f0-9]{32}$/i;
const UTC=/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,7})?Z$/;

function rejectDuplicateJsonKeys(source){
  const stack=[];
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(ch==='"'){
      const start=i;
      for(i++;i<source.length;i++){
        if(source[i]==='\\'){i++;continue;}
        if(source[i]==='"')break;
      }
      const frame=stack[stack.length-1];
      if(frame?.kind==='object'&&frame.expectingKey){
        const key=JSON.parse(source.slice(start,i+1));
        if(frame.keys.has(key))throw new Error('設定ファイルに重複するJSONキーがあります');
        frame.keys.add(key);
        frame.expectingKey=false;
      }
    }else if(ch==='{')stack.push({kind:'object',keys:new Set(),expectingKey:true});
    else if(ch==='[')stack.push({kind:'array'});
    else if(ch==='}'||ch===']')stack.pop();
    else if(ch===','&&stack[stack.length-1]?.kind==='object')stack[stack.length-1].expectingKey=true;
  }
}

export function parseAccount(bytes){
  let text=typeof bytes==='string'?bytes:textDecoder.decode(bytes);
  if(text.length>2_000_000)throw new Error('設定ファイルが大きすぎます');
  const parsed=JSON.parse(text);
  rejectDuplicateJsonKeys(text);
  if(!parsed||Array.isArray(parsed)||typeof parsed!=='object'||!parsed.Achievements||typeof parsed.Achievements!=='object'||Array.isArray(parsed.Achievements))throw new Error('SettingsAccountのAchievements構造がありません');
  if(!parsed.Counters||typeof parsed.Counters!=='object'||Array.isArray(parsed.Counters))throw new Error('SettingsAccountのCounters構造がありません');
  const achievementGuids=new Set();
  for(const [guid,item] of Object.entries(parsed.Achievements)){
    if(achievementGuids.has(guid.toLowerCase()))throw new Error('Achievementに重複GUIDがあります');
    achievementGuids.add(guid.toLowerCase());
    if(!GUID.test(guid)||!item||typeof item!=='object'||Array.isArray(item))throw new Error(`Achievementレコードが不正です: ${guid}`);
    validateRecord(item);
  }
  const counterGuids=new Set();
  for(const [guid,item] of Object.entries(parsed.Counters)){
    if(counterGuids.has(guid.toLowerCase()))throw new Error('Counterに重複GUIDがあります');
    counterGuids.add(guid.toLowerCase());
    if(!GUID.test(guid)||!item||typeof item!=='object'||Array.isArray(item)||typeof item.CurrentValue!=='number'||!Number.isFinite(item.CurrentValue))throw new Error(`Counterレコードが不正です: ${guid}`);
  }
  return parsed;
}
export function validateRecord(r){
  if(typeof r.IsComplete!=='boolean'||typeof r.CurrentValue!=='number'||!Number.isFinite(r.CurrentValue)||r.CurrentValue<0||r.CurrentValue>3.402823466e38)throw new Error('達成状態または進捗値が不正です');
  if(r.CompletedTime!==null){
    if(typeof r.CompletedTime!=='string'||!UTC.test(r.CompletedTime)||!Number.isFinite(Date.parse(r.CompletedTime))||new Date(r.CompletedTime).toISOString().slice(0,19)!==r.CompletedTime.slice(0,19))throw new Error('達成日時は実在するUTCのISO形式で入力してください');
  }
  if(r.IsComplete!== (r.CompletedTime!==null))throw new Error('達成状態と達成日時を一致させてください');
}
export function changeAchievement(data,guid,changes){
  if(!data?.Achievements?.[guid])throw new Error('対象GUIDが見つかりません');
  const current=data.Achievements[guid];
  const updated={...current,...changes};
  validateRecord(updated);
                                                                
  data.Achievements[guid]=updated;
  return updated;
}
export function exportAccount(data){
  parseAccount(JSON.stringify(data));
  return encoder.encode(JSON.stringify(data));
}
