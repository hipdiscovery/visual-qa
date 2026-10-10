# HipDiscovery Agent Contract

Contract version: 2026-10-10
Canonical source: `hipdiscovery/stream-bot/docs/agent-guides/agent-contract.md`.

This neutral file is the stable local discovery path for the shared contract. `AGENTS.md` remains this repository's only agent instruction contract. Read the canonical source when cross-repo access is available; if it is not, these minimum rules still apply.

## Required minimum

- Work from current `master`; no side branches, force-pushes, GitHub Actions, or vendor instruction mirrors. Re-fetch shared files before writing and reconcile concurrent changes.
- New/increased recurring metered work requires a cost card before implementation and owner approval before enabling it. Never guess usage. State `not measured` plus the exact measurement/formula when unknown. Reusing an existing scheduler means **0 new scheduled invocations**.
- Cost cards report **Current, Change, Added/Saved, Meters affected, Headroom, Recommendation** and keep Worker requests, API calls, KV reads/writes, D1 reads/writes, storage, build/deploy, AI/tool usage, and external-service meters separate.
- Every automation documents one owner, trigger, cadence, idempotency/dedupe, retry/backoff, failure recovery, and usage impact. Prefer events/webhooks → existing schedule → cached/change-fingerprint reads → polling only when necessary.
- Publishing/mutations are repeat-safe: deterministic identity/hash/state/lease as appropriate; important delivery follows **detect → validate → claim/queue → send → confirm → record** and handles partial failures.
- External APIs document source/endpoint, auth, quota, cadence, cache/fingerprint, timeout/retry, and failure behavior. Prefer official/free structured sources and bounded requests.
- Recurring AI must document model, calls/day/month, allowance/cost, and why deterministic code is insufficient. Keep AI out of hot paths when deterministic logic works.
- Completion requires real-output verification at the relevant layer; tests/builds alone do not prove Discord/Twitch/site/app/deployment behavior. Run the exact failed check first, then the full relevant gate.
- Preserve safety, data, history, useful logging, retries, health checks, and recovery. Cross-repo retirement must trace all callers/health/usage/UI/docs. Git history is the archive.
