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

## Target isolation

Targets are explicitly allowlisted in `qa/targets.json`. Requests select a target key plus a plain URL path. The runner rejects protocol-relative paths, query strings, fragments, credentials, non-HTTPS final navigation, and final hosts outside the target allowlist.

The browser uses a fresh context for every viewport with no persisted browser profile. Service workers are blocked. Literal loopback, link-local, and private-network request targets are blocked from page traffic.

The rendering step is deliberately not given `GITHUB_TOKEN`. A separate cleanup step receives only the repository-scoped token needed to remove prior Actions output.

## Output lifecycle

Generated screenshots/reports are never committed to Git. Before uploading the current result, the workflow deletes prior QA artifacts and prior completed Visual QA runs. The current artifact additionally expires after one day if no later run occurs.

If something sensitive is ever exposed, delete the affected Actions run/artifact immediately and rotate/revoke the exposed credential at its source. GitHub history is not a secrets store.
