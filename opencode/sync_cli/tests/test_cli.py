from __future__ import annotations

import sys
from pathlib import Path
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from opencode_sync import cli


def test_sync_manifest_covers_expected_entries() -> None:
    expected = {
        ("plugins", "dir", Path("global_scope/plugins")),
        ("agents", "dir", Path("global_scope/agents")),
        ("commands", "dir", Path("global_scope/commands")),
        ("skills", "dir", Path("global_scope/skills")),
        ("opencode-config", "file", Path("global_scope/opencode.jsonc")),
        ("global-agents-guide", "file", Path("global_scope/AGENTS.md")),
        ("agent-skills", "dir", Path(".agents/skills")),
        ("agent-skill-lock", "file", Path(".agents/.skill-lock.json")),
    }
    actual = {(entry.name, entry.source_kind, entry.repo_relative_path) for entry in cli.SYNC_ENTRIES}
    assert actual == expected


def test_discover_repo_root_from_nested_path(tmp_path: Path) -> None:
    repo_root = tmp_path / "workspace" / "opencode"
    nested = repo_root / "sync_cli" / "src"
    (repo_root / "global_scope").mkdir(parents=True)
    nested.mkdir(parents=True)

    assert cli.discover_repo_root(nested) == repo_root


def test_repo_root_from_scope_accepts_repo_root_and_global_scope(tmp_path: Path) -> None:
    repo_root = tmp_path / "opencode"
    global_scope = repo_root / "global_scope"
    global_scope.mkdir(parents=True)

    assert cli.repo_root_from_scope(repo_root) == repo_root
    assert cli.repo_root_from_scope(global_scope) == repo_root


def test_run_rsync_uses_directory_trailing_slashes(monkeypatch) -> None:
    recorded: list[list[str]] = []

    def fake_run(cmd: list[str], check: bool) -> SimpleNamespace:
        recorded.append(cmd)
        assert check is False
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(cli.subprocess, "run", fake_run)

    result = cli.run_rsync(Path("/src"), Path("/dst"), "dir", delete=True, dry_run=True)

    assert result == 0
    assert recorded == [["rsync", "-a", "--itemize-changes", "--dry-run", "--delete", "/src/", "/dst/"]]


def test_run_rsync_omits_delete_for_files(monkeypatch) -> None:
    recorded: list[list[str]] = []

    def fake_run(cmd: list[str], check: bool) -> SimpleNamespace:
        recorded.append(cmd)
        return SimpleNamespace(returncode=0)

    monkeypatch.setattr(cli.subprocess, "run", fake_run)

    result = cli.run_rsync(Path("/src/file.txt"), Path("/dst/file.txt"), "file", delete=True, dry_run=False)

    assert result == 0
    assert recorded == [["rsync", "-a", "--itemize-changes", "/src/file.txt", "/dst/file.txt"]]


def test_resolve_entry_paths_switches_direction(tmp_path: Path) -> None:
    repo_root = tmp_path / "repo"
    entry = cli.SyncEntry(
        name="config",
        source_kind="file",
        home_path=Path("/home/user/.config/opencode/opencode.jsonc"),
        repo_relative_path=Path("global_scope/opencode.jsonc"),
    )

    assert cli.resolve_entry_paths(entry, repo_root, "push") == (
        repo_root / "global_scope/opencode.jsonc",
        Path("/home/user/.config/opencode/opencode.jsonc"),
    )
    assert cli.resolve_entry_paths(entry, repo_root, "pull") == (
        Path("/home/user/.config/opencode/opencode.jsonc"),
        repo_root / "global_scope/opencode.jsonc",
    )


def test_status_reports_missing_source_without_failing(tmp_path: Path, capsys) -> None:
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    entry = cli.SyncEntry(
        name="missing-dir",
        source_kind="dir",
        home_path=tmp_path / "home" / "missing-dir",
        repo_relative_path=Path("global_scope/missing-dir"),
    )

    result = cli.sync_entry(entry, repo_root, "status", delete=False, dry_run=False)

    assert result == 0
    assert "missing source" in capsys.readouterr().out


def test_push_missing_source_fails(tmp_path: Path, capsys) -> None:
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    entry = cli.SyncEntry(
        name="missing-file",
        source_kind="file",
        home_path=tmp_path / "home" / "target.txt",
        repo_relative_path=Path("global_scope/missing-file.txt"),
    )

    result = cli.sync_entry(entry, repo_root, "push", delete=False, dry_run=False)

    assert result == 1
    assert "missing source" in capsys.readouterr().err


def test_sync_entry_creates_file_parent_for_pull(tmp_path: Path, monkeypatch) -> None:
    home_file = tmp_path / "home" / "config.json"
    home_file.parent.mkdir(parents=True)
    home_file.write_text("{}")
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    entry = cli.SyncEntry(
        name="config",
        source_kind="file",
        home_path=home_file,
        repo_relative_path=Path("global_scope/opencode.jsonc"),
    )
    calls: list[tuple[Path, Path, str, bool, bool]] = []

    def fake_run_rsync(src: Path, dst: Path, source_kind: str, delete: bool, dry_run: bool) -> int:
        calls.append((src, dst, source_kind, delete, dry_run))
        return 0

    monkeypatch.setattr(cli, "run_rsync", fake_run_rsync)

    result = cli.sync_entry(entry, repo_root, "pull", delete=False, dry_run=False)

    assert result == 0
    assert (repo_root / "global_scope").is_dir()
    assert calls == [
        (
            home_file,
            repo_root / "global_scope/opencode.jsonc",
            "file",
            False,
            False,
        )
    ]


def test_sync_all_entries_returns_last_non_zero_result(tmp_path: Path, monkeypatch) -> None:
    repo_root = tmp_path / "repo"
    repo_root.mkdir()
    results = iter([0, 3, 1])

    monkeypatch.setattr(
        cli,
        "SYNC_ENTRIES",
        (
            cli.SyncEntry("one", "dir", Path("/tmp/one"), Path("global_scope/one")),
            cli.SyncEntry("two", "dir", Path("/tmp/two"), Path("global_scope/two")),
            cli.SyncEntry("three", "dir", Path("/tmp/three"), Path("global_scope/three")),
        ),
    )

    def fake_sync_entry(
        entry: cli.SyncEntry, repo_root_arg: Path, direction: str, delete: bool, dry_run: bool
    ) -> int:
        assert repo_root_arg == repo_root
        assert direction == "status"
        assert delete is False
        assert dry_run is True
        return next(results)

    monkeypatch.setattr(cli, "sync_entry", fake_sync_entry)

    assert cli.sync_all_entries(repo_root, "status", delete=False, dry_run=True) == 1
