const RUNTIME_PUBLIC_PATH = "server/chunks/ssr/[turbopack]_runtime.js";
const RELATIVE_ROOT_PATH = "..";
const ASSET_PREFIX = "/_next/";
const WORKER_FORWARDED_GLOBALS = ["NEXT_DEPLOYMENT_ID","NEXT_CLIENT_ASSET_SUFFIX"];
// Apply forwarded globals from workerData if running in a worker thread
if (typeof require !== 'undefined') {
    try {
        const { workerData } = require('worker_threads');
        if (workerData?.__turbopack_globals__) {
            Object.assign(globalThis, workerData.__turbopack_globals__);
            // Remove internal data so it's not visible to user code
            delete workerData.__turbopack_globals__;
        }
    } catch (_) {
        // Not in a worker thread context, ignore
    }
}
/**
 * This file contains runtime types and functions that are shared between all
 * TurboPack ECMAScript runtimes.
 *
 * It will be prepended to the runtime code of each runtime.
 */ /* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-types.d.ts" />
/**
 * Describes why a module was instantiated.
 * Shared between browser and Node.js runtimes.
 */ var SourceType = /*#__PURE__*/ function(SourceType) {
    /**
   * The module was instantiated because it was included in an evaluated chunk's
   * runtime.
   * SourceData is a ChunkPath.
   */ SourceType[SourceType["Runtime"] = 0] = "Runtime";
    /**
   * The module was instantiated because a parent module imported it.
   * SourceData is a ModuleId.
   */ SourceType[SourceType["Parent"] = 1] = "Parent";
    /**
   * The module was instantiated because it was included in a chunk's hot module
   * update.
   * SourceData is an array of ModuleIds or undefined.
   */ SourceType[SourceType["Update"] = 2] = "Update";
    return SourceType;
}(SourceType || {});
/**
 * Flag indicating which module object type to create when a module is merged. Set to `true`
 * by each runtime that uses ModuleWithDirection (browser dev-base.ts, nodejs dev-base.ts,
 * nodejs build-base.ts). Browser production (build-base.ts) leaves it as `false` since it
 * uses plain Module objects.
 */ let createModuleWithDirectionFlag = false;
const REEXPORTED_OBJECTS = new WeakMap();
/**
 * Constructs the `__turbopack_context__` object for a module.
 */ function Context(module, exports) {
    this.m = module;
    // We need to store this here instead of accessing it from the module object to:
    // 1. Make it available to factories directly, since we rewrite `this` to
    //    `__turbopack_context__.e` in CJS modules.
    // 2. Support async modules which rewrite `module.exports` to a promise, so we
    //    can still access the original exports object from functions like
    //    `esmExport`
    // Ideally we could find a new approach for async modules and drop this property altogether.
    this.e = exports;
}
const contextPrototype = Context.prototype;
const hasOwnProperty = Object.prototype.hasOwnProperty;
const toStringTag = typeof Symbol !== 'undefined' && Symbol.toStringTag;
function defineProp(obj, name, options) {
    if (!hasOwnProperty.call(obj, name)) Object.defineProperty(obj, name, options);
}
function getOverwrittenModule(moduleCache, id) {
    let module = moduleCache[id];
    if (!module) {
        if (createModuleWithDirectionFlag) {
            // set in development modes for hmr support
            module = createModuleWithDirection(id);
        } else {
            module = createModuleObject(id);
        }
        moduleCache[id] = module;
    }
    return module;
}
/**
 * Creates the module object. Only done here to ensure all module objects have the same shape.
 */ function createModuleObject(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined
    };
}
function createModuleWithDirection(id) {
    return {
        exports: {},
        error: undefined,
        id,
        namespaceObject: undefined,
        parents: [],
        children: []
    };
}
const BindingTag_Value = 0;
/**
 * Adds the getters to the exports object.
 */ function esm(exports, bindings) {
    defineProp(exports, '__esModule', {
        value: true
    });
    if (toStringTag) defineProp(exports, toStringTag, {
        value: 'Module'
    });
    let i = 0;
    while(i < bindings.length){
        const propName = bindings[i++];
        const tagOrFunction = bindings[i++];
        if (typeof tagOrFunction === 'number') {
            if (tagOrFunction === BindingTag_Value) {
                defineProp(exports, propName, {
                    value: bindings[i++],
                    enumerable: true,
                    writable: false
                });
            } else {
                throw new Error(`unexpected tag: ${tagOrFunction}`);
            }
        } else {
            const getterFn = tagOrFunction;
            if (typeof bindings[i] === 'function') {
                const setterFn = bindings[i++];
                defineProp(exports, propName, {
                    get: getterFn,
                    set: setterFn,
                    enumerable: true
                });
            } else {
                defineProp(exports, propName, {
                    get: getterFn,
                    enumerable: true
                });
            }
        }
    }
    Object.seal(exports);
}
/**
 * Makes the module an ESM with exports
 */ function esmExport(bindings, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    module.namespaceObject = exports;
    esm(exports, bindings);
}
contextPrototype.s = esmExport;
function ensureDynamicExports(module, exports) {
    let reexportedObjects = REEXPORTED_OBJECTS.get(module);
    if (!reexportedObjects) {
        REEXPORTED_OBJECTS.set(module, reexportedObjects = []);
        module.exports = module.namespaceObject = new Proxy(exports, {
            get (target, prop) {
                if (hasOwnProperty.call(target, prop) || prop === 'default' || prop === '__esModule') {
                    return Reflect.get(target, prop);
                }
                for (const obj of reexportedObjects){
                    const value = Reflect.get(obj, prop);
                    if (value !== undefined) return value;
                }
                return undefined;
            },
            ownKeys (target) {
                const keys = Reflect.ownKeys(target);
                for (const obj of reexportedObjects){
                    for (const key of Reflect.ownKeys(obj)){
                        if (key !== 'default' && !keys.includes(key)) keys.push(key);
                    }
                }
                return keys;
            }
        });
    }
    return reexportedObjects;
}
/**
 * Dynamically exports properties from an object
 */ function dynamicExport(object, id) {
    let module;
    let exports;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
        exports = module.exports;
    } else {
        module = this.m;
        exports = this.e;
    }
    const reexportedObjects = ensureDynamicExports(module, exports);
    if (typeof object === 'object' && object !== null) {
        reexportedObjects.push(object);
    }
}
contextPrototype.j = dynamicExport;
function exportValue(value, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = value;
}
contextPrototype.v = exportValue;
function exportNamespace(namespace, id) {
    let module;
    if (id != null) {
        module = getOverwrittenModule(this.c, id);
    } else {
        module = this.m;
    }
    module.exports = module.namespaceObject = namespace;
}
contextPrototype.n = exportNamespace;
function createGetter(obj, key) {
    return ()=>obj[key];
}
/**
 * @returns prototype of the object
 */ const getProto = Object.getPrototypeOf ? (obj)=>Object.getPrototypeOf(obj) : (obj)=>obj.__proto__;
/** Prototypes that are not expanded for exports */ const LEAF_PROTOTYPES = [
    null,
    getProto({}),
    getProto([]),
    getProto(getProto)
];
/**
 * @param raw
 * @param ns
 * @param allowExportDefault
 *   * `false`: will have the raw module as default export
 *   * `true`: will have the default property as default export
 */ function interopEsm(raw, ns, allowExportDefault) {
    const bindings = [];
    let defaultLocation = -1;
    for(let current = raw; (typeof current === 'object' || typeof current === 'function') && !LEAF_PROTOTYPES.includes(current); current = getProto(current)){
        for (const key of Object.getOwnPropertyNames(current)){
            bindings.push(key, createGetter(raw, key));
            if (defaultLocation === -1 && key === 'default') {
                defaultLocation = bindings.length - 1;
            }
        }
    }
    // this is not really correct
    // we should set the `default` getter if the imported module is a `.cjs file`
    if (!(allowExportDefault && defaultLocation >= 0)) {
        // Replace the binding with one for the namespace itself in order to preserve iteration order.
        if (defaultLocation >= 0) {
            // Replace the getter with the value
            bindings.splice(defaultLocation, 1, BindingTag_Value, raw);
        } else {
            bindings.push('default', BindingTag_Value, raw);
        }
    }
    esm(ns, bindings);
    return ns;
}
function createNS(raw) {
    if (typeof raw === 'function') {
        return function(...args) {
            return raw.apply(this, args);
        };
    } else {
        return Object.create(null);
    }
}
function esmImport(id) {
    const module = getOrInstantiateModuleFromParent(id, this.m);
    // any ES module has to have `module.namespaceObject` defined.
    if (module.namespaceObject) return module.namespaceObject;
    // only ESM can be an async module, so we don't need to worry about exports being a promise here.
    const raw = module.exports;
    return module.namespaceObject = interopEsm(raw, createNS(raw), raw && raw.__esModule);
}
contextPrototype.i = esmImport;
function asyncLoader(moduleId) {
    const loader = this.r(moduleId);
    return loader(esmImport.bind(this));
}
contextPrototype.A = asyncLoader;
// Add a simple runtime require so that environments without one can still pass
// `typeof require` CommonJS checks so that exports are correctly registered.
const runtimeRequire = // @ts-ignore
typeof require === 'function' ? require : function require1() {
    throw new Error('Unexpected use of runtime require');
};
contextPrototype.t = runtimeRequire;
function commonJsRequire(id) {
    return getOrInstantiateModuleFromParent(id, this.m).exports;
}
contextPrototype.r = commonJsRequire;
/**
 * Remove fragments and query parameters since they are never part of the context map keys
 *
 * This matches how we parse patterns at resolving time.  Arguably we should only do this for
 * strings passed to `import` but the resolve does it for `import` and `require` and so we do
 * here as well.
 */ function parseRequest(request) {
    // Per the URI spec fragments can contain `?` characters, so we should trim it off first
    // https://datatracker.ietf.org/doc/html/rfc3986#section-3.5
    const hashIndex = request.indexOf('#');
    if (hashIndex !== -1) {
        request = request.substring(0, hashIndex);
    }
    const queryIndex = request.indexOf('?');
    if (queryIndex !== -1) {
        request = request.substring(0, queryIndex);
    }
    return request;
}
/**
 * `require.context` and require/import expression runtime.
 */ function moduleContext(map) {
    function moduleContext(id) {
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].module();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    }
    moduleContext.keys = ()=>{
        return Object.keys(map);
    };
    moduleContext.resolve = (id)=>{
        id = parseRequest(id);
        if (hasOwnProperty.call(map, id)) {
            return map[id].id();
        }
        const e = new Error(`Cannot find module '${id}'`);
        e.code = 'MODULE_NOT_FOUND';
        throw e;
    };
    moduleContext.import = async (id)=>{
        return await moduleContext(id);
    };
    return moduleContext;
}
contextPrototype.f = moduleContext;
/**
 * Returns the path of a chunk defined by its data.
 */ function getChunkPath(chunkData) {
    return typeof chunkData === 'string' ? chunkData : chunkData.path;
}
function isPromise(maybePromise) {
    return maybePromise != null && typeof maybePromise === 'object' && 'then' in maybePromise && typeof maybePromise.then === 'function';
}
function isAsyncModuleExt(obj) {
    return turbopackQueues in obj;
}
function createPromise() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej)=>{
        reject = rej;
        resolve = res;
    });
    return {
        promise,
        resolve: resolve,
        reject: reject
    };
}
// Load the CompressedmoduleFactories of a chunk into the `moduleFactories` Map.
// The CompressedModuleFactories format is
// - 1 or more module ids
// - a module factory function
// So walking this is a little complex but the flat structure is also fast to
// traverse, we can use `typeof` operators to distinguish the two cases.
function installCompressedModuleFactories(chunkModules, offset, moduleFactories, newModuleId) {
    let i = offset;
    while(i < chunkModules.length){
        let end = i + 1;
        // Find our factory function
        while(end < chunkModules.length && typeof chunkModules[end] !== 'function'){
            end++;
        }
        if (end === chunkModules.length) {
            throw new Error('malformed chunk format, expected a factory function');
        }
        // Install the factory for each module ID that doesn't already have one.
        // When some IDs in this group already have a factory, reuse that existing
        // group factory for the missing IDs to keep all IDs in the group consistent.
        // Otherwise, install the factory from this chunk.
        const moduleFactoryFn = chunkModules[end];
        let existingGroupFactory = undefined;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            const existingFactory = moduleFactories.get(id);
            if (existingFactory) {
                existingGroupFactory = existingFactory;
                break;
            }
        }
        const factoryToInstall = existingGroupFactory ?? moduleFactoryFn;
        let didInstallFactory = false;
        for(let j = i; j < end; j++){
            const id = chunkModules[j];
            if (!moduleFactories.has(id)) {
                if (!didInstallFactory) {
                    if (factoryToInstall === moduleFactoryFn) {
                        applyModuleFactoryName(moduleFactoryFn);
                    }
                    didInstallFactory = true;
                }
                moduleFactories.set(id, factoryToInstall);
                newModuleId?.(id);
            }
        }
        i = end + 1; // end is pointing at the last factory advance to the next id or the end of the array.
    }
}
// everything below is adapted from webpack
// https://github.com/webpack/webpack/blob/6be4065ade1e252c1d8dcba4af0f43e32af1bdc1/lib/runtime/AsyncModuleRuntimeModule.js#L13
const turbopackQueues = Symbol('turbopack queues');
const turbopackExports = Symbol('turbopack exports');
const turbopackError = Symbol('turbopack error');
function resolveQueue(queue) {
    if (queue && queue.status !== 1) {
        queue.status = 1;
        queue.forEach((fn)=>fn.queueCount--);
        queue.forEach((fn)=>fn.queueCount-- ? fn.queueCount++ : fn());
    }
}
function wrapDeps(deps) {
    return deps.map((dep)=>{
        if (dep !== null && typeof dep === 'object') {
            if (isAsyncModuleExt(dep)) return dep;
            if (isPromise(dep)) {
                const queue = Object.assign([], {
                    status: 0
                });
                const obj = {
                    [turbopackExports]: {},
                    [turbopackQueues]: (fn)=>fn(queue)
                };
                dep.then((res)=>{
                    obj[turbopackExports] = res;
                    resolveQueue(queue);
                }, (err)=>{
                    obj[turbopackError] = err;
                    resolveQueue(queue);
                });
                return obj;
            }
        }
        return {
            [turbopackExports]: dep,
            [turbopackQueues]: ()=>{}
        };
    });
}
function asyncModule(body, hasAwait) {
    const module = this.m;
    const queue = hasAwait ? Object.assign([], {
        status: -1
    }) : undefined;
    const depQueues = new Set();
    const { resolve, reject, promise: rawPromise } = createPromise();
    const promise = Object.assign(rawPromise, {
        [turbopackExports]: module.exports,
        [turbopackQueues]: (fn)=>{
            queue && fn(queue);
            depQueues.forEach(fn);
            promise['catch'](()=>{});
        }
    });
    const attributes = {
        get () {
            return promise;
        },
        set (v) {
            // Calling `esmExport` leads to this.
            if (v !== promise) {
                promise[turbopackExports] = v;
            }
        }
    };
    Object.defineProperty(module, 'exports', attributes);
    Object.defineProperty(module, 'namespaceObject', attributes);
    function handleAsyncDependencies(deps) {
        const currentDeps = wrapDeps(deps);
        const getResult = ()=>currentDeps.map((d)=>{
                if (d[turbopackError]) throw d[turbopackError];
                return d[turbopackExports];
            });
        const { promise, resolve } = createPromise();
        const fn = Object.assign(()=>resolve(getResult), {
            queueCount: 0
        });
        function fnQueue(q) {
            if (q !== queue && !depQueues.has(q)) {
                depQueues.add(q);
                if (q && q.status === 0) {
                    fn.queueCount++;
                    q.push(fn);
                }
            }
        }
        currentDeps.map((dep)=>dep[turbopackQueues](fnQueue));
        return fn.queueCount ? promise : getResult();
    }
    function asyncResult(err) {
        if (err) {
            reject(promise[turbopackError] = err);
        } else {
            resolve(promise[turbopackExports]);
        }
        resolveQueue(queue);
    }
    body(handleAsyncDependencies, asyncResult);
    if (queue && queue.status === -1) {
        queue.status = 0;
    }
}
contextPrototype.a = asyncModule;
/**
 * A pseudo "fake" URL object to resolve to its relative path.
 *
 * When UrlRewriteBehavior is set to relative, calls to the `new URL()` will construct url without base using this
 * runtime function to generate context-agnostic urls between different rendering context, i.e ssr / client to avoid
 * hydration mismatch.
 *
 * This is based on webpack's existing implementation:
 * https://github.com/webpack/webpack/blob/87660921808566ef3b8796f8df61bd79fc026108/lib/runtime/RelativeUrlRuntimeModule.js
 */ const relativeURL = function relativeURL(inputUrl) {
    const realUrl = new URL(inputUrl, 'x:/');
    const values = {};
    for(const key in realUrl)values[key] = realUrl[key];
    values.href = inputUrl;
    values.pathname = inputUrl.replace(/[?#].*/, '');
    values.origin = values.protocol = '';
    values.toString = values.toJSON = (..._args)=>inputUrl;
    for(const key in values)Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        value: values[key]
    });
};
relativeURL.prototype = URL.prototype;
contextPrototype.U = relativeURL;
/**
 * Utility function to ensure all variants of an enum are handled.
 */ function invariant(never, computeMessage) {
    throw new Error(`Invariant: ${computeMessage(never)}`);
}
/**
 * Constructs an error message for when a module factory is not available.
 */ function factoryNotAvailableMessage(moduleId, sourceType, sourceData) {
    let instantiationReason;
    switch(sourceType){
        case 0:
            instantiationReason = `as a runtime entry of chunk ${sourceData}`;
            break;
        case 1:
            instantiationReason = `because it was required from module ${sourceData}`;
            break;
        case 2:
            instantiationReason = 'because of an HMR update';
            break;
        default:
            invariant(sourceType, (sourceType)=>`Unknown source type: ${sourceType}`);
    }
    return `Module ${moduleId} was instantiated ${instantiationReason}, but the module factory is not available.`;
}
/**
 * A stub function to make `require` available but non-functional in ESM.
 */ function requireStub(_moduleId) {
    throw new Error('dynamic usage of require is not supported');
}
contextPrototype.z = requireStub;
// Make `globalThis` available to the module in a way that cannot be shadowed by a local variable.
contextPrototype.g = globalThis;
function applyModuleFactoryName(factory) {
    // Give the module factory a nice name to improve stack traces.
    Object.defineProperty(factory, 'name', {
        value: 'module evaluation'
    });
}
/// <reference path="../shared/runtime/runtime-utils.ts" />
/// A 'base' utilities to support runtime can have externals.
/// Currently this is for node.js / edge runtime both.
/// If a fn requires node.js specific behavior, it should be placed in `node-external-utils` instead.
async function externalImport(id) {
    let raw;
    try {
        switch (id) {
  case "next/dist/compiled/@vercel/og/index.node.js":
    raw = await import("next/dist/compiled/@vercel/og/index.edge.js");
    break;
  case "jsdom-9df7024464fbd759":
    raw = await import(".pnpm/jsdom@28.1.0_@noble+hashes@1.8.0/node_modules/jsdom");
    break;
  default:
    raw = await import(id);
};
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (raw && raw.__esModule && raw.default && 'default' in raw.default) {
        return interopEsm(raw.default, createNS(raw), true);
    }
    return raw;
}
contextPrototype.y = externalImport;
function externalRequire(id, thunk, esm = false) {
    let raw;
    try {
        raw = thunk();
    } catch (err) {
        // TODO(alexkirsz) This can happen when a client-side module tries to load
        // an external module we don't provide a shim for (e.g. querystring, url).
        // For now, we fail semi-silently, but in the future this should be a
        // compilation error.
        throw new Error(`Failed to load external module ${id}: ${err}`);
    }
    if (!esm || raw.__esModule) {
        return raw;
    }
    return interopEsm(raw, createNS(raw), true);
}
externalRequire.resolve = (id, options)=>{
    return require.resolve(id, options);
};
contextPrototype.x = externalRequire;
/* eslint-disable @typescript-eslint/no-unused-vars */ const path = require('path');
const relativePathToRuntimeRoot = path.relative(RUNTIME_PUBLIC_PATH, '.');
// Compute the relative path to the `distDir`.
const relativePathToDistRoot = path.join(relativePathToRuntimeRoot, RELATIVE_ROOT_PATH);
const RUNTIME_ROOT = path.resolve(__filename, relativePathToRuntimeRoot);
// Compute the absolute path to the root, by stripping distDir from the absolute path to this file.
const ABSOLUTE_ROOT = path.resolve(__filename, relativePathToDistRoot);
/**
 * Returns an absolute path to the given module path.
 * Module path should be relative, either path to a file or a directory.
 *
 * This fn allows to calculate an absolute path for some global static values, such as
 * `__dirname` or `import.meta.url` that Turbopack will not embeds in compile time.
 * See ImportMetaBinding::code_generation for the usage.
 */ function resolveAbsolutePath(modulePath) {
    if (modulePath) {
        return path.join(ABSOLUTE_ROOT, modulePath);
    }
    return ABSOLUTE_ROOT;
}
Context.prototype.P = resolveAbsolutePath;
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../shared/runtime/runtime-utils.ts" />
function readWebAssemblyAsResponse(path) {
    const { createReadStream } = require('fs');
    const { Readable } = require('stream');
    const stream = createReadStream(path);
    // @ts-ignore unfortunately there's a slight type mismatch with the stream.
    return new Response(Readable.toWeb(stream), {
        headers: {
            'content-type': 'application/wasm'
        }
    });
}
async function compileWebAssemblyFromPath(path) {
    const response = readWebAssemblyAsResponse(path);
    return await WebAssembly.compileStreaming(response);
}
async function instantiateWebAssemblyFromPath(path, importsObj) {
    const response = readWebAssemblyAsResponse(path);
    const { instance } = await WebAssembly.instantiateStreaming(response, importsObj);
    return instance.exports;
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="../../shared/runtime/runtime-utils.ts" />
/// <reference path="../../shared-node/base-externals-utils.ts" />
/// <reference path="../../shared-node/node-externals-utils.ts" />
/// <reference path="../../shared-node/node-wasm-utils.ts" />
/// <reference path="./nodejs-globals.d.ts" />
/**
 * Base Node.js runtime shared between production and development.
 * Contains chunk loading, module caching, and other non-HMR functionality.
 */ process.env.TURBOPACK = '1';
const url = require('url');
const moduleFactories = new Map();
const moduleCache = Object.create(null);
/**
 * Returns an absolute path to the given module's id.
 */ function resolvePathFromModule(moduleId) {
    const exported = this.r(moduleId);
    const exportedPath = exported?.default ?? exported;
    if (typeof exportedPath !== 'string') {
        return exported;
    }
    const strippedAssetPrefix = exportedPath.slice(ASSET_PREFIX.length);
    const resolved = path.resolve(RUNTIME_ROOT, strippedAssetPrefix);
    return url.pathToFileURL(resolved).href;
}
/**
 * Exports a URL value. No suffix is added in Node.js runtime.
 */ function exportUrl(urlValue, id) {
    exportValue.call(this, urlValue, id);
}
function loadRuntimeChunk(sourcePath, chunkData) {
    if (typeof chunkData === 'string') {
        loadRuntimeChunkPath(sourcePath, chunkData);
    } else {
        loadRuntimeChunkPath(sourcePath, chunkData.path);
    }
}
const loadedChunks = new Set();
const unsupportedLoadChunk = Promise.resolve(undefined);
const loadedChunk = Promise.resolve(undefined);
const chunkCache = new Map();
function clearChunkCache() {
    chunkCache.clear();
    loadedChunks.clear();
}
function loadRuntimeChunkPath(sourcePath, chunkPath) {
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return;
    }
    if (loadedChunks.has(chunkPath)) {
        return;
    }
    try {
        const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
        const chunkModules = requireChunk(chunkPath);
        installCompressedModuleFactories(chunkModules, 0, moduleFactories);
        loadedChunks.add(chunkPath);
    } catch (cause) {
        let errorMessage = `Failed to load chunk ${chunkPath}`;
        if (sourcePath) {
            errorMessage += ` from runtime for chunk ${sourcePath}`;
        }
        const error = new Error(errorMessage, {
            cause
        });
        error.name = 'ChunkLoadError';
        throw error;
    }
}
function loadChunkAsync(chunkData) {
    const chunkPath = typeof chunkData === 'string' ? chunkData : chunkData.path;
    if (!isJs(chunkPath)) {
        // We only support loading JS chunks in Node.js.
        // This branch can be hit when trying to load a CSS chunk.
        return unsupportedLoadChunk;
    }
    let entry = chunkCache.get(chunkPath);
    if (entry === undefined) {
        try {
            // resolve to an absolute path to simplify `require` handling
            const resolved = path.resolve(RUNTIME_ROOT, chunkPath);
            // TODO: consider switching to `import()` to enable concurrent chunk loading and async file io
            // However this is incompatible with hot reloading (since `import` doesn't use the require cache)
            const chunkModules = requireChunk(chunkPath);
            installCompressedModuleFactories(chunkModules, 0, moduleFactories);
            entry = loadedChunk;
        } catch (cause) {
            const errorMessage = `Failed to load chunk ${chunkPath} from module ${this.m.id}`;
            const error = new Error(errorMessage, {
                cause
            });
            error.name = 'ChunkLoadError';
            // Cache the failure promise, future requests will also get this same rejection
            entry = Promise.reject(error);
        }
        chunkCache.set(chunkPath, entry);
    }
    // TODO: Return an instrumented Promise that React can use instead of relying on referential equality.
    return entry;
}
contextPrototype.l = loadChunkAsync;
function loadChunkAsyncByUrl(chunkUrl) {
    const path1 = url.fileURLToPath(new URL(chunkUrl, RUNTIME_ROOT));
    return loadChunkAsync.call(this, path1);
}
contextPrototype.L = loadChunkAsyncByUrl;
async function loadWebAssembly(chunkPath, _edgeModule, imports) {
  const mod = await loadWasmChunk(chunkPath);
  const { exports } = await WebAssembly.instantiate(mod, imports);
  return exports;
}
contextPrototype.w = loadWebAssembly;
function loadWebAssemblyModule(chunkPath, _edgeModule) {
  return loadWasmChunk(chunkPath);
}
contextPrototype.u = loadWebAssemblyModule;
/**
 * Creates a Node.js worker thread by instantiating the given WorkerConstructor
 * with the appropriate path and options, including forwarded globals.
 *
 * @param WorkerConstructor The Worker constructor from worker_threads
 * @param workerPath Path to the worker entry chunk
 * @param workerOptions options to pass to the Worker constructor (optional)
 */ function createWorker(WorkerConstructor, workerPath, workerOptions) {
    // Build the forwarded globals object
    const forwardedGlobals = {};
    for (const name of WORKER_FORWARDED_GLOBALS){
        forwardedGlobals[name] = globalThis[name];
    }
    // Merge workerData with forwarded globals
    const existingWorkerData = workerOptions?.workerData || {};
    const options = {
        ...workerOptions,
        workerData: {
            ...typeof existingWorkerData === 'object' ? existingWorkerData : {},
            __turbopack_globals__: forwardedGlobals
        }
    };
    return new WorkerConstructor(workerPath, options);
}
const regexJsUrl = /\.js(?:\?[^#]*)?(?:#.*)?$/;
/**
 * Checks if a given path/URL ends with .js, optionally followed by ?query or #fragment.
 */ function isJs(chunkUrlOrPath) {
    return regexJsUrl.test(chunkUrlOrPath);
}
/* eslint-disable @typescript-eslint/no-unused-vars */ /// <reference path="./runtime-base.ts" />
/**
 * Production Node.js runtime.
 * Uses ModuleWithDirection and simple module instantiation without HMR support.
 */ // moduleCache and moduleFactories are declared in runtime-base.ts
// this is read in runtime-utils.ts so it creates a module with direction for hmr
createModuleWithDirectionFlag = true;
const nodeContextPrototype = Context.prototype;
nodeContextPrototype.q = exportUrl;
nodeContextPrototype.M = moduleFactories;
// Cast moduleCache to ModuleWithDirection for production mode
nodeContextPrototype.c = moduleCache;
nodeContextPrototype.R = resolvePathFromModule;
nodeContextPrototype.b = createWorker;
nodeContextPrototype.C = clearChunkCache;
function instantiateModule(id, sourceType, sourceData) {
    const moduleFactory = moduleFactories.get(id);
    if (typeof moduleFactory !== 'function') {
        // This can happen if modules incorrectly handle HMR disposes/updates,
        // e.g. when they keep a `setTimeout` around which still executes old code
        // and contains e.g. a `require("something")` call.
        throw new Error(factoryNotAvailableMessage(id, sourceType, sourceData));
    }
    const module1 = createModuleWithDirection(id);
    const exports = module1.exports;
    moduleCache[id] = module1;
    const context = new Context(module1, exports);
    // NOTE(alexkirsz) This can fail when the module encounters a runtime error.
    try {
        moduleFactory(context, module1, exports);
    } catch (error) {
        module1.error = error;
        throw error;
    }
    ;
    module1.loaded = true;
    if (module1.namespaceObject && module1.exports !== module1.namespaceObject) {
        // in case of a circular dependency: cjs1 -> esm2 -> cjs1
        interopEsm(module1.exports, module1.namespaceObject);
    }
    return module1;
}
/**
 * Retrieves a module from the cache, or instantiate it if it is not cached.
 */ // @ts-ignore
function getOrInstantiateModuleFromParent(id, sourceModule) {
    const module1 = moduleCache[id];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateModule(id, SourceType.Parent, sourceModule.id);
}
/**
 * Instantiates a runtime module.
 */ function instantiateRuntimeModule(chunkPath, moduleId) {
    return instantiateModule(moduleId, SourceType.Runtime, chunkPath);
}
/**
 * Retrieves a module from the cache, or instantiate it as a runtime module if it is not cached.
 */ // @ts-ignore TypeScript doesn't separate this module space from the browser runtime
function getOrInstantiateRuntimeModule(chunkPath, moduleId) {
    const module1 = moduleCache[moduleId];
    if (module1) {
        if (module1.error) {
            throw module1.error;
        }
        return module1;
    }
    return instantiateRuntimeModule(chunkPath, moduleId);
}
module.exports = (sourcePath)=>({
        m: (id)=>getOrInstantiateRuntimeModule(sourcePath, id),
        c: (chunkData)=>loadRuntimeChunk(sourcePath, chunkData)
    });


//# sourceMappingURL=%5Bturbopack%5D_runtime.js.map

  function requireChunk(chunkPath) {
    switch(chunkPath) {
      case "server/chunks/ssr/029y_next_0m8ax2.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_0m8ax2.._.js");
      case "server/chunks/ssr/029y_next_dist_02__i27._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_02__i27._.js");
      case "server/chunks/ssr/029y_next_dist_096rzp7._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_096rzp7._.js");
      case "server/chunks/ssr/029y_next_dist_0g_45yg._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_0g_45yg._.js");
      case "server/chunks/ssr/029y_next_dist_client_components_0t.ff2b._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_client_components_0t.ff2b._.js");
      case "server/chunks/ssr/029y_next_dist_client_components_133o11l._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_client_components_133o11l._.js");
      case "server/chunks/ssr/029y_next_dist_client_components_builtin_unauthorized_0.jq0ze.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_client_components_builtin_unauthorized_0.jq0ze.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_113gxwj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_113gxwj.js");
      case "server/chunks/ssr/[root-of-the-server]__0cfyb6f._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0cfyb6f._.js");
      case "server/chunks/ssr/[root-of-the-server]__0fnbibq._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0fnbibq._.js");
      case "server/chunks/ssr/[root-of-the-server]__0m5xi07._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0m5xi07._.js");
      case "server/chunks/ssr/[root-of-the-server]__0nbryu3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0nbryu3._.js");
      case "server/chunks/ssr/[root-of-the-server]__0vy5kft._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vy5kft._.js");
      case "server/chunks/ssr/[turbopack]_runtime.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[turbopack]_runtime.js");
      case "server/chunks/ssr/_0hlp4k.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0hlp4k.._.js");
      case "server/chunks/ssr/_0u2k1j4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0u2k1j4._.js");
      case "server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0eq97pa.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__not-found_page_actions_0eq97pa.js");
      case "server/chunks/ssr/node_modules__pnpm_110_q1g._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/node_modules__pnpm_110_q1g._.js");
      case "server/chunks/ssr/src_app_error_tsx_05yscq4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_error_tsx_05yscq4._.js");
      case "server/chunks/ssr/src_app_error_tsx_0oqfei_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_error_tsx_0oqfei_._.js");
      case "server/chunks/ssr/src_app_loading_tsx_00w_nei._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_loading_tsx_00w_nei._.js");
      case "server/chunks/ssr/src_components_0f4-x8z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_0f4-x8z._.js");
      case "server/chunks/ssr/src_components_layout_Navbar_ProfileDrawer_tsx_046p214._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_layout_Navbar_ProfileDrawer_tsx_046p214._.js");
      case "server/chunks/ssr/029y_next_dist_client_components_builtin_global-error_02eqo~m.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_client_components_builtin_global-error_02eqo~m.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0e_-e13.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0e_-e13.js");
      case "server/chunks/ssr/[root-of-the-server]__052~o-2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__052~o-2._.js");
      case "server/chunks/ssr/[root-of-the-server]__0wxbo~x._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0wxbo~x._.js");
      case "server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0k77kol.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app__global-error_page_actions_0k77kol.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0paeyb6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0paeyb6.js");
      case "server/chunks/ssr/[root-of-the-server]__009vpqd._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__009vpqd._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_ChatSupportPage_page_actions_081tzit.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_ChatSupportPage_page_actions_081tzit.js");
      case "server/chunks/ssr/src_app_admin_ChatSupportPage_chatSupport_tsx_0xqp0fm._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_ChatSupportPage_chatSupport_tsx_0xqp0fm._.js");
      case "server/chunks/ssr/src_app_admin_layout_tsx_0.21y4x._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_layout_tsx_0.21y4x._.js");
      case "server/chunks/ssr/src_app_admin_layout_tsx_09lym7.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_layout_tsx_09lym7.._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12--xy7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12--xy7.js");
      case "server/chunks/ssr/[root-of-the-server]__0ms45-o._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ms45-o._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_ChatSupportPage_reply_page_actions_0-5i~r2.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_ChatSupportPage_reply_page_actions_0-5i~r2.js");
      case "server/chunks/ssr/src_app_admin_ChatSupportPage_chatsupporReplyPage_tsx_07o_bop._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_ChatSupportPage_chatsupporReplyPage_tsx_07o_bop._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0e4l8w9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0e4l8w9.js");
      case "server/chunks/ssr/[root-of-the-server]__0pwg8ku._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pwg8ku._.js");
      case "server/chunks/ssr/_0bx.71d._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0bx.71d._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_chat-sessions_page_actions_00-jam~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_chat-sessions_page_actions_00-jam~.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_.41fe.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_.41fe.js");
      case "server/chunks/ssr/[root-of-the-server]__0a~ze5_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0a~ze5_._.js");
      case "server/chunks/ssr/_00m92y9._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_00m92y9._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_dining_page_actions_00-t7yr.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_dining_page_actions_00-t7yr.js");
      case "server/chunks/ssr/src_app_admin_dining_page_tsx_0ppup.z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_dining_page_tsx_0ppup.z._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0wjrf25.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0wjrf25.js");
      case "server/chunks/ssr/[root-of-the-server]__0y.ihrj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0y.ihrj._.js");
      case "server/chunks/ssr/_0z3s3-n._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0z3s3-n._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_events_page_actions_0vwwn25.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_events_page_actions_0vwwn25.js");
      case "server/chunks/ssr/src_app_admin_events_page_tsx_05zeqkk._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_events_page_tsx_05zeqkk._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0hjrc.4.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0hjrc.4.js");
      case "server/chunks/ssr/[root-of-the-server]__03dei3l._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03dei3l._.js");
      case "server/chunks/ssr/_0qouqrv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0qouqrv._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_login_page_actions_01851m~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_login_page_actions_01851m~.js");
      case "server/chunks/ssr/src_lib_utils_otp-state_ts_0-bgub3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_lib_utils_otp-state_ts_0-bgub3._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0n7xdpd.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0n7xdpd.js");
      case "server/chunks/ssr/[root-of-the-server]__01j-1ns._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__01j-1ns._.js");
      case "server/chunks/ssr/_0oar-~c._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0oar-~c._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_newadminpanel_page_actions_0bzgbgo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_newadminpanel_page_actions_0bzgbgo.js");
      case "server/chunks/ssr/src_app_admin_newadminpanel_page_tsx_07p.d9o._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_newadminpanel_page_tsx_07p.d9o._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0mjyxuc.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0mjyxuc.js");
      case "server/chunks/ssr/[root-of-the-server]__0bxg5_e._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0bxg5_e._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_create_page_actions_11cavlh.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_create_page_actions_11cavlh.js");
      case "server/chunks/ssr/src_app_admin_offers_create_page_tsx_0_ph5z_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_offers_create_page_tsx_0_ph5z_._.js");
      case "server/chunks/ssr/src_app_admin_offers_layout_tsx_0omt213._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_offers_layout_tsx_0omt213._.js");
      case "server/chunks/ssr/src_app_admin_offers_layout_tsx_0~kzypn._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_offers_layout_tsx_0~kzypn._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-wzvpo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-wzvpo.js");
      case "server/chunks/ssr/[root-of-the-server]__0dpujmu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0dpujmu._.js");
      case "server/chunks/ssr/_0nwcvrr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0nwcvrr._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_createcoupon_page_actions_0moha~p.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_createcoupon_page_actions_0moha~p.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0rxrmil.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0rxrmil.js");
      case "server/chunks/ssr/[root-of-the-server]__0zh1s6w._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0zh1s6w._.js");
      case "server/chunks/ssr/_03a8--t._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_03a8--t._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_createoffer_page_actions_0fcw3ok.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_createoffer_page_actions_0fcw3ok.js");
      case "server/chunks/ssr/029y_next_dist_0qrm13b._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_0qrm13b._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0832e92.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0832e92.js");
      case "server/chunks/ssr/[root-of-the-server]__0q3i~1p._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0q3i~1p._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_page_actions_12a48xs.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_page_actions_12a48xs.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b0pk2y.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b0pk2y.js");
      case "server/chunks/ssr/[root-of-the-server]__0kifm6~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0kifm6~._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_view_page_actions_0evairp.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_view_page_actions_0evairp.js");
      case "server/chunks/ssr/src_app_admin_offers_view_page_tsx_0.b99vn._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_offers_view_page_tsx_0.b99vn._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_00evngb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_00evngb.js");
      case "server/chunks/ssr/[root-of-the-server]__12sr_~r._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12sr_~r._.js");
      case "server/chunks/ssr/_0ng6lml._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0ng6lml._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_viewcoupon_page_actions_0v-.54x.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_viewcoupon_page_actions_0v-.54x.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fmefiv.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fmefiv.js");
      case "server/chunks/ssr/[root-of-the-server]__0~1arf5._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0~1arf5._.js");
      case "server/chunks/ssr/_0p80lnl._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0p80lnl._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_offers_viewoffer_page_actions_0s9.-kd.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_offers_viewoffer_page_actions_0s9.-kd.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_110li7j.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_110li7j.js");
      case "server/chunks/ssr/0zjb_server_app_admin_organizers_[id]_agreement_[category]_page_actions_0u50mqf.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0zjb_server_app_admin_organizers_[id]_agreement_[category]_page_actions_0u50mqf.js");
      case "server/chunks/ssr/[root-of-the-server]__0mx0ktk._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0mx0ktk._.js");
      case "server/chunks/ssr/_0eqkuv3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0eqkuv3._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_09qpe~b.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_09qpe~b.js");
      case "server/chunks/ssr/[root-of-the-server]__07u8rrh._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__07u8rrh._.js");
      case "server/chunks/ssr/_0-x271q._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0-x271q._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_organizers_[id]_pan-card_page_actions_0q6y~n9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_organizers_[id]_pan-card_page_actions_0q6y~n9.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_7iba4.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_7iba4.js");
      case "server/chunks/ssr/[root-of-the-server]__0yua2ec._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0yua2ec._.js");
      case "server/chunks/ssr/_0k9ll-j._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0k9ll-j._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_organizers_page_actions_06r4w9a.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_organizers_page_actions_06r4w9a.js");
      case "server/chunks/ssr/src_app_admin_organizers_page_tsx_13v2d7u._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_organizers_page_tsx_13v2d7u._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vd49w9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vd49w9.js");
      case "server/chunks/ssr/[root-of-the-server]__04dnnrs._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__04dnnrs._.js");
      case "server/chunks/ssr/_03xb_4u._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_03xb_4u._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_page_actions_0ycnu8f.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_page_actions_0ycnu8f.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_06l~lpw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_06l~lpw.js");
      case "server/chunks/ssr/[root-of-the-server]__0uiq~7a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0uiq~7a._.js");
      case "server/chunks/ssr/_07lig2q._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_07lig2q._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_pass_create_page_actions_0x3i86k.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_pass_create_page_actions_0x3i86k.js");
      case "server/chunks/ssr/src_app_admin_pass_layout_tsx_0cpczfv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_pass_layout_tsx_0cpczfv._.js");
      case "server/chunks/ssr/src_app_admin_pass_layout_tsx_115jlhf._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_pass_layout_tsx_115jlhf._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0xta0li.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0xta0li.js");
      case "server/chunks/ssr/[root-of-the-server]__0l23yj8._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0l23yj8._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_pass_page_actions_0q_nhgf.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_pass_page_actions_0q_nhgf.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-ithzg.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-ithzg.js");
      case "server/chunks/ssr/[root-of-the-server]__0jy..b3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0jy..b3._.js");
      case "server/chunks/ssr/_0cd-w5k._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0cd-w5k._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_pass_view_page_actions_0apsm59.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_pass_view_page_actions_0apsm59.js");
      case "server/chunks/ssr/029y_next_0l3phb3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_0l3phb3._.js");
      case "server/chunks/ssr/029y_next_dist_0wpgf9s._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_0wpgf9s._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0a.xwva.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0a.xwva.js");
      case "server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_0urh--l._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_0urh--l._.js");
      case "server/chunks/ssr/[root-of-the-server]__030ozko._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__030ozko._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_payouts_page_actions_0__nsd1.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_payouts_page_actions_0__nsd1.js");
      case "server/chunks/ssr/src_components_admin_AdminPayoutsClient_tsx_0rh080g._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_admin_AdminPayoutsClient_tsx_0rh080g._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ndjdp5.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ndjdp5.js");
      case "server/chunks/ssr/[root-of-the-server]__0u1_gs7._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0u1_gs7._.js");
      case "server/chunks/ssr/_0y8rx~r._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0y8rx~r._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_play_[id]_format_page_actions_0baw0sd.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_play_[id]_format_page_actions_0baw0sd.js");
      case "server/chunks/ssr/src_app_admin_play_[id]_format_page_tsx_0vmx87z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_play_[id]_format_page_tsx_0vmx87z._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-c2.m..js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-c2.m..js");
      case "server/chunks/ssr/[root-of-the-server]__0eca558._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0eca558._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_play_page_actions_08x4h3n.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_play_page_actions_08x4h3n.js");
      case "server/chunks/ssr/src_app_admin_play_page_tsx_0nks7wv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_play_page_tsx_0nks7wv._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0qxq8.~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0qxq8.~.js");
      case "server/chunks/ssr/[root-of-the-server]__0ds--dl._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ds--dl._.js");
      case "server/chunks/ssr/_08mykvc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_08mykvc._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_push-notification_page_actions_01u3r2h.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_push-notification_page_actions_01u3r2h.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_06a_b~..js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_06a_b~..js");
      case "server/chunks/ssr/[root-of-the-server]__0ba3cog._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ba3cog._.js");
      case "server/chunks/ssr/_0b9s5iu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0b9s5iu._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_receipt-verification_page_actions_0x_8g_v.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_receipt-verification_page_actions_0x_8g_v.js");
      case "server/chunks/ssr/src_app_admin_receipt-verification_page_tsx_0_yiy_y._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_receipt-verification_page_tsx_0_yiy_y._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_13agj9r.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_13agj9r.js");
      case "server/chunks/ssr/[root-of-the-server]__0hzrqzy._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hzrqzy._.js");
      case "server/chunks/ssr/_12_59gj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_12_59gj._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details_page_actions_1157rrv.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details_page_actions_1157rrv.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-1sqof.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-1sqof.js");
      case "server/chunks/ssr/[root-of-the-server]__0erf19i._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0erf19i._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details-activity_page_actions_0mtu1wz.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details-activity_page_actions_0mtu1wz.js");
      case "server/chunks/ssr/src_app_admin_UserDetails_userdetails5_tsx_12us9e5._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_UserDetails_userdetails5_tsx_12us9e5._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0503key.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0503key.js");
      case "server/chunks/ssr/[root-of-the-server]__0vqp4i1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vqp4i1._.js");
      case "server/chunks/ssr/_11w_se.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_11w_se.._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details-bookings_page_actions_105x-9c.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details-bookings_page_actions_105x-9c.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0m2qc.~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0m2qc.~.js");
      case "server/chunks/ssr/[root-of-the-server]__0tz~nl2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0tz~nl2._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details-offers_page_actions_014m2_v.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details-offers_page_actions_014m2_v.js");
      case "server/chunks/ssr/src_app_admin_UserDetails_userdetails2_2_tsx_0ilefk4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_UserDetails_userdetails2_2_tsx_0ilefk4._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0nng6qw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0nng6qw.js");
      case "server/chunks/ssr/[root-of-the-server]__06p5f3h._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__06p5f3h._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details-ticlists_page_actions_0otticu.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details-ticlists_page_actions_0otticu.js");
      case "server/chunks/ssr/src_app_admin_UserDetails_userdetails4_tsx_0_jiec~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_UserDetails_userdetails4_tsx_0_jiec~._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_04r20lb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_04r20lb.js");
      case "server/chunks/ssr/[root-of-the-server]__0fnq-bx._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0fnq-bx._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details-view_page_actions_096c0am.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details-view_page_actions_096c0am.js");
      case "server/chunks/ssr/src_app_admin_UserDetails_userDetails2_tsx_09hdrvt._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_UserDetails_userDetails2_tsx_09hdrvt._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0m5ijex.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0m5ijex.js");
      case "server/chunks/ssr/[root-of-the-server]__0la8o5j._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0la8o5j._.js");
      case "server/chunks/ssr/_next-internal_server_app_admin_user-details-view-next_page_actions_0skalq5.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_admin_user-details-view-next_page_actions_0skalq5.js");
      case "server/chunks/ssr/src_app_admin_UserDetails_userdetails2_1_tsx_08fy192._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_admin_UserDetails_userdetails2_1_tsx_08fy192._.js");
      case "server/chunks/[externals]_next_dist_0arv.vj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/[externals]_next_dist_0arv.vj._.js");
      case "server/chunks/[root-of-the-server]__08fuen-._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/[root-of-the-server]__08fuen-._.js");
      case "server/chunks/[turbopack]_runtime.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/[turbopack]_runtime.js");
      case "server/chunks/_next-internal_server_app_api_chat_groq_route_actions_0l96hlo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/_next-internal_server_app_api_chat_groq_route_actions_0l96hlo.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01h651j.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01h651j.js");
      case "server/chunks/ssr/0dub_html2canvas_dist_html2canvas_esm_0i5e2on.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0dub_html2canvas_dist_html2canvas_esm_0i5e2on.js");
      case "server/chunks/ssr/[externals]_path_0.09pfe._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[externals]_path_0.09pfe._.js");
      case "server/chunks/ssr/[root-of-the-server]__0s2qhll._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0s2qhll._.js");
      case "server/chunks/ssr/[root-of-the-server]__0vf3z-0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vf3z-0._.js");
      case "server/chunks/ssr/_0i~nfo3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0i~nfo3._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_[id]_page_actions_0oqdi64.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_[id]_page_actions_0oqdi64.js");
      case "server/chunks/ssr/src_app_bookings_[id]_page_tsx_0-c_950._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_[id]_page_tsx_0-c_950._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12_lnkk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12_lnkk.js");
      case "server/chunks/ssr/[root-of-the-server]__0u05xju._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0u05xju._.js");
      case "server/chunks/ssr/_0rtcjrc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0rtcjrc._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_dining_[id]_page_actions_12~m~~h.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_dining_[id]_page_actions_12~m~~h.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fbj21o.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fbj21o.js");
      case "server/chunks/ssr/[root-of-the-server]__0tq~eaf._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0tq~eaf._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_dining_page_actions_01a2wsp.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_dining_page_actions_01a2wsp.js");
      case "server/chunks/ssr/src_app_bookings_dining_page_tsx_07acmiq._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_dining_page_tsx_07acmiq._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_1189pqv.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_1189pqv.js");
      case "server/chunks/ssr/[root-of-the-server]__08z_lj1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__08z_lj1._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_dining-tickets_page_actions_0pbd3on.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_dining-tickets_page_actions_0pbd3on.js");
      case "server/chunks/ssr/src_app_bookings_dining-tickets_page_tsx_0~nvbrv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_dining-tickets_page_tsx_0~nvbrv._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12555po.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12555po.js");
      case "server/chunks/ssr/[root-of-the-server]__07if.m.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__07if.m.._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_event-tickets_page_actions_0hzcpvd.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_event-tickets_page_actions_0hzcpvd.js");
      case "server/chunks/ssr/src_app_bookings_event-tickets_page_tsx_0vxpg8k._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_event-tickets_page_tsx_0vxpg8k._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0r2db49.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0r2db49.js");
      case "server/chunks/ssr/[root-of-the-server]__0o9a4iw._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0o9a4iw._.js");
      case "server/chunks/ssr/_0gx2qdw._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0gx2qdw._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_events_[id]_page_actions_0nfrm6b.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_events_[id]_page_actions_0nfrm6b.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b53rf8.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b53rf8.js");
      case "server/chunks/ssr/[root-of-the-server]__04ihyjt._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__04ihyjt._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_events_page_actions_04xx7n6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_events_page_actions_04xx7n6.js");
      case "server/chunks/ssr/src_app_bookings_events_page_tsx_0_z6x~a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_events_page_tsx_0_z6x~a._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01fq8-q.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01fq8-q.js");
      case "server/chunks/ssr/[root-of-the-server]__0cccllt._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0cccllt._.js");
      case "server/chunks/ssr/_0v4q5ia._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0v4q5ia._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_page_actions_0h888yp.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_page_actions_0h888yp.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-wqfmj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-wqfmj.js");
      case "server/chunks/ssr/10dd_qrcode_react_lib_esm_index_0-fdoev.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/10dd_qrcode_react_lib_esm_index_0-fdoev.js");
      case "server/chunks/ssr/[root-of-the-server]__0w~bnwt._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0w~bnwt._.js");
      case "server/chunks/ssr/_0cqj1kp._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0cqj1kp._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_play_[id]_page_actions_0u41s19.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_play_[id]_page_actions_0u41s19.js");
      case "server/chunks/ssr/src_app_bookings_play_[id]_page_tsx_0xyr6h_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_play_[id]_page_tsx_0xyr6h_._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0v3x4k0.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0v3x4k0.js");
      case "server/chunks/ssr/[root-of-the-server]__0r21zpo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r21zpo._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_play_page_actions_0tmi8e8.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_play_page_actions_0tmi8e8.js");
      case "server/chunks/ssr/src_app_bookings_play_page_tsx_02ewl6j._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_play_page_tsx_02ewl6j._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b6fr7..js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b6fr7..js");
      case "server/chunks/ssr/[root-of-the-server]__0zpwhlz._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0zpwhlz._.js");
      case "server/chunks/ssr/_next-internal_server_app_bookings_play-tickets_page_actions_11u2qgj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_bookings_play-tickets_page_actions_11u2qgj.js");
      case "server/chunks/ssr/src_app_bookings_play-tickets_page_tsx_0w-z844._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_bookings_play-tickets_page_tsx_0w-z844._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0tf2z28.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0tf2z28.js");
      case "server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_07-jbco._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_07-jbco._.js");
      case "server/chunks/ssr/[root-of-the-server]__0s2yl1i._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0s2yl1i._.js");
      case "server/chunks/ssr/_next-internal_server_app_chat-support_page_actions_074dy.w.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_chat-support_page_actions_074dy.w.js");
      case "server/chunks/ssr/src_app_chat-support_page_tsx_139ukqr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_chat-support_page_tsx_139ukqr._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0im9b.n.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0im9b.n.js");
      case "server/chunks/ssr/[root-of-the-server]__0sy0uys._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0sy0uys._.js");
      case "server/chunks/ssr/_0e~22p7._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0e~22p7._.js");
      case "server/chunks/ssr/_next-internal_server_app_chat-support_session_page_actions_0_4j.un.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_chat-support_session_page_actions_0_4j.un.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_jkx6y.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_jkx6y.js");
      case "server/chunks/ssr/[root-of-the-server]__0.ftsuu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0.ftsuu._.js");
      case "server/chunks/ssr/_next-internal_server_app_chat-with-us_page_actions_0c6dceb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_chat-with-us_page_actions_0c6dceb.js");
      case "server/chunks/ssr/src_app_chat-with-us_page_tsx_0lc2gce._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_chat-with-us_page_tsx_0lc2gce._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ys.k_w.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ys.k_w.js");
      case "server/chunks/ssr/[root-of-the-server]__03pl8ni._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03pl8ni._.js");
      case "server/chunks/ssr/_0hneke1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0hneke1._.js");
      case "server/chunks/ssr/_next-internal_server_app_contact_page_actions_0bxfoqb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_contact_page_actions_0bxfoqb.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0q-ozes.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0q-ozes.js");
      case "server/chunks/ssr/[root-of-the-server]__0y586lz._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0y586lz._.js");
      case "server/chunks/ssr/_0zev9ld._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0zev9ld._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_bar-bites_page_actions_0m52rnx.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_bar-bites_page_actions_0m52rnx.js");
      case "server/chunks/ssr/src_0-ggjyg._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0-ggjyg._.js");
      case "server/chunks/ssr/src_app_dining_layout_tsx_0f6pmln._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_layout_tsx_0f6pmln._.js");
      case "server/chunks/ssr/src_app_dining_layout_tsx_0r2i-wc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_layout_tsx_0r2i-wc._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-ck.xo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-ck.xo.js");
      case "server/chunks/ssr/[root-of-the-server]__0bkes8_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0bkes8_._.js");
      case "server/chunks/ssr/_0ex621e._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0ex621e._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_cafe-vibes_page_actions_09fkp02.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_cafe-vibes_page_actions_09fkp02.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_069c8i9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_069c8i9.js");
      case "server/chunks/ssr/[root-of-the-server]__12ch.ub._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12ch.ub._.js");
      case "server/chunks/ssr/_0owz1c1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0owz1c1._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_club-chill_page_actions_0c.y-~m.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_club-chill_page_actions_0c.y-~m.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0pw8~h~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0pw8~h~.js");
      case "server/chunks/ssr/[root-of-the-server]__01sv0ds._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__01sv0ds._.js");
      case "server/chunks/ssr/_0jcumoz._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0jcumoz._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_create_page_actions_03qk5y~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_create_page_actions_03qk5y~.js");
      case "server/chunks/ssr/src_app_dining_create_page_tsx_0p-ap_l._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_create_page_tsx_0p-ap_l._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0o_k0ab.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0o_k0ab.js");
      case "server/chunks/ssr/[root-of-the-server]__0r.j7kp._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r.j7kp._.js");
      case "server/chunks/ssr/_09.3~~u._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_09.3~~u._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_edit_[id]_page_actions_0o9d5hp.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_edit_[id]_page_actions_0o9d5hp.js");
      case "server/chunks/ssr/src_app_dining_edit_[id]_page_tsx_02.71i2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_edit_[id]_page_tsx_02.71i2._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0.bhp84.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0.bhp84.js");
      case "server/chunks/ssr/[root-of-the-server]__0pdr.-x._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pdr.-x._.js");
      case "server/chunks/ssr/_0c15pmr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0c15pmr._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_family-favourites_page_actions_0agopx7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_family-favourites_page_actions_0agopx7.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0owblj9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0owblj9.js");
      case "server/chunks/ssr/[root-of-the-server]__04sbwvk._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__04sbwvk._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_page_actions_0hwppl9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_page_actions_0hwppl9.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-6w87h.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-6w87h.js");
      case "server/chunks/ssr/[root-of-the-server]__0bkk8dv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0bkk8dv._.js");
      case "server/chunks/ssr/_07ak_1l._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_07ak_1l._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_premium-dining_page_actions_06vtqi6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_premium-dining_page_actions_06vtqi6.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0n570ta.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0n570ta.js");
      case "server/chunks/ssr/[root-of-the-server]__0cvxu8g._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0cvxu8g._.js");
      case "server/chunks/ssr/_0sd~-m4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0sd~-m4._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_pure-veg_page_actions_0w1y_25.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_pure-veg_page_actions_0w1y_25.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_07j6v33.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_07j6v33.js");
      case "server/chunks/ssr/[root-of-the-server]__0c7m2k4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0c7m2k4._.js");
      case "server/chunks/ssr/_0jdvf_j._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0jdvf_j._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_venue_[name]_book_page_actions_0wi0x41.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_venue_[name]_book_page_actions_0wi0x41.js");
      case "server/chunks/ssr/src_app_dining_venue_[name]_book_page_tsx_0mys~12._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_venue_[name]_book_page_tsx_0mys~12._.js");
      case "server/chunks/ssr/src_app_dining_venue_[name]_loading_tsx_05hrbxo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_venue_[name]_loading_tsx_05hrbxo._.js");
      case "server/chunks/ssr/src_components_modals_AuthModal_tsx_0rn6h2i._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_modals_AuthModal_tsx_0rn6h2i._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0wh7xqk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0wh7xqk.js");
      case "server/chunks/ssr/[root-of-the-server]__00p.x3~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__00p.x3~._.js");
      case "server/chunks/ssr/_0zsr6s1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0zsr6s1._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_venue_[name]_book_review_page_actions_0zt-qif.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_venue_[name]_book_review_page_actions_0zt-qif.js");
      case "server/chunks/ssr/src_app_dining_venue_[name]_book_review_page_tsx_0qgqlox._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_dining_venue_[name]_book_review_page_tsx_0qgqlox._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0wgd1.d.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0wgd1.d.js");
      case "server/chunks/ssr/0i2y_sonner_dist_index_mjs_10e3y~x._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0i2y_sonner_dist_index_mjs_10e3y~x._.js");
      case "server/chunks/ssr/[root-of-the-server]__0vjv~f-._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vjv~f-._.js");
      case "server/chunks/ssr/_0w4kbfa._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0w4kbfa._.js");
      case "server/chunks/ssr/_next-internal_server_app_dining_venue_[name]_page_actions_0ohjaj3.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_dining_venue_[name]_page_actions_0ohjaj3.js");
      case "server/chunks/ssr/src_0_gob_q._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0_gob_q._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0i8~ktq.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0i8~ktq.js");
      case "server/chunks/ssr/[root-of-the-server]__0vinag_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vinag_._.js");
      case "server/chunks/ssr/_0lg8-a8._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0lg8-a8._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_[name]_book_page_actions_03m2lxh.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_[name]_book_page_actions_03m2lxh.js");
      case "server/chunks/ssr/src_0x_7f3s._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0x_7f3s._.js");
      case "server/chunks/ssr/src_app_events_[name]_book_page_tsx_0l0bloh._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_[name]_book_page_tsx_0l0bloh._.js");
      case "server/chunks/ssr/src_app_events_[name]_loading_tsx_0134wmh._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_[name]_loading_tsx_0134wmh._.js");
      case "server/chunks/ssr/src_app_events_layout_tsx_0d8q7oc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_layout_tsx_0d8q7oc._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0eu2ipk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0eu2ipk.js");
      case "server/chunks/ssr/[root-of-the-server]__12l5~my._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12l5~my._.js");
      case "server/chunks/ssr/_0l2_k3z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0l2_k3z._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_[name]_book_review_page_actions_03wzavv.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_[name]_book_review_page_actions_03wzavv.js");
      case "server/chunks/ssr/src_app_events_[name]_book_review_page_tsx_0ndgcwc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_[name]_book_review_page_tsx_0ndgcwc._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02qaasr.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02qaasr.js");
      case "server/chunks/ssr/0zjb_server_app_events_[name]_book_tickets_[category]_page_actions_0_2g112.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0zjb_server_app_events_[name]_book_tickets_[category]_page_actions_0_2g112.js");
      case "server/chunks/ssr/[root-of-the-server]__045c4n3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__045c4n3._.js");
      case "server/chunks/ssr/_0rhwj8e._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0rhwj8e._.js");
      case "server/chunks/ssr/src_app_events_[name]_book_tickets_[category]_page_tsx_0sqeqjw._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_[name]_book_tickets_[category]_page_tsx_0sqeqjw._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_08f1n7y.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_08f1n7y.js");
      case "server/chunks/ssr/[root-of-the-server]__02y1cqj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__02y1cqj._.js");
      case "server/chunks/ssr/[root-of-the-server]__10mr6-a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__10mr6-a._.js");
      case "server/chunks/ssr/_0j_us-a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0j_us-a._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_[name]_page_actions_045g8yy.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_[name]_page_actions_045g8yy.js");
      case "server/chunks/ssr/src_0jql67y._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0jql67y._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vag~q4.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vag~q4.js");
      case "server/chunks/ssr/[root-of-the-server]__0uo6z-n._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0uo6z-n._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_artist_[id]_page_actions_0ce8rbr.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_artist_[id]_page_actions_0ce8rbr.js");
      case "server/chunks/ssr/src_0y5dm0l._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0y5dm0l._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01ag41b.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01ag41b.js");
      case "server/chunks/ssr/[root-of-the-server]__03qjuht._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__03qjuht._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_comedy_page_actions_069zw2j.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_comedy_page_actions_069zw2j.js");
      case "server/chunks/ssr/src_0.t0q-1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0.t0q-1._.js");
      case "server/chunks/ssr/src_0_bm1up._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0_bm1up._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12xr53~.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12xr53~.js");
      case "server/chunks/ssr/[root-of-the-server]__09ibr93._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__09ibr93._.js");
      case "server/chunks/ssr/_0niy7ow._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0niy7ow._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_create_page_actions_0kszubw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_create_page_actions_0kszubw.js");
      case "server/chunks/ssr/src_app_events_create_page_tsx_0m.nc73._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_create_page_tsx_0m.nc73._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_05gb-ub.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_05gb-ub.js");
      case "server/chunks/ssr/[root-of-the-server]__0u3a5s5._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0u3a5s5._.js");
      case "server/chunks/ssr/_0yw514b._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0yw514b._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_edit_[id]_page_actions_0x4luo0.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_edit_[id]_page_actions_0x4luo0.js");
      case "server/chunks/ssr/src_app_events_edit_[id]_page_tsx_0nxzqn.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_edit_[id]_page_tsx_0nxzqn.._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fnjbe4.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fnjbe4.js");
      case "server/chunks/ssr/[root-of-the-server]__0y3a38z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0y3a38z._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_fests-fairs_page_actions_0qwaodk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_fests-fairs_page_actions_0qwaodk.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12fa7vj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12fa7vj.js");
      case "server/chunks/ssr/[root-of-the-server]__039prvo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__039prvo._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_fitness_page_actions_0elu8iv.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_fitness_page_actions_0elu8iv.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_10i8.-g.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_10i8.-g.js");
      case "server/chunks/ssr/[root-of-the-server]__0iog3o_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0iog3o_._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_food-drinks_page_actions_0.9b8x0.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_food-drinks_page_actions_0.9b8x0.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_03ajdol.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_03ajdol.js");
      case "server/chunks/ssr/[root-of-the-server]__0ct--9t._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ct--9t._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_music_page_actions_0sk7hvd.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_music_page_actions_0sk7hvd.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_13bjes..js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_13bjes..js");
      case "server/chunks/ssr/[root-of-the-server]__06.ivbx._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__06.ivbx._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_night-life_page_actions_0ovilva.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_night-life_page_actions_0ovilva.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0qs9.j7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0qs9.j7.js");
      case "server/chunks/ssr/[root-of-the-server]__0v6jnhy._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0v6jnhy._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_open-mic_page_actions_09kz21e.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_open-mic_page_actions_09kz21e.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vtia8r.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vtia8r.js");
      case "server/chunks/ssr/[root-of-the-server]__0nzxtvy._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0nzxtvy._.js");
      case "server/chunks/ssr/_0.24yhk._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0.24yhk._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_page_actions_0cuaq1f.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_page_actions_0cuaq1f.js");
      case "server/chunks/ssr/src_app_events_EventsClient_tsx_0zm-cg4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_events_EventsClient_tsx_0zm-cg4._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_10k4e9z.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_10k4e9z.js");
      case "server/chunks/ssr/[root-of-the-server]__0ki2-3t._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ki2-3t._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_performance_page_actions_0..mgn6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_performance_page_actions_0..mgn6.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11r_w42.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11r_w42.js");
      case "server/chunks/ssr/[root-of-the-server]__0rxipmu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rxipmu._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_screenings_page_actions_0e_zp82.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_screenings_page_actions_0e_zp82.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-1op65.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-1op65.js");
      case "server/chunks/ssr/[root-of-the-server]__0f5jyw1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0f5jyw1._.js");
      case "server/chunks/ssr/_next-internal_server_app_events_sports_page_actions_0t58fdt.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_events_sports_page_actions_0t58fdt.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12wasmb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12wasmb.js");
      case "server/chunks/ssr/[root-of-the-server]__0o0lyw~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0o0lyw~._.js");
      case "server/chunks/ssr/_0~k5b07._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0~k5b07._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_Login_page_actions_13g-_.2.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_Login_page_actions_13g-_.2.js");
      case "server/chunks/ssr/src_app_list-your-dining_layout_tsx_03bue14._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_layout_tsx_03bue14._.js");
      case "server/chunks/ssr/src_app_list-your-dining_layout_tsx_0mazjee._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_layout_tsx_0mazjee._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0q.nwwb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0q.nwwb.js");
      case "server/chunks/ssr/[root-of-the-server]__0.--gch._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0.--gch._.js");
      case "server/chunks/ssr/_0h6jg_2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0h6jg_2._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_Signin_page_actions_0.wcqde.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_Signin_page_actions_0.wcqde.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01phqhk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01phqhk.js");
      case "server/chunks/ssr/[root-of-the-server]__0-lw5u~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0-lw5u~._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_otp_page_actions_0wubtk0.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_otp_page_actions_0wubtk0.js");
      case "server/chunks/ssr/src_0drqiwr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0drqiwr._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_00n1g.t.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_00n1g.t.js");
      case "server/chunks/ssr/[root-of-the-server]__05in076._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__05in076._.js");
      case "server/chunks/ssr/_0igxfvi._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0igxfvi._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_page_actions_13a5doz.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_page_actions_13a5doz.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0u0~lyk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0u0~lyk.js");
      case "server/chunks/ssr/[root-of-the-server]__0ermm3q._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ermm3q._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_agreement_page_actions_0.hyhg8.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_agreement_page_actions_0.hyhg8.js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_agreement_page_tsx_0mkkdjv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_agreement_page_tsx_0mkkdjv._.js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_layout_tsx_080ibe.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_layout_tsx_080ibe.._.js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_layout_tsx_0lhgq5f._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_layout_tsx_0lhgq5f._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0savuyn.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0savuyn.js");
      case "server/chunks/ssr/[root-of-the-server]__0un1b.j._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0un1b.j._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_backup_page_actions_015wvm..js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_backup_page_actions_015wvm..js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_backup_page_tsx_0od.6x~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_backup_page_tsx_0od.6x~._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0a8cz8s.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0a8cz8s.js");
      case "server/chunks/ssr/[root-of-the-server]__0pqc4-w._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pqc4-w._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_bank_page_actions_11~h.vz.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_bank_page_actions_11~h.vz.js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_bank_page_tsx_0yq8p_z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_bank_page_tsx_0yq8p_z._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02qvlpm.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02qvlpm.js");
      case "server/chunks/ssr/[root-of-the-server]__0x15c38._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0x15c38._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_gst_page_actions_0wmq12m.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_gst_page_actions_0wmq12m.js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_gst_page_tsx_0jfiaxi._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_gst_page_tsx_0jfiaxi._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02~jj.g.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02~jj.g.js");
      case "server/chunks/ssr/[root-of-the-server]__053_xjo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__053_xjo._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_page_actions_06jrdkg.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-dining_setup_page_actions_06jrdkg.js");
      case "server/chunks/ssr/src_app_list-your-dining_setup_page_tsx_08klbzs._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-dining_setup_page_tsx_08klbzs._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12tgnty.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12tgnty.js");
      case "server/chunks/ssr/[root-of-the-server]__12-7sa_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12-7sa_._.js");
      case "server/chunks/ssr/_023v-3k._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_023v-3k._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_Login_page_actions_10nk721.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_Login_page_actions_10nk721.js");
      case "server/chunks/ssr/src_app_list-your-events_layout_tsx_0l64_1x._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_layout_tsx_0l64_1x._.js");
      case "server/chunks/ssr/src_app_list-your-events_layout_tsx_0st-3f_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_layout_tsx_0st-3f_._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_00j_0j_.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_00j_0j_.js");
      case "server/chunks/ssr/[root-of-the-server]__0x-6uw9._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0x-6uw9._.js");
      case "server/chunks/ssr/_08k~586._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_08k~586._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_Signin_page_actions_0v1e8.o.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_Signin_page_actions_0v1e8.o.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_09svdgx.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_09svdgx.js");
      case "server/chunks/ssr/[root-of-the-server]__0abz~0a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0abz~0a._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_otp_page_actions_0suh_6q.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_otp_page_actions_0suh_6q.js");
      case "server/chunks/ssr/src_0ts9ont._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0ts9ont._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0.8h8w8.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0.8h8w8.js");
      case "server/chunks/ssr/[root-of-the-server]__0r8n60w._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0r8n60w._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_page_actions_0tdtgqw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_page_actions_0tdtgqw.js");
      case "server/chunks/ssr/src_app_list-your-events_page_tsx_0yc4ugi._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_page_tsx_0yc4ugi._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_xs.0b.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_xs.0b.js");
      case "server/chunks/ssr/[root-of-the-server]__0pqglsl._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0pqglsl._.js");
      case "server/chunks/ssr/_0vp27u-._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0vp27u-._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_setup_agreement_page_actions_0hb0l2g.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_setup_agreement_page_actions_0hb0l2g.js");
      case "server/chunks/ssr/src_app_list-your-events_setup_layout_tsx_0j6knmo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_setup_layout_tsx_0j6knmo._.js");
      case "server/chunks/ssr/src_app_list-your-events_setup_layout_tsx_0o9uysi._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_setup_layout_tsx_0o9uysi._.js");
      case "server/chunks/ssr/src_components_ui_AgreementModal_tsx_0tv9tg8._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_components_ui_AgreementModal_tsx_0tv9tg8._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_0lef7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_0lef7.js");
      case "server/chunks/ssr/[root-of-the-server]__0ya4c9t._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ya4c9t._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_setup_backup_page_actions_123ne2l.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_setup_backup_page_actions_123ne2l.js");
      case "server/chunks/ssr/src_app_list-your-events_0oar6a8._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_0oar6a8._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ys0e9b.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ys0e9b.js");
      case "server/chunks/ssr/[root-of-the-server]__0w84.gz._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0w84.gz._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_setup_bank_page_actions_0znt5ka.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_setup_bank_page_actions_0znt5ka.js");
      case "server/chunks/ssr/src_app_list-your-events_0vovt01._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_0vovt01._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12nar.s.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12nar.s.js");
      case "server/chunks/ssr/[root-of-the-server]__0dlczf2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0dlczf2._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_setup_gst_page_actions_06a70uj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_setup_gst_page_actions_06a70uj.js");
      case "server/chunks/ssr/src_app_list-your-events_0wuxhor._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-events_0wuxhor._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0oeb~jj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0oeb~jj.js");
      case "server/chunks/ssr/[root-of-the-server]__00l98.0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__00l98.0._.js");
      case "server/chunks/ssr/_0nduli1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0nduli1._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-events_setup_page_actions_11tb0q-.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-events_setup_page_actions_11tb0q-.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0zzlmd9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0zzlmd9.js");
      case "server/chunks/ssr/[root-of-the-server]__0kvw9fv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0kvw9fv._.js");
      case "server/chunks/ssr/_0ayqnmb._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0ayqnmb._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_Login_page_actions_0ggwfgg.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_Login_page_actions_0ggwfgg.js");
      case "server/chunks/ssr/src_app_list-your-play_layout_tsx_0wlr1gi._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_layout_tsx_0wlr1gi._.js");
      case "server/chunks/ssr/src_app_list-your-play_layout_tsx_117t.q0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_layout_tsx_117t.q0._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_05ap8o3.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_05ap8o3.js");
      case "server/chunks/ssr/[root-of-the-server]__04fcu2f._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__04fcu2f._.js");
      case "server/chunks/ssr/_0~3y4tp._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0~3y4tp._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_Signin_page_actions_06tta0z.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_Signin_page_actions_06tta0z.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0n~v6g6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0n~v6g6.js");
      case "server/chunks/ssr/[root-of-the-server]__0-25f0v._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0-25f0v._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_otp_page_actions_0zmz06h.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_otp_page_actions_0zmz06h.js");
      case "server/chunks/ssr/src_0lwxpi~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0lwxpi~._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0kl_a5z.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0kl_a5z.js");
      case "server/chunks/ssr/[root-of-the-server]__13l336d._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__13l336d._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_page_actions_07a1ejz.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_page_actions_07a1ejz.js");
      case "server/chunks/ssr/src_app_list-your-play_page_tsx_0epv0ot._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_page_tsx_0epv0ot._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_09ja_9d.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_09ja_9d.js");
      case "server/chunks/ssr/[root-of-the-server]__12prseo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12prseo._.js");
      case "server/chunks/ssr/_0cm6e0b._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0cm6e0b._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_setup_agreement_page_actions_11rsymo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_setup_agreement_page_actions_11rsymo.js");
      case "server/chunks/ssr/src_app_list-your-play_setup_layout_tsx_0bebejm._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_setup_layout_tsx_0bebejm._.js");
      case "server/chunks/ssr/src_app_list-your-play_setup_layout_tsx_0zadpqr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_setup_layout_tsx_0zadpqr._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0uf.r47.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0uf.r47.js");
      case "server/chunks/ssr/[root-of-the-server]__0mxm70q._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0mxm70q._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_setup_backup_page_actions_0.0hq~a.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_setup_backup_page_actions_0.0hq~a.js");
      case "server/chunks/ssr/src_app_list-your-play_0kw3jle._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_0kw3jle._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12n8v1r.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_12n8v1r.js");
      case "server/chunks/ssr/[root-of-the-server]__0rlwqjv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rlwqjv._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_setup_bank_page_actions_0vwlcii.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_setup_bank_page_actions_0vwlcii.js");
      case "server/chunks/ssr/src_app_list-your-play_0tj2twv._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_0tj2twv._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b.5~81.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0b.5~81.js");
      case "server/chunks/ssr/[root-of-the-server]__12ngsxu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12ngsxu._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_setup_gst_page_actions_09cge5..js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_setup_gst_page_actions_09cge5..js");
      case "server/chunks/ssr/src_app_list-your-play_047qqd2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_list-your-play_047qqd2._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0lt9cmy.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0lt9cmy.js");
      case "server/chunks/ssr/[root-of-the-server]__0gyyppp._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0gyyppp._.js");
      case "server/chunks/ssr/_0jhgs5h._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0jhgs5h._.js");
      case "server/chunks/ssr/_next-internal_server_app_list-your-play_setup_page_actions_0yy1zf-.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_list-your-play_setup_page_actions_0yy1zf-.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~j254w.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~j254w.js");
      case "server/chunks/ssr/[root-of-the-server]__0851qt~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0851qt~._.js");
      case "server/chunks/ssr/_0l82u1j._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0l82u1j._.js");
      case "server/chunks/ssr/_next-internal_server_app_login_page_actions_02kefem.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_login_page_actions_02kefem.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11rjshq.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11rjshq.js");
      case "server/chunks/ssr/[root-of-the-server]__0gx7~-q._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0gx7~-q._.js");
      case "server/chunks/ssr/_next-internal_server_app_logout_page_actions_0y5md34.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_logout_page_actions_0y5md34.js");
      case "server/chunks/ssr/src_app_logout_page_tsx_02fpmag._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_logout_page_tsx_02fpmag._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ogjukw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ogjukw.js");
      case "server/chunks/ssr/[root-of-the-server]__0-vgron._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0-vgron._.js");
      case "server/chunks/ssr/_next-internal_server_app_my-pass_page_actions_0.cywr4.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_my-pass_page_actions_0.cywr4.js");
      case "server/chunks/ssr/src_app_my-pass_page_tsx_0vk19hk._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_my-pass_page_tsx_0vk19hk._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_b-mx6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_b-mx6.js");
      case "server/chunks/ssr/[root-of-the-server]__06wpxh7._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__06wpxh7._.js");
      case "server/chunks/ssr/_01y__ox._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_01y__ox._.js");
      case "server/chunks/ssr/_next-internal_server_app_myboooking_[id]_page_actions_0y5_d0h.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_myboooking_[id]_page_actions_0y5_d0h.js");
      case "server/chunks/ssr/src_app_myboooking_[id]_page_tsx_0n365rl._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_myboooking_[id]_page_tsx_0n365rl._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0o3vmm1.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0o3vmm1.js");
      case "server/chunks/ssr/[root-of-the-server]__0j~y.60._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0j~y.60._.js");
      case "server/chunks/ssr/_0cei.rc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0cei.rc._.js");
      case "server/chunks/ssr/_next-internal_server_app_myboooking_page_actions_0zm02a4.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_myboooking_page_actions_0zm02a4.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_03tbv_x.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_03tbv_x.js");
      case "server/chunks/ssr/[root-of-the-server]__0fai3bu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0fai3bu._.js");
      case "server/chunks/ssr/_0zudkrr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0zudkrr._.js");
      case "server/chunks/ssr/_next-internal_server_app_organizer_dashboard_page_actions_0~~ucoj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_organizer_dashboard_page_actions_0~~ucoj.js");
      case "server/chunks/ssr/src_app_organizer_dashboard_page_tsx_0ru1mzu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_organizer_dashboard_page_tsx_0ru1mzu._.js");
      case "server/chunks/ssr/src_app_organizer_layout_tsx_05t~esq._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_organizer_layout_tsx_05t~esq._.js");
      case "server/chunks/ssr/src_app_organizer_layout_tsx_0s~vd14._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_organizer_layout_tsx_0s~vd14._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fk6qt3.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fk6qt3.js");
      case "server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_0b7aguf._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_0b7aguf._.js");
      case "server/chunks/ssr/[root-of-the-server]__05o-ntw._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__05o-ntw._.js");
      case "server/chunks/ssr/_0d3aq82._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0d3aq82._.js");
      case "server/chunks/ssr/_next-internal_server_app_organizer_overview_page_actions_13rmzhb.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_organizer_overview_page_actions_13rmzhb.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0t2_dk5.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0t2_dk5.js");
      case "server/chunks/ssr/[root-of-the-server]__01a2zuo._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__01a2zuo._.js");
      case "server/chunks/ssr/_next-internal_server_app_organizer_page_actions_0.swqkn.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_organizer_page_actions_0.swqkn.js");
      case "server/chunks/ssr/src_app_organizer_page_tsx_0d5lum1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_organizer_page_tsx_0d5lum1._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0gpr85c.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0gpr85c.js");
      case "server/chunks/ssr/[root-of-the-server]__0q3m8fj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0q3m8fj._.js");
      case "server/chunks/ssr/_0t-phci._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0t-phci._.js");
      case "server/chunks/ssr/_next-internal_server_app_organizer_profile_page_actions_0b591pp.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_organizer_profile_page_actions_0b591pp.js");
      case "server/chunks/ssr/src_app_organizer_profile_page_tsx_0tcic0-._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_organizer_profile_page_tsx_0tcic0-._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vck-g3.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0vck-g3.js");
      case "server/chunks/ssr/[root-of-the-server]__0l.d-vd._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0l.d-vd._.js");
      case "server/chunks/ssr/_next-internal_server_app_page_actions_09-gtaw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_page_actions_09-gtaw.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02lpxj7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02lpxj7.js");
      case "server/chunks/ssr/[root-of-the-server]__11cysnt._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11cysnt._.js");
      case "server/chunks/ssr/_next-internal_server_app_pass_buy_page_actions_13nmejk.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_pass_buy_page_actions_13nmejk.js");
      case "server/chunks/ssr/src_app_pass_buy_page_tsx_0.p-ll9._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_pass_buy_page_tsx_0.p-ll9._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_06-9-61.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_06-9-61.js");
      case "server/chunks/ssr/[root-of-the-server]__0o3xd2k._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0o3xd2k._.js");
      case "server/chunks/ssr/_next-internal_server_app_pass_page_actions_0pfm5xo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_pass_page_actions_0pfm5xo.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_08q0t5i.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_08q0t5i.js");
      case "server/chunks/ssr/[root-of-the-server]__0j896b7._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0j896b7._.js");
      case "server/chunks/ssr/_0f596zh._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0f596zh._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_[name]_book_page_actions_0llqnn-.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_[name]_book_page_actions_0llqnn-.js");
      case "server/chunks/ssr/src_111ekxj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_111ekxj._.js");
      case "server/chunks/ssr/src_app_play_[name]_book_page_tsx_0zbj22i._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_[name]_book_page_tsx_0zbj22i._.js");
      case "server/chunks/ssr/src_app_play_[name]_loading_tsx_0r8uoun._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_[name]_loading_tsx_0r8uoun._.js");
      case "server/chunks/ssr/src_app_play_layout_tsx_0cax~ep._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_layout_tsx_0cax~ep._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0cgz25f.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0cgz25f.js");
      case "server/chunks/ssr/[root-of-the-server]__0meglx3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0meglx3._.js");
      case "server/chunks/ssr/_0qog8jt._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0qog8jt._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_[name]_book_review_page_actions_0~zmu5u.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_[name]_book_review_page_actions_0~zmu5u.js");
      case "server/chunks/ssr/src_app_play_[name]_book_review_page_tsx_10qool0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_[name]_book_review_page_tsx_10qool0._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_011nk~d.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_011nk~d.js");
      case "server/chunks/ssr/[root-of-the-server]__11h9k._._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11h9k._._.js");
      case "server/chunks/ssr/_08vy7j0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_08vy7j0._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_[name]_page_actions_0xn_x_w.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_[name]_page_actions_0xn_x_w.js");
      case "server/chunks/ssr/src_app_play_[name]_PlayDetailClient_tsx_0~8km.3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_[name]_PlayDetailClient_tsx_0~8km.3._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0rt0hrw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0rt0hrw.js");
      case "server/chunks/ssr/[root-of-the-server]__0g~qx~a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0g~qx~a._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_badminton_page_actions_0qpw9as.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_badminton_page_actions_0qpw9as.js");
      case "server/chunks/ssr/src_0k~a5yb._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_0k~a5yb._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_04nx4tf.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_04nx4tf.js");
      case "server/chunks/ssr/[root-of-the-server]__08ubjan._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__08ubjan._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_basketball_page_actions_0.5cc3y.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_basketball_page_actions_0.5cc3y.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~_1sp3.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~_1sp3.js");
      case "server/chunks/ssr/[root-of-the-server]__0.fcpt0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0.fcpt0._.js");
      case "server/chunks/ssr/_0i93bys._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0i93bys._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_create_format_page_actions_0iwfggp.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_create_format_page_actions_0iwfggp.js");
      case "server/chunks/ssr/src_app_play_create_format_page_tsx_00.lme_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_create_format_page_tsx_00.lme_._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01v16wo.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_01v16wo.js");
      case "server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_13nf5k0._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_13nf5k0._.js");
      case "server/chunks/ssr/[root-of-the-server]__11k1pgx._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11k1pgx._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_create_manage_[id]_page_actions_0-97--c.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_create_manage_[id]_page_actions_0-97--c.js");
      case "server/chunks/ssr/src_app_play_create_manage_[id]_page_tsx_0-cgyr~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_create_manage_[id]_page_tsx_0-cgyr~._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0tfh6ww.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0tfh6ww.js");
      case "server/chunks/ssr/[root-of-the-server]__0hkqhnu._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hkqhnu._.js");
      case "server/chunks/ssr/_0315oxc._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0315oxc._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_create_manage_page_actions_0zi4xtl.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_create_manage_page_actions_0zi4xtl.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0kiluz7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0kiluz7.js");
      case "server/chunks/ssr/[root-of-the-server]__0mrz_8t._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0mrz_8t._.js");
      case "server/chunks/ssr/_0t9-28v._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0t9-28v._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_create_page_actions_0tckolu.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_create_page_actions_0tckolu.js");
      case "server/chunks/ssr/src_app_play_create_page_tsx_01z7v~h._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_create_page_tsx_01z7v~h._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0tqequ7.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0tqequ7.js");
      case "server/chunks/ssr/[root-of-the-server]__054q8pb._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__054q8pb._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_cricket_page_actions_03j-s6j.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_cricket_page_actions_03j-s6j.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0uajv_y.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0uajv_y.js");
      case "server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_11q3zw1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/0p~4_lucide-react_dist_esm_icons_11q3zw1._.js");
      case "server/chunks/ssr/[root-of-the-server]__0ht8g61._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ht8g61._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_edit_[id]_format_page_actions_0abz4c8.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_edit_[id]_format_page_actions_0abz4c8.js");
      case "server/chunks/ssr/src_app_play_edit_[id]_format_page_tsx_0x_ms5_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_edit_[id]_format_page_tsx_0x_ms5_._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0buph5d.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0buph5d.js");
      case "server/chunks/ssr/[root-of-the-server]__065yvr9._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__065yvr9._.js");
      case "server/chunks/ssr/_0of7xx.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0of7xx.._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_edit_[id]_manage_page_actions_0vuz9sr.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_edit_[id]_manage_page_actions_0vuz9sr.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0mw7z6v.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0mw7z6v.js");
      case "server/chunks/ssr/[root-of-the-server]__0vr6ql4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vr6ql4._.js");
      case "server/chunks/ssr/_0uji06i._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0uji06i._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_edit_[id]_page_actions_0q6_9so.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_edit_[id]_page_actions_0q6_9so.js");
      case "server/chunks/ssr/src_app_play_edit_[id]_page_tsx_07omii3._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_edit_[id]_page_tsx_07omii3._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0c3z0gi.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0c3z0gi.js");
      case "server/chunks/ssr/[root-of-the-server]__0tgqx4e._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0tgqx4e._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_football_page_actions_0g2rm-c.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_football_page_actions_0g2rm-c.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~4srb-.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~4srb-.js");
      case "server/chunks/ssr/[root-of-the-server]__0.flxyl._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0.flxyl._.js");
      case "server/chunks/ssr/_12u_az5._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_12u_az5._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_page_actions_0n4x2g9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_page_actions_0n4x2g9.js");
      case "server/chunks/ssr/src_app_play_PlayClient_tsx_08pfiog._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_play_PlayClient_tsx_08pfiog._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11voh5_.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11voh5_.js");
      case "server/chunks/ssr/[root-of-the-server]__11u3ho4._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11u3ho4._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_pickleball_page_actions_11vmp17.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_pickleball_page_actions_11vmp17.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~ty.~d.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0~ty.~d.js");
      case "server/chunks/ssr/[root-of-the-server]__12wuc8o._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__12wuc8o._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_table-tennis_page_actions_0ps98bq.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_table-tennis_page_actions_0ps98bq.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ohr_mw.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0ohr_mw.js");
      case "server/chunks/ssr/[root-of-the-server]__0tz8hcr._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0tz8hcr._.js");
      case "server/chunks/ssr/_next-internal_server_app_play_tennis_page_actions_05ldtdx.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_play_tennis_page_actions_05ldtdx.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11k6jdq.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11k6jdq.js");
      case "server/chunks/ssr/[root-of-the-server]__0hn3pai._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0hn3pai._.js");
      case "server/chunks/ssr/_next-internal_server_app_privacy_page_actions_0ktvgrj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_privacy_page_actions_0ktvgrj.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11xpwwc.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_11xpwwc.js");
      case "server/chunks/ssr/[root-of-the-server]__11njcx5._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__11njcx5._.js");
      case "server/chunks/ssr/_next-internal_server_app_profile_bookings_dining_page_actions_0.ypo9e.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_profile_bookings_dining_page_actions_0.ypo9e.js");
      case "server/chunks/ssr/src_app_profile_bookings_dining_page_tsx_0uts2om._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_profile_bookings_dining_page_tsx_0uts2om._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02r8klg.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_02r8klg.js");
      case "server/chunks/ssr/[root-of-the-server]__0j.x252._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0j.x252._.js");
      case "server/chunks/ssr/_next-internal_server_app_profile_bookings_events_page_actions_11w3lmx.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_profile_bookings_events_page_actions_11w3lmx.js");
      case "server/chunks/ssr/src_app_profile_bookings_events_page_tsx_0u78vy_._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_profile_bookings_events_page_tsx_0u78vy_._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_mvqbd.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0_mvqbd.js");
      case "server/chunks/ssr/[root-of-the-server]__0yswfeh._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0yswfeh._.js");
      case "server/chunks/ssr/_next-internal_server_app_profile_bookings_page_actions_0.mghst.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_profile_bookings_page_actions_0.mghst.js");
      case "server/chunks/ssr/src_app_profile_bookings_page_tsx_015cjrd._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_profile_bookings_page_tsx_015cjrd._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0npt1wf.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0npt1wf.js");
      case "server/chunks/ssr/[root-of-the-server]__0zlvyds._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0zlvyds._.js");
      case "server/chunks/ssr/_next-internal_server_app_profile_bookings_play_page_actions_0zx.09w.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_profile_bookings_play_page_actions_0zx.09w.js");
      case "server/chunks/ssr/src_app_profile_bookings_play_page_tsx_12tycg1._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_profile_bookings_play_page_tsx_12tycg1._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0hkqot8.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0hkqot8.js");
      case "server/chunks/ssr/[root-of-the-server]__0ngj2v2._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0ngj2v2._.js");
      case "server/chunks/ssr/_0_aa~pj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0_aa~pj._.js");
      case "server/chunks/ssr/_next-internal_server_app_profile_page_actions_0r.ifsl.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_profile_page_actions_0r.ifsl.js");
      case "server/chunks/ssr/src_app_profile_page_tsx_0xc4iw~._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_profile_page_tsx_0xc4iw~._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fd89tv.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fd89tv.js");
      case "server/chunks/ssr/[root-of-the-server]__031o.a.._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__031o.a.._.js");
      case "server/chunks/ssr/_04f6n7m._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_04f6n7m._.js");
      case "server/chunks/ssr/_next-internal_server_app_profile_pass_page_actions_0g503~9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_profile_pass_page_actions_0g503~9.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0z9y6xu.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0z9y6xu.js");
      case "server/chunks/ssr/[root-of-the-server]__0_ae86z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0_ae86z._.js");
      case "server/chunks/ssr/_next-internal_server_app_refund_page_actions_0zyx6j9.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_refund_page_actions_0zyx6j9.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0qq~9ci.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0qq~9ci.js");
      case "server/chunks/ssr/[root-of-the-server]__0~_-q~d._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0~_-q~d._.js");
      case "server/chunks/ssr/_next-internal_server_app_terms_page_actions_0a8-y6r.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_terms_page_actions_0a8-y6r.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-86e3j.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0-86e3j.js");
      case "server/chunks/ssr/[root-of-the-server]__0yhsdym._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0yhsdym._.js");
      case "server/chunks/ssr/_0-t9-c7._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0-t9-c7._.js");
      case "server/chunks/ssr/_next-internal_server_app_ticket_[id]_page_actions_0tp2nxc.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_ticket_[id]_page_actions_0tp2nxc.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0in8uom.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0in8uom.js");
      case "server/chunks/ssr/[root-of-the-server]__0-jwoak._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0-jwoak._.js");
      case "server/chunks/ssr/_next-internal_server_app_ticket-layout-editor_page_actions_0oimnmj.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_ticket-layout-editor_page_actions_0oimnmj.js");
      case "server/chunks/ssr/src_app_ticket-layout-editor_page_tsx_11ypl.z._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/src_app_ticket-layout-editor_page_tsx_11ypl.z._.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0aplv~t.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0aplv~t.js");
      case "server/chunks/ssr/[root-of-the-server]__05upc.9._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__05upc.9._.js");
      case "server/chunks/ssr/_0~z2-6a._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_0~z2-6a._.js");
      case "server/chunks/ssr/_next-internal_server_app_ticlists_page_actions_0ksojki.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_ticlists_page_actions_0ksojki.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fwze_t.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_0fwze_t.js");
      case "server/chunks/ssr/[root-of-the-server]__0vs_xjh._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0vs_xjh._.js");
      case "server/chunks/ssr/_next-internal_server_app_ticpass_page_actions_0l3c3t6.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_ticpass_page_actions_0l3c3t6.js");
      case "server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_08__.uu.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/029y_next_dist_esm_build_templates_app-page_08__.uu.js");
      case "server/chunks/ssr/[root-of-the-server]__0rd18eq._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/[root-of-the-server]__0rd18eq._.js");
      case "server/chunks/ssr/_058hhhj._.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_058hhhj._.js");
      case "server/chunks/ssr/_next-internal_server_app_ticpass_success_page_actions_0-b2~3k.js": return require("/home/ramji/Desktop/FinalTickpinDesgin/ticpin/.open-next/server-functions/default/.next/server/chunks/ssr/_next-internal_server_app_ticpass_success_page_actions_0-b2~3k.js");
      default:
        throw new Error(`Not found ${chunkPath}`);
    }
  }


  async function loadWasmChunk(chunkPath) {
    switch (chunkPath) {

      default:
        throw new Error(`Unknown wasm chunk: ${chunkPath}`);
    }
  }
