# Implementation Plan: Agent Setup Hardening & Cleanup

**Date**: 2026-02-22
**Research**: `.opencode/research/2026-02-22-agent-setup-best-practices.md`

## Overview

Harden agent permissions by replacing the `@general` delegation loophole with path-scoped edit permissions, slim down AGENTS.md by deduplicating into skills, move futilify-specific content to project-local skills, scope task/external_directory permissions, fix hardcoded verification in the implement command, add step caps for cost control, and add explicit model assignments.

## What We're NOT Doing

- Not changing the 3-agent (Research → Architect → Implement) workflow itself
- Not changing research subagent definitions (academic, blogs, code, news) beyond adding `codesearch` to docs
- Not changing the implement agent's permissions (already well-scoped)
- Not creating new agents or commands
- Not touching the futilify application code

---

## Phase 1: Harden Research & Architect Write Scope (P0 — Critical)

### Overview
Replace the `@general` delegation pattern with path-scoped `edit` permissions so research/architect can write directly to their designated directories. This closes the security loophole where `@general` has unrestricted write access.

### File Changes

**`~/.config/opencode/agents/research.md`** — Replace entire file:
```markdown
---
description: Explores codebase and documents findings without making suggestions
mode: primary
permission:
  edit:
    "*": deny
    ".opencode/research/*": allow
  bash: deny
---

# Research Agent

You are a research agent. Your job is to explore the codebase and document what exists.

## Process

1. Ask clarifying questions before diving deep
2. Load domain skills from project config:
   - Check `.opencode/AGENTS.md` for "Domain Skills Available" section
   - Load each skill via `skill({ name: "<skill-name>" })`
3. Use `@explore` subagent to investigate the codebase in parallel
4. Document findings with file:line references

## Output

1. **Present all findings in conversation first** - do not write files directly
2. Organize as:
   - Summary (2-3 sentences)
   - Key Findings (organized by component)
   - Code References (file:line format)
   - Architecture notes
   - Open Questions

## Persisting Output

When research is complete, ask:

> "Shall I write this to `.opencode/research/YYYY-MM-DD-<topic>.md`?"

On confirmation, write the file directly to `.opencode/research/YYYY-MM-DD-<topic>.md`.

## What NOT to Do

- Do NOT suggest improvements or changes
- Do NOT critique the implementation
- Do NOT identify problems or issues
- Do NOT write files without confirming first
- Do NOT write to any path outside `.opencode/research/`
```

**`~/.config/opencode/agents/architect.md`** — Replace entire file:
```markdown
---
description: Creates detailed implementation plans with code snippets
mode: primary
permission:
  edit:
    "*": deny
    ".opencode/plans/*": allow
  bash: deny
---

# Architect Agent

You are an architect agent. Your job is to create detailed implementation plans.

## Process

1. Check for relevant research in `.opencode/research/`
2. Load domain skills from project config:
   - Check `.opencode/AGENTS.md` for "Domain Skills Available" section
   - Load each skill via `skill({ name: "<skill-name>" })`
3. Ask about scope and constraints before planning
4. Design phases with specific code changes

## Output

1. **Present the complete plan in conversation first** - do not write files directly
2. Structure as:
   - Overview (1-2 sentences)
   - What We're NOT Doing (explicit scope boundaries)
   - Phases with:
     - Overview
     - Specific file changes with code snippets
     - Success criteria (automated + manual)
   - Testing Strategy
   - References

## Success Criteria

Use the success criteria format from `.opencode/AGENTS.md` (look for "Success Criteria Format" section).

If not defined, use a minimal default:

### Success Criteria

#### Automated Verification:
- [ ] Project linting passes
- [ ] Type checking passes
- [ ] Tests pass (if applicable)

#### Manual Verification:
- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**

## Persisting Output

When the plan is complete, ask:

> "Shall I write this to `.opencode/plans/YYYY-MM-DD-<topic>.md`?"

On confirmation, write the file directly to `.opencode/plans/YYYY-MM-DD-<topic>.md`.

## What NOT to Do

- Do NOT write files without confirming first
- Do NOT write to any path outside `.opencode/plans/`
- Do NOT leave open questions in final plan
- Do NOT skip success criteria
```

**`~/.config/opencode/commands/research.md`** — Remove `@general` delegation instruction:
```markdown
---
description: Start research phase on a topic
agent: research
---

Research the following topic:

$ARGUMENTS

## Instructions

1. Use `@explore` subagent to investigate the codebase
2. Load relevant domain skills via `skill()` tool
3. Document findings with file:line references
4. Do NOT suggest improvements - only document what exists
5. Present findings in conversation first
6. Ask user before persisting to `.opencode/research/YYYY-MM-DD-<topic-slug>.md`
7. On confirmation, write the file directly
```

**`~/.config/opencode/commands/architect.md`** — Remove `@general` delegation instruction:
```markdown
---
description: Create implementation plan for a feature
agent: architect
---

Create a detailed implementation plan for:

$ARGUMENTS

## Instructions

1. Check for relevant research in `.opencode/research/`
2. Load domain skills for accurate code snippets
3. Include:
   - Overview
   - What We're NOT Doing
   - Phases with code snippets
   - Success criteria (automated + manual)
4. Present the complete plan in conversation first
5. Ask user before persisting to `.opencode/plans/YYYY-MM-DD-<topic-slug>.md`
6. On confirmation, write the file directly
```

### Success Criteria

#### Automated Verification:
- [x] `research.md` frontmatter has `edit: { "*": deny, ".opencode/research/*": allow }`
- [x] `architect.md` frontmatter has `edit: { "*": deny, ".opencode/plans/*": allow }`
- [x] No occurrence of `@general` in any agent or command file
- [x] No `write: deny` in frontmatter (redundant — `edit` covers it)

#### Manual Verification:
- [x] Switch to research agent, confirm it can create a test file in `.opencode/research/`
- [x] Switch to research agent, confirm it cannot write outside `.opencode/research/`
- [x] Switch to architect agent, confirm it can create a test file in `.opencode/plans/`

**Pause for manual verification before proceeding to next phase**

---

## Phase 2: Scope `task` and `external_directory` Permissions (P2 + P3)

### Overview
Restrict which subagents research/architect can spawn and allow reading from known external directories without prompts.

### File Changes

**`~/.config/opencode/agents/research.md`** — Add to `permission` block in frontmatter:
```yaml
permission:
  edit:
    "*": deny
    ".opencode/research/*": allow
  bash: deny
  task:
    "explore": allow
    "research/*": allow
    "*": deny
  external_directory:
    "~/Projects/*": allow
    "~/Repos/*": allow
    "*": ask
```

**`~/.config/opencode/agents/architect.md`** — Add to `permission` block in frontmatter:
```yaml
permission:
  edit:
    "*": deny
    ".opencode/plans/*": allow
  bash: deny
  task:
    "explore": allow
    "*": deny
  external_directory:
    "~/Projects/*": allow
    "~/Repos/*": allow
    "*": ask
```

(No changes to `implement.md` — it needs broad `task` access for complex implementations.)

### Success Criteria

#### Automated Verification:
- [x] `research.md` frontmatter has `task` with `explore` and `research/*` allowed, `*` denied
- [x] `architect.md` frontmatter has `task` with `explore` allowed, `*` denied
- [x] Both agents have `external_directory` with `~/Projects/*` and `~/Repos/*` allowed

#### Manual Verification:
- [x] Research agent can spawn `@explore` and `@research/docs` subagents
- [x] Research agent cannot spawn `@general` subagent (blocked by `task` permission)
- [x] Architect agent can spawn `@explore` but not `@general`

**Pause for manual verification before proceeding to next phase**

---

## Phase 3: Add `codesearch` to Docs Subagent + Step Caps (P5 + P7)

### Overview
Give the docs research subagent access to `codesearch` for better API documentation lookups. Add `steps` caps to all primary agents for cost control.

### File Changes

**`~/.config/opencode/agents/research/docs.md`** — Add `codesearch: true` to tools:
```yaml
---
description: "Searches official documentation for authoritative references"
mode: subagent
temperature: 0.1
color: "#3B82F6"
tools:
  write: false
  edit: false
  bash: false
  webfetch: true
  websearch: true
  codesearch: true
---
```
(Rest of file unchanged.)

**`~/.config/opencode/agents/research.md`** — Add `steps` to frontmatter:
```yaml
---
description: Explores codebase and documents findings without making suggestions
mode: primary
steps: 30
permission:
  # ... (as defined in Phase 1+2)
---
```

**`~/.config/opencode/agents/architect.md`** — Add `steps` to frontmatter:
```yaml
---
description: Creates detailed implementation plans with code snippets
mode: primary
steps: 30
permission:
  # ... (as defined in Phase 1+2)
---
```

**`~/.config/opencode/agents/implement.md`** — Add `steps: 80` to frontmatter:
```yaml
---
description: Executes plans phase by phase with verification
mode: primary
steps: 80
permission:
  # ... (existing permissions unchanged)
---
```

### Success Criteria

#### Automated Verification:
- [x] `docs.md` has `codesearch: true` in tools
- [x] `research.md` has `steps: 30`
- [x] `architect.md` has `steps: 30`
- [x] `implement.md` has `steps: 80`

#### Manual Verification:
- [ ] Docs subagent can use `codesearch` tool (invoke `/research` with a library question)

**Pause for manual verification before proceeding to next phase**

---

## Phase 4: Fix Hardcoded Verification in Implement Command (P4)

### Overview
Remove hardcoded `pdm run ruff check . && pdm run ruff format . && pdm run mypy` from the implement command — the implement agent already reads verification commands from `.opencode/AGENTS.md` dynamically.

### File Changes

**`~/.config/opencode/commands/implement.md`** — Replace entire file:
```markdown
---
description: Execute implementation plan phase by phase
agent: implement
---

Execute the implementation plan:

$ARGUMENTS

## Instructions

1. Read the plan file from `.opencode/plans/`
2. Execute ONE phase at a time
3. After each phase, run verification commands from `.opencode/AGENTS.md`
4. Pause for manual verification before proceeding
5. Update checkboxes in plan file as you complete phases
```

### Success Criteria

#### Automated Verification:
- [x] No hardcoded `pdm run` commands in `commands/implement.md`
- [x] File references `.opencode/AGENTS.md` for verification commands

#### Manual Verification:
- [ ] N/A — purely a content change, tested when next `/implement` is invoked

**Pause for manual verification before proceeding to next phase**

---

## Phase 5: Slim AGENTS.md + Move Futilify Content to Project-Local Skills (P1 + P6)

### Overview
This is the largest phase. Three things happen:
1. Strip futilify-specific paths from global skills (make them generic)
2. Create project-local skills at `/Users/denis/Projects/futilify/.opencode/skills/` with futilify-specific content
3. Slim the futilify `AGENTS.md` to a lean ~60-line index (no duplication with skills)

### File Changes

#### 5a. Make Global Skills Generic

**`~/.config/opencode/skills/python-pdm/SKILL.md`** — No changes needed (already generic).

**`~/.config/opencode/skills/postgres/SKILL.md`** — Remove futilify-specific paths:
```markdown
---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations. Use for database schema, models, and migrations.
---

# PostgreSQL (SQLAlchemy + Alembic)

## Stack

- SQLAlchemy 2.x
- Alembic migrations
- PostgreSQL (Docker for local dev)

## Model Pattern

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

class MyModel(Base):
    __tablename__ = "my_table"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
```

## Migrations

| Task | Command |
|------|---------|
| Create migration | `alembic revision --autogenerate -m "description"` |
| Apply migrations | `alembic upgrade head` |

## Docker

Local Postgres via docker-compose with SSL support.
```

**`~/.config/opencode/skills/prefect-flows/SKILL.md`** — Remove futilify-specific paths:
```markdown
---
name: prefect-flows
description: Prefect 3.x flow patterns, deployments, and worker pools. Use for flow development and scheduling.
---

# Prefect Flows

## Version

Prefect 3.x

## Flow Structure

```python
from prefect import flow, task

@task
def my_task():
    pass

@flow
def my_flow():
    my_task()
```

## Patterns

- Use task runners for parallelism
- Add retries for flaky operations
- Use caching for expensive computations

## Scheduling

Configure schedules in deployment definitions using Prefect's schedule API.
```

#### 5b. Create Project-Local Skills in Futilify

**`/Users/denis/Projects/futilify/.opencode/skills/postgres/SKILL.md`** — Futilify-specific overrides:
```markdown
---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations for futilify.
---

# PostgreSQL (futilify)

## Models Location

`src/futilify/common/models/`

## Model Pattern

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from futilify.common.models.base import Base

class MyModel(Base):
    __tablename__ = "my_table"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
```

## Database Connection

Configured in `src/futilify/common/config.py`
Engine/session in `src/futilify/common/db.py`

## Migrations

| Task | Command |
|------|---------|
| Create migration | `make migrate-new msg="description"` |
| Apply migrations | `make migrate` |
| Preview SQL | `make migrate-sql` |

## Docker

Local Postgres via docker-compose:
```bash
make up-postgres    # start
make down-postgres  # stop
```
```

**`/Users/denis/Projects/futilify/.opencode/skills/prefect-flows/SKILL.md`** — Futilify-specific overrides:
```markdown
---
name: prefect-flows
description: Prefect 3.x flow patterns and deployments for futilify.
---

# Prefect Flows (futilify)

## Flow Location

`src/futilify/flows/`

## Deployment

Deployments defined in `deploy/deploy.py`

```bash
make deploy-prefect
```

## Worker Pools

- `vps` - VPS worker
- `homeserver` - Home server worker

## Infrastructure

```bash
make up-prefect    # start Prefect server
make down-prefect  # stop Prefect server
```

## Docker

```bash
make build-flows   # build flows image
make push-flows    # push to GHCR
```
```

#### 5c. Slim Futilify AGENTS.md

**`/Users/denis/Projects/futilify/.opencode/AGENTS.md`** — Replace entire file (~60 lines):
```markdown
# Agent Instructions

## Virtual Environment

```bash
source .venv/bin/activate
```

## Verification Commands

After making changes, run:
```bash
pdm run ruff check . && pdm run ruff format . && pdm run mypy
```

If tests exist for the area being modified:
```bash
pdm run pytest
```

## Docker

After editing any Dockerfile:
```bash
docker build -t futilify:local -f <dockerfile-path> .
```

## Package Structure

```
src/futilify/
├── common/           Shared library
│   ├── config.py     Pydantic settings
│   ├── db.py         SQLAlchemy engine/session
│   ├── models/       SQLAlchemy models (Base class)
│   └── secrets.py    Secret resolution
└── flows/            Prefect flows
```

## Conventions

- Python 3.13, line length 120, strict mypy
- `src/` layout, `pdm run` for all commands
- No comments unless explicitly requested

## Domain Skills Available

Load these via `skill({ name: "<skill-name>" })`:

- `python-pdm` — Python/PDM/Ruff/MyPy conventions and commands
- `postgres` — SQLAlchemy models, Alembic migrations, DB connection
- `prefect-flows` — Flow patterns, deployments, worker pools

## Success Criteria Format

```markdown
#### Automated Verification:
- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:
- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**
```

## Workflow

Research → Architect → Implement (see global agent definitions)
```

### Success Criteria

#### Automated Verification:
- [x] No futilify-specific paths in global `~/.config/opencode/skills/postgres/SKILL.md`
- [x] No futilify-specific paths in global `~/.config/opencode/skills/prefect-flows/SKILL.md`
- [x] Project-local `futilify/.opencode/skills/postgres/SKILL.md` exists with futilify paths
- [x] Project-local `futilify/.opencode/skills/prefect-flows/SKILL.md` exists with futilify paths
- [x] Futilify `AGENTS.md` has no duplicated command tables (covered by `python-pdm` skill)
- [x] Futilify `AGENTS.md` is under 70 lines

#### Manual Verification:
- [ ] From futilify project, `skill({ name: "postgres" })` loads the project-local version (has `futilify.common.models.base` import)
- [ ] From futilify project, `skill({ name: "prefect-flows" })` loads the project-local version (has `deploy/deploy.py`)
- [ ] From a different project, `skill({ name: "postgres" })` loads the generic global version

**Pause for manual verification before proceeding to next phase**

---

## Phase 6: Add Model Assignments to `opencode.jsonc` (P-new)

### Overview
Make model assignments explicit for all agents in the global config.

### File Changes

**`~/.config/opencode/opencode.jsonc`** — Replace entire file:
```jsonc
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "agent": {
    // Primary Agents
    "researcher": {
      "model": "kilo/moonshotai/kimi-k2.5"
    },
    "architect": {
      "model": "kilo/anthropic/claude-opus-4.6"
    },
    "implement": {
      "model": "kilo/anthropic/claude-opus-4.6"
    },

    // Research Sub Agents
    "research/academic": {
      "model": "kilo/deepseek/deepseek-v3.2"
    },
    "research/blogs": {
      "model": "kilo/anthropic/claude-haiku-4.5"
    },
    "research/code": {
      "model": "kilo/z-ai/glm-5:free"
    },
    "research/docs": {
      "model": "kilo/moonshotai/kimi-k2.5"
    },
    "research/news": {
      "model": "kilo/deepseek/deepseek-v3.2"
    }
  }
}
```

> **Note**: `claude-opus-4.6` used for architect/implement as the current session model. Adjust model IDs to preference before implementing.

### Success Criteria

#### Automated Verification:
- [x] `opencode.jsonc` is valid JSON (no trailing commas outside comments)
- [x] All 8 agents have explicit model assignments

#### Manual Verification:
- [ ] Switch to architect agent, verify the assigned model is in use
- [ ] Switch to implement agent, verify the assigned model is in use

**Pause for manual verification before proceeding to next phase**

---

## Testing Strategy

This plan modifies configuration files only — no application code. Testing is manual:

1. **Per-phase verification** — Each phase has specific manual checks listed in Success Criteria
2. **Regression check** — After all phases, run a full end-to-end workflow:
   - `/research` on a trivial topic → confirm output written to `.opencode/research/`
   - `/architect` referencing the research → confirm plan written to `.opencode/plans/`
   - `/implement` referencing the plan → confirm it reads verification commands from `AGENTS.md`
3. **Permission boundary check** — Attempt to write outside allowed paths from research/architect agents, confirm denial

## Summary of All Files Modified

| File | Phase | Action |
|------|-------|--------|
| `~/.config/opencode/agents/research.md` | 1,2,3 | Rewrite (permissions + steps) |
| `~/.config/opencode/agents/architect.md` | 1,2,3 | Rewrite (permissions + steps) |
| `~/.config/opencode/agents/implement.md` | 3 | Add `steps: 80` |
| `~/.config/opencode/agents/research/docs.md` | 3 | Add `codesearch: true` |
| `~/.config/opencode/commands/research.md` | 1 | Remove `@general` delegation |
| `~/.config/opencode/commands/architect.md` | 1 | Remove `@general` delegation |
| `~/.config/opencode/commands/implement.md` | 4 | Remove hardcoded verification |
| `~/.config/opencode/skills/postgres/SKILL.md` | 5 | Strip futilify-specific paths |
| `~/.config/opencode/skills/prefect-flows/SKILL.md` | 5 | Strip futilify-specific paths |
| `~/Projects/futilify/.opencode/skills/postgres/SKILL.md` | 5 | Create (project-local) |
| `~/Projects/futilify/.opencode/skills/prefect-flows/SKILL.md` | 5 | Create (project-local) |
| `~/Projects/futilify/.opencode/AGENTS.md` | 5 | Slim down (~134 → ~60 lines) |
| `~/.config/opencode/opencode.jsonc` | 6 | Add architect/implement models |

## References

- Research: `.opencode/research/2026-02-22-agent-setup-best-practices.md`
- OpenCode permission docs: `opencode/packages/web/src/content/docs/permissions.mdx`
- Permission evaluation source: `opencode/packages/opencode/src/permission/next.ts`
- Skill discovery source: `opencode/packages/opencode/src/skill/skill.ts`
