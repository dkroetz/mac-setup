# Agent Refinement Execution Spec (Human-Gated)

Use this document as the implementation contract for an AI agent.

## Operating Mode

- Execute phases strictly in order.
- **Stop after each phase** and request human verification before continuing.
- Do not skip phases, merge phases, or perform speculative extra changes.
- Keep changes minimal and reversible.

## Global Constraints

- Model strategy:
  - Complex work: `gpt-5.3-codex`
  - Lightweight work: `gpt-5.1-codex-mini`
- Preserve config-first, markdown-first approach.
- Do not add net-new complexity unless required by acceptance criteria.
- Prefer procedural logic in skills/commands over long monolithic prompts.

## Phase Workflow Template (Apply to Every Phase)

For each phase:

1. Implement only that phase’s scope.
2. Run phase-specific validation.
3. Produce a short phase report:
   - What changed
   - Files touched
   - Validation results
   - Risks or open questions
4. **Stop and ask for human verification** using this exact prompt:

```
Phase <N> complete. Please verify.
Reply with one of:
- APPROVE PHASE <N>
- REQUEST CHANGES PHASE <N>: <details>
- ABORT
```

Proceed only on `APPROVE PHASE <N>`.

---

## Phase 0: Baseline and Instrumentation

### Scope

- Snapshot current state of:
  - `~/.config/opencode` agent/config/skills/commands
  - `~/Projects/futilify` AGENTS/context/opencode config
- Build benchmark task set (10-20 tasks).
- Capture baseline metrics:
  - success rate
  - time-to-first-meaningful-edit
  - token usage
  - human intervention count
  - post-first-pass fix rate

### Deliverables

- `baseline-report.md`
- `benchmark-task-set.md`

### Validation

- Baseline report includes all required metrics.
- Task set covers bugfix, feature, refactor, context-heavy, and command-driven cases.

### Human Gate

- Request: `APPROVE PHASE 0`.

---

## Phase 1: Prompt Surface Reduction

### Scope

- Remove duplicate/conflicting guidance across:
  - primary agent prompts
  - skills
  - commands
  - AGENTS/context docs
- Keep agent prompts role-defining and concise.

### Deliverables

- `prompt-responsibility-matrix.md`
- Updated prompt files with duplication removed.

### Validation

- Every major instruction has one clear source of truth.
- No contradictory rules remain between engineer/scout and project AGENTS.

### Human Gate

- Request: `APPROVE PHASE 1`.

---

## Phase 2: Subagent Normalization

### Scope

- Add missing `discoverer` subagent.
- Optionally add `context-auditor` (recommended).
- Define explicit I/O contracts for each subagent.
- Enforce permission boundaries:
  - discoverer/planner/context-auditor: no write/edit
  - reviewer: no write/edit
  - implementer: write/edit allowed with existing gates

### Deliverables

- `agents/subagents/discoverer.md`
- (Optional) `agents/subagents/context-auditor.md`
- `subagent-contracts.md`

### Validation

- Permission model matches intended read/write boundaries.
- Engineer can delegate to required subagents without permission errors.

### Human Gate

- Request: `APPROVE PHASE 2`.

---

## Phase 3: Selective Autonomy Gates

### Scope

- Keep global write/edit/bash conservative by default.
- Relax only safe high-frequency operations, e.g.:
  - read-only git commands
  - optional `pytest`, `mypy`, `ruff` for engineer
- Keep destructive commands gated.

### Deliverables

- `permission-profile-balanced.json` (or equivalent config diff)

### Validation

- Safe commands run without friction.
- Unsafe/destructive operations remain gated.

### Human Gate

- Request: `APPROVE PHASE 3`.

---

## Phase 4: Context Strategy Realignment

### Scope

- Refactor `~/Projects/futilify/AGENTS.md` and context contract toward progressive disclosure.
- Remove mandatory broad preflight context loading.
- Keep always-loaded context minimal.
- Move procedural enforcement to commands and optional context-auditor.

### Deliverables

- Updated `~/Projects/futilify/AGENTS.md`
- `context-migration-notes.md`

### Validation

- AGENTS remains concise and pointer-based.
- No forced “read everything first” constraints remain.

### Human Gate

- Request: `APPROVE PHASE 4`.

---

## Phase 5: Skills and Commands Hardening

### Scope

- Keep global skills at current baseline unless measured gap exists.
- Improve skill trigger boundaries and procedural clarity.
- Reduce command overlap and ambiguity.
- Add skill quality checks (trigger precision, task quality, token impact).

### Deliverables

- Updated `skills/*/SKILL.md` as needed
- Updated `commands/*.md` as needed
- `skills-eval-report.md`

### Validation

- Skills have explicit use/not-use boundaries.
- Commands have clear, non-overlapping responsibilities.

### Human Gate

- Request: `APPROVE PHASE 5`.

---

## Phase 6: Eval Harness and Regression Policy

### Scope

- Implement repeatable eval harness:
  - deterministic checks
  - rubric checks
- Define release gates:
  - no success regression
  - <=10% cost growth unless justified
  - intervention count reduced or stable

### Deliverables

- `agent-evals/` directory
- `release-gate.md`

### Validation

- Before/after comparison produced for benchmark set.
- Pass/fail gate is machine-checkable.

### Human Gate

- Request: `APPROVE PHASE 6`.

---

## Phase 7: Rollout and Maintenance Rhythm

### Scope

- Rollout sequence:
  1. global setup
  2. `futilify` pilot
  3. broader usage
- Establish weekly maintenance rhythm:
  - `/audit`
  - context pruning
  - top failure review
  - one controlled improvement per cycle

### Deliverables

- `maintenance-playbook.md`
- `rollout-checklist.md`

### Validation

- Pilot run completed with metrics and findings.
- Weekly process documented and actionable.

### Human Gate

- Request: `APPROVE PHASE 7`.

---

## Final Completion Criteria

All must be true:

- `discoverer` exists and is functional.
- Context behavior is progressive-disclosure-first.
- No benchmark success-rate regression.
- Token/intervention profile improved or neutral.
- Skill triggering is more precise.
- Architecture remains minimal and maintainable.

## References

- `https://arxiv.org/abs/2602.12670`
- `https://arxiv.org/abs/2602.11988`
- `https://www.anthropic.com/engineering/building-effective-agents`
- `https://developers.openai.com/codex/guides/agents-md`
- `https://developers.openai.com/codex/skills`
- `https://developers.openai.com/codex/concepts/multi-agents`
- `https://developers.openai.com/blog/skills-shell-tips`
- `https://developers.openai.com/blog/eval-skills`
- `https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide`
