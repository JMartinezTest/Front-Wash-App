import { RsbuildPlugin } from '@rsbuild/core';

declare const builtinMappingResolved: {
    readonly assert: string;
    readonly buffer: string;
    readonly child_process: null;
    readonly cluster: null;
    readonly console: string;
    readonly constants: string;
    readonly crypto: string;
    readonly dgram: null;
    readonly dns: null;
    readonly domain: string;
    readonly events: string;
    readonly fs: null;
    readonly http: string;
    readonly https: string;
    readonly module: null;
    readonly net: null;
    readonly os: string;
    readonly path: string;
    readonly punycode: string;
    readonly process: string;
    readonly querystring: string;
    readonly readline: null;
    readonly repl: null;
    readonly stream: string;
    readonly _stream_duplex: string;
    readonly _stream_passthrough: string;
    readonly _stream_readable: string;
    readonly _stream_transform: string;
    readonly _stream_writable: string;
    readonly string_decoder: string;
    readonly sys: string;
    readonly timers: string;
    readonly tls: null;
    readonly tty: string;
    readonly url: string;
    readonly util: string;
    readonly vm: string;
    readonly zlib: string;
};
declare const resolvedPolyfillToModules: any;

type Globals = {
    process?: boolean;
    Buffer?: boolean;
};
type PluginNodePolyfillOptions = {
    /**
     * Whether to provide polyfill of globals.
     * @default
     * {
     *   Buffer: true,
     *   process: true,
     * }
     */
    globals?: Globals;
    /**
     * Whether to polyfill Node.js builtin modules starting with `node:`.
     * @see https://nodejs.org/api/esm.html#node-imports
     * @default true
     */
    protocolImports?: boolean;
    /**
     * Exclude certain modules to be polyfilled.
     * This option is mutually exclusive with {@link PluginNodePolyfillOptions.include | `include`}.
     * @default undefined
     */
    exclude?: string[];
    /**
     * Only include certain modules to be polyfilled.
     * This option is mutually exclusive with {@link PluginNodePolyfillOptions.exclude | `exclude`}.
     * @default undefined
     */
    include?: string[];
    /**
     * Override the default polyfills for specific modules.
     * @default undefined
     */
    overrides?: Record<string, string | false>;
};
declare const resolvePolyfill: (libPath: string, overrides?: PluginNodePolyfillOptions["overrides"]) => string | false | null;
declare const getResolveFallback: ({ protocolImports, exclude, include, overrides, }: Pick<PluginNodePolyfillOptions, "protocolImports" | "exclude" | "include" | "overrides">) => Record<string, string | false>;
declare const getProvideGlobals: (globals?: Globals, overrides?: PluginNodePolyfillOptions["overrides"]) => Promise<Record<string, string | string[]>>;
declare const PLUGIN_NODE_POLYFILL_NAME = "rsbuild:node-polyfill";
declare function pluginNodePolyfill(options?: PluginNodePolyfillOptions): RsbuildPlugin;

export { PLUGIN_NODE_POLYFILL_NAME, type PluginNodePolyfillOptions, builtinMappingResolved, getProvideGlobals, getResolveFallback, pluginNodePolyfill, resolvePolyfill, resolvedPolyfillToModules };
