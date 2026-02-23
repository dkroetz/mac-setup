# MINIMAX_REVIEWED_PLAN - Agent Setup for futilify

## Goal

Implement Dex Horthy's Research-Plan-Implement workflow from "Context Engineering" talk as 3 primary agents in OpenCode. Lean setup (10-12 files), dev-speed focused.

## Structure

```
~/Projects/futilify/.opencode/
├── AGENTS.md                          # Main entry + project conventions
├── agent/
│   ├── researcher.md                 # Primary: Research agent
│   ├── planner.md                    # Primary: Plan agent
│   └── implementer.md               # Primary: Implement agent
├── command/
│   ├── research.md                   # /research
│   ├── plan.md                       # /plan
│   └── implement.md                  # /implement
├── research/                         # Output: research documents
│   └── (YYYY-MM-DD-topic.md)
└── skill/
    ├── prefect.md                    # Prefect domain
    ├── postgres.md                   # Postgres domain
    └── python-project.md             # Python conventions
```

**Total: 10 files**

## Key Design Decisions (from comparison + Q&A)

| Decision | Source | Rationale |
|----------|--------|-----------|
| @explore built-in for subagents | GLM5 | Less files, leverages opencode native |
| 10-12 files | User preference | Balanced, lean but complete |
| .opencode/ subdirs for output | User Q&A | Clean, project-specific |
| Domain skills | User Q&A | prefect, postgres, python-project |
| "What NOT to do" in prompts | GLM5 | Prevents scope creep |
| Interactive questioning | GLM5 | Prevents assumptions |
| Success criteria (auto + manual) | KIMI | Clear verification |
| Testing section | Keep brief | From Q&A |

## Agent Specifications

| Agent | Mode | Tools | Output |
|-------|------|-------|--------|
| **researcher** | primary | read, grep, glob, task (@explore) | `.opencode/research/YYYY-MM-DD-topic.md` |
| **planner** | primary | read, write, edit, task (@explore) | `.opencode/plans/YYYY-MM-DD-topic.md` |
| **implementer** | primary | all (edit, write, bash, read) | Executes + verifies |

## Workflow

```
User: /research "How does auth work?"
  └─→ researcher agent spawns @explore (up to 3x in parallel)
      └─→ synthesizes findings
          └─→ outputs: .opencode/research/2026-02-22-auth-overview.md

User: /plan .opencode/research/2026-02-22-auth-overview.md
  └─→ planner agent reads research, asks clarifying questions
      └─→ creates plan with phases + success criteria
          └─→ outputs: .opencode/plans/2026-02-22-auth-implementation.md

User: /implement .opencode/plans/2026-02-22-auth-implementation.md
  └─→ implementer agent reads plan, executes phase 1
      └─→ runs automated verification (ruff, mypy, pytest)
          └─→ pauses for manual verification
              └─→ human confirms → next phase
```

## Prompt Design Principles (from GLM5)

1. **Interactive** - Ask clarifying questions before diving in
2. **"What NOT to do"** - Explicit boundaries prevent scope creep
3. **Read files FULLY** - No limit/offset before spawning subtasks
4. **Document what IS** - Not what should be, no recommendations unless asked

## Skills

| Skill | Content |
|-------|---------|
| **prefect** | Flows, deployments, workers, blocks |
| **postgres** | Migrations, SQLAlchemy, Alembic |
| **python-project** | PDM, ruff, mypy, pytest, src/ layout |

## Files Summary

| File | Lines (est) | Purpose |
|------|-------------|---------|
| `AGENTS.md` | 75 | Project conventions from existing .opencode/AGENTS.md |
| `agent/researcher.md` | 40 | Primary research agent prompt |
| `agent/planner.md` | 50 | Primary plan agent prompt |
| `agent/implementer.md` | 40 | Primary implement agent prompt |
| `command/research.md` | 20 | /research command |
| `command/plan.md` | 20 | /plan command |
| `command/implement.md` | 20 | /implement command |
| `skill/prefect.md` | 30 | Prefect domain knowledge |
| `skill/postgres.md` | 30 | Postgres domain knowledge |
| `skill/python-project.md` | 30 | Python conventions |

**Total: ~355 lines across 10 files**

## Implementation Order

1. Create `skill/prefect.md` - domain knowledge first
2. Create `skill/postgres.md` - domain knowledge first
3. Create `skill/python-project.md` - project conventions
4. Create `agent/researcher.md` - references skills
5. Create `agent/planner.md` - reads research output
6. Create `agent/implementer.md` - reads plan output
7. Create `command/research.md`
8. Create `command/plan.md`
9. Create `command/implement.md`
10. Update `AGENTS.md` - add workflow intro

## Success Criteria (Brief)

- [ ] 10 files created in .opencode/
- [ ] /research command spawns @explore, outputs to .opencode/research/
- [ ] /plan command creates detailed plan with phases
- [ ] /implement command executes phase-by-phase with verification
- [ ] Skills load correctly when referenced

## References

- HumanLayer commands: `/Users/denis/Repos/humanlayer/.claude/commands/`
- Opencode structure: `/Users/denis/Repos/opencode/.opencode/`
- Original plans: `GLM5_PLAN.md`, `KIMI_PLAN.md`
- User Q&A: Confirmed domain skills, .opencode/ output, @explore subagents
