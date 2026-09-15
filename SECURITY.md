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

Deployment freshness uses an opaque 24-character SHA-256-derived fingerprint. The private repository commit SHA used to derive it must never be committed here. The public Pages marker contains only the fingerprint, schema version, and build timestamp.

## Target isolation

Targets are explicitly allowlisted in `qa/targets.json`. Requests select a target key plus a plain URL path. The runner rejects protocol-relative paths, query strings, fragments, credentials, non-HTTPS final navigation, and final hosts outside the target allowlist.

The browser uses a fresh context for every viewport with no persisted browser profile. Service workers are blocked. All HTTP(S) page traffic is limited to GET/HEAD, so a render cannot intentionally submit forms or mutate public APIs. Loopback, link-local, and private-network destinations are blocked both when written as literal IPs and when a hostname resolves to them.

The rendering step is deliberately not given `GITHUB_TOKEN`. A separate cleanup step receives only the repository-scoped token needed to remove prior Actions output. HTTP error pages and common bot/interstitial challenges are treated as failed QA rather than successful renders.

## Output lifecycle

Generated screenshots/reports are never committed to Git. Before uploading the current result, the workflow deletes prior QA artifacts and prior completed Visual QA runs. The current artifact additionally expires after one day if no later run occurs.

If something sensitive is ever exposed, delete the affected Actions run/artifact immediately and rotate/revoke the exposed credential at its source. GitHub history is not a secrets store.
