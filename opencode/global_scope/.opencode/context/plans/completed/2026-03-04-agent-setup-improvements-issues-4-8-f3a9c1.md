# Agent Setup Improvements (Issues #4-#8)

## Goal
Implement the agreed improvements to planning, implementation flow, command formatting, plan file naming, and docs lookup integration.

## Scope
- Issue #8: Do not run full tests after every file write in `/implement`; use tiered validation.
- Issue #7: Fix malformed build command output (e.g., duplicate `.md` extension).
- Issue #6: Improve `/plan` output with adaptive phases and minimal critical human checkpoints.
- Issue #5: Use robust plan filename format to avoid `ENAMETOOLONG`.
- Issue #4: Add Context7 MCP docs lookup with `webfetch` fallback to official docs.

## Rollout Order
1. Plan file naming strategy (Issue #5)
2. Build command formatting fix (Issue #7)
3. `/implement` tiered validation + must-pass final loop (Issue #8)
4. Adaptive `/plan` phasing + critical checkpoints (Issue #6)
5. Context7 MCP integration + docs fallback (Issue #4)

## Phase 1: Plan Filename Reliability
### Changes
- Replace raw prompt-based plan filenames with `YYYY-MM-DD-short-slug-hash.md`.
- Sanitize slug and cap filename length.
- Ensure duplicates always produce a new unique filename (hash/suffix).

### Exit Criteria
- Long prompts do not produce `ENAMETOOLONG`.
- Similar/duplicate prompts create distinct plan files without overwrite.

## Phase 2: Build Command Formatting Correctness
### Changes
- Fix extension handling in command generation to prevent `.md.md`.
- Normalize filename extension exactly once at the command boundary.
- Add regression test for duplicate-extension case.

### Exit Criteria
- Generated command preserves correct filename with a single `.md` extension.

## Phase 3: `/implement` Tiered Validation with Completion Gate
### Changes
- Apply tiered strategy only to `/implement`:
  - Tier 1 (during edits): no automatic full-suite validation.
  - Tier 2 (after implementation step): targeted checks when obvious and inexpensive.
  - Tier 3 (end of `/implement`): run required full validation suite.
- Enforce completion gate:
  - `/implement` does not finish until all required final validation commands are green.
  - On failures, enter auto-fix + rerun loop until pass or hard blocker.

### Required Final Validation Commands
- `ruff check && ruff format`
- `mypy --strict`
- `pytest -x --tb=short`

### Exit Criteria
- `/implement` avoids full validation after each write.
- `/implement` reports success only when final required validations pass.

## Phase 4: Adaptive `/plan` Output
### Changes
- Add task-size-based adaptive phases (small/medium/large).
- Keep plans concise and minimal by default.
- Enforce human verification only at critical points:
  - destructive or irreversible operations
  - security-sensitive changes
  - architecture-changing decisions
- Include minimal exit criteria per phase (single concise condition).

### Exit Criteria
- Small tasks produce compact phased plans.
- Larger tasks produce richer phased plans with minimal critical checkpoints.

## Phase 5: Context7 MCP Docs Integration
### Changes
- Enable Context7 MCP by default.
- Restrict intended use to documentation lookup.
- Allow usage during both planning and implementation when needed.
- Add fallback: if Context7 is unavailable/fails, use `webfetch` against official docs.

### Exit Criteria
- Docs lookup works in `/plan` and `/implement` paths.
- Fallback source is used automatically when Context7 fails.

## Non-Goals (for this iteration)
- Broad UX redesign of all commands.
- Heavy, verbose planning templates.
- Human checkpoints at every phase.

## Validation and Verification
- Add focused regression tests for:
  - filename generation and uniqueness
  - duplicate extension formatting
  - `/implement` completion gate behavior
  - adaptive phase selection
  - Context7 fallback behavior
- Run end-to-end smoke checks:
  - `/plan` with one small and one large prompt
  - `/implement` on a task with an initial failing validation that is auto-fixed before completion

## Done Definition
- All five issues implemented as scoped above.
- Relevant tests passing.
- `/implement` completion blocked until required final validations are green.
