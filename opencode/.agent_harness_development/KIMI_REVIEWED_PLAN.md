# OpenCode Agent Setup - Reviewed Plan

## Overview

Implement Dex Horthy's Research-Plan-Implement workflow as 3 primary agents in OpenCode. Combines best elements from all three proposals with user preferences applied.

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Location** | Global agents + project outputs | Agents in `~/.config/opencode/`, outputs in each project's `.opencode/` |
| **Subagents** | Use built-in `@explore` | Simpler, leverages OpenCode's native capabilities |
| **Skills** | Domain + Methodology | Best of both worlds: domain knowledge + workflow guidance |
| **Output files** | Yes, in `.opencode/` | Creates research/plan artifacts per project |
| **File count** | 9 files | Flexible guideline (10-12 is ideal, 7-14 acceptable) |

## File Structure

### Global Agents (`~/.config/opencode/agents/`)
```
~/.config/opencode/
├── agents/
│   ├── research.md              # Primary: Research with @explore
│   ├── plan.md                  # Primary: Interactive planning
│   └── implement.md             # Primary: Full-access implementation
└── skills/
    ├── python-project/SKILL.md        # Domain: Python/PDM/Ruff/Mypy
    ├── prefect-flows/SKILL.md         # Domain: Prefect patterns
    ├── docker-infra/SKILL.md          # Domain: Docker compose
    ├── research-method/SKILL.md       # Methodology: How to research
    └── planning-method/SKILL.md       # Methodology: How to plan
```

### Project Outputs (created dynamically)
```
~/Projects/futilify/.opencode/
├── research/
│   └── YYYY-MM-DD-topic.md
└── plans/
    └── YYYY-MM-DD-topic.md
```

## Agent Specifications

### 1. research.md (Primary Agent)

**Mode**: primary  
**Tools**: read, grep, glob, task (for @explore)  
**Skills**: Can load `python-project`, `prefect-flows`, `docker-infra`, or `research-method`

**Key Behaviors**:
- Ask clarifying questions before research
- Use `@explore` subagent for parallel exploration
- Document findings with file:line references
- Create `.opencode/research/YYYY-MM-DD-topic.md`
- Load `research-method` skill for methodology guidance
- NEVER suggest improvements - only document what exists

### 2. plan.md (Primary Agent)

**Mode**: primary  
**Tools**: read, grep, glob, task (for @explore)  
**Skills**: Can load `python-project`, `prefect-flows`, `docker-infra`, or `planning-method`

**Key Behaviors**:
- Read research.md if available
- Load `planning-method` skill for template structure
- Ask about scope and constraints
- Design phases with code snippets
- Include success criteria (automated + manual)
- Create `.opencode/plans/YYYY-MM-DD-topic.md`
- Include "What We're NOT Doing" section

### 3. implement.md (Primary Agent)

**Mode**: primary  
**Tools**: all (write, edit, bash, read)  

**Key Behaviors**:
- Read plan.md and research.md
- Execute one phase at a time
- Run automated verification (ruff, mypy, pytest)
- Pause for manual verification
- Update checkboxes in plan.md
- Reference project AGENTS.md

## Skill Specifications

### Domain Skills

**1. python-project/SKILL.md**
- PDM workflow, Ruff, MyPy, pytest
- src/ layout conventions
- Virtual environment activation

**2. prefect-flows/SKILL.md**
- Flow definitions, deployments
- Worker pools, scheduling
- Prefect server interaction

**3. docker-infra/SKILL.md**
- Docker Compose patterns
- Multi-service orchestration
- Environment variable handling

### Methodology Skills

**4. research-method/SKILL.md**
- Research process steps
- Output format template
- "What NOT to do" guidelines
- File:line reference conventions

**5. planning-method/SKILL.md**
- Plan structure template
- Phase design guidelines
- Success criteria format
- Code snippet conventions

## Workflow

```
User: Tab → [research] "How does auth work?"
  └─→ Loads research-method skill
  └─→ Uses @explore to search
  └─→ Creates .opencode/research/2025-02-22-auth.md

User: Tab → [plan] "Add 2FA"
  └─→ Loads planning-method skill
  └─→ Reads research file
  └─→ Creates .opencode/plans/2025-02-22-add-2fa.md

User: Tab → [implement] "Execute plan"
  └─→ Reads plan and research
  └─→ Executes Phase 1 → runs ruff/mypy → pauses
  └─→ [Human confirms] → Phase 2
```

## Implementation Order

1. Create 5 skill files (domain + methodology)
2. Create 3 agent files
3. Update global opencode.jsonc

**Total: 9 files** (within 10-12 flexible guideline)

## Success Criteria

- [ ] All agents load and appear in Tab switcher
- [ ] Skills load via `skill()` tool
- [ ] Research agent creates output files
- [ ] Plan agent creates output files
- [ ] Implement agent runs verification
- [ ] Workflow feels smooth

## What We're NOT Doing

- No custom subagents (using @explore)
- No project-specific configurations
- No complex permissions
- No automatic phase progression

## Notes

- All agents are global for use across projects
- Output files are project-local for context preservation
- Models configured in global opencode.jsonc only
- Prompts kept concise for token efficiency
- Built-in @explore subagent used instead of custom ones
