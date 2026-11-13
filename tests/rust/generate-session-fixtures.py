#!/usr/bin/env python3
"""Deterministic synthetic ZIP32, Account and raw DEFLATE (no real saves)."""
import pathlib, struct, sys, zlib
out=pathlib.Path(sys.argv[1]); out.mkdir(parents=True,exist_ok=True)
account=b'{"Achievements":{"00000000000000000000000000000001":{"IsComplete":true,"CurrentValue":2,"CompletedTime":"2024-02-29T12:34:56.1234567Z","Unknown":18446744073709551615}},"Counters":{"00000000000000000000000000000002":{"CurrentValue":-1.25}},"Unknown":{"x":[null,true,9007199254740993]}}'
(out/'session-account.json').write_bytes(account)
slot=pathlib.Path(sys.argv[2]).read_bytes()
def stored_deflate(b):
    assert len(b)<=65535
    return b'\x01'+struct.pack('<HH',len(b),len(b)^65535)+b
for method,name,flags in [(0,'stored',0),(8,'deflated',8)]:
    data=bytearray(); central=bytearray(); count=0
    for path,raw in [('Saves/save_0.save',slot),('SettingsAccount/settings.json',account),('other.bin',b'abc'*1000)]:
        n=path.encode(); c=stored_deflate(raw) if method==8 else raw; crc=zlib.crc32(raw); pos=len(data)
        data.extend(struct.pack('<I5H3I2H',0x04034b50,20,flags,method,0,0,*((0,0,0) if flags else (crc,len(c),len(raw))),len(n),0)+n+c)
        if flags:data.extend(struct.pack('<4I',0x08074b50,crc,len(c),len(raw)))
        central.extend(struct.pack('<I6H3I5H2I',0x02014b50,20,20,flags,method,0,0,crc,len(c),len(raw),len(n),0,0,0,0,0,pos)+n); count+=1
    off=len(data);data.extend(central);data.extend(struct.pack('<I4H2IH',0x06054b50,0,0,count,count,len(central),off,0));(out/f'session-{name}.zip').write_bytes(data)
raw=b'A'*3000+b'B'*1000+b'C'*300+b'D'*20+bytes(range(100))*10
# Literal, deterministic synthetic vectors generated using zlib; avoid version-sensitive compression during CI.
vectors={'dynamic':bytes.fromhex('edcd431203510005c0d8b66ddbfa3313dbf6fdef900b64915d52a9d71768420000000000e0d75100f0f768f818f3068bcde1f2f802a1482c91cae40aa54aadd1eaf406a3c96cb1daec0ea7cbedf1fafc8160281c89c6e289642a9dc9e6f28562a95ca9d6ea8d668b5034d3ee747bfdc170349e4c67f3c572b5de6c77fbc3f174be5c6ff7c713070e1cdf3d5e'),'fixed':bytes.fromhex('73741c05a360148c8251300a46c1281805a360140c76e0340a46c12818f6c07914100d5cb00006462666165636760e4e2e6e1e5e3e7e0141216111513171094929691959397905452565155535750d4d2d6d1d5d3d7d03432363135333730b4b2b6b1b5b3b7b07472767175737770f4f2f6f1f5f3fff80c0a0e090d0b0f088c8a8e898d8b8f884c4a4e4513b46ed18b56360ed0000'),'stored':stored_deflate(raw)}
(out/'session-deflate.raw').write_bytes(raw)
for mode,v in vectors.items():
    assert zlib.decompress(v,-15)==raw
    (out/f'session-{mode}.deflate').write_bytes(v)
