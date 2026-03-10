# Agent Evals Harness

This directory contains a repeatable eval harness for agent-quality regression checks.

## Components

- `benchmark-manifest.json` — canonical benchmark task set and required category coverage
- `rubric.md` — deterministic scoring rubric (`pass`, `soft_fail`, `hard_fail`)
- `results/` — per-run artifacts
- `scripts/` — deterministic checks, comparison, and gate evaluation

## Standard Flow

1. Populate `results/before.json` and `results/after.json` with benchmark outcomes and metrics.
2. Run deterministic validation:

```bash
python3 agent-evals/scripts/deterministic_checks.py
```

3. Build before/after comparison:

```bash
python3 agent-evals/scripts/compare_runs.py
```

4. Evaluate release gate (machine-checkable):

```bash
python3 agent-evals/scripts/check_release_gate.py
```

## Output Artifacts

- `results/comparison.json`
- `results/comparison.md`
- `results/release-gate-result.json`
