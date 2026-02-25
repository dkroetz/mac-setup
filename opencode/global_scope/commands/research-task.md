---
description: Run research in isolated child task
agent: research
subtask: true
---

Research the following topic:

$ARGUMENTS

## Input Contract
- Provide a concrete research topic in `$ARGUMENTS`.
- Include scope boundaries when needed (for example: component, timeframe, exclusions).

## Artifact Handoff
- When research is persisted, return the artifact path and include: `/architect <artifact-path>`

## Execution Mode
- Forced isolated child task
- Use `/research` for same-session execution
