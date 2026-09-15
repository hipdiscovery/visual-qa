# Security model

This repository is intentionally public. Treat **every committed byte, workflow log, screenshot, diagnostic, and Actions artifact as potentially public**.

## Never store or accept

- passwords, API keys, access tokens, OAuth material, cookies, session storage, auth headers, client secrets
- private repository source or build output
- private deployment/preview URLs
- signed URLs or query strings carrying credentials
- personal/private user data
- browser profiles from a real user machine
- arbitrary URLs supplied by untrusted input

The runner has no feature for custom headers, cookies, localStorage injection, login automation, or arbitrary base URLs. Do not add one.

Deployment freshness uses hashes of public assets the site already serves. The request stores only a public path and its Git blob SHA; it does not copy private source content or a private repository commit SHA into this repo. Each probe is capped at 5 MiB.

## Target isolation

Targets are explicitly allowlisted in `qa/targets.json`. Requests select a target key plus a plain URL path. The runner rejects protocol-relative paths, query strings, fragments, credentials, non-HTTPS final navigation, and final hosts outside the target allowlist.

The browser uses a fresh context for every viewport with no persisted browser profile. Service workers are blocked. All HTTP(S) page traffic is limited to GET/HEAD, main-frame navigation is confined to the target allowlist, non-web network schemes are blocked, and loopback/link-local/private-network destinations are blocked both when written as literal IPs (including IPv4-mapped IPv6) and when a hostname resolves to them.

The render job has `permissions: {}` and is deliberately isolated from repository write permissions. A separate cleanup job runs only after rendering and alone receives `actions: write`; it passes its scoped token only to the cleanup script. Cleanup refuses to remove the previous result unless the current run already produced its own artifact. HTTP error pages and common bot/interstitial challenges are treated as failed QA rather than successful renders.

## Output lifecycle

Generated screenshots/reports are never committed to Git. Before uploading the current result, the workflow deletes prior QA artifacts and prior completed Visual QA runs. The current artifact additionally expires after one day if no later run occurs.

Diagnostic console/page-error text is truncated and scrubbed for URLs, labeled secrets, bearer tokens, common GitHub/AWS credential formats, and JWT-shaped values before it reaches an artifact. This is defense in depth; targets must still never expose secrets client-side.

If something sensitive is ever exposed, delete the affected Actions run/artifact immediately and rotate/revoke the exposed credential at its source. GitHub history is not a secrets store.

## Supply-chain and policy guard

`playwright-core` is exact-version pinned and integrity-locked in `package-lock.json`; lifecycle scripts are disabled during installation. The upload action is pinned by full commit SHA. Every runner/config change triggers Visual QA, and `qa/policy-check.mjs` fails closed if critical workflow permissions, triggers, retention, target safety, or dependency-integrity rules drift.

## Repository rules

The repository currently has no GitHub ruleset. Public users still cannot execute this workflow in the upstream repository through pull requests because PR triggers are forbidden by policy and only collaborators with write access can push/dispatch. If additional people are ever granted write access, enable a GitHub branch ruleset for `main` requiring pull-request review/CODEOWNERS before merge; the connected GitHub integration used to build this runner can read rulesets but cannot administer them.
