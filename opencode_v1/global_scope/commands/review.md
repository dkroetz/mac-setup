---
description: Review recent changes for quality
agent: architect
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
- Performance concerns
- Style consistency with existing code

Provide a verdict: PASS, NEEDS_FIX (list specific issues with severity), or REJECT (list blockers).
