---
description: Create a well-structured commit
subtask: true
---

First check staged changes:
!`git diff --cached --stat`

If there are no staged changes, check for unstaged changes with `git status --short`.
If unstaged files exist, always ask for user approval before staging all of
them and continuing with the commit.
Only stage all unstaged files if the user approves.
If there are still no staged changes after that, stop and explain that there is
nothing to commit.

Once there are staged changes, review them here:
!`git diff --cached`

Review the staged changes and write a commit message that follows both
Conventional Commits and common Git commit-message best practices:

- Use `type(scope): description` with a concise subject line.
- Keep the subject focused on the user-visible intent of the commit, not a
  file list.
- Write the subject in imperative mood (`add`, `fix`, `refactor`), not past
  tense.
- Keep the subject short; target 50 characters or fewer when practical.
- Do not end the subject line with a period.
- If the change is non-trivial, add a blank line followed by a body.
- In the body, explain why the change exists, the problem it solves, and any
  important side effects or tradeoffs.
- Wrap body lines at about 72 characters.
- Prefer one logical change per commit message; if the staged diff contains
  unrelated work, say so instead of forcing a weak summary.
- If relevant, include footers for breaking changes or issue references.

Before writing the message, quickly sanity-check that the staged diff looks
cohesive enough for a single commit.

Then run one of these:
- Subject only: `git commit -m "<type(scope): subject>"`
- Subject + body: `git commit -m "<type(scope): subject>" -m "<body>"`
