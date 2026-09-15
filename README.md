# HipDiscovery Visual QA

Public, disposable browser QA for **publicly reachable UI only**.

This repository does **not** contain HipDiscovery's private application or website source. It is a small GitHub-hosted runner that opens an allowlisted public URL in a fresh Chrome session, captures representative screenshots, records lightweight layout/runtime diagnostics, and makes the result available briefly for an agent to inspect. For HipDiscovery, it renders the public Cloudflare Pages origin (`hipdiscovery-com.pages.dev`) because the custom domain's bot challenge correctly blocks hosted headless browsers; both origins serve the same Pages deployment.

## Normal agent workflow

1. Make the real UI change in its source repository and let the public deployment/preview become reachable.
2. Add one or more `deploymentProbes` for the public CSS/JS/HTML assets changed by the private source commit. Use the private repo's Git blob SHA for each asset; only the hashes and public paths are copied here.
3. The `Visual QA` workflow waits until those exact public asset bytes are live, then renders the requested page.
4. Download the single `visual-qa-<run id>` artifact.
5. **Actually inspect the screenshots.** The JSON diagnostics are a second layer, not a replacement for visual judgement.
6. Iterate in the source repo if the UI looks wrong.

After a render produces its own artifact, a separate narrowly privileged cleanup job deletes older Visual QA artifacts and completed runs. If rendering fails before a replacement artifact exists, the previous result is preserved. The browser/render job has no repository permissions. The current artifact has a one-day fallback retention period, so generated screenshots do not become a permanent public archive.

## Standard HipDiscovery viewports

- `desktop-owner`: 1912 × 918
- `desktop-compact`: 1668 × 900
- `mobile`: 375 × 900
- `mobile-small`: 320 × 900

Optional breakpoint probes are also configured for `mobile-large` (430 × 932), `tablet` (768 × 1024), and `desktop-narrow` (1024 × 768). Only request the viewports relevant to the current change; the four standard sizes remain the normal final pass, while the optional sizes are useful when a layout crosses mobile/tablet/compact-desktop breakpoints.

## Request format

```json
{
  "requestId": "home-gaming-pass-1",
  "target": "hipdiscovery",
  "path": "/",
  "selector": ".hero-games",
  "deploymentProbes": [
    {"path": "/css/pages/home.css", "gitBlobSha": "0123456789abcdef0123456789abcdef01234567"}
  ],
  "viewports": ["desktop-owner", "desktop-compact", "mobile", "mobile-small"],
  "fullPage": false,
  "waitMs": 700
}
```

- `target` must exist in `qa/targets.json`.
- HipDiscovery requests require `deploymentProbes`. Probe only public assets the target already serves. The runner computes the Git blob SHA from the deployed bytes and waits for an exact match, so no private commit SHA or source content is copied into this public repo.
- `path` must be a plain path. Query strings, fragments, credentials, protocol-relative URLs, and arbitrary hosts are rejected.
- `selector` is optional. The normal viewport screenshot is captured **before** any scrolling; when a selector is supplied, the runner then scrolls it into view, lets its images settle, and captures a separate focused screenshot.
- `fullPage` is optional and defaults to `false`; viewport screenshots are faster and usually better for iterative UI work.
- `waitMs` is capped to keep runs short.

## Public-repo safety

Read `SECURITY.md` before adding another target. The important rule: **if a value would be unsafe in a public GitHub commit, workflow log, screenshot, or artifact, it does not belong here.**

This runner intentionally has no support for cookies, auth headers, tokens, private preview URLs, arbitrary URLs, uploaded source trees, or secrets.

Deployment probes are capped at 5 MiB each to prevent accidental large downloads. Use byte-stable public assets (normally CSS/JS; HTML only when the edge does not rewrite it).

## Self-protection

Runner/config changes trigger the same workflow automatically. Before browser setup, `qa/policy-check.mjs` verifies the JavaScript parses and enforces the repository's security contract: no PR/scheduled triggers, render permissions stay empty, only cleanup gets `actions: write`, artifact retention stays one day, the upload action stays commit-pinned, targets remain HTTPS/allowlisted, deployment probes remain mandatory, and the Playwright package matches its integrity-locked package lock.

Each viewport report also records the actual HTTP(S) hostnames contacted while rendering. This is observational rather than a brittle third-party CDN allowlist: private/link-local destinations are still blocked, while legitimate public CDN/API hosts can evolve without silently breaking visual QA.
