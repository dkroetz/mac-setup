## Plan: Improve skill routing and plan/build handoff

### Sizing
- **Estimated size**: Medium
- **Why**: The task spans command prompts, skill metadata, and command-to-command contract design across several files, but it stays within documentation and harness workflow surfaces.

### Phase 1: Audit current routing and handoff surfaces
- **Files**: `commands/plan.md`, `commands/build.md`, `skills/code-quality/SKILL.md`, `skills/project-setup/SKILL.md`, `AGENTS.md`, `README.md`, `MAINTENANCE.md`
- **Changes**:
  - Compare the current `/plan` and `/build` prompts to identify where handoff expectations are implicit instead of machine-actionable.
  - Review current skill frontmatter, descriptions, and trigger language to see which routing signals live in metadata versus in-file body text.
  - Identify duplicated or weakly discriminative wording that makes skill selection or build execution less precise.
- **Exit criterion**: A concrete list of routing and handoff gaps exists, tied to the files that own each behavior.
- **Validation**: `None`
- **Human checkpoint**: None.

### Phase 2: Strengthen skill metadata and routing cues
- **Files**: `skills/code-quality/SKILL.md`, `skills/project-setup/SKILL.md`, `README.md`, `MAINTENANCE.md`, `AGENTS.md` (only if routing guidance needs a top-level pointer)
- **Changes**:
  - Refine skill `name`, `description`, and trigger language so each skill has a sharper workflow boundary and clearer selection signal.
  - Reduce reliance on post-load in-file guidance where metadata or command-level cues can carry the routing intent instead.
  - Document the repo rule that new skills are added only for recurring workflows, not for one-off procedures.
- **Exit criterion**: Each existing skill has discriminative metadata and an explicit routing boundary that is consistent across docs.
- **Validation**: `git diff --check`
- **Human checkpoint**: None.
- **Risks and mitigations**:
  - Risk: Over-tuning descriptions makes routing brittle. Mitigation: prefer short, concrete boundary language over keyword stuffing.

### Phase 3: Define a stronger `/plan` output contract for `/build`
- **Files**: `commands/plan.md`, `agents/subagents/planner.md`, `commands/build.md`, `.agents/context/project-intelligence.md`
- **Changes**:
  - Specify the exact plan elements that `/build` should be able to rely on, such as per-phase `Changes`, `Validation`, `Human checkpoint`, and strict dependencies.
  - Make phase boundaries and exit criteria more machine-actionable so `/build` can consume plans with less interpretation.
  - Add clear conventions for how `/build` should react when plan phases omit validation, contain critical checkpoints, or include sequencing constraints.
- **Exit criterion**: `/plan` and `/build` share a documented handoff contract with no ambiguous ownership of phase structure or validation fields.
- **Validation**: `git diff --check`
- **Human checkpoint**: None.

### Phase 4: Refine `/build` execution semantics around checkpoints and validation
- **Files**: `commands/build.md`, `README.md`, `MAINTENANCE.md`
- **Changes**:
  - Update `/build` so it consumes plan phases using explicit conventions for phase execution, validation gates, and pause points.
  - Clarify how `/build` should handle human checkpoints, including when to stop, what to report, and how to resume after confirmation.
  - Document the stronger handoff semantics so future plans and builds stay aligned.
- **Exit criterion**: `/build` instructions clearly define how it executes a compliant plan phase by phase, including validation and checkpoint behavior.
- **Validation**: `git diff --check`
- **Human checkpoint**: Required only if the revised `/build` semantics materially change how human approvals are requested during execution.
- **Risks and mitigations**:
  - Risk: More structure can make `/build` too rigid for smaller plans. Mitigation: keep required fields minimal and reserve extra detail for material checkpoints and dependencies.

### Phase 5: Run a coherence pass and capture the new workflow pattern
- **Files**: `README.md`, `MAINTENANCE.md`, `.agents/context/project-intelligence.md`, `.agents/context/wisdom/patterns.md`, `.agents/context/wisdom/decisions.md` (if a durable decision is warranted)
- **Changes**:
  - Ensure the skill-routing guidance and the `/plan`→`/build` contract tell one consistent story across top-level docs and durable context.
  - Capture any new durable pattern or decision only if it adds guidance that will matter across future harness changes.
  - Verify that the final docs reinforce metadata-first routing and machine-actionable phased execution without reintroducing prompt bloat.
- **Exit criterion**: The repo documents one consistent model for skill routing and plan/build handoff, with any durable learnings stored in the appropriate context surface.
- **Validation**: `git diff --check`
- **Human checkpoint**: None.

### Dependencies Between Phases
- Phase 1 should complete before editing skill or command contracts.
- Phase 2 should complete before finalizing command-level routing guidance in later phases.
- Phase 3 must complete before refining `/build` execution semantics in Phase 4.
- Phase 5 depends on all earlier phases.

### Risks & Mitigations
- Over-specifying skill cues inside skill bodies may not materially improve pre-selection; prefer metadata and caller-owned routing language.
- Over-structuring plan outputs can increase plan verbosity; keep the `/build` contract focused on fields that change execution behavior.

### Likely Deliverables
- Sharper skill descriptions and trigger boundaries.
- Clearer repo guidance on when a new skill should exist.
- A documented `/plan` output contract that `/build` can consume more mechanically.
- Stronger `/build` semantics for validation and human checkpoints.
