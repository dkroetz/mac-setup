---
description: Check context files for staleness
agent: scout
subtask: true
---

Audit the project's context files for accuracy:

Recent changes:
!`git log --oneline -20`

Files to check:
1. AGENTS.md — Is the project description still accurate? Are gotchas still relevant?
2. .opencode/context/architecture.md — Does it reflect the current architecture?
3. .opencode/context/wisdom/ — Are entries still applicable?

For each file, report: CURRENT (no changes needed), STALE (specific issues), or MISSING (should exist but doesn't).
