# Research: Global vs Project AGENTS Strategy

**Date**: 2026-02-23

## Summary

Current setup already aligns with minimal-context best practices: global scope defines reusable agent behavior, while project scope keeps local policy and skills. Evidence from the AGENTS.md and SkillsBench papers plus transcript/HN context supports keeping always-loaded AGENTS content very small and moving detailed guidance to conditional skills. Decision: keep a tiny universal global baseline, let project AGENTS own verification + local skill index, and remove duplicate skill-loading wording so one source of truth remains.

## Key Findings

### 1) Current structure is already close to target

- Root AGENTS explicitly states thin-policy intent and conditional skill loading.
- Project AGENTS is lean and policy-oriented.
- Global scope holds agent behavior and model wiring; project scope holds local overrides.

### 2) Research evidence supports minimal always-on AGENTS context

- AGENTS.md paper (`2602.11988`):
  - LLM-generated context files often reduce success and increase cost.
  - Developer-written files can improve outcomes in some cases but still increase cost.
  - Recommendation trend: include only minimal, high-value requirements.
- SkillsBench (`2602.12670`):
  - Curated skills can materially improve outcomes.
  - Self-generated skills are often neutral/negative.
  - Focused 2-3 skills outperform broad comprehensive skill payloads.

### 3) Duplication pattern found in current config

- Skill-loading policy appears in global primary-agent prompts and project AGENTS.
- Verification source-of-truth already routes through project AGENTS.
- Some duplicated policy text can be reduced without changing behavior.

### 4) Global vs project AGENTS strategy decision

- Do **not** create one large global AGENTS with all shared logic.
- Keep a **tiny universal global AGENTS baseline** only.
- Keep project AGENTS lean, with project-local verification commands and local skill index.
- Put reusable procedural knowledge in global skills/agents; put project-specific detail in local skills.

## Code References

- `.opencode/AGENTS.md:4`
- `.opencode/AGENTS.md:19`
- `opencode/global_scope/agents/research.md:31`
- `opencode/global_scope/agents/architect.md:29`
- `opencode/global_scope/agents/implement.md:48`
- `opencode/global_scope/agents/implement.md:71`
- `opencode/global_scope/commands/implement.md:14`
- `opencode/project_scope/.opencode/AGENTS.md:24`
- `opencode/project_scope/.opencode/AGENTS.md:36`
- `opencode/project_scope/.opencode/AGENTS.md:37`
- `opencode/project_scope/.opencode/opencode.jsonc:5`
- `opencode/project_scope/.opencode/opencode.jsonc:11`
- `opencode/global_scope/opencode.jsonc:5`
- `opencode/global_scope/opencode.jsonc:19`
- `opencode/.agent_improvement/yt_transcript.txt:457`
- `opencode/.agent_improvement/yt_transcript.txt:470`
- `opencode/.agent_improvement/yt_transcript.txt:550`
- `opencode/.agent_improvement/yt_transcript.txt:856`

## Architecture notes

- Preserve separation of concerns:
  - Global: reusable agent logic, model mapping, reusable skills.
  - Project: local policy index, repo verification contract, project skills/overrides.
- Existing local `postgres` override pattern is aligned with this split.
- Main remaining optimization axis is reducing duplicated policy text to keep context minimal.

## Open Questions

- Strict AGENTS line budget across projects: **No**.
- Tiny universal global AGENTS baseline + project AGENTS ownership of verification/local skills: **Yes**.
- Remove duplicate skill-loading wording to keep one source of truth: **Yes**.
