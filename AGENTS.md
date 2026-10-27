# Visual QA agent contract

Read `docs/agent-guides/agent-contract.md`, `SECURITY.md` and current source/request/tests before changing behavior. This is the only repository-specific agent entrypoint; neutral specialist guidance belongs in `docs/`.

## Working rules

- Work directly on current `master`, preserve concurrent edits and recheck remote state before delivery. Requested public repository file edits/commits are authorized without another prompt. Never force-push, create side branches or add/run GitHub Actions.
- Own implementation, focused checks, review and cleanup; concise reporting does not reduce investigation. Prefer existing/free/local tools. Public messages, product releases, sensitive access expansion, spending and destructive user-data changes retain separate authorization.
- No vendor instruction mirrors, backup/checkpoint copies or abandoned experiments. Git preserves history.

## Clarity and three-audience change gate

- Remove redundant slogans, explanatory filler and low-value labels. If purpose, next action or state becomes unclear without them, redesign the layout, hierarchy and affordances from first principles instead of explaining a confusing UI. Keep necessary visible input labels, accessible names, status/error/safety information and contextual help.
- Favor recognition over recall, familiar wording, clear primary actions, progressive disclosure of rare options and recoverable errors. Do not hide frequent actions for the sake of minimalism; inspect responsive, loading, empty, error and keyboard states.
- Evaluate **user experience** (task clarity and accessibility), **developer experience** (maintainable contracts, tests and diagnostics), and **AI-agent experience** (discoverable ownership, concise current instructions and repeatable verification). Improve the dimensions relevant to the task; preserving unaffected ones is sufficient. Do not expand scope solely to manufacture benefits for all three. Preserve functionality, accessibility, reliability, integrations and data; verify affected behavior and explain any material tradeoffs.


## Product and trust boundaries

- This is a local runner for allowlisted public pages, not an authenticated browser agent. Keep private source, owner details, credentials, headers/cookies, signed/private URLs and real profiles out of requests, outputs and commits.
- The privileged companion is `hipdiscovery/Hip-MCP` (formerly HipNativeBridge). It may launch this process but must not pass Bridge tokens, private-file privileges, browser profiles or desktop capabilities into this harness.
- `qa/targets.json` owns HTTPS host allowlists, viewport names and mandatory public deployment probes. Preserve literal-IP and DNS-resolved private-network blocking, GET/HEAD restrictions, bounded responses, blocked service workers and navigation guards. Never add an arbitrary URL/header/session escape hatch.

## Source and execution

- `qa/local.mjs` uses `qa/browser-executable.mjs` to discover an installed browser, sets `CHROME_BIN` and imports `qa/run.mjs`. Discovery uses Node built-ins; rendering requires exact-version/integrity-locked `playwright-core`. Do not download another browser or loosen the dependency pin to make a test pass.
- Run from the repository root: `npm ci --ignore-scripts --no-audit --no-fund`, then `npm run qa -- <request.json>`. Inspect the request first: `qa/run.mjs` preserves earlier `out/` until request and public deployment probes pass, then replaces it before capture. Serialize runs sharing a checkout; retain necessary prior evidence outside `out/` before another run.
- Requests use safe IDs, a target key, plain root-relative paths, configured viewports, selectors, bounded waits and journeys. Current limits are 1–4 public probes of 5 MiB each, 1–20 journeys and 100 total steps. Inspect current validation before changing bounds.
- Probes compare deployed bytes using the Git blob SHA, not raw SHA-1/SHA-256. Use the source repository's canonical blob respecting its line endings. A mismatch is stale/different delivery, not permission to omit the probe. Never copy private source here.
- `qa/run.mjs` has a no-growth size baseline. Extract coherent modules rather than extending its legacy exception.

## Coverage and evidence

- Interactive changes require exhaustive impacted-state coverage: every changed control plus loading/error/expanded/selected states at affected breakpoints. Nested controls and their child states are part of the same required QA pass. Use supported click/hover/focus/select/allowlisted-dispatch journeys; report states the harness cannot exercise.
- Inspect every impacted screenshot and report for long content, keyboard/focus, images, composition and async layout shifts. Generated files, runner success or quiet diagnostics alone are not visual approval or full state coverage.
- `qa/diagnostic-policy.mjs` classifies intentional horizontal-scroll children only when their overflow ancestor is contained. Preserve real parent/page overflow, hidden/clip risks, broken images and JavaScript errors; never blanket-ignore classes/offscreen controls.
- `qa/visual-diff-review.mjs` compares screenshot file bytes only, not perceptual/pixel quality, accessibility or audio. Use `docs/visual-diff-workflow.md` and `docs/visual-review-scorecard.md` when relevant.
- Keep `out/` ignored/task-local. Remove disposable evidence after review without deleting the only useful failure evidence or another task's output.
- Diagnose intermittent browser failures with a bounded local Playwright context trace when necessary; retain it only on failure. The request schema currently has no tracing field: do not invent one or weaken validation. Trace only the same allowlisted public surface, keep traces task-local and inspect them for sensitive data before sharing.
- Reuse installed-browser discovery and existing diagnostics before adding another scanner or browser. If an accessibility gap requires an available local scanner, preserve all navigation/network guards and treat results as supplemental; manual keyboard/focus, labels, contrast and responsive state inspection remain required.
- Browser screenshots/traces cannot verify native application controls or audible output. Report those omitted surfaces explicitly instead of expanding this harness into a privileged/native or authenticated runner.

## Verification and tool access

- `npm test` / `npm run verify` runs syntax/policy, focused contracts, agent policy and Python size checks. `npm run qa` is a separate real-browser gate. Run `git diff --check`; instruction-policy edits require `node tools/check-agent-policy.mjs`.
- The size wrapper probes for working Python 3 (Windows prefers `py -3`) and skips missing/broken aliases. Once the checker starts, its failure is final; do not retry another interpreter to hide a budget error. `npm test` includes launcher regression tests. Direct diagnosis may use `py -3 tools/checkFileSizes.py` on Windows; report any wrapper failure separately.
- Use current official Playwright/Node documentation or an available documentation tool for version-sensitive changes. Context7 is optional; an unavailable plugin must not block safe source work or be invented as callable.
- Instruction-only changes need source/command/policy checks, not a new capture/deployment. Keep source validation, capture, visual review and remote delivery distinct.
