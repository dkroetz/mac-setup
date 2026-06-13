# OpenCode Global Harness

This directory is the canonical runtime configuration that gets synced to `~/.config/opencode/` by [`opencode-sync`](../sync_cli/README.md).

## What's here

```
global_scope/
├── opencode.jsonc     # Global config, permissions, MCP servers
├── agents/            # Primary agents and subagents
├── commands/          # Custom slash commands
├── skills/            # Global skills
├── plugins/           # TypeScript plugins
└── MAINTENANCE.md     # Maintenance guide
```

## Primary agents

- **scout** — Default ask-oriented agent for exploration, Q&A, and research
- **engineer** — Primary implementation agent for multi-file changes and validation
- **librarian** — Vault-writing agent for the AI Obsidian knowledge base
- **architect** — Architecture and design decisions
- **auto** — Disabled autonomous placeholder for explicit experiments
- **ci-auto** — Non-interactive CI agent for issue-refinement automation

## Subagents

- **@planner**, **@implementer**, **@reviewer**, **@context-auditor**, **@discoverer**
- **@google** — multi-source research coordination
- **@wiki** — read-only private vault lookup
- **@research/code**, **@research/docs**, **@research/blogs**, **@research/news**, **@research/academic**

## Commands

Development:
- `/plan`, `/implement`, `/review`, `/review-pr`, `/commit`
- `/architect`, `/goal`, `/research`

Vault:
- `/wiki-capture`, `/wiki-compile`, `/wiki-extract`, `/wiki-query`, `/wiki-registry`

## Skills

- **agent-development** — create and validate agents
- **browser** — browse websites, fill forms, take screenshots
- **find-skills** — discover and install skills
- **grill-me** — stress-test a plan
- **handoff** — create handoff documents
- **teach** — teach a skill or concept
- **write-a-skill** — create new skills
- **youtube-video-context** — download and analyze YouTube media

## Plugins

- **model-prompt/** — model-specific prompt injection plugin

## Maintenance

See [MAINTENANCE.md](MAINTENANCE.md) for the full maintenance rhythm, context strategy, permission model, and feedback hierarchy.

Quick checklist:
- Run `/audit` weekly
- Run `/capture` after complex tasks
- Review token usage, repeated mistakes, and permission boundaries monthly
