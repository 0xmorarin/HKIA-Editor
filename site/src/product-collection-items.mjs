var Zt = Array.isArray, Bn = Array.prototype.indexOf, nt = Array.prototype.includes, ot = Array.from, Qt = Object.defineProperty, qe = Object.getOwnPropertyDescriptor, qn = Object.getOwnPropertyDescriptors, Vn = Object.prototype, Hn = Array.prototype, en = Object.getPrototypeOf, Bt = Object.isExtensible;
const Yn = () => {
};
function Gn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function tn() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const C = 2, Ye = 4, ut = 8, nn = 1 << 24, V = 16, W = 32, le = 64, yt = 128, Ct = 256, B = 512, S = 1024, x = 2048, G = 4096, O = 8192, j = 16384, De = 32768, wt = 1 << 25, Ce = 65536, rt = 1 << 17, Wn = 1 << 18, Pe = 1 << 19, Kn = 1 << 20, se = 1 << 25, be = 65536, it = 1 << 21, Ne = 1 << 22, he = 1 << 23, ht =                 Symbol("$state"), rn =                 Symbol("component"), Xn =                 Symbol(""), sn =                 Symbol("attributes"), bt =                 Symbol("class"), $n =                 Symbol("style"), Et =                 Symbol("text"), Ke = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), Jn = 1, Zn = 2, Qn = 16, er = 1, tr = 2, A =                 Symbol("uninitialized"), nr = "http://www.w3.org/1999/xhtml";
function rr() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function ir() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function ln(e) {
  return e === this.v;
}
function sr(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function an(e) {
  return !sr(e, this.v);
}
function lr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function ar(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function fr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function or() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ur() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function cr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function hr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let K = null;
function Ie(e) {
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
function Ot(e) {
  var t = (
                                   
    K
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Mr(r);
  }
  return t.i = !0, K = t.p, fn(e);
}
function fn(e = {}) {
  return Qt(e, rn, { value: !0 }), e;
}
function on() {
  return !0;
}
let ge = [];
function un() {
  var e = ge;
  ge = [], Gn(e);
}
function ce(e) {
  if (ge.length === 0 && !Ve) {
    var t = ge;
    queueMicrotask(() => {
      t === ge && un();
    });
  }
  ge.push(e);
}
function dr() {
  for (; ge.length > 0; )
    un();
}
const vr = -7169;
function k(e, t) {
  e.f = e.f & vr | t;
}
function Mt(e) {
  (e.f & B) !== 0 || e.deps === null ? k(e, S) : k(e, G);
}
function cn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & C) === 0 || (t.f & be) === 0 || (t.f ^= be, cn(
                              
        t.deps
      ));
}
function hn(e, t, n) {
  (e.f & x) !== 0 ? t.add(e) : (e.f & G) !== 0 && n.add(e), cn(e.deps), k(e, S);
}
function Xe(e) {
  var t = y, n = w;
  q(null), ee(null);
  try {
    return e();
  } finally {
    q(t), ee(n);
  }
}
function _r(e, t, n, r) {
  const i = Rt;
  var s = e.filter((v) => !v.settled), l = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(l);
    return;
  }
  var a = (
                         
    w
  ), f = pr(), o = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function h(v) {
    if ((a.f & j) === 0) {
      f();
      try {
        r([...l, ...v]);
      } catch (u) {
        J(u, a);
      }
      st();
    }
  }
  var c = dn();
  if (n.length === 0) {
    o.then(() => h([])).finally(c);
    return;
  }
  function d() {
    Promise.all(n.map((v) =>                 gr(v))).then(h).catch((v) => J(v, a)).finally(c);
  }
  o ? o.then(() => {
    f(), d(), st();
  }) : d();
}
function pr() {
  var e = (
                         
    w
  ), t = y, n = K, r = (
                        
    g
  );
  return function(s = !0) {
    ee(e), q(t), Ie(n), s && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function st(e = !0) {
  ee(null), q(null), Ie(null), e && g?.deactivate();
}
function dn() {
  var e = (
                         
    w
  ), t = e.b, n = (
                        
    g
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function Rt(e) {
  var t = C | x;
  return w !== null && (w.f |= Pe), {
    ctx: K,
    deps: null,
    effects: null,
    equals: ln,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      A
    ),
    wv: 0,
    parent: w,
    ac: null
  };
}
const Le =                 Symbol("obsolete");
                       
function gr(e, t, n) {
  let r = (
                                
    w
  );
  r === null && lr();
  var i = (
                             
                          
    void 0
  ), s = Ee(
                    
    A
  ), l = !y, a =                 new Set();
  return Dr(() => {
    var f = (
                           
      w
    ), o = tn();
    i = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, (v) => {
        v !== Ke && o.reject(v);
      }).finally(st);
    } catch (v) {
      o.reject(v), st();
    }
    var h = (
                          
      g
    );
    if (l) {
      if ((f.f & De) !== 0)
        var c = dn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        h.async_deriveds.get(f)?.reject(Le);
      else
        for (const v of a.values())
          v.reject(Le);
      a.add(o), h.async_deriveds.set(f, o);
    }
    const d = (v, u = void 0) => {
      c?.(), a.delete(o), u !== Le && (h.activate(), u ? (s.f |= he, Oe(s, u)) : ((s.f & he) !== 0 && (s.f ^= he), Oe(s, v)), h.deactivate());
    };
    o.promise.then(d, (v) => d(null, v || "unknown"));
  }), Sn(() => {
    for (const f of a)
      f.reject(Le);
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
                       
function lt(e) {
  const t =                 Rt(e);
  return On(t), t;
}
                       
function mr(e) {
  const t =                 Rt(e);
  return t.equals = an, t;
}
function yr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      P(
                             
        t[n]
      );
  }
}
function Dt(e) {
  var t, n = w, r = e.parent;
  if (!ke && r !== null && e.v !== A &&                                                                                                      
  (r.f & (j | O)) !== 0)
    return rr(), e.v;
  ee(r);
  try {
    e.f &= ~be, yr(e), t = Pn(e);
  } finally {
    ee(n);
  }
  return t;
}
function vn(e) {
  var t = Dt(e);
  if (!e.equals(t) && (e.wv = Rn(), (!g?.is_fork || e.deps === null) && (g !== null ? (g.capture(e, t, !0), kt?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    k(e, S);
    return;
  }
  ke || (H !== null ? (Lt() || g?.is_fork) && H.set(e, t) : Mt(e));
}
function wr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Xe(() => {
        t.ac.abort(Ke), t.ac = null;
      }), t.fn !== null && (t.teardown = Yn), We(t, 0), zt(t));
}
function _n(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Re(t);
}
let dt = null, Te = null, g = null, kt = null, H = null, Tt = null, Ve = !1, vt = !1, Se = null, et = null;
var qt = 0;
let br = 1;
class de {
  id = br++;
                                              
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
    Te === null ? dt = Te = this : (Te.#e = this, this.#l = Te), Te = this;
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
        k(i, x), n(i);
      for (i of r.m)
        k(i, G), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#t = !0, qt++ > 1e3 && (this.#v(), kr());
    for (const f of this.#o)
      this.#u.delete(f), k(f, x), this.schedule(f);
    for (const f of this.#u)
      k(f, G), this.schedule(f);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = Se = [], r = [], i = et = [];
    for (const f of t)
      try {
        this.#b(f, n, r);
      } catch (o) {
        throw mn(f), this.#y() || this.discard(), o;
      }
    if (g = null, i.length > 0) {
      var s = de.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (Se = null, et = null, this.#y()) {
      this.#d(r), this.#d(n);
      for (const [f, o] of this.#h)
        gn(f, o);
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
    this.#f.clear(), kt = this, Vt(r), Vt(n), kt = null, this.#a?.resolve();
    var a = (
                                 
                            
      g
    );
    if (this.#s === 0 && (this.#i.length === 0 || a !== null) && this.#v(), this.#i.length > 0)
      if (a !== null) {
        const f = a;
        f.#i.push(...this.#i.filter((o) => !f.#i.includes(o)));
      } else
        a = this;
    a !== null && (Z.clear(), a.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #b(t, n, r) {
    t.f ^= S;
    for (var i = t.first; i !== null; ) {
      var s = i.f, l = (s & (W | le)) !== 0, a = l && (s & S) !== 0, f = a || (s & O) !== 0 || this.#h.has(i);
      if (!f && i.fn !== null) {
        l ? i.f ^= S : (s & Ye) !== 0 ? n.push(i) : Je(i) && ((s & V) !== 0 && this.#u.add(i), Re(i));
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
      if (i !== null && !((r.f & C) !== 0 && (r.f & (x | G)) === 0))
        for (const a of i) {
          var s = a.f;
          if ((s & C) !== 0)
            n(
                                    
              a
            );
          else {
            var l = (
                                   
              a
            );
            s & (Ne | V) && !this.async_deriveds.has(l) && (this.#u.delete(l), k(l, x), this.schedule(l));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), g = this, this.#g();
  }
     
                              
     
  #d(t) {
    for (var n = 0; n < t.length; n += 1)
      hn(t[n], this.#o, this.#u);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== A && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & he) === 0 && (this.current.set(t, [n, r]), H?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    g = this;
  }
  deactivate() {
    g = null, H = null;
  }
  flush() {
    try {
      vt = !0, g = this, this.#g();
    } finally {
      qt = 0, Tt = null, Se = null, et = null, vt = !1, g = null, H = null, Z.clear();
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
      for (const [d, [v, u]] of this.current) {
        if (c.current.has(d)) {
          var r = (
                                         
            c.current.get(d)[0]
          );
          if (t && v !== r)
            c.current.set(d, [v, u]);
          else
            continue;
        }
        n.push(d);
      }
      if (t)
        for (const [d, v] of this.async_deriveds) {
          const u = c.async_deriveds.get(d);
          u && v.promise.then(u.resolve).catch(u.reject);
        }
      var i = [...c.current.keys()].filter(
        (d) => !                             
        c.current.get(d)[1]
      );
      if (!(!c.#t || i.length === 0)) {
        var s = i.filter((d) => !this.current.has(d));
        if (s.length === 0)
          t && c.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#p)
              c.unskip_effect(d, (v) => {
                (v.f & (V | Ne)) !== 0 ? c.schedule(v) : c.#d([v]);
              });
          c.activate();
          var l =                 new Set(), a =                 new Map();
          for (var f of n)
            pn(f, s, l, a);
          a =                 new Map();
          var o = [...c.current].filter(([d, v]) => {
            const u = this.current.get(d);
            return u ? u[0] !== v[0] || u[1] !== v[1] : !0;
          }).map(([d]) => d);
          if (o.length > 0)
            for (const d of this.#_)
              (d.f & (j | O | rt)) === 0 && Pt(d, o, a) && ((d.f & (Ne | V)) !== 0 ? (k(d, x), c.schedule(d)) : c.#o.add(d));
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
    return (this.#a ??= tn()).promise;
  }
  static ensure() {
    if (g === null) {
      const t = g = new de();
      !vt && !Ve && ce(() => {
        t.#t || t.flush();
      });
    }
    return g;
  }
  apply() {
    {
      H = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (Tt = t, t.b?.is_pending && (t.f & (Ye | ut | nn)) !== 0 && (t.f & De) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (Se !== null && n === w && (y === null || (y.f & C) === 0))
        return;
      if ((r & (le | W)) !== 0) {
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
      t === null ? dt = n : t.#e = n, n === null ? Te = t : n.#l = t, this.linked = !1;
    }
  }
}
function Er(e) {
  var t = Ve;
  Ve = !0;
  try {
    for (var n; ; ) {
      if (dr(), g === null)
        return (
                          
          n
        );
      g.flush();
    }
  } finally {
    Ve = t;
  }
}
function kr() {
  try {
    fr();
  } catch (e) {
    J(e, Tt);
  }
}
let re = null;
function Vt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | O)) === 0 && Je(r) && (re =                 new Set(), Re(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), re?.size > 0)) {
        Z.clear();
        for (const i of re) {
          if ((i.f & (j | O)) !== 0) continue;
          const s = [i];
          let l = i.parent;
          for (; l !== null; )
            re.has(l) && (re.delete(l), s.push(l)), l = l.parent;
          for (let a = s.length - 1; a >= 0; a--) {
            const f = s[a];
            (f.f & (j | O)) === 0 && Re(f);
          }
        }
        re.clear();
      }
    }
    re = null;
  }
}
function pn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & C) !== 0 ? pn(
                              
        i,
        t,
        n,
        r
      ) : (s & (Ne | V)) !== 0 && (s & x) === 0 && Pt(i, t, r) && (k(i, x), Ft(
                             
        i
      ));
    }
}
function Pt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (nt.call(t, i))
        return !0;
      if ((i.f & C) !== 0 && Pt(
                              
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
function gn(e, t) {
  if (!((e.f & W) !== 0 && (e.f & S) !== 0)) {
    (e.f & x) !== 0 ? t.d.push(e) : (e.f & G) !== 0 && t.m.push(e), k(e, S);
    for (var n = e.first; n !== null; )
      gn(n, t), n = n.next;
  }
}
function mn(e) {
  k(e, S);
  for (var t = e.first; t !== null; )
    mn(t), t = t.next;
}
let at =                 new Set();
const Z =                 new Map();
let yn = !1;
function Ee(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: ln,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function ne(e, t) {
  const n = Ee(e);
  return On(n), n;
}
                       
function Tr(e, t = !1, n = !0) {
  const r = Ee(e);
  return t || (r.equals = an), r;
}
function ue(e, t, n = !1) {
  y !== null &&                                                                                         
                                                                
  (!Y || (y.f & rt) !== 0) && on() && (y.f & (C | V | Ne | rt)) !== 0 && (Q === null || !Q.has(e)) && cr();
  let r = n ? je(t) : t;
  return Oe(e, r, et);
}
function Oe(e, t, n = null) {
  if (!e.equals(t)) {
    ke ? Z.set(e, t) : Z.has(e) || Z.set(e, e.v);
    var r = de.ensure();
    if (r.capture(e, t), (e.f & C) !== 0) {
      const i = (
                              
        e
      );
      (e.f & x) !== 0 && Dt(i), H === null && Mt(i);
    }
    e.wv = Rn(), wn(e, x, n), w !== null && (w.f & S) !== 0 && (w.f & (W | le)) === 0 && (z === null ? jr([e]) : z.push(e)), !r.is_fork && at.size > 0 && !yn && Ar();
  }
  return t;
}
function Ar() {
  yn = !1;
  for (const e of at) {
    (e.f & S) !== 0 && k(e, G);
    let t;
    try {
      t = Je(e);
    } catch {
      t = !0;
    }
    t && Re(e);
  }
  at.clear();
}
function He(e) {
  ue(e, e.v + 1);
}
function wn(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var l = r[s], a = l.f, f = (a & x) === 0;
      if (f && k(l, t), (a & rt) !== 0)
        at.add(
                               
          l
        );
      else if ((a & C) !== 0) {
        var o = (
                                
          l
        );
        H?.delete(o), (a & be) === 0 && (a & B && (w === null || (w.f & it) === 0) && (l.f |= be), wn(o, G, n));
      } else if (f) {
        var h = (
                               
          l
        );
        (a & V) !== 0 && re !== null && re.add(h), n !== null ? n.push(h) : Ft(h);
      }
    }
}
function je(e) {
  if (typeof e != "object" || e === null || ht in e || rn in e)
    return e;
  const t = en(e);
  if (t !== Vn && t !== Hn)
    return e;
  var n =                 new Map(), r = Zt(e), i =                 ne(0), s = we, l = (a) => {
    if (we === s)
      return a();
    var f = y, o = we;
    q(null), Gt(s);
    var h = a();
    return q(f), Gt(o), h;
  };
  return r && n.set("length",                 ne(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(a, f, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && or();
        var h = n.get(f);
        return h === void 0 ? l(() => {
          var c =                 ne(o.value);
          return n.set(f, c), c;
        }) : ue(h, o.value, !0), !0;
      },
      deleteProperty(a, f) {
        var o = n.get(f);
        if (o === void 0) {
          if (f in a) {
            const h = l(() =>                 ne(A));
            n.set(f, h), He(i);
          }
        } else
          ue(o, A), He(i);
        return !0;
      },
      get(a, f, o) {
        if (f === ht)
          return e;
        var h = n.get(f), c = f in a;
        if (h === void 0 && (!c || qe(a, f)?.writable) && (h = l(() => {
          var v = je(c ? a[f] : A), u =                 ne(v);
          return u;
        }), n.set(f, h)), h !== void 0) {
          var d = _(h);
          return d === A ? void 0 : d;
        }
        return Reflect.get(a, f, o);
      },
      getOwnPropertyDescriptor(a, f) {
        var o = Reflect.getOwnPropertyDescriptor(a, f);
        if (o && "value" in o) {
          var h = n.get(f);
          h && (o.value = _(h));
        } else if (o === void 0) {
          var c = n.get(f), d = c?.v;
          if (c !== void 0 && d !== A)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return o;
      },
      has(a, f) {
        if (f === ht)
          return !0;
        var o = n.get(f), h = o !== void 0 && o.v !== A || Reflect.has(a, f);
        if (o !== void 0 || w !== null && (!h || qe(a, f)?.writable)) {
          o === void 0 && (o = l(() => {
            var d = h ? je(a[f]) : A, v =                 ne(d);
            return v;
          }), n.set(f, o));
          var c = _(o);
          if (c === A)
            return !1;
        }
        return h;
      },
      set(a, f, o, h) {
        var c = n.get(f), d = f in a;
        if (r && f === "length")
          for (var v = o; v <                              
          c.v; v += 1) {
            var u = n.get(v + "");
            u !== void 0 ? ue(u, A) : v in a && (u = l(() =>                 ne(A)), n.set(v + "", u));
          }
        if (c === void 0)
          (!d || qe(a, f)?.writable) && (c = l(() =>                 ne(void 0)), ue(c, je(o)), n.set(f, c));
        else {
          d = c.v !== A;
          var m = l(() => je(o));
          ue(c, m);
        }
        var E = Reflect.getOwnPropertyDescriptor(a, f);
        if (E?.set && E.set.call(h, o), !d) {
          if (r && typeof f == "string") {
            var p = (
                                           
              n.get("length")
            ), b = Number(f);
            Number.isInteger(b) && b >= p.v && ue(p, b + 1);
          }
          He(i);
        }
        return !0;
      },
      ownKeys(a) {
        _(i);
        var f = Reflect.ownKeys(a).filter((c) => {
          var d = n.get(c);
          return d === void 0 || d.v !== A;
        });
        for (var [o, h] of n)
          h.v !== A && !(o in a) && f.push(o);
        return f;
      },
      setPrototypeOf() {
        ur();
      }
    }
  );
}
var Ht, bn, En, kn;
function Sr() {
  if (Ht === void 0) {
    Ht = window, bn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    En = qe(t, "firstChild").get, kn = qe(t, "nextSibling").get, Bt(e) && (e[bt] = void 0, e[sn] = null, e[$n] = void 0, e.__e = void 0), Bt(n) && (n[Et] = void 0);
  }
}
function Me(e = "") {
  return document.createTextNode(e);
}
                       
function Ge(e) {
  return (
                                      
    En.call(e)
  );
}
                       
function $e(e) {
  return (
                                      
    kn.call(e)
  );
}
function Tn(e, t) {
  return                 Ge(e);
}
function xr(e, t = !1) {
  {
    var n =                 Ge(e);
    return n instanceof Comment && n.data === "" ?                 $e(n) : n;
  }
}
function _e(e, t = !1) {
  return                 Ge(e);
}
function fe(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    $e(r);
  return r;
}
function Nr(e) {
  e.textContent = "";
}
function An() {
  return !1;
}
function Cr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ir(e) {
  var t = w;
  if (t === null)
    return y.f |= he, e;
  if ((t.f & De) === 0 && (t.f & Ye) === 0)
    throw e;
  J(e, t);
}
function J(e, t) {
  if (!(t !== null && (t.f & j) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & yt) !== 0 && (t.f & (j | wt)) === 0) {
        if ((t.f & De) === 0)
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
function Or(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ve(e, t) {
  var n = w;
  n !== null && (n.f & O) !== 0 && (e |= O);
  var r = {
    ctx: K,
    deps: null,
    nodes: null,
    f: e | x | B,
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
  if ((e & Ye) !== 0)
    Se !== null ? Se.push(r) : de.ensure().schedule(r);
  else if (t !== null) {
    try {
      Re(r);
    } catch (l) {
      throw P(r), l;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Pe) === 0 && (i = i.first, (e & V) !== 0 && (e & Ce) !== 0 && i !== null && (i.f |= Ce));
  }
  if (i !== null && (i.parent = n, n !== null && Or(i, n), y !== null && (y.f & C) !== 0 && (e & le) === 0)) {
    var s = (
                            
      y
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Lt() {
  return y !== null && !Y;
}
function Sn(e) {
  const t = ve(ut, null);
  return k(t, S), t.teardown = e, t;
}
function Mr(e) {
  return ve(Ye | Kn, e);
}
function Rr(e) {
  de.ensure();
  const t = ve(le | Pe, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ye(t, () => {
      P(t), r(void 0);
    }) : (P(t), r(void 0));
  });
}
function Dr(e) {
  return ve(Ne | Pe, e);
}
function Pr(e, t = 0) {
  return ve(ut | t, e);
}
function xe(e, t = [], n = [], r = []) {
  _r(r, t, n, (i) => {
    ve(ut, () => {
      e(...i.map(_));
    });
  });
}
function jt(e, t = 0) {
  var n = ve(V | t, e);
  return n;
}
function U(e) {
  return ve(W | Pe, e);
}
function xn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = ke, r = y;
    Yt(!0), q(null);
    try {
      t.call(null);
    } catch (i) {
      J(i, e.parent);
    } finally {
      Yt(n), q(r);
    }
  }
}
function zt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Xe(() => {
      i.abort(Ke);
    });
    var r = n.next;
    (n.f & le) !== 0 ? n.parent = null : P(n, t), n = r;
  }
}
function Fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & W) === 0 && P(t), t = n;
  }
}
function P(e, t = !0) {
  var n = !1;
  (t || (e.f & Wn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Lr(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= wt, zt(e, t && !n), We(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  xn(e), e.f ^= wt, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && Nn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Lr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 $e(e);
    e.remove(), e = n;
  }
}
function Nn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ye(e, t, n = !0) {
  var r = [];
  e.f |= Ct, Cn(e, r, !0);
  var i = () => {
    n && P(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var l = () => --s || i();
    for (var a of r)
      a.out(l);
  } else
    i();
}
function Cn(e, t, n) {
  if ((e.f & O) === 0) {
    e.f ^= O;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const a of r)
        (a.is_global || n) && t.push(a);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & le) === 0) {
        var l = (i.f & Ce) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & W) !== 0 && (e.f & V) !== 0;
        Cn(i, t, l ? n : !1);
      }
      i = s;
    }
  }
}
function ft(e) {
  e.f &= ~Ct, In(e, !0);
}
function In(e, t) {
  if ((e.f & Ct) === 0 && (e.f & O) !== 0) {
    e.f ^= O, (e.f & S) === 0 && (k(e, x), de.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Ce) !== 0 || (n.f & W) !== 0;
      In(n, i ? t : !1), n = r;
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
      var i = n === r ? null :                 $e(n);
      t.append(n), n = i;
    }
}
let tt = !1, ke = !1;
function Yt(e) {
  ke = e;
}
let y = null, Y = !1;
function q(e) {
  y = e;
}
let w = null;
function ee(e) {
  w = e;
}
let Q = null;
function On(e) {
  y !== null && (Q ??=                 new Set()).add(e);
}
let D = null, L = 0, z = null;
function jr(e) {
  z = e;
}
let Mn = 1, me = 0, we = me;
function Gt(e) {
  we = e;
}
function Rn() {
  return ++Mn;
}
function Je(e) {
  var t = e.f;
  if ((t & x) !== 0)
    return !0;
  if (t & C && (e.f &= ~be), (t & G) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Je(
                              
        s
      ) && vn(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & B) !== 0 &&                                                                   
                                                                
    H === null && k(e, S);
  }
  return !1;
}
function Dn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(Q !== null && Q.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & C) !== 0 ? Dn(
                              
        s,
        t,
        !1
      ) : t === s && (n ? k(s, x) : (s.f & S) !== 0 && k(s, G), Ft(
                             
        s
      ));
    }
}
function Pn(e) {
  var t = D, n = L, r = z, i = y, s = Q, l = K, a = Y, f = we, o = e.f;
  D =                              
  null, L = 0, z = null, y = (o & (W | le)) === 0 ? e : null, Q = null, Ie(e.ctx), Y = !1, we = ++me, e.ac !== null && (Xe(() => {
    e.ac.abort(Ke);
  }), e.ac = null);
  try {
    e.f |= it;
    var h = (
                             
      e.fn
    ), c = h();
    e.f |= De;
    var d = Wt(e);
    if (on() && z !== null && !Y && d !== null && (e.f & (C | G | x)) === 0)
      for (var v = 0; v <                        
      z.length; v++)
        Dn(
          z[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (me++, i.deps !== null)
        for (let u = 0; u < n; u += 1)
          i.deps[u].rv = me;
      if (t !== null)
        for (const u of t)
          u.rv = me;
      z !== null && (r === null ? r = z : r.push(...                       
      z));
    }
    return (e.f & he) !== 0 && (e.f ^= he), c;
  } catch (u) {
    return Wt(e), Ir(u);
  } finally {
    e.f ^= it, D = t, L = n, z = r, y = i, Q = s, Ie(l), Y = a, we = f;
  }
}
function Wt(e) {
  var t = e.deps, n = g?.is_fork;
  if (D !== null) {
    var r;
    if (n || We(e, L), t !== null && L > 0)
      for (t.length = L + D.length, r = 0; r < D.length; r++)
        t[L + r] = D[r];
    else
      e.deps = t = D;
    if (Lt() && (e.f & B) !== 0)
      for (r = L; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && L < t.length && (We(e, L), t.length = L);
  return t;
}
function zr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Bn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & C) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (D === null || !nt.call(D, t))) {
    var s = (
                            
      t
    );
    (s.f & B) !== 0 && (s.f ^= B, s.f &= ~be), s.v !== A && Mt(s), s.ac !== null && Xe(() => {
      s.ac.abort(Ke), s.ac = null, k(s, x);
    }), wr(s), We(s, 0);
  }
}
function We(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      zr(e, n[r]);
}
function Re(e) {
  var t = e.f;
  if ((t & j) === 0) {
    k(e, S);
    var n = w, r = tt;
    w = e, tt = (t & (W | le)) === 0;
    try {
      (t & (V | nn)) !== 0 ? Fr(e) : zt(e), xn(e);
      var i = Pn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = Mn;
      var s;
    } finally {
      tt = r, w = n;
    }
  }
}
function _(e) {
  var t = e.f, n = (t & C) !== 0;
  if (y !== null && !Y) {
    var r = w !== null && (w.f & j) !== 0;
    if (!r && (Q === null || !Q.has(e))) {
      var i = y.deps;
      if ((y.f & it) !== 0)
        e.rv < me && (e.rv = me, D === null && i !== null && i[L] === e ? L++ : D === null ? D = [e] : D.push(e));
      else {
        y.deps ??= [], nt.call(y.deps, e) || y.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [y] : nt.call(s, y) || s.push(y);
      }
    }
  }
  if (ke && Z.has(e))
    return Z.get(e);
  if (n) {
    var l = (
                            
      e
    );
    if (ke) {
      var a = l.v;
      return ((l.f & S) === 0 && l.reactions !== null || Ln(l)) && (a = Dt(l)), Z.set(l, a), a;
    }
    var f = (l.f & B) === 0 && !Y && y !== null && (tt || (y.f & B) !== 0), o = (l.f & De) === 0;
    Je(l) && (f && (l.f |= B), vn(l)), f && !o && (_n(l), Fn(l));
  }
  if (H?.has(e))
    return H.get(e);
  if ((e.f & he) !== 0)
    throw e.v;
  return e.v;
}
function Fn(e) {
  if (e.f |= B, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & C) !== 0 && (t.f & B) === 0 && (_n(
                              
        t
      ), Fn(
                              
        t
      ));
}
function Ln(e) {
  if (e.v === A) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (Z.has(t) || (t.f & C) !== 0 && Ln(
                            
      t
    ))
      return !0;
  return !1;
}
function Ur(e) {
  var t = Y;
  try {
    return Y = !0, e();
  } finally {
    Y = t;
  }
}
const Br = ["touchstart", "touchmove"];
function qr(e) {
  return Br.includes(e);
}
const ze =                 Symbol("events"), jn =                 new Set(), At =                 new Set();
function Vr(e, t, n, r = {}) {
  function i(s) {
    if (r.capture || St.call(t, s), !s.cancelBubble)
      return Xe(() => n?.call(this, s));
  }
  return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? ce(() => {
    t.addEventListener(e, i, r);
  }) : t.addEventListener(e, i, r), i;
}
function Hr(e, t, n, r, i) {
  var s = { capture: r, passive: i }, l = Vr(e, t, n, s);
  (t === document.body ||              
  t === window ||              
  t === document ||                                                                                                                     
  t instanceof HTMLMediaElement) && Sn(() => {
    t.removeEventListener(e, l, s);
  });
}
function Kt(e, t, n) {
  (t[ze] ??= {})[e] = n;
}
function Yr(e) {
  for (var t = 0; t < e.length; t++)
    jn.add(e[t]);
  for (var n of At)
    n(e);
}
let _t = null, pt = !1;
function St(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  _t = e, pt || (pt = !0, setTimeout(() => {
    pt = !1, _t = null;
  }));
  var l = 0, a = _t === e && e[ze];
  if (a) {
    var f = i.indexOf(a);
    if (f !== -1 && (t === document || t ===                   
    window)) {
      e[ze] = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    f <= o && (l = f);
  }
  if (s =                       
  i[l] || e.target, s !== t) {
    Qt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var h = y, c = w;
    q(null), ee(null);
    try {
      for (var d, v = []; s !== null && s !== t; ) {
        try {
          var u = s[ze]?.[r];
          u != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && u.call(s, e);
        } catch (m) {
          d ? v.push(m) : d = m;
        }
        if (e.cancelBubble) break;
        l++, s = l < i.length ? (
                                
          i[l]
        ) : null;
      }
      if (d) {
        for (let m of v)
          queueMicrotask(() => {
            throw m;
          });
        throw d;
      }
    } finally {
      e[ze] = t, delete e.currentTarget, q(h), ee(c);
    }
  }
}
const Gr = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function Wr(e) {
  return (
                         
    Gr?.createHTML(e) ?? e
  );
}
function Kr(e) {
  var t = Cr("template");
  return t.innerHTML = Wr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Xt(e, t) {
  var n = (
                         
    w
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function ae(e, t) {
  var n = (t & er) !== 0, r = (t & tr) !== 0, i, s = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = Kr(s ? e : "<!>" + e), n || (i =                            
                    Ge(i)));
    var l = (
                                 
      r || bn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var a = (
                                   
                        Ge(l)
      ), f = (
                                   
        l.lastChild
      );
      Xt(a, f);
    } else
      Xt(l, l);
    return l;
  };
}
function ie(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function Xr(e) {
  let t = 0, n = Ee(0), r;
  return () => {
    Lt() && (_(n), Pr(() => (t === 0 && (r = Ur(() => e(() => He(n)))), t += 1, () => {
      ce(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, He(n));
      });
    })));
  };
}
var $r = Ce | Pe;
function Jr(e, t, n, r) {
  new Zr(e, t, n, r);
}
class Zr {
                                
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
  #y = Xr(() => (this.#c = Ee(this.#_), () => {
    this.#c = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#f = (s) => {
      var l = (
                             
        w
      );
      l.b = this, l.f |= yt, r(s);
    }, this.parent =                      
    w.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#r = jt(() => {
      this.#d();
    }, $r);
  }
  #g() {
    try {
      this.#s = U(() => this.#f(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #b(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#w(t);
    ce(i), n && (this.#a = U(() => {
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
        ir();
        return;
      }
      n = !0, r && hr(), this.#a !== null && ye(this.#a, () => {
        this.#a = null;
      }), this.#v(() => {
        this.#d();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (l) {
        J(l, this.#r && this.#r.parent);
      }
    } };
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = U(() => t(this.#t)), ce(() => {
      var n = this.#i = document.createDocumentFragment(), r = Me(), i = !1;
      if (n.append(r), this.#s = this.#v(() => {
        try {
          return U(() => this.#f(r));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (l) {
            J(l, this.#r.parent);
          }
          return null;
        }
      }), this.#s === null) {
        this.#i = null, i && this.#m(
                              
          g
        );
        return;
      }
      this.#o === 0 && (this.#t.before(n), this.#i = null, ye(
                             
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
                              
          g
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#h, this.#p);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    hn(t, this.#h, this.#p);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var n = w, r = y, i = K;
    ee(this.#r), q(this.#r), Ie(this.#r.ctx);
    try {
      return de.ensure(), t();
    } finally {
      ee(n), q(r), Ie(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #k(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#k(t, n);
      return;
    }
    this.#o += t, this.#o === 0 && (this.#m(n), this.#n && ye(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#k(t, n), this.#_ += t, !(!this.#c || this.#u) && (this.#u = !0, ce(() => {
      this.#u = !1, this.#c && Oe(this.#c, this.#_);
    }));
  }
  get_effect_pending() {
    return this.#y(), _(
                                   
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
    this.#s && (P(this.#s), this.#s = null), this.#n && (P(this.#n), this.#n = null), this.#a && (P(this.#a), this.#a = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: l } = this.#w(i);
      l(), n && (this.#a = this.#v(() => {
        try {
          return U(() => {
            var a = (
                                   
              w
            );
            a.b = this, a.f |= yt, n(
              this.#t,
              () => i,
              () => s
            );
          });
        } catch (a) {
          return J(
            a,
                                 
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
        J(s, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (s) => J(s, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function pe(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[Et] ??= e.nodeValue) && (e[Et] = n, e.nodeValue = `${n}`);
}
function Qr(e, t) {
  return ei(e, t);
}
const Ze =                 new Map();
function ei(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: l = !0, transformError: a }) {
  Sr();
  var f = void 0, o = Rr(() => {
    var h = n ?? t.appendChild(Me());
    Jr(
                                 
      h,
      {
        pending: () => {
        }
      },
      (v) => {
        It({});
        var u = (
                                         
          K
        );
        s && (u.c = s), i && (r.$$events = i), f = e(v, r) || fn(), Ot();
      },
      a
    );
    var c =                 new Set(), d = (v) => {
      for (var u = 0; u < v.length; u++) {
        var m = v[u];
        if (!c.has(m)) {
          c.add(m);
          var E = qr(m);
          for (const I of [t, document]) {
            var p = Ze.get(I);
            p === void 0 && (p =                 new Map(), Ze.set(I, p));
            var b = p.get(m);
            b === void 0 ? (I.addEventListener(m, St, { passive: E }), p.set(m, 1)) : p.set(m, b + 1);
          }
        }
      }
    };
    return d(ot(jn)), At.add(d), () => {
      for (var v of c)
        for (const E of [t, document]) {
          var u = (
                                              
            Ze.get(E)
          ), m = (
                                 
            u.get(v)
          );
          --m == 0 ? (E.removeEventListener(v, St), u.delete(v), u.size === 0 && Ze.delete(E)) : u.set(v, m);
        }
      At.delete(d), h !== n && h.parentNode?.removeChild(h);
    };
  });
  return xt.set(f, o), f;
}
let xt =                 new WeakMap();
function ti(e, t) {
  const n = xt.get(e);
  return n ? (xt.delete(e), n(t)) : Promise.resolve();
}
class ni {
                             
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
        ft(r), this.#f.delete(n);
      else {
        var i = this.#e.get(n);
        i && (ft(i.effect), this.#l.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [s, l] of this.#t) {
        if (this.#t.delete(s), s === t)
          break;
        const a = this.#e.get(l);
        a && (P(a.effect), this.#e.delete(l));
      }
      for (const [s, l] of this.#l) {
        if (s === n || this.#f.has(s)) continue;
        const a = () => {
          if (Array.from(this.#t.values()).includes(s)) {
            var o = document.createDocumentFragment();
            Ut(l, o), o.append(Me()), this.#e.set(s, { effect: l, fragment: o });
          } else
            P(l);
          this.#f.delete(s), this.#l.delete(s);
        };
        this.#r || !r ? (this.#f.add(s), ye(l, a, !1)) : a();
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
    ), i = An();
    if (n && !this.#l.has(t) && !this.#e.has(t))
      if (i) {
        var s = document.createDocumentFragment(), l = Me();
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
      for (const [a, f] of this.#l)
        a === t ? r.unskip_effect(f) : r.skip_effect(f);
      for (const [a, f] of this.#e)
        a === t ? r.unskip_effect(f.effect) : r.skip_effect(f.effect);
      r.oncommit(this.#s), r.ondiscard(this.#n);
    } else
      this.#s(r);
  }
}
function Ue(e, t, n = !1) {
  var r = new ni(e), i = n ? Ce : 0;
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
function ri(e, t, n) {
  for (var r = [], i = t.length, s, l = t.length, a = 0; a < i; a++) {
    let c = t[a];
    ye(
      c,
      () => {
        if (s) {
          if (s.pending.delete(c), s.done.add(c), s.pending.size === 0) {
            var d = (
                                                
              e.outrogroups
            );
            Nt(e, ot(s.done)), d.delete(s), d.size === 0 && (e.outrogroups = null);
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
      Nr(h), h.append(o), e.items.clear();
    }
    Nt(e, t, !f);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function Nt(e, t, n = !0) {
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
      s.f |= se;
      const l = document.createDocumentFragment();
      Ut(s, l);
    } else
      P(t[i], n);
  }
}
var $t;
function ii(e, t, n, r, i, s = null) {
  var l = e, a =                 new Map(), f = null, o =                 mr(() => {
    var p = n();
    return (
                        
      Zt(p) ? p : p == null ? [] : ot(p)
    );
  }), h, c =                 new Map(), d = !0;
  function v(p) {
    (E.effect.f & j) === 0 && (E.pending.delete(p), E.fallback = f, si(E, h, l, t, r), f !== null && (h.length === 0 ? (f.f & se) === 0 ? ft(f) : (f.f ^= se, Be(f, null, l)) : ye(f, () => {
      f = null;
    })));
  }
  function u(p) {
    E.pending.delete(p);
  }
  var m = jt(() => {
    h =                   
    _(o);
    for (var p = h.length, b =                 new Set(), I = (
                          
      g
    ), M = An(), T = 0; T < p; T += 1) {
      var X = h[T], $ = r(X, T), N = d ? null : a.get($);
      N ? (N.v && Oe(N.v, X), N.i && Oe(N.i, T), M && I.unskip_effect(N.e)) : (N = li(
        a,
        d ? l : $t ??= Me(),
        X,
        $,
        T,
        i,
        t,
        n
      ), d || (N.e.f |= se), a.set($, N)), b.add($);
    }
    if (p === 0 && s && !f && (d ? f = U(() => s(l)) : (f = U(() => s($t ??= Me())), f.f |= se)), p > b.size && ar(), !d)
      if (c.set(I, b), M) {
        for (const [F, te] of a)
          b.has(F) || I.skip_effect(te.e);
        I.oncommit(v), I.ondiscard(u);
      } else
        v(I);
    _(o);
  }), E = { effect: m, items: a, pending: c, outrogroups: null, fallback: f };
  d = !1;
}
function Fe(e) {
  for (; e !== null && (e.f & W) === 0; )
    e = e.next;
  return e;
}
function si(e, t, n, r, i) {
  var s = t.length, l = e.items, a = Fe(e.effect.first), f, o = null, h = [], c = [], d, v, u, m;
  for (m = 0; m < s; m += 1) {
    if (d = t[m], v = i(d, m), u =                        
    l.get(v).e, e.outrogroups !== null)
      for (const N of e.outrogroups)
        N.pending.delete(u), N.done.delete(u);
    if ((u.f & O) !== 0 && ft(u), (u.f & se) !== 0)
      if (u.f ^= se, u === a)
        Be(u, null, n);
      else {
        var E = o ? o.next : a;
        u === e.effect.last && (e.effect.last = u.prev), u.prev && (u.prev.next = u.next), u.next && (u.next.prev = u.prev), oe(e, o, u), oe(e, u, E), Be(u, E, n), o = u, h = [], c = [], a = Fe(o.next);
        continue;
      }
    if (u !== a) {
      if (f !== void 0 && f.has(u)) {
        if (h.length < c.length) {
          var p = c[0], b;
          o = p.prev;
          var I = h[0], M = h[h.length - 1];
          for (b = 0; b < h.length; b += 1)
            Be(h[b], p, n);
          for (b = 0; b < c.length; b += 1)
            f.delete(c[b]);
          oe(e, I.prev, M.next), oe(e, o, I), oe(e, M, p), a = p, o = M, m -= 1, h = [], c = [];
        } else
          f.delete(u), Be(u, a, n), oe(e, u.prev, u.next), oe(e, u, o === null ? e.effect.first : o.next), oe(e, o, u), o = u;
        continue;
      }
      for (h = [], c = []; a !== null && a !== u; )
        (f ??=                 new Set()).add(a), c.push(a), a = Fe(a.next);
      if (a === null)
        continue;
    }
    (u.f & se) === 0 && h.push(u), o = u, a = Fe(u.next);
  }
  if (e.outrogroups !== null) {
    for (const N of e.outrogroups)
      N.pending.size === 0 && (Nt(e, ot(N.done)), e.outrogroups?.delete(N));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (a !== null || f !== void 0) {
    var T = [];
    if (f !== void 0)
      for (u of f)
        (u.f & O) === 0 && T.push(u);
    for (; a !== null; )
      (a.f & O) === 0 && a !== e.fallback && T.push(a), a = Fe(a.next);
    var X = T.length;
    if (X > 0) {
      var $ = null;
      ri(e, T, $);
    }
  }
}
function li(e, t, n, r, i, s, l, a) {
  var f = (l & Jn) !== 0 ? (l & Qn) === 0 ?                 Tr(n, !1, !1) : Ee(n) : null, o = (l & Zn) !== 0 ? Ee(i) : null;
  return {
    v: f,
    i: o,
    e: U(() => (s(t, f ?? n, o ?? i, a), () => {
      e.delete(r);
    }))
  };
}
function Be(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & se) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var l = (
                                   
                        $e(r)
      );
      if (s.before(r), r === i)
        return;
      r = l;
    }
}
function oe(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function zn(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = zn(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function ai() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = zn(e)) && (r && (r += " "), r += t);
  return r;
}
function fi(e) {
  return typeof e == "object" ? ai(e) : e ?? "";
}
function oi(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r === "" ? null : r;
}
function ui(e, t, n, r, i, s) {
  var l = (
                      
    e[bt]
  );
  if (l !== n || l === void 0) {
    var a = oi(n);
    a == null ? e.removeAttribute("class") : e.className = a, e[bt] = n;
  }
  return s;
}
const ci =                 Symbol("is custom element"), hi =                 Symbol("is html");
function Ae(e, t, n, r) {
  var i = di(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[Xn] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && vi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function di(e) {
  return (
                                                    
                      
    e[sn] ??= {
      [ci]: e.nodeName.includes("-"),
      [hi]: e.namespaceURI === nr
    }
  );
}
var Jt =                 new Map();
function vi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Jt.get(t);
  if (n) return n;
  Jt.set(t, n =                 new Set());
  for (var r, i = e, s = Element.prototype; s !== i; ) {
    r = qn(i);
    for (var l in r)
      r[l].set &&                                                                                     
      l !== "innerHTML" && l !== "textContent" && l !== "innerText" && n.add(l);
    i = en(i);
  }
  return n;
}
const _i = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(_i);
const pi = /^assets\/(?:icons\/[A-Za-z0-9_-]+\.webp|media\/sprites\/[a-f0-9]{2}\/[a-f0-9]{64}\.webp)$/;
function gi(e) {
  const t = e?.status ?? "NOT_IN_SOURCE_MAP", n = !!e && ["EXACT", "EXISTING_VERIFIED"].includes(t) && typeof e.image == "string" && pi.test(e.image) && typeof e.spritePathId == "string" && e.spritePathId.length > 0;
  return { status: n ? t : ["EXACT", "EXISTING_VERIFIED"].includes(t) ? "UNKNOWN" : t, src: n ? "./" + e.image : null, spritePathId: n ? e.spritePathId : void 0 };
}
const mi = gi;
function yi(e) {
  const t = e.history;
  return { mark: t.kind === "unknown" ? "?" : t.recorded ? "✓" : "—", markClass: t.kind === "unknown" ? "unknown-mark" : t.recorded ? "collected-mark" : "missing-mark", name: e.key || `ItemId ${e.id}`, status: t.kind === "unknown" ? "未照合" : `${t.status} · ${t.recorded ? "履歴あり" : "履歴なし"}`, ticks: t.kind === "known" && t.recorded ? `100ns ticks ${t.rawTicks ?? "UNKNOWN"}${t.calendar ? " · " + t.calendar + "（timezone UNKNOWN）" : ""}` : null, parent: e.parent ? `親ID ${e.parent.id}${e.parent.cross ? "（他カテゴリ）" : ""}` : null };
}
var wi =                 ae('<img alt="" width="40" height="40" loading="lazy" decoding="async" referrerpolicy="no-referrer"/>'), bi =                 ae('<span class="media-null-mark" aria-hidden="true">—</span>'), Ei =                 ae('<span class="media-thumb media-item" data-image-kind="item"><!></span>');
function ki(e, t) {
  It(t, !0);
  const n =                 lt(() => mi(t.image));
  let r =                 ne(null);
  const i =                 lt(() => _(n).src !== null && _(r) === _(n).src);
  var s = Ei(), l = Tn(s);
  {
    var a = (o) => {
      var h = wi();
      xe(() => {
        Ae(h, "src", _(n).src), Ae(h, "data-sprite-path-id", _(n).spritePathId);
      }), Hr("error", h, () => ue(r, _(n).src, !0)), ie(o, h);
    }, f = (o) => {
      var h = bi();
      ie(o, h);
    };
    Ue(l, (o) => {
      _(n).src && !_(i) ? o(a) : o(f, -1);
    });
  }
  xe(() => {
    Ae(s, "data-image-status", _(i) ? "LOAD_FAILED" : _(n).status), Ae(s, "aria-label", _(n).src ? "アイテム画像" : "アイテム画像：画像未確定"), Ae(s, "title", _(n).src ? "アイテム画像" : "アイテム画像：" + _(n).status);
  }), ie(e, s), Ot();
}
var Ti =                 ae('<small class="collection-history-ticks"> </small>'), Ai =                 ae('<small class="item-source-parent"> </small>'), Si =                 ae('<div class="collection-item-row"><!> <span> </span><span class="item-source-name"> </span><small class="item-source-id"> </small><small class="collection-status"> </small> <!> <button type="button" class="btn-secondary item-inspect-button">詳細・変更案</button> <!></div>'), xi =                 ae('<p class="placeholder">該当するアイテムはありません。</p>'), Ni =                 ae('<button type="button" class="btn-secondary show-more"> </button>'), Ci =                 ae("<!> <!>", 1);
function Ii(e, t) {
  It(t, !0);
  var n = Ci(), r = xr(n);
  ii(
    r,
    17,
    () => t.snapshot.rows,
    (l) => l.id,
    (l, a) => {
      const f =                 lt(() => yi(_(a)));
      var o = Si(), h = Tn(o);
      {
        var c = (F) => {
          {
            let te =                 lt(() => _(a).image ?? null);
            ki(F, {
              get image() {
                return _(te);
              }
            });
          }
        };
        Ue(h, (F) => {
          _(a).imageEnabled && F(c);
        });
      }
      var d = fe(h, 2), v = _e(d, !0), u = fe(d), m = _e(u, !0), E = fe(u), p = _e(E), b = fe(E), I = _e(b, !0), M = fe(b, 2);
      {
        var T = (F) => {
          var te = Ti(), ct = _e(te, !0);
          xe(() => pe(ct, _(f).ticks)), ie(F, te);
        };
        Ue(M, (F) => {
          _(a).history.kind === "known" && _(a).history.showTicks && _(f).ticks && F(T);
        });
      }
      var X = fe(M, 2), $ = fe(X, 2);
      {
        var N = (F) => {
          var te = Ai(), ct = _e(te, !0);
          xe(() => pe(ct, _(f).parent)), ie(F, te);
        };
        Ue($, (F) => {
          _(f).parent && F(N);
        });
      }
      xe(() => {
        Ae(o, "data-item-id", _(a).id), ui(d, 1, fi(_(f).markClass)), pe(v, _(f).mark), pe(m, _(f).name), pe(p, `ID ${_(a).id ?? ""}`), pe(I, _(f).status);
      }), Kt("click", X, () => t.dispatch(_(a).id)), ie(l, o);
    },
    (l) => {
      var a = xi();
      ie(l, a);
    }
  );
  var i = fe(r, 2);
  {
    var s = (l) => {
      var a = Ni(), f = _e(a);
      xe(() => pe(f, `さらに表示（残り ${t.snapshot.total - t.snapshot.limit}件）`)), Kt("click", a, () => t.dispatch(null)), ie(l, a);
    };
    Ue(i, (l) => {
      t.snapshot.total > t.snapshot.limit && l(s);
    });
  }
  ie(e, n), Ot();
}
Yr(["click"]);
const Oi = "data-hkia-svelte-collection-items", R = (e) => {
  if (!e) throw Error("PRODUCT_COLLECTION_ITEMS_CONTRACT");
}, gt = (e, t) => JSON.stringify(e) === JSON.stringify(t), mt = (e) => Number.isSafeInteger(e) && e >= 0;
function Un(e) {
  const t = Array.from(e.attributes).filter((r) => r.name !== "data-item-id" && !(r.name === "class" && !r.value)).map((r) => [r.name, r.value]).sort((r, i) => r[0].localeCompare(i[0])), n = Array.from(e.children);
  return [e.tagName, t, n.length ? Array.from(e.childNodes).filter((r) => r.nodeType === 3 && r.textContent?.trim()).map((r) => r.textContent) : e.textContent, n.map(Un)];
}
function Qe(e, t, n = !1) {
  R(e.tagName === "DIV" && e.className === "collection-items-list");
  const r = Array.from(e.children), i = t.total > t.limit;
  R(r.length === (t.rows.length || 1) + Number(i));
  const s =                 new Map();
  t.rows.length || R(r[0].tagName === "P" && r[0].className === "placeholder");
  for (const [a, f] of t.rows.entries()) {
    const o = r[a];
    R(o.tagName === "DIV" && o.className === "collection-item-row" && (!n || o.getAttribute("data-item-id") === String(f.id)));
    const h = o.querySelectorAll(".item-source-id"), c = o.querySelectorAll(".item-inspect-button");
    R(h.length === 1 && h[0].textContent === "ID " + f.id && c.length === 1 && c[0].tagName === "BUTTON" && c[0].type === "button" && !c[0].disabled), s.set(f.id, c[0]);
  }
  const l = i ? r.at(-1) : null;
  return l && R(l.tagName === "BUTTON" && l.className === "btn-secondary show-more" && l.type === "button" && !l.disabled), { buttons: s, next: l, sig: r.map(Un) };
}
function Mi(e) {
  R(e && Array.isArray(e.rows) && mt(e.total) && mt(e.limit) && e.limit >= 100 && e.limit % 100 === 0 && e.limit <= 1200 && e.rows.length === Math.min(e.total, e.limit));
  const t =                 new Set();
  for (const n of e.rows)
    R(n && mt(n.id) && !t.has(n.id) && typeof n.key == "string" && typeof n.guid == "string" && n.guid.length > 0 && typeof n.imageEnabled == "boolean" && n.history && ["known", "unknown"].includes(n.history.kind)), t.add(n.id), n.history.kind === "known" && R(typeof n.history.status == "string" && typeof n.history.recorded == "boolean" && typeof n.history.showTicks == "boolean" && (!n.history.showTicks || n.history.recorded) && (n.history.rawTicks === null || typeof n.history.rawTicks == "string" && /^-?(0|[1-9][0-9]{0,18})$/.test(n.history.rawTicks) && BigInt(n.history.rawTicks) >= -9223372036854775808n && BigInt(n.history.rawTicks) <= 9223372036854775807n));
  return Object.freeze({ ...e, rows: Object.freeze(e.rows.map((n) => Object.freeze({ ...n, history: Object.freeze({ ...n.history }), parent: n.parent ? Object.freeze({ ...n.parent }) : void 0, image: n.image ? Object.freeze({ ...n.image }) : n.image }))) });
}
function Ri(e, t) {
  let n = null, r = !1, i = !1;
  const s = (o) => {
    try {
      o();
    } catch {
    }
  }, l = (o) => o.isConnected && e.querySelectorAll(".collection-items-list").length === 1 && e.querySelectorAll(".collection-items-list")[0] === o;
  function a() {
    const o = n;
    if (o) {
      if (n = null, o.candidate.parentElement === o.parent)
        try {
          o.candidate.replaceWith(o.legacy);
        } catch {
        }
      s(o.cleanup);
    }
  }
  function f(o, h, c) {
    if (r || n || !l(o) || typeof c != "function") return "LEGACY_RETAINED";
    let d, v;
    try {
      d = Mi(h), R(c()), v = Qe(o, d);
    } catch {
      return "LEGACY_RETAINED";
    }
    if (d.limit === 1200 && d.total > d.limit) return "LEGACY_RETAINED";
    const u = o.cloneNode(!1), m = o.parentElement, E = {};
    u.setAttribute(Oi, "1");
    let p, b = !1;
    const I = (M) => {
      if (!(i || n?.token !== E || !l(u))) {
        i = !0;
        try {
          if (!c() || n?.token !== E || !l(u)) return;
          const T = M === null ? v.next : v.buttons.get(M);
          if (!T) return;
          T.click();
        } finally {
          i = !1;
        }
      }
    };
    r = !0;
    try {
      p = t(u, d, I), R(typeof p == "function");
      const M = Qe(u, d, !0);
      R(gt(M.sig, v.sig));
      const T = Qe(o, d);
      return R(l(o) && c() && o.parentElement === m && gt(T.sig, v.sig) && T.next === v.next && [...v.buttons].every(([X, $]) => T.buttons.get(X) === $)), b = !0, o.replaceWith(u), R(l(u) && u.parentElement === m && gt(Qe(u, d, !0).sig, v.sig)), n = { legacy: o, candidate: u, cleanup: p, token: E, parent: m }, "MOUNTED";
    } catch {
      if (b && u.parentElement === m && o.parentElement === null)
        try {
          u.replaceWith(o);
        } catch {
        }
      return p && s(p), "LEGACY_RETAINED";
    } finally {
      r = !1;
    }
  }
  return { render: f, restore: a };
}
function Pi(e) {
  return Ri(e, (t, n, r) => {
    const i = Qr(Ii, { target: t, props: { snapshot: n, dispatch: r } }), s = () => {
      ti(i).catch(() => {
      });
    };
    try {
      Er();
    } catch (l) {
      throw s(), l;
    }
    return s;
  });
}
export {
  Pi as createProductCollectionItems
};
