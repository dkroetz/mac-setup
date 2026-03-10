# Release Gate Policy

Date: 2026-03-03
Phase: 6 (Eval Harness and Regression Policy)

## Gate Rules

All checks must pass:

1. No success-rate regression (`after.success_rate >= before.success_rate`)
2. Token growth is <= 10% (`(after.token_total - before.token_total) / before.token_total <= 0.10`)
3. Human intervention count is reduced or stable (`after.intervention_total <= before.intervention_total`)

Machine-checkable policy source:

- `agent-evals/release-gate.json`

## Eval Harness Commands

```bash
python3 agent-evals/scripts/deterministic_checks.py
python3 agent-evals/scripts/compare_runs.py
python3 agent-evals/scripts/check_release_gate.py
```

## Pass/Fail Artifact

- `agent-evals/results/release-gate-result.json`

`passed: true` means the candidate configuration is releasable under this policy.
