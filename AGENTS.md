# Visual QA agent contract

Read `docs/agent-guides/agent-contract.md` before making changes. It points to the canonical cross-repo contract for metered usage, automation ownership, idempotency, API/AI use, verification, reliability, and maintainability. This root `AGENTS.md` is the only repo-specific agent instruction contract.

## Repository invariants

- GitHub `master` is the only branch. Start from current `master`, preserve concurrent unrelated work, and commit finished work directly to `master`; never force-push.
- No GitHub Actions. Do not add, restore, enable, dispatch, or depend on `.github/workflows/`; run validation locally or on the product's existing non-GitHub runtime.
- Do not create `CLAUDE.md`, `CODEX.md`, `CHATGPT.md`, `.claude/`, `.codex/`, `.agents/`, nested `AGENTS.md`, or vendor-specific mirrors. Neutral specialist guidance belongs under `docs/`.
- Run `node tools/check-agent-policy.mjs` before committing agent-policy changes.
- Git history is the archive; do not add backup/checkpoint/handoff files or dormant old implementations.

## Product boundary

- This repository is a narrow, local, disposable browser-QA harness for allowlisted public pages. It is not a general browser agent and must never gain private-site authentication or arbitrary navigation.
- Keep it separate from `hipdiscovery/HipNativeBridge`. Hip Native Bridge is the privileged control plane for a real browser, files, processes, Git, and desktop input; Visual QA provides isolated repeatable viewport/journey evidence. Bridge may start this runner as a local process, but Visual QA must not receive Bridge tokens, private file access, logged-in browser profiles, or desktop-control privileges.
- `qa/run.mjs` is a legacy oversized file under a no-growth baseline. Prefer extracting focused modules and shrinking the exception instead of adding more logic directly to it.

## Chat tool routing

- Use GitHub as source of truth for runner source and keep generated QA evidence local/disposable.
- Use Context7 for current Playwright/Node/API documentation before version-sensitive runner changes.
- Native/live browser tools may supplement inspection, but this repository's own allowlisted local captures are the authoritative repeatable public-browser evidence.
- Search installed plugins before inventing a workaround for a missing capability. Prefer free/local tools and quantify metered usage before adopting it.

## Honest horizontal-scroll diagnostics

- A deliberately scrollable horizontal rail can place children partly beyond the viewport; flag those as **intentional scroll children**, not actionable viewport-edge collisions, only when a real scrollable overflow-X ancestor is itself contained in the viewport. Preserve genuine page/parent overflow, hidden/clip risks, broken images, and JavaScript errors as separate findings.
- Read classified counts and inspect the actual screenshot, including visible/active chips and mobile touch/keyboard accessibility. A quiet edge-collision count does not prove the composition looks good.
- Do not blanket-ignore filter classes or all offscreen controls: other pages and broken containers still need warnings.

## File-level quality checks

- `qa/run.mjs`: check read-only browser navigation, allowlisted targets, viewport capture, deployment-byte probes, request bounds, journeys, diagnostics, and errors before marking a render pass.
- `qa/local.mjs`, `qa/browser-executable.mjs`: keep local launch cross-platform and dependency-free; prefer installed Chrome/Edge/Chromium and explicit `CHROME_BIN` over downloading another browser.
- `qa/targets.json`, `qa-request.json`: never accept arbitrary destinations, private access tokens, or unsafe new targets; test malformed and unexpected route values.
- `qa/policy-check.mjs`: preserve the allowlist, local-only execution, dependency pin, focused tests, and the absence of GitHub Actions.
- Do not claim screenshots were reviewed if an agent only confirmed that the runner produced files.
