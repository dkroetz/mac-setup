# Implementation Plan: Code Review Primary Agent

**Date**: 2026-02-24
**Research**: `.opencode/research/2026-02-24-code-review-agent-setup.md`

## Domain Scope Classification

- OpenCode harness configuration update (`opencode/global_scope` + optional `project_scope` parity) to add a new primary code review agent.

## Skills Loaded and Rationale

- None (`0`) — task is markdown/json agent wiring, not Python/Postgres domain implementation.

## Skill-Loading Policy Confirmation

- Stayed within `.opencode/AGENTS.md` policy limits (start with 0, load only if needed).

## Overview

Add one new primary `review` agent that supports full-codebase review, git-diff review, and PR-style context review. Wire it through config and slash commands while preserving the existing `Research -> Architect -> Implement` core workflow.

## What We're NOT Doing

- Not replacing or renaming existing primary agents (`research`, `architect`, `implement`, `google`)
- Not changing current permission boundaries for existing agents
- Not building GitHub/GitLab API integrations in this pass
- Not adding automatic posting to PR review threads
- Not introducing new domain skills specifically for review

---

## Phase 1: Add Primary Review Agent Definition

### Overview

Create a new primary review agent with read-only file behavior, constrained bash allowlist for review commands, and a strict output contract with severity levels.

### Specific File Changes

**`opencode/global_scope/agents/review.md`** — create file:

```markdown
---
description: Reviews full codebases, git diffs, or PR-scoped changes with severity-tagged findings
mode: primary
color: "#2f7cf6"
steps: 40
permission:
  edit: deny
  bash:
    "*": ask
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "grep *": allow
  task:
    "*": deny
    "explore": allow
  webfetch: deny
---

# Review Agent

You are a code review agent. Review in one of three modes:
1) full-codebase review, 2) diff review, 3) PR-context review.

Output sections:
- Scope
- Findings by severity (Critical, High, Medium, Low/Nit)
- Positive notes
- Merge recommendation (Approve / Comment / Request changes)
```

### Success Criteria

#### Automated Verification:

- [x] `git diff -- opencode/global_scope/agents/review.md` shows read-only permission posture (`edit: deny`)
- [x] `git diff -- opencode/global_scope/agents/review.md` shows bash allowlist for `git diff*`, `git log*`, `git status*`, `grep *`
- [x] `git diff -- opencode/global_scope/agents/review.md` shows explicit severity-based output contract

#### Manual Verification:

- [ ] Switching to `review` agent works in TUI
- [ ] Agent can inspect repo state (`git diff`, `git log`) without prompting for each allowed command
- [ ] Agent does not attempt file edits during normal review flow

**Pause for manual verification before proceeding to next phase**

---

## Phase 2: Add Review Commands for Full / Diff / PR Workflows

### Overview

Provide slash commands so one primary review agent can be invoked consistently for three scopes: general review, local diff review, and PR-context review.

### Specific File Changes

**`opencode/global_scope/commands/review.md`** — create file:

```markdown
---
description: Review code changes or codebase scope
agent: review
---
Review target:
$ARGUMENTS

If no target is provided:
1. Detect unstaged/staged changes with `git diff`
2. If no diff exists, perform a scoped full-codebase review

Use severity labels:
- Critical (block merge)
- High (fix before merge)
- Medium (should fix)
- Low/Nit (optional)

Include file:line references and concrete fixes.
```

**`opencode/global_scope/commands/review-diff.md`** — create file:

```markdown
---
description: Review current git diff
agent: review
---
Review the current branch changes using:
!`git status --short`
!`git diff --stat`
!`git diff`

Return findings by severity and a merge recommendation.
```

**`opencode/global_scope/commands/review-pr.md`** — create file:

```markdown
---
description: Review PR-style context from arguments
agent: review
---
Review this PR context:
$ARGUMENTS

Use any referenced files (`@path`) and local git history as needed.
Return severity-tagged findings and final recommendation.
```

### Success Criteria

#### Automated Verification:

- [x] `git diff -- opencode/global_scope/commands/review.md` exists and routes to `agent: review`
- [x] `git diff -- opencode/global_scope/commands/review-diff.md` includes git diff context injection
- [x] `git diff -- opencode/global_scope/commands/review-pr.md` supports argument-driven PR context

#### Manual Verification:

- [ ] `/review` executes with the `review` agent
- [ ] `/review-diff` returns actionable findings on local changes
- [ ] `/review-pr <context>` returns structured review output

**Pause for manual verification before proceeding to next phase**

---

## Phase 3: Wire Config and Keep Global/Project Parity

### Overview

Register the new primary `review` model assignment in global config and keep project-scope config aware of the new agent name.

### Specific File Changes

**`opencode/global_scope/opencode.jsonc`** — add primary agent entry:

```jsonc
{
  "agent": {
    "research": { "model": "openai/gpt-5.3-codex" },
    "architect": { "model": "openai/gpt-5.3-codex" },
    "implement": { "model": "openai/gpt-5.3-codex" },
    "google": { "model": "openai/gpt-5.3-codex" },
    "review": { "model": "openai/gpt-5.3-codex" }
  }
}
```

**`opencode/project_scope/.opencode/opencode.jsonc`** — add primary agent key:

```jsonc
{
  "agent": {
    "research": {},
    "architect": {},
    "implement": {},
    "google": {},
    "review": {}
  }
}
```

### Success Criteria

#### Automated Verification:

- [ ] `python3 -m json.tool opencode/global_scope/opencode.jsonc >/dev/null`
- [ ] `python3 -m json.tool opencode/project_scope/.opencode/opencode.jsonc >/dev/null`
- [x] `git diff -- opencode/global_scope/opencode.jsonc` shows only `review` addition
- [x] `git diff -- opencode/project_scope/.opencode/opencode.jsonc` shows only `review` addition

#### Manual Verification:

- [ ] `review` appears with existing primary agents in target setup
- [ ] Agent switching works without impacting existing primaries

**Pause for manual verification before proceeding to next phase**

---

## Phase 4: Document Philosophy-Aligned Usage

### Overview

Document how `review` complements but does not replace the core `Research -> Architect -> Implement` workflow.

### Specific File Changes

**`opencode/README.md`** — add review usage section:

```markdown
### Optional Quality Gate: Review

Use `/review-diff` before merge to catch correctness, security, and maintainability risks.
Use `/review` for broader architectural consistency checks.

This does not replace the core workflow:
Research -> Architect -> Implement
It complements it with a focused read-only review pass.
```

### Success Criteria

#### Automated Verification:

- [x] `git diff -- opencode/README.md` shows review positioning without replacing core workflow
- [x] No unrelated README sections changed

#### Manual Verification:

- [ ] Documentation makes invocation paths clear (`/review`, `/review-diff`, `/review-pr`)
- [ ] Team interpretation remains aligned with existing philosophy

**Pause for manual verification before proceeding to next phase**

---

## Testing Strategy

- Config/content-only verification for this implementation
- Run only checks relevant to touched files per `.opencode/AGENTS.md`:
  - `python3 -m json.tool opencode/global_scope/opencode.jsonc >/dev/null`
  - `python3 -m json.tool opencode/project_scope/.opencode/opencode.jsonc >/dev/null`
  - `git diff -- <changed-path>` for each edited file
- Manual smoke tests in TUI:
  1. Switch to `review` agent
  2. Run `/review-diff` on a small local diff
  3. Confirm severity-structured output and no file edits

## References

- `.opencode/research/2026-02-24-code-review-agent-setup.md`
- `opencode/global_scope/agents/research.md`
- `opencode/global_scope/agents/architect.md`
- `opencode/global_scope/agents/implement.md`
- `opencode/global_scope/commands/research.md`
- `opencode/global_scope/opencode.jsonc`
- OpenCode docs: `https://opencode.ai/docs/agents/`, `https://opencode.ai/docs/permissions/`, `https://opencode.ai/docs/commands/`
