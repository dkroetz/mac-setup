---
description: Create implementation plan for a feature
agent: architect
subtask: true
---

Create a detailed implementation plan for:

$ARGUMENTS

## Instructions

1. Check for relevant research in `.opencode/research/`
2. Load domain skills for accurate code snippets
3. Include:
   - Overview
   - What We're NOT Doing
   - Phases with code snippets
   - Success criteria (automated + manual)
4. Present the complete plan in conversation first
5. Ask user before persisting to `.opencode/plans/YYYY-MM-DD-<topic-slug>.md`
6. On confirmation, write the file directly
7. After writing, return the exact artifact path under an `Artifacts` block
8. Include a copy-ready next step command: `/implement <artifact-path>`
