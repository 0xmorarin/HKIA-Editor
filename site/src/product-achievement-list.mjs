var fn = Array.isArray, Zn = Array.prototype.indexOf, st = Array.prototype.includes, vt = Array.from, on = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, Jn = Object.getOwnPropertyDescriptors, Qn = Object.prototype, $n = Array.prototype, un = Object.getPrototypeOf, Kt = Object.isExtensible;
const er = () => {
};
function tr(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function cn() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const x = 2, Ke = 4, _t = 8, dn = 1 << 24, z = 16, K = 32, fe = 64, At = 128, Lt = 256, j = 512, S = 1024, I = 2048, Y = 4096, M = 8192, U = 16384, Ve = 32768, Nt = 1 << 25, De = 65536, lt = 1 << 17, nr = 1 << 18, Ue = 1 << 19, rr = 1 << 20, ae = 1 << 25, Ee = 65536, at = 1 << 21, Me = 1 << 22, de = 1 << 23, gt =                 Symbol("$state"), hn =                 Symbol("component"), ir =                 Symbol(""), vn =                 Symbol("attributes"), kt =                 Symbol("class"), sr =                 Symbol("style"), St =                 Symbol("text"), Je = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), lr = 1, ar = 2, fr = 16, or = 1, ur = 2, k =                 Symbol("uninitialized"), cr = "http://www.w3.org/1999/xhtml";
function dr() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function hr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function _n(e) {
  return e === this.v;
}
function vr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function pn(e) {
  return !vr(e, this.v);
}
function _r() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function pr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function gr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function mr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function wr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function yr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Er() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let X = null;
function Re(e) {
  X = e;
}
function Pt(e, t = !1, n) {
  X = {
    p: X,
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
function Ft(e) {
  var t = (
                                   
    X
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Gr(r);
  }
  return t.i = !0, X = t.p, gn(e);
}
function gn(e = {}) {
  return on(e, hn, { value: !0 }), e;
}
function mn() {
  return !0;
}
let ge = [];
function wn() {
  var e = ge;
  ge = [], tr(e);
}
function ce(e) {
  if (ge.length === 0 && !We) {
    var t = ge;
    queueMicrotask(() => {
      t === ge && wn();
    });
  }
  ge.push(e);
}
function br() {
  for (; ge.length > 0; )
    wn();
}
const Tr = -7169;
function A(e, t) {
  e.f = e.f & Tr | t;
}
function Vt(e) {
  (e.f & j) !== 0 || e.deps === null ? A(e, S) : A(e, Y);
}
function yn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & x) === 0 || (t.f & Ee) === 0 || (t.f ^= Ee, yn(
                              
        t.deps
      ));
}
function En(e, t, n) {
  (e.f & I) !== 0 ? t.add(e) : (e.f & Y) !== 0 && n.add(e), yn(e.deps), A(e, S);
}
function Qe(e) {
  var t = y, n = b;
  B(null), ne(null);
  try {
    return e();
  } finally {
    B(t), ne(n);
  }
}
function Ar(e, t, n, r) {
  const i = Ut;
  var s = e.filter((v) => !v.settled), a = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(a);
    return;
  }
  var f = (
                         
    b
  ), l = Nr(), o = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function d(v) {
    if ((f.f & U) === 0) {
      l();
      try {
        r([...a, ...v]);
      } catch (u) {
        $(u, f);
      }
      ft();
    }
  }
  var h = bn();
  if (n.length === 0) {
    o.then(() => d([])).finally(h);
    return;
  }
  function c() {
    Promise.all(n.map((v) =>                 kr(v))).then(d).catch((v) => $(v, f)).finally(h);
  }
  o ? o.then(() => {
    l(), c(), ft();
  }) : c();
}
function Nr() {
  var e = (
                         
    b
  ), t = y, n = X, r = (
                        
    g
  );
  return function(s = !0) {
    ne(e), B(t), Re(n), s && (e.f & U) === 0 && (r?.activate(), r?.apply());
  };
}
function ft(e = !0) {
  ne(null), B(null), Re(null), e && g?.deactivate();
}
function bn() {
  var e = (
                         
    b
  ), t = e.b, n = (
                        
    g
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function Ut(e) {
  var t = x | I;
  return b !== null && (b.f |= Ue), {
    ctx: X,
    deps: null,
    effects: null,
    equals: _n,
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
const Ge =                 Symbol("obsolete");
                       
function kr(e, t, n) {
  let r = (
                                
    b
  );
  r === null && _r();
  var i = (
                             
                          
    void 0
  ), s = be(
                    
    k
  ), a = !y, f =                 new Set();
  return Br(() => {
    var l = (
                           
      b
    ), o = cn();
    i = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, (v) => {
        v !== Je && o.reject(v);
      }).finally(ft);
    } catch (v) {
      o.reject(v), ft();
    }
    var d = (
                          
      g
    );
    if (a) {
      if ((l.f & Ve) !== 0)
        var h = bn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        d.async_deriveds.get(l)?.reject(Ge);
      else
        for (const v of f.values())
          v.reject(Ge);
      f.add(o), d.async_deriveds.set(l, o);
    }
    const c = (v, u = void 0) => {
      h?.(), f.delete(o), u !== Ge && (d.activate(), u ? (s.f |= de, Le(s, u)) : ((s.f & de) !== 0 && (s.f ^= de), Le(s, v)), d.deactivate());
    };
    o.promise.then(c, (v) => c(null, v || "unknown"));
  }), Rn(() => {
    for (const l of f)
      l.reject(Ge);
  }), new Promise((l) => {
    function o(d) {
      function h() {
        d === i ? l(s) : o(i);
      }
      d.then(h, h);
    }
    o(i);
  });
}
                       
function ot(e) {
  const t =                 Ut(e);
  return Un(t), t;
}
                       
function Sr(e) {
  const t =                 Ut(e);
  return t.equals = pn, t;
}
function Ir(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      P(
                             
        t[n]
      );
  }
}
function Ht(e) {
  var t, n = b, r = e.parent;
  if (!Te && r !== null && e.v !== k &&                                                                                                      
  (r.f & (U | M)) !== 0)
    return dr(), e.v;
  ne(r);
  try {
    e.f &= ~Ee, Ir(e), t = Bn(e);
  } finally {
    ne(n);
  }
  return t;
}
function Tn(e) {
  var t = Ht(e);
  if (!e.equals(t) && (e.wv = Gn(), (!g?.is_fork || e.deps === null) && (g !== null ? (g.capture(e, t, !0), It?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    A(e, S);
    return;
  }
  Te || (q !== null ? (Bt() || g?.is_fork) && q.set(e, t) : Vt(e));
}
function xr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Qe(() => {
        t.ac.abort(Je), t.ac = null;
      }), t.fn !== null && (t.teardown = er), Ze(t, 0), qt(t));
}
function An(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Fe(t);
}
let mt = null, Ne = null, g = null, It = null, q = null, xt = null, We = !1, wt = !1, Oe = null, rt = null;
var Xt = 0;
let Or = 1;
class he {
  id = Or++;
                                              
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
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #d =                 new Map();
     
                                                                                                    
                        
     
  #p =                 new Set();
  is_fork = !1;
  #c = !1;
  constructor() {
    Ne === null ? mt = Ne = this : (Ne.#e = this, this.#l = Ne), Ne = this;
  }
  #w() {
    if (this.is_fork) return !0;
    for (const r of this.#n.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
        if (this.#d.has(t)) {
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
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#p.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#d.get(t);
    if (r) {
      this.#d.delete(t);
      for (var i of r.d)
        A(i, I), n(i);
      for (i of r.m)
        A(i, Y), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#t = !0, Xt++ > 1e3 && (this.#v(), Mr());
    for (const l of this.#o)
      this.#u.delete(l), A(l, I), this.schedule(l);
    for (const l of this.#u)
      A(l, Y), this.schedule(l);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = Oe = [], r = [], i = rt = [];
    for (const l of t)
      try {
        this.#E(l, n, r);
      } catch (o) {
        throw Sn(l), this.#w() || this.discard(), o;
      }
    if (g = null, i.length > 0) {
      var s = he.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (Oe = null, rt = null, this.#w()) {
      this.#h(r), this.#h(n);
      for (const [l, o] of this.#d)
        kn(l, o);
      i.length > 0 &&                       
      g.#g();
      return;
    }
    const a = this.#y();
    if (a) {
      this.#h(r), this.#h(n), a.#b(this);
      return;
    }
    this.#o.clear(), this.#u.clear();
    for (const l of this.#f) l(this);
    this.#f.clear(), It = this, Zt(r), Zt(n), It = null, this.#a?.resolve();
    var f = (
                                 
                            
      g
    );
    if (this.#s === 0 && (this.#i.length === 0 || f !== null) && this.#v(), this.#i.length > 0)
      if (f !== null) {
        const l = f;
        l.#i.push(...this.#i.filter((o) => !l.#i.includes(o)));
      } else
        f = this;
    f !== null && (ee.clear(), f.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #E(t, n, r) {
    t.f ^= S;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (K | fe)) !== 0, f = a && (s & S) !== 0, l = f || (s & M) !== 0 || this.#d.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= S : (s & Ke) !== 0 ? n.push(i) : et(i) && ((s & z) !== 0 && this.#u.add(i), Fe(i));
        var o = i.first;
        if (o !== null) {
          i = o;
          continue;
        }
      }
      for (; i !== null; ) {
        var d = i.next;
        if (d !== null) {
          i = d;
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
      if (i !== null && !((r.f & x) !== 0 && (r.f & (I | Y)) === 0))
        for (const f of i) {
          var s = f.f;
          if ((s & x) !== 0)
            n(
                                    
              f
            );
          else {
            var a = (
                                   
              f
            );
            s & (Me | z) && !this.async_deriveds.has(a) && (this.#u.delete(a), A(a, I), this.schedule(a));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), g = this, this.#g();
  }
     
                              
     
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      En(t[n], this.#o, this.#u);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== k && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & de) === 0 && (this.current.set(t, [n, r]), q?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, q = null;
  }
  flush() {
    try {
      wt = !0, g = this, this.#g();
    } finally {
      Xt = 0, xt = null, Oe = null, rt = null, wt = !1, g = null, q = null, ee.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Ge);
    this.#v(), this.#a?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#_.push(t);
  }
  #m() {
    for (let h = mt; h !== null; h = h.#e) {
      var t = h.id < this.id, n = [];
      for (const [c, [v, u]] of this.current) {
        if (h.current.has(c)) {
          var r = (
                                         
            h.current.get(c)[0]
          );
          if (t && v !== r)
            h.current.set(c, [v, u]);
          else
            continue;
        }
        n.push(c);
      }
      if (t)
        for (const [c, v] of this.async_deriveds) {
          const u = h.async_deriveds.get(c);
          u && v.promise.then(u.resolve).catch(u.reject);
        }
      var i = [...h.current.keys()].filter(
        (c) => !                             
        h.current.get(c)[1]
      );
      if (!(!h.#t || i.length === 0)) {
        var s = i.filter((c) => !this.current.has(c));
        if (s.length === 0)
          t && h.discard();
        else if (n.length > 0) {
          if (t)
            for (const c of this.#p)
              h.unskip_effect(c, (v) => {
                (v.f & (z | Me)) !== 0 ? h.schedule(v) : h.#h([v]);
              });
          h.activate();
          var a =                 new Set(), f =                 new Map();
          for (var l of n)
            Nn(l, s, a, f);
          f =                 new Map();
          var o = [...h.current].filter(([c, v]) => {
            const u = this.current.get(c);
            return u ? u[0] !== v[0] || u[1] !== v[1] : !0;
          }).map(([c]) => c);
          if (o.length > 0)
            for (const c of this.#_)
              (c.f & (U | M | lt)) === 0 && Gt(c, o, f) && ((c.f & (Me | z)) !== 0 ? (A(c, I), h.schedule(c)) : h.#o.add(c));
          if (h.#i.length > 0 && !h.#c) {
            h.apply();
            for (var d of h.#i)
              h.#E(d, [], []);
            h.#i = [];
          }
          h.deactivate();
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
    this.#c || (this.#c = !0, ce(() => {
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
    return (this.#a ??= cn()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new he();
      !wt && !We && ce(() => {
        t.#t || t.flush();
      });
    }
    return g;
  }
  apply() {
    {
      q = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (xt = t, t.b?.is_pending && (t.f & (Ke | _t | dn)) !== 0 && (t.f & Ve) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Oe !== null && n === b && (y === null || (y.f & x) === 0))
        return;
      if ((r & (fe | K)) !== 0) {
        if ((r & S) === 0)
          return;
        n.f ^= S;
      }
    }
    this.#i.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#l, n = this.#e;
      t === null ? mt = n : t.#e = n, n === null ? Ne = t : n.#l = t, this.linked = !1;
    }
  }
}
function Cr(e) {
  var t = We;
  We = !0;
  try {
    for (var n; ; ) {
      if (br(), g === null)
        return (
                          
          n
        );
      g.flush();
    }
  } finally {
    We = t;
  }
}
function Mr() {
  try {
    gr();
  } catch (e) {
    $(e, xt);
  }
}
let le = null;
function Zt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (U | M)) === 0 && et(r) && (le =                 new Set(), Fe(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Pn(r), le?.size > 0)) {
        ee.clear();
        for (const i of le) {
          if ((i.f & (U | M)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            le.has(a) && (le.delete(a), s.push(a)), a = a.parent;
          for (let f = s.length - 1; f >= 0; f--) {
            const l = s[f];
            (l.f & (U | M)) === 0 && Fe(l);
          }
        }
        le.clear();
      }
    }
    le = null;
  }
}
function Nn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & x) !== 0 ? Nn(
                              
        i,
        t,
        n,
        r
      ) : (s & (Me | z)) !== 0 && (s & I) === 0 && Gt(i, t, r) && (A(i, I), jt(
                             
        i
      ));
    }
}
function Gt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (st.call(t, i))
        return !0;
      if ((i.f & x) !== 0 && Gt(
                              
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
function jt(e) {
  g.schedule(e);
}
function kn(e, t) {
  if (!((e.f & K) !== 0 && (e.f & S) !== 0)) {
    (e.f & I) !== 0 ? t.d.push(e) : (e.f & Y) !== 0 && t.m.push(e), A(e, S);
    for (var n = e.first; n !== null; )
      kn(n, t), n = n.next;
  }
}
function Sn(e) {
  A(e, S);
  for (var t = e.first; t !== null; )
    Sn(t), t = t.next;
}
let ut =                 new Set();
const ee =                 new Map();
let In = !1;
function be(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: _n,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function se(e, t) {
  const n = be(e);
  return Un(n), n;
}
                       
function Dr(e, t = !1, n = !0) {
  const r = be(e);
  return t || (r.equals = pn), r;
}
function ue(e, t, n = !1) {
  y !== null &&                                                                                         
                                                                
  (!W || (y.f & lt) !== 0) && mn() && (y.f & (x | z | Me | lt)) !== 0 && (te === null || !te.has(e)) && yr();
  let r = n ? je(t) : t;
  return Le(e, r, rt);
}
function Le(e, t, n = null) {
  if (!e.equals(t)) {
    Te ? ee.set(e, t) : ee.has(e) || ee.set(e, e.v);
    var r = he.ensure();
    if (r.capture(e, t), (e.f & x) !== 0) {
      const i = (
                              
        e
      );
      (e.f & I) !== 0 && Ht(i), q === null && Vt(i);
    }
    e.wv = Gn(), xn(e, I, n), b !== null && (b.f & S) !== 0 && (b.f & (K | fe)) === 0 && (H === null ? Yr([e]) : H.push(e)), !r.is_fork && ut.size > 0 && !In && Rr();
  }
  return t;
}
function Rr() {
  In = !1;
  for (const e of ut) {
    (e.f & S) !== 0 && A(e, Y);
    let t;
    try {
      t = et(e);
    } catch {
      t = !0;
    }
    t && Fe(e);
  }
  ut.clear();
}
function Ye(e) {
  ue(e, e.v + 1);
}
function xn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], f = a.f, l = (f & I) === 0;
      if (l && A(a, t), (f & lt) !== 0)
        ut.add(
                               
          a
        );
      else if ((f & x) !== 0) {
        var o = (
                                
          a
        );
        q?.delete(o), (f & Ee) === 0 && (f & j && (b === null || (b.f & at) === 0) && (a.f |= Ee), xn(o, Y, n));
      } else if (l) {
        var d = (
                               
          a
        );
        (f & z) !== 0 && le !== null && le.add(d), n !== null ? n.push(d) : jt(d);
      }
    }
}
function je(e) {
  if (typeof e != "object" || e === null || gt in e || hn in e)
    return e;
  const t = un(e);
  if (t !== Qn && t !== $n)
    return e;
  var n =                 new Map(), r = fn(e), i =                 se(0), s = ye, a = (f) => {
    if (ye === s)
      return f();
    var l = y, o = ye;
    B(null), $t(s);
    var d = f();
    return B(l), $t(o), d;
  };
  return r && n.set("length",                 se(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(f, l, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && mr();
        var d = n.get(l);
        return d === void 0 ? a(() => {
          var h =                 se(o.value);
          return n.set(l, h), h;
        }) : ue(d, o.value, !0), !0;
      },
      deleteProperty(f, l) {
        var o = n.get(l);
        if (o === void 0) {
          if (l in f) {
            const d = a(() =>                 se(k));
            n.set(l, d), Ye(i);
          }
        } else
          ue(o, k), Ye(i);
        return !0;
      },
      get(f, l, o) {
        if (l === gt)
          return e;
        var d = n.get(l), h = l in f;
        if (d === void 0 && (!h || qe(f, l)?.writable) && (d = a(() => {
          var v = je(h ? f[l] : k), u =                 se(v);
          return u;
        }), n.set(l, d)), d !== void 0) {
          var c = _(d);
          return c === k ? void 0 : c;
        }
        return Reflect.get(f, l, o);
      },
      getOwnPropertyDescriptor(f, l) {
        var o = Reflect.getOwnPropertyDescriptor(f, l);
        if (o && "value" in o) {
          var d = n.get(l);
          d && (o.value = _(d));
        } else if (o === void 0) {
          var h = n.get(l), c = h?.v;
          if (h !== void 0 && c !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: c,
              writable: !0
            };
        }
        return o;
      },
      has(f, l) {
        if (l === gt)
          return !0;
        var o = n.get(l), d = o !== void 0 && o.v !== k || Reflect.has(f, l);
        if (o !== void 0 || b !== null && (!d || qe(f, l)?.writable)) {
          o === void 0 && (o = a(() => {
            var c = d ? je(f[l]) : k, v =                 se(c);
            return v;
          }), n.set(l, o));
          var h = _(o);
          if (h === k)
            return !1;
        }
        return d;
      },
      set(f, l, o, d) {
        var h = n.get(l), c = l in f;
        if (r && l === "length")
          for (var v = o; v <                              
          h.v; v += 1) {
            var u = n.get(v + "");
            u !== void 0 ? ue(u, k) : v in f && (u = a(() =>                 se(k)), n.set(v + "", u));
          }
        if (h === void 0)
          (!c || qe(f, l)?.writable) && (h = a(() =>                 se(void 0)), ue(h, je(o)), n.set(l, h));
        else {
          c = h.v !== k;
          var p = a(() => je(o));
          ue(h, p);
        }
        var T = Reflect.getOwnPropertyDescriptor(f, l);
        if (T?.set && T.set.call(d, o), !c) {
          if (r && typeof l == "string") {
            var m = (
                                           
              n.get("length")
            ), w = Number(l);
            Number.isInteger(w) && w >= m.v && ue(m, w + 1);
          }
          Ye(i);
        }
        return !0;
      },
      ownKeys(f) {
        _(i);
        var l = Reflect.ownKeys(f).filter((h) => {
          var c = n.get(h);
          return c === void 0 || c.v !== k;
        });
        for (var [o, d] of n)
          d.v !== k && !(o in f) && l.push(o);
        return l;
      },
      setPrototypeOf() {
        wr();
      }
    }
  );
}
var Jt, On, Cn, Mn;
function Lr() {
  if (Jt === void 0) {
    Jt = window, On = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Cn = qe(t, "firstChild").get, Mn = qe(t, "nextSibling").get, Kt(e) && (e[kt] = void 0, e[vn] = null, e[sr] = void 0, e.__e = void 0), Kt(n) && (n[St] = void 0);
  }
}
function Pe(e = "") {
  return document.createTextNode(e);
}
                       
function Xe(e) {
  return (
                                      
    Cn.call(e)
  );
}
                       
function $e(e) {
  return (
                                      
    Mn.call(e)
  );
}
function Ot(e, t) {
  return                 Xe(e);
}
function Pr(e, t = !1) {
  {
    var n =                 Xe(e);
    return n instanceof Comment && n.data === "" ?                 $e(n) : n;
  }
}
function ke(e, t = !1) {
  return                 Xe(e);
}
function _e(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    $e(r);
  return r;
}
function Fr(e) {
  e.textContent = "";
}
function Dn() {
  return !1;
}
function Vr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ur(e) {
  var t = b;
  if (t === null)
    return y.f |= de, e;
  if ((t.f & Ve) === 0 && (t.f & Ke) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
  if (!(t !== null && (t.f & U) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & At) !== 0 && (t.f & (U | Nt)) === 0) {
        if ((t.f & Ve) === 0)
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
function Hr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ve(e, t) {
  var n = b;
  n !== null && (n.f & M) !== 0 && (e |= M);
  var r = {
    ctx: X,
    deps: null,
    nodes: null,
    f: e | I | j,
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
  if ((e & Ke) !== 0)
    Oe !== null ? Oe.push(r) : he.ensure().schedule(r);
  else if (t !== null) {
    try {
      Fe(r);
    } catch (a) {
      throw P(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Ue) === 0 && (i = i.first, (e & z) !== 0 && (e & De) !== 0 && i !== null && (i.f |= De));
  }
  if (i !== null && (i.parent = n, n !== null && Hr(i, n), y !== null && (y.f & x) !== 0 && (e & fe) === 0)) {
    var s = (
                            
      y
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Bt() {
  return y !== null && !W;
}
function Rn(e) {
  const t = ve(_t, null);
  return A(t, S), t.teardown = e, t;
}
function Gr(e) {
  return ve(Ke | rr, e);
}
function jr(e) {
  he.ensure();
  const t = ve(fe | Ue, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? we(t, () => {
      P(t), r(void 0);
    }) : (P(t), r(void 0));
  });
}
function Br(e) {
  return ve(Me | Ue, e);
}
function zr(e, t = 0) {
  return ve(_t | t, e);
}
function Ce(e, t = [], n = [], r = []) {
  Ar(r, t, n, (i) => {
    ve(_t, () => {
      e(...i.map(_));
    });
  });
}
function zt(e, t = 0) {
  var n = ve(z | t, e);
  return n;
}
function G(e) {
  return ve(K | Ue, e);
}
function Ln(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Te, r = y;
    Qt(!0), B(null);
    try {
      t.call(null);
    } catch (i) {
      $(i, e.parent);
    } finally {
      Qt(n), B(r);
    }
  }
}
function qt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Qe(() => {
      i.abort(Je);
    });
    var r = n.next;
    (n.f & fe) !== 0 ? n.parent = null : P(n, t), n = r;
  }
}
function qr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & K) === 0 && P(t), t = n;
  }
}
function P(e, t = !0) {
  var n = !1;
  (t || (e.f & nr) !== 0) && e.nodes !== null && e.nodes.end !== null && (Wr(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= Nt, qt(e, t && !n), Ze(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  Ln(e), e.f ^= Nt, e.f |= U;
  var i = e.parent;
  i !== null && i.first !== null && Pn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Wr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 $e(e);
    e.remove(), e = n;
  }
}
function Pn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function we(e, t, n = !0) {
  var r = [];
  e.f |= Lt, Fn(e, r, !0);
  var i = () => {
    n && P(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var f of r)
      f.out(a);
  } else
    i();
}
function Fn(e, t, n) {
  if ((e.f & M) === 0) {
    e.f ^= M;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const f of r)
        (f.is_global || n) && t.push(f);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & fe) === 0) {
        var a = (i.f & De) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & K) !== 0 && (e.f & z) !== 0;
        Fn(i, t, a ? n : !1);
      }
      i = s;
    }
  }
}
function ct(e) {
  e.f &= ~Lt, Vn(e, !0);
}
function Vn(e, t) {
  if ((e.f & Lt) === 0 && (e.f & M) !== 0) {
    e.f ^= M, (e.f & S) === 0 && (A(e, I), he.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & De) !== 0 || (n.f & K) !== 0;
      Vn(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function Wt(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 $e(n);
      t.append(n), n = i;
    }
}
let it = !1, Te = !1;
function Qt(e) {
  Te = e;
}
let y = null, W = !1;
function B(e) {
  y = e;
}
let b = null;
function ne(e) {
  b = e;
}
let te = null;
function Un(e) {
  y !== null && (te ??=                 new Set()).add(e);
}
let L = null, V = 0, H = null;
function Yr(e) {
  H = e;
}
let Hn = 1, me = 0, ye = me;
function $t(e) {
  ye = e;
}
function Gn() {
  return ++Hn;
}
function et(e) {
  var t = e.f;
  if ((t & I) !== 0)
    return !0;
  if (t & x && (e.f &= ~Ee), (t & Y) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (et(
                              
        s
      ) && Tn(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & j) !== 0 &&                                                                   
                                                                
    q === null && A(e, S);
  }
  return !1;
}
function jn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(te !== null && te.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & x) !== 0 ? jn(
                              
        s,
        t,
        !1
      ) : t === s && (n ? A(s, I) : (s.f & S) !== 0 && A(s, Y), jt(
                             
        s
      ));
    }
}
function Bn(e) {
  var t = L, n = V, r = H, i = y, s = te, a = X, f = W, l = ye, o = e.f;
  L =                              
  null, V = 0, H = null, y = (o & (K | fe)) === 0 ? e : null, te = null, Re(e.ctx), W = !1, ye = ++me, e.ac !== null && (Qe(() => {
    e.ac.abort(Je);
  }), e.ac = null);
  try {
    e.f |= at;
    var d = (
                             
      e.fn
    ), h = d();
    e.f |= Ve;
    var c = en(e);
    if (mn() && H !== null && !W && c !== null && (e.f & (x | Y | I)) === 0)
      for (var v = 0; v <                        
      H.length; v++)
        jn(
          H[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (me++, i.deps !== null)
        for (let u = 0; u < n; u += 1)
          i.deps[u].rv = me;
      if (t !== null)
        for (const u of t)
          u.rv = me;
      H !== null && (r === null ? r = H : r.push(...                       
      H));
    }
    return (e.f & de) !== 0 && (e.f ^= de), h;
  } catch (u) {
    return en(e), Ur(u);
  } finally {
    e.f ^= at, L = t, V = n, H = r, y = i, te = s, Re(a), W = f, ye = l;
  }
}
function en(e) {
  var t = e.deps, n = g?.is_fork;
  if (L !== null) {
    var r;
    if (n || Ze(e, V), t !== null && V > 0)
      for (t.length = V + L.length, r = 0; r < L.length; r++)
        t[V + r] = L[r];
    else
      e.deps = t = L;
    if (Bt() && (e.f & j) !== 0)
      for (r = V; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && V < t.length && (Ze(e, V), t.length = V);
  return t;
}
function Kr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Zn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & x) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (L === null || !st.call(L, t))) {
    var s = (
                            
      t
    );
    (s.f & j) !== 0 && (s.f ^= j, s.f &= ~Ee), s.v !== k && Vt(s), s.ac !== null && Qe(() => {
      s.ac.abort(Je), s.ac = null, A(s, I);
    }), xr(s), Ze(s, 0);
  }
}
function Ze(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Kr(e, n[r]);
}
function Fe(e) {
  var t = e.f;
  if ((t & U) === 0) {
    A(e, S);
    var n = b, r = it;
    b = e, it = (t & (K | fe)) === 0;
    try {
      (t & (z | dn)) !== 0 ? qr(e) : qt(e), Ln(e);
      var i = Bn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Hn;
      var s;
    } finally {
      it = r, b = n;
    }
  }
}
function _(e) {
  var t = e.f, n = (t & x) !== 0;
  if (y !== null && !W) {
    var r = b !== null && (b.f & U) !== 0;
    if (!r && (te === null || !te.has(e))) {
      var i = y.deps;
      if ((y.f & at) !== 0)
        e.rv < me && (e.rv = me, L === null && i !== null && i[V] === e ? V++ : L === null ? L = [e] : L.push(e));
      else {
        y.deps ??= [], st.call(y.deps, e) || y.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [y] : st.call(s, y) || s.push(y);
      }
    }
  }
  if (Te && ee.has(e))
    return ee.get(e);
  if (n) {
    var a = (
                            
      e
    );
    if (Te) {
      var f = a.v;
      return ((a.f & S) === 0 && a.reactions !== null || qn(a)) && (f = Ht(a)), ee.set(a, f), f;
    }
    var l = (a.f & j) === 0 && !W && y !== null && (it || (y.f & j) !== 0), o = (a.f & Ve) === 0;
    et(a) && (l && (a.f |= j), Tn(a)), l && !o && (An(a), zn(a));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & de) !== 0)
    throw e.v;
  return e.v;
}
function zn(e) {
  if (e.f |= j, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & x) !== 0 && (t.f & j) === 0 && (An(
                              
        t
      ), zn(
                              
        t
      ));
}
function qn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ee.has(t) || (t.f & x) !== 0 && qn(
                            
      t
    ))
      return !0;
  return !1;
}
function Xr(e) {
  var t = W;
  try {
    return W = !0, e();
  } finally {
    W = t;
  }
}
const Zr = ["touchstart", "touchmove"];
function Jr(e) {
  return Zr.includes(e);
}
const Be =                 Symbol("events"), Wn =                 new Set(), Ct =                 new Set();
function Qr(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || Mt.call(t, s), !s.cancelBubble)
      return Qe(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ce(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function $r(e, t, n, r, i) {
  var s = { capture: r, passive: i }, a = Qr(e, t, n, s);
  (t === document.body ||              
  t === window ||              
  t === document ||                                                                                                                     
  t instanceof HTMLMediaElement) && Rn(() => {
    t.removeEventListener(e, a, s);
  });
}
function tn(e, t, n) {
  (t[Be] ??= {})[e] = n;
}
function ei(e) {
  for (var t = 0; t < e.length; t++)
    Wn.add(e[t]);
  for (var n of Ct)
    n(e);
}
let yt = null, Et = !1;
function Mt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  yt = e, Et || (Et = !0, setTimeout(() => {
    Et = !1, yt = null;
  }));
  var a = 0, f = yt === e && e[Be];
  if (f) {
    var l = i.indexOf(f);
    if (l !== -1 && (t === document || t ===                   
    window)) {
      e[Be] = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    l <= o && (a = l);
  }
  if (s =                       
  i[a] || e.target, s !== t) {
    on(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var d = y, h = b;
    B(null), ne(null);
    try {
      for (var c, v = []; s !== null && s !== t; ) {
        try {
          var u = s[Be]?.[r];
          u != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && u.call(s, e);
        } catch (p) {
          c ? v.push(p) : c = p;
        }
        if (e.cancelBubble) break;
        a++, s = a < i.length ? (
                                
          i[a]
        ) : null;
      }
      if (c) {
        for (let p of v)
          queueMicrotask(() => {
            throw p;
          });
        throw c;
      }
    } finally {
      e[Be] = t, delete e.currentTarget, B(d), ne(h);
    }
  }
}
const ti = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function ni(e) {
  return (
                         
    ti?.createHTML(e) ?? e
  );
}
function ri(e) {
  var t = Vr("template");
  return t.innerHTML = ni(e.replaceAll("<!>", "<!---->")), t.content;
}
function nn(e, t) {
  var n = (
                         
    b
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function re(e, t) {
  var n = (t & or) !== 0, r = (t & ur) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = ri(s ? e : "<!>" + e), n || (i =                            
                    Xe(i)));
    var a = (
                                 
      r || On ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var f = (
                                   
                        Xe(a)
      ), l = (
                                   
        a.lastChild
      );
      nn(f, l);
    } else
      nn(a, a);
    return a;
  };
}
function Q(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function ii(e) {
  let t = 0, n = be(0), r;
  return () => {
    Bt() && (_(n), zr(() => (t === 0 && (r = Xr(() => e(() => Ye(n)))), t += 1, () => {
      ce(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Ye(n));
      });
    })));
  };
}
var si = De | Ue;
function li(e, t, n, r) {
  new ai(e, t, n, r);
}
class ai {
                                
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
                            
  #d =                 new Set();
                            
  #p =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #c = null;
  #w = ii(() => (this.#c = be(this.#_), () => {
    this.#c = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#f = (s) => {
      var a = (
                             
        b
      );
      a.b = this, a.f |= At, r(s);
    }, this.parent =                      
    b.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = zt(() => {
      this.#h();
    }, si);
  }
  #g() {
    try {
      this.#s = G(() => this.#f(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #E(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#y(t);
    ce(i), n && (this.#a = G(() => {
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
        hr();
        return;
      }
      n = !0, r && Er(), this.#a !== null && we(this.#a, () => {
        this.#a = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (a) {
        $(a, this.#r && this.#r.parent);
      }
    } };
  }
  #b() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = G(() => t(this.#t)), ce(() => {
      var n = this.#i = document.createDocumentFragment(), r = Pe(), i = !1;
      if (n.append(r), this.#s = this.#v(() => {
        try {
          return G(() => this.#f(r));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (a) {
            $(a, this.#r.parent);
          }
          return null;
        }
      }), this.#s === null) {
        this.#i = null, i && this.#m(
                              
          g
        );
        return;
      }
      this.#o === 0 && (this.#t.before(n), this.#i = null, we(
                             
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#m(
                            
        g
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#o = 0, this.#_ = 0, this.#s = G(() => {
        this.#f(this.#t);
      }), this.#o > 0) {
        var t = this.#i = document.createDocumentFragment();
        Wt(this.#s, t);
        const n = (
                                               
          this.#e.pending
        );
        this.#n = G(() => n(this.#t));
      } else
        this.#m(
                              
          g
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#p);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    En(t, this.#d, this.#p);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var n = b, r = y, i = X;
    ne(this.#r), B(this.#r), Re(this.#r.ctx);
    try {
      return he.ensure(), t();
    } finally {
      ne(n), B(r), Re(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #T(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#T(t, n);
      return;
    }
    this.#o += t, this.#o === 0 && (this.#m(n), this.#n && we(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#T(t, n), this.#_ += t, !(!this.#c || this.#u) && (this.#u = !0, ce(() => {
      this.#u = !1, this.#c && Le(this.#c, this.#_);
    }));
  }
  get_effect_pending() {
    return this.#w(), _(
                                   
      this.#c
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    g?.is_fork ? (this.#s && g.skip_effect(this.#s), this.#n && g.skip_effect(this.#n), this.#a && g.skip_effect(this.#a), g.oncommit(() => {
      this.#A(t);
    })) : this.#A(t);
  }
     
                           
     
  #A(t) {
    this.#s && (P(this.#s), this.#s = null), this.#n && (P(this.#n), this.#n = null), this.#a && (P(this.#a), this.#a = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: a } = this.#y(i);
      a(), n && (this.#a = this.#v(() => {
        try {
          return G(() => {
            var f = (
                                   
              b
            );
            f.b = this, f.f |= At, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (f) {
          return $(
            f,
                                 
            this.#r.parent
          ), null;
        }
      }));
    };
    ce(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        $(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (s) => $(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Se(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[St] ??= e.nodeValue) && (e[St] = n, e.nodeValue = `${n}`);
}
function fi(e, t) {
  return oi(e, t);
}
const tt =                 new Map();
function oi(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: f }) {
  Lr();
  var l = void 0, o = jr(() => {
    var d = n ?? t.appendChild(Pe());
    li(
                                 
      d,
      {
        pending: () => {
        }
      },
      (v) => {
        Pt({});
        var u = (
                                         
          X
        );
        s && (u.c = s), i && (r.$$events = i), l = e(v, r) || gn(), Ft();
      },
      f
    );
    var h =                 new Set(), c = (v) => {
      for (var u = 0; u < v.length; u++) {
        var p = v[u];
        if (!h.has(p)) {
          h.add(p);
          var T = Jr(p);
          for (const N of [t, document]) {
            var m = tt.get(N);
            m === void 0 && (m =                 new Map(), tt.set(N, m));
            var w = m.get(p);
            w === void 0 ? (N.addEventListener(p, Mt, { passive: T }), m.set(p, 1)) : m.set(p, w + 1);
          }
        }
      }
    };
    return c(vt(Wn)), Ct.add(c), () => {
      for (var v of h)
        for (const T of [t, document]) {
          var u = (
                                              
            tt.get(T)
          ), p = (
                                 
            u.get(v)
          );
          --p == 0 ? (T.removeEventListener(v, Mt), u.delete(v), u.size === 0 && tt.delete(T)) : u.set(v, p);
        }
      Ct.delete(c), d !== n && d.parentNode?.removeChild(d);
    };
  });
  return Dt.set(l, o), l;
}
let Dt =                 new WeakMap();
function ui(e, t) {
  const n = Dt.get(e);
  return n ? (Dt.delete(e), n(t)) : Promise.resolve();
}
class ci {
                             
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
        ct(r), this.#f.delete(n);
      else {
        var i = this.#e.get(n);
        i && (ct(i.effect), this.#l.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, a] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const f = this.#e.get(a);
        f && (P(f.effect), this.#e.delete(a));
      }
      for (const [s, a] of this.#l) {
        if (s === n || this.#f.has(s)) continue;
        const f = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var o = document.createDocumentFragment();
            Wt(a, o), o.append(Pe()), this.#e.set(s, { effect: a, fragment: o });
          } else
            P(a);
          this.#f.delete(s), this.#l.delete(s);
        };
        this.#r || !r ? (this.#f.add(s), we(a, f, !1)) : f();
      }
    }
  };
     
                         
     
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (P(i.effect), this.#e.delete(r));
  };
     
    
                     
                                                        
     
  ensure(t, n) {
    var r = (
                          
      g
    ), i = Dn();
    if (n && !this.#l.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = Pe();
        s.append(a), this.#e.set(t, {
          effect: G(() => n(a)),
          fragment: s
        });
      } else
        this.#l.set(
          t,
          G(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [f, l] of this.#l)
        f === t ? r.unskip_effect(l) : r.skip_effect(l);
      for (const [f, l] of this.#e)
        f === t ? r.unskip_effect(l.effect) : r.skip_effect(l.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function xe(e, t, n = !1) {
  var r = new ci(e), i = n ? De : 0;
  function s(a, f) {
    r.ensure(a, f);
  }
  zt(() => {
    var a = !1;
    t((f, l = 0) => {
      a = !0, s(l, f);
    }), a || s(-1, null);
  }, i);
}
function di(e, t, n) {
  for (var r = [], i = t.length, s, a = t.length, f = 0; f < i; f++) {
    let h = t[f];
    we(
      h,
      () => {
        if (s) {
          if (s.pending.delete(h), s.done.add(h), s.pending.size === 0) {
            var c = (
                                                
              e.outrogroups
            );
            Rt(e, vt(s.done)), c.delete(s), c.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var l = r.length === 0 && n !== null && e.pending.size === 0;
    if (l) {
      var o = (
                              
        n
      ), d = (
                              
        o.parentNode
      );
      Fr(d), d.append(o), e.items.clear();
    }
    Rt(e, t, !l);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function Rt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const a of e.pending.values())
      for (const f of a)
        r.add(
                                 
          e.items.get(f).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= ae;
      const a = document.createDocumentFragment();
      Wt(s, a);
    } else
      P(t[i], n);
  }
}
var rn;
function hi(e, t, n, r, i, s = null) {
  var a = e, f =                 new Map(), l = null, o =                 Sr(() => {
    var m = n();
    return (
                        
      fn(m) ? m : m == null ? [] : vt(m)
    );
  }), d, h =                 new Map(), c = !0;
  function v(m) {
    (T.effect.f & U) === 0 && (T.pending.delete(m), T.fallback = l, vi(T, d, a, t, r), l !== null && (d.length === 0 ? (l.f & ae) === 0 ? ct(l) : (l.f ^= ae, ze(l, null, a)) : we(l, () => {
      l = null;
    })));
  }
  function u(m) {
    T.pending.delete(m);
  }
  var p = zt(() => {
    d =                   
    _(o);
    for (var m = d.length, w =                 new Set(), N = (
                          
      g
    ), D = Dn(), O = 0; O < m; O += 1) {
      var Z = d[O], J = r(Z, O), E = c ? null : f.get(J);
      E ? (E.v && Le(E.v, Z), E.i && Le(E.i, O), D && N.unskip_effect(E.e)) : (E = _i(
        f,
        c ? a : rn ??= Pe(),
        Z,
        J,
        O,
        i,
        t,
        n
      ), c || (E.e.f |= ae), f.set(J, E)), w.add(J);
    }
    if (m === 0 && s && !l && (c ? l = G(() => s(a)) : (l = G(() => s(rn ??= Pe())), l.f |= ae)), m > w.size && pr(), !c)
      if (h.set(N, w), D) {
        for (const [F, Ae] of f)
          w.has(F) || N.skip_effect(Ae.e);
        N.oncommit(v), N.ondiscard(u);
      } else
        v(N);
    _(o);
  }), T = { effect: p, items: f, pending: h, outrogroups: null, fallback: l };
  c = !1;
}
function He(e) {
  for (; e !== null && (e.f & K) === 0; )
    e = e.next;
  return e;
}
function vi(e, t, n, r, i) {
  var s = t.length, a = e.items, f = He(e.effect.first), l, o = null, d = [], h = [], c, v, u, p;
  for (p = 0; p < s; p += 1) {
    if (c = t[p], v = i(c, p), u =                        
    a.get(v).e, e.outrogroups !== null)
      for (const E of e.outrogroups)
        E.pending.delete(u), E.done.delete(u);
    if ((u.f & M) !== 0 && ct(u), (u.f & ae) !== 0)
      if (u.f ^= ae, u === f)
        ze(u, null, n);
      else {
        var T = o ? o.next : f;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), oe(e, o, u), oe(e, u, T), ze(u, T, n), o = u, d = [], h = [], f = He(o.next);
        continue;
      }
    if (u !== f) {
      if (l !== void 0 && l.has(u)) {
        if (d.length < h.length) {
          var m = h[0], w;
          o = m.prev;
          var N = d[0], D = d[d.length - 1];
          for (w = 0; w < d.length; w += 1)
            ze(d[w], m, n);
          for (w = 0; w < h.length; w += 1)
            l.delete(h[w]);
          oe(e, N.prev, D.next), oe(e, o, N), oe(e, D, m), f = m, o = D, p -= 1, d = [], h = [];
        } else
          l.delete(u), ze(u, f, n), oe(e, u.prev, u.next), oe(e, u, o === null ? e.effect.first : o.next), oe(e, o, u), o = u;
        continue;
      }
      for (d = [], h = []; f !== null && f !== u; )
        (l ??=                 new Set()).add(f), h.push(f), f = He(f.next);
      if (f === null)
        continue;
    }
    (u.f & ae) === 0 && d.push(u), o = u, f = He(u.next);
  }
  if (e.outrogroups !== null) {
    for (const E of e.outrogroups)
      E.pending.size === 0 && (Rt(e, vt(E.done)), e.outrogroups?.delete(E));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (f !== null || l !== void 0) {
    var O = [];
    if (l !== void 0)
      for (u of l)
        (u.f & M) === 0 && O.push(u);
    for (; f !== null; )
      (f.f & M) === 0 && f !== e.fallback && O.push(f), f = He(f.next);
    var Z = O.length;
    if (Z > 0) {
      var J = null;
      di(e, O, J);
    }
  }
}
function _i(e, t, n, r, i, s, a, f) {
  var l = (a & lr) !== 0 ? (a & fr) === 0 ?                 Dr(n, !1, !1) : be(n) : null, o = (a & ar) !== 0 ? be(i) : null;
  return {
    v: l,
    i: o,
    e: G(() => (s(t, l ?? n, o ?? i, f), () => {
      e.delete(r);
    }))
  };
}
function ze(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & ae) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var a = (
                                   
                        $e(r)
      );
      if (s.before(r), r === i)
        return;
      r = a;
    }
}
function oe(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const sn = [...` 	
\r\f \v\uFEFF`];
function pi(e, t, n) {
  var r = e == null ? "" : "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var s = i.length, a = 0; (a = r.indexOf(i, a)) >= 0; ) {
          var f = a + s;
          (a === 0 || sn.includes(r[a - 1])) && (f === r.length || sn.includes(r[f])) ? r = (a === 0 ? "" : r.substring(0, a)) + r.substring(f + 1) : a = f;
        }
  }
  return r === "" ? null : r;
}
function bt(e, t, n, r, i, s) {
  var a = (
                      
    e[kt]
  );
  if (a !== n || a === void 0) {
    var f = pi(n, r, s);
    f == null ? e.removeAttribute("class") : e.className = f, e[kt] = n;
  } else if (s && i !== s)
    for (var l in s) {
      var o = !!s[l];
      (i == null || o !== !!i[l]) && e.classList.toggle(l, o);
    }
  return s;
}
const gi =                 Symbol("is custom element"), mi =                 Symbol("is html");
function pe(e, t, n, r) {
  var i = wi(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[ir] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && yi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function wi(e) {
  return (
                                                    
                      
    e[vn] ??= {
      [gi]: e.nodeName.includes("-"),
      [mi]: e.namespaceURI === cr
    }
  );
}
var ln =                 new Map();
function yi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = ln.get(t);
  if (n) return n;
  ln.set(t, n =                 new Set());
  for (var r, i = e, s = Element.prototype; s !== i; ) {
    r = Jn(i);
    for (var a in r)
      r[a].set &&                                                                                     
      a !== "innerHTML" && a !== "textContent" && a !== "innerText" && n.add(a);
    i = un(i);
  }
  return n;
}
const Ei = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(Ei);
const dt = 120, ht = 1200, bi = /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
function Ti(e) {
  const t = e?.status ?? "NOT_IN_SOURCE_MAP", n = !!e && ["EXACT", "EXISTING_VERIFIED"].includes(t) && typeof e.image == "string" && bi.test(e.image) && typeof e.spritePathId == "string" && e.spritePathId.length > 0;
  return { status: n ? t : ["EXACT", "EXISTING_VERIFIED"].includes(t) ? "UNKNOWN" : t, src: n ? "./" + e.image : null, spritePathId: n ? e.spritePathId : void 0 };
}
const Ie = (e) => typeof e == "string" && e.length > 0 && e.length <= 4096;
function an(e) {
  return e.kind === "slot-missing" ? "未保存（状態UNKNOWN）" : e.complete === !0 ? "達成済み" : e.complete === !1 ? "未達成" : "UNKNOWN";
}
function Ai(e) {
  return { status: an(e), aria: `${e.title}、${an(e)}、進捗 ${e.current ?? "UNKNOWN"}`, subtitle: e.kind === "account" ? e.guid : e.kind === "slot-missing" ? `${e.guid} · 保存レコードなし` : `${e.guid} · Document ${e.id} · 進捗 ${e.current}`, missing: e.kind === "slot-missing", unknown: !e.sourceKnown, done: e.complete === !0 };
}
function Ni(e) {
  return e.empty === "unreadable" ? "Achievement Domain UNKNOWN：保存済みモデルを認識できません。ゼロ件・未達成とは解釈しません。" : e.empty === "no-match" ? "条件に一致する記録がありません。" : "セーブを読み込むと記録が表示されます。";
}
function Yn(e) {
  if (!e || !Array.isArray(e.rows) || !Number.isSafeInteger(e.total) || e.total < 0 || !Number.isSafeInteger(e.limit) || e.limit < dt || e.limit % dt !== 0 || e.rows.length !== Math.min(e.total, e.limit) || e.limit > ht || e.rows.length > ht || !(e.selectedGuid === null || Ie(e.selectedGuid)) || !["unloaded", "no-match", "unreadable"].includes(e.empty)) throw Error("ACHIEVEMENT_SNAPSHOT_INVALID");
  const t =                 new Set();
  for (const n of e.rows) {
    if (!n || !Ie(n.guid) || !Ie(n.title) || !["account", "slot", "slot-missing"].includes(n.kind) || typeof n.sourceKnown != "boolean" || !(n.complete === null || typeof n.complete == "boolean") || !(n.current === null || Ie(n.current)) || !(n.id === null || Ie(n.id)) || typeof n.imageEnabled != "boolean" || typeof n.externalUnknown != "boolean" || n.image != null && (!Ie(n.image.status) || n.image.image != null && typeof n.image.image != "string" || n.image.spritePathId != null && typeof n.image.spritePathId != "string") || t.has(n.guid) || n.kind === "slot-missing" && (!n.sourceKnown || n.complete !== null || n.current !== null || n.id !== null) || n.kind === "slot" && n.id === null) throw Error("ACHIEVEMENT_ROW_INVALID");
    t.add(n.guid);
  }
  return e;
}
function ki(e) {
  const t = () => Yn(e.read());
  return { read: t, select(n) {
    if (!t().rows.some((r) => r.guid === n)) throw Error("ACHIEVEMENT_NOT_VISIBLE");
    try {
      if (e.selectGuid(n), t().selectedGuid !== n) throw Error("ACHIEVEMENT_SELECTION_POSTCONDITION");
    } finally {
      e.invalidate?.();
    }
  }, more() {
    const n = t();
    if (n.total <= n.limit) throw Error("ACHIEVEMENT_NO_MORE");
    if (n.limit + dt > ht) throw Error("ACHIEVEMENT_VIEW_LIMIT");
    try {
      e.showMore();
      const r = t();
      if (r.limit !== n.limit + dt || r.selectedGuid !== n.selectedGuid || r.total !== n.total) throw Error("ACHIEVEMENT_PAGE_POSTCONDITION");
    } finally {
      e.invalidate?.();
    }
  } };
}
var Si =                 re('<img alt="" width="40" height="40" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>'), Ii =                 re('<span class="media-null-mark" aria-hidden="true">—</span>'), xi =                 re('<span class="media-thumb media-achievement" data-image-kind="achievement"><!></span>');
function Oi(e, t) {
  Pt(t, !0);
  const n =                 ot(() => Ti(t.image));
  let r =                 se(null);
  const i =                 ot(() => _(n).src !== null && _(r) === _(n).src);
  var s = xi(), a = Ot(s);
  {
    var f = (o) => {
      var d = Si();
      Ce(() => {
        pe(d, "src", _(n).src), pe(d, "data-sprite-path-id", _(n).spritePathId);
      }), $r("error", d, () => ue(r, _(n).src, !0)), Q(o, d);
    }, l = (o) => {
      var d = Ii();
      Q(o, d);
    };
    xe(a, (o) => {
      _(n).src && !_(i) ? o(f) : o(l, -1);
    });
  }
  Ce(() => {
    pe(s, "data-image-status", _(i) ? "LOAD_FAILED" : _(n).status), pe(s, "aria-label", _(n).src && !_(i) ? "実績画像" : "実績画像：画像未確定"), pe(s, "title", _(n).src && !_(i) ? "実績画像" : "実績画像：" + (_(i) ? "LOAD_FAILED" : _(n).status));
  }), Q(e, s), Ft();
}
var Ci =                 re('<p class="placeholder"> </p>'), Mi =                 re("<div> </div>"), Di =                 re('<small class="unknown-tag">名称未照合・保存済みレコード</small>'), Ri =                 re('<small class="media-caption">外部画像 UNKNOWN</small>'), Li =                 re('<button type="button"><!> <div class="ach-text"><strong> </strong><small> </small><!><!></div> <span> </span></button>'), Pi =                 re('<button type="button" class="btn-secondary show-more"> </button>'), Fi =                 re("<!> <!> <!>", 1);
function Vi(e, t) {
  Pt(t, !0);
  var n = Fi(), r = Pr(n);
  {
    var i = (l) => {
      var o = Ci(), d = ke(o, !0);
      Ce((h) => Se(d, h), [() => Ni(t.snapshot)]), Q(l, o);
    };
    xe(r, (l) => {
      t.snapshot.rows.length === 0 && l(i);
    });
  }
  var s = _e(r, 2);
  hi(s, 17, () => t.snapshot.rows, (l) => l.guid, (l, o) => {
    const d =                 ot(() => Ai(_(o)));
    var h = Li();
    let c;
    var v = Ot(h);
    {
      var u = (R) => {
        {
          let ie =                 ot(() => _(o).image ?? null);
          Oi(R, {
            get image() {
              return _(ie);
            }
          });
        }
      }, p = (R) => {
        var ie = Mi();
        let Yt;
        var Xn = ke(ie, !0);
        Ce(() => {
          Yt = bt(ie, 1, "ach-symbol", null, Yt, { done: _(d).done }), Se(Xn, _(d).done ? "✓" : "☆");
        }), Q(R, ie);
      };
      xe(v, (R) => {
        _(o).imageEnabled ? R(u) : R(p, -1);
      });
    }
    var T = _e(v, 2), m = Ot(T), w = ke(m, !0), N = _e(m), D = ke(N, !0), O = _e(N);
    {
      var Z = (R) => {
        var ie = Di();
        Q(R, ie);
      };
      xe(O, (R) => {
        _(d).unknown && R(Z);
      });
    }
    var J = _e(O);
    {
      var E = (R) => {
        var ie = Ri();
        Q(R, ie);
      };
      xe(J, (R) => {
        _(o).kind === "account" && _(o).externalUnknown && R(E);
      });
    }
    var F = _e(T, 2);
    let Ae;
    var pt = ke(F, !0);
    Ce(() => {
      c = bt(h, 1, "achievement-row", null, c, {
        selected: _(o).guid === t.snapshot.selectedGuid,
        "missing-record": _(d).missing,
        "unknown-identity": _(d).unknown
      }), pe(h, "data-achievement-guid", _(o).guid), pe(h, "aria-label", _(d).aria), Se(w, _(o).title), Se(D, _(d).subtitle), Ae = bt(F, 1, "status-dot", null, Ae, { complete: _(d).done }), Se(pt, _(d).status);
    }), tn("click", h, () => t.port.select(_(o).guid)), Q(l, h);
  });
  var a = _e(s, 2);
  {
    var f = (l) => {
      var o = Pi(), d = ke(o);
      Ce(() => Se(d, `さらに表示（残り ${t.snapshot.total - t.snapshot.limit}件）`)), tn("click", o, () => t.port.more()), Q(l, o);
    };
    xe(a, (l) => {
      t.snapshot.total > t.snapshot.limit && l(f);
    });
  }
  Q(e, n), Ft();
}
ei(["click"]);
const C = (e) => {
  if (!e) throw Error("PRODUCT_ACH_LIST_CONTRACT");
};
function Kn(e) {
  const t = Array.from(e.attributes).filter((r) => r.name !== "data-achievement-guid" && !(r.name === "class" && !r.value)).map((r) => [r.name, r.value]).sort((r, i) => r[0].localeCompare(i[0])), n = Array.from(e.children);
  return [e.tagName, t, n.length ? Array.from(e.childNodes).filter((r) => r.nodeType === 3 && r.textContent?.trim()).map((r) => r.textContent) : e.textContent, n.map(Kn)];
}
const Tt = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function nt(e, t, n = !1) {
  C(e.tagName === "DIV" && e.id === "achievementsList" && e.className === "achievement-list");
  const r = t.total > t.limit, i = Array.from(e.children);
  C(i.length === (t.rows.length || 1) + Number(r));
  const s =                 new Map();
  t.rows.length || C(i[0].tagName === "P" && i[0].className === "placeholder");
  for (const [f, l] of t.rows.entries()) {
    const o = i[f];
    C(o.tagName === "BUTTON" && o.type === "button" && o.classList.contains("achievement-row") && o.classList.contains("selected") === (l.guid === t.selectedGuid) && (!n || o.getAttribute("data-achievement-guid") === l.guid)), s.set(l.guid, o);
  }
  const a = r ? i.at(-1) : null;
  return a && C(a.tagName === "BUTTON" && a.type === "button" && a.className === "btn-secondary show-more" && !a.disabled), { buttons: s, next: a, signature: i.map(Kn) };
}
function Ui(e, t) {
  let n = null, r = null, i = 0, s = !1, a = !1, f = !1;
  const l = (c) => {
    const v = e.querySelectorAll('[id="achievementsList"]');
    return v.length === 1 && v[0] === c;
  }, o = (c) => {
    try {
      c();
    } catch {
    }
  };
  function d() {
    r = null;
    const c = n;
    if (c) {
      if (n = null, !l(c.candidate)) {
        f = !0, c.candidate.parentElement || o(c.dispose);
        return;
      }
      try {
        c.candidate.replaceWith(c.legacy), C(l(c.legacy));
      } catch {
        f = !0;
        return;
      }
      o(c.dispose);
    }
  }
  function h(c, v) {
    if (f || a || n || !l(c)) return "LEGACY_RETAINED";
    let u, p;
    try {
      p = Yn(v), p = Object.freeze({ ...p, rows: Object.freeze(p.rows.map((E) => Object.freeze({ ...E, image: E.image ? Object.freeze({ ...E.image }) : E.image }))) }), u = nt(c, p), r = p, i++;
    } catch {
      return r = null, "LEGACY_RETAINED";
    }
    if (p.limit >= ht && p.total > p.limit) return "LEGACY_RETAINED";
    const T = c.parentElement, m = {}, w = c.cloneNode(!1);
    w.setAttribute("data-hkia-svelte-achievements", "1");
    const N = [...u.buttons].find(([, E]) => e.activeElement === E)?.[0];
    let D, O = !1;
    function Z(E) {
      C(!s && n?.token === m && l(w)), s = !0;
      const F = i;
      try {
        E.click(), C(i > F);
      } finally {
        s = !1;
      }
    }
    const J = ki({ read() {
      return C(r !== null), r;
    }, selectGuid(E) {
      const F = u.buttons.get(E);
      C(F), Z(F);
    }, showMore() {
      C(u.next), Z(u.next);
    } });
    a = !0;
    try {
      D = t(w, p, J), C(typeof D == "function");
      const E = nt(w, p, !0);
      C(Tt(u.signature, E.signature));
      const F = nt(c, p);
      return C(r === p && l(c) && c.parentElement === T && Tt(F.signature, u.signature) && F.next === u.next && [...u.buttons].every(([Ae, pt]) => F.buttons.get(Ae) === pt)), c.replaceWith(w), O = !0, C(l(w) && w.parentElement === T && Tt(nt(w, p, !0).signature, u.signature)), n = { legacy: c, candidate: w, dispose: D, token: m }, N && E.buttons.get(N)?.focus(), "MOUNTED";
    } catch {
      if (n = null, O)
        try {
          w.replaceWith(c), C(l(c)), N && u.buttons.get(N)?.focus();
        } catch {
          f = !0;
        }
      return D && o(D), "LEGACY_RETAINED";
    } finally {
      a = !1;
    }
  }
  return { restore: d, render: h };
}
function Gi(e) {
  return Ui(e, (t, n, r) => {
    const i = fi(Vi, { target: t, props: { snapshot: n, port: r } }), s = () => {
      ui(i).catch(() => {
      });
    };
    try {
      Cr();
    } catch (a) {
      throw s(), a;
    }
    return s;
  });
}
export {
  Gi as createProductAchievementListBridge
};
