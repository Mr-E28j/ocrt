"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/run/handlers/cache.cts
var cache_exports = {};
__export(cache_exports, {
  NetlifyCacheHandler: () => NetlifyCacheHandler,
  default: () => cache_default
});
module.exports = __toCommonJS(cache_exports);
var import_node_buffer = require("node:buffer");
var import_node_path = require("node:path");
var import_posix = require("node:path/posix");

// node_modules/@netlify/functions/dist/chunk-C6P2IO65.mjs
var __getOwnPropNames2 = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames2(fn)[0]])(fn = 0)), res;
};

// node_modules/@netlify/functions/dist/chunk-7VFCQORF.mjs
var BUILDER_FUNCTIONS_FLAG;
var HTTP_STATUS_METHOD_NOT_ALLOWED;
var HTTP_STATUS_OK;
var METADATA_VERSION;
var init_consts = __esm({
  "src/lib/consts.ts"() {
    BUILDER_FUNCTIONS_FLAG = true;
    HTTP_STATUS_METHOD_NOT_ALLOWED = 405;
    HTTP_STATUS_OK = 200;
    METADATA_VERSION = 1;
  }
});

// node_modules/@netlify/functions/dist/chunk-6V4VUZWK.mjs
var augmentResponse;
var wrapHandler;
var init_builder = __esm({
  "src/lib/builder.ts"() {
    init_consts();
    augmentResponse = (response) => {
      if (!response) {
        return response;
      }
      const metadata = { version: METADATA_VERSION, builder_function: BUILDER_FUNCTIONS_FLAG, ttl: response.ttl || 0 };
      return {
        ...response,
        metadata
      };
    };
    wrapHandler = (handler) => (
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      (event, context, callback) => {
        if (event.httpMethod !== "GET" && event.httpMethod !== "HEAD") {
          return Promise.resolve({
            body: "Method Not Allowed",
            statusCode: HTTP_STATUS_METHOD_NOT_ALLOWED
          });
        }
        const modifiedEvent = {
          ...event,
          multiValueQueryStringParameters: {},
          queryStringParameters: {}
        };
        const wrappedCallback = (error, response) => (
          // eslint-disable-next-line promise/prefer-await-to-callbacks
          callback ? callback(error, augmentResponse(response)) : null
        );
        const execution = handler(modifiedEvent, context, wrappedCallback);
        if (typeof execution === "object" && typeof execution.then === "function") {
          return execution.then(augmentResponse);
        }
        return execution;
      }
    );
  }
});

// node_modules/@netlify/functions/dist/chunk-SURWFFYE.mjs
var import_process = require("process");
var purgeCache;
var init_purge_cache = __esm({
  "src/lib/purge_cache.ts"() {
    purgeCache = async (options = {}) => {
      if (globalThis.fetch === void 0) {
        throw new Error(
          "`fetch` is not available. Please ensure you're using Node.js version 18.0.0 or above. Refer to https://ntl.fyi/functions-runtime for more information."
        );
      }
      const payload = {
        cache_tags: options.tags,
        deploy_alias: options.deployAlias
      };
      const token = import_process.env.NETLIFY_PURGE_API_TOKEN || options.token;
      if (import_process.env.NETLIFY_LOCAL && !token) {
        const scope = options.tags?.length ? ` for tags ${options.tags?.join(", ")}` : "";
        console.log(`Skipping purgeCache${scope} in local development.`);
        return;
      }
      if ("siteSlug" in options) {
        payload.site_slug = options.siteSlug;
      } else if ("domain" in options) {
        payload.domain = options.domain;
      } else {
        const siteID = options.siteID || import_process.env.SITE_ID;
        if (!siteID) {
          throw new Error(
            "The Netlify site ID was not found in the execution environment. Please supply it manually using the `siteID` property."
          );
        }
        payload.site_id = siteID;
      }
      if (!token) {
        throw new Error(
          "The cache purge API token was not found in the execution environment. Please supply it manually using the `token` property."
        );
      }
      const headers = {
        "Content-Type": "application/json; charset=utf8",
        Authorization: `Bearer ${token}`
      };
      if (options.userAgent) {
        headers["user-agent"] = options.userAgent;
      }
      const apiURL = options.apiURL || "https://api.netlify.com";
      const response = await fetch(`${apiURL}/api/v1/purge`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error(`Cache purge API call returned an unexpected status code: ${response.status}`);
      }
    };
  }
});

// node_modules/@netlify/functions/dist/chunk-MMCOWF6U.mjs
var import_node_stream = require("node:stream");
var import_node_util = require("node:util");
var pipeline = (0, import_node_util.promisify)(import_node_stream.pipeline);

// node_modules/@netlify/functions/dist/main.mjs
init_builder();
init_purge_cache();

// src/run/handlers/cache.cts
var import_constants = require("next/dist/lib/constants.js");

// package.json
var name = "@netlify/plugin-nextjs";
var version = "5.10.1";

// src/run/handlers/cache.cts
var import_cache_types = require("../../shared/cache-types.cjs");
var import_regional_blob_store = require("../regional-blob-store.cjs");
var import_request_context = require("./request-context.cjs");
var import_tracer = require("./tracer.cjs");
var purgeCacheUserAgent = `${name}@${version}`;
var NetlifyCacheHandler = class {
  options;
  revalidatedTags;
  blobStore;
  tracer = (0, import_tracer.getTracer)();
  tagManifestsFetchedFromBlobStoreInCurrentRequest;
  constructor(options) {
    this.options = options;
    this.revalidatedTags = options.revalidatedTags;
    this.blobStore = (0, import_regional_blob_store.getRegionalBlobStore)({ consistency: "strong" });
    this.tagManifestsFetchedFromBlobStoreInCurrentRequest = {};
  }
  async encodeBlobKey(key) {
    const { encodeBlobKey } = await import("../../shared/blobkey.js");
    return await encodeBlobKey(key);
  }
  getTTL(blob) {
    if (blob.value?.kind === "FETCH" || blob.value?.kind === "ROUTE" || blob.value?.kind === "APP_ROUTE" || blob.value?.kind === "PAGE" || blob.value?.kind === "PAGES" || blob.value?.kind === "APP_PAGE") {
      const { revalidate } = blob.value;
      if (typeof revalidate === "number") {
        const revalidateAfter = revalidate * 1e3 + blob.lastModified;
        return (revalidateAfter - Date.now()) / 1e3;
      }
      if (revalidate === false) {
        return "PERMANENT";
      }
    }
    return "NOT SET";
  }
  captureResponseCacheLastModified(cacheValue, key, getCacheKeySpan) {
    if (cacheValue.value?.kind === "FETCH") {
      return;
    }
    const requestContext = (0, import_request_context.getRequestContext)();
    if (!requestContext) {
      getCacheKeySpan.recordException(
        new Error("CacheHandler was called without a request context")
      );
      getCacheKeySpan.setAttributes({
        severity: "alert",
        warning: true
      });
      return;
    }
    if (requestContext.responseCacheKey && requestContext.responseCacheKey !== key) {
      requestContext.responseCacheGetLastModified = void 0;
      getCacheKeySpan.recordException(
        new Error(
          `Multiple response cache keys used in single request: ["${requestContext.responseCacheKey}, "${key}"]`
        )
      );
      getCacheKeySpan.setAttributes({
        severity: "alert",
        warning: true
      });
      return;
    }
    requestContext.responseCacheKey = key;
    if (cacheValue.lastModified) {
      requestContext.responseCacheGetLastModified = cacheValue.lastModified;
    }
  }
  captureRouteRevalidateAndRemoveFromObject(cacheValue) {
    const { revalidate, ...restOfRouteValue } = cacheValue;
    const requestContext = (0, import_request_context.getRequestContext)();
    if (requestContext) {
      requestContext.routeHandlerRevalidate = revalidate;
    }
    return restOfRouteValue;
  }
  captureCacheTags(cacheValue, key) {
    if (!cacheValue) {
      return;
    }
    const requestContext = (0, import_request_context.getRequestContext)();
    if (!requestContext) {
      return;
    }
    if (requestContext.responseCacheTags) {
      return;
    }
    if (cacheValue.kind === "PAGE" || cacheValue.kind === "PAGES" || cacheValue.kind === "APP_PAGE" || cacheValue.kind === "ROUTE" || cacheValue.kind === "APP_ROUTE") {
      if (cacheValue.headers?.[import_constants.NEXT_CACHE_TAGS_HEADER]) {
        const cacheTags = cacheValue.headers[import_constants.NEXT_CACHE_TAGS_HEADER].split(/,|%2c/gi);
        requestContext.responseCacheTags = cacheTags;
      } else if ((cacheValue.kind === "PAGE" || cacheValue.kind === "PAGES") && typeof cacheValue.pageData === "object") {
        const cacheTags = [`_N_T_${key === "/index" ? "/" : encodeURI(key)}`];
        requestContext.responseCacheTags = cacheTags;
      }
    }
  }
  async injectEntryToPrerenderManifest(key, { revalidate, cacheControl }) {
    if (this.options.serverDistDir && (typeof revalidate === "number" || revalidate === false || typeof cacheControl !== "undefined")) {
      try {
        const { loadManifest } = await import("next/dist/server/load-manifest.js");
        const prerenderManifest = loadManifest(
          (0, import_node_path.join)(this.options.serverDistDir, "..", "prerender-manifest.json")
        );
        if (typeof cacheControl !== "undefined") {
          const { SharedCacheControls } = await import(
            // @ts-expect-error supporting multiple next version, this module is not resolvable with currently used dev dependency
            // eslint-disable-next-line import/no-unresolved, n/no-missing-import
            "next/dist/server/lib/incremental-cache/shared-cache-controls.js"
          );
          const sharedCacheControls = new SharedCacheControls(prerenderManifest);
          sharedCacheControls.set(key, cacheControl);
        } else if (typeof revalidate === "number" || revalidate === false) {
          try {
            const { normalizePagePath } = await import("next/dist/shared/lib/page-path/normalize-page-path.js");
            prerenderManifest.routes[key] = {
              experimentalPPR: void 0,
              dataRoute: (0, import_posix.join)("/_next/data", `${normalizePagePath(key)}.json`),
              srcRoute: null,
              // FIXME: provide actual source route, however, when dynamically appending it doesn't really matter
              initialRevalidateSeconds: revalidate,
              // Pages routes do not have a prefetch data route.
              prefetchDataRoute: void 0
            };
          } catch {
            const { SharedRevalidateTimings } = await import("next/dist/server/lib/incremental-cache/shared-revalidate-timings.js");
            const sharedRevalidateTimings = new SharedRevalidateTimings(prerenderManifest);
            sharedRevalidateTimings.set(key, revalidate);
          }
        }
      } catch {
      }
    }
  }
  async get(...args) {
    return this.tracer.withActiveSpan("get cache key", async (span) => {
      const [key, ctx = {}] = args;
      (0, import_request_context.getLogger)().debug(`[NetlifyCacheHandler.get]: ${key}`);
      const blobKey = await this.encodeBlobKey(key);
      span.setAttributes({ key, blobKey });
      const blob = await this.tracer.withActiveSpan("blobStore.get", async (blobGetSpan) => {
        blobGetSpan.setAttributes({ key, blobKey });
        return await this.blobStore.get(blobKey, {
          type: "json"
        });
      });
      if (!blob) {
        span.addEvent("Cache miss", { key, blobKey });
        return null;
      }
      const ttl = this.getTTL(blob);
      if ((0, import_request_context.getRequestContext)()?.isBackgroundRevalidation && typeof ttl === "number" && ttl < 0) {
        span.addEvent("Discarding stale entry due to SWR background revalidation request", {
          key,
          blobKey,
          ttl
        });
        (0, import_request_context.getLogger)().withFields({
          ttl,
          key
        }).debug(
          `[NetlifyCacheHandler.get] Discarding stale entry due to SWR background revalidation request: ${key}`
        );
        return null;
      }
      const staleByTags = await this.checkCacheEntryStaleByTags(blob, ctx.tags, ctx.softTags);
      if (staleByTags) {
        span.addEvent("Stale", { staleByTags, key, blobKey, ttl });
        return null;
      }
      this.captureResponseCacheLastModified(blob, key, span);
      this.captureCacheTags(blob.value, key);
      switch (blob.value?.kind) {
        case "FETCH":
          span.addEvent("FETCH", {
            lastModified: blob.lastModified,
            revalidate: ctx.revalidate,
            ttl
          });
          return {
            lastModified: blob.lastModified,
            value: blob.value
          };
        case "ROUTE":
        case "APP_ROUTE": {
          span.addEvent(blob.value?.kind, {
            lastModified: blob.lastModified,
            status: blob.value.status,
            revalidate: blob.value.revalidate,
            ttl
          });
          const valueWithoutRevalidate = this.captureRouteRevalidateAndRemoveFromObject(blob.value);
          return {
            lastModified: blob.lastModified,
            value: {
              ...valueWithoutRevalidate,
              body: import_node_buffer.Buffer.from(valueWithoutRevalidate.body, "base64")
            }
          };
        }
        case "PAGE":
        case "PAGES": {
          const { revalidate, ...restOfPageValue } = blob.value;
          const requestContext = (0, import_request_context.getRequestContext)();
          if (requestContext) {
            requestContext.pageHandlerRevalidate = revalidate;
          }
          span.addEvent(blob.value?.kind, { lastModified: blob.lastModified, revalidate, ttl });
          await this.injectEntryToPrerenderManifest(key, blob.value);
          return {
            lastModified: blob.lastModified,
            value: restOfPageValue
          };
        }
        case "APP_PAGE": {
          const { revalidate, rscData, ...restOfPageValue } = blob.value;
          span.addEvent(blob.value?.kind, { lastModified: blob.lastModified, revalidate, ttl });
          await this.injectEntryToPrerenderManifest(key, blob.value);
          return {
            lastModified: blob.lastModified,
            value: {
              ...restOfPageValue,
              rscData: rscData ? import_node_buffer.Buffer.from(rscData, "base64") : void 0
            }
          };
        }
        default:
          span.recordException(new Error(`Unknown cache entry kind: ${blob.value?.kind}`));
      }
      return null;
    });
  }
  transformToStorableObject(data, context) {
    if (!data) {
      return null;
    }
    if ((0, import_cache_types.isCachedRouteValue)(data)) {
      return {
        ...data,
        revalidate: context.revalidate ?? context.cacheControl?.revalidate,
        cacheControl: context.cacheControl,
        body: data.body.toString("base64")
      };
    }
    if ((0, import_cache_types.isCachedPageValue)(data)) {
      return {
        ...data,
        revalidate: context.revalidate ?? context.cacheControl?.revalidate,
        cacheControl: context.cacheControl
      };
    }
    if (data?.kind === "APP_PAGE") {
      return {
        ...data,
        revalidate: context.revalidate ?? context.cacheControl?.revalidate,
        cacheControl: context.cacheControl,
        rscData: data.rscData?.toString("base64")
      };
    }
    return data;
  }
  async set(...args) {
    return this.tracer.withActiveSpan("set cache key", async (span) => {
      const [key, data, context] = args;
      const blobKey = await this.encodeBlobKey(key);
      const lastModified = Date.now();
      span.setAttributes({ key, lastModified, blobKey });
      (0, import_request_context.getLogger)().debug(`[NetlifyCacheHandler.set]: ${key}`);
      const value = this.transformToStorableObject(data, context);
      this.captureCacheTags(value, key);
      await this.blobStore.setJSON(blobKey, {
        lastModified,
        value
      });
      if (data?.kind === "PAGE" || data?.kind === "PAGES") {
        const requestContext = (0, import_request_context.getRequestContext)();
        if (requestContext?.didPagesRouterOnDemandRevalidate) {
          const tag = `_N_T_${key === "/index" ? "/" : encodeURI(key)}`;
          const tags = tag.split(/,|%2c/gi).filter(Boolean);
          if (tags.length === 0) {
            return;
          }
          (0, import_request_context.getLogger)().debug(`Purging CDN cache for: [${tag}]`);
          requestContext.trackBackgroundWork(
            purgeCache({ tags, userAgent: purgeCacheUserAgent }).catch((error) => {
              (0, import_request_context.getLogger)().withError(error).error(`[NetlifyCacheHandler]: Purging the cache for tag ${tag} failed`);
            })
          );
        }
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async revalidateTag(tagOrTags, ...args) {
    const revalidateTagPromise = this.doRevalidateTag(tagOrTags, ...args);
    const requestContext = (0, import_request_context.getRequestContext)();
    if (requestContext) {
      requestContext.trackBackgroundWork(revalidateTagPromise);
    }
    return revalidateTagPromise;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async doRevalidateTag(tagOrTags, ...args) {
    (0, import_request_context.getLogger)().withFields({ tagOrTags, args }).debug("NetlifyCacheHandler.revalidateTag");
    const tags = (Array.isArray(tagOrTags) ? tagOrTags : [tagOrTags]).flatMap((tag) => tag.split(/,|%2c/gi)).filter(Boolean);
    if (tags.length === 0) {
      return;
    }
    const data = {
      revalidatedAt: Date.now()
    };
    await Promise.all(
      tags.map(async (tag) => {
        try {
          await this.blobStore.setJSON(await this.encodeBlobKey(tag), data);
        } catch (error) {
          (0, import_request_context.getLogger)().withError(error).log(`Failed to update tag manifest for ${tag}`);
        }
      })
    );
    await purgeCache({ tags, userAgent: purgeCacheUserAgent }).catch((error) => {
      (0, import_request_context.getLogger)().withError(error).error(`[NetlifyCacheHandler]: Purging the cache for tags ${tags.join(", ")} failed`);
    });
  }
  resetRequestCache() {
    this.tagManifestsFetchedFromBlobStoreInCurrentRequest = {};
  }
  /**
   * Checks if a cache entry is stale through on demand revalidated tags
   */
  async checkCacheEntryStaleByTags(cacheEntry, tags = [], softTags = []) {
    let cacheTags = [];
    if (cacheEntry.value?.kind === "FETCH") {
      cacheTags = [...tags, ...softTags];
    } else if (cacheEntry.value?.kind === "PAGE" || cacheEntry.value?.kind === "PAGES" || cacheEntry.value?.kind === "APP_PAGE" || cacheEntry.value?.kind === "ROUTE" || cacheEntry.value?.kind === "APP_ROUTE") {
      cacheTags = cacheEntry.value.headers?.[import_constants.NEXT_CACHE_TAGS_HEADER]?.split(/,|%2c/gi) || [];
    } else {
      return false;
    }
    if (this.revalidatedTags && this.revalidatedTags.length !== 0) {
      for (const tag of this.revalidatedTags) {
        if (cacheTags.includes(tag)) {
          return true;
        }
      }
    }
    return new Promise((resolve, reject) => {
      const tagManifestPromises = [];
      for (const tag of cacheTags) {
        let tagManifestPromise = this.tagManifestsFetchedFromBlobStoreInCurrentRequest[tag];
        if (!tagManifestPromise) {
          tagManifestPromise = this.encodeBlobKey(tag).then((blobKey) => {
            return this.tracer.withActiveSpan(`get tag manifest`, async (span) => {
              span.setAttributes({ tag, blobKey });
              return this.blobStore.get(blobKey, { type: "json" });
            });
          });
          this.tagManifestsFetchedFromBlobStoreInCurrentRequest[tag] = tagManifestPromise;
        }
        tagManifestPromises.push(
          tagManifestPromise.then((tagManifest) => {
            const isStale = tagManifest?.revalidatedAt >= (cacheEntry.lastModified || Date.now());
            if (isStale) {
              resolve(true);
              return true;
            }
            return false;
          })
        );
      }
      Promise.all(tagManifestPromises).then((tagManifestAreStale) => {
        resolve(tagManifestAreStale.some((tagIsStale) => tagIsStale));
      }).catch(reject);
    });
  }
};
var cache_default = NetlifyCacheHandler;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  NetlifyCacheHandler
});
