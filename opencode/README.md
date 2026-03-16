# Agent Harness for OpenCode - Complete

This directory contains a complete agent harness system for OpenCode, implementing all 9 phases from the OPUS_FINAL_PLAN.md.

## Quick Start

### Global Setup (Already Done)

Your global OpenCode configuration is ready:

```
~/.config/opencode/
├── opencode.jsonc         # Global config, permissions, plugins
├── AGENTS.md              # Global preferences (20 lines)
├── agents/                # Agent definitions
│   ├── scout.md           # Light Q&A agent
│   ├── engineer.md        # Primary dev agent
│   ├── auto.md            # Disabled autonomous agent
│   └── subagents/         # Task-focused and research subagents
│       ├── planner.md
│       ├── implementer.md
│       ├── reviewer.md
│       ├── context-auditor.md
│       ├── discoverer.md
│       └── research/
├── .agents/               # Local harness skills and context
│   ├── skills/            # Harness-specific skills
│   │   └── skill-creator/ # Skill creation and management
│   └── context/           # Harness context (plans, wisdom)
│       ├── plans/
│       └── wisdom/
├── commands/              # Custom commands (10)
│   ├── plan.md
│   ├── build.md
│   ├── review.md
│   ├── commit.md
│   ├── add-context.md
│   ├── context.md
│   ├── capture.md
│   ├── audit.md
│   └── review-pr.md
├── plugins/               # TypeScript plugins (2)
│   ├── session-notify.ts
│   └── env-protection.ts
└── docs/                  # Documentation
    └── prompt_best_practices.md
```

### Global Skills

Skills available to all projects (in `~/.agents/skills/`):

```
~/.agents/skills/
└── conventional-commit/   # Structured commit message generation
```

### For a New Project

```bash
# 1. Create project context directory
mkdir -p /path/to/project/.agents/context

# 2. Create AGENTS.md in your project root
# (Start minimal: role, scope, workflow, tools, validation)

# 3. Add project-specific context as needed:
#    - .agents/context/architecture.md
#    - .agents/context/wisdom/patterns.md
#    - .agents/context/wisdom/mistakes.md
```

## Agents

### Scout (Default)
- **Model**: opencode/minimax-m2.5-free
- **Purpose**: Ask-oriented Q&A, targeted exploration, small focused tasks
- **Use for**: Simple questions, selective code discovery, self-contained small edits, quick reviews
- **Escalates**: Multi-file, architecture-sensitive, security-sensitive, or long-running work to engineer

### Engineer
- **Model**: opencode-go/glm-5
- **Purpose**: Complex development work, multi-step execution, multi-file changes
- **Use for**: Features, refactoring, validation-heavy work, architectural implementation
- **Delegates**: To subagents (planner, implementer, reviewer) and built-in (@explore, @general)

### Auto (Disabled)
- **Status**: Disabled placeholder
- **Purpose**: Explicit autonomous experiments, not default interactive work
- **Enable**: Change `disable: false` in agents/auto.md

## Skills

### Global Skills (in `~/.agents/skills/`)

Available to all projects:

1. **conventional-commit** - Structured commit message generation following Conventional Commits spec

### Local Skills (in `.agents/skills/`)

Harness-specific skills:

1. **skill-creator** - Create, edit, optimize, and benchmark skills

## Commands (9)

- `/plan <task>` - Create implementation plan
- `/implement <plan>` - Execute plan with tiered validation and final green gate
- `/review` - Review unstaged changes
- `/review-pr` - Review a pull request
- `/commit` - Create structured commit
- `/add-context` - Harvest project patterns with 6 guided questions
- `/context harvest` - Import external notes into project intelligence
- `/capture` - Capture learnings to wisdom files
- `/audit` - Check context for staleness

## Subagents

### Task-focused
- **@planner** - Create structured implementation plans
- **@implementer** - Execute focused implementation steps
- **@reviewer** - Validate changes for quality
- **@context-auditor** - Validate context coverage before implementation
- **@discoverer** - Find relevant code and constraints quickly
- **@google** - Multi-source research coordination

### Research
- **@research/code** - Search code examples and reference implementations
- **@research/docs** - Search official documentation
- **@research/blogs** - Search community tutorials and opinions
- **@research/news** - Search current news and announcements
- **@research/academic** - Search papers and academic sources

### Built-in
- **@explore** - Fast, read-only codebase exploration
- **@general** - General-purpose multi-step tasks

## Plugins (2)

- **session-notify.ts** - Sound notifications for session events
- **env-protection.ts** - Block access to sensitive files (.env, .pem, .key)

## Context Strategy

Progressive disclosure with minimal front-loading:

1. **AGENTS.md** (~80 lines) - Table of contents, not encyclopedia
2. **.agents/context/** - Deep context (architecture, wisdom, plans)
3. **Agent navigates** - Follows pointers as needed
4. **Skills load dynamically** - Small procedural skills beat broad static guidance
5. **Wisdom accumulates** - Learnings captured via `/capture`

## Maintenance

### Weekly (30 min)
```bash
/audit  # Check for staleness
```

### After Complex Tasks
```bash
/capture  # Save learnings
```

### Review Progress
- Month 1: All writes require confirmation
- Month 2: Allow safe read-only operations
- Month 3+: Relax permissions based on trust

See [MAINTENANCE.md](MAINTENANCE.md) for full details.

## Key Principles

1. **AGENTS.md is a table of contents** - Points to deeper docs, doesn't duplicate
2. **2-3 focused skills** - Better than many generic ones
3. **Skills stay procedural** - Use focused workflows, not encyclopedic skill docs
4. **Enforce via tooling** - Linters > instructions
5. **Progressive disclosure** - Start small, navigate to what's needed
6. **Read is free, write is gated** - Zero friction for discovery
7. **Config-first** - Markdown/config before TypeScript plugins
8. **Repository is source of truth** - All knowledge versioned
9. **Measure before optimizing** - Token usage, duration, success rate
10. **Targeted MCP usage** - Context7 enabled for docs lookup only

## Research Backing

Based on findings from:
- SkillsBench (Li et al., 2026)
- Evaluating AGENTS.md (Gloaguen et al., 2026)
- OpenAI Harness Engineering (Lopopolo, 2026)
- Theo's Context Management (2026)
- 12 Factor Agents (HumanLayer)
- Agentic Context Engineering (Stanford/SambaNova, ICLR 2026)

## Harness Review Outcomes

- **Primary agents** - Keep `scout` + `engineer` as the active primary pair and keep `auto` as an explicit experiment; see `agents/scout.md` and `agents/engineer.md`
- **Planning guidance** - Use concrete, validation-aware phased plans in `commands/plan.md` and `agents/subagents/planner.md`
- **Plan/implement handoff** - Keep per-phase fields stable so `commands/plan.md` and `commands/implement.md` stay mechanically aligned on validation and checkpoint gates
- **Agent prompts** - Keep `scout` ask-oriented and `engineer` implementation-oriented; see `agents/scout.md` and `agents/engineer.md`
- **Memory model** - Split durable context across `AGENTS.md`, `.agents/context/project-intelligence.md`, `plans/`, `wisdom/`, and `decisions/`; see `MAINTENANCE.md`
- **AGENTS.md strategy** - Keep `AGENTS.md` lean, pointer-based, and free of procedural bulk; see `AGENTS.md`
- **Skill loading** - Keep skills focused, procedural, and metadata-first; see `.agents/skills/skill-creator/SKILL.md` and `MAINTENANCE.md`
- **New skills** - Add a new skill only for recurring workflows with a clear boundary, not for one-off procedures; see `MAINTENANCE.md`

## File Manifest

All files created across 9 phases:

| Phase | File | Purpose |
|-------|------|---------|
| 1 | opencode.jsonc | Global config |
| 1 | AGENTS.md | Global preferences |
| 1 | agents/scout.md | Light Q&A agent |
| 1 | agents/engineer.md | Primary dev agent |
| 2 | agents/subagents/planner.md | Planning subagent |
| 2 | agents/subagents/implementer.md | Implementation subagent |
| 2 | agents/subagents/reviewer.md | Review subagent |
| 3 | docs/prompt_best_practices.md | Prompt authoring guide |
| 3 | .agents/context/ | Harness context structure |
| 4 | .agents/skills/skill-creator/SKILL.md | Skill creation procedures |
| 5 | commands/plan.md | Planning command |
| 5 | commands/implement.md | Implementation command |
| 5 | commands/review.md | Review command |
| 5 | commands/commit.md | Commit command |
| 5 | commands/add-context.md | Context harvesting intake |
| 5 | commands/context.md | Context harvest/map/validate |
| 6 | commands/capture.md | Wisdom capture |
| 6 | commands/review-pr.md | Pull request review command |
| 7 | plugins/session-notify.ts | Session notifications |
| 7 | plugins/env-protection.ts | File protection |
| 8 | agents/auto.md | Autonomous agent |
| 8 | .agents/skills/skill-creator/ | Skill management system |
| 9 | commands/audit.md | Staleness check |
| 9 | MAINTENANCE.md | Maintenance guide |

## Success Criteria Checklist

- [x] Scout is default agent
- [x] Tab switches between agents
- [x] Scout uses cheap model, engineer uses capable model
- [x] Both agents ask confirmation before writes
- [x] Scout escalates complex tasks
- [x] Engineer delegates to subagents
- [x] AGENTS.md under 100 lines
- [x] Context in .agents/context/ (not docs/)
- [x] Global skills in ~/.agents/skills/ plus local skills in .agents/skills/
- [x] 10 custom commands
- [x] 2 lightweight plugins
- [x] Wisdom accumulation system
- [x] Maintenance rhythm documented

## Next Steps

1. **Try it out**: Start OpenCode in a project
2. **Switch agents**: Use Tab to try scout vs engineer
3. **Use commands**: Try `/plan`, `/add-context`, `/context harvest`, `/review`, `/commit`
4. **Capture learnings**: Run `/capture` after complex tasks
5. **Audit weekly**: Run `/audit` to check context
6. **Progress autonomy**: Relax permissions as trust builds

## Getting Help

- OpenCode docs: https://opencode.ai/docs
- Agent system: https://opencode.ai/docs/agents
- Skills: https://opencode.ai/docs/skills
- Commands: https://opencode.ai/docs/commands
- Plugins: https://opencode.ai/docs/plugins

---

**Status**: All 9 phases complete ✓
