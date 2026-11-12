                      
"""SOURCE-ONLY Quest Counter -> MissionDefinitionAsset PPtr crosswalk.

Run on locally obtained original v3.0.1 UnityFS *serialized* 44 MB payload:
 python 03-linkage-mission-ptr-crosswalk.py --repo /PATH/CANDIDATE --serial /PRIVATE/definitions_part00_CAB... --out /PATH/crosswalk.json
Optionally compare only AGGREGATE mission presence from PRIVATE original saves:
 ... --save-zip /PRIVATE/ORIGINAL.zip --old BackupSaves/...lbak --new Saves/save_0.save
Output excludes private save document IDs, mission progression, counters and timestamps.
Do not commit/save/archive the input UnityFS, actual save or intermediate decoded objects.
"""
from pathlib import Path
from importlib.machinery import SourceFileLoader
import argparse,hashlib,importlib.util,json,sys,zipfile
SOURCE_SHA='83580cee3e2effaee14780d921ba5621b1505774b6e0a349e8f08a61ec1c1a1a'
DEFINITIONS_BUNDLE_SHA='ba9f3f97d1598a6923d2f804a704ab356c33866aa2d5f03bf11003735419e9e0'
SOURCE_02_COUNTERS_SCHEMA='HKIA.CounterDependencyMap.1'

def main():
 p=argparse.ArgumentParser(description=__doc__)
 for required in ('repo','serial','out'):p.add_argument('--'+required,type=Path,required=True)
 p.add_argument('--source-zip',type=Path)
 p.add_argument('--definitions-bundle',type=Path)
 p.add_argument('--save-zip',type=Path)
 p.add_argument('--old',default='BackupSaves/SaveSlot_0_1792794844_1_189913_30000.lbak')
 p.add_argument('--new',default='Saves/save_0.save')
 args=p.parse_args()
 def sha(v):return hashlib.sha256(v.read_bytes()).hexdigest()
 if args.source_zip and sha(args.source_zip)!=SOURCE_SHA:raise AssertionError('Source ZIP SHA mismatch')
 if args.definitions_bundle and sha(args.definitions_bundle)!=DEFINITIONS_BUNDLE_SHA:raise AssertionError('definitions UnityFS SHA mismatch')
 if not args.serial.is_file() or args.serial.stat().st_size!=44325096:raise AssertionError('not the fixed original serialized definitions')
 helpers=args.repo/'scripts/unity-helpers'
 sys.path.insert(0,str(helpers))
 from unity_serial_parse import parse
 extract=SourceFileLoader('_hkia_extract_read_only',str(args.repo/'scripts/extract-achievement-definitions.py')).load_module()
 definitions=json.loads((args.repo/'docs/02-achievement/COUNTER_DEPENDENCY_MAP.json').read_text())
 if definitions['schema']!=SOURCE_02_COUNTERS_SCHEMA or definitions['counts']['by_kind']['GameCounterMissionDefinition']!=171:raise AssertionError('02 source counter contract mismatch')
 ref_by_guid={x['guid']:x for x in definitions['all_source_counters']}
 objects,types,blob=parse(args.serial)
 pathidx={pid:(off,size,ti) for _,pid,off,size,ti in objects}
 mission_types=[i for i,t in enumerate(types) if {'Mission','SerializedGuid','Storage'}<= {x['name'] for x in t['nodes'] if x['level']==1}]
 if len(mission_types)!=1:raise AssertionError('mission counter typed definition missing or ambiguous')
 mi=mission_types[0];target_roots={}
 recs=[]
 for _cid,pid,off,size,ti in objects:
  if ti!=mi:continue
  node=extract.tree(types[ti]['nodes']);reader=extract.Reader(blob[off:off+size]);d=reader.read(node)
  if reader.p!=size:raise AssertionError('counter type byte consumption mismatch')
  c=ref_by_guid.get(d['SerializedGuid'])
  if not c or c['key']!=d['COMMON_0x1ab']:raise AssertionError('counter source mismatch')
  pp=d['Mission'];asset_path=pp['m_PathID']
  if pp['m_FileID']!=0 or not asset_path in pathidx:raise AssertionError('unresolved PPtr')
  moff,msize,mti=pathidx[asset_path]
  if mti not in target_roots:
   root=extract.tree(types[mti]['nodes'])
   names=[x.name for x in root.children[:5]]
   if names!=['COMMON_0x176','COMMON_0x15d','COMMON_0x1ea','COMMON_0x1ab','SerializedGuid']:raise AssertionError('Mission asset prefix mismatch')
   root.children=root.children[:5];target_roots[mti]=root
  target_reader=extract.Reader(blob[moff:moff+msize]);target=target_reader.read(target_roots[mti]);g=target['SerializedGuid']
  if not (len(g)==32 and all(ch in '0123456789abcdef' for ch in g)) or not target['COMMON_0x1ab'].endswith('.MissionDefinitionAsset'):
   raise AssertionError('target not a MissionDefinitionAsset')
  recs.append({'counterKey':c['key'],'counterSourceGuid':c['guid'],
   'achievementKey':c['achievement_key'],'accountKey':c['account_key'],
   'missionSourceGuid':g,'missionAssetKey':target['COMMON_0x1ab'],
   'missionPptrPathId':str(asset_path),'sourceCounterKind':'GameCounterMissionDefinition',
   'classification':'RELATED','runtimeEdgeVerified':True,'persistentLinkageRequired':False,
   'requiredWrites':[], 'sourceEvidence':'UnityFS v3.0.1 counter.Mission.m_PathID -> MissionDefinitionAsset.SerializedGuid; native OnMissionCompleted only'})
 if len(recs)!=171 or len({x['counterSourceGuid'] for x in recs})!=171 or len({x['missionSourceGuid'] for x in recs})!=170:
  raise AssertionError('source mission mapping count mismatch')
 counts={'sourceMissionCounterLinks':171,'distinctSourceMissionAssets':170}
 if args.save_zip:
  spec=importlib.util.spec_from_file_location('_private_decoder_read_only',args.repo/'scripts/audit-linked-state.py')
  dec=importlib.util.module_from_spec(spec);spec.loader.exec_module(dec)
  with zipfile.ZipFile(args.save_zip) as z:
   for m in (args.old,args.new):
    if m.startswith('/') or '..' in Path(m).parts:raise ValueError('unsafe ZIP member')
   for label,name in (('backup',args.old),('active',args.new)):
    version,values,_,_=dec._decode(z.read(name))
    heads=[x[1] for x in values if isinstance(x,tuple) and len(x)==2 and x[0]==2 and isinstance(x[1],tuple) and len(x[1])==6]
    if len(heads)!=509:raise AssertionError('Mission docs unexpected count')
    mission_words={tuple(h[1:5]) for h in heads}
    to_words=lambda guid:tuple(int(guid[i:i+8][::-1],16) for i in range(0,32,8))
    count=sum(to_words(x['missionSourceGuid']) in mission_words for x in recs)
    counts[f'{label}SampleMatchedLinksAggregate']=count
    counts[f'{label}Version']=version
    counts[f'{label}MissionDocumentCount']=len(heads)
    print(f'AGGREGATE {label} {count}/171 mission-counter source relationships match saved MissionDatabaseModel GUID',flush=True)
 out={'schema':'HKIA.LinkageMissionDefinitionToCounterDelta.1',
 'source':{'definitionsSHA256':DEFINITIONS_BUNDLE_SHA,'version':'3.0.1'},
 'counts':counts,'scope':'SOURCE_MISSION_DEFINITION_BINDINGS_ONLY',
 'noUserSavedIdsEmitted':True,'writerEnabled':False,'pagesEnabled':False,'groupOrMetaRequiredWrites':0,
 'bindings':sorted(recs,key=lambda x:x['counterKey'])}
 args.out.parent.mkdir(parents=True,exist_ok=True)
 args.out.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
 print(f'PASS {len(recs)} source Mission refs across {len({x["missionSourceGuid"] for x in recs})} assets, REQUIRED=0, data bytes not exported')
if __name__=='__main__':main()
