import fs from "node:fs";
import net from "node:net";
import { spawnSync } from "node:child_process";

const fail = message => {
  console.error(`Policy check failed: ${message}`);
  process.exitCode = 2;
};
const read = path => fs.readFileSync(path, "utf8");

for (const file of ["qa/run.mjs", "qa/cleanup.mjs"]) {
  const checked = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (checked.status !== 0) fail(`${file} does not parse: ${checked.stderr || checked.stdout}`);
}

const workflow = read(".github/workflows/visual-qa.yml");
for (const forbidden of ["pull_request:", "pull_request_target:", "schedule:"]) {
  if (workflow.includes(forbidden)) fail(`workflow contains forbidden trigger ${forbidden}`);
}
if (!workflow.includes("permissions: {}")) fail("workflow must default to permissions: {}.");
if (!/render:[\s\S]*?permissions:\s*\{\}/.test(workflow)) fail("render job must keep permissions: {}.");
if (!/cleanup:[\s\S]*?permissions:[\s\S]*?actions:\s*write/.test(workflow)) fail("cleanup job must be the only actions:write holder.");
const actionWriteMatches = workflow.match(/actions:\s*write/g) || [];
if (actionWriteMatches.length !== 1) fail("workflow must contain exactly one actions: write permission.");
if (!workflow.includes("retention-days: 1")) fail("QA artifacts must retain for exactly one day.");
if (!workflow.includes("actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a")) {
  fail("upload-artifact must remain pinned to the reviewed commit SHA.");
}
if (!workflow.includes("cancel-in-progress: true")) fail("stale QA runs must be cancelled.");
if (!workflow.includes("npm ci --ignore-scripts --no-audit --no-fund")) fail("dependency install must use the integrity lock with scripts disabled.");

const lock = JSON.parse(read("package-lock.json"));
const pw = lock.packages?.["node_modules/playwright-core"];
if (pw?.version !== "1.63.0") fail("playwright-core version drifted from the reviewed pin.");
if (pw?.integrity !== "sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==") {
  fail("playwright-core integrity does not match the reviewed package.");
}

const targets = JSON.parse(read("qa/targets.json"));
for (const [name, target] of Object.entries(targets)) {
  let base;
  try { base = new URL(target.baseUrl); } catch { fail(`${name}: invalid baseUrl`); continue; }
  if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
    fail(`${name}: baseUrl must be plain HTTPS without credentials/query/fragment.`);
  }
  if (net.isIP(base.hostname) || base.hostname === "localhost" || base.hostname.endsWith(".local")) {
    fail(`${name}: baseUrl must use a public DNS hostname.`);
  }
  if (!Array.isArray(target.allowedHosts) || !target.allowedHosts.includes(base.hostname.toLowerCase())) {
    fail(`${name}: allowedHosts must explicitly contain the base hostname.`);
  }
  if (target.requireDeploymentProbes !== true) fail(`${name}: deployment probes must remain mandatory.`);
  const viewports = target.viewports || {};
  if (!Object.keys(viewports).length) fail(`${name}: at least one viewport is required.`);
  for (const [vp, size] of Object.entries(viewports)) {
    if (!Number.isInteger(size.width) || !Number.isInteger(size.height) ||
        size.width < 240 || size.width > 3840 || size.height < 240 || size.height > 2160) {
      fail(`${name}/${vp}: viewport is outside safe bounds.`);
    }
  }
}

if (!process.exitCode) console.log("Visual QA policy OK.");
