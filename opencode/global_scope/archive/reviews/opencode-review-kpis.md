# OpenCode Review KPI Plan

Review date: 2026-03-03
Scope: global harness + `futilify` project example

## Baseline capture policy

- Baseline window: next 10-20 representative tasks before major harness changes.
- Capture method: append one row per task to a local CSV/log artifact.
- Baseline status (today): **Not yet instrumented** (`0` measured tasks).

## Core KPIs

1. **Task success rate by type** (bugfix/feature/refactor/review/context)
   - Baseline value: `TBD` (capture first measurement window)
   - Target direction: up or stable

2. **Median time to first meaningful edit**
   - Baseline value: `TBD`
   - Target direction: down

3. **Median total task duration**
   - Baseline value: `TBD`
   - Target direction: down

4. **Human intervention rate** (asks/blockers per task)
   - Baseline value: `TBD`
   - Target direction: down

5. **Rework rate** (tasks needing corrective pass)
   - Baseline value: `TBD`
   - Target direction: down

6. **Token usage trend** (input/output/reasoning where available)
   - Baseline value: `TBD`
   - Target direction: down or stable with equal/better quality

7. **Skill trigger precision** (false positives/false negatives)
   - Baseline value: `TBD`
   - Target direction: down for FP/FN

8. **Subagent usefulness score** (subjective 1-5 + notes)
   - Baseline value: `TBD`
   - Target direction: up

## Checkpoint cadence

- Weekly: rolling summary for top 3 friction sources
- Biweekly: compare KPI deltas vs previous checkpoint
- Monthly: full trend review and one controlled harness change decision

## Minimum data schema (per task)

- date
- repo/project
- task_type
- success (`yes/no`)
- first_edit_minutes
- total_minutes
- interventions_count
- rework_required (`yes/no`)
- estimated_tokens_in
- estimated_tokens_out
- primary_failure_taxonomy (if failed)
- notes
