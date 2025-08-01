/** vim: et:ts=4:sw=4:sts=4
 * @license RequireJS 2.3.7 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, https://github.com/requirejs/requirejs/blob/master/LICENSE
 */
var requirejs, require, define;
!(function (global, setTimeout) {
  var req,
    s,
    head,
    baseElement,
    dataMain,
    src,
    interactiveScript,
    currentlyAddingScript,
    mainScript,
    subPath,
    version = "2.3.7",
    commentRegExp = /\/\*[\s\S]*?\*\/|([^:"'=]|^)\/\/.*$/gm,
    cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
    jsSuffixRegExp = /\.js$/,
    currDirRegExp = /^\.\//,
    op = Object.prototype,
    ostring = op.toString,
    hasOwn = op.hasOwnProperty,
    isBrowser = !(
      "undefined" == typeof window ||
      "undefined" == typeof navigator ||
      !window.document
    ),
    isWebWorker = !isBrowser && "undefined" != typeof importScripts,
    readyRegExp =
      isBrowser && "PLAYSTATION 3" === navigator.platform
        ? /^complete$/
        : /^(complete|loaded)$/,
    defContextName = "_",
    isOpera =
      "undefined" != typeof opera && "[object Opera]" === opera.toString(),
    contexts = {},
    cfg = {},
    globalDefQueue = [],
    useInteractive = !1,
    disallowedProps = ["__proto__", "constructor"];
  function commentReplace(e, t) {
    return t || "";
  }
  function isFunction(e) {
    return "[object Function]" === ostring.call(e);
  }
  function isArray(e) {
    return "[object Array]" === ostring.call(e);
  }
  function each(e, t) {
    if (e) for (var i = 0; i < e.length && (!e[i] || !t(e[i], i, e)); i += 1);
  }
  function eachReverse(e, t) {
    if (e) for (var i = e.length - 1; -1 < i && (!e[i] || !t(e[i], i, e)); --i);
  }
  function hasProp(e, t) {
    return hasOwn.call(e, t);
  }
  function getOwn(e, t) {
    return hasProp(e, t) && e[t];
  }
  function eachProp(e, t) {
    for (var i in e)
      if (hasProp(e, i) && -1 == disallowedProps.indexOf(i) && t(e[i], i))
        break;
  }
  function mixin(i, e, r, n) {
    e &&
      eachProp(e, function (e, t) {
        (!r && hasProp(i, t)) ||
          (!n ||
          "object" != typeof e ||
          !e ||
          isArray(e) ||
          isFunction(e) ||
          e instanceof RegExp
            ? (i[t] = e)
            : (i[t] || (i[t] = {}), mixin(i[t], e, r, n)));
      });
  }
  function bind(e, t) {
    return function () {
      return t.apply(e, arguments);
    };
  }
  function scripts() {
    return document.getElementsByTagName("script");
  }
  function defaultOnError(e) {
    throw e;
  }
  function getGlobal(e) {
    var t;
    return (
      e &&
      ((t = global),
      each(e.split("."), function (e) {
        t = t[e];
      }),
      t)
    );
  }
  function makeError(e, t, i, r) {
    t = new Error(t + "\nhttps://requirejs.org/docs/errors.html#" + e);
    return (
      (t.requireType = e),
      (t.requireModules = r),
      i && (t.originalError = i),
      t
    );
  }
  if (void 0 === define) {
    if (void 0 !== requirejs) {
      if (isFunction(requirejs)) return;
      ((cfg = requirejs), (requirejs = void 0));
    }
    (void 0 === require ||
      isFunction(require) ||
      ((cfg = require), (require = void 0)),
      (req = requirejs =
        function (e, t, i, r) {
          var n,
            o = defContextName;
          return (
            isArray(e) ||
              "string" == typeof e ||
              ((n = e), isArray(t) ? ((e = t), (t = i), (i = r)) : (e = [])),
            n && n.context && (o = n.context),
            (r =
              (r = getOwn(contexts, o)) || (contexts[o] = req.s.newContext(o))),
            n && r.configure(n),
            r.require(e, t, i)
          );
        }),
      (req.config = function (e) {
        return req(e);
      }),
      (req.nextTick =
        void 0 !== setTimeout
          ? function (e) {
              setTimeout(e, 4);
            }
          : function (e) {
              e();
            }),
      (require = require || req),
      (req.version = version),
      (req.jsExtRegExp = /^\/|:|\?|\.js$/),
      (req.isBrowser = isBrowser),
      (s = req.s = { contexts: contexts, newContext: newContext }),
      req({}),
      each(["toUrl", "undef", "defined", "specified"], function (t) {
        req[t] = function () {
          var e = contexts[defContextName];
          return e.require[t].apply(e, arguments);
        };
      }),
      isBrowser &&
        ((head = s.head = document.getElementsByTagName("head")[0]),
        (baseElement = document.getElementsByTagName("base")[0]),
        baseElement) &&
        (head = s.head = baseElement.parentNode),
      (req.onError = defaultOnError),
      (req.createNode = function (e, t, i) {
        var r = e.xhtml
          ? document.createElementNS(
              "http://www.w3.org/1999/xhtml",
              "html:script",
            )
          : document.createElement("script");
        return (
          (r.type = e.scriptType || "text/javascript"),
          (r.charset = "utf-8"),
          (r.async = !0),
          r
        );
      }),
      (req.load = function (t, i, r) {
        var e,
          n = (t && t.config) || {};
        if (isBrowser)
          return (
            (e = req.createNode(n, i, r)).setAttribute(
              "data-requirecontext",
              t.contextName,
            ),
            e.setAttribute("data-requiremodule", i),
            !e.attachEvent ||
            (e.attachEvent.toString &&
              e.attachEvent.toString().indexOf("[native code") < 0) ||
            isOpera
              ? (e.addEventListener("load", t.onScriptLoad, !1),
                e.addEventListener("error", t.onScriptError, !1))
              : ((useInteractive = !0),
                e.attachEvent("onreadystatechange", t.onScriptLoad)),
            (e.src = r),
            n.onNodeCreated && n.onNodeCreated(e, n, i, r),
            (currentlyAddingScript = e),
            baseElement
              ? head.insertBefore(e, baseElement)
              : head.appendChild(e),
            (currentlyAddingScript = null),
            e
          );
        if (isWebWorker)
          try {
            (setTimeout(function () {}, 0),
              importScripts(r),
              t.completeLoad(i));
          } catch (e) {
            t.onError(
              makeError(
                "importscripts",
                "importScripts failed for " + i + " at " + r,
                e,
                [i],
              ),
            );
          }
      }),
      isBrowser &&
        !cfg.skipDataMain &&
        eachReverse(scripts(), function (e) {
          if (
            ((head = head || e.parentNode),
            (dataMain = e.getAttribute("data-main")))
          )
            return (
              (mainScript = dataMain),
              cfg.baseUrl ||
                -1 !== mainScript.indexOf("!") ||
                ((mainScript = (src = mainScript.split("/")).pop()),
                (subPath = src.length ? src.join("/") + "/" : "./"),
                (cfg.baseUrl = subPath)),
              (mainScript = mainScript.replace(jsSuffixRegExp, "")),
              req.jsExtRegExp.test(mainScript) && (mainScript = dataMain),
              (cfg.deps = cfg.deps
                ? cfg.deps.concat(mainScript)
                : [mainScript]),
              !0
            );
        }),
      (define = function (e, i, t) {
        var r, n;
        ("string" != typeof e && ((t = i), (i = e), (e = null)),
          isArray(i) || ((t = i), (i = null)),
          !i &&
            isFunction(t) &&
            ((i = []), t.length) &&
            (t
              .toString()
              .replace(commentRegExp, commentReplace)
              .replace(cjsRequireRegExp, function (e, t) {
                i.push(t);
              }),
            (i = (
              1 === t.length ? ["require"] : ["require", "exports", "module"]
            ).concat(i))),
          useInteractive &&
            (r = currentlyAddingScript || getInteractiveScript()) &&
            ((e = e || r.getAttribute("data-requiremodule")),
            (n = contexts[r.getAttribute("data-requirecontext")])),
          n
            ? (n.defQueue.push([e, i, t]), (n.defQueueMap[e] = !0))
            : globalDefQueue.push([e, i, t]));
      }),
      (define.amd = { jQuery: !0 }),
      (req.exec = function (text) {
        return eval(text);
      }),
      req(cfg));
  }
  function newContext(u) {
    var t,
      e,
      f,
      c,
      i,
      b = {
        waitSeconds: 7,
        baseUrl: "./",
        paths: {},
        bundles: {},
        pkgs: {},
        shim: {},
        config: {},
      },
      d = {},
      p = {},
      r = {},
      l = [],
      h = {},
      n = {},
      m = {},
      g = 1,
      x = 1;
    function v(e, t, i) {
      var r,
        n,
        o,
        a,
        s,
        u,
        c,
        d,
        p,
        f = t && t.split("/"),
        l = b.map,
        h = l && l["*"];
      if (e) {
        ((t = (e = e.split("/")).length - 1),
          b.nodeIdCompat &&
            jsSuffixRegExp.test(e[t]) &&
            (e[t] = e[t].replace(jsSuffixRegExp, "")));
        for (
          var m,
            g = (e =
              "." === e[0].charAt(0) && f
                ? f.slice(0, f.length - 1).concat(e)
                : e),
            x = 0;
          x < g.length;
          x++
        )
          "." === (m = g[x])
            ? (g.splice(x, 1), --x)
            : ".." !== m ||
              0 === x ||
              (1 === x && ".." === g[2]) ||
              ".." === g[x - 1] ||
              (0 < x && (g.splice(x - 1, 2), (x -= 2)));
        e = e.join("/");
      }
      if (i && l && (f || h)) {
        e: for (o = (n = e.split("/")).length; 0 < o; --o) {
          if (((s = n.slice(0, o).join("/")), f))
            for (a = f.length; 0 < a; --a)
              if (
                (r = (r = getOwn(l, f.slice(0, a).join("/"))) && getOwn(r, s))
              ) {
                ((u = r), (c = o));
                break e;
              }
          !d && h && getOwn(h, s) && ((d = getOwn(h, s)), (p = o));
        }
        (!u && d && ((u = d), (c = p)),
          u && (n.splice(0, c, u), (e = n.join("/"))));
      }
      return getOwn(b.pkgs, e) || e;
    }
    function q(t) {
      isBrowser &&
        each(scripts(), function (e) {
          if (
            e.getAttribute("data-requiremodule") === t &&
            e.getAttribute("data-requirecontext") === f.contextName
          )
            return (e.parentNode.removeChild(e), !0);
        });
    }
    function E(e) {
      var t = getOwn(b.paths, e);
      return (
        t &&
        isArray(t) &&
        1 < t.length &&
        (t.shift(),
        f.require.undef(e),
        f.makeRequire(null, { skipMap: !0 })([e]),
        1)
      );
    }
    function w(e) {
      var t,
        i = e ? e.indexOf("!") : -1;
      return (
        -1 < i && ((t = e.substring(0, i)), (e = e.substring(i + 1, e.length))),
        [t, e]
      );
    }
    function y(e, t, i, r) {
      var n,
        o,
        a,
        s = null,
        u = t ? t.name : null,
        c = e,
        d = !0,
        p = "";
      return (
        e || ((d = !1), (e = "_@r" + (g += 1))),
        (s = (a = w(e))[0]),
        (e = a[1]),
        s && ((s = v(s, u, r)), (o = getOwn(h, s))),
        e &&
          (s
            ? (p = i
                ? e
                : o && o.normalize
                  ? o.normalize(e, function (e) {
                      return v(e, u, r);
                    })
                  : -1 === e.indexOf("!")
                    ? v(e, u, r)
                    : e)
            : ((s = (a = w((p = v(e, u, r))))[0]),
              (i = !0),
              (n = f.nameToUrl((p = a[1]))))),
        {
          prefix: s,
          name: p,
          parentMap: t,
          unnormalized: !!(e = !s || o || i ? "" : "_unnormalized" + (x += 1)),
          url: n,
          originalName: c,
          isDefine: d,
          id: (s ? s + "!" + p : p) + e,
        }
      );
    }
    function S(e) {
      var t = e.id;
      return getOwn(d, t) || (d[t] = new f.Module(e));
    }
    function k(e, t, i) {
      var r = e.id,
        n = getOwn(d, r);
      !hasProp(h, r) || (n && !n.defineEmitComplete)
        ? (n = S(e)).error && "error" === t
          ? i(n.error)
          : n.on(t, i)
        : "defined" === t && i(h[r]);
    }
    function M(t, e) {
      var i = t.requireModules,
        r = !1;
      e
        ? e(t)
        : (each(i, function (e) {
            e = getOwn(d, e);
            e &&
              ((e.error = t), e.events.error) &&
              ((r = !0), e.emit("error", t));
          }),
          r || req.onError(t));
    }
    function O() {
      globalDefQueue.length &&
        (each(globalDefQueue, function (e) {
          var t = e[0];
          ("string" == typeof t && (f.defQueueMap[t] = !0), l.push(e));
        }),
        (globalDefQueue = []));
    }
    function j(e) {
      (delete d[e], delete p[e]);
    }
    function P() {
      var r,
        e = 1e3 * b.waitSeconds,
        n = e && f.startTime + e < new Date().getTime(),
        o = [],
        a = [],
        s = !1,
        u = !0;
      if (!t) {
        if (
          ((t = !0),
          eachProp(p, function (e) {
            var t = e.map,
              i = t.id;
            if (e.enabled && (t.isDefine || a.push(e), !e.error))
              if (!e.inited && n) E(i) ? (s = r = !0) : (o.push(i), q(i));
              else if (
                !e.inited &&
                e.fetched &&
                t.isDefine &&
                ((s = !0), !t.prefix)
              )
                return (u = !1);
          }),
          n && o.length)
        )
          return (
            ((e = makeError(
              "timeout",
              "Load timeout for modules: " + o,
              null,
              o,
            )).contextName = f.contextName),
            M(e)
          );
        (u &&
          each(a, function (e) {
            !(function r(n, o, a) {
              var e = n.map.id;
              n.error
                ? n.emit("error", n.error)
                : ((o[e] = !0),
                  each(n.depMaps, function (e, t) {
                    var e = e.id,
                      i = getOwn(d, e);
                    !i ||
                      n.depMatched[t] ||
                      a[e] ||
                      (getOwn(o, e)
                        ? (n.defineDep(t, h[e]), n.check())
                        : r(i, o, a));
                  }),
                  (a[e] = !0));
            })(e, {}, {});
          }),
          (n && !r) ||
            !s ||
            ((isBrowser || isWebWorker) &&
              (i =
                i ||
                setTimeout(function () {
                  ((i = 0), P());
                }, 50))),
          (t = !1));
      }
    }
    function a(e) {
      hasProp(h, e[0]) || S(y(e[0], null, !0)).init(e[1], e[2]);
    }
    function o(e, t, i, r) {
      e.detachEvent && !isOpera
        ? r && e.detachEvent(r, t)
        : e.removeEventListener(i, t, !1);
    }
    function s(e) {
      e = e.currentTarget || e.srcElement;
      return (
        o(e, f.onScriptLoad, "load", "onreadystatechange"),
        o(e, f.onScriptError, "error"),
        { node: e, id: e && e.getAttribute("data-requiremodule") }
      );
    }
    function R() {
      var e;
      for (O(); l.length; ) {
        if (null === (e = l.shift())[0])
          return M(
            makeError(
              "mismatch",
              "Mismatched anonymous define() module: " + e[e.length - 1],
            ),
          );
        a(e);
      }
      f.defQueueMap = {};
    }
    return (
      (c = {
        require: function (e) {
          return e.require || (e.require = f.makeRequire(e.map));
        },
        exports: function (e) {
          if (((e.usingExports = !0), e.map.isDefine))
            return e.exports
              ? (h[e.map.id] = e.exports)
              : (e.exports = h[e.map.id] = {});
        },
        module: function (e) {
          return (
            e.module ||
            (e.module = {
              id: e.map.id,
              uri: e.map.url,
              config: function () {
                return getOwn(b.config, e.map.id) || {};
              },
              exports: e.exports || (e.exports = {}),
            })
          );
        },
      }),
      ((e = function (e) {
        ((this.events = getOwn(r, e.id) || {}),
          (this.map = e),
          (this.shim = getOwn(b.shim, e.id)),
          (this.depExports = []),
          (this.depMaps = []),
          (this.depMatched = []),
          (this.pluginMaps = {}),
          (this.depCount = 0));
      }).prototype = {
        init: function (e, t, i, r) {
          ((r = r || {}),
            this.inited ||
              ((this.factory = t),
              i
                ? this.on("error", i)
                : this.events.error &&
                  (i = bind(this, function (e) {
                    this.emit("error", e);
                  })),
              (this.depMaps = e && e.slice(0)),
              (this.errback = i),
              (this.inited = !0),
              (this.ignore = r.ignore),
              r.enabled || this.enabled ? this.enable() : this.check()));
        },
        defineDep: function (e, t) {
          this.depMatched[e] ||
            ((this.depMatched[e] = !0),
            --this.depCount,
            (this.depExports[e] = t));
        },
        fetch: function () {
          if (!this.fetched) {
            ((this.fetched = !0), (f.startTime = new Date().getTime()));
            var e = this.map;
            if (!this.shim) return e.prefix ? this.callPlugin() : this.load();
            f.makeRequire(this.map, { enableBuildCallback: !0 })(
              this.shim.deps || [],
              bind(this, function () {
                return e.prefix ? this.callPlugin() : this.load();
              }),
            );
          }
        },
        load: function () {
          var e = this.map.url;
          n[e] || ((n[e] = !0), f.load(this.map.id, e));
        },
        check: function () {
          if (this.enabled && !this.enabling) {
            var t,
              i,
              e = this.map.id,
              r = this.depExports,
              n = this.exports,
              o = this.factory;
            if (this.inited) {
              if (this.error) this.emit("error", this.error);
              else if (!this.defining) {
                if (
                  ((this.defining = !0), this.depCount < 1 && !this.defined)
                ) {
                  if (isFunction(o)) {
                    if (
                      (this.events.error && this.map.isDefine) ||
                      req.onError !== defaultOnError
                    )
                      try {
                        n = f.execCb(e, o, r, n);
                      } catch (e) {
                        t = e;
                      }
                    else n = f.execCb(e, o, r, n);
                    if (
                      (this.map.isDefine &&
                        void 0 === n &&
                        ((r = this.module)
                          ? (n = r.exports)
                          : this.usingExports && (n = this.exports)),
                      t)
                    )
                      return (
                        (t.requireMap = this.map),
                        (t.requireModules = this.map.isDefine
                          ? [this.map.id]
                          : null),
                        (t.requireType = this.map.isDefine
                          ? "define"
                          : "require"),
                        M((this.error = t))
                      );
                  } else n = o;
                  ((this.exports = n),
                    this.map.isDefine &&
                      !this.ignore &&
                      ((h[e] = n), req.onResourceLoad) &&
                      ((i = []),
                      each(this.depMaps, function (e) {
                        i.push(e.normalizedMap || e);
                      }),
                      req.onResourceLoad(f, this.map, i)),
                    j(e),
                    (this.defined = !0));
                }
                ((this.defining = !1),
                  this.defined &&
                    !this.defineEmitted &&
                    ((this.defineEmitted = !0),
                    this.emit("defined", this.exports),
                    (this.defineEmitComplete = !0)));
              }
            } else hasProp(f.defQueueMap, e) || this.fetch();
          }
        },
        callPlugin: function () {
          var s = this.map,
            u = s.id,
            e = y(s.prefix);
          (this.depMaps.push(e),
            k(
              e,
              "defined",
              bind(this, function (e) {
                var o,
                  t,
                  i = getOwn(m, this.map.id),
                  r = this.map.name,
                  n = this.map.parentMap ? this.map.parentMap.name : null,
                  a = f.makeRequire(s.parentMap, { enableBuildCallback: !0 });
                this.map.unnormalized
                  ? (e.normalize &&
                      (r =
                        e.normalize(r, function (e) {
                          return v(e, n, !0);
                        }) || ""),
                    k(
                      (t = y(s.prefix + "!" + r, this.map.parentMap, !0)),
                      "defined",
                      bind(this, function (e) {
                        ((this.map.normalizedMap = t),
                          this.init(
                            [],
                            function () {
                              return e;
                            },
                            null,
                            { enabled: !0, ignore: !0 },
                          ));
                      }),
                    ),
                    (r = getOwn(d, t.id)) &&
                      (this.depMaps.push(t),
                      this.events.error &&
                        r.on(
                          "error",
                          bind(this, function (e) {
                            this.emit("error", e);
                          }),
                        ),
                      r.enable()))
                  : i
                    ? ((this.map.url = f.nameToUrl(i)), this.load())
                    : (((o = bind(this, function (e) {
                        this.init(
                          [],
                          function () {
                            return e;
                          },
                          null,
                          { enabled: !0 },
                        );
                      })).error = bind(this, function (e) {
                        ((this.inited = !0),
                          ((this.error = e).requireModules = [u]),
                          eachProp(d, function (e) {
                            0 === e.map.id.indexOf(u + "_unnormalized") &&
                              j(e.map.id);
                          }),
                          M(e));
                      })),
                      (o.fromText = bind(this, function (e, t) {
                        var i = s.name,
                          r = y(i),
                          n = useInteractive;
                        (t && (e = t),
                          n && (useInteractive = !1),
                          S(r),
                          hasProp(b.config, u) && (b.config[i] = b.config[u]));
                        try {
                          req.exec(e);
                        } catch (e) {
                          return M(
                            makeError(
                              "fromtexteval",
                              "fromText eval for " + u + " failed: " + e,
                              e,
                              [u],
                            ),
                          );
                        }
                        (n && (useInteractive = !0),
                          this.depMaps.push(r),
                          f.completeLoad(i),
                          a([i], o));
                      })),
                      e.load(s.name, a, o, b));
              }),
            ),
            f.enable(e, this),
            (this.pluginMaps[e.id] = e));
        },
        enable: function () {
          (((p[this.map.id] = this).enabled = !0),
            (this.enabling = !0),
            each(
              this.depMaps,
              bind(this, function (e, t) {
                var i, r;
                if ("string" == typeof e) {
                  if (
                    ((e = y(
                      e,
                      this.map.isDefine ? this.map : this.map.parentMap,
                      !1,
                      !this.skipMap,
                    )),
                    (this.depMaps[t] = e),
                    (r = getOwn(c, e.id)))
                  )
                    return void (this.depExports[t] = r(this));
                  ((this.depCount += 1),
                    k(
                      e,
                      "defined",
                      bind(this, function (e) {
                        this.undefed || (this.defineDep(t, e), this.check());
                      }),
                    ),
                    this.errback
                      ? k(e, "error", bind(this, this.errback))
                      : this.events.error &&
                        k(
                          e,
                          "error",
                          bind(this, function (e) {
                            this.emit("error", e);
                          }),
                        ));
                }
                ((r = e.id),
                  (i = d[r]),
                  hasProp(c, r) || !i || i.enabled || f.enable(e, this));
              }),
            ),
            eachProp(
              this.pluginMaps,
              bind(this, function (e) {
                var t = getOwn(d, e.id);
                t && !t.enabled && f.enable(e, this);
              }),
            ),
            (this.enabling = !1),
            this.check());
        },
        on: function (e, t) {
          (this.events[e] || (this.events[e] = [])).push(t);
        },
        emit: function (e, t) {
          (each(this.events[e], function (e) {
            e(t);
          }),
            "error" === e && delete this.events[e]);
        },
      }),
      ((f = {
        config: b,
        contextName: u,
        registry: d,
        defined: h,
        urlFetched: n,
        defQueue: l,
        defQueueMap: {},
        Module: e,
        makeModuleMap: y,
        nextTick: req.nextTick,
        onError: M,
        configure: function (e) {
          (e.baseUrl &&
            "/" !== e.baseUrl.charAt(e.baseUrl.length - 1) &&
            (e.baseUrl += "/"),
            "string" == typeof e.urlArgs &&
              ((i = e.urlArgs),
              (e.urlArgs = function (e, t) {
                return (-1 === t.indexOf("?") ? "?" : "&") + i;
              })));
          var i,
            r = b.shim,
            n = { paths: !0, bundles: !0, config: !0, map: !0 };
          (eachProp(e, function (e, t) {
            n[t] ? (b[t] || (b[t] = {}), mixin(b[t], e, !0, !0)) : (b[t] = e);
          }),
            e.bundles &&
              eachProp(e.bundles, function (e, t) {
                each(e, function (e) {
                  e !== t && (m[e] = t);
                });
              }),
            e.shim &&
              (eachProp(e.shim, function (e, t) {
                ((!(e = isArray(e) ? { deps: e } : e).exports && !e.init) ||
                  e.exportsFn ||
                  (e.exportsFn = f.makeShimExports(e)),
                  (r[t] = e));
              }),
              (b.shim = r)),
            e.packages &&
              each(e.packages, function (e) {
                var t = (e = "string" == typeof e ? { name: e } : e).name;
                (e.location && (b.paths[t] = e.location),
                  (b.pkgs[t] =
                    e.name +
                    "/" +
                    (e.main || "main")
                      .replace(currDirRegExp, "")
                      .replace(jsSuffixRegExp, "")));
              }),
            eachProp(d, function (e, t) {
              e.inited || e.map.unnormalized || (e.map = y(t, null, !0));
            }),
            (e.deps || e.callback) && f.require(e.deps || [], e.callback));
        },
        makeShimExports: function (t) {
          return function () {
            var e;
            return (
              (e = t.init ? t.init.apply(global, arguments) : e) ||
              (t.exports && getGlobal(t.exports))
            );
          };
        },
        makeRequire: function (o, a) {
          function s(e, t, i) {
            var r, n;
            return (
              a.enableBuildCallback &&
                t &&
                isFunction(t) &&
                (t.__requireJsBuild = !0),
              "string" == typeof e
                ? isFunction(t)
                  ? M(makeError("requireargs", "Invalid require call"), i)
                  : o && hasProp(c, e)
                    ? c[e](d[o.id])
                    : req.get
                      ? req.get(f, e, o, s)
                      : ((r = y(e, o, !1, !0).id),
                        hasProp(h, r)
                          ? h[r]
                          : M(
                              makeError(
                                "notloaded",
                                'Module name "' +
                                  r +
                                  '" has not been loaded yet for context: ' +
                                  u +
                                  (o ? "" : ". Use require([])"),
                              ),
                            ))
                : (R(),
                  f.nextTick(function () {
                    (R(),
                      ((n = S(y(null, o))).skipMap = a.skipMap),
                      n.init(e, t, i, { enabled: !0 }),
                      P());
                  }),
                  s)
            );
          }
          return (
            (a = a || {}),
            mixin(s, {
              isBrowser: isBrowser,
              toUrl: function (e) {
                var t,
                  i = e.lastIndexOf("."),
                  r = e.split("/")[0];
                return (
                  -1 !== i &&
                    (!("." === r || ".." === r) || 1 < i) &&
                    ((t = e.substring(i, e.length)), (e = e.substring(0, i))),
                  f.nameToUrl(v(e, o && o.id, !0), t, !0)
                );
              },
              defined: function (e) {
                return hasProp(h, y(e, o, !1, !0).id);
              },
              specified: function (e) {
                return (
                  (e = y(e, o, !1, !0).id),
                  hasProp(h, e) || hasProp(d, e)
                );
              },
            }),
            o ||
              (s.undef = function (i) {
                O();
                var e = y(i, o, !0),
                  t = getOwn(d, i);
                ((t.undefed = !0),
                  q(i),
                  delete h[i],
                  delete n[e.url],
                  delete r[i],
                  eachReverse(l, function (e, t) {
                    e[0] === i && l.splice(t, 1);
                  }),
                  delete f.defQueueMap[i],
                  t && (t.events.defined && (r[i] = t.events), j(i)));
              }),
            s
          );
        },
        enable: function (e) {
          getOwn(d, e.id) && S(e).enable();
        },
        completeLoad: function (e) {
          var t,
            i,
            r,
            n = getOwn(b.shim, e) || {},
            o = n.exports;
          for (O(); l.length; ) {
            if (null === (i = l.shift())[0]) {
              if (((i[0] = e), t)) break;
              t = !0;
            } else i[0] === e && (t = !0);
            a(i);
          }
          if (
            ((f.defQueueMap = {}),
            (r = getOwn(d, e)),
            !t && !hasProp(h, e) && r && !r.inited)
          ) {
            if (!(!b.enforceDefine || (o && getGlobal(o))))
              return E(e)
                ? void 0
                : M(
                    makeError("nodefine", "No define call for " + e, null, [e]),
                  );
            a([e, n.deps || [], n.exportsFn]);
          }
          P();
        },
        nameToUrl: function (e, t, i) {
          var r,
            n,
            o,
            a,
            s,
            u = getOwn(b.pkgs, e);
          if ((u = getOwn(m, (e = u ? u : e)))) return f.nameToUrl(u, t, i);
          if (req.jsExtRegExp.test(e)) a = e + (t || "");
          else {
            for (r = b.paths, o = (n = e.split("/")).length; 0 < o; --o)
              if ((s = getOwn(r, n.slice(0, o).join("/")))) {
                (isArray(s) && (s = s[0]), n.splice(0, o, s));
                break;
              }
            ((a = n.join("/")),
              (a =
                ("/" ===
                  (a +=
                    t ||
                    (/^data\:|^blob\:|\?/.test(a) || i ? "" : ".js")).charAt(
                    0,
                  ) || a.match(/^[\w\+\.\-]+:/)
                  ? ""
                  : b.baseUrl) + a));
          }
          return b.urlArgs && !/^blob\:/.test(a) ? a + b.urlArgs(e, a) : a;
        },
        load: function (e, t) {
          req.load(f, e, t);
        },
        execCb: function (e, t, i, r) {
          return t.apply(r, i);
        },
        onScriptLoad: function (e) {
          ("load" !== e.type &&
            !readyRegExp.test((e.currentTarget || e.srcElement).readyState)) ||
            ((interactiveScript = null), (e = s(e)), f.completeLoad(e.id));
        },
        onScriptError: function (e) {
          var i,
            r = s(e);
          if (!E(r.id))
            return (
              (i = []),
              eachProp(d, function (e, t) {
                0 !== t.indexOf("_@r") &&
                  each(e.depMaps, function (e) {
                    if (e.id === r.id) return (i.push(t), !0);
                  });
              }),
              M(
                makeError(
                  "scripterror",
                  'Script error for "' +
                    r.id +
                    (i.length ? '", needed by: ' + i.join(", ") : '"'),
                  e,
                  [r.id],
                ),
              )
            );
        },
      }).require = f.makeRequire()),
      f
    );
  }
  function getInteractiveScript() {
    return (
      (interactiveScript && "interactive" === interactiveScript.readyState) ||
        eachReverse(scripts(), function (e) {
          if ("interactive" === e.readyState) return (interactiveScript = e);
        }),
      interactiveScript
    );
  }
})(this, "undefined" == typeof setTimeout ? void 0 : setTimeout);
