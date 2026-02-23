# Research: Agent Behavior Test Cases (Research + Architect)

**Date**: 2026-02-23

## Skill-Loading Report

- Scope scan result: existing setup already enforces minimal-context policy, conditional skill loading, and phase-based workflow contracts; no executable eval harness exists yet.
- Skills loaded: none.
- Reason: task is governance/evaluation design over existing markdown config; no domain skill was required.
- Confirmation: loading followed AGENTS policy limits (0-2 normally; no 3rd skill).

## Summary

This proposes exactly 2 small and 2 medium test cases, scoped to `research` and `architect` first. The design combines deterministic checks (binary gates) with weighted rubric scoring for nuanced behaviors, matching your setup's policy-heavy goals. Results should be persisted under `.agent_improvement/` as run artifacts, while this research write-up remains under `.opencode/research/`.

## Key Findings

### Setup signals to test first

- Thin-policy AGENTS baseline and conditional loading are explicit and stable (`.opencode/AGENTS.md:4`, `.opencode/AGENTS.md:23`).
- Project AGENTS is explicit about skill policy and success-criteria contract (`opencode/project_scope/.opencode/AGENTS.md:24`, `opencode/project_scope/.opencode/AGENTS.md:43`).
- Primary agents require skill-loading telemetry in outputs (`opencode/global_scope/agents/research.md:36`, `opencode/global_scope/agents/architect.md:33`).
- Drift checklist already provides deterministic anti-regression checks (`opencode/project_scope/.opencode/verification/minimal-context-checklist.md:5`).

### External eval patterns to adapt

- Keep mandatory pass/fail gates for hard constraints; add weighted rubric for synthesis quality.
- Evaluate trajectory/process behavior, not only final answer text.
- Add paraphrase perturbation for robustness and repeat medium cases to measure variance.

## Recommended Evaluation Approach

Use a **hybrid scoring model**:

- **Gate 1 (mandatory binary):** all hard constraints must pass.
- **Gate 2 (weighted rubric):** score nuanced quality dimensions.
- **Run protocol:**
  - Small cases: 1 deterministic run each.
  - Medium cases: 3 runs each (prompt paraphrase or seed variation).
- **Pass threshold recommendation:**
  - Mandatory gates: 100% pass required.
  - Weighted score: >= 0.75 average for medium tests.

## Test Cases (2 Small + 2 Medium)

### Small Test 1 — Research Skill-Loading Compliance

**Target agent:** `research`  
**Goal:** verify conditional skill loading + reporting contract for a single-domain request.

**Prompt shape**

"Research Python lint/type workflow conventions in this repo and report findings."

**Mandatory assertions (binary)**

- Output includes scope scan line.
- Output includes skills loaded and reasons.
- Loaded skills are within policy limits (0-2 unless blocked).
- Findings include file:line references.

**Weighted rubric (0-1 total)**

- 0.35: citation quality (specific file:line grounding)
- 0.35: policy adherence clarity (loading rationale, limit confirmation)
- 0.30: concise structure compliance (Summary/Key Findings/References/etc.)

### Small Test 2 — Architect Policy-Dedup Adherence

**Target agent:** `architect`  
**Goal:** ensure plan behavior references AGENTS policy instead of reintroducing duplicated loading policy blocks.

**Prompt shape**

"Create a compact implementation plan to update skill-loading wording in one agent file."

**Mandatory assertions (binary)**

- Output has required plan structure (Overview, What We're NOT Doing, phases, success criteria, testing strategy, references).
- Skill-loading report appears before plan.
- No bulk-loading directives are reintroduced in proposal language.

**Weighted rubric (0-1 total)**

- 0.40: phase specificity (clear file-level actions)
- 0.30: verification quality (automated + manual criteria format)
- 0.30: scope discipline (explicit non-goals)

### Medium Test 1 — Paraphrase Robustness (Research)

**Target agent:** `research`  
**Goal:** check consistency across semantically equivalent prompts.

**Run design**

- Run 3 paraphrases of the same request (same intent, different wording).

**Mandatory assertions (binary)**

- All runs include skill-loading report fields.
- All runs include file:line references.
- All runs stay within policy limits.

**Weighted rubric (0-1 total per run)**

- 0.40: reference consistency (same core source set)
- 0.30: conclusion consistency (same core finding)
- 0.30: rationale stability (same reason class for skill loading)

**Medium-level consistency metrics**

- Outcome consistency rate across 3 runs.
- Reference overlap ratio across runs.
- Score variance (stddev).

### Medium Test 2 — Multi-Source Synthesis (Architect)

**Target agent:** `architect`  
**Goal:** validate source-grounded synthesis between repo policy docs and prior research docs.

**Prompt shape**

"Create a plan to evaluate whether a proposed policy change aligns with minimal-context principles, citing both AGENTS and existing research files."

**Mandatory assertions (binary)**

- Cites both policy/config source(s) and research source(s).
- Identifies minimal-context principle in plan rationale.
- Keeps ownership split explicit (global baseline vs project-local operational policy).

**Weighted rubric (0-1 total)**

- 0.35: cross-source synthesis quality
- 0.35: implementation realism (phases + verifiable checks)
- 0.30: conflict/constraint articulation

## Metric Schema (for `.agent_improvement/` run artifacts)

Suggested per-run record:

```json
{
  "test_id": "medium-2-multisource-architect",
  "agent": "architect",
  "run_id": 2,
  "mandatory_pass": true,
  "mandatory_checks": {
    "has_skill_loading_report": true,
    "has_required_structure": true,
    "has_dual_source_citations": true
  },
  "rubric": {
    "cross_source_synthesis": 0.8,
    "implementation_realism": 0.7,
    "constraint_articulation": 0.9,
    "weighted_total": 0.79
  },
  "signals": {
    "latency_ms": 8421,
    "token_usage": {"prompt": 1220, "completion": 910},
    "skills_loaded": ["python-pdm"],
    "references": [
      ".opencode/AGENTS.md:23",
      "opencode/project_scope/.opencode/AGENTS.md:24",
      ".opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:43"
    ]
  }
}
```

## Code References

- `.opencode/AGENTS.md:4`
- `.opencode/AGENTS.md:23`
- `opencode/project_scope/.opencode/AGENTS.md:24`
- `opencode/project_scope/.opencode/AGENTS.md:43`
- `opencode/project_scope/.opencode/verification/minimal-context-checklist.md:5`
- `opencode/global_scope/agents/research.md:36`
- `opencode/global_scope/agents/architect.md:33`
- `.opencode/plans/2026-02-23-opencode-v2-minimal-context-pilot.md:247`
- `.opencode/plans/2026-02-23-opencode-v2-missing-pieces.md:116`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:43`
- `.opencode/research/2026-02-23-global-vs-project-agents-strategy.md:36`

## Architecture Notes

- Start with `research + architect` only, as requested.
- Treat deterministic checks as CI-style gates; treat weighted rubric as refinement signal.
- Store run outputs and trend summaries under `opencode/.agent_improvement/` for iteration history.

## Open Questions

- Should medium tests be promoted to regression gates after 5 consecutive passing runs?
- Should run artifacts be grouped by date (`.agent_improvement/runs/YYYY-MM-DD/`) or by test (`.agent_improvement/runs/<test-id>/`)?
