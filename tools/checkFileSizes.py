"""Read-only local file budgets. Run: python tools/checkFileSizes.py."""
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
BASELINE = ROOT / "tools/fileSizeBaseline.json"
TEXT = {".py", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx", ".json", ".md",
        ".css", ".html", ".swift", ".ps1", ".cmd", ".bat", ".yml", ".yaml",
        ".toml", ".txt", ".sh", ".vue", ".svelte", ".sql", ".cs", ".rs",
        ".go", ".c", ".cpp", ".h", ".xml"}
# Generated/dependency outputs, not authored source. Do not extend for convenience.
EXCLUDED_DIRS = {"node_modules", ".venv", "venv", "vendor", "Pods", "DerivedData",
                 "dist", "build", ".next", ".nuxt", "coverage", "__pycache__"}
EXCLUDED_FILES = {"package-lock.json", "yarn.lock", "pnpm-lock.yaml",
                  "poetry.lock", "Cargo.lock", "tools/fileSizeBaseline.json"}


def limits(name):
    return (8192, 120, 12288, 200) if name == "AGENTS.md" else (16384, 250, 24576, 400)


def measure(data):
    return {"bytes": len(data), "lines": len(data.decode("utf-8-sig").splitlines()),
            "normalizedBytes": len(data.replace(b"\r\n", b"\n"))}


def decision(name, size, legacy=None):
    soft_bytes, soft_lines, hard_bytes, hard_lines = limits(name)
    if size["bytes"] > hard_bytes or size["lines"] > hard_lines:
        if (legacy and size["bytes"] <= legacy["bytes"]
                and size["lines"] <= legacy["lines"]
                and size.get("normalizedBytes", size["bytes"])
                <= legacy.get("normalizedBytes", legacy["bytes"])):
            return "legacy"
        return "fail"
    if size["bytes"] >= soft_bytes or size["lines"] >= soft_lines:
        return "warn"
    return "ok"


def inspect():
    names = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=ROOT).decode("utf-8").split("\0")
    sizes = {}
    errors = []
    for name in sorted(set(filter(None, names))):
        path = Path(name)
        if (path.suffix.lower() not in TEXT or name in EXCLUDED_FILES
                or any(part in EXCLUDED_DIRS for part in path.parts)):
            continue
        absolute = ROOT / path
        if not absolute.exists():
            # Tracked removals are allowed; missing sparse files are not silently ignored.
            sparse = subprocess.run(["git", "ls-files", "-t", "--", name], cwd=ROOT,
                                    capture_output=True, text=True, check=True).stdout
            if sparse.startswith("S "):
                errors.append(name + ": unavailable in sparse checkout")
            continue
        try:
            sizes[name] = measure(absolute.read_bytes())
        except (OSError, UnicodeError) as error:
            errors.append(name + ": unreadable UTF-8 text (" + type(error).__name__ + ")")
    return sizes, errors


def main():
    baseline = json.loads(BASELINE.read_text(encoding="utf-8"))["legacy"]
    sizes, failures = inspect()
    counts = {key: 0 for key in ("ok", "warn", "legacy", "fail")}
    for name, size in sizes.items():
        state = decision(name, size, baseline.get(name))
        counts[state] += 1
        if state == "fail":
            failures.append(f"{name}: {size['bytes']} bytes, {size['lines']} lines; split or justify exception")
    for failure in failures:
        print("FAIL:", failure)
    print("File budgets:", len(sizes), "checked;", counts["warn"], "warnings;",
          counts["legacy"], "non-growing legacy exceptions;", len(failures), "failures")
    return bool(failures)


if __name__ == "__main__":
    sys.exit(main())
