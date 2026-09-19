---
applyTo: "qa/cleanup.mjs,qa/policy-check.mjs,.github/workflows/visual-qa.yml,package*.json"
---

Read `AGENTS.md`, current source and tests. Keep manual trigger, least-privilege permissions, one-day artifact retention and pinned dependency integrity. Preserve the last successful artifact when rendering fails; check cleanup after successful replacement. Do not add automatic PR-triggered executions or pay for repeated browser installations.
