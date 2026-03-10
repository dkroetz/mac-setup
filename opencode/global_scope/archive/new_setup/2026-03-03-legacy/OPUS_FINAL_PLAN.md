# Agent Harness Plan for OpenCode — Final Consolidated Version

> Consolidated from three independent plans (Opus, GLM, Kimi), cross-referenced
> against research papers (SkillsBench, Evaluating AGENTS.md), OpenAI's Harness
> Engineering blog, Theo's context management video, and the OpenCode docs. Each
> decision is annotated with its source so you can trace the reasoning.

---

## Design Principles

These are non-negotiable. Every phase must honour them.

| # | Principle | Source |
|---|-----------|--------|
| 1 | **AGENTS.md is a table of contents, not an encyclopedia.** ~100 lines. Points to deeper docs. Never duplicates what the model can discover in the codebase. | OpenAI Harness Engineering, AGENTS.md paper (Gloaguen et al.) |
| 2 | **2-3 focused, human-authored skills beat many generic ones.** Moderate length. Procedural ("how to"), not descriptive ("what is"). Self-generated skills provide zero benefit. | SkillsBench (Li et al.) |
| 3 | **Enforce architecture via tooling, not instructions.** Linters, type checks, structural tests > telling the agent "always do X". | OpenAI Harness Engineering |
| 4 | **Progressive disclosure.** Agents start with a small map and navigate to what they need. They are not front-loaded with everything. | OpenAI Harness Engineering |
| 5 | **Read is free, write is gated.** Discovery/exploration needs zero friction. Modifications get one confirmation. | Your preference + research sweet spot |
| 6 | **Config-first, plugins only when needed.** Markdown agents, SKILL.md files, JSON config. TypeScript plugins only for lifecycle hooks that config cannot express. | Your preference, OAC/OmO comparison |
| 7 | **Repository knowledge is the system of record.** If it's not in the repo, the agent can't see it. Encode decisions, architecture, and plans as versioned artifacts. | OpenAI Harness Engineering |
| 8 | **Measure before you optimise.** Token usage, task duration, success rate. Don't assume — validate. | GLM Plan, SkillsBench methodology |
| 9 | **No MCP overhead.** Stay with OpenCode's native capabilities (agents, skills, commands, plugins, permissions). Add MCP only if native features prove limiting in practice. | Your preference after plan comparison |

---

## Architecture Overview

```
~/.config/opencode/                    # GLOBAL (shared across all projects)
├── opencode.json                      # Providers, models, global permissions, plugins
├── AGENTS.md                          # Personal global rules (10-20 lines)
├── agents/                            # Agent definitions
│   ├── scout.md                       # Agent #1: Light Q&A + discovery
│   ├── engineer.md                    # Agent #2: Serious dev, orchestrates subagents
│   └── auto.md                        # Agent #3: Placeholder (disabled)
│   └── subagents/                     # Custom subagents for engineer workflow
│       ├── discoverer.md              # Read-only codebase exploration
│       ├── planner.md                 # Structured plan generation
│       ├── implementer.md             # Executes one logical unit of work
│       └── reviewer.md               # Validates changes
├── skills/                            # Global skills (SKILL.md)
│   ├── git-workflow/SKILL.md
│   ├── code-quality/SKILL.md
│   └── project-setup/SKILL.md
├── commands/                          # Global custom commands
│   ├── plan.md
│   ├── build.md
│   ├── review.md
│   └── commit.md
└── plugins/                           # Light TypeScript plugins
    ├── session-notify.ts
    └── env-protection.ts

<project>/.opencode/                   # PROJECT-SPECIFIC (overrides global)
├── opencode.json                      # Project config overrides, instructions array
├── skills/                            # Project-specific skills
│   └── data-pipeline/SKILL.md
└── commands/                          # Project-specific commands

<project>/                             # THE CODEBASE (source of truth)
├── AGENTS.md                          # Lean table of contents (~100 lines)
├── docs/                              # Structured knowledge base (OpenAI pattern)
│   ├── architecture.md                # Top-level map of domains, layers, data flow
│   ├── decisions/                     # Decision records (ADRs)
│   ├── plans/
│   │   ├── active/                    # Current work plans
│   │   └── completed/                 # Archived plans
│   └── wisdom/                        # Accumulated learnings
│       ├── patterns.md                # Patterns discovered across tasks
│       ├── mistakes.md                # Common mistakes and fixes
│       └── decisions.md               # Key decisions and rationale
└── ...                                # Actual source code
```

---

## Phase 0: Exploration — Understand the Platform

**Goal**: Build hands-on understanding of OpenCode's agent system before writing
any harness code. Grounded in reality, not documentation alone.

**Duration**: 2-3 hours

**Why this phase exists**: GLM plan correctly identifies that jumping straight
into building skips the learning. Your stated goal is to understand every step
and dependency. This phase ensures that.

### Step 0.1: Explore OpenCode's Built-in Agents

**Actions**:
1. Start OpenCode in a real project: `opencode`
2. Use Tab to cycle between the built-in Build and Plan agents
3. Test the `@explore` and `@general` subagent mentions
4. Run `/init` on a test project and read the generated AGENTS.md critically
5. Try `opencode agent create` to see the interactive agent scaffolding

**What to observe**:
- How does the system prompt change between Build and Plan?
- What tools does each agent have access to?
- How does the `@` mention system work for subagents?
- What does the `/init` command actually generate? (Spoiler: the research says it's mostly useless — verify this yourself)

### Step 0.2: Map Your Workflow to Agent Phases

**Actions**:
1. Pick a recent complex task you completed (a real one, not hypothetical)
2. Break it into phases: what did you discover first? What did you plan? What did you implement? What did you validate?
3. At each phase, note: what context did you need? Where did you find it? What decisions required your judgment?
4. Identify which phases could be autonomous (read-only discovery) vs which needed human judgment (architectural decisions, trade-off calls)

**Deliverable**: A mental model (or quick notes) of your discover → plan → implement → validate flow grounded in a real example. This directly informs how you configure engineer.md and its subagents.

### Step 0.3: Read the Config Schema

**Actions**:
1. Open `https://opencode.ai/config.json` in your browser — this is the full schema
2. Understand: `agent`, `permission`, `tools`, `command`, `instructions`, `plugin`
3. Note which fields are available for agents: `mode`, `model`, `tools`, `permission`, `prompt`, `temperature`, `steps`, `hidden`, `description`

**Success Criteria**:
- [ ] You can explain how Tab switching, `@` mentions, and the task tool relate
- [ ] You have a real task mapped to discover/plan/implement/validate phases
- [ ] You know which OpenCode config fields you'll use for each agent

---

## Phase 1: Foundation — A Working Minimal Harness

**Goal**: Two primary agents with correct permissions and models. Usable
immediately for daily work.

**Duration**: 2-3 hours

### Step 1.1: Create Global opencode.json

**File**: `~/.config/opencode/opencode.json`

**What to configure**:
- Two models: capable model for engineer, cheaper/faster for scout
- Global permissions: `read` = allow (implicit default), `edit` = ask, `bash` = ask
- Default agent set to `scout` (the safe default for quick interactions)

**Key decisions**:
- `"default_agent": "scout"` — You start in the safe, cheap agent. Switch to engineer deliberately with Tab.
- Global permissions are the floor. Agents can override per-agent.
- No plugins yet, no MCP, no custom tools.

### Step 1.2: Create Agent #1 — scout.md

**File**: `~/.config/opencode/agents/scout.md`

**Design**:
- Mode: `primary`
- Model: cheaper/faster model (e.g., Claude Haiku 4.5 or GPT-5.1-mini)
- Temperature: 0.1 (focused, deterministic)
- Tools: all read tools enabled. `write`, `edit`, `bash` set to `ask`
- Prompt: concise. Focused on answering questions, exploring code, making small single-file changes
- **Escalation instruction**: The prompt explicitly tells scout that for tasks involving multiple files, complex refactoring, architectural changes, or database work, it should tell the user to switch to the engineer agent (source: Kimi plan)

**Why the escalation matters**: Without it, scout will attempt complex tasks with a cheap model and limited context, producing bad results. Explicit escalation criteria prevent this.

### Step 1.3: Create Agent #2 — engineer.md

**File**: `~/.config/opencode/agents/engineer.md`

**Design**:
- Mode: `primary`
- Model: capable model (e.g., Claude Sonnet 4.5 or Opus)
- Temperature: 0.2
- Steps: high limit (or no limit)
- Tools: all enabled. `write`, `edit`, `bash` = `ask`
- Prompt: describes the discover → plan → implement → validate workflow at a high level. References subagents by description (OpenCode's task tool will match based on descriptions). Does NOT micromanage steps.
- Task permissions: allow all custom subagents, deny `auto` (disabled)

**Critical prompt design (from research)**:
- Do NOT put the full workflow as rigid XML rules (OAC's approach caused your "too strict" problem)
- DO describe the general approach: "For complex tasks, first explore the codebase to understand relevant files and patterns. Then create a plan. Then implement step by step, validating after each step."
- Let the model decide when to delegate vs do directly. The subagent descriptions guide this naturally.

### Step 1.4: Create Minimal Global AGENTS.md

**File**: `~/.config/opencode/AGENTS.md`

**Content** (~15 lines):
- Your personal preferences that apply across all projects
- Example: "Prefer uv for Python dependency management"
- Example: "Always run type checks (mypy) after code changes"
- Example: "Use conventional commits format"
- Nothing about codebase structure, nothing the model already knows

**What NOT to put here** (from AGENTS.md paper + Theo video):
- No generic coding patterns (the model knows them)
- No file structure descriptions (the model can `glob`)
- No dependency lists (the model checks pyproject.toml)
- No "do not" instructions (they bias the model toward the thing you're prohibiting — "don't think about pink elephants")

### Success Criteria — Phase 1
- [ ] `opencode` starts and shows scout as the default agent
- [ ] Tab switches to engineer
- [ ] Scout responds to simple questions using the cheap model
- [ ] Engineer responds to complex prompts using the capable model
- [ ] Both agents ask for confirmation before writing/editing files
- [ ] Scout suggests switching to engineer for complex tasks

---

## Phase 2: Custom Subagents — Engineer's Workflow Team

**Goal**: Create purpose-built subagents that engineer can delegate to. Each
subagent has a focused role, limited tools, and a specific output contract.

**Duration**: 3-4 hours

**Why custom subagents** (from Kimi plan + research): OpenCode's built-in
`explore` and `general` subagents are generic. Purpose-built subagents with
constrained tools and clear output formats produce more reliable results. They
also isolate context — a key finding from the "context rot" research cited in
the Deep Agents post.

### Step 2.1: Create discoverer.md

**File**: `~/.config/opencode/agents/subagents/discoverer.md`

**Design**:
- Mode: `subagent`
- Model: inherits from invoking agent (engineer's capable model)
- Tools: read-only (`read`, `glob`, `grep`, `bash` for non-destructive commands). `write` = deny, `edit` = deny
- Hidden: true (not shown in @ autocomplete — only engineer invokes it)
- Prompt: "Explore the codebase to understand the task. Report: relevant files, existing patterns to follow, dependencies involved, constraints, and risks. Do not write code."
- Output format: structured markdown sections

**Permission config**:
```yaml
permission:
  edit: deny
  write: deny
  bash:
    "git *": allow
    "find *": allow
    "ls *": allow
    "*": deny
```

### Step 2.2: Create planner.md

**File**: `~/.config/opencode/agents/subagents/planner.md`

**Design**:
- Mode: `subagent`
- Model: inherits
- Tools: `read`, `glob`, `grep` only. No write, no bash, no edit.
- Hidden: true
- Prompt: "Given discovery findings, create a step-by-step implementation plan. For each step: description, files to modify/create, validation criteria, estimated complexity. Identify risks."
- Output: structured plan (markdown with numbered steps)

### Step 2.3: Create implementer.md

**File**: `~/.config/opencode/agents/subagents/implementer.md`

**Design**:
- Mode: `subagent`
- Model: inherits
- Tools: `read`, `edit`, `write`, `bash` (all enabled, permissions inherited)
- Hidden: true
- Prompt: "Implement one specific step. Follow existing code patterns. Run tests/linting after changes. Report: SUCCESS, PARTIAL (with blockers), or FAILED (with reason)."
- Key constraint: "Make minimal, focused changes. One logical unit of work per invocation."

### Step 2.4: Create reviewer.md

**File**: `~/.config/opencode/agents/subagents/reviewer.md`

**Design**:
- Mode: `subagent`
- Model: inherits (or use the cheaper model for cost savings)
- Tools: `read`, `glob`, `grep`, `bash` (for running tests). No `edit`, no `write`.
- Hidden: true
- Prompt: "Review all changes for: correctness, security issues, test coverage, style consistency, unintended side effects. Report verdict: PASS, NEEDS_FIX (with specific issues), or REJECT (with reason)."

### Step 2.5: Update engineer.md Task Permissions

After creating subagents, update engineer's config to explicitly allow invoking them:

```yaml
permission:
  task:
    "discoverer": allow
    "planner": allow
    "implementer": allow
    "reviewer": allow
    "explore": allow
    "*": deny
```

This prevents engineer from spawning arbitrary subagents while keeping the
workflow explicit.

### Success Criteria — Phase 2
- [ ] Engineer can invoke `@discoverer` and get a read-only exploration report
- [ ] Engineer can invoke `@planner` and get a structured plan
- [ ] Engineer can invoke `@implementer` and get a focused code change
- [ ] Engineer can invoke `@reviewer` and get a quality verdict
- [ ] Discoverer and planner cannot write files (permissions enforced)
- [ ] The engineer naturally delegates to these subagents for complex tasks

---

## Phase 3: Context Strategy — Progressive Disclosure + Registry

**Goal**: Implement the OpenAI "AGENTS.md as table of contents" pattern with a
lightweight context trigger system (inspired by Kimi's registry, but using
OpenCode's native `instructions` config instead of a custom MCP server).

**Duration**: 2-3 hours

### Step 3.1: Create Project AGENTS.md Template

**File**: `<project>/AGENTS.md` (template for any new project)

**Structure** (~80-100 lines):

```markdown
# [Project Name]

[2-3 sentence description of what this project does]

## Navigation

- Architecture overview: `docs/architecture.md`
- Active plans: `docs/plans/active/`
- Decision records: `docs/decisions/`
- Accumulated wisdom: `docs/wisdom/`

## Key Entry Points

- Configuration: `pyproject.toml`
- Main entrypoint: `src/[package]/__main__.py`
- Database schema: `src/[package]/models/`

## Tooling

- Package manager: uv
- Type checker: mypy --strict
- Linter: ruff check && ruff format
- Tests: pytest -x --tb=short
- Pre-commit: run `pre-commit run --all-files` before committing

## Gotchas

<!-- Populate this section ONLY when you discover persistent agent confusion.
     Follow Theo's approach: if the agent keeps getting something wrong and
     you can't fix it in the codebase, add it here. -->
```

**What's NOT in this file** (from research):
- No codebase overview (the model can glob)
- No dependency list (the model reads pyproject.toml)
- No directory tree (the model can explore)
- No generic coding patterns (the model already knows them)

### Step 3.2: Create docs/ Knowledge Base

**Directory**: `<project>/docs/`

**Structure**:
```
docs/
├── architecture.md        # Domain map, layer structure, data flow
├── decisions/             # Architectural Decision Records
│   └── 001-template.md    # ADR template
├── plans/
│   ├── active/            # Current work in progress
│   └── completed/         # Archived plans (for context)
└── wisdom/                # Accumulated learnings (Phase 5)
    ├── patterns.md        # Discovered patterns
    ├── mistakes.md        # Mistakes and fixes
    └── decisions.md       # Key decisions and rationale
```

**`architecture.md`** should describe:
- High-level domain decomposition
- Key data flow paths
- External integrations
- Things an agent would NOT discover by reading code alone (the "why" behind architectural choices)

### Step 3.3: Configure Context Triggers via instructions

**File**: `<project>/.opencode/opencode.json`

Instead of Kimi's YAML registry + MCP server, use OpenCode's native
`instructions` array to load relevant docs:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "instructions": [
    "docs/architecture.md"
  ]
}
```

**Important**: Keep this list minimal. Only include files that are ALWAYS
relevant. For task-specific context, let the agent navigate to it via the
pointers in AGENTS.md (progressive disclosure).

For context that should load conditionally (e.g., security rules when
working on auth), use **skills** (Phase 4) rather than instructions. Skills
are loaded on-demand by the agent when it determines they're relevant.

### Step 3.4: Create the Gotchas Feedback Loop

Following Theo's recommendation from the video:

Add this paragraph to every project's AGENTS.md (at the bottom of the Gotchas
section):

```markdown
If you encounter something in this project that surprises you or seems
inconsistent, note it here so future sessions can avoid the same confusion.
```

This is a **diagnostic tool**, not a real instruction. The agent will try to
modify AGENTS.md when confused. You review the proposed changes:
- ~20% you'll merge (genuine gotchas worth documenting)
- ~80% you'll use as signals to fix the codebase itself (better naming, clearer types, missing docs)

### Success Criteria — Phase 3
- [ ] AGENTS.md is under 100 lines and contains zero discoverable information
- [ ] `docs/architecture.md` exists and describes the "why" not the "what"
- [ ] The `instructions` array loads only always-relevant docs
- [ ] Agent navigates to docs/ from AGENTS.md pointers
- [ ] Running the same task with and without AGENTS.md shows similar or better performance with the lean version (validate the research yourself)

---

## Phase 4: Skills — Procedural Knowledge

**Goal**: Create 3 human-authored skills based on SkillsBench findings.
Procedural, focused, moderate length.

**Duration**: 2-3 hours

**Research constraints**:
- 2-3 skills optimal (more shows diminishing returns) — SkillsBench Finding 5
- Moderate length outperforms comprehensive docs — SkillsBench Finding 6
- Self-generated skills provide zero benefit — SkillsBench Finding 3
- Skills must be procedural ("how to do X"), not declarative — SkillsBench §2.1

### Step 4.1: Create git-workflow Skill

**File**: `~/.config/opencode/skills/git-workflow/SKILL.md`

```markdown
---
name: git-workflow
description: Procedures for commits, branches, and pull requests following conventional commits
---

## Commit Messages

Format: `type(scope): description`

Types: feat, fix, refactor, docs, test, chore, ci
Scope: the module or area affected (e.g., auth, api, pipeline)

Examples:
- `feat(auth): add OAuth2 PKCE flow`
- `fix(pipeline): handle null values in transform step`
- `refactor(api): extract validation into middleware`

## Branch Naming

Format: `type/short-description`
Examples: `feat/oauth-pkce`, `fix/null-pipeline`, `refactor/api-validation`

## Before Committing

1. Run the project's test suite
2. Run type checker (mypy)
3. Run linter (ruff check && ruff format)
4. Stage only related changes (no unrelated files)
5. Write a commit message following the format above

## Pull Requests

1. Title matches the primary commit message
2. Description includes: what changed, why, how to test
3. Link related issues if they exist
```

### Step 4.2: Create code-quality Skill

**File**: `~/.config/opencode/skills/code-quality/SKILL.md`

```markdown
---
name: code-quality
description: Python quality procedures for type checking, linting, and testing conventions
---

## Quality Check Procedure

Run these in order after making changes:

1. `ruff check . --fix` — auto-fix lint issues
2. `ruff format .` — format code
3. `mypy src/ --strict` — type check
4. `pytest -x --tb=short` — run tests (stop on first failure)

## When Type Checking Fails

- Add type annotations to new functions (all parameters + return type)
- Use `from __future__ import annotations` for forward references
- Prefer `X | None` over `Optional[X]` (Python 3.10+)
- For complex types, create TypeAlias or TypedDict in a `types.py` module

## When Tests Fail

- Read the failure message before modifying code
- Check if the test itself is wrong (testing old behavior after intentional change)
- If adding new functionality, write tests BEFORE implementation when possible
- Name tests: `test_<function>_<scenario>_<expected>`
- Use fixtures for shared setup, parametrize for variant testing

## Code Patterns

- Use specific exceptions, never bare `except:`
- Log errors with context before re-raising
- Validate at boundaries (function entry, API endpoints, config loading)
- Prefer dataclasses or Pydantic models over raw dicts
```

### Step 4.3: Create project-setup Skill

**File**: `~/.config/opencode/skills/project-setup/SKILL.md`

```markdown
---
name: project-setup
description: Procedures for scaffolding new Python projects with uv, src layout, and CI
---

## New Project Scaffold

1. `uv init --name <project-name>` — create project
2. Use src layout: `src/<package_name>/`
3. Add to pyproject.toml:
   - `[tool.ruff]` section with target-version = "py312"
   - `[tool.mypy]` section with strict = true
   - `[tool.pytest.ini_options]` with testpaths = ["tests"]

## Directory Structure

```
src/<package>/
├── __init__.py
├── __main__.py           # CLI entrypoint (if applicable)
├── config.py             # Settings/configuration
├── models/               # Data models (Pydantic/dataclasses)
├── services/             # Business logic
└── adapters/             # External integrations
tests/
├── conftest.py           # Shared fixtures
├── test_<module>.py      # Mirror src/ structure
```

## Dependency Management

- `uv add <package>` — add runtime dependency
- `uv add --dev <package>` — add dev dependency
- Pin major versions, allow minor/patch: `package>=1.2,<2`
- Common dev deps: pytest, mypy, ruff, pre-commit
```

### Success Criteria — Phase 4
- [ ] All three skills appear in the `skill` tool's `<available_skills>` list
- [ ] Agent loads git-workflow skill when asked to commit changes
- [ ] Agent loads code-quality skill when asked to fix types or lint
- [ ] Agent loads project-setup skill when asked to scaffold a project
- [ ] Skills are NOT loaded when they're not relevant (no unnecessary context)
- [ ] Token usage does not increase significantly for tasks that don't trigger skills

---

## Phase 5: Custom Commands — Workflow Shortcuts

**Goal**: Encode your most common workflows as commands, reducing prompt
engineering overhead and ensuring consistency.

**Duration**: 2-3 hours

### Step 5.1: Create /plan Command

**File**: `~/.config/opencode/commands/plan.md`

```markdown
---
description: Create a development plan for a task
agent: engineer
---

Analyze the following task and create a detailed implementation plan.

First, explore the codebase to understand the relevant files and patterns.
Then create a plan with:
1. Numbered steps with clear descriptions
2. Files to modify/create per step
3. Validation criteria per step
4. Risks and mitigations

Write the plan to docs/plans/active/$1.md if the docs/plans/active/ directory exists.

Task: $ARGUMENTS
```

### Step 5.2: Create /build Command

**File**: `~/.config/opencode/commands/build.md`

```markdown
---
description: Execute a development plan
agent: engineer
---

Read the plan at docs/plans/active/$1.md and implement it step by step.

For each step:
1. Implement the change
2. Run validation (tests, types, lint)
3. If validation fails, fix before proceeding

After all steps are complete:
1. Run full validation suite
2. Move the plan to docs/plans/completed/
3. Summarize what was done

Plan: $ARGUMENTS
```

### Step 5.3: Create /review Command

**File**: `~/.config/opencode/commands/review.md`

```markdown
---
description: Review recent changes for quality
agent: scout
subtask: true
---

Review the following changes:

!`git diff --stat`

!`git diff`

Check for:
- Correctness and edge cases
- Type safety
- Test coverage (are new paths tested?)
- Security issues
- Style consistency with existing code

Provide a verdict: PASS, NEEDS_FIX (list specific issues), or MAJOR_ISSUES (list blockers).
```

### Step 5.4: Create /commit Command

**File**: `~/.config/opencode/commands/commit.md`

```markdown
---
description: Create a well-structured commit
agent: scout
subtask: true
---

Staged changes:
!`git diff --cached --stat`

!`git diff --cached`

Create a commit message following conventional commits format:
- type(scope): description
- Body explaining what changed and why (if non-obvious)

Then run: `git commit -m "<your message>"`
```

### Success Criteria — Phase 5
- [ ] `/plan add user authentication` creates a plan document
- [ ] `/build user-auth` reads the plan and executes it
- [ ] `/review` produces a quality assessment of staged changes
- [ ] `/commit` creates well-formatted commit messages
- [ ] Commands use the correct agent (engineer for plan/build, scout for review/commit)

---

## Phase 6: Wisdom Accumulation — Learning Across Tasks

**Goal**: Capture patterns, mistakes, and decisions from completed tasks so
future tasks benefit. Inspired by oh-my-opencode's "notepads" system and GLM's
wisdom accumulation concept.

**Duration**: 2-3 hours

### Step 6.1: Create Wisdom Capture Command

**File**: `~/.config/opencode/commands/capture.md`

```markdown
---
description: Capture learnings from a completed task
agent: scout
subtask: true
---

Review the recent work in this session and capture learnings.

!`git log --oneline -10`

For each category, add entries to the appropriate file (create if missing):

**docs/wisdom/patterns.md** — Useful patterns discovered:
- Code patterns that worked well
- Approaches that proved effective

**docs/wisdom/mistakes.md** — Mistakes to avoid:
- What went wrong and how it was fixed
- Anti-patterns encountered

**docs/wisdom/decisions.md** — Key decisions:
- Trade-offs considered
- Why a particular approach was chosen

Only add genuinely new insights. Do not duplicate existing entries.

$ARGUMENTS
```

### Step 6.2: Wire Wisdom into Engineer's Workflow

Update engineer.md's prompt to include:

```
Before planning a complex task, check if docs/wisdom/ exists in this project.
If it does, read the relevant files to learn from past experience.
```

This is a light touch — the engineer checks for wisdom but isn't forced to
follow it. The wisdom files are part of the progressive disclosure system
(AGENTS.md points to docs/, which contains wisdom/).

### Success Criteria — Phase 6
- [ ] `/capture` produces meaningful entries in docs/wisdom/
- [ ] On a second similar task, engineer references wisdom from the first
- [ ] Wisdom files stay concise (not growing unboundedly)
- [ ] The second task is measurably faster or higher quality than the first

---

## Phase 7: Light Plugins — Lifecycle Hooks

**Goal**: Add TypeScript plugins for capabilities that pure config cannot express.
Only the two most valuable ones.

**Duration**: 1-2 hours

### Step 7.1: Session Notification Plugin

**File**: `~/.config/opencode/plugins/session-notify.ts`

```typescript
export const SessionNotify = async ({ $ }) => ({
  event: async ({ event }) => {
    if (event.type === "session.idle") {
      await $`osascript -e 'display notification "Task completed" with title "OpenCode"'`
    }
    if (event.type === "session.error") {
      await $`osascript -e 'display notification "Task failed — check session" with title "OpenCode" sound name "Basso"'`
    }
  }
})
```

### Step 7.2: Sensitive File Protection Plugin

**File**: `~/.config/opencode/plugins/env-protection.ts`

```typescript
export const EnvProtection = async () => ({
  "tool.execute.before": async (input, output) => {
    if (input.tool === "read") {
      const path = output.args.filePath || ""
      if (/\.(env|pem|key|secret|credentials)/.test(path) ||
          path.includes(".secrets/")) {
        throw new Error(`Blocked: reading sensitive file ${path}`)
      }
    }
  }
})
```

### Success Criteria — Phase 7
- [ ] macOS notification fires when a long-running task completes
- [ ] macOS notification fires (with sound) when a task errors
- [ ] Attempting to read .env files is blocked with a clear error
- [ ] Plugins don't interfere with normal operation

---

## Phase 8: Domain-Specific Skills + Agent #3 Placeholder

**Goal**: Add project-specific skills for data/ML work and sketch the future
autonomous agent.

**Duration**: 2-3 hours

### Step 8.1: Create data-pipeline Skill (Project-Specific)

**File**: `<project>/.opencode/skills/data-pipeline/SKILL.md`

```markdown
---
name: data-pipeline
description: Procedures for building and testing data pipelines with validation and error handling
---

## Pipeline Structure

1. Extract: fetch data from source with retry logic
2. Validate: schema validation at ingestion (fail fast on bad data)
3. Transform: pure functions, no side effects, independently testable
4. Load: idempotent writes (upsert, not insert)

## Error Handling

- Wrap each stage in try/except with structured logging
- Distinguish retryable errors (network, timeout) from fatal errors (schema violation)
- Dead-letter queue pattern: log failed records, continue processing
- Always include: timestamp, record_id, stage, error_type in error logs

## Testing Pipelines

- Unit test each transform function with edge cases (null, empty, malformed)
- Integration test with sample data fixtures in tests/fixtures/
- Test idempotency: running the pipeline twice produces the same result
- Test partial failure: pipeline handles N-1 good records + 1 bad record

## Observability

- Log pipeline start/end with record counts
- Track: records_in, records_out, records_failed per stage
- Alert on: records_failed > threshold, runtime > expected
```

### Step 8.2: Create Agent #3 — auto.md (Disabled Placeholder)

**File**: `~/.config/opencode/agents/auto.md`

```markdown
---
description: Fully autonomous agent for future agentic automation experiments
mode: primary
disable: true
temperature: 0.3
permission:
  edit: allow
  bash: allow
  write: allow
---

You are an autonomous agent with full permissions. You execute tasks end-to-end
without human approval gates.

This agent is currently disabled and serves as a placeholder for future
experimentation with fully autonomous workflows.

When enabled, this agent should:
1. Accept a high-level goal
2. Autonomously discover, plan, implement, and validate
3. Only escalate to human when genuinely stuck (>3 failed attempts)
4. Operate within the project's documented architecture constraints
```

### Success Criteria — Phase 8
- [ ] data-pipeline skill loads when working on pipeline code
- [ ] data-pipeline skill does NOT load for unrelated tasks
- [ ] auto agent is not visible in the Tab cycle or @ menu (disabled)
- [ ] auto agent can be enabled by changing `disable: false` for experimentation

---

## Phase 9: Refinement + Maintenance Rhythm

**Goal**: Establish the ongoing maintenance practices that prevent context
staleness (the #1 risk identified by both research papers).

**Duration**: Ongoing (30 min/week)

### Step 9.1: Create /audit Command

**File**: `~/.config/opencode/commands/audit.md`

```markdown
---
description: Check context files for staleness
agent: scout
subtask: true
---

Audit the project's context files for accuracy:

Recent changes:
!`git log --oneline -20`

Files to check:
1. AGENTS.md — Is the project description still accurate? Are gotchas still relevant?
2. docs/architecture.md — Does it reflect the current architecture?
3. docs/wisdom/ — Are entries still applicable?

For each file, report: CURRENT (no changes needed), STALE (specific issues), or MISSING (should exist but doesn't).
```

### Step 9.2: Progressive Autonomy Playbook

As trust builds with the harness, progressively relax constraints:

**Month 1** (learning):
- scout: all writes = ask
- engineer: all writes = ask
- Manually review all plans before execution

**Month 2** (comfort):
- scout: `git status`, `git diff`, `git log` = allow (safe read-only git commands)
- engineer: allow specific bash patterns (`pytest *`, `mypy *`, `ruff *`)
- Review plans for complex tasks only

**Month 3+** (confidence):
- Consider enabling auto agent for specific, well-defined task types
- Add more skills based on observed patterns
- Relax engineer's permissions for well-tested codebases

### Step 9.3: The Feedback Hierarchy

When the agent does something wrong, fix it in this order (from Theo's video):

1. **Fix the codebase** — Better naming, clearer types, missing tests, structural improvements. This helps ALL future agents AND human developers.
2. **Fix the tooling** — Better linter rules, stricter type checking, improved CI. Mechanically enforced, impossible to ignore.
3. **Add a skill** — If the mistake is procedural (wrong workflow, missed step), encode the correct procedure as a skill.
4. **Update AGENTS.md gotchas** — Only as a last resort, for things that can't be fixed in code or tooling.
5. **Update agent prompt** — Almost never needed. If you're here, reconsider steps 1-4.

---

## File Manifest

All files created across all phases, in order:

| Phase | File | Location | Type |
|-------|------|----------|------|
| 1 | `opencode.json` | `~/.config/opencode/` | Config |
| 1 | `AGENTS.md` | `~/.config/opencode/` | Rules |
| 1 | `scout.md` | `~/.config/opencode/agents/` | Agent |
| 1 | `engineer.md` | `~/.config/opencode/agents/` | Agent |
| 2 | `discoverer.md` | `~/.config/opencode/agents/subagents/` | Subagent |
| 2 | `planner.md` | `~/.config/opencode/agents/subagents/` | Subagent |
| 2 | `implementer.md` | `~/.config/opencode/agents/subagents/` | Subagent |
| 2 | `reviewer.md` | `~/.config/opencode/agents/subagents/` | Subagent |
| 3 | `AGENTS.md` | `<project>/` | Rules |
| 3 | `opencode.json` | `<project>/.opencode/` | Config |
| 3 | `docs/architecture.md` | `<project>/docs/` | Knowledge |
| 3 | `docs/decisions/001-template.md` | `<project>/docs/decisions/` | Template |
| 3 | `docs/wisdom/` (empty) | `<project>/docs/wisdom/` | Directory |
| 4 | `SKILL.md` | `~/.config/opencode/skills/git-workflow/` | Skill |
| 4 | `SKILL.md` | `~/.config/opencode/skills/code-quality/` | Skill |
| 4 | `SKILL.md` | `~/.config/opencode/skills/project-setup/` | Skill |
| 5 | `plan.md` | `~/.config/opencode/commands/` | Command |
| 5 | `build.md` | `~/.config/opencode/commands/` | Command |
| 5 | `review.md` | `~/.config/opencode/commands/` | Command |
| 5 | `commit.md` | `~/.config/opencode/commands/` | Command |
| 6 | `capture.md` | `~/.config/opencode/commands/` | Command |
| 7 | `session-notify.ts` | `~/.config/opencode/plugins/` | Plugin |
| 7 | `env-protection.ts` | `~/.config/opencode/plugins/` | Plugin |
| 8 | `SKILL.md` | `<project>/.opencode/skills/data-pipeline/` | Skill |
| 8 | `auto.md` | `~/.config/opencode/agents/` | Agent |
| 9 | `audit.md` | `~/.config/opencode/commands/` | Command |

---

## Appendix: Research References

| Source | Key Finding | How It Shapes This Plan |
|--------|-------------|------------------------|
| **SkillsBench** (Li et al., 2026) | 2-3 curated skills +16.2pp; self-generated skills ≈ 0 benefit; moderate length > comprehensive | Phase 4 limits to 3 skills, all human-authored |
| **Evaluating AGENTS.md** (Gloaguen et al., 2026) | LLM-generated context files -3% performance, +20% cost; developer-written only +4%; context files = redundant docs | Phase 3 keeps AGENTS.md under 100 lines |
| **OpenAI Harness Engineering** (Lopopolo, 2026) | AGENTS.md as table of contents; progressive disclosure; enforce via linters; agent legibility > human readability; doc gardening | Phases 3, 9 architecture directly follows this |
| **Theo — Context Management** (2026) | Models find info themselves; only add persistent mistakes to AGENTS.md; lie strategically; better tests > bigger context files | Phase 9 feedback hierarchy; Phase 3 gotchas approach |
| **12 Factor Agents** (HumanLayer) | Context window management; natural language as the glue; own the control flow | Overall architecture; progressive autonomy model |
| **Agentic Context Engineering** (Stanford/SambaNova, ICLR 2026) | Brevity bias drops domain insights; context collapse erodes details; evolve contexts systematically | Wisdom accumulation in Phase 6 |
| **Deep Agents / Context Rot** (Chroma, LangChain) | Context rot degrades performance as window fills; subagent isolation preserves quality | Phase 2 subagent architecture |
