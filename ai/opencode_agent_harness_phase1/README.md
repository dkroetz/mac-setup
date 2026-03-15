# Agent Harness Development Notes

This directory preserves planning and comparison artifacts used while designing the current OpenCode harness.

## What This Folder Is

- Historical and comparative planning outputs (`*_PLAN.md`, `*_REVIEWED_PLAN.md`, `*_FINAL_PLAN.md`)
- Prompt context used across model comparisons (`PROMPT_CONTEXT.md`)
- Transcript sources that influenced design choices

## What This Folder Is Not

- Not runtime configuration consumed by OpenCode
- Not the source of truth for active agent/command behavior

## Canonical Runtime Sources

- Active global config: `opencode/global_scope/`
- Active project policy and local overrides: `opencode/project_scope/.opencode/`
- Top-level orientation doc: `opencode/README.md`

## How To Use These Files

- Use for provenance: why a design decision was made
- Use for audits: compare intended behavior vs implemented behavior
- Avoid copying old plan content directly into runtime prompts without re-validating against current OpenCode docs and current repo layout

## Notes on Naming

- Multiple model output families exist (GLM, KIMI, MINIMAX)
- Some files contain superseded assumptions (for example naming or file-count estimates)
- Treat them as archival context, not current policy
