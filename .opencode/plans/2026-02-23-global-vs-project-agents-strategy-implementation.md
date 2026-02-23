# Implementation Plan: Global vs Project AGENTS Strategy

## Skill-Loading Report

- Domain scope classification: agent-governance/config architecture (global vs project policy ownership + skill topology).
- Skills loaded: `python-pdm`, `postgres`.
- Why loaded: `python-pdm` for verification-contract snippet shape used in AGENTS success criteria; `postgres` for accurate global-vs-local skill relocation examples.
- Constraint check: stayed within 0-2 skills (no blocking 3rd skill).

## Overview

This plan implements the strategy in `.opencode/research/2026-02-23-global-vs-project-agents-strategy.md` by tightening policy ownership boundaries, removing duplicated skill-loading directives, and explicitly relocating Postgres guidance to project scope (with a generic global fallback). It keeps always-loaded AGENTS context small while preserving reproducible verification.

## What We're NOT Doing

- Not changing model routing in `opencode/global_scope/opencode.jsonc`.
- Not changing agent/tool permission ACLs in frontmatter.
- Not introducing new agent types or command families.
- Not rewriting unrelated historical plans/research documents.
- Not broad refactors outside AGENTS/agent-prompt/skills governance files.

## Phase 1 — Establish Single Source of Truth for Policy Ownership

### Overview

Make project AGENTS the canonical place for verification + domain skill index, and keep root/global AGENTS baseline minimal.

### Specific File Changes

- `.opencode/AGENTS.md`: convert to tiny universal baseline language; keep generic safety/workflow; point project-specific verification/skills to project AGENTS.
- `opencode/project_scope/.opencode/AGENTS.md`: keep/clarify canonical sections (`Verification Commands`, `Domain Skills Available`, `Skill Loading Policy`, `Success Criteria Format`).
- `opencode/project_scope/.opencode/opencode.jsonc`: add concise comment noting project AGENTS as policy source-of-truth for local verification/skills.

#### `opencode/project_scope/.opencode/AGENTS.md`

```markdown
## Verification Commands

```bash
pdm run ruff check . && pdm run mypy
pdm run pytest  # if tests exist for touched area
```

## Domain Skills Available

- `python-pdm` - load for Python/PDM/lint/type/test tasks
- `postgres` - project-local override for futilify DB paths/migrations
- `prefect-flows` - load for flow/deployment/worker-pool tasks

## Skill Loading Policy

- Start with 0 skills
- After quick task+repo scan, load 1-2 relevant skills
- Load a 3rd skill only if blocked
```

### Success Criteria

#### Automated Verification:

- [x] `rg "## Verification Commands|## Domain Skills Available|## Skill Loading Policy|## Success Criteria Format" opencode/project_scope/.opencode/AGENTS.md` returns expected section hits.
- [x] `rg "thin policy index|project-local verification|project-local skills" .opencode/AGENTS.md` confirms global baseline wording.
- [x] `git diff -- .opencode/AGENTS.md opencode/project_scope/.opencode/AGENTS.md opencode/project_scope/.opencode/opencode.jsonc` shows only governance-scope edits.

#### Manual Verification:

- [x] A reader can identify policy ownership in <30 seconds (global baseline vs project-local operational policy).
- [x] No duplicated “source of truth” language creates ambiguity.

**Pause for manual verification before proceeding to next phase**

## Phase 2 — Remove Duplicated Skill-Loading Logic from Primary Agent Prompts

### Overview

Replace repeated loading-policy prose in primary agents with a single reference to AGENTS policy, while retaining required skill-loading telemetry in outputs.

### Specific File Changes

- `opencode/global_scope/agents/research.md`: process step references AGENTS for domain-skill policy instead of embedding full policy text.
- `opencode/global_scope/agents/architect.md`: same dedupe for skill-loading directives.
- `opencode/global_scope/agents/implement.md`: align direct-implementation skill-loading wording with AGENTS reference; keep reporting requirement.

#### `opencode/global_scope/agents/architect.md`

```markdown
## Process

1. Check for relevant research in `.opencode/research/`
2. Ask about scope and constraints before planning
3. Perform quick scope scan for domain needs
4. Read `.opencode/AGENTS.md` for domain skills + loading policy
5. Load only the minimum relevant skills for this task
6. Design phases with specific code changes

## Reporting Requirement (Skill Loading)

Before the phase plan, report:
- Domain scope classification
- Skills loaded and rationale
- Confirmation that loading stayed within policy limits
```

### Success Criteria

#### Automated Verification:

- [x] `rg "Load each skill via|load all domain skills" opencode/global_scope/agents` returns no matches.
- [x] `rg "Read \\.opencode/AGENTS.md\\` for domain skills|loading policy" opencode/global_scope/agents/{research,architect,implement}.md` confirms deduped reference.
- [x] `git diff -- opencode/global_scope/agents/research.md opencode/global_scope/agents/architect.md opencode/global_scope/agents/implement.md` is limited to policy-wording alignment.

#### Manual Verification:

- [x] Prompt outputs still include skill-loading transparency lines (skills loaded + rationale + limit confirmation).
- [x] No behavioral ambiguity about where skill-loading rules are maintained.

**Pause for manual verification before proceeding to next phase**

## Phase 3 — Relocate and Harden Postgres Skill Boundaries (Global Generic, Project Specific)

### Overview

Enforce reusable global Postgres guidance and keep futilify-specific operational detail only in project-local Postgres skill.

### Specific File Changes

- `opencode/global_scope/skills/postgres/SKILL.md`: keep strictly generic SQLAlchemy/Alembic patterns; remove project identifiers/commands.
- `opencode/project_scope/.opencode/skills/postgres/SKILL.md`: keep futilify paths + `make migrate*` workflow; optionally add short “overrides global postgres when present” note.
- `opencode/project_scope/.opencode/AGENTS.md`: make override precedence explicit in `Domain Skills Available`.

#### `opencode/project_scope/.opencode/skills/postgres/SKILL.md`

```markdown
---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations for futilify.
---

# PostgreSQL (futilify)

## Models Location
`src/futilify/common/models/`

## Database Connection
`src/futilify/common/config.py`
`src/futilify/common/db.py`

## Migrations
- `make migrate-new msg="description"`
- `make migrate`
- `make migrate-sql`
```

### Success Criteria

#### Automated Verification:

- [x] `rg "futilify|src/futilify|make migrate" opencode/global_scope/skills/postgres/SKILL.md` returns no matches.
- [x] `rg "src/futilify|make migrate-new|make migrate-sql" opencode/project_scope/.opencode/skills/postgres/SKILL.md` returns expected matches.
- [x] `git diff -- opencode/global_scope/skills/postgres/SKILL.md opencode/project_scope/.opencode/skills/postgres/SKILL.md opencode/project_scope/.opencode/AGENTS.md` confirms topology-only changes.

#### Manual Verification:

- [x] Operators can clearly tell which Postgres skill is reusable global vs project-specific.
- [x] No loss of project migration workflow detail after relocation.

**Pause for manual verification before proceeding to next phase**

## Phase 4 — Update Drift Checks for Ongoing Enforcement

### Overview

Extend existing checklist so regressions in policy duplication or skill boundary leakage are caught quickly.

### Specific File Changes

- `opencode/project_scope/.opencode/verification/minimal-context-checklist.md`: add checks for (a) no duplicate loading policy in agent prompts and (b) no project-specific DB details in global Postgres skill.

#### `opencode/project_scope/.opencode/verification/minimal-context-checklist.md`

```markdown
# Minimal-Context Drift Checklist

1. No duplicated skill-loading policy in primary agent specs:
   - `rg "Start with 0 skills|load 1-2 relevant skills|Load a 3rd skill" opencode/global_scope/agents`
   - Expected: only AGENTS-reference phrasing, no standalone policy blocks

2. Postgres boundary is preserved:
   - `rg "futilify|src/futilify|make migrate" opencode/global_scope/skills/postgres/SKILL.md`
   - Expected: no matches
   - `rg "src/futilify|make migrate-new|make migrate-sql" opencode/project_scope/.opencode/skills/postgres/SKILL.md`
   - Expected: matches

3. AGENTS remains thin policy index:
   - Confirm no long procedural/domain deep-dives in AGENTS files
```

### Success Criteria

#### Automated Verification:

- [x] Checklist contains duplication + skill-boundary checks and executable commands.
- [x] Running checklist commands yields expected match/no-match behavior.
- [x] `git diff -- opencode/project_scope/.opencode/verification/minimal-context-checklist.md` is concise and policy-focused.

#### Manual Verification:

- [x] Checklist can be run in under 5 minutes during policy edits.
- [x] Checklist catches an intentional local/global boundary regression in dry run.

**Pause for manual verification before proceeding to next phase**

## Testing Strategy

- Run lightweight static validations with `rg` for policy duplication, ownership wording, and skill-boundary leakage.
- Use `git diff -- <changed-path>` for every touched governance file per repo verification policy.
- Smoke-test one prompt each for `research`, `architect`, and `implement` to confirm skill-loading telemetry is still reported.
- Perform one intentional regression (temporary duplicated policy line or global skill leakage), verify checklist catches it, then revert that intentional test change.

## References

- `.opencode/research/2026-02-23-global-vs-project-agents-strategy.md:7`
- `.opencode/research/2026-02-23-global-vs-project-agents-strategy.md:30`
- `.opencode/research/2026-02-23-global-vs-project-agents-strategy.md:36`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:35`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:61`
- `opencode/global_scope/agents/research.md:31`
- `opencode/global_scope/agents/architect.md:29`
- `opencode/global_scope/agents/implement.md:47`
- `opencode/global_scope/skills/postgres/SKILL.md:6`
- `opencode/project_scope/.opencode/skills/postgres/SKILL.md:6`
- `opencode/project_scope/.opencode/AGENTS.md:16`
- `opencode/project_scope/.opencode/verification/minimal-context-checklist.md:1`
