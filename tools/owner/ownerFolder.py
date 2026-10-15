"""Create stable owner launchers around a checkout without moving product files."""

import argparse
import contextlib
import json
import os
from pathlib import Path
import subprocess
import sys


marker = "HipDiscovery owner launcher v1"


def run(command, root, capture=False):
    result = subprocess.run(command, cwd=root, check=True, text=True,
                            stdout=subprocess.PIPE if capture else None)
    return result.stdout.strip() if capture else ""


def safePath(path):
    path = Path(os.path.abspath(path))
    for part in (path, *path.parents):
        if part.is_symlink() or (hasattr(part, "is_junction") and part.is_junction()):
            raise RuntimeError("Owner paths must not contain directory links.")
    return path


def trustedRepo(root, config):
    root = safePath(root)
    origin = run(["git", "remote", "get-url", "origin"], root, True)
    repo = config["repository"]
    allowed = {f"https://github.com/{repo}.git", f"https://github.com/{repo}",
               f"git@github.com:{repo}.git", f"ssh://git@github.com/{repo}.git"}
    if origin not in allowed:
        raise RuntimeError("Unexpected Git origin; nothing was updated.")
    top = Path(run(["git", "rev-parse", "--show-toplevel"], root, True)).resolve()
    if top != root.resolve():
        raise RuntimeError("The configured source folder is not the checkout root.")
    return root


@contextlib.contextmanager
def updateLock(root):
    import time
    lock = Path(run(["git", "rev-parse", "--absolute-git-dir"], root, True)) / "owner-update.lock"
    try:
        stream = lock.open("x", encoding="utf-8")
    except FileExistsError as error:
        raise RuntimeError("An owner operation is running, or its lock needs review: " + str(lock)) from error
    try:
        with stream:
            stream.write(f"pid={os.getpid()} started={int(time.time())}\n")
            stream.flush()
            yield
    finally:
        lock.unlink()


def syncSource(root, config):
    branch = config["branch"]
    if run(["git", "branch", "--show-current"], root, True) != branch:
        raise RuntimeError("Update requires the repository's default branch: " + branch)
    if run(["git", "status", "--porcelain"], root, True):
        raise RuntimeError("Local edits were preserved. Commit/reconcile them before updating.")
    for state in ("MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-merge", "rebase-apply"):
        path = Path(run(["git", "rev-parse", "--git-path", state], root, True))
        if not path.is_absolute():
            path = root / path
        if path.exists():
            raise RuntimeError("Finish the existing Git operation before updating.")
    run(["git", "fetch", "--no-tags", "origin",
         f"refs/heads/{branch}:refs/remotes/origin/{branch}"], root)
    remote = run(["git", "rev-parse", "origin/" + branch], root, True)
    if run(["git", "rev-list", "--count", remote + "..HEAD"], root, True) != "0":
        raise RuntimeError("Unpushed or divergent commits were preserved; update stopped.")
    run(["git", "merge", "--ff-only", "--no-overwrite-ignore", remote], root)
    if run(["git", "rev-parse", "HEAD"], root, True) != remote:
        raise RuntimeError("Source verification failed.")
    print("Verified source commit:", remote)


def wrapper(config, mode):
    child = config["sourceFolder"]
    return ("@echo off\nrem " + marker + "\nsetlocal\n"
            'set "ownerScript=%~dp0' + child + '\\tools\\owner\\ownerFolder.py"\n'
            'if not exist "%ownerScript%" (\n'
            '  echo Project files are missing. Run Setup Owner Folder.cmd from the source checkout.\n'
            '  pause\n  exit /b 2\n)\n'
            'py -3 -B "%ownerScript%" ' + mode + '\n'
            'set "ownerExit=%ERRORLEVEL%"\n'
            'if not "%ownerExit%"=="0" pause\n'
            'endlocal & exit /b %ownerExit%\n').replace("\n", "\r\n")


def refresh(root, config):
    if root.name != config["sourceFolder"]:
        raise RuntimeError("Checkout must be inside the configured source folder.")
    owner = safePath(root.parent)
    targets = {config["mainFile"]: wrapper(config, "launch"),
               config["updateFile"]: wrapper(config, "update")}
    for name in targets:
        target = safePath(owner / name)
        if target.exists():
            existing = target.read_text(encoding="utf-8-sig", errors="replace")
            if marker not in existing:
                raise RuntimeError("Refusing to overwrite an existing owner file: " + str(target))
    for name, content in targets.items():
        target = owner / name
        if not target.exists() or target.read_bytes() != content.encode("utf-8"):
            temporary = target.with_suffix(target.suffix + ".owner-tmp")
            with temporary.open("xb") as stream:
                stream.write(content.encode("utf-8"))
            temporary.replace(target)


def setup(root, config, destination):
    if destination:
        owner = safePath(destination)
    elif root.name == config["sourceFolder"]:
        owner = safePath(root.parent)
    else:
        owner = safePath(Path("C:/GitHub Repos") / config["folder"])
    target = owner / config["sourceFolder"]
    if target.exists():
        trustedRepo(target, config)
    else:
        if owner.exists() and any(owner.iterdir()):
            raise RuntimeError("Existing owner folder needs review; nothing was moved or overwritten.")
        owner.mkdir(parents=True, exist_ok=True)
        run(["git", "clone", "--single-branch", "--branch", config["branch"],
             "https://github.com/" + config["repository"] + ".git", str(target)], owner)
    with updateLock(target):
        refresh(target, config)
    print("Owner folder ready:", owner)


def launch(root, config):
    owner = root.parent
    action = config["launch"]
    kind = action["kind"]
    if kind == "command":
        run(action["command"], root)
    elif kind == "file":
        target = safePath(root / action["path"])
        if not target.is_file():
            raise RuntimeError("Main file is missing: " + str(target))
        os.startfile(str(target))
    elif kind == "installed":
        target = safePath(owner / action["path"])
        if not target.is_file():
            raise RuntimeError(action["missing"])
        os.startfile(str(target), cwd=str(owner))
    elif kind == "bridge":
        run(["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
             str(owner / "source" / "verify.ps1")], owner)
    else:
        raise RuntimeError("Unsupported launch action.")


def update(root, config):
    with updateLock(root):
        syncSource(root, config)
        # A second process reads updated helper code after a source fast-forward.
        run([sys.executable, "-B", str(root / "tools/owner/ownerFolder.py"), "refresh"], root)
        if config.get("bridgeUpdate"):
            run(["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File",
                 str(root.parent / "source" / "auto-update.ps1")], root.parent)
        print(config["updateDescription"])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("setup", "refresh", "launch", "update"))
    parser.add_argument("--destination", help="Owner folder for a new install; existing files are preserved")
    args = parser.parse_args()
    root = safePath(Path(__file__).absolute().parents[2])
    config = json.loads((Path(__file__).parent / "owner.json").read_text(encoding="utf-8"))
    if os.name != "nt":
        raise RuntimeError("These launchers are for Windows. Use the project's documented native workflow.")
    root = trustedRepo(root, config)
    if args.mode == "setup":
        setup(root, config, args.destination)
    elif args.mode == "refresh":
        refresh(root, config)
    elif args.mode == "launch":
        launch(root, config)
    else:
        update(root, config)


if __name__ == "__main__":
    try:
        main()
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print("Owner operation stopped:", error, file=sys.stderr)
        sys.exit(1)
