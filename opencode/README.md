# Harness Engineering Workflow for OpenCode

A practical OpenCode setup that applies a minimal-context, staged workflow inspired by Dex's context engineering talks and HumanLayer prompt patterns.

## Core Workflow

```
Research -> Architect -> Implement
```

| Phase | Role | Constraint |
|-------|------|------------|
| Research | Explore and document current state | No implementation suggestions |
| Architect | Produce executable phase plan | No code edits |
| Implement | Execute one phase at a time | Verify and pause between phases |

## Current Runtime Topology

### Global Scope (`~/.config/opencode/`)

```
global_scope/
├── AGENTS.md               # Global preferences mirrored from ~/.config/opencode/AGENTS.md
├── agents/
│   ├── research.md         # Primary research agent
│   ├── architect.md        # Primary planning agent
│   ├── implement.md        # Primary implementation agent
│   ├── orchestrator.md     # Single-context stage coordinator
│   ├── review.md           # Read-only review agent
│   ├── google.md           # Web-research coordinator
│   └── research/
│       ├── docs.md         # Source-specific web research subagents
│       ├── code.md
│       ├── blogs.md
│       ├── news.md
│       └── academic.md
├── commands/
│   ├── research.md         # same-session staged command
│   ├── architect.md
│   ├── implement.md
│   ├── research-task.md    # forced subtask/isolation variants
│   ├── architect-task.md
│   ├── implement-task.md
│   ├── review.md
│   ├── review-diff.md
│   ├── review-pr.md
│   └── google.md
├── plugins/
│   ├── env-protection.ts
│   └── session-notify.ts
├── skills/
│   ├── python-pdm/
│   └── postgres/
└── opencode.jsonc
```

### Shared Agent Skills (`~/.agents/`)

```
.agents/
├── .skill-lock.json
└── skills/
    ├── find-skills/
    ├── github-projects/
    └── playwright-cli/
```

### Project Scope (`<repo>/.opencode/`)

```
project_scope/.opencode/
├── AGENTS.md               # Project-local verification + skill policy source of truth
├── research/               # Research artifacts
├── plans/                  # Implementation plans
├── memory/                 # Orchestrator summaries
├── verification/           # Lightweight drift checklists
└── skills/                 # Optional project-local skill overrides
```

## Workflow How-To (End to End)

This section is a practical test guide for the exact setup in this repo.

### 0) Preflight (once per session)

1. Start OpenCode in your target project root.
2. Confirm project policy exists at `.opencode/AGENTS.md`.
3. Confirm artifact directories exist:
   - `.opencode/research/`
   - `.opencode/plans/`
   - `.opencode/memory/`
4. For Python projects, activate and run baseline verification from AGENTS:
   - `source .venv/bin/activate`
   - `pdm run ruff check . && pdm run mypy`

### 1) Fully Coordinated Flow (Orchestrator-First)

Use this when you want the system to route stages automatically while still honoring manual gates.

#### Step 1.1 - Give one objective to orchestrator

Example prompt:

```text
Build a plan and implement support for X.
Constraints: keep existing API unchanged, add tests, and pause for verification between phases.
```

Expected behavior:

- Orchestrator starts with research by routing to `/research <topic>`.
- Stage output includes:
  - `Artifacts:` block (for example `.opencode/research/2026-02-26-topic.md`)
  - `Suggested next command:` (for example `/architect <artifact-path>`)

#### Step 1.2 - Confirm and continue

When asked for a verification gate, respond explicitly with one of:

- `confirmed`
- `verified`
- `continue`

Expected behavior:

- Orchestrator advances to architect, then implement.
- During implement, only one phase executes at a time, then it stops again for manual confirmation.

#### Step 1.3 - Complete all phases

For each implement phase:

1. Read the "What changed" bullets.
2. Run the provided verification commands.
3. Confirm explicitly to unlock the next phase.

Expected final artifacts:

- `.opencode/research/YYYY-MM-DD-<topic>.md`
- `.opencode/plans/YYYY-MM-DD-<topic>.md`
- `.opencode/memory/YYYY-MM-DD-<topic>.md` (or `session` slug)

### 2) Manual Staged Flow (User-Driven Slash Commands)

Use this when you want strict control over each command.

#### Step 2.1 - Research

```text
/research Map current auth flow and dependencies.
```

Expected output:

- Findings in chat first
- Prompt asking whether to persist to `.opencode/research/YYYY-MM-DD-<topic>.md`
- Artifact handoff suggestion for architect

#### Step 2.2 - Architect

```text
/architect .opencode/research/YYYY-MM-DD-auth-flow.md
```

Expected output:

- Full implementation plan in chat first
- Prompt asking whether to persist to `.opencode/plans/YYYY-MM-DD-<topic>.md`
- Handoff suggestion for implement

#### Step 2.3 - Implement

```text
/implement .opencode/plans/YYYY-MM-DD-auth-improvement.md
```

Expected output:

- Exactly one plan phase executed
- Verification run after phase
- Manual verification instructions and pause

### 3) Isolated Execution Flow (Forced Child Tasks)

Use this when you want isolation boundaries between stages.

Commands:

- `/research-task <topic>`
- `/architect-task <args-or-research-path>`
- `/implement-task <plan-path>`

When to prefer this mode:

- You want cleaner separation of stage context
- You are testing prompt leakage or stage independence
- You want to compare results vs same-session behavior

### 4) Optional Commands in the Workflow

#### 4.1 Review gates

- `/review-diff` for current staged/unstaged changes
- `/review <target>` for scoped reviews
- `/review-pr <context>` for PR-style review context

Recommended insertion points:

1. After architect, before implement (plan sanity check)
2. After each major implement phase (regression checks)

#### 4.2 Web research coordinator

```text
/google latest best practices for SQLAlchemy 2 migration safety
```

Expected behavior:

- Simple query: handled directly by web tools
- Moderate/complex query: delegated to specialized subagents (`research/docs`, `research/code`, `research/news`, etc.)

### 5) What "Good" Stage Output Looks Like

Use this as a quick acceptance checklist.

#### Research

- Includes scope scan + skill loading report
- Uses file:line references
- Avoids suggestions/critiques
- Asks before writing file

#### Architect

- Includes boundaries ("what not doing")
- Uses phase-based plan with verifiable criteria
- References AGENTS success-criteria format
- Asks before writing plan file

#### Implement

- Shows required handshake with execution mode
- Executes one phase only
- Runs AGENTS-defined verification
- Stops for explicit human confirmation

### 6) Automated + Manual Testing Pattern

For reliability testing, use `.agent_improvement/tests/catalog.yaml`:

1. Pick a test id (small tests run once, medium run three times).
2. Use the linked fixture prompt.
3. Run target agent for the configured run count.
4. Record each run using `.agent_improvement/schemas/run_record.schema.json`.
5. Compare mandatory checks and rubric stability.

Suggested starting sequence:

1. `small-1-research-skill-loading`
2. `small-2-architect-policy-dedup`
3. `medium-1-research-paraphrase-robustness`
4. `medium-2-architect-multisource-synthesis`

## Minimal-Context Operating Principles

- Keep `AGENTS.md` thin; put detailed guidance in skills
- Load skills on demand; avoid bulk-loading policy text
- Prefer explicit artifact handoffs (`.opencode/research/...`, `.opencode/plans/...`)
- Use same-session commands by default; use `-task` variants for isolation when needed
- Treat prompt/config files as living docs and prune stale rules regularly

## Setup

1. Copy `global_scope/` contents to `~/.config/opencode/`
2. Copy `project_scope/.opencode/` into each project that should use this workflow
3. Update project `.opencode/AGENTS.md` verification commands and skill-loading policy
4. Optional: install `opencode-sync` for repeatable push/pull/status syncs (`opencode/sync_cli/README.md`)

## Supporting Workdirs

- `opencode/.agent_harness_development/` contains planning artifacts and transcript context used to evolve this setup
- `opencode/.agent_improvement/` contains behavior test fixtures, rubrics, and schemas

See each directory's local README for operational details.

## References

- [OpenCode Docs](https://opencode.ai/docs)
- [Dex Context Engineering talk](https://www.youtube.com/watch?v=rmvDxxNubIg)
- [humanlayer/humanlayer](https://github.com/humanlayer/humanlayer)
