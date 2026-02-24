---
description: Review code changes or codebase scope
agent: review
---
Review target:
$ARGUMENTS

If no target is provided:
1. Detect unstaged changes with `git diff`
2. Detect staged changes with `git diff --cached`
3. If no diff exists in either scope, perform a scoped full-codebase review

Use severity labels:
- Critical (block merge)
- High (fix before merge)
- Medium (should fix)
- Low/Nit (optional)

Include file:line references and concrete fixes.
