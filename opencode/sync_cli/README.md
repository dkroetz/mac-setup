# opencode-sync

Small CLI for syncing OpenCode global scope data between this repository and `~/.config/opencode`.

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

Outside the repo, the CLI falls back to this default scope path:

```text
~/Repos/mac-setup/opencode/global_scope
```

You can still override it explicitly when needed:

```bash
opencode-sync status --repo-scope ~/Repos/mac-setup/opencode/global_scope
```

## Optional destructive mirror

```bash
opencode-sync push --delete
```
