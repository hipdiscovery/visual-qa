# Visual QA agent contract

This is a **public, disposable rendering repo**, not a source-code mirror.

- Never copy private source, configuration, credentials, cookies, auth headers, API keys, signed URLs, private preview URLs, user data, or screenshots containing private information into this repo.
- Only add a target after confirming its rendered URL is intentionally public and safe for anonymous viewing.
- Keep target base URLs hard-coded in `qa/targets.json`. Do not add arbitrary URL input.
- Keep QA requests path-only. Do not add query-string or header support as a shortcut.
- Do not commit generated screenshots or reports. They belong only in the short-lived Actions artifact.
- A visual change is verified only after an agent actually looks at the screenshots.
- For targets requiring freshness, probe the exact public CSS/JS/HTML bytes changed by the private source commit and wait for their Git blob SHA(s) to match before opening the browser. Never copy private source or commit SHAs into this public repo.
- Prefer viewport screenshots during iteration. Use full-page capture only when the task requires whole-page composition review.
- Request only the viewports relevant to an iteration; use the full standard matrix for final responsive verification.
- Keep the runner dependency-light. Use the Chrome already installed on GitHub's Ubuntu runner; do not download a browser on every run.
- Do not add PR-triggered execution. Public pull requests must never cause this workflow to run with elevated permissions.
- Keep workflow permissions minimal. The render job must remain `permissions: {}`; only the separate cleanup job may receive `actions: write`. Browser traffic stays read-only (GET/HEAD) and must never be given authentication material.
- Each new run should purge prior QA artifacts/runs; one-day artifact retention is only a fallback.
- If cleanup or visual rendering cannot be verified, say so. Do not claim a visual pass from source inspection alone.
- Capture the ordinary viewport before scrolling to a focus selector; focused screenshots are a second, separate view.
- Keep deployment probes small and byte-stable. The runner enforces a 5 MiB cap per probe.
