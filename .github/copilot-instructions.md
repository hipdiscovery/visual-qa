# Visual QA — GitHub Copilot

Read `AGENTS.md`; this is a public, disposable, read-only browser renderer, not a mirror of private repos. `qa/run.mjs`, `qa/targets.json`, `qa-request.json`, `qa/cleanup.mjs`, `qa/policy-check.mjs` and the workflow share one security/storage contract. Do not broaden URLs, add credentials, copy private screenshots, cache persistent artifacts, or enable automatic PR-triggered runs. Preserve the last good artifact when replacement fails.

Review actual screenshots before claiming a visual pass, and recheck read-only request boundaries, viewport coverage and cleanup on any runner change. Do not add paid rendering or unnecessary browser downloads.