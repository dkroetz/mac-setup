# 2026-03-09: Primary Agent Topology

## Status

Accepted

## Context

This harness currently exposes two active primary agents and one disabled experimental agent:

- `scout` for quick Q&A, lightweight exploration, and small tasks
- `engineer` for complex development work and subagent orchestration
- `auto` as a disabled placeholder for autonomous experiments

The phase-1 review compared that setup to the research note in `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`.

The strongest repeated patterns across `Claude Code`, `Codex`, `Cursor`, `OpenCode`, and `Kilo Code` are:

- Keep the top-level role set small and distinct.
- Separate lightweight interaction from deeper implementation work.
- Treat higher-autonomy execution as a scoped mode or explicit experiment, not the default interaction model.
- Avoid overlapping primary agents whose only difference is prompt tone.

## Decision

Keep the current two-primary-agent topology and do not add a third always-on "ask" primary agent.

Use the agents as follows:

1. `scout` remains the minimal ask-style entry point for direct answers, selective exploration, and small focused tasks.
2. `engineer` remains the implementation-oriented primary agent for multi-step work, deeper discovery, and delegated execution.
3. `auto` remains disabled and experimental. Full autonomy stays an explicit opt-in profile for bounded workflows rather than a third general-purpose primary agent.

## Rationale

### Why not add another minimal primary agent

- `scout` already occupies the lightweight ask-oriented role.
- A second ask-style primary agent would mostly duplicate routing and increase ambiguity without adding a new capability boundary.

### Why keep autonomy separate from the default topology

- Research and product docs converge on keeping stronger autonomy behind explicit approvals, modes, worktrees, or automation surfaces rather than making it the everyday default.
- This repo already treats `auto` as an experimental path and documents progressive autonomy in `MAINTENANCE.md`.

### Why the compromise is "minimal scout + optional auto"

- The harness preserves a low-friction conversational entry point.
- It also preserves a place for bounded autonomous experiments without collapsing the distinction between exploratory and autonomous work.
- This keeps the primary topology easy to understand: one lightweight agent, one capable engineering agent, one disabled experimental agent.

## Agent Boundaries

### Scout

- **Purpose**: Fast Q&A, lightweight code exploration, and small focused tasks.
- **Autonomy level**: Low to moderate.
- **Escalation boundary**: Escalates when the task becomes multi-file, architecture-sensitive, or requires extended implementation.

### Engineer

- **Purpose**: Complex development work, multi-step execution, and subagent orchestration.
- **Autonomy level**: High within workspace and permission boundaries.
- **Escalation boundary**: Escalates only for human approvals, destructive operations, or explicit architectural decisions.

### Auto

- **Purpose**: Future bounded automation experiments.
- **Autonomy level**: Full when enabled.
- **Escalation boundary**: Not a general interactive default; enable only for deliberate autonomous workflows.

## Consequences

- The harness keeps a simple and legible top-level agent model.
- Prompt refinement work in later phases should make `scout` more explicitly ask-oriented instead of introducing a new primary agent.
- Any future autonomous expansion should happen by refining `auto` or adding narrow automation surfaces, not by adding another overlapping general-purpose primary agent.

## References

- `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`
- `README.md`
- `MAINTENANCE.md`
- `agents/scout.md`
- `agents/engineer.md`
- `agents/auto.md`
