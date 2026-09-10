# pi

pi is the terminal coding agent installed on this machine (`@earendil-works/pi-coding-agent`, v0.83.0). This directory version the portable config from `~/.pi/agent/`.

## Layout

```
pi/
├── README.md              # This file
├── settings.json          # Theme, default provider/model, packages (~/.pi/agent/settings.json)
├── mcp.json               # MCP servers (~/.pi/agent/mcp.json)
└── extensions/            # pi extensions (~/.pi/agent/extensions)
    ├── opencode-leader.ts        # OpenCode-style leader-key bindings (user-written)
    └── herdr-agent-state.ts      # herdr integration (managed by herdr, overwritten on update)
```

## Sync Model

Same as `opencode/`: this is a direct mirror of the live config. Copy changes from `~/.pi/agent/` into this directory and commit.

## Intentionally excluded

These live under `~/.pi/agent/` but are machine/runtime state and not versioned:

- `auth.json` — credentials
- `models.json`, `models-store.json`, `models.json.bak`, `cursor-sdk-model-list.json` — model caches
- `mcp-cache.json`, `mcp-npx-cache.json` — runtime caches
- `sessions/` — session history
- `npm/`, `bin/` — installed packages / binaries
- `cursor-sdk-context-windows.json` — runtime state
- `skills/` — symlinks to `~/.agents/skills` (already mirrored under `opencode/skills/`)
