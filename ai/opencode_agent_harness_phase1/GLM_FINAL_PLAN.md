# Agent Setup Plan: Research-Plan-Implement Workflow (Final)

## Summary

Combined best elements from GLM5, MINIMAX, and KIMI plans, incorporating user Q/A decisions and refinements.

## Decisions from User Q/A

| Question | Decision | Source |
|----------|----------|--------|
| Subagents | Use built-in `@explore` only | Kimi Q/A |
| Skills type | Domain skills (not methodology) | Kimi Q/A |
| Output location | Project's `.opencode/` folder | Kimi Q/A |
| File count | 10-12 files is acceptable | Kimi + Minimax Q/A |

## Refinements Applied

1. AGENTS.md update step included in implementation order
2. `postgres-docker` → `postgres` (skill is DB patterns, not Docker)
3. Explicit skill loading syntax via `skill()` tool
4. `.gitkeep` files added to implementation order
5. Explicit permission controls for implement agent
6. Commands added (`/research`, `/plan`, `/implement`) for quick access
7. Clear output templates preserved

## File Structure (12 files)

```
~/.config/opencode/
├── agents/
│   ├── research.md              # Primary: explore & document
│   ├── plan.md                  # Primary: design with code snippets
│   └── implement.md             # Primary: execute phase by phase
├── skills/
│   ├── python-pdm/SKILL.md      # Python 3.13, PDM, ruff, mypy
│   ├── prefect-flows/SKILL.md   # Prefect patterns, deployments
│   └── postgres/SKILL.md        # SQLAlchemy, Alembic (renamed)
└── commands/
    ├── research.md              # /research command
    ├── plan.md                  # /plan command
    └── implement.md             # /implement command

~/Projects/futilify/.opencode/
├── AGENTS.md                    # Project conventions (existing, update)
├── research/
│   └── .gitkeep                 # Research outputs
└── plans/
    └── .gitkeep                 # Plan outputs
```

## Agent Definitions

### research.md

**Mode**: `primary`
**Tools**: read, grep, glob, ls, task
**Permissions**: edit: deny, write: deny, bash: deny

```yaml
---
description: Explores codebase and documents findings without making suggestions
mode: primary
permission:
  edit: deny
  write: deny
  bash: deny
---
```

**Behavior**:
- Ask clarifying questions before deep research
- Use `@explore` subagent for parallel exploration
- Load domain skills via `skill()` tool: `skill({ name: "python-pdm" })`
- Create dated research file with file:line references
- **NEVER suggest improvements** - only document what exists

**Skill Loading**:
```
skill({ name: "python-pdm" })
skill({ name: "prefect-flows" })
skill({ name: "postgres" })
```

### plan.md

**Mode**: `primary`
**Tools**: read, grep, glob, ls, task
**Permissions**: edit: deny, write: deny, bash: deny

```yaml
---
description: Creates detailed implementation plans with code snippets
mode: primary
permission:
  edit: deny
  write: deny
  bash: deny
---
```

**Behavior**:
- Read research file if exists in `.opencode/research/`
- Ask about scope and constraints before planning
- Load domain skills for accurate code snippets
- Create dated plan file with phases and code snippets
- Include success criteria (automated + manual)
- No open questions in final plan

### implement.md

**Mode**: `primary`
**Tools**: all (read, write, edit, bash)
**Permissions**: granular control

```yaml
---
description: Executes plans phase by phase with verification
mode: primary
permission:
  edit: allow
  write: allow
  bash:
    "*": ask
    "pdm *": allow
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "make *": allow
    "ruff *": allow
    "mypy": allow
    "pytest*": allow
---
```

**Behavior**:
- Read plan file from `.opencode/plans/`
- Read research file if available
- Execute one phase at a time
- Run automated verification after each phase
- Pause for manual verification before next phase
- Update checkboxes in plan file

## Domain Skills

### python-pdm/SKILL.md

```yaml
---
name: python-pdm
description: Python 3.13 project with PDM, Ruff, MyPy. Use for Python conventions, dependency management, and linting.
---
```

- Python 3.13, strict mypy
- PDM workflow (`pdm install`, `pdm add`, `pdm run`)
- Ruff linting + formatting
- src/ layout conventions
- Line length 120, no comments unless requested

### prefect-flows/SKILL.md

```yaml
---
name: prefect-flows
description: Prefect 3.x flow patterns, deployments, and worker pools. Use for flow development and scheduling.
---
```

- Prefect 3.x flow patterns
- Deployment via `deploy/deploy.py`
- Worker pools (vps, homeserver)
- Task runners, retries, scheduling

### postgres/SKILL.md

```yaml
---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations. Use for database schema, models, and migrations.
---
```

- SQLAlchemy 2.x + Alembic migrations
- Docker compose patterns for local dev
- SSL connections, connection pooling
- Migration workflow (`make migrate-new`, `make migrate`)

## Commands

### /research

```yaml
---
description: Start research phase on a topic
agent: research
---
Research the following topic and create a dated output file in .opencode/research/:

$ARGUMENTS

Use @explore to investigate the codebase. Load relevant domain skills. Document findings with file:line references. Do NOT suggest improvements.
```

### /plan

```yaml
---
description: Create implementation plan for a feature
agent: plan
---
Create a detailed implementation plan for:

$ARGUMENTS

First, check for relevant research in .opencode/research/. Load domain skills for accurate code snippets. Include phases with code, success criteria (automated + manual), and "What We're NOT Doing" section.
```

### /implement

```yaml
---
description: Execute implementation plan phase by phase
agent: implement
---
Execute the implementation plan:

$ARGUMENTS

Read the plan file from .opencode/plans/. Execute one phase at a time. Run automated verification (ruff, mypy, pytest) after each phase. Pause for manual verification before proceeding. Update checkboxes in plan file.
```

## Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│  [research]  ──Tab──>  [plan]  ──Tab──>  [implement]                │
│      │                     │                      │                 │
│      v                     v                      v                 │
│  .opencode/           .opencode/            Changes +              │
│  research/            plans/                verification            │
│  YYYY-MM-DD-          YYYY-MM-DD-                                   │
│  topic.md             topic.md                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Via Commands

```
/research "How does the deployment flow work?"
  └─→ Switches to research agent, explores codebase
  └─→ Outputs: .opencode/research/2026-02-22-deployment-flow.md

/plan "Add staging deployments"
  └─→ Switches to plan agent, reads research if exists
  └─→ Outputs: .opencode/plans/2026-02-22-staging-deployments.md

/implement ".opencode/plans/2026-02-22-staging-deployments.md"
  └─→ Switches to implement agent
  └─→ Phase 1: Add staging config → run verification → pause
  └─→ [Human confirms] → Phase 2
```

## Output File Formats

### .opencode/research/YYYY-MM-DD-topic.md

```markdown
# Research: [Topic]

**Date**: YYYY-MM-DD
**Repository**: [repo name]

## Summary
[2-3 sentence overview of findings]

## Key Findings

### [Component/Area 1]
- `path/to/file.py:123` - What exists here
- How it connects to other components

### [Component/Area 2]
- `path/to/file.py:45` - What exists here

## Code References
- `src/futilify/common/config.py:15` - Settings definition
- `src/futilify/flows/example.py:8` - Flow pattern

## Architecture
[Current patterns and conventions found]

## Open Questions
[Areas needing further investigation]

## What NOT to Do
- Do NOT suggest improvements or changes
- Do NOT critique the implementation
- Do NOT identify problems or issues
```

### .opencode/plans/YYYY-MM-DD-topic.md

```markdown
# Plan: [Feature/Task]

## Overview
[1-2 sentence summary of what we're implementing]

## What We're NOT Doing
- [Explicit out-of-scope item 1]
- [Explicit out-of-scope item 2]

---

## Phase 1: [Descriptive Name]

### Overview
[What this phase accomplishes]

### Changes

#### File: `path/to/file.py`
**Changes**: [Summary of what changes]

```python
# Specific code to add/modify
def new_function():
    pass
```

### Success Criteria

#### Automated Verification:
- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:
- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to Phase 2**

---

## Phase 2: [Descriptive Name]

[Same structure as Phase 1]

---

## Testing Strategy

### Unit Tests
[What to test, key edge cases]

### Manual Testing Steps
1. [Specific verification step]
2. [Another verification step]

## References
- Research: `.opencode/research/YYYY-MM-DD-topic.md`
- Related files: `path/to/relevant/file.py`
```

## Implementation Order

1. **Create skill directories and files:**
   - `~/.config/opencode/skills/python-pdm/SKILL.md`
   - `~/.config/opencode/skills/prefect-flows/SKILL.md`
   - `~/.config/opencode/skills/postgres/SKILL.md`

2. **Create agent files:**
   - `~/.config/opencode/agents/research.md`
   - `~/.config/opencode/agents/plan.md`
   - `~/.config/opencode/agents/implement.md`

3. **Create command files:**
   - `~/.config/opencode/commands/research.md`
   - `~/.config/opencode/commands/plan.md`
   - `~/.config/opencode/commands/implement.md`

4. **Create output directories in futilify:**
   - `~/Projects/futilify/.opencode/research/.gitkeep`
   - `~/Projects/futilify/.opencode/plans/.gitkeep`

5. **Update AGENTS.md in futilify:**
   - Add workflow documentation section
   - Document the Research-Plan-Implement workflow
   - Reference the new agents and commands

6. **Update `.gitignore` in futilify (optional):**
   - Add `.opencode/research/*.md` (track or ignore based on preference)
   - Add `.opencode/plans/*.md` (track or ignore based on preference)

## AGENTS.md Update Content

Add this section to `~/Projects/futilify/.opencode/AGENTS.md`:

```markdown
## Development Workflow

This project uses a Research-Plan-Implement workflow:

1. **Research** (`/research` or Tab to research agent):
   - Explores codebase and documents findings
   - Creates `.opencode/research/YYYY-MM-DD-topic.md`
   - Read-only, no suggestions

2. **Plan** (`/plan` or Tab to plan agent):
   - Creates detailed implementation plans
   - Creates `.opencode/plans/YYYY-MM-DD-topic.md`
   - Includes phases, code snippets, success criteria

3. **Implement** (`/implement` or Tab to implement agent):
   - Executes plan phase by phase
   - Runs automated verification after each phase
   - Pauses for manual verification

### Domain Skills Available
- `python-pdm`: Python/PDM/Ruff/MyPy conventions
- `prefect-flows`: Prefect patterns and deployments
- `postgres`: SQLAlchemy/Alembic patterns
```

## Testing (Brief)

After implementation:
1. Open futilify in opencode
2. Run `/research "How does Prefect deployment work?"`
3. Verify research file created in `.opencode/research/`
4. Run `/plan "Add health check endpoint"`
5. Verify plan file created in `.opencode/plans/`
6. Run `/implement ".opencode/plans/..."`
7. Verify automated checks run correctly
8. Iterate on prompts based on results

## Notes

- All agents and skills are global (reusable across projects)
- Commands provide quick access via `/research`, `/plan`, `/implement`
- Project `AGENTS.md` remains the source for project-specific conventions
- Skills are futilify-focused but stored globally (can be extended later)
- Output files are project-specific (in each project's `.opencode/`)
- Keep prompts concise to minimize token usage
- Skill loading via `skill({ name: "skill-name" })` tool
