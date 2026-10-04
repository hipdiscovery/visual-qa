# Visual QA agent contract

## Cross-agent operating contract

These owner rules apply to every assistant working here, including ChatGPT, Codex, Grok and Muse. `AGENTS.md` is the repository's shared entrypoint; client-specific project instructions handle conversation/mode preferences, not a competing engineering contract. A tool that does not discover this file automatically must be directed to read it before repository work. Never assume another assistant sees this chat or has the same tools.

- **Hands-off outcome:** automate recurring manual steps and prevent recurring corrections. Own implementation, appropriate verification, integration and cleanup. Make routine engineering decisions; ask the owner for consequential spending, public actions, meaningful data loss, product direction or substantial visual choices. Preserve all existing safety and product contracts below.
- **Chat-first capability check:** prefer the current chat and assume metered work-mode allowance may be unavailable. Inspect actual tools, connectors, files and permissions; discover relevant capabilities when supported and try reasonable available routes before escalation. Coding, screenshots, complexity and unfamiliarity alone do not require another mode. Complete independent work here. Escalate only for a concrete missing capability or a substantial reliability/effort advantage after considering usage; explain the exact remaining action. Do not claim access, a mode transfer or a test that did not occur.
- **Prepare as a specialist:** each new session reads current `master`, this file, relevant specialist docs, affected code/tests and overlapping work. Investigate material knowledge gaps with current authoritative sources before acting. Scale research to uncertainty and consequence; reuse verified evidence instead of repeating extensive research for familiar tasks. Research is preparation, not proof of expertise or working behavior.
- **Sustainable resource use:** prefer existing local/on-device, event-driven and non-usage-billed capabilities when suitable. Verify limits and terms; free is not automatically unlimited. Respect authorized allowances, avoid upgrades/overages, and examine AI/tool, API, build, hosting, storage and monitoring costs together. Cache safely, batch work, suppress duplicate requests and bound retries. Seek improvements that reduce several costs/failure points without weakening necessary verification. Delegate only when supported, authorized and materially beneficial; concurrent owner-started chats do not require spawning extra agents.
- **Self-correct:** investigate and fix routine failures within scope rather than asking the owner to choose a backend remedy. Repair the cause and add proportionate recurrence prevention; verify the original failure and surrounding behavior. Use bounded recovery and existing signals. Do not hide errors, weaken valid checks or promise failures can never recur. New recurring monitors require authorization and should notify only on meaningful actionable changes.
- **Communication:** keep results short, plain and outcome-first. State what changed, what was actually verified and whether it is installed/deployed. Do not make the owner coordinate implementation or manually verify what available tools can verify. Surface a concrete decision or blocker when action is needed; do not conceal significant unresolved failures.
- **Compact continuity:** keep one primary conversation when practical. Transfer only when useful or required. Provide one cumulative, self-contained handoff with outcome/latest feedback, essential decisions and reasons, repository/ref/commit and installation location, relevant files/evidence, completed work, actual checks, unverified behavior/blockers and the exact scoped next action. The receiving execution agent must return the same updated summary, including GitHub-versus-live status, and state when ordinary chat can resume. Preserve useful failed approaches only when they prevent repeated mistakes. Use Git history and existing neutral docs/issues for durable state; do not create redundant handoff files or force a new chat at every milestone.

## No GitHub Actions

- GitHub Actions is intentionally not part of this repository's workflow. Do not add, restore, enable, dispatch, or depend on `.github/workflows/`.
- GitHub is for `master` source/history and release storage only. Run tests, builds, packaging, and validation locally on an authorized computer or on the product's existing non-GitHub platform when applicable.
- Branch hygiene is enforced by the master-only agent rules, local updater/preflight scripts, and the scheduled ChatGPT GitHub audit — not by hosted runners.
- If local/runtime verification is unavailable, say exactly what was not run; do not substitute a GitHub Action.


## Non-negotiable repository rules

- **`master` is the only branch, local or remote.** Do not create, check out, push, keep, or leave any other branch — no `main`, feature, fix, review, task, preview, agent, temporary, backup, or throwaway branches.
- Start every task from the latest `master`, work directly on `master`, and commit finished work directly to `master`.
- Never use a tool or workflow that requires creating a side branch. Choose a direct-to-`master` path instead.
- If a pre-existing non-`master` branch is discovered, inspect its unique work, reconcile any still-valid changes onto current `master`, then remove that branch. Do not leave branch-only work behind and do not keep the branch as an archive.
- **`AGENTS.md` is the only agent instruction contract.** Do not add or recreate `CLAUDE.md`, `CODEX.md`, `CHATGPT.md`, `.claude/`, `.codex/`, `.agents/`, or any vendor-specific instruction mirror. Put shared instructions here; put deeper product/engineering documentation in neutral docs referenced from here.
- Git history is the archive. Do not create handoff/checkpoint files, old-version folders, backup copies, or dormant “just in case” code.
## Chat tool routing

- Use GitHub as the source of truth for this runner source; retain actual locally produced QA evidence without depending on Actions.
- Use Context7 for current Playwright/Node/API documentation before making version-sensitive runner changes.
- TinyFish/native web may inspect public targets or supporting public docs, but extracted content is not visual proof. Prefer read/search/fetch-style retrieval before metered interactive automation.
- Opera Browser Connector may provide a supplemental live-browser look, but this repository's own allowlisted locally produced captures remain the authoritative repeatable QA evidence.
- Do not make this public runner depend on Troy's PC or Remote Desktop Commander. If local Windows access is separately needed for another repo, Remote Desktop Commander is on-demand and Troy starts it with `npx.cmd -y @wonderwhy-er/desktop-commander@0.2.48 remote`; never add startup persistence here.
- Search the plugin directory before inventing a manual workaround for a missing capability. Prefer free/generous tools and quantify metered usage before adopting it.

## Root-cause incident protocol

- **Every real failure must be closed at the cause, not only at the symptom.** This includes failed builds/tests/deploys, runtime errors, regressions, broken automation, and repeated manual-repair incidents.
- Read the **first real failing command/assertion/log line** before changing code. Identify both the technical root cause and the process/guard gap that allowed it through.
- Fix the cause while preserving intended working behavior. Never weaken a true safety or functional contract merely to make a check green; if the test/fixture is wrong, correct it and make its preconditions self-validating.
- Add recurrence prevention in the same incident at the right layer: a focused regression test, invariant/guard, shared source of truth, safer fixture/helper, dedupe/idempotence protection, or neutral documentation update. A symptom-only patch is incomplete.
- Verify in order: the **exact failed check first**, then the repo's relevant complete gate, then the exact resulting current-`master` deploy/build/runtime check when applicable. Do not stack unrelated fixes while the incident is still unverified.
- If a process gap contributed, update `AGENTS.md` and/or the relevant neutral project documentation in the same incident so the next agent does not repeat it.

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
- `qa/cleanup.mjs`: preserve the last good artifact when a replacement fails; bound local artifact storage and retention.
- `qa/policy-check.mjs`: preserve the allowlist, manual execution, bounded short-lived artifacts and public-only content. Run policy validation locally; do not restore the retired `.github/workflows/visual-qa.yml`.
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

