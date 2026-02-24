Domain scope classification: OpenCode workflow-orchestration prompt/config work (agent definitions, delegation protocol, artifact persistence), no Python/DB domain logic.
Skills loaded and rationale: none; this is Markdown/JSONC configuration planning and existing repo conventions are sufficient.
Policy confirmation: stayed within limits (started with 0 skills, kept 0).

Overview: We'll add a new primary `orchestrator` agent that keeps one session context, delegates to existing stage agents via their `/` commands, defaults to a 3-stage flow, and supports optional stages. We'll also add a `.opencode/memory/` artifact path for lightweight end-of-session summaries.

What We're NOT Doing:
- No new `/orchestrator` slash command (per your constraint: primary agent only).
- No rewrite of `research`/`architect`/`implement` agent roles or permissions beyond orchestration entry.
- No persistent database/state machine; memory remains file-based summaries only.
- No mandatory `/review` gate in the default flow (kept optional/extensible).

## Phase 1: Register Orchestrator in Agent Configs

Overview: Wire `orchestrator` as a first-class primary agent in global and project scope config manifests.

Specific file changes with code snippets:

```jsonc
// opencode/global_scope/opencode.jsonc
{
  "agent": {
    // Primary Agents
    "research": { "model": "openai/gpt-5.3-codex" },
    "architect": { "model": "openai/gpt-5.3-codex" },
    "implement": { "model": "openai/gpt-5.3-codex" },
    "orchestrator": { "model": "openai/gpt-5.3-codex" },
    "google": { "model": "openai/gpt-5.3-codex" },
    "review": { "model": "openai/gpt-5.3-codex" }
  }
}
```

```jsonc
// opencode/project_scope/.opencode/opencode.jsonc
{
  "agent": {
    "research": {},
    "architect": {},
    "implement": {},
    "orchestrator": {},
    "google": {},
    "review": {}
  }
}
```

### Success Criteria

- [x] `orchestrator` is registered in both global and project `opencode.jsonc` manifests

#### Automated Verification:

- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

Pause for manual verification before proceeding to next phase.

## Phase 2: Add Orchestrator Primary Agent Contract

Overview: Create `orchestrator.md` with explicit delegation protocol, flexible stage list, and memory-write behavior.

Specific file changes with code snippets:

```md
<!-- opencode/global_scope/agents/orchestrator.md -->
---
description: "Maintains one workflow context and orchestrates stage agents via /commands"
mode: primary
temperature: 0.2
color: "#3AAE7A"
tools:
  write: false
  bash: false
permission:
  edit:
    "*": deny
    ".opencode/memory/*": allow
  task:
    "*": deny
    "research": allow
    "architect": allow
    "implement": allow
    "review": allow
---

## Workflow Contract
Default stages: `research -> architect -> implement`
Optional stages: user-requested extras (e.g. `review`) appended or inserted explicitly.
Execute stages by delegating with their native slash command prompt (`/research ...`, `/architect ...`, `/implement ...`).
Maintain compact "Workflow State" in-conversation: objective, current stage, artifacts, pending confirmations.
After completion (or when user asks), persist a concise summary to `.opencode/memory/YYYY-MM-DD-<topic>.md`.
```

### Success Criteria

- [x] `opencode/global_scope/agents/orchestrator.md` defines primary-agent contract, delegation protocol, and memory-write behavior

#### Automated Verification:

- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

Pause for manual verification before proceeding to next phase.

## Phase 3: Add Memory Artifact Path + Documentation

Overview: Establish `.opencode/memory/` in project scope template and document orchestrator usage + flow behavior.

Specific file changes with code snippets:

```text
# opencode/project_scope/.opencode/memory/.gitkeep
# (empty placeholder file)
```

```md
# opencode/README.md (relevant sections)
project_scope/
└── .opencode/
    ├── AGENTS.md
    ├── research/
    ├── plans/
    └── memory/        # Orchestrator session summaries

Workflow options:
- Manual staged flow: `/research` -> `/architect` -> `/implement`
- Orchestrated flow: switch to `@orchestrator` for single-context coordination
  with default 3 stages and optional extra gates (e.g. review).
```

### Success Criteria

- [x] memory artifact path is present in project scope and README documents manual vs orchestrated workflow options

#### Automated Verification:

- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

Pause for manual verification before proceeding to next phase.

## Testing Strategy

- Automated checks: run project-standard checks from AGENTS format after implementation.
- Config sanity: validate JSONC structure manually (commas/keys), then inspect diffs with `git diff -- opencode/global_scope/opencode.jsonc` and `git diff -- opencode/project_scope/.opencode/opencode.jsonc`.
- End-to-end manual smoke test:
  - Start `@orchestrator` with a small feature request.
  - Confirm default stage ordering runs through `research -> architect -> implement`.
  - Confirm optional stage insertion works when requested (e.g. include review).
  - Confirm `.opencode/memory/<date>-<topic>.md` summary is written at completion and on explicit "save memory" request.

## References

- `.opencode/research/2026-02-25-orchestrator-workflow.md:6`
- `.opencode/research/2026-02-25-orchestrator-workflow.md:43`
- `opencode/global_scope/opencode.jsonc:5`
- `opencode/global_scope/agents/google.md:82`
- `opencode/global_scope/commands/research.md:1`
- `opencode/global_scope/commands/architect.md:1`
- `opencode/global_scope/commands/implement.md:1`
- `opencode/project_scope/.opencode/AGENTS.md:43`
- `opencode/README.md:11`
