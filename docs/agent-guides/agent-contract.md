# HipDiscovery Agent Contract

Contract version: 2026-10-16
Canonical source: `hipdiscovery/stream-bot/docs/agent-guides/agent-contract.md`.

This neutral file is the stable local fallback for the shared contract. Root `AGENTS.md` owns repository-specific branch, deployment, product, security, and verification rules. Read the canonical source when cross-repo access is available; if it is not, these minimum rules still apply.

## Required minimum

- Start from the repository's current canonical delivery branch and current source/tests/docs/runtime. Follow root `AGENTS.md` for branch, CI, release, and deployment policy. Re-fetch shared/hot files before writing, preserve concurrent unrelated work, and never overwrite newer work merely to simplify a task.
- Authorized fixes/improvements require implementation and verified delivery when supported, not only a plan. Prefer chat-only execution and existing/free/local resources; get owner approval before new paid or materially increased recurring metered work.
- Current validated repository/runtime state plus the latest accepted owner direction outrank stale chats, screenshots, incident notes, or expired one-shot instructions. Make routine reversible decisions from established direction instead of re-asking settled questions.
- Investigate root cause, related failure paths, reliability, UX, maintainability, performance, security, and meaningful adjacent improvements within scope. Do not replace a working product with speculative architecture.
- Keep automation repeat-safe and bounded. Document owner/trigger/cadence/dedupe/retry/recovery/usage for recurring work. Prefer events or existing schedules over new polling.
- External APIs and recurring AI need explicit source/model, auth/permissions, cadence, quota/cost, timeout/retry, cache/fingerprint, and failure behavior. Deterministic logic should stay deterministic.
- Completion requires real-output verification at the relevant layer. Distinguish edited, tested, built, installed, committed, pushed, deployed, and runtime-confirmed states; never claim a stronger stage than was observed.
- Preserve safety, data, history, credentials, useful logging, retries, health checks, and recovery. Git history is the archive; do not create backup/checkpoint/handoff files or dormant duplicate implementations for routine work.
- Finished work leaves no placeholder TODOs, dead code, abandoned experiments, unexplained temporary bypasses, or unnecessary scratch created by the task.

## Durable learning and chat recovery

- Treat chats as useful but disposable context. Durable project state belongs in the repository, tests, configuration, maintained guidance, Git history, and validated runtime/deployment state.
- Leave implementation work recoverable at natural response boundaries whenever practical. Promptly commit/deliver coherent validated work according to repo policy instead of waiting for a future closeout request. Do not commit a known-broken, speculative, partially tested, or temporary debugging state merely to make the tree look clean.
- Learn from explicit owner feedback, accepted corrections, recurring preferences, and observed outcomes. Classify every lesson before recording it: cross-repo, repository-wide, feature-specific, environment-specific, or one-task-only.
- A clear direct owner statement may be sufficient when scope is clear; repetition increases confidence but is not required. Brainstorming, questions, tentative experiments, guesses, and unconfirmed observations are not durable rules.
- Record only lessons likely to improve future decisions. Prefer adaptable intent, outcomes, invariants, and decision criteria over freezing today's exact implementation/provider/version/layout/workaround unless that detail is itself a verified requirement.
- Guidance is living, not append-only. When newer accepted direction or stronger evidence supersedes a rule in the same scope, edit, replace, narrow, or remove the stale rule and update related tests/docs/configuration. Do not preserve contradictory notes as equal truth just because they are old.
- If a potential durable lesson is materially ambiguous, confirm its scope before recording it. Otherwise keep it out of canonical guidance until evidence improves. Never put secrets, credentials, sensitive personal facts, or transient diagnostics into agent guidance.
- On a new chat, recover from current repo guidance, canonical branch/history, tests/configuration, deployment/runtime state, then relevant prior context. Prefer newer validated durable state over an older conflicting chat unless the owner explicitly reasserts the older direction.

## Close out chat workflow

When the owner says `close out chat workflow`, `close out the chat`, asks whether the chat is safe to delete, or uses equivalent wording, perform a final project-state audit rather than only summarizing:

1. Re-read the current goal, accepted corrections, root `AGENTS.md`, current canonical branch, recent relevant commits, and runtime/deployment state.
2. Finish routine authorized work that can still be completed with available tools; do not substitute an issue/TODO/handoff note for executable work.
3. Audit for validated-but-undelivered work, unresolved conflicts, intentional experiments, forgotten temporary edits, and concurrent unrelated changes. Deliver coherent validated work; do not commit a knowingly bad experiment just to obtain a clean tree.
4. Run/confirm the relevant focused checks, broader gate, and real-output/build/install/deploy/runtime verification required by the task. State unobserved stages precisely.
5. Audit durable learning: promote only established reusable lessons, classify scope, update the canonical rule instead of appending duplicates, and correct/remove stale guidance when superseded. Leave tentative ideas unrecorded.
6. Remove abandoned experiments and disposable task artifacts after their evidence is no longer needed while preserving unknown/concurrent work and required evidence.
7. Re-fetch the canonical branch and verify exact delivered commits/content and deployed/runtime SHA where relevant. Do not create a ceremonial closeout commit or handoff file when there is no legitimate durable change.
8. Say **safe to delete** only when no unique actionable requirement, accepted decision, unresolved blocker, or reusable lesson exists solely in the chat. If something remains, name the exact item, why it remains unresolved, what evidence/action is still required, and where the recoverable state lives.
