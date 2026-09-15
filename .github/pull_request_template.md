## Visual QA change

- [ ] No secrets, private source, private URLs, credentials, cookies, or user data are included.
- [ ] No arbitrary-URL/authentication/private-network capability was added.
- [ ] Render job remains `permissions: {}`.
- [ ] No PR-triggered or scheduled browser execution was added.
- [ ] New targets, if any, are intentionally public and explicitly allowlisted.
- [ ] Dependencies/actions remain exact-version or commit pinned.
- [ ] `qa/policy-check.mjs` still enforces the intended security model.
- [ ] Generated screenshots/reports are not committed.
