var ft = Array.isArray, tr = Array.prototype.indexOf, tt = Array.prototype.includes, ot = Array.from, ln = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, nr = Object.getOwnPropertyDescriptors, rr = Object.prototype, ir = Array.prototype, an = Object.getPrototypeOf, jt = Object.isExtensible;
const wt = () => {
};
function sr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function fn() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
function lr(e, t) {
  if (Array.isArray(e))
    return e;
  if (!(Symbol.iterator in e))
    return Array.from(e);
  const n = [];
  for (const r of e)
    if (n.push(r), n.length === t) break;
  return n;
}
const C = 2, qe = 4, ut = 8, on = 1 << 24, B = 16, X = 32, re = 64, yt = 128, It = 256, G = 512, N = 1024, x = 2048, K = 4096, R = 8192, L = 16384, Fe = 32768, Et = 1 << 25, xe = 65536, nt = 1 << 17, ar = 1 << 18, De = 1 << 19, fr = 1 << 20, Q = 1 << 25, me = 65536, rt = 1 << 21, Ne = 1 << 22, fe = 1 << 23, je =                 Symbol("$state"), un =                 Symbol("component"), or =                 Symbol(""), cn =                 Symbol("attributes"), ur =                 Symbol("class"), cr =                 Symbol("style"), bt =                 Symbol("text"), We = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), hr = (
                                                                                                             
  !!globalThis.document?.contentType &&                 globalThis.document.contentType.includes("xml")
), dr = 1, vr = 2, hn = 4, _r = 8, pr = 16, gr = 1, mr = 2, k =                 Symbol("uninitialized"), wr = "http://www.w3.org/1999/xhtml";
function yr() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Er() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function br() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function dn(e) {
  return e === this.v;
}
function Sr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function vn(e) {
  return !Sr(e, this.v);
}
function Tr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Ar(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function kr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Nr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function xr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Cr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ir() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let J = null;
function Ce(e) {
  J = e;
}
function _n(e, t = !1, n) {
  J = {
    p: J,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
                           
      b
    ),
    l: null
  };
}
function pn(e) {
  var t = (
                                   
    J
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Qr(r);
  }
  return t.i = !0, J = t.p, gn(e);
}
function gn(e = {}) {
  return ln(e, un, { value: !0 }), e;
}
function mn() {
  return !0;
}
let ve = [];
function wn() {
  var e = ve;
  ve = [], sr(e);
}
function ae(e) {
  if (ve.length === 0 && !Ge) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && wn();
    });
  }
  ve.push(e);
}
function Or() {
  for (; ve.length > 0; )
    wn();
}
const Rr = -7169;
function S(e, t) {
  e.f = e.f & Rr | t;
}
function Ot(e) {
  (e.f & G) !== 0 || e.deps === null ? S(e, N) : S(e, K);
}
function yn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & C) === 0 || (t.f & me) === 0 || (t.f ^= me, yn(
                              
        t.deps
      ));
}
function En(e, t, n) {
  (e.f & x) !== 0 ? t.add(e) : (e.f & K) !== 0 && n.add(e), yn(e.deps), S(e, N);
}
function ct(e) {
  var t = y, n = b;
  H(null), te(null);
  try {
    return e();
  } finally {
    H(t), te(n);
  }
}
function Fr(e, t, n, r) {
  const i = Rt;
  var s = e.filter((d) => !d.settled), l = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(l);
    return;
  }
  var f = (
                         
    b
  ), a = Dr(), o = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((d) => d.promise)) : null;
  function u(d) {
    if ((f.f & L) === 0) {
      a();
      try {
        r([...l, ...d]);
      } catch (_) {
        Z(_, f);
      }
      it();
    }
  }
  var c = bn();
  if (n.length === 0) {
    o.then(() => u([])).finally(c);
    return;
  }
  function h() {
    Promise.all(n.map((d) =>                 Mr(d))).then(u).catch((d) => Z(d, f)).finally(c);
  }
  o ? o.then(() => {
    a(), h(), it();
  }) : h();
}
function Dr() {
  var e = (
                         
    b
  ), t = y, n = J, r = (
                        
    w
  );
  return function(s = !0) {
    te(e), H(t), Ce(n), s && (e.f & L) === 0 && (r?.activate(), r?.apply());
  };
}
function it(e = !0) {
  te(null), H(null), Ce(null), e && w?.deactivate();
}
function bn() {
  var e = (
                         
    b
  ), t = e.b, n = (
                        
    w
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function Rt(e) {
  var t = C | x;
  return b !== null && (b.f |= De), {
    ctx: J,
    deps: null,
    effects: null,
    equals: dn,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      k
    ),
    wv: 0,
    parent: b,
    ac: null
  };
}
const Le =                 Symbol("obsolete");
                       
function Mr(e, t, n) {
  let r = (
                                
    b
  );
  r === null && Tr();
  var i = (
                             
                          
    void 0
  ), s = we(
                    
    k
  ), l = !y, f =                 new Set();
  return ei(() => {
    var a = (
                           
      b
    ), o = fn();
    i = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, (d) => {
        d !== We && o.reject(d);
      }).finally(it);
    } catch (d) {
      o.reject(d), it();
    }
    var u = (
                          
      w
    );
    if (l) {
      if ((a.f & Fe) !== 0)
        var c = bn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        u.async_deriveds.get(a)?.reject(Le);
      else
        for (const d of f.values())
          d.reject(Le);
      f.add(o), u.async_deriveds.set(a, o);
    }
    const h = (d, _ = void 0) => {
      c?.(), f.delete(o), _ !== Le && (u.activate(), _ ? (s.f |= fe, Ie(s, _)) : ((s.f & fe) !== 0 && (s.f ^= fe), Ie(s, d)), u.deactivate());
    };
    o.promise.then(h, (d) => h(null, d || "unknown"));
  }), Mn(() => {
    for (const a of f)
      a.reject(Le);
  }), new Promise((a) => {
    function o(u) {
      function c() {
        u === i ? a(s) : o(i);
      }
      u.then(c, c);
    }
    o(i);
  });
}
                       
function Lr(e) {
  const t =                 Rt(e);
  return Yn(t), t;
}
                       
function Pr(e) {
  const t =                 Rt(e);
  return t.equals = vn, t;
}
function Vr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      D(
                             
        t[n]
      );
  }
}
function Ft(e) {
  var t, n = b, r = e.parent;
  if (!ye && r !== null && e.v !== k &&                                                                                                      
  (r.f & (L | R)) !== 0)
    return yr(), e.v;
  te(r);
  try {
    e.f &= ~me, Vr(e), t = qn(e);
  } finally {
    te(n);
  }
  return t;
}
function Sn(e) {
  var t = Ft(e);
  if (!e.equals(t) && (e.wv = Gn(), (!w?.is_fork || e.deps === null) && (w !== null ? (w.capture(e, t, !0), St?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    S(e, N);
    return;
  }
  ye || (z !== null ? (Lt() || w?.is_fork) && z.set(e, t) : Ot(e));
}
function Ur(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ct(() => {
        t.ac.abort(We), t.ac = null;
      }), t.fn !== null && (t.teardown = wt), ze(t, 0), Vt(t));
}
function Tn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Oe(t);
}
let dt = null, be = null, w = null, St = null, z = null, Tt = null, Ge = !1, vt = !1, ke = null, Qe = null;
var Gt = 0;
let Yr = 1;
class ue {
  id = Yr++;
                                              
  #t = !1;
  linked = !0;
                             
  #l = null;
                             
  #e = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #f =                 new Set();
     
                                                                                     
                                        
     
  #r =                 new Set();
     
                                                             
     
  #s = 0;
     
                                                                                
                                
     
  #n =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #a = null;
     
                                             
                     
     
  #i = [];
     
                                                 
                     
     
  #_ = [];
     
                                                                               
                        
     
  #o =                 new Set();
     
                                          
                        
     
  #u =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #h =                 new Map();
     
                                                                                                    
                        
     
  #p =                 new Set();
  is_fork = !1;
  #c = !1;
  constructor() {
    be === null ? dt = be = this : (be.#e = this, this.#l = be), be = this;
  }
  #w() {
    if (this.is_fork) return !0;
    for (const r of this.#n.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
        if (this.#h.has(t)) {
          n = !0;
          break;
        }
        t = t.parent;
      }
      if (!n)
        return !0;
    }
    return !1;
  }
     
                                                                      
                           
     
  skip_effect(t) {
    this.#h.has(t) || this.#h.set(t, { d: [], m: [] }), this.#p.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#h.get(t);
    if (r) {
      this.#h.delete(t);
      for (var i of r.d)
        S(i, x), n(i);
      for (i of r.m)
        S(i, K), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#t = !0, Gt++ > 1e3 && (this.#v(), Gr());
    for (const a of this.#o)
      this.#u.delete(a), S(a, x), this.schedule(a);
    for (const a of this.#u)
      S(a, K), this.schedule(a);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = ke = [], r = [], i = Qe = [];
    for (const a of t)
      try {
        this.#E(a, n, r);
      } catch (o) {
        throw Nn(a), this.#w() || this.discard(), o;
      }
    if (w = null, i.length > 0) {
      var s = ue.ensure();
      for (const a of i)
        s.schedule(a);
    }
    if (ke = null, Qe = null, this.#w()) {
      this.#d(r), this.#d(n);
      for (const [a, o] of this.#h)
        kn(a, o);
      i.length > 0 &&                       
      w.#g();
      return;
    }
    const l = this.#y();
    if (l) {
      this.#d(r), this.#d(n), l.#b(this);
      return;
    }
    this.#o.clear(), this.#u.clear();
    for (const a of this.#f) a(this);
    this.#f.clear(), St = this, Ht(r), Ht(n), St = null, this.#a?.resolve();
    var f = (
                                 
                            
      w
    );
    if (this.#s === 0 && (this.#i.length === 0 || f !== null) && this.#v(), this.#i.length > 0)
      if (f !== null) {
        const a = f;
        a.#i.push(...this.#i.filter((o) => !a.#i.includes(o)));
      } else
        f = this;
    f !== null && ($.clear(), f.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #E(t, n, r) {
    t.f ^= N;
    for (var i = t.first; i !== null; ) {
      var s = i.f, l = (s & (X | re)) !== 0, f = l && (s & N) !== 0, a = f || (s & R) !== 0 || this.#h.has(i);
      if (!a && i.fn !== null) {
        l ? i.f ^= N : (s & qe) !== 0 ? n.push(i) : Xe(i) && ((s & B) !== 0 && this.#u.add(i), Oe(i));
        var o = i.first;
        if (o !== null) {
          i = o;
          continue;
        }
      }
      for (; i !== null; ) {
        var u = i.next;
        if (u !== null) {
          i = u;
          break;
        }
        i = i.parent;
      }
    }
  }
  #y() {
    for (var t = this.#l; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#l;
    }
    return null;
  }
     
                         
     
  #b(t) {
    for (const [r, i] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of t.async_deriveds) {
      const s = this.async_deriveds.get(r);
      s && i.promise.then(s.resolve).catch(s.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#o, t.#u);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & C) !== 0 && (r.f & (x | K)) === 0))
        for (const f of i) {
          var s = f.f;
          if ((s & C) !== 0)
            n(
                                    
              f
            );
          else {
            var l = (
                                   
              f
            );
            s & (Ne | B) && !this.async_deriveds.has(l) && (this.#u.delete(l), S(l, x), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), w = this, this.#g();
  }
     
                              
     
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      En(t[n], this.#o, this.#u);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== k && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & fe) === 0 && (this.current.set(t, [n, r]), z?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    w = this;
  }
  deactivate() {
    w = null, z = null;
  }
  flush() {
    try {
      vt = !0, w = this, this.#g();
    } finally {
      Gt = 0, Tt = null, ke = null, Qe = null, vt = !1, w = null, z = null, $.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Le);
    this.#v(), this.#a?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#_.push(t);
  }
  #m() {
    for (let c = dt; c !== null; c = c.#e) {
      var t = c.id < this.id, n = [];
      for (const [h, [d, _]] of this.current) {
        if (c.current.has(h)) {
          var r = (
                                         
            c.current.get(h)[0]
          );
          if (t && d !== r)
            c.current.set(h, [d, _]);
          else
            continue;
        }
        n.push(h);
      }
      if (t)
        for (const [h, d] of this.async_deriveds) {
          const _ = c.async_deriveds.get(h);
          _ && d.promise.then(_.resolve).catch(_.reject);
        }
      var i = [...c.current.keys()].filter(
        (h) => !                             
        c.current.get(h)[1]
      );
      if (!(!c.#t || i.length === 0)) {
        var s = i.filter((h) => !this.current.has(h));
        if (s.length === 0)
          t && c.discard();
        else if (n.length > 0) {
          if (t)
            for (const h of this.#p)
              c.unskip_effect(h, (d) => {
                (d.f & (B | Ne)) !== 0 ? c.schedule(d) : c.#d([d]);
              });
          c.activate();
          var l =                 new Set(), f =                 new Map();
          for (var a of n)
            An(a, s, l, f);
          f =                 new Map();
          var o = [...c.current].filter(([h, d]) => {
            const _ = this.current.get(h);
            return _ ? _[0] !== d[0] || _[1] !== d[1] : !0;
          }).map(([h]) => h);
          if (o.length > 0)
            for (const h of this.#_)
              (h.f & (L | R | nt)) === 0 && Dt(h, o, f) && ((h.f & (Ne | B)) !== 0 ? (S(h, x), c.schedule(h)) : c.#o.add(h));
          if (c.#i.length > 0 && !c.#c) {
            c.apply();
            for (var u of c.#i)
              c.#E(u, [], []);
            c.#i = [];
          }
          c.deactivate();
        }
      }
    }
  }
     
                              
                           
     
  increment(t, n) {
    if (this.#s += 1, t) {
      let r = this.#n.get(n) ?? 0;
      this.#n.set(n, r + 1);
    }
  }
     
                              
                           
     
  decrement(t, n) {
    if (this.#s -= 1, t) {
      let r = this.#n.get(n) ?? 0;
      r === 1 ? this.#n.delete(n) : this.#n.set(n, r - 1);
    }
    this.#c || (this.#c = !0, ae(() => {
      this.#c = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, n) {
    for (const r of t)
      this.#o.add(r);
    for (const r of n)
      this.#u.add(r);
    t.clear(), n.clear();
  }
                                           
  oncommit(t) {
    this.#f.add(t);
  }
                                           
  ondiscard(t) {
    this.#r.add(t);
  }
  settled() {
    return (this.#a ??= fn()).promise;
  }
  static ensure() {
    if (w === null) {
      const t = w = new ue();
      !vt && !Ge && ae(() => {
        t.#t || t.flush();
      });
    }
    return w;
  }
  apply() {
    {
      z = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (Tt = t, t.b?.is_pending && (t.f & (qe | ut | on)) !== 0 && (t.f & Fe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (ke !== null && n === b && (y === null || (y.f & C) === 0))
        return;
      if ((r & (re | X)) !== 0) {
        if ((r & N) === 0)
          return;
        n.f ^= N;
      }
    }
    this.#i.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#l, n = this.#e;
      t === null ? dt = n : t.#e = n, n === null ? be = t : n.#l = t, this.linked = !1;
    }
  }
}
function jr(e) {
  var t = Ge;
  Ge = !0;
  try {
    for (var n; ; ) {
      if (Or(), w === null)
        return (
                          
          n
        );
      w.flush();
    }
  } finally {
    Ge = t;
  }
}
function Gr() {
  try {
    kr();
  } catch (e) {
    Z(e, Tt);
  }
}
let ne = null;
function Ht(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (L | R)) === 0 && Xe(r) && (ne =                 new Set(), Oe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pn(r), ne?.size > 0)) {
        $.clear();
        for (const i of ne) {
          if ((i.f & (L | R)) !== 0) continue;
          const s = [i];
          let l = i.parent;
          for (; l !== null; )
            ne.has(l) && (ne.delete(l), s.push(l)), l = l.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const a = s[f];
            (a.f & (L | R)) === 0 && Oe(a);
          }
        }
        ne.clear();
      }
    }
    ne = null;
  }
}
function An(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & C) !== 0 ? An(
                              
        i,
        t,
        n,
        r
      ) : (s & (Ne | B)) !== 0 && (s & x) === 0 && Dt(i, t, r) && (S(i, x), Mt(
                             
        i
      ));
    }
}
function Dt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (tt.call(t, i))
        return !0;
      if ((i.f & C) !== 0 && Dt(
                              
        i,
        t,
        n
      ))
        return n.set(
                                
          i,
          !0
        ), !0;
    }
  return n.set(e, !1), !1;
}
function Mt(e) {
  w.schedule(e);
}
function kn(e, t) {
  if (!((e.f & X) !== 0 && (e.f & N) !== 0)) {
    (e.f & x) !== 0 ? t.d.push(e) : (e.f & K) !== 0 && t.m.push(e), S(e, N);
    for (var n = e.first; n !== null; )
      kn(n, t), n = n.next;
  }
}
function Nn(e) {
  S(e, N);
  for (var t = e.first; t !== null; )
    Nn(t), t = t.next;
}
let st =                 new Set();
const $ =                 new Map();
let xn = !1;
function we(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: dn,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function se(e, t) {
  const n = we(e);
  return Yn(n), n;
}
                       
function Hr(e, t = !1, n = !0) {
  const r = we(e);
  return t || (r.equals = vn), r;
}
function de(e, t, n = !1) {
  y !== null &&                                                                                         
                                                                
  (!W || (y.f & nt) !== 0) && mn() && (y.f & (C | B | Ne | nt)) !== 0 && (ee === null || !ee.has(e)) && Cr();
  let r = n ? Pe(t) : t;
  return Ie(e, r, Qe);
}
function Ie(e, t, n = null) {
  if (!e.equals(t)) {
    ye ? $.set(e, t) : $.has(e) || $.set(e, e.v);
    var r = ue.ensure();
    if (r.capture(e, t), (e.f & C) !== 0) {
      const i = (
                              
        e
      );
      (e.f & x) !== 0 && Ft(i), z === null && Ot(i);
    }
    e.wv = Gn(), Cn(e, x, n), b !== null && (b.f & N) !== 0 && (b.f & (X | re)) === 0 && (V === null ? ii([e]) : V.push(e)), !r.is_fork && st.size > 0 && !xn && qr();
  }
  return t;
}
function qr() {
  xn = !1;
  for (const e of st) {
    (e.f & N) !== 0 && S(e, K);
    let t;
    try {
      t = Xe(e);
    } catch {
      t = !0;
    }
    t && Oe(e);
  }
  st.clear();
}
function He(e) {
  de(e, e.v + 1);
}
function Cn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var l = r[s], f = l.f, a = (f & x) === 0;
      if (a && S(l, t), (f & nt) !== 0)
        st.add(
                               
          l
        );
      else if ((f & C) !== 0) {
        var o = (
                                
          l
        );
        z?.delete(o), (f & me) === 0 && (f & G && (b === null || (b.f & rt) === 0) && (l.f |= me), Cn(o, K, n));
      } else if (a) {
        var u = (
                               
          l
        );
        (f & B) !== 0 && ne !== null && ne.add(u), n !== null ? n.push(u) : Mt(u);
      }
    }
}
function Pe(e) {
  if (typeof e != "object" || e === null || je in e || un in e)
    return e;
  const t = an(e);
  if (t !== rr && t !== ir)
    return e;
  var n =                 new Map(), r = ft(e), i =                 se(0), s = ge, l = (f) => {
    if (ge === s)
      return f();
    var a = y, o = ge;
    H(null), Kt(s);
    var u = f();
    return H(a), Kt(o), u;
  };
  return r && n.set("length",                 se(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(f, a, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && Nr();
        var u = n.get(a);
        return u === void 0 ? l(() => {
          var c =                 se(o.value);
          return n.set(a, c), c;
        }) : de(u, o.value, !0), !0;
      },
      deleteProperty(f, a) {
        var o = n.get(a);
        if (o === void 0) {
          if (a in f) {
            const u = l(() =>                 se(k));
            n.set(a, u), He(i);
          }
        } else
          de(o, k), He(i);
        return !0;
      },
      get(f, a, o) {
        if (a === je)
          return e;
        var u = n.get(a), c = a in f;
        if (u === void 0 && (!c || Ye(f, a)?.writable) && (u = l(() => {
          var d = Pe(c ? f[a] : k), _ =                 se(d);
          return _;
        }), n.set(a, u)), u !== void 0) {
          var h = Y(u);
          return h === k ? void 0 : h;
        }
        return Reflect.get(f, a, o);
      },
      getOwnPropertyDescriptor(f, a) {
        var o = Reflect.getOwnPropertyDescriptor(f, a);
        if (o && "value" in o) {
          var u = n.get(a);
          u && (o.value = Y(u));
        } else if (o === void 0) {
          var c = n.get(a), h = c?.v;
          if (c !== void 0 && h !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return o;
      },
      has(f, a) {
        if (a === je)
          return !0;
        var o = n.get(a), u = o !== void 0 && o.v !== k || Reflect.has(f, a);
        if (o !== void 0 || b !== null && (!u || Ye(f, a)?.writable)) {
          o === void 0 && (o = l(() => {
            var h = u ? Pe(f[a]) : k, d =                 se(h);
            return d;
          }), n.set(a, o));
          var c = Y(o);
          if (c === k)
            return !1;
        }
        return u;
      },
      set(f, a, o, u) {
        var c = n.get(a), h = a in f;
        if (r && a === "length")
          for (var d = o; d <                              
          c.v; d += 1) {
            var _ = n.get(d + "");
            _ !== void 0 ? de(_, k) : d in f && (_ = l(() =>                 se(k)), n.set(d + "", _));
          }
        if (c === void 0)
          (!h || Ye(f, a)?.writable) && (c = l(() =>                 se(void 0)), de(c, Pe(o)), n.set(a, c));
        else {
          h = c.v !== k;
          var E = l(() => Pe(o));
          de(c, E);
        }
        var p = Reflect.getOwnPropertyDescriptor(f, a);
        if (p?.set && p.set.call(u, o), !h) {
          if (r && typeof a == "string") {
            var v = (
                                           
              n.get("length")
            ), g = Number(a);
            Number.isInteger(g) && g >= v.v && de(v, g + 1);
          }
          He(i);
        }
        return !0;
      },
      ownKeys(f) {
        Y(i);
        var a = Reflect.ownKeys(f).filter((c) => {
          var h = n.get(c);
          return h === void 0 || h.v !== k;
        });
        for (var [o, u] of n)
          u.v !== k && !(o in f) && a.push(o);
        return a;
      },
      setPrototypeOf() {
        xr();
      }
    }
  );
}
function qt(e) {
  try {
    if (e !== null && typeof e == "object" && je in e)
      return e[je];
  } catch {
  }
  return e;
}
function In(e, t) {
  return Object.is(qt(e), qt(t));
}
var Bt, On, Rn, Fn;
function Br() {
  if (Bt === void 0) {
    Bt = window, On = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Rn = Ye(t, "firstChild").get, Fn = Ye(t, "nextSibling").get, jt(e) && (e[ur] = void 0, e[cn] = null, e[cr] = void 0, e.__e = void 0), jt(n) && (n[bt] = void 0);
  }
}
function oe(e = "") {
  return document.createTextNode(e);
}
                       
function Be(e) {
  return (
                                      
    Rn.call(e)
  );
}
                       
function Ke(e) {
  return (
                                      
    Fn.call(e)
  );
}
function zr(e, t) {
  return                 Be(e);
}
function Je(e, t = !1) {
  {
    var n =                 Be(e);
    return n instanceof Comment && n.data === "" ?                 Ke(n) : n;
  }
}
function Wr(e, t = !1) {
  return                 Be(e);
}
function zt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    Ke(r);
  return r;
}
function Kr(e) {
  e.textContent = "";
}
function Dn() {
  return !1;
}
function Xr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Jr(e) {
  var t = b;
  if (t === null)
    return y.f |= fe, e;
  if ((t.f & Fe) === 0 && (t.f & qe) === 0)
    throw e;
  Z(e, t);
}
function Z(e, t) {
  if (!(t !== null && (t.f & L) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & yt) !== 0 && (t.f & (L | Et)) === 0) {
        if ((t.f & Fe) === 0)
          throw e;
        try {
          t.b.error(e);
          return;
        } catch (n) {
          e = n;
        }
      }
      t = t.parent;
    }
    throw e;
  }
}
function Zr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ce(e, t) {
  var n = b;
  n !== null && (n.f & R) !== 0 && (e |= R);
  var r = {
    ctx: J,
    deps: null,
    nodes: null,
    f: e | x | G,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: n,
    b: n && n.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  w?.register_created_effect(r);
  var i = r;
  if ((e & qe) !== 0)
    ke !== null ? ke.push(r) : ue.ensure().schedule(r);
  else if (t !== null) {
    try {
      Oe(r);
    } catch (l) {
      throw D(r), l;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & De) === 0 && (i = i.first, (e & B) !== 0 && (e & xe) !== 0 && i !== null && (i.f |= xe));
  }
  if (i !== null && (i.parent = n, n !== null && Zr(i, n), y !== null && (y.f & C) !== 0 && (e & re) === 0)) {
    var s = (
                            
      y
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Lt() {
  return y !== null && !W;
}
function Mn(e) {
  const t = ce(ut, null);
  return S(t, N), t.teardown = e, t;
}
function Qr(e) {
  return ce(qe | fr, e);
}
function $r(e) {
  ue.ensure();
  const t = ce(re | De, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? pe(t, () => {
      D(t), r(void 0);
    }) : (D(t), r(void 0));
  });
}
function ei(e) {
  return ce(Ne | De, e);
}
function ti(e, t = 0) {
  return ce(ut | t, e);
}
function _t(e, t = [], n = [], r = []) {
  Fr(r, t, n, (i) => {
    ce(ut, () => {
      e(...i.map(Y));
    });
  });
}
function Pt(e, t = 0) {
  var n = ce(B | t, e);
  return n;
}
function U(e) {
  return ce(X | De, e);
}
function Ln(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ye, r = y;
    Wt(!0), H(null);
    try {
      t.call(null);
    } catch (i) {
      Z(i, e.parent);
    } finally {
      Wt(n), H(r);
    }
  }
}
function Vt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && ct(() => {
      i.abort(We);
    });
    var r = n.next;
    (n.f & re) !== 0 ? n.parent = null : D(n, t), n = r;
  }
}
function ni(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & X) === 0 && D(t), t = n;
  }
}
function D(e, t = !0) {
  var n = !1;
  (t || (e.f & ar) !== 0) && e.nodes !== null && e.nodes.end !== null && (ri(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= Et, Vt(e, t && !n), ze(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ln(e), e.f ^= Et, e.f |= L;
  var i = e.parent;
  i !== null && i.first !== null && Pn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ri(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 Ke(e);
    e.remove(), e = n;
  }
}
function Pn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function pe(e, t, n = !0) {
  var r = [];
  e.f |= It, Vn(e, r, !0);
  var i = () => {
    n && D(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var l = () => --s || i();
    for (var f of r)
      f.out(l);
  } else
    i();
}
function Vn(e, t, n) {
  if ((e.f & R) === 0) {
    e.f ^= R;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & re) === 0) {
        var l = (i.f & xe) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & X) !== 0 && (e.f & B) !== 0;
        Vn(i, t, l ? n : !1);
      }
      i = s;
    }
  }
}
function lt(e) {
  e.f &= ~It, Un(e, !0);
}
function Un(e, t) {
  if ((e.f & It) === 0 && (e.f & R) !== 0) {
    e.f ^= R, (e.f & N) === 0 && (S(e, x), ue.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & xe) !== 0 || (n.f & X) !== 0;
      Un(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const l of s)
        (l.is_global || t) && l.in();
  }
}
function Ut(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 Ke(n);
      t.append(n), n = i;
    }
}
let $e = !1, ye = !1;
function Wt(e) {
  ye = e;
}
let y = null, W = !1;
function H(e) {
  y = e;
}
let b = null;
function te(e) {
  b = e;
}
let ee = null;
function Yn(e) {
  y !== null && (ee ??=                 new Set()).add(e);
}
let F = null, M = 0, V = null;
function ii(e) {
  V = e;
}
let jn = 1, _e = 0, ge = _e;
function Kt(e) {
  ge = e;
}
function Gn() {
  return ++jn;
}
function Xe(e) {
  var t = e.f;
  if ((t & x) !== 0)
    return !0;
  if (t & C && (e.f &= ~me), (t & K) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Xe(
                              
        s
      ) && Sn(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & G) !== 0 &&                                                                   
                                                                
    z === null && S(e, N);
  }
  return !1;
}
function Hn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(ee !== null && ee.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & C) !== 0 ? Hn(
                              
        s,
        t,
        !1
      ) : t === s && (n ? S(s, x) : (s.f & N) !== 0 && S(s, K), Mt(
                             
        s
      ));
    }
}
function qn(e) {
  var t = F, n = M, r = V, i = y, s = ee, l = J, f = W, a = ge, o = e.f;
  F =                              
  null, M = 0, V = null, y = (o & (X | re)) === 0 ? e : null, ee = null, Ce(e.ctx), W = !1, ge = ++_e, e.ac !== null && (ct(() => {
    e.ac.abort(We);
  }), e.ac = null);
  try {
    e.f |= rt;
    var u = (
                             
      e.fn
    ), c = u();
    e.f |= Fe;
    var h = Xt(e);
    if (mn() && V !== null && !W && h !== null && (e.f & (C | K | x)) === 0)
      for (var d = 0; d <                        
      V.length; d++)
        Hn(
          V[d],
                               
          e
        );
    if (i !== null && i !== e) {
      if (_e++, i.deps !== null)
        for (let _ = 0; _ < n; _ += 1)
          i.deps[_].rv = _e;
      if (t !== null)
        for (const _ of t)
          _.rv = _e;
      V !== null && (r === null ? r = V : r.push(...                       
      V));
    }
    return (e.f & fe) !== 0 && (e.f ^= fe), c;
  } catch (_) {
    return Xt(e), Jr(_);
  } finally {
    e.f ^= rt, F = t, M = n, V = r, y = i, ee = s, Ce(l), W = f, ge = a;
  }
}
function Xt(e) {
  var t = e.deps, n = w?.is_fork;
  if (F !== null) {
    var r;
    if (n || ze(e, M), t !== null && M > 0)
      for (t.length = M + F.length, r = 0; r < F.length; r++)
        t[M + r] = F[r];
    else
      e.deps = t = F;
    if (Lt() && (e.f & G) !== 0)
      for (r = M; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && M < t.length && (ze(e, M), t.length = M);
  return t;
}
function si(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = tr.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & C) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (F === null || !tt.call(F, t))) {
    var s = (
                            
      t
    );
    (s.f & G) !== 0 && (s.f ^= G, s.f &= ~me), s.v !== k && Ot(s), s.ac !== null && ct(() => {
      s.ac.abort(We), s.ac = null, S(s, x);
    }), Ur(s), ze(s, 0);
  }
}
function ze(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      si(e, n[r]);
}
function Oe(e) {
  var t = e.f;
  if ((t & L) === 0) {
    S(e, N);
    var n = b, r = $e;
    b = e, $e = (t & (X | re)) === 0;
    try {
      (t & (B | on)) !== 0 ? ni(e) : Vt(e), Ln(e);
      var i = qn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = jn;
      var s;
    } finally {
      $e = r, b = n;
    }
  }
}
function Y(e) {
  var t = e.f, n = (t & C) !== 0;
  if (y !== null && !W) {
    var r = b !== null && (b.f & L) !== 0;
    if (!r && (ee === null || !ee.has(e))) {
      var i = y.deps;
      if ((y.f & rt) !== 0)
        e.rv < _e && (e.rv = _e, F === null && i !== null && i[M] === e ? M++ : F === null ? F = [e] : F.push(e));
      else {
        y.deps ??= [], tt.call(y.deps, e) || y.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [y] : tt.call(s, y) || s.push(y);
      }
    }
  }
  if (ye && $.has(e))
    return $.get(e);
  if (n) {
    var l = (
                            
      e
    );
    if (ye) {
      var f = l.v;
      return ((l.f & N) === 0 && l.reactions !== null || zn(l)) && (f = Ft(l)), $.set(l, f), f;
    }
    var a = (l.f & G) === 0 && !W && y !== null && ($e || (y.f & G) !== 0), o = (l.f & Fe) === 0;
    Xe(l) && (a && (l.f |= G), Sn(l)), a && !o && (Tn(l), Bn(l));
  }
  if (z?.has(e))
    return z.get(e);
  if ((e.f & fe) !== 0)
    throw e.v;
  return e.v;
}
function Bn(e) {
  if (e.f |= G, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & C) !== 0 && (t.f & G) === 0 && (Tn(
                              
        t
      ), Bn(
                              
        t
      ));
}
function zn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if ($.has(t) || (t.f & C) !== 0 && zn(
                            
      t
    ))
      return !0;
  return !1;
}
function li(e) {
  var t = W;
  try {
    return W = !0, e();
  } finally {
    W = t;
  }
}
const ai = ["touchstart", "touchmove"];
function fi(e) {
  return ai.includes(e);
}
const Ve =                 Symbol("events"), Wn =                 new Set(), At =                 new Set();
function Jt(e, t, n) {
  (t[Ve] ??= {})[e] = n;
}
function oi(e) {
  for (var t = 0; t < e.length; t++)
    Wn.add(e[t]);
  for (var n of At)
    n(e);
}
let pt = null, gt = !1;
function Zt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  pt = e, gt || (gt = !0, setTimeout(() => {
    gt = !1, pt = null;
  }));
  var l = 0, f = pt === e && e[Ve];
  if (f) {
    var a = i.indexOf(f);
    if (a !== -1 && (t === document || t ===                   
    window)) {
      e[Ve] = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    a <= o && (l = a);
  }
  if (s =                       
  i[l] || e.target, s !== t) {
    ln(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var u = y, c = b;
    H(null), te(null);
    try {
      for (var h, d = []; s !== null && s !== t; ) {
        try {
          var _ = s[Ve]?.[r];
          _ != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && _.call(s, e);
        } catch (E) {
          h ? d.push(E) : h = E;
        }
        if (e.cancelBubble) break;
        l++, s = l < i.length ? (
                                
          i[l]
        ) : null;
      }
      if (h) {
        for (let E of d)
          queueMicrotask(() => {
            throw E;
          });
        throw h;
      }
    } finally {
      e[Ve] = t, delete e.currentTarget, H(u), te(c);
    }
  }
}
const ui = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function ci(e) {
  return (
                         
    ui?.createHTML(e) ?? e
  );
}
function hi(e) {
  var t = Xr("template");
  return t.innerHTML = ci(e.replaceAll("<!>", "<!---->")), t.content;
}
function kt(e, t) {
  var n = (
                         
    b
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function ht(e, t) {
  var n = (t & gr) !== 0, r = (t & mr) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = hi(s ? e : "<!>" + e), n || (i =                            
                    Be(i)));
    var l = (
                                 
      r || On ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var f = (
                                   
                        Be(l)
      ), a = (
                                   
        l.lastChild
      );
      kt(f, a);
    } else
      kt(l, l);
    return l;
  };
}
function Qt() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = oe();
  return e.append(t, n), kt(t, n), e;
}
function Se(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function di(e) {
  let t = 0, n = we(0), r;
  return () => {
    Lt() && (Y(n), ti(() => (t === 0 && (r = li(() => e(() => He(n)))), t += 1, () => {
      ae(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, He(n));
      });
    })));
  };
}
var vi = xe | De;
function _i(e, t, n, r) {
  new pi(e, t, n, r);
}
class pi {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #t;
                                    
  #l = null;
                              
  #e;
                                         
  #f;
                       
  #r;
                              
  #s = null;
                              
  #n = null;
                              
  #a = null;
                                        
  #i = null;
  #_ = 0;
  #o = 0;
  #u = !1;
                            
  #h =                 new Set();
                            
  #p =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #c = null;
  #w = di(() => (this.#c = we(this.#_), () => {
    this.#c = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#f = (s) => {
      var l = (
                             
        b
      );
      l.b = this, l.f |= yt, r(s);
    }, this.parent =                      
    b.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Pt(() => {
      this.#d();
    }, vi);
  }
  #g() {
    try {
      this.#s = U(() => this.#f(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #E(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#y(t);
    ae(i), n && (this.#a = U(() => {
      n(
        this.#t,
        () => t,
        () => r
      );
    }));
  }
     
                                                                              
                                                 
                           
                                                                 
     
  #y(t) {
    var n = !1, r = !1;
    const i = () => {
      if (n) {
        br();
        return;
      }
      n = !0, r && Ir(), this.#a !== null && pe(this.#a, () => {
        this.#a = null;
      }), this.#v(() => {
        this.#d();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (l) {
        Z(l, this.#r && this.#r.parent);
      }
    } };
  }
  #b() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = U(() => t(this.#t)), ae(() => {
      var n = this.#i = document.createDocumentFragment(), r = oe(), i = !1;
      if (n.append(r), this.#s = this.#v(() => {
        try {
          return U(() => this.#f(r));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (l) {
            Z(l, this.#r.parent);
          }
          return null;
        }
      }), this.#s === null) {
        this.#i = null, i && this.#m(
                              
          w
        );
        return;
      }
      this.#o === 0 && (this.#t.before(n), this.#i = null, pe(
                             
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#m(
                            
        w
      ));
    }));
  }
  #d() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#_ = 0, this.#s = U(() => {
        this.#f(this.#t);
      }), this.#o > 0) {
        var t = this.#i = document.createDocumentFragment();
        Ut(this.#s, t);
        const n = (
                                               
          this.#e.pending
        );
        this.#n = U(() => n(this.#t));
      } else
        this.#m(
                              
          w
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#p);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    En(t, this.#h, this.#p);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var n = b, r = y, i = J;
    te(this.#r), H(this.#r), Ce(this.#r.ctx);
    try {
      return ue.ensure(), t();
    } finally {
      te(n), H(r), Ce(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #S(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#S(t, n);
      return;
    }
    this.#o += t, this.#o === 0 && (this.#m(n), this.#n && pe(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#S(t, n), this.#_ += t, !(!this.#c || this.#u) && (this.#u = !0, ae(() => {
      this.#u = !1, this.#c && Ie(this.#c, this.#_);
    }));
  }
  get_effect_pending() {
    return this.#w(), Y(
                                   
      this.#c
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    w?.is_fork ? (this.#s && w.skip_effect(this.#s), this.#n && w.skip_effect(this.#n), this.#a && w.skip_effect(this.#a), w.oncommit(() => {
      this.#T(t);
    })) : this.#T(t);
  }
     
                           
     
  #T(t) {
    this.#s && (D(this.#s), this.#s = null), this.#n && (D(this.#n), this.#n = null), this.#a && (D(this.#a), this.#a = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: l } = this.#y(i);
      l(), n && (this.#a = this.#v(() => {
        try {
          return U(() => {
            var f = (
                                   
              b
            );
            f.b = this, f.f |= yt, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (f) {
          return Z(
            f,
                                 
            this.#r.parent
          ), null;
        }
      }));
    };
    ae(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        Z(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (s) => Z(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function gi(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[bt] ??= e.nodeValue) && (e[bt] = n, e.nodeValue = `${n}`);
}
function mi(e, t) {
  return wi(e, t);
}
const Ze =                 new Map();
function wi(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: l = !0, transformError: f }) {
  Br();
  var a = void 0, o = $r(() => {
    var u = n ?? t.appendChild(oe());
    _i(
                                 
      u,
      {
        pending: () => {
        }
      },
      (d) => {
        _n({});
        var _ = (
                                         
          J
        );
        s && (_.c = s), i && (r.$$events = i), a = e(d, r) || gn(), pn();
      },
      f
    );
    var c =                 new Set(), h = (d) => {
      for (var _ = 0; _ < d.length; _++) {
        var E = d[_];
        if (!c.has(E)) {
          c.add(E);
          var p = fi(E);
          for (const m of [t, document]) {
            var v = Ze.get(m);
            v === void 0 && (v =                 new Map(), Ze.set(m, v));
            var g = v.get(E);
            g === void 0 ? (m.addEventListener(E, Zt, { passive: p }), v.set(E, 1)) : v.set(E, g + 1);
          }
        }
      }
    };
    return h(ot(Wn)), At.add(h), () => {
      for (var d of c)
        for (const p of [t, document]) {
          var _ = (
                                              
            Ze.get(p)
          ), E = (
                                 
            _.get(d)
          );
          --E == 0 ? (p.removeEventListener(d, Zt), _.delete(d), _.size === 0 && Ze.delete(p)) : _.set(d, E);
        }
      At.delete(h), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return Nt.set(a, o), a;
}
let Nt =                 new WeakMap();
function yi(e, t) {
  const n = Nt.get(e);
  return n ? (Nt.delete(e), n(t)) : Promise.resolve();
}
class Ei {
                             
  anchor;
                                
  #t =                 new Map();
     
                                                                   
                                                                      
             
        
                    
         
            
         
          
        
                                                                 
                             
     
  #l =                 new Map();
     
                                                                                          
                                                     
                             
     
  #e =                 new Map();
     
                                                
                     
     
  #f =                 new Set();
     
                                                                     
                                             
     
  #r = !0;
     
                                 
                                
     
  constructor(t, n = !0) {
    this.anchor = t, this.#r = n;
  }
     
                         
     
  #s = (t) => {
    if (this.#t.has(t)) {
      var n = (
                          
        this.#t.get(t)
      ), r = this.#l.get(n);
      if (r)
        lt(r), this.#f.delete(n);
      else {
        var i = this.#e.get(n);
        i && (lt(i.effect), this.#l.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, l] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const f = this.#e.get(l);
        f && (D(f.effect), this.#e.delete(l));
      }
      for (const [s, l] of this.#l) {
        if (s === n || this.#f.has(s)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var o = document.createDocumentFragment();
            Ut(l, o), o.append(oe()), this.#e.set(s, { effect: l, fragment: o });
          } else
            D(l);
          this.#f.delete(s), this.#l.delete(s);
        };
        this.#r || !r ? (this.#f.add(s), pe(l, f, !1)) : f();
      }
    }
  };
     
                         
     
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (D(i.effect), this.#e.delete(r));
  };
     
    
                     
                                                        
     
  ensure(t, n) {
    var r = (
                          
      w
    ), i = Dn();
    if (n && !this.#l.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), l = oe();
        s.append(l), this.#e.set(t, {
          effect: U(() => n(l)),
          fragment: s
        });
      } else
        this.#l.set(
          t,
          U(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [f, a] of this.#l)
        f === t ? r.unskip_effect(a) : r.skip_effect(a);
      for (const [f, a] of this.#e)
        f === t ? r.unskip_effect(a.effect) : r.skip_effect(a.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function bi(e, t, n = !1) {
  var r = new Ei(e), i = n ? xe : 0;
  function s(l, f) {
    r.ensure(l, f);
  }
  Pt(() => {
    var l = !1;
    t((f, a = 0) => {
      l = !0, s(a, f);
    }), l || s(-1, null);
  }, i);
}
function Si(e, t, n) {
  for (var r = [], i = t.length, s, l = t.length, f = 0; f < i; f++) {
    let c = t[f];
    pe(
      c,
      () => {
        if (s) {
          if (s.pending.delete(c), s.done.add(c), s.pending.size === 0) {
            var h = (
                                                
              e.outrogroups
            );
            xt(e, ot(s.done)), h.delete(s), h.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var a = r.length === 0 && n !== null && e.pending.size === 0;
    if (a) {
      var o = (
                              
        n
      ), u = (
                              
        o.parentNode
      );
      Kr(u), u.append(o), e.items.clear();
    }
    xt(e, t, !a);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function xt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const l of e.pending.values())
      for (const f of l)
        r.add(
                                 
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= Q;
      const l = document.createDocumentFragment();
      Ut(s, l);
    } else
      D(t[i], n);
  }
}
var $t;
function mt(e, t, n, r, i, s = null) {
  var l = e, f =                 new Map(), a = (t & hn) !== 0;
  if (a) {
    var o = (
                            
      e
    );
    l = o.appendChild(oe());
  }
  var u = null, c =                 Pr(() => {
    var m = n();
    return (
                        
      ft(m) ? m : m == null ? [] : ot(m)
    );
  }), h, d =                 new Map(), _ = !0;
  function E(m) {
    (g.effect.f & L) === 0 && (g.pending.delete(m), g.fallback = u, Ti(g, h, l, t, r), u !== null && (h.length === 0 ? (u.f & Q) === 0 ? lt(u) : (u.f ^= Q, Ue(u, null, l)) : pe(u, () => {
      u = null;
    })));
  }
  function p(m) {
    g.pending.delete(m);
  }
  var v = Pt(() => {
    h =                   
    Y(c);
    for (var m = h.length, A =                 new Set(), P = (
                          
      w
    ), ie = Dn(), I = 0; I < m; I += 1) {
      var he = h[I], Ee = r(he, I), O = _ ? null : f.get(Ee);
      O ? (O.v && Ie(O.v, he), O.i && Ie(O.i, I), ie && P.unskip_effect(O.e)) : (O = Ai(
        f,
        _ ? l : $t ??= oe(),
        he,
        Ee,
        I,
        i,
        t,
        n
      ), _ || (O.e.f |= Q), f.set(Ee, O)), A.add(Ee);
    }
    if (m === 0 && s && !u && (_ ? u = U(() => s(l)) : (u = U(() => s($t ??= oe())), u.f |= Q)), m > A.size && Ar(), !_)
      if (d.set(P, A), ie) {
        for (const [$n, er] of f)
          A.has($n) || P.skip_effect(er.e);
        P.oncommit(E), P.ondiscard(p);
      } else
        E(P);
    Y(c);
  }), g = { effect: v, items: f, pending: d, outrogroups: null, fallback: u };
  _ = !1;
}
function Me(e) {
  for (; e !== null && (e.f & X) === 0; )
    e = e.next;
  return e;
}
function Ti(e, t, n, r, i) {
  var s = (r & _r) !== 0, l = t.length, f = e.items, a = Me(e.effect.first), o, u = null, c, h = [], d = [], _, E, p, v;
  if (s)
    for (v = 0; v < l; v += 1)
      _ = t[v], E = i(_, v), p =                        
      f.get(E).e, (p.f & Q) === 0 && (p.nodes?.a?.measure(), (c ??=                 new Set()).add(p));
  for (v = 0; v < l; v += 1) {
    if (_ = t[v], E = i(_, v), p =                        
    f.get(E).e, e.outrogroups !== null)
      for (const O of e.outrogroups)
        O.pending.delete(p), O.done.delete(p);
    if ((p.f & R) !== 0 && (lt(p), s && (p.nodes?.a?.unfix(), (c ??=                 new Set()).delete(p))), (p.f & Q) !== 0)
      if (p.f ^= Q, p === a)
        Ue(p, null, n);
      else {
        var g = u ? u.next : a;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), le(e, u, p), le(e, p, g), Ue(p, g, n), u = p, h = [], d = [], a = Me(u.next);
        continue;
      }
    if (p !== a) {
      if (o !== void 0 && o.has(p)) {
        if (h.length < d.length) {
          var m = d[0], A;
          u = m.prev;
          var P = h[0], ie = h[h.length - 1];
          for (A = 0; A < h.length; A += 1)
            Ue(h[A], m, n);
          for (A = 0; A < d.length; A += 1)
            o.delete(d[A]);
          le(e, P.prev, ie.next), le(e, u, P), le(e, ie, m), a = m, u = ie, v -= 1, h = [], d = [];
        } else
          o.delete(p), Ue(p, a, n), le(e, p.prev, p.next), le(e, p, u === null ? e.effect.first : u.next), le(e, u, p), u = p;
        continue;
      }
      for (h = [], d = []; a !== null && a !== p; )
        (o ??=                 new Set()).add(a), d.push(a), a = Me(a.next);
      if (a === null)
        continue;
    }
    (p.f & Q) === 0 && h.push(p), u = p, a = Me(p.next);
  }
  if (e.outrogroups !== null) {
    for (const O of e.outrogroups)
      O.pending.size === 0 && (xt(e, ot(O.done)), e.outrogroups?.delete(O));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (a !== null || o !== void 0) {
    var I = [];
    if (o !== void 0)
      for (p of o)
        (p.f & R) === 0 && I.push(p);
    for (; a !== null; )
      (a.f & R) === 0 && a !== e.fallback && I.push(a), a = Me(a.next);
    var he = I.length;
    if (he > 0) {
      var Ee = (r & hn) !== 0 && l === 0 ? n : null;
      if (s) {
        for (v = 0; v < he; v += 1)
          I[v].nodes?.a?.measure();
        for (v = 0; v < he; v += 1)
          I[v].nodes?.a?.fix();
      }
      Si(e, I, Ee);
    }
  }
  s && ae(() => {
    if (c !== void 0)
      for (p of c)
        p.nodes?.a?.apply();
  });
}
function Ai(e, t, n, r, i, s, l, f) {
  var a = (l & dr) !== 0 ? (l & pr) === 0 ?                 Hr(n, !1, !1) : we(n) : null, o = (l & vr) !== 0 ? we(i) : null;
  return {
    v: a,
    i: o,
    e: U(() => (s(t, a ?? n, o ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function Ue(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & Q) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
                                   
                        Ke(r)
      );
      if (s.before(r), r === i)
        return;
      r = l;
    }
}
function le(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function ki(e, t) {
  t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function Ni(e, t) {
  var n = e.__defaultValue, r = e.multiple, i = r ? n ?? [] : null;
  if (!(r && !ft(i))) {
    e.selectedIndex;
    for (var s of e.options) {
      var l = Ct(s);
      ki(
        s,
        r ? (
                              
          i.includes(l)
        ) : In(l, n)
      );
    }
  }
}
function Kn(e, t, n = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ft(t))
      return Er();
    for (var r of e.options)
      r.selected = t.includes(Ct(r));
    return;
  }
  for (r of e.options) {
    var i = Ct(r);
    if (In(i, t)) {
      r.selected = !0;
      return;
    }
  }
  (!n || t !== void 0) && (e.selectedIndex = -1);
}
function xi(e) {
  var t = new MutationObserver((n) => {
    n.every(Ci) || ("__defaultValue" in e && Ni(e), "__value" in e && Kn(e, e.__value));
  });
  t.observe(e, {
                                       
    childList: !0,
    subtree: !0,
                            
                                                       
                                                     
                                                              
    attributes: !0,
    attributeFilter: ["value"]
  }), Mn(() => {
    t.disconnect();
  });
}
function Ct(e) {
  return "__value" in e ? e.__value : e.value;
}
function Ci(e) {
  if (
                          
    e.target.closest("selectedcontent") !== null
  )
    return !0;
  if (e.type === "childList") {
    var t = [...e.addedNodes, ...e.removedNodes];
    return t.length > 0 && t.every((n) => n.nodeName === "SELECTEDCONTENT");
  }
  return !1;
}
const Ii =                 Symbol("is custom element"), Oi =                 Symbol("is html"), Ri = hr ? "progress" : "PROGRESS";
function Fi(e, t) {
  var n = Xn(e);
  n.value === (n.value =                                                           
  t ?? void 0) ||                    
                                                                  
  e.value === t && (t !== 0 || e.nodeName !== Ri) || (e.value = t ?? "");
}
function Te(e, t, n, r) {
  var i = Xn(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[or] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Di(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Xn(e) {
  return (
                                                    
                      
    e[cn] ??= {
      [Ii]: e.nodeName.includes("-"),
      [Oi]: e.namespaceURI === wr
    }
  );
}
var en =                 new Map();
function Di(e) {
  var t = e.getAttribute("is") || e.nodeName, n = en.get(t);
  if (n) return n;
  en.set(t, n =                 new Set());
  for (var r, i = e, s = Element.prototype; s !== i; ) {
    r = nr(i);
    for (var l in r)
      r[l].set &&                                                                                     
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.add(l);
    i = an(i);
  }
  return n;
}
const Mi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(Mi);
const j = {
  achievementSearch: { type: "search", label: "実績を検索", placeholder: "日本語名・英語名・GUIDで検索", event: "input", initial: "" },
  achievementFilter: { type: "select", label: "達成状況", event: "change", initial: "all", options: [["all", "すべて"], ["complete", "達成済み"], ["incomplete", "未達成"], ["missing", "定義のみ・未保存"], ["unknown-source", "保存済み・定義UNKNOWN"]] },
  achievementImageFilter: { type: "select", label: "実績画像で絞り込み", event: "change", initial: "all", options: [["all", "全画像状態"], ["exact", "直接画像あり"], ["source-null", "直接画像 SOURCE_NULL"], ["unknown", "画像未照合"]] },
  achievementSort: { type: "select", label: "実績の並び順", event: "change", initial: "source", options: [["source", "元の順番"], ["name", "名称順"], ["progress-desc", "進捗値の大きい順"], ["progress-asc", "進捗値の小さい順"], ["completed-first", "達成済みを先頭"]] },
  collectionSearch: { type: "search", label: "コレクションカテゴリを検索", placeholder: "コレクションカテゴリを検索", event: "input", initial: "" },
  collectionStatusFilter: { type: "select", label: "コレクション収集履歴で絞り込み", event: "change", initial: "all", options: [["all", "全カテゴリ"], ["has-record", "収集履歴あり"], ["no-record", "収集履歴なし"], ["unknown", "未照合"]] },
  collectionSort: { type: "select", label: "コレクションの並び順", event: "change", initial: "source", options: [["source", "定義順"], ["name", "名称順"], ["record-desc", "記録ID数の多い順"]] }
}, at = Object.keys(j), Li = ["achievementFilter", "achievementImageFilter", "achievementSort"], Pi = ["collectionStatusFilter", "collectionSort"];
function Jn(e, t) {
  if (typeof t != "string") return !1;
  const n = j[e];
  return n.type === "search" || n.options.some(([r]) => r === t);
}
function et(e) {
  if (!e || typeof e.imageVisible != "boolean" || at.some((t) => !Jn(t, e[t]))) throw new Error("LEGACY_FILTER_INCOHERENT");
  return e;
}
function Vi(e) {
  return { read: () => et(e.read()), change(t, n) {
    if (!Object.hasOwn(j, t) || !Jn(t, n)) throw new Error("LEGACY_FILTER_INVALID_INTENT");
    const r = et(e.read());
    if (t === "achievementImageFilter" && !r.imageVisible) throw new Error("LEGACY_FILTER_HIDDEN");
    try {
      if (e.writeAndDispatch(t, n, j[t].event), et(e.read())[t] !== n) throw new Error("LEGACY_FILTER_POSTCONDITION");
    } finally {
      e.invalidate?.();
    }
  } };
}
var Ui =                 ht('<span aria-hidden="true">⌕</span><input type="search" autocomplete="off"/>', 1), Yi =                 ht("<option> </option>"), ji =                 ht("<select></select>"), Gi =                 ht('<label class="search-wrap"><!></label><!>', 1);
function Hi(e, t) {
  _n(t, !0);
  const n = (o, u = wt) => {
    var c = Ui(), h = zt(Je(c));
    _t(() => {
      Te(h, "id", u()), Te(h, "placeholder", j[u()].placeholder), Te(h, "aria-label", j[u()].label), Fi(h, t.initial[u()]);
    }), Jt("input", h, (d) => t.intent(u(), d)), Se(o, c);
  }, r = (o, u = wt) => {
    var c = ji();
    mt(c, 21, () => j[u()].options, ([d, _]) => d, (d, _) => {
      var E =                 Lr(() => lr(Y(_), 2));
      let p = () => Y(E)[0], v = () => Y(E)[1];
      var g = Yi(), m = Wr(g, !0), A = {};
      _t(() => {
        gi(m, v()), A !== (A = p()) && (g.value = (g.__value = A) ?? "");
      }), Se(d, g);
    });
    var h;
    xi(c), _t(() => {
      Te(c, "id", u()), Te(c, "aria-label", j[u()].label), Te(c, "hidden", u() === "achievementImageFilter" && !t.initial.imageVisible), h !== (h = t.initial[u()]) && (c.value = (c.__value = h) ?? "", Kn(c, h));
    }), Jt("change", c, (d) => t.intent(u(), d)), Se(o, c);
  };
  var i = Qt(), s = Je(i);
  {
    var l = (o) => {
      var u = Gi(), c = Je(u), h = zr(c);
      n(h, () => "achievementSearch");
      var d = zt(c);
      mt(d, 16, () => Li, (_) => _, (_, E) => {
        r(_, () => E);
      }), Se(o, u);
    }, f = (o) => {
      n(o, () => "collectionSearch");
    }, a = (o) => {
      var u = Qt(), c = Je(u);
      mt(c, 16, () => Pi, (h) => h, (h, d) => {
        r(h, () => d);
      }), Se(o, u);
    };
    bi(s, (o) => {
      t.group === 0 ? o(l) : t.group === 1 ? o(f, 1) : o(a, -1);
    });
  }
  Se(e, i), pn();
}
oi(["input", "change"]);
const Yt = [["achievementSearch", "achievementFilter", "achievementImageFilter", "achievementSort"], ["collectionSearch"], ["collectionStatusFilter", "collectionSort"]], tn = "data-hkia-svelte-filters", nn =                 new WeakMap(), T = (e) => {
  if (!e) throw Error("PRODUCT_FILTER_DOM_CONTRACT");
};
function q(e, t) {
  const n = e.querySelectorAll(`[id="${t}"]`);
  return T(n.length === 1), n[0];
}
function Re(e, t) {
  const n = e.querySelectorAll(`[id="${t}"]`);
  return T(n.length === 1), n[0];
}
function qi(e, t) {
  const n = j[t];
  if (T(e.id === t && e.getAttribute("aria-label") === n.label && !e.disabled), n.type === "search")
    T(e.tagName === "INPUT" && e.type === "search" && e.getAttribute("placeholder") === n.placeholder && e.getAttribute("autocomplete") === "off" && !e.hidden);
  else {
    T(e.tagName === "SELECT" && (t === "achievementImageFilter" || !e.hidden));
    const r = Array.from(e.options);
    T(r.length === n.options.length && r.every((i, s) => i.value === n.options[s][0] && i.textContent === n.options[s][1] && !i.disabled));
  }
}
function rn(e, t) {
  T(e.tagName === "LABEL" && e.className === (t === "collectionSearch" ? "search-wrap collections-search" : "search-wrap") && e.children.length === 2 && e.children[0].tagName === "SPAN" && e.children[0].getAttribute("aria-hidden") === "true" && e.children[0].textContent === "⌕" && e.children[1] === Re(e, t));
}
function Zn(e, t) {
  const n = Yt[t];
  t === 1 ? rn(e, "collectionSearch") : (T(e.tagName === "DIV" && e.className === "toolbar" && e.children.length === n.length), n.forEach((r, i) => {
    r === "achievementSearch" ? rn(e.children[i], r) : T(e.children[i] === Re(e, r));
  }));
  for (const r of n) qi(Re(e, r), r);
}
function Qn(e) {
  const t = Object.fromEntries(Yt.flatMap((n, r) => n.map((i) => [i, Re(e[r], i).value])));
  return et({ ...t, imageVisible: !Re(e[0], "achievementImageFilter").hidden });
}
const Ae = (e) => JSON.stringify([...at.map((t) => e[t]), e.imageVisible]);
function sn(e) {
  const t = q(e, "achPanel"), n = q(e, "colPanel"), r = q(e, "achievementSearch"), i = q(e, "collectionSearch"), s = q(e, "collectionSort"), l = [r.parentElement?.parentElement, i.parentElement, s.parentElement];
  T(l.every(Boolean) && l[0].parentElement === t && l[1].parentElement === n && l[2].parentElement === n && new Set(l).size === 3), l.forEach((f, a) => Zn(f, a));
  for (const [f, a] of Yt.entries()) for (const o of a) T(q(e, o) === Re(l[f], o));
  return { hosts: l, panels: [t, n], state: Qn(l) };
}
function Bi(e, t, n) {
  let r;
  try {
    r = sn(e);
  } catch {
    return "LEGACY_RETAINED";
  }
  const i = nn.get(e);
  if (i) return i.every((v, g) => v === r.hosts[g]) ? "ALREADY_MOUNTED" : "LEGACY_RETAINED";
  if (r.hosts.some((v) => v.hasAttribute(tn))) return "LEGACY_RETAINED";
  const s = r.hosts.map((v) => {
    const g = v.cloneNode(!1);
    return g.setAttribute(tn, "1"), g;
  }), l = at.find((v) => e.activeElement === q(e, v)), f = l ? q(e, l) : null, a = f?.tagName === "INPUT" ? [f.selectionStart, f.selectionEnd, f.selectionDirection] : null;
  let o = !1, u = !1;
  const c = [], h = [], d = () => {
    const v = sn(e);
    return T(v.hosts.every((g, m) => g === (o ? s : r.hosts)[m]) && v.panels.every((g, m) => g === r.panels[m])), v;
  }, _ = Vi({ read: () => d().state, writeAndDispatch(v, g, m) {
    T(o && m === j[v].event);
    const A = d().state, P = q(e, v);
    P.value = g, T(P.value === g), v.startsWith("achievement") ? t.achievement() : t.collection();
    const ie = d().state;
    T(at.every((I) => I === v || ie[I] === A[I]));
  } }), E = (v, g) => {
    T(o && !u && Object.hasOwn(j, v) && g.type === j[v].event);
    const m = q(e, v);
    T(g.currentTarget === m), u = !0;
    try {
      _.change(v, m.value);
    } finally {
      u = !1;
    }
  }, p = () => {
    if (!l) return;
    const v = q(e, l);
    v.focus(), a && a[0] !== null && a[1] !== null && v.setSelectionRange(a[0], a[1], a[2] ?? void 0);
  };
  try {
    return s.forEach((v, g) => {
      const m = n(v, g, r.state, E);
      T(typeof m == "function"), h.push(m), Zn(v, g);
    }), T(Ae(Qn(s)) === Ae(r.state)), T(Ae(d().state) === Ae(r.state)), s.forEach((v, g) => {
      r.hosts[g].replaceWith(v), c.push(g);
    }), o = !0, T(Ae(d().state) === Ae(r.state)), p(), nn.set(e, s), "MOUNTED";
  } catch {
    o = !1;
    for (const v of c.reverse()) s[v].replaceWith(r.hosts[v]);
    try {
      p();
    } catch {
    }
    for (const v of h.reverse()) try {
      v();
    } catch {
    }
    return "LEGACY_RETAINED";
  }
}
function Wi(e, t) {
  return Bi(e, t, (n, r, i, s) => {
    const l = mi(Hi, { target: n, props: { group: r, initial: i, intent: s } }), f = () => {
      yi(l).catch(() => {
      });
    };
    try {
      jr();
    } catch (a) {
      throw f(), a;
    }
    return f;
  });
}
export {
  Wi as mountProductFilters
};
