import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import { settlePageImages } from "./page-settle.mjs";

// These are synthetic document surfaces, not an authenticated browser/profile.
const page = { evaluate: (callback, timeout) => callback(timeout) };
const savedDocument = globalThis.document;
try {
  globalThis.document = { fonts: { ready: new Promise(() => {}) }, images: [] };
  const start = performance.now();
  const timed = await settlePageImages(page, 30);
  assert.equal(timed.ready, false, "unsettled fonts must not look successful");
  assert.match(timed.reason, /deadline/i);
  assert.ok(performance.now() - start < 500, "font readiness must have a hard bound");

  const listeners = new Map();
  const image = {
    complete: false,
    addEventListener(event, handler) { listeners.set(event, handler); },
    removeEventListener(event, handler) {
      if (listeners.get(event) === handler) listeners.delete(event);
    }
  };
  globalThis.document = { fonts: { ready: Promise.resolve() }, images: [image] };
  const stalled = await settlePageImages(page, 30);
  assert.equal(stalled.ready, false, "unfinished image must remain inconclusive");
  assert.equal(listeners.size, 0, "timeout must remove image listeners");

  globalThis.document = { fonts: { ready: Promise.resolve() }, images: [image] };
  setTimeout(() => {
    image.complete = true;
    listeners.get("load")?.();
  }, 5);
  const loaded = await settlePageImages(page, 100);
  assert.equal(loaded.ready, true);
  assert.equal(listeners.size, 0);

  const unavailable = await settlePageImages({ evaluate: async () => { throw Error("isolated failure"); } }, 10);
  assert.equal(unavailable.ready, false);
} finally {
  if (savedDocument === undefined) delete globalThis.document;
  else globalThis.document = savedDocument;
}
console.log("PASS: bounded font/image settlement with retained failure status");
