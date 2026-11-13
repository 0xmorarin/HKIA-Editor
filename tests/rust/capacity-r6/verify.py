"""Independent Python ZIP/LZ4 raw-byte oracle for the synthetic history operation."""
import hashlib,io,json,lz4.block,msgpack,pathlib,struct,sys,zipfile
from pathlib import Path
magic=bytes.fromhex('a1a2f8333c66ec455baa2dfc6325c2437a779c9906eecff0c022e5f6b6ca73b8');name='Saves/save_0.save';old=b'\xd3'+struct.pack('>q',638000000000000001);new=b'\xd3'+struct.pack('>q',638000000010000001)
def slot(raw):
 m=raw.index(magic)+32;v=msgpack.unpackb(raw[m:]);u=msgpack.Unpacker();u.feed(v[0].data);lengths=list(u);assert len(lengths)==len(v)-1
 d=[lz4.block.decompress(c,uncompressed_size=n) for c,n in zip(v[1:],lengths)];return raw[:m],v[1:],b''.join(d)
def frames(z,raw):
 xs=sorted(z.infolist(),key=lambda v:v.header_offset);return {v.filename:raw[v.header_offset:(xs[i+1].header_offset if i+1<len(xs) else z.start_dir)] for i,v in enumerate(xs)}
a,b=[Path(p).read_bytes() for p in sys.argv[1:3]]
with zipfile.ZipFile(io.BytesIO(a)) as x,zipfile.ZipFile(io.BytesIO(b)) as y:
 assert x.testzip() is None and y.testzip() is None and x.namelist()==y.namelist();fx,fy=frames(x,a),frames(y,b)
 for k in fx:
  if k!=name:assert fx[k]==fy[k] and x.read(k)==y.read(k)
 h1,c1,d1=slot(x.read(name));h2,c2,d2=slot(y.read(name));assert h1==h2 and len(c1)==len(c2) and d1.count(old)==1;assert d2==d1.replace(old,new,1);assert sum(v!=w for v,w in zip(c1,c2))==1
 print(json.dumps(dict(decodedExactSplice=True,unchangedNonTargetFrames=len(fx)-1,unchangedCompressedBlocks=sum(v==w for v,w in zip(c1,c2)),decodedBytes=len(d1),originalSha256=hashlib.sha256(a).hexdigest(),outputSha256=hashlib.sha256(b).hexdigest())))
