                                                                         
                                                                               
                                                                             
                                                                              
   
import {lz4Decompress} from '../../src/save.js';
import {lz4EncodeLiteralOnly} from './save-envelope-noop.mjs';

const LIMIT=65536;
function sourceBytes(input){
  if(!(input instanceof Uint8Array))throw new TypeError('LZ4 block must be Uint8Array');
  if(input.length<1||input.length>LIMIT)throw new RangeError('LZ4 block outside 1..65536 bytes');
  return input;
}
function hash4(src,index){
  const sequence=(src[index]|(src[index+1]<<8)|(src[index+2]<<16)|(src[index+3]<<24))>>>0;
  return (Math.imul(sequence,0x9e3779b1)>>>16)&0xffff;
}
function pushLength(dst,length){
  while(length>=255){dst.push(255);length-=255;}
  dst.push(length);
}
function pushSequence(dst,src,anchor,position,matchLength,distance){
  const literalLength=position-anchor,matchExtra=matchLength-4;
  dst.push((Math.min(literalLength,15)<<4)|Math.min(matchExtra,15));
  if(literalLength>=15)pushLength(dst,literalLength-15);
  for(let i=anchor;i<position;i++)dst.push(src[i]);
  dst.push(distance&255,distance>>>8);
  if(matchExtra>=15)pushLength(dst,matchExtra-15);
}
function pushLastLiterals(dst,src,anchor){
  const length=src.length-anchor;
  dst.push(Math.min(length,15)<<4);
  if(length>=15)pushLength(dst,length-15);
  for(let i=anchor;i<src.length;i++)dst.push(src[i]);
}
export function lz4EncodeBoundedMatch(input){
  const src=sourceBytes(input);
  const literal=lz4EncodeLiteralOnly(src);
  if(src.length<13)return literal;
  const history=new Int32Array(65536);history.fill(-1);
  const out=[];let anchor=0,pos=0;
  const lastMatchPosition=src.length-12,matchEndLimit=src.length-5;
  while(pos<=lastMatchPosition){
    const hash=hash4(src,pos),previous=history[hash];history[hash]=pos;
    if(previous<0||pos-previous>65535||src[previous]!==src[pos]||src[previous+1]!==src[pos+1]||src[previous+2]!==src[pos+2]||src[previous+3]!==src[pos+3]){pos++;continue;}
    let matchLength=4;
    while(pos+matchLength<matchEndLimit&&src[previous+matchLength]===src[pos+matchLength])matchLength++;
    pushSequence(out,src,anchor,pos,matchLength,pos-previous);
    const end=pos+matchLength;
                                                                                 
    for(let i=pos+1;i<end&&i<=lastMatchPosition;i++)history[hash4(src,i)]=i;
    pos=end;anchor=end;
  }
  pushLastLiterals(out,src,anchor);
  const compressed=Uint8Array.from(out);
  if(compressed.length>=literal.length)return literal;
                                                                                    
  const readback=lz4Decompress(compressed,src.length);
  if(readback.length!==src.length||readback.some((value,i)=>value!==src[i]))throw new Error('LZ4 match encode readback differs');
  return compressed;
}
