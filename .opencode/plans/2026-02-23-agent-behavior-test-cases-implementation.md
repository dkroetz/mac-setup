# Implementation Plan: Agent Behavior Test Cases

- **Domain scope classification:** Evaluation-harness planning for agent-governance behavior (`research` + `architect`) using repo-local Markdown/JSON/Python stdlib artifacts.
- **Skills loaded and rationale:** Loaded `python-pdm` to ground snippet conventions for a lightweight evaluator script and verification command style.
- **Policy-limit confirmation:** Stayed within AGENTS policy (`0-2` skills normally); loaded exactly 1 skill.

## Overview

We'll implement a lightweight, reproducible evaluation harness for the 2 small + 2 medium test cases defined in `.opencode/research/2026-02-23-agent-behavior-test-cases.md`, with hard gates + weighted scoring and persisted run artifacts under `opencode/.agent_improvement/`.
Scope is constrained to `research` and `architect` agents only, with deterministic checks first and variance tracking for medium cases.

## What We're NOT Doing

- Adding `implement`-agent test cases in this iteration
- Building CI/GitHub Actions integration in this pass
- Introducing external eval services/databases
- Rewriting existing agent prompts beyond what tests need to inspect
- Changing model routing/provider configuration

## Phase 1: Define Canonical Test Suite + Prompt Fixtures

### Overview

Create a single source of truth for test definitions, run counts, mandatory checks, and rubric dimensions so execution is deterministic.

### Specific file changes

- New: `opencode/.agent_improvement/tests/catalog.yaml`
- New: `opencode/.agent_improvement/tests/prompts/research_paraphrase_set.md`
- New: `opencode/.agent_improvement/tests/prompts/architect_multisource.md`

```yaml
# opencode/.agent_improvement/tests/catalog.yaml
version: 1
suite: agent-behavior-research-architect
tests:
  - id: small-1-research-skill-loading
    agent: research
    size: small
    runs: 1
    mandatory_checks:
      - has_scope_scan_line
      - has_skills_loaded_and_reason
      - within_skill_policy_limit
      - has_file_line_references
    rubric_weights:
      citation_quality: 0.35
      policy_adherence_clarity: 0.35
      structure_compliance: 0.30
  - id: medium-1-research-paraphrase-robustness
    agent: research
    size: medium
    runs: 3
```

### Success Criteria

#### Automated Verification:

- [ ] `python3 -m json.tool opencode/.agent_improvement/tests/fixtures/example_run_record.json >/dev/null` passes (fixture validity check)
- [x] Test catalog includes exactly 4 tests (2 small, 2 medium)
- [x] Medium tests are configured with `runs: 3`

#### Manual Verification:

- [x] Prompt fixtures are semantically aligned with research definitions
- [x] Scope remains limited to `research` + `architect`

**Pause for manual verification before proceeding to next phase**

## Phase 2: Add Scoring Contract (Schema + Rubric Config)

### Overview

Formalize mandatory gates, weighted rubric fields, and result-shape expectations so output parsing and trend analysis are stable.

### Specific file changes

- New: `opencode/.agent_improvement/schemas/run_record.schema.json`
- New: `opencode/.agent_improvement/tests/rubric_weights.yaml`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AgentBehaviorRunRecord",
  "type": "object",
  "required": ["test_id", "agent", "run_id", "mandatory_pass", "mandatory_checks", "rubric", "signals"],
  "properties": {
    "test_id": {"type": "string"},
    "agent": {"enum": ["research", "architect"]},
    "run_id": {"type": "integer", "minimum": 1},
    "mandatory_pass": {"type": "boolean"},
    "mandatory_checks": {"type": "object", "additionalProperties": {"type": "boolean"}},
    "rubric": {
      "type": "object",
      "required": ["weighted_total"],
      "properties": {"weighted_total": {"type": "number", "minimum": 0, "maximum": 1}}
    },
    "signals": {
      "type": "object",
      "required": ["skills_loaded", "references"],
      "properties": {
        "skills_loaded": {"type": "array", "items": {"type": "string"}},
        "references": {"type": "array", "items": {"type": "string"}}
      }
    }
  }
}
```

### Success Criteria

#### Automated Verification:

- [x] Schema validates at least one sample run artifact
- [x] Rubric weight totals equal `1.0` per test
- [x] Mandatory checks map 1:1 to research-defined assertions

#### Manual Verification:

- [ ] Metric fields support both deterministic and nuanced scoring
- [ ] Schema is readable and maintainable without external tooling

**Pause for manual verification before proceeding to next phase**

## Phase 3: Implement Lightweight Evaluator + Consistency Metrics

### Overview

Add a minimal Python evaluator that scores one run artifact bundle, enforces hard gates, computes weighted totals, and aggregates medium-test consistency stats.

### Specific file changes

- New: `opencode/.agent_improvement/scripts/evaluate_agent_output.py`
- New: `opencode/.agent_improvement/scripts/score_helpers.py`

```python
#!/usr/bin/env python3
from __future__ import annotations
import json
from pathlib import Path
from statistics import pstdev

def weighted_total(scores: dict[str, float], weights: dict[str, float]) -> float:
    return round(sum(scores[k] * weights[k] for k in weights), 4)

def medium_consistency(run_totals: list[float]) -> dict[str, float]:
    if not run_totals:
        return {"avg": 0.0, "stddev": 0.0}
    avg = round(sum(run_totals) / len(run_totals), 4)
    dev = round(pstdev(run_totals), 4)
    return {"avg": avg, "stddev": dev}

def main() -> None:
    runs_path = Path("opencode/.agent_improvement/runs/latest/run_records.json")
    payload = json.loads(runs_path.read_text())
    medium_scores = [r["rubric"]["weighted_total"] for r in payload if "medium" in r["test_id"]]
    summary = {"mandatory_all_pass": all(r["mandatory_pass"] for r in payload),
               "medium_metrics": medium_consistency(medium_scores)}
    print(json.dumps(summary, indent=2))

if __name__ == "__main__":
    main()
```

### Success Criteria

#### Automated Verification:

- [ ] `python3 opencode/.agent_improvement/scripts/evaluate_agent_output.py` runs successfully on sample artifacts
- [ ] Evaluator fails when any mandatory check is false
- [ ] Evaluator emits medium metrics (average + stddev)

#### Manual Verification:

- [ ] Output is understandable for quick pass/fail decisions
- [ ] Scoring behavior matches thresholds from research (`mandatory=100%`, medium average `>=0.75`)

**Pause for manual verification before proceeding to next phase**

## Phase 4: Add Runbook + Baseline Execution Artifacts

### Overview

Document exactly how to execute the suite and store first baseline results so future drift can be measured against a known initial state.

### Specific file changes

- New: `opencode/.agent_improvement/RUNBOOK.md`
- New: `opencode/.agent_improvement/runs/2026-02-23-baseline/README.md`
- New: `opencode/.agent_improvement/runs/2026-02-23-baseline/run_records.json`

```markdown
# Agent Behavior Eval Runbook

## Scope
- Agents: `research`, `architect`
- Tests: 2 small + 2 medium

## Protocol
1. Execute each small test once.
2. Execute each medium test three times with paraphrased prompts.
3. Save raw outputs and extracted run records.
4. Run evaluator script and store summary.

## Pass Criteria
- Mandatory gates: 100% pass
- Medium weighted score average: >= 0.75

## Artifact Paths
- `opencode/.agent_improvement/runs/YYYY-MM-DD-<label>/run_records.json`
- `opencode/.agent_improvement/runs/YYYY-MM-DD-<label>/summary.json`
```

### Success Criteria

#### Automated Verification:

- [ ] Baseline directory contains `run_records.json` and evaluator `summary.json`
- [ ] Baseline summary reports mandatory gate status + medium metrics
- [ ] File paths and naming match runbook contract

#### Manual Verification:

- [ ] A second operator can reproduce a run using only the runbook
- [ ] Baseline outputs are sufficient for trend comparisons later

**Pause for manual verification before proceeding to next phase**

## Testing Strategy

- Run structural checks first: catalog completeness, schema validity, rubric weight totals.
- Run evaluator against synthetic fixtures (pass + fail cases) before real transcripts.
- Execute full baseline protocol (small x1, medium x3), then compare summary to thresholds.
- Spot-check reference overlap and rationale stability for medium robustness tests.

## References

- `.opencode/research/2026-02-23-agent-behavior-test-cases.md:44`
- `.opencode/research/2026-02-23-agent-behavior-test-cases.md:137`
- `.opencode/research/2026-02-23-agent-behavior-test-cases.md:187`
- `.opencode/AGENTS.md:23`
- `opencode/project_scope/.opencode/AGENTS.md:24`
- `opencode/project_scope/.opencode/AGENTS.md:43`
- `opencode/project_scope/.opencode/verification/minimal-context-checklist.md:5`
