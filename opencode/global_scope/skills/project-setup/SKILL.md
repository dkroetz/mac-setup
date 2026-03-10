---
name: project-setup
description: Scaffold or standardize Python projects to pdm, src-layout, and CI conventions
---

## Trigger Boundaries

Use this skill when:
- Creating a new Python project from scratch
- Standardizing an existing Python project to `pdm`, `src/`, and CI conventions

Do not use this skill when:
- Making incremental feature/bugfix changes in an existing project
- The stack is not Python or does not use `pdm`

Token discipline:
- Prefer concise scaffold checklists over long generated templates.
- Reference file paths instead of inlining large boilerplate files.

## New Project Scaffold

1. `pdm init` — create project
2. Use src layout: `src/<package_name>/`
3. Add to pyproject.toml:
   - `[tool.ruff]` section with target-version = "py312"
   - `[tool.mypy]` section with strict = true
   - `[tool.pytest.ini_options]` with testpaths = ["tests"]

## Directory Structure

```
src/<package>/
├── __init__.py
├── __main__.py           # CLI entrypoint (if applicable)
├── config.py             # Settings/configuration
├── models/               # Data models (Pydantic/dataclasses)
├── services/             # Business logic
└── adapters/             # External integrations

tests/
├── conftest.py           # Shared fixtures
├── test_<module>.py      # Mirror src/ structure
```

## Dependency Management

- `pdm add <package>` — add runtime dependency
- `pdm add --dev <package>` — add dev dependency
- `pdm add --group dev <package>` — alternative syntax for dev deps
- Pin major versions, allow minor/patch: `package>=1.2,<2`
- Common dev deps: pytest, mypy, ruff, pre-commit
