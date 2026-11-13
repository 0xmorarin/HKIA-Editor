#!/usr/bin/env python3
"""Rebuild the exact R4-generated fixture closure in an isolated R6 workspace."""
import argparse,hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
PINS=json.loads((ROOT/'tests/rust/writer-ci-pins.json').read_text());R5=json.loads((ROOT/'tests/rust/wasm-ci-pins.json').read_text())
WRITER='crates/hkia-save-core/src/writer.rs';WRITER_R6='036ba3fbe4e4a70649ab8317a561cd36e3dc1ec808de5017ff3568ab99b010b1'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def check(root,files):
 for p,h in files.items():
  if not (root/p).is_file() or sha(root/p)!=h:raise SystemExit('PIN_MISMATCH '+p)
def run(args,w):subprocess.run([str(x) for x in args],cwd=w,check=True,timeout=240)
p=argparse.ArgumentParser();p.add_argument('--reference',type=Path,default=ROOT);p.add_argument('--workspace',type=Path,required=True);a=p.parse_args();ref=a.reference.resolve();w=a.workspace.resolve();assert not w.exists()
check(ref,PINS['reference']);check(ROOT,PINS['support']);check(ROOT,R5['files']);check(ROOT,{'tests/rust/writer-ci-pins.json':R5['r4Pins']});sources=dict(PINS['crateSources']);sources[WRITER]=WRITER_R6;check(ROOT,sources)
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
print(json.dumps({'status':'PREPARED_NOT_COMPILED','crateFiles':len(expected),'writerSha256':WRITER_R6,'generatedFiles':len(PINS['generated'])}))
