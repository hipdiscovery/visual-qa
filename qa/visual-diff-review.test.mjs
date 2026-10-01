import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "visual-qa-diff-"));

function run(current, baseline) {
  const result = spawnSync(process.execPath, ["qa/visual-diff-review.mjs", current, baseline], {
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

try {
  const baseline = path.join(temp, "baseline.bin");
  const identical = path.join(temp, "identical.bin");
  const sameSizeDifferent = path.join(temp, "same-size-different.bin");

  fs.writeFileSync(baseline, Buffer.from([1, 2, 3, 4]));
  fs.writeFileSync(identical, Buffer.from([1, 2, 3, 4]));
  fs.writeFileSync(sameSizeDifferent, Buffer.from([4, 3, 2, 1]));

  const clean = run(identical, baseline);
  assert.equal(clean.changed, false, "identical files must not trigger review");
  assert.equal(clean.reviewRequired, false);

  const changed = run(sameSizeDifferent, baseline);
  assert.equal(changed.currentBytes, changed.baselineBytes,
    "regression fixture must prove equal file size is not enough");
  assert.equal(changed.changed, true,
    "different screenshots with equal byte size must still trigger review");
  assert.equal(changed.reviewRequired, true);
  assert.notEqual(changed.currentSha256, changed.baselineSha256);
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}

console.log("Visual QA screenshot change detector: ok");
