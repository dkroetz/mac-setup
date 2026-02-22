---
name: python-pdm
description: Python 3.13 project with PDM, Ruff, MyPy. Use for Python conventions, dependency management, and linting.
---

# Python Project (PDM)

## Environment

Always activate venv first:
```bash
source .venv/bin/activate
```

## Commands

| Task | Command |
|------|---------|
| Install deps | `pdm install` |
| Add dependency | `pdm add <package>` |
| Add dev dependency | `pdm add -dG dev <package>` |
| Lint | `pdm run ruff check .` |
| Format | `pdm run ruff format .` |
| Type check | `pdm run mypy` |
| Test | `pdm run pytest` |
| All checks | `make check` |

## Conventions

- Python 3.13
- Line length 120
- Strict mypy mode
- src/ layout
- No comments unless explicitly requested

## After Editing

Always run:
```bash
pdm run ruff check . && pdm run ruff format . && pdm run mypy
```

## Important Files

- `pyproject.toml` - Project config
- `Makefile` - Common commands
- `.env.example` - Environment template
