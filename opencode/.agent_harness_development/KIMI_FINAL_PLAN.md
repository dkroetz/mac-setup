# OpenCode Agent Setup - Final Plan

## Overview

Implement Dex Horthy's Research-Plan-Implement workflow as 3 primary agents in OpenCode. Based on review of GLM, MINIMAX, and KIMI plans, incorporating all refinements.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Location** | Global agents + project outputs | Agents reusable across projects, outputs in each project's `.opencode/` |
| **Subagents** | Use built-in `@explore` | Simpler, leverages OpenCode's native capabilities |
| **Skills** | 3 Domain skills only | As requested - no methodology skills |
| **Output files** | Yes, in `.opencode/` | Creates research/plan artifacts per project |
| **Commands** | Yes, 3 command files | `/research`, `/plan`, `/implement` for quick access |
| **File count** | 12 files | Within 10-12 guideline |

## File Structure

### Global Agents (`~/.config/opencode/`)
```
~/.config/opencode/
├── agents/
│   ├── research.md              # Primary: Research with @explore
│   ├── plan.md                  # Primary: Interactive planning
│   └── implement.md             # Primary: Full-access implementation
├── skills/
│   ├── python-pdm/SKILL.md      # Domain: Python/PDM/Ruff/Mypy
│   ├── prefect-flows/SKILL.md   # Domain: Prefect patterns
│   └── postgres/SKILL.md        # Domain: Postgres/SQLAlchemy/Alembic
└── commands/
    ├── research.md              # /research command
    ├── plan.md                  # /plan command
    └── implement.md             # /implement command
```

### Project Outputs (created dynamically in each project)
```
~/Projects/futilify/.opencode/
├── AGENTS.md                    # Project conventions + workflow docs
├── research/
│   └── YYYY-MM-DD-topic.md      # Research outputs
└── plans/
    └── YYYY-MM-DD-topic.md      # Plan outputs
```

**Total: 12 files**

## Agent Specifications

### 1. research.md (Primary Agent)

**Mode**: primary  
**Tools**: read, grep, glob, task (for @explore)  
**Permissions**: edit: deny, write: deny, bash: deny  
**Color**: Blue (#38A3EE)

**Frontmatter**:
```yaml
---
description: Research codebase - explore and document without suggesting changes
mode: primary
color: "#38A3EE"
permission:
  edit: deny
  write: deny
  bash: deny
---
```

**Key Behaviors**:
- Ask clarifying questions before research
- Use `@explore` subagent for parallel exploration (up to 3x)
- Load domain skills via `skill()` tool when relevant:
  - `skill({ name: "python-pdm" })` for Python projects
  - `skill({ name: "prefect-flows" })` for flow-related research
  - `skill({ name: "postgres" })` for database research
- Document findings with file:line references
- Create `.opencode/research/YYYY-MM-DD-topic.md`
- **NEVER suggest improvements** - only document what exists
- Include "What NOT to Do" section in output

---

### 2. plan.md (Primary Agent)

**Mode**: primary  
**Tools**: read, grep, glob, task (for @explore)  
**Permissions**: edit: deny, write: deny, bash: deny  
**Color**: Yellow (#F59E0B)

**Frontmatter**:
```yaml
---
description: Create implementation plans with phases and success criteria
mode: primary
color: "#F59E0B"
permission:
  edit: deny
  write: deny
  bash: deny
---
```

**Key Behaviors**:
- Read research file from `.opencode/research/` if available
- Load domain skills via `skill()` tool for accurate code snippets
- Ask about scope and constraints before planning
- Design phases with specific code snippets
- Include success criteria (automated + manual)
- Include "What We're NOT Doing" section
- Create `.opencode/plans/YYYY-MM-DD-topic.md`
- No open questions in final plan

---

### 3. implement.md (Primary Agent)

**Mode**: primary  
**Tools**: all (read, write, edit, bash)  
**Permissions**: Full access with bash restrictions  
**Color**: Green (#10B981)

**Frontmatter**:
```yaml
---
description: Execute plans phase by phase with verification
mode: primary
color: "#10B981"
permission:
  bash:
    "*": allow
    "rm -rf*": ask
    "git push*": ask
    "git reset*": ask
---
```

**Key Behaviors**:
- Read plan file from `.opencode/plans/`
- Read research file if available
- Execute one phase at a time
- Run automated verification after each phase:
  - `pdm run ruff check .`
  - `pdm run mypy`
  - `pdm run pytest` (if tests exist)
- Pause for manual verification before next phase
- Update checkboxes in plan file
- Never proceed to next phase without explicit human confirmation

## Skill Specifications

All skills use YAML frontmatter with `name` and `description` fields as per OpenCode standards.

### 1. python-pdm/SKILL.md

```yaml
---
name: python-pdm
description: Python 3.13, PDM, Ruff, MyPy conventions for futilify
---
```

**Content**:
- Python 3.13, strict mypy
- PDM workflow (`pdm install`, `pdm add`, `pdm run`)
- Ruff linting + formatting (line length 120)
- src/ layout conventions
- No comments unless requested
- Common commands: `pdm run ruff check .`, `pdm run mypy`, `pdm run pytest`

---

### 2. prefect-flows/SKILL.md

```yaml
---
name: prefect-flows
description: Prefect 3.x flow patterns and deployment conventions
---
```

**Content**:
- Prefect 3.x flow patterns
- Deployment via `deploy/deploy.py`
- Worker pools (vps, homeserver)
- Task runners, retries, scheduling
- Flow parameter patterns

---

### 3. postgres/SKILL.md

```yaml
---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x, Alembic, Docker patterns
---
```

**Content**:
- SQLAlchemy 2.x + Alembic migrations
- Docker compose patterns for local dev
- SSL connections, connection pooling
- Migration workflow (`make migrate-new`, `make migrate`)
- Common query patterns

## Command Specifications

Commands provide quick slash-command access to agents.

### 1. commands/research.md

```yaml
---
description: Research a topic and create documentation
agent: research
---
Research the following topic: $ARGUMENTS

If no topic provided, ask the user what to research.
Create output in .opencode/research/YYYY-MM-DD-topic.md
```

### 2. commands/plan.md

```yaml
---
description: Create implementation plan from research or scratch
agent: plan
---
Create an implementation plan for: $ARGUMENTS

If research file provided as $1, read it first: .opencode/research/$1
Create output in .opencode/plans/YYYY-MM-DD-topic.md
```

### 3. commands/implement.md

```yaml
---
description: Execute implementation plan
agent: implement
---
Execute the plan: $ARGUMENTS

If plan file provided as $1, read it: .opencode/plans/$1
Execute phase by phase with verification.
```

## Workflow

```
User: /research "How does auth work?"
  └─→ research agent loads skills, uses @explore
      └─→ creates .opencode/research/2026-02-22-auth.md

User: /plan "Add 2FA" (or Tab → plan agent)
  └─→ plan agent reads research file
      └─→ creates .opencode/plans/2026-02-22-add-2fa.md

User: /implement (or Tab → implement agent)
  └─→ implement agent reads plan
      └─→ Phase 1 → runs ruff/mypy → pauses
          └─→ [Human confirms] → Phase 2
```

## Output File Templates

### Research Output (`.opencode/research/YYYY-MM-DD-topic.md`)

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

### Plan Output (`.opencode/plans/YYYY-MM-DD-topic.md`)

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

## AGENTS.md Update

Add to `~/Projects/futilify/.opencode/AGENTS.md`:

```markdown
# Futilify - OpenCode Workflow

## Research-Plan-Implement Workflow

This project uses a 3-phase workflow for all changes:

1. **Research** (`/research` or Tab → research)
   - Explore codebase without making changes
   - Output: `.opencode/research/YYYY-MM-DD-topic.md`

2. **Plan** (`/plan` or Tab → plan)
   - Design implementation with phases
   - Output: `.opencode/plans/YYYY-MM-DD-topic.md`

3. **Implement** (`/implement` or Tab → implement)
   - Execute phase by phase with verification
   - Updates plan file checkboxes

## Domain Skills

Available skills (auto-loaded by agents when relevant):
- `python-pdm` - Python/PDM/Ruff/MyPy conventions
- `prefect-flows` - Prefect flow patterns
- `postgres` - PostgreSQL/SQLAlchemy/Alembic

## Project Conventions

[Existing project conventions remain here...]
```

## Implementation Order

1. **Create skill directories and files**:
   - `~/.config/opencode/skills/python-pdm/SKILL.md`
   - `~/.config/opencode/skills/prefect-flows/SKILL.md`
   - `~/.config/opencode/skills/postgres/SKILL.md`

2. **Create agent files**:
   - `~/.config/opencode/agents/research.md`
   - `~/.config/opencode/agents/plan.md`
   - `~/.config/opencode/agents/implement.md`

3. **Create command files**:
   - `~/.config/opencode/commands/research.md`
   - `~/.config/opencode/commands/plan.md`
   - `~/.config/opencode/commands/implement.md`

4. **Create output directories in futilify**:
   - `~/Projects/futilify/.opencode/research/.gitkeep`
   - `~/Projects/futilify/.opencode/plans/.gitkeep`

5. **Update futilify AGENTS.md**:
   - Add workflow documentation section

6. **Update futilify .gitignore**:
   ```
   # OpenCode outputs (optional tracking)
   .opencode/research/*.md
   .opencode/plans/*.md
   ```

## Success Criteria (Brief)

- [ ] All 12 files created
- [ ] `/research` command works and creates output file
- [ ] `/plan` command creates detailed plan with phases
- [ ] `/implement` command executes phase-by-phase with verification
- [ ] Tab-switching between agents works
- [ ] Skills load correctly via `skill()` tool
- [ ] AGENTS.md updated with workflow documentation

## Key Adaptations from Humanlayer

| From Humanlayer | Adaptation |
|-----------------|------------|
| Interactive questioning | Keep - prevents assumptions |
| "What NOT to do" sections | Keep - essential for model behavior |
| Read files FULLY first | Keep - before spawning subtasks |
| Success criteria (automated/manual) | Keep - critical for verification |
| Code snippets in plans | Keep - enables reliable execution |
| thoughts/ directory | `.opencode/research/` + `.opencode/plans/` |
| Specialized subagents | Built-in `@explore` only |
| Methodology skills | Domain skills only (user preference) |
| Dated research files | Keep - helps track history |

## Notes

- All agents and skills are global (reusable across projects)
- Output files are project-specific (in each project's `.opencode/`)
- Commands provide quick access, agents provide full interaction
- Skills loaded on-demand via `skill()` tool
- Models can be swapped per agent in frontmatter or opencode.json
- Prompts kept concise for token efficiency
