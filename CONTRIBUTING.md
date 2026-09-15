# Contributing

This repository is a public execution surface for HipDiscovery visual QA, not a general browser-automation project.

Before proposing a change:

- Never include secrets, private source, private preview URLs, credentials, cookies, user data, or authenticated browser state.
- Do not add arbitrary URL, custom-header, cookie, login, localStorage-injection, or private-network support.
- New targets must be intentionally public, use HTTPS, be explicitly allowlisted in `qa/targets.json`, and require deployment probes.
- Do not add `pull_request`, `pull_request_target`, or scheduled execution to the Visual QA workflow.
- The render job must keep `permissions: {}`; only the post-render cleanup job may hold `actions: write`.
- Keep dependencies exact-version pinned and integrity locked.
- Generated screenshots/reports belong in short-lived Actions artifacts only; never commit them.
- Do not weaken or bypass `qa/policy-check.mjs`.

External pull requests do not execute the Visual QA workflow. Repository-owner review is required before security-model changes are accepted.
