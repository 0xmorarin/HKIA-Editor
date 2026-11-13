#!/usr/bin/env python3
"""Synthetic Writer fixtures from already public catalog identities. No real Save inputs."""
import pathlib,sys,struct,json,zlib,hashlib
f=pathlib.Path(sys.argv[1]);catalog=pathlib.Path(sys.argv[2]);raw=catalog.read_bytes();assert hashlib.sha256(raw).hexdigest()=='eb56159869b739a602cf5e5befa9a414bb4656e4c5aa6782e3990a241f6b863d'
x=json.loads(raw);bykey={a['key']:a for a in x['achievements']};g=next(a for a in x['groups'] if a['key']=='collection_fwishingGoals');e=bykey['achievement_100Fwishes'];root=x['root']
B=lambda *a:bytes(a);u=lambda n:B(0xce)+struct.pack('>I',n);fl=lambda n:B(0xca)+struct.pack('>f',n);long=lambda n:B(0xd3)+struct.pack('>q',n);gid=lambda s:b''.join(u(int(w,16))for w in s.split(':'));text=lambda s:B(0xa0|len(s))+s.encode();arr=lambda *a:B(0x90|len(a))+b''.join(a) if len(a)<16 else B(0xdc)+struct.pack('>H',len(a))+b''.join(a);doc=lambda tag,body:arr(B(tag),body);nil=B(0xc0);date=B(0xd7,0xff)+struct.pack('>Q',(123456700<<34)|1700000000)
def ach(id,guid,complete,current):return doc(16,arr(u(id),gid(guid),arr(B(0xc3 if complete else 0xc2),fl(current),date if complete else nil)))
def counter(id,guid,current,counted=False):return doc(17,arr(u(id),gid(guid),arr(fl(current),nil,arr(gid('00000001:00000002:00000003:00000004')) if counted else arr())))
def payload(v,bad=''):
    n=83 if v=='3.0.0' else 87
    a=[doc(18,arr(B(0),u(n+1 if bad=='migration' else n),text(v)))]
    for i,key in enumerate(g['member_keys'],1):
        r=bykey[key];a.append(ach(i,r['save_guid'],key!=e['key'],r['configured_threshold'] if key!=e['key'] else 7))
    a.append(ach(10,g['save_guid'],False,2 if bad=='group' else 3));a.append(counter(20,e['counter_save_guid'],8 if bad=='counter' else 7,bad=='counted'));a.append(counter(21,g['counter_save_guid'],3))
    key0=B(0x81)+gid('00000001:00000002:00000003:00000004')+long(-(1<<63));key1=B(0x83)+u(2)+long(638000000000000001)+u(3)+B(9)+u(4)+long((1<<63)-1)
    a.append(doc(32,arr(u(30),gid('00000000:00000000:00000000:00000003'),B(0),arr(doc(39,arr(key0,key1))))));a.append(doc(8,arr(u(31),arr(gid('00000001:00000002:00000003:00000004'),gid('00000001:00000002:00000003:00000004')))))
    return arr(B(0),B(4),arr(*a))
magic=bytes.fromhex('a1a2f8333c66ec455baa2dfc6325c2437a779c9906eecff0c022e5f6b6ca73b8')
def envelope(v,p):
    old=(f/f'valid-{v}.bin').read_bytes();m=old.index(magic);parts=[p[i:i+37]for i in range(0,len(p),37)]; count=len(parts)+1
    def literal(b):
        n=len(b);return B(n<<4)+b if n<15 else B(0xf0)+B(*([255]*((n-15)//255)),(n-15)%255)+b
    lengths=b''.join(B(0xcd)+struct.pack('>H',len(t))for t in parts);return old[:m+32]+(B(0x90|count)if count<16 else B(0xdc)+struct.pack('>H',count))+B(0xc8)+struct.pack('>H',len(lengths))+B(98)+lengths+b''.join(B(0xc6)+struct.pack('>I',len(literal(t)))+literal(t)for t in parts)
def acct(bad=''):
    # public catalog identity with wholly synthetic scalar/opaque values
    return json.dumps({'Achievements':{root['guid']:{'IsComplete':False,'CurrentValue':1 if bad=='root' else 0,'CompletedTime':None}},'Counters':{root['counter_guid']:{'CurrentValue':0,'CountedValues':[] if bad=='rootcount' else None,'CountedGuids':[]}},'Unknown':{'u64':18446744073709551615,'i64':-9223372036854775808}},separators=(',',':')).encode()
def zipbuild(v,slot,account):
    out=bytearray();records=[];method=8 if v=='3.0.1' else 0;flags=8 if method else 0
    for name,b in [('SettingsAccount/settings.json',account),('Saves/save_0.save',slot),('BackupSaves/synthetic.lbak',b'synthetic-not-save'),('other.bin',b'opaque\0\xff'*5)]:
        n=name.encode();c=(b'\x01'+struct.pack('<HH',len(b),len(b)^65535)+b)if method else b;crc=zlib.crc32(b);pos=len(out);extra=struct.pack('<HH',0x3344,2)+b'xy';com=b'comment'
        out.extend(struct.pack('<I5H3I2H',0x04034b50,20,flags,method,0,0,*((0,0,0)if flags else(crc,len(c),len(b))),len(n),len(extra))+n+extra+c)
        if flags:out.extend(struct.pack('<IIII',0x08074b50,crc,len(c),len(b)))
        records.append(struct.pack('<I6H3I5H2I',0x02014b50,20,20,flags,method,0,0,crc,len(c),len(b),len(n),len(extra),len(com),0,0,0,pos)+n+extra+com)
    start=len(out);cd=b''.join(reversed(records));comment=b'archive-comment';out.extend(cd+struct.pack('<I4H2IH',0x06054b50,0,0,len(records),len(records),len(cd),start,len(comment))+comment);return out
for v in ('3.0.0','3.0.1'):
 for bad in ('','group','counter','counted','root','rootcount','migration'):
    suffix='good' if not bad else bad;slot=envelope(v,payload(v,bad));(f/f'writer-{v}-{suffix}.zip').write_bytes(zipbuild(v,slot,acct(bad)))
