# HipDiscovery Visual QA

Local, disposable browser QA for **publicly reachable UI only**.

This repository does not contain HipDiscovery's private application or website source. It opens an allowlisted public URL in a fresh Chromium-family browser session, captures representative screenshots, records lightweight layout/runtime diagnostics, and writes short-lived evidence to local `out/`.

## Why this stays separate from Hip Native Bridge

Hip Native Bridge is the privileged local control plane: it can operate the real browser, files, processes, Git repositories, and desktop. Visual QA is intentionally narrower and disposable: it renders only allowlisted public pages in fresh isolated browser contexts and produces repeatable viewport/journey evidence.

Keeping them separate avoids giving the QA harness Bridge permissions, avoids adding Playwright to the Bridge runtime, and keeps public rendering independent from logged-in browser state. When Hip Bridge is available it may start this runner like any other local project/process, but Visual QA never receives Bridge tokens, credentials, browser profiles, or private source.

## Install and verify

```text
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

`playwright-core` is exact-version pinned. The runner uses an already installed Chrome, Microsoft Edge, or Chromium. Set `CHROME_BIN` only when automatic discovery cannot find the browser you want.

## Run a visual pass

Edit `qa-request.json`, then run:

```text
npm run qa -- qa-request.json
```

After validating the request and deployment evidence, the runner replaces its previous local `out/`, renders the request, and writes:

- viewport screenshots;
- optional focused/full-page screenshots;
- interaction-journey screenshots;
- `report.json` with diagnostics;
- `summary.md` with the compact result.

The evidence is disposable. Inspect every impacted screenshot, then delete local copies when the review is complete. Do not commit `out/`.

## Normal agent workflow

1. Make the real UI change in its source repository and wait for the public deployment/preview to become reachable.
2. Add one or more `deploymentProbes` for the public CSS/JS/HTML assets changed by the private source commit. Use the private repo's Git blob SHA for each asset; only hashes and public paths belong here.
3. Run `npm run qa -- qa-request.json`. The runner waits until those exact public asset bytes are live, then renders the requested page.
4. Inspect every impacted screenshot. JSON diagnostics are a second layer, not a replacement for visual judgement.
5. For interactive changes, define `journeys` that exercise every changed/new control and each distinct resulting state, including nested controls revealed by earlier steps.
6. Review every responsive layout the change can affect. If composition changes at a breakpoint, exercise that state at that breakpoint.
7. Iterate in the source repo until the full affected surface is clean.

For HipDiscovery, the target may use the public Cloudflare Pages origin when the custom domain's bot challenge blocks isolated automation. The deployment probes ensure the QA pass still verifies the exact deployed bytes requested.

## Standard HipDiscovery viewports

- `desktop-owner`: 1912 × 918
- `desktop-compact`: 1668 × 900
- `mobile`: 375 × 900
- `mobile-small`: 320 × 900

Optional breakpoint probes are configured for `mobile-large` (430 × 932), `tablet` (768 × 1024), and `desktop-narrow` (1024 × 768). Request only the viewports relevant to the current change; use all affected breakpoints for final approval.

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
  "waitMs": 700,
  "journeys": [
    {
      "name": "filters-and-details",
      "captureSelector": ".feature-panel",
      "steps": [
        {"action": "click", "selector": "[data-filter='new']", "label": "New filter"},
        {"action": "click", "selector": "[data-item='example']", "label": "Open details"},
        {"action": "click", "selector": "[data-tab='info']", "label": "Details info tab"}
      ]
    }
  ]
}
```

- `target` must exist in `qa/targets.json`.
- HipDiscovery requests require `deploymentProbes`. Probe only public assets the target already serves. The runner computes the Git blob SHA from deployed bytes and waits for an exact match, so no private source is copied here.
- `path` must be a plain root-relative path. Query strings, fragments, credentials, protocol-relative URLs, and arbitrary hosts are rejected.
- `selector` is optional. The normal viewport screenshot is captured before selector scrolling; a focused screenshot is then captured when requested.
- `journeys` is optional and is the required mechanism for changed interactive flows. Each journey starts from a fresh page load, performs steps in order, captures after every step, and fails on unreachable steps, visible broken images, or horizontal overflow. Supported actions are `click`, `hover`, `focus`, `select`, and allowlisted `dispatch` events (`error`, `load`, `input`, `change`).
- `fullPage` is optional and defaults to `false`; viewport screenshots are faster and usually better for iterative UI work.
- `waitMs` is bounded to keep runs short.

## Public-repo safety

Read `SECURITY.md` before adding another target. The core rule is simple: **if a value would be unsafe in a public Git commit or local screenshot/report, it does not belong here.**

The runner intentionally has no support for cookies, auth headers, tokens, private preview URLs, arbitrary URLs, uploaded source trees, secrets, or persisted user browser profiles. It blocks private/link-local network destinations and limits page traffic to safe read-only browser requests.

Deployment probes are capped at 5 MiB each. Use byte-stable public assets, normally CSS/JS and HTML only when the edge does not rewrite it.

## Verification and maintenance

`npm run verify` checks JavaScript syntax, focused QA contracts, cross-platform browser discovery, target safety, dependency integrity, the no-GitHub-Actions rule, agent policy, and file budgets.

`qa/run.mjs` is a legacy oversized file under a no-growth baseline. New work should continue extracting focused modules rather than growing it. The goal is to reduce that exception over time without destabilizing the renderer.

Automated diagnostics are hints. Final visual approval still requires looking at the screenshots.
