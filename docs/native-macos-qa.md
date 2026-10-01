# Native macOS QA for chat-mode agents

The browser Visual QA runner cannot render a native macOS application. Native apps need a separate build/test evidence path.

This repository provides `.github/workflows/native-macos-qa.yml` as a reusable workflow. A private Mac app can call it without copying its source into this public repository: GitHub reusable workflows run in the caller repository context, and `actions/checkout` checks out the caller repository.

## What it does

- Uses a standard GitHub-hosted macOS runner.
- Checks out the private caller repository with read-only permissions.
- Builds and runs the caller's Xcode scheme with `xcodebuild test`.
- Disables code signing for CI compile/test checks.
- Preserves the `.xcresult` bundle and full xcodebuild log for one day.
- Takes no secrets and does not upload app source.

This is **build/test QA**, not a replacement for inspecting actual app screenshots.

## Recommended caller

Keep the private app's caller workflow deliberate rather than running a macOS job on every source commit.

A useful pattern is to trigger on a tiny marker file that an agent updates after finishing a batch:

```yaml
name: Native QA

on:
  push:
    branches: [master]
    paths:
      - .github/native-qa-trigger
  workflow_dispatch:

permissions:
  contents: read

jobs:
  qa:
    uses: hipdiscovery/visual-qa/.github/workflows/native-macos-qa.yml@REPLACE_WITH_REVIEWED_COMMIT_SHA
    with:
      project: HQBackground.xcodeproj
      scheme: HQBackground
```

Pin the reusable workflow to a reviewed commit SHA, not `master`.

## Cost / metering

The reusable workflow itself costs nothing while idle. When called by a **private** repository, GitHub-hosted macOS runtime uses that repository owner's included Actions allowance and can be billed after the allowance is exhausted. Standard Actions on public repositories are free; private repositories use plan allowance first.

For HQBackground, use one run after a meaningful batch rather than one run per file edit. Keep the one-day artifact retention so test evidence does not create long-lived storage.

## What this unlocks for a chat agent

With GitHub access to the app repository, an agent can:

1. Make a coherent batch of code changes.
2. Update the QA trigger once.
3. Read the workflow result and failing xcodebuild logs through GitHub.
4. Fix compilation/test failures.
5. Repeat until green.
6. Use real screenshots/XCUITest attachments for final visual judgement when the app repo provides them.

The remaining gap is actual interactive taste review of the running native app. Source review and green CI are not substitutes for that.
