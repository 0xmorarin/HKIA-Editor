#!/usr/bin/env python3
"""Generate Rust schema from the exact V18 private JSON; no native game files needed."""
import json, pathlib, hashlib, sys
p=pathlib.Path(sys.argv[1]); raw=p.read_bytes(); s=json.loads(raw)
def q(s): return json.dumps(s,ensure_ascii=True)
def expr(x):
    if isinstance(x,str): return f'Spec::Primitive({q(x)})'
    k,*a=x
    if k=='type': return f'Spec::Type({q(a[0])})'
    if k=='Dictionary': return f'Spec::Dict(&{expr(a[0])}, &{expr(a[1])})'
    if k=='Nullable': return f'Spec::Nullable(&{expr(a[0])})'
    if k in ['List','array','HashSet','IEnumerable']: return f'Spec::Seq(&{expr(a[0])})'
    raise ValueError(x)
out=['//! Generated from pinned V18 Native schema; private source.',f'//! SHA256 {hashlib.sha256(raw).hexdigest()}', '#[derive(Clone, Copy, Debug)]','pub(crate) enum Spec { Primitive(&\'static str), Type(&\'static str), Seq(&\'static Spec), Dict(&\'static Spec,&\'static Spec), Nullable(&\'static Spec) }','#[derive(Clone, Copy)]','pub(crate) enum Shape { Enum(Spec), Fields(&\'static [Option<Spec>]), Union(&\'static [(i32,Spec)]) }','pub(crate) fn shape(name:&str)->Option<Shape>{Some(match name{']
for n,t in s['types'].items():
    if t['enum']: a=f'Shape::Enum({expr(t["enum"])})'
    elif t['union']: a='Shape::Union(&['+','.join(f'({k},{expr(v)})' for k,v in sorted(t['union'].items(),key=lambda kv:int(kv[0])))+'])'
    else:
        f=t['fields']; a='Shape::Fields(&['+','.join('Some('+expr(f[str(i)])+')' if str(i) in f else 'None' for i in range(max(map(int,f),default=-1)+1))+'])'
    out.append(f'{q(n)}=>{a},')
out+=['_=>return None','})}',f'pub(crate) const ROOT:Spec={expr(s["root"])};']
pathlib.Path(sys.argv[2]).write_text('\n'.join(out)+'\n')
