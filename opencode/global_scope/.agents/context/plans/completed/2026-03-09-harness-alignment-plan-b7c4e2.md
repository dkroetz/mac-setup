## Plan: Improve harness alignment with current agent research

### Sizing
- **Estimated size**: Large
- **Why**: The task spans agent topology, command design, prompt structure, memory architecture, repo-level instructions, and skill loading across multiple files, with at least one architecture-level decision.

### Goals
- Align the harness with current evidence on agent roles, prompt layering, memory/context management, and dynamic skill loading.
- Preserve the repo's current design principles unless a documented architecture decision changes them.
- Ground each change set in explicit references from official docs, practitioner writing, or academic research.

### Phase 1: Establish the evidence baseline and decide primary-agent topology
- **Files**: `agents/scout.md`, `agents/engineer.md`, `agents/auto.md`, `README.md`, `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`, `.agents/context/wisdom/patterns.md`, `.agents/context/decisions/2026-03-09-agent-topology.md` (new, if needed)
- **Changes**:
  - Compare the current `scout` + `engineer` split against the research-backed patterns for minimal "ask" agents, autonomous agents, and role separation.
  - Decide whether to keep two primary agents, add a third minimal ask-style agent, enable/reshape `auto`, or keep autonomy as a profile/mode rather than a new primary agent.
  - Record the chosen topology and its rationale in a decision note if the result changes the current architecture.
- **Exit criterion**: A written topology decision exists and maps each primary agent to a distinct role, autonomy level, and escalation boundary.
- **Human checkpoint**: Required if the chosen direction changes the primary-agent architecture or enables a more autonomous default agent.
- **Material risks / mitigations**:
  - Risk: Overlapping primary agents create routing ambiguity. Mitigation: require a single sentence purpose and explicit escalation rule per primary agent.
  - Risk: Adding autonomy widens safety posture. Mitigation: keep permission design coupled to the existing three-layer model and document approval boundaries.

### Phase 2: Refine `/plan` prompt and plan artifact template against common patterns
- **Files**: `commands/plan.md`, `agents/subagents/planner.md`, `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`, `README.md`
- **Changes**:
  - Evaluate whether `commands/plan.md` should become more concrete about discovery scope, research references, phase sizing, dependencies, and validation expectations.
  - Check whether the plan template should more explicitly separate discovery, decision points, implementation phases, and validation/rollout phases.
  - Fold in the strongest reference-backed conventions from `Codex`, `Claude Code`, and the repo's own planner subagent format without duplicating instructions across files.
- **Exit criterion**: A revised `/plan` specification is defined with one clear template and no conflicting planning instructions between `commands/plan.md` and `agents/subagents/planner.md`.
- **Human checkpoint**: None.

### Phase 3: Tighten primary-agent prompts and role boundaries
- **Files**: `agents/scout.md`, `agents/engineer.md`, `README.md`, `MAINTENANCE.md`
- **Changes**:
  - Review `scout` and `engineer` prompts for prompt bloat, duplicated sections, role ambiguity, and mismatch between prompt claims and permission frontmatter.
  - Rephrase each prompt to match modern best practices: thin top-level instructions, explicit role boundaries, minimal exploration budgets, and clear delegation/escalation behavior.
  - Remove duplicated or conflicting wording and ensure the README describes the resulting roles consistently.
- **Exit criterion**: Each primary agent prompt has one unambiguous role, one escalation model, and no duplicated sections.
- **Human checkpoint**: None unless phase 1 changed the primary-agent set.
- **Material risks / mitigations**:
  - Risk: Prompt edits drift away from actual permissions. Mitigation: validate prompt claims against `opencode.jsonc` and frontmatter before finalizing wording.

### Phase 4: Audit and reshape memory management and durable context flows
- **Files**: `AGENTS.md`, `commands/add-context.md`, `commands/context.md`, `commands/capture.md`, `.agents/context/wisdom/patterns.md`, `.agents/context/wisdom/mistakes.md`, `.agents/context/wisdom/decisions.md`, `.agents/context/project-intelligence.md` (new or updated), `MAINTENANCE.md`
- **Changes**:
  - Map the current memory surfaces: global `AGENTS.md`, optional `project-intelligence.md`, wisdom files, plans, and capture/harvest flows.
  - Compare that setup to the research-backed pattern of narrow repo instructions, explicit durable state, and memory artifacts that avoid context collapse.
  - Define whether missing pieces such as `project-intelligence.md` should become first-class in this repo's own setup and how `capture`/`context` commands should feed those files.
  - Ensure memory responsibilities are clearly separated across instruction, intelligence, plan, and wisdom files.
- **Exit criterion**: The memory model is documented as a clear file-level contract showing where stable instructions, project facts, in-flight plans, and post-task learnings belong.
- **Human checkpoint**: Required only if the phase changes the durable memory architecture or adds a new always-read context file.
- **Material risks / mitigations**:
  - Risk: Adding too much persistent context recreates the AGENTS.md-overload failure mode. Mitigation: keep top-level files pointer-based and place richer material behind explicit navigation.

### Phase 5: Refine `AGENTS.md` and dynamic skill-loading behavior
- **Files**: `AGENTS.md`, `templates/AGENTS.md`, `skills/code-quality/SKILL.md`, `skills/project-setup/SKILL.md`, `README.md`, `MAINTENANCE.md`, `opencode.jsonc`
- **Changes**:
  - Audit `AGENTS.md` against the repo's own template and current research on lean, pointer-based repo instructions.
  - Review skill descriptions, trigger boundaries, and token discipline to verify that dynamic loading remains metadata-first and that skills stay procedural rather than encyclopedic.
  - Check whether the current two-skill setup is still the right granularity and whether routing cues in prompts/commands are sufficient for efficient loading.
  - Update template/docs if the refined `AGENTS.md` and skill-loading rules should become the default pattern for future projects.
- **Exit criterion**: `AGENTS.md` and the skill set have explicit scope boundaries and a documented loading model consistent with progressive disclosure.
- **Human checkpoint**: None.

### Phase 6: Validate cross-file coherence and close the loop with references
- **Files**: `README.md`, `MAINTENANCE.md`, `commands/plan.md`, `agents/scout.md`, `agents/engineer.md`, `AGENTS.md`, `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`, `.agents/context/decisions/2026-03-09-agent-topology.md` (if created)
- **Changes**:
  - Run a final coherence pass so docs, prompts, commands, and maintenance guidance describe the same harness model.
  - Ensure each researched question has an explicit answer captured either in code/docs or in a decision artifact.
  - Add concise references where future readers need provenance for non-obvious choices.
- **Exit criterion**: The harness documentation and configuration tell one consistent story, and each of the six requested questions is traceable to a concrete artifact.
- **Human checkpoint**: None.

### Dependencies Between Phases
- Phase 1 must complete before any topology-sensitive prompt or permission edits in phases 3-6.
- Phase 2 should complete before updating prompt references in phase 3 if planner language is reused there.
- Phase 4 should complete before final `AGENTS.md` and skills positioning in phase 5.
- Phase 6 depends on all earlier phases.

### Reference Packet To Use During Implementation
- **Repo research note**: `.opencode/research/2026-03-09-ai-coding-agent-harnesses.md`
- **Official docs themes already captured in the research note**:
  - `Claude Code`: layered `CLAUDE.md`, memory, hooks, subagents, plan mode
  - `OpenAI Codex`: `AGENTS.md`, skills, instruction precedence, sandbox/approvals, multi-agent
  - `Cursor`: rules, `AGENTS.md`, subagents, skills, permissions, cloud agents
  - `OpenCode`: `AGENTS.md`, agents, skills, commands, permissions
  - `Kilo Code`: modes, `AGENTS.md`, rules, skills, workflows, custom subagents
- **Academic/practitioner anchors already captured in the research note**:
  - `SkillsBench` - short curated procedural skills outperform broader docs
  - `Evaluating AGENTS.md` - narrow developer-authored context beats broader repo context
  - `Agentic Context Engineering` and `Context as a Tool` - durable, curated memory beats naive summary accumulation
  - Anthropic/OpenAI/Cursor engineering writing - role separation, externalized state, artifact-based verification

### Deliverables
- Updated primary-agent strategy and, if needed, an architecture decision note.
- Refined `/plan` command and planner template.
- Refined `scout` and `engineer` prompts.
- Documented memory-management model with any required context-file updates.
- Refined `AGENTS.md` and skill-loading guidance.
- Final doc consistency pass tying changes back to references.
