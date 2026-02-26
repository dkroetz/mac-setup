# Harness Engineering Workflow for OpenCode

A practical OpenCode setup that applies a minimal-context, staged workflow inspired by Dex's context engineering talks and HumanLayer prompt patterns.

## Core Workflow

```
Research -> Architect -> Implement
```

| Phase | Role | Constraint |
|-------|------|------------|
| Research | Explore and document current state | No implementation suggestions |
| Architect | Produce executable phase plan | No code edits |
| Implement | Execute one phase at a time | Verify and pause between phases |

## Current Runtime Topology

### Global Scope (`~/.config/opencode/`)

```
global_scope/
├── agents/
│   ├── research.md         # Primary research agent
│   ├── architect.md        # Primary planning agent
│   ├── implement.md        # Primary implementation agent
│   ├── orchestrator.md     # Single-context stage coordinator
│   ├── review.md           # Read-only review agent
│   ├── google.md           # Web-research coordinator
│   └── research/
│       ├── docs.md         # Source-specific web research subagents
│       ├── code.md
│       ├── blogs.md
│       ├── news.md
│       └── academic.md
├── commands/
│   ├── research.md         # same-session staged command
│   ├── architect.md
│   ├── implement.md
│   ├── research-task.md    # forced subtask/isolation variants
│   ├── architect-task.md
│   ├── implement-task.md
│   ├── review.md
│   ├── review-diff.md
│   ├── review-pr.md
│   └── google.md
├── skills/
│   ├── python-pdm/
│   └── postgres/
└── opencode.jsonc
```

### Project Scope (`<repo>/.opencode/`)

```
project_scope/.opencode/
├── AGENTS.md               # Project-local verification + skill policy source of truth
├── research/               # Research artifacts
├── plans/                  # Implementation plans
├── memory/                 # Orchestrator summaries
├── verification/           # Lightweight drift checklists
└── skills/                 # Optional project-local skill overrides
```

## How to Run It

- Staged, same-session: `/research ...` -> `/architect ...` -> `/implement <plan-path>`
- Staged, isolated: `/research-task ...` -> `/architect-task ...` -> `/implement-task <plan-path>`
- Coordinated flow: use `@orchestrator` to route stages while preserving shared objective and artifact handoff

## Optional Quality Gates

- `/review-diff` for local staged/unstaged change review
- `/review` for broader scoped review
- `/review-pr <context>` for PR-style context review

Review is complementary to (not a replacement for) the core staged workflow.

## Minimal-Context Operating Principles

- Keep `AGENTS.md` thin; put detailed guidance in skills
- Load skills on demand; avoid bulk-loading policy text
- Prefer explicit artifact handoffs (`.opencode/research/...`, `.opencode/plans/...`)
- Use same-session commands by default; use `-task` variants for isolation when needed
- Treat prompt/config files as living docs and prune stale rules regularly

## Setup

1. Copy `global_scope/` contents to `~/.config/opencode/`
2. Copy `project_scope/.opencode/` into each project that should use this workflow
3. Update project `.opencode/AGENTS.md` verification commands and skill-loading policy
4. Optional: install `opencode-sync` for repeatable push/pull/status syncs (`opencode/sync_cli/README.md`)

## Supporting Workdirs

- `opencode/.agent_harness_development/` contains planning artifacts and transcript context used to evolve this setup
- `opencode/.agent_improvement/` contains behavior test fixtures, rubrics, and schemas

See each directory's local README for operational details.

## References

- [OpenCode Docs](https://opencode.ai/docs)
- [Dex Context Engineering talk](https://www.youtube.com/watch?v=rmvDxxNubIg)
- [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer)
