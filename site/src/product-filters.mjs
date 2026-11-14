var ft = Array.isArray, ln = Array.prototype.indexOf, nt = Array.prototype.includes, ut = Array.from, ur = Object.defineProperty, Ve = Object.getOwnPropertyDescriptor, on = Object.getOwnPropertyDescriptors, cn = Object.prototype, fn = Array.prototype, dr = Object.getPrototypeOf, qt = Object.isExtensible;
const Et = () => {
};
function un(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function hr() {
  var e, t, r = new Promise((n, i) => {
    e = n, t = i;
  });
  return { promise: r, resolve: e, reject: t };
}
function dn(e, t) {
  if (Array.isArray(e))
    return e;
  if (!(Symbol.iterator in e))
    return Array.from(e);
  const r = [];
  for (const n of e)
    if (r.push(n), r.length === t) break;
  return r;
}
const L = 2, Ye = 4, dt = 8, vr = 1 << 24, K = 16, Q = 32, ae = 64, St = 128, Ft = 256, G = 512, I = 1024, D = 2048, X = 4096, F = 8192, z = 16384, Fe = 32768, kt = 1 << 25, Ce = 65536, it = 1 << 17, hn = 1 << 18, xe = 1 << 19, vn = 1 << 20, ee = 1 << 25, be = 65536, st = 1 << 21, Ae = 1 << 22, fe = 1 << 23, Be =                 Symbol("$state"), pr =                 Symbol("component"), pn =                 Symbol(""), _r =                 Symbol("attributes"), _n =                 Symbol("class"), mn =                 Symbol("style"), Nt =                 Symbol("text"), Ze = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), gn = (
                                                                                                             
  !!globalThis.document?.contentType &&                 globalThis.document.contentType.includes("xml")
), bn = 1, wn = 2, mr = 4, yn = 8, En = 16, Sn = 1, kn = 2, C =                 Symbol("uninitialized"), Nn = "http://www.w3.org/1999/xhtml";
function Tn() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function An() {
  console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function On() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function gr(e) {
  return e === this.v;
}
function Cn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function br(e) {
  return !Cn(e, this.v);
}
function In() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Dn(e, t, r) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function Rn() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Ln() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Fn() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function xn() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Pn() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let J = null;
function Ie(e) {
  J = e;
}
function wr(e, t = !1, r) {
  J = {
    p: J,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
                           
      y
    ),
    l: null
  };
}
function yr(e) {
  var t = (
                                   
    J
  ), r = t.e;
  if (r !== null) {
    t.e = null;
    for (var n of r)
      ii(n);
  }
  return t.i = !0, J = t.p, Er(e);
}
function Er(e = {}) {
  return ur(e, pr, { value: !0 }), e;
}
function Sr() {
  return !0;
}
let pe = [];
function kr() {
  var e = pe;
  pe = [], un(e);
}
function ce(e) {
  if (pe.length === 0 && !Ge) {
    var t = pe;
    queueMicrotask(() => {
      t === pe && kr();
    });
  }
  pe.push(e);
}
function Mn() {
  for (; pe.length > 0; )
    kr();
}
const Un = -7169;
function A(e, t) {
  e.f = e.f & Un | t;
}
function xt(e) {
  (e.f & G) !== 0 || e.deps === null ? A(e, I) : A(e, X);
}
function Nr(e) {
  if (e !== null)
    for (const t of e)
      (t.f & L) === 0 || (t.f & be) === 0 || (t.f ^= be, Nr(
                              
        t.deps
      ));
}
function Tr(e, t, r) {
  (e.f & D) !== 0 ? t.add(e) : (e.f & X) !== 0 && r.add(e), Nr(e.deps), A(e, I);
}
function ht(e) {
  var t = w, r = y;
  q(null), ne(null);
  try {
    return e();
  } finally {
    q(t), ne(r);
  }
}
function zn(e, t, r, n) {
  const i = Pt;
  var s = e.filter((h) => !h.settled), a = t.map(i);
  if (r.length === 0 && s.length === 0) {
    n(a);
    return;
  }
  var o = (
                         
    y
  ), l = jn(), c = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((h) => h.promise)) : null;
  function f(h) {
    if ((o.f & z) === 0) {
      l();
      try {
        n([...a, ...h]);
      } catch (v) {
        $(v, o);
      }
      at();
    }
  }
  var u = Ar();
  if (r.length === 0) {
    c.then(() => f([])).finally(u);
    return;
  }
  function d() {
    Promise.all(r.map((h) =>                 Hn(h))).then(f).catch((h) => $(h, o)).finally(u);
  }
  c ? c.then(() => {
    l(), d(), at();
  }) : d();
}
function jn() {
  var e = (
                         
    y
  ), t = w, r = J, n = (
                        
    g
  );
  return function(s = !0) {
    ne(e), q(t), Ie(r), s && (e.f & z) === 0 && (n?.activate(), n?.apply());
  };
}
function at(e = !0) {
  ne(null), q(null), Ie(null), e && g?.deactivate();
}
function Ar() {
  var e = (
                         
    y
  ), t = e.b, r = (
                        
    g
  ), n = !!t?.is_rendered();
  return t?.update_pending_count(1, r), r.increment(n, e), () => {
    t?.update_pending_count(-1, r), r.decrement(n, e);
  };
}
                       
function Pt(e) {
  var t = L | D;
  return y !== null && (y.f |= xe), {
    ctx: J,
    deps: null,
    effects: null,
    equals: gr,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      C
    ),
    wv: 0,
    parent: y,
    ac: null
  };
}
const Ue =                 Symbol("obsolete");
                       
function Hn(e, t, r) {
  let n = (
                                
    y
  );
  n === null && In();
  var i = (
                             
                          
    void 0
  ), s = we(
                    
    C
  ), a = !w, o =                 new Set();
  return ai(() => {
    var l = (
                           
      y
    ), c = hr();
    i = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, (h) => {
        h !== Ze && c.reject(h);
      }).finally(at);
    } catch (h) {
      c.reject(h), at();
    }
    var f = (
                          
      g
    );
    if (a) {
      if ((l.f & Fe) !== 0)
        var u = Ar();
      if (
                                                                                                                         
        n.b?.is_rendered()
      )
        f.async_deriveds.get(l)?.reject(Ue);
      else
        for (const h of o.values())
          h.reject(Ue);
      o.add(c), f.async_deriveds.set(l, c);
    }
    const d = (h, v = void 0) => {
      u?.(), o.delete(c), v !== Ue && (f.activate(), v ? (s.f |= fe, De(s, v)) : ((s.f & fe) !== 0 && (s.f ^= fe), De(s, h)), f.deactivate());
    };
    c.promise.then(d, (h) => d(null, h || "unknown"));
  }), jr(() => {
    for (const l of o)
      l.reject(Ue);
  }), new Promise((l) => {
    function c(f) {
      function u() {
        f === i ? l(s) : c(i);
      }
      f.then(u, u);
    }
    c(i);
  });
}
                       
function Vn(e) {
  const t =                 Pt(e);
  return qr(t), t;
}
                       
function Bn(e) {
  const t =                 Pt(e);
  return t.equals = br, t;
}
function Gn(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var r = 0; r < t.length; r += 1)
      P(
                             
        t[r]
      );
  }
}
function Mt(e) {
  var t, r = y, n = e.parent;
  if (!ye && n !== null && e.v !== C &&                                                                                                      
  (n.f & (z | F)) !== 0)
    return Tn(), e.v;
  ne(n);
  try {
    e.f &= ~be, Gn(e), t = Zr(e);
  } finally {
    ne(r);
  }
  return t;
}
function Or(e) {
  var t = Mt(e);
  if (!e.equals(t) && (e.wv = Kr(), (!g?.is_fork || e.deps === null) && (g !== null ? (g.capture(e, t, !0), Tt?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    A(e, I);
    return;
  }
  ye || (W !== null ? (jt() || g?.is_fork) && W.set(e, t) : xt(e));
}
function qn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ht(() => {
        t.ac.abort(Ze), t.ac = null;
      }), t.fn !== null && (t.teardown = Et), We(t, 0), Vt(t));
}
function Cr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Re(t);
}
let pt = null, Ee = null, g = null, Tt = null, W = null, At = null, Ge = !1, _t = !1, Te = null, et = null;
var Yt = 0;
let Yn = 1;
class de {
  id = Yn++;
                                              
  #t = !1;
  linked = !0;
                             
  #a = null;
                             
  #e = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #o =                 new Set();
     
                                                                                     
                                        
     
  #n =                 new Set();
     
                                                             
     
  #s = 0;
     
                                                                                
                                
     
  #r =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #l = null;
     
                                             
                     
     
  #i = [];
     
                                                 
                     
     
  #p = [];
     
                                                                               
                        
     
  #c =                 new Set();
     
                                          
                        
     
  #f =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #d =                 new Map();
     
                                                                                                    
                        
     
  #_ =                 new Set();
  is_fork = !1;
  #u = !1;
  constructor() {
    Ee === null ? pt = Ee = this : (Ee.#e = this, this.#a = Ee), Ee = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const n of this.#r.keys()) {
      for (var t = n, r = !1; t.parent !== null; ) {
        if (this.#d.has(t)) {
          r = !0;
          break;
        }
        t = t.parent;
      }
      if (!r)
        return !0;
    }
    return !1;
  }
     
                                                                      
                           
     
  skip_effect(t) {
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#_.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, r = (n) => this.schedule(n)) {
    var n = this.#d.get(t);
    if (n) {
      this.#d.delete(t);
      for (var i of n.d)
        A(i, D), r(i);
      for (i of n.m)
        A(i, X), r(i);
    }
    this.#_.add(t);
  }
  #m() {
    this.#t = !0, Yt++ > 1e3 && (this.#v(), Wn());
    for (const l of this.#c)
      this.#f.delete(l), A(l, D), this.schedule(l);
    for (const l of this.#f)
      A(l, X), this.schedule(l);
    const t = this.#i;
    this.#i = [], this.apply();
    var r = Te = [], n = [], i = et = [];
    for (const l of t)
      try {
        this.#y(l, r, n);
      } catch (c) {
        throw Rr(l), this.#b() || this.discard(), c;
      }
    if (g = null, i.length > 0) {
      var s = de.ensure();
      for (const l of i)
        s.schedule(l);
    }
    if (Te = null, et = null, this.#b()) {
      this.#h(n), this.#h(r);
      for (const [l, c] of this.#d)
        Dr(l, c);
      i.length > 0 &&                       
      g.#m();
      return;
    }
    const a = this.#w();
    if (a) {
      this.#h(n), this.#h(r), a.#E(this);
      return;
    }
    this.#c.clear(), this.#f.clear();
    for (const l of this.#o) l(this);
    this.#o.clear(), Tt = this, Kt(n), Kt(r), Tt = null, this.#l?.resolve();
    var o = (
                                 
                            
      g
    );
    if (this.#s === 0 && (this.#i.length === 0 || o !== null) && this.#v(), this.#i.length > 0)
      if (o !== null) {
        const l = o;
        l.#i.push(...this.#i.filter((c) => !l.#i.includes(c)));
      } else
        o = this;
    o !== null && (te.clear(), o.#m());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #y(t, r, n) {
    t.f ^= I;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (Q | ae)) !== 0, o = a && (s & I) !== 0, l = o || (s & F) !== 0 || this.#d.has(i);
      if (!l && i.fn !== null) {
        a ? i.f ^= I : (s & Ye) !== 0 ? r.push(i) : Qe(i) && ((s & K) !== 0 && this.#f.add(i), Re(i));
        var c = i.first;
        if (c !== null) {
          i = c;
          continue;
        }
      }
      for (; i !== null; ) {
        var f = i.next;
        if (f !== null) {
          i = f;
          break;
        }
        i = i.parent;
      }
    }
  }
  #w() {
    for (var t = this.#a; t !== null; ) {
      if (!t.is_fork) {
        for (const [r, [, n]] of this.current)
          if (t.current.has(r) && !n)
            return t;
      }
      t = t.#a;
    }
    return null;
  }
     
                         
     
  #E(t) {
    for (const [n, i] of t.current)
      !this.previous.has(n) && t.previous.has(n) && this.previous.set(n, t.previous.get(n)), this.current.set(n, i);
    for (const [n, i] of t.async_deriveds) {
      const s = this.async_deriveds.get(n);
      s && i.promise.then(s.resolve).catch(s.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#f);
    const r = (n) => {
      var i = n.reactions;
      if (i !== null && !((n.f & L) !== 0 && (n.f & (D | X)) === 0))
        for (const o of i) {
          var s = o.f;
          if ((s & L) !== 0)
            r(
                                    
              o
            );
          else {
            var a = (
                                   
              o
            );
            s & (Ae | K) && !this.async_deriveds.has(a) && (this.#f.delete(a), A(a, D), this.schedule(a));
          }
        }
    };
    for (const n of this.current.keys())
      r(n);
    this.oncommit(() => t.discard()), t.#v(), g = this, this.#m();
  }
     
                              
     
  #h(t) {
    for (var r = 0; r < t.length; r += 1)
      Tr(t[r], this.#c, this.#f);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, r, n = !1) {
    t.v !== C && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & fe) === 0 && (this.current.set(t, [r, n]), W?.set(t, r)), this.is_fork || (t.v = r);
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, W = null;
  }
  flush() {
    try {
      _t = !0, g = this, this.#m();
    } finally {
      Yt = 0, At = null, Te = null, et = null, _t = !1, g = null, W = null, te.clear();
    }
  }
  discard() {
    for (const t of this.#n) t(this);
    this.#n.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Ue);
    this.#v(), this.#l?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#p.push(t);
  }
  #g() {
    for (let u = pt; u !== null; u = u.#e) {
      var t = u.id < this.id, r = [];
      for (const [d, [h, v]] of this.current) {
        if (u.current.has(d)) {
          var n = (
                                         
            u.current.get(d)[0]
          );
          if (t && h !== n)
            u.current.set(d, [h, v]);
          else
            continue;
        }
        r.push(d);
      }
      if (t)
        for (const [d, h] of this.async_deriveds) {
          const v = u.async_deriveds.get(d);
          v && h.promise.then(v.resolve).catch(v.reject);
        }
      var i = [...u.current.keys()].filter(
        (d) => !                             
        u.current.get(d)[1]
      );
      if (!(!u.#t || i.length === 0)) {
        var s = i.filter((d) => !this.current.has(d));
        if (s.length === 0)
          t && u.discard();
        else if (r.length > 0) {
          if (t)
            for (const d of this.#_)
              u.unskip_effect(d, (h) => {
                (h.f & (K | Ae)) !== 0 ? u.schedule(h) : u.#h([h]);
              });
          u.activate();
          var a =                 new Set(), o =                 new Map();
          for (var l of r)
            Ir(l, s, a, o);
          o =                 new Map();
          var c = [...u.current].filter(([d, h]) => {
            const v = this.current.get(d);
            return v ? v[0] !== h[0] || v[1] !== h[1] : !0;
          }).map(([d]) => d);
          if (c.length > 0)
            for (const d of this.#p)
              (d.f & (z | F | it)) === 0 && Ut(d, c, o) && ((d.f & (Ae | K)) !== 0 ? (A(d, D), u.schedule(d)) : u.#c.add(d));
          if (u.#i.length > 0 && !u.#u) {
            u.apply();
            for (var f of u.#i)
              u.#y(f, [], []);
            u.#i = [];
          }
          u.deactivate();
        }
      }
    }
  }
     
                              
                           
     
  increment(t, r) {
    if (this.#s += 1, t) {
      let n = this.#r.get(r) ?? 0;
      this.#r.set(r, n + 1);
    }
  }
     
                              
                           
     
  decrement(t, r) {
    if (this.#s -= 1, t) {
      let n = this.#r.get(r) ?? 0;
      n === 1 ? this.#r.delete(r) : this.#r.set(r, n - 1);
    }
    this.#u || (this.#u = !0, ce(() => {
      this.#u = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, r) {
    for (const n of t)
      this.#c.add(n);
    for (const n of r)
      this.#f.add(n);
    t.clear(), r.clear();
  }
                                           
  oncommit(t) {
    this.#o.add(t);
  }
                                           
  ondiscard(t) {
    this.#n.add(t);
  }
  settled() {
    return (this.#l ??= hr()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new de();
      !_t && !Ge && ce(() => {
        t.#t || t.flush();
      });
    }
    return g;
  }
  apply() {
    {
      W = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (At = t, t.b?.is_pending && (t.f & (Ye | dt | vr)) !== 0 && (t.f & Fe) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var r = t; r.parent !== null; ) {
      r = r.parent;
      var n = r.f;
      if (Te !== null && r === y && (w === null || (w.f & L) === 0))
        return;
      if ((n & (ae | Q)) !== 0) {
        if ((n & I) === 0)
          return;
        r.f ^= I;
      }
    }
    this.#i.push(r);
  }
  #v() {
    if (this.linked) {
      var t = this.#a, r = this.#e;
      t === null ? pt = r : t.#e = r, r === null ? Ee = t : r.#a = t, this.linked = !1;
    }
  }
}
function Kn(e) {
  var t = Ge;
  Ge = !0;
  try {
    for (var r; ; ) {
      if (Mn(), g === null)
        return (
                          
          r
        );
      g.flush();
    }
  } finally {
    Ge = t;
  }
}
function Wn() {
  try {
    Rn();
  } catch (e) {
    $(e, At);
  }
}
let se = null;
function Kt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var r = 0; r < t; ) {
      var n = e[r++];
      if ((n.f & (z | F)) === 0 && Qe(n) && (se =                 new Set(), Re(n), n.deps === null && n.first === null && n.nodes === null && n.teardown === null && n.ac === null && Vr(n), se?.size > 0)) {
        te.clear();
        for (const i of se) {
          if ((i.f & (z | F)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            se.has(a) && (se.delete(a), s.push(a)), a = a.parent;
          for (let o = s.length - 1; o >= 0; o--) {
            const l = s[o];
            (l.f & (z | F)) === 0 && Re(l);
          }
        }
        se.clear();
      }
    }
    se = null;
  }
}
function Ir(e, t, r, n) {
  if (!r.has(e) && (r.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & L) !== 0 ? Ir(
                              
        i,
        t,
        r,
        n
      ) : (s & (Ae | K)) !== 0 && (s & D) === 0 && Ut(i, t, n) && (A(i, D), zt(
                             
        i
      ));
    }
}
function Ut(e, t, r) {
  const n = r.get(e);
  if (n !== void 0) return n;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (nt.call(t, i))
        return !0;
      if ((i.f & L) !== 0 && Ut(
                              
        i,
        t,
        r
      ))
        return r.set(
                                
          i,
          !0
        ), !0;
    }
  return r.set(e, !1), !1;
}
function zt(e) {
  g.schedule(e);
}
function Dr(e, t) {
  if (!((e.f & Q) !== 0 && (e.f & I) !== 0)) {
    (e.f & D) !== 0 ? t.d.push(e) : (e.f & X) !== 0 && t.m.push(e), A(e, I);
    for (var r = e.first; r !== null; )
      Dr(r, t), r = r.next;
  }
}
function Rr(e) {
  A(e, I);
  for (var t = e.first; t !== null; )
    Rr(t), t = t.next;
}
let lt =                 new Set();
const te =                 new Map();
let Lr = !1;
function we(e, t) {
  var r = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: gr,
    rv: 0,
    wv: 0
  };
  return r;
}
                       
function le(e, t) {
  const r = we(e);
  return qr(r), r;
}
                       
function Zn(e, t = !1, r = !0) {
  const n = we(e);
  return t || (n.equals = br), n;
}
function ve(e, t, r = !1) {
  w !== null &&                                                                                         
                                                                
  (!Z || (w.f & it) !== 0) && Sr() && (w.f & (L | K | Ae | it)) !== 0 && (re === null || !re.has(e)) && xn();
  let n = r ? ze(t) : t;
  return De(e, n, et);
}
function De(e, t, r = null) {
  if (!e.equals(t)) {
    ye ? te.set(e, t) : te.has(e) || te.set(e, e.v);
    var n = de.ensure();
    if (n.capture(e, t), (e.f & L) !== 0) {
      const i = (
                              
        e
      );
      (e.f & D) !== 0 && Mt(i), W === null && xt(i);
    }
    e.wv = Kr(), Fr(e, D, r), y !== null && (y.f & I) !== 0 && (y.f & (Q | ae)) === 0 && (j === null ? fi([e]) : j.push(e)), !n.is_fork && lt.size > 0 && !Lr && Xn();
  }
  return t;
}
function Xn() {
  Lr = !1;
  for (const e of lt) {
    (e.f & I) !== 0 && A(e, X);
    let t;
    try {
      t = Qe(e);
    } catch {
      t = !0;
    }
    t && Re(e);
  }
  lt.clear();
}
function qe(e) {
  ve(e, e.v + 1);
}
function Fr(e, t, r) {
  var n = e.reactions;
  if (n !== null)
    for (var i = n.length, s = 0; s < i; s++) {
      var a = n[s], o = a.f, l = (o & D) === 0;
      if (l && A(a, t), (o & it) !== 0)
        lt.add(
                               
          a
        );
      else if ((o & L) !== 0) {
        var c = (
                                
          a
        );
        W?.delete(c), (o & be) === 0 && (o & G && (y === null || (y.f & st) === 0) && (a.f |= be), Fr(c, X, r));
      } else if (l) {
        var f = (
                               
          a
        );
        (o & K) !== 0 && se !== null && se.add(f), r !== null ? r.push(f) : zt(f);
      }
    }
}
function ze(e) {
  if (typeof e != "object" || e === null || Be in e || pr in e)
    return e;
  const t = dr(e);
  if (t !== cn && t !== fn)
    return e;
  var r =                 new Map(), n = ft(e), i =                 le(0), s = ge, a = (o) => {
    if (ge === s)
      return o();
    var l = w, c = ge;
    q(null), Jt(s);
    var f = o();
    return q(l), Jt(c), f;
  };
  return n && r.set("length",                 le(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(o, l, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Ln();
        var f = r.get(l);
        return f === void 0 ? a(() => {
          var u =                 le(c.value);
          return r.set(l, u), u;
        }) : ve(f, c.value, !0), !0;
      },
      deleteProperty(o, l) {
        var c = r.get(l);
        if (c === void 0) {
          if (l in o) {
            const f = a(() =>                 le(C));
            r.set(l, f), qe(i);
          }
        } else
          ve(c, C), qe(i);
        return !0;
      },
      get(o, l, c) {
        if (l === Be)
          return e;
        var f = r.get(l), u = l in o;
        if (f === void 0 && (!u || Ve(o, l)?.writable) && (f = a(() => {
          var h = ze(u ? o[l] : C), v =                 le(h);
          return v;
        }), r.set(l, f)), f !== void 0) {
          var d = V(f);
          return d === C ? void 0 : d;
        }
        return Reflect.get(o, l, c);
      },
      getOwnPropertyDescriptor(o, l) {
        var c = Reflect.getOwnPropertyDescriptor(o, l);
        if (c && "value" in c) {
          var f = r.get(l);
          f && (c.value = V(f));
        } else if (c === void 0) {
          var u = r.get(l), d = u?.v;
          if (u !== void 0 && d !== C)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return c;
      },
      has(o, l) {
        if (l === Be)
          return !0;
        var c = r.get(l), f = c !== void 0 && c.v !== C || Reflect.has(o, l);
        if (c !== void 0 || y !== null && (!f || Ve(o, l)?.writable)) {
          c === void 0 && (c = a(() => {
            var d = f ? ze(o[l]) : C, h =                 le(d);
            return h;
          }), r.set(l, c));
          var u = V(c);
          if (u === C)
            return !1;
        }
        return f;
      },
      set(o, l, c, f) {
        var u = r.get(l), d = l in o;
        if (n && l === "length")
          for (var h = c; h <                              
          u.v; h += 1) {
            var v = r.get(h + "");
            v !== void 0 ? ve(v, C) : h in o && (v = a(() =>                 le(C)), r.set(h + "", v));
          }
        if (u === void 0)
          (!d || Ve(o, l)?.writable) && (u = a(() =>                 le(void 0)), ve(u, ze(c)), r.set(l, u));
        else {
          d = u.v !== C;
          var b = a(() => ze(c));
          ve(u, b);
        }
        var p = Reflect.getOwnPropertyDescriptor(o, l);
        if (p?.set && p.set.call(f, c), !d) {
          if (n && typeof l == "string") {
            var m = (
                                           
              r.get("length")
            ), N = Number(l);
            Number.isInteger(N) && N >= m.v && ve(m, N + 1);
          }
          qe(i);
        }
        return !0;
      },
      ownKeys(o) {
        V(i);
        var l = Reflect.ownKeys(o).filter((u) => {
          var d = r.get(u);
          return d === void 0 || d.v !== C;
        });
        for (var [c, f] of r)
          f.v !== C && !(c in o) && l.push(c);
        return l;
      },
      setPrototypeOf() {
        Fn();
      }
    }
  );
}
function Wt(e) {
  try {
    if (e !== null && typeof e == "object" && Be in e)
      return e[Be];
  } catch {
  }
  return e;
}
function xr(e, t) {
  return Object.is(Wt(e), Wt(t));
}
var Zt, Pr, Mr, Ur;
function Qn() {
  if (Zt === void 0) {
    Zt = window, Pr = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, r = Text.prototype;
    Mr = Ve(t, "firstChild").get, Ur = Ve(t, "nextSibling").get, qt(e) && (e[_n] = void 0, e[_r] = null, e[mn] = void 0, e.__e = void 0), qt(r) && (r[Nt] = void 0);
  }
}
function ue(e = "") {
  return document.createTextNode(e);
}
                       
function Ke(e) {
  return (
                                      
    Mr.call(e)
  );
}
                       
function Xe(e) {
  return (
                                      
    Ur.call(e)
  );
}
function Jn(e, t) {
  return                 Ke(e);
}
function Je(e, t = !1) {
  {
    var r =                 Ke(e);
    return r instanceof Comment && r.data === "" ?                 Xe(r) : r;
  }
}
function $n(e, t = !1) {
  return                 Ke(e);
}
function Xt(e, t = 1, r = !1) {
  let n = e;
  for (; t--; )
    n =                            
                    Xe(n);
  return n;
}
function ei(e) {
  e.textContent = "";
}
function zr() {
  return !1;
}
function ti(e, t, r) {
  return (
                                                                                             
    r ? document.createElement(e, { is: r }) : document.createElement(e)
  );
}
function ri(e) {
  var t = y;
  if (t === null)
    return w.f |= fe, e;
  if ((t.f & Fe) === 0 && (t.f & Ye) === 0)
    throw e;
  $(e, t);
}
function $(e, t) {
  if (!(t !== null && (t.f & z) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & St) !== 0 && (t.f & (z | kt)) === 0) {
        if ((t.f & Fe) === 0)
          throw e;
        try {
          t.b.error(e);
          return;
        } catch (r) {
          e = r;
        }
      }
      t = t.parent;
    }
    throw e;
  }
}
function ni(e, t) {
  var r = t.last;
  r === null ? t.last = t.first = e : (r.next = e, e.prev = r, t.last = e);
}
function he(e, t) {
  var r = y;
  r !== null && (r.f & F) !== 0 && (e |= F);
  var n = {
    ctx: J,
    deps: null,
    nodes: null,
    f: e | D | G,
    first: null,
    fn: t,
    last: null,
    next: null,
    parent: r,
    b: r && r.b,
    prev: null,
    teardown: null,
    wv: 0,
    ac: null
  };
  g?.register_created_effect(n);
  var i = n;
  if ((e & Ye) !== 0)
    Te !== null ? Te.push(n) : de.ensure().schedule(n);
  else if (t !== null) {
    try {
      Re(n);
    } catch (a) {
      throw P(n), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & xe) === 0 && (i = i.first, (e & K) !== 0 && (e & Ce) !== 0 && i !== null && (i.f |= Ce));
  }
  if (i !== null && (i.parent = r, r !== null && ni(i, r), w !== null && (w.f & L) !== 0 && (e & ae) === 0)) {
    var s = (
                            
      w
    );
    (s.effects ??= []).push(i);
  }
  return n;
}
function jt() {
  return w !== null && !Z;
}
function jr(e) {
  const t = he(dt, null);
  return A(t, I), t.teardown = e, t;
}
function ii(e) {
  return he(Ye | vn, e);
}
function si(e) {
  de.ensure();
  const t = he(ae | xe, e);
  return (r = {}) => new Promise((n) => {
    r.outro ? me(t, () => {
      P(t), n(void 0);
    }) : (P(t), n(void 0));
  });
}
function ai(e) {
  return he(Ae | xe, e);
}
function li(e, t = 0) {
  return he(dt | t, e);
}
function mt(e, t = [], r = [], n = []) {
  zn(n, t, r, (i) => {
    he(dt, () => {
      e(...i.map(V));
    });
  });
}
function Ht(e, t = 0) {
  var r = he(K | t, e);
  return r;
}
function H(e) {
  return he(Q | xe, e);
}
function Hr(e) {
  var t = e.teardown;
  if (t !== null) {
    const r = ye, n = w;
    Qt(!0), q(null);
    try {
      t.call(null);
    } catch (i) {
      $(i, e.parent);
    } finally {
      Qt(r), q(n);
    }
  }
}
function Vt(e, t = !1) {
  var r = e.first;
  for (e.first = e.last = null; r !== null; ) {
    const i = r.ac;
    i !== null && ht(() => {
      i.abort(Ze);
    });
    var n = r.next;
    (r.f & ae) !== 0 ? r.parent = null : P(r, t), r = n;
  }
}
function oi(e) {
  for (var t = e.first; t !== null; ) {
    var r = t.next;
    (t.f & Q) === 0 && P(t), t = r;
  }
}
function P(e, t = !0) {
  var r = !1;
  (t || (e.f & hn) !== 0) && e.nodes !== null && e.nodes.end !== null && (ci(
    e.nodes.start,
                               
    e.nodes.end
  ), r = !0), e.f |= kt, Vt(e, t && !r), We(e, 0);
  var n = e.nodes && e.nodes.t;
  if (n !== null)
    for (const s of n)
      s.stop();
  Hr(e), e.f ^= kt, e.f |= z;
  var i = e.parent;
  i !== null && i.first !== null && Vr(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function ci(e, t) {
  for (; e !== null; ) {
    var r = e === t ? null :                 Xe(e);
    e.remove(), e = r;
  }
}
function Vr(e) {
  var t = e.parent, r = e.prev, n = e.next;
  r !== null && (r.next = n), n !== null && (n.prev = r), t !== null && (t.first === e && (t.first = n), t.last === e && (t.last = r));
}
function me(e, t, r = !0) {
  var n = [];
  e.f |= Ft, Br(e, n, !0);
  var i = () => {
    r && P(e), t && t();
  }, s = n.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var o of n)
      o.out(a);
  } else
    i();
}
function Br(e, t, r) {
  if ((e.f & F) === 0) {
    e.f ^= F;
    var n = e.nodes && e.nodes.t;
    if (n !== null)
      for (const o of n)
        (o.is_global || r) && t.push(o);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & ae) === 0) {
        var a = (i.f & Ce) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & Q) !== 0 && (e.f & K) !== 0;
        Br(i, t, a ? r : !1);
      }
      i = s;
    }
  }
}
function ot(e) {
  e.f &= ~Ft, Gr(e, !0);
}
function Gr(e, t) {
  if ((e.f & Ft) === 0 && (e.f & F) !== 0) {
    e.f ^= F, (e.f & I) === 0 && (A(e, D), de.ensure().schedule(e));
    for (var r = e.first; r !== null; ) {
      var n = r.next, i = (r.f & Ce) !== 0 || (r.f & Q) !== 0;
      Gr(r, i ? t : !1), r = n;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function Bt(e, t) {
  if (e.nodes)
    for (var r = e.nodes.start, n = e.nodes.end; r !== null; ) {
      var i = r === n ? null :                 Xe(r);
      t.append(r), r = i;
    }
}
let tt = !1, ye = !1;
function Qt(e) {
  ye = e;
}
let w = null, Z = !1;
function q(e) {
  w = e;
}
let y = null;
function ne(e) {
  y = e;
}
let re = null;
function qr(e) {
  w !== null && (re ??=                 new Set()).add(e);
}
let x = null, U = 0, j = null;
function fi(e) {
  j = e;
}
let Yr = 1, _e = 0, ge = _e;
function Jt(e) {
  ge = e;
}
function Kr() {
  return ++Yr;
}
function Qe(e) {
  var t = e.f;
  if ((t & D) !== 0)
    return !0;
  if (t & L && (e.f &= ~be), (t & X) !== 0) {
    for (var r = (
                            
      e.deps
    ), n = r.length, i = 0; i < n; i++) {
      var s = r[i];
      if (Qe(
                              
        s
      ) && Or(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & G) !== 0 &&                                                                   
                                                                
    W === null && A(e, I);
  }
  return !1;
}
function Wr(e, t, r = !0) {
  var n = e.reactions;
  if (n !== null && !(re !== null && re.has(e)))
    for (var i = 0; i < n.length; i++) {
      var s = n[i];
      (s.f & L) !== 0 ? Wr(
                              
        s,
        t,
        !1
      ) : t === s && (r ? A(s, D) : (s.f & I) !== 0 && A(s, X), zt(
                             
        s
      ));
    }
}
function Zr(e) {
  var t = x, r = U, n = j, i = w, s = re, a = J, o = Z, l = ge, c = e.f;
  x =                              
  null, U = 0, j = null, w = (c & (Q | ae)) === 0 ? e : null, re = null, Ie(e.ctx), Z = !1, ge = ++_e, e.ac !== null && (ht(() => {
    e.ac.abort(Ze);
  }), e.ac = null);
  try {
    e.f |= st;
    var f = (
                             
      e.fn
    ), u = f();
    e.f |= Fe;
    var d = $t(e);
    if (Sr() && j !== null && !Z && d !== null && (e.f & (L | X | D)) === 0)
      for (var h = 0; h <                        
      j.length; h++)
        Wr(
          j[h],
                               
          e
        );
    if (i !== null && i !== e) {
      if (_e++, i.deps !== null)
        for (let v = 0; v < r; v += 1)
          i.deps[v].rv = _e;
      if (t !== null)
        for (const v of t)
          v.rv = _e;
      j !== null && (n === null ? n = j : n.push(...                       
      j));
    }
    return (e.f & fe) !== 0 && (e.f ^= fe), u;
  } catch (v) {
    return $t(e), ri(v);
  } finally {
    e.f ^= st, x = t, U = r, j = n, w = i, re = s, Ie(a), Z = o, ge = l;
  }
}
function $t(e) {
  var t = e.deps, r = g?.is_fork;
  if (x !== null) {
    var n;
    if (r || We(e, U), t !== null && U > 0)
      for (t.length = U + x.length, n = 0; n < x.length; n++)
        t[U + n] = x[n];
    else
      e.deps = t = x;
    if (jt() && (e.f & G) !== 0)
      for (n = U; n < t.length; n++)
        (t[n].reactions ??= []).push(e);
  } else !r && t !== null && U < t.length && (We(e, U), t.length = U);
  return t;
}
function ui(e, t) {
  let r = t.reactions;
  if (r !== null) {
    var n = ln.call(r, e);
    if (n !== -1) {
      var i = r.length - 1;
      i === 0 ? r = t.reactions = null : (r[n] = r[i], r.pop());
    }
  }
  if (r === null && (t.f & L) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (x === null || !nt.call(x, t))) {
    var s = (
                            
      t
    );
    (s.f & G) !== 0 && (s.f ^= G, s.f &= ~be), s.v !== C && xt(s), s.ac !== null && ht(() => {
      s.ac.abort(Ze), s.ac = null, A(s, D);
    }), qn(s), We(s, 0);
  }
}
function We(e, t) {
  var r = e.deps;
  if (r !== null)
    for (var n = t; n < r.length; n++)
      ui(e, r[n]);
}
function Re(e) {
  var t = e.f;
  if ((t & z) === 0) {
    A(e, I);
    var r = y, n = tt;
    y = e, tt = (t & (Q | ae)) === 0;
    try {
      (t & (K | vr)) !== 0 ? oi(e) : Vt(e), Hr(e);
      var i = Zr(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Yr;
      var s;
    } finally {
      tt = n, y = r;
    }
  }
}
function V(e) {
  var t = e.f, r = (t & L) !== 0;
  if (w !== null && !Z) {
    var n = y !== null && (y.f & z) !== 0;
    if (!n && (re === null || !re.has(e))) {
      var i = w.deps;
      if ((w.f & st) !== 0)
        e.rv < _e && (e.rv = _e, x === null && i !== null && i[U] === e ? U++ : x === null ? x = [e] : x.push(e));
      else {
        w.deps ??= [], nt.call(w.deps, e) || w.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [w] : nt.call(s, w) || s.push(w);
      }
    }
  }
  if (ye && te.has(e))
    return te.get(e);
  if (r) {
    var a = (
                            
      e
    );
    if (ye) {
      var o = a.v;
      return ((a.f & I) === 0 && a.reactions !== null || Qr(a)) && (o = Mt(a)), te.set(a, o), o;
    }
    var l = (a.f & G) === 0 && !Z && w !== null && (tt || (w.f & G) !== 0), c = (a.f & Fe) === 0;
    Qe(a) && (l && (a.f |= G), Or(a)), l && !c && (Cr(a), Xr(a));
  }
  if (W?.has(e))
    return W.get(e);
  if ((e.f & fe) !== 0)
    throw e.v;
  return e.v;
}
function Xr(e) {
  if (e.f |= G, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & L) !== 0 && (t.f & G) === 0 && (Cr(
                              
        t
      ), Xr(
                              
        t
      ));
}
function Qr(e) {
  if (e.v === C) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (te.has(t) || (t.f & L) !== 0 && Qr(
                            
      t
    ))
      return !0;
  return !1;
}
function di(e) {
  var t = Z;
  try {
    return Z = !0, e();
  } finally {
    Z = t;
  }
}
const hi = ["touchstart", "touchmove"];
function vi(e) {
  return hi.includes(e);
}
const je =                 Symbol("events"), Jr =                 new Set(), Ot =                 new Set();
function er(e, t, r) {
  (t[je] ??= {})[e] = r;
}
function pi(e) {
  for (var t = 0; t < e.length; t++)
    Jr.add(e[t]);
  for (var r of Ot)
    r(e);
}
let gt = null, bt = !1;
function tr(e) {
  var t = this, r = (
                       
    t.ownerDocument
  ), n = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  gt = e, bt || (bt = !0, setTimeout(() => {
    bt = !1, gt = null;
  }));
  var a = 0, o = gt === e && e[je];
  if (o) {
    var l = i.indexOf(o);
    if (l !== -1 && (t === document || t ===                   
    window)) {
      e[je] = t;
      return;
    }
    var c = i.indexOf(t);
    if (c === -1)
      return;
    l <= c && (a = l);
  }
  if (s =                       
  i[a] || e.target, s !== t) {
    ur(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || r;
      }
    });
    var f = w, u = y;
    q(null), ne(null);
    try {
      for (var d, h = []; s !== null && s !== t; ) {
        try {
          var v = s[je]?.[n];
          v != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && v.call(s, e);
        } catch (b) {
          d ? h.push(b) : d = b;
        }
        if (e.cancelBubble) break;
        a++, s = a < i.length ? (
                                
          i[a]
        ) : null;
      }
      if (d) {
        for (let b of h)
          queueMicrotask(() => {
            throw b;
          });
        throw d;
      }
    } finally {
      e[je] = t, delete e.currentTarget, q(f), ne(u);
    }
  }
}
const _i = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function mi(e) {
  return (
                         
    _i?.createHTML(e) ?? e
  );
}
function gi(e) {
  var t = ti("template");
  return t.innerHTML = mi(e.replaceAll("<!>", "<!---->")), t.content;
}
function Ct(e, t) {
  var r = (
                         
    y
  );
  r.nodes === null && (r.nodes = { start: e, end: t, a: null, t: null });
}
                       
function vt(e, t) {
  var r = (t & Sn) !== 0, n = (t & kn) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = gi(s ? e : "<!>" + e), r || (i =                            
                    Ke(i)));
    var a = (
                                 
      n || Pr ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (r) {
      var o = (
                                   
                        Ke(a)
      ), l = (
                                   
        a.lastChild
      );
      Ct(o, l);
    } else
      Ct(a, a);
    return a;
  };
}
function rr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), r = ue();
  return e.append(t, r), Ct(t, r), e;
}
function Se(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function bi(e) {
  let t = 0, r = we(0), n;
  return () => {
    jt() && (V(r), li(() => (t === 0 && (n = di(() => e(() => qe(r)))), t += 1, () => {
      ce(() => {
        t -= 1, t === 0 && (n?.(), n = void 0, qe(r));
      });
    })));
  };
}
var wi = Ce | xe;
function yi(e, t, r, n) {
  new Ei(e, t, r, n);
}
class Ei {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #t;
                                    
  #a = null;
                              
  #e;
                                         
  #o;
                       
  #n;
                              
  #s = null;
                              
  #r = null;
                              
  #l = null;
                                        
  #i = null;
  #p = 0;
  #c = 0;
  #f = !1;
                            
  #d =                 new Set();
                            
  #_ =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #u = null;
  #b = bi(() => (this.#u = we(this.#p), () => {
    this.#u = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, r, n, i) {
    this.#t = t, this.#e = r, this.#o = (s) => {
      var a = (
                             
        y
      );
      a.b = this, a.f |= St, n(s);
    }, this.parent =                      
    y.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#n = Ht(() => {
      this.#h();
    }, wi);
  }
  #m() {
    try {
      this.#s = H(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #y(t) {
    const r = this.#e.failed, { reset: n, invoke_onerror: i } = this.#w(t);
    ce(i), r && (this.#l = H(() => {
      r(
        this.#t,
        () => t,
        () => n
      );
    }));
  }
     
                                                                              
                                                 
                           
                                                                 
     
  #w(t) {
    var r = !1, n = !1;
    const i = () => {
      if (r) {
        On();
        return;
      }
      r = !0, n && Pn(), this.#l !== null && me(this.#l, () => {
        this.#l = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        n = !0, this.#e.onerror?.(t, i), n = !1;
      } catch (a) {
        $(a, this.#n && this.#n.parent);
      }
    } };
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#r = H(() => t(this.#t)), ce(() => {
      var r = this.#i = document.createDocumentFragment(), n = ue(), i = !1;
      if (r.append(n), this.#s = this.#v(() => {
        try {
          return H(() => this.#o(n));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (a) {
            $(a, this.#n.parent);
          }
          return null;
        }
      }), this.#s === null) {
        this.#i = null, i && this.#g(
                              
          g
        );
        return;
      }
      this.#c === 0 && (this.#t.before(r), this.#i = null, me(
                             
        this.#r,
        () => {
          this.#r = null;
        }
      ), this.#g(
                            
        g
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#p = 0, this.#s = H(() => {
        this.#o(this.#t);
      }), this.#c > 0) {
        var t = this.#i = document.createDocumentFragment();
        Bt(this.#s, t);
        const r = (
                                               
          this.#e.pending
        );
        this.#r = H(() => r(this.#t));
      } else
        this.#g(
                              
          g
        );
    } catch (r) {
      this.error(r);
    }
  }
     
                         
     
  #g(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#_);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    Tr(t, this.#d, this.#_);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var r = y, n = w, i = J;
    ne(this.#n), q(this.#n), Ie(this.#n.ctx);
    try {
      return de.ensure(), t();
    } finally {
      ne(r), q(n), Ie(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #S(t, r) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#S(t, r);
      return;
    }
    this.#c += t, this.#c === 0 && (this.#g(r), this.#r && me(this.#r, () => {
      this.#r = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, r) {
    this.#S(t, r), this.#p += t, !(!this.#u || this.#f) && (this.#f = !0, ce(() => {
      this.#f = !1, this.#u && De(this.#u, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#b(), V(
                                   
      this.#u
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    g?.is_fork ? (this.#s && g.skip_effect(this.#s), this.#r && g.skip_effect(this.#r), this.#l && g.skip_effect(this.#l), g.oncommit(() => {
      this.#k(t);
    })) : this.#k(t);
  }
     
                           
     
  #k(t) {
    this.#s && (P(this.#s), this.#s = null), this.#r && (P(this.#r), this.#r = null), this.#l && (P(this.#l), this.#l = null);
    let r = this.#e.failed;
    const n = (i) => {
      const { reset: s, invoke_onerror: a } = this.#w(i);
      a(), r && (this.#l = this.#v(() => {
        try {
          return H(() => {
            var o = (
                                   
              y
            );
            o.b = this, o.f |= St, r(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (o) {
          return $(
            o,
                                 
            this.#n.parent
          ), null;
        }
      }));
    };
    ce(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        $(s, this.#n && this.#n.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        n,
                                 
        (s) => $(s, this.#n && this.#n.parent)
      ) : n(i);
    });
  }
}
function Si(e, t) {
  var r = t == null ? "" : typeof t == "object" ? `${t}` : t;
  r !==                   
  (e[Nt] ??= e.nodeValue) && (e[Nt] = r, e.nodeValue = `${r}`);
}
function ki(e, t) {
  return Ni(e, t);
}
const $e =                 new Map();
function Ni(e, { target: t, anchor: r, props: n = {}, events: i, context: s, intro: a = !0, transformError: o }) {
  Qn();
  var l = void 0, c = si(() => {
    var f = r ?? t.appendChild(ue());
    yi(
                                 
      f,
      {
        pending: () => {
        }
      },
      (h) => {
        wr({});
        var v = (
                                         
          J
        );
        s && (v.c = s), i && (n.$$events = i), l = e(h, n) || Er(), yr();
      },
      o
    );
    var u =                 new Set(), d = (h) => {
      for (var v = 0; v < h.length; v++) {
        var b = h[v];
        if (!u.has(b)) {
          u.add(b);
          var p = vi(b);
          for (const S of [t, document]) {
            var m = $e.get(S);
            m === void 0 && (m =                 new Map(), $e.set(S, m));
            var N = m.get(b);
            N === void 0 ? (S.addEventListener(b, tr, { passive: p }), m.set(b, 1)) : m.set(b, N + 1);
          }
        }
      }
    };
    return d(ut(Jr)), Ot.add(d), () => {
      for (var h of u)
        for (const p of [t, document]) {
          var v = (
                                              
            $e.get(p)
          ), b = (
                                 
            v.get(h)
          );
          --b == 0 ? (p.removeEventListener(h, tr), v.delete(h), v.size === 0 && $e.delete(p)) : v.set(h, b);
        }
      Ot.delete(d), f !== r && f.parentNode?.removeChild(f);
    };
  });
  return It.set(l, c), l;
}
let It =                 new WeakMap();
function Ti(e, t) {
  const r = It.get(e);
  return r ? (It.delete(e), r(t)) : Promise.resolve();
}
class Ai {
                             
  anchor;
                                
  #t =                 new Map();
     
                                                                   
                                                                      
             
        
                    
         
            
         
          
        
                                                                 
                             
     
  #a =                 new Map();
     
                                                                                          
                                                     
                             
     
  #e =                 new Map();
     
                                                
                     
     
  #o =                 new Set();
     
                                                                     
                                             
     
  #n = !0;
     
                                 
                                
     
  constructor(t, r = !0) {
    this.anchor = t, this.#n = r;
  }
     
                         
     
  #s = (t) => {
    if (this.#t.has(t)) {
      var r = (
                          
        this.#t.get(t)
      ), n = this.#a.get(r);
      if (n)
        ot(n), this.#o.delete(r);
      else {
        var i = this.#e.get(r);
        i && (ot(i.effect), this.#a.set(r, i.effect), this.#e.delete(r), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), n = i.effect);
      }
      for (const [s, a] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const o = this.#e.get(a);
        o && (P(o.effect), this.#e.delete(a));
      }
      for (const [s, a] of this.#a) {
        if (s === r || this.#o.has(s)) continue;
        const o = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var c = document.createDocumentFragment();
            Bt(a, c), c.append(ue()), this.#e.set(s, { effect: a, fragment: c });
          } else
            P(a);
          this.#o.delete(s), this.#a.delete(s);
        };
        this.#n || !n ? (this.#o.add(s), me(a, o, !1)) : o();
      }
    }
  };
     
                         
     
  #r = (t) => {
    this.#t.delete(t);
    const r = Array.from(this.#t.values());
    for (const [n, i] of this.#e)
      r.includes(n) || (P(i.effect), this.#e.delete(n));
  };
     
    
                     
                                                        
     
  ensure(t, r) {
    var n = (
                          
      g
    ), i = zr();
    if (r && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), a = ue();
        s.append(a), this.#e.set(t, {
          effect: H(() => r(a)),
          fragment: s
        });
      } else
        this.#a.set(
          t,
          H(() => r(this.anchor))
        );
    if (this.#t.set(n, t), i) {
      for (const [o, l] of this.#a)
        o === t ? n.unskip_effect(l) : n.skip_effect(l);
      for (const [o, l] of this.#e)
        o === t ? n.unskip_effect(l.effect) : n.skip_effect(l.effect);
      n.oncommit(this.#s), n.ondiscard(this.#r);
    } else
      this.#s(n);
  }
}
function Oi(e, t, r = !1) {
  var n = new Ai(e), i = r ? Ce : 0;
  function s(a, o) {
    n.ensure(a, o);
  }
  Ht(() => {
    var a = !1;
    t((o, l = 0) => {
      a = !0, s(l, o);
    }), a || s(-1, null);
  }, i);
}
function Ci(e, t, r) {
  for (var n = [], i = t.length, s, a = t.length, o = 0; o < i; o++) {
    let u = t[o];
    me(
      u,
      () => {
        if (s) {
          if (s.pending.delete(u), s.done.add(u), s.pending.size === 0) {
            var d = (
                                                
              e.outrogroups
            );
            Dt(e, ut(s.done)), d.delete(s), d.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var l = n.length === 0 && r !== null && e.pending.size === 0;
    if (l) {
      var c = (
                              
        r
      ), f = (
                              
        c.parentNode
      );
      ei(f), f.append(c), e.items.clear();
    }
    Dt(e, t, !l);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function Dt(e, t, r = !0) {
  var n;
  if (e.pending.size > 0) {
    n =                 new Set();
    for (const a of e.pending.values())
      for (const o of a)
        n.add(
                                 
          e.items.get(o).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (n?.has(s)) {
      s.f |= ee;
      const a = document.createDocumentFragment();
      Bt(s, a);
    } else
      P(t[i], r);
  }
}
var nr;
function wt(e, t, r, n, i, s = null) {
  var a = e, o =                 new Map(), l = (t & mr) !== 0;
  if (l) {
    var c = (
                            
      e
    );
    a = c.appendChild(ue());
  }
  var f = null, u =                 Bn(() => {
    var S = r();
    return (
                        
      ft(S) ? S : S == null ? [] : ut(S)
    );
  }), d, h =                 new Map(), v = !0;
  function b(S) {
    (N.effect.f & z) === 0 && (N.pending.delete(S), N.fallback = f, Ii(N, d, a, t, n), f !== null && (d.length === 0 ? (f.f & ee) === 0 ? ot(f) : (f.f ^= ee, He(f, null, a)) : me(f, () => {
      f = null;
    })));
  }
  function p(S) {
    N.pending.delete(S);
  }
  var m = Ht(() => {
    d =                   
    V(u);
    for (var S = d.length, O =                 new Set(), _ = (
                          
      g
    ), E = zr(), k = 0; k < S; k += 1) {
      var M = d[k], ie = n(M, k), R = v ? null : o.get(ie);
      R ? (R.v && De(R.v, M), R.i && De(R.i, k), E && _.unskip_effect(R.e)) : (R = Di(
        o,
        v ? a : nr ??= ue(),
        M,
        ie,
        k,
        i,
        t,
        r
      ), v || (R.e.f |= ee), o.set(ie, R)), O.add(ie);
    }
    if (S === 0 && s && !f && (v ? f = H(() => s(a)) : (f = H(() => s(nr ??= ue())), f.f |= ee)), S > O.size && Dn(), !v)
      if (h.set(_, O), E) {
        for (const [Pe, an] of o)
          O.has(Pe) || _.skip_effect(an.e);
        _.oncommit(b), _.ondiscard(p);
      } else
        b(_);
    V(u);
  }), N = { effect: m, items: o, pending: h, outrogroups: null, fallback: f };
  v = !1;
}
function Me(e) {
  for (; e !== null && (e.f & Q) === 0; )
    e = e.next;
  return e;
}
function Ii(e, t, r, n, i) {
  var s = (n & yn) !== 0, a = t.length, o = e.items, l = Me(e.effect.first), c, f = null, u, d = [], h = [], v, b, p, m;
  if (s)
    for (m = 0; m < a; m += 1)
      v = t[m], b = i(v, m), p =                        
      o.get(b).e, (p.f & ee) === 0 && (p.nodes?.a?.measure(), (u ??=                 new Set()).add(p));
  for (m = 0; m < a; m += 1) {
    if (v = t[m], b = i(v, m), p =                        
    o.get(b).e, e.outrogroups !== null)
      for (const R of e.outrogroups)
        R.pending.delete(p), R.done.delete(p);
    if ((p.f & F) !== 0 && (ot(p), s && (p.nodes?.a?.unfix(), (u ??=                 new Set()).delete(p))), (p.f & ee) !== 0)
      if (p.f ^= ee, p === l)
        He(p, null, r);
      else {
        var N = f ? f.next : l;
        p === e.effect.last && (e.effect.last = p.prev), p.prev && (p.prev.next = p.next), p.next && (p.next.prev = p.prev), oe(e, f, p), oe(e, p, N), He(p, N, r), f = p, d = [], h = [], l = Me(f.next);
        continue;
      }
    if (p !== l) {
      if (c !== void 0 && c.has(p)) {
        if (d.length < h.length) {
          var S = h[0], O;
          f = S.prev;
          var _ = d[0], E = d[d.length - 1];
          for (O = 0; O < d.length; O += 1)
            He(d[O], S, r);
          for (O = 0; O < h.length; O += 1)
            c.delete(h[O]);
          oe(e, _.prev, E.next), oe(e, f, _), oe(e, E, S), l = S, f = E, m -= 1, d = [], h = [];
        } else
          c.delete(p), He(p, l, r), oe(e, p.prev, p.next), oe(e, p, f === null ? e.effect.first : f.next), oe(e, f, p), f = p;
        continue;
      }
      for (d = [], h = []; l !== null && l !== p; )
        (c ??=                 new Set()).add(l), h.push(l), l = Me(l.next);
      if (l === null)
        continue;
    }
    (p.f & ee) === 0 && d.push(p), f = p, l = Me(p.next);
  }
  if (e.outrogroups !== null) {
    for (const R of e.outrogroups)
      R.pending.size === 0 && (Dt(e, ut(R.done)), e.outrogroups?.delete(R));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || c !== void 0) {
    var k = [];
    if (c !== void 0)
      for (p of c)
        (p.f & F) === 0 && k.push(p);
    for (; l !== null; )
      (l.f & F) === 0 && l !== e.fallback && k.push(l), l = Me(l.next);
    var M = k.length;
    if (M > 0) {
      var ie = (n & mr) !== 0 && a === 0 ? r : null;
      if (s) {
        for (m = 0; m < M; m += 1)
          k[m].nodes?.a?.measure();
        for (m = 0; m < M; m += 1)
          k[m].nodes?.a?.fix();
      }
      Ci(e, k, ie);
    }
  }
  s && ce(() => {
    if (u !== void 0)
      for (p of u)
        p.nodes?.a?.apply();
  });
}
function Di(e, t, r, n, i, s, a, o) {
  var l = (a & bn) !== 0 ? (a & En) === 0 ?                 Zn(r, !1, !1) : we(r) : null, c = (a & wn) !== 0 ? we(i) : null;
  return {
    v: l,
    i: c,
    e: H(() => (s(t, l ?? r, c ?? i, o), () => {
      e.delete(n);
    }))
  };
}
function He(e, t, r) {
  if (e.nodes)
    for (var n = e.nodes.start, i = e.nodes.end, s = t && (t.f & ee) === 0 ? (
                                
      t.nodes.start
    ) : r; n !== null; ) {
      var a = (
                                   
                        Xe(n)
      );
      if (s.before(n), n === i)
        return;
      n = a;
    }
}
function oe(e, t, r) {
  t === null ? e.effect.first = r : t.next = r, r === null ? e.effect.last = t : r.prev = t;
}
function Ri(e, t) {
  t ? e.hasAttribute("selected") || e.setAttribute("selected", "") : e.removeAttribute("selected");
}
function Li(e, t) {
  var r = e.__defaultValue, n = e.multiple, i = n ? r ?? [] : null;
  if (!(n && !ft(i))) {
    e.selectedIndex;
    for (var s of e.options) {
      var a = Rt(s);
      Ri(
        s,
        n ? (
                              
          i.includes(a)
        ) : xr(a, r)
      );
    }
  }
}
function $r(e, t, r = !1) {
  if (e.multiple) {
    if (t == null)
      return;
    if (!ft(t))
      return An();
    for (var n of e.options)
      n.selected = t.includes(Rt(n));
    return;
  }
  for (n of e.options) {
    var i = Rt(n);
    if (xr(i, t)) {
      n.selected = !0;
      return;
    }
  }
  (!r || t !== void 0) && (e.selectedIndex = -1);
}
function Fi(e) {
  var t = new MutationObserver((r) => {
    r.every(xi) || ("__defaultValue" in e && Li(e), "__value" in e && $r(e, e.__value));
  });
  t.observe(e, {
                                       
    childList: !0,
    subtree: !0,
                            
                                                       
                                                     
                                                              
    attributes: !0,
    attributeFilter: ["value"]
  }), jr(() => {
    t.disconnect();
  });
}
function Rt(e) {
  return "__value" in e ? e.__value : e.value;
}
function xi(e) {
  if (
                          
    e.target.closest("selectedcontent") !== null
  )
    return !0;
  if (e.type === "childList") {
    var t = [...e.addedNodes, ...e.removedNodes];
    return t.length > 0 && t.every((r) => r.nodeName === "SELECTEDCONTENT");
  }
  return !1;
}
const Pi =                 Symbol("is custom element"), Mi =                 Symbol("is html"), Ui = gn ? "progress" : "PROGRESS";
function zi(e, t) {
  var r = en(e);
  r.value === (r.value =                                                           
  t ?? void 0) ||                    
                                                                  
  e.value === t && (t !== 0 || e.nodeName !== Ui) || (e.value = t ?? "");
}
function ke(e, t, r, n) {
  var i = en(e);
  i[t] !== (i[t] = r) && (t === "loading" && (e[pn] = r), r == null ? e.removeAttribute(t) : typeof r != "string" && ji(e).has(t) ? e[t] = r : e.setAttribute(t, r));
}
function en(e) {
  return (
                                                    
                      
    e[_r] ??= {
      [Pi]: e.nodeName.includes("-"),
      [Mi]: e.namespaceURI === Nn
    }
  );
}
var ir =                 new Map();
function ji(e) {
  var t = e.getAttribute("is") || e.nodeName, r = ir.get(t);
  if (r) return r;
  ir.set(t, r =                 new Set());
  for (var n, i = e, s = Element.prototype; s !== i; ) {
    n = on(i);
    for (var a in n)
      n[a].set &&                                                                                     
      a !== "innerHTML" && a !== "textContent" && a !== "innerText" && r.add(a);
    i = dr(i);
  }
  return r;
}
const Hi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(Hi);
const B = {
  achievementSearch: { type: "search", label: "実績を検索", placeholder: "日本語名・英語名・GUIDで検索", event: "input", initial: "" },
  achievementFilter: { type: "select", label: "達成状況", event: "change", initial: "all", options: [["all", "すべて"], ["complete", "達成済み"], ["incomplete", "未達成"], ["missing", "定義のみ・未保存"], ["unknown-source", "保存済み・定義UNKNOWN"]] },
  achievementImageFilter: { type: "select", label: "実績画像で絞り込み", event: "change", initial: "all", options: [["all", "全画像状態"], ["exact", "直接画像あり"], ["source-null", "直接画像 SOURCE_NULL"], ["unknown", "画像未照合"]] },
  achievementSort: { type: "select", label: "実績の並び順", event: "change", initial: "source", options: [["source", "元の順番"], ["name", "名称順"], ["progress-desc", "進捗値の大きい順"], ["progress-asc", "進捗値の小さい順"], ["completed-first", "達成済みを先頭"]] },
  collectionSearch: { type: "search", label: "コレクションカテゴリを検索", placeholder: "コレクションカテゴリを検索", event: "input", initial: "" },
  collectionStatusFilter: { type: "select", label: "コレクション収集履歴で絞り込み", event: "change", initial: "all", options: [["all", "全カテゴリ"], ["has-record", "収集履歴あり"], ["no-record", "収集履歴なし"], ["unknown", "未照合"]] },
  collectionSort: { type: "select", label: "コレクションの並び順", event: "change", initial: "source", options: [["source", "定義順"], ["name", "名称順"], ["record-desc", "記録ID数の多い順"]] }
}, ct = Object.keys(B), Vi = ["achievementFilter", "achievementImageFilter", "achievementSort"], Bi = ["collectionStatusFilter", "collectionSort"];
function tn(e, t) {
  if (typeof t != "string") return !1;
  const r = B[e];
  return r.type === "search" || r.options.some(([n]) => n === t);
}
function rt(e) {
  if (!e || typeof e.imageVisible != "boolean" || ct.some((t) => !tn(t, e[t]))) throw new Error("LEGACY_FILTER_INCOHERENT");
  return e;
}
function Gi(e) {
  return { read: () => rt(e.read()), change(t, r) {
    if (!Object.hasOwn(B, t) || !tn(t, r)) throw new Error("LEGACY_FILTER_INVALID_INTENT");
    const n = rt(e.read());
    if (t === "achievementImageFilter" && !n.imageVisible) throw new Error("LEGACY_FILTER_HIDDEN");
    try {
      if (e.writeAndDispatch(t, r, B[t].event), rt(e.read())[t] !== r) throw new Error("LEGACY_FILTER_POSTCONDITION");
    } finally {
      e.invalidate?.();
    }
  } };
}
var qi =                 vt('<span aria-hidden="true">⌕</span><input type="search" autocomplete="off"/>', 1), Yi =                 vt("<option> </option>"), Ki =                 vt("<select></select>"), Wi =                 vt('<label class="search-wrap"><!></label><!>', 1);
function Zi(e, t) {
  wr(t, !0);
  const r = (c, f = Et) => {
    var u = qi(), d = Xt(Je(u));
    mt(() => {
      ke(d, "id", f()), ke(d, "placeholder", B[f()].placeholder), ke(d, "aria-label", B[f()].label), zi(d, t.initial[f()]);
    }), er("input", d, (h) => t.intent(f(), h)), Se(c, u);
  }, n = (c, f = Et) => {
    var u = Ki();
    wt(u, 21, () => B[f()].options, ([h, v]) => h, (h, v) => {
      var b =                 Vn(() => dn(V(v), 2));
      let p = () => V(b)[0], m = () => V(b)[1];
      var N = Yi(), S = $n(N, !0), O = {};
      mt(() => {
        Si(S, m()), O !== (O = p()) && (N.value = (N.__value = O) ?? "");
      }), Se(h, N);
    });
    var d;
    Fi(u), mt(() => {
      ke(u, "id", f()), ke(u, "aria-label", B[f()].label), ke(u, "hidden", f() === "achievementImageFilter" && !t.initial.imageVisible), d !== (d = t.initial[f()]) && (u.value = (u.__value = d) ?? "", $r(u, d));
    }), er("change", u, (h) => t.intent(f(), h)), Se(c, u);
  };
  var i = rr(), s = Je(i);
  {
    var a = (c) => {
      var f = Wi(), u = Je(f), d = Jn(u);
      r(d, () => "achievementSearch");
      var h = Xt(u);
      wt(h, 16, () => Vi, (v) => v, (v, b) => {
        n(v, () => b);
      }), Se(c, f);
    }, o = (c) => {
      r(c, () => "collectionSearch");
    }, l = (c) => {
      var f = rr(), u = Je(f);
      wt(u, 16, () => Bi, (d) => d, (d, h) => {
        n(d, () => h);
      }), Se(c, f);
    };
    Oi(s, (c) => {
      t.group === 0 ? c(a) : t.group === 1 ? c(o, 1) : c(l, -1);
    });
  }
  Se(e, i), yr();
}
pi(["input", "change"]);
const sr = Object.freeze({ de: "bd5bb8948e5e15e886c4f58421b00b41f0ec68a8ec627b023776ac1525507edb", en: "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", "en-GB": "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", es: "fb3061db5c00ef1c32d24af6b49246e53924dd90bd7984993c4a0774d037950d", fr: "1504c6d257bfb77003fecdd7acbc5cf114a8e51050a7521ab4ca42eeb2fc9737", "fr-CA": "17360cc5e61429400bdf4fa703121a54a0aeaf2368902609bc2e0d7dfa166038", it: "252954237409005d1fee26f96f604619380001917dccd93b133ead52a6549619", ja: "5729953617fdda2c39fef0499dc922a55c6b4a0d0bf134fa1a656cb3deb74851", ko: "df8800988f3c50fcee9a73e5c60093da4ef2737bb62cd841466ecae2e41874c7", nl: "a9c9f522c04c61a85e63d030a2407028e122a4c9cff95d57d7b1df6e1c7ae948", "pt-BR": "9befdaa8b85d09f623f75ed980af465afa88e7a07a163ec7f87f9aaf90974c13", ru: "08c523b001893cb1c1b3a510ac68a1874c1194ef7a0690f2aad1cd8f1c2d57cd", tr: "9e0a2f2ee46bb9f5c8eae28842e4ea53cc1000146d375250b132e450ee5530b5", "zh-Hans": "9a5b1098e6cf9a9f19a0dea90a48bda78ecd0ef95ade4c4ca54e4082237b0139", "zh-Hant": "9638729fca88ca34e47006eef3889b8b2491ddc0a79cf6588f155ad2de0633cc" }), Lt = Object.freeze(["nav.achievements", "nav.collections", "nav.workspace", "nav.tabs", "r2.preview", "ach.intro", "ach.count", "ach.empty", "col.intro", "col.count", "ach.search.label", "ach.search.placeholder", "ach.filter.label", "ach.filter.all", "ach.filter.complete", "ach.filter.incomplete", "ach.filter.missing", "ach.filter.unknownSource", "ach.image.label", "ach.image.all", "ach.image.exact", "ach.image.sourceNull", "ach.image.unknown", "ach.sort.label", "ach.sort.source", "ach.sort.name", "ach.sort.progressDesc", "ach.sort.progressAsc", "ach.sort.completedFirst", "col.search.label", "col.search.placeholder", "col.filter.label", "col.filter.all", "col.filter.hasRecord", "col.filter.noRecord", "col.filter.unknown", "col.sort.label", "col.sort.source", "col.sort.name", "col.sort.recordDesc", "locale.label", "locale.auto", "locale.loading", "locale.unverified", "file.open", "file.status", "file.backup", "file.export", "edit.preview", "edit.apply", "edit.undo", "edit.redo", "edit.reset", "edit.complete", "edit.revoke", "edit.collect", "edit.uncollect", "edit.progress", "edit.date", "edit.collectionDate", "edit.batch", "edit.selected", "state.unknown", "state.unverified", "state.unsupported", "state.notRecorded", "state.absentRef", "state.missingText", "state.writerOff", "state.previewOnly", "warning.linkage", "warning.history", "warning.reward", "error.file", "error.version", "error.stale", "error.integrity", "error.locale", "privacy.local", "credits.notice", "col.grid.empty", "col.image.label", "col.image.unverified", "col.image.unknown", "col.image.status", "col.grid.recorded", "col.grid.parentReference", "col.grid.unmatched", "r3.detail.preview", "r4.ach.preview", "r4.ach.selection", "r4.ach.unselected", "ach.row.unknownName", "ach.row.externalImageUnknown", "r4.ach.limit", "ach.list.more", "ach.row.image.label", "ach.row.image.unverified", "ach.row.image.status", "ach.row.status.missing", "ach.row.aria", "ach.row.subtitle.missing", "ach.row.subtitle.document", "ach.list.unreadable", "ach.list.noMatch", "ach.list.unloaded", "col.item.search.placeholder", "col.item.search.label", "col.item.history.label", "col.item.sort.label", "col.item.sort.internal", "col.item.sort.id", "col.item.inspect", "col.item.empty", "col.item.guid", "col.item.history.presence", "col.item.history.rawTicks", "col.item.history.calendar", "col.item.history.unknownHint", "col.item.previewHint", "col.item.list.caption", "ach.detail.heading", "ach.detail.empty", "ach.detail.missingHint", "ach.detail.definitionMatch", "ach.detail.matched", "ach.detail.unknownValue", "ach.detail.unset", "ach.linkage.heading", "ach.linkage.requiredConfirmed", "ach.linkage.requiredCandidate", "ach.linkage.related", "ach.linkage.unknown", "ach.linkage.hint", "ach.facts.heading", "ach.facts.definitionHeading", "ach.facts.builtinHint", "ach.facts.groupHint", "ach.facts.dlcHint", "ach.facts.groupNameHint", "ach.facts.counterUnknown", "ach.facts.counterAbsent", "ach.facts.counterNull", "ach.facts.rewardUnknown", "ach.facts.rewardNone", "ach.facts.childMissing", "ach.facts.childIncomplete", "ach.facts.groupProgress", "col.item.image.label", "col.definition.image.label", "col.item.image.unverified", "col.item.image.status", "col.item.history.recorded", "col.item.history.absent", "col.item.history.status", "col.item.ticks", "col.item.calendarUnknown", "col.item.parent", "col.item.parentCross", "col.item.history.rawUnknown", "ach.detail.unknownDefinition", "ach.linkage.count", "ach.linkage.unverifiedCount", "ach.linkage.systemCount", "ach.facts.internalKey", "ach.facts.membersHeading", "ach.facts.membersLabel", "ach.facts.definitionUnknown", "ach.facts.groupUnknown", "ach.facts.counterName", "ach.facts.threshold", "ach.facts.builtin", "ach.facts.counterGuid", "ach.facts.counterSaved", "ach.facts.counterDocument", "ach.facts.onlyUniques", "ach.facts.countedGuids", "ach.facts.countedValues", "ach.facts.rewardDefinition", "ach.facts.rewardReceipt", "ach.facts.rewardValue", "ach.facts.rewardZero", "ach.facts.groupName", "ach.facts.referenceCount", "ach.facts.savedCompletion", "ach.facts.groupCounter", "ach.facts.groupGuid", "ach.facts.definitionGuid", "ach.facts.groupAbsent", "ach.detail.statusLabel", "locale.previewScope", "locale.storageUnavailable"]);
Lt.length;
const rn = Object.freeze({ achievementSearch: ["ach.search.label"], achievementFilter: ["ach.filter.label", "ach.filter.all", "ach.filter.complete", "ach.filter.incomplete", "ach.filter.missing", "ach.filter.unknownSource"], achievementImageFilter: ["ach.image.label", "ach.image.all", "ach.image.exact", "ach.image.sourceNull", "ach.image.unknown"], achievementSort: ["ach.sort.label", "ach.sort.source", "ach.sort.name", "ach.sort.progressDesc", "ach.sort.progressAsc", "ach.sort.completedFirst"], collectionSearch: ["col.search.label", "col.search.placeholder"], collectionStatusFilter: ["col.filter.label", "col.filter.all", "col.filter.hasRecord", "col.filter.noRecord", "col.filter.unknown"], collectionSort: ["col.sort.label", "col.sort.source", "col.sort.name", "col.sort.recordDesc"] }), Xi = Object.values(rn).flat(), Qi = Object.freeze({ de: ["Erfolge suchen", "Abschlussstatus", "Alle", "Abgeschlossen", "Nicht abgeschlossen", "Nur Definition / nicht gespeichert", "Gespeichert / Definition unbekannt", "Nach Erfolgsbild filtern", "Alle Bildzustände", "Direktes Bild verfügbar", "Direktes Bild SOURCE_NULL", "Bild nicht zugeordnet", "Erfolgsreihenfolge", "Quellreihenfolge", "Name", "Fortschritt: absteigend", "Fortschritt: aufsteigend", "Abgeschlossene zuerst", "Sammlungskategorien suchen", "Sammlungskategorien suchen", "Nach Sammelverlauf filtern", "Alle Kategorien", "Sammelverlauf vorhanden", "Kein Sammelverlauf", "Nicht zugeordnet", "Sammlungsreihenfolge", "Definitionsreihenfolge", "Name", "Meiste erfasste IDs zuerst"], "en-GB": ["Search achievements", "Completion status", "All", "Completed", "Incomplete", "Definition only / not saved", "Saved / definition unknown", "Filter by achievement image", "All image states", "Direct image available", "Direct image SOURCE_NULL", "Image not matched", "Achievement order", "Source order", "Name", "Progress: highest first", "Progress: lowest first", "Completed first", "Search collection categories", "Search collection categories", "Filter by collection history", "All categories", "Collection history recorded", "No collection history", "Not matched", "Collection order", "Definition order", "Name", "Most recorded IDs first"], en: ["Search achievements", "Completion status", "All", "Completed", "Incomplete", "Definition only / not saved", "Saved / definition unknown", "Filter by achievement image", "All image states", "Direct image available", "Direct image SOURCE_NULL", "Image not matched", "Achievement order", "Source order", "Name", "Progress: highest first", "Progress: lowest first", "Completed first", "Search collection categories", "Search collection categories", "Filter by collection history", "All categories", "Collection history recorded", "No collection history", "Not matched", "Collection order", "Definition order", "Name", "Most recorded IDs first"], es: ["Buscar logros", "Estado de finalización", "Todos", "Completados", "Sin completar", "Solo definición / no guardado", "Guardado / definición desconocida", "Filtrar por imagen de logro", "Todos los estados de imagen", "Imagen directa disponible", "Imagen directa SOURCE_NULL", "Imagen sin vincular", "Orden de logros", "Orden de origen", "Nombre", "Progreso: de mayor a menor", "Progreso: de menor a mayor", "Completados primero", "Buscar categorías de colección", "Buscar categorías de colección", "Filtrar por historial de colección", "Todas las categorías", "Con historial de colección", "Sin historial de colección", "Sin vincular", "Orden de colecciones", "Orden de las definiciones", "Nombre", "Más ID registrados primero"], "fr-CA": ["Rechercher des succès", "État d’achèvement", "Tous", "Terminés", "Non terminés", "Définition seule / non enregistré", "Enregistré / définition inconnue", "Filtrer par image de succès", "Tous les états d’image", "Image directe disponible", "Image directe SOURCE_NULL", "Image non associée", "Ordre des succès", "Ordre source", "Nom", "Progression : décroissante", "Progression : croissante", "Terminés en premier", "Rechercher des catégories de collection", "Rechercher des catégories de collection", "Filtrer par historique de collection", "Toutes les catégories", "Historique de collection enregistré", "Aucun historique de collection", "Non associé", "Ordre des collections", "Ordre des définitions", "Nom", "Plus grand nombre d’identifiants enregistrés en premier"], fr: ["Rechercher des succès", "État d’achèvement", "Tous", "Terminés", "Non terminés", "Définition seule / non enregistré", "Enregistré / définition inconnue", "Filtrer par image de succès", "Tous les états d’image", "Image directe disponible", "Image directe SOURCE_NULL", "Image non associée", "Ordre des succès", "Ordre source", "Nom", "Progression : décroissante", "Progression : croissante", "Terminés en premier", "Rechercher des catégories de collection", "Rechercher des catégories de collection", "Filtrer par historique de collection", "Toutes les catégories", "Historique de collection enregistré", "Aucun historique de collection", "Non associé", "Ordre des collections", "Ordre des définitions", "Nom", "Plus grand nombre d’identifiants enregistrés en premier"], it: ["Cerca obiettivi", "Stato di completamento", "Tutti", "Completati", "Non completati", "Solo definizione / non salvato", "Salvato / definizione sconosciuta", "Filtra per immagine dell’obiettivo", "Tutti gli stati delle immagini", "Immagine diretta disponibile", "Immagine diretta SOURCE_NULL", "Immagine non associata", "Ordine degli obiettivi", "Ordine originale", "Nome", "Progresso: dal più alto", "Progresso: dal più basso", "Prima i completati", "Cerca categorie delle collezioni", "Cerca categorie delle collezioni", "Filtra per cronologia di raccolta", "Tutte le categorie", "Cronologia di raccolta presente", "Nessuna cronologia di raccolta", "Non associato", "Ordine delle collezioni", "Ordine delle definizioni", "Nome", "Prima il maggior numero di ID registrati"], ja: ["実績を検索", "達成状況", "すべて", "達成済み", "未達成", "定義のみ・未保存", "保存済み・定義UNKNOWN", "実績画像で絞り込み", "全画像状態", "直接画像あり", "直接画像 SOURCE_NULL", "画像未照合", "実績の並び順", "元の順番", "名称順", "進捗値の大きい順", "進捗値の小さい順", "達成済みを先頭", "コレクションカテゴリを検索", "コレクションカテゴリを検索", "コレクション収集履歴で絞り込み", "全カテゴリ", "収集履歴あり", "収集履歴なし", "未照合", "コレクションの並び順", "定義順", "名称順", "記録ID数の多い順"], ko: ["업적 검색", "달성 상태", "전체", "달성", "미달성", "정의만 있음 / 미저장", "저장됨 / 정의 미확인", "업적 이미지로 필터링", "모든 이미지 상태", "직접 이미지 있음", "직접 이미지 SOURCE_NULL", "이미지 미대조", "업적 정렬", "원본 순서", "이름", "진행도 높은 순", "진행도 낮은 순", "달성 먼저", "컬렉션 카테고리 검색", "컬렉션 카테고리 검색", "수집 이력으로 필터링", "모든 카테고리", "수집 이력 있음", "수집 이력 없음", "미대조", "컬렉션 정렬", "정의 순서", "이름", "기록된 ID가 많은 순"], nl: ["Prestaties zoeken", "Voltooiingsstatus", "Alle", "Voltooid", "Niet voltooid", "Alleen definitie / niet opgeslagen", "Opgeslagen / definitie onbekend", "Filter op prestatieafbeelding", "Alle afbeeldingsstatussen", "Directe afbeelding beschikbaar", "Directe afbeelding SOURCE_NULL", "Afbeelding niet gekoppeld", "Volgorde van prestaties", "Bronvolgorde", "Naam", "Voortgang: hoogste eerst", "Voortgang: laagste eerst", "Voltooide eerst", "Zoek collectiecategorieën", "Zoek collectiecategorieën", "Filter op verzamelgeschiedenis", "Alle categorieën", "Verzamelgeschiedenis aanwezig", "Geen verzamelgeschiedenis", "Niet gekoppeld", "Volgorde van collecties", "Definitievolgorde", "Naam", "Meeste geregistreerde ID’s eerst"], "pt-BR": ["Buscar conquistas", "Estado de conclusão", "Todas", "Concluídas", "Não concluídas", "Apenas definição / não salvo", "Salvo / definição desconhecida", "Filtrar por imagem de conquista", "Todos os estados de imagem", "Imagem direta disponível", "Imagem direta SOURCE_NULL", "Imagem não associada", "Ordem das conquistas", "Ordem de origem", "Nome", "Progresso: maior primeiro", "Progresso: menor primeiro", "Concluídas primeiro", "Buscar categorias de coleção", "Buscar categorias de coleção", "Filtrar por histórico de coleção", "Todas as categorias", "Com histórico de coleção", "Sem histórico de coleção", "Não associado", "Ordem das coleções", "Ordem das definições", "Nome", "Mais IDs registrados primeiro"], ru: ["Поиск достижений", "Статус завершения", "Все", "Завершённые", "Незавершённые", "Только определение / не сохранено", "Сохранено / определение неизвестно", "Фильтр по изображению достижения", "Все состояния изображений", "Прямое изображение доступно", "Прямое изображение SOURCE_NULL", "Изображение не сопоставлено", "Порядок достижений", "Исходный порядок", "Название", "Прогресс: по убыванию", "Прогресс: по возрастанию", "Завершённые сначала", "Поиск категорий коллекций", "Поиск категорий коллекций", "Фильтр по истории сбора", "Все категории", "Есть история сбора", "Нет истории сбора", "Не сопоставлено", "Порядок коллекций", "Порядок определений", "Название", "Сначала больше записанных ID"], tr: ["Başarı ara", "Tamamlanma durumu", "Tümü", "Tamamlananlar", "Tamamlanmayanlar", "Yalnızca tanım / kaydedilmemiş", "Kaydedilmiş / tanım bilinmiyor", "Başarı görseline göre filtrele", "Tüm görsel durumları", "Doğrudan görsel mevcut", "Doğrudan görsel SOURCE_NULL", "Görsel eşleştirilmemiş", "Başarı sırası", "Kaynak sırası", "Ad", "İlerleme: yüksekten düşüğe", "İlerleme: düşükten yükseğe", "Önce tamamlananlar", "Koleksiyon kategorisi ara", "Koleksiyon kategorisi ara", "Koleksiyon geçmişine göre filtrele", "Tüm kategoriler", "Koleksiyon geçmişi var", "Koleksiyon geçmişi yok", "Eşleştirilmemiş", "Koleksiyon sırası", "Tanım sırası", "Ad", "Önce en çok kaydedilen kimlikler"], "zh-Hans": ["搜索成就", "完成状态", "全部", "已完成", "未完成", "仅有定义 / 未保存", "已保存 / 定义未知", "按成就图片筛选", "所有图片状态", "有直接图片", "直接图片 SOURCE_NULL", "图片未匹配", "成就排序", "来源顺序", "名称", "进度从高到低", "进度从低到高", "已完成优先", "搜索收藏类别", "搜索收藏类别", "按收藏历史筛选", "全部类别", "有收藏历史", "无收藏历史", "未匹配", "收藏排序", "定义顺序", "名称", "记录 ID 数量从多到少"], "zh-Hant": ["搜尋成就", "完成狀態", "全部", "已完成", "未完成", "僅有定義 / 未儲存", "已儲存 / 定義未知", "依成就圖片篩選", "所有圖片狀態", "有直接圖片", "直接圖片 SOURCE_NULL", "圖片未配對", "成就排序", "來源順序", "名稱", "進度由高至低", "進度由低至高", "已完成優先", "搜尋收藏類別", "搜尋收藏類別", "依收藏歷程篩選", "全部類別", "有收藏歷程", "無收藏歷程", "未配對", "收藏排序", "定義順序", "名稱", "已記錄的 ID 數量由多至少"] }), Oe = (e) => {
  if (!e) throw Error("PRODUCT_FILTER_LOCALE_CONTRACT");
}, ar = (e, t) => {
  const r = Object.getOwnPropertyDescriptor(e, t);
  return !!r && Object.hasOwn(r, "value");
};
function Ji(e) {
  if (e === null) return null;
  Oe(!!e && Object.getPrototypeOf(e) === Object.prototype && Object.isFrozen(e) && Object.keys(e).length === 4 && ["epoch", "locale", "sha256", "catalog"].every((n) => ar(e, n)) && typeof e.locale == "string" && Number.isSafeInteger(e.epoch) && e.epoch >= 0 && Object.hasOwn(sr, e.locale) && e.sha256 === sr[e.locale]);
  const t = e.catalog;
  Oe(!!t && Object.getPrototypeOf(t) === Object.prototype && Object.isFrozen(t) && Object.keys(t).length === Lt.length && Lt.every((n) => ar(t, n) && typeof t[n] == "string" && t[n].trim()));
  const r = Qi[e.locale];
  return Oe(!!r && Xi.every((n, i) => t[n] === r[i])), e;
}
function yt(e, t, r = 0) {
  if (t === null) return null;
  const n = rn[e][r];
  return Oe(typeof n == "string" && Object.hasOwn(t.catalog, n)), t.catalog[n];
}
function $i(e) {
  let t = null, r = -1;
  return Object.freeze({ read() {
    const n = Ji(e());
    return Oe(n === null || n === t || n.epoch > r), n;
  }, accept(n) {
    Oe(e() === n), n !== null && (r = Math.max(r, n.epoch)), t = n;
  } });
}
const Gt = [["achievementSearch", "achievementFilter", "achievementImageFilter", "achievementSort"], ["collectionSearch"], ["collectionStatusFilter", "collectionSort"]], lr = "data-hkia-svelte-filters", or =                 new WeakMap(), T = (e) => {
  if (!e) throw Error("PRODUCT_FILTER_DOM_CONTRACT");
};
function Y(e, t) {
  const r = e.querySelectorAll(`[id="${t}"]`);
  return T(r.length === 1), r[0];
}
function Le(e, t) {
  const r = e.querySelectorAll(`[id="${t}"]`);
  return T(r.length === 1), r[0];
}
function es(e, t, r) {
  const n = B[t];
  if (T(e.id === t && e.getAttribute("aria-label") === (yt(t, r) ?? n.label) && !e.disabled), n.type === "search")
    T(e.tagName === "INPUT" && e.type === "search" && e.getAttribute("placeholder") === (t === "collectionSearch" ? yt(t, r, 1) ?? n.placeholder : n.placeholder) && e.getAttribute("autocomplete") === "off" && !e.hidden);
  else {
    T(e.tagName === "SELECT" && (t === "achievementImageFilter" || !e.hidden));
    const i = Array.from(e.options);
    T(i.length === n.options.length && i.every((s, a) => s.value === n.options[a][0] && s.textContent === (yt(t, r, a + 1) ?? n.options[a][1]) && !s.disabled));
  }
}
function cr(e, t) {
  T(e.tagName === "LABEL" && e.className === (t === "collectionSearch" ? "search-wrap collections-search" : "search-wrap") && e.children.length === 2 && e.children[0].tagName === "SPAN" && e.children[0].getAttribute("aria-hidden") === "true" && e.children[0].textContent === "⌕" && e.children[1] === Le(e, t));
}
function nn(e, t, r) {
  const n = Gt[t];
  t === 1 ? cr(e, "collectionSearch") : (T(e.tagName === "DIV" && e.className === "toolbar" && e.children.length === n.length), n.forEach((i, s) => {
    i === "achievementSearch" ? cr(e.children[s], i) : T(e.children[s] === Le(e, i));
  }));
  for (const i of n) es(Le(e, i), i, r);
}
function sn(e) {
  const t = Object.fromEntries(Gt.flatMap((r, n) => r.map((i) => [i, Le(e[n], i).value])));
  return rt({ ...t, imageVisible: !Le(e[0], "achievementImageFilter").hidden });
}
const Ne = (e) => JSON.stringify([...ct.map((t) => e[t]), e.imageVisible]);
function fr(e, t) {
  const r = Y(e, "achPanel"), n = Y(e, "colPanel"), i = Y(e, "achievementSearch"), s = Y(e, "collectionSearch"), a = Y(e, "collectionSort"), o = [i.parentElement?.parentElement, s.parentElement, a.parentElement];
  T(o.every(Boolean) && o[0].parentElement === r && o[1].parentElement === n && o[2].parentElement === n && new Set(o).size === 3), o.forEach((l, c) => nn(l, c, t));
  for (const [l, c] of Gt.entries()) for (const f of c) T(Y(e, f) === Le(o[l], f));
  return { hosts: o, panels: [r, n], state: sn(o) };
}
function ts(e, t, r, n = () => null) {
  const i = $i(n);
  let s, a;
  try {
    s = i.read(), a = fr(e, s), i.accept(s);
  } catch {
    return "LEGACY_RETAINED";
  }
  const o = or.get(e);
  if (o) return o.every((_, E) => _ === a.hosts[E]) ? "ALREADY_MOUNTED" : "LEGACY_RETAINED";
  if (s !== null || a.hosts.some((_) => _.hasAttribute(lr))) return "LEGACY_RETAINED";
  const l = a.hosts.map((_) => {
    const E = _.cloneNode(!1);
    return E.setAttribute(lr, "1"), E;
  }), c = ct.find((_) => e.activeElement === Y(e, _)), f = c ? Y(e, c) : null, u = f?.tagName === "INPUT" ? [f.selectionStart, f.selectionEnd, f.selectionDirection] : null;
  let d = !1, h = !1, v;
  const b = [], p = [], m = () => {
    const _ = i.read();
    T(v === void 0 || _ === v);
    const E = fr(e, _);
    return T(E.hosts.every((k, M) => k === (d ? l : a.hosts)[M]) && E.panels.every((k, M) => k === a.panels[M])), i.accept(_), E;
  }, N = Gi({ read: () => m().state, writeAndDispatch(_, E, k) {
    T(d && k === B[_].event);
    const M = m().state, ie = Y(e, _);
    ie.value = E, T(ie.value === E), _.startsWith("achievement") ? t.achievement() : t.collection();
    const R = m().state;
    T(ct.every((Pe) => Pe === _ || R[Pe] === M[Pe]));
  } }), S = (_, E) => {
    T(d && !h && Object.hasOwn(B, _) && E.type === B[_].event);
    const k = Y(e, _);
    T(E.currentTarget === k), h = !0;
    try {
      v = i.read(), N.change(_, k.value);
    } finally {
      v = void 0, h = !1;
    }
  }, O = () => {
    if (!c) return;
    const _ = Y(e, c);
    _.focus(), u && u[0] !== null && u[1] !== null && _.setSelectionRange(u[0], u[1], u[2] ?? void 0);
  };
  try {
    return v = null, l.forEach((_, E) => {
      const k = r(_, E, a.state, S);
      T(typeof k == "function"), p.push(k), nn(_, E, null);
    }), T(Ne(sn(l)) === Ne(a.state)), T(Ne(m().state) === Ne(a.state)), l.forEach((_, E) => {
      a.hosts[E].replaceWith(_), b.push(E);
    }), d = !0, T(Ne(m().state) === Ne(a.state)), O(), or.set(e, l), v = void 0, "MOUNTED";
  } catch {
    d = !1;
    for (const _ of b.reverse()) l[_].replaceWith(a.hosts[_]);
    try {
      O();
    } catch {
    }
    for (const _ of p.reverse()) try {
      _();
    } catch {
    }
    return "LEGACY_RETAINED";
  }
}
function ns(e, t, r = () => null) {
  return ts(e, t, (n, i, s, a) => {
    const o = ki(Zi, { target: n, props: { group: i, initial: s, intent: a } }), l = () => {
      Ti(o).catch(() => {
      });
    };
    try {
      Kn();
    } catch (c) {
      throw l(), c;
    }
    return l;
  }, r);
}
export {
  ns as mountProductFilters
};
