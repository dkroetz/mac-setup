---
description: Start research phase on a topic
agent: research
subtask: true
---

Research the following topic:

$ARGUMENTS

## Instructions

1. Use `@explore` subagent to investigate the codebase
2. Load relevant domain skills via `skill()` tool
3. Document findings with file:line references
4. Do NOT suggest improvements - only document what exists
5. Present findings in conversation first
6. Ask user before persisting to `.opencode/research/YYYY-MM-DD-<topic-slug>.md`
7. On confirmation, write the file directly
8. After writing, return the exact artifact path under an `Artifacts` block
9. Include a copy-ready next step command: `/architect <artifact-path>`
