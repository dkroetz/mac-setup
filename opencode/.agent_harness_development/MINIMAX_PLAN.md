# Agent Setup Plan for futilify

## Overview

Implement a 3-step agent workflow (Research → Plan → Implement) inspired by Dex Horty's context/harness engineering approach from [HumanLayer](https://github.com/humanlayer/humanlayer).

## Target

- **Project**: `~/Projects/futilify/`
- **Files**: 12 files maximum
- **Philosophy**: Lean, dev speed focused, minimal token overhead

## Directory Structure

```
~/Projects/futilify/.opencode/
├── AGENTS.md                          # Main entry + project conventions
├── agent/
│   ├── researcher.md                 # Primary: Research agent
│   ├── planner.md                     # Primary: Plan agent  
│   └── implementer.md                # Primary: Implement agent
├── command/
│   ├── research.md                   # /research - start research phase
│   ├── plan.md                        # /plan - start plan phase
│   └── implement.md                  # /implement - start implement phase
├── subagent/
│   ├── codebase-locator.md            # Find relevant files
│   ├── codebase-analyzer.md          # Understand code patterns
│   └── web-search.md                 # Research external docs/APIs
└── skill/
    ├── prefect.md                     # Prefect domain knowledge
    └── postgres.md                    # Postgres domain knowledge
```

## Agent Specifications

| Agent | Purpose | Tools |
|-------|---------|-------|
| **Researcher** | Investigate codebase, document findings | read, grep, glob, task |
| **Planner** | Create implementation plans with phases | read, write, edit, task |
| **Implementer** | Execute plans with verification | edit, write, bash, read |

## Model Configuration

Set models per-agent in `opencode.jsonc`:

```jsonc
{
  "agent": {
    "researcher": { "model": "opencode/minimax-sonnet" },
    "planner": { "model": "opencode/minimax-sonnet" },
    "implementer": { "model": "opencode/minimax-m2.5" }
  }
}
```

## Workflow

| Command | Agent | Output |
|---------|-------|--------|
| `/research [topic]` | Researcher | `.opencode/research/YYYY-MM-DD-topic.md` |
| `/plan [research-file]` | Planner | `.opencode/plans/YYYY-MM-DD-topic.md` |
| `/implement [plan-file]` | Implementer | Executes + verifies |

## Subagents

- **codebase-locator**: Find WHERE files and components live
- **codebase-analyzer**: Understand HOW specific code works (documentary, not critical)
- **web-search**: Research external documentation and best practices

## Skills

- **prefect**: Prefect workflow engine knowledge (flows, deployments, workers)
- **postgres**: Database patterns, migrations, SQLAlchemy

## References

- HumanLayer commands: `/Users/denis/Repos/humanlayer/.claude/commands/`
- Opencode structure: `/Users/denis/Repos/opencode/.opencode/`
- Transcript: `/Users/denis/Repos/mac-setup/opencode/dev/harness_engineering_transcript.txt`
