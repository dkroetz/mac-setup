---
description: Create a development plan for a task
agent: engineer
---

Analyze the following task and create a detailed implementation plan.

Use this command when:
- The task is non-trivial and benefits from phased implementation
- You need a written plan artifact for later execution

Do not use this command when:
- You already have an approved plan file and need execution (use `/implement`)
- The request is a small one-step change that can be done directly

First, explore the codebase to understand the relevant files, constraints, and existing patterns.
Use progressive disclosure: read high-signal context first, then only the minimum additional files needed.

When external behavior or library APIs matter, look up official docs before planning.

Then create a concise, adaptive phased plan based on task size:
1. Small tasks: 2-3 phases
2. Medium tasks: 3-5 phases
3. Large tasks: 5+ phases

Plan construction rules:
- Start with one brief sizing section.
- Use phases only for meaningful boundaries; avoid splitting trivial work.
- Keep the plan implementation-oriented, not a restatement of the task.
- Call out dependencies only when strict ordering matters.
- Include validation expectations for each phase as one concrete command or `None`.
- Prefer targeted phase validation over repeating the full suite in every phase.
- Reference research or docs only when they materially affect the implementation shape.
- Write phases so `/implement` can execute them with minimal interpretation.
- Ensure each phase is independently executable once its listed dependencies are satisfied.
- Do not hide cross-phase work inside a single phase description.

For each phase include, in this order:
1. Clear description
2. `Files`
3. `Changes`
4. `Exit criterion`
5. Validation to run after the phase as one concrete command or `None`
6. `Human checkpoint` only at critical points (destructive/irreversible, security-sensitive, architecture-changing), otherwise `None`
7. Risks and mitigations only when material

Handoff contract for `/implement`:
- Treat `Files`, `Changes`, `Exit criterion`, `Validation`, and `Human checkpoint` as required per-phase fields.
- Keep each phase independently executable once its listed dependencies are satisfied.
- Use `Dependencies Between Phases` only for strict sequencing constraints.
- If a phase truly does not need validation, write `Validation: None` explicitly.
- If a phase requires human approval, state the exact reason in `Human checkpoint` so `/implement` knows when to pause.
- Default to `Human checkpoint: None` unless the phase is risky, destructive, security-sensitive, or architecture-changing.
- When a checkpoint is required, specify whether approval is needed before risky work or before proceeding to the next phase.
- Do not put full final-suite validation inside ordinary phases unless the task genuinely requires it.

Required closing sections:
- `Dependencies Between Phases`
- `Risks & Mitigations` (only if material)

Keep the wording concrete. Prefer file paths, explicit deliverables, and short verifiable checkpoints over generic advice.

Use this phase template:

```md
## Phase N: <short description>

Files:
- path/to/file

Changes:
- Specific implementation action
- Specific implementation action

Exit criterion:
- Observable condition that confirms the phase is done

Validation: <one command or None>

Human checkpoint: None
```

If `.agents/context/plans/active/` exists, write the plan there using this filename format:
- `YYYY-MM-DD-short-slug-hash.md`
- Build `short-slug` from the task (3-6 words, lowercase, hyphenated, sanitized)
- Add a short hash/suffix for uniqueness
- Keep filenames concise to avoid OS path-length errors

If a generated filename already exists, create a new unique filename (do not overwrite).

Do not write code. Focus on planning only.

Task: $ARGUMENTS
