---
description: Create a well-structured commit
subtask: false
model: github-copilot/gpt-5-mini
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
Conventional Commits and common Git commit-message best practices.

Before writing the message, quickly sanity-check that the staged diff looks
cohesive enough for a single commit.

Then run one of these:

- Subject only: `git commit -m "<type(scope): subject>"`
- Subject + body: `git commit -m "<type(scope): subject>" -m "<body>"`
