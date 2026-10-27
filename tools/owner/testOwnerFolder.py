"""Offline tests for owner setup, update refusal and launcher preservation."""

import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest import mock

spec = importlib.util.spec_from_file_location("ownerFolder", Path(__file__).with_name("ownerFolder.py"))
owner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(owner)


class OwnerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="owner workflow ")
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / "Project"
        self.root.mkdir()
        self.config = {"repository": "hipdiscovery/example", "branch": "master",
                       "sourceFolder": "Project", "mainFile": "Open Example.cmd",
                       "updateFile": "Update Example.cmd"}

    def git(self, *args, cwd=None):
        return subprocess.run(["git", *args], cwd=cwd or self.root, check=True,
                              capture_output=True, text=True).stdout.strip()

    def init(self):
        self.git("init", "-b", "master")
        self.git("config", "user.name", "Offline Test")
        self.git("config", "user.email", "test@example.invalid")
        (self.root / "main.txt").write_text("first\n")
        self.git("add", "main.txt")
        self.git("commit", "-m", "Initial fixture")

    def remote(self):
        self.init()
        remote = self.base / "remote.git"
        self.git("clone", "--bare", str(self.root), str(remote))
        self.git("remote", "add", "origin", str(remote))
        self.git("fetch", "origin", "master")
        return remote

    def test_refresh_repeat_safe(self):
        owner.refresh(self.root, self.config)
        target = self.base / "Open Example.cmd"
        original = target.read_bytes()
        owner.refresh(self.root, self.config)
        self.assertEqual(target.read_bytes(), original)
        self.assertIn(b'%~dp0Project', original)
        self.assertIn(b'if not "%ownerExit%"=="0" pause', original)

    def test_no_partial_overwrite(self):
        update = self.base / "Update Example.cmd"
        update.write_text("unrelated owner work")
        with self.assertRaisesRegex(RuntimeError, "overwrite"):
            owner.refresh(self.root, self.config)
        self.assertFalse((self.base / "Open Example.cmd").exists())
        self.assertEqual(update.read_text(), "unrelated owner work")

    def test_setup_refuses_existing_data(self):
        target = self.base / "Existing"
        target.mkdir()
        (target / "notes.txt").write_text("keep")
        with self.assertRaisesRegex(RuntimeError, "needs review"):
            owner.setup(self.root, self.config, target)
        self.assertEqual((target / "notes.txt").read_text(), "keep")

    @unittest.skipUnless(os.name == "nt", "Real Windows junction")
    def test_directory_junction_refused(self):
        link = self.base / "linked"
        subprocess.run(["cmd", "/d", "/c", "mklink", "/J", str(link), str(self.root)],
                       check=True, capture_output=True)
        self.addCleanup(link.rmdir)
        for target in (link, link / "missing"):
            with self.assertRaisesRegex(RuntimeError, "links"):
                owner.safePath(target)
        self.root.rmdir()
        with self.assertRaisesRegex(RuntimeError, "links"):
            owner.safePath(link / "missing")

    def test_junction_metadata_refused_before_launcher_write(self):
        original = Path.lstat
        def metadata(path):
            if path == self.base:
                return SimpleNamespace(st_mode=0o40755, st_file_attributes=0x410,
                                       st_reparse_tag=0xA0000003)
            return original(path)
        # Only Windows filesystem metadata is simulated, not the safety decision.
        with mock.patch.object(Path, "lstat", metadata):
            with self.assertRaisesRegex(RuntimeError, "links"):
                owner.refresh(self.root, self.config)
        self.assertFalse((self.base / "Open Example.cmd").exists())
        self.assertFalse((self.base / "Update Example.cmd").exists())

    def test_nonexistent_descendant_of_junction_metadata_refused(self):
        original = Path.lstat
        def metadata(path):
            if path == self.root:
                return SimpleNamespace(st_mode=0o40755, st_file_attributes=0x410,
                                       st_reparse_tag=0xA0000003)
            return original(path)
        with mock.patch.object(Path, "lstat", metadata):
            with self.assertRaisesRegex(RuntimeError, "links"):
                owner.safePath(self.root / "missing" / "child")

    @unittest.skipIf(os.name == "nt", "Windows uses junction fixture without symlink privilege")
    def test_symlink_and_dangling_symlink_refused(self):
        link = self.base / "linked"
        link.symlink_to(self.root, target_is_directory=True)
        for target in (link, link / "missing"):
            with self.assertRaisesRegex(RuntimeError, "links"):
                owner.safePath(target)
        self.root.rmdir()
        with self.assertRaisesRegex(RuntimeError, "links"):
            owner.safePath(link / "missing")

    def test_plain_missing_destination_allowed(self):
        target = self.root / "missing" / "child"
        self.assertEqual(owner.safePath(target), target)

    def test_non_link_windows_metadata_allowed(self):
        original = Path.lstat
        def metadata(path):
            if path == self.base:
                return SimpleNamespace(st_mode=0o40755, st_file_attributes=0x410,
                                       st_reparse_tag=0x9000001A)
            return original(path)
        with mock.patch.object(Path, "lstat", metadata):
            owner.refresh(self.root, self.config)
        self.assertTrue((self.base / "Open Example.cmd").is_file())

    def test_unreadable_metadata_stops_before_launcher_write(self):
        original = Path.lstat
        def metadata(path):
            if path == self.base:
                raise PermissionError("Cannot inspect owner directory")
            return original(path)
        with mock.patch.object(Path, "lstat", metadata):
            with self.assertRaises(PermissionError):
                owner.refresh(self.root, self.config)
        self.assertFalse((self.base / "Open Example.cmd").exists())

    def test_origin_mismatch(self):
        self.init()
        self.git("remote", "add", "origin", "https://github.com/other/example.git")
        with self.assertRaisesRegex(RuntimeError, "origin"):
            owner.trustedRepo(self.root, self.config)

    def test_dirty_refused_without_fetch(self):
        self.init()
        (self.root / "main.txt").write_text("uncommitted")
        with self.assertRaisesRegex(RuntimeError, "Local edits"):
            owner.syncSource(self.root, self.config)
        self.assertEqual((self.root / "main.txt").read_text(), "uncommitted")

    def test_wrong_branch_refused(self):
        self.init()
        self.git("checkout", "--detach")
        with self.assertRaisesRegex(RuntimeError, "default branch"):
            owner.syncSource(self.root, self.config)

    def test_ahead_refused(self):
        self.remote()
        (self.root / "main.txt").write_text("local commit")
        self.git("add", "main.txt")
        self.git("commit", "-m", "Keep local work")
        before = self.git("rev-parse", "HEAD")
        with self.assertRaisesRegex(RuntimeError, "Unpushed"):
            owner.syncSource(self.root, self.config)
        self.assertEqual(self.git("rev-parse", "HEAD"), before)

    def test_fast_forward_and_repeat(self):
        remote = self.remote()
        writer = self.base / "writer"
        self.git("clone", str(remote), str(writer))
        for key, value in (("user.name", "Fixture"), ("user.email", "test@example.invalid")):
            self.git("config", key, value, cwd=writer)
        (writer / "main.txt").write_text("published update")
        self.git("add", "main.txt", cwd=writer)
        self.git("commit", "-m", "Published fixture", cwd=writer)
        self.git("push", "origin", "master", cwd=writer)
        owner.syncSource(self.root, self.config)
        owner.syncSource(self.root, self.config)
        self.assertEqual((self.root / "main.txt").read_text(), "published update")
        self.assertEqual(self.git("status", "--porcelain"), "")

    def test_concurrent_lock_and_failure_cleanup(self):
        self.init()
        with self.assertRaisesRegex(RuntimeError, "fixture failure"):
            with owner.updateLock(self.root):
                with self.assertRaisesRegex(RuntimeError, "lock"):
                    with owner.updateLock(self.root):
                        self.fail("Concurrent operation entered")
                raise RuntimeError("fixture failure")
        with owner.updateLock(self.root):
            pass

    def test_ignored_settings_collision_is_preserved(self):
        remote = self.remote()
        writer = self.base / "writer"
        self.git("clone", str(remote), str(writer))
        self.git("config", "user.name", "Fixture", cwd=writer)
        self.git("config", "user.email", "test@example.invalid", cwd=writer)
        (writer / "settings.json").write_text("published settings")
        self.git("add", "settings.json", cwd=writer)
        self.git("commit", "-m", "New tracked settings", cwd=writer)
        self.git("push", "origin", "master", cwd=writer)
        (self.root / ".git/info/exclude").write_text("settings.json\n")
        (self.root / "settings.json").write_text("private local settings")
        before = self.git("rev-parse", "HEAD")
        with self.assertRaises(subprocess.CalledProcessError):
            owner.syncSource(self.root, self.config)
        self.assertEqual((self.root / "settings.json").read_text(), "private local settings")
        self.assertEqual(self.git("rev-parse", "HEAD"), before)

    def test_existing_binary_is_preserved(self):
        binary = self.base / "Example.exe"
        binary.write_bytes(b"existing binary")
        owner.refresh(self.root, self.config)
        self.assertEqual(binary.read_bytes(), b"existing binary")

    @unittest.skipUnless(__import__("os").name == "nt", "Windows batch launcher")
    def test_actual_batch_wrapper_keeps_exit_code(self):
        helper = self.root / "tools/owner/ownerFolder.py"
        helper.parent.mkdir(parents=True)
        helper.write_text("import sys\nprint('fixture mode=' + sys.argv[1])\nsys.exit(7)\n")
        owner.refresh(self.root, self.config)
        command = self.base / "Open Example.cmd"
        result = subprocess.run(["cmd.exe", "/d", "/c", str(command)],
                                cwd=self.base, input="", capture_output=True, text=True)
        self.assertEqual(result.returncode, 7, result.stdout + result.stderr)
        self.assertIn("fixture mode=launch", result.stdout)


if __name__ == "__main__":
    unittest.main()
