# Agent Setup Plan: Research-Plan-Implement Workflow (Reviewed v2)

## Summary

Combined best elements from GLM5, MINIMAX, and KIMI plans, incorporating user Q/A decisions.

## Decisions from User Q/A

| Question | Decision | Source |
|----------|----------|--------|
| Subagents | Use built-in `@explore` only | Kimi Q/A |
| Skills type | Domain skills (not methodology) | Kimi Q/A |
| Output location | Project's `.opencode/` folder | Kimi Q/A |
| File count | 10-12 files is acceptable | Kimi + Minimax Q/A |

## File Structure (10 files)

```
~/.config/opencode/
├── agents/
│   ├── research.md              # Primary: explore & document
│   ├── plan.md                  # Primary: design with code snippets
│   └── implement.md             # Primary: execute phase by phase
├── skills/
│   ├── python-pdm/SKILL.md      # Python 3.13, PDM, ruff, mypy
│   ├── prefect-flows/SKILL.md   # Prefect patterns, deployments
│   └── postgres-docker/SKILL.md # SQLAlchemy, Alembic, Docker
└── opencode.jsonc               # Model assignments (optional)

~/Projects/futilify/.opencode/
├── AGENTS.md                    # Project conventions (existing)
├── research/
│   └── YYYY-MM-DD-topic.md      # Research outputs
└── plans/
    └── YYYY-MM-DD-topic.md      # Plan outputs
```

## Agent Definitions

| Agent | Mode | Tools | Output |
|-------|------|-------|--------|
| **research** | primary | read-only + task | `.opencode/research/YYYY-MM-DD-topic.md` |
| **plan** | primary | read-only + task | `.opencode/plans/YYYY-MM-DD-topic.md` |
| **implement** | primary | full access | Executes plan phase by phase |

### research.md
- **Mode**: primary
- **Tools**: read, grep, glob, ls, task
- **Permission**: edit: deny, write: deny
- **Behavior**:
  - Ask clarifying questions before deep research
  - Use `@explore` subagent for parallel exploration
  - Load domain skills (python-pdm, prefect-flows, postgres-docker)
  - Create dated research file with file:line references
  - **NEVER suggest improvements** - only document what exists

### plan.md
- **Mode**: primary
- **Tools**: read, grep, glob, ls, task
- **Permission**: edit: deny, write: deny
- **Behavior**:
  - Read research file if exists in `.opencode/research/`
  - Ask about scope and constraints before planning
  - Load domain skills for accurate code snippets
  - Create dated plan file with phases and code snippets
  - Include success criteria (automated + manual)
  - No open questions in final plan

### implement.md
- **Mode**: primary
- **Tools**: full access (read, write, edit, bash)
- **Behavior**:
  - Read plan file from `.opencode/plans/`
  - Read research file if available
  - Execute one phase at a time
  - Run automated verification after each phase
  - Pause for manual verification before next phase
  - Update checkboxes in plan file

## Domain Skills

### python-pdm/SKILL.md
- Python 3.13, strict mypy
- PDM workflow (`pdm install`, `pdm add`, `pdm run`)
- Ruff linting + formatting
- src/ layout conventions
- Line length 120, no comments unless requested

### prefect-flows/SKILL.md
- Prefect 3.x flow patterns
- Deployment via `deploy/deploy.py`
- Worker pools (vps, homeserver)
- Task runners, retries, scheduling

### postgres-docker/SKILL.md
- SQLAlchemy 2.x + Alembic migrations
- Docker compose patterns for local dev
- SSL connections, connection pooling
- Migration workflow (`make migrate-new`, `make migrate`)

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

### Phase 1: Research
```
User: Tab → [research] "How does the deployment flow work?"
  └─→ Loads domain skills, explores codebase
  └─→ Asks clarifying questions if needed
  └─→ Outputs: .opencode/research/2026-02-22-deployment-flow.md
```

### Phase 2: Plan
```
User: Tab → [plan] "Create a plan to add staging deployments"
  └─→ Reads .opencode/research/2026-02-22-deployment-flow.md
  └─→ Designs phases with code snippets
  └─→ Outputs: .opencode/plans/2026-02-22-staging-deployments.md
```

### Phase 3: Implement
```
User: Tab → [implement] "Execute the plan"
  └─→ Reads plan file
  └─→ Phase 1: Add staging config
      └─→ Run: pdm run ruff check . && pdm run mypy
      └─→ Pause for human verification
  └─→ Phase 2: Update deploy script
      └─→ Run: pdm run ruff check . && pdm run mypy
      └─→ Pause for human verification
  └─→ Done
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
| Methodology skills | Domain skills instead (user preference) |
| Dated research files | Keep - helps track history |

## Implementation Order

1. Create skill directories and files:
   - `~/.config/opencode/skills/python-pdm/SKILL.md`
   - `~/.config/opencode/skills/prefect-flows/SKILL.md`
   - `~/.config/opencode/skills/postgres-docker/SKILL.md`

2. Create agent files:
   - `~/.config/opencode/agents/research.md`
   - `~/.config/opencode/agents/plan.md`
   - `~/.config/opencode/agents/implement.md`

3. Create output directories in futilify:
   - `~/Projects/futilify/.opencode/research/.gitkeep`
   - `~/Projects/futilify/.opencode/plans/.gitkeep`

4. Update `.gitignore` in futilify:
   - Add `.opencode/research/*.md` (optional: track or ignore)
   - Add `.opencode/plans/*.md` (optional: track or ignore)

## Testing (Brief)

After implementation:
1. Open futilify in opencode
2. Tab to research agent, test: "How does the Prefect deployment work?"
3. Verify research file created in `.opencode/research/`
4. Tab to plan agent, create a small plan
5. Verify plan file created in `.opencode/plans/`
6. Tab to implement agent, execute one phase
7. Verify automated checks run correctly
8. Iterate on prompts based on results

## Notes

- All agents and skills are global (reusable across projects)
- Project `AGENTS.md` remains the source for project-specific conventions
- Skills are futilify-focused but stored globally (can be extended later)
- Output files are project-specific (in each project's `.opencode/`)
- Keep prompts concise to minimize token usage
- The humanlayer prompts are verbose; we simplify while keeping key patterns
