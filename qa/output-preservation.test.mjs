import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "hip-visual-qa-contract-"));
try {
  fs.mkdirSync(path.join(scratch, "qa"));
  fs.mkdirSync(path.join(scratch, "out"));
  fs.copyFileSync(path.join(root, "qa", "targets.json"),
    path.join(scratch, "qa", "targets.json"));
  const sentinel = path.join(scratch, "out", "previous-report.json");
  fs.writeFileSync(sentinel, '{"prior":"validated evidence"}\n');
  const request = JSON.parse(fs.readFileSync(path.join(root, "qa-request.json"), "utf8"));
  assert.ok(request.waitMs <= 2500, "the shipped default must pass its own schema");
  request.waitMs = 2501;
  const invalid = path.join(scratch, "invalid.json");
  fs.writeFileSync(invalid, JSON.stringify(request));
  const outcome = spawnSync(process.execPath, [path.join(root, "qa", "run.mjs"), invalid],
    { cwd: scratch, encoding: "utf8", timeout: 12000 });
  assert.equal(outcome.status, 2, outcome.stderr || outcome.stdout);
  assert.match(outcome.stderr, /waitMs must be an integer/);
  assert.equal(fs.readFileSync(sentinel, "utf8"), '{"prior":"validated evidence"}\n');
  assert.equal(fs.existsSync(path.join(scratch, "out", "fatal.json")), false,
    "invalid requests must not overwrite prior evidence");
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}
console.log("PASS: default schema and invalid-request evidence preservation");
