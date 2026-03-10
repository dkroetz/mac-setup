# Maintenance Playbook

Date: 2026-03-03
Phase: 7 (Rollout and Maintenance Rhythm)

## Weekly Rhythm

Run one maintenance cycle per week with this sequence:

1. Execute `/audit` in active projects.
2. Prune stale context entries in `.opencode/context/`.
3. Review top failure modes from `agent-evals/results/`.
4. Ship one controlled improvement (single change theme only).

## Weekly Checklist

- `/audit` completed for all active repos
- Stale/missing context entries triaged
- Failure review documented (top 1-3 issues)
- One improvement selected, implemented, and validated
- Eval gate run after change:
  - `python3 agent-evals/scripts/deterministic_checks.py`
  - `python3 agent-evals/scripts/compare_runs.py`
  - `python3 agent-evals/scripts/check_release_gate.py`

## Controlled Improvement Rules

- Limit to one of: prompt cleanup, permission tuning, command/skill boundary refinement, or subagent contract update.
- Do not combine multiple policy themes in one cycle.
- Require release gate pass before considering rollout.

## Failure Review Template

For each top issue:

- Symptom: what failed
- Trigger: what caused it
- Detection: how it was found
- Fix: what changed
- Guardrail: what prevents recurrence

## Exit Criteria for a Healthy Week

- Release gate status: pass
- Success rate: no regression
- Intervention count: reduced or stable
- Token profile: <=10% growth (or improved)
