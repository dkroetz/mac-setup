# OpenCode Agent Harness

This directory holds the versioned OpenCode configuration for this machine: agents, commands, skills, plugins, global config, and the sync tooling that keeps `~/.config/opencode` in sync with the repo.

## Layout

```
opencode/
├── README.md              # This file
├── global_scope/          # Canonical copy of ~/.config/opencode runtime files
│   ├── opencode.json      # Global config, permissions, MCP servers
│   ├── agents/            # Primary agents and subagents
│   ├── commands/          # Custom slash commands
│   ├── skills/            # Global skills (synced to ~/.agents/skills)
│   ├── plugins/           # TypeScript plugins
│   └── MAINTENANCE.md     # Harness maintenance guide
├── sync_cli/              # opencode-sync CLI for repo ↔ home sync
│   └── README.md
└── docs/                  # Design docs and refinement reports
    ├── automation-setup.md
    ├── prompt_best_practices.md
    ├── RESEARCH-AGENT-PATTERNS.md
    └── WIKI_REFINEMENT.md
```

`global_scope/` is the source of truth for what lives under `~/.config/opencode/`. The `opencode-sync` tool copies paths bidirectionally with an explicit manifest that also covers `~/.agents/skills` when that directory is populated.

## Quick Start

### Install the sync CLI

```bash
uv tool install ~/Repos/mac-setup/opencode/sync_cli
```

### Sync from repo to home

```bash
opencode-sync status
opencode-sync push --dry-run
opencode-sync push
```

### Sync from home back to repo after local tweaks

```bash
opencode-sync pull --dry-run
opencode-sync pull
```

See [`sync_cli/README.md`](sync_cli/README.md) for the full sync manifest and options.

## Primary Agents

| Agent | Purpose |
|-------|---------|
| **scout** | Default ask-oriented agent for exploration, Q&A, triage, and research |
| **engineer** | Primary implementation agent for multi-file changes, features, and validation |
| **librarian** | Vault-writing agent for the AI Obsidian knowledge base |
| **architect** | Architecture and design decisions |
| **auto** | Disabled autonomous placeholder for explicit experiments |
| **ci-auto** | Non-interactive CI agent for issue-refinement automation |

## Subagents

| Subagent | Purpose |
|----------|---------|
| **@planner** | Structured implementation plans |
| **@implementer** | Focused implementation steps |
| **@reviewer** | Change quality review |
| **@context-auditor** | Context coverage validation |
| **@discoverer** | Find relevant code and constraints |
| **@google** | Multi-source research coordination |
| **@wiki** | Read-only private vault lookup |
| **@research/code** | Code examples and reference implementations |
| **@research/docs** | Official documentation search |
| **@research/blogs** | Community tutorials and opinions |
| **@research/news** | Current news and announcements |
| **@research/academic** | Papers and academic sources |

## Commands

| Command | Description |
|---------|-------------|
| `/plan <task>` | Create a phased implementation plan |
| `/implement <plan>` | Execute a plan with validation gates |
| `/review` | Review unstaged changes |
| `/review-pr` | Review a pull request |
| `/commit` | Create a structured commit |
| `/architect <task>` | Architecture/design work |
| `/goal <task>` | Goal decomposition and tracking |
| `/research <topic>` | Multi-source research |
| `/wiki-capture` | Capture a note into the vault |
| `/wiki-compile` | Compile source material into durable wiki pages |
| `/wiki-extract` | Promote daily-note items into durable pages |
| `/wiki-query` | Query the private vault via `@wiki` |
| `/wiki-registry` | Maintain the project registry |

## Skills

Global skills in `global_scope/skills/`:

| Skill | Purpose |
|-------|---------|
| **agent-development** | Create, validate, and maintain OpenCode agents |
| **browser** | Browse websites, fill forms, take screenshots |
| **find-skills** | Discover and install agent skills |
| **grill-me** | Stress-test a plan or design |
| **handoff** | Create handoff documents for other agents |
| **teach** | Teach a new skill or concept |
| **write-a-skill** | Create new agent skills |
| **youtube-video-context** | Download and analyze YouTube media |

## Plugins

- **model-prompt/** — model-specific prompt injection plugin

## Documentation

- [`global_scope/MAINTENANCE.md`](global_scope/MAINTENANCE.md) — maintenance rhythm, context strategy, and permission model
- [`docs/automation-setup.md`](docs/automation-setup.md) — GitHub issue-refinement workflow setup
- [`docs/prompt_best_practices.md`](docs/prompt_best_practices.md) — prompt authoring guide
- [`docs/RESEARCH-AGENT-PATTERNS.md`](docs/RESEARCH-AGENT-PATTERNS.md) — research agent design patterns
- [`docs/WIKI_REFINEMENT.md`](docs/WIKI_REFINEMENT.md) — wiki/librarian refinement report

## Making Changes

1. Edit files under `global_scope/` (or `sync_cli/`).
2. Run `opencode-sync push` to install them locally.
3. Restart OpenCode so agent/command changes are reloaded.
4. Commit the repo changes.

## Notes

- `opencode.json` is the live global config; adjust providers, models, and permissions to taste.
- `global_scope/skills/` syncs to `~/.agents/skills/`, not `~/.config/opencode/skills/`.
- The harness is intentionally versioned here so any machine can reproduce the same setup.
