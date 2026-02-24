# Implementation Plan: Review Findings Follow-ups

**Date**: 2026-02-24
**Research**: `.opencode/research/2026-02-24-code-review-agent-setup.md`

## Domain Scope Classification

- OpenCode harness config + command-template behavior (`opencode/global_scope/commands/*.md`) + docs parity (`opencode/README.md`) to address review coverage and discoverability findings.

## Skills Loaded and Rationale

- `python-pdm` - loaded per instruction to use a domain skill; reused verification discipline while implementing markdown-centric changes.

## Skill-Loading Policy Confirmation

- Stayed within `.opencode/AGENTS.md` policy limits (loaded 1 skill; no additional skills required).

## Overview

Fix review command prompts so `/review` and `/review-diff` include staged changes explicitly, then update README to document `/review-pr` for command discoverability.

## What We're NOT Doing

- Not changing review-agent permissions in `opencode/global_scope/agents/review.md`
- Not changing model config entries in `opencode/global_scope/opencode.jsonc` or project config
- Not adding remote PR API integration or `webfetch` behavior
- Not redesigning severity taxonomy or review output schema

---

## Phase 1: Fix Diff Coverage for Staged Changes

### Overview

Update command templates so review prompts always include both unstaged and staged contexts.

### Specific File Changes

**`opencode/global_scope/commands/review-diff.md`** — update staged + unstaged context injection:

```markdown
---
description: Review current git diff
agent: review
---
Review the current branch changes using:

# Unstaged changes
!`git status --short`
!`git diff --stat`
!`git diff`

# Staged changes
!`git diff --cached --stat`
!`git diff --cached`

Return findings by severity and a merge recommendation.
```

**`opencode/global_scope/commands/review.md`** — clarify default no-target detection logic:

```markdown
---
description: Review code changes or codebase scope
agent: review
---
Review target:
$ARGUMENTS

If no target is provided:
1. Detect unstaged changes with `git diff`
2. Detect staged changes with `git diff --cached`
3. If no diff exists in either scope, perform a scoped full-codebase review

Use severity labels:
- Critical (block merge)
- High (fix before merge)
- Medium (should fix)
- Low/Nit (optional)

Include file:line references and concrete fixes.
```

### Success Criteria

#### Automated Verification:

- [x] `git diff -- opencode/global_scope/commands/review-diff.md` shows explicit staged + unstaged coverage
- [x] `git diff -- opencode/global_scope/commands/review.md` no longer implies `git diff` alone covers staged changes
- [x] `git diff -- opencode/global_scope/commands/review.md` preserves severity guidance and output contract intent

#### Manual Verification:

- [ ] Run `/review-diff` with only staged changes; prompt context includes cached diff output
- [ ] Run `/review-diff` with only unstaged changes; prompt context includes unstaged diff output
- [ ] Run `/review` with no args and mixed staged/unstaged changes; agent reviews complete scope

**Pause for manual verification before proceeding to next phase**

---

## Phase 2: Documentation Parity for `/review-pr`

### Overview

Update README Optional Quality Gate section to include `/review-pr <context>` usage.

### Specific File Changes

**`opencode/README.md`** — document PR-context review path:

```markdown
### Optional Quality Gate: Review

Use `/review-diff` before merge to catch correctness, security, and maintainability risks.
Use `/review` for broader architectural consistency checks.
Use `/review-pr <context>` for PR-style review from supplied context and referenced files.

This does not replace the core workflow:

Research -> Architect -> Implement

It complements it with a focused read-only review pass.
```

### Success Criteria

#### Automated Verification:

- [x] `git diff -- opencode/README.md` shows `/review-pr <context>` in the review section
- [x] No unrelated README sections changed

#### Manual Verification:

- [ ] Reader can discover all review entrypoints (`/review`, `/review-diff`, `/review-pr`) from README alone
- [ ] Workflow framing still positions review as optional and complementary

**Pause for manual verification before proceeding to next phase**

---

## Testing Strategy

- Diff-based verification for touched files:
  - `git diff -- opencode/global_scope/commands/review-diff.md`
  - `git diff -- opencode/global_scope/commands/review.md`
  - `git diff -- opencode/README.md`
- Interactive smoke checks:
  1. `/review-diff` with staged-only change set
  2. `/review-diff` with unstaged-only change set
  3. `/review` with mixed staged/unstaged change set

## References

- `.opencode/research/2026-02-24-code-review-agent-setup.md`
- `opencode/global_scope/commands/review-diff.md`
- `opencode/global_scope/commands/review.md`
- `opencode/global_scope/commands/review-pr.md`
- `opencode/README.md`
- `.opencode/AGENTS.md`
