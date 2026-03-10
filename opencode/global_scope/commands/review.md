---
description: Review recent changes for quality
agent: scout
subtask: true
---

Review the following changes:

!`git diff --stat`

!`git diff`

Check for:
- Correctness and edge cases
- Type safety
- Test coverage (are new paths tested?)
- Security issues
- Style consistency with existing code

Provide a verdict: PASS, NEEDS_FIX (list specific issues), or MAJOR_ISSUES (list blockers).
