var Bt = Array.isArray, Cn = Array.prototype.indexOf, Ze = Array.prototype.includes, rt = Array.from, Vt = Object.defineProperty, De = Object.getOwnPropertyDescriptor, On = Object.prototype, Rn = Array.prototype, Dn = Object.getPrototypeOf, Rt = Object.isExtensible;
const Mn = () => {
};
function Pn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Yt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const T = 2, Fe = 4, it = 8, Kt = 1 << 24, j = 16, Y = 32, $ = 64, ht = 128, bt = 256, L = 512, A = 1024, x = 2048, V = 4096, S = 8192, M = 16384, Ae = 32768, dt = 1 << 25, we = 65536, Qe = 1 << 17, Fn = 1 << 18, xe = 1 << 19, In = 1 << 20, Q = 1 << 25, ce = 65536, $e = 1 << 21, ye = 1 << 22, ne = 1 << 23, lt =                 Symbol("$state"), Gt =                 Symbol("component"), Ln =                 Symbol("attributes"), Un =                 Symbol("class"), Hn =                 Symbol("style"), vt =                 Symbol("text"), Ue = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), jn = 1, qn = 2, zn = 16, Bn = 1, Vn = 2, k =                 Symbol("uninitialized");
function Yn() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Kn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Wt(e) {
  return e === this.v;
}
function Gn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Jt(e) {
  return !Gn(e, this.v);
}
function Wn() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Jn(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Xn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Zn() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Qn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function $n() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function er() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let K = null;
function be(e) {
  K = e;
}
function Xt(e, t = !1, n) {
  K = {
    p: K,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
                           
      m
    ),
    l: null
  };
}
function Zt(e) {
  var t = (
                                   
    K
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      br(r);
  }
  return t.i = !0, K = t.p, Qt(e);
}
function Qt(e = {}) {
  return Vt(e, Gt, { value: !0 }), e;
}
function $t() {
  return !0;
}
let le = [];
function en() {
  var e = le;
  le = [], Pn(e);
}
function fe(e) {
  if (le.length === 0 && !Me) {
    var t = le;
    queueMicrotask(() => {
      t === le && en();
    });
  }
  le.push(e);
}
function tr() {
  for (; le.length > 0; )
    en();
}
const nr = -7169;
function b(e, t) {
  e.f = e.f & nr | t;
}
function Et(e) {
  (e.f & L) !== 0 || e.deps === null ? b(e, A) : b(e, V);
}
function tn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & T) === 0 || (t.f & ce) === 0 || (t.f ^= ce, tn(
                              
        t.deps
      ));
}
function nn(e, t, n) {
  (e.f & x) !== 0 ? t.add(e) : (e.f & V) !== 0 && n.add(e), tn(e.deps), b(e, A);
}
function st(e) {
  var t = g, n = m;
  U(null), X(null);
  try {
    return e();
  } finally {
    U(t), X(n);
  }
}
function rr(e, t, n, r) {
  const i = sn;
  var s = e.filter((v) => !v.settled), u = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(u);
    return;
  }
  var l = (
                         
    m
  ), f = ir(), a = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function o(v) {
    if ((l.f & M) === 0) {
      f();
      try {
        r([...u, ...v]);
      } catch (c) {
        G(c, l);
      }
      et();
    }
  }
  var h = rn();
  if (n.length === 0) {
    a.then(() => o([])).finally(h);
    return;
  }
  function d() {
    Promise.all(n.map((v) =>                 sr(v))).then(o).catch((v) => G(v, l)).finally(h);
  }
  a ? a.then(() => {
    f(), d(), et();
  }) : d();
}
function ir() {
  var e = (
                         
    m
  ), t = g, n = K, r = (
                        
    p
  );
  return function(s = !0) {
    X(e), U(t), be(n), s && (e.f & M) === 0 && (r?.activate(), r?.apply());
  };
}
function et(e = !0) {
  X(null), U(null), be(null), e && p?.deactivate();
}
function rn() {
  var e = (
                         
    m
  ), t = e.b, n = (
                        
    p
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function sn(e) {
  var t = T | x;
  return m !== null && (m.f |= xe), {
    ctx: K,
    deps: null,
    effects: null,
    equals: Wt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      k
    ),
    wv: 0,
    parent: m,
    ac: null
  };
}
const Ce =                 Symbol("obsolete");
                       
function sr(e, t, n) {
  let r = (
                                
    m
  );
  r === null && Wn();
  var i = (
                             
                          
    void 0
  ), s = he(
                    
    k
  ), u = !g, l =                 new Set();
  return kr(() => {
    var f = (
                           
      m
    ), a = Yt();
    i = a.promise;
    try {
      Promise.resolve(e()).then(a.resolve, (v) => {
        v !== Ue && a.reject(v);
      }).finally(et);
    } catch (v) {
      a.reject(v), et();
    }
    var o = (
                          
      p
    );
    if (u) {
      if ((f.f & Ae) !== 0)
        var h = rn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        o.async_deriveds.get(f)?.reject(Ce);
      else
        for (const v of l.values())
          v.reject(Ce);
      l.add(a), o.async_deriveds.set(f, a);
    }
    const d = (v, c = void 0) => {
      h?.(), l.delete(a), c !== Ce && (o.activate(), c ? (s.f |= ne, Ee(s, c)) : ((s.f & ne) !== 0 && (s.f ^= ne), Ee(s, v)), o.deactivate());
    };
    a.promise.then(d, (v) => d(null, v || "unknown"));
  }), wr(() => {
    for (const f of l)
      f.reject(Ce);
  }), new Promise((f) => {
    function a(o) {
      function h() {
        o === i ? f(s) : a(i);
      }
      o.then(h, h);
    }
    a(i);
  });
}
                       
function lr(e) {
  const t =                 sn(e);
  return t.equals = Jt, t;
}
function fr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      O(
                             
        t[n]
      );
  }
}
function kt(e) {
  var t, n = m, r = e.parent;
  if (!ve && r !== null && e.v !== k &&                                                                                                      
  (r.f & (M | S)) !== 0)
    return Yn(), e.v;
  X(r);
  try {
    e.f &= ~ce, fr(e), t = An(e);
  } finally {
    X(n);
  }
  return t;
}
function ln(e) {
  var t = kt(e);
  if (!e.equals(t) && (e.wv = En(), (!p?.is_fork || e.deps === null) && (p !== null ? (p.capture(e, t, !0), _t?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    b(e, A);
    return;
  }
  ve || (q !== null ? (Tt() || p?.is_fork) && q.set(e, t) : Et(e));
}
function ur(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
        t.ac.abort(Ue), t.ac = null;
      }), t.fn !== null && (t.teardown = Mn), Le(t, 0), St(t));
}
function fn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && ke(t);
}
let ft = null, ge = null, p = null, _t = null, q = null, pt = null, Me = !1, ut = !1, me = null, Je = null;
var Dt = 0;
let ar = 1;
class re {
  id = ar++;
                                              
  #t = !1;
  linked = !0;
                             
  #l = null;
                             
  #e = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #u =                 new Set();
     
                                                                                     
                                        
     
  #r =                 new Set();
     
                                                             
     
  #s = 0;
     
                                                                                
                                
     
  #n =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #f = null;
     
                                             
                     
     
  #i = [];
     
                                                 
                     
     
  #_ = [];
     
                                                                               
                        
     
  #a =                 new Set();
     
                                          
                        
     
  #o =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #h =                 new Map();
     
                                                                                                    
                        
     
  #p =                 new Set();
  is_fork = !1;
  #c = !1;
  constructor() {
    ge === null ? ft = ge = this : (ge.#e = this, this.#l = ge), ge = this;
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
    this.#h.has(t) || this.#h.set(t, { d: [], m: [] }), this.#p.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#h.get(t);
    if (r) {
      this.#h.delete(t);
      for (var i of r.d)
        b(i, x), n(i);
      for (i of r.m)
        b(i, V), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#t = !0, Dt++ > 1e3 && (this.#v(), cr());
    for (const f of this.#a)
      this.#o.delete(f), b(f, x), this.schedule(f);
    for (const f of this.#o)
      b(f, V), this.schedule(f);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = me = [], r = [], i = Je = [];
    for (const f of t)
      try {
        this.#b(f, n, r);
      } catch (a) {
        throw on(f), this.#y() || this.discard(), a;
      }
    if (p = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (me = null, Je = null, this.#y()) {
      this.#d(r), this.#d(n);
      for (const [f, a] of this.#h)
        an(f, a);
      i.length > 0 &&                       
      p.#g();
      return;
    }
    const u = this.#w();
    if (u) {
      this.#d(r), this.#d(n), u.#E(this);
      return;
    }
    this.#a.clear(), this.#o.clear();
    for (const f of this.#u) f(this);
    this.#u.clear(), _t = this, Mt(r), Mt(n), _t = null, this.#f?.resolve();
    var l = (
                                 
                            
      p
    );
    if (this.#s === 0 && (this.#i.length === 0 || l !== null) && this.#v(), this.#i.length > 0)
      if (l !== null) {
        const f = l;
        f.#i.push(...this.#i.filter((a) => !f.#i.includes(a)));
      } else
        l = this;
    l !== null && (W.clear(), l.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #b(t, n, r) {
    t.f ^= A;
    for (var i = t.first; i !== null; ) {
      var s = i.f, u = (s & (Y | $)) !== 0, l = u && (s & A) !== 0, f = l || (s & S) !== 0 || this.#h.has(i);
      if (!f && i.fn !== null) {
        u ? i.f ^= A : (s & Fe) !== 0 ? n.push(i) : je(i) && ((s & j) !== 0 && this.#o.add(i), ke(i));
        var a = i.first;
        if (a !== null) {
          i = a;
          continue;
        }
      }
      for (; i !== null; ) {
        var o = i.next;
        if (o !== null) {
          i = o;
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
    t.async_deriveds.clear(), this.transfer_effects(t.#a, t.#o);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & T) !== 0 && (r.f & (x | V)) === 0))
        for (const l of i) {
          var s = l.f;
          if ((s & T) !== 0)
            n(
                                    
              l
            );
          else {
            var u = (
                                   
              l
            );
            s & (ye | j) && !this.async_deriveds.has(u) && (this.#o.delete(u), b(u, x), this.schedule(u));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), p = this, this.#g();
  }
     
                              
     
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      nn(t[n], this.#a, this.#o);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== k && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & ne) === 0 && (this.current.set(t, [n, r]), q?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    p = this;
  }
  deactivate() {
    p = null, q = null;
  }
  flush() {
    try {
      ut = !0, p = this, this.#g();
    } finally {
      Dt = 0, pt = null, me = null, Je = null, ut = !1, p = null, q = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Ce);
    this.#v(), this.#f?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#_.push(t);
  }
  #m() {
    for (let h = ft; h !== null; h = h.#e) {
      var t = h.id < this.id, n = [];
      for (const [d, [v, c]] of this.current) {
        if (h.current.has(d)) {
          var r = (
                                         
            h.current.get(d)[0]
          );
          if (t && v !== r)
            h.current.set(d, [v, c]);
          else
            continue;
        }
        n.push(d);
      }
      if (t)
        for (const [d, v] of this.async_deriveds) {
          const c = h.async_deriveds.get(d);
          c && v.promise.then(c.resolve).catch(c.reject);
        }
      var i = [...h.current.keys()].filter(
        (d) => !                             
        h.current.get(d)[1]
      );
      if (!(!h.#t || i.length === 0)) {
        var s = i.filter((d) => !this.current.has(d));
        if (s.length === 0)
          t && h.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#p)
              h.unskip_effect(d, (v) => {
                (v.f & (j | ye)) !== 0 ? h.schedule(v) : h.#d([v]);
              });
          h.activate();
          var u =                 new Set(), l =                 new Map();
          for (var f of n)
            un(f, s, u, l);
          l =                 new Map();
          var a = [...h.current].filter(([d, v]) => {
            const c = this.current.get(d);
            return c ? c[0] !== v[0] || c[1] !== v[1] : !0;
          }).map(([d]) => d);
          if (a.length > 0)
            for (const d of this.#_)
              (d.f & (M | S | Qe)) === 0 && At(d, a, l) && ((d.f & (ye | j)) !== 0 ? (b(d, x), h.schedule(d)) : h.#a.add(d));
          if (h.#i.length > 0 && !h.#c) {
            h.apply();
            for (var o of h.#i)
              h.#b(o, [], []);
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
    this.#c || (this.#c = !0, fe(() => {
      this.#c = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, n) {
    for (const r of t)
      this.#a.add(r);
    for (const r of n)
      this.#o.add(r);
    t.clear(), n.clear();
  }
                                           
  oncommit(t) {
    this.#u.add(t);
  }
                                           
  ondiscard(t) {
    this.#r.add(t);
  }
  settled() {
    return (this.#f ??= Yt()).promise;
  }
  static ensure() {
    if (p === null) {
      const t = p = new re();
      !ut && !Me && fe(() => {
        t.#t || t.flush();
      });
    }
    return p;
  }
  apply() {
    {
      q = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (pt = t, t.b?.is_pending && (t.f & (Fe | it | Kt)) !== 0 && (t.f & Ae) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (me !== null && n === m && (g === null || (g.f & T) === 0))
        return;
      if ((r & ($ | Y)) !== 0) {
        if ((r & A) === 0)
          return;
        n.f ^= A;
      }
    }
    this.#i.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#l, n = this.#e;
      t === null ? ft = n : t.#e = n, n === null ? ge = t : n.#l = t, this.linked = !1;
    }
  }
}
function or(e) {
  var t = Me;
  Me = !0;
  try {
    for (var n; ; ) {
      if (tr(), p === null)
        return (
                          
          n
        );
      p.flush();
    }
  } finally {
    Me = t;
  }
}
function cr() {
  try {
    Xn();
  } catch (e) {
    G(e, pt);
  }
}
let Z = null;
function Mt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (M | S)) === 0 && je(r) && (Z =                 new Set(), ke(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && mn(r), Z?.size > 0)) {
        W.clear();
        for (const i of Z) {
          if ((i.f & (M | S)) !== 0) continue;
          const s = [i];
          let u = i.parent;
          for (; u !== null; )
            Z.has(u) && (Z.delete(u), s.push(u)), u = u.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (M | S)) === 0 && ke(f);
          }
        }
        Z.clear();
      }
    }
    Z = null;
  }
}
function un(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & T) !== 0 ? un(
                              
        i,
        t,
        n,
        r
      ) : (s & (ye | j)) !== 0 && (s & x) === 0 && At(i, t, r) && (b(i, x), xt(
                             
        i
      ));
    }
}
function At(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Ze.call(t, i))
        return !0;
      if ((i.f & T) !== 0 && At(
                              
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
function xt(e) {
  p.schedule(e);
}
function an(e, t) {
  if (!((e.f & Y) !== 0 && (e.f & A) !== 0)) {
    (e.f & x) !== 0 ? t.d.push(e) : (e.f & V) !== 0 && t.m.push(e), b(e, A);
    for (var n = e.first; n !== null; )
      an(n, t), n = n.next;
  }
}
function on(e) {
  b(e, A);
  for (var t = e.first; t !== null; )
    on(t), t = t.next;
}
let tt =                 new Set();
const W =                 new Map();
let cn = !1;
function he(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: Wt,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function ee(e, t) {
  const n = he(e);
  return Nr(n), n;
}
                       
function hr(e, t = !1, n = !0) {
  const r = he(e);
  return t || (r.equals = Jt), r;
}
function se(e, t, n = !1) {
  g !== null &&                                                                                         
                                                                
  (!z || (g.f & Qe) !== 0) && $t() && (g.f & (T | j | ye | Qe)) !== 0 && (J === null || !J.has(e)) && $n();
  let r = n ? Oe(t) : t;
  return Ee(e, r, Je);
}
function Ee(e, t, n = null) {
  if (!e.equals(t)) {
    ve ? W.set(e, t) : W.has(e) || W.set(e, e.v);
    var r = re.ensure();
    if (r.capture(e, t), (e.f & T) !== 0) {
      const i = (
                              
        e
      );
      (e.f & x) !== 0 && kt(i), q === null && Et(i);
    }
    e.wv = En(), hn(e, x, n), m !== null && (m.f & A) !== 0 && (m.f & (Y | $)) === 0 && (P === null ? Sr([e]) : P.push(e)), !r.is_fork && tt.size > 0 && !cn && dr();
  }
  return t;
}
function dr() {
  cn = !1;
  for (const e of tt) {
    (e.f & A) !== 0 && b(e, V);
    let t;
    try {
      t = je(e);
    } catch {
      t = !0;
    }
    t && ke(e);
  }
  tt.clear();
}
function Pe(e) {
  se(e, e.v + 1);
}
function hn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var u = r[s], l = u.f, f = (l & x) === 0;
      if (f && b(u, t), (l & Qe) !== 0)
        tt.add(
                               
          u
        );
      else if ((l & T) !== 0) {
        var a = (
                                
          u
        );
        q?.delete(a), (l & ce) === 0 && (l & L && (m === null || (m.f & $e) === 0) && (u.f |= ce), hn(a, V, n));
      } else if (f) {
        var o = (
                               
          u
        );
        (l & j) !== 0 && Z !== null && Z.add(o), n !== null ? n.push(o) : xt(o);
      }
    }
}
function Oe(e) {
  if (typeof e != "object" || e === null || lt in e || Gt in e)
    return e;
  const t = Dn(e);
  if (t !== On && t !== Rn)
    return e;
  var n =                 new Map(), r = Bt(e), i =                 ee(0), s = oe, u = (l) => {
    if (oe === s)
      return l();
    var f = g, a = oe;
    U(null), Ut(s);
    var o = l();
    return U(f), Ut(a), o;
  };
  return r && n.set("length",                 ee(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(l, f, a) {
        (!("value" in a) || a.configurable === !1 || a.enumerable === !1 || a.writable === !1) && Zn();
        var o = n.get(f);
        return o === void 0 ? u(() => {
          var h =                 ee(a.value);
          return n.set(f, h), h;
        }) : se(o, a.value, !0), !0;
      },
      deleteProperty(l, f) {
        var a = n.get(f);
        if (a === void 0) {
          if (f in l) {
            const o = u(() =>                 ee(k));
            n.set(f, o), Pe(i);
          }
        } else
          se(a, k), Pe(i);
        return !0;
      },
      get(l, f, a) {
        if (f === lt)
          return e;
        var o = n.get(f), h = f in l;
        if (o === void 0 && (!h || De(l, f)?.writable) && (o = u(() => {
          var v = Oe(h ? l[f] : k), c =                 ee(v);
          return c;
        }), n.set(f, o)), o !== void 0) {
          var d = B(o);
          return d === k ? void 0 : d;
        }
        return Reflect.get(l, f, a);
      },
      getOwnPropertyDescriptor(l, f) {
        var a = Reflect.getOwnPropertyDescriptor(l, f);
        if (a && "value" in a) {
          var o = n.get(f);
          o && (a.value = B(o));
        } else if (a === void 0) {
          var h = n.get(f), d = h?.v;
          if (h !== void 0 && d !== k)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return a;
      },
      has(l, f) {
        if (f === lt)
          return !0;
        var a = n.get(f), o = a !== void 0 && a.v !== k || Reflect.has(l, f);
        if (a !== void 0 || m !== null && (!o || De(l, f)?.writable)) {
          a === void 0 && (a = u(() => {
            var d = o ? Oe(l[f]) : k, v =                 ee(d);
            return v;
          }), n.set(f, a));
          var h = B(a);
          if (h === k)
            return !1;
        }
        return o;
      },
      set(l, f, a, o) {
        var h = n.get(f), d = f in l;
        if (r && f === "length")
          for (var v = a; v <                              
          h.v; v += 1) {
            var c = n.get(v + "");
            c !== void 0 ? se(c, k) : v in l && (c = u(() =>                 ee(k)), n.set(v + "", c));
          }
        if (h === void 0)
          (!d || De(l, f)?.writable) && (h = u(() =>                 ee(void 0)), se(h, Oe(a)), n.set(f, h));
        else {
          d = h.v !== k;
          var w = u(() => Oe(a));
          se(h, w);
        }
        var y = Reflect.getOwnPropertyDescriptor(l, f);
        if (y?.set && y.set.call(o, a), !d) {
          if (r && typeof f == "string") {
            var _ = (
                                           
              n.get("length")
            ), E = Number(f);
            Number.isInteger(E) && E >= _.v && se(_, E + 1);
          }
          Pe(i);
        }
        return !0;
      },
      ownKeys(l) {
        B(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var d = n.get(h);
          return d === void 0 || d.v !== k;
        });
        for (var [a, o] of n)
          o.v !== k && !(a in l) && f.push(a);
        return f;
      },
      setPrototypeOf() {
        Qn();
      }
    }
  );
}
var Pt, dn, vn, _n;
function vr() {
  if (Pt === void 0) {
    Pt = window, dn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    vn = De(t, "firstChild").get, _n = De(t, "nextSibling").get, Rt(e) && (e[Un] = void 0, e[Ln] = null, e[Hn] = void 0, e.__e = void 0), Rt(n) && (n[vt] = void 0);
  }
}
function de(e = "") {
  return document.createTextNode(e);
}
                       
function Ie(e) {
  return (
                                      
    vn.call(e)
  );
}
                       
function He(e) {
  return (
                                      
    _n.call(e)
  );
}
function _r(e, t) {
  return                 Ie(e);
}
function Ft(e, t = !1) {
  {
    var n =                 Ie(e);
    return n instanceof Comment && n.data === "" ?                 He(n) : n;
  }
}
function qe(e, t = !1) {
  return                 Ie(e);
}
function It(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    He(r);
  return r;
}
function pr(e) {
  e.textContent = "";
}
function pn() {
  return !1;
}
function gr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function mr(e) {
  var t = m;
  if (t === null)
    return g.f |= ne, e;
  if ((t.f & Ae) === 0 && (t.f & Fe) === 0)
    throw e;
  G(e, t);
}
function G(e, t) {
  if (!(t !== null && (t.f & M) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ht) !== 0 && (t.f & (M | dt)) === 0) {
        if ((t.f & Ae) === 0)
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
function yr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = m;
  n !== null && (n.f & S) !== 0 && (e |= S);
  var r = {
    ctx: K,
    deps: null,
    nodes: null,
    f: e | x | L,
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
  p?.register_created_effect(r);
  var i = r;
  if ((e & Fe) !== 0)
    me !== null ? me.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      ke(r);
    } catch (u) {
      throw O(r), u;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & xe) === 0 && (i = i.first, (e & j) !== 0 && (e & we) !== 0 && i !== null && (i.f |= we));
  }
  if (i !== null && (i.parent = n, n !== null && yr(i, n), g !== null && (g.f & T) !== 0 && (e & $) === 0)) {
    var s = (
                            
      g
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Tt() {
  return g !== null && !z;
}
function wr(e) {
  const t = ie(it, null);
  return b(t, A), t.teardown = e, t;
}
function br(e) {
  return ie(Fe | In, e);
}
function Er(e) {
  re.ensure();
  const t = ie($ | xe, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ae(t, () => {
      O(t), r(void 0);
    }) : (O(t), r(void 0));
  });
}
function kr(e) {
  return ie(ye | xe, e);
}
function Ar(e, t = 0) {
  return ie(it | t, e);
}
function at(e, t = [], n = [], r = []) {
  rr(r, t, n, (i) => {
    ie(it, () => {
      e(...i.map(B));
    });
  });
}
function Nt(e, t = 0) {
  var n = ie(j | t, e);
  return n;
}
function I(e) {
  return ie(Y | xe, e);
}
function gn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ve, r = g;
    Lt(!0), U(null);
    try {
      t.call(null);
    } catch (i) {
      G(i, e.parent);
    } finally {
      Lt(n), U(r);
    }
  }
}
function St(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && st(() => {
      i.abort(Ue);
    });
    var r = n.next;
    (n.f & $) !== 0 ? n.parent = null : O(n, t), n = r;
  }
}
function xr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & Y) === 0 && O(t), t = n;
  }
}
function O(e, t = !0) {
  var n = !1;
  (t || (e.f & Fn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Tr(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= dt, St(e, t && !n), Le(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  gn(e), e.f ^= dt, e.f |= M;
  var i = e.parent;
  i !== null && i.first !== null && mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Tr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 He(e);
    e.remove(), e = n;
  }
}
function mn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ae(e, t, n = !0) {
  var r = [];
  e.f |= bt, yn(e, r, !0);
  var i = () => {
    n && O(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var u = () => --s || i();
    for (var l of r)
      l.out(u);
  } else
    i();
}
function yn(e, t, n) {
  if ((e.f & S) === 0) {
    e.f ^= S;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & $) === 0) {
        var u = (i.f & we) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & Y) !== 0 && (e.f & j) !== 0;
        yn(i, t, u ? n : !1);
      }
      i = s;
    }
  }
}
function nt(e) {
  e.f &= ~bt, wn(e, !0);
}
function wn(e, t) {
  if ((e.f & bt) === 0 && (e.f & S) !== 0) {
    e.f ^= S, (e.f & A) === 0 && (b(e, x), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & we) !== 0 || (n.f & Y) !== 0;
      wn(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const u of s)
        (u.is_global || t) && u.in();
  }
}
function Ct(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 He(n);
      t.append(n), n = i;
    }
}
let Xe = !1, ve = !1;
function Lt(e) {
  ve = e;
}
let g = null, z = !1;
function U(e) {
  g = e;
}
let m = null;
function X(e) {
  m = e;
}
let J = null;
function Nr(e) {
  g !== null && (J ??=                 new Set()).add(e);
}
let C = null, D = 0, P = null;
function Sr(e) {
  P = e;
}
let bn = 1, ue = 0, oe = ue;
function Ut(e) {
  oe = e;
}
function En() {
  return ++bn;
}
function je(e) {
  var t = e.f;
  if ((t & x) !== 0)
    return !0;
  if (t & T && (e.f &= ~ce), (t & V) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (je(
                              
        s
      ) && ln(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & L) !== 0 &&                                                                   
                                                                
    q === null && b(e, A);
  }
  return !1;
}
function kn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(J !== null && J.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & T) !== 0 ? kn(
                              
        s,
        t,
        !1
      ) : t === s && (n ? b(s, x) : (s.f & A) !== 0 && b(s, V), xt(
                             
        s
      ));
    }
}
function An(e) {
  var t = C, n = D, r = P, i = g, s = J, u = K, l = z, f = oe, a = e.f;
  C =                              
  null, D = 0, P = null, g = (a & (Y | $)) === 0 ? e : null, J = null, be(e.ctx), z = !1, oe = ++ue, e.ac !== null && (st(() => {
    e.ac.abort(Ue);
  }), e.ac = null);
  try {
    e.f |= $e;
    var o = (
                             
      e.fn
    ), h = o();
    e.f |= Ae;
    var d = Ht(e);
    if ($t() && P !== null && !z && d !== null && (e.f & (T | V | x)) === 0)
      for (var v = 0; v <                        
      P.length; v++)
        kn(
          P[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (ue++, i.deps !== null)
        for (let c = 0; c < n; c += 1)
          i.deps[c].rv = ue;
      if (t !== null)
        for (const c of t)
          c.rv = ue;
      P !== null && (r === null ? r = P : r.push(...                       
      P));
    }
    return (e.f & ne) !== 0 && (e.f ^= ne), h;
  } catch (c) {
    return Ht(e), mr(c);
  } finally {
    e.f ^= $e, C = t, D = n, P = r, g = i, J = s, be(u), z = l, oe = f;
  }
}
function Ht(e) {
  var t = e.deps, n = p?.is_fork;
  if (C !== null) {
    var r;
    if (n || Le(e, D), t !== null && D > 0)
      for (t.length = D + C.length, r = 0; r < C.length; r++)
        t[D + r] = C[r];
    else
      e.deps = t = C;
    if (Tt() && (e.f & L) !== 0)
      for (r = D; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && D < t.length && (Le(e, D), t.length = D);
  return t;
}
function Cr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Cn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & T) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (C === null || !Ze.call(C, t))) {
    var s = (
                            
      t
    );
    (s.f & L) !== 0 && (s.f ^= L, s.f &= ~ce), s.v !== k && Et(s), s.ac !== null && st(() => {
      s.ac.abort(Ue), s.ac = null, b(s, x);
    }), ur(s), Le(s, 0);
  }
}
function Le(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Cr(e, n[r]);
}
function ke(e) {
  var t = e.f;
  if ((t & M) === 0) {
    b(e, A);
    var n = m, r = Xe;
    m = e, Xe = (t & (Y | $)) === 0;
    try {
      (t & (j | Kt)) !== 0 ? xr(e) : St(e), gn(e);
      var i = An(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = bn;
      var s;
    } finally {
      Xe = r, m = n;
    }
  }
}
function B(e) {
  var t = e.f, n = (t & T) !== 0;
  if (g !== null && !z) {
    var r = m !== null && (m.f & M) !== 0;
    if (!r && (J === null || !J.has(e))) {
      var i = g.deps;
      if ((g.f & $e) !== 0)
        e.rv < ue && (e.rv = ue, C === null && i !== null && i[D] === e ? D++ : C === null ? C = [e] : C.push(e));
      else {
        g.deps ??= [], Ze.call(g.deps, e) || g.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [g] : Ze.call(s, g) || s.push(g);
      }
    }
  }
  if (ve && W.has(e))
    return W.get(e);
  if (n) {
    var u = (
                            
      e
    );
    if (ve) {
      var l = u.v;
      return ((u.f & A) === 0 && u.reactions !== null || Tn(u)) && (l = kt(u)), W.set(u, l), l;
    }
    var f = (u.f & L) === 0 && !z && g !== null && (Xe || (g.f & L) !== 0), a = (u.f & Ae) === 0;
    je(u) && (f && (u.f |= L), ln(u)), f && !a && (fn(u), xn(u));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & ne) !== 0)
    throw e.v;
  return e.v;
}
function xn(e) {
  if (e.f |= L, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & T) !== 0 && (t.f & L) === 0 && (fn(
                              
        t
      ), xn(
                              
        t
      ));
}
function Tn(e) {
  if (e.v === k) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & T) !== 0 && Tn(
                            
      t
    ))
      return !0;
  return !1;
}
function Or(e) {
  var t = z;
  try {
    return z = !0, e();
  } finally {
    z = t;
  }
}
const Rr = ["touchstart", "touchmove"];
function Dr(e) {
  return Rr.includes(e);
}
const ze =                 Symbol("events"), Mr =                 new Set(), jt =                 new Set();
let ot = null, ct = !1;
function qt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  ot = e, ct || (ct = !0, setTimeout(() => {
    ct = !1, ot = null;
  }));
  var u = 0, l = ot === e && e[ze];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t ===                   
    window)) {
      e[ze] = t;
      return;
    }
    var a = i.indexOf(t);
    if (a === -1)
      return;
    f <= a && (u = f);
  }
  if (s =                       
  i[u] || e.target, s !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var o = g, h = m;
    U(null), X(null);
    try {
      for (var d, v = []; s !== null && s !== t; ) {
        try {
          var c = s[ze]?.[r];
          c != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && c.call(s, e);
        } catch (w) {
          d ? v.push(w) : d = w;
        }
        if (e.cancelBubble) break;
        u++, s = u < i.length ? (
                                
          i[u]
        ) : null;
      }
      if (d) {
        for (let w of v)
          queueMicrotask(() => {
            throw w;
          });
        throw d;
      }
    } finally {
      e[ze] = t, delete e.currentTarget, U(o), X(h);
    }
  }
}
const Pr = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function Fr(e) {
  return (
                         
    Pr?.createHTML(e) ?? e
  );
}
function Ir(e) {
  var t = gr("template");
  return t.innerHTML = Fr(e.replaceAll("<!>", "<!---->")), t.content;
}
function gt(e, t) {
  var n = (
                         
    m
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function Ot(e, t) {
  var n = (t & Bn) !== 0, r = (t & Vn) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = Ir(s ? e : "<!>" + e), n || (i =                            
                    Ie(i)));
    var u = (
                                 
      r || dn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var l = (
                                   
                        Ie(u)
      ), f = (
                                   
        u.lastChild
      );
      gt(l, f);
    } else
      gt(u, u);
    return u;
  };
}
function Lr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = de();
  return e.append(t, n), gt(t, n), e;
}
function Be(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function Ur(e) {
  let t = 0, n = he(0), r;
  return () => {
    Tt() && (B(n), Ar(() => (t === 0 && (r = Or(() => e(() => Pe(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Pe(n));
      });
    })));
  };
}
var Hr = we | xe;
function jr(e, t, n, r) {
  new qr(e, t, n, r);
}
class qr {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #t;
                                    
  #l = null;
                              
  #e;
                                         
  #u;
                       
  #r;
                              
  #s = null;
                              
  #n = null;
                              
  #f = null;
                                        
  #i = null;
  #_ = 0;
  #a = 0;
  #o = !1;
                            
  #h =                 new Set();
                            
  #p =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #c = null;
  #y = Ur(() => (this.#c = he(this.#_), () => {
    this.#c = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#u = (s) => {
      var u = (
                             
        m
      );
      u.b = this, u.f |= ht, r(s);
    }, this.parent =                      
    m.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = Nt(() => {
      this.#d();
    }, Hr);
  }
  #g() {
    try {
      this.#s = I(() => this.#u(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #b(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#w(t);
    fe(i), n && (this.#f = I(() => {
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
        Kn();
        return;
      }
      n = !0, r && er(), this.#f !== null && ae(this.#f, () => {
        this.#f = null;
      }), this.#v(() => {
        this.#d();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (u) {
        G(u, this.#r && this.#r.parent);
      }
    } };
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = I(() => t(this.#t)), fe(() => {
      var n = this.#i = document.createDocumentFragment(), r = de(), i = !1;
      if (n.append(r), this.#s = this.#v(() => {
        try {
          return I(() => this.#u(r));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (u) {
            G(u, this.#r.parent);
          }
          return null;
        }
      }), this.#s === null) {
        this.#i = null, i && this.#m(
                              
          p
        );
        return;
      }
      this.#a === 0 && (this.#t.before(n), this.#i = null, ae(
                             
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#m(
                            
        p
      ));
    }));
  }
  #d() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#a = 0, this.#_ = 0, this.#s = I(() => {
        this.#u(this.#t);
      }), this.#a > 0) {
        var t = this.#i = document.createDocumentFragment();
        Ct(this.#s, t);
        const n = (
                                               
          this.#e.pending
        );
        this.#n = I(() => n(this.#t));
      } else
        this.#m(
                              
          p
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#p);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    nn(t, this.#h, this.#p);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var n = m, r = g, i = K;
    X(this.#r), U(this.#r), be(this.#r.ctx);
    try {
      return re.ensure(), t();
    } finally {
      X(n), U(r), be(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #k(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#k(t, n);
      return;
    }
    this.#a += t, this.#a === 0 && (this.#m(n), this.#n && ae(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#k(t, n), this.#_ += t, !(!this.#c || this.#o) && (this.#o = !0, fe(() => {
      this.#o = !1, this.#c && Ee(this.#c, this.#_);
    }));
  }
  get_effect_pending() {
    return this.#y(), B(
                                   
      this.#c
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    p?.is_fork ? (this.#s && p.skip_effect(this.#s), this.#n && p.skip_effect(this.#n), this.#f && p.skip_effect(this.#f), p.oncommit(() => {
      this.#A(t);
    })) : this.#A(t);
  }
     
                           
     
  #A(t) {
    this.#s && (O(this.#s), this.#s = null), this.#n && (O(this.#n), this.#n = null), this.#f && (O(this.#f), this.#f = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: u } = this.#w(i);
      u(), n && (this.#f = this.#v(() => {
        try {
          return I(() => {
            var l = (
                                   
              m
            );
            l.b = this, l.f |= ht, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (l) {
          return G(
            l,
                                 
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
        G(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (s) => G(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Ve(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[vt] ??= e.nodeValue) && (e[vt] = n, e.nodeValue = `${n}`);
}
function zr(e, t) {
  return Br(e, t);
}
const Ye =                 new Map();
function Br(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: u = !0, transformError: l }) {
  vr();
  var f = void 0, a = Er(() => {
    var o = n ?? t.appendChild(de());
    jr(
                                 
      o,
      {
        pending: () => {
        }
      },
      (v) => {
        Xt({});
        var c = (
                                         
          K
        );
        s && (c.c = s), i && (r.$$events = i), f = e(v, r) || Qt(), Zt();
      },
      l
    );
    var h =                 new Set(), d = (v) => {
      for (var c = 0; c < v.length; c++) {
        var w = v[c];
        if (!h.has(w)) {
          h.add(w);
          var y = Dr(w);
          for (const R of [t, document]) {
            var _ = Ye.get(R);
            _ === void 0 && (_ =                 new Map(), Ye.set(R, _));
            var E = _.get(w);
            E === void 0 ? (R.addEventListener(w, qt, { passive: y }), _.set(w, 1)) : _.set(w, E + 1);
          }
        }
      }
    };
    return d(rt(Mr)), jt.add(d), () => {
      for (var v of h)
        for (const y of [t, document]) {
          var c = (
                                              
            Ye.get(y)
          ), w = (
                                 
            c.get(v)
          );
          --w == 0 ? (y.removeEventListener(v, qt), c.delete(v), c.size === 0 && Ye.delete(y)) : c.set(v, w);
        }
      jt.delete(d), o !== n && o.parentNode?.removeChild(o);
    };
  });
  return mt.set(f, a), f;
}
let mt =                 new WeakMap();
function Vr(e, t) {
  const n = mt.get(e);
  return n ? (mt.delete(e), n(t)) : Promise.resolve();
}
class Yr {
                             
  anchor;
                                
  #t =                 new Map();
     
                                                                   
                                                                      
             
        
                    
         
            
         
          
        
                                                                 
                             
     
  #l =                 new Map();
     
                                                                                          
                                                     
                             
     
  #e =                 new Map();
     
                                                
                     
     
  #u =                 new Set();
     
                                                                     
                                             
     
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
        nt(r), this.#u.delete(n);
      else {
        var i = this.#e.get(n);
        i && (nt(i.effect), this.#l.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, u] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const l = this.#e.get(u);
        l && (O(l.effect), this.#e.delete(u));
      }
      for (const [s, u] of this.#l) {
        if (s === n || this.#u.has(s)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var a = document.createDocumentFragment();
            Ct(u, a), a.append(de()), this.#e.set(s, { effect: u, fragment: a });
          } else
            O(u);
          this.#u.delete(s), this.#l.delete(s);
        };
        this.#r || !r ? (this.#u.add(s), ae(u, l, !1)) : l();
      }
    }
  };
     
                         
     
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (O(i.effect), this.#e.delete(r));
  };
     
    
                     
                                                        
     
  ensure(t, n) {
    var r = (
                          
      p
    ), i = pn();
    if (n && !this.#l.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), u = de();
        s.append(u), this.#e.set(t, {
          effect: I(() => n(u)),
          fragment: s
        });
      } else
        this.#l.set(
          t,
          I(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, f] of this.#l)
        l === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [l, f] of this.#e)
        l === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function Kr(e, t, n = !1) {
  var r = new Yr(e), i = n ? we : 0;
  function s(u, l) {
    r.ensure(u, l);
  }
  Nt(() => {
    var u = !1;
    t((l, f = 0) => {
      u = !0, s(f, l);
    }), u || s(-1, null);
  }, i);
}
function Gr(e, t, n) {
  for (var r = [], i = t.length, s, u = t.length, l = 0; l < i; l++) {
    let h = t[l];
    ae(
      h,
      () => {
        if (s) {
          if (s.pending.delete(h), s.done.add(h), s.pending.size === 0) {
            var d = (
                                                
              e.outrogroups
            );
            yt(e, rt(s.done)), d.delete(s), d.size === 0 && (e.outrogroups = null);
          }
        } else
          u -= 1;
      },
      !1
    );
  }
  if (u === 0) {
    var f = r.length === 0 && n !== null && e.pending.size === 0;
    if (f) {
      var a = (
                              
        n
      ), o = (
                              
        a.parentNode
      );
      pr(o), o.append(a), e.items.clear();
    }
    yt(e, t, !f);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function yt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const u of e.pending.values())
      for (const l of u)
        r.add(
                                 
          e.items.get(l).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= Q;
      const u = document.createDocumentFragment();
      Ct(s, u);
    } else
      O(t[i], n);
  }
}
var zt;
function Wr(e, t, n, r, i, s = null) {
  var u = e, l =                 new Map(), f = null, a =                 lr(() => {
    var _ = n();
    return (
                        
      Bt(_) ? _ : _ == null ? [] : rt(_)
    );
  }), o, h =                 new Map(), d = !0;
  function v(_) {
    (y.effect.f & M) === 0 && (y.pending.delete(_), y.fallback = f, Jr(y, o, u, t, r), f !== null && (o.length === 0 ? (f.f & Q) === 0 ? nt(f) : (f.f ^= Q, Re(f, null, u)) : ae(f, () => {
      f = null;
    })));
  }
  function c(_) {
    y.pending.delete(_);
  }
  var w = Nt(() => {
    o =                   
    B(a);
    for (var _ = o.length, E =                 new Set(), R = (
                          
      p
    ), _e = pn(), H = 0; H < _; H += 1) {
      var Te = o[H], pe = r(Te, H), N = d ? null : l.get(pe);
      N ? (N.v && Ee(N.v, Te), N.i && Ee(N.i, H), _e && R.unskip_effect(N.e)) : (N = Xr(
        l,
        d ? u : zt ??= de(),
        Te,
        pe,
        H,
        i,
        t,
        n
      ), d || (N.e.f |= Q), l.set(pe, N)), E.add(pe);
    }
    if (_ === 0 && s && !f && (d ? f = I(() => s(u)) : (f = I(() => s(zt ??= de())), f.f |= Q)), _ > E.size && Jn(), !d)
      if (h.set(R, E), _e) {
        for (const [Nn, Sn] of l)
          E.has(Nn) || R.skip_effect(Sn.e);
        R.oncommit(v), R.ondiscard(c);
      } else
        v(R);
    B(a);
  }), y = { effect: w, items: l, pending: h, outrogroups: null, fallback: f };
  d = !1;
}
function Ne(e) {
  for (; e !== null && (e.f & Y) === 0; )
    e = e.next;
  return e;
}
function Jr(e, t, n, r, i) {
  var s = t.length, u = e.items, l = Ne(e.effect.first), f, a = null, o = [], h = [], d, v, c, w;
  for (w = 0; w < s; w += 1) {
    if (d = t[w], v = i(d, w), c =                        
    u.get(v).e, e.outrogroups !== null)
      for (const N of e.outrogroups)
        N.pending.delete(c), N.done.delete(c);
    if ((c.f & S) !== 0 && nt(c), (c.f & Q) !== 0)
      if (c.f ^= Q, c === l)
        Re(c, null, n);
      else {
        var y = a ? a.next : l;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), te(e, a, c), te(e, c, y), Re(c, y, n), a = c, o = [], h = [], l = Ne(a.next);
        continue;
      }
    if (c !== l) {
      if (f !== void 0 && f.has(c)) {
        if (o.length < h.length) {
          var _ = h[0], E;
          a = _.prev;
          var R = o[0], _e = o[o.length - 1];
          for (E = 0; E < o.length; E += 1)
            Re(o[E], _, n);
          for (E = 0; E < h.length; E += 1)
            f.delete(h[E]);
          te(e, R.prev, _e.next), te(e, a, R), te(e, _e, _), l = _, a = _e, w -= 1, o = [], h = [];
        } else
          f.delete(c), Re(c, l, n), te(e, c.prev, c.next), te(e, c, a === null ? e.effect.first : a.next), te(e, a, c), a = c;
        continue;
      }
      for (o = [], h = []; l !== null && l !== c; )
        (f ??=                 new Set()).add(l), h.push(l), l = Ne(l.next);
      if (l === null)
        continue;
    }
    (c.f & Q) === 0 && o.push(c), a = c, l = Ne(c.next);
  }
  if (e.outrogroups !== null) {
    for (const N of e.outrogroups)
      N.pending.size === 0 && (yt(e, rt(N.done)), e.outrogroups?.delete(N));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var H = [];
    if (f !== void 0)
      for (c of f)
        (c.f & S) === 0 && H.push(c);
    for (; l !== null; )
      (l.f & S) === 0 && l !== e.fallback && H.push(l), l = Ne(l.next);
    var Te = H.length;
    if (Te > 0) {
      var pe = null;
      Gr(e, H, pe);
    }
  }
}
function Xr(e, t, n, r, i, s, u, l) {
  var f = (u & jn) !== 0 ? (u & zn) === 0 ?                 hr(n, !1, !1) : he(n) : null, a = (u & qn) !== 0 ? he(i) : null;
  return {
    v: f,
    i: a,
    e: I(() => (s(t, f ?? n, a ?? i, l), () => {
      e.delete(r);
    }))
  };
}
function Re(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & Q) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var u = (
                                   
                        He(r)
      );
      if (s.before(r), r === i)
        return;
      r = u;
    }
}
function te(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const Zr = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(Zr);
var Qr =                 Ot("<p> </p>"), $r =                 Ot('<div class="detail-line"><b> </b><span> </span></div>'), ei =                 Ot("<h4> </h4> <!>", 1);
function ti(e, t) {
  Xt(t, !0);
  var n = ei(), r = Ft(n), i = qe(r, !0), s = It(r, 2);
  {
    var u = (f) => {
      var a = Qr(), o = qe(a, !0);
      at(() => Ve(o, t.header.empty)), Be(f, a);
    }, l = (f) => {
      var a = Lr(), o = Ft(a);
      Wr(o, 17, () => t.header.lines, (h) => h.label, (h, d) => {
        var v = $r(), c = _r(v), w = qe(c, !0), y = It(c), _ = qe(y, !0);
        at(() => {
          Ve(w, B(d).label), Ve(_, B(d).value);
        }), Be(h, v);
      }), Be(f, a);
    };
    Kr(s, (f) => {
      t.header.empty !== null ? f(u) : f(l, -1);
    });
  }
  at(() => Ve(i, t.header.title)), Be(e, n), Zt();
}
const ni = "一覧から実績を選択してください。";
function ri(e) {
  return [
    { label: "GUID", value: e.guid },
    { label: "定義照合", value: e.mapped ? "照合済み" : "UNKNOWN（名称未照合）" },
    { label: "状態", value: e.kind === "slot-missing" ? "未保存（状態UNKNOWN）" : e.complete === !0 ? "達成済み" : e.complete === !1 ? "未達成" : "UNKNOWN" },
    { label: "進捗", value: e.current === null ? "UNKNOWN（保存値なし）" : e.current },
    { label: "達成日時", value: e.kind === "slot-missing" ? "UNKNOWN（保存値なし）" : e.completed === null ? "未設定" : e.completed === void 0 ? "UNKNOWN" : e.completed }
  ];
}
const Ke = "data-hkia-svelte-achievement-header", ii = ["GUID", "定義照合", "状態", "進捗", "達成日時"], Ge = (e) => typeof e == "string" && e.length > 0 && e.length <= 8192, F = (e) => {
  if (!e) throw Error("PRODUCT_ACH_HEADER_CONTRACT");
}, We = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function wt(e) {
  const t = Array.from(e.attributes).filter((r) => !(r.name === "class" && !r.value)).map((r) => [r.name, r.value]).sort((r, i) => r[0].localeCompare(i[0])), n = Array.from(e.children);
  return [e.tagName, t, n.length ? Array.from(e.childNodes).filter((r) => r.nodeType === 3 && r.textContent?.trim()).map((r) => r.textContent) : e.textContent, n.map(wt)];
}
function Se(e, t) {
  if (F(e.length === (t.empty ? 2 : 6) && e[0].tagName === "H4" && e[0].textContent === t.title), t.empty)
    return F(e[1].tagName === "P" && e[1].textContent === t.empty), e.map(wt);
  for (let n = 0; n < 5; n++) {
    const r = e[n + 1], i = t.lines[n];
    F(r.tagName === "DIV" && r.className === "detail-line" && r.children.length === 2 && r.children[0].tagName === "B" && r.children[1].tagName === "SPAN" && r.children[0].textContent === i.label && r.children[1].textContent === i.value);
  }
  return e.map(wt);
}
function si(e, t) {
  let n = !1;
  const r = (i) => i?.tagName === "ASIDE" && i.id === "editorPanel" && e.querySelectorAll('[id="editorPanel"]').length === 1 && e.getElementById("editorPanel") === i;
  return { render(i, s, u) {
    if (n || !r(i) || i.hasAttribute(Ke)) return "LEGACY_RETAINED";
    n = !0;
    let l, f = !1, a = [];
    try {
      F(s && typeof u == "function" && Ge(s.title) && Array.isArray(s.lines));
      const o = Object.freeze({ guid: s.guid, title: s.title, empty: s.empty, lines: Object.freeze(s.lines.map((y) => Object.freeze({ label: y.label, value: y.value }))) });
      F(o.guid === null ? Ge(o.empty) && o.lines.length === 0 : Ge(o.guid) && o.empty === null && o.lines.length === 5 && o.lines.every((y, _) => y.label === ii[_] && Ge(y.value)) && o.lines[0].value === o.guid), F(u() === o.guid), a = Array.from(i.children), F(i.childNodes.length === a.length);
      const h = Se(a, o), d = e.createElement("div");
      l = t(d, o), F(typeof l == "function");
      const v = Array.from(d.children);
      F(We(Se(v, o), h));
      const c = v.map((y) => y.cloneNode(!0));
      F(We(Se(c, o), h));
      const w = l;
      return l = void 0, w(), F(r(i) && u() === o.guid && !i.hasAttribute(Ke) && i.childNodes.length === a.length && a.every((y, _) => i.children[_] === y) && We(Se(a, o), h)), f = !0, i.replaceChildren(...c), F(r(i) && c.every((y, _) => i.children[_] === y) && We(Se(Array.from(i.children), o), h)), i.setAttribute(Ke, "1"), "MOUNTED";
    } catch {
      if (f && r(i))
        try {
          i.replaceChildren(...a), i.removeAttribute(Ke);
        } catch {
        }
      if (l)
        try {
          l();
        } catch {
        }
      return "LEGACY_RETAINED";
    } finally {
      n = !1;
    }
  } };
}
function fi(e) {
  const t = si(e, (n, r) => {
    const i = zr(ti, { target: n, props: { header: r } }), s = () => {
      Vr(i).catch(() => {
      });
    };
    try {
      or();
    } catch (u) {
      throw s(), u;
    }
    return s;
  });
  return { render(n, r, i) {
    const s = r === null ? { guid: null, title: "達成記録の詳細", empty: ni, lines: [] } : { guid: r.guid, title: r.title, empty: null, lines: ri(r) };
    return t.render(n, s, i);
  } };
}
export {
  fi as createProductAchievementHeader
};
