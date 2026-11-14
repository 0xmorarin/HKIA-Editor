var $t = Array.isArray, Vn = Array.prototype.indexOf, Qe = Array.prototype.includes, lt = Array.from, en = Object.defineProperty, Le = Object.getOwnPropertyDescriptor, Bn = Object.getOwnPropertyDescriptors, Gn = Object.prototype, Yn = Array.prototype, tn = Object.getPrototypeOf, Mt = Object.isExtensible;
const Kn = () => {
};
function Wn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function nn() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const N = 2, Pe = 4, at = 8, rn = 1 << 24, U = 16, G = 32, $ = 64, pt = 128, Tt = 256, H = 512, T = 1024, O = 2048, B = 4096, R = 8192, j = 16384, Te = 32768, _t = 1 << 25, ye = 65536, $e = 1 << 17, Jn = 1 << 18, Oe = 1 << 19, Xn = 1 << 20, Q = 1 << 25, de = 65536, et = 1 << 21, we = 1 << 22, re = 1 << 23, ot =                 Symbol("$state"), ln =                 Symbol("component"), Zn =                 Symbol(""), an =                 Symbol("attributes"), Qn =                 Symbol("class"), $n =                 Symbol("style"), gt =                 Symbol("text"), ze = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), er = 1, tr = 2, nr = 16, rr = 1, ir = 2, A =                 Symbol("uninitialized"), lr = "http://www.w3.org/1999/xhtml";
function ar() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function sr() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function sn(e) {
  return e === this.v;
}
function or(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function on(e) {
  return !or(e, this.v);
}
function fr() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function cr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function ur() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function dr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function hr() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function vr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function pr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let Y = null;
function Ee(e) {
  Y = e;
}
function fn(e, t = !1, n) {
  Y = {
    p: Y,
    i: !1,
    c: null,
    e: null,
    s: e,
    x: null,
    r: (
                           
      g
    ),
    l: null
  };
}
function cn(e) {
  var t = (
                                   
    Y
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      jr(r);
  }
  return t.i = !0, Y = t.p, un(e);
}
function un(e = {}) {
  return en(e, ln, { value: !0 }), e;
}
function dn() {
  return !0;
}
let se = [];
function hn() {
  var e = se;
  se = [], Wn(e);
}
function oe(e) {
  if (se.length === 0 && !Me) {
    var t = se;
    queueMicrotask(() => {
      t === se && hn();
    });
  }
  se.push(e);
}
function _r() {
  for (; se.length > 0; )
    hn();
}
const gr = -7169;
function k(e, t) {
  e.f = e.f & gr | t;
}
function Ot(e) {
  (e.f & H) !== 0 || e.deps === null ? k(e, T) : k(e, B);
}
function vn(e) {
  if (e !== null)
    for (const t of e)
      (t.f & N) === 0 || (t.f & de) === 0 || (t.f ^= de, vn(
                              
        t.deps
      ));
}
function pn(e, t, n) {
  (e.f & O) !== 0 ? t.add(e) : (e.f & B) !== 0 && n.add(e), vn(e.deps), k(e, T);
}
function st(e) {
  var t = _, n = g;
  z(null), X(null);
  try {
    return e();
  } finally {
    z(t), X(n);
  }
}
function mr(e, t, n, r) {
  const i = gn;
  var l = e.filter((v) => !v.settled), a = t.map(i);
  if (n.length === 0 && l.length === 0) {
    r(a);
    return;
  }
  var o = (
                         
    g
  ), s = br(), f = l.length === 1 ? l[0].promise : l.length > 1 ? Promise.all(l.map((v) => v.promise)) : null;
  function u(v) {
    if ((o.f & j) === 0) {
      s();
      try {
        r([...a, ...v]);
      } catch (d) {
        K(d, o);
      }
      tt();
    }
  }
  var c = _n();
  if (n.length === 0) {
    f.then(() => u([])).finally(c);
    return;
  }
  function h() {
    Promise.all(n.map((v) =>                 wr(v))).then(u).catch((v) => K(v, o)).finally(c);
  }
  f ? f.then(() => {
    s(), h(), tt();
  }) : h();
}
function br() {
  var e = (
                         
    g
  ), t = _, n = Y, r = (
                        
    p
  );
  return function(l = !0) {
    X(e), z(t), Ee(n), l && (e.f & j) === 0 && (r?.activate(), r?.apply());
  };
}
function tt(e = !0) {
  X(null), z(null), Ee(null), e && p?.deactivate();
}
function _n() {
  var e = (
                         
    g
  ), t = e.b, n = (
                        
    p
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function gn(e) {
  var t = N | O;
  return g !== null && (g.f |= Oe), {
    ctx: Y,
    deps: null,
    effects: null,
    equals: sn,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      A
    ),
    wv: 0,
    parent: g,
    ac: null
  };
}
const Re =                 Symbol("obsolete");
                       
function wr(e, t, n) {
  let r = (
                                
    g
  );
  r === null && fr();
  var i = (
                             
                          
    void 0
  ), l = he(
                    
    A
  ), a = !_, o =                 new Set();
  return Fr(() => {
    var s = (
                           
      g
    ), f = nn();
    i = f.promise;
    try {
      Promise.resolve(e()).then(f.resolve, (v) => {
        v !== ze && f.reject(v);
      }).finally(tt);
    } catch (v) {
      f.reject(v), tt();
    }
    var u = (
                          
      p
    );
    if (a) {
      if ((s.f & Te) !== 0)
        var c = _n();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        u.async_deriveds.get(s)?.reject(Re);
      else
        for (const v of o.values())
          v.reject(Re);
      o.add(f), u.async_deriveds.set(s, f);
    }
    const h = (v, d = void 0) => {
      c?.(), o.delete(f), d !== Re && (u.activate(), d ? (l.f |= re, ke(l, d)) : ((l.f & re) !== 0 && (l.f ^= re), ke(l, v)), u.deactivate());
    };
    f.promise.then(h, (v) => h(null, v || "unknown"));
  }), Mr(() => {
    for (const s of o)
      s.reject(Re);
  }), new Promise((s) => {
    function f(u) {
      function c() {
        u === i ? s(l) : f(i);
      }
      u.then(c, c);
    }
    f(i);
  });
}
                       
function yr(e) {
  const t =                 gn(e);
  return t.equals = on, t;
}
function Er(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      L(
                             
        t[n]
      );
  }
}
function St(e) {
  var t, n = g, r = e.parent;
  if (!pe && r !== null && e.v !== A &&                                                                                                      
  (r.f & (j | R)) !== 0)
    return ar(), e.v;
  X(r);
  try {
    e.f &= ~de, Er(e), t = jn(e);
  } finally {
    X(n);
  }
  return t;
}
function mn(e) {
  var t = St(e);
  if (!e.equals(t) && (e.wv = Ln(), (!p?.is_fork || e.deps === null) && (p !== null ? (p.capture(e, t, !0), mt?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    k(e, T);
    return;
  }
  pe || (q !== null ? (xt() || p?.is_fork) && q.set(e, t) : Ot(e));
}
function kr(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
        t.ac.abort(ze), t.ac = null;
      }), t.fn !== null && (t.teardown = Kn), He(t, 0), Dt(t));
}
function bn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Ae(t);
}
let ft = null, ge = null, p = null, mt = null, q = null, bt = null, Me = !1, ct = !1, be = null, Je = null;
var jt = 0;
let Ar = 1;
class ie {
  id = Ar++;
                                              
  #t = !1;
  linked = !0;
                             
  #a = null;
                             
  #e = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #o =                 new Set();
     
                                                                                     
                                        
     
  #r =                 new Set();
     
                                                             
     
  #l = 0;
     
                                                                                
                                
     
  #n =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #s = null;
     
                                             
                     
     
  #i = [];
     
                                                 
                     
     
  #p = [];
     
                                                                               
                        
     
  #f =                 new Set();
     
                                          
                        
     
  #c =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #d =                 new Map();
     
                                                                                                    
                        
     
  #_ =                 new Set();
  is_fork = !1;
  #u = !1;
  constructor() {
    ge === null ? ft = ge = this : (ge.#e = this, this.#a = ge), ge = this;
  }
  #b() {
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
    this.#d.has(t) || this.#d.set(t, { d: [], m: [] }), this.#_.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#d.get(t);
    if (r) {
      this.#d.delete(t);
      for (var i of r.d)
        k(i, O), n(i);
      for (i of r.m)
        k(i, B), n(i);
    }
    this.#_.add(t);
  }
  #g() {
    this.#t = !0, jt++ > 1e3 && (this.#v(), Or());
    for (const s of this.#f)
      this.#c.delete(s), k(s, O), this.schedule(s);
    for (const s of this.#c)
      k(s, B), this.schedule(s);
    const t = this.#i;
    this.#i = [], this.apply();
    var n = be = [], r = [], i = Je = [];
    for (const s of t)
      try {
        this.#y(s, n, r);
      } catch (f) {
        throw En(s), this.#b() || this.discard(), f;
      }
    if (p = null, i.length > 0) {
      var l = ie.ensure();
      for (const s of i)
        l.schedule(s);
    }
    if (be = null, Je = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [s, f] of this.#d)
        yn(s, f);
      i.length > 0 &&                       
      p.#g();
      return;
    }
    const a = this.#w();
    if (a) {
      this.#h(r), this.#h(n), a.#E(this);
      return;
    }
    this.#f.clear(), this.#c.clear();
    for (const s of this.#o) s(this);
    this.#o.clear(), mt = this, Pt(r), Pt(n), mt = null, this.#s?.resolve();
    var o = (
                                 
                            
      p
    );
    if (this.#l === 0 && (this.#i.length === 0 || o !== null) && this.#v(), this.#i.length > 0)
      if (o !== null) {
        const s = o;
        s.#i.push(...this.#i.filter((f) => !s.#i.includes(f)));
      } else
        o = this;
    o !== null && (W.clear(), o.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #y(t, n, r) {
    t.f ^= T;
    for (var i = t.first; i !== null; ) {
      var l = i.f, a = (l & (G | $)) !== 0, o = a && (l & T) !== 0, s = o || (l & R) !== 0 || this.#d.has(i);
      if (!s && i.fn !== null) {
        a ? i.f ^= T : (l & Pe) !== 0 ? n.push(i) : qe(i) && ((l & U) !== 0 && this.#c.add(i), Ae(i));
        var f = i.first;
        if (f !== null) {
          i = f;
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
  #w() {
    for (var t = this.#a; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#a;
    }
    return null;
  }
     
                         
     
  #E(t) {
    for (const [r, i] of t.current)
      !this.previous.has(r) && t.previous.has(r) && this.previous.set(r, t.previous.get(r)), this.current.set(r, i);
    for (const [r, i] of t.async_deriveds) {
      const l = this.async_deriveds.get(r);
      l && i.promise.then(l.resolve).catch(l.reject);
    }
    t.async_deriveds.clear(), this.transfer_effects(t.#f, t.#c);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & N) !== 0 && (r.f & (O | B)) === 0))
        for (const o of i) {
          var l = o.f;
          if ((l & N) !== 0)
            n(
                                    
              o
            );
          else {
            var a = (
                                   
              o
            );
            l & (we | U) && !this.async_deriveds.has(a) && (this.#c.delete(a), k(a, O), this.schedule(a));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#v(), p = this, this.#g();
  }
     
                              
     
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      pn(t[n], this.#f, this.#c);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== A && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & re) === 0 && (this.current.set(t, [n, r]), q?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    p = this;
  }
  deactivate() {
    p = null, q = null;
  }
  flush() {
    try {
      ct = !0, p = this, this.#g();
    } finally {
      jt = 0, bt = null, be = null, Je = null, ct = !1, p = null, q = null, W.clear();
    }
  }
  discard() {
    for (const t of this.#r) t(this);
    this.#r.clear();
    for (const t of this.async_deriveds.values())
      t.reject(Re);
    this.#v(), this.#s?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#p.push(t);
  }
  #m() {
    for (let c = ft; c !== null; c = c.#e) {
      var t = c.id < this.id, n = [];
      for (const [h, [v, d]] of this.current) {
        if (c.current.has(h)) {
          var r = (
                                         
            c.current.get(h)[0]
          );
          if (t && v !== r)
            c.current.set(h, [v, d]);
          else
            continue;
        }
        n.push(h);
      }
      if (t)
        for (const [h, v] of this.async_deriveds) {
          const d = c.async_deriveds.get(h);
          d && v.promise.then(d.resolve).catch(d.reject);
        }
      var i = [...c.current.keys()].filter(
        (h) => !                             
        c.current.get(h)[1]
      );
      if (!(!c.#t || i.length === 0)) {
        var l = i.filter((h) => !this.current.has(h));
        if (l.length === 0)
          t && c.discard();
        else if (n.length > 0) {
          if (t)
            for (const h of this.#_)
              c.unskip_effect(h, (v) => {
                (v.f & (U | we)) !== 0 ? c.schedule(v) : c.#h([v]);
              });
          c.activate();
          var a =                 new Set(), o =                 new Map();
          for (var s of n)
            wn(s, l, a, o);
          o =                 new Map();
          var f = [...c.current].filter(([h, v]) => {
            const d = this.current.get(h);
            return d ? d[0] !== v[0] || d[1] !== v[1] : !0;
          }).map(([h]) => h);
          if (f.length > 0)
            for (const h of this.#p)
              (h.f & (j | R | $e)) === 0 && Nt(h, f, o) && ((h.f & (we | U)) !== 0 ? (k(h, O), c.schedule(h)) : c.#f.add(h));
          if (c.#i.length > 0 && !c.#u) {
            c.apply();
            for (var u of c.#i)
              c.#y(u, [], []);
            c.#i = [];
          }
          c.deactivate();
        }
      }
    }
  }
     
                              
                           
     
  increment(t, n) {
    if (this.#l += 1, t) {
      let r = this.#n.get(n) ?? 0;
      this.#n.set(n, r + 1);
    }
  }
     
                              
                           
     
  decrement(t, n) {
    if (this.#l -= 1, t) {
      let r = this.#n.get(n) ?? 0;
      r === 1 ? this.#n.delete(n) : this.#n.set(n, r - 1);
    }
    this.#u || (this.#u = !0, oe(() => {
      this.#u = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, n) {
    for (const r of t)
      this.#f.add(r);
    for (const r of n)
      this.#c.add(r);
    t.clear(), n.clear();
  }
                                           
  oncommit(t) {
    this.#o.add(t);
  }
                                           
  ondiscard(t) {
    this.#r.add(t);
  }
  settled() {
    return (this.#s ??= nn()).promise;
  }
  static ensure() {
    if (p === null) {
      const t = p = new ie();
      !ct && !Me && oe(() => {
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
    if (bt = t, t.b?.is_pending && (t.f & (Pe | at | rn)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (be !== null && n === g && (_ === null || (_.f & N) === 0))
        return;
      if ((r & ($ | G)) !== 0) {
        if ((r & T) === 0)
          return;
        n.f ^= T;
      }
    }
    this.#i.push(n);
  }
  #v() {
    if (this.linked) {
      var t = this.#a, n = this.#e;
      t === null ? ft = n : t.#e = n, n === null ? ge = t : n.#a = t, this.linked = !1;
    }
  }
}
function Tr(e) {
  var t = Me;
  Me = !0;
  try {
    for (var n; ; ) {
      if (_r(), p === null)
        return (
                          
          n
        );
      p.flush();
    }
  } finally {
    Me = t;
  }
}
function Or() {
  try {
    ur();
  } catch (e) {
    K(e, bt);
  }
}
let Z = null;
function Pt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (j | R)) === 0 && qe(r) && (Z =                 new Set(), Ae(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && xn(r), Z?.size > 0)) {
        W.clear();
        for (const i of Z) {
          if ((i.f & (j | R)) !== 0) continue;
          const l = [i];
          let a = i.parent;
          for (; a !== null; )
            Z.has(a) && (Z.delete(a), l.push(a)), a = a.parent;
          for (let o = l.length - 1; o >= 0; o--) {
            const s = l[o];
            (s.f & (j | R)) === 0 && Ae(s);
          }
        }
        Z.clear();
      }
    }
    Z = null;
  }
}
function wn(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const l = i.f;
      (l & N) !== 0 ? wn(
                              
        i,
        t,
        n,
        r
      ) : (l & (we | U)) !== 0 && (l & O) === 0 && Nt(i, t, r) && (k(i, O), Ct(
                             
        i
      ));
    }
}
function Nt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (Qe.call(t, i))
        return !0;
      if ((i.f & N) !== 0 && Nt(
                              
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
function Ct(e) {
  p.schedule(e);
}
function yn(e, t) {
  if (!((e.f & G) !== 0 && (e.f & T) !== 0)) {
    (e.f & O) !== 0 ? t.d.push(e) : (e.f & B) !== 0 && t.m.push(e), k(e, T);
    for (var n = e.first; n !== null; )
      yn(n, t), n = n.next;
  }
}
function En(e) {
  k(e, T);
  for (var t = e.first; t !== null; )
    En(t), t = t.next;
}
let nt =                 new Set();
const W =                 new Map();
let kn = !1;
function he(e, t) {
  var n = {
    f: 0,
                                                                            
    v: e,
    reactions: null,
    equals: sn,
    rv: 0,
    wv: 0
  };
  return n;
}
                       
function te(e, t) {
  const n = he(e);
  return qr(n), n;
}
                       
function Sr(e, t = !1, n = !0) {
  const r = he(e);
  return t || (r.equals = on), r;
}
function ae(e, t, n = !1) {
  _ !== null &&                                                                                         
                                                                
  (!V || (_.f & $e) !== 0) && dn() && (_.f & (N | U | we | $e)) !== 0 && (J === null || !J.has(e)) && vr();
  let r = n ? De(t) : t;
  return ke(e, r, Je);
}
function ke(e, t, n = null) {
  if (!e.equals(t)) {
    pe ? W.set(e, t) : W.has(e) || W.set(e, e.v);
    var r = ie.ensure();
    if (r.capture(e, t), (e.f & N) !== 0) {
      const i = (
                              
        e
      );
      (e.f & O) !== 0 && St(i), q === null && Ot(i);
    }
    e.wv = Ln(), An(e, O, n), g !== null && (g.f & T) !== 0 && (g.f & (G | $)) === 0 && (P === null ? Vr([e]) : P.push(e)), !r.is_fork && nt.size > 0 && !kn && Nr();
  }
  return t;
}
function Nr() {
  kn = !1;
  for (const e of nt) {
    (e.f & T) !== 0 && k(e, B);
    let t;
    try {
      t = qe(e);
    } catch {
      t = !0;
    }
    t && Ae(e);
  }
  nt.clear();
}
function je(e) {
  ae(e, e.v + 1);
}
function An(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, l = 0; l < i; l++) {
      var a = r[l], o = a.f, s = (o & O) === 0;
      if (s && k(a, t), (o & $e) !== 0)
        nt.add(
                               
          a
        );
      else if ((o & N) !== 0) {
        var f = (
                                
          a
        );
        q?.delete(f), (o & de) === 0 && (o & H && (g === null || (g.f & et) === 0) && (a.f |= de), An(f, B, n));
      } else if (s) {
        var u = (
                               
          a
        );
        (o & U) !== 0 && Z !== null && Z.add(u), n !== null ? n.push(u) : Ct(u);
      }
    }
}
function De(e) {
  if (typeof e != "object" || e === null || ot in e || ln in e)
    return e;
  const t = tn(e);
  if (t !== Gn && t !== Yn)
    return e;
  var n =                 new Map(), r = $t(e), i =                 te(0), l = ue, a = (o) => {
    if (ue === l)
      return o();
    var s = _, f = ue;
    z(null), qt(l);
    var u = o();
    return z(s), qt(f), u;
  };
  return r && n.set("length",                 te(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(o, s, f) {
        (!("value" in f) || f.configurable === !1 || f.enumerable === !1 || f.writable === !1) && dr();
        var u = n.get(s);
        return u === void 0 ? a(() => {
          var c =                 te(f.value);
          return n.set(s, c), c;
        }) : ae(u, f.value, !0), !0;
      },
      deleteProperty(o, s) {
        var f = n.get(s);
        if (f === void 0) {
          if (s in o) {
            const u = a(() =>                 te(A));
            n.set(s, u), je(i);
          }
        } else
          ae(f, A), je(i);
        return !0;
      },
      get(o, s, f) {
        if (s === ot)
          return e;
        var u = n.get(s), c = s in o;
        if (u === void 0 && (!c || Le(o, s)?.writable) && (u = a(() => {
          var v = De(c ? o[s] : A), d =                 te(v);
          return d;
        }), n.set(s, u)), u !== void 0) {
          var h = I(u);
          return h === A ? void 0 : h;
        }
        return Reflect.get(o, s, f);
      },
      getOwnPropertyDescriptor(o, s) {
        var f = Reflect.getOwnPropertyDescriptor(o, s);
        if (f && "value" in f) {
          var u = n.get(s);
          u && (f.value = I(u));
        } else if (f === void 0) {
          var c = n.get(s), h = c?.v;
          if (c !== void 0 && h !== A)
            return {
              enumerable: !0,
              configurable: !0,
              value: h,
              writable: !0
            };
        }
        return f;
      },
      has(o, s) {
        if (s === ot)
          return !0;
        var f = n.get(s), u = f !== void 0 && f.v !== A || Reflect.has(o, s);
        if (f !== void 0 || g !== null && (!u || Le(o, s)?.writable)) {
          f === void 0 && (f = a(() => {
            var h = u ? De(o[s]) : A, v =                 te(h);
            return v;
          }), n.set(s, f));
          var c = I(f);
          if (c === A)
            return !1;
        }
        return u;
      },
      set(o, s, f, u) {
        var c = n.get(s), h = s in o;
        if (r && s === "length")
          for (var v = f; v <                              
          c.v; v += 1) {
            var d = n.get(v + "");
            d !== void 0 ? ae(d, A) : v in o && (d = a(() =>                 te(A)), n.set(v + "", d));
          }
        if (c === void 0)
          (!h || Le(o, s)?.writable) && (c = a(() =>                 te(void 0)), ae(c, De(f)), n.set(s, c));
        else {
          h = c.v !== A;
          var m = a(() => De(f));
          ae(c, m);
        }
        var w = Reflect.getOwnPropertyDescriptor(o, s);
        if (w?.set && w.set.call(u, f), !h) {
          if (r && typeof s == "string") {
            var b = (
                                           
              n.get("length")
            ), E = Number(s);
            Number.isInteger(E) && E >= b.v && ae(b, E + 1);
          }
          je(i);
        }
        return !0;
      },
      ownKeys(o) {
        I(i);
        var s = Reflect.ownKeys(o).filter((c) => {
          var h = n.get(c);
          return h === void 0 || h.v !== A;
        });
        for (var [f, u] of n)
          u.v !== A && !(f in o) && s.push(f);
        return s;
      },
      setPrototypeOf() {
        hr();
      }
    }
  );
}
var Ft, Tn, On, Sn;
function Cr() {
  if (Ft === void 0) {
    Ft = window, Tn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    On = Le(t, "firstChild").get, Sn = Le(t, "nextSibling").get, Mt(e) && (e[Qn] = void 0, e[an] = null, e[$n] = void 0, e.__e = void 0), Mt(n) && (n[gt] = void 0);
  }
}
function ve(e = "") {
  return document.createTextNode(e);
}
                       
function Fe(e) {
  return (
                                      
    On.call(e)
  );
}
                       
function Ue(e) {
  return (
                                      
    Sn.call(e)
  );
}
function xr(e, t) {
  return                 Fe(e);
}
function Ht(e, t = !1) {
  {
    var n =                 Fe(e);
    return n instanceof Comment && n.data === "" ?                 Ue(n) : n;
  }
}
function Ve(e, t = !1) {
  return                 Fe(e);
}
function zt(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    Ue(r);
  return r;
}
function Rr(e) {
  e.textContent = "";
}
function Nn() {
  return !1;
}
function Dr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Ir(e) {
  var t = g;
  if (t === null)
    return _.f |= re, e;
  if ((t.f & Te) === 0 && (t.f & Pe) === 0)
    throw e;
  K(e, t);
}
function K(e, t) {
  if (!(t !== null && (t.f & j) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & pt) !== 0 && (t.f & (j | _t)) === 0) {
        if ((t.f & Te) === 0)
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
function Lr(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function le(e, t) {
  var n = g;
  n !== null && (n.f & R) !== 0 && (e |= R);
  var r = {
    ctx: Y,
    deps: null,
    nodes: null,
    f: e | O | H,
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
  if ((e & Pe) !== 0)
    be !== null ? be.push(r) : ie.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ae(r);
    } catch (a) {
      throw L(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Oe) === 0 && (i = i.first, (e & U) !== 0 && (e & ye) !== 0 && i !== null && (i.f |= ye));
  }
  if (i !== null && (i.parent = n, n !== null && Lr(i, n), _ !== null && (_.f & N) !== 0 && (e & $) === 0)) {
    var l = (
                            
      _
    );
    (l.effects ??= []).push(i);
  }
  return r;
}
function xt() {
  return _ !== null && !V;
}
function Mr(e) {
  const t = le(at, null);
  return k(t, T), t.teardown = e, t;
}
function jr(e) {
  return le(Pe | Xn, e);
}
function Pr(e) {
  ie.ensure();
  const t = le($ | Oe, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? ce(t, () => {
      L(t), r(void 0);
    }) : (L(t), r(void 0));
  });
}
function Fr(e) {
  return le(we | Oe, e);
}
function Hr(e, t = 0) {
  return le(at | t, e);
}
function ut(e, t = [], n = [], r = []) {
  mr(r, t, n, (i) => {
    le(at, () => {
      e(...i.map(I));
    });
  });
}
function Rt(e, t = 0) {
  var n = le(U | t, e);
  return n;
}
function F(e) {
  return le(G | Oe, e);
}
function Cn(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = pe, r = _;
    Ut(!0), z(null);
    try {
      t.call(null);
    } catch (i) {
      K(i, e.parent);
    } finally {
      Ut(n), z(r);
    }
  }
}
function Dt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && st(() => {
      i.abort(ze);
    });
    var r = n.next;
    (n.f & $) !== 0 ? n.parent = null : L(n, t), n = r;
  }
}
function zr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & G) === 0 && L(t), t = n;
  }
}
function L(e, t = !0) {
  var n = !1;
  (t || (e.f & Jn) !== 0) && e.nodes !== null && e.nodes.end !== null && (Ur(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= _t, Dt(e, t && !n), He(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const l of r)
      l.stop();
  Cn(e), e.f ^= _t, e.f |= j;
  var i = e.parent;
  i !== null && i.first !== null && xn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ur(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 Ue(e);
    e.remove(), e = n;
  }
}
function xn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function ce(e, t, n = !0) {
  var r = [];
  e.f |= Tt, Rn(e, r, !0);
  var i = () => {
    n && L(e), t && t();
  }, l = r.length;
  if (l > 0) {
    var a = () => --l || i();
    for (var o of r)
      o.out(a);
  } else
    i();
}
function Rn(e, t, n) {
  if ((e.f & R) === 0) {
    e.f ^= R;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const o of r)
        (o.is_global || n) && t.push(o);
    for (var i = e.first; i !== null; ) {
      var l = i.next;
      if ((i.f & $) === 0) {
        var a = (i.f & ye) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & G) !== 0 && (e.f & U) !== 0;
        Rn(i, t, a ? n : !1);
      }
      i = l;
    }
  }
}
function rt(e) {
  e.f &= ~Tt, Dn(e, !0);
}
function Dn(e, t) {
  if ((e.f & Tt) === 0 && (e.f & R) !== 0) {
    e.f ^= R, (e.f & T) === 0 && (k(e, O), ie.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & ye) !== 0 || (n.f & G) !== 0;
      Dn(n, i ? t : !1), n = r;
    }
    var l = e.nodes && e.nodes.t;
    if (l !== null)
      for (const a of l)
        (a.is_global || t) && a.in();
  }
}
function It(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 Ue(n);
      t.append(n), n = i;
    }
}
let Xe = !1, pe = !1;
function Ut(e) {
  pe = e;
}
let _ = null, V = !1;
function z(e) {
  _ = e;
}
let g = null;
function X(e) {
  g = e;
}
let J = null;
function qr(e) {
  _ !== null && (J ??=                 new Set()).add(e);
}
let D = null, M = 0, P = null;
function Vr(e) {
  P = e;
}
let In = 1, fe = 0, ue = fe;
function qt(e) {
  ue = e;
}
function Ln() {
  return ++In;
}
function qe(e) {
  var t = e.f;
  if ((t & O) !== 0)
    return !0;
  if (t & N && (e.f &= ~de), (t & B) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var l = n[i];
      if (qe(
                              
        l
      ) && mn(
                              
        l
      ), l.wv > e.wv)
        return !0;
    }
    (t & H) !== 0 &&                                                                   
                                                                
    q === null && k(e, T);
  }
  return !1;
}
function Mn(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(J !== null && J.has(e)))
    for (var i = 0; i < r.length; i++) {
      var l = r[i];
      (l.f & N) !== 0 ? Mn(
                              
        l,
        t,
        !1
      ) : t === l && (n ? k(l, O) : (l.f & T) !== 0 && k(l, B), Ct(
                             
        l
      ));
    }
}
function jn(e) {
  var t = D, n = M, r = P, i = _, l = J, a = Y, o = V, s = ue, f = e.f;
  D =                              
  null, M = 0, P = null, _ = (f & (G | $)) === 0 ? e : null, J = null, Ee(e.ctx), V = !1, ue = ++fe, e.ac !== null && (st(() => {
    e.ac.abort(ze);
  }), e.ac = null);
  try {
    e.f |= et;
    var u = (
                             
      e.fn
    ), c = u();
    e.f |= Te;
    var h = Vt(e);
    if (dn() && P !== null && !V && h !== null && (e.f & (N | B | O)) === 0)
      for (var v = 0; v <                        
      P.length; v++)
        Mn(
          P[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (fe++, i.deps !== null)
        for (let d = 0; d < n; d += 1)
          i.deps[d].rv = fe;
      if (t !== null)
        for (const d of t)
          d.rv = fe;
      P !== null && (r === null ? r = P : r.push(...                       
      P));
    }
    return (e.f & re) !== 0 && (e.f ^= re), c;
  } catch (d) {
    return Vt(e), Ir(d);
  } finally {
    e.f ^= et, D = t, M = n, P = r, _ = i, J = l, Ee(a), V = o, ue = s;
  }
}
function Vt(e) {
  var t = e.deps, n = p?.is_fork;
  if (D !== null) {
    var r;
    if (n || He(e, M), t !== null && M > 0)
      for (t.length = M + D.length, r = 0; r < D.length; r++)
        t[M + r] = D[r];
    else
      e.deps = t = D;
    if (xt() && (e.f & H) !== 0)
      for (r = M; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && M < t.length && (He(e, M), t.length = M);
  return t;
}
function Br(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Vn.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & N) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (D === null || !Qe.call(D, t))) {
    var l = (
                            
      t
    );
    (l.f & H) !== 0 && (l.f ^= H, l.f &= ~de), l.v !== A && Ot(l), l.ac !== null && st(() => {
      l.ac.abort(ze), l.ac = null, k(l, O);
    }), kr(l), He(l, 0);
  }
}
function He(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Br(e, n[r]);
}
function Ae(e) {
  var t = e.f;
  if ((t & j) === 0) {
    k(e, T);
    var n = g, r = Xe;
    g = e, Xe = (t & (G | $)) === 0;
    try {
      (t & (U | rn)) !== 0 ? zr(e) : Dt(e), Cn(e);
      var i = jn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = In;
      var l;
    } finally {
      Xe = r, g = n;
    }
  }
}
function I(e) {
  var t = e.f, n = (t & N) !== 0;
  if (_ !== null && !V) {
    var r = g !== null && (g.f & j) !== 0;
    if (!r && (J === null || !J.has(e))) {
      var i = _.deps;
      if ((_.f & et) !== 0)
        e.rv < fe && (e.rv = fe, D === null && i !== null && i[M] === e ? M++ : D === null ? D = [e] : D.push(e));
      else {
        _.deps ??= [], Qe.call(_.deps, e) || _.deps.push(e);
        var l = e.reactions;
        l === null ? e.reactions = [_] : Qe.call(l, _) || l.push(_);
      }
    }
  }
  if (pe && W.has(e))
    return W.get(e);
  if (n) {
    var a = (
                            
      e
    );
    if (pe) {
      var o = a.v;
      return ((a.f & T) === 0 && a.reactions !== null || Fn(a)) && (o = St(a)), W.set(a, o), o;
    }
    var s = (a.f & H) === 0 && !V && _ !== null && (Xe || (_.f & H) !== 0), f = (a.f & Te) === 0;
    qe(a) && (s && (a.f |= H), mn(a)), s && !f && (bn(a), Pn(a));
  }
  if (q?.has(e))
    return q.get(e);
  if ((e.f & re) !== 0)
    throw e.v;
  return e.v;
}
function Pn(e) {
  if (e.f |= H, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & N) !== 0 && (t.f & H) === 0 && (bn(
                              
        t
      ), Pn(
                              
        t
      ));
}
function Fn(e) {
  if (e.v === A) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if (W.has(t) || (t.f & N) !== 0 && Fn(
                            
      t
    ))
      return !0;
  return !1;
}
function Gr(e) {
  var t = V;
  try {
    return V = !0, e();
  } finally {
    V = t;
  }
}
const Yr = ["touchstart", "touchmove"];
function Kr(e) {
  return Yr.includes(e);
}
const Be =                 Symbol("events"), Wr =                 new Set(), Bt =                 new Set();
let dt = null, ht = !1;
function Gt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], l = (
                                 
    i[0] || e.target
  );
  dt = e, ht || (ht = !0, setTimeout(() => {
    ht = !1, dt = null;
  }));
  var a = 0, o = dt === e && e[Be];
  if (o) {
    var s = i.indexOf(o);
    if (s !== -1 && (t === document || t ===                   
    window)) {
      e[Be] = t;
      return;
    }
    var f = i.indexOf(t);
    if (f === -1)
      return;
    s <= f && (a = s);
  }
  if (l =                       
  i[a] || e.target, l !== t) {
    en(e, "currentTarget", {
      configurable: !0,
      get() {
        return l || n;
      }
    });
    var u = _, c = g;
    z(null), X(null);
    try {
      for (var h, v = []; l !== null && l !== t; ) {
        try {
          var d = l[Be]?.[r];
          d != null && (!                  
          l.disabled ||                                                                                           
                                                                                                     
          e.target === l) && d.call(l, e);
        } catch (m) {
          h ? v.push(m) : h = m;
        }
        if (e.cancelBubble) break;
        a++, l = a < i.length ? (
                                
          i[a]
        ) : null;
      }
      if (h) {
        for (let m of v)
          queueMicrotask(() => {
            throw m;
          });
        throw h;
      }
    } finally {
      e[Be] = t, delete e.currentTarget, z(u), X(c);
    }
  }
}
const Jr = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function Xr(e) {
  return (
                         
    Jr?.createHTML(e) ?? e
  );
}
function Zr(e) {
  var t = Dr("template");
  return t.innerHTML = Xr(e.replaceAll("<!>", "<!---->")), t.content;
}
function wt(e, t) {
  var n = (
                         
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function Lt(e, t) {
  var n = (t & rr) !== 0, r = (t & ir) !== 0, i, l = !e.startsWith("<!>");
  return () => {
    i === void 0 && (i = Zr(l ? e : "<!>" + e), n || (i =                            
                    Fe(i)));
    var a = (
                                 
      r || Tn ? document.importNode(i, !0) : i.cloneNode(!0)
    );
    if (n) {
      var o = (
                                   
                        Fe(a)
      ), s = (
                                   
        a.lastChild
      );
      wt(o, s);
    } else
      wt(a, a);
    return a;
  };
}
function Qr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = ve();
  return e.append(t, n), wt(t, n), e;
}
function Ge(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function $r(e) {
  let t = 0, n = he(0), r;
  return () => {
    xt() && (I(n), Hr(() => (t === 0 && (r = Gr(() => e(() => je(n)))), t += 1, () => {
      oe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, je(n));
      });
    })));
  };
}
var ei = ye | Oe;
function ti(e, t, n, r) {
  new ni(e, t, n, r);
}
class ni {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #t;
                                    
  #a = null;
                              
  #e;
                                         
  #o;
                       
  #r;
                              
  #l = null;
                              
  #n = null;
                              
  #s = null;
                                        
  #i = null;
  #p = 0;
  #f = 0;
  #c = !1;
                            
  #d =                 new Set();
                            
  #_ =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #u = null;
  #b = $r(() => (this.#u = he(this.#p), () => {
    this.#u = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#t = t, this.#e = n, this.#o = (l) => {
      var a = (
                             
        g
      );
      a.b = this, a.f |= pt, r(l);
    }, this.parent =                      
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((l) => l), this.#r = Rt(() => {
      this.#h();
    }, ei);
  }
  #g() {
    try {
      this.#l = F(() => this.#o(this.#t));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #y(t) {
    const n = this.#e.failed, { reset: r, invoke_onerror: i } = this.#w(t);
    oe(i), n && (this.#s = F(() => {
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
        sr();
        return;
      }
      n = !0, r && pr(), this.#s !== null && ce(this.#s, () => {
        this.#s = null;
      }), this.#v(() => {
        this.#h();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#e.onerror?.(t, i), r = !1;
      } catch (a) {
        K(a, this.#r && this.#r.parent);
      }
    } };
  }
  #E() {
    const t = this.#e.pending;
    t && (this.is_pending = !0, this.#n = F(() => t(this.#t)), oe(() => {
      var n = this.#i = document.createDocumentFragment(), r = ve(), i = !1;
      if (n.append(r), this.#l = this.#v(() => {
        try {
          return F(() => this.#o(r));
        } catch (l) {
          try {
            this.error(l), i = !0;
          } catch (a) {
            K(a, this.#r.parent);
          }
          return null;
        }
      }), this.#l === null) {
        this.#i = null, i && this.#m(
                              
          p
        );
        return;
      }
      this.#f === 0 && (this.#t.before(n), this.#i = null, ce(
                             
        this.#n,
        () => {
          this.#n = null;
        }
      ), this.#m(
                            
        p
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#f = 0, this.#p = 0, this.#l = F(() => {
        this.#o(this.#t);
      }), this.#f > 0) {
        var t = this.#i = document.createDocumentFragment();
        It(this.#l, t);
        const n = (
                                               
          this.#e.pending
        );
        this.#n = F(() => n(this.#t));
      } else
        this.#m(
                              
          p
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#d, this.#_);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    pn(t, this.#d, this.#_);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#e.pending;
  }
     
                
                        
     
  #v(t) {
    var n = g, r = _, i = Y;
    X(this.#r), z(this.#r), Ee(this.#r.ctx);
    try {
      return ie.ensure(), t();
    } finally {
      X(n), z(r), Ee(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #k(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#k(t, n);
      return;
    }
    this.#f += t, this.#f === 0 && (this.#m(n), this.#n && ce(this.#n, () => {
      this.#n = null;
    }), this.#i && (this.#t.before(this.#i), this.#i = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#k(t, n), this.#p += t, !(!this.#u || this.#c) && (this.#c = !0, oe(() => {
      this.#c = !1, this.#u && ke(this.#u, this.#p);
    }));
  }
  get_effect_pending() {
    return this.#b(), I(
                                   
      this.#u
    );
  }
                               
  error(t) {
    if (!this.#e.onerror && !this.#e.failed)
      throw t;
    p?.is_fork ? (this.#l && p.skip_effect(this.#l), this.#n && p.skip_effect(this.#n), this.#s && p.skip_effect(this.#s), p.oncommit(() => {
      this.#A(t);
    })) : this.#A(t);
  }
     
                           
     
  #A(t) {
    this.#l && (L(this.#l), this.#l = null), this.#n && (L(this.#n), this.#n = null), this.#s && (L(this.#s), this.#s = null);
    let n = this.#e.failed;
    const r = (i) => {
      const { reset: l, invoke_onerror: a } = this.#w(i);
      a(), n && (this.#s = this.#v(() => {
        try {
          return F(() => {
            var o = (
                                   
              g
            );
            o.b = this, o.f |= pt, n(
              this.#t,
              () => i,
              () => l
            );
          });
        } catch (o) {
          return K(
            o,
                                 
            this.#r.parent
          ), null;
        }
      }));
    };
    oe(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (l) {
        K(l, this.#r && this.#r.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (l) => K(l, this.#r && this.#r.parent)
      ) : r(i);
    });
  }
}
function Ye(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[gt] ??= e.nodeValue) && (e[gt] = n, e.nodeValue = `${n}`);
}
function ri(e, t) {
  return ii(e, t);
}
const Ke =                 new Map();
function ii(e, { target: t, anchor: n, props: r = {}, events: i, context: l, intro: a = !0, transformError: o }) {
  Cr();
  var s = void 0, f = Pr(() => {
    var u = n ?? t.appendChild(ve());
    ti(
                                 
      u,
      {
        pending: () => {
        }
      },
      (v) => {
        fn({});
        var d = (
                                         
          Y
        );
        l && (d.c = l), i && (r.$$events = i), s = e(v, r) || un(), cn();
      },
      o
    );
    var c =                 new Set(), h = (v) => {
      for (var d = 0; d < v.length; d++) {
        var m = v[d];
        if (!c.has(m)) {
          c.add(m);
          var w = Kr(m);
          for (const C of [t, document]) {
            var b = Ke.get(C);
            b === void 0 && (b =                 new Map(), Ke.set(C, b));
            var E = b.get(m);
            E === void 0 ? (C.addEventListener(m, Gt, { passive: w }), b.set(m, 1)) : b.set(m, E + 1);
          }
        }
      }
    };
    return h(lt(Wr)), Bt.add(h), () => {
      for (var v of c)
        for (const w of [t, document]) {
          var d = (
                                              
            Ke.get(w)
          ), m = (
                                 
            d.get(v)
          );
          --m == 0 ? (w.removeEventListener(v, Gt), d.delete(v), d.size === 0 && Ke.delete(w)) : d.set(v, m);
        }
      Bt.delete(h), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return yt.set(s, f), s;
}
let yt =                 new WeakMap();
function li(e, t) {
  const n = yt.get(e);
  return n ? (yt.delete(e), n(t)) : Promise.resolve();
}
class ai {
                             
  anchor;
                                
  #t =                 new Map();
     
                                                                   
                                                                      
             
        
                    
         
            
         
          
        
                                                                 
                             
     
  #a =                 new Map();
     
                                                                                          
                                                     
                             
     
  #e =                 new Map();
     
                                                
                     
     
  #o =                 new Set();
     
                                                                     
                                             
     
  #r = !0;
     
                                 
                                
     
  constructor(t, n = !0) {
    this.anchor = t, this.#r = n;
  }
     
                         
     
  #l = (t) => {
    if (this.#t.has(t)) {
      var n = (
                          
        this.#t.get(t)
      ), r = this.#a.get(n);
      if (r)
        rt(r), this.#o.delete(n);
      else {
        var i = this.#e.get(n);
        i && (rt(i.effect), this.#a.set(n, i.effect), this.#e.delete(n), i.fragment.lastChild.remove(), this.anchor.before(i.fragment), r = i.effect);
      }
      for (const [l, a] of this.#t) {
        if (this.#t.delete(l), l === t)
          break;
        const o = this.#e.get(a);
        o && (L(o.effect), this.#e.delete(a));
      }
      for (const [l, a] of this.#a) {
        if (l === n || this.#o.has(l)) continue;
        const o = () => {
          if (Array.from(this.#t.values()).includes(l)) {
            var f = document.createDocumentFragment();
            It(a, f), f.append(ve()), this.#e.set(l, { effect: a, fragment: f });
          } else
            L(a);
          this.#o.delete(l), this.#a.delete(l);
        };
        this.#r || !r ? (this.#o.add(l), ce(a, o, !1)) : o();
      }
    }
  };
     
                         
     
  #n = (t) => {
    this.#t.delete(t);
    const n = Array.from(this.#t.values());
    for (const [r, i] of this.#e)
      n.includes(r) || (L(i.effect), this.#e.delete(r));
  };
     
    
                     
                                                        
     
  ensure(t, n) {
    var r = (
                          
      p
    ), i = Nn();
    if (n && !this.#a.has(t) && !this.#e.has(t))
      if (i) {
        var l = document.createDocumentFragment(), a = ve();
        l.append(a), this.#e.set(t, {
          effect: F(() => n(a)),
          fragment: l
        });
      } else
        this.#a.set(
          t,
          F(() => n(this.anchor))
        );
    if (this.#t.set(r, t), i) {
      for (const [o, s] of this.#a)
        o === t ? r.unskip_effect(s) : r.skip_effect(s);
      for (const [o, s] of this.#e)
        o === t ? r.unskip_effect(s.effect) : r.skip_effect(s.effect);
      r.oncommit(this.#l), r.ondiscard(this.#n);
    } else
      this.#l(r);
  }
}
function si(e, t, n = !1) {
  var r = new ai(e), i = n ? ye : 0;
  function l(a, o) {
    r.ensure(a, o);
  }
  Rt(() => {
    var a = !1;
    t((o, s = 0) => {
      a = !0, l(s, o);
    }), a || l(-1, null);
  }, i);
}
function oi(e, t, n) {
  for (var r = [], i = t.length, l, a = t.length, o = 0; o < i; o++) {
    let c = t[o];
    ce(
      c,
      () => {
        if (l) {
          if (l.pending.delete(c), l.done.add(c), l.pending.size === 0) {
            var h = (
                                                
              e.outrogroups
            );
            Et(e, lt(l.done)), h.delete(l), h.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var s = r.length === 0 && n !== null && e.pending.size === 0;
    if (s) {
      var f = (
                              
        n
      ), u = (
                              
        f.parentNode
      );
      Rr(u), u.append(f), e.items.clear();
    }
    Et(e, t, !s);
  } else
    l = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(l);
}
function Et(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const a of e.pending.values())
      for (const o of a)
        r.add(
                                 
          e.items.get(o).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var l = t[i];
    if (r?.has(l)) {
      l.f |= Q;
      const a = document.createDocumentFragment();
      It(l, a);
    } else
      L(t[i], n);
  }
}
var Yt;
function fi(e, t, n, r, i, l = null) {
  var a = e, o =                 new Map(), s = null, f =                 yr(() => {
    var b = n();
    return (
                        
      $t(b) ? b : b == null ? [] : lt(b)
    );
  }), u, c =                 new Map(), h = !0;
  function v(b) {
    (w.effect.f & j) === 0 && (w.pending.delete(b), w.fallback = s, ci(w, u, a, t, r), s !== null && (u.length === 0 ? (s.f & Q) === 0 ? rt(s) : (s.f ^= Q, Ie(s, null, a)) : ce(s, () => {
      s = null;
    })));
  }
  function d(b) {
    w.pending.delete(b);
  }
  var m = Rt(() => {
    u =                   
    I(f);
    for (var b = u.length, E =                 new Set(), C = (
                          
      p
    ), ee = Nn(), y = 0; y < b; y += 1) {
      var Se = u[y], _e = r(Se, y), x = h ? null : o.get(_e);
      x ? (x.v && ke(x.v, Se), x.i && ke(x.i, y), ee && C.unskip_effect(x.e)) : (x = ui(
        o,
        h ? a : Yt ??= ve(),
        Se,
        _e,
        y,
        i,
        t,
        n
      ), h || (x.e.f |= Q), o.set(_e, x)), E.add(_e);
    }
    if (b === 0 && l && !s && (h ? s = F(() => l(a)) : (s = F(() => l(Yt ??= ve())), s.f |= Q)), b > E.size && cr(), !h)
      if (c.set(C, E), ee) {
        for (const [Un, qn] of o)
          E.has(Un) || C.skip_effect(qn.e);
        C.oncommit(v), C.ondiscard(d);
      } else
        v(C);
    I(f);
  }), w = { effect: m, items: o, pending: c, outrogroups: null, fallback: s };
  h = !1;
}
function Ne(e) {
  for (; e !== null && (e.f & G) === 0; )
    e = e.next;
  return e;
}
function ci(e, t, n, r, i) {
  var l = t.length, a = e.items, o = Ne(e.effect.first), s, f = null, u = [], c = [], h, v, d, m;
  for (m = 0; m < l; m += 1) {
    if (h = t[m], v = i(h, m), d =                        
    a.get(v).e, e.outrogroups !== null)
      for (const x of e.outrogroups)
        x.pending.delete(d), x.done.delete(d);
    if ((d.f & R) !== 0 && rt(d), (d.f & Q) !== 0)
      if (d.f ^= Q, d === o)
        Ie(d, null, n);
      else {
        var w = f ? f.next : o;
        d === e.effect.last && (e.effect.last = d.prev), d.prev && (d.prev.next = d.next), d.next && (d.next.prev = d.prev), ne(e, f, d), ne(e, d, w), Ie(d, w, n), f = d, u = [], c = [], o = Ne(f.next);
        continue;
      }
    if (d !== o) {
      if (s !== void 0 && s.has(d)) {
        if (u.length < c.length) {
          var b = c[0], E;
          f = b.prev;
          var C = u[0], ee = u[u.length - 1];
          for (E = 0; E < u.length; E += 1)
            Ie(u[E], b, n);
          for (E = 0; E < c.length; E += 1)
            s.delete(c[E]);
          ne(e, C.prev, ee.next), ne(e, f, C), ne(e, ee, b), o = b, f = ee, m -= 1, u = [], c = [];
        } else
          s.delete(d), Ie(d, o, n), ne(e, d.prev, d.next), ne(e, d, f === null ? e.effect.first : f.next), ne(e, f, d), f = d;
        continue;
      }
      for (u = [], c = []; o !== null && o !== d; )
        (s ??=                 new Set()).add(o), c.push(o), o = Ne(o.next);
      if (o === null)
        continue;
    }
    (d.f & Q) === 0 && u.push(d), f = d, o = Ne(d.next);
  }
  if (e.outrogroups !== null) {
    for (const x of e.outrogroups)
      x.pending.size === 0 && (Et(e, lt(x.done)), e.outrogroups?.delete(x));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (o !== null || s !== void 0) {
    var y = [];
    if (s !== void 0)
      for (d of s)
        (d.f & R) === 0 && y.push(d);
    for (; o !== null; )
      (o.f & R) === 0 && o !== e.fallback && y.push(o), o = Ne(o.next);
    var Se = y.length;
    if (Se > 0) {
      var _e = null;
      oi(e, y, _e);
    }
  }
}
function ui(e, t, n, r, i, l, a, o) {
  var s = (a & er) !== 0 ? (a & nr) === 0 ?                 Sr(n, !1, !1) : he(n) : null, f = (a & tr) !== 0 ? he(i) : null;
  return {
    v: s,
    i: f,
    e: F(() => (l(t, s ?? n, f ?? i, o), () => {
      e.delete(r);
    }))
  };
}
function Ie(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, l = t && (t.f & Q) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var a = (
                                   
                        Ue(r)
      );
      if (l.before(r), r === i)
        return;
      r = a;
    }
}
function ne(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
const di =                 Symbol("is custom element"), hi =                 Symbol("is html");
function Ce(e, t, n, r) {
  var i = vi(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[Zn] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function vi(e) {
  return (
                                                    
                      
    e[an] ??= {
      [di]: e.nodeName.includes("-"),
      [hi]: e.namespaceURI === lr
    }
  );
}
var Kt =                 new Map();
function pi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Kt.get(t);
  if (n) return n;
  Kt.set(t, n =                 new Set());
  for (var r, i = e, l = Element.prototype; l !== i; ) {
    r = Bn(i);
    for (var a in r)
      r[a].set &&                                                                                     
      a !== "innerHTML" && a !== "textContent" && a !== "innerText" && n.add(a);
    i = tn(i);
  }
  return n;
}
const _i = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(_i);
var gi =                 Lt("<p> </p>"), mi =                 Lt('<div class="detail-line"><b> </b><span> </span></div>'), bi =                 Lt("<h4> </h4> <!>", 1);
function wi(e, t) {
  fn(t, !0);
  var n = bi(), r = Ht(n), i = Ve(r, !0), l = zt(r, 2);
  {
    var a = (s) => {
      var f = gi(), u = Ve(f, !0);
      ut(() => {
        Ce(f, "lang", t.header.emptyLang ?? void 0), Ye(u, t.header.empty);
      }), Ge(s, f);
    }, o = (s) => {
      var f = Qr(), u = Ht(f);
      fi(u, 17, () => t.header.lines, (c) => c.id, (c, h) => {
        var v = mi(), d = xr(v), m = Ve(d, !0), w = zt(d), b = Ve(w, !0);
        ut(() => {
          Ce(v, "data-hkia-header-field", t.header.locale === null ? void 0 : I(h).id), Ce(d, "lang", I(h).labelLang ?? void 0), Ye(m, I(h).label), Ce(w, "lang", I(h).valueLang ?? void 0), Ye(b, I(h).value);
        }), Ge(c, v);
      }), Ge(s, f);
    };
    si(l, (s) => {
      t.header.empty !== null ? s(a) : s(o, -1);
    });
  }
  ut(() => {
    Ce(r, "lang", t.header.titleLang ?? void 0), Ye(i, t.header.title);
  }), Ge(e, n), cn();
}
const yi = "一覧から実績を選択してください。";
function Ei(e) {
  return [
    { label: "GUID", value: e.guid },
    { label: "定義照合", value: e.mapped ? "照合済み" : "UNKNOWN（名称未照合）" },
    { label: "状態", value: e.kind === "slot-missing" ? "未保存（状態UNKNOWN）" : e.complete === !0 ? "達成済み" : e.complete === !1 ? "未達成" : "UNKNOWN" },
    { label: "進捗", value: e.current === null ? "UNKNOWN（保存値なし）" : e.current },
    { label: "達成日時", value: e.kind === "slot-missing" ? "UNKNOWN（保存値なし）" : e.completed === null ? "未設定" : e.completed === void 0 ? "UNKNOWN" : e.completed }
  ];
}
const Wt = Object.freeze({ de: "bd5bb8948e5e15e886c4f58421b00b41f0ec68a8ec627b023776ac1525507edb", en: "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", "en-GB": "af38facf8f7acbb982c9794909a1cc08edd5d94850795d69cd9ef23640e80c9f", es: "fb3061db5c00ef1c32d24af6b49246e53924dd90bd7984993c4a0774d037950d", fr: "1504c6d257bfb77003fecdd7acbc5cf114a8e51050a7521ab4ca42eeb2fc9737", "fr-CA": "17360cc5e61429400bdf4fa703121a54a0aeaf2368902609bc2e0d7dfa166038", it: "252954237409005d1fee26f96f604619380001917dccd93b133ead52a6549619", ja: "5729953617fdda2c39fef0499dc922a55c6b4a0d0bf134fa1a656cb3deb74851", ko: "df8800988f3c50fcee9a73e5c60093da4ef2737bb62cd841466ecae2e41874c7", nl: "a9c9f522c04c61a85e63d030a2407028e122a4c9cff95d57d7b1df6e1c7ae948", "pt-BR": "9befdaa8b85d09f623f75ed980af465afa88e7a07a163ec7f87f9aaf90974c13", ru: "08c523b001893cb1c1b3a510ac68a1874c1194ef7a0690f2aad1cd8f1c2d57cd", tr: "9e0a2f2ee46bb9f5c8eae28842e4ea53cc1000146d375250b132e450ee5530b5", "zh-Hans": "9a5b1098e6cf9a9f19a0dea90a48bda78ecd0ef95ade4c4ca54e4082237b0139", "zh-Hant": "9638729fca88ca34e47006eef3889b8b2491ddc0a79cf6588f155ad2de0633cc" }), Hn = Object.freeze(["nav.achievements", "nav.collections", "nav.workspace", "nav.tabs", "r2.preview", "ach.intro", "ach.count", "ach.empty", "col.intro", "col.count", "ach.search.label", "ach.search.placeholder", "ach.filter.label", "ach.filter.all", "ach.filter.complete", "ach.filter.incomplete", "ach.filter.missing", "ach.filter.unknownSource", "ach.image.label", "ach.image.all", "ach.image.exact", "ach.image.sourceNull", "ach.image.unknown", "ach.sort.label", "ach.sort.source", "ach.sort.name", "ach.sort.progressDesc", "ach.sort.progressAsc", "ach.sort.completedFirst", "col.search.label", "col.search.placeholder", "col.filter.label", "col.filter.all", "col.filter.hasRecord", "col.filter.noRecord", "col.filter.unknown", "col.sort.label", "col.sort.source", "col.sort.name", "col.sort.recordDesc", "locale.label", "locale.auto", "locale.loading", "locale.unverified", "file.open", "file.status", "file.backup", "file.export", "edit.preview", "edit.apply", "edit.undo", "edit.redo", "edit.reset", "edit.complete", "edit.revoke", "edit.collect", "edit.uncollect", "edit.progress", "edit.date", "edit.collectionDate", "edit.batch", "edit.selected", "state.unknown", "state.unverified", "state.unsupported", "state.notRecorded", "state.absentRef", "state.missingText", "state.writerOff", "state.previewOnly", "warning.linkage", "warning.history", "warning.reward", "error.file", "error.version", "error.stale", "error.integrity", "error.locale", "privacy.local", "credits.notice", "col.grid.empty", "col.image.label", "col.image.unverified", "col.image.unknown", "col.image.status", "col.grid.recorded", "col.grid.parentReference", "col.grid.unmatched", "r3.detail.preview", "r4.ach.preview", "r4.ach.selection", "r4.ach.unselected", "ach.row.unknownName", "ach.row.externalImageUnknown", "r4.ach.limit", "ach.list.more", "ach.row.image.label", "ach.row.image.unverified", "ach.row.image.status", "ach.row.status.missing", "ach.row.aria", "ach.row.subtitle.missing", "ach.row.subtitle.document", "ach.list.unreadable", "ach.list.noMatch", "ach.list.unloaded", "col.item.search.placeholder", "col.item.search.label", "col.item.history.label", "col.item.sort.label", "col.item.sort.internal", "col.item.sort.id", "col.item.inspect", "col.item.empty", "col.item.guid", "col.item.history.presence", "col.item.history.rawTicks", "col.item.history.calendar", "col.item.history.unknownHint", "col.item.previewHint", "col.item.list.caption", "ach.detail.heading", "ach.detail.empty", "ach.detail.missingHint", "ach.detail.definitionMatch", "ach.detail.matched", "ach.detail.unknownValue", "ach.detail.unset", "ach.linkage.heading", "ach.linkage.requiredConfirmed", "ach.linkage.requiredCandidate", "ach.linkage.related", "ach.linkage.unknown", "ach.linkage.hint", "ach.facts.heading", "ach.facts.definitionHeading", "ach.facts.builtinHint", "ach.facts.groupHint", "ach.facts.dlcHint", "ach.facts.groupNameHint", "ach.facts.counterUnknown", "ach.facts.counterAbsent", "ach.facts.counterNull", "ach.facts.rewardUnknown", "ach.facts.rewardNone", "ach.facts.childMissing", "ach.facts.childIncomplete", "ach.facts.groupProgress", "col.item.image.label", "col.definition.image.label", "col.item.image.unverified", "col.item.image.status", "col.item.history.recorded", "col.item.history.absent", "col.item.history.status", "col.item.ticks", "col.item.calendarUnknown", "col.item.parent", "col.item.parentCross", "col.item.history.rawUnknown", "ach.detail.unknownDefinition", "ach.linkage.count", "ach.linkage.unverifiedCount", "ach.linkage.systemCount", "ach.facts.internalKey", "ach.facts.membersHeading", "ach.facts.membersLabel", "ach.facts.definitionUnknown", "ach.facts.groupUnknown", "ach.facts.counterName", "ach.facts.threshold", "ach.facts.builtin", "ach.facts.counterGuid", "ach.facts.counterSaved", "ach.facts.counterDocument", "ach.facts.onlyUniques", "ach.facts.countedGuids", "ach.facts.countedValues", "ach.facts.rewardDefinition", "ach.facts.rewardReceipt", "ach.facts.rewardValue", "ach.facts.rewardZero", "ach.facts.groupName", "ach.facts.referenceCount", "ach.facts.savedCompletion", "ach.facts.groupCounter", "ach.facts.groupGuid", "ach.facts.definitionGuid", "ach.facts.groupAbsent", "ach.detail.statusLabel", "locale.previewScope", "locale.storageUnavailable"]), ki = Hn.length;
async function Ai(e, t, n) {
  if (typeof t != "string" || !Object.hasOwn(Wt, t) || !(e instanceof Uint8Array) || e.length === 0 || e.length > 65536) throw Error("EDITOR_CATALOG_CONTRACT");
  const r = Uint8Array.from(e), i = await n(r.slice());
  if (i !== Wt[t]) throw Error("EDITOR_CATALOG_SHA");
  const l = JSON.parse(new TextDecoder("utf-8", { fatal: !0 }).decode(r));
  if (!l || Object.getPrototypeOf(l) !== Object.prototype || Object.keys(l).length !== ki || !Hn.every((a) => Object.hasOwn(l, a) && typeof l[a] == "string" && l[a].trim())) throw Error("EDITOR_CATALOG_KEYS");
  return Object.freeze({ digest: i, catalog: Object.freeze(l) });
}
const zn =                 new WeakSet(), kt = (e, t) => Object.prototype.hasOwnProperty.call(e, t), S = (e) => {
  if (!e) throw Error("ACH_HEADER_LOCALE_CONTRACT");
}, me = (e) => typeof e == "string" && e.length > 0 && e.length <= 8192, Jt = ["ach.detail.heading", "ach.detail.empty", "ach.detail.definitionMatch", "ach.detail.matched", "ach.detail.unknownDefinition", "ach.detail.statusLabel", "ach.row.status.missing", "ach.filter.complete", "ach.filter.incomplete", "edit.progress", "edit.date", "ach.detail.unknownValue", "ach.detail.unset"];
async function xi(e, t, n) {
  const { catalog: r, digest: i } = await Ai(e, t, n), l = t;
  S(Jt.every((s) => kt(r, s) && me(r[s])));
  const a = Object.freeze(Object.fromEntries(Jt.map((s) => [s, r[s]]))), o = Object.freeze({ locale: l, sha256: i, strings: a });
  return zn.add(o), o;
}
const Ti = ["guid", "definitionMatch", "status", "progress", "completedTime"];
function Oi(e) {
  return e === null ? null : (S(!!e && me(e.guid) && me(e.title) && ["account", "slot", "slot-missing"].includes(e.kind) && typeof e.mapped == "boolean" && (e.complete === null || typeof e.complete == "boolean") && (e.current === null || me(e.current)) && (e.completed === null || e.completed === void 0 || me(e.completed)) && (e.documentId === null || me(e.documentId))), S(e.kind !== "slot" || e.documentId !== null), S(e.kind !== "slot-missing" || e.mapped && e.complete === null && e.current === null && e.completed === void 0 && e.documentId === null), Object.freeze({ guid: e.guid, title: e.title, kind: e.kind, mapped: e.mapped, complete: e.complete, current: e.current, completed: e.completed, documentId: e.documentId }));
}
function Ze(e) {
  S(!!e && kt(e, "record") && kt(e, "locale"));
  const t = Oi(e.record), n = e.locale;
  return n === null ? Object.freeze({ record: t, locale: null }) : (S(!!n && Number.isSafeInteger(n.epoch) && n.epoch >= 0 && zn.has(n.catalog)), Object.freeze({ record: t, locale: Object.freeze({ epoch: n.epoch, catalog: n.catalog }) }));
}
const it = (e) => e === null ? "null" : JSON.stringify([e.guid, e.title, e.kind, e.mapped, e.complete, e.current, e.completed === void 0 ? ["absent"] : ["present", e.completed], e.documentId]), Xt = (e, t) => it(e.record) === it(t.record) && (e.locale === null ? t.locale === null : t.locale !== null && e.locale.epoch === t.locale.epoch && e.locale.catalog === t.locale.catalog);
function Zt(e) {
  const { record: t, locale: n } = Ze(e), r = n?.catalog.locale ?? null, i = n?.catalog.strings, l = (f, u) => i?.[f] ?? u;
  if (t === null) return Object.freeze({ locale: r, title: l("ach.detail.heading", "達成記録の詳細"), titleLang: r, empty: l("ach.detail.empty", yi), emptyLang: r, lines: Object.freeze([]) });
  const a = Ei(t), o = [null, "ach.detail.definitionMatch", "ach.detail.statusLabel", "edit.progress", "edit.date"], s = [null, t.mapped ? "ach.detail.matched" : "ach.detail.unknownDefinition", t.kind === "slot-missing" ? "ach.row.status.missing" : t.complete === !0 ? "ach.filter.complete" : t.complete === !1 ? "ach.filter.incomplete" : null, t.current === null ? "ach.detail.unknownValue" : null, t.kind === "slot-missing" ? "ach.detail.unknownValue" : t.completed === null ? "ach.detail.unset" : null];
  return Object.freeze({ locale: r, title: t.title, titleLang: null, empty: null, emptyLang: null, lines: Object.freeze(Ti.map((f, u) => {
    const c = o[u], h = s[u];
    return Object.freeze({ id: f, label: c ? l(c, a[u].label) : a[u].label, value: h ? l(h, a[u].value) : a[u].value, labelLang: c ? r : null, valueLang: h ? r : null });
  })) });
}
const Si = "data-hkia-header-field", vt = (e, t) => e.length === t.length && e.every((n, r) => n === t[r]), At = (e, t, n) => t === "text" ? e.textContent : e.getAttribute(n), Qt = (e, t, n, r) => {
  t === "text" ? e.textContent = r : r === null ? e.removeAttribute(n) : e.setAttribute(n, r);
};
function xe(e, t, n) {
  S(e.length === (t.empty !== null ? 2 : 6) && e[0]?.tagName === "H4");
  const r = [], i = (a, o, s, f) => {
    r.push({ node: a, kind: o, name: s, before: At(a, o, s), after: f });
  }, l = (a, o, s, f) => {
    S(a.tagName === o && a.children.length === 0), i(a, "text", "", s), i(a, "attr", "lang", f);
  };
  return l(e[0], "H4", t.title, t.titleLang), t.empty !== null ? (l(e[1], "P", t.empty, t.emptyLang), r) : (t.lines.forEach((a, o) => {
    const s = e[o + 1];
    S(s.tagName === "DIV" && s.className === "detail-line" && s.children.length === 2), i(s, "attr", Si, n ? a.id : null), l(s.children[0], "B", a.label, a.labelLang), l(s.children[1], "SPAN", a.value, a.valueLang);
  }), r);
}
const We = (e) => e.every((t) => t.before === t.after);
function Ni(e, t) {
  const n =                 new WeakMap();
  let r = !1, i = null;
  const l = (a) => a.tagName === "ASIDE" && a.id === "editorPanel" && a.isConnected && e.querySelectorAll('[id="editorPanel"]').length === 1 && e.getElementById("editorPanel") === a;
  return Object.freeze({ render(a, o) {
    if (r || !l(a)) return "LEGACY_RETAINED";
    r = !0;
    let s;
    const f = [];
    let u = [];
    try {
      const c = Ze(o()), h = Zt(c), v = Zt({ record: c.record, locale: null }), d = Array.from(a.children), m = v.empty !== null ? 2 : 6;
      u = d.slice(0, m), S(u.length === m), c.locale && i && S(c.locale.epoch > i.epoch || c.locale.epoch === i.epoch && c.locale.catalog === i.catalog);
      const w = n.get(a);
      !!w && vt(w.nodes, u) && w ? (S(it(w.input.record) === it(c.record)), S(We(xe(u, w.projection, w.input.locale !== null)))) : S(We(xe(u, v, !1)));
      const E = xe(u, h, c.locale !== null), C = e.createElement("div");
      s = t(C, h), S(typeof s == "function"), S(We(xe(Array.from(C.children), h, c.locale !== null)));
      const ee = s;
      s = void 0, ee(), S(l(a) && vt(Array.from(a.children), d) && Xt(Ze(o()), c) && E.every((y) => At(y.node, y.kind, y.name) === y.before));
      for (const y of E)
        y.before !== y.after && (f.push(y), Qt(y.node, y.kind, y.name, y.after));
      return S(l(a) && vt(Array.from(a.children), d) && Xt(Ze(o()), c) && We(xe(u, h, c.locale !== null))), n.set(a, Object.freeze({ nodes: Object.freeze(u.slice()), input: c, projection: h })), c.locale ? i = c.locale : i && (i = Object.freeze({ epoch: i.epoch, catalog: null })), "APPLIED";
    } catch {
      for (const c of f.reverse())
        try {
          u.some((h) => h.parentElement === a && (h === c.node || h.contains(c.node))) && At(c.node, c.kind, c.name) === c.after && Qt(c.node, c.kind, c.name, c.before);
        } catch {
        }
      return "LEGACY_RETAINED";
    } finally {
      if (s) try {
        s();
      } catch {
      }
      r = !1;
    }
  } });
}
function Ri(e) {
  return Ni(e, (t, n) => {
    const r = ri(wi, { target: t, props: { header: n } }), i = () => {
      li(r).catch(() => {
      });
    };
    try {
      Tr();
    } catch (l) {
      throw i(), l;
    }
    return i;
  });
}
export {
  Ri as createProductAchievementHeaderR8,
  xi as verifyHeaderCatalog
};
