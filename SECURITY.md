# Security model

This repository is intentionally public. Treat **every committed byte and every generated screenshot/diagnostic as potentially shareable** even though execution is local.

## Never store or accept

- passwords, API keys, access tokens, OAuth material, cookies, session storage, auth headers, client secrets
- private repository source or build output
- private deployment/preview URLs
- signed URLs or query strings carrying credentials
- personal/private user data
- browser profiles from a real user machine
- arbitrary URLs supplied by untrusted input

The runner has no feature for custom headers, cookies, localStorage injection, login automation, persisted browser profiles, or arbitrary base URLs. Do not add one.

Deployment freshness uses hashes of public assets the site already serves. The request stores only a public path and its Git blob SHA; it does not copy private source content into this repository. Each probe is capped at 5 MiB.

## Target isolation

Targets are explicitly allowlisted in `qa/targets.json`. Requests select a target key plus a plain URL path. The runner rejects protocol-relative paths, query strings, fragments, credentials, non-HTTPS final navigation, and final hosts outside the target allowlist.

The browser uses a fresh context for every viewport with no persisted profile. Service workers are blocked. HTTP(S) page traffic is limited to GET/HEAD, main-frame navigation is confined to the target allowlist, non-web schemes are blocked, and loopback/link-local/private-network destinations are blocked both as literal IPs and after DNS resolution.

Hip Native Bridge may start Visual QA as a normal local process, but Visual QA must not receive Bridge session tokens, logged-in browser state, private-file access, or other privileged capabilities. The narrow renderer and the privileged control bridge are separate trust boundaries by design.

## Output lifecycle

Generated screenshots/reports are written to ignored local `out/`. Invalid requests or failed deployment preflight preserve earlier `out/`; a validated capture replaces it before rendering. After review, delete downloaded/copied QA evidence from local workspaces; it is disposable verification evidence, not a project asset.

Diagnostic console/page-error text is truncated and scrubbed for URLs, labeled secrets, bearer tokens, common GitHub/AWS credential formats, and JWT-shaped values before it reaches reports. This is defense in depth; targets must still never expose secrets client-side.

If sensitive information appears in local QA output, delete that output immediately and rotate/revoke the exposed credential at its source.

## Supply chain and policy guard

`playwright-core` is exact-version pinned and integrity-locked in `package-lock.json`; installation should use `npm ci --ignore-scripts --no-audit --no-fund`. `qa/policy-check.mjs` verifies QA scripts parse, focused contracts pass, GitHub Actions remain absent, the browser dependency remains pinned, and every target stays public/HTTPS/allowlisted with mandatory deployment probes.

The local launcher discovers installed Chrome, Microsoft Edge, or Chromium on macOS, Windows, and Linux. `CHROME_BIN` may explicitly select a browser executable. The launcher never downloads a browser, browser profile, or remote automation binary.

## Repository rules

No GitHub Actions are permitted in this repository. Rendering and verification run locally through `npm run qa` and `npm run verify`.

Public repository visibility is acceptable only because the runner contains no private source or credentials and cannot authenticate to private targets. If that changes, stop and redesign the boundary rather than adding secrets to this repository.
