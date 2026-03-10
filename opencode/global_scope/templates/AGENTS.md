# [Project Name]

[2-3 sentence description of what this project does and its purpose]

## Navigation

- Architecture overview: `.agents/context/architecture.md`
- Project intelligence: `.agents/context/project-intelligence.md`
- Active plans: `.agents/context/plans/active/`
- Decision records: `.agents/context/decisions/`
- Accumulated wisdom: `.agents/context/wisdom/`

## Context Strategy

- Keep this file lean and pointer-based.
- Put stable project facts in `.agents/context/project-intelligence.md`.
- Put repeatable procedures in skills and commands, not in this file.
- Prefer loading a few focused artifacts over one large instruction block.

## Key Entry Points

- Configuration: `pyproject.toml` (or package.json, Cargo.toml, etc.)
- Main entrypoint: `src/[package]/__main__.py` (adjust for your stack)
- Database schema: `src/[package]/models/` (if applicable)
- API routes: `src/[package]/routes/` (if applicable)

## Tooling

- Package manager: pdm (or npm, cargo, etc.)
- Type checker: mypy --strict (or tsc, etc.)
- Linter: ruff check && ruff format (or eslint, clippy, etc.)
- Tests: pytest -x --tb=short (or npm test, etc.)
- Pre-commit: run `pre-commit run --all-files` before committing

## Gotchas

<!-- Populate this section ONLY when you discover persistent agent confusion.
     Follow Theo's approach: if the agent keeps getting something wrong and
     you can't fix it in the codebase, add it here. -->

If you encounter something in this project that surprises you or seems
inconsistent, note it here so future sessions can avoid the same confusion.
