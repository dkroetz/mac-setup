# Project Intelligence

Concise, durable context for this OpenCode harness. Keep this file focused on
stable project facts and canonical operating patterns.

## Project Snapshot

- Purpose: global OpenCode harness with primary agents, subagents, commands,
  skills, plugins, and context-management artifacts
- Primary agents: `scout` for ask-oriented interaction, `engineer` for
  implementation, `auto` for disabled bounded-autonomy experiments
- Core principle: keep top-level instructions lean and use progressive
  disclosure for deeper context

## Memory Model

Use these files for distinct kinds of memory:

- `AGENTS.md` - global preferences and navigation pointers; short and stable
- `.agents/context/project-intelligence.md` - durable project facts,
  operating model, and canonical harness patterns for this repo
- `.agents/context/plans/active/` - in-flight implementation plans
- `.agents/context/plans/completed/` - completed plans kept for history
- `.agents/context/decisions/` - architecture decisions and durable tradeoffs
- `.agents/context/wisdom/patterns.md` - reusable patterns that worked well
- `.agents/context/wisdom/mistakes.md` - non-obvious failure modes to avoid
- `.agents/context/wisdom/decisions.md` - durable decisions without a full
  ADR-style writeup

## Canonical Harness Patterns

- Agent topology stays small and distinct: lightweight ask-oriented `scout`,
  implementation-oriented `engineer`, disabled experimental `auto`
- Planning should be concrete, phase-based, and validation-aware
- Plans should use a stable per-phase contract so `/build` can execute them
  with minimal interpretation
- Prompt guidance should stay thin at the top level; repeated procedures belong
  in commands, skills, or deeper context files
- Durable state should live in repo files rather than only in conversation
  history
- Higher-autonomy behavior should stay explicit and bounded rather than become
  the default interaction mode

## Context Update Rules

- Add stable project facts here when they will matter across many future tasks
- Do not copy transient task notes or long implementation history into this
  file
- Put task-specific execution details in plans, not here
- Put reusable learnings in `wisdom/`, not here
- Put explicit architectural choices in `decisions/` when rationale matters

## Key References

- Agents: `agents/scout.md`, `agents/engineer.md`, `agents/auto.md`
- Commands: `commands/plan.md`, `commands/build.md`, `commands/context.md`,
  `commands/capture.md`, `commands/research-deep.md`
- Maintenance: `MAINTENANCE.md`
- Research note: `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`

## Metadata

- Last updated: 2026-03-09
- Source: repo-local harness review and research synthesis
