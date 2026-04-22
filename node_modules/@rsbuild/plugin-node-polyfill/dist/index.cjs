"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  PLUGIN_NODE_POLYFILL_NAME: () => PLUGIN_NODE_POLYFILL_NAME,
  builtinMappingResolved: () => builtinMappingResolved,
  getProvideGlobals: () => getProvideGlobals,
  getResolveFallback: () => getResolveFallback,
  pluginNodePolyfill: () => pluginNodePolyfill,
  resolvePolyfill: () => resolvePolyfill,
  resolvedPolyfillToModules: () => resolvedPolyfillToModules
});
module.exports = __toCommonJS(src_exports);

// node_modules/.pnpm/tsup@8.3.0_postcss@8.4.47_typescript@5.6.3/node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl = () => typeof document === "undefined" ? new URL(`file:${__filename}`).href : document.currentScript && document.currentScript.src || new URL("main.js", document.baseURI).href;
var importMetaUrl = /* @__PURE__ */ getImportMetaUrl();

// src/ProtocolImportsPlugin.ts
var ProtocolImportsPlugin = class {
  apply(compiler) {
    compiler.hooks.normalModuleFactory.tap(
      "NormalModuleReplacementPlugin",
      (nmf) => {
        nmf.hooks.beforeResolve.tap(
          "NormalModuleReplacementPlugin",
          (resource) => {
            if (/^node:/.test(resource.request)) {
              resource.request = resource.request.replace(/^node:/, "");
            }
          }
        );
      }
    );
  }
};

// src/libs.ts
var import_node_module = require("module");
var require2 = (0, import_node_module.createRequire)(importMetaUrl);
var builtinMappingResolved = {
  assert: require2.resolve("assert/"),
  buffer: require2.resolve("buffer/"),
  child_process: null,
  cluster: null,
  console: require2.resolve("console-browserify"),
  constants: require2.resolve("constants-browserify"),
  crypto: require2.resolve("crypto-browserify"),
  dgram: null,
  dns: null,
  domain: require2.resolve("domain-browser"),
  events: require2.resolve("events/"),
  fs: null,
  http: require2.resolve("stream-http"),
  https: require2.resolve("https-browserify"),
  module: null,
  net: null,
  os: require2.resolve("os-browserify/browser.js"),
  path: require2.resolve("path-browserify"),
  punycode: require2.resolve("punycode/"),
  process: require2.resolve("process/browser.js"),
  querystring: require2.resolve("querystring-es3/"),
  readline: null,
  repl: null,
  stream: require2.resolve("stream-browserify"),
  _stream_duplex: require2.resolve("readable-stream/lib/_stream_duplex.js"),
  _stream_passthrough: require2.resolve(
    "readable-stream/lib/_stream_passthrough.js"
  ),
  _stream_readable: require2.resolve("readable-stream/lib/_stream_readable.js"),
  _stream_transform: require2.resolve(
    "readable-stream/lib/_stream_transform.js"
  ),
  _stream_writable: require2.resolve("readable-stream/lib/_stream_writable.js"),
  string_decoder: require2.resolve("string_decoder/"),
  sys: require2.resolve("util/util.js"),
  timers: require2.resolve("timers-browserify"),
  tls: null,
  tty: require2.resolve("tty-browserify"),
  url: require2.resolve("url/"),
  util: require2.resolve("util/util.js"),
  vm: require2.resolve("vm-browserify"),
  zlib: require2.resolve("browserify-zlib")
};
var resolvedPolyfillToModules = Object.fromEntries(
  Object.entries(builtinMappingResolved).filter(([key]) => key !== null).map(([key, value]) => [value, key])
);

// src/index.ts
var resolvePolyfill = (libPath, overrides) => {
  if (overrides?.[libPath] !== void 0) {
    return overrides[libPath];
  }
  return builtinMappingResolved[libPath];
};
var getResolveFallback = ({
  protocolImports,
  exclude,
  include,
  overrides
}) => {
  if (exclude && include) {
    throw new Error("`include` is mutually exclusive with `exclude`.");
  }
  const resolvedNodeLibs = include ? include : Object.keys(builtinMappingResolved).filter((name) => {
    return !(exclude || []).includes(name);
  });
  const fallback = {};
  for (const name of resolvedNodeLibs) {
    const libPath = resolvePolyfill(name, overrides);
    fallback[name] = libPath ?? false;
    if (protocolImports) {
      fallback[`node:${name}`] = fallback[name];
    }
  }
  return fallback;
};
var getProvideGlobals = async (globals, overrides) => {
  const result = {};
  if (globals?.Buffer !== false) {
    result.Buffer = [resolvePolyfill("buffer", overrides), "Buffer"];
  }
  if (globals?.process !== false) {
    result.process = [resolvePolyfill("process", overrides)];
  }
  return result;
};
var PLUGIN_NODE_POLYFILL_NAME = "rsbuild:node-polyfill";
function pluginNodePolyfill(options = {}) {
  const { protocolImports = true, include, exclude, overrides } = options;
  return {
    name: PLUGIN_NODE_POLYFILL_NAME,
    setup(api) {
      api.modifyBundlerChain(async (chain, { isServer, bundler }) => {
        if (isServer) {
          return;
        }
        chain.resolve.fallback.merge(
          getResolveFallback({
            protocolImports,
            include,
            exclude,
            overrides
          })
        );
        const provideGlobals = await getProvideGlobals(
          options.globals,
          overrides
        );
        if (Object.keys(provideGlobals).length) {
          chain.plugin("node-polyfill-provide").use(bundler.ProvidePlugin, [provideGlobals]);
        }
        if (protocolImports) {
          chain.plugin("protocol-imports").use(ProtocolImportsPlugin);
        }
      });
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PLUGIN_NODE_POLYFILL_NAME,
  builtinMappingResolved,
  getProvideGlobals,
  getResolveFallback,
  pluginNodePolyfill,
  resolvePolyfill,
  resolvedPolyfillToModules
});
