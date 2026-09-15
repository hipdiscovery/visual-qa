# HipDiscovery Visual QA

Public, disposable browser QA for **publicly reachable UI only**.

This repository does **not** contain HipDiscovery's private application or website source. It is a small GitHub-hosted runner that opens an allowlisted public URL in a fresh Chrome session, captures representative screenshots, records lightweight layout/runtime diagnostics, and makes the result available briefly for an agent to inspect. For HipDiscovery, it renders the public Cloudflare Pages origin (`hipdiscovery-com.pages.dev`) because the custom domain's bot challenge correctly blocks hosted headless browsers; both origins serve the same Pages deployment.

## Normal agent workflow

1. Make the real UI change in its source repository and let the public deployment/preview become reachable.
2. Update only `qa-request.json` here.
3. The `Visual QA` workflow renders the requested page.
4. Download the single `visual-qa-<run id>` artifact.
5. **Actually inspect the screenshots.** The JSON diagnostics are a second layer, not a replacement for visual judgement.
6. Iterate in the source repo if the UI looks wrong.

A new QA run deletes previous QA artifacts and completed Visual QA runs. The current artifact has a one-day fallback retention period, so generated screenshots do not become a permanent public archive.

## Standard HipDiscovery viewports

- `desktop-owner`: 1912 × 918
- `desktop-compact`: 1668 × 900
- `mobile`: 375 × 900
- `mobile-small`: 320 × 900

Only request the viewports needed for the current change when speed matters; use all four for a final responsive pass.

## Request format

```json
{
  "requestId": "home-gaming-pass-1",
  "target": "hipdiscovery",
  "path": "/",
  "selector": ".hero-games",
  "viewports": ["desktop-owner", "desktop-compact", "mobile", "mobile-small"],
  "fullPage": false,
  "waitMs": 700
}
```

- `target` must exist in `qa/targets.json`.
- `path` must be a plain path. Query strings, fragments, credentials, protocol-relative URLs, and arbitrary hosts are rejected.
- `selector` is optional. When supplied, the runner scrolls it into view and also captures a focused element screenshot when possible.
- `fullPage` is optional and defaults to `false`; viewport screenshots are faster and usually better for iterative UI work.
- `waitMs` is capped to keep runs short.

## Public-repo safety

Read `SECURITY.md` before adding another target. The important rule: **if a value would be unsafe in a public GitHub commit, workflow log, screenshot, or artifact, it does not belong here.**

This runner intentionally has no support for cookies, auth headers, tokens, private preview URLs, arbitrary URLs, uploaded source trees, or secrets.
