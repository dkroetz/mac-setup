---
name: code-quality
description: Run post-change Python validation with pdm, ruff, mypy, and pytest
---

## Trigger Boundaries

Use this skill when:
- Python source or Python-facing config changed
- A task needs post-change validation before handoff

Do not use this skill when:
- The task is read-only analysis with no code changes
- The repository does not validate Python work with `pdm`, `ruff`, `mypy`, and `pytest`

Token discipline:
- Report only failing checks and final pass status.
- Avoid pasting full successful command output unless requested.

## Quality Check Procedure

Run these in order after making changes:

1. `pdm run ruff check . --fix` — auto-fix lint issues
2. `pdm run ruff format .` — format code
3. `pdm run mypy src/ --strict` — type check
4. `pdm run pytest -x --tb=short` — run tests (stop on first failure)

## When Type Checking Fails

- Add type annotations to new functions (all parameters + return type)
- Use `from __future__ import annotations` for forward references
- Prefer `X | None` over `Optional[X]` (Python 3.10+)
- For complex types, create TypeAlias or TypedDict in a `types.py` module

## When Tests Fail

- Read the failure message before modifying code
- Check if the test itself is wrong (testing old behavior after intentional change)
- If adding new functionality, write tests BEFORE implementation when possible
- Name tests: `test_<function>_<scenario>_<expected>`
- Use fixtures for shared setup, parametrize for variant testing

## Code Patterns

- Use specific exceptions, never bare `except:`
- Log errors with context before re-raising
- Validate at boundaries (function entry, API endpoints, config loading)
- Prefer dataclasses or Pydantic models over raw dicts
