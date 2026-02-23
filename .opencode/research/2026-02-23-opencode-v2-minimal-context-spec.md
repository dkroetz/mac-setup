# Research: OpenCode v2 Minimal-Context Spec

**Date**: 2026-02-23

## Summary

This spec defines a minimal-context target state for your OpenCode setup across global and project scopes. The goal is to reduce always-loaded instruction weight, make skill loading conditional, and keep only behavior-driven, failure-proven rules. It is grounded in your current config, the AGENTS.md and SkillsBench papers, your transcript notes, and the HN discussion context.

## Key Findings

### 1) AGENTS.md Should Be a Thin Policy Index

Keep `.opencode/AGENTS.md` short and operational:

- environment bootstrap
- canonical verification commands
- compact domain skill index with "when to load"
- workflow contract

Remove from always-loaded AGENTS context:

- package tree and structural docs that are codebase-discoverable
- duplicated conventions already in skills
- long success-criteria prose blocks (keep compact checklist only)

Evidence:

- `opencode/project_scope/.opencode/AGENTS.md:31`
- `opencode/project_scope/.opencode/AGENTS.md:45`
- `opencode/project_scope/.opencode/AGENTS.md:57`
- `opencode/project_scope/.opencode/AGENTS.md:74`

### 2) Skills Should Be Conditional, Not Auto-Loaded in Bulk

Current primary agents instruct loading all listed domain skills from AGENTS. Replace with conditional loading after initial task/repo scan.

Evidence:

- `opencode/global_scope/agents/research.md:30`
- `opencode/global_scope/agents/architect.md:27`
- `opencode/global_scope/agents/implement.md:47`

Target loading policy:

- start with 0 skills
- load 1-2 skills once scope is known
- add a 3rd skill only if blocked

### 3) Split Skill Topology by Reusability

Global skills should remain generic and reusable; project-specific workflow/path details should be local in `.opencode/skills/`.

Evidence:

- global generic candidate: `opencode/global_scope/skills/python-pdm/SKILL.md:1`
- global project-coupled skill today: `opencode/global_scope/skills/postgres/SKILL.md:6`
- existing local project skill: `opencode/project_scope/.opencode/skills/prefect-flows/SKILL.md:1`

Target topology:

- keep `python-pdm` global
- move futilify-specific Postgres guidance into local `.opencode/skills/postgres/`
- keep `prefect-flows` local

### 4) Rule Admission Should Be Failure-Driven

Add AGENTS/rules only for repeated, observed failures that cannot be better solved in code/tests/tooling.

Evidence from transcript themes:

- `opencode/.agent_improvement/yt_transcript.txt:550`
- `opencode/.agent_improvement/yt_transcript.txt:773`
- `opencode/.agent_improvement/yt_transcript.txt:856`

Rule quality bar:

- must be checkable/operational
- prefer positive directives over broad negative wording
- prune regularly

### 5) Context Compression Is Good; Extend It Consistently

Your `google` agent already has strong complexity scaling + compression guidance. Apply that spirit to other agents by reducing static payload and forcing focused context.

Evidence:

- `opencode/global_scope/agents/google.md:26`
- `opencode/global_scope/agents/google.md:92`

## Code References

- `opencode/project_scope/.opencode/AGENTS.md:3`
- `opencode/project_scope/.opencode/AGENTS.md:9`
- `opencode/project_scope/.opencode/AGENTS.md:31`
- `opencode/project_scope/.opencode/AGENTS.md:45`
- `opencode/project_scope/.opencode/AGENTS.md:57`
- `opencode/project_scope/.opencode/AGENTS.md:74`
- `opencode/global_scope/agents/research.md:30`
- `opencode/global_scope/agents/architect.md:27`
- `opencode/global_scope/agents/implement.md:47`
- `opencode/global_scope/agents/google.md:26`
- `opencode/global_scope/agents/google.md:92`
- `opencode/global_scope/skills/python-pdm/SKILL.md:1`
- `opencode/global_scope/skills/postgres/SKILL.md:6`
- `opencode/project_scope/.opencode/skills/prefect-flows/SKILL.md:1`
- `opencode/.agent_improvement/yt_transcript.txt:457`
- `opencode/.agent_improvement/yt_transcript.txt:462`
- `opencode/.agent_improvement/yt_transcript.txt:470`
- `opencode/.agent_improvement/yt_transcript.txt:474`
- `opencode/.agent_improvement/yt_transcript.txt:505`
- `opencode/.agent_improvement/yt_transcript.txt:550`
- `opencode/.agent_improvement/yt_transcript.txt:773`
- `opencode/.agent_improvement/yt_transcript.txt:856`

## Architecture Notes

- Workflow separation is already strong (`Research -> Architect -> Implement`) and should be preserved.
- Permissions and scoped task usage are in good shape; improvements are primarily about context economics and selective instruction loading.
- Project `opencode.jsonc` currently acts as a scaffold with empty agent objects; decide whether to use explicit overrides or keep it minimal and documented.

## Open Questions

- Should Postgres guidance be split into one generic global skill plus one local override skill with project paths?
- Should conditional skill-loading policy be encoded in all primary agents now, or phased in one agent at a time?
- Do you want a fixed AGENTS line budget (for example, 50 lines max) enforced as a maintenance constraint?
