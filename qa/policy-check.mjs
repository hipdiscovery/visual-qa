import fs from "node:fs";
import net from "node:net";
import { spawnSync } from "node:child_process";

const fail = message => {
  console.error(`Policy check failed: ${message}`);
  process.exitCode = 2;
};
const read = path => fs.readFileSync(path, "utf8");

const qaScripts = fs.readdirSync("qa")
  .filter(file => file.endsWith(".mjs"))
  .map(file => `qa/${file}`)
  .sort();

for (const file of qaScripts) {
  const checked = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (checked.status !== 0) fail(`${file} does not parse: ${checked.stderr || checked.stdout}`);
}

for (const testFile of [
  "qa/browser-executable.test.mjs",
  "qa/diagnostic-policy.test.mjs",
  "qa/visual-diff-review.test.mjs",
  "qa/journey-contract.test.mjs",
  "qa/page-settle.test.mjs",
  "qa/output-preservation.test.mjs"
]) {
  const contract = spawnSync(process.execPath, [testFile], { encoding: "utf8" });
  if (contract.status !== 0) fail(`${testFile} failed: ${contract.stderr || contract.stdout}`);
}

const workflowDir = ".github/workflows";
if (fs.existsSync(workflowDir)) {
  const workflowFiles = fs.readdirSync(workflowDir).filter(name => !name.startsWith("."));
  if (workflowFiles.length) fail(`GitHub Actions are retired; remove workflow files: ${workflowFiles.join(", ")}`);
}

const pkg = JSON.parse(read("package.json"));
if (pkg.scripts?.qa !== "node qa/local.mjs") fail("package.json must expose the local QA launcher as npm run qa.");
if (!pkg.scripts?.verify) fail("package.json must expose npm run verify.");

const lock = JSON.parse(read("package-lock.json"));
const pw = lock.packages?.["node_modules/playwright-core"];
if (pw?.version !== "1.63.0") fail("playwright-core version drifted from the reviewed pin.");
if (pw?.integrity !== "sha512-rYCsBF/M5HjUch52bbtVONEFjv6Xu8sm8h72dNlR5bzIE1fvC/bxgspzkjSfU+MweEMmPM8KJebG6nnyxo5mCg==") {
  fail("playwright-core integrity does not match the reviewed package.");
}

const targets = JSON.parse(read("qa/targets.json"));
for (const [name, target] of Object.entries(targets)) {
  let base;
  try {
    base = new URL(target.baseUrl);
  } catch {
    fail(`${name}: invalid baseUrl`);
    continue;
  }
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

if (!process.exitCode) console.log("Visual QA policy OK: local-only runner, pinned browser dependency, public allowlisted targets.");
