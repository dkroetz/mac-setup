# Baseline Report (Phase 0)

Date: 2026-03-03
Scope: snapshot + initial benchmark/instrumentation contract

## Snapshot A: `~/.config/opencode`

- Git HEAD: `6cb0593`
- Git status: dirty (`AGENT_REFINEMENT_EXECUTION_SPEC.md`, `AGENT_REFINEMENT_PLAN.md` untracked)
- Config profile: `opencode.json` uses conservative defaults (`edit=ask`, `write=ask`, most `bash=*` ask except read-only allowlist)
- Subagents present: `planner`, `implementer`, `reviewer` (no `discoverer` yet)
- Commands present: `add-context`, `audit`, `build`, `capture`, `commit`, `context`, `plan`, `review`
- Skills present: `code-quality`, `git-workflow`, `project-setup`

### File Integrity Snapshot (SHA-256 short)

```
f58d1ba4f8aa  AGENTS.md
9e7acc449af1  agents/auto.md
e901e694b47d  agents/engineer.md
785ce990ab9a  agents/scout.md
c88749e1fdf3  agents/subagents/implementer.md
fc603b5762a1  agents/subagents/planner.md
35a5970cdb36  agents/subagents/reviewer.md
a04d3f1d2dad  commands/add-context.md
168c5883f02e  commands/audit.md
cebb59a40553  commands/build.md
467088f05bd0  commands/capture.md
5bc5f16d9c5a  commands/commit.md
dc894841a8e3  commands/context.md
98894b5d70ac  commands/plan.md
3f76cc0f047b  commands/review.md
e40f7ffd61cb  opencode.json
fcae338ce6e6  skills/code-quality/SKILL.md
0c96565cb785  skills/git-workflow/SKILL.md
40b304ea6544  skills/project-setup/SKILL.md
```

## Snapshot B: `~/Projects/futilify`

- Git HEAD: `c6751d2`
- Git status: clean
- Project AGENTS mandates broad preflight context loading (all non-trivial tasks)
- Project opencode config injects `.agents/context/architecture.md`
- Context assets present: `project-intelligence`, `architecture`, wisdom docs, decisions template, plan READMEs

### File Integrity Snapshot (SHA-256 short)

```
10723a83f66f  .agents/context/architecture.md
8815ef333dd4  .agents/context/decisions/000-template.md
92fbb4c0304d  .agents/context/plans/active/README.md
2e995a59b4e7  .agents/context/plans/completed/README.md
bab34b2d231f  .agents/context/project-intelligence.md
3df3d17d3835  .agents/context/wisdom/decisions.md
bd694bc36fbb  .agents/context/wisdom/mistakes.md
62a13c269775  .agents/context/wisdom/patterns.md
e256ab7e1c33  .opencode/opencode.json
68b107402a35  AGENTS.md
```

## Benchmark Set

- Defined in `benchmark-task-set.md`
- Size: 12 tasks
- Coverage check:
  - bugfix: yes
  - feature: yes
  - refactor: yes
  - context-heavy: yes
  - command-driven: yes

## Baseline Metrics (Initial Capture)

Measurement status: instrumentation contract established; benchmark executions not yet run in this phase.

| Metric | Baseline value | Notes |
|---|---:|---|
| Success rate | `TBD` | To be computed as `pass / total` over 12 benchmark tasks |
| Time-to-first-meaningful-edit | `TBD` | Per-task stopwatch from prompt start to first accepted code/config diff |
| Token usage | `TBD` | Requires per-task token accounting from run logs |
| Human intervention count | `TBD` | Count explicit human correction/redirect events per task |
| Post-first-pass fix rate | `TBD` | Fraction of tasks needing >=1 follow-up fix after first pass |

## Instrumentation Method (Locked for Next Phase Runs)

1. Run all 12 benchmark tasks against current configuration/profile.
2. For each run, capture: outcome, timestamps, token usage, intervention events, and follow-up fixes.
3. Aggregate metrics using the formulas in the table above.
4. Store per-task evidence under a future `agent-evals/` directory (planned in Phase 6).

## Risks / Open Questions

- Token accounting source of truth is not yet wired into a stable machine-readable report.
- Intervention-event definition should be kept strict (only explicit human corrections) to avoid metric drift.
- Baseline values are blocked on executing the benchmark set, which is intentionally deferred to later eval-harness work.
