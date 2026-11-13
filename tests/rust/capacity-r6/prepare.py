#!/usr/bin/env python3
"""Rebuild the exact R4-generated fixture closure in an isolated R6 workspace."""
import argparse,hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PINS=json.loads((ROOT/'tests/rust/writer-ci-pins.json').read_text());R5=json.loads((ROOT/'tests/rust/wasm-ci-pins.json').read_text())
R61_SOURCES={'crates/hkia-save-core/src/writer.rs': '97862c26c7f2fe94cc5ecb5caf7d8a9836dd9dfddcb5c57bcd85faa56b1fa61f', 'crates/hkia-save-core/src/envelope.rs': '333327c7a32951b22a836095f5bbf4ca3f2ece7f1a9a9d31e74e2b4dd6af57b7', 'crates/hkia-save-core/src/lib.rs': '55c93b9dd2ef1b9501486e479a03a093e7c0b642e3ee25c22b01350aaa5ec350', 'crates/hkia-save-core/src/session.rs': 'f15fc4a9e8323877828415cd826f3b810f9bdb54c573499e43fc133aadd8711d'}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(root,files):
 for p,h in files.items():
  if not (root/p).is_file() or sha(root/p)!=h:raise SystemExit('PIN_MISMATCH '+p)
def run(args,w):subprocess.run([str(x) for x in args],cwd=w,check=True,timeout=240)
p=argparse.ArgumentParser();p.add_argument('--reference',type=Path,default=ROOT);p.add_argument('--workspace',type=Path,required=True);a=p.parse_args();ref=a.reference.resolve();w=a.workspace.resolve();assert not w.exists()
check(ref,PINS['reference']);check(ROOT,PINS['support']);check(ROOT,R5['files']);check(ROOT,{'tests/rust/writer-ci-pins.json':R5['r4Pins']});sources=dict(PINS['crateSources']);sources.update(R61_SOURCES);check(ROOT,sources)
for rel in [*sources,*[x for x in R5['files'] if x.startswith('crates/')]]:
 dest=w/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/rel,dest)
crate=w/'crates/hkia-save-core';f=crate/'tests/fixtures';f.mkdir(parents=True,exist_ok=True)
run(['python3',ROOT/'tests/rust/generate-schema.py',ref/'scripts/research/native-v301-dbroot-schema.json',crate/'src/schema.rs'],w)
run(['node',ROOT/'tests/rust/generate-synthetic-oracle.mjs',ref,f],w)
run(['python3',ROOT/'tests/rust/generate-session-fixtures.py',f,f/'valid-3.0.0.bin'],w)
run(['python3',ROOT/'tests/rust/generate-writer-catalog.py',ref/'docs/02-achievement/ACHIEVEMENT_SCHEMA.json',crate/'src/writer_catalog.rs'],w)
run(['python3',ROOT/'tests/rust/generate-writer-fixtures.py',f,ref/'docs/02-achievement/ACHIEVEMENT_SCHEMA.json'],w)
check(w,PINS['generated']);expected=set(sources)|set(PINS['generated'])|{x for x in R5['files'] if x.startswith('crates/')};assert {x.relative_to(w).as_posix() for x in crate.rglob('*') if x.is_file()}==expected
# Compare runner consumes the prepared root, including the exact fixture pins.
dest=w/'tests/rust/writer-ci-pins.json';dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(ROOT/'tests/rust/writer-ci-pins.json',dest)
print(json.dumps({'status':'PREPARED_NOT_COMPILED','crateFiles':len(expected),'sourceSha256':R61_SOURCES,'generatedFiles':len(PINS['generated'])}))
