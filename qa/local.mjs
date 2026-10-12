import { findBrowser } from "./browser-executable.mjs";

const browser = findBrowser();
if (!browser) {
  console.error("Chrome, Edge, or Chromium was not found. Install one or set CHROME_BIN to its executable path.");
  process.exit(2);
}

process.env.CHROME_BIN = browser;
await import("./run.mjs");
