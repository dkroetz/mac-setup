---
description: Execute a development plan
agent: engineer
---

Resolve the plan input, then implement it step by step.

Plan path resolution rules:
- If the argument is an explicit path, use it as-is.
- If the argument is a bare filename without extension, resolve to `.opencode/context/plans/active/<name>.md`.
- If the argument is a bare filename ending in `.md`, resolve to `.opencode/context/plans/active/<name>.md`.
- Never append `.md` twice.
- Never duplicate path segments.

Use this command when:
- A plan already exists in `.opencode/context/plans/active/`
- You want stepwise implementation with validation gates

Do not use this command when:
- You still need to create the plan (use `/plan`)
- The request is ad-hoc exploration or context curation

Before starting execution:
- Read the plan and verify each phase includes `Files`, `Changes`, `Exit criterion`, `Validation`, and `Human checkpoint`.
- If required fields are missing or ambiguous, stop and report the gap instead of guessing.
- Honor `Dependencies Between Phases` as the only strict sequencing contract.

For each phase:
1. Implement the listed `Changes` for that phase only.
2. Check the `Human checkpoint` field:
   - If it is `None`, continue.
   - If it requires approval before risky work, stop and wait.
   - If it requires approval before proceeding to the next phase, implement the phase, run validation, report results, then stop and wait.
3. Run the exact `Validation` command from the plan unless it is `None`.
4. If validation fails, fix the phase before proceeding.
5. Confirm the phase exit criterion is satisfied before moving on.
6. Do not pull work from later phases into the current phase unless the plan is updated.

After all steps are complete:
1. Run full validation suite
2. Move the plan to .opencode/context/plans/completed/
3. Summarize what was done

Execution notes:
- Treat the plan as the source of truth for phase boundaries.
- If resuming after a checkpoint, continue from the next incomplete phase rather than repeating completed validated phases.
- If the plan says `Validation: None`, still perform a lightweight sanity check before advancing.

Plan: $ARGUMENTS
