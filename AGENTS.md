# Visual QA agent contract

Read `docs/agent-guides/agent-contract.md` before making changes. It points to the canonical cross-repo contract for metered usage, automation ownership, idempotency, API/AI use, verification, reliability, and maintainability. This root `AGENTS.md` is the only repo-specific agent instruction contract.

## Repository invariants

- GitHub `master` is the only branch. Start from current `master`, preserve concurrent unrelated work, and commit finished work directly to `master`; never force-push.
- No GitHub Actions. Do not add, restore, enable, dispatch, or depend on `.github/workflows/`; run validation locally or on the product's existing non-GitHub runtime.
- Do not create `CLAUDE.md`, `CODEX.md`, `CHATGPT.md`, `.claude/`, `.codex/`, `.agents/`, nested `AGENTS.md`, or vendor-specific mirrors. Neutral specialist guidance belongs under `docs/`.
- Run `node tools/check-agent-policy.mjs` before committing agent-policy changes.
- Git history is the archive; do not add backup/checkpoint/handoff files or dormant old implementations.

## Chat tool routing

- Use GitHub as the source of truth for this runner source; retain actual locally produced QA evidence without depending on Actions.
- Use Context7 for current Playwright/Node/API documentation before making version-sensitive runner changes.
- TinyFish/native web may inspect public targets or supporting public docs, but extracted content is not visual proof. Prefer read/search/fetch-style retrieval before metered interactive automation.
- Opera Browser Connector may provide a supplemental live-browser look, but this repository's own allowlisted locally produced captures remain the authoritative repeatable QA evidence.
- Do not make this public runner depend on Troy's PC or Remote Desktop Commander. If local Windows access is separately needed for another repo, Remote Desktop Commander is on-demand and Troy starts it with `npx.cmd -y @wonderwhy-er/desktop-commander@0.2.48 remote`; never add startup persistence here.
- Search the plugin directory before inventing a manual workaround for a missing capability. Prefer free/generous tools and quantify metered usage before adopting it.

## Honest horizontal-scroll diagnostics

- A deliberately scrollable horizontal rail can place children partly beyond
  the viewport; flag those as **intentional scroll children**, not actionable
  viewport-edge collisions, only when a real scrollable overflow-X ancestor
  is itself contained in the viewport. Preserve genuine page/parent overflow,
  hidden/clip risks, broken images and JavaScript errors as separate findings.
- Read the classified counts **and** inspect the actual browser screenshot,
  including visible/active chips and mobile touch/keyboard accessibility.
  A quiet edge-collision count does not prove the composition looks good.
  Do not blanket-ignore filter classes or all offscreen controls: other
  pages and broken containers still need warnings.

## File-level quality checks

- `qa/run.mjs`: check read-only browser navigation, allowlisted targets, viewport capture, deployment-byte probes, request bounds and errors before marking a render pass.
- `qa/targets.json`, `qa-request.json`: never accept arbitrary destinations, private access tokens or unsafe new targets; test malformed and unexpected route values.
- `qa/cleanup.mjs`: preserve the last good artifact when a replacement fails; bound local artifact storage and retention.
- `qa/policy-check.mjs`: preserve the allowlist, manual execution, bounded short-lived artifacts and public-only content. Run policy validation locally; do not restore the retired `.github/workflows/visual-qa.yml`.
- Do not claim screenshots were reviewed if an agent only confirmed that the runner produced files.
