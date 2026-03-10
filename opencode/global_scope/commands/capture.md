---
description: Capture learnings from a completed task
agent: scout
subtask: true
---

Review the recent work in this session and capture learnings.

!`git log --oneline -10`

For each category, add entries to the appropriate file (create if missing):

Memory boundaries:
- Put stable project facts in `.opencode/context/project-intelligence.md` only if they will matter across many future tasks.
- Put reusable lessons in `wisdom/`.
- Put task-by-task execution details in plans, not in `wisdom/`.
- Put architecture-level choices in `.opencode/context/decisions/` when the rationale should be preserved.

**.opencode/context/wisdom/patterns.md** — Useful patterns discovered:
- Code patterns that worked well
- Approaches that proved effective

**.opencode/context/wisdom/mistakes.md** — Mistakes to avoid:
- What went wrong and how it was fixed
- Anti-patterns encountered

**.opencode/context/wisdom/decisions.md** — Key decisions:
- Trade-offs considered
- Why a particular approach was chosen

Only add genuinely new insights. Do not duplicate existing entries.

$ARGUMENTS
