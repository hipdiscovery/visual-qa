#!/usr/bin/env node

/**
 * Lightweight visual regression helper.
 *
 * Detects whether two screenshot files are byte-identical using SHA-256.
 * A difference is only a signal for an agent to inspect the rendered images;
 * this is intentionally not presented as perceptual or pixel-level scoring.
 */

import fs from "node:fs";
import { createHash } from "node:crypto";

const [, , currentPath, baselinePath] = process.argv;

if (!currentPath || !baselinePath) {
  console.error("Usage: node qa/visual-diff-review.mjs <current-image> <baseline-image>");
  process.exit(1);
}

function fingerprint(filePath) {
  const bytes = fs.readFileSync(filePath);
  return {
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex")
  };
}

const current = fingerprint(currentPath);
const baseline = fingerprint(baselinePath);
const changed = current.sha256 !== baseline.sha256;

const result = {
  currentBytes: current.bytes,
  baselineBytes: baseline.bytes,
  currentSha256: current.sha256,
  baselineSha256: baseline.sha256,
  changed,
  reviewRequired: changed,
  note: changed
    ? "Screenshot bytes changed. Inspect the rendered images before approval."
    : "Screenshot files are byte-identical. Visual inspection is still required for final approval."
};

console.log(JSON.stringify(result, null, 2));
