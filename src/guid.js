                                                                      
                                                                                       
                                                                                        
   
export function serializedGuidToSlotGuid(guid){
  if(typeof guid!=='string'||!/^[a-f0-9]{32}$/i.test(guid))throw new Error('GUID must be 32 hexadecimal digits');
  return [0,8,16,24].map(i=>guid.slice(i,i+8).split('').reverse().join('')).join(':').toLowerCase();
}
export function slotGuidToSerializedGuid(words){
  if(typeof words!=='string'||!/^[a-f0-9]{8}(:[a-f0-9]{8}){3}$/i.test(words))throw new Error('Slot GUID must have four 32-bit words');
  return words.split(':').map(w=>w.split('').reverse().join('')).join('').toLowerCase();
}
