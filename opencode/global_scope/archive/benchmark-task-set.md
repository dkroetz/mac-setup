# Benchmark Task Set

Date: 2026-03-03
Owner: Agent refinement baseline
Target project mix: global `~/.config/opencode` and `~/Projects/futilify`

## Coverage

- Bugfix: 3 tasks
- Feature: 3 tasks
- Refactor: 2 tasks
- Context-heavy: 2 tasks
- Command-driven: 2 tasks

## Tasks

1. **BUGFIX-01** (`futilify`)
   - Prompt: Fix a failing import path in one Prefect flow module after a package move.
   - Success criteria: tests for affected flow pass; no unrelated file edits.

2. **BUGFIX-02** (`futilify`)
   - Prompt: Fix regression where `resolve_secret` raises unclear errors when both env and Prefect block are missing.
   - Success criteria: explicit exception type/message; tests added for missing-secret path.

3. **BUGFIX-03** (`futilify`)
   - Prompt: Fix duplicate-notification behavior for already-seen listings in persistence layer.
   - Success criteria: idempotent behavior proven by test; no schema break.

4. **FEAT-01** (`futilify`)
   - Prompt: Add optional max-age filter to listing scrape flow and persistence boundaries.
   - Success criteria: typed API change, docs updated, tests cover default + custom values.

5. **FEAT-02** (`futilify`)
   - Prompt: Add CLI command to run one local dry scrape with summary output.
   - Success criteria: command wired in project tooling; error handling for missing config.

6. **FEAT-03** (`~/.config/opencode`)
   - Prompt: Add a new safe command template for recurring project health checks.
   - Success criteria: command has clear inputs/outputs and no overlap with existing commands.

7. **REFACTOR-01** (`futilify`)
   - Prompt: Refactor duplicated URL normalization logic into a shared helper.
   - Success criteria: behavior preserved; duplicate logic removed from at least two call sites.

8. **REFACTOR-02** (`~/.config/opencode`)
   - Prompt: Reduce duplicated instruction text between primary agents without changing behavior.
   - Success criteria: prompts stay role-specific; shared rules have one source.

9. **CTX-HEAVY-01** (`futilify`)
   - Prompt: Implement a change that must follow `.agents/context/project-intelligence.md` and wisdom patterns for persistence contracts.
   - Success criteria: output references consulted context and applies existing conventions correctly.

10. **CTX-HEAVY-02** (`futilify`)
    - Prompt: Propose a migration-safe model extension requiring architecture + decisions context alignment.
    - Success criteria: no migration anti-patterns; plan references context constraints accurately.

11. **CMD-01** (`~/.config/opencode`)
    - Prompt: Execute `/audit` and provide actionable findings with minimal noise.
    - Success criteria: findings are categorized, reproducible, and scoped.

12. **CMD-02** (`~/.config/opencode` + `futilify`)
    - Prompt: Execute `/plan` for a multi-step futilify enhancement and produce implementation phases.
    - Success criteria: phase ordering is coherent; risks and validations included.

## Scoring Rubric

- Pass: all acceptance checks met; no policy violations.
- Soft fail: partially correct but needs one follow-up human correction.
- Hard fail: incorrect approach, major policy violation, or non-working outcome.
