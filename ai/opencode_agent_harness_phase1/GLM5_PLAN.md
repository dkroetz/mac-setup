# Agent Setup Plan: Research-Plan-Implement Workflow

## Goal

Implement Dex Horthy's Research-Plan-Implement workflow from the "Context Engineering" talk as 3 primary agents in OpenCode.

## Key Insights from Humanlayer Repo

1. **Commands are interactive** - they don't just run; they ask clarifying questions, iterate
2. **Research creates documents** - structured format with file:line references
3. **Plans are detailed templates** - phases, success criteria (automated + manual), code snippets
4. **"What NOT to do" sections** - clear boundaries prevent scope creep
5. **Read files FULLY first** - before spawning any subtasks
6. **Subagents are specialists** - locator, analyzer, pattern-finder for different tasks

## Structure

```
~/.config/opencode/
├── agents/
│   ├── research.md          # Primary - explore & document
│   ├── plan.md              # Primary - design with code snippets
│   └── implement.md         # Primary - execute phase by phase
└── skills/
    ├── research/SKILL.md    # Methodology + output format
    └── planning/SKILL.md    # Template structure + checklist
```

## Agent Definitions

| Agent | Mode | Tools | Purpose |
|-------|------|-------|---------|
| **research** | primary | read, grep, glob, ls, task (explore) | Interactive research, outputs `.research/research.md` |
| **plan** | primary | read, grep, glob, ls, task (explore) | Interactive planning, outputs `.research/plan.md` |
| **implement** | primary | all tools | Executes plan.md phase by phase |

## Workflow

```
User: /research "How does auth work?"
  └─→ [research agent] loads skill, explores, asks questions
      └─→ outputs: .research/research.md

User: Tab → [plan agent] "Create a plan from research.md to add 2FA"
  └─→ loads skill, reads research.md, designs phases with code snippets
      └─→ outputs: .research/plan.md

User: Tab → [implement agent] "Execute the plan"
  └─→ reads plan.md, executes phase 1, runs verification, pauses
      └─→ human confirms → next phase
```

## Output Files (in project root)

```
.research/
├── research.md     # Created by research agent
└── plan.md         # Created by plan agent
```

## Adaptations from Humanlayer

| From Humanlayer | Adaptation |
|-----------------|------------|
| Detailed "what NOT to do" | Keep - essential for model behavior |
| Interactive questioning | Keep - prevents assumptions |
| Structured output templates | Simplify - less ceremony |
| thoughts/ directory | Use `.research/` in project root |
| Specialized subagents | Use opencode's built-in `@explore` |
| Success criteria split (automated/manual) | Keep - critical for verification |
| Code snippets in plans | Keep - enables reliable execution |

## File Estimates

| File | Lines | Purpose |
|------|-------|---------|
| `agents/research.md` | ~40 | Agent config + core workflow |
| `agents/plan.md` | ~40 | Agent config + core workflow |
| `agents/implement.md` | ~35 | Agent config + execution logic |
| `skills/research/SKILL.md` | ~60 | Methodology + template |
| `skills/planning/SKILL.md` | ~80 | Methodology + template |

**Total: ~255 lines across 5 files**

## Files to Create

### 1. `~/.config/opencode/agents/research.md`

Primary agent for exploring codebase and documenting findings.

**Key behaviors:**
- Ask clarifying questions before deep research
- Use `@explore` subagent for parallel exploration
- Document findings with file:line references
- Create `.research/research.md` with structured output
- NEVER suggest improvements - only document what exists

### 2. `~/.config/opencode/agents/plan.md`

Primary agent for creating detailed implementation plans.

**Key behaviors:**
- Read research.md first if it exists
- Ask about scope and constraints
- Design phases with code snippets
- Include success criteria (automated + manual)
- Create `.research/plan.md` with implementation details
- No open questions in final plan - all decisions made

### 3. `~/.config/opencode/agents/implement.md`

Primary agent for executing plans phase by phase.

**Key behaviors:**
- Read plan.md and research.md
- Execute one phase at a time
- Run automated verification after each phase
- Pause for manual verification
- Update checkboxes in plan.md

### 4. `~/.config/opencode/skills/research/SKILL.md`

Methodology and output template for research phase.

**Contents:**
- Research process steps
- Output format template
- "What NOT to do" section

### 5. `~/.config/opencode/skills/planning/SKILL.md`

Methodology and output template for planning phase.

**Contents:**
- Planning process steps
- Plan template with code snippets
- Success criteria format
- "What NOT to do" section

## Implementation Order

1. Create `skills/research/SKILL.md` - methodology first
2. Create `skills/planning/SKILL.md` - methodology first
3. Create `agents/research.md` - references skill
4. Create `agents/plan.md` - references skill
5. Create `agents/implement.md` - reads outputs

## Next Steps

After creating files:
1. Test research agent on futilify codebase
2. Test plan agent with research output
3. Test implement agent with a small plan
4. Iterate on prompts based on results
