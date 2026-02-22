# Agent Instructions

## Virtual Environment

```bash
source .venv/bin/activate
```

## Verification Commands

After making changes, run:

```bash
pdm run ruff check . && pdm run ruff format . && pdm run mypy
```

If tests exist for the area being modified:

```bash
pdm run pytest
```

## Docker

After editing any Dockerfile:

```bash
docker build -t futilify:local -f <dockerfile-path> .
```

## Package Structure

```
src/futilify/
├── common/           Shared library
│   ├── config.py     Pydantic settings
│   ├── db.py         SQLAlchemy engine/session
│   ├── models/       SQLAlchemy models (Base class)
│   └── secrets.py    Secret resolution
└── flows/            Prefect flows
```

## Conventions

- Python 3.13, line length 120, strict mypy
- `src/` layout, `pdm run` for all commands
- No comments unless explicitly requested

## Domain Skills Available

Load these via `skill({ name: "<skill-name>" })`:

- `python-pdm` — Python/PDM/Ruff/MyPy conventions and commands
- `postgres` — SQLAlchemy models, Alembic migrations, DB connection
- `prefect-flows` — Flow patterns, deployments, worker pools

## Success Criteria Format

```markdown
#### Automated Verification:

- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**
```

## Workflow

Research → Architect → Implement (see global agent definitions)
