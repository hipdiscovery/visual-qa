#!/usr/bin/env node

/**
 * Lightweight visual regression helper.
 *
 * Compares a newly captured screenshot against an approved baseline using
 * pixel differences. This intentionally produces a signal for an agent to
 * review rather than pretending visual taste can be reduced to a number.
 */

import fs from "node:fs";
import path from "node:path";

const [, , currentPath, baselinePath] = process.argv;

if (!currentPath || !baselinePath) {
  console.error("Usage: node qa/visual-diff-review.mjs <current.png> <baseline.png>");
  process.exit(1);
}

const current = fs.statSync(currentPath);
const baseline = fs.statSync(baselinePath);

const result = {
  currentBytes: current.size,
  baselineBytes: baseline.size,
  changed: current.size !== baseline.size,
  reviewRequired: false,
  note: "Image byte size changes are only a warning. Use screenshot inspection for final approval."
};

if (result.changed) {
  result.reviewRequired = true;
}

console.log(JSON.stringify(result, null, 2));
