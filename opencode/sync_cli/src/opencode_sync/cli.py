from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


HOME_SCOPE = Path.home() / ".config" / "opencode"
DEFAULT_REPO_SCOPE = Path.home() / "Repos" / "mac-setup" / "opencode" / "global_scope"


def discover_repo_scope(start: Path) -> Path | None:
    for base in (start, *start.parents):
        for candidate in (base / "opencode" / "global_scope", base / "global_scope"):
            if candidate.is_dir():
                return candidate
    return None


def resolve_repo_scope(explicit: Path | None, start: Path) -> Path | None:
    if explicit is not None:
        return explicit.expanduser().resolve()

    discovered = discover_repo_scope(start)
    if discovered is not None:
        return discovered

    if DEFAULT_REPO_SCOPE.is_dir():
        return DEFAULT_REPO_SCOPE

    return None


def run_rsync(src: Path, dst: Path, delete: bool, dry_run: bool) -> int:
    cmd = ["rsync", "-a", "--itemize-changes"]
    if dry_run:
        cmd.append("--dry-run")
    if delete:
        cmd.append("--delete")
    cmd += [f"{src}/", f"{dst}/"]
    return subprocess.run(cmd, check=False).returncode


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("direction", choices=["push", "pull", "status"])
    parser.add_argument("--repo-scope", type=Path)
    parser.add_argument("--delete", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    repo_scope = resolve_repo_scope(args.repo_scope, Path.cwd())
    if repo_scope is None:
        print(
            "Could not locate repository global scope directory. "
            f"Tried repo discovery and default path {DEFAULT_REPO_SCOPE}. "
            "Pass --repo-scope <path> to override.",
            file=sys.stderr,
        )
        return 2

    if args.direction == "push":
        return run_rsync(repo_scope, HOME_SCOPE, args.delete, args.dry_run)
    if args.direction == "pull":
        return run_rsync(HOME_SCOPE, repo_scope, args.delete, args.dry_run)
    return run_rsync(repo_scope, HOME_SCOPE, delete=False, dry_run=True)


if __name__ == "__main__":
    raise SystemExit(main())
