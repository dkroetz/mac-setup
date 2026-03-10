# Agent Setup Refinement Plan (OpenAI-Only, Balanced Mode)

## Scope and Goals

- Optimize for a balanced middle: quality/reliability and speed/cost.
- Standardize on OpenAI models:
  - `gpt-5.3-codex` for large/complex work
  - `gpt-5.1-codex-mini` for small/fast work
- Keep architecture minimal and maintainable.
- Use evidence-backed changes and measured rollouts.

## Current-State Diagnosis

- Setup is close to `OPUS_FINAL_PLAN.md`; biggest structural gap is missing `discoverer` subagent.
- Prompt overlap exists across primary agents, skills, commands, and project context docs.
- `~/Projects/futilify/AGENTS.md` currently enforces heavy context preflight rules that likely increase token/latency cost and conflict with progressive disclosure.
- Global skills count (3) is in the empirically good range; avoid adding many new skills.
- Existing commands (`/context`, `/add-context`, `/audit`, `/capture`) are strong and should carry more process burden than prompts.

## Research-Aligned Principles

1. Keep context files minimal and specific; avoid broad mandatory context loading.
2. Prefer 2-3(+) curated human-authored procedural skills over many generic ones.
3. Use simple composable workflows over prompt-heavy complexity.
4. Use progressive disclosure and on-demand skill loading.
5. Measure changes with evals, not intuition.
6. Use subagent isolation and compaction-friendly workflows for long runs.

## Target Architecture

### Primary Agents

- `scout` -> `gpt-5.1-codex-mini`
- `engineer` -> `gpt-5.3-codex`

### Subagents (Minimal Set)

1. `discoverer` (read-only exploration and pattern extraction)
2. `planner` (step plan + risk + validation)
3. `implementer` (single logical implementation unit)
4. `reviewer` (correctness/security/regression review)
5. `context-auditor` (optional but recommended; context staleness/redundancy checks)

## Multi-Step Implementation Plan

### Phase 0: Baseline and Instrumentation

- Snapshot current global and project configs.
- Build a 10-20 task benchmark set (bugfix, feature, refactor, context-heavy, command-driven).
- Capture baseline metrics:
  - task success rate
  - time to first meaningful edit
  - token usage (input/output/reasoning where available)
  - interventions per task
  - post-first-pass fix rate
- Deliverable: `baseline-report.md`.

### Phase 1: Prompt Surface Reduction

- Remove duplicated or conflicting instructions across prompts/skills/commands/docs.
- Keep primary prompts short and role-defining.
- Move procedures to skills/commands where possible.
- Deliverable: `prompt-responsibility-matrix.md`.

### Phase 2: Subagent Normalization

- Add missing `discoverer`.
- Add `context-auditor` only if accepted (recommended).
- Define strict I/O contracts for each subagent:
  - required inputs
  - required output schema
  - forbidden actions
- Tighten permissions:
  - `discoverer`, `planner`, `context-auditor`: read-only
  - `reviewer`: read + optional test commands, no edits
  - `implementer`: scoped write/edit with inherited approval gates
- Deliverable: updated subagent specs and files.

### Phase 3: Selective Autonomy Gates

- Keep global defaults conservative (`ask` for `edit`/`write`/`bash`).
- Relax selectively for safe, frequent commands:
  - read-only git and discovery commands
  - optionally `pytest`, `mypy`, `ruff` for `engineer`
- Keep destructive or irreversible commands gated.
- Deliverable: `permission-profile-balanced.json`.

### Phase 4: Context Strategy Realignment (Critical)

- Refactor `~/Projects/futilify/AGENTS.md` and related context contracts to progressive disclosure.
- Remove mandatory "read everything first" constraints.
- Keep always-loaded docs minimal.
- Move strict process checks to commands (`/context validate`, `/audit`) and optional `context-auditor`.
- Deliverable: lean context contract and migration notes.

### Phase 5: Skills and Commands Hardening

- Keep current 3 global skills as baseline.
- Refine each skill with explicit trigger boundaries:
  - when to use
  - when not to use
  - procedural steps
  - failure handling
- Add a lightweight skill eval harness:
  - trigger precision
  - completion quality
  - token impact
- De-duplicate overlapping command behavior.
- Deliverable: revised skill specs + `skills-eval-report.md`.

### Phase 6: Eval Harness and Regression Policy

- Build repeatable eval runner with:
  - deterministic checks (commands/files/tests)
  - rubric checks (plan quality, response quality, verbosity discipline)
- Set release gates:
  - no success-rate regression
  - cost increase <= 10% unless explicitly justified by quality gain
  - intervention count reduced or stable
- Deliverable: `agent-evals/` + `release-gate.md`.

### Phase 7: Rollout and Maintenance Rhythm

- Stage rollout:
  1. global config + subagents
  2. pilot in `futilify`
  3. broader rollout
- Weekly 30-minute maintenance:
  - run `/audit`
  - prune stale context
  - review top failure traces
  - update at most one skill/command per cycle
- Deliverable: `maintenance-playbook.md`.

## Acceptance Criteria

- `discoverer` exists and is actively used in complex tasks.
- Context loading is selective, not mandatory bulk preflight.
- No net success-rate regression after simplification.
- Token usage and intervention count improve or stay neutral on pilot tasks.
- Skill trigger precision improves (fewer false positives/negatives).
- Setup remains markdown/config-first and easy to reason about.

## References

- SkillsBench: `https://arxiv.org/abs/2602.12670`
- Evaluating AGENTS.md / AGENTbench: `https://arxiv.org/abs/2602.11988`
- Anthropic - Building effective agents: `https://www.anthropic.com/engineering/building-effective-agents`
- OpenAI Codex - AGENTS.md: `https://developers.openai.com/codex/guides/agents-md`
- OpenAI Codex - Skills: `https://developers.openai.com/codex/skills`
- OpenAI Codex - Multi-agents: `https://developers.openai.com/codex/concepts/multi-agents`
- OpenAI blog - Skills + shell + compaction: `https://developers.openai.com/blog/skills-shell-tips`
- OpenAI blog - Testing skills with evals: `https://developers.openai.com/blog/eval-skills`
- OpenAI cookbook - Codex prompting guide: `https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide`
