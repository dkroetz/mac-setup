# Issue Refinement Automation Setup

This guide documents the Phase 1 issue-refinement automation in:

- `.github/workflows/issue-refinement.yml`
- `.github/scripts/issue_refinement.py` (Python helper used by the workflow)
- `.github/scripts/project_status.py` (Python helper that updates GitHub Project v2 status)
- `.github/scripts/sync_opencode_context.py` (copies repo agents/skills/commands into `.opencode/` for CI)
- `agents/ci-auto.md` (CI agent with non-interactive permissions)

## What this automation does

For newly opened issues:

1. OpenCode produces a structured JSON payload for clarification questions.
2. A human replies in comments.
3. OpenCode produces a structured JSON payload for the concise summary.
4. Python workflow steps post the issue comment and update project status:
   - `Waiting for Human` if blocking questions remain
   - `Ready` if blocking questions are resolved

Manual retrigger is supported via issue comment:

- `/refine`
- `/opencode refine`

## Trigger behavior

Workflow events:

- `issues`: `opened`
- `issue_comment`: `created`

Routing rules:

- Refinement runs on issue open and on manual `/refine` commands.
- Manual refinement runs on `/refine` or `/opencode refine`.
- Summary runs on non-bot comments, but only proceeds when Project `Status` is `Waiting for Human`.
- Routing is enforced with job-level `if` expressions to avoid unnecessary runner minutes.
- OpenCode returns JSON only: `comment_body` plus `status_name`.
- Python workflow steps parse that JSON, create the issue comment, and update project status.

## Required secrets

Add these in **Repo Settings → Secrets and variables → Actions → Secrets**:

- `AUTOMATION_USER_PAT`
- `OPENCODE_API_KEY`
- `KILO_API_KEY`
- `OPENROUTER_API_KEY`

## Required variables

Add these in **Repo Settings → Secrets and variables → Actions → Variables**:

- `AUTOMATION_BOT_LOGIN` (automation GitHub username)
- `AUTOMATION_BOT_EMAIL` (optional; defaults to `<login>@users.noreply.github.com`)

Required project variables:

- `AUTOMATION_PROJECT_NUMBER`

Optional variables (defaults exist unless noted):

- `AUTOMATION_PROJECT_OWNER` (default: current repository owner)
- `AUTOMATION_PROJECT_STATUS_FIELD` (default: `Status`)
- `AUTOMATION_PROJECT_WAITING_OPTION` (default: `Waiting for Human`)
- `AUTOMATION_PROJECT_READY_OPTION` (default: `Ready`)
- `OPENCODE_MODEL` (default: `openrouter/openai/gpt-5-mini`)
- `OPENCODE_AGENT` (default: `ci-auto`)

`ci-auto` is CI-focused and allows non-interactive execution so project status
updates can run without permission prompts. CI injects its own OpenCode config so
local developer settings remain unchanged.

## PAT scope guidance

`AUTOMATION_USER_PAT` should have minimum permissions needed for this flow:

- Issues: read/write
- Projects: read/write
- Repository metadata: read

If you use a fine-grained PAT, ensure repo and org project access include this target repository/project.

## Labels used by workflow

No issue labels are required for lifecycle.

Lifecycle state is managed in GitHub Project `Status`.

## Project setup expectations

The workflow assumes a Project v2 with a single-select status field containing at least:

- Field name: `Status` (or your configured field variable)
- Option name: `Waiting for Human` (or your configured waiting option variable)
- Option name: `Ready` (or your configured option variable)

If names differ, set `AUTOMATION_PROJECT_STATUS_FIELD`, `AUTOMATION_PROJECT_WAITING_OPTION`, and `AUTOMATION_PROJECT_READY_OPTION`.

The project status helper reads these runtime env vars:

- `PROJECT_OWNER`
- `PROJECT_NUMBER`
- `PROJECT_STATUS_FIELD`

The workflow maps them from the `AUTOMATION_PROJECT_*` variables above.

## Test checklist

1. Create a new issue.
2. Confirm bot posts refinement questions.
3. Confirm project status is set to `Waiting for Human`.
4. Reply with a non-bot user comment.
5. Confirm bot posts summary comment.
6. If summary has blocking questions, confirm status remains `Waiting for Human`.
7. After answering blocking questions, confirm status moves to `Ready`.

Manual test:

1. Comment `/refine` on an existing issue.
2. Confirm refinement questions are posted again.

Failure test:

1. Temporarily break a required variable (e.g. project number).
2. Confirm one-sentence failure comment appears.

## Notes

- Workflow timeout is set to **3 minutes**.
- Runner minutes are billed to the repository owner account, not PAT user identity.
- Workflow configures local git author to the automation user for any branch/commit operations OpenCode may perform.
- CI writes a temporary OpenCode override config outside the repo and passes it through environment variables so tracked files stay clean.
- CI installs the `opencode-ai` CLI and captures `opencode run --format json` output for parsing.
