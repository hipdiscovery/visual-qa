import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const run = read("qa/run.mjs");
const agents = read("AGENTS.md");
const readme = read("README.md");

const checks = [
  ["request schema accepts journeys", run.includes('"journeys"') && run.includes("request.journeys")],
  ["journey requests are bounded", run.includes("at most 100 total journey steps") && run.includes("1-20 interaction journeys")],
  ["journey steps are click-only", run.includes('step.action !== "click"')],
  ["journey runner captures each step", run.includes("async function runJourneys") && run.includes("stepResult.screenshot")],
  ["journey runner fails unreachable controls", run.includes("selector not found")],
  ["journey runner fails broken visible images", run.includes("broken visible images after step")],
  ["journey runner fails horizontal overflow", run.includes("horizontal overflow after step")],
  ["agent contract requires exhaustive impacted-state coverage", agents.includes("exhaustive impacted-state coverage")],
  ["agent contract includes nested changed controls", agents.includes("child states are part of the same required QA pass")],
  ["README documents interaction journeys", readme.includes("For interactive changes, define `journeys`")]
];

let failed = 0;
for (const [name, ok] of checks) {
  if (ok) console.log("ok  ", name);
  else {
    failed++;
    console.error("FAIL", name);
  }
}

if (failed) process.exit(1);
console.log("Journey QA contract OK.");
