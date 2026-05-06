---
description: Draft a lean Jira ticket or user story
agent: scout
---

First, read and apply the `ticket-writer` skill.

Then draft a concise software-development ticket from the user's input.

Rules:
1. Prefer a lean draft unless the user explicitly asks for more detail.
2. Accept either structured options or free-form text.
3. If critical information is missing, ask at most 2 short clarifying questions.
4. Otherwise, produce a best-effort draft immediately.
5. Do not add implementation details unless explicitly requested.
6. Keep acceptance criteria to at most 3 by default.
7. Return only the final ticket unless clarification is required.

User input:

$ARGUMENTS
