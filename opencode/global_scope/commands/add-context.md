---
description: Harvest project context with a 6-question intake
agent: scout
---

Create or update project context from human input using a guided 6-question flow.

Use this command when:
- Context should be created/updated from live human answers
- No high-quality file-based source notes exist yet

Do not use this command when:
- Context should be harvested from existing notes/files (use `/context harvest`)
- You only need context validation or inventory (`/context validate`, `/context map`)

Goal:
- Capture stable project patterns in `.opencode/context/project-intelligence.md`
- Keep the file concise and scannable (target: <=180 lines)
- Preserve concrete code patterns from user examples
- Keep task-local history, one-off incidents, and implementation logs out of `project-intelligence.md`

Arguments:
- `$ARGUMENTS` may include `--update` or `--replace`

Workflow:

1. Check whether `.opencode/context/project-intelligence.md` exists.
2. If it exists and `--replace` is not provided:
   - Summarize current sections briefly.
   - Ask the user whether to: update specific sections, replace all, or cancel.
3. Ask these 6 questions (interactive):
   1) What is your current tech stack?
   2) Share one representative API/service handler example.
   3) Share one representative component/module example.
   4) What naming conventions do you follow (files, types/classes, functions, DB)?
   5) What code-quality standards are mandatory (typing, lint, test, architecture)?
   6) What security requirements are non-negotiable?
4. Build a preview of `project-intelligence.md` with these sections:
   - Project Snapshot
   - Primary Stack
   - Canonical Patterns (API/service + component/module)
   - Naming Conventions
   - Quality Standards
   - Security Requirements
   - Context Harvest Metadata (date, mode: create/update/replace)
   - Codebase References
5. Ask for one final confirmation before writing.
6. Write the file and ensure `.opencode/context/` exists.
7. If project `AGENTS.md` exists and does not already link this file, add:
   - `Project intelligence: .opencode/context/project-intelligence.md`
   under the Navigation section.

Formatting rules for the file:
- Prefer short bullets and compact examples.
- Keep examples real (from user input) and avoid generic boilerplate.
- If user pasted long snippets, trim to the smallest representative slice.
- Do not duplicate content already present in `.opencode/context/architecture.md`.
- Do not move reusable lessons into this file if they belong in `wisdom/` instead.

When done:
- Report what changed.
- Suggest running one small prompt to verify the agent uses the harvested context.
