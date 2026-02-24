# Harness Engineering Workflow for OpenCode

A structured agent workflow inspired by [Dex's "Context Engineering" talk](https://www.youtube.com/watch?v=rmvDxxNubIg) at AI Engineer World's Fair.

## The Problem

Most AI coding assistants create excessive code churn and rework, especially in brownfield codebases. The talk identifies that developers spend significant time fixing "slop" shipped in previous AI-assisted sessions.

## The Solution

A 3-phase workflow where each agent has specific constraints:

```
Research → Architect → Implement
```

| Phase | Role | Constraint |
|-------|------|------------|
| Research | Explore & document | Cannot suggest changes |
| Architect | Design implementation plan | Cannot modify code |
| Implement | Execute plan phase-by-phase | Cannot proceed without verification |

## Implementation

### Directory Structure

```
global_scope/           # Shared across all projects (~/.config/opencode/)
├── agents/             # Primary + subagent definitions
│   ├── research.md     # Documents findings, no suggestions
│   ├── architect.md    # Creates plans, no code edits
│   ├── implement.md    # Executes plans with verification
│   ├── google.md       # External research coordinator
│   └── research/       # Specialized research subagents
├── commands/           # Slash commands for quick access
├── skills/             # Domain knowledge modules
│   ├── python-pdm/     # Python/PDM conventions
│   └── postgres/       # SQLAlchemy/Alembic patterns
└── opencode.jsonc      # Model assignments per agent

project_scope/          # Per-project configuration
└── .opencode/
    ├── AGENTS.md       # Project conventions, verification commands
    ├── research/       # Research output files
    └── plans/          # Implementation plans
```

### Key Design Decisions

1. **Permission-based constraints** - Agents use `permission:` blocks to enforce what they can/cannot do:
   - Research: `edit: deny` everywhere except `.opencode/research/`
   - Architect: `edit: deny` everywhere except `.opencode/plans/`
   - Implement: `bash: ask` for destructive operations

2. **Built-in subagent** - Uses OpenCode's `@explore` instead of custom exploration subagents (leaner setup)

3. **Domain skills** - Project-specific knowledge loaded via `skill({ name: "python-pdm" })`

4. **Verification gates** - Each implementation phase requires manual approval before proceeding

### Workflow Example

1. **Research**: `/research authentication flow`
   - Agent explores codebase using `@explore`
   - Documents findings in `.opencode/research/2024-01-15-authentication.md`
   - No suggestions, only facts

2. **Architect**: Review research, then `/architect add OAuth`
   - Creates detailed plan with code snippets
   - Persists to `.opencode/plans/2024-01-15-oauth.md`
   - Explicit scope boundaries ("What We're NOT Doing")

3. **Implement**: `/implement .opencode/plans/2024-01-15-oauth.md`
   - Executes one phase at a time
   - Runs verification after each phase
   - Pauses for human approval

### Optional Quality Gate: Review

Use `/review-diff` before merge to catch correctness, security, and maintainability risks.
Use `/review` for broader architectural consistency checks.
Use `/review-pr <context>` for PR-style review from supplied context and referenced files.

This does not replace the core workflow:

```
Research -> Architect -> Implement
```

It complements it with a focused read-only review pass.

## Setup

1. Copy `global_scope/` contents to `~/.config/opencode/`
2. Copy `project_scope/.opencode/` to your project root
3. Customize `AGENTS.md` with your project's conventions and skills
4. Optional: install `opencode-sync` for repeatable push/pull/status syncs (see `opencode/sync_cli/README.md`)

## References

- [YouTube Video](https://www.youtube.com/watch?v=rmvDxxNubIg) - Original talk on context engineering
- [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer) - Speaker's agent application (source of prompt patterns)
- [OpenCode Docs](https://opencode.ai/docs) - Agent framework documentation
