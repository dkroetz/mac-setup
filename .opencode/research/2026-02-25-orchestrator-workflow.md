Scope scan result: global_scope/ already has a 3-stage workflow (research -> architect -> implement) with command entrypoints, primary agents, and subtask-enabled stage isolation patterns.
Skills loaded: none.
Reason: this task is config/prompt-structure discovery, and no domain-specific Python/Postgres guidance was required.
AGENTS policy confirmation: followed policy limits (started with 0 skills, kept 0).
Summary:
- Your current setup already has the core primitives needed for an orchestrator-style controller: primary agents, slash commands, subtask boundaries, and explicit human verification gates.
- Stage outputs are persisted as artifacts (.opencode/research/*, .opencode/plans/*) and are intended as handoff contracts between phases.
- The existing google agent demonstrates the same coordination pattern (delegation + synthesis) you want, but for web research subagents instead of workflow stages.
Key Findings:
- 3-stage workflow is explicitly defined
  - Research -> Architect -> Implement is documented as the main lifecycle in README.md:14 and project_scope/.opencode/AGENTS.md:56.
  - Stage constraints are explicitly separated by agent role in README.md:17.
- Stage agents are already independent context roles
  - Primary stage agents exist and are model-bound in global_scope/opencode.jsonc:5, global_scope/opencode.jsonc:9, global_scope/opencode.jsonc:12.
  - Each stage has its own command entrypoint with subtask: true in global_scope/commands/research.md:4, global_scope/commands/architect.md:4, global_scope/commands/implement.md:4.
- Human verification control already exists in prompts
  - Architect includes explicit “pause for manual verification” requirements in global_scope/agents/architect.md:79.
  - Implement enforces per-phase stop-and-wait for human confirmation in global_scope/agents/implement.md:86.
- Artifact-based handoff model is already in place
  - Research persistence contract: global_scope/agents/research.md:65.
  - Architect persistence contract: global_scope/agents/architect.md:85.
  - Implement consumes plan/research artifacts: global_scope/agents/implement.md:28, global_scope/agents/implement.md:31.
- Coordinator pattern exists and is reusable as precedent
  - google is a primary coordinator that delegates to subagents via task permissions in global_scope/agents/google.md:13 and global_scope/agents/google.md:15.
  - Its delegation protocol (context packet + parallel spawning + synthesis) is specified in global_scope/agents/google.md:82.
Code References:
- global_scope/opencode.jsonc:5
- global_scope/opencode.jsonc:22
- global_scope/commands/research.md:1
- global_scope/commands/architect.md:1
- global_scope/commands/implement.md:1
- global_scope/agents/research.md:25
- global_scope/agents/architect.md:22
- global_scope/agents/implement.md:22
- global_scope/agents/google.md:24
- README.md:63
- project_scope/.opencode/AGENTS.md:56
Architecture notes:
- Workflow coordination today is command-driven and stage-local; continuity is carried by artifacts and user-triggered transitions, not by a dedicated orchestration agent.
- Permissions are intentionally strict per role, so stage specialization and human gating are encoded in agent contracts rather than runtime heuristics.
- Subtask-capable commands already indicate the intended isolation boundary for stage-specific context windows.
Open Questions:
- Should orchestration be invoked as a new top-level command (single session controller), or should it wrap existing /research, /architect, /implement calls as delegated subtasks?
- Should the orchestrator also include /review as an optional quality gate before completion, or stay strictly 3-stage?
- Should workflow state be only conversational, or persisted to a file under .opencode/ for resumability across sessions?
