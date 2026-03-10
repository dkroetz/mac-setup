from __future__ import annotations

import argparse
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Literal


HOME = Path.home()
HOME_SCOPE = HOME / ".config" / "opencode"
HOME_AGENTS = HOME / ".agents"
DEFAULT_REPO_SCOPE = Path.home() / "Repos" / "mac-setup" / "opencode" / "global_scope"


@dataclass(frozen=True)
class SyncEntry:
    name: str
    source_kind: Literal["dir", "file"]
    home_path: Path
    repo_relative_path: Path


SYNC_ENTRIES = (
    SyncEntry(
        name="plugins",
        source_kind="dir",
        home_path=HOME_SCOPE / "plugins",
        repo_relative_path=Path("global_scope") / "plugins",
    ),
    SyncEntry(
        name="agents",
        source_kind="dir",
        home_path=HOME_SCOPE / "agents",
        repo_relative_path=Path("global_scope") / "agents",
    ),
    SyncEntry(
        name="commands",
        source_kind="dir",
        home_path=HOME_SCOPE / "commands",
        repo_relative_path=Path("global_scope") / "commands",
    ),
    SyncEntry(
        name="skills",
        source_kind="dir",
        home_path=HOME_SCOPE / "skills",
        repo_relative_path=Path("global_scope") / "skills",
    ),
    SyncEntry(
        name="opencode-config",
        source_kind="file",
        home_path=HOME_SCOPE / "opencode.jsonc",
        repo_relative_path=Path("global_scope") / "opencode.jsonc",
    ),
    SyncEntry(
        name="global-agents-guide",
        source_kind="file",
        home_path=HOME_SCOPE / "AGENTS.md",
        repo_relative_path=Path("global_scope") / "AGENTS.md",
    ),
    SyncEntry(
        name="agent-skills",
        source_kind="dir",
        home_path=HOME_AGENTS / "skills",
        repo_relative_path=Path(".agents") / "skills",
    ),
    SyncEntry(
        name="agent-skill-lock",
        source_kind="file",
        home_path=HOME_AGENTS / ".skill-lock.json",
        repo_relative_path=Path(".agents") / ".skill-lock.json",
    ),
)


def discover_repo_root(start: Path) -> Path | None:
    for base in (start, *start.parents):
        if (base / "global_scope").is_dir():
            return base
        opencode_root = base / "opencode"
        if (opencode_root / "global_scope").is_dir():
            return opencode_root
    return None


def repo_root_from_scope(path: Path) -> Path | None:
    resolved = path.expanduser().resolve()
    if resolved.name == "global_scope":
        return resolved.parent
    if (resolved / "global_scope").is_dir():
        return resolved
    return None


def resolve_repo_root(explicit: Path | None, start: Path) -> Path | None:
    if explicit is not None:
        return repo_root_from_scope(explicit)

    discovered = discover_repo_root(start)
    if discovered is not None:
        return discovered

    if DEFAULT_REPO_SCOPE.is_dir():
        return DEFAULT_REPO_SCOPE.parent

    return None


def repo_path(repo_root: Path, entry: SyncEntry) -> Path:
    return repo_root / entry.repo_relative_path


def rsync_arg(path: Path, source_kind: Literal["dir", "file"]) -> str:
    if source_kind == "dir":
        return f"{path}/"
    return str(path)


def ensure_destination(path: Path, source_kind: Literal["dir", "file"], dry_run: bool) -> None:
    if dry_run:
        return
    if source_kind == "dir":
        path.mkdir(parents=True, exist_ok=True)
        return
    path.parent.mkdir(parents=True, exist_ok=True)


def run_rsync(src: Path, dst: Path, source_kind: Literal["dir", "file"], delete: bool, dry_run: bool) -> int:
    cmd = ["rsync", "-a", "--itemize-changes"]
    if dry_run:
        cmd.append("--dry-run")
    if delete and source_kind == "dir":
        cmd.append("--delete")
    cmd += [rsync_arg(src, source_kind), rsync_arg(dst, source_kind)]
    return subprocess.run(cmd, check=False).returncode


def resolve_entry_paths(
    entry: SyncEntry, repo_root: Path, direction: Literal["push", "pull", "status"]
) -> tuple[Path, Path]:
    repo_entry_path = repo_path(repo_root, entry)
    if direction in {"push", "status"}:
        return repo_entry_path, entry.home_path
    return entry.home_path, repo_entry_path


def sync_entry(
    entry: SyncEntry, repo_root: Path, direction: Literal["push", "pull", "status"], delete: bool, dry_run: bool
) -> int:
    src, dst = resolve_entry_paths(entry, repo_root, direction)
    entry_dry_run = dry_run or direction == "status"
    entry_delete = delete and direction != "status"

    if not src.exists():
        message = f"[{entry.name}] missing source: {src}"
        if direction == "status":
            print(message)
            return 0
        print(message, file=sys.stderr)
        return 1

    ensure_destination(dst, entry.source_kind, entry_dry_run)
    print(f"[{entry.name}] {src} -> {dst}")
    return run_rsync(src, dst, entry.source_kind, entry_delete, entry_dry_run)


def sync_all_entries(
    repo_root: Path, direction: Literal["push", "pull", "status"], delete: bool, dry_run: bool
) -> int:
    exit_code = 0
    for entry in SYNC_ENTRIES:
        result = sync_entry(entry, repo_root, direction, delete, dry_run)
        if result != 0:
            exit_code = result
    return exit_code


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("direction", choices=["push", "pull", "status"])
    parser.add_argument("--repo-scope", type=Path)
    parser.add_argument("--delete", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    repo_root = resolve_repo_root(args.repo_scope, Path.cwd())
    if repo_root is None:
        print(
            "Could not locate repository root containing global_scope. "
            f"Tried repo discovery and default path {DEFAULT_REPO_SCOPE}. "
            "Pass --repo-scope <path> to override with either the repo root or global_scope path.",
            file=sys.stderr,
        )
        return 2

    return sync_all_entries(repo_root, args.direction, args.delete, args.dry_run)


if __name__ == "__main__":
    raise SystemExit(main())
