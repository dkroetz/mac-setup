# OpenCode Configuration

This directory is a direct mirror of the live OpenCode configuration on this machine: `~/.config/opencode` (global config, agents, commands, plugins) and `~/.agents/skills`.

## Layout

```
opencode/
├── README.md              # This file
├── AGENTS.md              # Global agent instructions (~/.config/opencode/AGENTS.md)
├── opencode.json          # Global config, providers, MCP servers, plugins
├── agents/                # Subagents (~/.config/opencode/agents)
├── commands/              # Custom slash commands (~/.config/opencode/commands)
├── plugin/                # TypeScript plugins (~/.config/opencode/plugin)
├── plugins/               # Installed plugin files (~/.config/opencode/plugins)
├── skills/                # Curated skills (subset of ~/.agents/skills)
└── docs/                  # Reference docs
    ├── automation-setup.md
    └── prompt_best_practices.md
```

## Sync Model

The repo mirrors the live config. There is no sync tooling — updates flow one of two ways:

- **Local change → repo**: after editing `~/.config/opencode`, copy the changed paths into this directory and commit.
- **Fresh machine**: copy the contents of this directory to `~/.config/opencode` and `~/.agents/skills` (skills only), then restart OpenCode.

## Subagents

| Subagent | Purpose |
|----------|---------|
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
| `/wiki-capture` | Capture a note into the vault |
| `/wiki-compile` | Compile source material into durable wiki pages |
| `/wiki-extract` | Promote daily-note items into durable pages |
| `/wiki-query` | Query the private vault via `@wiki` |
| `/wiki-registry` | Maintain the project registry |

## Skills

Curated skills in `skills/` (a subset of the live `~/.agents/skills`):

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

- **futilify-gw** — Futilify Gateway provider plugin
- **browserless-url-fix** — builds `BROWSERLESS_URL` from `BROWSERLESS_BASE_URL` + `BROWSERLESS_TOKEN` env vars
- **model-prompt/** — model-specific prompt injection plugin
- **plugins/herdr-agent-state.js** — herdr agent-state integration (installed by herdr)

## Making Changes

1. Edit files under this directory (or directly in `~/.config/opencode`).
2. Copy changes to the other side and restart OpenCode so agent/command/plugin changes reload.
3. Commit the repo changes.

## Notes

- `opencode.json` is the live global config; adjust providers, models, and permissions to taste.
- `skills/` maps to `~/.agents/skills/`, not `~/.config/opencode/skills/`.
- The setup is intentionally versioned here so any machine can reproduce the same config.
