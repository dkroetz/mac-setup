# Prompt Responsibility Matrix

Date: 2026-03-03
Phase: 1 (Prompt Surface Reduction)

## Source of Truth by Instruction Area

| Instruction area | Source of truth | Notes |
|---|---|---|
| Global tooling defaults (`pdm`, `mypy --strict`, `ruff`, `pytest`) | `~/.config/opencode/AGENTS.md` | Applies across projects; prompts should reference, not duplicate command details. |
| Global git conventions (conventional commits) | `~/.config/opencode/AGENTS.md` | Detailed procedural steps belong in skill/command content. |
| Engineer role behavior (complex implementation workflow, delegation policy) | `~/.config/opencode/agents/engineer.md` | Role-specific orchestration guidance only. |
| Scout role behavior (quick exploration, escalation threshold) | `~/.config/opencode/agents/scout.md` | Lightweight read-mostly behavior only. |
| Project-specific mandatory preflight rules | `<project>/AGENTS.md` | Project rules override generic agent heuristics when stricter. |
| Project architecture description | `<project>/.agents/context/architecture.md` | Architecture content only; no duplicated operating contract. |
| Context harvesting workflow | `~/.config/opencode/commands/context.md` + `commands/add-context.md` | Command procedures own operational steps. |
| Planning/execution command procedures | `~/.config/opencode/commands/plan.md` + `commands/build.md` | Commands own step-by-step runbooks. |
| Python quality execution procedure | `~/.config/opencode/skills/code-quality/SKILL.md` | Procedural command sequence lives in skill. |
| Git workflow procedure (branch/PR hygiene) | `~/.config/opencode/skills/git-workflow/SKILL.md` | Procedural git guidance lives in skill. |

## Duplication Removed in Phase 1

- Removed duplicate "ask for confirmation before edits" behavior from primary-agent prompts.
- Removed duplicated context preflight contract from `architecture.md` and kept it in project `AGENTS.md`.
- Normalized precedence rule in both primary agents: project `AGENTS.md` overrides generic heuristics when stricter.

## Consistency Check (Engineer/Scout vs Project AGENTS)

- Engineer and Scout now explicitly defer to project `AGENTS.md` for required preflight.
- Project AGENTS now specifies targeted additional context loading (relevant-only), aligning with agent efficiency heuristics.
- No conflicting instruction remains on whether broad mandatory context loading is always required.
