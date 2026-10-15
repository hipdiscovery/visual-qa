# Visual QA owner folder

The Windows owner-facing layout is:

```text
visual-qa/
  Project/       Git checkout and supporting project files
  Visual QA.cmd           Main launcher
  Update Visual QA.cmd         Update launcher
```

## Setup

Requires Python 3.10+ with the Windows `py -3` launcher and authenticated Git. Product-specific prerequisites still apply.

Double-click `Setup Owner Folder.cmd` in the source checkout. An existing checkout named `Project` is reused in place. For a fresh install, the default destination is `C:\GitHub Repos\visual-qa`; setup clones the trusted `hipdiscovery/visual-qa` `master` branch beneath it.

To choose another destination:

```text
python tools/owner/ownerFolder.py setup --destination "C:\path\to\visual-qa"
```

Setup never relocates an existing checkout or user data. A nonempty destination with no matching source checkout stops for review. Existing matching checkouts are origin-checked; unrelated launcher files are never overwritten. Rerunning setup refreshes only marked launchers.

## Main and update behavior

Source updated. Run npm ci --ignore-scripts --no-audit --no-fund if dependencies changed. Before the first QA launch, install the pinned dependency with npm ci --ignore-scripts --no-audit --no-fund. The QA runner keeps its existing public-only target and read-only browser policy.

For hosted services and Apple apps on Windows, the main launcher opens the documented project controls/workflow rather than starting a duplicate broadcaster or pretending to run an unsupported native app. Building/installing Apple apps requires the existing Mac/Xcode workflow. For desktop/local tools, the configured entry point in `tools/owner/owner.json` is used with its expected working directory.

The generic update launcher fetches only the trusted default branch and fast-forwards a clean checkout. It refuses local edits, unpushed/divergent commits, another branch, an unfinished Git operation, a mismatched origin or linked directories. It never stages/uploads files, resets, cleans, creates branches, silently installs dependencies, deploys a hosted service or restarts production. Existing repository-specific two-way sync commands, where present, remain separate and unchanged.

One local Git-directory lock prevents overlapping setup/update operations. A normal failure releases it; after a killed process, review its recorded PID before removing a stale `owner-update.lock`. No scheduler, service, recurring API, AI call or paid dependency is added. Only an explicit update performs a bounded Git fetch. Failures keep their console visible. Retry after reconciling the reported problem; user edits and ignored settings remain intact.

After a successful source update, the launchers are refreshed from the updated helper. Source commit confirmation is separate from build, installation and production runtime confirmation. Updating source alone does not claim a new packaged desktop binary or deployment.

## Verification

Run the isolated offline workflow tests:

```text
python -B tools/owner/testOwnerFolder.py
```

They cover repeat setup, unrelated-file preservation, link refusal, origin/branch checks, dirty and ahead checkouts, a real local fast-forward, repeated updates, lock contention/failure recovery, and preservation of existing binaries. They do not start streams, open production controls, spend provider quota or publish anything.

Existing product tests, build/release gates and native Mac installation remain authoritative for product changes. On macOS, continue using the native documented scripts; these `.cmd` launchers are Windows conveniences only.
