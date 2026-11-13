#!/usr/bin/env python3
"""Fixed public R4 compile/test runner. No real Save paths accepted."""
import argparse,hashlib,json,os,pathlib,re,shutil,subprocess,tempfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
PINS=json.loads((ROOT/'tests/rust/writer-ci-pins.json').read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def checked(root,files):
 for rel,h in files.items():
  if not (root/rel).is_file() or sha(root/rel)!=h:raise SystemExit('PIN_MISMATCH: '+rel)
def run(args,cwd,env=None):
 p=subprocess.run([str(x) for x in args],cwd=cwd,env=env,capture_output=True,text=True,timeout=600)
 if p.returncode:print(p.stdout);print(p.stderr);raise SystemExit('COMMAND_FAILED: '+str(args[0]))
 return p.stdout

def main():
 ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--reference',type=Path,default=ROOT);ap.add_argument('--preflight-only',action='store_true');ap.add_argument('--abi-ts',action='store_true');ap.add_argument('--code-only-artifact',type=Path);a=ap.parse_args();ref=a.reference.resolve();checked(ref,PINS['reference']);checked(ROOT,PINS['crateSources']);checked(ROOT,PINS['support']);
 with tempfile.TemporaryDirectory(prefix='hkia-r4-public-') as tmp:
  w=Path(tmp);crate=w/'crates/hkia-save-core';crate.mkdir(parents=True)
  for rel in PINS['crateSources']:
   dest=w/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/rel,dest)
  f=crate/'tests/fixtures';f.mkdir(parents=True)
  run(['python3',ROOT/'tests/rust/generate-schema.py',ref/'scripts/research/native-v301-dbroot-schema.json',crate/'src/schema.rs'],w)
  run(['node',ROOT/'tests/rust/generate-synthetic-oracle.mjs',ref,f],w)
  run(['python3',ROOT/'tests/rust/generate-session-fixtures.py',f,f/'valid-3.0.0.bin'],w)
  run(['python3',ROOT/'tests/rust/generate-writer-catalog.py',ref/'docs/02-achievement/ACHIEVEMENT_SCHEMA.json',crate/'src/writer_catalog.rs'],w)
  run(['python3',ROOT/'tests/rust/generate-writer-fixtures.py',f,ref/'docs/02-achievement/ACHIEVEMENT_SCHEMA.json'],w)
  checked(w,PINS['generated']);actual={p.relative_to(w).as_posix() for p in crate.rglob('*')if p.is_file()};expected=set(PINS['crateSources'])|set(PINS['generated']);
  if actual!=expected:raise SystemExit('UNEXPECTED_CRATE_ENTRY')
  report={'status':'PREFLIGHT_PASS','publicOnly':True,'crateFiles':len(actual),'generatedFiles':len(PINS['generated']),'rustTests':'NOT_RUN','realParity':'NOT_RUN','abiTs':'NOT_RUN'}
  if a.abi_ts:
   if run(['tsc','--version'],w).strip()!='Version 5.8.3':raise SystemExit('TSC_VERSION')
   dest=w/'ts';run(['tsc','--strict','--target','ES2022','--module','ES2022','--lib','ES2022,DOM','--outDir',dest,ROOT/'rust-worker/session-abi.ts'],w);shutil.copyfile(dest/'session-abi.js',dest/'session-abi.mjs');e=dict(os.environ,HKIA_ABI_JS=str(dest/'session-abi.mjs'));out=run(['node','--test',ROOT/'tests/rust/session-abi.test.mjs'],w,e);print(out);report['abiTs']='14_PASS' if re.search(r'^# pass 14$',out,re.M) and re.search(r'^# fail 0$',out,re.M) else 'FAIL';
   if report['abiTs']=='FAIL':raise SystemExit('ABI_TEST_COUNT')
  if not a.preflight_only:
   env={k:v for k,v in os.environ.items()if k not in ('RUSTC','RUSTC_WRAPPER','RUSTC_WORKSPACE_WRAPPER','RUSTDOC','RUSTFLAGS','CARGO_ENCODED_RUSTFLAGS','CARGO_TARGET_DIR')};env.update(CARGO_NET_OFFLINE='true',CARGO_TERM_COLOR='never');report['rustcVersion']=run(['rustc','--version'],w,env).strip();report['cargoVersion']=run(['cargo','--version'],w,env).strip()
   if not report['rustcVersion'].startswith('rustc 1.85.1 ') or not report['cargoVersion'].startswith('cargo 1.85.1 '):raise SystemExit('TOOLCHAIN_MISMATCH')
   cmd=['cargo','test','--offline','--manifest-path',crate/'Cargo.toml','--target-dir',w/'target'];out=run(cmd,w,env);print(out);rows=re.findall(r'test result: ok\. (\d+) passed; (\d+) failed; (\d+) ignored; (\d+) measured; (\d+) filtered out',out);counts=[sum(int(x[i])for x in rows)for i in range(5)];
   if counts!=[PINS['expectedRustTests'],0,0,0,0]:raise SystemExit('RUST_TEST_COUNT_OR_STATUS_MISMATCH')
   run(['cargo','build','--offline','--release','--manifest-path',crate/'Cargo.toml','--target-dir',w/'target','--bin','hkia-writer-private'],w,env);binary=w/'target/release/hkia-writer-private';report.update(status='COMPILE_AND_SYNTHETIC_PASS',rustTests={'passed':counts[0],'failed':0,'skipped':0},releaseBuild='PASS',binarySha256=sha(binary),r3Regression=PINS['r3Regression'],newTests=PINS['newTests'])
   if a.code_only_artifact:
    dest=a.code_only_artifact.resolve();dest.mkdir(parents=True,exist_ok=False);shutil.copyfile(binary,dest/'hkia-writer-private');(dest/'build-report.json').write_text(json.dumps(report,indent=2)+'\n')
  print(json.dumps(report,indent=2))
if __name__=='__main__':main()
