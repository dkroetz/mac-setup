# AI coding agent harnesses

## Direct Answer

- AI coding agent harnesses are converging on the same core shape: a thin repo-level instruction layer (`AGENTS.md`/`CLAUDE.md`/rules), lazily loaded procedural modules (`skills`, commands, workflows), an explicit tool-and-permission model, specialized subagents or modes, durable external state for long tasks, and validation loops.
- The main difference across products is which layer is first-class:
  - `Claude Code`: memory, hooks, and subagents around `CLAUDE.md`
  - `Codex`: `AGENTS.md`, skills, sandbox/approval policy, and multi-agent/worktree execution
  - `Cursor`: rules/subagents/MCP plus cloud automations and VM execution
  - `OpenCode`: agent files, commands, permissions, `AGENTS.md` compatibility, and explicit primary-agent switching
  - `Kilo Code`: mode-centric orchestration with `AGENTS.md`, rules, workflows, skills, and isolated subtasks
- Relative to current research, the strongest common pattern is not "bigger prompt," but "smaller top-level prompt plus better routing, memory, and controls."
- In this repo, the OpenCode harness already reflects that same family of design: lean pointer-based `AGENTS.md`, progressive disclosure, a small skill set, specialized agents/subagents, explicit permissions, and maintenance/eval thinking.

## Summary

- Official docs show broad standardization around repo-local instruction files and permissioned tool use.
- Practitioner material emphasizes durable external state, explicit workflows, and hierarchical multi-agent setups for longer tasks.
- Academic work supports short curated skills, narrow developer-authored context, explicit tool protocols, and structured memory over large static prompt blobs.
- Repo evidence shows this harness is intentionally aligned with those patterns.

## Key Findings

### Repo-local instruction files

- `Claude Code` uses layered `CLAUDE.md` plus `.claude/rules/`.
- `Codex`, `Cursor`, `OpenCode`, and `Kilo Code` all support `AGENTS.md`.
- Recent ecosystem research identifies `AGENTS.md` as an emerging cross-tool standard.

### Context strategy

- Official guidance increasingly favors progressive disclosure: load a small map first, then fetch deeper context only when needed.
- Research cuts against encyclopedic repo context; `Evaluating AGENTS.md` reports broad context files often increase cost and reduce success, while narrower developer-authored context performs better.
- `SkillsBench` finds small curated procedural skills outperform larger comprehensive docs.

### Workflow packaging

- `Codex`, `Cursor`, `OpenCode`, and `Kilo` all expose skills/commands/workflows as reusable operational units.
- The practitioner trend is to keep global prompts thin and move repeatable procedures into these modular artifacts.

### Subagents and modes

- `Claude Code`, `Cursor`, `Codex`, and `Kilo` all expose explicit subagents or role/mode systems.
- Blog and research evidence favors hierarchical role separation over flat many-agent coordination.

### Permissions and safety

- All major harnesses now treat approvals, sandboxing, and allowlists as core harness design, not an add-on.
- This aligns with security-oriented guidance cited in this repo around least privilege and safe-output patterns.

### Long-horizon execution

- OpenAI, Anthropic, and Cursor all describe durable state outside the conversation itself: plans, progress files, worktrees, memory, artifacts, logs, screenshots, or checkpoints.
- Academic work on context management and subtask memory points in the same direction.

## Code References

- `README.md:128` - Progressive-disclosure context strategy.
- `README.md:156` - Harness principles: lean `AGENTS.md`, focused skills, tooling enforcement, progressive disclosure, gated writes.
- `README.md:168` - Research sources this harness is based on.
- `agents/scout.md:13` - Scout as lightweight exploration/Q&A agent.
- `agents/engineer.md:26` - Complex-task workflow with targeted discovery, planning, validation, and review.
- `commands/research-deep.md:28` - Answer-first research orchestration with minimal subagent use.
- `MAINTENANCE.md:69` - Frontmatter-based permission model and three-layer security pattern.
- `templates/README.md:153` - Template tied directly to OpenAI harness engineering, `AGENTS.md` evaluation, and `SkillsBench`.
- `archive/slides.md:30` - Core design principles in concise form.

## Architecture Notes

### Claude Code

- Strongest emphasis on layered memory, hooks, and subagents with scoped tools/worktrees.
- Repo rule file is `CLAUDE.md`, but the operational pattern is close to `AGENTS.md` systems.

### Codex

- Strongest emphasis on formal instruction chaining, skills, sandbox/approval policy, and multi-agent/worktree orchestration.
- Official docs are the clearest on ordered instruction precedence.

### Cursor

- Strongest emphasis on rules, MCP/app ecosystem, subagents, and cloud/event-driven agent execution.
- Its harness spans IDE, CLI, cloud automations, and isolated VMs.

### OpenCode

- Strongest emphasis on configurable agent identities, commands, permissions, and compatibility with `AGENTS.md`/`CLAUDE.md`.
- In this repo, the harness is explicitly organized around `scout` vs `engineer`, focused subagents, and minimal top-level context.

### Kilo Code

- Strongest emphasis on mode-based control (`Code`, `Ask`, `Architect`, `Debug`, `Orchestrator`, `Review`) plus workflows and custom subagents.
- The setup looks closest to an OpenCode-style harness merged with stronger mode semantics.

### Research alignment

- Best-supported patterns across papers: narrow repo instructions, modular procedural skills, explicit tool interfaces, structured memory, iterative search/refine loops, and process-aware evaluation.
- That is broadly the direction the commercial harnesses have taken.

## Source Highlights

### Official docs

- `Claude Code` official docs: layered `CLAUDE.md`, memory, hooks, MCP, custom commands, subagents, worktrees, plan mode.
- `OpenAI Codex` docs: `AGENTS.md`, skills, multi-agent, sandbox/approval controls, worktrees.
- `Cursor` docs: `.cursor/rules`, `AGENTS.md`, subagents, hooks, skills, MCP, checkpoints, permissions.
- `OpenCode` docs: `AGENTS.md`, agent config, built-in agents/subagents, skills, commands, permissions.
- `Kilo Code` docs: modes, `AGENTS.md`, rules, skills, custom subagents, workflows, auto-approve controls.

### Blogs and practitioner writing

- Anthropic and OpenAI both describe long-horizon harnesses that externalize state into repo files instead of relying on chat history.
- Cursor engineering writing emphasizes planner/worker/judge role separation, sandbox awareness, and artifact-based review.
- Ecosystem writing around `AGENTS.md` and skills stresses progressive disclosure and metadata-first routing.

### Academic work

- `SkillsBench` (`Li et al., 2026`): curated skills materially improve results; short procedural skills outperform comprehensive docs.
- `Evaluating AGENTS.md` (`Gloaguen et al., 2026`): broad repo context can reduce success and increase cost; narrow developer-authored context performs better.
- `ContextBench` (`Li et al., 2026`): context retrieval quality is still a bottleneck; many retrieved files are never used.
- `Agentic Context Engineering` (`Zhang et al., 2025/2026`): iterative summarization can cause context collapse; curated evolving context works better.
- `Context as a Tool` (`Liu et al., 2025`): explicit context-management operations outperform hidden append-only context.
- `SWE-agent`, `SWE-Search`, `ReAct`, and `Toolformer` support the broader harness pattern of explicit tool use, iterative refinement, and structured observation loops.

## Open Questions

- Official docs are uneven on exact precedence details outside `Claude Code`, `Codex`, and `OpenCode`; `Cursor` and `Kilo` document the pieces clearly, but not always with one canonical precedence model.
- Public material on `OpenCode` and `Kilo Code` explains product capabilities well, but there is less third-party deep analysis than for `Claude Code`, `Codex`, or `Cursor`.
- Cross-tool terminology differs (`rules`, `skills`, `commands`, `workflows`, `subagents`, `modes`), though the underlying harness structure is increasingly similar.
