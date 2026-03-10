# Recommendation Validation Log (Dry Run)

Review date: 2026-03-03
Method: scenario-based dry-run checks against current vs recommended configuration.

## Scenario checks

### V-01: Routine bugfix in `futilify` touching one flow file
- Prompt: "Fix null-price handling in kleinanzeigen persistence and run validation."
- Current expected behavior: architecture template may preload despite not needed; potential extra context noise.
- After recommendations: minimal preflight with task-targeted context, architecture loaded only if needed.
- Risk check: no write permission broadening required.

### V-02: Cross-module refactor involving flow + persistence + deployment
- Prompt: "Refactor scrape orchestration and persistence contract for idempotent retries."
- Current expected behavior: architecture is loaded but low quality due placeholder content.
- After recommendations: real architecture document provides valid integration constraints and clearer planning input.
- Risk check: no destructive command policy changes.

### V-03: Quick commit after small doc update
- Prompt: "Commit the docs change with conventional commit message."
- Current expected behavior: `/commit` may proceed without explicit lint/type/test checks.
- After recommendations: `/commit` enforces or verifies quality checks (or explicit skip rationale).
- Risk check: potential friction increase is acceptable and reversible.

### V-04: Non-Python repository task in future project
- Prompt: "Update TypeScript API client and run project checks."
- Current expected behavior: global AGENTS may push Python validation commands, causing instruction mismatch.
- After recommendations: global AGENTS phrasing becomes stack-agnostic; project AGENTS controls stack-specific checks.
- Risk check: Python project rigor preserved via local AGENTS and skills.

### V-05: Delegated code review via reviewer subagent
- Prompt: "Use reviewer subagent to audit unstaged changes for security and tests."
- Current expected behavior: reviewer denies edit/write but bash constraints are implicit.
- After recommendations: explicit read-only contract (`bash: deny`) ensures deterministic safe behavior.
- Risk check: no loss of core review functionality expected.

### V-06: Context maintenance pass
- Prompt: "Run context quality checks and report stale artifacts."
- Current expected behavior: `/audit` + `/context validate` available; KPI evidence location is ad-hoc.
- After recommendations: same checks plus explicit KPI artifact path and cadence for traceability.
- Risk check: no permission broadening.

## Validation result

- Recommendation set appears internally consistent and aligned with baseline guidance.
- Highest-value changes remain low-risk and reversible.
- No recommended action requires relaxing destructive command gates.
