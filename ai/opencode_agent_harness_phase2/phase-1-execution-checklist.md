# Phase 1 Execution Checklist

Use this checklist to execute **Phase 1** from `.opencode/plans/2026-02-23-agent-behavior-test-cases-implementation.md`.

## Objective

Create the canonical test suite definition and prompt fixtures for the 2 small + 2 medium agent-behavior tests.

## Files to Create

- `opencode/.agent_improvement/tests/catalog.yaml`
- `opencode/.agent_improvement/tests/prompts/research_paraphrase_set.md`
- `opencode/.agent_improvement/tests/prompts/architect_multisource.md`

## Implementation Steps

- [x] Create `tests/` and `tests/prompts/` directories under `opencode/.agent_improvement/`
- [x] Add `catalog.yaml` with exactly 4 tests:
  - [x] `small-1-research-skill-loading` (runs: 1)
  - [x] `small-2-architect-policy-dedup` (runs: 1)
  - [x] `medium-1-research-paraphrase-robustness` (runs: 3)
  - [x] `medium-2-architect-multisource-synthesis` (runs: 3)
- [x] Ensure each test defines:
  - [x] target agent (`research` or `architect`)
  - [x] mandatory checks (binary)
  - [x] rubric weights summing to `1.0`
- [x] Add `research_paraphrase_set.md` with 3 semantically equivalent prompt variants
- [x] Add `architect_multisource.md` with the multisource planning prompt and acceptance checklist

## Automated Verification

- [x] Confirm catalog includes exactly 4 test IDs
- [x] Confirm both medium tests are set to `runs: 3`
- [x] Confirm no `implement` agent appears in catalog

## Manual Verification

- [x] Prompt fixtures align with `.opencode/research/2026-02-23-agent-behavior-test-cases.md`
- [x] Scope is explicitly limited to `research` and `architect`
- [x] Naming is stable for downstream scripts and artifacts

## Completion Gate

Phase 1 is complete only when all checkboxes above are marked done and the new files are committed to the planned structure.
