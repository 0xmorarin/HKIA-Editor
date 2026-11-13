var rn = Array.isArray, qn = Array.prototype.indexOf, nt = Array.prototype.includes, ft = Array.from, sn = Object.defineProperty, ze = Object.getOwnPropertyDescriptor, Wn = Object.getOwnPropertyDescriptors, Kn = Object.prototype, Xn = Array.prototype, ln = Object.getPrototypeOf, Ut = Object.isExtensible;
const Jn = () => {
};
function Zn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function an() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const I = 2, Ue = 4, ot = 8, fn = 1 << 24, B = 16, W = 32, ie = 64, mt = 128, xt = 256, Y = 512, O = 1024, x = 2048, q = 4096, R = 8192, F = 16384, Ie = 32768, yt = 1 << 25, Ae = 65536, rt = 1 << 17, Qn = 1 << 18, Me = 1 << 19, $n = 1 << 20, re = 1 << 25, me = 65536, it = 1 << 21, Ne = 1 << 22, oe = 1 << 23, ct =                 Symbol("$state"), on =                 Symbol("component"), er =                 Symbol(""), un =                 Symbol("attributes"), wt =                 Symbol("class"), tr =                 Symbol("style"), bt =                 Symbol("text"), He = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), nr = 1, rr = 2, ir = 16, sr = 1, lr = 2, C =                 Symbol("uninitialized"), ar = "http://www.w3.org/1999/xhtml";
function fr() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function or() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function cn(e) {
  return e === this.v;
}
function ur(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function hn(e) {
  return !ur(e, this.v);
}
function cr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function hr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function dr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function vr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function pr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function _r() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function gr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let K = null;
function Ce(e) {
  K = e;
}
function It(e, t = !1, n) {
  K = {
    p: K,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
                           
      w
    ),
    l: null
  };
}
function Mt(e) {
  var t = (
                                   
    K
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Lr(r);
  }
  return t.i = !0, K = t.p, dn(e);
}
function dn(e = {}) {
  return sn(e, on, { value: !0 }), e;
}
function vn() {
  return !0;
}
let ve = [];
function pn() {
  var e = ve;
  ve = [], Zn(e);
}
function fe(e) {
  if (ve.length === 0 && !je) {
    var t = ve;
    queueMicrotask(() => {
      t === ve && pn();
    });
  }
  ve.push(e);
}
function mr() {
  for (; ve.length > 0; )
    pn();
}
const yr = -7169;
function N(e, t) {
  e.f = e.f & yr | t;
}
function Rt(e) {
  (e.f & Y) !== 0 || e.deps === null ? N(e, O) : N(e, q);
}
function _n(e) {
  if (e !== null)
    for (const t of e)
      (t.f & I) === 0 || (t.f & me) === 0 || (t.f ^= me, _n(
                              
        t.deps
      ));
}
function gn(e, t, n) {
  (e.f & x) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), _n(e.deps), N(e, O);
}
function qe(e) {
  var t = y, n = w;
  G(null), Q(null);
  try {
    return e();
  } finally {
    G(t), Q(n);
  }
}
function wr(e, t, n, r) {
  const i = Pt;
  var s = e.filter((v) => !v.settled), l = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(l);
    return;
  }
  var a = (
                         
    w
  ), f = br(), o = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function h(v) {
    if ((a.f & F) === 0) {
      f();
      try {
        r([...l, ...v]);
      } catch (d) {
        X(d, a);
      }
      st();
    }
  }
  var c = mn();
  if (n.length === 0) {
    o.then(() => h([])).finally(c);
    return;
  }
  function u() {
    Promise.all(n.map((v) =>                 Er(v))).then(h).catch((v) => X(v, a)).finally(c);
  }
  o ? o.then(() => {
    f(), u(), st();
  }) : u();
}
function br() {
  var e = (
                         
    w
  ), t = y, n = K, r = (
                        
    g
  );
  return function(s = !0) {
    Q(e), G(t), Ce(n), s && (e.f & F) === 0 && (r?.activate(), r?.apply());
  };
}
function st(e = !0) {
  Q(null), G(null), Ce(null), e && g?.deactivate();
}
function mn() {
  var e = (
                         
    w
  ), t = e.b, n = (
                        
    g
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function Pt(e) {
  var t = I | x;
  return w !== null && (w.f |= Me), {
    ctx: K,
    deps: null,
    effects: null,
    equals: cn,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      C
    ),
    wv: 0,
    parent: w,
    ac: null
  };
}
const Pe =                 Symbol("obsolete");
                       
function Er(e, t, n) {
  let r = (
                                
    w
  );
  r === null && cr();
  var i = (
                             
                          
    void 0
  ), s = ye(
                    
    C
  ), l = !y, a =                 new Set();
  return zr(() => {
    var f = (
                           
      w
    ), o = an();
    i = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, (v) => {
        v !== He && o.reject(v);
      }).finally(st);
    } catch (v) {
      o.reject(v), st();
    }
    var h = (
                          
      g
    );
    if (l) {
      if ((f.f & Ie) !== 0)
        var c = mn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        h.async_deriveds.get(f)?.reject(Pe);
      else
        for (const v of a.values())
          v.reject(Pe);
      a.add(o), h.async_deriveds.set(f, o);
    }
    const u = (v, d = void 0) => {
      c?.(), a.delete(o), d !== Pe && (h.activate(), d ? (s.f |= oe, Oe(s, d)) : ((s.f & oe) !== 0 && (s.f ^= oe), Oe(s, v)), h.deactivate());
    };
    o.promise.then(u, (v) => u(null, v || "unknown"));
  }), Mn(() => {
    for (const f of a)
      f.reject(Pe);
  }), new Promise((f) => {
    function o(h) {
      function c() {
        h === i ? f(s) : o(i);
      }
      h.then(c, c);
    }
    o(i);
  });
}
                       
function Bt(e) {
  const t =                 Pt(e);
  return Fn(t), t;
}
                       
function kr(e) {
  const t =                 Pt(e);
  return t.equals = hn, t;
}
function Tr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      D(
                             
        t[n]
      );
  }
}
function Dt(e) {
  var t, n = w, r = e.parent;
  if (!be && r !== null && e.v !== C &&                                                                                                      
  (r.f & (F | R)) !== 0)
    return fr(), e.v;
  Q(r);
  try {
    e.f &= ~me, Tr(e), t = Gn(e);
  } finally {
    Q(n);
  }
  return t;
}
function yn(e) {
  var t = Dt(e);
  if (!e.equals(t) && (e.wv = jn(), (!g?.is_fork || e.deps === null) && (g !== null ? (g.capture(e, t, !0), Et?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    N(e, O);
    return;
  }
  be || (V !== null ? (zt() || g?.is_fork) && V.set(e, t) : Rt(e));
}
function Sr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && qe(() => {
        t.ac.abort(He), t.ac = null;
      }), t.fn !== null && (t.teardown = Jn), Ve(t, 0), Yt(t));
}
function wn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && xe(t);
}
let ht = null, ke = null, g = null, Et = null, V = null, kt = null, je = !1, dt = !1, Se = null, Ze = null;
var Vt = 0;
let Nr = 1;
class ue {
  id = Nr++;
                                              
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
     
                                                 
                     
     
  #p = [];
     
                                                                               
                        
     
  #o =                 new Set();
     
                                          
                        
     
  #u =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #h =                 new Map();
     
                                                                                                    
                        
     
  #_ =                 new Set();
  is_fork = !1;
  #c = !1;
  constructor() {
    ke === null ? ht = ke = this : (ke.#e = this, this.#l = ke), ke = this;
  }
  #y() {
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
    this.#h.has(t) || this.#h.set(t, { d: [], m: [] }), this.#_.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#h.get(t);
    if (r) {
      this.#h.delete(t);
      for (var i of r.d)
        N(i, x), n(i);
      for (i of r.m)
        N(i, q), n(i);
    }
    this.#_.add(t);
  }
  #g() {
    this.#t = !0, Vt++ > 1e3 && (this.#v(), Cr());
    for (const f of this.#o)
      this.#u.delete(f), N(f, x), this.schedule(f);
    for (const f of this.#u)
      N(f, q), this.schedule(f);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = Se = [], r = [], i = Ze = [];
    for (const f of t)
      try {
        this.#b(f, n, r);
      } catch (o) {
        throw kn(f), this.#y() || this.discard(), o;
      }
    if (g = null, i.length > 0) {
      var s = ue.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (Se = null, Ze = null, this.#y()) {
      this.#d(r), this.#d(n);
      for (const [f, o] of this.#h)
        En(f, o);
      i.length > 0 &&                       
      g.#g();
      return;
    }
    const l = this.#w();
    if (l) {
      this.#d(r), this.#d(n), l.#E(this);
      return;
    }
    this.#o.clear(), this.#u.clear();
    for (const f of this.#f) f(this);
    this.#f.clear(), Et = this, Ht(r), Ht(n), Et = null, this.#a?.resolve();
    var a = (
                                 
                            
      g
    );
    if (this.#s === 0 && (this.#i.length === 0 || a !== null) && this.#v(), this.#i.length > 0)
      if (a !== null) {
        const f = a;
        f.#i.push(...this.#i.filter((o) => !f.#i.includes(o)));
      } else
        a = this;
    a !== null && (J.clear(), a.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #b(t, n, r) {
    t.f ^= O;
    for (var i = t.first; i !== null; ) {
      var s = i.f, l = (s & (W | ie)) !== 0, a = l && (s & O) !== 0, f = a || (s & R) !== 0 || this.#h.has(i);
      if (!f && i.fn !== null) {
        l ? i.f ^= O : (s & Ue) !== 0 ? n.push(i) : Ke(i) && ((s & B) !== 0 && this.#u.add(i), xe(i));
        var o = i.first;
        if (o !== null) {
          i = o;
          continue;
        }
      }
      for (; i !== null; ) {
        var h = i.next;
        if (h !== null) {
          i = h;
          break;
        }
        i = i.parent;
      }
    }
  }
  #w() {
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
     
                         
     
  #E(t) {
    for (const [r, i] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of t.async_deriveds) {
      const s = this.async_deriveds.get(r);
      s && i.promise.then(s.resolve).catch(s.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#o, t.#u);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & I) !== 0 && (r.f & (x | q)) === 0))
        for (const a of i) {
          var s = a.f;
          if ((s & I) !== 0)
            n(
                                    
              a
            );
          else {
            var l = (
                                   
              a
            );
            s & (Ne | B) && !this.async_deriveds.has(l) && (this.#u.delete(l), N(l, x), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), g = this, this.#g();
  }
     
                              
     
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      gn(t[n], this.#o, this.#u);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== C && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & oe) === 0 && (this.current.set(t, [n, r]), V?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, V = null;
  }
  flush() {
    try {
      dt = !0, g = this, this.#g();
    } finally {
      Vt = 0, kt = null, Se = null, Ze = null, dt = !1, g = null, V = null, J.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Pe);
    this.#v(), this.#a?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#p.push(t);
  }
  #m() {
    for (let c = ht; c !== null; c = c.#e) {
      var t = c.id < this.id, n = [];
      for (const [u, [v, d]] of this.current) {
        if (c.current.has(u)) {
          var r = (
                                         
            c.current.get(u)[0]
          );
          if (t && v !== r)
            c.current.set(u, [v, d]);
          else
            continue;
        }
        n.push(u);
      }
      if (t)
        for (const [u, v] of this.async_deriveds) {
          const d = c.async_deriveds.get(u);
          d && v.promise.then(d.resolve).catch(d.reject);
        }
      var i = [...c.current.keys()].filter(
        (u) => !                             
        c.current.get(u)[1]
      );
      if (!(!c.#t || i.length === 0)) {
        var s = i.filter((u) => !this.current.has(u));
        if (s.length === 0)
          t && c.discard();
        else if (n.length > 0) {
          if (t)
            for (const u of this.#_)
              c.unskip_effect(u, (v) => {
                (v.f & (B | Ne)) !== 0 ? c.schedule(v) : c.#d([v]);
              });
          c.activate();
          var l =                 new Set(), a =                 new Map();
          for (var f of n)
            bn(f, s, l, a);
          a =                 new Map();
          var o = [...c.current].filter(([u, v]) => {
            const d = this.current.get(u);
            return d ? d[0] !== v[0] || d[1] !== v[1] : !0;
          }).map(([u]) => u);
          if (o.length > 0)
            for (const u of this.#p)
              (u.f & (F | R | rt)) === 0 && Lt(u, o, a) && ((u.f & (Ne | B)) !== 0 ? (N(u, x), c.schedule(u)) : c.#o.add(u));
          if (c.#i.length > 0 && !c.#c) {
            c.apply();
            for (var h of c.#i)
              c.#b(h, [], []);
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
    this.#c || (this.#c = !0, fe(() => {
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
    return (this.#a ??= an()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new ue();
      !dt && !je && fe(() => {
        t.#t || t.flush();
      });
    }
    return g;
  }
  apply() {
    {
      V = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (kt = t, t.b?.is_pending && (t.f & (Ue | ot | fn)) !== 0 && (t.f & Ie) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Se !== null && n === w && (y === null || (y.f & I) === 0))
        return;
      if ((r & (ie | W)) !== 0) {
        if ((r & O) === 0)
          return;
        n.f ^= O;
      }
    }
    this.#i.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#l, n = this.#e;
      t === null ? ht = n : t.#e = n, n === null ? ke = t : n.#l = t, this.linked = !1;
    }
  }
}
function Ar(e) {
  var t = je;
  je = !0;
  try {
    for (var n; ; ) {
      if (mr(), g === null)
        return (
                          
          n
        );
      g.flush();
    }
  } finally {
    je = t;
  }
}
function Cr() {
  try {
    dr();
  } catch (e) {
    X(e, kt);
  }
}
let ee = null;
function Ht(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (F | R)) === 0 && Ke(r) && (ee =                 new Set(), xe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pn(r), ee?.size > 0)) {
        J.clear();
        for (const i of ee) {
          if ((i.f & (F | R)) !== 0) continue;
          const s = [i];
          let l = i.parent;
          for (; l !== null; )
            ee.has(l) && (ee.delete(l), s.push(l)), l = l.parent;
          for (let a = s.length - 1; a >= 0; a--) {
            const f = s[a];
            (f.f & (F | R)) === 0 && xe(f);
          }
        }
        ee.clear();
      }
    }
    ee = null;
  }
}
function bn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & I) !== 0 ? bn(
                              
        i,
        t,
        n,
        r
      ) : (s & (Ne | B)) !== 0 && (s & x) === 0 && Lt(i, t, r) && (N(i, x), Ft(
                             
        i
      ));
    }
}
function Lt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (nt.call(t, i))
        return !0;
      if ((i.f & I) !== 0 && Lt(
                              
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
function Ft(e) {
  g.schedule(e);
}
function En(e, t) {
  if (!((e.f & W) !== 0 && (e.f & O) !== 0)) {
    (e.f & x) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), N(e, O);
    for (var n = e.first; n !== null; )
      En(n, t), n = n.next;
  }
}
function kn(e) {
  N(e, O);
  for (var t = e.first; t !== null; )
    kn(t), t = t.next;
}
let lt =                 new Set();
const J =                 new Map();
let Tn = !1;
function ye(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: cn,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function $(e, t) {
  const n = ye(e);
  return Fn(n), n;
}
                       
function Or(e, t = !1, n = !0) {
  const r = ye(e);
  return t || (r.equals = hn), r;
}
function te(e, t, n = !1) {
  y !== null &&                                                                                         
                                                                
  (!H || (y.f & rt) !== 0) && vn() && (y.f & (I | B | Ne | rt)) !== 0 && (Z === null || !Z.has(e)) && _r();
  let r = n ? De(t) : t;
  return Oe(e, r, Ze);
}
function Oe(e, t, n = null) {
  if (!e.equals(t)) {
    be ? J.set(e, t) : J.has(e) || J.set(e, e.v);
    var r = ue.ensure();
    if (r.capture(e, t), (e.f & I) !== 0) {
      const i = (
                              
        e
      );
      (e.f & x) !== 0 && Dt(i), V === null && Rt(i);
    }
    e.wv = jn(), Sn(e, x, n), w !== null && (w.f & O) !== 0 && (w.f & (W | ie)) === 0 && (z === null ? Ur([e]) : z.push(e)), !r.is_fork && lt.size > 0 && !Tn && xr();
  }
  return t;
}
function xr() {
  Tn = !1;
  for (const e of lt) {
    (e.f & O) !== 0 && N(e, q);
    let t;
    try {
      t = Ke(e);
    } catch {
      t = !0;
    }
    t && xe(e);
  }
  lt.clear();
}
function Ye(e) {
  te(e, e.v + 1);
}
function Sn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var l = r[s], a = l.f, f = (a & x) === 0;
      if (f && N(l, t), (a & rt) !== 0)
        lt.add(
                               
          l
        );
      else if ((a & I) !== 0) {
        var o = (
                                
          l
        );
        V?.delete(o), (a & me) === 0 && (a & Y && (w === null || (w.f & it) === 0) && (l.f |= me), Sn(o, q, n));
      } else if (f) {
        var h = (
                               
          l
        );
        (a & B) !== 0 && ee !== null && ee.add(h), n !== null ? n.push(h) : Ft(h);
      }
    }
}
function De(e) {
  if (typeof e != "object" || e === null || ct in e || on in e)
    return e;
  const t = ln(e);
  if (t !== Kn && t !== Xn)
    return e;
  var n =                 new Map(), r = rn(e), i =                 $(0), s = ge, l = (a) => {
    if (ge === s)
      return a();
    var f = y, o = ge;
    G(null), Xt(s);
    var h = a();
    return G(f), Xt(o), h;
  };
  return r && n.set("length",                 $(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(a, f, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && vr();
        var h = n.get(f);
        return h === void 0 ? l(() => {
          var c =                 $(o.value);
          return n.set(f, c), c;
        }) : te(h, o.value, !0), !0;
      },
      deleteProperty(a, f) {
        var o = n.get(f);
        if (o === void 0) {
          if (f in a) {
            const h = l(() =>                 $(C));
            n.set(f, h), Ye(i);
          }
        } else
          te(o, C), Ye(i);
        return !0;
      },
      get(a, f, o) {
        if (f === ct)
          return e;
        var h = n.get(f), c = f in a;
        if (h === void 0 && (!c || ze(a, f)?.writable) && (h = l(() => {
          var v = De(c ? a[f] : C), d =                 $(v);
          return d;
        }), n.set(f, h)), h !== void 0) {
          var u = m(h);
          return u === C ? void 0 : u;
        }
        return Reflect.get(a, f, o);
      },
      getOwnPropertyDescriptor(a, f) {
        var o = Reflect.getOwnPropertyDescriptor(a, f);
        if (o && "value" in o) {
          var h = n.get(f);
          h && (o.value = m(h));
        } else if (o === void 0) {
          var c = n.get(f), u = c?.v;
          if (c !== void 0 && u !== C)
            return {
              enumerable: !0,
              configurable: !0,
              value: u,
              writable: !0
            };
        }
        return o;
      },
      has(a, f) {
        if (f === ct)
          return !0;
        var o = n.get(f), h = o !== void 0 && o.v !== C || Reflect.has(a, f);
        if (o !== void 0 || w !== null && (!h || ze(a, f)?.writable)) {
          o === void 0 && (o = l(() => {
            var u = h ? De(a[f]) : C, v =                 $(u);
            return v;
          }), n.set(f, o));
          var c = m(o);
          if (c === C)
            return !1;
        }
        return h;
      },
      set(a, f, o, h) {
        var c = n.get(f), u = f in a;
        if (r && f === "length")
          for (var v = o; v <                              
          c.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? te(d, C) : v in a && (d = l(() =>                 $(C)), n.set(v + "", d));
          }
        if (c === void 0)
          (!u || ze(a, f)?.writable) && (c = l(() =>                 $(void 0)), te(c, De(o)), n.set(f, c));
        else {
          u = c.v !== C;
          var p = l(() => De(o));
          te(c, p);
        }
        var _ = Reflect.getOwnPropertyDescriptor(a, f);
        if (_?.set && _.set.call(h, o), !u) {
          if (r && typeof f == "string") {
            var b = (
                                           
              n.get("length")
            ), T = Number(f);
            Number.isInteger(T) && T >= b.v && te(b, T + 1);
          }
          Ye(i);
        }
        return !0;
      },
      ownKeys(a) {
        m(i);
        var f = Reflect.ownKeys(a).filter((c) => {
          var u = n.get(c);
          return u === void 0 || u.v !== C;
        });
        for (var [o, h] of n)
          h.v !== C && !(o in a) && f.push(o);
        return f;
      },
      setPrototypeOf() {
        pr();
      }
    }
  );
}
var qt, Nn, An, Cn;
function Ir() {
  if (qt === void 0) {
    qt = window, Nn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    An = ze(t, "firstChild").get, Cn = ze(t, "nextSibling").get, Ut(e) && (e[wt] = void 0, e[un] = null, e[tr] = void 0, e.__e = void 0), Ut(n) && (n[bt] = void 0);
  }
}
function we(e = "") {
  return document.createTextNode(e);
}
                       
function Be(e) {
  return (
                                      
    An.call(e)
  );
}
                       
function We(e) {
  return (
                                      
    Cn.call(e)
  );
}
function On(e, t) {
  return                 Be(e);
}
function xn(e, t = !1) {
  {
    var n =                 Be(e);
    return n instanceof Comment && n.data === "" ?                 We(n) : n;
  }
}
function Wt(e, t = !1) {
  return                 Be(e);
}
function vt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    We(r);
  return r;
}
function Mr(e) {
  e.textContent = "";
}
function In() {
  return !1;
}
function Rr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Pr(e) {
  var t = w;
  if (t === null)
    return y.f |= oe, e;
  if ((t.f & Ie) === 0 && (t.f & Ue) === 0)
    throw e;
  X(e, t);
}
function X(e, t) {
  if (!(t !== null && (t.f & F) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & mt) !== 0 && (t.f & (F | yt)) === 0) {
        if ((t.f & Ie) === 0)
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
function Dr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ce(e, t) {
  var n = w;
  n !== null && (n.f & R) !== 0 && (e |= R);
  var r = {
    ctx: K,
    deps: null,
    nodes: null,
    f: e | x | Y,
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
  g?.register_created_effect(r);
  var i = r;
  if ((e & Ue) !== 0)
    Se !== null ? Se.push(r) : ue.ensure().schedule(r);
  else if (t !== null) {
    try {
      xe(r);
    } catch (l) {
      throw D(r), l;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Me) === 0 && (i = i.first, (e & B) !== 0 && (e & Ae) !== 0 && i !== null && (i.f |= Ae));
  }
  if (i !== null && (i.parent = n, n !== null && Dr(i, n), y !== null && (y.f & I) !== 0 && (e & ie) === 0)) {
    var s = (
                            
      y
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function zt() {
  return y !== null && !H;
}
function Mn(e) {
  const t = ce(ot, null);
  return N(t, O), t.teardown = e, t;
}
function Lr(e) {
  return ce(Ue | $n, e);
}
function Fr(e) {
  ue.ensure();
  const t = ce(ie | Me, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? _e(t, () => {
      D(t), r(void 0);
    }) : (D(t), r(void 0));
  });
}
function zr(e) {
  return ce(Ne | Me, e);
}
function jr(e, t = 0) {
  return ce(ot | t, e);
}
function Qe(e, t = [], n = [], r = []) {
  wr(r, t, n, (i) => {
    ce(ot, () => {
      e(...i.map(m));
    });
  });
}
function jt(e, t = 0) {
  var n = ce(B | t, e);
  return n;
}
function j(e) {
  return ce(W | Me, e);
}
function Rn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = be, r = y;
    Kt(!0), G(null);
    try {
      t.call(null);
    } catch (i) {
      X(i, e.parent);
    } finally {
      Kt(n), G(r);
    }
  }
}
function Yt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && qe(() => {
      i.abort(He);
    });
    var r = n.next;
    (n.f & ie) !== 0 ? n.parent = null : D(n, t), n = r;
  }
}
function Yr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && D(t), t = n;
  }
}
function D(e, t = !0) {
  var n = !1;
  (t || (e.f & Qn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Gr(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= yt, Yt(e, t && !n), Ve(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Rn(e), e.f ^= yt, e.f |= F;
  var i = e.parent;
  i !== null && i.first !== null && Pn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Gr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 We(e);
    e.remove(), e = n;
  }
}
function Pn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function _e(e, t, n = !0) {
  var r = [];
  e.f |= xt, Dn(e, r, !0);
  var i = () => {
    n && D(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var l = () => --s || i();
    for (var a of r)
      a.out(l);
  } else
    i();
}
function Dn(e, t, n) {
  if ((e.f & R) === 0) {
    e.f ^= R;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & ie) === 0) {
        var l = (i.f & Ae) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & W) !== 0 && (e.f & B) !== 0;
        Dn(i, t, l ? n : !1);
      }
      i = s;
    }
  }
}
function at(e) {
  e.f &= ~xt, Ln(e, !0);
}
function Ln(e, t) {
  if ((e.f & xt) === 0 && (e.f & R) !== 0) {
    e.f ^= R, (e.f & O) === 0 && (N(e, x), ue.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Ae) !== 0 || (n.f & W) !== 0;
      Ln(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const l of s)
        (l.is_global || t) && l.in();
  }
}
function Gt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 We(n);
      t.append(n), n = i;
    }
}
let $e = !1, be = !1;
function Kt(e) {
  be = e;
}
let y = null, H = !1;
function G(e) {
  y = e;
}
let w = null;
function Q(e) {
  w = e;
}
let Z = null;
function Fn(e) {
  y !== null && (Z ??=                 new Set()).add(e);
}
let P = null, L = 0, z = null;
function Ur(e) {
  z = e;
}
let zn = 1, pe = 0, ge = pe;
function Xt(e) {
  ge = e;
}
function jn() {
  return ++zn;
}
function Ke(e) {
  var t = e.f;
  if ((t & x) !== 0)
    return !0;
  if (t & I && (e.f &= ~me), (t & q) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ke(
                              
        s
      ) && yn(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & Y) !== 0 &&                                                                   
                                                                
    V === null && N(e, O);
  }
  return !1;
}
function Yn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Z !== null && Z.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & I) !== 0 ? Yn(
                              
        s,
        t,
        !1
      ) : t === s && (n ? N(s, x) : (s.f & O) !== 0 && N(s, q), Ft(
                             
        s
      ));
    }
}
function Gn(e) {
  var t = P, n = L, r = z, i = y, s = Z, l = K, a = H, f = ge, o = e.f;
  P =                              
  null, L = 0, z = null, y = (o & (W | ie)) === 0 ? e : null, Z = null, Ce(e.ctx), H = !1, ge = ++pe, e.ac !== null && (qe(() => {
    e.ac.abort(He);
  }), e.ac = null);
  try {
    e.f |= it;
    var h = (
                             
      e.fn
    ), c = h();
    e.f |= Ie;
    var u = Jt(e);
    if (vn() && z !== null && !H && u !== null && (e.f & (I | q | x)) === 0)
      for (var v = 0; v <                        
      z.length; v++)
        Yn(
          z[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (pe++, i.deps !== null)
        for (let d = 0; d < n; d += 1)
          i.deps[d].rv = pe;
      if (t !== null)
        for (const d of t)
          d.rv = pe;
      z !== null && (r === null ? r = z : r.push(...                       
      z));
    }
    return (e.f & oe) !== 0 && (e.f ^= oe), c;
  } catch (d) {
    return Jt(e), Pr(d);
  } finally {
    e.f ^= it, P = t, L = n, z = r, y = i, Z = s, Ce(l), H = a, ge = f;
  }
}
function Jt(e) {
  var t = e.deps, n = g?.is_fork;
  if (P !== null) {
    var r;
    if (n || Ve(e, L), t !== null && L > 0)
      for (t.length = L + P.length, r = 0; r < P.length; r++)
        t[L + r] = P[r];
    else
      e.deps = t = P;
    if (zt() && (e.f & Y) !== 0)
      for (r = L; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && L < t.length && (Ve(e, L), t.length = L);
  return t;
}
function Br(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = qn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & I) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (P === null || !nt.call(P, t))) {
    var s = (
                            
      t
    );
    (s.f & Y) !== 0 && (s.f ^= Y, s.f &= ~me), s.v !== C && Rt(s), s.ac !== null && qe(() => {
      s.ac.abort(He), s.ac = null, N(s, x);
    }), Sr(s), Ve(s, 0);
  }
}
function Ve(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Br(e, n[r]);
}
function xe(e) {
  var t = e.f;
  if ((t & F) === 0) {
    N(e, O);
    var n = w, r = $e;
    w = e, $e = (t & (W | ie)) === 0;
    try {
      (t & (B | fn)) !== 0 ? Yr(e) : Yt(e), Rn(e);
      var i = Gn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = zn;
      var s;
    } finally {
      $e = r, w = n;
    }
  }
}
function m(e) {
  var t = e.f, n = (t & I) !== 0;
  if (y !== null && !H) {
    var r = w !== null && (w.f & F) !== 0;
    if (!r && (Z === null || !Z.has(e))) {
      var i = y.deps;
      if ((y.f & it) !== 0)
        e.rv < pe && (e.rv = pe, P === null && i !== null && i[L] === e ? L++ : P === null ? P = [e] : P.push(e));
      else {
        y.deps ??= [], nt.call(y.deps, e) || y.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [y] : nt.call(s, y) || s.push(y);
      }
    }
  }
  if (be && J.has(e))
    return J.get(e);
  if (n) {
    var l = (
                            
      e
    );
    if (be) {
      var a = l.v;
      return ((l.f & O) === 0 && l.reactions !== null || Bn(l)) && (a = Dt(l)), J.set(l, a), a;
    }
    var f = (l.f & Y) === 0 && !H && y !== null && ($e || (y.f & Y) !== 0), o = (l.f & Ie) === 0;
    Ke(l) && (f && (l.f |= Y), yn(l)), f && !o && (wn(l), Un(l));
  }
  if (V?.has(e))
    return V.get(e);
  if ((e.f & oe) !== 0)
    throw e.v;
  return e.v;
}
function Un(e) {
  if (e.f |= Y, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & I) !== 0 && (t.f & Y) === 0 && (wn(
                              
        t
      ), Un(
                              
        t
      ));
}
function Bn(e) {
  if (e.v === C) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (J.has(t) || (t.f & I) !== 0 && Bn(
                            
      t
    ))
      return !0;
  return !1;
}
function Vr(e) {
  var t = H;
  try {
    return H = !0, e();
  } finally {
    H = t;
  }
}
const Hr = ["touchstart", "touchmove"];
function qr(e) {
  return Hr.includes(e);
}
const Le =                 Symbol("events"), Vn =                 new Set(), Tt =                 new Set();
function Wr(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || St.call(t, s), !s.cancelBubble)
      return qe(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? fe(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function Zt(e, t, n, r, i) {
  var s = { capture: r, passive: i }, l = Wr(e, t, n, s);
  (t === document.body ||              
  t === window ||              
  t === document ||                                                                                                                     
  t instanceof HTMLMediaElement) && Mn(() => {
    t.removeEventListener(e, l, s);
  });
}
function Kr(e, t, n) {
  (t[Le] ??= {})[e] = n;
}
function Xr(e) {
  for (var t = 0; t < e.length; t++)
    Vn.add(e[t]);
  for (var n of Tt)
    n(e);
}
let pt = null, _t = !1;
function St(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  pt = e, _t || (_t = !0, setTimeout(() => {
    _t = !1, pt = null;
  }));
  var l = 0, a = pt === e && e[Le];
  if (a) {
    var f = i.indexOf(a);
    if (f !== -1 && (t === document || t ===                   
    window)) {
      e[Le] = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    f <= o && (l = f);
  }
  if (s =                       
  i[l] || e.target, s !== t) {
    sn(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var h = y, c = w;
    G(null), Q(null);
    try {
      for (var u, v = []; s !== null && s !== t; ) {
        try {
          var d = s[Le]?.[r];
          d != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && d.call(s, e);
        } catch (p) {
          u ? v.push(p) : u = p;
        }
        if (e.cancelBubble) break;
        l++, s = l < i.length ? (
                                
          i[l]
        ) : null;
      }
      if (u) {
        for (let p of v)
          queueMicrotask(() => {
            throw p;
          });
        throw u;
      }
    } finally {
      e[Le] = t, delete e.currentTarget, G(h), Q(c);
    }
  }
}
const Jr = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function Zr(e) {
  return (
                         
    Jr?.createHTML(e) ?? e
  );
}
function Qr(e) {
  var t = Rr("template");
  return t.innerHTML = Zr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Nt(e, t) {
  var n = (
                         
    w
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function he(e, t) {
  var n = (t & sr) !== 0, r = (t & lr) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = Qr(s ? e : "<!>" + e), n || (i =                            
                    Be(i)));
    var l = (
                                 
      r || Nn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var a = (
                                   
                        Be(l)
      ), f = (
                                   
        l.lastChild
      );
      Nt(a, f);
    } else
      Nt(l, l);
    return l;
  };
}
function $r() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = we();
  return e.append(t, n), Nt(t, n), e;
}
function ne(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function ei(e) {
  let t = 0, n = ye(0), r;
  return () => {
    zt() && (m(n), jr(() => (t === 0 && (r = Vr(() => e(() => Ye(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ye(n));
      });
    })));
  };
}
var ti = Ae | Me;
function ni(e, t, n, r) {
  new ri(e, t, n, r);
}
class ri {
                                
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
  #p = 0;
  #o = 0;
  #u = !1;
                            
  #h =                 new Set();
                            
  #_ =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #c = null;
  #y = ei(() => (this.#c = ye(this.#p), () => {
    this.#c = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#f = (s) => {
      var l = (
                             
        w
      );
      l.b = this, l.f |= mt, r(s);
    }, this.parent =                      
    w.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = jt(() => {
      this.#d();
    }, ti);
  }
  #g() {
    try {
      this.#s = j(() => this.#f(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #b(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#w(t);
    fe(i), n && (this.#a = j(() => {
      n(
        this.#t,
        () => t,
        () => r
      );
    }));
  }
     
                                                                              
                                                 
                           
                                                                 
     
  #w(t) {
    var n = !1, r = !1;
    const i = () => {
      if (n) {
        or();
        return;
      }
      n = !0, r && gr(), this.#a !== null && _e(this.#a, () => {
        this.#a = null;
      }), this.#v(() => {
        this.#d();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (l) {
        X(l, this.#r && this.#r.parent);
      }
    } };
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = j(() => t(this.#t)), fe(() => {
      var n = this.#i = document.createDocumentFragment(), r = we(), i = !1;
      if (n.append(r), this.#s = this.#v(() => {
        try {
          return j(() => this.#f(r));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (l) {
            X(l, this.#r.parent);
          }
          return null;
        }
      }), this.#s === null) {
        this.#i = null, i && this.#m(
                              
          g
        );
        return;
      }
      this.#o === 0 && (this.#t.before(n), this.#i = null, _e(
                             
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#m(
                            
        g
      ));
    }));
  }
  #d() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#p = 0, this.#s = j(() => {
        this.#f(this.#t);
      }), this.#o > 0) {
        var t = this.#i = document.createDocumentFragment();
        Gt(this.#s, t);
        const n = (
                                               
          this.#e.pending
        );
        this.#n = j(() => n(this.#t));
      } else
        this.#m(
                              
          g
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#_);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    gn(t, this.#h, this.#_);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var n = w, r = y, i = K;
    Q(this.#r), G(this.#r), Ce(this.#r.ctx);
    try {
      return ue.ensure(), t();
    } finally {
      Q(n), G(r), Ce(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #k(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#k(t, n);
      return;
    }
    this.#o += t, this.#o === 0 && (this.#m(n), this.#n && _e(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#k(t, n), this.#p += t, !(!this.#c || this.#u) && (this.#u = !0, fe(() => {
      this.#u = !1, this.#c && Oe(this.#c, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#y(), m(
                                   
      this.#c
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    g?.is_fork ? (this.#s && g.skip_effect(this.#s), this.#n && g.skip_effect(this.#n), this.#a && g.skip_effect(this.#a), g.oncommit(() => {
      this.#T(t);
    })) : this.#T(t);
  }
     
                           
     
  #T(t) {
    this.#s && (D(this.#s), this.#s = null), this.#n && (D(this.#n), this.#n = null), this.#a && (D(this.#a), this.#a = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: l } = this.#w(i);
      l(), n && (this.#a = this.#v(() => {
        try {
          return j(() => {
            var a = (
                                   
              w
            );
            a.b = this, a.f |= mt, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (a) {
          return X(
            a,
                                 
            this.#r.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        X(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (s) => X(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Qt(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[bt] ??= e.nodeValue) && (e[bt] = n, e.nodeValue = `${n}`);
}
function ii(e, t) {
  return si(e, t);
}
const Xe =                 new Map();
function si(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: l = !0, transformError: a }) {
  Ir();
  var f = void 0, o = Fr(() => {
    var h = n ?? t.appendChild(we());
    ni(
                                 
      h,
      {
        pending: () => {
        }
      },
      (v) => {
        It({});
        var d = (
                                         
          K
        );
        s && (d.c = s), i && (r.$$events = i), f = e(v, r) || dn(), Mt();
      },
      a
    );
    var c =                 new Set(), u = (v) => {
      for (var d = 0; d < v.length; d++) {
        var p = v[d];
        if (!c.has(p)) {
          c.add(p);
          var _ = qr(p);
          for (const E of [t, document]) {
            var b = Xe.get(E);
            b === void 0 && (b =                 new Map(), Xe.set(E, b));
            var T = b.get(p);
            T === void 0 ? (E.addEventListener(p, St, { passive: _ }), b.set(p, 1)) : b.set(p, T + 1);
          }
        }
      }
    };
    return u(ft(Vn)), Tt.add(u), () => {
      for (var v of c)
        for (const _ of [t, document]) {
          var d = (
                                              
            Xe.get(_)
          ), p = (
                                 
            d.get(v)
          );
          --p == 0 ? (_.removeEventListener(v, St), d.delete(v), d.size === 0 && Xe.delete(_)) : d.set(v, p);
        }
      Tt.delete(u), h !== n && h.parentNode?.removeChild(h);
    };
  });
  return At.set(f, o), f;
}
let At =                 new WeakMap();
function li(e, t) {
  const n = At.get(e);
  return n ? (At.delete(e), n(t)) : Promise.resolve();
}
class ai {
                             
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
        at(r), this.#f.delete(n);
      else {
        var i = this.#e.get(n);
        i && (at(i.effect), this.#l.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, l] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const a = this.#e.get(l);
        a && (D(a.effect), this.#e.delete(l));
      }
      for (const [s, l] of this.#l) {
        if (s === n || this.#f.has(s)) continue;
        const a = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var o = document.createDocumentFragment();
            Gt(l, o), o.append(we()), this.#e.set(s, { effect: l, fragment: o });
          } else
            D(l);
          this.#f.delete(s), this.#l.delete(s);
        };
        this.#r || !r ? (this.#f.add(s), _e(l, a, !1)) : a();
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
                          
      g
    ), i = In();
    if (n && !this.#l.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), l = we();
        s.append(l), this.#e.set(t, {
          effect: j(() => n(l)),
          fragment: s
        });
      } else
        this.#l.set(
          t,
          j(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [a, f] of this.#l)
        a === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [a, f] of this.#e)
        a === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function Ct(e, t, n = !1) {
  var r = new ai(e), i = n ? Ae : 0;
  function s(l, a) {
    r.ensure(l, a);
  }
  jt(() => {
    var l = !1;
    t((a, f = 0) => {
      l = !0, s(f, a);
    }), l || s(-1, null);
  }, i);
}
function fi(e, t, n) {
  for (var r = [], i = t.length, s, l = t.length, a = 0; a < i; a++) {
    let c = t[a];
    _e(
      c,
      () => {
        if (s) {
          if (s.pending.delete(c), s.done.add(c), s.pending.size === 0) {
            var u = (
                                                
              e.outrogroups
            );
            Ot(e, ft(s.done)), u.delete(s), u.size === 0 && (e.outrogroups = null);
          }
        } else
          l -= 1;
      },
      !1
    );
  }
  if (l === 0) {
    var f = r.length === 0 && n !== null && e.pending.size === 0;
    if (f) {
      var o = (
                              
        n
      ), h = (
                              
        o.parentNode
      );
      Mr(h), h.append(o), e.items.clear();
    }
    Ot(e, t, !f);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function Ot(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const l of e.pending.values())
      for (const a of l)
        r.add(
                                 
          e.items.get(a).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= re;
      const l = document.createDocumentFragment();
      Gt(s, l);
    } else
      D(t[i], n);
  }
}
var $t;
function oi(e, t, n, r, i, s = null) {
  var l = e, a =                 new Map(), f = null, o =                 kr(() => {
    var b = n();
    return (
                        
      rn(b) ? b : b == null ? [] : ft(b)
    );
  }), h, c =                 new Map(), u = !0;
  function v(b) {
    (_.effect.f & F) === 0 && (_.pending.delete(b), _.fallback = f, ui(_, h, l, t, r), f !== null && (h.length === 0 ? (f.f & re) === 0 ? at(f) : (f.f ^= re, Fe(f, null, l)) : _e(f, () => {
      f = null;
    })));
  }
  function d(b) {
    _.pending.delete(b);
  }
  var p = jt(() => {
    h =                   
    m(o);
    for (var b = h.length, T =                 new Set(), E = (
                          
      g
    ), U = In(), M = 0; M < b; M += 1) {
      var se = h[M], le = r(se, M), k = u ? null : a.get(le);
      k ? (k.v && Oe(k.v, se), k.i && Oe(k.i, M), U && E.unskip_effect(k.e)) : (k = ci(
        a,
        u ? l : $t ??= we(),
        se,
        le,
        M,
        i,
        t,
        n
      ), u || (k.e.f |= re), a.set(le, k)), T.add(le);
    }
    if (b === 0 && s && !f && (u ? f = j(() => s(l)) : (f = j(() => s($t ??= we())), f.f |= re)), b > T.size && hr(), !u)
      if (c.set(E, T), U) {
        for (const [Ee, ut] of a)
          T.has(Ee) || E.skip_effect(ut.e);
        E.oncommit(v), E.ondiscard(d);
      } else
        v(E);
    m(o);
  }), _ = { effect: p, items: a, pending: c, outrogroups: null, fallback: f };
  u = !1;
}
function Re(e) {
  for (; e !== null && (e.f & W) === 0; )
    e = e.next;
  return e;
}
function ui(e, t, n, r, i) {
  var s = t.length, l = e.items, a = Re(e.effect.first), f, o = null, h = [], c = [], u, v, d, p;
  for (p = 0; p < s; p += 1) {
    if (u = t[p], v = i(u, p), d =                        
    l.get(v).e, e.outrogroups !== null)
      for (const k of e.outrogroups)
        k.pending.delete(d), k.done.delete(d);
    if ((d.f & R) !== 0 && at(d), (d.f & re) !== 0)
      if (d.f ^= re, d === a)
        Fe(d, null, n);
      else {
        var _ = o ? o.next : a;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), ae(e, o, d), ae(e, d, _), Fe(d, _, n), o = d, h = [], c = [], a = Re(o.next);
        continue;
      }
    if (d !== a) {
      if (f !== void 0 && f.has(d)) {
        if (h.length < c.length) {
          var b = c[0], T;
          o = b.prev;
          var E = h[0], U = h[h.length - 1];
          for (T = 0; T < h.length; T += 1)
            Fe(h[T], b, n);
          for (T = 0; T < c.length; T += 1)
            f.delete(c[T]);
          ae(e, E.prev, U.next), ae(e, o, E), ae(e, U, b), a = b, o = U, p -= 1, h = [], c = [];
        } else
          f.delete(d), Fe(d, a, n), ae(e, d.prev, d.next), ae(e, d, o === null ? e.effect.first : o.next), ae(e, o, d), o = d;
        continue;
      }
      for (h = [], c = []; a !== null && a !== d; )
        (f ??=                 new Set()).add(a), c.push(a), a = Re(a.next);
      if (a === null)
        continue;
    }
    (d.f & re) === 0 && h.push(d), o = d, a = Re(d.next);
  }
  if (e.outrogroups !== null) {
    for (const k of e.outrogroups)
      k.pending.size === 0 && (Ot(e, ft(k.done)), e.outrogroups?.delete(k));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (a !== null || f !== void 0) {
    var M = [];
    if (f !== void 0)
      for (d of f)
        (d.f & R) === 0 && M.push(d);
    for (; a !== null; )
      (a.f & R) === 0 && a !== e.fallback && M.push(a), a = Re(a.next);
    var se = M.length;
    if (se > 0) {
      var le = null;
      fi(e, M, le);
    }
  }
}
function ci(e, t, n, r, i, s, l, a) {
  var f = (l & nr) !== 0 ? (l & ir) === 0 ?                 Or(n, !1, !1) : ye(n) : null, o = (l & rr) !== 0 ? ye(i) : null;
  return {
    v: f,
    i: o,
    e: j(() => (s(t, f ?? n, o ?? i, a), () => {
      e.delete(r);
    }))
  };
}
function Fe(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & re) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
                                   
                        We(r)
      );
      if (s.before(r), r === i)
        return;
      r = l;
    }
}
function ae(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const en = [...` 	
\r\f \v\uFEFF`];
function hi(e, t, n) {
  var r = "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var s = i.length, l = 0; (l = r.indexOf(i, l)) >= 0; ) {
          var a = l + s;
          (l === 0 || en.includes(r[l - 1])) && (a === r.length || en.includes(r[a])) ? r = (l === 0 ? "" : r.substring(0, l)) + r.substring(a + 1) : l = a;
        }
  }
  return r === "" ? null : r;
}
function di(e, t, n, r, i, s) {
  var l = (
                      
    e[wt]
  );
  if (l !== n || l === void 0) {
    var a = hi(n, r, s);
    a == null ? e.removeAttribute("class") : e.className = a, e[wt] = n;
  } else if (s && i !== s)
    for (var f in s) {
      var o = !!s[f];
      (i == null || o !== !!i[f]) && e.classList.toggle(f, o);
    }
  return s;
}
const vi =                 Symbol("is custom element"), pi =                 Symbol("is html");
function de(e, t, n, r) {
  var i = _i(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[er] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && gi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function _i(e) {
  return (
                                                    
                      
    e[un] ??= {
      [vi]: e.nodeName.includes("-"),
      [pi]: e.namespaceURI === ar
    }
  );
}
var tn =                 new Map();
function gi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = tn.get(t);
  if (n) return n;
  tn.set(t, n =                 new Set());
  for (var r, i = e, s = Element.prototype; s !== i; ) {
    r = Wn(i);
    for (var l in r)
      r[l].set &&                                                                                     
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.add(l);
    i = ln(i);
  }
  return n;
}
const mi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(mi);
const nn = /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
function et(e) {
  if (e.kind === "mapped") {
    const t = ["EXACT", "EXISTING_VERIFIED"].includes(e.status) && typeof e.image == "string" && nn.test(e.image) && typeof e.spritePathId == "string";
    return { mapped: !0, src: t ? "./" + e.image : null, status: e.status, label: t ? "カテゴリ画像" : "カテゴリ画像：画像未確定", spritePathId: t ? e.spritePathId : void 0 };
  }
  return { mapped: !1, src: e.kind === "legacy" && e.image.startsWith("./") && nn.test(e.image.slice(2)) ? e.image : null, status: "UNKNOWN", label: "カテゴリ画像：画像未確定", spritePathId: void 0 };
}
const Te = (e) => typeof e == "string" && e.length > 0 && e.length <= 4096;
function tt(e) {
  if (!e || !Array.isArray(e.rows) || e.rows.length > 512 || !Number.isSafeInteger(e.totalCategories) || e.totalCategories < e.rows.length || e.totalCategories > 512 || !(e.selectedKey === null || Te(e.selectedKey))) throw Error("CATEGORY_SNAPSHOT_INVALID");
  const t =                 new Set();
  for (const n of e.rows) {
    if (!n || !Te(n.key) || !Te(n.title) || !Te(n.description) || t.has(n.key) || !n.image || !["mapped", "legacy", "unknown"].includes(n.image.kind) || n.image.kind === "mapped" && !Te(n.image.status) || n.image.kind === "legacy" && !Te(n.image.image)) throw Error("CATEGORY_ROW_INVALID");
    t.add(n.key);
  }
  return e;
}
function yi(e) {
  return { read: () => tt(e.read()), select(t) {
    if (!tt(e.read()).rows.some((r) => r.key === t)) throw Error("CATEGORY_NOT_VISIBLE");
    try {
      if (e.selectCategory(t), tt(e.read()).selectedKey !== t) throw Error("CATEGORY_SELECTION_POSTCONDITION");
    } finally {
      e.invalidate?.();
    }
  } };
}
var wi =                 he('<img alt="" width="92" height="92" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>'), bi =                 he('<span class="media-null-mark" aria-hidden="true">—</span>'), Ei =                 he('<span class="media-thumb media-category" data-image-kind="category"><!></span>'), ki =                 he('<img class="collection-icon" alt="" loading="lazy" width="92" height="92"/>'), Ti =                 he('<span class="collection-icon-fallback">画像 UNKNOWN</span>');
function Si(e, t) {
  It(t, !0);
  const n =                 Bt(() => et(t.image));
  let r =                 $(null);
  const i =                 Bt(() => m(n).src !== null && m(r) === m(n).src);
  var s = $r(), l = xn(s);
  {
    var a = (h) => {
      var c = Ei(), u = On(c);
      {
        var v = (p) => {
          var _ = wi();
          Qe(() => {
            de(_, "src", m(n).src), de(_, "data-sprite-path-id", m(n).spritePathId);
          }), Zt("error", _, () => te(r, m(n).src, !0)), ne(p, _);
        }, d = (p) => {
          var _ = bi();
          ne(p, _);
        };
        Ct(u, (p) => {
          m(n).src && !m(i) ? p(v) : p(d, -1);
        });
      }
      Qe(() => {
        de(c, "data-image-status", m(i) ? "LOAD_FAILED" : m(n).status), de(c, "aria-label", m(n).label), de(c, "title", m(n).src ? "カテゴリ画像" : "カテゴリ画像：" + m(n).status);
      }), ne(h, c);
    }, f = (h) => {
      var c = ki();
      Qe(() => de(c, "src", m(n).src)), Zt("error", c, () => te(r, m(n).src, !0)), ne(h, c);
    }, o = (h) => {
      var c = Ti();
      ne(h, c);
    };
    Ct(l, (h) => {
      m(n).mapped ? h(a) : m(n).src && !m(i) ? h(f, 1) : h(o, -1);
    });
  }
  ne(e, s), Mt();
}
var Ni =                 he('<p class="placeholder">該当するカテゴリがありません。</p>'), Ai =                 he('<button type="button"><!><span class="collection-title"> </span><small class="collection-meta"> </small></button>'), Ci =                 he("<!> <!>", 1);
function Oi(e, t) {
  It(t, !0);
  var n = Ci(), r = xn(n);
  {
    var i = (l) => {
      var a = Ni();
      ne(l, a);
    };
    Ct(r, (l) => {
      t.snapshot.rows.length === 0 && l(i);
    });
  }
  var s = vt(r, 2);
  oi(s, 17, () => t.snapshot.rows, (l) => l.key, (l, a) => {
    var f = Ai();
    let o;
    var h = On(f);
    Si(h, {
      get image() {
        return m(a).image;
      }
    });
    var c = vt(h), u = Wt(c, !0), v = vt(c), d = Wt(v, !0);
    Qe(() => {
      o = di(f, 1, "collection-card", null, o, { selected: t.snapshot.selectedKey === m(a).key }), de(f, "data-category-key", m(a).key), Qt(u, m(a).title), Qt(d, m(a).description);
    }), Kr("click", f, () => t.port.select(m(a).key)), ne(l, f);
  }), ne(e, n), Mt();
}
Xr(["click"]);
const xi = "data-hkia-svelte-categories", S = (e) => {
  if (!e) throw Error("PRODUCT_CATEGORY_DOM_CONTRACT");
}, Ge = (e) => e.textContent ?? "", A = (e, t) => e.getAttribute(t);
function Ii(e) {
  let t;
  if (e.tagName === "SPAN" && e.className === "media-thumb media-category") {
    const n = A(e, "data-image-status");
    S(n && A(e, "data-image-kind") === "category" && e.children.length === 1);
    const r = e.children[0], i = A(r, "src");
    if (r.tagName === "IMG") {
      const s = A(r, "data-sprite-path-id");
      S(i?.startsWith("./") && s !== null && A(r, "alt") === "" && A(r, "width") === "92" && A(r, "height") === "92" && A(r, "loading") === "lazy" && A(r, "decoding") === "async" && A(r, "referrerpolicy") === "no-referrer"), t = { kind: "mapped", status: n, image: i.slice(2), spritePathId: s };
      const l = et(t);
      S(l.src === i && A(e, "aria-label") === l.label && A(e, "title") === "カテゴリ画像");
    } else {
      S(r.tagName === "SPAN" && r.className === "media-null-mark" && Ge(r) === "—" && A(r, "aria-hidden") === "true"), t = { kind: "mapped", status: n, image: null };
      const s = et(t);
      S(s.src === null && A(e, "aria-label") === s.label && A(e, "title") === "カテゴリ画像：" + n);
    }
  } else if (e.tagName === "IMG" && e.className === "collection-icon") {
    const n = A(e, "src");
    S(n && A(e, "alt") === "" && A(e, "width") === "92" && A(e, "height") === "92" && A(e, "loading") === "lazy"), t = { kind: "legacy", image: n }, S(et(t).src === n);
  } else
    S(e.tagName === "SPAN" && e.className === "collection-icon-fallback" && Ge(e) === "画像 UNKNOWN"), t = { kind: "unknown" };
  return Object.freeze(t);
}
function Je(e, t, n, r, i = !1) {
  S(e.tagName === "DIV" && e.id === "collectionGrid" && e.className === "collection-grid");
  const s = [], l =                 new Map();
  t.length ? S(e.children.length === t.length) : S(e.children.length === 1 && e.children[0].tagName === "P" && e.children[0].className === "placeholder" && Ge(e.children[0]) === "該当するカテゴリがありません。");
  for (const [f, o] of t.entries()) {
    const h = e.children[f];
    S(h.tagName === "BUTTON" && h.type === "button" && h.className === (o === n ? "collection-card selected" : "collection-card") && h.children.length === 3 && (!i || A(h, "data-category-key") === o));
    const [c, u, v] = Array.from(h.children);
    S(u.tagName === "SPAN" && u.className === "collection-title" && v.tagName === "SMALL" && v.className === "collection-meta"), s.push(Object.freeze({ key: o, title: Ge(u), description: Ge(v), image: Ii(c) })), l.set(o, h);
  }
  return { snapshot: tt(Object.freeze({ rows: Object.freeze(s), selectedKey: n, totalCategories: r })), buttons: l };
}
const gt = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function Mi(e, t) {
  let n = null, r = null, i = !1, s = !1, l = !1, a = 0;
  function f(u) {
    const v = e.querySelectorAll('[id="collectionGrid"]');
    return v.length === 1 && v[0] === u;
  }
  function o(u) {
    try {
      u();
    } catch {
    }
  }
  function h() {
    r = null;
    const u = n;
    if (u) {
      if (n = null, !f(u.candidate)) {
        s = !0, u.candidate.parentElement || o(u.dispose);
        return;
      }
      try {
        u.candidate.replaceWith(u.legacy), S(f(u.legacy));
      } catch {
        s = !0;
        return;
      }
      o(u.dispose);
    }
  }
  function c(u, v, d, p) {
    if (s || l || n || !f(u)) return "LEGACY_RETAINED";
    let _;
    try {
      _ = Je(u, v, d, p), r = _.snapshot, a++;
    } catch {
      return r = null, "LEGACY_RETAINED";
    }
    const b = u.parentElement, T = {}, E = u.cloneNode(!1);
    E.setAttribute(xi, "1");
    const U = [..._.buttons].find(([, k]) => e.activeElement === k)?.[0];
    let M, se = !1;
    const le = yi({ read() {
      return S(r !== null), r;
    }, selectCategory(k) {
      S(!i && n?.token === T && f(E) && _.buttons.has(k)), i = !0;
      const Ee = a;
      try {
        _.buttons.get(k).click(), S(a > Ee);
      } finally {
        i = !1;
      }
    } });
    l = !0;
    try {
      M = t(E, _.snapshot, le), S(typeof M == "function");
      const k = Je(E, v, d, p, !0);
      S(gt(k.snapshot, _.snapshot));
      const Ee = Je(u, v, d, p);
      return S(r === _.snapshot && f(u) && u.parentElement === b && gt(Ee.snapshot, _.snapshot) && [..._.buttons].every(([ut, Hn]) => Ee.buttons.get(ut) === Hn)), u.replaceWith(E), se = !0, S(f(E) && E.parentElement === b && gt(Je(E, v, d, p, !0).snapshot, _.snapshot)), n = { legacy: u, candidate: E, dispose: M, token: T }, U && k.buttons.get(U)?.focus(), "MOUNTED";
    } catch {
      if (n = null, se)
        try {
          E.replaceWith(u), S(f(u)), U && _.buttons.get(U)?.focus();
        } catch {
          s = !0;
        }
      return M && o(M), "LEGACY_RETAINED";
    } finally {
      l = !1;
    }
  }
  return { restore: h, render: c };
}
function Pi(e) {
  return Mi(e, (t, n, r) => {
    const i = ii(Oi, { target: t, props: { snapshot: n, port: r } }), s = () => {
      li(i).catch(() => {
      });
    };
    try {
      Ar();
    } catch (l) {
      throw s(), l;
    }
    return s;
  });
}
export {
  Pi as createProductCategoryBridge
};
