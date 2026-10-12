## Visual QA change

- [ ] No secrets, private source, private URLs, credentials, cookies, user data, or logged-in browser profiles are included.
- [ ] No arbitrary-URL, authentication, private-network, or Bridge-privilege capability was added.
- [ ] No GitHub Actions workflow was added or restored.
- [ ] New targets, if any, are intentionally public, HTTPS, explicitly allowlisted, and require deployment probes.
- [ ] Dependencies remain exact-version pinned and integrity locked.
- [ ] `qa/policy-check.mjs` still enforces the intended local-only security model.
- [ ] `npm run verify` passes locally.
- [ ] Generated screenshots/reports are not committed.
- [ ] Changes avoid growing the legacy oversized `qa/run.mjs` when extraction is practical.
