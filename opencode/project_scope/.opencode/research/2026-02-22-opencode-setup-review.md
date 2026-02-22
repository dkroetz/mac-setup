# Research: OpenCode Setup Review

**Date**: 2026-02-22

## Summary

Your setup is well-aligned with your lean, functional philosophy. The 3-agent workflow (Research → Architect → Implement) with domain skills and slash commands is solid. The earlier hardening plan was partially implemented — `steps` caps, `task` scoping, and `external_directory` permissions were done, but `tools: { edit: true }` was missing for research/architect to actually write files.

---

## Current State vs. Earlier Hardening Plan

| Item | Status |
|------|--------|
| Remove `@general` delegation | ✅ Already removed from commands |
| Add `steps` caps | ✅ Done |
| Add `task` permission scoping | ✅ Done |
| Add `external_directory` permissions | ✅ Done |
| Add `codesearch` to docs subagent | ✅ Done |
| Add `tools: { edit: true }` | ✅ Fixed in this session |
| Split global vs project-local skills | N/A — keeping project-specific |

---

## Pain Points Fixed

### P0: Research/Architect Couldn't Write Files

**Root cause**: `permission` controls approval flow, but `tools` controls tool availability. Agents had path-scoped `edit` permissions but the `edit` tool wasn't enabled.

**Fix**: Added `tools: { edit: true }` to both agents.

---

## Quick Wins Applied

| Win | Status |
|-----|--------|
| Remove redundant `write: allow` in implement.md | ✅ Done |
| Add output size guidance to all agents | ✅ Done |
| Add destructive operation warning | ✅ Done |

---

## Prompt Improvements Applied

All three primary agents now have:

```markdown
## Output Guidelines

- Be concise: prefer bullet points over paragraphs
- Include only relevant code snippets (10-30 lines max)
- Skip boilerplate explanations of standard patterns
```

Implement agent now has destructive operation warning:

```markdown
- Do NOT run destructive bash commands (`rm -rf`, `DROP TABLE`, `truncate`, etc.) without explicit confirmation
```

---

## Architecture Notes

1. **Nested `.opencode/` in global config** — Intentional per user confirmation
2. **Skills location** — `postgres` and `prefect-flows` are project-specific (futilify only)
3. **Agent naming** — Correctly matched in `opencode.jsonc`

---

## Files Modified This Session

| File | Change |
|------|--------|
| `~/.config/opencode/agents/implement.md` | Removed `write: allow`, added output guidelines, added destructive warning |
| `~/.config/opencode/agents/research.md` | Added `tools: { edit: true }`, added output guidelines |
| `~/.config/opencode/agents/architect.md` | Added `tools: { edit: true }`, added output guidelines |
