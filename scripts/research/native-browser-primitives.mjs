import {fingerprintSourceBytes} from '../../src/source-revision-ui.js';
export async function sha256Hex(input){
  if(!(input instanceof Uint8Array))throw new TypeError('Expected Uint8Array');
  return fingerprintSourceBytes(Uint8Array.from(input));
}
