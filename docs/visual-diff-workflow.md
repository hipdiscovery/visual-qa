# Visual Diff Workflow

## Purpose

Visual QA should catch accidental UI regressions before a human reviews the final result.

## Flow

1. Render the requested viewport screenshots.
2. Compare the new screenshot file against the approved baseline with `qa/visual-diff-review.mjs`.
3. Generate a change signal.
4. Have an agent inspect the screenshots, not only the signal.
5. Approve, update the baseline, or revise the UI.

## What the helper guarantees

The helper uses SHA-256 to determine whether the two screenshot files are byte-identical.

- Equal file size alone is **not** treated as proof that screenshots match.
- A changed hash means the rendered screenshot artifact changed and requires review.
- An unchanged hash means the two files are exactly identical.
- This is **not** a perceptual or pixel-difference score. It intentionally avoids pretending visual taste can be reduced to one number.

## Rules

- Any changed screenshot is a warning signal, not an automatic design failure.
- Large or intentional redesigns still require screenshot inspection.
- Intentional redesigns can replace the baseline only after approval.
- Existing runtime/layout/functionality checks run separately.
- Never report a UI task complete from the hash result alone.

## Three required tests

### 1. Failure test
Introduce an obvious layout problem and verify QA reports a changed screenshot.

### 2. Real UI test
Run against a real feature change and verify useful feedback is produced.

### 3. Regression test
Confirm unchanged pages produce byte-identical screenshots when the rendered output is deterministic; otherwise inspect and explain the difference.
