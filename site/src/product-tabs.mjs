var Vt = Array.isArray, Ln = Array.prototype.indexOf, ze = Array.prototype.includes, Ze = Array.from, qt = Object.defineProperty, Oe = Object.getOwnPropertyDescriptor, Fn = Object.getOwnPropertyDescriptors, Hn = Object.prototype, Yn = Array.prototype, Ut = Object.getPrototypeOf, At = Object.isExtensible;
const Vn = () => {
};
function qn(e) {
  for (var t = 0; t < e.length; t++)
    e[t]();
}
function jt() {
  var e, t, n = new Promise((r, i) => {
    e = r, t = i;
  });
  return { promise: n, resolve: e, reject: t };
}
const x = 2, Me = 4, Je = 8, Gt = 1 << 24, H = 16, j = 32, Q = 64, ft = 128, pt = 256, P = 512, A = 1024, S = 2048, q = 4096, C = 8192, D = 16384, Te = 32768, at = 1 << 25, Pe = 65536, We = 1 << 17, Un = 1 << 18, Ae = 1 << 19, jn = 1 << 20, J = 1 << 25, ue = 65536, $e = 1 << 21, me = 1 << 22, ne = 1 << 23, tt =                 Symbol("$state"), Bt =                 Symbol("component"), Gn =                 Symbol(""), zt =                 Symbol("attributes"), ot =                 Symbol("class"), Bn =                 Symbol("style"), ut =                 Symbol("text"), He = new class extends Error {
  name = "StaleReactionError";
  message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), zn = 1, Wn = 2, $n = 16, Kn = 2, E =                 Symbol("uninitialized"), Xn = "http://www.w3.org/1999/xhtml";
function Zn() {
  console.warn("https://svelte.dev/e/derived_inert");
}
function Jn() {
  console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
function Wt(e) {
  return e === this.v;
}
function Qn(e, t) {
  return e != e ? t == t : e !== t || e !== null && typeof e == "object" || typeof e == "function";
}
function $t(e) {
  return !Qn(e, this.v);
}
function er() {
  throw new Error("https://svelte.dev/e/async_derived_orphan");
}
function tr(e, t, n) {
  throw new Error("https://svelte.dev/e/each_key_duplicate");
}
function nr() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function rr() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ir() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function sr() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
function lr() {
  throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
let G = null;
function we(e) {
  G = e;
}
function Kt(e, t = !1, n) {
  G = {
    p: G,
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
function Xt(e) {
  var t = (
                                   
    G
  ), n = t.e;
  if (n !== null) {
    t.e = null;
    for (var r of n)
      Rr(r);
  }
  return t.i = !0, G = t.p, Zt(e);
}
function Zt(e = {}) {
  return qt(e, Bt, { value: !0 }), e;
}
function Jt() {
  return !0;
}
let le = [];
function Qt() {
  var e = le;
  le = [], qn(e);
}
function fe(e) {
  if (le.length === 0 && !Re) {
    var t = le;
    queueMicrotask(() => {
      t === le && Qt();
    });
  }
  le.push(e);
}
function fr() {
  for (; le.length > 0; )
    Qt();
}
const ar = -7169;
function w(e, t) {
  e.f = e.f & ar | t;
}
function gt(e) {
  (e.f & P) !== 0 || e.deps === null ? w(e, A) : w(e, q);
}
function en(e) {
  if (e !== null)
    for (const t of e)
      (t.f & x) === 0 || (t.f & ue) === 0 || (t.f ^= ue, en(
                              
        t.deps
      ));
}
function tn(e, t, n) {
  (e.f & S) !== 0 ? t.add(e) : (e.f & q) !== 0 && n.add(e), en(e.deps), w(e, A);
}
function Qe(e) {
  var t = p, n = g;
  L(null), X(null);
  try {
    return e();
  } finally {
    L(t), X(n);
  }
}
function or(e, t, n, r) {
  const i = mt;
  var s = e.filter((v) => !v.settled), a = t.map(i);
  if (n.length === 0 && s.length === 0) {
    r(a);
    return;
  }
  var l = (
                         
    g
  ), f = ur(), o = s.length === 1 ? s[0].promise : s.length > 1 ? Promise.all(s.map((v) => v.promise)) : null;
  function u(v) {
    if ((l.f & D) === 0) {
      f();
      try {
        r([...a, ...v]);
      } catch (c) {
        z(c, l);
      }
      Ke();
    }
  }
  var h = nn();
  if (n.length === 0) {
    o.then(() => u([])).finally(h);
    return;
  }
  function d() {
    Promise.all(n.map((v) =>                 cr(v))).then(u).catch((v) => z(v, l)).finally(h);
  }
  o ? o.then(() => {
    f(), d(), Ke();
  }) : d();
}
function ur() {
  var e = (
                         
    g
  ), t = p, n = G, r = (
                        
    _
  );
  return function(s = !0) {
    X(e), L(t), we(n), s && (e.f & D) === 0 && (r?.activate(), r?.apply());
  };
}
function Ke(e = !0) {
  X(null), L(null), we(null), e && _?.deactivate();
}
function nn() {
  var e = (
                         
    g
  ), t = e.b, n = (
                        
    _
  ), r = !!t?.is_rendered();
  return t?.update_pending_count(1, n), n.increment(r, e), () => {
    t?.update_pending_count(-1, n), n.decrement(r, e);
  };
}
                       
function mt(e) {
  var t = x | S;
  return g !== null && (g.f |= Ae), {
    ctx: G,
    deps: null,
    effects: null,
    equals: Wt,
    f: t,
    fn: e,
    reactions: null,
    rv: 0,
    v: (
                      
      E
    ),
    wv: 0,
    parent: g,
    ac: null
  };
}
const ke =                 Symbol("obsolete");
                       
function cr(e, t, n) {
  let r = (
                                
    g
  );
  r === null && er();
  var i = (
                             
                          
    void 0
  ), s = ce(
                    
    E
  ), a = !p, l =                 new Set();
  return Mr(() => {
    var f = (
                           
      g
    ), o = jt();
    i = o.promise;
    try {
      Promise.resolve(e()).then(o.resolve, (v) => {
        v !== He && o.reject(v);
      }).finally(Ke);
    } catch (v) {
      o.reject(v), Ke();
    }
    var u = (
                          
      _
    );
    if (a) {
      if ((f.f & Te) !== 0)
        var h = nn();
      if (
                                                                                                                         
        r.b?.is_rendered()
      )
        u.async_deriveds.get(f)?.reject(ke);
      else
        for (const v of l.values())
          v.reject(ke);
      l.add(o), u.async_deriveds.set(f, o);
    }
    const d = (v, c = void 0) => {
      h?.(), l.delete(o), c !== ke && (u.activate(), c ? (s.f |= ne, ye(s, c)) : ((s.f & ne) !== 0 && (s.f ^= ne), ye(s, v)), u.deactivate());
    };
    o.promise.then(d, (v) => d(null, v || "unknown"));
  }), Or(() => {
    for (const f of l)
      f.reject(ke);
  }), new Promise((f) => {
    function o(u) {
      function h() {
        u === i ? f(s) : o(i);
      }
      u.then(h, h);
    }
    o(i);
  });
}
                       
function hr(e) {
  const t =                 mt(e);
  return yn(t), t;
}
                       
function dr(e) {
  const t =                 mt(e);
  return t.equals = $t, t;
}
function vr(e) {
  var t = e.effects;
  if (t !== null) {
    e.effects = null;
    for (var n = 0; n < t.length; n += 1)
      U(
                             
        t[n]
      );
  }
}
function bt(e) {
  var t, n = g, r = e.parent;
  if (!he && r !== null && e.v !== E &&                                                                                                      
  (r.f & (D | C)) !== 0)
    return Zn(), e.v;
  X(r);
  try {
    e.f &= ~ue, vr(e), t = Sn(e);
  } finally {
    X(n);
  }
  return t;
}
function rn(e) {
  var t = bt(e);
  if (!e.equals(t) && (e.wv = Tn(), (!_?.is_fork || e.deps === null) && (_ !== null ? (_.capture(e, t, !0), ct?.capture(e, t, !0)) : e.v = t, e.deps === null))) {
    w(e, A);
    return;
  }
  he || (Y !== null ? (Et() || _?.is_fork) && Y.set(e, t) : gt(e));
}
function _r(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Qe(() => {
        t.ac.abort(He), t.ac = null;
      }), t.fn !== null && (t.teardown = Vn), Fe(t, 0), Tt(t));
}
function sn(e) {
  if (e.effects !== null)
    for (const t of e.effects)
      t.teardown && t.fn !== null && Ee(t);
}
let nt = null, _e = null, _ = null, ct = null, Y = null, ht = null, Re = !1, rt = !1, pe = null, je = null;
var St = 0;
let pr = 1;
class re {
  id = pr++;
                                              
  #l = !1;
  linked = !0;
                             
  #_ = null;
                             
  #r = null;
                                                              
  async_deriveds =                 new Map();
     
                                                                      
                                                                                                                            
                                                            
                                       
     
  current =                 new Map();
     
                                                                                                                       
                                                           
                            
     
  previous =                 new Map();
     
                                                                                         
                                                                                       
                                        
     
  #c =                 new Set();
     
                                                                                     
                                        
     
  #n =                 new Set();
     
                                                             
     
  #i = 0;
     
                                                                                
                                
     
  #e =                 new Map();
     
                                                                                
                                                                         
                                                                                                                 
     
  #s = null;
     
                                             
                     
     
  #t = [];
     
                                                 
                     
     
  #v = [];
     
                                                                               
                        
     
  #f =                 new Set();
     
                                          
                        
     
  #a =                 new Set();
     
                                                                              
                                                        
                                                                                     
                                                       
                                                      
     
  #u =                 new Map();
     
                                                                                                    
                        
     
  #p =                 new Set();
  is_fork = !1;
  #o = !1;
  constructor() {
    _e === null ? nt = _e = this : (_e.#r = this, this.#_ = _e), _e = this;
  }
  #b() {
    if (this.is_fork) return !0;
    for (const r of this.#e.keys()) {
      for (var t = r, n = !1; t.parent !== null; ) {
        if (this.#u.has(t)) {
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
    this.#u.has(t) || this.#u.set(t, { d: [], m: [] }), this.#p.delete(t);
  }
     
                                                                   
                                                
                           
                                          
     
  unskip_effect(t, n = (r) => this.schedule(r)) {
    var r = this.#u.get(t);
    if (r) {
      this.#u.delete(t);
      for (var i of r.d)
        w(i, S), n(i);
      for (i of r.m)
        w(i, q), n(i);
    }
    this.#p.add(t);
  }
  #g() {
    this.#l = !0, St++ > 1e3 && (this.#d(), mr());
    for (const f of this.#f)
      this.#a.delete(f), w(f, S), this.schedule(f);
    for (const f of this.#a)
      w(f, q), this.schedule(f);
    const t = this.#t;
    this.#t = [], this.apply();
    var n = pe = [], r = [], i = je = [];
    for (const f of t)
      try {
        this.#y(f, n, r);
      } catch (o) {
        throw an(f), this.#b() || this.discard(), o;
      }
    if (_ = null, i.length > 0) {
      var s = re.ensure();
      for (const f of i)
        s.schedule(f);
    }
    if (pe = null, je = null, this.#b()) {
      this.#h(r), this.#h(n);
      for (const [f, o] of this.#u)
        fn(f, o);
      i.length > 0 &&                       
      _.#g();
      return;
    }
    const a = this.#w();
    if (a) {
      this.#h(r), this.#h(n), a.#E(this);
      return;
    }
    this.#f.clear(), this.#a.clear();
    for (const f of this.#c) f(this);
    this.#c.clear(), ct = this, xt(r), xt(n), ct = null, this.#s?.resolve();
    var l = (
                                 
                            
      _
    );
    if (this.#i === 0 && (this.#t.length === 0 || l !== null) && this.#d(), this.#t.length > 0)
      if (l !== null) {
        const f = l;
        f.#t.push(...this.#t.filter((o) => !f.#t.includes(o)));
      } else
        l = this;
    l !== null && ($.clear(), l.#g());
  }
     
                                                            
                                            
                         
                              
                                     
     
  #y(t, n, r) {
    t.f ^= A;
    for (var i = t.first; i !== null; ) {
      var s = i.f, a = (s & (j | Q)) !== 0, l = a && (s & A) !== 0, f = l || (s & C) !== 0 || this.#u.has(i);
      if (!f && i.fn !== null) {
        a ? i.f ^= A : (s & Me) !== 0 ? n.push(i) : Ve(i) && ((s & H) !== 0 && this.#a.add(i), Ee(i));
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
  #w() {
    for (var t = this.#_; t !== null; ) {
      if (!t.is_fork) {
        for (const [n, [, r]] of this.current)
          if (t.current.has(n) && !r)
            return t;
      }
      t = t.#_;
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
    t.async_deriveds.clear(), this.transfer_effects(t.#f, t.#a);
    const n = (r) => {
      var i = r.reactions;
      if (i !== null && !((r.f & x) !== 0 && (r.f & (S | q)) === 0))
        for (const l of i) {
          var s = l.f;
          if ((s & x) !== 0)
            n(
                                    
              l
            );
          else {
            var a = (
                                   
              l
            );
            s & (me | H) && !this.async_deriveds.has(a) && (this.#a.delete(a), w(a, S), this.schedule(a));
          }
        }
    };
    for (const r of this.current.keys())
      n(r);
    this.oncommit(() => t.discard()), t.#d(), _ = this, this.#g();
  }
     
                              
     
  #h(t) {
    for (var n = 0; n < t.length; n += 1)
      tn(t[n], this.#f, this.#a);
  }
     
                                                          
                                                  
                          
                       
                                  
     
  capture(t, n, r = !1) {
    t.v !== E && !this.previous.has(t) && this.previous.set(t, t.v), (t.f & ne) === 0 && (this.current.set(t, [n, r]), Y?.set(t, n)), this.is_fork || (t.v = n);
  }
  activate() {
    _ = this;
  }
  deactivate() {
    _ = null, Y = null;
  }
  flush() {
    try {
      rt = !0, _ = this, this.#g();
    } finally {
      St = 0, ht = null, pe = null, je = null, rt = !1, _ = null, Y = null, $.clear();
    }
  }
  discard() {
    for (const t of this.#n) t(this);
    this.#n.clear();
    for (const t of this.async_deriveds.values())
      t.reject(ke);
    this.#d(), this.#s?.resolve();
  }
     
                           
     
  register_created_effect(t) {
    this.#v.push(t);
  }
  #m() {
    for (let h = nt; h !== null; h = h.#r) {
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
      if (!(!h.#l || i.length === 0)) {
        var s = i.filter((d) => !this.current.has(d));
        if (s.length === 0)
          t && h.discard();
        else if (n.length > 0) {
          if (t)
            for (const d of this.#p)
              h.unskip_effect(d, (v) => {
                (v.f & (H | me)) !== 0 ? h.schedule(v) : h.#h([v]);
              });
          h.activate();
          var a =                 new Set(), l =                 new Map();
          for (var f of n)
            ln(f, s, a, l);
          l =                 new Map();
          var o = [...h.current].filter(([d, v]) => {
            const c = this.current.get(d);
            return c ? c[0] !== v[0] || c[1] !== v[1] : !0;
          }).map(([d]) => d);
          if (o.length > 0)
            for (const d of this.#v)
              (d.f & (D | C | We)) === 0 && wt(d, o, l) && ((d.f & (me | H)) !== 0 ? (w(d, S), h.schedule(d)) : h.#f.add(d));
          if (h.#t.length > 0 && !h.#o) {
            h.apply();
            for (var u of h.#t)
              h.#y(u, [], []);
            h.#t = [];
          }
          h.deactivate();
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
    this.#o || (this.#o = !0, fe(() => {
      this.#o = !1, this.linked && this.flush();
    }));
  }
     
                                       
                                             
     
  transfer_effects(t, n) {
    for (const r of t)
      this.#f.add(r);
    for (const r of n)
      this.#a.add(r);
    t.clear(), n.clear();
  }
                                           
  oncommit(t) {
    this.#c.add(t);
  }
                                           
  ondiscard(t) {
    this.#n.add(t);
  }
  settled() {
    return (this.#s ??= jt()).promise;
  }
  static ensure() {
    if (_ === null) {
      const t = _ = new re();
      !rt && !Re && fe(() => {
        t.#l || t.flush();
      });
    }
    return _;
  }
  apply() {
    {
      Y = null;
      return;
    }
  }
     
    
                           
     
  schedule(t) {
    if (ht = t, t.b?.is_pending && (t.f & (Me | Je | Gt)) !== 0 && (t.f & Te) === 0) {
      t.b.defer_effect(t);
      return;
    }
    for (var n = t; n.parent !== null; ) {
      n = n.parent;
      var r = n.f;
      if (pe !== null && n === g && (p === null || (p.f & x) === 0))
        return;
      if ((r & (Q | j)) !== 0) {
        if ((r & A) === 0)
          return;
        n.f ^= A;
      }
    }
    this.#t.push(n);
  }
  #d() {
    if (this.linked) {
      var t = this.#_, n = this.#r;
      t === null ? nt = n : t.#r = n, n === null ? _e = t : n.#_ = t, this.linked = !1;
    }
  }
}
function gr(e) {
  var t = Re;
  Re = !0;
  try {
    for (var n; ; ) {
      if (fr(), _ === null)
        return (
                          
          n
        );
      _.flush();
    }
  } finally {
    Re = t;
  }
}
function mr() {
  try {
    nr();
  } catch (e) {
    z(e, ht);
  }
}
let Z = null;
function xt(e) {
  var t = e.length;
  if (t !== 0) {
    for (var n = 0; n < t; ) {
      var r = e[n++];
      if ((r.f & (D | C)) === 0 && Ve(r) && (Z =                 new Set(), Ee(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && pn(r), Z?.size > 0)) {
        $.clear();
        for (const i of Z) {
          if ((i.f & (D | C)) !== 0) continue;
          const s = [i];
          let a = i.parent;
          for (; a !== null; )
            Z.has(a) && (Z.delete(a), s.push(a)), a = a.parent;
          for (let l = s.length - 1; l >= 0; l--) {
            const f = s[l];
            (f.f & (D | C)) === 0 && Ee(f);
          }
        }
        Z.clear();
      }
    }
    Z = null;
  }
}
function ln(e, t, n, r) {
  if (!n.has(e) && (n.add(e), e.reactions !== null))
    for (const i of e.reactions) {
      const s = i.f;
      (s & x) !== 0 ? ln(
                              
        i,
        t,
        n,
        r
      ) : (s & (me | H)) !== 0 && (s & S) === 0 && wt(i, t, r) && (w(i, S), yt(
                             
        i
      ));
    }
}
function wt(e, t, n) {
  const r = n.get(e);
  if (r !== void 0) return r;
  if (e.deps !== null)
    for (const i of e.deps) {
      if (ze.call(t, i))
        return !0;
      if ((i.f & x) !== 0 && wt(
                              
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
function yt(e) {
  _.schedule(e);
}
function fn(e, t) {
  if (!((e.f & j) !== 0 && (e.f & A) !== 0)) {
    (e.f & S) !== 0 ? t.d.push(e) : (e.f & q) !== 0 && t.m.push(e), w(e, A);
    for (var n = e.first; n !== null; )
      fn(n, t), n = n.next;
  }
}
function an(e) {
  w(e, A);
  for (var t = e.first; t !== null; )
    an(t), t = t.next;
}
let Xe =                 new Set();
const $ =                 new Map();
let on = !1;
function ce(e, t) {
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
  const n = ce(e);
  return yn(n), n;
}
                       
function br(e, t = !1, n = !0) {
  const r = ce(e);
  return t || (r.equals = $t), r;
}
function se(e, t, n = !1) {
  p !== null &&                                                                                         
                                                                
  (!V || (p.f & We) !== 0) && Jt() && (p.f & (x | H | me | We)) !== 0 && (K === null || !K.has(e)) && sr();
  let r = n ? Ne(t) : t;
  return ye(e, r, je);
}
function ye(e, t, n = null) {
  if (!e.equals(t)) {
    he ? $.set(e, t) : $.has(e) || $.set(e, e.v);
    var r = re.ensure();
    if (r.capture(e, t), (e.f & x) !== 0) {
      const i = (
                              
        e
      );
      (e.f & S) !== 0 && bt(i), Y === null && gt(i);
    }
    e.wv = Tn(), un(e, S, n), g !== null && (g.f & A) !== 0 && (g.f & (j | Q)) === 0 && (M === null ? Yr([e]) : M.push(e)), !r.is_fork && Xe.size > 0 && !on && wr();
  }
  return t;
}
function wr() {
  on = !1;
  for (const e of Xe) {
    (e.f & A) !== 0 && w(e, q);
    let t;
    try {
      t = Ve(e);
    } catch {
      t = !0;
    }
    t && Ee(e);
  }
  Xe.clear();
}
function De(e) {
  se(e, e.v + 1);
}
function un(e, t, n) {
  var r = e.reactions;
  if (r !== null)
    for (var i = r.length, s = 0; s < i; s++) {
      var a = r[s], l = a.f, f = (l & S) === 0;
      if (f && w(a, t), (l & We) !== 0)
        Xe.add(
                               
          a
        );
      else if ((l & x) !== 0) {
        var o = (
                                
          a
        );
        Y?.delete(o), (l & ue) === 0 && (l & P && (g === null || (g.f & $e) === 0) && (a.f |= ue), un(o, q, n));
      } else if (f) {
        var u = (
                               
          a
        );
        (l & H) !== 0 && Z !== null && Z.add(u), n !== null ? n.push(u) : yt(u);
      }
    }
}
function Ne(e) {
  if (typeof e != "object" || e === null || tt in e || Bt in e)
    return e;
  const t = Ut(e);
  if (t !== Hn && t !== Yn)
    return e;
  var n =                 new Map(), r = Vt(e), i =                 ee(0), s = oe, a = (l) => {
    if (oe === s)
      return l();
    var f = p, o = oe;
    L(null), Ct(s);
    var u = l();
    return L(f), Ct(o), u;
  };
  return r && n.set("length",                 ee(
                        
    e.length
  )), new Proxy(
                      
    e,
    {
      defineProperty(l, f, o) {
        (!("value" in o) || o.configurable === !1 || o.enumerable === !1 || o.writable === !1) && rr();
        var u = n.get(f);
        return u === void 0 ? a(() => {
          var h =                 ee(o.value);
          return n.set(f, h), h;
        }) : se(u, o.value, !0), !0;
      },
      deleteProperty(l, f) {
        var o = n.get(f);
        if (o === void 0) {
          if (f in l) {
            const u = a(() =>                 ee(E));
            n.set(f, u), De(i);
          }
        } else
          se(o, E), De(i);
        return !0;
      },
      get(l, f, o) {
        if (f === tt)
          return e;
        var u = n.get(f), h = f in l;
        if (u === void 0 && (!h || Oe(l, f)?.writable) && (u = a(() => {
          var v = Ne(h ? l[f] : E), c =                 ee(v);
          return c;
        }), n.set(f, u)), u !== void 0) {
          var d = T(u);
          return d === E ? void 0 : d;
        }
        return Reflect.get(l, f, o);
      },
      getOwnPropertyDescriptor(l, f) {
        var o = Reflect.getOwnPropertyDescriptor(l, f);
        if (o && "value" in o) {
          var u = n.get(f);
          u && (o.value = T(u));
        } else if (o === void 0) {
          var h = n.get(f), d = h?.v;
          if (h !== void 0 && d !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: d,
              writable: !0
            };
        }
        return o;
      },
      has(l, f) {
        if (f === tt)
          return !0;
        var o = n.get(f), u = o !== void 0 && o.v !== E || Reflect.has(l, f);
        if (o !== void 0 || g !== null && (!u || Oe(l, f)?.writable)) {
          o === void 0 && (o = a(() => {
            var d = u ? Ne(l[f]) : E, v =                 ee(d);
            return v;
          }), n.set(f, o));
          var h = T(o);
          if (h === E)
            return !1;
        }
        return u;
      },
      set(l, f, o, u) {
        var h = n.get(f), d = f in l;
        if (r && f === "length")
          for (var v = o; v <                              
          h.v; v += 1) {
            var c = n.get(v + "");
            c !== void 0 ? se(c, E) : v in l && (c = a(() =>                 ee(E)), n.set(v + "", c));
          }
        if (h === void 0)
          (!d || Oe(l, f)?.writable) && (h = a(() =>                 ee(void 0)), se(h, Ne(o)), n.set(f, h));
        else {
          d = h.v !== E;
          var b = a(() => Ne(o));
          se(h, b);
        }
        var k = Reflect.getOwnPropertyDescriptor(l, f);
        if (k?.set && k.set.call(u, o), !d) {
          if (r && typeof f == "string") {
            var m = (
                                           
              n.get("length")
            ), y = Number(f);
            Number.isInteger(y) && y >= m.v && se(m, y + 1);
          }
          De(i);
        }
        return !0;
      },
      ownKeys(l) {
        T(i);
        var f = Reflect.ownKeys(l).filter((h) => {
          var d = n.get(h);
          return d === void 0 || d.v !== E;
        });
        for (var [o, u] of n)
          u.v !== E && !(o in l) && f.push(o);
        return f;
      },
      setPrototypeOf() {
        ir();
      }
    }
  );
}
var kt, cn, hn, dn;
function yr() {
  if (kt === void 0) {
    kt = window, cn = /Firefox/.test(navigator.userAgent);
    var e = Element.prototype, t = Node.prototype, n = Text.prototype;
    hn = Oe(t, "firstChild").get, dn = Oe(t, "nextSibling").get, At(e) && (e[ot] = void 0, e[zt] = null, e[Bn] = void 0, e.__e = void 0), At(n) && (n[ut] = void 0);
  }
}
function Le(e = "") {
  return document.createTextNode(e);
}
                       
function et(e) {
  return (
                                      
    hn.call(e)
  );
}
                       
function Ye(e) {
  return (
                                      
    dn.call(e)
  );
}
function Er(e, t) {
  return                 et(e);
}
function Tr(e, t = !1) {
  {
    var n =                 et(e);
    return n instanceof Comment && n.data === "" ?                 Ye(n) : n;
  }
}
function Ar(e, t = !1) {
  return                 et(e);
}
function Sr(e, t = 1, n = !1) {
  let r = e;
  for (; t--; )
    r =                            
                    Ye(r);
  return r;
}
function xr(e) {
  e.textContent = "";
}
function kr() {
  return !1;
}
function Nr(e, t, n) {
  return (
                                                                                             
    n ? document.createElement(e, { is: n }) : document.createElement(e)
  );
}
function Cr(e) {
  var t = g;
  if (t === null)
    return p.f |= ne, e;
  if ((t.f & Te) === 0 && (t.f & Me) === 0)
    throw e;
  z(e, t);
}
function z(e, t) {
  if (!(t !== null && (t.f & D) !== 0)) {
    for (; t !== null; ) {
      if ((t.f & ft) !== 0 && (t.f & (D | at)) === 0) {
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
function Ir(e, t) {
  var n = t.last;
  n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function ie(e, t) {
  var n = g;
  n !== null && (n.f & C) !== 0 && (e |= C);
  var r = {
    ctx: G,
    deps: null,
    nodes: null,
    f: e | S | P,
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
  _?.register_created_effect(r);
  var i = r;
  if ((e & Me) !== 0)
    pe !== null ? pe.push(r) : re.ensure().schedule(r);
  else if (t !== null) {
    try {
      Ee(r);
    } catch (a) {
      throw U(r), a;
    }
    i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last &&                                      
    (i.f & Ae) === 0 && (i = i.first, (e & H) !== 0 && (e & Pe) !== 0 && i !== null && (i.f |= Pe));
  }
  if (i !== null && (i.parent = n, n !== null && Ir(i, n), p !== null && (p.f & x) !== 0 && (e & Q) === 0)) {
    var s = (
                            
      p
    );
    (s.effects ??= []).push(i);
  }
  return r;
}
function Et() {
  return p !== null && !V;
}
function Or(e) {
  const t = ie(Je, null);
  return w(t, A), t.teardown = e, t;
}
function Rr(e) {
  return ie(Me | jn, e);
}
function Dr(e) {
  re.ensure();
  const t = ie(Q | Ae, e);
  return (n = {}) => new Promise((r) => {
    n.outro ? be(t, () => {
      U(t), r(void 0);
    }) : (U(t), r(void 0));
  });
}
function Mr(e) {
  return ie(me | Ae, e);
}
function Pr(e, t = 0) {
  return ie(Je | t, e);
}
function Lr(e, t = [], n = [], r = []) {
  or(r, t, n, (i) => {
    ie(Je, () => {
      e(...i.map(T));
    });
  });
}
function vn(e, t = 0) {
  var n = ie(H | t, e);
  return n;
}
function B(e) {
  return ie(j | Ae, e);
}
function _n(e) {
  var t = e.teardown;
  if (t !== null) {
    const n = he, r = p;
    Nt(!0), L(null);
    try {
      t.call(null);
    } catch (i) {
      z(i, e.parent);
    } finally {
      Nt(n), L(r);
    }
  }
}
function Tt(e, t = !1) {
  var n = e.first;
  for (e.first = e.last = null; n !== null; ) {
    const i = n.ac;
    i !== null && Qe(() => {
      i.abort(He);
    });
    var r = n.next;
    (n.f & Q) !== 0 ? n.parent = null : U(n, t), n = r;
  }
}
function Fr(e) {
  for (var t = e.first; t !== null; ) {
    var n = t.next;
    (t.f & j) === 0 && U(t), t = n;
  }
}
function U(e, t = !0) {
  var n = !1;
  (t || (e.f & Un) !== 0) && e.nodes !== null && e.nodes.end !== null && (Hr(
    e.nodes.start,
                               
    e.nodes.end
  ), n = !0), e.f |= at, Tt(e, t && !n), Fe(e, 0);
  var r = e.nodes && e.nodes.t;
  if (r !== null)
    for (const s of r)
      s.stop();
  _n(e), e.f ^= at, e.f |= D;
  var i = e.parent;
  i !== null && i.first !== null && pn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Hr(e, t) {
  for (; e !== null; ) {
    var n = e === t ? null :                 Ye(e);
    e.remove(), e = n;
  }
}
function pn(e) {
  var t = e.parent, n = e.prev, r = e.next;
  n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function be(e, t, n = !0) {
  var r = [];
  e.f |= pt, gn(e, r, !0);
  var i = () => {
    n && U(e), t && t();
  }, s = r.length;
  if (s > 0) {
    var a = () => --s || i();
    for (var l of r)
      l.out(a);
  } else
    i();
}
function gn(e, t, n) {
  if ((e.f & C) === 0) {
    e.f ^= C;
    var r = e.nodes && e.nodes.t;
    if (r !== null)
      for (const l of r)
        (l.is_global || n) && t.push(l);
    for (var i = e.first; i !== null; ) {
      var s = i.next;
      if ((i.f & Q) === 0) {
        var a = (i.f & Pe) !== 0 ||                                                             
                                                                     
                                                                         
        (i.f & j) !== 0 && (e.f & H) !== 0;
        gn(i, t, a ? n : !1);
      }
      i = s;
    }
  }
}
function mn(e) {
  e.f &= ~pt, bn(e, !0);
}
function bn(e, t) {
  if ((e.f & pt) === 0 && (e.f & C) !== 0) {
    e.f ^= C, (e.f & A) === 0 && (w(e, S), re.ensure().schedule(e));
    for (var n = e.first; n !== null; ) {
      var r = n.next, i = (n.f & Pe) !== 0 || (n.f & j) !== 0;
      bn(n, i ? t : !1), n = r;
    }
    var s = e.nodes && e.nodes.t;
    if (s !== null)
      for (const a of s)
        (a.is_global || t) && a.in();
  }
}
function wn(e, t) {
  if (e.nodes)
    for (var n = e.nodes.start, r = e.nodes.end; n !== null; ) {
      var i = n === r ? null :                 Ye(n);
      t.append(n), n = i;
    }
}
let Ge = !1, he = !1;
function Nt(e) {
  he = e;
}
let p = null, V = !1;
function L(e) {
  p = e;
}
let g = null;
function X(e) {
  g = e;
}
let K = null;
function yn(e) {
  p !== null && (K ??=                 new Set()).add(e);
}
let I = null, R = 0, M = null;
function Yr(e) {
  M = e;
}
let En = 1, ae = 0, oe = ae;
function Ct(e) {
  oe = e;
}
function Tn() {
  return ++En;
}
function Ve(e) {
  var t = e.f;
  if ((t & S) !== 0)
    return !0;
  if (t & x && (e.f &= ~ue), (t & q) !== 0) {
    for (var n = (
                            
      e.deps
    ), r = n.length, i = 0; i < r; i++) {
      var s = n[i];
      if (Ve(
                              
        s
      ) && rn(
                              
        s
      ), s.wv > e.wv)
        return !0;
    }
    (t & P) !== 0 &&                                                                   
                                                                
    Y === null && w(e, A);
  }
  return !1;
}
function An(e, t, n = !0) {
  var r = e.reactions;
  if (r !== null && !(K !== null && K.has(e)))
    for (var i = 0; i < r.length; i++) {
      var s = r[i];
      (s.f & x) !== 0 ? An(
                              
        s,
        t,
        !1
      ) : t === s && (n ? w(s, S) : (s.f & A) !== 0 && w(s, q), yt(
                             
        s
      ));
    }
}
function Sn(e) {
  var t = I, n = R, r = M, i = p, s = K, a = G, l = V, f = oe, o = e.f;
  I =                              
  null, R = 0, M = null, p = (o & (j | Q)) === 0 ? e : null, K = null, we(e.ctx), V = !1, oe = ++ae, e.ac !== null && (Qe(() => {
    e.ac.abort(He);
  }), e.ac = null);
  try {
    e.f |= $e;
    var u = (
                             
      e.fn
    ), h = u();
    e.f |= Te;
    var d = It(e);
    if (Jt() && M !== null && !V && d !== null && (e.f & (x | q | S)) === 0)
      for (var v = 0; v <                        
      M.length; v++)
        An(
          M[v],
                               
          e
        );
    if (i !== null && i !== e) {
      if (ae++, i.deps !== null)
        for (let c = 0; c < n; c += 1)
          i.deps[c].rv = ae;
      if (t !== null)
        for (const c of t)
          c.rv = ae;
      M !== null && (r === null ? r = M : r.push(...                       
      M));
    }
    return (e.f & ne) !== 0 && (e.f ^= ne), h;
  } catch (c) {
    return It(e), Cr(c);
  } finally {
    e.f ^= $e, I = t, R = n, M = r, p = i, K = s, we(a), V = l, oe = f;
  }
}
function It(e) {
  var t = e.deps, n = _?.is_fork;
  if (I !== null) {
    var r;
    if (n || Fe(e, R), t !== null && R > 0)
      for (t.length = R + I.length, r = 0; r < I.length; r++)
        t[R + r] = I[r];
    else
      e.deps = t = I;
    if (Et() && (e.f & P) !== 0)
      for (r = R; r < t.length; r++)
        (t[r].reactions ??= []).push(e);
  } else !n && t !== null && R < t.length && (Fe(e, R), t.length = R);
  return t;
}
function Vr(e, t) {
  let n = t.reactions;
  if (n !== null) {
    var r = Ln.call(n, e);
    if (r !== -1) {
      var i = n.length - 1;
      i === 0 ? n = t.reactions = null : (n[r] = n[i], n.pop());
    }
  }
  if (n === null && (t.f & x) !== 0 &&                                                                                             
                                                                                                
                                                                                          
  (I === null || !ze.call(I, t))) {
    var s = (
                            
      t
    );
    (s.f & P) !== 0 && (s.f ^= P, s.f &= ~ue), s.v !== E && gt(s), s.ac !== null && Qe(() => {
      s.ac.abort(He), s.ac = null, w(s, S);
    }), _r(s), Fe(s, 0);
  }
}
function Fe(e, t) {
  var n = e.deps;
  if (n !== null)
    for (var r = t; r < n.length; r++)
      Vr(e, n[r]);
}
function Ee(e) {
  var t = e.f;
  if ((t & D) === 0) {
    w(e, A);
    var n = g, r = Ge;
    g = e, Ge = (t & (j | Q)) === 0;
    try {
      (t & (H | Gt)) !== 0 ? Fr(e) : Tt(e), _n(e);
      var i = Sn(e);
      e.teardown = typeof i == "function" ? i : null, e.wv = En;
      var s;
    } finally {
      Ge = r, g = n;
    }
  }
}
function T(e) {
  var t = e.f, n = (t & x) !== 0;
  if (p !== null && !V) {
    var r = g !== null && (g.f & D) !== 0;
    if (!r && (K === null || !K.has(e))) {
      var i = p.deps;
      if ((p.f & $e) !== 0)
        e.rv < ae && (e.rv = ae, I === null && i !== null && i[R] === e ? R++ : I === null ? I = [e] : I.push(e));
      else {
        p.deps ??= [], ze.call(p.deps, e) || p.deps.push(e);
        var s = e.reactions;
        s === null ? e.reactions = [p] : ze.call(s, p) || s.push(p);
      }
    }
  }
  if (he && $.has(e))
    return $.get(e);
  if (n) {
    var a = (
                            
      e
    );
    if (he) {
      var l = a.v;
      return ((a.f & A) === 0 && a.reactions !== null || kn(a)) && (l = bt(a)), $.set(a, l), l;
    }
    var f = (a.f & P) === 0 && !V && p !== null && (Ge || (p.f & P) !== 0), o = (a.f & Te) === 0;
    Ve(a) && (f && (a.f |= P), rn(a)), f && !o && (sn(a), xn(a));
  }
  if (Y?.has(e))
    return Y.get(e);
  if ((e.f & ne) !== 0)
    throw e.v;
  return e.v;
}
function xn(e) {
  if (e.f |= P, e.deps !== null)
    for (const t of e.deps)
      (t.reactions ??= []).push(e), (t.f & x) !== 0 && (t.f & P) === 0 && (sn(
                              
        t
      ), xn(
                              
        t
      ));
}
function kn(e) {
  if (e.v === E) return !0;
  if (e.deps === null) return !1;
  for (const t of e.deps)
    if ($.has(t) || (t.f & x) !== 0 && kn(
                            
      t
    ))
      return !0;
  return !1;
}
function qr(e) {
  var t = V;
  try {
    return V = !0, e();
  } finally {
    V = t;
  }
}
const Ur = ["touchstart", "touchmove"];
function jr(e) {
  return Ur.includes(e);
}
const Ce =                 Symbol("events"), Nn =                 new Set(), dt =                 new Set();
function Ot(e, t, n) {
  (t[Ce] ??= {})[e] = n;
}
function Gr(e) {
  for (var t = 0; t < e.length; t++)
    Nn.add(e[t]);
  for (var n of dt)
    n(e);
}
let it = null, st = !1;
function Rt(e) {
  var t = this, n = (
                       
    t.ownerDocument
  ), r = e.type, i = e.composedPath?.() || [], s = (
                                 
    i[0] || e.target
  );
  it = e, st || (st = !0, setTimeout(() => {
    st = !1, it = null;
  }));
  var a = 0, l = it === e && e[Ce];
  if (l) {
    var f = i.indexOf(l);
    if (f !== -1 && (t === document || t ===                   
    window)) {
      e[Ce] = t;
      return;
    }
    var o = i.indexOf(t);
    if (o === -1)
      return;
    f <= o && (a = f);
  }
  if (s =                       
  i[a] || e.target, s !== t) {
    qt(e, "currentTarget", {
      configurable: !0,
      get() {
        return s || n;
      }
    });
    var u = p, h = g;
    L(null), X(null);
    try {
      for (var d, v = []; s !== null && s !== t; ) {
        try {
          var c = s[Ce]?.[r];
          c != null && (!                  
          s.disabled ||                                                                                           
                                                                                                     
          e.target === s) && c.call(s, e);
        } catch (b) {
          d ? v.push(b) : d = b;
        }
        if (e.cancelBubble) break;
        a++, s = a < i.length ? (
                                
          i[a]
        ) : null;
      }
      if (d) {
        for (let b of v)
          queueMicrotask(() => {
            throw b;
          });
        throw d;
      }
    } finally {
      e[Ce] = t, delete e.currentTarget, L(u), X(h);
    }
  }
}
const Br = (
                                                                                                             
  globalThis?.window?.trustedTypes &&                 globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", {
                               
    createHTML: (e) => e
  })
);
function zr(e) {
  return (
                         
    Br?.createHTML(e) ?? e
  );
}
function Wr(e) {
  var t = Nr("template");
  return t.innerHTML = zr(e.replaceAll("<!>", "<!---->")), t.content;
}
function Cn(e, t) {
  var n = (
                         
    g
  );
  n.nodes === null && (n.nodes = { start: e, end: t, a: null, t: null });
}
                       
function $r(e, t) {
  var n = (t & Kn) !== 0, r, i = !e.startsWith("<!>");
  return () => {
    r === void 0 && (r = Wr(i ? e : "<!>" + e), r =                            
                    et(r));
    var s = (
                                 
      n || cn ? document.importNode(r, !0) : r.cloneNode(!0)
    );
    return Cn(s, s), s;
  };
}
function Kr() {
  var e = document.createDocumentFragment(), t = document.createComment(""), n = Le();
  return e.append(t, n), Cn(t, n), e;
}
function Dt(e, t) {
  e !== null && e.before(
                       
    t
  );
}
function Xr(e) {
  let t = 0, n = ce(0), r;
  return () => {
    Et() && (T(n), Pr(() => (t === 0 && (r = qr(() => e(() => De(n)))), t += 1, () => {
      fe(() => {
        t -= 1, t === 0 && (r?.(), r = void 0, De(n));
      });
    })));
  };
}
var Zr = Pe | Ae;
function Jr(e, t, n, r) {
  new Qr(e, t, n, r);
}
class Qr {
                                
  parent;
  is_pending = !1;
     
                                                                                                           
                                                             
                                        
     
  transform_error;
                             
  #l;
                                    
  #_ = null;
                              
  #r;
                                         
  #c;
                       
  #n;
                              
  #i = null;
                              
  #e = null;
                              
  #s = null;
                                        
  #t = null;
  #v = 0;
  #f = 0;
  #a = !1;
                            
  #u =                 new Set();
                            
  #p =                 new Set();
     
                                                                          
                                                                     
                                                                       
                                    
                                  
     
  #o = null;
  #b = Xr(() => (this.#o = ce(this.#v), () => {
    this.#o = null;
  }));
     
                               
                                 
                                               
                                                                         
     
  constructor(t, n, r, i) {
    this.#l = t, this.#r = n, this.#c = (s) => {
      var a = (
                             
        g
      );
      a.b = this, a.f |= ft, r(s);
    }, this.parent =                      
    g.b, this.transform_error = i ?? this.parent?.transform_error ?? ((s) => s), this.#n = vn(() => {
      this.#h();
    }, Zr);
  }
  #g() {
    try {
      this.#i = B(() => this.#c(this.#l));
    } catch (t) {
      this.error(t);
    }
  }
     
                                                                                      
     
  #y(t) {
    const n = this.#r.failed, { reset: r, invoke_onerror: i } = this.#w(t);
    fe(i), n && (this.#s = B(() => {
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
        Jn();
        return;
      }
      n = !0, r && lr(), this.#s !== null && be(this.#s, () => {
        this.#s = null;
      }), this.#d(() => {
        this.#h();
      });
    };
    return { reset: i, invoke_onerror: () => {
      try {
        r = !0, this.#r.onerror?.(t, i), r = !1;
      } catch (a) {
        z(a, this.#n && this.#n.parent);
      }
    } };
  }
  #E() {
    const t = this.#r.pending;
    t && (this.is_pending = !0, this.#e = B(() => t(this.#l)), fe(() => {
      var n = this.#t = document.createDocumentFragment(), r = Le(), i = !1;
      if (n.append(r), this.#i = this.#d(() => {
        try {
          return B(() => this.#c(r));
        } catch (s) {
          try {
            this.error(s), i = !0;
          } catch (a) {
            z(a, this.#n.parent);
          }
          return null;
        }
      }), this.#i === null) {
        this.#t = null, i && this.#m(
                              
          _
        );
        return;
      }
      this.#f === 0 && (this.#l.before(n), this.#t = null, be(
                             
        this.#e,
        () => {
          this.#e = null;
        }
      ), this.#m(
                            
        _
      ));
    }));
  }
  #h() {
    try {
      if (this.is_pending = this.has_pending_snippet(), this.#f = 0, this.#v = 0, this.#i = B(() => {
        this.#c(this.#l);
      }), this.#f > 0) {
        var t = this.#t = document.createDocumentFragment();
        wn(this.#i, t);
        const n = (
                                               
          this.#r.pending
        );
        this.#e = B(() => n(this.#l));
      } else
        this.#m(
                              
          _
        );
    } catch (n) {
      this.error(n);
    }
  }
     
                         
     
  #m(t) {
    this.is_pending = !1, t.transfer_effects(this.#u, this.#p);
  }
     
                                                                          
                           
     
  defer_effect(t) {
    tn(t, this.#u, this.#p);
  }
     
                                                                                          
                       
     
  is_rendered() {
    return !this.is_pending && (!this.parent || this.parent.is_rendered());
  }
  has_pending_snippet() {
    return !!this.#r.pending;
  }
     
                
                        
     
  #d(t) {
    var n = g, r = p, i = G;
    X(this.#n), L(this.#n), we(this.#n.ctx);
    try {
      return re.ensure(), t();
    } finally {
      X(n), L(r), we(i);
    }
  }
     
                                                                                     
                                                                                
                      
                         
     
  #T(t, n) {
    if (!this.has_pending_snippet()) {
      this.parent && this.parent.#T(t, n);
      return;
    }
    this.#f += t, this.#f === 0 && (this.#m(n), this.#e && be(this.#e, () => {
      this.#e = null;
    }), this.#t && (this.#l.before(this.#t), this.#t = null));
  }
     
                                                                            
                                                                         
                                      
                      
                         
     
  update_pending_count(t, n) {
    this.#T(t, n), this.#v += t, !(!this.#o || this.#a) && (this.#a = !0, fe(() => {
      this.#a = !1, this.#o && ye(this.#o, this.#v);
    }));
  }
  get_effect_pending() {
    return this.#b(), T(
                                   
      this.#o
    );
  }
                               
  error(t) {
    if (!this.#r.onerror && !this.#r.failed)
      throw t;
    _?.is_fork ? (this.#i && _.skip_effect(this.#i), this.#e && _.skip_effect(this.#e), this.#s && _.skip_effect(this.#s), _.oncommit(() => {
      this.#A(t);
    })) : this.#A(t);
  }
     
                           
     
  #A(t) {
    this.#i && (U(this.#i), this.#i = null), this.#e && (U(this.#e), this.#e = null), this.#s && (U(this.#s), this.#s = null);
    let n = this.#r.failed;
    const r = (i) => {
      const { reset: s, invoke_onerror: a } = this.#w(i);
      a(), n && (this.#s = this.#d(() => {
        try {
          return B(() => {
            var l = (
                                   
              g
            );
            l.b = this, l.f |= ft, n(
              this.#l,
              () => i,
              () => s
            );
          });
        } catch (l) {
          return z(
            l,
                                 
            this.#n.parent
          ), null;
        }
      }));
    };
    fe(() => {
      var i;
      try {
        i = this.transform_error(t);
      } catch (s) {
        z(s, this.#n && this.#n.parent);
        return;
      }
      i !== null && typeof i == "object" && typeof                   
      i.then == "function" ? i.then(
        r,
                                 
        (s) => z(s, this.#n && this.#n.parent)
      ) : r(i);
    });
  }
}
function Mt(e, t) {
  var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
  n !==                   
  (e[ut] ??= e.nodeValue) && (e[ut] = n, e.nodeValue = `${n}`);
}
function ei(e, t) {
  return ti(e, t);
}
const qe =                 new Map();
function ti(e, { target: t, anchor: n, props: r = {}, events: i, context: s, intro: a = !0, transformError: l }) {
  yr();
  var f = void 0, o = Dr(() => {
    var u = n ?? t.appendChild(Le());
    Jr(
                                 
      u,
      {
        pending: () => {
        }
      },
      (v) => {
        Kt({});
        var c = (
                                         
          G
        );
        s && (c.c = s), i && (r.$$events = i), f = e(v, r) || Zt(), Xt();
      },
      l
    );
    var h =                 new Set(), d = (v) => {
      for (var c = 0; c < v.length; c++) {
        var b = v[c];
        if (!h.has(b)) {
          h.add(b);
          var k = jr(b);
          for (const O of [t, document]) {
            var m = qe.get(O);
            m === void 0 && (m =                 new Map(), qe.set(O, m));
            var y = m.get(b);
            y === void 0 ? (O.addEventListener(b, Rt, { passive: k }), m.set(b, 1)) : m.set(b, y + 1);
          }
        }
      }
    };
    return d(Ze(Nn)), dt.add(d), () => {
      for (var v of h)
        for (const k of [t, document]) {
          var c = (
                                              
            qe.get(k)
          ), b = (
                                 
            c.get(v)
          );
          --b == 0 ? (k.removeEventListener(v, Rt), c.delete(v), c.size === 0 && qe.delete(k)) : c.set(v, b);
        }
      dt.delete(d), u !== n && u.parentNode?.removeChild(u);
    };
  });
  return vt.set(f, o), f;
}
let vt =                 new WeakMap();
function ni(e, t) {
  const n = vt.get(e);
  return n ? (vt.delete(e), n(t)) : Promise.resolve();
}
function ri(e, t, n) {
  for (var r = [], i = t.length, s, a = t.length, l = 0; l < i; l++) {
    let h = t[l];
    be(
      h,
      () => {
        if (s) {
          if (s.pending.delete(h), s.done.add(h), s.pending.size === 0) {
            var d = (
                                                
              e.outrogroups
            );
            _t(e, Ze(s.done)), d.delete(s), d.size === 0 && (e.outrogroups = null);
          }
        } else
          a -= 1;
      },
      !1
    );
  }
  if (a === 0) {
    var f = r.length === 0 && n !== null && e.pending.size === 0;
    if (f) {
      var o = (
                              
        n
      ), u = (
                              
        o.parentNode
      );
      xr(u), u.append(o), e.items.clear();
    }
    _t(e, t, !f);
  } else
    s = {
      pending: new Set(t),
      done:                 new Set()
    }, (e.outrogroups ??=                 new Set()).add(s);
}
function _t(e, t, n = !0) {
  var r;
  if (e.pending.size > 0) {
    r =                 new Set();
    for (const a of e.pending.values())
      for (const l of a)
        r.add(
                                 
          e.items.get(l).e
        );
  }
  for (var i = 0; i < t.length; i++) {
    var s = t[i];
    if (r?.has(s)) {
      s.f |= J;
      const a = document.createDocumentFragment();
      wn(s, a);
    } else
      U(t[i], n);
  }
}
var Pt;
function ii(e, t, n, r, i, s = null) {
  var a = e, l =                 new Map(), f = null, o =                 dr(() => {
    var m = n();
    return (
                        
      Vt(m) ? m : m == null ? [] : Ze(m)
    );
  }), u, h =                 new Map(), d = !0;
  function v(m) {
    (k.effect.f & D) === 0 && (k.pending.delete(m), k.fallback = f, si(k, u, a, t, r), f !== null && (u.length === 0 ? (f.f & J) === 0 ? mn(f) : (f.f ^= J, Ie(f, null, a)) : be(f, () => {
      f = null;
    })));
  }
  function c(m) {
    k.pending.delete(m);
  }
  var b = vn(() => {
    u =                   
    T(o);
    for (var m = u.length, y =                 new Set(), O = (
                          
      _
    ), de = kr(), F = 0; F < m; F += 1) {
      var Se = u[F], ve = r(Se, F), N = d ? null : l.get(ve);
      N ? (N.v && ye(N.v, Se), N.i && ye(N.i, F), de && O.unskip_effect(N.e)) : (N = li(
        l,
        d ? a : Pt ??= Le(),
        Se,
        ve,
        F,
        i,
        t,
        n
      ), d || (N.e.f |= J), l.set(ve, N)), y.add(ve);
    }
    if (m === 0 && s && !f && (d ? f = B(() => s(a)) : (f = B(() => s(Pt ??= Le())), f.f |= J)), m > y.size && tr(), !d)
      if (h.set(O, y), de) {
        for (const [Mn, Pn] of l)
          y.has(Mn) || O.skip_effect(Pn.e);
        O.oncommit(v), O.ondiscard(c);
      } else
        v(O);
    T(o);
  }), k = { effect: b, items: l, pending: h, outrogroups: null, fallback: f };
  d = !1;
}
function xe(e) {
  for (; e !== null && (e.f & j) === 0; )
    e = e.next;
  return e;
}
function si(e, t, n, r, i) {
  var s = t.length, a = e.items, l = xe(e.effect.first), f, o = null, u = [], h = [], d, v, c, b;
  for (b = 0; b < s; b += 1) {
    if (d = t[b], v = i(d, b), c =                        
    a.get(v).e, e.outrogroups !== null)
      for (const N of e.outrogroups)
        N.pending.delete(c), N.done.delete(c);
    if ((c.f & C) !== 0 && mn(c), (c.f & J) !== 0)
      if (c.f ^= J, c === l)
        Ie(c, null, n);
      else {
        var k = o ? o.next : l;
        c === e.effect.last && (e.effect.last = c.prev), c.prev && (c.prev.next = c.next), c.next && (c.next.prev = c.prev), te(e, o, c), te(e, c, k), Ie(c, k, n), o = c, u = [], h = [], l = xe(o.next);
        continue;
      }
    if (c !== l) {
      if (f !== void 0 && f.has(c)) {
        if (u.length < h.length) {
          var m = h[0], y;
          o = m.prev;
          var O = u[0], de = u[u.length - 1];
          for (y = 0; y < u.length; y += 1)
            Ie(u[y], m, n);
          for (y = 0; y < h.length; y += 1)
            f.delete(h[y]);
          te(e, O.prev, de.next), te(e, o, O), te(e, de, m), l = m, o = de, b -= 1, u = [], h = [];
        } else
          f.delete(c), Ie(c, l, n), te(e, c.prev, c.next), te(e, c, o === null ? e.effect.first : o.next), te(e, o, c), o = c;
        continue;
      }
      for (u = [], h = []; l !== null && l !== c; )
        (f ??=                 new Set()).add(l), h.push(l), l = xe(l.next);
      if (l === null)
        continue;
    }
    (c.f & J) === 0 && u.push(c), o = c, l = xe(c.next);
  }
  if (e.outrogroups !== null) {
    for (const N of e.outrogroups)
      N.pending.size === 0 && (_t(e, Ze(N.done)), e.outrogroups?.delete(N));
    e.outrogroups.size === 0 && (e.outrogroups = null);
  }
  if (l !== null || f !== void 0) {
    var F = [];
    if (f !== void 0)
      for (c of f)
        (c.f & C) === 0 && F.push(c);
    for (; l !== null; )
      (l.f & C) === 0 && l !== e.fallback && F.push(l), l = xe(l.next);
    var Se = F.length;
    if (Se > 0) {
      var ve = null;
      ri(e, F, ve);
    }
  }
}
function li(e, t, n, r, i, s, a, l) {
  var f = (a & zn) !== 0 ? (a & $n) === 0 ?                 br(n, !1, !1) : ce(n) : null, o = (a & Wn) !== 0 ? ce(i) : null;
  return {
    v: f,
    i: o,
    e: B(() => (s(t, f ?? n, o ?? i, l), () => {
      e.delete(r);
    }))
  };
}
function Ie(e, t, n) {
  if (e.nodes)
    for (var r = e.nodes.start, i = e.nodes.end, s = t && (t.f & J) === 0 ? (
                                
      t.nodes.start
    ) : n; r !== null; ) {
      var a = (
                                   
                        Ye(r)
      );
      if (s.before(r), r === i)
        return;
      r = a;
    }
}
function te(e, t, n) {
  t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function In(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = In(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function fi() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = In(e)) && (r && (r += " "), r += t);
  return r;
}
function ai(e) {
  return typeof e == "object" ? fi(e) : e ?? "";
}
function oi(e, t, n) {
  var r = e == null ? "" : "" + e;
  return r === "" ? null : r;
}
function ui(e, t, n, r, i, s) {
  var a = (
                      
    e[ot]
  );
  if (a !== n || a === void 0) {
    var l = oi(n);
    l == null ? e.removeAttribute("class") : e.className = l, e[ot] = n;
  }
  return s;
}
const ci =                 Symbol("is custom element"), hi =                 Symbol("is html");
function Ue(e, t, n, r) {
  var i = di(e);
  i[t] !== (i[t] = n) && (t === "loading" && (e[Gn] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && vi(e).has(t) ? e[t] = n : e.setAttribute(t, n));
}
function di(e) {
  return (
                                                    
                      
    e[zt] ??= {
      [ci]: e.nodeName.includes("-"),
      [hi]: e.namespaceURI === Xn
    }
  );
}
var Lt =                 new Map();
function vi(e) {
  var t = e.getAttribute("is") || e.nodeName, n = Lt.get(t);
  if (n) return n;
  Lt.set(t, n =                 new Set());
  for (var r, i = e, s = Element.prototype; s !== i; ) {
    r = Fn(i);
    for (var a in r)
      r[a].set &&                                                                                     
      a !== "innerHTML" && a !== "textContent" && a !== "innerText" && n.add(a);
    i = Ut(i);
  }
  return n;
}
const _i = "5";
typeof window < "u" && ((window.__svelte ??= {}).v ??=                 new Set()).add(_i);
const On = [
  { id: "achTab", panel: "achPanel", value: "achievements", icon: "🏅", label: "アチーブメント" },
  { id: "colTab", panel: "colPanel", value: "collections", icon: "✿", label: "コレクション" }
];
function pi(e, t) {
  return t === "Home" ? "achievements" : t === "End" ? "collections" : t === "ArrowLeft" || t === "ArrowRight" ? e === "achievements" ? "collections" : "achievements" : null;
}
function Rn(e, t) {
  const n = e === t;
  return { selected: n, tabIndex: n ? 0 : -1, hidden: !n, activeClass: n ? "primary-tab active" : "primary-tab" };
}
function Ft(e, t) {
  e.selectTab(t);
}
var gi =                 $r('<button role="tab" type="button"> <span> </span></button>');
function mi(e, t) {
  Kt(t, !0);
  function n(s, a) {
    const l = pi(a, s.key);
    if (l === null) return;
    s.preventDefault();
    const f = s.currentTarget.parentElement;
    Ft(t.port, l), f?.querySelector(l === "achievements" ? "#achTab" : "#colTab")?.focus();
  }
  var r = Kr(), i = Tr(r);
  ii(i, 17, () => On, (s) => s.value, (s, a) => {
    const l =                 hr(() => Rn(t.initialTab, T(a).value));
    var f = gi(), o = Er(f), u = Sr(o), h = Ar(u, !0);
    Lr(() => {
      Ue(f, "id", T(a).id), Ue(f, "aria-controls", T(a).panel), Ue(f, "aria-selected", T(l).selected), ui(f, 1, ai(T(l).activeClass)), Ue(f, "tabindex", T(l).tabIndex), Mt(o, `${T(a).icon ?? ""} `), Mt(h, T(a).label);
    }), Ot("click", f, () => Ft(t.port, T(a).value)), Ot("keydown", f, (d) => n(d, T(a).value)), Dt(s, f);
  }), Dt(e, r), Xt();
}
Gr(["click", "keydown"]);
function Be(e) {
  const t = e.achievementSelected === "true" && e.collectionSelected === "false" && e.achievementTabIndex === 0 && e.collectionTabIndex === -1 && e.achievementHidden === !1 && e.collectionHidden === !0, n = e.achievementSelected === "false" && e.collectionSelected === "true" && e.achievementTabIndex === -1 && e.collectionTabIndex === 0 && e.achievementHidden === !0 && e.collectionHidden === !1;
  if (t) return "achievements";
  if (n) return "collections";
  throw new Error("LEGACY_NAVIGATION_INCOHERENT");
}
function bi(e) {
  return {
    get activeTab() {
      return Be(e.read());
    },
    selectTab(t) {
      if (t !== "achievements" && t !== "collections") throw new Error("LEGACY_NAVIGATION_INVALID_TARGET");
      Be(e.read());
      try {
        if (e.setTab(t), Be(e.read()) !== t) throw new Error("LEGACY_NAVIGATION_POSTCONDITION");
      } finally {
        e.invalidate?.();
      }
    }
  };
}
const Ht = "data-hkia-svelte-tabs", lt =                 new WeakMap(), W = (e) => {
  if (!e) throw Error("PRODUCT_TAB_DOM_CONTRACT");
};
function ge(e, t) {
  const n = e.querySelectorAll(`[id="${t}"]`);
  return W(n.length === 1), n[0];
}
function Dn(e, t) {
  W(e.tagName === "DIV" && e.classList.contains("primary-tabs") && e.getAttribute("role") === "tablist" && e.getAttribute("aria-label") === "表示する機能" && e.children.length === 2);
  for (const [n, r] of On.entries()) {
    const i = e.children[n], s = Rn(t, r.value);
    W(i.tagName === "BUTTON" && i.id === r.id && i.type === "button" && i.getAttribute("role") === "tab" && i.getAttribute("aria-controls") === r.panel && i.getAttribute("aria-selected") === String(s.selected) && i.tabIndex === s.tabIndex && i.className === s.activeClass && i.children.length === 1 && i.children[0].tagName === "SPAN" && i.children[0].textContent === r.label && i.textContent?.trim() === `${r.icon} ${r.label}`);
  }
}
function wi(e, t, n, r) {
  return { achievementSelected: e.getAttribute("aria-selected"), collectionSelected: t.getAttribute("aria-selected"), achievementTabIndex: e.tabIndex, collectionTabIndex: t.tabIndex, achievementHidden: n.hidden, collectionHidden: r.hidden };
}
function Yt(e) {
  const t = ge(e, "achTab"), n = ge(e, "colTab"), r = ge(e, "achPanel"), i = ge(e, "colPanel"), s = t.parentElement;
  W(s && n.parentElement === s && s.parentElement && s.parentElement.classList.contains("workspace") && r.parentElement === s.parentElement && i.parentElement === s.parentElement), W(r.getAttribute("role") === "tabpanel" && i.getAttribute("role") === "tabpanel" && r.getAttribute("aria-labelledby") === "achTab" && i.getAttribute("aria-labelledby") === "colTab");
  const a = wi(t, n, r, i), l = Be(a);
  return Dn(s, l), { a: t, c: n, ap: r, cp: i, host: s, state: a, active: l };
}
function yi(e, t, n) {
  let r;
  try {
    r = Yt(e);
  } catch {
    return "LEGACY_RETAINED";
  }
  if (lt.has(e)) return lt.get(e) === r.host ? "ALREADY_MOUNTED" : "LEGACY_RETAINED";
  if (r.host.hasAttribute(Ht)) return "LEGACY_RETAINED";
  const i = r.host.cloneNode(!1);
  i.setAttribute(Ht, "1");
  const s = e.activeElement === r.a ? "achTab" : e.activeElement === r.c ? "colTab" : null;
  let a = !1, l;
  const f = () => {
    const u = Yt(e);
    return W(u.host === (a ? i : r.host) && u.ap === r.ap && u.cp === r.cp), u;
  }, o = bi({ read: () => f().state, setTab(u) {
    W(a), t(u);
  } });
  try {
    l = n(i, r.active, o), W(typeof l == "function"), Dn(i, r.active);
    const u = f();
    return W(u.a === r.a && u.c === r.c && u.active === r.active), r.host.replaceWith(i), a = !0, W(f().active === r.active), s && ge(e, s).focus(), lt.set(e, i), "MOUNTED";
  } catch {
    a && (a = !1, i.replaceWith(r.host), s && ge(e, s).focus());
    try {
      l?.();
    } catch {
    }
    return "LEGACY_RETAINED";
  }
}
function Ti(e, t) {
  return yi(e, t, (n, r, i) => {
    const s = ei(mi, { target: n, props: { initialTab: r, port: i } }), a = () => {
      ni(s).catch(() => {
      });
    };
    try {
      gr();
    } catch (l) {
      throw a(), l;
    }
    return a;
  });
}
export {
  Ti as mountProductTabs
};
