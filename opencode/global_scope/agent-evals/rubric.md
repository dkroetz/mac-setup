# Eval Rubric

Each benchmark task must be scored with one of:

- `pass` — all acceptance checks met; no policy violations
- `soft_fail` — partially correct; one focused human correction required
- `hard_fail` — incorrect result, major policy violation, or non-working outcome

## Deterministic Checks

- Benchmark set size is between 10 and 20 tasks.
- Every task id in run results exists in `benchmark-manifest.json`.
- Each run includes all manifest tasks exactly once.
- All required categories are present in the manifest.

## Rubric Checks

For each task result:

- `score` is one of `pass`, `soft_fail`, `hard_fail`
- `human_interventions` is an integer >= 0
- `token_usage` is an integer >= 0
- `time_to_first_meaningful_edit_seconds` is a number >= 0
- `post_first_pass_fix` is boolean
