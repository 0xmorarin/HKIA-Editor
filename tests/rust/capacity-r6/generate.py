"""Private, synthetic capacity fixtures; never uses genuine input."""
import hashlib,io,json,lz4.block,msgpack,pathlib,struct,sys,zipfile
from pathlib import Path
root=Path(sys.argv[1]);out=Path(sys.argv[2]);out.mkdir(exist_ok=True)
base=root/'crates/hkia-save-core/tests/fixtures/writer-3.0.0-good.zip';assert hashlib.sha256(base.read_bytes()).hexdigest()==json.loads((root/'tests/rust/writer-ci-pins.json').read_text())['generated']['crates/hkia-save-core/tests/fixtures/writer-3.0.0-good.zip']
magic=bytes.fromhex('a1a2f8333c66ec455baa2dfc6325c2437a779c9906eecff0c022e5f6b6ca73b8')
with zipfile.ZipFile(base) as z: members={n:z.read(n) for n in z.namelist()}
raw=members['Saves/save_0.save'];m=raw.index(magic)+32;v=msgpack.unpackb(raw[m:]);u=msgpack.Unpacker();u.feed(v[0].data);orig=b''.join(lz4.block.decompress(c,uncompressed_size=n) for c,n in zip(v[1:],list(u)));assert orig[:4]==b'\x93\x00\x04\x9a';body=orig[4:]
def arr(n):return (bytes([0x90+n]) if n<16 else b'\xdc'+struct.pack('>H',n) if n<=65535 else b'\xdd'+struct.pack('>I',n))
def enc(p):
 parts=[p[i:i+65536] for i in range(0,len(p),65536)]; lengths=b''.join(b'\xce'+struct.pack('>I',len(x)) for x in parts)
 return raw[:m]+arr(len(parts)+1)+msgpack.packb(msgpack.ExtType(98,lengths),use_bin_type=True)+b''.join(msgpack.packb(lz4.block.compress(x,store_size=False),use_bin_type=True) for x in parts)
def emit(label,p,n,expect):
 slot=enc(p);f=out/(label+'.zip');
 with zipfile.ZipFile(f,'w',compression=zipfile.ZIP_STORED) as z:
  for k,v in members.items():
   info=zipfile.ZipInfo(k,date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_STORED;info.create_system=3;info.external_attr=0o600<<16;z.writestr(info,slot if k=='Saves/save_0.save' else v)
 rows.append(dict(case=label,decodedBytes=len(p),documents=n,slotBytes=len(slot),archiveBytes=f.stat().st_size,sha256=hashlib.sha256(f.read_bytes()).hexdigest(),expect=expect))
rows=[]
for mib in (1,5,10,25,45,64,128):
 # tag33 CabinsIdentityModel: [id, opaque byte[], nil]. Synthetic transport stress only.
 pref=b'\x93\x00\x04'+arr(11)+body+b'\x92\x21\x93\xce'+struct.pack('>I',100)+b'\xc6';n=mib*1024**2-len(pref)-5
 p=pref+struct.pack('>I',n)+b'A'*n+b'\xc0';assert len(p)==mib*1024**2;emit(f'mib-{mib}',p,11,'accept' if mib<=45 else 'reject');del p
pref=b'\x93\x00\x04'+arr(11)+body+b'\x92\x21\x93\xce'+struct.pack('>I',100)+b'\xc6';n=45*1024**2+1-len(pref)-5
p=pref+struct.pack('>I',n)+b'A'*n+b'\xc0';emit('mib-45-plus-1',p,11,'reject');del p
for n in (100000,300000,333326,333327,350000,1000000,2000000):
 # Full three-field tag33 docs, unique synthetic IDs. Node budget and array count are distinct.
 p=b'\x93\x00\x04'+arr(n)+body+b''.join(b'\x92\x21\x93\xce'+struct.pack('>I',i+100)+b'\xc0\xc0' for i in range(n-10));emit(f'docs-{n}',p,n,'accept' if n<=333326 else 'reject');del p
(out/'cases.json').write_text(json.dumps(rows,indent=2)+'\n')
