# Rollout Checklist

Date: 2026-03-03
Phase: 7 (Rollout and Maintenance Rhythm)

## Rollout Sequence

1. Global setup
2. `futilify` pilot
3. Broader usage

## Stage 1: Global Setup

- [x] Prompt surface reduced and responsibility matrix established
- [x] Subagent model normalized (`discoverer`, `context-auditor`, contracts)
- [x] Balanced permission profile applied
- [x] Skills/commands boundary hardening completed
- [x] Eval harness and release gate implemented

## Stage 2: `futilify` Pilot

Pilot status: completed

Evidence sources:
- `agent-evals/results/comparison.json`
- `agent-evals/results/comparison.md`
- `agent-evals/results/release-gate-result.json`

Pilot findings:
- Success rate improved from `0.833` to `0.917` (`+0.083`)
- Token total reduced from `17860` to `16790` (`-1070`, `-5.99%`)
- Human intervention total reduced from `10` to `5`
- Avg time-to-first-meaningful-edit improved by `16.7s`
- Post-first-pass fix rate reduced from `0.417` to `0.167`
- Release gate outcome: `passed: true`

## Stage 3: Broader Usage

Go-live checklist:

- [ ] Select next 2-3 repos for adoption
- [ ] Run baseline capture using benchmark manifest shape
- [ ] Apply same gate policy (`agent-evals/release-gate.json`)
- [ ] Run one weekly maintenance cycle per repo
- [ ] Confirm no success regression after first cycle

## Rollback Triggers

Pause rollout and revert latest refinement set if either condition holds:

- Success rate regresses in two consecutive weekly cycles
- Token growth exceeds 10% without a documented, approved exception
