#!/usr/bin/env python3
"""Generate only the accepted minimal Writer guard from the already public V33 catalog."""
import hashlib,json,pathlib,sys
src=pathlib.Path(sys.argv[1]); dst=pathlib.Path(sys.argv[2]);raw=src.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='eb56159869b739a602cf5e5befa9a414bb4656e4c5aa6782e3990a241f6b863d'
x=json.loads(raw);assert x['schema']=='HKIA.AchievementSemanticCatalog.1' and len(x['groups'])==63 and len(x['achievements'])==820 and len(x['account_achievements'])==31
bykey={a['key']:a for a in x['achievements']};byg={a['guid']:a for a in x['achievements']}; e=bykey['achievement_100Fwishes'];g=next(a for a in x['groups'] if a['key']==e['parent_key']);parent=bykey[g['key']];root=x['root']
assert e['save_guid']=='691edeb3:f7434408:97075486:697c5327' and e['counter_save_guid']=='609fbbdd:e64a948d:5691aebb:48382d53' and e['configured_threshold']==100
assert e['rule']=='MANUAL_INCREMENT' and e['counter_kind']=='GameCounterManualDefinition' and e['counter_storage']=='InGame' and e['counter_enabled'] and e['own_counter_state']!='UNIQUE_TRACKING' and not e['required_dlc_nonzero'] and not e['event_year'] and not e['event_path_id']
assert sum(a['counter_guid']==e['counter_guid'] for a in x['achievements'])==1 and not any(a['counter_guid']==e['counter_guid'] for a in x['account_achievements'])
assert parent['rule']=='GROUP_REFERENCES' and not parent['required_dlc_nonzero'] and not parent['event_year'] and not parent['event_path_id'] and not g['required_dlc_nonzero'] and g['required_count']==4 and root['source_reference_count']==63
fmt=lambda s:'['+','.join('0x'+v for v in s.split(':'))+']'
lines=['//! Generated from pinned public semantic catalog; no original Save data.',f'pub const TARGET:[u32;4]={fmt(e["save_guid"])};',f'pub const TARGET_COUNTER:[u32;4]={fmt(e["counter_save_guid"])};',f'pub const GROUP:[u32;4]={fmt(g["save_guid"])};',f'pub const GROUP_COUNTER:[u32;4]={fmt(g["counter_save_guid"])};',f'pub const ROOT:&str="{root["guid"]}";',f'pub const ROOT_COUNTER:&str="{root["counter_guid"]}";',f'pub const ROOT_COUNT:u32={root["source_reference_count"]};','pub const MEMBERS:[([u32;4],f32);4]=[']
for a in g['member_guids']:
 v=byg[a];lines.append(f' ({fmt(v["save_guid"])},{float(v["configured_threshold"])}f32),')
lines+= ['];','pub const ROOT_GROUPS:[([u32;4],f32);63]=[']
for v in x['groups']:lines.append(f' ({fmt(v["save_guid"])},{float(v["required_count"])}f32),')
lines+= ['];'];dst.write_text('\n'.join(lines)+'\n')
