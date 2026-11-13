#!/usr/bin/env python3
"""Compare exact R5.1 code-only artifact and a separately compiled R6 WASM. Synthetic only."""
import argparse,hashlib,json,subprocess,tempfile,zipfile
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[2]
BASE='f9cea14824fbcc7092cbff28a37599d119398f47a37653628981160b2d14a838';WASM='ecadf4450acf79c6068e81ae3dd2c9f021870d77453ce656e46fcdc4d6940e4c'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def run(args):return subprocess.run([str(x) for x in args],check=True,capture_output=True,text=True,timeout=240).stdout
p=argparse.ArgumentParser();p.add_argument('--prepared-root',type=Path,default=ROOT);p.add_argument('--baseline',type=Path,required=True);p.add_argument('--candidate',type=Path);p.add_argument('--candidate-sha');p.add_argument('--baseline-only',action='store_true');p.add_argument('--result',type=Path,required=True);a=p.parse_args()
assert not a.result.exists() and a.baseline_only!=(a.candidate is not None) and sha(a.baseline)==BASE
if a.candidate:assert a.candidate_sha and sha(a.candidate)==a.candidate_sha and a.candidate_sha!=WASM
with tempfile.TemporaryDirectory(prefix='hkia-r6-synthetic-') as td:
 w=Path(td);bundle=w/'bundle';bundle.mkdir();fixtures=w/'fixtures';fixtures.mkdir()
 with zipfile.ZipFile(a.baseline) as z:
  assert z.testzip() is None;report=json.loads(z.read('build-report.json'));files=report['artifactFiles'];assert len(files)==8 and set(z.namelist())==set(files)|{'build-report.json'}
  for rel,h in files.items():
   assert rel.startswith(('rust-worker/','tests/rust/wasm-browser/')) and '..' not in Path(rel).parts and Path(rel).suffix in ('.js','.html','.wasm');b=z.read(rel);assert hashlib.sha256(b).hexdigest()==h;f=bundle/rel;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
 wasm=bundle/'tests/rust/wasm-browser/hkia_wasm_bridge.wasm';assert sha(wasm)==WASM
 run(['python3',HERE/'generate.py',a.prepared_root.resolve(),fixtures]);rows=json.loads((fixtures/'cases.json').read_text())
 for row in rows:
  inp=fixtures/(row['case']+'.zip');assert sha(inp)==row['sha256'];mode='edit' if row['case'].startswith('mib-') and row['expect']=='accept' else 'read';outputs=[]
  for label,wp,pin in [('baseline',wasm,WASM)]+([] if a.baseline_only else [('candidate',a.candidate.resolve(),a.candidate_sha)]):
   out=w/(row['case']+'-'+label+'.zip');r=json.loads(run(['node',HERE/'run.mjs',bundle,wp,pin,inp,row['expect'],mode,out]));assert r['accepted']==(row['expect']=='accept') and r['originalUnchanged'] and sha(inp)==row['sha256'];r['oracle']=json.loads(run(['python3',HERE/'verify.py',inp,out])) if mode=='edit' else None;row[label]=r;outputs.append(out)
  if not a.baseline_only:
   assert row['candidate']['accepted']==row['baseline']['accepted'] and row['candidate']['details']==row['baseline']['details'] and row['candidate']['oracle']==row['baseline']['oracle'];row['deltaPeakBytes']=row['candidate']['wasmMemoryHighWaterBytes']-row['baseline']['wasmMemoryHighWaterBytes']
   if mode=='edit':assert outputs[0].read_bytes()==outputs[1].read_bytes()
  for f in outputs:f.unlink(missing_ok=True)
 status='BASELINE_ONLY_NOT_CANDIDATE_PASS' if a.baseline_only else 'PAIRED_NODE_WASM_PARITY_PASS';result={'status':status,'baselineSha':BASE,'candidateWasmSha':a.candidate_sha,'cases':rows,'resourceTargetAcceptance':False,'actualBrowser':'NOT_RUN'}
 if not a.baseline_only:
  largest=next(x for x in rows if x['case']=='mib-45');result['measured45MiBPeakReductionBytes']=-largest['deltaPeakBytes'];result['capacityImprovementMeasured']=largest['deltaPeakBytes']<0
 with a.result.open('x') as f:json.dump(result,f,indent=2);f.write('\n')
