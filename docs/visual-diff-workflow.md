# Visual Diff Workflow

## Purpose

Visual QA should catch accidental UI regressions before a human reviews the final result.

## Flow

1. Render the requested viewport screenshots.
2. Compare against the approved baseline.
3. Generate a change report.
4. Have an agent inspect the screenshot, not only the score.
5. Approve, update baseline, or revise the UI.

## Rules

- Pixel differences are a warning signal, not an automatic failure.
- Large changes require screenshot review.
- Intentional redesigns can replace the baseline after approval.
- Existing functionality checks still run separately.

## Three required tests

### 1. Failure test
Introduce an obvious layout problem and verify QA reports a change.

### 2. Real UI test
Run against a real feature change and verify useful feedback is produced.

### 3. Regression test
Confirm unchanged pages do not create unexpected warnings.
