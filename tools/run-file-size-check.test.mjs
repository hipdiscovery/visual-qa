import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const runner = fileURLToPath(new URL("./run-file-size-check.mjs", import.meta.url));
const preload = `
import cp from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
const scenario = JSON.parse(process.env.SIZE_CHECK_SCENARIO);
cp.spawnSync = (command, args, options) => {
  const probe = args.includes('-c');
  appendFileSync(process.env.SIZE_CHECK_CALLS, JSON.stringify({ command, args, probe, options }) + '\\n');
  const answer = scenario[command] || { missing: true };
  if (answer.missing) return { error: Object.assign(new Error('missing'), { code: 'ENOENT' }), status: null };
  if (probe) return { status: answer.probeStatus ?? 0, stdout: answer.version ?? '3\\n', stderr: '' };
  return { status: 'checkStatus' in answer ? answer.checkStatus : 0, signal: answer.signal ?? null };
};
syncBuiltinESMExports();
`;

function run(scenario) {
  const dir = mkdtempSync(join(tmpdir(), "qa-python-launcher-"));
  try {
    const shim = join(dir, "shim.mjs");
    const callsPath = join(dir, "calls.jsonl");
    writeFileSync(shim, preload);
    const result = spawnSync(process.execPath, ["--import", pathToFileURL(shim).href, runner], {
      cwd: dir, encoding: "utf8", windowsHide: true,
      env: { ...process.env, SIZE_CHECK_SCENARIO: JSON.stringify(scenario), SIZE_CHECK_CALLS: callsPath }
    });
    assert.equal(result.error, undefined);
    const calls = readFileSync(callsPath, "utf8").trim().split("\n").map(JSON.parse);
    return { ...result, calls };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("a present but unusable Store alias cannot hide a working Python", () => {
  const r = run({ python3: { probeStatus: 9009, checkStatus: 9009 }, py: { missing: true }, python: {} });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.calls.filter(c => !c.probe).length, 1);
  assert.equal(r.calls.find(c => !c.probe).command, "python");
});

test("Python 2 is rejected before it can execute the checker", () => {
  const r = run({ python3: { version: "2\n", checkStatus: 7 }, py: { missing: true }, python: {} });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.calls.find(c => !c.probe).command, "python");
});

test("genuine budget failure is propagated without trying another interpreter", () => {
  const r = run({ python3: { checkStatus: 1 }, py: { checkStatus: 1 }, python: { checkStatus: 1 } });
  assert.equal(r.status, 1, r.stderr);
  assert.equal(r.calls.filter(c => !c.probe).length, 1);
  assert.equal(r.calls.at(-1).probe, false);
});

test("missing interpreters produce a clear failure without running the checker", () => {
  const r = run({});
  assert.equal(r.status, 2);
  assert.match(r.stderr, /Python 3.*not found/i);
  assert.ok(r.calls.every(c => c.probe));
});

test("checker uses a repository path even from a different working directory", () => {
  const r = run({ python3: {}, py: {}, python: {} });
  assert.equal(r.status, 0, r.stderr);
  const check = r.calls.find(c => !c.probe);
  assert.equal(check.args.at(-1), fileURLToPath(new URL("./checkFileSizes.py", import.meta.url)));
  assert.ok(r.calls.filter(c => c.probe).every(c => c.options.timeout > 0 && c.options.windowsHide));
});

test("an interrupted checker fails closed without fallback", () => {
  const r = run({ python3: { checkStatus: null, signal: "SIGTERM" }, py: { checkStatus: null, signal: "SIGTERM" }, python: { checkStatus: null, signal: "SIGTERM" } });
  assert.equal(r.status, 2, r.stderr);
  assert.equal(r.calls.filter(c => !c.probe).length, 1);
});
