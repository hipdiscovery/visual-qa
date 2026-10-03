# Visual QA agent contract

## Non-negotiable Git rule: `master` only

- **`master` is the only remote working branch.** Do not create, push, use, or leave any other remote branch — no `main`, feature, fix, review, task, preview, agent, temporary, or backup branches.
- Start every repository task from the latest `master` and commit finished work directly to `master`.
- A local throwaway branch/worktree is acceptable only if it is never pushed and its finished work is reconciled into `master` before the task ends.
- If an existing non-`master` remote branch contains unique work, reconcile that work into current `master` before deleting it. Never discard branch-only work just to make the branch list clean.
- Keep `.github/workflows/master-only.yml` enabled. It automatically absorbs a safe linear accidental branch into `master`, deletes branches already contained in `master`, and preserves/flags diverged branches instead of losing work.
- Git history is the archive. Do not create handoff/checkpoint files, old-version folders, backup copies, version-suffixed duplicates, `.claude/` rule trees, or dormant “just in case” code.

This is a **public, disposable rendering repo**, not a source-code mirror.

- Never copy private source, configuration, credentials, cookies, auth headers, API keys, signed URLs, private preview URLs, user data, or screenshots containing private information into this repo.
- Only add a target after confirming its rendered URL is intentionally public and safe for anonymous viewing.
- Keep target base URLs hard-coded in `qa/targets.json`. Do not add arbitrary URL input.
- Keep QA requests path-only. Do not add query-string or header support as a shortcut.
- Do not commit generated screenshots or reports. They belong only in the short-lived Actions artifact.
- A visual change is verified only after an agent actually looks at the screenshots.
- **Final visual approval means exhaustive impacted-state coverage, not a representative spot-check.** Before approval, inventory everything the change can visibly affect: the edited surface, every changed/new control, every resulting state or screen, nested controls revealed by those states, loading/empty/error/disabled states when applicable, and every responsive breakpoint that can change the composition. Exercise and inspect all of them. If a button opens a panel and that panel contains more changed buttons, the child states are part of the same required QA pass.
- Use `journeys` in `qa-request.json` for changed interactive flows and visual states. Cover clicks plus any changed hover, focus, and controlled error states that have distinct visuals. Every named journey must reach its expected controls; the runner captures evidence after each step and fails the pass if a selector cannot be reached, a visible image is broken, or the page develops horizontal overflow.
- Do not call a UI **visually approved**, **fully tested**, **done**, or **100%** from the initial viewport alone. Automated diagnostics are supporting evidence; spacing, hierarchy, alignment, crop/fit, text wrapping, visual balance, and polish must still be judged from every impacted screenshot.
- Final coverage must be impact-based and complete. Test every distinct reachable visual state affected by the change. When combinations themselves alter layout or appearance, cover those combinations too; do not hide behind one happy-path example.
- Troy's own later test is acceptance feedback, not the QA system. The agent should have already found and fixed bad spacing, wrapping, clipping, broken art, unreachable controls, and inconsistent states before asking him to look.
- For targets requiring freshness, probe the exact public CSS/JS/HTML bytes changed by the private source commit and wait for their Git blob SHA(s) to match before opening the browser. Never copy private source or commit SHAs into this public repo.
- Prefer viewport screenshots during iteration. Use full-page capture only when the task requires whole-page composition review.
- Request only the viewports relevant to an iteration; use the full standard matrix for final responsive verification.
- Keep the runner dependency-light. Use the Chrome already installed on GitHub's Ubuntu runner; do not download a browser on every run.
- Do not add PR-triggered execution. Public pull requests must never cause this workflow to run with elevated permissions.
- Keep workflow permissions minimal. The render job must remain `permissions: {}`; only the separate cleanup job may receive `actions: write`. Browser traffic stays read-only (GET/HEAD) and must never be given authentication material.
- Each new run should purge prior QA artifacts/runs; one-day artifact retention is only a fallback.
- After manual inspection, delete any downloaded artifact ZIPs and extracted screenshot directories from the agent's local/container workspace before completing the task. Screenshots are temporary QA evidence, not durable project files.
- If cleanup or visual rendering cannot be verified, say so. Do not claim a visual pass from source inspection alone.
- Capture the ordinary viewport before scrolling to a focus selector; focused screenshots are a second, separate view.
- Keep deployment probes small and byte-stable. The runner enforces a 5 MiB cap per probe.
- Do not bypass `qa/policy-check.mjs`. If a policy must change, update the policy and documentation deliberately in the same reviewed change.
- Preserve the last good artifact when a new run cannot produce a replacement; cleanup belongs after rendering.

## Chat tool routing

- Use GitHub as the source of truth for this runner and its Actions results.
- Use Context7 for current Playwright/Node/API documentation before making version-sensitive runner changes.
- TinyFish/native web may inspect public targets or supporting public docs, but extracted content is not visual proof. Prefer read/search/fetch-style retrieval before metered interactive automation.
- Opera Browser Connector may provide a supplemental live-browser look, but this repository's own allowlisted GitHub-hosted captures remain the authoritative repeatable QA evidence.
- Do not make this public runner depend on Troy's PC or Remote Desktop Commander. If local Windows access is separately needed for another repo, Remote Desktop Commander is on-demand and Troy starts it with `npx.cmd -y @wonderwhy-er/desktop-commander@0.2.48 remote`; never add startup persistence here.
- Search the plugin directory before inventing a manual workaround for a missing capability. Prefer free/generous tools and quantify metered usage before adopting it.

## Automation default

Automation and zero-touch workflows are the default goal. Minimize Troy's manual steps whenever the computer/agent can safely perform them. The agent should execute routine setup, navigation, testing, cleanup, file movement, deployment verification, and repetitive actions itself instead of handing Troy a checklist. Ask Troy to act only when genuinely required for approval, credentials/security, spending money, irreversible/destructive choices, public actions made as him, or something the agent technically cannot perform.


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
- `qa/cleanup.mjs`: preserve the last good artifact when a replacement fails; avoid unbounded Actions storage.
- `qa/policy-check.mjs` and `.github/workflows/visual-qa.yml`: keep minimal permissions, manual execution, bounded short-lived artifacts, and public-only content. Recheck policy on any workflow change.
- Do not claim screenshots were reviewed if an agent only confirmed that the runner produced files.


## ChatGPT and GitHub connector file-size rules

For handwritten source and tests that agents will routinely inspect or edit, use **30 KiB or 500 lines as a practical upper target**. Before growing a file past either mark, split it along real responsibilities and preserve its public interfaces. Do not split a cohesive feature solely to hit a number. If a safe split would harm the app, keep the file stable, record the exception, and use verified chunks for every connector read.

The GitHub connector supports 1-based `start_line`/`end_line` reads, but its effective response and model-context limits vary and are not published as one reliable file-size ceiling. Never assume a whole-file response is complete. For large files, fetch contiguous chunks of at most 200 lines, include imports/exports and affected callers, verify the chunks cover the required code, then edit from the complete current source. Never replace a file from a truncated response.

Do not apply the size target to generated or minified bundles, vendored dependencies, lockfiles, binary assets, archived records, or captured/generated fixtures. Do not hand-edit generated output when source exists. Avoid enlarging an already oversized authored module; refactor it incrementally when safe, with focused tests and compatibility checks.

## Metered-usage reporting

When a feature touches a quota, free-tier allowance, rate limit, API-call budget, browser time, storage/database usage, or another metered resource, quantify **Current**, **Change**, **Saved / Added**, **Headroom**, **Cost**, and **Recommendation**. Derive numbers from current code/schedulers and current provider docs; keep meters separate; say **0 invocations saved/added** when only subrequests change; give a formula instead of inventing an unavailable total.

## Research-first, optimize-first engineering

For an unfamiliar API, platform capability, quota, auth flow, scraping surface, SDK, framework, or tool, inspect current repo state, research current authoritative docs and working methods, then test the chosen path against the real target when possible. Prefer official/free structured APIs or events, then stable free structured public sources, then bounded browser/DOM automation; OCR is last. A path that produces no real readings is failed. Optimize for the best reliable result first: minimum recurring calls, no duplicate polling, no paid dependency when a free path works, bounded fallbacks, and newest stable tools only when they improve reliability or efficiency.

## Retirement and dead-code hygiene

When removing a feature, remove everything that exists only for it after any required one-time migration: modules, imports, constants, state, tests, docs, helper scripts, fixtures, comments, UI copy, and scheduler hooks. Search the current tree for old names/symbols/routes/files before calling removal complete. Preserve independently useful shared functionality. Git history is the archive.

