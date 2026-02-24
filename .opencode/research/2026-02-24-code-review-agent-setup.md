# Research: Code Review Agent Setup for OpenCode

**Date**: 2026-02-24

## Scope Scan Result

`@opencode/` is a constrained multi-agent harness (`Research -> Architect -> Implement`) with permission-first boundaries and command routers, which aligns with adding a dedicated primary code review agent.

## Skills Loaded

- None (`0`)

## Skill Loading Policy Confirmation

- Followed AGENTS policy limits: started at 0 skills and did not load unnecessary skills.

## Summary

The current OpenCode setup already uses the same primitives needed by a code review primary agent: strict permission controls, command routing, and structured output contracts. Platform documentation supports read-only review agents with granular command allowlists and task scoping. External review process references converge on diff-first review, severity-labeled findings, and human-gated approvals.

## Key Findings

### 1) Existing OpenCode Philosophy and Architecture

- The workflow is explicitly phase-based with constrained roles to reduce churn: `Research -> Architect -> Implement`.
- The setup emphasizes permission-based controls and manual verification gates.
- Agent and model assignments are centralized in global config, with built-in `build` and `plan` disabled.
- Research and architect agents already use path-scoped write permissions and task scoping, matching the same control style needed for review work.

### 2) Existing Review-Relevant Capabilities in This Repo

- The implement agent already allows review-relevant git commands (`git diff*`, `git log*`, `git status*`) via granular bash permissions.
- Command files already function as thin routers to agent behavior, which is reusable for review entrypoints.
- Project-local AGENTS policy is already the source of truth for verification and skill-loading behavior.

### 3) OpenCode Platform Capabilities for Code Review Agents

- Custom agents can be defined as primary or subagent in markdown or JSON.
- Review agents can be configured as read-only (`edit: deny`) while allowing selected analysis commands through granular `permission.bash` rules.
- Permission matching follows "last matching rule wins" semantics; broad rules can be overridden by specific later rules.
- Task permissions (`permission.task`) can restrict which subagents a review agent can invoke.
- Command templates support:
  - `$ARGUMENTS` for review target parameters,
  - `@file` references for explicit context,
  - `!` shell output injection (for command-context review prompts).

### 4) Code Review Agent Research Signals (2025-2026)

- Large-scale LLM review evaluation work reports usefulness and trust as central operating goals for production review automation.
- Practical review operations consistently separate blocking and non-blocking feedback to preserve merge flow.
- Diff-scoped review is used as the highest-signal unit for actionable findings; full-repo review is typically used for broader consistency/pattern checks.
- Human approval remains the merge authority; AI review acts as assistive review input.

## Code References

- `opencode/README.md:7`
- `opencode/README.md:11`
- `opencode/README.md:50`
- `opencode/global_scope/opencode.jsonc:3`
- `opencode/global_scope/opencode.jsonc:36`
- `opencode/global_scope/agents/research.md:6`
- `opencode/global_scope/agents/research.md:13`
- `opencode/global_scope/agents/architect.md:6`
- `opencode/global_scope/agents/implement.md:8`
- `opencode/global_scope/commands/research.md:1`
- `opencode/project_scope/.opencode/AGENTS.md:24`
- `opencode/project_scope/.opencode/opencode.jsonc:3`
- `opencode/.agent_improvement/tests/catalog.yaml:2`
- `opencode/.agent_improvement/schemas/run_record.schema.json:5`

## External References

- OpenCode Agents docs: `https://opencode.ai/docs/agents/`
- OpenCode Permissions docs: `https://opencode.ai/docs/permissions/`
- OpenCode Commands docs: `https://opencode.ai/docs/commands/`
- GitHub PR review docs: `https://docs.github.com/articles/reviewing-proposed-changes-in-a-pull-request`
- GitHub review model docs: `https://docs.github.com/articles/about-pull-request-reviews`
- Atlassian RovoDev paper: `https://arxiv.org/abs/2601.01129`

## Architecture Notes

- The current harness design is already suitable for adding one more primary agent without changing the core philosophy.
- Permission policy (`permission`) and command templates (`commands/*.md`) are the two primary integration surfaces for a review agent.
- Existing evaluation-harness artifacts in `.agent_improvement/` provide a reusable structure for behavior checks and rubric-based scoring if needed.

## Open Questions

- Should review output remain conversation-only or also be persisted to `.opencode/research/` as audit artifacts?
- Should PR review rely on local git context only, or include remote URL context via `webfetch`?
- Should severity labels be globally fixed in the review-agent prompt contract, or delegated to project-local AGENTS policy?
