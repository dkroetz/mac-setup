---
description: Execute a development plan with tiered validation
agent: engineer
---

Resolve the plan input, then implement it step by step.

Plan path resolution rules:
- If the argument is an explicit path, use it as-is.
- If the argument is a bare filename without extension, resolve to `.opencode/context/plans/active/<name>.md`.
- If the argument is a bare filename ending in `.md`, resolve to `.opencode/context/plans/active/<name>.md`.
- Never append `.md` twice.
- Never duplicate path segments.

Use this command when:
- A plan already exists in `.opencode/context/plans/active/`
- You want stepwise implementation with minimal interruption and final strict validation

Do not use this command when:
- You still need to create the plan (use `/plan`)
- The request is ad-hoc exploration or context curation

Tiered validation policy (for `/implement` only):
1. During file edits: do not run full validation after every write.
2. After each completed implementation step: run targeted checks only when obvious and cheap.
3. Before completion: run full required validation commands.

Required final validation commands:
- `ruff check && ruff format`
- `mypy --strict`
- `pytest -x --tb=short`

Completion gate:
- Do not finish `/implement` until all required final validation commands are green.
- If validation fails, fix issues and rerun validation.
- Repeat until green, or report a concrete hard blocker that cannot be resolved automatically.

After all steps are complete:
1. Run full validation suite
2. Move the plan to `.opencode/context/plans/completed/`
3. Summarize what was done

Plan: $ARGUMENTS
