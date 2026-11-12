                      
"""Read-only v3.0.1 Native branch proof; prints only RVA metadata. No private bytes exported."""
import argparse,hashlib,struct,sys
from pathlib import Path
SOURCE_SHA='83580cee3e2effaee14780d921ba5621b1505774b6e0a349e8f08a61ec1c1a1a'
NSO_SHA='64bd5fb69239f57eb0578a1897a45a3c6f5e187480903f83df503b46bf827bfb'
DUMP_SHA='4b4eb6a543722e1dfaf8aad5593e9e1300723aff55e9e750d489744960feb738'
                                                                           
EDGES=(
 (0x3838AA8,0x3838AC0,'ACHIEVEMENT_META_TO_ACCOUNT'),
 (0x3838AB0,0x3838D90,'ACHIEVEMENT_INGAME_TO_SLOT_DEFERRED'),
 (0x383A6B8,0x383A6D0,'COUNTER_META_TO_ACCOUNT'),
 (0x383A6C0,0x383A9A0,'COUNTER_INGAME_TO_SLOT_DEFERRED'),
 (0x3838E80,0x3E43610,'ACHIEVEMENT_DEFERRED_TO_DATABASE'),
 (0x383AA90,0x3E43760,'COUNTER_DEFERRED_TO_DATABASE'),
 (0x3E43B20,0x3E43B40,'SERVER_DB_SAVED_TO_ACH_RELOAD'),
 (0x3E43B30,0x3E44070,'SERVER_DB_SAVED_TO_CTR_RELOAD'),
 (0x72A9608,0x72AA280,'ACHIEVEMENT_LOADED_UPWARD_TO_SETCURRENT'),
 (0x72AF5D8,0x72AF820,'REWARD_MAYBE_TO_APPLY'),
 (0x28529D4,0x28529E0,'MISSION_CONVERTER_TO_SAVE_MISSIONS_INTERNAL'),
 (0x2853068,0x2853120,'MISSION_CONVERTER_TO_TASK_SERIALIZER'),
 )
                                                                                               
WORDS=(
 (0x72B8EE4,0xA901A01F,'COUNTER_MAKEDATA_LEGACY_NULL_AND_GUID_REF'),
 (0x383AA88,0xA901A07F,'COUNTER_DEFERRED_DATA_LEGACY_NULL_GUID_REF'),
 (0x2852FAC,0xB9002668,'MISSION_CONVERTER_WRITES_STATUS_FIELD'),
 (0x285300C,0xF9001E68,'MISSION_CONVERTER_WRITES_COMPLETED_TICKS'),
 )
REQUIRED_DUMP_MARKERS=(
 'public class GameCounterMissionDefinition : GameCounterDefinition',
 'private class GameCounterMissionDefinition.Tracker',
 'private void OnMissionCompleted(ServerMissionData missionData)',
 'public class MissionDatabaseModel : IDocument',
 'public class RewardManagerTraitModel : TraitModel',
 'public class AchievementData',
 'public class GameCounterData',
 'public class ServerGameCountersManager',
 'public class MissionDatabaseConverter',
 )
def sha(path):
 h=hashlib.sha256()
 with path.open('rb') as f:
  for chunk in iter(lambda:f.read(1<<20),b''):h.update(chunk)
 return h.hexdigest()
def decode_branch(text,addr):
 op,=struct.unpack_from('<I',text,addr)
 if (op&0xfc000000) not in (0x14000000,0x94000000):raise AssertionError(f'0x{addr:X}: not B/BL')
 disp=op&0x3ffffff
 if disp&(1<<25):disp-=1<<26
 return addr+(disp<<2)
def get_text(raw):
 if raw[:4]!=b'NSO0':raise ValueError('invalid NSO0')
 try:import lz4.block
 except ImportError as e:raise RuntimeError('lz4 required') from e
 off,mem,size,_=struct.unpack_from('<IIII',raw,0x10)
 compressed,=struct.unpack_from('<I',raw,0x60)
 if mem!=0 or size<=0 or size>200_000_000 or off+compressed>len(raw):raise ValueError('invalid text section')
 text=lz4.block.decompress(raw[off:off+compressed],uncompressed_size=size)
 if len(text)!=size:raise AssertionError('decompressed size mismatch')
 return text
def main():
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--main',type=Path,required=True);p.add_argument('--dump',type=Path,required=True);args=p.parse_args()
 if sha(args.source)!=SOURCE_SHA:raise AssertionError('Source SHA mismatch')
 if sha(args.main)!=NSO_SHA:raise AssertionError('NSO SHA mismatch')
 if sha(args.dump)!=DUMP_SHA:raise AssertionError('dump.cs SHA mismatch')
 text=get_text(args.main.read_bytes())
 for a,b,label in EDGES:
  got=decode_branch(text,a)
  if got!=b:raise AssertionError(f'{label}: branch target mismatch: 0x{got:X}')
  print(f'PASS {label}: 0x{a:08X} -> 0x{b:08X}')
 for a,b,label in WORDS:
  got,=struct.unpack_from('<I',text,a)
  if got!=b:raise AssertionError(f'{label}: instruction mismatch')
  print(f'PASS {label}: 0x{a:08X}')
 dump=args.dump.read_text(errors='replace')
 for label in REQUIRED_DUMP_MARKERS:
  if label not in dump:raise AssertionError(f'missing model: {label}')
  print(f'PASS model declaration: {label}')
 print(f'PASS source sha={SOURCE_SHA}; native sha={NSO_SHA}; {len(EDGES)} branch, {len(WORDS)} opcode, {len(REQUIRED_DUMP_MARKERS)} model = {len(EDGES)+len(WORDS)+len(REQUIRED_DUMP_MARKERS)} checks')
if __name__=='__main__':main()
