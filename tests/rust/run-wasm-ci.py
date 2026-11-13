#!/usr/bin/env python3
"""R5 isolated public compile + real browser runner. No genuine Save arguments or upload.
Uses exact R4 source/generator pins; temporary generated synthetic inputs never in artifact.
"""
import argparse,hashlib,json,os,re,shutil,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];PINS=json.loads((ROOT/'tests/rust/writer-ci-pins.json').read_text());R5=json.loads((ROOT/'tests/rust/wasm-ci-pins.json').read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(root,files):
 for p,h in files.items():
  if not (root/p).is_file() or sha(root/p)!=h:raise SystemExit('PIN_MISMATCH '+p)
def run(cmd,cwd,env=None):
 p=subprocess.run([str(x) for x in cmd],cwd=cwd,env=env,capture_output=True,text=True,timeout=600);print(p.stdout);print(p.stderr)
 if p.returncode:raise SystemExit('FAILED '+str(cmd[0]))
 return p.stdout

def main():
 p=argparse.ArgumentParser();p.add_argument('--reference',type=Path,default=ROOT);p.add_argument('--preflight-only',action='store_true');p.add_argument('--chrome');p.add_argument('--code-only-artifact',type=Path);a=p.parse_args();ref=a.reference.resolve();check(ref,PINS['reference']);check(ROOT,PINS['crateSources']);check(ROOT,PINS['support']);check(ROOT,R5['files']);check(ROOT,{'tests/rust/writer-ci-pins.json':R5['r4Pins']});
 with tempfile.TemporaryDirectory(prefix='hkia-r5-') as tmp:
  w=Path(tmp);crate=w/'crates/hkia-save-core';bridge=crate/'wasm-bridge';f=crate/'tests/fixtures';f.mkdir(parents=True)
  for rel in [*PINS['crateSources'],*[x for x in R5['files'] if x.startswith('crates/')]]:
   dest=w/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/rel,dest)
  run(['python3',ROOT/'tests/rust/generate-schema.py',ref/'scripts/research/native-v301-dbroot-schema.json',crate/'src/schema.rs'],w)
  run(['node',ROOT/'tests/rust/generate-synthetic-oracle.mjs',ref,f],w)
  run(['python3',ROOT/'tests/rust/generate-session-fixtures.py',f,f/'valid-3.0.0.bin'],w)
  run(['python3',ROOT/'tests/rust/generate-writer-catalog.py',ref/'docs/02-achievement/ACHIEVEMENT_SCHEMA.json',crate/'src/writer_catalog.rs'],w)
  run(['python3',ROOT/'tests/rust/generate-writer-fixtures.py',f,ref/'docs/02-achievement/ACHIEVEMENT_SCHEMA.json'],w)
  check(w,PINS['generated']);expected=set(PINS['crateSources'])|set(PINS['generated'])|{x for x in R5['files'] if x.startswith('crates/')};assert {x.relative_to(w).as_posix() for x in crate.rglob('*') if x.is_file()}==expected
  bundle=w/'bundle';bundle.mkdir();assert run(['tsc','--version'],w).strip()=='Version 5.8.3'
  for lib,entry in [('ES2022,DOM','tests/rust/wasm-browser/browser-witness.ts'),('ES2022,WebWorker','rust-worker/module-worker.ts')]:run(['tsc','--strict','--target','ES2022','--module','ES2022','--lib',lib,'--rootDir',ROOT,'--outDir',bundle,ROOT/entry],w)
  web=bundle/'tests/rust/wasm-browser';shutil.copyfile(ROOT/'tests/rust/wasm-browser/index.html',web/'index.html')
  env=dict(os.environ,HKIA_R5_JS=str(bundle/'rust-worker/writer-abi.js'));out=run(['node','--test',ROOT/'tests/rust/writer-abi.test.mjs'],w,env);assert re.search(r'^# pass 10$',out,re.M) and re.search(r'^# fail 0$',out,re.M)
  js=bundle/'rust-worker/session-abi.js';shutil.copyfile(js,w/'session-abi.mjs');out=run(['node','--test',ROOT/'tests/rust/session-abi.test.mjs'],w,dict(os.environ,HKIA_ABI_JS=str(w/'session-abi.mjs')));assert re.search(r'^# pass 14$',out,re.M) and re.search(r'^# fail 0$',out,re.M)
  report={'status':'PREFLIGHT_PASS','r4CrateFiles':74,'bridgeFiles':2,'newTs':10,'r4Ts':14,'rustBridge':'NOT_RUN','wasm':'NOT_RUN','chrome':'NOT_RUN','realSave':'NOT_RUN'}
  if not a.preflight_only:
   assert a.chrome and a.code_only_artifact and not a.code_only_artifact.exists();env={k:v for k,v in os.environ.items() if k not in ('RUSTC','RUSTC_WRAPPER','RUSTC_WORKSPACE_WRAPPER','RUSTDOC','RUSTFLAGS','CARGO_ENCODED_RUSTFLAGS','CARGO_TARGET_DIR')};env.update(CARGO_NET_OFFLINE='true',CARGO_TERM_COLOR='never');assert run(['rustc','--version'],w,env).startswith('rustc 1.85.1 ');assert run(['cargo','--version'],w,env).startswith('cargo 1.85.1 ')
   out=run(['cargo','test','--offline','--manifest-path',bridge/'Cargo.toml','--target-dir',w/'target'],w,env);assert re.search(r'test result: ok\. 4 passed; 0 failed; 0 ignored',out)
   run(['cargo','build','--offline','--release','--manifest-path',bridge/'Cargo.toml','--target-dir',w/'target','--target','wasm32-unknown-unknown'],w,dict(env,RUSTFLAGS='-C link-arg=--max-memory=536870912'))
   wasm=w/'target/wasm32-unknown-unknown/release/hkia_wasm_bridge.wasm';assert wasm.read_bytes()[:8]==b'\0asm\x01\0\0\0';shutil.copyfile(wasm,web/wasm.name)
   run(['cargo','build','--offline','--release','--manifest-path',crate/'Cargo.toml','--target-dir',w/'target','--bin','hkia-writer-private'],w,env);native=w/'target/release/hkia-writer-private';result=w/'browser.json'
   run(['python3',ROOT/'tests/rust/wasm-browser/run-browser.py','--bundle',bundle,'--chrome',a.chrome,'--input300',f/'writer-3.0.0-good.zip','--input301',f/'writer-3.0.1-good.zip','--synthetic-native',native,'--result',result],w,env)
   br=json.loads(result.read_text());assert br['status']=='PASS_REAL_CHROME_MODULE_WORKER' and br['mode']=='SYNTHETIC' and len(br['results'])==8 and br['networkDenied']==br['serverViolations']==0 and sum(x.get('nativeExact',False) for x in br['results'])==6
   report.update(status='COMPILE_SYNTHETIC_REAL_CHROME_PASS',rustBridge=4,wasm='PASS',wasmSha256=sha(wasm),chrome=br,artifactFiles={x.relative_to(bundle).as_posix():sha(x) for x in bundle.rglob('*') if x.is_file()});shutil.copytree(bundle,a.code_only_artifact);(a.code_only_artifact/'build-report.json').write_text(json.dumps(report,indent=2)+'\n')
  print(json.dumps(report,indent=2))
if __name__=='__main__':main()
