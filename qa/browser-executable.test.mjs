import assert from "node:assert/strict";
import { findBrowser } from "./browser-executable.mjs";

const existsOnly = wanted => value => value === wanted;

assert.equal(
  findBrowser({ env: { CHROME_BIN: "/custom/chrome" }, platform: "linux", existsSync: existsOnly("/custom/chrome") }),
  "/custom/chrome"
);

assert.equal(
  findBrowser({ env: {}, platform: "darwin", existsSync: existsOnly("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge") }),
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
);

assert.equal(
  findBrowser({ env: { PROGRAMFILES: "C:\\Program Files" }, platform: "win32", existsSync: existsOnly("C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe") }),
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
);

assert.equal(findBrowser({ env: {}, platform: "linux", existsSync: () => false }), null);

console.log("Browser discovery OK.");
