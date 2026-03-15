# Agent Improvement Harness

This directory contains lightweight evaluation assets for behavior consistency and policy adherence in the OpenCode staged workflow.

## Purpose

- Define repeatable prompt fixtures and scoring rubrics
- Capture per-run pass/fail signals and weighted rubric scores
- Detect regressions in research/architect agent behavior

## Contents

- `tests/catalog.yaml` - canonical test suite definition (IDs, runs, checks, fixtures)
- `tests/rubric_weights.yaml` - rubric and mandatory check definitions
- `tests/prompts/` - reusable prompt fixtures for small and medium tests
- `schemas/run_record.schema.json` - JSON schema for run-result records
- `phase-1-execution-checklist.md` - execution checklist for the initial suite setup
- `yt_transcript.txt` - context notes on minimal-context and instruction-file tradeoffs

## Execution Model

- Small tests run once (`runs: 1`)
- Medium robustness tests run three times (`runs: 3`)
- Mandatory checks are hard gates
- Rubric score (`weighted_total`) is a soft quality signal from 0 to 1

## Suggested Run Procedure

1. Pick a test ID from `tests/catalog.yaml`
2. Use the referenced fixture prompt (`prompt_fixture`)
3. Execute the target agent (`research` or `architect`) for the configured run count
4. Record each run using `schemas/run_record.schema.json`
5. Compare mandatory checks and rubric stability across runs

## Known Gap

- `phase-1-execution-checklist.md` references a plan path. Keep that reference aligned with existing files in `.opencode/plans/` when plans are renamed or archived.

## Out of Scope

- No CI coupling by default
- No automatic scoring engine in this directory
- No implement-agent benchmarks yet (current scope is research + architect)
