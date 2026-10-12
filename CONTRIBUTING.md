# Contributing

This repository is a public, local execution surface for HipDiscovery visual QA, not a general browser-automation project.

Before proposing a change:

- Never include secrets, private source, private preview URLs, credentials, cookies, user data, authenticated browser state, or persisted browser profiles.
- Do not add arbitrary URL, custom-header, cookie, login, localStorage-injection, or private-network support.
- New targets must be intentionally public, use HTTPS, be explicitly allowlisted in `qa/targets.json`, and require deployment probes.
- Do not add GitHub Actions. Visual QA is intentionally local-only; use `npm run qa` for rendering and `npm run verify` for policy/tests.
- Keep dependencies exact-version pinned and integrity locked.
- Generated screenshots/reports belong only in ignored local `out/` or another disposable local workspace; never commit them.
- Do not weaken or bypass `qa/policy-check.mjs`.
- Keep Hip Native Bridge and Visual QA privilege boundaries separate. Bridge may launch the runner, but this repository must not gain Bridge credentials, private file access, or logged-in browser state.
- `qa/run.mjs` is a legacy oversized file under a no-growth baseline. Prefer extracting focused modules over adding more logic directly to it.

Review security-model changes carefully before merging them to `master`.
