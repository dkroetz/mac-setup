# MINIMAX_FINAL_PLAN - Agent Setup for futilify

## Goal

Implement Dex Horthy's Research-Plan-Implement workflow from "Context Engineering" talk as 3 primary agents in OpenCode. Lean setup (10-12 files), dev-speed focused.

## Structure

```
~/.config/opencode/
├── agents/
│   ├── research.md              # Primary: Research agent
│   ├── plan.md                  # Primary: Plan agent
│   └── implement.md             # Primary: Implement agent
├── skills/
│   ├── python-pdm/SKILL.md      # Python 3.13, PDM, ruff, mypy
│   ├── prefect-flows/SKILL.md   # Prefect patterns, deployments
│   └── postgres/SKILL.md        # SQLAlchemy, Alembic, Postgres patterns
├── commands/
│   ├── research.md              # /research command
│   ├── plan.md                  # /plan command
│   └── implement.md             # /implement command
└── opencode.jsonc               # Optional: model assignments + permissions

~/Projects/futilify/.opencode/
├── AGENTS.md                    # Updated: Project conventions + workflow
├── research/
│   └── .gitkeep                 # Git tracking
└── plans/
    └── .gitkeep                 # Git tracking
```

**Total: 16 files** (3 agents + 3 skills + 3 commands + 2 .gitkeep + 1 AGENTS.md update + optional opencode.jsonc)

## Key Design Decisions (from Q/A + Refinements)

| Decision | Source | Rationale |
|----------|--------|-----------|
| @explore built-in for subagents | GLM5 | Less files, leverages opencode native |
| 10-12 files | User preference | Balanced, lean but complete |
| .opencode/ subdirs for output | User Q/A | Clean, project-specific |
| Domain skills only | User Q/A | prefect, postgres, python-project |
| Commands for /research, /plan, /implement | MINIMAX refinement | Quick access via slash commands |
| "postgres" not "postgres-docker" | Refinement | More accurate - covers SQLAlchemy/Alembic |
| Explicit skill loading syntax | Refinement | Required for agents to use skills properly |
| .gitkeep for research/plans | Refinement | Git tracking for empty dirs |
| Explicit permissions for implement | Refinement | Fine-grained control |

## Agent Specifications

| Agent | Mode | Tools | Output |
|-------|------|-------|--------|
| **research** | primary | read, grep, glob, task (@explore), skill | `.opencode/research/YYYY-MM-DD-topic.md` |
| **plan** | primary | read, grep, glob, task (@explore), skill | `.opencode/plans/YYYY-MM-DD-topic.md` |
| **implement** | primary | read, write, edit, bash, skill | Executes + verifies |

### research.md

```markdown
---
name: research
description: Research phase - explore and document codebase
mode: primary
---

## Tools
- read, grep, glob, ls, task (for @explore)
- skill (to load domain skills)

## Behavior
- Ask clarifying questions before deep research
- Use `@explore` subagent for parallel exploration
- Load relevant domain skills via `skill({ name: "python-pdm" })` etc.
- Create dated research file with file:line references
- **NEVER suggest improvements** - only document what exists
```

### plan.md

```markdown
---
name: plan
description: Plan phase - design implementation phases
mode: primary
---

## Tools
- read, grep, glob, ls, task (for @explore)
- skill (to load domain skills)

## Behavior
- Read research file if exists in `.opencode/research/`
- Ask about scope and constraints before planning
- Load domain skills for accurate code snippets
- Create dated plan file with phases and code snippets
- Include success criteria (automated + manual)
- No open questions in final plan
```

### implement.md

```markdown
---
name: implement
description: Implement phase - execute plan phase by phase
mode: primary
---

## Tools
- read, write, edit, bash
- skill (to load domain skills)

## Permissions
- bash: allow
- edit: allow
- write: allow
- rm: deny (no destructive deletions)
- git: ask (confirm before commits)

## Behavior
- Read plan file from `.opencode/plans/`
- Read research file if available
- Execute one phase at a time
- Run automated verification after each phase
- Pause for manual verification before next phase
- Update checkboxes in plan file
```

## Skill Specifications

### python-pdm/SKILL.md

```markdown
---
name: python-pdm
description: Python 3.13 project with PDM, ruff, mypy
---

## Conventions
- Python 3.13 with strict mypy
- PDM workflow: `pdm install`, `pdm add`, `pdm run`
- Ruff for linting + formatting
- src/ layout
- Line length 120, no comments unless requested
```

### prefect-flows/SKILL.md

```markdown
---
name: prefect-flows
description: Prefect 3.x flow patterns and deployments
---

## Conventions
- Prefect 3.x flow patterns
- Deployment via `deploy/deploy.py`
- Worker pools (vps, homeserver)
- Task runners, retries, scheduling
```

### postgres/SKILL.md

```markdown
---
name: postgres
description: PostgreSQL with SQLAlchemy and Alembic
---

## Conventions
- SQLAlchemy 2.x + Alembic migrations
- Docker compose patterns for local dev
- SSL connections, connection pooling
- Migration workflow: `make migrate-new`, `make migrate`
```

## Command Files

### ~/.config/opencode/commands/research.md

```markdown
---
description: Switch to research agent for exploration
agent: research
---

Start a research phase. Use @explore to explore the codebase and document findings.
```

### ~/.config/opencode/commands/plan.md

```markdown
---
description: Switch to plan agent for planning
agent: plan
---

Start a planning phase. Read existing research and create a detailed plan.
```

### ~/.config/opencode/commands/implement.md

```markdown
---
description: Switch to implement agent for execution
agent: implement
---

Start implementation. Execute plan phase by phase with verification.
```

## Workflow

```
User: /research "How does auth work?"
  └─→ research agent spawns @explore
      └─→ loads python-pdm, prefect-flows skills via skill()
      └─→ outputs: .opencode/research/2026-02-22-auth.md

User: /plan .opencode/research/2026-02-22-auth.md
  └─→ plan agent reads research
      └─→ creates plan with phases + success criteria
      └─→ outputs: .opencode/plans/2026-02-22-auth-implementation.md

User: /implement .opencode/plans/2026-02-22-auth-implementation.md
  └─→ implement agent reads plan
      └─→ executes Phase 1 → runs ruff/mypy → pauses
      └─→ [Human confirms] → Phase 2
```

## Implementation Order

1. Create skill directories and SKILL.md files:
   - `~/.config/opencode/skills/python-pdm/SKILL.md`
   - `~/.config/opencode/skills/prefect-flows/SKILL.md`
   - `~/.config/opencode/skills/postgres/SKILL.md`

2. Create agent files:
   - `~/.config/opencode/agents/research.md`
   - `~/.config/opencode/agents/plan.md`
   - `~/.config/opencode/agents/implement.md`

3. Create command files:
   - `~/.config/opencode/commands/research.md`
   - `~/.config/opencode/commands/plan.md`
   - `~/.config/opencode/commands/implement.md`

4. Create output directories in futilify:
   - `~/Projects/futilify/.opencode/research/.gitkeep`
   - `~/Projects/futilify/.opencode/plans/.gitkeep`

5. Update `.gitignore` in futilify:
   - Add `.opencode/research/*.md` (optional: track or ignore)
   - Add `.opencode/plans/*.md` (optional: track or ignore)

6. Update AGENTS.md in futilify:
   - Add workflow documentation explaining Research → Plan → Implement

## Success Criteria

- [ ] 16 files created
- [ ] Skills load via `skill()` tool
- [ ] Research agent creates output files
- [ ] Plan agent creates output files
- [ ] Implement agent runs verification
- [ ] /research, /plan, /implement commands work
- [ ] Workflow feels smooth

## References

- HumanLayer commands: `/Users/denis/Repos/humanlayer/.claude/commands/`
- OpenCode skills docs: `/Users/denis/Repos/opencode/packages/web/src/content/docs/skills.mdx`
- OpenCode commands docs: `/Users/denis/Repos/opencode/packages/web/src/content/docs/commands.mdx`
- User Q/A: Confirmed domain skills, .opencode/ output, @explore subagents, 10-12 files
