# Agent Instructions

Project-local source of truth for verification commands and domain-skill policy.

## Virtual Environment

```bash
source .venv/bin/activate
```

## Verification Commands

```bash
pdm run ruff check . && pdm run mypy
pdm run pytest  # if tests exist for touched area
```

## Domain Skills Available

- `python-pdm` - load for Python/PDM/lint/type/test tasks
- `postgres` - project-local override (takes precedence when present) for futilify DB paths/migrations; global fallback remains generic
- `prefect-flows` - load for flow/deployment/worker-pool tasks

## Skill Loading Policy

- Start with 0 skills
- After quick task+repo scan, load 1-2 relevant skills
- Load a 3rd skill only if blocked

## Rule Admission Policy

- Add rules only for repeated, observed failures
- Prefer checkable, positive directives
- Prune stale rules periodically

## AGENTS Maintenance Constraints

- Keep this file as a thin policy index
- Soft budget: <= 60 lines (excluding fenced code blocks)
- Put detailed domain guidance in skills, not here
- Add rules only for repeated, observed failures

## Success Criteria Format

#### Automated Verification:

- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

## Workflow

Research -> Architect -> Implement
