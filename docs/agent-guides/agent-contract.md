# HipDiscovery Agent Contract

Contract version: 2026-10-11
Canonical source: `hipdiscovery/stream-bot/docs/agent-guides/agent-contract.md`.

This neutral file is the stable local discovery path for the shared contract. `AGENTS.md` remains this repository's only repo-specific agent instruction contract. Read the canonical source when cross-repo access is available; if it is not, these minimum rules still apply.

## Required minimum

- Work from current `master`; no side branches, force-pushes, GitHub Actions, or vendor instruction mirrors. Re-fetch shared/hot files before writing and reconcile concurrent changes.
- Authorized updates require implementation and verified delivery to current master, not only a plan. Discover supported GitHub writes, use complete current content and SHA, and report the actual commit link or exact failed operation; file budgets do not establish connector payload limits.
- Prefer chat-only execution and existing/free/local resources first. Metered Work requires owner approval for the exact missing operation. Paid options may be proposed only when materially better; explain why the free route falls short and the expected cost, then get approval before enabling them.
- Carry the owner's latest accepted corrections and unfinished goal across chats, then verify them against current source/runtime. Make routine reversible decisions from established direction instead of re-asking settled questions.
- For improve/review/audit requests, investigate root cause, related failure paths and meaningful adjacent improvements. Do not stop after the first obvious patch when closely related defects remain, and do not replace a working product with speculative architecture.
- New or increased recurring metered work, paid services, or material provider-meter increases require a cost card before implementation and owner approval before enabling. Cost-neutral reuse/replacement and bounded one-off reads do not require a full cost card; never guess usage, and state `not measured` plus the exact measurement/formula when unknown.
- Every automation documents one owner, trigger, cadence, idempotency/dedupe, retry/backoff, failure recovery, and usage impact. Prefer events/webhooks → existing schedule → cached/change-fingerprint reads → polling only when necessary.
- Publishing/mutations are repeat-safe: deterministic identity/hash/state/lease as appropriate; important delivery follows **detect → validate → claim/queue → send → confirm → record** and handles partial failures.
- External APIs document source/endpoint, auth, quota, cadence, cache/fingerprint, timeout/retry, and failure behavior. Prefer official/free structured sources and bounded requests.
- Recurring AI must document model, calls/day/month, allowance/cost, and why deterministic code is insufficient. Keep AI out of hot paths when deterministic logic works.
- Completion requires real-output Verification at the relevant layer; tests/builds alone do not prove Discord/Twitch/site/app/deployment behavior. Run the exact failed check first, then the relevant full gate, and distinguish committed, tested, built, installed, deployed and runtime-confirmed stages.
- Preserve safety, data, history, useful logging, retries, health checks and recovery. Cross-repo retirement must trace all callers/health/usage/UI/docs. Git history is the archive.
- Finished work leaves no placeholder TODOs, dead code, duplicate implementations, abandoned experiments or unexplained temporary bypasses. Keep comments for non-obvious invariants rather than narrating obvious code.
- New hand-maintained source/tests/docs should begin splitting at 16 KiB or 250 logical lines and stay below 24 KiB or 400 lines unless a narrower justified repo exception exists. Root `AGENTS.md` targets 8 KiB/120 lines with a 12 KiB/200-line ceiling. Generated/vendor/media/data outputs are exempt only by actual provenance.
