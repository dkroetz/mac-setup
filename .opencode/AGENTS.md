# Agent Instructions

## Scope
macOS setup repo + OpenCode config (`opencode/`). Keep AGENTS as a thin policy index.

## Ownership
- This global file is a thin policy index for universal safety/workflow defaults.
- Project-local verification and project-local skills live in the project AGENTS (`opencode/project_scope/.opencode/AGENTS.md`).

## Safety
- No `sudo` unless explicitly requested
- No edits outside this repo
- Keep diffs narrow; avoid bulk rewrites

## Verification
Run only checks relevant to touched files:
- `bash -n <file>` (shell)
- `fish --no-execute <file>` (fish)
- `python3 -m json.tool <file> >/dev/null` (json)
- `git diff -- <changed-path>` (always)

## Skills
Load conditionally:
- Start with 0 skills
- Load 1-2 relevant skills
- Load a 3rd only if blocked

Available:
- `python-pdm` for Python/PDM work
- `postgres` for SQLAlchemy/Alembic work

## Rule Admission
Add rules only for repeated observed failures. Keep directives checkable.

## Workflow
Research -> Architect -> Implement
