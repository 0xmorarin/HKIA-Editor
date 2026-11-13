#!/usr/bin/env python3
"""Reconstruct exact R2 Rust sources using only public, synthetic inputs. No Save paths accepted."""
import argparse, hashlib, json, os, pathlib, re, shutil, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PINS = json.loads((ROOT/'tests/rust/public-ci-pins.json').read_text())

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def checked(root, files):
    for rel, expected in files.items():
        if not (root/rel).is_file() or sha(root/rel) != expected:
            raise SystemExit('PIN_MISMATCH: '+rel)

def run(args, cwd, env=None):
    p = subprocess.run([str(x) for x in args], cwd=cwd, env=env, capture_output=True, text=True, timeout=600)
    if p.returncode:
        # This runner handles only public code and synthetic inputs. Compiler/test diagnostics are safe.
        print(p.stdout); print(p.stderr); raise SystemExit('COMMAND_FAILED: '+str(args[0]))
    return p.stdout

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--reference', type=Path, default=ROOT, help='Public reference tree only (no private source)')
    ap.add_argument('--preflight-only', action='store_true')
    a = ap.parse_args(); ref=a.reference.resolve(); checked(ref,PINS['reference']); checked(ROOT,PINS['crateSources']); checked(ROOT,PINS['generators'])
    with tempfile.TemporaryDirectory(prefix='hkia-rust-public-') as tmp:
        w=Path(tmp); crate=w/'crates/hkia-save-core'; crate.mkdir(parents=True)
        for rel in PINS['crateSources']:
            dest=w/rel; dest.parent.mkdir(parents=True,exist_ok=True); shutil.copyfile(ROOT/rel,dest)
        generated=w/'crates/hkia-save-core/tests/fixtures'; generated.mkdir(parents=True)
        run(['python3',ROOT/'tests/rust/generate-schema.py',ref/'scripts/research/native-v301-dbroot-schema.json',crate/'src/schema.rs'],w)
        run(['node',ROOT/'tests/rust/generate-synthetic-oracle.mjs',ref,generated],w)
        checked(w,PINS['generated']); actual={p.relative_to(w).as_posix() for p in crate.rglob('*') if p.is_file()}; expected=set(PINS['crateSources'])|set(PINS['generated'])
        if actual!=expected: raise SystemExit('UNEXPECTED_CRATE_ENTRY')
        report={'status':'PREFLIGHT_PASS','publicOnly':True,'crateFiles':len(actual),'generatedFiles':len(PINS['generated']),'rustTests':'NOT_RUN','realParity':'NOT_RUN'}
        if not a.preflight_only:
            env={k:v for k,v in os.environ.items() if k not in ('RUSTC','RUSTC_WRAPPER','RUSTC_WORKSPACE_WRAPPER','RUSTDOC','RUSTFLAGS','CARGO_ENCODED_RUSTFLAGS','CARGO_TARGET_DIR')}; env['CARGO_NET_OFFLINE']='true'; env['CARGO_TERM_COLOR']='never'
            report['cargoVersion']=run(['cargo','--version'],w,env).strip(); report['rustcVersion']=run(['rustc','--version'],w,env).strip()
            args=['cargo','test','--offline','--manifest-path',crate/'Cargo.toml','--target-dir',w/'target']; out=run(args,w,env)
            rows=re.findall(r'test result: ok\. (\d+) passed; (\d+) failed; (\d+) ignored; (\d+) measured; (\d+) filtered out',out)
            counts=[sum(int(x[i]) for x in rows) for i in range(5)]
            if counts != [PINS['expectedRustTests'],0,0,0,0]: raise SystemExit('RUST_TEST_COUNT_OR_STATUS_MISMATCH')
            print(out)
            run(['cargo','build','--offline','--release','--manifest-path',crate/'Cargo.toml','--target-dir',w/'target','--bin','hkia-private-parity'],w,env)
            report.update(status='SYNTHETIC_COMPILE_AND_TEST_PASS',rustTests={'passed':counts[0],'failed':0,'skipped':0},releaseBuild='PASS',binarySha256=sha(w/'target/release/hkia-private-parity'))
        print(json.dumps(report,indent=2))
if __name__=='__main__': main()
