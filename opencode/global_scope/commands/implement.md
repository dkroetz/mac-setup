---
description: Execute a development plan with phase discipline and tiered validation
agent: engineer
---

Resolve the plan input, then implement it step by step.

Plan path resolution rules:
- If the argument is an explicit path, use it as-is.
- If the argument is a bare filename without extension, resolve to `.agents/context/plans/active/<name>.md`.
- If the argument is a bare filename ending in `.md`, resolve to `.agents/context/plans/active/<name>.md`.
- Never append `.md` twice.
- Never duplicate path segments.

Use this command when:
- A plan already exists in `.agents/context/plans/active/`
- You want stepwise implementation with minimal interruption, clear phase boundaries, and final strict validation

Do not use this command when:
- You still need to create the plan (use `/plan`)
- The request is ad-hoc exploration or context curation

Before starting execution:
- Read the plan and verify each phase includes `Files`, `Changes`, `Exit criterion`, `Validation`, and `Human checkpoint`.
- If required fields are missing or ambiguous, stop and report the gap instead of guessing.
- Honor `Dependencies Between Phases` as the only strict sequencing contract.

Execution policy:
1. Implement the listed `Changes` for the current phase only.
2. Do not pull work from later phases into the current phase unless the plan is updated.
3. During file edits, do not run the full validation suite after every write.
4. After each completed implementation step, run targeted checks only when they are obvious and cheap.
5. Check the phase `Human checkpoint` field:
   - If it is `None`, continue.
   - If it requires approval before risky work, stop and wait.
   - If it requires approval before proceeding to the next phase, implement the phase, run validation, report results, then stop and wait.
6. Run the exact `Validation` command from the plan unless it is `None`.
7. If `Validation` is `None`, still perform a lightweight sanity check before advancing.
8. If validation fails, fix the phase before proceeding.
9. Confirm the phase `Exit criterion` is satisfied before moving on.
10. If resuming after a checkpoint, continue from the next incomplete validated phase rather than repeating completed validated phases.

Required final validation policy:
- Run the project's standard full validation suite before completion.
- Prefer the canonical commands defined by the repository, project context, or plan notes.
- If no canonical full suite is documented, run the smallest command set that meaningfully validates the changed areas.
- Cover relevant quality gates such as formatting or linting, static analysis or type checks when applicable, and tests.

Completion gate:
- Do not finish `/implement` until the chosen final validation suite is green.
- If final validation fails, fix issues and rerun validation.
- Repeat until green, or report a concrete hard blocker that cannot be resolved automatically.

After all steps are complete:
1. Run full validation suite
2. Move the plan to `.agents/context/plans/completed/`
3. Summarize what was done

Plan: $ARGUMENTS
