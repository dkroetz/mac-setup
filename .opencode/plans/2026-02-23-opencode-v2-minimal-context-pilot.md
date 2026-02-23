# Implementation Plan: OpenCode v2 Minimal-Context (Incremental Pilot)

## Overview

Implement the minimal-context target in low-risk stages: compress always-loaded policy first, pilot conditional skill loading in one primary agent, then split skill topology, and finally roll out conditional loading to remaining primary agents.

## What We're NOT Doing

- Not changing model selections in `opencode/global_scope/opencode.jsonc`
- Not introducing new agent types or modifying tool/permission ACLs
- Not bulk-updating all primary agents in one pass
- Not adding broad non-operational rules
- Not modifying `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md`

## Phase 1: Compress AGENTS into Thin Policy Index

### Overview

Reduce project AGENTS to operational essentials: bootstrap, verification, compact domain skill index with when-to-load guidance, workflow contract, and compact success criteria.

### Specific File Changes

#### `opencode/project_scope/.opencode/AGENTS.md`

```markdown
# Agent Instructions

## Virtual Environment
```bash
source .venv/bin/activate
```

## Verification Commands
```bash
pdm run ruff check . && pdm run mypy
pdm run pytest  # if tests exist for touched area
```

## Domain Skills Available
- `python-pdm` — load for Python/PDM/lint/type/test tasks
- `postgres` — load for SQLAlchemy/Alembic/database tasks
- `prefect-flows` — load for flow/deployment/worker-pool tasks

## Skill Loading Policy
- Start with 0 skills
- After quick task+repo scan, load 1-2 relevant skills
- Load a 3rd skill only if blocked

## Rule Admission Policy
- Add rules only for repeated, observed failures
- Prefer checkable, positive directives
- Prune stale rules periodically

## Workflow
Research -> Architect -> Implement
```

### Success Criteria

#### Automated Verification:

- [x] `pdm run ruff check .` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run mypy` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run pytest` passes (if tests exist) *(skipped per user instruction: config-only repo)*

#### Manual Verification:

- [x] AGENTS remains thin operational policy (no package tree or long prose)
- [x] No regressions in agent behavior from AGENTS edits

**Pause for manual verification before proceeding to next phase**

## Phase 2: Pilot Conditional Skill Loading in `implement`

### Overview

Convert one primary agent (`implement`) from bulk domain-skill loading to conditional loading after quick scope scan.

### Specific File Changes

#### `opencode/global_scope/agents/implement.md`

```markdown
### Direct Implementation

Use for small tasks without a plan.

For small tasks:
1. Read `.opencode/AGENTS.md` and classify task domain (python, db, flows)
2. Start with 0 skills loaded
3. Load 1-2 matching skills only:
   - python task -> `python-pdm`
   - db/migrations -> `postgres`
   - prefect/deploy -> `prefect-flows`
4. Load a 3rd skill only if blocked by missing domain context
5. Make changes directly
6. Run verification
7. Report completion
```

#### `opencode/global_scope/agents/implement.md` (guardrail section)

```markdown
- Do NOT load all domain skills by default for small tasks
- Do NOT exceed 3 loaded skills unless explicitly required by scope
```

### Success Criteria

#### Automated Verification:

- [x] `pdm run ruff check .` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run mypy` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run pytest` passes (if tests exist) *(skipped per user instruction: config-only repo)*

#### Manual Verification:

- [x] Python-only small task completes after loading only `python-pdm`
- [x] DB-focused task completes without unnecessary non-DB skills

**Pause for manual verification before proceeding to next phase**

## Phase 3: Split Postgres Skill Topology (Global Generic + Local Project-Specific)

### Overview

Move futilify-coupled Postgres guidance to local project skill while keeping a reusable generic global Postgres skill.

### Specific File Changes

#### `opencode/global_scope/skills/postgres/SKILL.md`

```markdown
---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migration workflows.
---

# PostgreSQL (Generic)

## Model Pattern
```python
from sqlalchemy.orm import Mapped, mapped_column

class MyModel(Base):
    __tablename__ = "my_table"
    id: Mapped[int] = mapped_column(primary_key=True)
```

## Migrations
- Create migration: `<project migration command>`
- Apply migrations: `<project migration command>`
```

#### `opencode/project_scope/.opencode/skills/postgres/SKILL.md` (new)

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

#### `opencode/project_scope/.opencode/AGENTS.md`

```markdown
- `postgres` — project-local skill for futilify DB paths/migrations; global fallback remains generic
```

### Success Criteria

#### Automated Verification:

- [x] `pdm run ruff check .` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run mypy` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run pytest` passes (if tests exist) *(skipped per user instruction: config-only repo)*

#### Manual Verification:

- [x] In project scope, `postgres` resolves to futilify-specific guidance
- [x] In global scope, `postgres` remains generic and reusable

**Pause for manual verification before proceeding to next phase**

## Phase 4: Expand Conditional Loading to `research` and `architect`

### Overview

After pilot validation, align remaining primary agents to conditional loading and keep instructions compact.

### Specific File Changes

#### `opencode/global_scope/agents/research.md`

```markdown
## Process
1. Ask clarifying questions before diving deep
2. Perform quick scope scan (task + repo signals)
3. Start with 0 skills; load 1-2 relevant skills from `.opencode/AGENTS.md`
4. Load a 3rd skill only if blocked
5. Use `@explore` subagent to investigate in parallel
```

#### `opencode/global_scope/agents/architect.md`

```markdown
## Process
1. Check for relevant research in `.opencode/research/`
2. Ask about scope and constraints
3. Perform quick scope scan for domain needs
4. Start with 0 skills; load 1-2 relevant skills
5. Add a 3rd skill only if blocked
6. Design phases with specific code changes
```

### Success Criteria

#### Automated Verification:

- [x] `pdm run ruff check .` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run mypy` passes *(skipped per user instruction: config-only repo)*
- [x] `pdm run pytest` passes (if tests exist) *(skipped per user instruction: config-only repo)*

#### Manual Verification:

- [x] `research` and `architect` no longer instruct bulk skill loading
- [x] Planning and research quality remain stable with reduced context footprint

**Pause for manual verification before proceeding to next phase**

## Validation Evidence (Post-Implementation)

### Scenario A: Python-only small task

- Loaded skills: `python-pdm`
- Not loaded: `postgres`, `prefect-flows`
- Result: PASS

### Scenario B: DB-focused small task

- Loaded skills: `postgres`
- Escalation to 2nd/3rd skill: No
- Result: PASS

### Scenario C: Research/Architect quality stability

- Sample prompts executed: 3 research + 3 architect
- Quality check dimensions:
  - coverage of requested scope
  - correctness of file references
  - no unnecessary skill loading
- Result: PASS

## Remaining Prior Checkboxes

- [x] No regressions in agent behavior from AGENTS edits
- [x] Python-only small task loads only `python-pdm`
- [x] DB-focused task avoids unnecessary non-DB skills
- [x] Planning/research quality stable with reduced context footprint

## Testing Strategy

- Run structure sanity checks after each phase (frontmatter and markdown consistency)
- Verification commands per AGENTS:
  - `source .venv/bin/activate`
  - `pdm run ruff check .`
  - `pdm run mypy`
  - `pdm run pytest` (if tests exist for touched area)
- Manual smoke scenarios:
  - Python-only small change path (loads only `python-pdm`)
  - DB-focused path (loads only `postgres`, adds extra skill only if blocked)
- Gate rollout: complete and validate Phase 2 before Phase 4

## References

- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:11`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:33`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:49`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:65`
- `opencode/project_scope/.opencode/AGENTS.md:49`
- `opencode/project_scope/.opencode/AGENTS.md:57`
- `opencode/global_scope/agents/research.md:30`
- `opencode/global_scope/agents/architect.md:27`
- `opencode/global_scope/agents/implement.md:47`
- `opencode/global_scope/skills/postgres/SKILL.md:6`
- `opencode/project_scope/.opencode/skills/prefect-flows/SKILL.md:1`
