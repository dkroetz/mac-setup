# Cross-Layer Consistency Matrix

Scope:
- Global: `~/.config/opencode/*`
- Project: `~/Projects/futilify/*`

Review date: 2026-03-03

## Matrix

| Area | Global layer | Project layer | Consistency status | Source of truth | Action |
|---|---|---|---|---|---|
| Minimal preflight policy | `agents/engineer.md:22` (AGENTS + project-intelligence first) | `AGENTS.md:29` (minimal context first; architecture conditional) | PARTIAL | Project `AGENTS.md` for project preflight | Keep policy; align project instructions config |
| Architecture loading behavior | `templates/project-opencode/opencode.json:3` preloads architecture | `.opencode/opencode.json:3` preloads architecture | CONFLICT with project strategy | Project `AGENTS.md` + migration notes | Remove mandatory preload and use conditional retrieval |
| Command responsibilities | `commands/plan.md`, `commands/build.md`, `commands/context.md`, `commands/add-context.md` are scoped | Project uses same global commands | CONSISTENT | Global command specs | Keep boundaries; periodic audit only |
| Skills boundaries | All three global skills include use/do-not-use boundaries | No project override | CONSISTENT | Global skills | Keep small skill set |
| Subagent contracts | Planner/reviewer contracts present; reviewer lacks explicit bash deny | No project override | PARTIAL | Global subagent files | Add explicit deny where role is read-only |
| Validation expectations | Global AGENTS mandates Python checks always | Project is Python-first, so mostly aligned | PARTIAL (cross-project risk) | Project AGENTS/tooling for repo-specific enforcement | Soften global tooling language to avoid non-Python collisions |
| Security guardrails | `opencode.json` uses gated write/edit and selective bash allow; plugin blocks sensitive reads | Project has no conflicting overrides | CONSISTENT with minor hardening opportunity | Global config/plugins | Harden sensitive pattern matching |
| Context quality checks | `/context validate` and `/audit` exist globally | Project AGENTS explicitly recommends both | CONSISTENT | Global command behavior + project AGENTS usage guidance | Keep, and add KPI artifact location |

## Collision register

1. **CL-01 (High)**: Architecture preload in `.opencode/opencode.json` conflicts with project progressive-disclosure policy.
2. **CL-02 (Medium)**: Global AGENTS Python-only validation guidance can collide in non-Python repositories.
3. **CL-03 (Low)**: Reviewer subagent permissions are not fully explicit for bash deny.

## Resolution order

1. Resolve CL-01 first (largest context-quality impact).
2. Resolve CL-02 second (cross-project reliability gain).
3. Resolve CL-03 third (contract hardening).
