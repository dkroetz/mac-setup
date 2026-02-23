# OpenCode Global Scope Sync CLI Plan

## Reporting Requirement

- Domain scope classification: local tooling + Python CLI packaging for macOS config synchronization
- Skills loaded and rationale:
  - `python-pdm`: needed for correct PDM project scaffolding, packaging, and pipx-compatible console script setup
- Confirmation on policy limits:
  - Stayed within policy limits from `.opencode/AGENTS.md` by loading only 1 relevant skill

## Overview

Build a small Python CLI (`opencode-sync`) managed with PDM and installable globally via `uv tool`.
It will sync `opencode/global_scope/` and `~/.config/opencode` with explicit `push`, `pull`, and `status` commands.

## What We're NOT Doing

- No background file watcher (`launchd`) in v1
- No implicit destructive sync; deletion remains opt-in (`--delete`)
- No mandatory git hook automation in v1 (optional in a later phase)

## Phase 1: Scaffold Isolated CLI Project

### Overview

Create a self-contained Python package at `opencode/sync_cli/` so the root of the dotfiles repo stays clean.

### Specific file changes

- [x] Add `opencode/sync_cli/pyproject.toml`
- [x] Add `opencode/sync_cli/src/opencode_sync/__init__.py`
- [x] Add `opencode/sync_cli/src/opencode_sync/cli.py`
- [x] Add `opencode/sync_cli/README.md`

```toml
[project]
name = "opencode-sync"
version = "0.1.0"
description = "Sync opencode global scope between repo and ~/.config/opencode"
requires-python = ">=3.13"
dependencies = []

[project.scripts]
opencode-sync = "opencode_sync.cli:main"

[build-system]
requires = ["pdm-backend"]
build-backend = "pdm.backend"

[tool.pdm]
distribution = true
```

### Success Criteria

#### Automated Verification:

- [ ] Project linting passes
- [ ] Type checking passes
- [ ] Tests pass (if applicable)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**

## Phase 2: Implement Sync Engine (`push`/`pull`/`status` + `--dry-run`)

### Overview

Implement deterministic syncing using `rsync` with safe defaults and explicit direction.

### Specific file changes

- [x] Update `opencode/sync_cli/src/opencode_sync/cli.py` with argument parsing and sync logic

```python
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

REPO_SCOPE = Path(__file__).resolve().parents[3] / "global_scope"
HOME_SCOPE = Path.home() / ".config" / "opencode"


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
    parser.add_argument("--delete", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if args.direction == "push":
        return run_rsync(REPO_SCOPE, HOME_SCOPE, args.delete, args.dry_run)
    if args.direction == "pull":
        return run_rsync(HOME_SCOPE, REPO_SCOPE, args.delete, args.dry_run)
    return run_rsync(REPO_SCOPE, HOME_SCOPE, delete=False, dry_run=True)
```

### Success Criteria

#### Automated Verification:

- [ ] Project linting passes
- [ ] Type checking passes
- [ ] Tests pass (if applicable)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**

## Phase 3: Dev Workflow + Global Install Docs (PDM + uv tool)

### Overview

Document local development (`.venv` with PDM) and global install (`uv tool install <path>`).

### Specific file changes

- [x] Update `opencode/sync_cli/README.md`
- [x] Optionally add a short reference section in `opencode/README.md`

```md
## Setup (development)
pdm use -f 3.13
pdm config python.use_venv true
pdm install

## Global install
uv tool install ~/Repos/mac-setup/opencode/sync_cli

## Usage
opencode-sync status
opencode-sync push --dry-run
opencode-sync push
opencode-sync pull --dry-run
opencode-sync pull

## Optional destructive mirror
opencode-sync push --delete
```

### Success Criteria

#### Automated Verification:

- [ ] Project linting passes
- [ ] Type checking passes
- [ ] Tests pass (if applicable)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**

## Phase 4 (Optional): Fish + Pre-Commit QoL

### Overview

Add explicit convenience commands and optional commit-time safety checks without implicit background sync.

### Specific file changes

- [x] Update `fish/config.fish` with abbreviations for `opencode-sync`
- [ ] Optionally add `.githooks/pre-commit` and docs for `core.hooksPath`

```fish
abbr --add ocs "opencode-sync status"
abbr --add ocp "opencode-sync push"
abbr --add ocpd "opencode-sync push --dry-run"
abbr --add ocl "opencode-sync pull"
abbr --add ocld "opencode-sync pull --dry-run"
```

### Success Criteria

#### Automated Verification:

- [ ] Project linting passes
- [ ] Type checking passes
- [ ] Tests pass (if applicable)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**

## Testing Strategy

- Automated:
  - `pdm run ruff check .`
  - `pdm run mypy`
  - `pdm run pytest` (if tests are added)
- Manual:
  - Edit a file under `~/.config/opencode/...`, run `opencode-sync pull --dry-run`, then `pull`, verify repo updates
  - Edit a file under `opencode/global_scope/...`, run `opencode-sync push --dry-run`, then `push`, verify home config updates
  - Run `opencode-sync status` and confirm no differences after synchronization

## References

- `opencode/README.md:28`
- `opencode/README.md:80`
- `opencode/README.md:81`
- `.git/config:1`
- `fish/config.fish:1`
