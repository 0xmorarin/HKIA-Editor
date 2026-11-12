export function losslessWebpDimensions(bytes) {
  if (bytes.length < 25 || bytes.toString('ascii',0,4) !== 'RIFF' || bytes.toString('ascii',8,12) !== 'WEBP') throw new Error('Invalid WebP container');
  if (bytes.readUInt32LE(4) !== bytes.length - 8) throw new Error('Invalid WebP RIFF length');
  let pos=12, width=0, height=0, frames=0;
  while (pos + 8 <= bytes.length) {
    const type=bytes.toString('ascii',pos,pos+4);
    const len=bytes.readUInt32LE(pos+4);
    const start=pos+8;
    if (len > bytes.length-start) throw new Error('Invalid WebP chunk length');
    if (type !== 'VP8L' || frames !== 0 || len < 5) throw new Error('Only single-frame lossless VP8L WebP is allowed');
    if (bytes[start] !== 0x2f) throw new Error('Invalid WebP lossless bitstream signature');
    const info=bytes.readUInt32LE(start+1);
    if ((info >>> 29) !== 0) throw new Error('Unsupported WebP lossless version');
    width=(info & 0x3fff)+1;
    height=((info >>> 14) & 0x3fff)+1;
    frames++;
    pos=start+len+(len & 1);
  }
  if (pos !== bytes.length || frames !== 1) throw new Error('Invalid WebP frame or trailing data');
  return {width,height,codec:'VP8L'};
}
