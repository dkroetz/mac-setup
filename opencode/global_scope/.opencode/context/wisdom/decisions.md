# Architecture Decisions

Record of significant architectural decisions and their rationale.

---

## 2026-03-09: Frontmatter-Based Permission Model

### Status
Accepted

### Context
The global permission configuration in `opencode.json` applied restrictive defaults to all agents, requiring frequent permission prompts even for safe, routine operations. This created friction for the engineer agent which needed autonomy for productive development work.

Research into AI agent security best practices (2026) revealed:
- 88% of organizations report AI agent security incidents
- Permission boundaries require fundamentally different architecture than traditional RBAC
- Per-agent identity and scoped credentials are essential for autonomous operation
- The "safe outputs" pattern (broad read, narrow write) is recommended

### Decision
Implement a **frontmatter-based permission model** where:

1. **Agent frontmatter defines permissions**: Each agent has its own permission profile in its markdown file
2. **Three-layer security model**:
   - Layer 1: Read operations (allow) - broad access for intelligence
   - Layer 2: Write operations (scoped allow) - workspace only
   - Layer 3: Destructive operations (ask/deny) - human verification
3. **Global config as fallback**: `opencode.json` provides restrictive defaults for agents without explicit permissions
4. **Per-agent autonomy levels**: Engineer (high), Scout (low), CI-auto (full)

### Rationale

**Why frontmatter over global config:**

1. **Per-Agent Identity**: Each agent is a distinct identity requiring its own permission profile
2. **Least Privilege**: Agents get minimum access required for their designated functions
3. **Clear Separation**: Global = restrictive default, Agent = scoped autonomy
4. **Maintainability**: Permission changes localized to agent definitions
5. **Security**: Explicit permission boundaries prevent privilege escalation

**Why three-layer model:**

- **Read = Allow**: Agents need broad context to make informed decisions
- **Write = Scoped Allow**: Productive work requires write access within boundaries
- **Destructive = Ask/Deny**: Critical operations require intentional human approval

### Implementation

**Engineer Agent** (autonomous development):
```yaml
permission:
  edit: allow           # Workspace file edits
  write: allow          # Workspace file creation
  bash:
    "ls *": allow       # Read operations
    "pytest": allow     # Development tools
    "rm *": ask         # File operations (safety)
    "git commit *": ask # Git workflow (preserve practices)
    "rm -rf*": deny     # Destructive (blocked)
```

**Scout Agent** (restrictive exploration):
```yaml
# Inherits global defaults
edit: ask
write: ask
bash: ask
```

**CI-Auto Agent** (fully autonomous):
```yaml
permission: allow
```

**Global Config** (restrictive fallback):
```json
{
  "permission": {
    "edit": "ask",
    "write": "ask",
    "bash": { "*": "ask" }
  }
}
```

### Consequences

**Positive:**
- Engineer agent can work autonomously on typical tasks (read/write/test/lint)
- Security maintained through scoped permissions and human verification
- Clear architecture with permissions at agent level
- Follows industry best practices (OWASP, safe outputs pattern)
- No regression for other agents

**Negative:**
- More complex permission structure (frontmatter + global config)
- Requires understanding of three-layer model
- Need to validate permission changes carefully

**Risks Mitigated:**
- Overly permissive access scoped to workspace only
- Destructive operations blocked or require approval
- Git workflow preserved to maintain intentional practices

### Related Research

- **OWASP LLM Top 10 (2025)** and **Agentic Top 10 (2026)**
- **State of AI Agent Security 2026 Report**
- **GitHub Agentic Workflows** - Safe outputs pattern
- **FINOS AI Governance Framework** - Agent authority least privilege

### References

- Plan: `.opencode/context/plans/completed/2026-03-09-permission-frontmatter-autonomy-a3f8b1.md`
- Engineer agent: `agents/engineer.md`
- Global config: `opencode.json`
- Documentation: `MAINTENANCE.md` - Permission Model Architecture section

---

## 2026-03-09: Two-Primary-Agent Topology

### Status
Accepted

### Decision
Keep `scout` and `engineer` as the only active primary agents, and keep `auto` as an explicit experimental path instead of adding another always-on ask-style primary agent.

### Rationale
- `scout` already covers lightweight Q&A and selective exploration
- `engineer` already covers deeper implementation and orchestration
- A second ask-style primary agent would mostly add routing ambiguity
- Higher-autonomy behavior is safer as an explicit opt-in mode

### References
- `.opencode/context/decisions/2026-03-09-agent-topology.md`
- `agents/scout.md`
- `agents/engineer.md`
- `agents/auto.md`

---

## 2026-03-09: Metadata-First Skill Strategy

### Status
Accepted

### Decision
Keep skills narrowly procedural and metadata-first, and use them only when the task matches a clear workflow boundary.

### Rationale
- Lean skills are easier to route and cheaper to load than broad instruction dumps
- Commands and docs stay aligned when skills own only the procedure they are meant to execute
- This preserves progressive disclosure instead of front-loading every workflow into `AGENTS.md`

### References
- `AGENTS.md`
- `MAINTENANCE.md`
- `skills/code-quality/SKILL.md`
- `skills/project-setup/SKILL.md`

---

## 2026-03-09: Command-Owned Commit Workflow

### Status
Accepted

### Decision
Treat `/commit` as the single owned surface for commit guidance, and require explicit approval before the helper stages unstaged files.

### Rationale
- Commit behavior is workflow-sensitive and should stay centralized
- Duplicated guidance in a separate skill had already started to drift
- Staging broad local changes without approval risks mixing unrelated work

### References
- `commands/commit.md`
- `7bfd634`
- `ecc18cb`

---

## 2026-03-09: Phase Contract for `/plan` and `/build`

### Status
Accepted

### Context
The harness review revealed that `/build` often had to guess validation steps and approval gates because plan phases omitted explicit commands and human checkpoints, which made automated execution error prone.

### Decision
1. Require every phase to include `Files`, `Changes`, `Exit criterion`, `Validation` (or `Validation: None`), and `Human checkpoint` (or `Human checkpoint: None`).
2. Keep `Dependencies Between Phases` limited to strict ordering so phases remain independently executable.
3. `/build` must verify the plan contract before running, pause for checkpoints, and treat the plan as the source of truth for each phase.

### Rationale
- Explicit validation and checkpoint fields reduce interpretation drift between planners and executors.
- The contract lets `/build` behave mechanically, which protects against skipped approvals and redundant validation runs.
- It surfaces checkpoints and dependencies for reviewers and follow-up documentation.

### Consequences
- Plans gain a bit of structure but become easier for automation to trust.
- `/build` will refuse to run until the plan meets the contract, so planners need to update artifacts before execution.
- Documentation has to keep the contract visible (see README/MAINTENANCE) so future planners follow the same format.

### References
- `commands/plan.md`
- `commands/build.md`
- `MAINTENANCE.md`
- `.opencode/context/plans/completed/2026-03-09-skill-routing-build-handoff-c3d9f1.md`
