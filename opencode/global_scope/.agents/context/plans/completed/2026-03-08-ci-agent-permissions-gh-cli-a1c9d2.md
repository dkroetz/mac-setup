# CI Agent Permissions for GitHub Projects Automation

## Goal
Allow issue refinement automation in GitHub Actions to run GitHub-project updates non-interactively in CI without weakening local developer defaults in `opencode.json`.

## Relevant Baseline (from repo exploration)
- Workflow uses `anomalyco/opencode/github@latest` in two jobs: `.github/workflows/issue-refinement.yml`.
- Current root config is restrictive (`bash: "*": "ask"`) and is intentionally kept in-repo: `opencode.json`.
- CI already syncs project config directories via `.github/scripts/sync_opencode_context.py`.
- Existing automation docs live in `docs/automation-setup.md`.
- Target workflow previously depended on project-management command guidance and needed non-interactive CLI execution.

## Phase 1 - Confirm CI override mechanism and permission surface
Description: Determine the least-invasive way to give CI an all-allowed (or narrowly pre-approved) execution profile while keeping repository `opencode.json` unchanged for local use.

Files to modify/create:
- `.github/workflows/issue-refinement.yml` (planned)
- Optional: `.github/opencode.ci.json` (planned)

Exit criterion:
- A documented decision exists for how CI selects its config/agent without modifying root `opencode.json` semantics.

Human verification:
- Required (security-sensitive): approve whether CI gets fully open permissions or only targeted allowlist (`gh *`, project-related commands).

Risks and mitigations:
- Risk: over-broad command execution with PAT in CI.
- Mitigation: prefer scoped allowlist first; if full allow is required, enforce least-privilege PAT scopes and narrow workflow triggers.

## Phase 2 - Implement CI-specific OpenCode permissions profile
Description: Add a CI-only config (or equivalent runtime override) and wire workflow jobs to use it so GitHub project actions run without interactive prompts.

Files to modify/create:
- `.github/workflows/issue-refinement.yml`
- `.github/opencode.ci.json` (if action supports explicit config path)

Exit criterion:
- Both `refine_questions` and `summarize_answers` jobs run OpenCode with CI-specific non-interactive permissions while root `opencode.json` remains unchanged.

## Phase 3 - Add explicit `gh` availability guard in workflow
Description: Add an early workflow step that validates `gh` exists and reports version; optionally add conditional install fallback if missing.

Files to modify/create:
- `.github/workflows/issue-refinement.yml`

Exit criterion:
- Workflow logs show `gh --version` before OpenCode execution.

Risks and mitigations:
- Risk: runner image drift could remove/rename CLI unexpectedly.
- Mitigation: keep explicit guard and fail fast (or install fallback) to avoid opaque downstream tool errors.

## Phase 4 - Validate behavior and update runbook
Description: Verify end-to-end behavior (question post + status update + summary status transition) under CI permissions, then document the CI override rationale and security boundaries.

Files to modify/create:
- `docs/automation-setup.md`

Exit criterion:
- Manual test checklist passes and docs explain local-vs-CI config behavior plus required token scopes.
