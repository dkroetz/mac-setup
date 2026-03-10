# Global Preferences

Preferences that apply across all projects.

## Navigation

- Project intelligence: `.agents/context/project-intelligence.md`
- Active plans: `.agents/context/plans/active/`
- Completed plans: `.agents/context/plans/completed/`
- Decisions: `.agents/context/decisions/`
- Wisdom: `.agents/context/wisdom/`

## Context Strategy

- Keep this file lean and pointer-based.
- Put stable project facts in `.agents/context/project-intelligence.md`.
- Put repeatable procedures in skills and commands, not in this file.
- Prefer loading a few focused artifacts over one large instruction block.

## Tooling

- Python: Use `pdm` for dependency management
- Type checking: Always run `mypy --strict` after changes
- Linting: Use `ruff check && ruff format`
- Testing: Run `pytest -x --tb=short` for validation

## Docs Lookup

- Context7 MCP is enabled by default for documentation lookups.
- Use Context7 during planning and implementation when external API/library docs are needed.
- If Context7 is unavailable, fall back to `webfetch` against official documentation pages.

## Git

- Commit format: Conventional commits (`type(scope): description`)
- Types: feat, fix, refactor, docs, test, chore, ci

## Code Style

- No unnecessary comments unless explicitly requested
- Prefer specific exceptions over bare `except:`
- Validate at boundaries (function entry, API endpoints)

If you encounter something in any project that surprises you or seems inconsistent, note it in that project's AGENTS.md Gotchas section.
