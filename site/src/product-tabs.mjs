var qt = Array.isArray, Un = Array.prototype.indexOf, Ke = Array.prototype.includes, Qe = Array.from, Vt = Object.defineProperty, Ie = Object.getOwnPropertyDescriptor, zn = Object.getOwnPropertyDescriptors, Gn = Object.prototype, Bn = Array.prototype, Yt = Object.getPrototypeOf, St = Object.isExtensible;
const qn = () => {
};
function Vn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function Kt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const C = 2, Pe = 4, Je = 8, Wt = 1 << 24, j = 16, q = 32, J = 64, ot = 128, mt = 256, L = 512, A = 1024, S = 2048, G = 4096, O = 8192, M = 16384, ke = 32768, ft = 1 << 25, Le = 65536, We = 1 << 17, Yn = 1 << 18, Ae = 1 << 19, Kn = 1 << 20, Q = 1 << 25, ce = 65536, $e = 1 << 21, me = 1 << 22, ne = 1 << 23, nt =                 Symbol("$state"), $t =                 Symbol("component"), Wn =                 Symbol(""), Xt =                 Symbol("attributes"), ct =                 Symbol("class"), $n =                 Symbol("style"), ut =                 Symbol("text"), je = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Xn = 1, Zn = 2, Qn = 16, Jn = 2, T =                 Symbol("uninitialized"), er = "http://www.w3.org/1999/xhtml";
function tr() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function nr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Zt(e) {
  return e === this.v;
}
function rr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Qt(e) {
  return !rr(e, this.v);
}
function ir() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ar(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function lr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function sr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function or() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function fr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function cr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let V = null;
function ye(e) {
  V = e;
}
function Jt(e, t = !1, n) {
  V = {
    p: V,
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
function en(e) {
  var t = (
                                   
    V
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Lr(r);
  }
  return t.i = !0, V = t.p, tn(e);
}
function tn(e = {}) {
  return Vt(e, $t, { value: !0 }), e;
}
function nn() {
  return !0;
}
let le = [];
function rn() {
  var e = le;
  le = [], Vn(e);
}
function se(e) {
  if (le.length === 0 && !De) {
    var t = le;
    queueMicrotask(() => {
      t === le && rn();
    });
  }
  le.push(e);
}
function ur() {
  for (; le.length > 0; )
    rn();
}
const hr = -7169;
function E(e, t) {
  e.f = e.f & hr | t;
}
function bt(e) {
  (e.f & L) !== 0 || e.deps === null ? E(e, A) : E(e, G);
}
function an(e) {
  if (e !== null)
    for (const t of e)
      (t.f & C) === 0 || (t.f & ce) === 0 || (t.f ^= ce, an(
                              
        t.deps
      ));
}
function ln(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & G) !== 0 && n.add(e), an(e.deps), E(e, A);
}
function et(e) {
  var t = m, n = b;
  F(null), X(null);
  try {
    return e();
  } finally {
    F(t), X(n);
  }
}
function dr(e, t, n, r) {
  const i = wt;
  var a = e.filter((v) => !v.settled), s = t.map(i);
  if (n.length === 0 && a.length === 0) {
    r(s);
    return;
  }
  var l = (
                         
    b
  ), o = vr(), f = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((v) => v.promise)) : null;
  function h(v) {
    if ((l.f & M) === 0) {
      o();
      try {
        r([...s, ...v]);
      } catch (c) {
        K(c, l);
      }
      Xe();
    }
  }
  var u = sn();
  if (n.length === 0) {
    f.then(() => h([])).finally(u);
    return;
  }
  function d() {
    Promise.all(n.map((v) =>                 pr(v))).then(h).catch((v) => K(v, l)).finally(u);
  }
  f ? f.then(() => {
    o(), d(), Xe();
  }) : d();
}
function vr() {
  var e = (
                         
    b
  ), t = m, n = V, r = (
                        
    g
  );
  return function(a = !0) {
    X(e), F(t), ye(n), a && (e.f & M) === 0 && (r?.activate(), r?.apply());
  };
}
function Xe(e = !0) {
  X(null), F(null), ye(null), e && g?.deactivate();
}
function sn() {
  var e = (
                         
    b
  ), t = e.b, n = (
                        
    g
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function wt(e) {
  var t = C | S;
  return b !== null && (b.f |= Ae), {
    ctx: V,
    deps: null,
    effects: null,
    equals: Zt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      T
    ),
    wv: 0,
    parent: b,
    ac: null
  };
}
const xe =                 Symbol("obsolete");
                       
function pr(e, t, n) {
  let r = (
                                
    b
  );
  r === null && ir();
  var i = (
                             
                          
    void 0
  ), a = ue(
                    
    T
  ), s = !m, l =                 new Set();
  return Hr(() => {
    var o = (
                           
      b
    ), f = Kt();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, (v) => {
        v !== je && f.reject(v);
      }).finally(Xe);
    } catch (v) {
      f.reject(v), Xe();
    }
    var h = (
                          
      g
    );
    if (s) {
      if ((o.f & ke) !== 0)
        var u = sn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        h.async_deriveds.get(o)?.reject(xe);
      else
        for (const v of l.values())
          v.reject(xe);
      l.add(f), h.async_deriveds.set(o, f);
    }
    const d = (v, c = void 0) => {
      u?.(), l.delete(f), c !== xe && (h.activate(), c ? (a.f |= ne, Ee(a, c)) : ((a.f & ne) !== 0 && (a.f ^= ne), Ee(a, v)), h.deactivate());
    };
    f.promise.then(d, (v) => d(null, v || "unknown"));
  }), Pr(() => {
    for (const o of l)
      o.reject(xe);
  }), new Promise((o) => {
    function f(h) {
      function u() {
        h === i ? o(a) : f(i);
      }
      h.then(u, u);
    }
    f(i);
  });
}
                       
function _r(e) {
  const t =                 wt(e);
  return An(t), t;
}
                       
function gr(e) {
  const t =                 wt(e);
  return t.equals = Qt, t;
}
function mr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      B(
                             
        t[n]
      );
  }
}
function yt(e) {
  var t, n = b, r = e.parent;
  if (!he && r !== null && e.v !== T &&                                                                                                      
  (r.f & (M | O)) !== 0)
    return tr(), e.v;
  X(r);
  try {
    e.f &= ~ce, mr(e), t = On(e);
  } finally {
    X(n);
  }
  return t;
}
function on(e) {
  var t = yt(e);
  if (!e.equals(t) && (e.wv = Cn(), (!g?.is_fork || e.deps === null) && (g !== null ? (g.capture(e, t, !0), ht?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    E(e, A);
    return;
  }
  he || (U !== null ? (kt() || g?.is_fork) && U.set(e, t) : bt(e));
}
function br(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && et(() => {
        t.ac.abort(je), t.ac = null;
      }), t.fn !== null && (t.teardown = qn), He(t, 0), At(t));
}
function fn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Te(t);
}
let rt = null, pe = null, g = null, ht = null, U = null, dt = null, De = !1, it = !1, _e = null, qe = null;
var Ct = 0;
let wr = 1;
class re {
  id = wr++;
                                              
  #l = !1;
  linked = !0;
                             
  #p = null;
                             
  #r = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #u =                 new Set();
     
                                                                                     
                                        
     
  #n =                 new Set();
     
                                                             
     
  #i = 0;
     
                                                                                
                                
     
  #e =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #a = null;
     
                                             
                     
     
  #t = [];
     
                                                 
                     
     
  #v = [];
     
                                                                               
                        
     
  #s =                 new Set();
     
                                          
                        
     
  #o =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #c =                 new Map();
     
                                                                                                    
                        
     
  #_ =                 new Set();
  is_fork = !1;
  #f = !1;
  constructor() {
    pe === null ? rt = pe = this : (pe.#r = this, this.#p = pe), pe = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const r of this.#e.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
        if (this.#c.has(t)) {
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
    this.#c.has(t) || this.#c.set(t, { d: [], m: [] }), this.#_.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#c.get(t);
    if (r) {
      this.#c.delete(t);
      for (var i of r.d)
        E(i, S), n(i);
      for (i of r.m)
        E(i, G), n(i);
    }
    this.#_.add(t);
  }
  #g() {
    this.#l = !0, Ct++ > 1e3 && (this.#d(), Er());
    for (const o of this.#s)
      this.#o.delete(o), E(o, S), this.schedule(o);
    for (const o of this.#o)
      E(o, G), this.schedule(o);
    const t = this.#t;
    this.#t = [], this.apply();
    var n = _e = [], r = [], i = qe = [];
    for (const o of t)
      try {
        this.#y(o, n, r);
      } catch (f) {
        throw hn(o), this.#b() || this.discard(), f;
      }
    if (g = null, i.length > 0) {
      var a = re.ensure();
      for (const o of i)
        a.schedule(o);
    }
    if (_e = null, qe = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [o, f] of this.#c)
        un(o, f);
      i.length > 0 &&                       
      g.#g();
      return;
    }
    const s = this.#w();
    if (s) {
      this.#h(r), this.#h(n), s.#E(this);
      return;
    }
    this.#s.clear(), this.#o.clear();
    for (const o of this.#u) o(this);
    this.#u.clear(), ht = this, xt(r), xt(n), ht = null, this.#a?.resolve();
    var l = (
                                 
                            
      g
    );
    if (this.#i === 0 && (this.#t.length === 0 || l !== null) && this.#d(), this.#t.length > 0)
      if (l !== null) {
        const o = l;
        o.#t.push(...this.#t.filter((f) => !o.#t.includes(f)));
      } else
        l = this;
    l !== null && (W.clear(), l.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #y(t, n, r) {
    t.f ^= A;
    for (var i = t.first; i !== null; ) {
      var a = i.f, s = (a & (q | J)) !== 0, l = s && (a & A) !== 0, o = l || (a & O) !== 0 || this.#c.has(i);
      if (!o && i.fn !== null) {
        s ? i.f ^= A : (a & Pe) !== 0 ? n.push(i) : ze(i) && ((a & j) !== 0 && this.#o.add(i), Te(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
    for (var t = this.#p; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#p;
    }
    return null;
  }
     
                         
     
  #E(t) {
    for (const [r, i] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of t.async_deriveds) {
      const a = this.async_deriveds.get(r);
      a && i.promise.then(a.resolve).catch(a.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#s, t.#o);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & C) !== 0 && (r.f & (S | G)) === 0))
        for (const l of i) {
          var a = l.f;
          if ((a & C) !== 0)
            n(
                                    
              l
            );
          else {
            var s = (
                                   
              l
            );
            a & (me | j) && !this.async_deriveds.has(s) && (this.#o.delete(s), E(s, S), this.schedule(s));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#d(), g = this, this.#g();
  }
     
                              
     
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      ln(t[n], this.#s, this.#o);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== T && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & ne) === 0 && (this.current.set(t, [n, r]), U?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, U = null;
  }
  flush() {
    try {
      it = !0, g = this, this.#g();
    } finally {
      Ct = 0, dt = null, _e = null, qe = null, it = !1, g = null, U = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#n) t(this);
    this.#n.clear();
    for (const t of this.async_deriveds.values())
      t.reject(xe);
    this.#d(), this.#a?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#v.push(t);
  }
  #m() {
    for (let u = rt; u !== null; u = u.#r) {
      var t = u.id < this.id, n = [];
      for (const [d, [v, c]] of this.current) {
        if (u.current.has(d)) {
          var r = (
                                         
            u.current.get(d)[0]
          );
          if (t && v !== r)
            u.current.set(d, [v, c]);
          else
            continue;
        }
        n.push(d);
      }
      if (t)
        for (const [d, v] of this.async_deriveds) {
          const c = u.async_deriveds.get(d);
          c && v.promise.then(c.resolve).catch(c.reject);
        }
      var i = [...u.current.keys()].filter(
        (d) => !                             
        u.current.get(d)[1]
      );
      if (!(!u.#l || i.length === 0)) {
        var a = i.filter((d) => !this.current.has(d));
        if (a.length === 0)
          t && u.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#_)
              u.unskip_effect(d, (v) => {
                (v.f & (j | me)) !== 0 ? u.schedule(v) : u.#h([v]);
              });
          u.activate();
          var s =                 new Set(), l =                 new Map();
          for (var o of n)
            cn(o, a, s, l);
          l =                 new Map();
          var f = [...u.current].filter(([d, v]) => {
            const c = this.current.get(d);
            return c ? c[0] !== v[0] || c[1] !== v[1] : !0;
          }).map(([d]) => d);
          if (f.length > 0)
            for (const d of this.#v)
              (d.f & (M | O | We)) === 0 && Et(d, f, l) && ((d.f & (me | j)) !== 0 ? (E(d, S), u.schedule(d)) : u.#s.add(d));
          if (u.#t.length > 0 && !u.#f) {
            u.apply();
            for (var h of u.#t)
              u.#y(h, [], []);
            u.#t = [];
          }
          u.deactivate();
        }
      }
    }
  }
     
                              
                           
     
  increment(t, n) {
    if (this.#i += 1, t) {
      let r = this.#e.get(n) ?? 0;
      this.#e.set(n, r + 1);
    }
  }
     
                              
                           
     
  decrement(t, n) {
    if (this.#i -= 1, t) {
      let r = this.#e.get(n) ?? 0;
      r === 1 ? this.#e.delete(n) : this.#e.set(n, r - 1);
    }
    this.#f || (this.#f = !0, se(() => {
      this.#f = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, n) {
    for (const r of t)
      this.#s.add(r);
    for (const r of n)
      this.#o.add(r);
    t.clear(), n.clear();
  }
                                           
  oncommit(t) {
    this.#u.add(t);
  }
                                           
  ondiscard(t) {
    this.#n.add(t);
  }
  settled() {
    return (this.#a ??= Kt()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new re();
      !it && !De && se(() => {
        t.#l || t.flush();
      });
    }
    return g;
  }
  apply() {
    {
      U = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (dt = t, t.b?.is_pending && (t.f & (Pe | Je | Wt)) !== 0 && (t.f & ke) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (_e !== null && n === b && (m === null || (m.f & C) === 0))
        return;
      if ((r & (J | q)) !== 0) {
        if ((r & A) === 0)
          return;
        n.f ^= A;
      }
    }
    this.#t.push(n);
  }
  #d() {
    if (this.linked) {
      var t = this.#p, n = this.#r;
      t === null ? rt = n : t.#r = n, n === null ? pe = t : n.#p = t, this.linked = !1;
    }
  }
}
function yr(e) {
  var t = De;
  De = !0;
  try {
    for (var n; ; ) {
      if (ur(), g === null)
        return (
                          
          n
        );
      g.flush();
    }
  } finally {
    De = t;
  }
}
function Er() {
  try {
    lr();
  } catch (e) {
    K(e, dt);
  }
}
let Z = null;
function xt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (M | O)) === 0 && ze(r) && (Z =                 new Set(), Te(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && wn(r), Z?.size > 0)) {
        W.clear();
        for (const i of Z) {
          if ((i.f & (M | O)) !== 0) continue;
          const a = [i];
          let s = i.parent;
          for (; s !== null; )
            Z.has(s) && (Z.delete(s), a.push(s)), s = s.parent;
          for (let l = a.length - 1; l >= 0; l--) {
            const o = a[l];
            (o.f & (M | O)) === 0 && Te(o);
          }
        }
        Z.clear();
      }
    }
    Z = null;
  }
}
function cn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const a = i.f;
      (a & C) !== 0 ? cn(
                              
        i,
        t,
        n,
        r
      ) : (a & (me | j)) !== 0 && (a & S) === 0 && Et(i, t, r) && (E(i, S), Tt(
                             
        i
      ));
    }
}
function Et(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Ke.call(t, i))
        return !0;
      if ((i.f & C) !== 0 && Et(
                              
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
function Tt(e) {
  g.schedule(e);
}
function un(e, t) {
  if (!((e.f & q) !== 0 && (e.f & A) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & G) !== 0 && t.m.push(e), E(e, A);
    for (var n = e.first; n !== null; )
      un(n, t), n = n.next;
  }
}
function hn(e) {
  E(e, A);
  for (var t = e.first; t !== null; )
    hn(t), t = t.next;
}
let Ze =                 new Set();
const W =                 new Map();
let dn = !1;
function ue(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: Zt,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function ee(e, t) {
  const n = ue(e);
  return An(n), n;
}
                       
function Tr(e, t = !1, n = !0) {
  const r = ue(e);
  return t || (r.equals = Qt), r;
}
function ae(e, t, n = !1) {
  m !== null &&                                                                                         
                                                                
  (!z || (m.f & We) !== 0) && nn() && (m.f & (C | j | me | We)) !== 0 && ($ === null || !$.has(e)) && fr();
  let r = n ? Oe(t) : t;
  return Ee(e, r, qe);
}
function Ee(e, t, n = null) {
  if (!e.equals(t)) {
    he ? W.set(e, t) : W.has(e) || W.set(e, e.v);
    var r = re.ensure();
    if (r.capture(e, t), (e.f & C) !== 0) {
      const i = (
                              
        e
      );
      (e.f & S) !== 0 && yt(i), U === null && bt(i);
    }
    e.wv = Cn(), vn(e, S, n), b !== null && (b.f & A) !== 0 && (b.f & (q | J)) === 0 && (P === null ? Br([e]) : P.push(e)), !r.is_fork && Ze.size > 0 && !dn && kr();
  }
  return t;
}
function kr() {
  dn = !1;
  for (const e of Ze) {
    (e.f & A) !== 0 && E(e, G);
    let t;
    try {
      t = ze(e);
    } catch {
      t = !0;
    }
    t && Te(e);
  }
  Ze.clear();
}
function Me(e) {
  ae(e, e.v + 1);
}
function vn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, a = 0; a < i; a++) {
      var s = r[a], l = s.f, o = (l & S) === 0;
      if (o && E(s, t), (l & We) !== 0)
        Ze.add(
                               
          s
        );
      else if ((l & C) !== 0) {
        var f = (
                                
          s
        );
        U?.delete(f), (l & ce) === 0 && (l & L && (b === null || (b.f & $e) === 0) && (s.f |= ce), vn(f, G, n));
      } else if (o) {
        var h = (
                               
          s
        );
        (l & j) !== 0 && Z !== null && Z.add(h), n !== null ? n.push(h) : Tt(h);
      }
    }
}
function Oe(e) {
  if (typeof e != "object" || e === null || nt in e || $t in e)
    return e;
  const t = Yt(e);
  if (t !== Gn && t !== Bn)
    return e;
  var n =                 new Map(), r = qt(e), i =                 ee(0), a = fe, s = (l) => {
    if (fe === a)
      return l();
    var o = m, f = fe;
    F(null), Rt(a);
    var h = l();
    return F(o), Rt(f), h;
  };
  return r && n.set("length",                 ee(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(l, o, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && sr();
        var h = n.get(o);
        return h === void 0 ? s(() => {
          var u =                 ee(f.value);
          return n.set(o, u), u;
        }) : ae(h, f.value, !0), !0;
      },
      deleteProperty(l, o) {
        var f = n.get(o);
        if (f === void 0) {
          if (o in l) {
            const h = s(() =>                 ee(T));
            n.set(o, h), Me(i);
          }
        } else
          ae(f, T), Me(i);
        return !0;
      },
      get(l, o, f) {
        if (o === nt)
          return e;
        var h = n.get(o), u = o in l;
        if (h === void 0 && (!u || Ie(l, o)?.writable) && (h = s(() => {
          var v = Oe(u ? l[o] : T), c =                 ee(v);
          return c;
        }), n.set(o, h)), h !== void 0) {
          var d = k(h);
          return d === T ? void 0 : d;
        }
        return Reflect.get(l, o, f);
      },
      getOwnPropertyDescriptor(l, o) {
        var f = Reflect.getOwnPropertyDescriptor(l, o);
        if (f && "value" in f) {
          var h = n.get(o);
          h && (f.value = k(h));
        } else if (f === void 0) {
          var u = n.get(o), d = u?.v;
          if (u !== void 0 && d !== T)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return f;
      },
      has(l, o) {
        if (o === nt)
          return !0;
        var f = n.get(o), h = f !== void 0 && f.v !== T || Reflect.has(l, o);
        if (f !== void 0 || b !== null && (!h || Ie(l, o)?.writable)) {
          f === void 0 && (f = s(() => {
            var d = h ? Oe(l[o]) : T, v =                 ee(d);
            return v;
          }), n.set(o, f));
          var u = k(f);
          if (u === T)
            return !1;
        }
        return h;
      },
      set(l, o, f, h) {
        var u = n.get(o), d = o in l;
        if (r && o === "length")
          for (var v = f; v <                              
          u.v; v += 1) {
            var c = n.get(v + "");
            c !== void 0 ? ae(c, T) : v in l && (c = s(() =>                 ee(T)), n.set(v + "", c));
          }
        if (u === void 0)
          (!d || Ie(l, o)?.writable) && (u = s(() =>                 ee(void 0)), ae(u, Oe(f)), n.set(o, u));
        else {
          d = u.v !== T;
          var p = s(() => Oe(f));
          ae(u, p);
        }
        var _ = Reflect.getOwnPropertyDescriptor(l, o);
        if (_?.set && _.set.call(h, f), !d) {
          if (r && typeof o == "string") {
            var w = (
                                           
              n.get("length")
            ), y = Number(o);
            Number.isInteger(y) && y >= w.v && ae(w, y + 1);
          }
          Me(i);
        }
        return !0;
      },
      ownKeys(l) {
        k(i);
        var o = Reflect.ownKeys(l).filter((u) => {
          var d = n.get(u);
          return d === void 0 || d.v !== T;
        });
        for (var [f, h] of n)
          h.v !== T && !(f in l) && o.push(f);
        return o;
      },
      setPrototypeOf() {
        or();
      }
    }
  );
}
var Ot, pn, _n, gn;
function Ar() {
  if (Ot === void 0) {
    Ot = window, pn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    _n = Ie(t, "firstChild").get, gn = Ie(t, "nextSibling").get, St(e) && (e[ct] = void 0, e[Xt] = null, e[$n] = void 0, e.__e = void 0), St(n) && (n[ut] = void 0);
  }
}
function Fe(e = "") {
  return document.createTextNode(e);
}
                       
function tt(e) {
  return (
                                      
    _n.call(e)
  );
}
                       
function Ue(e) {
  return (
                                      
    gn.call(e)
  );
}
function Sr(e, t) {
  return                 tt(e);
}
function Cr(e, t = !1) {
  {
    var n =                 tt(e);
    return n instanceof Comment && n.data === "" ?                 Ue(n) : n;
  }
}
function xr(e, t = !1) {
  return                 tt(e);
}
function Or(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    Ue(r);
  return r;
}
function Nr(e) {
  e.textContent = "";
}
function Rr() {
  return !1;
}
function Ir(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Dr(e) {
  var t = b;
  if (t === null)
    return m.f |= ne, e;
  if ((t.f & ke) === 0 && (t.f & Pe) === 0)
    throw e;
  K(e, t);
}
function K(e, t) {
  if (!(t !== null && (t.f & M) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ot) !== 0 && (t.f & (M | ft)) === 0) {
        if ((t.f & ke) === 0)
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
function Mr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = b;
  n !== null && (n.f & O) !== 0 && (e |= O);
  var r = {
    ctx: V,
    deps: null,
    nodes: null,
    f: e | S | L,
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
  if ((e & Pe) !== 0)
    _e !== null ? _e.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      Te(r);
    } catch (s) {
      throw B(r), s;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Ae) === 0 && (i = i.first, (e & j) !== 0 && (e & Le) !== 0 && i !== null && (i.f |= Le));
  }
  if (i !== null && (i.parent = n, n !== null && Mr(i, n), m !== null && (m.f & C) !== 0 && (e & J) === 0)) {
    var a = (
                            
      m
    );
    (a.effects ??= []).push(i);
  }
  return r;
}
function kt() {
  return m !== null && !z;
}
function Pr(e) {
  const t = ie(Je, null);
  return E(t, A), t.teardown = e, t;
}
function Lr(e) {
  return ie(Pe | Kn, e);
}
function Fr(e) {
  re.ensure();
  const t = ie(J | Ae, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      B(t), r(void 0);
    }) : (B(t), r(void 0));
  });
}
function Hr(e) {
  return ie(me | Ae, e);
}
function jr(e, t = 0) {
  return ie(Je | t, e);
}
function Ur(e, t = [], n = [], r = []) {
  dr(r, t, n, (i) => {
    ie(Je, () => {
      e(...i.map(k));
    });
  });
}
function mn(e, t = 0) {
  var n = ie(j | t, e);
  return n;
}
function Y(e) {
  return ie(q | Ae, e);
}
function bn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = he, r = m;
    Nt(!0), F(null);
    try {
      t.call(null);
    } catch (i) {
      K(i, e.parent);
    } finally {
      Nt(n), F(r);
    }
  }
}
function At(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && et(() => {
      i.abort(je);
    });
    var r = n.next;
    (n.f & J) !== 0 ? n.parent = null : B(n, t), n = r;
  }
}
function zr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & q) === 0 && B(t), t = n;
  }
}
function B(e, t = !0) {
  var n = !1;
  (t || (e.f & Yn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Gr(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= ft, At(e, t && !n), He(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const a of r)
      a.stop();
  bn(e), e.f ^= ft, e.f |= M;
  var i = e.parent;
  i !== null && i.first !== null && wn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Gr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 Ue(e);
    e.remove(), e = n;
  }
}
function wn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  e.f |= mt, yn(e, r, !0);
  var i = () => {
    n && B(e), t && t();
  }, a = r.length;
  if (a > 0) {
    var s = () => --a || i();
    for (var l of r)
      l.out(s);
  } else
    i();
}
function yn(e, t, n) {
  if ((e.f & O) === 0) {
    e.f ^= O;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var a = i.next;
      if ((i.f & J) === 0) {
        var s = (i.f & Le) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & q) !== 0 && (e.f & j) !== 0;
        yn(i, t, s ? n : !1);
      }
      i = a;
    }
  }
}
function En(e) {
  e.f &= ~mt, Tn(e, !0);
}
function Tn(e, t) {
  if ((e.f & mt) === 0 && (e.f & O) !== 0) {
    e.f ^= O, (e.f & A) === 0 && (E(e, S), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Le) !== 0 || (n.f & q) !== 0;
      Tn(n, i ? t : !1), n = r;
    }
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const s of a)
        (s.is_global || t) && s.in();
  }
}
function kn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 Ue(n);
      t.append(n), n = i;
    }
}
let Ve = !1, he = !1;
function Nt(e) {
  he = e;
}
let m = null, z = !1;
function F(e) {
  m = e;
}
let b = null;
function X(e) {
  b = e;
}
let $ = null;
function An(e) {
  m !== null && ($ ??=                 new Set()).add(e);
}
let N = null, I = 0, P = null;
function Br(e) {
  P = e;
}
let Sn = 1, oe = 0, fe = oe;
function Rt(e) {
  fe = e;
}
function Cn() {
  return ++Sn;
}
function ze(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & C && (e.f &= ~ce), (t & G) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if (ze(
                              
        a
      ) && on(
                              
        a
      ), a.wv > e.wv)
        return !0;
    }
    (t & L) !== 0 &&                                                                   
                                                                
    U === null && E(e, A);
  }
  return !1;
}
function xn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !($ !== null && $.has(e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      (a.f & C) !== 0 ? xn(
                              
        a,
        t,
        !1
      ) : t === a && (n ? E(a, S) : (a.f & A) !== 0 && E(a, G), Tt(
                             
        a
      ));
    }
}
function On(e) {
  var t = N, n = I, r = P, i = m, a = $, s = V, l = z, o = fe, f = e.f;
  N =                              
  null, I = 0, P = null, m = (f & (q | J)) === 0 ? e : null, $ = null, ye(e.ctx), z = !1, fe = ++oe, e.ac !== null && (et(() => {
    e.ac.abort(je);
  }), e.ac = null);
  try {
    e.f |= $e;
    var h = (
                             
      e.fn
    ), u = h();
    e.f |= ke;
    var d = It(e);
    if (nn() && P !== null && !z && d !== null && (e.f & (C | G | S)) === 0)
      for (var v = 0; v <                        
      P.length; v++)
        xn(
          P[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (oe++, i.deps !== null)
        for (let c = 0; c < n; c += 1)
          i.deps[c].rv = oe;
      if (t !== null)
        for (const c of t)
          c.rv = oe;
      P !== null && (r === null ? r = P : r.push(...                       
      P));
    }
    return (e.f & ne) !== 0 && (e.f ^= ne), u;
  } catch (c) {
    return It(e), Dr(c);
  } finally {
    e.f ^= $e, N = t, I = n, P = r, m = i, $ = a, ye(s), z = l, fe = o;
  }
}
function It(e) {
  var t = e.deps, n = g?.is_fork;
  if (N !== null) {
    var r;
    if (n || He(e, I), t !== null && I > 0)
      for (t.length = I + N.length, r = 0; r < N.length; r++)
        t[I + r] = N[r];
    else
      e.deps = t = N;
    if (kt() && (e.f & L) !== 0)
      for (r = I; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && I < t.length && (He(e, I), t.length = I);
  return t;
}
function qr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Un.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & C) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (N === null || !Ke.call(N, t))) {
    var a = (
                            
      t
    );
    (a.f & L) !== 0 && (a.f ^= L, a.f &= ~ce), a.v !== T && bt(a), a.ac !== null && et(() => {
      a.ac.abort(je), a.ac = null, E(a, S);
    }), br(a), He(a, 0);
  }
}
function He(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      qr(e, n[r]);
}
function Te(e) {
  var t = e.f;
  if ((t & M) === 0) {
    E(e, A);
    var n = b, r = Ve;
    b = e, Ve = (t & (q | J)) === 0;
    try {
      (t & (j | Wt)) !== 0 ? zr(e) : At(e), bn(e);
      var i = On(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Sn;
      var a;
    } finally {
      Ve = r, b = n;
    }
  }
}
function k(e) {
  var t = e.f, n = (t & C) !== 0;
  if (m !== null && !z) {
    var r = b !== null && (b.f & M) !== 0;
    if (!r && ($ === null || !$.has(e))) {
      var i = m.deps;
      if ((m.f & $e) !== 0)
        e.rv < oe && (e.rv = oe, N === null && i !== null && i[I] === e ? I++ : N === null ? N = [e] : N.push(e));
      else {
        m.deps ??= [], Ke.call(m.deps, e) || m.deps.push(e);
        var a = e.reactions;
        a === null ? e.reactions = [m] : Ke.call(a, m) || a.push(m);
      }
    }
  }
  if (he && W.has(e))
    return W.get(e);
  if (n) {
    var s = (
                            
      e
    );
    if (he) {
      var l = s.v;
      return ((s.f & A) === 0 && s.reactions !== null || Rn(s)) && (l = yt(s)), W.set(s, l), l;
    }
    var o = (s.f & L) === 0 && !z && m !== null && (Ve || (m.f & L) !== 0), f = (s.f & ke) === 0;
    ze(s) && (o && (s.f |= L), on(s)), o && !f && (fn(s), Nn(s));
  }
  if (U?.has(e))
    return U.get(e);
  if ((e.f & ne) !== 0)
    throw e.v;
  return e.v;
}
function Nn(e) {
  if (e.f |= L, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & C) !== 0 && (t.f & L) === 0 && (fn(
                              
        t
      ), Nn(
                              
        t
      ));
}
function Rn(e) {
  if (e.v === T) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & C) !== 0 && Rn(
                            
      t
    ))
      return !0;
  return !1;
}
function Vr(e) {
  var t = z;
  try {
    return z = !0, e();
  } finally {
    z = t;
  }
}
const Yr = ["touchstart", "touchmove"];
function Kr(e) {
  return Yr.includes(e);
}
const Ne =                 Symbol("events"), In =                 new Set(), vt =                 new Set();
function Dt(e, t, n) {
  (t[Ne] ??= {})[e] = n;
}
function Wr(e) {
  for (var t = 0; t < e.length; t++)
    In.add(e[t]);
  for (var n of vt)
    n(e);
}
let at = null, lt = !1;
function Mt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], a = (
                                 
    i[0] || e.target
  );
  at = e, lt || (lt = !0, setTimeout(() => {
    lt = !1, at = null;
  }));
  var s = 0, l = at === e && e[Ne];
  if (l) {
    var o = i.indexOf(l);
    if (o !== -1 && (t === document || t ===                   
    window)) {
      e[Ne] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    o <= f && (s = o);
  }
  if (a =                       
  i[s] || e.target, a !== t) {
    Vt(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var h = m, u = b;
    F(null), X(null);
    try {
      for (var d, v = []; a !== null && a !== t; ) {
        try {
          var c = a[Ne]?.[r];
          c != null && (!                  
          a.disabled ||                                                                                           
                                                                                                     
          e.target === a) && c.call(a, e);
        } catch (p) {
          d ? v.push(p) : d = p;
        }
        if (e.cancelBubble) break;
        s++, a = s < i.length ? (
                                
          i[s]
        ) : null;
      }
      if (d) {
        for (let p of v)
          queueMicrotask(() => {
            throw p;
          });
        throw d;
      }
    } finally {
      e[Ne] = t, delete e.currentTarget, F(h), X(u);
    }
  }
}
const $r = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function Xr(e) {
  return (
                         
    $r?.createHTML(e) ?? e
  );
}
function Zr(e) {
  var t = Ir("template");
  return t.innerHTML = Xr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Dn(e, t) {
  var n = (
                         
    b
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function Qr(e, t) {
  var n = (t & Jn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Zr(i ? e : "<!>" + e), r =                            
                    tt(r));
    var a = (
                                 
      n || pn ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Dn(a, a), a;
  };
}
function Jr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Fe();
  return e.append(t, n), Dn(t, n), e;
}
function Pt(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function ei(e) {
  let t = 0, n = ue(0), r;
  return () => {
    kt() && (k(n), jr(() => (t === 0 && (r = Vr(() => e(() => Me(n)))), t += 1, () => {
      se(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Me(n));
      });
    })));
  };
}
var ti = Le | Ae;
function ni(e, t, n, r) {
  new ri(e, t, n, r);
}
class ri {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #l;
                                    
  #p = null;
                              
  #r;
                                         
  #u;
                       
  #n;
                              
  #i = null;
                              
  #e = null;
                              
  #a = null;
                                        
  #t = null;
  #v = 0;
  #s = 0;
  #o = !1;
                            
  #c =                 new Set();
                            
  #_ =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #f = null;
  #b = ei(() => (this.#f = ue(this.#v), () => {
    this.#f = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#l = t, this.#r = n, this.#u = (a) => {
      var s = (
                             
        b
      );
      s.b = this, s.f |= ot, r(a);
    }, this.parent =                      
    b.b, this.transform_error = i ?? this.parent?.transform_error ?? ((a) => a), this.#n = mn(() => {
      this.#h();
    }, ti);
  }
  #g() {
    try {
      this.#i = Y(() => this.#u(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #y(t) {
    const n = this.#r.failed, { reset: r, invoke_onerror: i } = this.#w(t);
    se(i), n && (this.#a = Y(() => {
      n(
        this.#l,
        () => t,
        () => r
      );
    }));
  }
     
                                                                              
                                                 
                           
                                                                 
     
  #w(t) {
    var n = !1, r = !1;
    const i = () => {
      if (n) {
        nr();
        return;
      }
      n = !0, r && cr(), this.#a !== null && be(this.#a, () => {
        this.#a = null;
      }), this.#d(() => {
        this.#h();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#r.onerror?.(t, i), r = !1;
      } catch (s) {
        K(s, this.#n && this.#n.parent);
      }
    } };
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#e = Y(() => t(this.#l)), se(() => {
      var n = this.#t = document.createDocumentFragment(), r = Fe(), i = !1;
      if (n.append(r), this.#i = this.#d(() => {
        try {
          return Y(() => this.#u(r));
        } catch (a) {
          try {
            this.error(a), i = !0;
          } catch (s) {
            K(s, this.#n.parent);
          }
          return null;
        }
      }), this.#i === null) {
        this.#t = null, i && this.#m(
                              
          g
        );
        return;
      }
      this.#s === 0 && (this.#l.before(n), this.#t = null, be(
                             
        this.#e,
        () => {
          this.#e = null;
        }
      ), this.#m(
                            
        g
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#s = 0, this.#v = 0, this.#i = Y(() => {
        this.#u(this.#l);
      }), this.#s > 0) {
        var t = this.#t = document.createDocumentFragment();
        kn(this.#i, t);
        const n = (
                                               
          this.#r.pending
        );
        this.#e = Y(() => n(this.#l));
      } else
        this.#m(
                              
          g
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#c, this.#_);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    ln(t, this.#c, this.#_);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#r.pending;
  }
     
                
                        
     
  #d(t) {
    var n = b, r = m, i = V;
    X(this.#n), F(this.#n), ye(this.#n.ctx);
    try {
      return re.ensure(), t();
    } finally {
      X(n), F(r), ye(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #T(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#T(t, n);
      return;
    }
    this.#s += t, this.#s === 0 && (this.#m(n), this.#e && be(this.#e, () => {
      this.#e = null;
    }), this.#t && (this.#l.before(this.#t), this.#t = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#T(t, n), this.#v += t, !(!this.#f || this.#o) && (this.#o = !0, se(() => {
      this.#o = !1, this.#f && Ee(this.#f, this.#v);
    }));
  }
  get_effect_pending() {
    return this.#b(), k(
                                   
      this.#f
    );
  }
                               
  error(t) {
    if (!this.#r.onerror && !this.#r.failed)
      throw t;
    g?.is_fork ? (this.#i && g.skip_effect(this.#i), this.#e && g.skip_effect(this.#e), this.#a && g.skip_effect(this.#a), g.oncommit(() => {
      this.#k(t);
    })) : this.#k(t);
  }
     
                           
     
  #k(t) {
    this.#i && (B(this.#i), this.#i = null), this.#e && (B(this.#e), this.#e = null), this.#a && (B(this.#a), this.#a = null);
    let n = this.#r.failed;
    const r = (i) => {
      const { reset: a, invoke_onerror: s } = this.#w(i);
      s(), n && (this.#a = this.#d(() => {
        try {
          return Y(() => {
            var l = (
                                   
              b
            );
            l.b = this, l.f |= ot, n(
              this.#l,
              () => i,
              () => a
            );
          });
        } catch (l) {
          return K(
            l,
                                 
            this.#n.parent
          ), null;
        }
      }));
    };
    se(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (a) {
        K(a, this.#n && this.#n.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (a) => K(a, this.#n && this.#n.parent)
      ) : r(i);
    });
  }
}
function Lt(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[ut] ??= e.nodeValue) && (e[ut] = n, e.nodeValue = `${n}`);
}
function ii(e, t) {
  return ai(e, t);
}
const Ge =                 new Map();
function ai(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: s = !0, transformError: l }) {
  Ar();
  var o = void 0, f = Fr(() => {
    var h = n ?? t.appendChild(Fe());
    ni(
                                 
      h,
      {
        pending: () => {
        }
      },
      (v) => {
        Jt({});
        var c = (
                                         
          V
        );
        a && (c.c = a), i && (r.$$events = i), o = e(v, r) || tn(), en();
      },
      l
    );
    var u =                 new Set(), d = (v) => {
      for (var c = 0; c < v.length; c++) {
        var p = v[c];
        if (!u.has(p)) {
          u.add(p);
          var _ = Kr(p);
          for (const R of [t, document]) {
            var w = Ge.get(R);
            w === void 0 && (w =                 new Map(), Ge.set(R, w));
            var y = w.get(p);
            y === void 0 ? (R.addEventListener(p, Mt, { passive: _ }), w.set(p, 1)) : w.set(p, y + 1);
          }
        }
      }
    };
    return d(Qe(In)), vt.add(d), () => {
      for (var v of u)
        for (const _ of [t, document]) {
          var c = (
                                              
            Ge.get(_)
          ), p = (
                                 
            c.get(v)
          );
          --p == 0 ? (_.removeEventListener(v, Mt), c.delete(v), c.size === 0 && Ge.delete(_)) : c.set(v, p);
        }
      vt.delete(d), h !== n && h.parentNode?.removeChild(h);
    };
  });
  return pt.set(o, f), o;
}
let pt =                 new WeakMap();
function li(e, t) {
  const n = pt.get(e);
  return n ? (pt.delete(e), n(t)) : Promise.resolve();
}
function si(e, t, n) {
  for (var r = [], i = t.length, a, s = t.length, l = 0; l < i; l++) {
    let u = t[l];
    be(
      u,
      () => {
        if (a) {
          if (a.pending.delete(u), a.done.add(u), a.pending.size === 0) {
            var d = (
                                                
              e.outrogroups
            );
            _t(e, Qe(a.done)), d.delete(a), d.size === 0 && (e.outrogroups = null);
          }
        } else
          s -= 1;
      },
      !1
    );
  }
  if (s === 0) {
    var o = r.length === 0 && n !== null && e.pending.size === 0;
    if (o) {
      var f = (
                              
        n
      ), h = (
                              
        f.parentNode
      );
      Nr(h), h.append(f), e.items.clear();
    }
    _t(e, t, !o);
  } else
    a = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(a);
}
function _t(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const s of e.pending.values())
      for (const l of s)
        r.add(
                                 
          e.items.get(l).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var a = t[i];
    if (r?.has(a)) {
      a.f |= Q;
      const s = document.createDocumentFragment();
      kn(a, s);
    } else
      B(t[i], n);
  }
}
var Ft;
function oi(e, t, n, r, i, a = null) {
  var s = e, l =                 new Map(), o = null, f =                 gr(() => {
    var w = n();
    return (
                        
      qt(w) ? w : w == null ? [] : Qe(w)
    );
  }), h, u =                 new Map(), d = !0;
  function v(w) {
    (_.effect.f & M) === 0 && (_.pending.delete(w), _.fallback = o, fi(_, h, s, t, r), o !== null && (h.length === 0 ? (o.f & Q) === 0 ? En(o) : (o.f ^= Q, Re(o, null, s)) : be(o, () => {
      o = null;
    })));
  }
  function c(w) {
    _.pending.delete(w);
  }
  var p = mn(() => {
    h =                   
    k(f);
    for (var w = h.length, y =                 new Set(), R = (
                          
      g
    ), de = Rr(), H = 0; H < w; H += 1) {
      var Se = h[H], ve = r(Se, H), x = d ? null : l.get(ve);
      x ? (x.v && Ee(x.v, Se), x.i && Ee(x.i, H), de && R.unskip_effect(x.e)) : (x = ci(
        l,
        d ? s : Ft ??= Fe(),
        Se,
        ve,
        H,
        i,
        t,
        n
      ), d || (x.e.f |= Q), l.set(ve, x)), y.add(ve);
    }
    if (w === 0 && a && !o && (d ? o = Y(() => a(s)) : (o = Y(() => a(Ft ??= Fe())), o.f |= Q)), w > y.size && ar(), !d)
      if (u.set(R, y), de) {
        for (const [Hn, jn] of l)
          y.has(Hn) || R.skip_effect(jn.e);
        R.oncommit(v), R.ondiscard(c);
      } else
        v(R);
    k(f);
  }), _ = { effect: p, items: l, pending: u, outrogroups: null, fallback: o };
  d = !1;
}
function Ce(e) {
  for (; e !== null && (e.f & q) === 0; )
    e = e.next;
  return e;
}
function fi(e, t, n, r, i) {
  var a = t.length, s = e.items, l = Ce(e.effect.first), o, f = null, h = [], u = [], d, v, c, p;
  for (p = 0; p < a; p += 1) {
    if (d = t[p], v = i(d, p), c =                        
    s.get(v).e, e.outrogroups !== null)
      for (const x of e.outrogroups)
        x.pending.delete(c), x.done.delete(c);
    if ((c.f & O) !== 0 && En(c), (c.f & Q) !== 0)
      if (c.f ^= Q, c === l)
        Re(c, null, n);
      else {
        var _ = f ? f.next : l;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), te(e, f, c), te(e, c, _), Re(c, _, n), f = c, h = [], u = [], l = Ce(f.next);
        continue;
      }
    if (c !== l) {
      if (o !== void 0 && o.has(c)) {
        if (h.length < u.length) {
          var w = u[0], y;
          f = w.prev;
          var R = h[0], de = h[h.length - 1];
          for (y = 0; y < h.length; y += 1)
            Re(h[y], w, n);
          for (y = 0; y < u.length; y += 1)
            o.delete(u[y]);
          te(e, R.prev, de.next), te(e, f, R), te(e, de, w), l = w, f = de, p -= 1, h = [], u = [];
        } else
          o.delete(c), Re(c, l, n), te(e, c.prev, c.next), te(e, c, f === null ? e.effect.first : f.next), te(e, f, c), f = c;
        continue;
      }
      for (h = [], u = []; l !== null && l !== c; )
        (o ??=                 new Set()).add(l), u.push(l), l = Ce(l.next);
      if (l === null)
        continue;
    }
    (c.f & Q) === 0 && h.push(c), f = c, l = Ce(c.next);
  }
  if (e.outrogroups !== null) {
    for (const x of e.outrogroups)
      x.pending.size === 0 && (_t(e, Qe(x.done)), e.outrogroups?.delete(x));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || o !== void 0) {
    var H = [];
    if (o !== void 0)
      for (c of o)
        (c.f & O) === 0 && H.push(c);
    for (; l !== null; )
      (l.f & O) === 0 && l !== e.fallback && H.push(l), l = Ce(l.next);
    var Se = H.length;
    if (Se > 0) {
      var ve = null;
      si(e, H, ve);
    }
  }
}
function ci(e, t, n, r, i, a, s, l) {
  var o = (s & Xn) !== 0 ? (s & Qn) === 0 ?                 Tr(n, !1, !1) : ue(n) : null, f = (s & Zn) !== 0 ? ue(i) : null;
  return {
    v: o,
    i: f,
    e: Y(() => (a(t, o ?? n, f ?? i, l), () => {
      e.delete(r);
    }))
  };
}
function Re(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, a = t && (t.f & Q) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var s = (
                                   
                        Ue(r)
      );
      if (a.before(r), r === i)
        return;
      r = s;
    }
}
function te(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Mn(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = Mn(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function ui() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Mn(e)) && (r && (r += " "), r += t);
  return r;
}
function hi(e) {
  return typeof e == "object" ? ui(e) : e ?? "";
}
function di(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r === "" ? null : r;
}
function vi(e, t, n, r, i, a) {
  var s = (
                      
    e[ct]
  );
  if (s !== n || s === void 0) {
    var l = di(n);
    l == null ? e.removeAttribute("class") : e.className = l, e[ct] = n;
  }
  return a;
}
const pi =                 Symbol("is custom element"), _i =                 Symbol("is html");
function Be(e, t, n, r) {
  var i = gi(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[Wn] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && mi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function gi(e) {
  return (
                                                    
                      
    e[Xt] ??= {
      [pi]: e.nodeName.includes("-"),
      [_i]: e.namespaceURI === er
    }
  );
}
var Ht =                 new Map();
function mi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Ht.get(t);
  if (n) return n;
  Ht.set(t, n =                 new Set());
  for (var r, i = e, a = Element.prototype; a !== i; ) {
    r = zn(i);
    for (var s in r)
      r[s].set &&                                                                                     
      s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.add(s);
    i = Yt(i);
  }
  return n;
}
const bi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(bi);
const Pn = [
  { id: "achTab", panel: "achPanel", value: "achievements", icon: "🏅", label: "アチーブメント" },
  { id: "colTab", panel: "colPanel", value: "collections", icon: "✿", label: "コレクション" }
];
function wi(e, t) {
  return t === "Home" ? "achievements" : t === "End" ? "collections" : t === "ArrowLeft" || t === "ArrowRight" ? e === "achievements" ? "collections" : "achievements" : null;
}
function Ln(e, t) {
  const n = e === t;
  return { selected: n, tabIndex: n ? 0 : -1, hidden: !n, activeClass: n ? "primary-tab active" : "primary-tab" };
}
function jt(e, t) {
  e.selectTab(t);
}
var yi =                 Qr('<button role="tab" type="button"> <span> </span></button>');
function Ei(e, t) {
  Jt(t, !0);
  function n(a, s) {
    const l = wi(s, a.key);
    if (l === null) return;
    a.preventDefault();
    const o = a.currentTarget.parentElement;
    jt(t.port, l), o?.querySelector(l === "achievements" ? "#achTab" : "#colTab")?.focus();
  }
  var r = Jr(), i = Cr(r);
  oi(i, 17, () => Pn, (a) => a.value, (a, s) => {
    const l =                 _r(() => Ln(t.initialTab, k(s).value));
    var o = yi(), f = Sr(o), h = Or(f), u = xr(h, !0);
    Ur(() => {
      Be(o, "id", k(s).id), Be(o, "aria-controls", k(s).panel), Be(o, "aria-selected", k(l).selected), vi(o, 1, hi(k(l).activeClass)), Be(o, "tabindex", k(l).tabIndex), Lt(f, `${k(s).icon ?? ""} `), Lt(u, k(s).label);
    }), Dt("click", o, () => jt(t.port, k(s).value)), Dt("keydown", o, (d) => n(d, k(s).value)), Pt(a, o);
  }), Pt(e, r), en();
}
Wr(["click", "keydown"]);
function Ye(e) {
  const t = e.achievementSelected === "true" && e.collectionSelected === "false" && e.achievementTabIndex === 0 && e.collectionTabIndex === -1 && e.achievementHidden === !1 && e.collectionHidden === !0, n = e.achievementSelected === "false" && e.collectionSelected === "true" && e.achievementTabIndex === -1 && e.collectionTabIndex === 0 && e.achievementHidden === !0 && e.collectionHidden === !1;
  if (t) return "achievements";
  if (n) return "collections";
  throw new Error("LEGACY_NAVIGATION_INCOHERENT");
}
function Ti(e) {
  return {
    get activeTab() {
      return Ye(e.read());
    },
    selectTab(t) {
      if (t !== "achievements" && t !== "collections") throw new Error("LEGACY_NAVIGATION_INVALID_TARGET");
      Ye(e.read());
      try {
        if (e.setTab(t), Ye(e.read()) !== t) throw new Error("LEGACY_NAVIGATION_POSTCONDITION");
      } finally {
        e.invalidate?.();
      }
    }
  };
}
const Ut = Object.freeze({ de: "bd5bb8948e5e15e886c4f58421b00b41f0ec68a8ec627b023776ac1525507edb", en: "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", "en-GB": "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", es: "fb3061db5c00ef1c32d24af6b49246e53924dd90bd7984993c4a0774d037950d", fr: "1504c6d257bfb77003fecdd7acbc5cf114a8e51050a7521ab4ca42eeb2fc9737", "fr-CA": "17360cc5e61429400bdf4fa703121a54a0aeaf2368902609bc2e0d7dfa166038", it: "252954237409005d1fee26f96f604619380001917dccd93b133ead52a6549619", ja: "5729953617fdda2c39fef0499dc922a55c6b4a0d0bf134fa1a656cb3deb74851", ko: "df8800988f3c50fcee9a73e5c60093da4ef2737bb62cd841466ecae2e41874c7", nl: "a9c9f522c04c61a85e63d030a2407028e122a4c9cff95d57d7b1df6e1c7ae948", "pt-BR": "9befdaa8b85d09f623f75ed980af465afa88e7a07a163ec7f87f9aaf90974c13", ru: "08c523b001893cb1c1b3a510ac68a1874c1194ef7a0690f2aad1cd8f1c2d57cd", tr: "9e0a2f2ee46bb9f5c8eae28842e4ea53cc1000146d375250b132e450ee5530b5", "zh-Hans": "9a5b1098e6cf9a9f19a0dea90a48bda78ecd0ef95ade4c4ca54e4082237b0139", "zh-Hant": "9638729fca88ca34e47006eef3889b8b2491ddc0a79cf6588f155ad2de0633cc" }), gt = Object.freeze(["nav.achievements", "nav.collections", "nav.workspace", "nav.tabs", "r2.preview", "ach.intro", "ach.count", "ach.empty", "col.intro", "col.count", "ach.search.label", "ach.search.placeholder", "ach.filter.label", "ach.filter.all", "ach.filter.complete", "ach.filter.incomplete", "ach.filter.missing", "ach.filter.unknownSource", "ach.image.label", "ach.image.all", "ach.image.exact", "ach.image.sourceNull", "ach.image.unknown", "ach.sort.label", "ach.sort.source", "ach.sort.name", "ach.sort.progressDesc", "ach.sort.progressAsc", "ach.sort.completedFirst", "col.search.label", "col.search.placeholder", "col.filter.label", "col.filter.all", "col.filter.hasRecord", "col.filter.noRecord", "col.filter.unknown", "col.sort.label", "col.sort.source", "col.sort.name", "col.sort.recordDesc", "locale.label", "locale.auto", "locale.loading", "locale.unverified", "file.open", "file.status", "file.backup", "file.export", "edit.preview", "edit.apply", "edit.undo", "edit.redo", "edit.reset", "edit.complete", "edit.revoke", "edit.collect", "edit.uncollect", "edit.progress", "edit.date", "edit.collectionDate", "edit.batch", "edit.selected", "state.unknown", "state.unverified", "state.unsupported", "state.notRecorded", "state.absentRef", "state.missingText", "state.writerOff", "state.previewOnly", "warning.linkage", "warning.history", "warning.reward", "error.file", "error.version", "error.stale", "error.integrity", "error.locale", "privacy.local", "credits.notice", "col.grid.empty", "col.image.label", "col.image.unverified", "col.image.unknown", "col.image.status", "col.grid.recorded", "col.grid.parentReference", "col.grid.unmatched", "r3.detail.preview", "r4.ach.preview", "r4.ach.selection", "r4.ach.unselected", "ach.row.unknownName", "ach.row.externalImageUnknown", "r4.ach.limit", "ach.list.more", "ach.row.image.label", "ach.row.image.unverified", "ach.row.image.status", "ach.row.status.missing", "ach.row.aria", "ach.row.subtitle.missing", "ach.row.subtitle.document", "ach.list.unreadable", "ach.list.noMatch", "ach.list.unloaded", "col.item.search.placeholder", "col.item.search.label", "col.item.history.label", "col.item.sort.label", "col.item.sort.internal", "col.item.sort.id", "col.item.inspect", "col.item.empty", "col.item.guid", "col.item.history.presence", "col.item.history.rawTicks", "col.item.history.calendar", "col.item.history.unknownHint", "col.item.previewHint", "col.item.list.caption", "ach.detail.heading", "ach.detail.empty", "ach.detail.missingHint", "ach.detail.definitionMatch", "ach.detail.matched", "ach.detail.unknownValue", "ach.detail.unset", "ach.linkage.heading", "ach.linkage.requiredConfirmed", "ach.linkage.requiredCandidate", "ach.linkage.related", "ach.linkage.unknown", "ach.linkage.hint", "ach.facts.heading", "ach.facts.definitionHeading", "ach.facts.builtinHint", "ach.facts.groupHint", "ach.facts.dlcHint", "ach.facts.groupNameHint", "ach.facts.counterUnknown", "ach.facts.counterAbsent", "ach.facts.counterNull", "ach.facts.rewardUnknown", "ach.facts.rewardNone", "ach.facts.childMissing", "ach.facts.childIncomplete", "ach.facts.groupProgress", "col.item.image.label", "col.definition.image.label", "col.item.image.unverified", "col.item.image.status", "col.item.history.recorded", "col.item.history.absent", "col.item.history.status", "col.item.ticks", "col.item.calendarUnknown", "col.item.parent", "col.item.parentCross", "col.item.history.rawUnknown", "ach.detail.unknownDefinition", "ach.linkage.count", "ach.linkage.unverifiedCount", "ach.linkage.systemCount", "ach.facts.internalKey", "ach.facts.membersHeading", "ach.facts.membersLabel", "ach.facts.definitionUnknown", "ach.facts.groupUnknown", "ach.facts.counterName", "ach.facts.threshold", "ach.facts.builtin", "ach.facts.counterGuid", "ach.facts.counterSaved", "ach.facts.counterDocument", "ach.facts.onlyUniques", "ach.facts.countedGuids", "ach.facts.countedValues", "ach.facts.rewardDefinition", "ach.facts.rewardReceipt", "ach.facts.rewardValue", "ach.facts.rewardZero", "ach.facts.groupName", "ach.facts.referenceCount", "ach.facts.savedCompletion", "ach.facts.groupCounter", "ach.facts.groupGuid", "ach.facts.definitionGuid", "ach.facts.groupAbsent", "ach.detail.statusLabel", "locale.previewScope", "locale.storageUnavailable"]);
gt.length;
const ki = Object.freeze({ de: ["Funktion auswählen", "Erfolge", "Sammlungen"], "en-GB": ["Choose a feature", "Achievements", "Collections"], en: ["Choose a feature", "Achievements", "Collections"], es: ["Elegir una función", "Logros", "Colecciones"], "fr-CA": ["Choisir une fonction", "Succès", "Collections"], fr: ["Choisir une fonction", "Succès", "Collections"], it: ["Scegli una funzione", "Obiettivi", "Collezioni"], ja: ["表示する機能", "アチーブメント", "コレクション"], ko: ["기능 선택", "업적", "컬렉션"], nl: ["Kies een functie", "Prestaties", "Collecties"], "pt-BR": ["Escolher uma função", "Conquistas", "Coleções"], ru: ["Выберите функцию", "Достижения", "Коллекции"], tr: ["Bir işlev seçin", "Başarılar", "Koleksiyonlar"], "zh-Hans": ["选择功能", "成就", "收藏"], "zh-Hant": ["選擇功能", "成就", "收藏"] }), Ai = ["nav.tabs", "nav.achievements", "nav.collections"], we = (e) => {
  if (!e) throw Error("PRODUCT_TABS_LOCALE_CONTRACT");
}, zt = (e, t) => {
  const n = Object.getOwnPropertyDescriptor(e, t);
  return !!n && Object.hasOwn(n, "value");
};
function Si(e) {
  if (e === null) return null;
  we(!!e && Object.getPrototypeOf(e) === Object.prototype && Object.isFrozen(e) && Object.keys(e).length === 4 && ["epoch", "locale", "sha256", "catalog"].every((r) => zt(e, r)) && typeof e.locale == "string" && Number.isSafeInteger(e.epoch) && e.epoch >= 0 && Object.hasOwn(Ut, e.locale) && e.sha256 === Ut[e.locale]);
  const t = e.catalog;
  we(!!t && Object.getPrototypeOf(t) === Object.prototype && Object.isFrozen(t) && Object.keys(t).length === gt.length && gt.every((r) => zt(t, r) && typeof t[r] == "string" && t[r].trim()));
  const n = ki[e.locale];
  return we(!!n && Ai.every((r, i) => t[r] === n[i])), e;
}
function Ci(e) {
  let t = null, n = -1;
  return Object.freeze({ read() {
    const r = Si(e());
    return we(r === null || r === t || r.epoch > n), r;
  }, accept(r) {
    we(e() === r), r !== null && (n = Math.max(n, r.epoch)), t = r;
  }, same(r) {
    we(e() === r);
  } });
}
const Gt = "data-hkia-svelte-tabs", st =                 new WeakMap(), D = (e) => {
  if (!e) throw Error("PRODUCT_TAB_DOM_CONTRACT");
};
function ge(e, t) {
  const n = e.querySelectorAll(`[id="${t}"]`);
  return D(n.length === 1), n[0];
}
function Fn(e, t, n = null) {
  const r = n ? n.catalog["nav.tabs"] : "表示する機能";
  D(e.tagName === "DIV" && e.classList.contains("primary-tabs") && e.getAttribute("role") === "tablist" && e.getAttribute("aria-label") === r && (!n || e.getAttribute("lang") === n.locale) && e.children.length === 2);
  for (const [i, a] of Pn.entries()) {
    const s = e.children[i], l = Ln(t, a.value), o = n ? n.catalog[i === 0 ? "nav.achievements" : "nav.collections"] : a.label;
    D(s.tagName === "BUTTON" && s.id === a.id && s.type === "button" && s.getAttribute("role") === "tab" && s.getAttribute("aria-controls") === a.panel && s.getAttribute("aria-selected") === String(l.selected) && s.tabIndex === l.tabIndex && s.className === l.activeClass && s.children.length === 1 && s.children[0].tagName === "SPAN" && s.children[0].textContent === o && (!n || s.children[0].getAttribute("lang") === n.locale) && s.textContent?.trim() === `${a.icon} ${o}`);
  }
}
function xi(e, t, n, r) {
  return { achievementSelected: e.getAttribute("aria-selected"), collectionSelected: t.getAttribute("aria-selected"), achievementTabIndex: e.tabIndex, collectionTabIndex: t.tabIndex, achievementHidden: n.hidden, collectionHidden: r.hidden };
}
function Bt(e, t = null) {
  const n = ge(e, "achTab"), r = ge(e, "colTab"), i = ge(e, "achPanel"), a = ge(e, "colPanel"), s = n.parentElement;
  D(s && r.parentElement === s && s.parentElement && s.parentElement.classList.contains("workspace") && i.parentElement === s.parentElement && a.parentElement === s.parentElement), D(i.getAttribute("role") === "tabpanel" && a.getAttribute("role") === "tabpanel" && i.getAttribute("aria-labelledby") === "achTab" && a.getAttribute("aria-labelledby") === "colTab");
  const l = xi(n, r, i, a), o = Ye(l);
  return Fn(s, o, t), { a: n, c: r, ap: i, cp: a, host: s, state: l, active: o };
}
function Oi(e, t, n, r = () => null) {
  const i = Ci(r);
  let a;
  try {
    const p = i.read();
    if (a = Bt(e, p), i.same(p), st.has(e)) return st.get(e) === a.host ? "ALREADY_MOUNTED" : "LEGACY_RETAINED";
    D(p === null);
  } catch {
    return "LEGACY_RETAINED";
  }
  if (a.host.hasAttribute(Gt)) return "LEGACY_RETAINED";
  const s = a.host.parentElement, l = a.host.cloneNode(!1);
  l.setAttribute(Gt, "1");
  const o = e.activeElement === a.a ? "achTab" : e.activeElement === a.c ? "colTab" : null;
  let f = !1, h = !1, u, d = null;
  const v = (p) => {
    const _ = Bt(e, p);
    return D(_.host === (f ? l : a.host) && _.host.parentElement === s && _.ap === a.ap && _.cp === a.cp), D(f ? !!d && _.a === d[0] && _.c === d[1] && _.a.children[0] === d[2] && _.c.children[0] === d[3] : _.a === a.a && _.c === a.c), i.same(p), _;
  }, c = {
    get activeTab() {
      const p = i.read(), _ = v(p);
      return i.accept(p), _.active;
    },
    selectTab(p) {
      D(f);
      const _ = i.read();
      Ti({ read: () => v(_).state, setTab(y) {
        i.same(_), i.accept(_), t(y);
      } }).selectTab(p), i.same(_);
    }
  };
  try {
    u = n(l, a.active, c), D(typeof u == "function"), Fn(l, a.active);
    const p = v(null);
    return D(p.active === a.active), d = [l.children[0], l.children[1], l.children[0].children[0], l.children[1].children[0]], h = !0, a.host.replaceWith(l), f = !0, D(v(null).active === a.active), o && ge(e, o).focus(), st.set(e, l), "MOUNTED";
  } catch {
    if (f = !1, h && l.parentElement === s && a.host.parentElement === null)
      try {
        l.replaceWith(a.host), o && ge(e, o).focus();
      } catch {
      }
    try {
      u?.();
    } catch {
    }
    return "LEGACY_RETAINED";
  }
}
function Ri(e, t, n) {
  return Oi(e, t, (r, i, a) => {
    const s = ii(Ei, { target: r, props: { initialTab: i, port: a } }), l = () => {
      li(s).catch(() => {
      });
    };
    try {
      yr();
    } catch (o) {
      throw l(), o;
    }
    return l;
  }, n);
}
export {
  Ri as mountProductTabs
};
