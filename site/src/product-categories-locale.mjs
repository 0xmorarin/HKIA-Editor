var wn = Array.isArray, dr = Array.prototype.indexOf, ht = Array.prototype.includes, yt = Array.from, En = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, hr = Object.getOwnPropertyDescriptors, pr = Object.prototype, gr = Array.prototype, kn = Object.getPrototypeOf, nn = Object.isExtensible;
const vr = () => {
};
function _r(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function An() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const P = 2, $e = 4, bt = 8, Nn = 1 << 24, V = 16, X = 32, ce = 64, Rt = 128, Kt = 256, K = 512, x = 1024, L = 2048, J = 4096, j = 8192, U = 16384, ze = 32768, Dt = 1 << 25, Le = 65536, pt = 1 << 17, mr = 1 << 18, Ge = 1 << 19, yr = 1 << 20, oe = 1 << 25, Ae = 65536, gt = 1 << 21, xe = 1 << 22, he = 1 << 23, wt =                 Symbol("$state"), Cn =                 Symbol("component"), br =                 Symbol(""), On =                 Symbol("attributes"), xt =                 Symbol("class"), wr =                 Symbol("style"), Lt =                 Symbol("text"), tt = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Er = 1, kr = 2, Ar = 16, Nr = 1, Cr = 2, D =                 Symbol("uninitialized"), Or = "http://www.w3.org/1999/xhtml";
function Tr() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Sr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Tn(e) {
  return e === this.v;
}
function Ir(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function Sn(e) {
  return !Ir(e, this.v);
}
function Rr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function Dr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function xr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function Lr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Pr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Mr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function jr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let Z = null;
function Pe(e) {
  Z = e;
}
function Bt(e, t = !1, n) {
  Z = {
    p: Z,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
                           
      C
    ),
    l: null
  };
}
function Vt(e) {
  var t = (
                                   
    Z
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      ni(r);
  }
  return t.i = !0, Z = t.p, In(e);
}
function In(e = {}) {
  return En(e, Cn, { value: !0 }), e;
}
function Rn() {
  return !0;
}
let be = [];
function Dn() {
  var e = be;
  be = [], _r(e);
}
function de(e) {
  if (be.length === 0 && !We) {
    var t = be;
    queueMicrotask(() => {
      t === be && Dn();
    });
  }
  be.push(e);
}
function zr() {
  for (; be.length > 0; )
    Dn();
}
const Gr = -7169;
function I(e, t) {
  e.f = e.f & Gr | t;
}
function qt(e) {
  (e.f & K) !== 0 || e.deps === null ? I(e, x) : I(e, J);
}
function xn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & P) === 0 || (t.f & Ae) === 0 || (t.f ^= Ae, xn(
                              
        t.deps
      ));
}
function Ln(e, t, n) {
  (e.f & L) !== 0 ? t.add(e) : (e.f & J) !== 0 && n.add(e), xn(e.deps), I(e, x);
}
function nt(e) {
  var t = N, n = C;
  B(null), ne(null);
  try {
    return e();
  } finally {
    B(t), ne(n);
  }
}
function Fr(e, t, n, r) {
  const i = Wt;
  var a = e.filter((f) => !f.settled), o = t.map(i);
  if (n.length === 0 && a.length === 0) {
    r(o);
    return;
  }
  var l = (
                         
    C
  ), s = Ur(), c = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((f) => f.promise)) : null;
  function h(f) {
    if ((l.f & U) === 0) {
      s();
      try {
        r([...o, ...f]);
      } catch (u) {
        Q(u, l);
      }
      vt();
    }
  }
  var p = Pn();
  if (n.length === 0) {
    c.then(() => h([])).finally(p);
    return;
  }
  function d() {
    Promise.all(n.map((f) =>                 Yr(f))).then(h).catch((f) => Q(f, l)).finally(p);
  }
  c ? c.then(() => {
    s(), d(), vt();
  }) : d();
}
function Ur() {
  var e = (
                         
    C
  ), t = N, n = Z, r = (
                        
    E
  );
  return function(a = !0) {
    ne(e), B(t), Pe(n), a && (e.f & U) === 0 && (r?.activate(), r?.apply());
  };
}
function vt(e = !0) {
  ne(null), B(null), Pe(null), e && E?.deactivate();
}
function Pn() {
  var e = (
                         
    C
  ), t = e.b, n = (
                        
    E
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function Wt(e) {
  var t = P | L;
  return C !== null && (C.f |= Ge), {
    ctx: Z,
    deps: null,
    effects: null,
    equals: Tn,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      D
    ),
    wv: 0,
    parent: C,
    ac: null
  };
}
const Ye =                 Symbol("obsolete");
                       
function Yr(e, t, n) {
  let r = (
                                
    C
  );
  r === null && Rr();
  var i = (
                             
                          
    void 0
  ), a = Ne(
                    
    D
  ), o = !N, l =                 new Set();
  return ii(() => {
    var s = (
                           
      C
    ), c = An();
    i = c.promise;
    try {
      Promise.resolve(e()).then(c.resolve, (f) => {
        f !== tt && c.reject(f);
      }).finally(vt);
    } catch (f) {
      c.reject(f), vt();
    }
    var h = (
                          
      E
    );
    if (o) {
      if ((s.f & ze) !== 0)
        var p = Pn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        h.async_deriveds.get(s)?.reject(Ye);
      else
        for (const f of l.values())
          f.reject(Ye);
      l.add(c), h.async_deriveds.set(s, c);
    }
    const d = (f, u = void 0) => {
      p?.(), l.delete(c), u !== Ye && (h.activate(), u ? (a.f |= he, Me(a, u)) : ((a.f & he) !== 0 && (a.f ^= he), Me(a, f)), h.deactivate());
    };
    c.promise.then(d, (f) => d(null, f || "unknown"));
  }), Jn(() => {
    for (const s of l)
      s.reject(Ye);
  }), new Promise((s) => {
    function c(h) {
      function p() {
        h === i ? s(a) : c(i);
      }
      h.then(p, p);
    }
    c(i);
  });
}
                       
function rn(e) {
  const t =                 Wt(e);
  return er(t), t;
}
                       
function Hr(e) {
  const t =                 Wt(e);
  return t.equals = Sn, t;
}
function Kr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      G(
                             
        t[n]
      );
  }
}
function Jt(e) {
  var t, n = C, r = e.parent;
  if (!Oe && r !== null && e.v !== D &&                                                                                                      
  (r.f & (U | j)) !== 0)
    return Tr(), e.v;
  ne(r);
  try {
    e.f &= ~Ae, Kr(e), t = ir(e);
  } finally {
    ne(n);
  }
  return t;
}
function Mn(e) {
  var t = Jt(e);
  if (!e.equals(t) && (e.wv = nr(), (!E?.is_fork || e.deps === null) && (E !== null ? (E.capture(e, t, !0), Pt?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    I(e, x);
    return;
  }
  Oe || (q !== null ? ($t() || E?.is_fork) && q.set(e, t) : qt(e));
}
function Br(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && nt(() => {
        t.ac.abort(tt), t.ac = null;
      }), t.fn !== null && (t.teardown = vr), et(t, 0), en(t));
}
function jn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && je(t);
}
let Et = null, Te = null, E = null, Pt = null, q = null, Mt = null, We = !1, kt = !1, De = null, ot = null;
var an = 0;
let Vr = 1;
class pe {
  id = Vr++;
                                              
  #t = !1;
  linked = !0;
                             
  #l = null;
                             
  #e = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #o =                 new Set();
     
                                                                                     
                                        
     
  #r =                 new Set();
     
                                                             
     
  #a = 0;
     
                                                                                
                                
     
  #n =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #s = null;
     
                                             
                     
     
  #i = [];
     
                                                 
                     
     
  #g = [];
     
                                                                               
                        
     
  #c =                 new Set();
     
                                          
                        
     
  #f =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #d =                 new Map();
     
                                                                                                    
                        
     
  #v =                 new Set();
  is_fork = !1;
  #u = !1;
  constructor() {
    Te === null ? Et = Te = this : (Te.#e = this, this.#l = Te), Te = this;
  }
  #y() {
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
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#v.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#d.get(t);
    if (r) {
      this.#d.delete(t);
      for (var i of r.d)
        I(i, L), n(i);
      for (i of r.m)
        I(i, J), n(i);
    }
    this.#v.add(t);
  }
  #_() {
    this.#t = !0, an++ > 1e3 && (this.#p(), Wr());
    for (const s of this.#c)
      this.#f.delete(s), I(s, L), this.schedule(s);
    for (const s of this.#f)
      I(s, J), this.schedule(s);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = De = [], r = [], i = ot = [];
    for (const s of t)
      try {
        this.#w(s, n, r);
      } catch (c) {
        throw Fn(s), this.#y() || this.discard(), c;
      }
    if (E = null, i.length > 0) {
      var a = pe.ensure();
      for (const s of i)
        a.schedule(s);
    }
    if (De = null, ot = null, this.#y()) {
      this.#h(r), this.#h(n);
      for (const [s, c] of this.#d)
        Gn(s, c);
      i.length > 0 &&                       
      E.#_();
      return;
    }
    const o = this.#b();
    if (o) {
      this.#h(r), this.#h(n), o.#E(this);
      return;
    }
    this.#c.clear(), this.#f.clear();
    for (const s of this.#o) s(this);
    this.#o.clear(), Pt = this, ln(r), ln(n), Pt = null, this.#s?.resolve();
    var l = (
                                 
                            
      E
    );
    if (this.#a === 0 && (this.#i.length === 0 || l !== null) && this.#p(), this.#i.length > 0)
      if (l !== null) {
        const s = l;
        s.#i.push(...this.#i.filter((c) => !s.#i.includes(c)));
      } else
        l = this;
    l !== null && (ee.clear(), l.#_());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #w(t, n, r) {
    t.f ^= x;
    for (var i = t.first; i !== null; ) {
      var a = i.f, o = (a & (X | ce)) !== 0, l = o && (a & x) !== 0, s = l || (a & j) !== 0 || this.#d.has(i);
      if (!s && i.fn !== null) {
        o ? i.f ^= x : (a & $e) !== 0 ? n.push(i) : it(i) && ((a & V) !== 0 && this.#f.add(i), je(i));
        var c = i.first;
        if (c !== null) {
          i = c;
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
  #b() {
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
      const a = this.async_deriveds.get(r);
      a && i.promise.then(a.resolve).catch(a.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#c, t.#f);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & P) !== 0 && (r.f & (L | J)) === 0))
        for (const l of i) {
          var a = l.f;
          if ((a & P) !== 0)
            n(
                                    
              l
            );
          else {
            var o = (
                                   
              l
            );
            a & (xe | V) && !this.async_deriveds.has(o) && (this.#f.delete(o), I(o, L), this.schedule(o));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#p(), E = this, this.#_();
  }
     
                              
     
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      Ln(t[n], this.#c, this.#f);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== D && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & he) === 0 && (this.current.set(t, [n, r]), q?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    E = this;
  }
  deactivate() {
    E = null, q = null;
  }
  flush() {
    try {
      kt = !0, E = this, this.#_();
    } finally {
      an = 0, Mt = null, De = null, ot = null, kt = !1, E = null, q = null, ee.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Ye);
    this.#p(), this.#s?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#g.push(t);
  }
  #m() {
    for (let p = Et; p !== null; p = p.#e) {
      var t = p.id < this.id, n = [];
      for (const [d, [f, u]] of this.current) {
        if (p.current.has(d)) {
          var r = (
                                         
            p.current.get(d)[0]
          );
          if (t && f !== r)
            p.current.set(d, [f, u]);
          else
            continue;
        }
        n.push(d);
      }
      if (t)
        for (const [d, f] of this.async_deriveds) {
          const u = p.async_deriveds.get(d);
          u && f.promise.then(u.resolve).catch(u.reject);
        }
      var i = [...p.current.keys()].filter(
        (d) => !                             
        p.current.get(d)[1]
      );
      if (!(!p.#t || i.length === 0)) {
        var a = i.filter((d) => !this.current.has(d));
        if (a.length === 0)
          t && p.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#v)
              p.unskip_effect(d, (f) => {
                (f.f & (V | xe)) !== 0 ? p.schedule(f) : p.#h([f]);
              });
          p.activate();
          var o =                 new Set(), l =                 new Map();
          for (var s of n)
            zn(s, a, o, l);
          l =                 new Map();
          var c = [...p.current].filter(([d, f]) => {
            const u = this.current.get(d);
            return u ? u[0] !== f[0] || u[1] !== f[1] : !0;
          }).map(([d]) => d);
          if (c.length > 0)
            for (const d of this.#g)
              (d.f & (U | j | pt)) === 0 && Xt(d, c, l) && ((d.f & (xe | V)) !== 0 ? (I(d, L), p.schedule(d)) : p.#c.add(d));
          if (p.#i.length > 0 && !p.#u) {
            p.apply();
            for (var h of p.#i)
              p.#w(h, [], []);
            p.#i = [];
          }
          p.deactivate();
        }
      }
    }
  }
     
                              
                           
     
  increment(t, n) {
    if (this.#a += 1, t) {
      let r = this.#n.get(n) ?? 0;
      this.#n.set(n, r + 1);
    }
  }
     
                              
                           
     
  decrement(t, n) {
    if (this.#a -= 1, t) {
      let r = this.#n.get(n) ?? 0;
      r === 1 ? this.#n.delete(n) : this.#n.set(n, r - 1);
    }
    this.#u || (this.#u = !0, de(() => {
      this.#u = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, n) {
    for (const r of t)
      this.#c.add(r);
    for (const r of n)
      this.#f.add(r);
    t.clear(), n.clear();
  }
                                           
  oncommit(t) {
    this.#o.add(t);
  }
                                           
  ondiscard(t) {
    this.#r.add(t);
  }
  settled() {
    return (this.#s ??= An()).promise;
  }
  static ensure() {
    if (E === null) {
      const t = E = new pe();
      !kt && !We && de(() => {
        t.#t || t.flush();
      });
    }
    return E;
  }
  apply() {
    {
      q = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (Mt = t, t.b?.is_pending && (t.f & ($e | bt | Nn)) !== 0 && (t.f & ze) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (De !== null && n === C && (N === null || (N.f & P) === 0))
        return;
      if ((r & (ce | X)) !== 0) {
        if ((r & x) === 0)
          return;
        n.f ^= x;
      }
    }
    this.#i.push(n);
  }
  #p() {
    if (this.linked) {
      var t = this.#l, n = this.#e;
      t === null ? Et = n : t.#e = n, n === null ? Te = t : n.#l = t, this.linked = !1;
    }
  }
}
function qr(e) {
  var t = We;
  We = !0;
  try {
    for (var n; ; ) {
      if (zr(), E === null)
        return (
                          
          n
        );
      E.flush();
    }
  } finally {
    We = t;
  }
}
function Wr() {
  try {
    xr();
  } catch (e) {
    Q(e, Mt);
  }
}
let ae = null;
function ln(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (U | j)) === 0 && it(r) && (ae =                 new Set(), je(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Zn(r), ae?.size > 0)) {
        ee.clear();
        for (const i of ae) {
          if ((i.f & (U | j)) !== 0) continue;
          const a = [i];
          let o = i.parent;
          for (; o !== null; )
            ae.has(o) && (ae.delete(o), a.push(o)), o = o.parent;
          for (let l = a.length - 1; l >= 0; l--) {
            const s = a[l];
            (s.f & (U | j)) === 0 && je(s);
          }
        }
        ae.clear();
      }
    }
    ae = null;
  }
}
function zn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const a = i.f;
      (a & P) !== 0 ? zn(
                              
        i,
        t,
        n,
        r
      ) : (a & (xe | V)) !== 0 && (a & L) === 0 && Xt(i, t, r) && (I(i, L), Zt(
                             
        i
      ));
    }
}
function Xt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ht.call(t, i))
        return !0;
      if ((i.f & P) !== 0 && Xt(
                              
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
function Zt(e) {
  E.schedule(e);
}
function Gn(e, t) {
  if (!((e.f & X) !== 0 && (e.f & x) !== 0)) {
    (e.f & L) !== 0 ? t.d.push(e) : (e.f & J) !== 0 && t.m.push(e), I(e, x);
    for (var n = e.first; n !== null; )
      Gn(n, t), n = n.next;
  }
}
function Fn(e) {
  I(e, x);
  for (var t = e.first; t !== null; )
    Fn(t), t = t.next;
}
let _t =                 new Set();
const ee =                 new Map();
let Un = !1;
function Ne(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: Tn,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function ie(e, t) {
  const n = Ne(e);
  return er(n), n;
}
                       
function Jr(e, t = !1, n = !0) {
  const r = Ne(e);
  return t || (r.equals = Sn), r;
}
function le(e, t, n = !1) {
  N !== null &&                                                                                         
                                                                
  (!W || (N.f & pt) !== 0) && Rn() && (N.f & (P | V | xe | pt)) !== 0 && (te === null || !te.has(e)) && Mr();
  let r = n ? He(t) : t;
  return Me(e, r, ot);
}
function Me(e, t, n = null) {
  if (!e.equals(t)) {
    Oe ? ee.set(e, t) : ee.has(e) || ee.set(e, e.v);
    var r = pe.ensure();
    if (r.capture(e, t), (e.f & P) !== 0) {
      const i = (
                              
        e
      );
      (e.f & L) !== 0 && Jt(i), q === null && qt(i);
    }
    e.wv = nr(), Yn(e, L, n), C !== null && (C.f & x) !== 0 && (C.f & (X | ce)) === 0 && (Y === null ? oi([e]) : Y.push(e)), !r.is_fork && _t.size > 0 && !Un && Xr();
  }
  return t;
}
function Xr() {
  Un = !1;
  for (const e of _t) {
    (e.f & x) !== 0 && I(e, J);
    let t;
    try {
      t = it(e);
    } catch {
      t = !0;
    }
    t && je(e);
  }
  _t.clear();
}
function Je(e) {
  le(e, e.v + 1);
}
function Yn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, a = 0; a < i; a++) {
      var o = r[a], l = o.f, s = (l & L) === 0;
      if (s && I(o, t), (l & pt) !== 0)
        _t.add(
                               
          o
        );
      else if ((l & P) !== 0) {
        var c = (
                                
          o
        );
        q?.delete(c), (l & Ae) === 0 && (l & K && (C === null || (C.f & gt) === 0) && (o.f |= Ae), Yn(c, J, n));
      } else if (s) {
        var h = (
                               
          o
        );
        (l & V) !== 0 && ae !== null && ae.add(h), n !== null ? n.push(h) : Zt(h);
      }
    }
}
function He(e) {
  if (typeof e != "object" || e === null || wt in e || Cn in e)
    return e;
  const t = kn(e);
  if (t !== pr && t !== gr)
    return e;
  var n =                 new Map(), r = wn(e), i =                 ie(0), a = ke, o = (l) => {
    if (ke === a)
      return l();
    var s = N, c = ke;
    B(null), fn(a);
    var h = l();
    return B(s), fn(c), h;
  };
  return r && n.set("length",                 ie(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(l, s, c) {
        (!("value" in c) || c.configurable === !1 || c.enumerable === !1 || c.writable === !1) && Lr();
        var h = n.get(s);
        return h === void 0 ? o(() => {
          var p =                 ie(c.value);
          return n.set(s, p), p;
        }) : le(h, c.value, !0), !0;
      },
      deleteProperty(l, s) {
        var c = n.get(s);
        if (c === void 0) {
          if (s in l) {
            const h = o(() =>                 ie(D));
            n.set(s, h), Je(i);
          }
        } else
          le(c, D), Je(i);
        return !0;
      },
      get(l, s, c) {
        if (s === wt)
          return e;
        var h = n.get(s), p = s in l;
        if (h === void 0 && (!p || qe(l, s)?.writable) && (h = o(() => {
          var f = He(p ? l[s] : D), u =                 ie(f);
          return u;
        }), n.set(s, h)), h !== void 0) {
          var d = A(h);
          return d === D ? void 0 : d;
        }
        return Reflect.get(l, s, c);
      },
      getOwnPropertyDescriptor(l, s) {
        var c = Reflect.getOwnPropertyDescriptor(l, s);
        if (c && "value" in c) {
          var h = n.get(s);
          h && (c.value = A(h));
        } else if (c === void 0) {
          var p = n.get(s), d = p?.v;
          if (p !== void 0 && d !== D)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return c;
      },
      has(l, s) {
        if (s === wt)
          return !0;
        var c = n.get(s), h = c !== void 0 && c.v !== D || Reflect.has(l, s);
        if (c !== void 0 || C !== null && (!h || qe(l, s)?.writable)) {
          c === void 0 && (c = o(() => {
            var d = h ? He(l[s]) : D, f =                 ie(d);
            return f;
          }), n.set(s, c));
          var p = A(c);
          if (p === D)
            return !1;
        }
        return h;
      },
      set(l, s, c, h) {
        var p = n.get(s), d = s in l;
        if (r && s === "length")
          for (var f = c; f <                              
          p.v; f += 1) {
            var u = n.get(f + "");
            u !== void 0 ? le(u, D) : f in l && (u = o(() =>                 ie(D)), n.set(f + "", u));
          }
        if (p === void 0)
          (!d || qe(l, s)?.writable) && (p = o(() =>                 ie(void 0)), le(p, He(c)), n.set(s, p));
        else {
          d = p.v !== D;
          var g = o(() => He(c));
          le(p, g);
        }
        var m = Reflect.getOwnPropertyDescriptor(l, s);
        if (m?.set && m.set.call(h, c), !d) {
          if (r && typeof s == "string") {
            var v = (
                                           
              n.get("length")
            ), w = Number(s);
            Number.isInteger(w) && w >= v.v && le(v, w + 1);
          }
          Je(i);
        }
        return !0;
      },
      ownKeys(l) {
        A(i);
        var s = Reflect.ownKeys(l).filter((p) => {
          var d = n.get(p);
          return d === void 0 || d.v !== D;
        });
        for (var [c, h] of n)
          h.v !== D && !(c in l) && s.push(c);
        return s;
      },
      setPrototypeOf() {
        Pr();
      }
    }
  );
}
var sn, Hn, Kn, Bn;
function Zr() {
  if (sn === void 0) {
    sn = window, Hn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    Kn = qe(t, "firstChild").get, Bn = qe(t, "nextSibling").get, nn(e) && (e[xt] = void 0, e[On] = null, e[wr] = void 0, e.__e = void 0), nn(n) && (n[Lt] = void 0);
  }
}
function Ce(e = "") {
  return document.createTextNode(e);
}
                       
function Qe(e) {
  return (
                                      
    Kn.call(e)
  );
}
                       
function rt(e) {
  return (
                                      
    Bn.call(e)
  );
}
function Vn(e, t) {
  return                 Qe(e);
}
function qn(e, t = !1) {
  {
    var n =                 Qe(e);
    return n instanceof Comment && n.data === "" ?                 rt(n) : n;
  }
}
function on(e, t = !1) {
  return                 Qe(e);
}
function At(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    rt(r);
  return r;
}
function $r(e) {
  e.textContent = "";
}
function Wn() {
  return !1;
}
function Qr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function ei(e) {
  var t = C;
  if (t === null)
    return N.f |= he, e;
  if ((t.f & ze) === 0 && (t.f & $e) === 0)
    throw e;
  Q(e, t);
}
function Q(e, t) {
  if (!(t !== null && (t.f & U) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & Rt) !== 0 && (t.f & (U | Dt)) === 0) {
        if ((t.f & ze) === 0)
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
function ti(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ge(e, t) {
  var n = C;
  n !== null && (n.f & j) !== 0 && (e |= j);
  var r = {
    ctx: Z,
    deps: null,
    nodes: null,
    f: e | L | K,
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
  E?.register_created_effect(r);
  var i = r;
  if ((e & $e) !== 0)
    De !== null ? De.push(r) : pe.ensure().schedule(r);
  else if (t !== null) {
    try {
      je(r);
    } catch (o) {
      throw G(r), o;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Ge) === 0 && (i = i.first, (e & V) !== 0 && (e & Le) !== 0 && i !== null && (i.f |= Le));
  }
  if (i !== null && (i.parent = n, n !== null && ti(i, n), N !== null && (N.f & P) !== 0 && (e & ce) === 0)) {
    var a = (
                            
      N
    );
    (a.effects ??= []).push(i);
  }
  return r;
}
function $t() {
  return N !== null && !W;
}
function Jn(e) {
  const t = ge(bt, null);
  return I(t, x), t.teardown = e, t;
}
function ni(e) {
  return ge($e | yr, e);
}
function ri(e) {
  pe.ensure();
  const t = ge(ce | Ge, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? Ee(t, () => {
      G(t), r(void 0);
    }) : (G(t), r(void 0));
  });
}
function ii(e) {
  return ge(xe | Ge, e);
}
function ai(e, t = 0) {
  return ge(bt | t, e);
}
function ct(e, t = [], n = [], r = []) {
  Fr(r, t, n, (i) => {
    ge(bt, () => {
      e(...i.map(A));
    });
  });
}
function Qt(e, t = 0) {
  var n = ge(V | t, e);
  return n;
}
function H(e) {
  return ge(X | Ge, e);
}
function Xn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = Oe, r = N;
    cn(!0), B(null);
    try {
      t.call(null);
    } catch (i) {
      Q(i, e.parent);
    } finally {
      cn(n), B(r);
    }
  }
}
function en(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && nt(() => {
      i.abort(tt);
    });
    var r = n.next;
    (n.f & ce) !== 0 ? n.parent = null : G(n, t), n = r;
  }
}
function li(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & X) === 0 && G(t), t = n;
  }
}
function G(e, t = !0) {
  var n = !1;
  (t || (e.f & mr) !== 0) && e.nodes !== null && e.nodes.end !== null && (si(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= Dt, en(e, t && !n), et(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const a of r)
      a.stop();
  Xn(e), e.f ^= Dt, e.f |= U;
  var i = e.parent;
  i !== null && i.first !== null && Zn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function si(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 rt(e);
    e.remove(), e = n;
  }
}
function Zn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Ee(e, t, n = !0) {
  var r = [];
  e.f |= Kt, $n(e, r, !0);
  var i = () => {
    n && G(e), t && t();
  }, a = r.length;
  if (a > 0) {
    var o = () => --a || i();
    for (var l of r)
      l.out(o);
  } else
    i();
}
function $n(e, t, n) {
  if ((e.f & j) === 0) {
    e.f ^= j;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var a = i.next;
      if ((i.f & ce) === 0) {
        var o = (i.f & Le) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & X) !== 0 && (e.f & V) !== 0;
        $n(i, t, o ? n : !1);
      }
      i = a;
    }
  }
}
function mt(e) {
  e.f &= ~Kt, Qn(e, !0);
}
function Qn(e, t) {
  if ((e.f & Kt) === 0 && (e.f & j) !== 0) {
    e.f ^= j, (e.f & x) === 0 && (I(e, L), pe.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Le) !== 0 || (n.f & X) !== 0;
      Qn(n, i ? t : !1), n = r;
    }
    var a = e.nodes && e.nodes.t;
    if (a !== null)
      for (const o of a)
        (o.is_global || t) && o.in();
  }
}
function tn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 rt(n);
      t.append(n), n = i;
    }
}
let ft = !1, Oe = !1;
function cn(e) {
  Oe = e;
}
let N = null, W = !1;
function B(e) {
  N = e;
}
let C = null;
function ne(e) {
  C = e;
}
let te = null;
function er(e) {
  N !== null && (te ??=                 new Set()).add(e);
}
let z = null, F = 0, Y = null;
function oi(e) {
  Y = e;
}
let tr = 1, we = 0, ke = we;
function fn(e) {
  ke = e;
}
function nr() {
  return ++tr;
}
function it(e) {
  var t = e.f;
  if ((t & L) !== 0)
    return !0;
  if (t & P && (e.f &= ~Ae), (t & J) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var a = n[i];
      if (it(
                              
        a
      ) && Mn(
                              
        a
      ), a.wv > e.wv)
        return !0;
    }
    (t & K) !== 0 &&                                                                   
                                                                
    q === null && I(e, x);
  }
  return !1;
}
function rr(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(te !== null && te.has(e)))
    for (var i = 0; i < r.length; i++) {
      var a = r[i];
      (a.f & P) !== 0 ? rr(
                              
        a,
        t,
        !1
      ) : t === a && (n ? I(a, L) : (a.f & x) !== 0 && I(a, J), Zt(
                             
        a
      ));
    }
}
function ir(e) {
  var t = z, n = F, r = Y, i = N, a = te, o = Z, l = W, s = ke, c = e.f;
  z =                              
  null, F = 0, Y = null, N = (c & (X | ce)) === 0 ? e : null, te = null, Pe(e.ctx), W = !1, ke = ++we, e.ac !== null && (nt(() => {
    e.ac.abort(tt);
  }), e.ac = null);
  try {
    e.f |= gt;
    var h = (
                             
      e.fn
    ), p = h();
    e.f |= ze;
    var d = un(e);
    if (Rn() && Y !== null && !W && d !== null && (e.f & (P | J | L)) === 0)
      for (var f = 0; f <                        
      Y.length; f++)
        rr(
          Y[f],
                               
          e
        );
    if (i !== null && i !== e) {
      if (we++, i.deps !== null)
        for (let u = 0; u < n; u += 1)
          i.deps[u].rv = we;
      if (t !== null)
        for (const u of t)
          u.rv = we;
      Y !== null && (r === null ? r = Y : r.push(...                       
      Y));
    }
    return (e.f & he) !== 0 && (e.f ^= he), p;
  } catch (u) {
    return un(e), ei(u);
  } finally {
    e.f ^= gt, z = t, F = n, Y = r, N = i, te = a, Pe(o), W = l, ke = s;
  }
}
function un(e) {
  var t = e.deps, n = E?.is_fork;
  if (z !== null) {
    var r;
    if (n || et(e, F), t !== null && F > 0)
      for (t.length = F + z.length, r = 0; r < z.length; r++)
        t[F + r] = z[r];
    else
      e.deps = t = z;
    if ($t() && (e.f & K) !== 0)
      for (r = F; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && F < t.length && (et(e, F), t.length = F);
  return t;
}
function ci(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = dr.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & P) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (z === null || !ht.call(z, t))) {
    var a = (
                            
      t
    );
    (a.f & K) !== 0 && (a.f ^= K, a.f &= ~Ae), a.v !== D && qt(a), a.ac !== null && nt(() => {
      a.ac.abort(tt), a.ac = null, I(a, L);
    }), Br(a), et(a, 0);
  }
}
function et(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      ci(e, n[r]);
}
function je(e) {
  var t = e.f;
  if ((t & U) === 0) {
    I(e, x);
    var n = C, r = ft;
    C = e, ft = (t & (X | ce)) === 0;
    try {
      (t & (V | Nn)) !== 0 ? li(e) : en(e), Xn(e);
      var i = ir(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = tr;
      var a;
    } finally {
      ft = r, C = n;
    }
  }
}
function A(e) {
  var t = e.f, n = (t & P) !== 0;
  if (N !== null && !W) {
    var r = C !== null && (C.f & U) !== 0;
    if (!r && (te === null || !te.has(e))) {
      var i = N.deps;
      if ((N.f & gt) !== 0)
        e.rv < we && (e.rv = we, z === null && i !== null && i[F] === e ? F++ : z === null ? z = [e] : z.push(e));
      else {
        N.deps ??= [], ht.call(N.deps, e) || N.deps.push(e);
        var a = e.reactions;
        a === null ? e.reactions = [N] : ht.call(a, N) || a.push(N);
      }
    }
  }
  if (Oe && ee.has(e))
    return ee.get(e);
  if (n) {
    var o = (
                            
      e
    );
    if (Oe) {
      var l = o.v;
      return ((o.f & x) === 0 && o.reactions !== null || lr(o)) && (l = Jt(o)), ee.set(o, l), l;
    }
    var s = (o.f & K) === 0 && !W && N !== null && (ft || (N.f & K) !== 0), c = (o.f & ze) === 0;
    it(o) && (s && (o.f |= K), Mn(o)), s && !c && (jn(o), ar(o));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & he) !== 0)
    throw e.v;
  return e.v;
}
function ar(e) {
  if (e.f |= K, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & P) !== 0 && (t.f & K) === 0 && (jn(
                              
        t
      ), ar(
                              
        t
      ));
}
function lr(e) {
  if (e.v === D) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (ee.has(t) || (t.f & P) !== 0 && lr(
                            
      t
    ))
      return !0;
  return !1;
}
function fi(e) {
  var t = W;
  try {
    return W = !0, e();
  } finally {
    W = t;
  }
}
const ui = ["touchstart", "touchmove"];
function di(e) {
  return ui.includes(e);
}
const Ke =                 Symbol("events"), sr =                 new Set(), jt =                 new Set();
function hi(e, t, n, r = {}) {
  function i(a) {
    if (r.capture || zt.call(t, a), !a.cancelBubble)
      return nt(() => n?.call(this, a));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? de(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function dn(e, t, n, r, i) {
  var a = { capture: r, passive: i }, o = hi(e, t, n, a);
  (t === document.body ||              
  t === window ||              
  t === document ||                                                                                                                     
  t instanceof HTMLMediaElement) && Jn(() => {
    t.removeEventListener(e, o, a);
  });
}
function pi(e, t, n) {
  (t[Ke] ??= {})[e] = n;
}
function gi(e) {
  for (var t = 0; t < e.length; t++)
    sr.add(e[t]);
  for (var n of jt)
    n(e);
}
let Nt = null, Ct = !1;
function zt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], a = (
                                 
    i[0] || e.target
  );
  Nt = e, Ct || (Ct = !0, setTimeout(() => {
    Ct = !1, Nt = null;
  }));
  var o = 0, l = Nt === e && e[Ke];
  if (l) {
    var s = i.indexOf(l);
    if (s !== -1 && (t === document || t ===                   
    window)) {
      e[Ke] = t;
      return;
    }
    var c = i.indexOf(t);
    if (c === -1)
      return;
    s <= c && (o = s);
  }
  if (a =                       
  i[o] || e.target, a !== t) {
    En(e, "currentTarget", {
      configurable: !0,
      get() {
        return a || n;
      }
    });
    var h = N, p = C;
    B(null), ne(null);
    try {
      for (var d, f = []; a !== null && a !== t; ) {
        try {
          var u = a[Ke]?.[r];
          u != null && (!                  
          a.disabled ||                                                                                           
                                                                                                     
          e.target === a) && u.call(a, e);
        } catch (g) {
          d ? f.push(g) : d = g;
        }
        if (e.cancelBubble) break;
        o++, a = o < i.length ? (
                                
          i[o]
        ) : null;
      }
      if (d) {
        for (let g of f)
          queueMicrotask(() => {
            throw g;
          });
        throw d;
      }
    } finally {
      e[Ke] = t, delete e.currentTarget, B(h), ne(p);
    }
  }
}
const vi = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function _i(e) {
  return (
                         
    vi?.createHTML(e) ?? e
  );
}
function mi(e) {
  var t = Qr("template");
  return t.innerHTML = _i(e.replaceAll("<!>", "<!---->")), t.content;
}
function Gt(e, t) {
  var n = (
                         
    C
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function ve(e, t) {
  var n = (t & Nr) !== 0, r = (t & Cr) !== 0, i, a = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = mi(a ? e : "<!>" + e), n || (i =                            
                    Qe(i)));
    var o = (
                                 
      r || Hn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var l = (
                                   
                        Qe(o)
      ), s = (
                                   
        o.lastChild
      );
      Gt(l, s);
    } else
      Gt(o, o);
    return o;
  };
}
function yi() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Ce();
  return e.append(t, n), Gt(t, n), e;
}
function se(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function bi(e) {
  let t = 0, n = Ne(0), r;
  return () => {
    $t() && (A(n), ai(() => (t === 0 && (r = fi(() => e(() => Je(n)))), t += 1, () => {
      de(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, Je(n));
      });
    })));
  };
}
var wi = Le | Ge;
function Ei(e, t, n, r) {
  new ki(e, t, n, r);
}
class ki {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #t;
                                    
  #l = null;
                              
  #e;
                                         
  #o;
                       
  #r;
                              
  #a = null;
                              
  #n = null;
                              
  #s = null;
                                        
  #i = null;
  #g = 0;
  #c = 0;
  #f = !1;
                            
  #d =                 new Set();
                            
  #v =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #u = null;
  #y = bi(() => (this.#u = Ne(this.#g), () => {
    this.#u = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#o = (a) => {
      var o = (
                             
        C
      );
      o.b = this, o.f |= Rt, r(a);
    }, this.parent =                      
    C.b, this.transform_error = i ?? this.parent?.transform_error ?? ((a) => a), this.#r = Qt(() => {
      this.#h();
    }, wi);
  }
  #_() {
    try {
      this.#a = H(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #w(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#b(t);
    de(i), n && (this.#s = H(() => {
      n(
        this.#t,
        () => t,
        () => r
      );
    }));
  }
     
                                                                              
                                                 
                           
                                                                 
     
  #b(t) {
    var n = !1, r = !1;
    const i = () => {
      if (n) {
        Sr();
        return;
      }
      n = !0, r && jr(), this.#s !== null && Ee(this.#s, () => {
        this.#s = null;
      }), this.#p(() => {
        this.#h();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (o) {
        Q(o, this.#r && this.#r.parent);
      }
    } };
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = H(() => t(this.#t)), de(() => {
      var n = this.#i = document.createDocumentFragment(), r = Ce(), i = !1;
      if (n.append(r), this.#a = this.#p(() => {
        try {
          return H(() => this.#o(r));
        } catch (a) {
          try {
            this.error(a), i = !0;
          } catch (o) {
            Q(o, this.#r.parent);
          }
          return null;
        }
      }), this.#a === null) {
        this.#i = null, i && this.#m(
                              
          E
        );
        return;
      }
      this.#c === 0 && (this.#t.before(n), this.#i = null, Ee(
                             
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#m(
                            
        E
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#c = 0, this.#g = 0, this.#a = H(() => {
        this.#o(this.#t);
      }), this.#c > 0) {
        var t = this.#i = document.createDocumentFragment();
        tn(this.#a, t);
        const n = (
                                               
          this.#e.pending
        );
        this.#n = H(() => n(this.#t));
      } else
        this.#m(
                              
          E
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#v);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    Ln(t, this.#d, this.#v);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #p(t) {
    var n = C, r = N, i = Z;
    ne(this.#r), B(this.#r), Pe(this.#r.ctx);
    try {
      return pe.ensure(), t();
    } finally {
      ne(n), B(r), Pe(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #k(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#k(t, n);
      return;
    }
    this.#c += t, this.#c === 0 && (this.#m(n), this.#n && Ee(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#k(t, n), this.#g += t, !(!this.#u || this.#f) && (this.#f = !0, de(() => {
      this.#f = !1, this.#u && Me(this.#u, this.#g);
    }));
  }
  get_effect_pending() {
    return this.#y(), A(
                                   
      this.#u
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    E?.is_fork ? (this.#a && E.skip_effect(this.#a), this.#n && E.skip_effect(this.#n), this.#s && E.skip_effect(this.#s), E.oncommit(() => {
      this.#A(t);
    })) : this.#A(t);
  }
     
                           
     
  #A(t) {
    this.#a && (G(this.#a), this.#a = null), this.#n && (G(this.#n), this.#n = null), this.#s && (G(this.#s), this.#s = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: a, invoke_onerror: o } = this.#b(i);
      o(), n && (this.#s = this.#p(() => {
        try {
          return H(() => {
            var l = (
                                   
              C
            );
            l.b = this, l.f |= Rt, n(
              this.#t,
              () => i,
              () => a
            );
          });
        } catch (l) {
          return Q(
            l,
                                 
            this.#r.parent
          ), null;
        }
      }));
    };
    de(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (a) {
        Q(a, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (a) => Q(a, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function hn(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[Lt] ??= e.nodeValue) && (e[Lt] = n, e.nodeValue = `${n}`);
}
function Ai(e, t) {
  return Ni(e, t);
}
const at =                 new Map();
function Ni(e, { target: t, anchor: n, props: r = {}, events: i, context: a, intro: o = !0, transformError: l }) {
  Zr();
  var s = void 0, c = ri(() => {
    var h = n ?? t.appendChild(Ce());
    Ei(
                                 
      h,
      {
        pending: () => {
        }
      },
      (f) => {
        Bt({});
        var u = (
                                         
          Z
        );
        a && (u.c = a), i && (r.$$events = i), s = e(f, r) || In(), Vt();
      },
      l
    );
    var p =                 new Set(), d = (f) => {
      for (var u = 0; u < f.length; u++) {
        var g = f[u];
        if (!p.has(g)) {
          p.add(g);
          var m = di(g);
          for (const y of [t, document]) {
            var v = at.get(y);
            v === void 0 && (v =                 new Map(), at.set(y, v));
            var w = v.get(g);
            w === void 0 ? (y.addEventListener(g, zt, { passive: m }), v.set(g, 1)) : v.set(g, w + 1);
          }
        }
      }
    };
    return d(yt(sr)), jt.add(d), () => {
      for (var f of p)
        for (const m of [t, document]) {
          var u = (
                                              
            at.get(m)
          ), g = (
                                 
            u.get(f)
          );
          --g == 0 ? (m.removeEventListener(f, zt), u.delete(f), u.size === 0 && at.delete(m)) : u.set(f, g);
        }
      jt.delete(d), h !== n && h.parentNode?.removeChild(h);
    };
  });
  return Ft.set(s, c), s;
}
let Ft =                 new WeakMap();
function Ci(e, t) {
  const n = Ft.get(e);
  return n ? (Ft.delete(e), n(t)) : Promise.resolve();
}
class Oi {
                             
  anchor;
                                
  #t =                 new Map();
     
                                                                   
                                                                      
             
        
                    
         
            
         
          
        
                                                                 
                             
     
  #l =                 new Map();
     
                                                                                          
                                                     
                             
     
  #e =                 new Map();
     
                                                
                     
     
  #o =                 new Set();
     
                                                                     
                                             
     
  #r = !0;
     
                                 
                                
     
  constructor(t, n = !0) {
    this.anchor = t, this.#r = n;
  }
     
                         
     
  #a = (t) => {
    if (this.#t.has(t)) {
      var n = (
                          
        this.#t.get(t)
      ), r = this.#l.get(n);
      if (r)
        mt(r), this.#o.delete(n);
      else {
        var i = this.#e.get(n);
        i && (mt(i.effect), this.#l.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [a, o] of this.#t) {
        if (this.#t.delete(a), a === t)
          break;
        const l = this.#e.get(o);
        l && (G(l.effect), this.#e.delete(o));
      }
      for (const [a, o] of this.#l) {
        if (a === n || this.#o.has(a)) continue;
        const l = () => {
          if (Array.from(this.#t.values()).includes(a)) {
            var c = document.createDocumentFragment();
            tn(o, c), c.append(Ce()), this.#e.set(a, { effect: o, fragment: c });
          } else
            G(o);
          this.#o.delete(a), this.#l.delete(a);
        };
        this.#r || !r ? (this.#o.add(a), Ee(o, l, !1)) : l();
      }
    }
  };
     
                         
     
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (G(i.effect), this.#e.delete(r));
  };
     
    
                     
                                                        
     
  ensure(t, n) {
    var r = (
                          
      E
    ), i = Wn();
    if (n && !this.#l.has(t) && !this.#e.has(t))
      if (i) {
        var a = document.createDocumentFragment(), o = Ce();
        a.append(o), this.#e.set(t, {
          effect: H(() => n(o)),
          fragment: a
        });
      } else
        this.#l.set(
          t,
          H(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [l, s] of this.#l)
        l === t ? r.unskip_effect(s) : r.skip_effect(s);
      for (const [l, s] of this.#e)
        l === t ? r.unskip_effect(s.effect) : r.skip_effect(s.effect);
      r.oncommit(this.#a), r.ondiscard(this.#n);
    } else
      this.#a(r);
  }
}
function Ut(e, t, n = !1) {
  var r = new Oi(e), i = n ? Le : 0;
  function a(o, l) {
    r.ensure(o, l);
  }
  Qt(() => {
    var o = !1;
    t((l, s = 0) => {
      o = !0, a(s, l);
    }), o || a(-1, null);
  }, i);
}
function Ti(e, t, n) {
  for (var r = [], i = t.length, a, o = t.length, l = 0; l < i; l++) {
    let p = t[l];
    Ee(
      p,
      () => {
        if (a) {
          if (a.pending.delete(p), a.done.add(p), a.pending.size === 0) {
            var d = (
                                                
              e.outrogroups
            );
            Yt(e, yt(a.done)), d.delete(a), d.size === 0 && (e.outrogroups = null);
          }
        } else
          o -= 1;
      },
      !1
    );
  }
  if (o === 0) {
    var s = r.length === 0 && n !== null && e.pending.size === 0;
    if (s) {
      var c = (
                              
        n
      ), h = (
                              
        c.parentNode
      );
      $r(h), h.append(c), e.items.clear();
    }
    Yt(e, t, !s);
  } else
    a = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(a);
}
function Yt(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const o of e.pending.values())
      for (const l of o)
        r.add(
                                 
          e.items.get(l).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var a = t[i];
    if (r?.has(a)) {
      a.f |= oe;
      const o = document.createDocumentFragment();
      tn(a, o);
    } else
      G(t[i], n);
  }
}
var pn;
function Si(e, t, n, r, i, a = null) {
  var o = e, l =                 new Map(), s = null, c =                 Hr(() => {
    var v = n();
    return (
                        
      wn(v) ? v : v == null ? [] : yt(v)
    );
  }), h, p =                 new Map(), d = !0;
  function f(v) {
    (m.effect.f & U) === 0 && (m.pending.delete(v), m.fallback = s, Ii(m, h, o, t, r), s !== null && (h.length === 0 ? (s.f & oe) === 0 ? mt(s) : (s.f ^= oe, Be(s, null, o)) : Ee(s, () => {
      s = null;
    })));
  }
  function u(v) {
    m.pending.delete(v);
  }
  var g = Qt(() => {
    h =                   
    A(c);
    for (var v = h.length, w =                 new Set(), y = (
                          
      E
    ), T = Wn(), O = 0; O < v; O += 1) {
      var _ = h[O], M = r(_, O), b = d ? null : l.get(M);
      b ? (b.v && Me(b.v, _), b.i && Me(b.i, O), T && y.unskip_effect(b.e)) : (b = Ri(
        l,
        d ? o : pn ??= Ce(),
        _,
        M,
        O,
        i,
        t,
        n
      ), d || (b.e.f |= oe), l.set(M, b)), w.add(M);
    }
    if (v === 0 && a && !s && (d ? s = H(() => a(o)) : (s = H(() => a(pn ??= Ce())), s.f |= oe)), v > w.size && Dr(), !d)
      if (p.set(y, w), T) {
        for (const [$, Fe] of l)
          w.has($) || y.skip_effect(Fe.e);
        y.oncommit(f), y.ondiscard(u);
      } else
        f(y);
    A(c);
  }), m = { effect: g, items: l, pending: p, outrogroups: null, fallback: s };
  d = !1;
}
function Ue(e) {
  for (; e !== null && (e.f & X) === 0; )
    e = e.next;
  return e;
}
function Ii(e, t, n, r, i) {
  var a = t.length, o = e.items, l = Ue(e.effect.first), s, c = null, h = [], p = [], d, f, u, g;
  for (g = 0; g < a; g += 1) {
    if (d = t[g], f = i(d, g), u =                        
    o.get(f).e, e.outrogroups !== null)
      for (const b of e.outrogroups)
        b.pending.delete(u), b.done.delete(u);
    if ((u.f & j) !== 0 && mt(u), (u.f & oe) !== 0)
      if (u.f ^= oe, u === l)
        Be(u, null, n);
      else {
        var m = c ? c.next : l;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), ue(e, c, u), ue(e, u, m), Be(u, m, n), c = u, h = [], p = [], l = Ue(c.next);
        continue;
      }
    if (u !== l) {
      if (s !== void 0 && s.has(u)) {
        if (h.length < p.length) {
          var v = p[0], w;
          c = v.prev;
          var y = h[0], T = h[h.length - 1];
          for (w = 0; w < h.length; w += 1)
            Be(h[w], v, n);
          for (w = 0; w < p.length; w += 1)
            s.delete(p[w]);
          ue(e, y.prev, T.next), ue(e, c, y), ue(e, T, v), l = v, c = T, g -= 1, h = [], p = [];
        } else
          s.delete(u), Be(u, l, n), ue(e, u.prev, u.next), ue(e, u, c === null ? e.effect.first : c.next), ue(e, c, u), c = u;
        continue;
      }
      for (h = [], p = []; l !== null && l !== u; )
        (s ??=                 new Set()).add(l), p.push(l), l = Ue(l.next);
      if (l === null)
        continue;
    }
    (u.f & oe) === 0 && h.push(u), c = u, l = Ue(u.next);
  }
  if (e.outrogroups !== null) {
    for (const b of e.outrogroups)
      b.pending.size === 0 && (Yt(e, yt(b.done)), e.outrogroups?.delete(b));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || s !== void 0) {
    var O = [];
    if (s !== void 0)
      for (u of s)
        (u.f & j) === 0 && O.push(u);
    for (; l !== null; )
      (l.f & j) === 0 && l !== e.fallback && O.push(l), l = Ue(l.next);
    var _ = O.length;
    if (_ > 0) {
      var M = null;
      Ti(e, O, M);
    }
  }
}
function Ri(e, t, n, r, i, a, o, l) {
  var s = (o & Er) !== 0 ? (o & Ar) === 0 ?                 Jr(n, !1, !1) : Ne(n) : null, c = (o & kr) !== 0 ? Ne(i) : null;
  return {
    v: s,
    i: c,
    e: H(() => (a(t, s ?? n, c ?? i, l), () => {
      e.delete(r);
    }))
  };
}
function Be(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, a = t && (t.f & oe) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var o = (
                                   
                        rt(r)
      );
      if (a.before(r), r === i)
        return;
      r = o;
    }
}
function ue(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const gn = [...` 	
\r\f \v\uFEFF`];
function Di(e, t, n) {
  var r = "" + e;
  if (n) {
    for (var i of Object.keys(n))
      if (n[i])
        r = r ? r + " " + i : i;
      else if (r.length)
        for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0; ) {
          var l = o + a;
          (o === 0 || gn.includes(r[o - 1])) && (l === r.length || gn.includes(r[l])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(l + 1) : o = l;
        }
  }
  return r === "" ? null : r;
}
function xi(e, t, n, r, i, a) {
  var o = (
                      
    e[xt]
  );
  if (o !== n || o === void 0) {
    var l = Di(n, r, a);
    l == null ? e.removeAttribute("class") : e.className = l, e[xt] = n;
  } else if (a && i !== a)
    for (var s in a) {
      var c = !!a[s];
      (i == null || c !== !!i[s]) && e.classList.toggle(s, c);
    }
  return a;
}
const Li =                 Symbol("is custom element"), Pi =                 Symbol("is html");
function me(e, t, n, r) {
  var i = Mi(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[br] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && ji(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function Mi(e) {
  return (
                                                    
                      
    e[On] ??= {
      [Li]: e.nodeName.includes("-"),
      [Pi]: e.namespaceURI === Or
    }
  );
}
var vn =                 new Map();
function ji(e) {
  var t = e.getAttribute("is") || e.nodeName, n = vn.get(t);
  if (n) return n;
  vn.set(t, n =                 new Set());
  for (var r, i = e, a = Element.prototype; a !== i; ) {
    r = hr(i);
    for (var o in r)
      r[o].set &&                                                                                     
      o !== "innerHTML" && o !== "textContent" && o !== "innerText" && n.add(o);
    i = kn(i);
  }
  return n;
}
const zi = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(zi);
const _n = /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
function ut(e) {
  if (e.kind === "mapped") {
    const t = ["EXACT", "EXISTING_VERIFIED"].includes(e.status) && typeof e.image == "string" && _n.test(e.image) && typeof e.spritePathId == "string";
    return { mapped: !0, src: t ? "./" + e.image : null, status: e.status, label: t ? "カテゴリ画像" : "カテゴリ画像：画像未確定", spritePathId: t ? e.spritePathId : void 0 };
  }
  return { mapped: !1, src: e.kind === "legacy" && e.image.startsWith("./") && _n.test(e.image.slice(2)) ? e.image : null, status: "UNKNOWN", label: "カテゴリ画像：画像未確定", spritePathId: void 0 };
}
const Se = (e) => typeof e == "string" && e.length > 0 && e.length <= 4096;
function dt(e) {
  if (!e || !Array.isArray(e.rows) || e.rows.length > 512 || !Number.isSafeInteger(e.totalCategories) || e.totalCategories < e.rows.length || e.totalCategories > 512 || !(e.selectedKey === null || Se(e.selectedKey))) throw Error("CATEGORY_SNAPSHOT_INVALID");
  const t =                 new Set();
  for (const n of e.rows) {
    if (!n || !Se(n.key) || !Se(n.title) || !Se(n.description) || t.has(n.key) || !n.image || !["mapped", "legacy", "unknown"].includes(n.image.kind) || n.image.kind === "mapped" && !Se(n.image.status) || n.image.kind === "legacy" && !Se(n.image.image)) throw Error("CATEGORY_ROW_INVALID");
    t.add(n.key);
  }
  return e;
}
function Gi(e) {
  return { read: () => dt(e.read()), select(t) {
    if (!dt(e.read()).rows.some((r) => r.key === t)) throw Error("CATEGORY_NOT_VISIBLE");
    try {
      if (e.selectCategory(t), dt(e.read()).selectedKey !== t) throw Error("CATEGORY_SELECTION_POSTCONDITION");
    } finally {
      e.invalidate?.();
    }
  } };
}
var Fi =                 ve('<img alt="" width="92" height="92" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>'), Ui =                 ve('<span class="media-null-mark" aria-hidden="true">—</span>'), Yi =                 ve('<span class="media-thumb media-category" data-image-kind="category"><!></span>'), Hi =                 ve('<img class="collection-icon" alt="" loading="lazy" width="92" height="92"/>'), Ki =                 ve('<span class="collection-icon-fallback">画像 UNKNOWN</span>');
function Bi(e, t) {
  Bt(t, !0);
  const n =                 rn(() => ut(t.image));
  let r =                 ie(null);
  const i =                 rn(() => A(n).src !== null && A(r) === A(n).src);
  var a = yi(), o = qn(a);
  {
    var l = (h) => {
      var p = Yi(), d = Vn(p);
      {
        var f = (g) => {
          var m = Fi();
          ct(() => {
            me(m, "src", A(n).src), me(m, "data-sprite-path-id", A(n).spritePathId);
          }), dn("error", m, () => le(r, A(n).src, !0)), se(g, m);
        }, u = (g) => {
          var m = Ui();
          se(g, m);
        };
        Ut(d, (g) => {
          A(n).src && !A(i) ? g(f) : g(u, -1);
        });
      }
      ct(() => {
        me(p, "data-image-status", A(i) ? "LOAD_FAILED" : A(n).status), me(p, "aria-label", A(n).label), me(p, "title", A(n).src ? "カテゴリ画像" : "カテゴリ画像：" + A(n).status);
      }), se(h, p);
    }, s = (h) => {
      var p = Hi();
      ct(() => me(p, "src", A(n).src)), dn("error", p, () => le(r, A(n).src, !0)), se(h, p);
    }, c = (h) => {
      var p = Ki();
      se(h, p);
    };
    Ut(o, (h) => {
      A(n).mapped ? h(l) : A(n).src && !A(i) ? h(s, 1) : h(c, -1);
    });
  }
  se(e, a), Vt();
}
var Vi =                 ve('<p class="placeholder">該当するカテゴリがありません。</p>'), qi =                 ve('<button type="button"><!><span class="collection-title"> </span><small class="collection-meta"> </small></button>'), Wi =                 ve("<!> <!>", 1);
function Ji(e, t) {
  Bt(t, !0);
  var n = Wi(), r = qn(n);
  {
    var i = (o) => {
      var l = Vi();
      se(o, l);
    };
    Ut(r, (o) => {
      t.snapshot.rows.length === 0 && o(i);
    });
  }
  var a = At(r, 2);
  Si(a, 17, () => t.snapshot.rows, (o) => o.key, (o, l) => {
    var s = qi();
    let c;
    var h = Vn(s);
    Bi(h, {
      get image() {
        return A(l).image;
      }
    });
    var p = At(h), d = on(p, !0), f = At(p), u = on(f, !0);
    ct(() => {
      c = xi(s, 1, "collection-card", null, c, { selected: t.snapshot.selectedKey === A(l).key }), me(s, "data-category-key", A(l).key), hn(d, A(l).title), hn(u, A(l).description);
    }), pi("click", s, () => t.port.select(A(l).key)), se(o, s);
  }), se(e, n), Vt();
}
gi(["click"]);
const Xi = "data-hkia-svelte-categories", S = (e) => {
  if (!e) throw Error("PRODUCT_CATEGORY_DOM_CONTRACT");
}, Xe = (e) => e.textContent ?? "", R = (e, t) => e.getAttribute(t);
function Zi(e) {
  let t;
  if (e.tagName === "SPAN" && e.className === "media-thumb media-category") {
    const n = R(e, "data-image-status");
    S(n && R(e, "data-image-kind") === "category" && e.children.length === 1);
    const r = e.children[0], i = R(r, "src");
    if (r.tagName === "IMG") {
      const a = R(r, "data-sprite-path-id");
      S(i?.startsWith("./") && a !== null && R(r, "alt") === "" && R(r, "width") === "92" && R(r, "height") === "92" && R(r, "loading") === "lazy" && R(r, "decoding") === "async" && R(r, "referrerpolicy") === "no-referrer"), t = { kind: "mapped", status: n, image: i.slice(2), spritePathId: a };
      const o = ut(t);
      S(o.src === i && R(e, "aria-label") === o.label && R(e, "title") === "カテゴリ画像");
    } else {
      S(r.tagName === "SPAN" && r.className === "media-null-mark" && Xe(r) === "—" && R(r, "aria-hidden") === "true"), t = { kind: "mapped", status: n, image: null };
      const a = ut(t);
      S(a.src === null && R(e, "aria-label") === a.label && R(e, "title") === "カテゴリ画像：" + n);
    }
  } else if (e.tagName === "IMG" && e.className === "collection-icon") {
    const n = R(e, "src");
    S(n && R(e, "alt") === "" && R(e, "width") === "92" && R(e, "height") === "92" && R(e, "loading") === "lazy"), t = { kind: "legacy", image: n }, S(ut(t).src === n);
  } else
    S(e.tagName === "SPAN" && e.className === "collection-icon-fallback" && Xe(e) === "画像 UNKNOWN"), t = { kind: "unknown" };
  return Object.freeze(t);
}
function lt(e, t, n, r, i = !1) {
  S(e.tagName === "DIV" && e.id === "collectionGrid" && e.className === "collection-grid");
  const a = [], o =                 new Map();
  t.length ? S(e.children.length === t.length) : S(e.children.length === 1 && e.children[0].tagName === "P" && e.children[0].className === "placeholder" && Xe(e.children[0]) === "該当するカテゴリがありません。");
  for (const [s, c] of t.entries()) {
    const h = e.children[s];
    S(h.tagName === "BUTTON" && h.type === "button" && h.className === (c === n ? "collection-card selected" : "collection-card") && h.children.length === 3 && (!i || R(h, "data-category-key") === c));
    const [p, d, f] = Array.from(h.children);
    S(d.tagName === "SPAN" && d.className === "collection-title" && f.tagName === "SMALL" && f.className === "collection-meta"), a.push(Object.freeze({ key: c, title: Xe(d), description: Xe(f), image: Zi(p) })), o.set(c, h);
  }
  return { snapshot: dt(Object.freeze({ rows: Object.freeze(a), selectedKey: n, totalCategories: r })), buttons: o };
}
const Ot = (e, t) => JSON.stringify(e) === JSON.stringify(t);
function $i(e, t) {
  let n = null, r = null, i = !1, a = !1, o = !1, l = 0;
  function s(d) {
    const f = e.querySelectorAll('[id="collectionGrid"]');
    return f.length === 1 && f[0] === d;
  }
  function c(d) {
    try {
      d();
    } catch {
    }
  }
  function h() {
    r = null;
    const d = n;
    if (d) {
      if (n = null, !s(d.candidate)) {
        a = !0, d.candidate.parentElement || c(d.dispose);
        return;
      }
      try {
        d.candidate.replaceWith(d.legacy), S(s(d.legacy));
      } catch {
        a = !0;
        return;
      }
      c(d.dispose);
    }
  }
  function p(d, f, u, g) {
    if (a || o || n || !s(d)) return "LEGACY_RETAINED";
    let m;
    try {
      m = lt(d, f, u, g), r = m.snapshot, l++;
    } catch {
      return r = null, "LEGACY_RETAINED";
    }
    const v = d.parentElement, w = {}, y = d.cloneNode(!1);
    y.setAttribute(Xi, "1");
    const T = [...m.buttons].find(([, b]) => e.activeElement === b)?.[0];
    let O, _ = !1;
    const M = Gi({ read() {
      return S(r !== null), r;
    }, selectCategory(b) {
      S(!i && n?.token === w && s(y) && m.buttons.has(b)), i = !0;
      const $ = l;
      try {
        m.buttons.get(b).click(), S(l > $);
      } finally {
        i = !1;
      }
    } });
    o = !0;
    try {
      O = t(y, m.snapshot, M), S(typeof O == "function");
      const b = lt(y, f, u, g, !0);
      S(Ot(b.snapshot, m.snapshot));
      const $ = lt(d, f, u, g);
      return S(r === m.snapshot && s(d) && d.parentElement === v && Ot($.snapshot, m.snapshot) && [...m.buttons].every(([Fe, fe]) => $.buttons.get(Fe) === fe)), _ = !0, d.replaceWith(y), S(s(y) && y.parentElement === v && Ot(lt(y, f, u, g, !0).snapshot, m.snapshot)), n = { legacy: d, candidate: y, dispose: O, token: w }, T && b.buttons.get(T)?.focus(), "MOUNTED";
    } catch {
      if (n = null, _)
        if (v && y.parentElement === v && d.parentElement === null)
          try {
            y.replaceWith(d), S(s(d)), T && m.buttons.get(T)?.focus();
          } catch {
            a = !0;
          }
        else s(d) || (a = !0);
      return O && c(O), "LEGACY_RETAINED";
    } finally {
      o = !1;
    }
  }
  return { restore: h, render: p };
}
const re = (e) => {
  if (!e) throw Error("CATEGORY_PRODUCER_CONTRACT");
}, Ie = (e) => Number.isSafeInteger(e) && Number(e) >= 0, Re = (e) => typeof e == "string" && e.length > 0 && e.length <= 4096, mn = /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
function Qi(e, t, n) {
  re(e && t && Array.isArray(e.rows) && Array.isArray(t.rows)), re(Ie(e.totalCategories) && e.totalCategories <= 512 && e.totalCategories >= e.rows.length && e.totalCategories === t.totalCategories && e.rows.length === t.rows.length && e.selectedKey === t.selectedKey && (e.selectedKey === null || Re(e.selectedKey)));
  const r =                 new Set(), i = e.rows.map((a, o) => {
    const l = t.rows[o];
    re(a && l && Re(a.key) && !r.has(a.key) && a.key === l.key && Re(a.title) && a.title === l.title && Ie(a.definitionCount) && typeof a.matched == "boolean"), r.add(a.key), re(a.matched ? Ie(a.recorded) && Ie(a.total) && a.recorded <= a.total : a.recorded === null && a.total === null), re(a.parent === null || a.matched && a.parent && Ie(a.parent.recorded) && Ie(a.parent.total) && a.parent.recorded <= a.parent.total);
    const s = l.image;
    re(s && ["mapped", "legacy", "unknown"].includes(s.kind));
    let c;
    return s.kind === "mapped" ? (re(Re(s.status) && (s.image == null || Re(s.image) && mn.test(s.image) && typeof s.spritePathId == "string")), c = Object.freeze({ kind: "mapped", status: s.status, image: s.image ?? null, ...s.image == null ? {} : { spritePathId: s.spritePathId } })) : s.kind === "legacy" ? (re(Re(s.image) && s.image.startsWith("./") && mn.test(s.image.slice(2))), c = Object.freeze({ kind: "legacy", image: s.image })) : c = Object.freeze({ kind: "unknown" }), Object.freeze({ key: a.key, title: a.title, definitionCount: a.definitionCount, matched: a.matched, recorded: a.recorded, total: a.total, parent: a.parent === null ? null : Object.freeze({ recorded: a.parent.recorded, total: a.parent.total }), image: c });
  });
  return re(n === null), Object.freeze({ rows: Object.freeze(i), selectedKey: e.selectedKey, totalCategories: e.totalCategories, locale: null });
}
const yn = Object.freeze({ de: "bd5bb8948e5e15e886c4f58421b00b41f0ec68a8ec627b023776ac1525507edb", en: "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", "en-GB": "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", es: "fb3061db5c00ef1c32d24af6b49246e53924dd90bd7984993c4a0774d037950d", fr: "1504c6d257bfb77003fecdd7acbc5cf114a8e51050a7521ab4ca42eeb2fc9737", "fr-CA": "17360cc5e61429400bdf4fa703121a54a0aeaf2368902609bc2e0d7dfa166038", it: "252954237409005d1fee26f96f604619380001917dccd93b133ead52a6549619", ja: "5729953617fdda2c39fef0499dc922a55c6b4a0d0bf134fa1a656cb3deb74851", ko: "df8800988f3c50fcee9a73e5c60093da4ef2737bb62cd841466ecae2e41874c7", nl: "a9c9f522c04c61a85e63d030a2407028e122a4c9cff95d57d7b1df6e1c7ae948", "pt-BR": "9befdaa8b85d09f623f75ed980af465afa88e7a07a163ec7f87f9aaf90974c13", ru: "08c523b001893cb1c1b3a510ac68a1874c1194ef7a0690f2aad1cd8f1c2d57cd", tr: "9e0a2f2ee46bb9f5c8eae28842e4ea53cc1000146d375250b132e450ee5530b5", "zh-Hans": "9a5b1098e6cf9a9f19a0dea90a48bda78ecd0ef95ade4c4ca54e4082237b0139", "zh-Hant": "9638729fca88ca34e47006eef3889b8b2491ddc0a79cf6588f155ad2de0633cc" }), or = Object.freeze(["nav.achievements", "nav.collections", "nav.workspace", "nav.tabs", "r2.preview", "ach.intro", "ach.count", "ach.empty", "col.intro", "col.count", "ach.search.label", "ach.search.placeholder", "ach.filter.label", "ach.filter.all", "ach.filter.complete", "ach.filter.incomplete", "ach.filter.missing", "ach.filter.unknownSource", "ach.image.label", "ach.image.all", "ach.image.exact", "ach.image.sourceNull", "ach.image.unknown", "ach.sort.label", "ach.sort.source", "ach.sort.name", "ach.sort.progressDesc", "ach.sort.progressAsc", "ach.sort.completedFirst", "col.search.label", "col.search.placeholder", "col.filter.label", "col.filter.all", "col.filter.hasRecord", "col.filter.noRecord", "col.filter.unknown", "col.sort.label", "col.sort.source", "col.sort.name", "col.sort.recordDesc", "locale.label", "locale.auto", "locale.loading", "locale.unverified", "file.open", "file.status", "file.backup", "file.export", "edit.preview", "edit.apply", "edit.undo", "edit.redo", "edit.reset", "edit.complete", "edit.revoke", "edit.collect", "edit.uncollect", "edit.progress", "edit.date", "edit.collectionDate", "edit.batch", "edit.selected", "state.unknown", "state.unverified", "state.unsupported", "state.notRecorded", "state.absentRef", "state.missingText", "state.writerOff", "state.previewOnly", "warning.linkage", "warning.history", "warning.reward", "error.file", "error.version", "error.stale", "error.integrity", "error.locale", "privacy.local", "credits.notice", "col.grid.empty", "col.image.label", "col.image.unverified", "col.image.unknown", "col.image.status", "col.grid.recorded", "col.grid.parentReference", "col.grid.unmatched", "r3.detail.preview", "r4.ach.preview", "r4.ach.selection", "r4.ach.unselected", "ach.row.unknownName", "ach.row.externalImageUnknown", "r4.ach.limit", "ach.list.more", "ach.row.image.label", "ach.row.image.unverified", "ach.row.image.status", "ach.row.status.missing", "ach.row.aria", "ach.row.subtitle.missing", "ach.row.subtitle.document", "ach.list.unreadable", "ach.list.noMatch", "ach.list.unloaded", "col.item.search.placeholder", "col.item.search.label", "col.item.history.label", "col.item.sort.label", "col.item.sort.internal", "col.item.sort.id", "col.item.inspect", "col.item.empty", "col.item.guid", "col.item.history.presence", "col.item.history.rawTicks", "col.item.history.calendar", "col.item.history.unknownHint", "col.item.previewHint", "col.item.list.caption", "ach.detail.heading", "ach.detail.empty", "ach.detail.missingHint", "ach.detail.definitionMatch", "ach.detail.matched", "ach.detail.unknownValue", "ach.detail.unset", "ach.linkage.heading", "ach.linkage.requiredConfirmed", "ach.linkage.requiredCandidate", "ach.linkage.related", "ach.linkage.unknown", "ach.linkage.hint", "ach.facts.heading", "ach.facts.definitionHeading", "ach.facts.builtinHint", "ach.facts.groupHint", "ach.facts.dlcHint", "ach.facts.groupNameHint", "ach.facts.counterUnknown", "ach.facts.counterAbsent", "ach.facts.counterNull", "ach.facts.rewardUnknown", "ach.facts.rewardNone", "ach.facts.childMissing", "ach.facts.childIncomplete", "ach.facts.groupProgress", "col.item.image.label", "col.definition.image.label", "col.item.image.unverified", "col.item.image.status", "col.item.history.recorded", "col.item.history.absent", "col.item.history.status", "col.item.ticks", "col.item.calendarUnknown", "col.item.parent", "col.item.parentCross", "col.item.history.rawUnknown", "ach.detail.unknownDefinition", "ach.linkage.count", "ach.linkage.unverifiedCount", "ach.linkage.systemCount", "ach.facts.internalKey", "ach.facts.membersHeading", "ach.facts.membersLabel", "ach.facts.definitionUnknown", "ach.facts.groupUnknown", "ach.facts.counterName", "ach.facts.threshold", "ach.facts.builtin", "ach.facts.counterGuid", "ach.facts.counterSaved", "ach.facts.counterDocument", "ach.facts.onlyUniques", "ach.facts.countedGuids", "ach.facts.countedValues", "ach.facts.rewardDefinition", "ach.facts.rewardReceipt", "ach.facts.rewardValue", "ach.facts.rewardZero", "ach.facts.groupName", "ach.facts.referenceCount", "ach.facts.savedCompletion", "ach.facts.groupCounter", "ach.facts.groupGuid", "ach.facts.definitionGuid", "ach.facts.groupAbsent", "ach.detail.statusLabel", "locale.previewScope", "locale.storageUnavailable"]), ea = or.length;
async function ta(e, t, n) {
  if (typeof t != "string" || !Object.hasOwn(yn, t) || !(e instanceof Uint8Array) || e.length === 0 || e.length > 65536) throw Error("EDITOR_CATALOG_CONTRACT");
  const r = Uint8Array.from(e), i = await n(r.slice());
  if (i !== yn[t]) throw Error("EDITOR_CATALOG_SHA");
  const a = JSON.parse(new TextDecoder("utf-8", { fatal: !0 }).decode(r));
  if (!a || Object.getPrototypeOf(a) !== Object.prototype || Object.keys(a).length !== ea || !or.every((o) => Object.hasOwn(a, o) && typeof a[o] == "string" && a[o].trim())) throw Error("EDITOR_CATALOG_KEYS");
  return Object.freeze({ digest: i, catalog: Object.freeze(a) });
}
const na = Object.freeze(["col.grid.empty", "col.image.label", "col.image.unverified", "col.image.unknown", "col.image.status", "col.grid.recorded", "col.grid.parentReference", "col.grid.unmatched"]), cr =                 new WeakSet(), k = (e) => {
  if (!e) throw Error("CATEGORY_LOCALE_CONTRACT");
}, _e = (e) => Number.isSafeInteger(e) && e >= 0, ye = (e) => typeof e == "string" && e.length > 0 && e.length <= 4096, fr = (e, t) => Object.prototype.hasOwnProperty.call(e, t), ur = Object.freeze({ "col.grid.empty": "該当するカテゴリがありません。", "col.image.label": "カテゴリ画像", "col.image.unverified": "カテゴリ画像：画像未確定", "col.image.unknown": "画像 UNKNOWN", "col.image.status": "カテゴリ画像：{status}", "col.grid.recorded": "収集ID照合 {recorded} / {total} ID", "col.grid.parentReference": "親単位・参考 {recorded} / {total}", "col.grid.unmatched": "未照合 / {count}件の定義" }), ra = Object.freeze({ "col.image.status": ["status"], "col.grid.recorded": ["recorded", "total"], "col.grid.parentReference": ["recorded", "total"], "col.grid.unmatched": ["count"] });
function ia(e, t) {
  k(ye(t));
  const n = [...t.matchAll(/\{([^{}]+)\}/g)].map((r) => r[1]).sort();
  k(JSON.stringify(n) === JSON.stringify([...ra[e] ?? []].sort()) && !/[{}]/.test(t.replace(/\{[^{}]+\}/g, "")));
}
async function oa(e, t, n) {
  const { catalog: r, digest: i } = await ta(e, t, n), a = Object.freeze(Object.fromEntries(na.map((l) => (k(fr(r, l)), ia(l, r[l]), [l, r[l]])))), o = Object.freeze({ locale: t, sha256: i, strings: a });
  return cr.add(o), o;
}
function Ve(e) {
  k(e && Array.isArray(e.rows) && e.rows.length <= 512 && _e(e.totalCategories) && e.totalCategories >= e.rows.length && e.totalCategories <= 512 && (e.selectedKey === null || ye(e.selectedKey)));
  const t =                 new Set(), n = e.rows.map((i) => {
    k(i && ye(i.key) && !t.has(i.key) && ye(i.title) && _e(i.definitionCount) && typeof i.matched == "boolean"), t.add(i.key), k(i.matched ? _e(i.recorded) && _e(i.total) && i.recorded <= i.total : i.recorded === null && i.total === null), k(i.parent === null || i.matched && i.parent && _e(i.parent.recorded) && _e(i.parent.total) && i.parent.recorded <= i.parent.total);
    const a = i.image;
    k(a && ["mapped", "legacy", "unknown"].includes(a.kind));
    const o = /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
    a.kind === "mapped" && k(ye(a.status) && (a.image == null || ye(a.image) && o.test(a.image) && typeof a.spritePathId == "string")), a.kind === "legacy" && k(ye(a.image) && a.image.startsWith("./") && o.test(a.image.slice(2)));
    const l = a.kind === "mapped" ? { kind: "mapped", status: a.status, image: a.image ?? null, spritePathId: a.image ? a.spritePathId : null } : a.kind === "legacy" ? { kind: "legacy", image: a.image } : { kind: "unknown" };
    return Object.freeze({ key: i.key, title: i.title, definitionCount: i.definitionCount, matched: i.matched, recorded: i.recorded, total: i.total, parent: i.parent === null ? null : Object.freeze({ recorded: i.parent.recorded, total: i.parent.total }), image: Object.freeze(l) });
  }), r = e.locale;
  return k(r === null || r && _e(r.epoch) && cr.has(r.catalog)), Object.freeze({ rows: Object.freeze(n), totalCategories: e.totalCategories, selectedKey: e.selectedKey, locale: r === null ? null : Object.freeze({ epoch: r.epoch, catalog: r.catalog }) });
}
const Tt = (e, t) => e.selectedKey === t.selectedKey && e.totalCategories === t.totalCategories && JSON.stringify(e.rows) === JSON.stringify(t.rows) && (e.locale === null ? t.locale === null : t.locale !== null && e.locale.epoch === t.locale.epoch && e.locale.catalog === t.locale.catalog), Ze = (e) => e.kind === "mapped" && ["EXACT", "EXISTING_VERIFIED"].includes(e.status) && e.image !== null;
function Ht(e) {
  const t = e.locale?.catalog.locale ?? null, n = e.locale?.catalog.strings ?? ur, r = new Intl.NumberFormat(t ?? void 0), i = (s) => r.format(s), a = (s) => t === null ? String(s) : i(s), o = (s, c = {}) => n[s].replace(/\{([^{}]+)\}/g, (h, p) => (k(fr(c, p)), String(c[p]))), l = e.rows.map((s) => {
    const c = s.image;
    return Object.freeze({ key: s.key, title: s.title, description: s.matched ? o("col.grid.recorded", { recorded: i(s.recorded), total: i(s.total) }) + (s.parent ? " ／ " + o("col.grid.parentReference", { recorded: a(s.parent.recorded), total: a(s.parent.total) }) : "") : o("col.grid.unmatched", { count: a(s.definitionCount) }), image: Object.freeze({ label: c.kind === "mapped" ? o(Ze(c) ? "col.image.label" : "col.image.unverified") : null, title: c.kind === "mapped" ? Ze(c) ? o("col.image.label") : o("col.image.status", { status: c.status }) : null, fallback: o("col.image.unknown") }) });
  });
  return Object.freeze({ lang: t, empty: o("col.grid.empty"), rows: Object.freeze(l) });
}
function aa(e) {
  return Ht(Ve(e));
}
const St = (e, t) => e.length === t.length && e.every((n, r) => n === t[r]), st = (e, t) => t === null ? e.textContent : e.getAttribute(t), bn = (e, t, n) => {
  t === null ? e.textContent = n : n === null ? e.removeAttribute(t) : e.setAttribute(t, n);
};
function la(e) {
  let t = !1, n = null;
  const r =                 new WeakMap(), i = (l) => l?.tagName === "DIV" && l.id === "collectionGrid" && l.className === "collection-grid" && l.getAttribute("data-hkia-svelte-categories") === "1" && l.isConnected && e.querySelectorAll('[id="collectionGrid"]').length === 1 && e.getElementById("collectionGrid") === l;
  function a(l, s, c) {
    const h = Array.from(l.children), p = [], d = [...h], f = (g, m, v) => {
      k(g), p.push({ node: g, key: m, expected: v, actual: st(g, m) });
    }, u = (g, m, v) => k(g?.tagName === m && g.className === v && g.children.length === 0);
    return s.rows.length ? (k(h.length === s.rows.length), s.rows.forEach((g, m) => {
      const v = h[m], w = c.rows[m];
      k(v.tagName === "BUTTON" && v.type === "button" && v.className === (g.key === s.selectedKey ? "collection-card selected" : "collection-card") && v.getAttribute("data-category-key") === g.key && v.children.length === 3);
      const [y, T, O] = Array.from(v.children);
      d.push(y, T, O), u(T, "SPAN", "collection-title"), u(O, "SMALL", "collection-meta"), k(T.textContent === g.title), f(O, null, w.description), f(O, "lang", c.lang);
      const _ = g.image;
      if (_.kind === "mapped") {
        k(y.tagName === "SPAN" && y.className === "media-thumb media-category" && y.getAttribute("data-image-kind") === "category" && y.children.length === 1);
        const M = y.getAttribute("data-image-status"), b = y.children[0], $ = Ze(_) && M === _.status;
        d.push(b), k(M === _.status || Ze(_) && M === "LOAD_FAILED"), $ ? k(b.tagName === "IMG" && b.getAttribute("src") === "./" + _.image && b.getAttribute("data-sprite-path-id") === _.spritePathId && b.getAttribute("alt") === "" && b.getAttribute("width") === "92" && b.getAttribute("height") === "92" && b.getAttribute("loading") === "lazy" && b.getAttribute("decoding") === "async" && b.getAttribute("referrerpolicy") === "no-referrer") : (u(b, "SPAN", "media-null-mark"), k(b.textContent === "—" && b.getAttribute("aria-hidden") === "true")), f(y, "aria-label", w.image.label), f(y, "title", w.image.title), f(y, "lang", c.lang);
      } else _.kind === "legacy" && y.tagName === "IMG" ? k(y.className === "collection-icon" && y.getAttribute("src") === _.image && y.getAttribute("alt") === "" && y.getAttribute("width") === "92" && y.getAttribute("height") === "92" && y.getAttribute("loading") === "lazy") : (u(y, "SPAN", "collection-icon-fallback"), f(y, null, w.image.fallback), f(y, "lang", c.lang));
    }), { cards: h, slots: p, nodes: d }) : (k(h.length === 1), u(h[0], "P", "placeholder"), f(h[0], null, c.empty), f(h[0], "lang", c.lang), { cards: h, slots: p, nodes: d });
  }
  function o(l, s) {
    if (t || !i(l)) return "LEGACY_RETAINED";
    t = !0;
    const c = [], h = l.parentElement, p = (f) => {
      const u = [];
      for (let g = f; g && g !== l; g = g.parentElement) u.push([g, g.parentElement]);
      return k(u.length > 0 && u.at(-1)[1] === l), u;
    }, d = (f) => l.isConnected && l.parentElement === h && l.id === "collectionGrid" && l.getAttribute("data-hkia-svelte-categories") === "1" && f.path.every(([u, g]) => u.parentElement === g);
    try {
      const f = Ve(s()), u = Ht(f), g = Ve({ ...f, locale: null });
      f.locale && n && k(f.locale.epoch > n.epoch || f.locale.epoch === n.epoch && f.locale.catalog === n.catalog);
      const m = r.get(l), v = a(l, f, u), w = m && St(m.cards, v.cards);
      w && (k(Tt({ ...m.input, locale: null }, g)), f.rows.forEach((_, M) => {
        const [b, $, Fe] = Array.from(v.cards[M].children), fe = m.parts[M];
        k($ === fe[1] && Fe === fe[2]), b !== fe[0] ? k(_.image.kind === "legacy" && fe[0].tagName === "IMG" && b.className === "collection-icon-fallback") : _.image.kind === "mapped" && b.children[0] !== fe[3] && k(Ze(_.image) && fe[3]?.tagName === "IMG" && b.getAttribute("data-image-status") === "LOAD_FAILED" && b.children[0].className === "media-null-mark");
      }));
      const y = a(l, f, w ? m.projection : Ht(g));
      k(y.slots.every((_) => _.actual === _.expected || w && _.node.className === "collection-icon-fallback" && !m.nodes.includes(_.node) && m.images[v.cards.indexOf(_.node.parentElement)]?.tagName === "IMG" && m.images[v.cards.indexOf(_.node.parentElement)]?.className === "collection-icon" && _.actual === (_.key === null ? ur["col.image.unknown"] : null))), k(i(l) && Tt(Ve(s()), f) && St(a(l, f, u).nodes, v.nodes) && v.slots.every((_) => st(_.node, _.key) === _.actual));
      const T = v.slots.filter((_) => _.actual !== _.expected).map((_) => ({ ..._, path: p(_.node) }));
      for (const _ of T)
        k(i(l) && d(_) && st(_.node, _.key) === _.actual), c.push(_), bn(_.node, _.key, _.expected);
      const O = a(l, f, u);
      return k(i(l) && Tt(Ve(s()), f) && St(O.nodes, v.nodes) && O.slots.every((_) => _.actual === _.expected)), r.set(l, { cards: v.cards, nodes: v.nodes, images: v.cards.map((_) => _.children[0]), parts: v.cards.map((_) => [..._.children, _.children[0]?.children[0]]), input: f, projection: u }), f.locale ? n = f.locale : n && (n = { epoch: n.epoch, catalog: null }), "APPLIED";
    } catch {
      for (const f of c.reverse())
        try {
          d(f) && st(f.node, f.key) === f.expected && bn(f.node, f.key, f.actual);
        } catch {
        }
      return "LEGACY_RETAINED";
    } finally {
      t = !1;
    }
  }
  return Object.freeze({ render: o });
}
const It = (e) => {
  if (!e) throw Error("CATEGORY_CONTROLLER_CAPTURE");
};
function ca(e) {
  const t = la(e);
  let n = null, r = null, i = null, a = null, o = null, l = !1;
  const s = $i(e, (f, u, g) => {
    It(n !== null);
    const m = Qi(n, u, null), v = aa(m);
    It(v.rows.every((T, O) => T.description === u.rows[O].description));
    const w = Ai(Ji, { target: f, props: { snapshot: u, port: g } }), y = () => {
      Ci(w).catch(() => {
      });
    };
    try {
      qr(), r = m;
    } catch (T) {
      throw y(), T;
    }
    return y;
  });
  function c() {
    o?.disconnect(), o = null;
  }
  function h() {
    c(), i = null, s.restore();
  }
  function p(f) {
    const u = i;
    if (!u || l || u.grid !== e.getElementById("collectionGrid")) return "LEGACY_RETAINED";
    const g = t.render(u.grid, () => (It(i === u && u.grid === e.getElementById("collectionGrid")), { ...u.input, locale: f }));
    return g === "APPLIED" && (a = f), g;
  }
  function d(f, u, g, m, v) {
    if (n !== null) return "LEGACY_RETAINED";
    n = v, r = null, l = !1;
    let w;
    try {
      w = s.render(f, u, g, m);
    } finally {
      n = null;
    }
    const y = r;
    if (r = null, w !== "MOUNTED" || y === null) return "LEGACY_RETAINED";
    const T = e.getElementById("collectionGrid");
    if (!T || T === f || (i = Object.freeze({ grid: T, input: y }), p(a) !== "APPLIED"))
      return h(), "LEGACY_RETAINED";
    const O = i;
    return o = new MutationObserver((_) => {
      if (i !== O || l || a === null) return;
      _.some((b) => b.type === "attributes" || b.target instanceof Element && (b.target.classList.contains("collection-card") || b.target.classList.contains("media-thumb"))) && p(a) !== "APPLIED" && (l = !0);
    }), o.observe(T, { childList: !0, subtree: !0, attributes: !0, attributeFilter: ["data-image-status"] }), "MOUNTED";
  }
  return Object.freeze({ restore: h, render: d, paintLocale: p, readLocaleStatus: () => i && !l ? "READY" : "UNAVAILABLE" });
}
export {
  ca as createProductCategoryBridge,
  oa as verifyCategoryCatalog
};
