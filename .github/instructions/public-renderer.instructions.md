---
applyTo: "qa/run.mjs,qa/targets.json,qa-request.json"
---

Read `AGENTS.md`, current source and tests. Only render explicitly allowlisted public HTTPS origins without credentials. Validate navigation, every redirect and deployment-byte probe within bounds; reject private addresses, unsafe URLs and screenshot leaks. Capture both normal viewport and requested focus views. Don't count generated screenshots as reviewed until an agent actually opens them.
