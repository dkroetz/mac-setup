# Sync CLI Scope Mapping Plan

## Sizing

Medium task: the CLI currently assumes one repo tree (`global_scope/`) mirrors one home tree (`~/.config/opencode/`), but the requested state spans multiple roots (`~/.config/opencode` and `~/.agents`) plus a new repo-local `.agents/skills` destination, so this needs a small mapping redesign, fixture updates, and validation coverage.

## Phase 1

Description: Replace the current single-root sync assumption with an explicit sync manifest that matches the desired source/destination pairs and captures any missing-but-required paths discovered during implementation.

Files: `sync_cli/src/opencode_sync/cli.py`

Changes: Introduce a structured list of sync entries instead of hardcoding `HOME_SCOPE <-> repo_scope`; model at least these pairs: `~/.config/opencode/plugins <-> <repo>/global_scope/plugins`, `~/.agents/skills <-> <repo>/.agents/skills`, `~/.config/opencode/agents <-> <repo>/global_scope/agents`, `~/.config/opencode/opencode.jsonc <-> <repo>/global_scope/opencode.jsonc`, `~/.config/opencode/commands <-> <repo>/global_scope/commands`, and `~/.config/opencode/AGENTS.md <-> <repo>/global_scope/AGENTS.md`; decide whether `.agents/.skill-lock.json`, `~/.config/opencode/skills`, or other sibling artifacts also belong in the manifest so the repo mirror is internally consistent.

Exit criterion: The code has one canonical manifest that fully describes every repo/home sync target needed for push, pull, and status.

Validation: `pdm run mypy --strict sync_cli/src`

Human checkpoint: None

Risks and mitigations: Risk: an incomplete manifest silently omits required files. Mitigation: compare manifest entries against the requested list plus all path-dependent references already present in `global_scope/opencode.jsonc` and the current repo layout before moving to implementation.

## Phase 2

Description: Refactor command execution so each manifest entry syncs correctly for directories and individual files in both directions.

Files: `sync_cli/src/opencode_sync/cli.py`

Changes: Update path resolution and rsync invocation to iterate over manifest entries; support mixed file and directory targets without forcing trailing-slash directory semantics onto file copies; ensure destination parent directories are created or validated before rsync; preserve `push`, `pull`, `status`, `--dry-run`, and `--delete` behavior across all entries; make output readable enough to identify which mapping failed.

Exit criterion: `push`, `pull`, and `status` can operate across all manifest entries without relying on the old full-tree mirror behavior.

Validation: `pdm run python -m opencode_sync.cli status --repo-scope /Users/denis/Repos/mac-setup/opencode/global_scope`

Human checkpoint: None

Risks and mitigations: Risk: `--delete` becomes dangerous when applied to file-level mappings or wrong repo roots. Mitigation: keep manifest paths explicit, scope deletion to each resolved target pair, and reject nonexistent or ambiguous repo destinations early with a clear error.

## Phase 3

Description: Align repository structure and user-facing documentation with the new mapping so the repo contents match what the CLI expects to sync.

Files: `sync_cli/README.md`, `README.md`, `/Users/denis/Repos/mac-setup/opencode/global_scope/AGENTS.md`, `/Users/denis/Repos/mac-setup/opencode/global_scope/plugins/`, `/Users/denis/Repos/mac-setup/opencode/.agents/skills/`

Changes: Update docs to describe the new split topology (`global_scope/*` plus repo `.agents/skills`); add any missing tracked destinations required by the manifest such as `global_scope/plugins` and `global_scope/AGENTS.md`; if the audit in Phase 1 confirms additional tracked artifacts like `.agents/.skill-lock.json`, create the corresponding repo location and document why it is included.

Exit criterion: Every path referenced by the sync manifest exists in the repo in the documented location.

Validation: `pdm run python -m opencode_sync.cli status --repo-scope /Users/denis/Repos/mac-setup/opencode/global_scope --dry-run`

Human checkpoint: None

Risks and mitigations: Risk: documentation and repo layout drift apart again. Mitigation: document the manifest-backed mapping table in `sync_cli/README.md` and keep repo path examples identical to the code.

## Phase 4

Description: Add regression coverage and end-to-end validation for the new mapping behavior.

Files: `sync_cli/tests/test_cli.py`, `sync_cli/pyproject.toml`

Changes: Add tests for repo-scope discovery, manifest completeness, command construction for file and directory entries, and direction handling for `push`, `pull`, and `status`; add test tooling configuration/dependencies only if required; run targeted lint/type/test validation for the CLI package.

Exit criterion: Automated checks cover the new multi-root sync behavior and fail if required manifest entries are removed or malformed.

Validation: `pdm run pytest -x --tb=short sync_cli/tests`

Human checkpoint: None

Risks and mitigations: Risk: tests mock command construction but miss real rsync edge cases. Mitigation: keep one manual dry-run smoke check in the final verification notes using real home/repo paths after automated tests pass.

## Dependencies Between Phases

- Phase 2 depends on Phase 1 because rsync execution should consume the final manifest shape.
- Phase 3 depends on Phase 1 because repo layout updates should match the audited manifest, not assumptions.
- Phase 4 depends on Phases 1-3 because tests and smoke checks should lock in the implemented mapping and documented repo structure.

## Risks & Mitigations

- Hidden omission risk: the requested list may still miss supporting artifacts, especially `.agents/.skill-lock.json` and any legacy `~/.config/opencode/skills` content still expected by your setup; mitigate by explicitly auditing all runtime references before finalizing the manifest.
- Path-shape risk: mixing directory syncs and single-file syncs in one CLI is the main behavioral change; mitigate by representing entry type explicitly and testing rsync command generation for both cases.
- Repo-root ambiguity risk: the current `--repo-scope` points at `global_scope`, but one new destination lives at repo root (`.agents/skills`); mitigate by separating repository root discovery from global-scope path derivation so non-`global_scope` targets remain addressable.
