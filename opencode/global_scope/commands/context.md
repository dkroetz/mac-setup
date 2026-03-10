---
description: Manage and harvest project context files
agent: scout
---

Manage `.agents/context/` with a focus on harvesting external notes into stable project intelligence.

Use this command when:
- You want to harvest or validate file-based context artifacts
- You need context inventory status (`map`) or structural checks (`validate`)

Do not use this command when:
- You want an interactive Q&A intake from a human (use `/add-context`)
- You need implementation planning or execution (`/plan`, `/implement`)

Command:
- `/context $ARGUMENTS`

Supported modes:
- `harvest` (primary)
- `map`
- `validate`

If no mode is provided, show concise help and suggest:
- `/context harvest`
- `/context map`
- `/context validate`

## harvest

Goal:
- Convert temporary/external context into durable, concise project context.
- Do not re-harvest curated context from `.agents/context/wisdom/` or `.agents/context/decisions/`.

Default inputs to scan:
- `.tmp/*.md`
- `.tmp/context-*.md`
- `.tmp/*-context.md`
- Optional extra path from args (example: `/context harvest docs/notes/auth.md`)

Notes:
- `.tmp/` is the intended intake area for raw notes.
- `wisdom/` and `decisions/` are durable outputs and should be mapped/validated, not harvested back into `project-intelligence.md` by default.
- `project-intelligence.md` should hold stable project facts and canonical patterns, not transient task history.

Harvest workflow:
1. Ensure `.agents/context/` exists (create if missing).
2. Discover candidate source files from defaults plus optional argument path.
3. If none found, report and stop with a suggestion to run `/add-context`.
4. Extract only durable signals:
    - stack/tooling constraints
    - canonical API/service patterns
    - canonical component/module patterns
    - naming conventions
    - quality and security rules
    - stable operating model details that will matter across future tasks
5. Build a merge preview for `.agents/context/project-intelligence.md`:
    - keep existing content unless conflicting
    - prefer explicit examples over abstract statements
    - deduplicate repeated points
    - exclude temporary plans, one-off incidents, and task-local notes
6. Ask once for confirmation before writing.
7. Write/update `.agents/context/project-intelligence.md`.
8. Move processed source files to `.tmp/harvested/` (preserve filenames) instead of deleting.
9. If project `AGENTS.md` exists and lacks a pointer, add:
   - `Project intelligence: .agents/context/project-intelligence.md`
   under Navigation.

Memory contract:
- `AGENTS.md` = short navigation and global preferences
- `project-intelligence.md` = durable project facts and canonical patterns
- `plans/` = in-flight and historical execution artifacts
- `wisdom/` = reusable lessons and non-obvious guidance
- `decisions/` = explicit architecture decisions and rationale

Output requirements:
- List source files used.
- Show what sections were added/updated.
- Show where files were archived.
- Suggest one verification prompt to test context usage.

## map

Print a compact map of known context files if they exist:
- `.agents/context/architecture.md`
- `.agents/context/project-intelligence.md`
- `.agents/context/wisdom/*.md`
- `.agents/context/decisions/*.md`
- `.agents/context/plans/active/`
- `.agents/context/plans/completed/`

For each path, report: `PRESENT` or `MISSING`.

## validate

Run a lightweight validation pass:
1. Confirm key files are present and readable.
2. Check `project-intelligence.md` is concise (target <=180 lines).
3. Check `AGENTS.md` contains a pointer to architecture and project intelligence.
4. Report status per check: `PASS`, `WARN`, or `FAIL` with one-line fix.

Keep responses short and actionable.
