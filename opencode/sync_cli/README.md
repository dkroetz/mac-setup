# opencode-sync

Small CLI for syncing OpenCode runtime data between this repository, `~/.config/opencode`, and `~/.agents`.

## Setup (development)

```bash
pdm use -f 3.13
pdm config python.use_venv true
pdm install
```

## Global install

```bash
uv tool install ~/Repos/mac-setup/opencode/sync_cli
```

## Usage

```bash
opencode-sync status
opencode-sync push --dry-run
opencode-sync push
opencode-sync pull --dry-run
opencode-sync pull
```

Outside the repo, the CLI falls back to this default global scope path:

```text
~/Repos/mac-setup/opencode/global_scope
```

You can override it with either the repository root or the `global_scope` path:

```bash
opencode-sync status --repo-scope ~/Repos/mac-setup/opencode
opencode-sync status --repo-scope ~/Repos/mac-setup/opencode/global_scope
```

## Sync manifest

The CLI syncs these paths as one explicit manifest:

| Home path | Repo path |
| --- | --- |
| `~/.config/opencode/plugins` | `global_scope/plugins` |
| `~/.config/opencode/agents` | `global_scope/agents` |
| `~/.config/opencode/commands` | `global_scope/commands` |
| `~/.config/opencode/skills` | `global_scope/skills` |
| `~/.config/opencode/opencode.jsonc` | `global_scope/opencode.jsonc` |
| `~/.config/opencode/AGENTS.md` | `global_scope/AGENTS.md` |
| `~/.agents/skills` | `global_scope/.agents/skills` |

Every synced repo path must already exist under `global_scope`, so pull operations cannot recreate stray top-level folders outside the curated mirror.

## Optional destructive mirror

```bash
opencode-sync push --delete
```

`--delete` only applies to directory entries in the manifest.
