# Permission Frontmatter Migration: Engineer Agent Autonomy

## Goal

Simplify the permission structure by moving permission definitions from global `opencode.json` into agent markdown frontmatter, with the primary goal of making the engineer agent autonomous for workspace operations while maintaining security through scoped, least-privilege access.

## Background & Research Findings

### Current State
- Global permissions in `opencode.json` apply restrictive defaults (`ask` for edit/write/bash)
- Agent frontmatter supports per-agent permission overrides
- Engineer agent only has task delegation permissions (no tool-level permissions)
- Permission model already supports both tool and task delegation permissions

### Best Practices from Research (2026)
1. **Least Privilege by Design**: Grant minimum access required for the task
2. **Per-Agent Identity**: Each agent has its own permission profile as a distinct identity
3. **Three-Layer Security**:
   - Read operations: Broad access for context gathering
   - Write operations: Scoped to workspace with constraints
   - Destructive operations: Explicit human verification
4. **Frontmatter-Based Configuration**: YAML frontmatter defines permissions, tools, and constraints
5. **Safe Outputs Model**: Intelligence without exposure - broad read, narrow explicit write

### Key Insights
- 88% of organizations report AI agent security incidents (State of AI Agent Security 2026)
- Permission boundaries require fundamentally different architecture than traditional RBAC
- Agent identity and scoped credentials are essential for autonomous operation
- Separation of read vs write operations is critical

## Phase 1 - Design Engineer Permission Profile

**Description**: Define the permission model for the engineer agent based on least-privilege principles and autonomy requirements.

**Files to modify/create**:
- `agents/engineer.md` (planning only, no changes yet)

**Exit criterion**:
- Documented permission profile specifying:
  - Which tools get `allow` vs `ask` vs `deny`
  - Bash command allowlist/denylist
  - Scope of file operations (workspace boundaries)
  - Human verification points

**Design Principles**:
1. **Read Operations - Allow**: glob, grep, webfetch, websearch (already allowed)
2. **Write Operations - Scoped Allow**:
   - `edit`: Allow within workspace (not system files, not parent directories)
   - `write`: Allow within workspace (same constraints)
3. **Bash Operations - Tiered**:
   - **Allow**: Read-only commands (ls, cat, tree, grep, find, git read-only)
   - **Allow**: Development tools (pytest, mypy, ruff, pdm)
   - **Ask**: File manipulation (rm, mv, cp, mkdir, touch)
   - **Deny**: Destructive git (git push --force, git reset --hard)
4. **Human Verification Only For**:
   - Git commits (preserve intentional commit practices)
   - Git push (preserve review workflows)
   - Destructive file operations (rm -rf patterns)
   - Operations outside workspace scope

**Risks and mitigations**:
- **Risk**: Overly permissive write access could lead to unintended file modifications
- **Mitigation**: Scope to workspace directory only; deny operations with `..` or absolute paths outside workspace

---

## Phase 2 - Implement Engineer Agent Permissions

**Description**: Update engineer.md frontmatter with the designed permission profile, enabling autonomous workspace operations.

**Files to modify/create**:
- `agents/engineer.md`

**Exit criterion**:
- Engineer agent has explicit tool-level permissions in frontmatter
- Permissions follow the design from Phase 1
- Agent can read/write/edit within workspace without prompts
- Destructive operations still require human approval

**Implementation**:
```yaml
---
description: Primary development agent for complex tasks, refactoring, and architectural work
mode: primary
temperature: 0.2
steps: 100
permission:
  # Tool permissions
  edit: allow
  write: allow
  glob: allow
  webfetch: allow
  websearch: allow
  bash:
    # Read-only operations - allow
    "*": deny
    "ls *": allow
    "pwd": allow
    "wc *": allow
    "tree *": allow
    "rg *": allow
    "grep *": allow
    "find *": allow
    "head *": allow
    "tail *": allow
    "cat *": allow
    "jq *": allow
    "diff *": allow
    "git status*": allow
    "git diff*": allow
    "git log*": allow
    "git show*": allow
    "git branch": allow
    "git branch --list*": allow
    "git tag --list*": allow
    "git remote*": allow
    "git rev-parse*": allow
    "git ls-files*": allow
    "git ls-tree*": allow
    "git cat-file*": allow
    # Development tools - allow
    "pytest": allow
    "pytest *": allow
    "mypy": allow
    "mypy *": allow
    "ruff check": allow
    "ruff check *": allow
    "ruff format": allow
    "ruff format *": allow
    "pdm run pytest*": allow
    "pdm run mypy*": allow
    "pdm run ruff*": allow
    # File operations - ask (require approval)
    "rm *": ask
    "mv *": ask
    "cp *": ask
    "mkdir *": ask
    "touch *": ask
    # Git write operations - ask (preserve workflow)
    "git add *": ask
    "git commit *": ask
    "git push *": ask
    "git reset*": ask
    "git checkout*": ask
    "git merge*": ask
    "git rebase*": ask
    # Destructive operations - deny
    "git push --force*": deny
    "git reset --hard*": deny
    "rm -rf*": deny
    # Task delegation permissions
  task:
    discoverer: allow
    context-auditor: allow
    planner: allow
    implementer: allow
    reviewer: allow
    explore: allow
    general: allow
---
```

**Human verification**: 
- **Required** (architecture-changing): Review permission profile before committing to ensure alignment with security requirements and workflow preferences

---

## Phase 3 - Refactor Global Permission Defaults

**Description**: Update `opencode.json` to serve as a restrictive fallback for agents without explicit permissions, and remove engineer-specific overrides that are now in agent frontmatter.

**Files to modify/create**:
- `opencode.json`

**Exit criterion**:
- Global config provides safe defaults for unknown agents
- No engineer-specific permissions in global config (moved to agent frontmatter)
- Other agents (scout, auto, ci-auto) continue to work with their existing frontmatter overrides

**Implementation**:
- Keep restrictive defaults for edit/write/bash
- Simplify bash allowlist to minimal safe operations
- Remove development tool specifics (now in engineer.md)
- Keep MCP configuration unchanged

**Rationale**:
- Global config becomes the "secure by default" baseline
- Agent frontmatter provides autonomy where appropriate
- Clear separation: global = restrictive default, agent = scoped autonomy

---

## Phase 4 - Validate Permission Behavior

**Description**: Test the new permission model to ensure engineer agent operates autonomously within scope while maintaining security boundaries.

**Files to modify/create**:
- None (validation phase)

**Exit criterion**:
- Engineer agent can perform read operations without prompts
- Engineer agent can edit/write files in workspace without prompts
- Engineer agent can run tests/linters without prompts
- Destructive operations still require approval (rm, git push --force)
- Git commits/pushes still require approval (preserve workflow)
- Scout agent behavior unchanged (still uses restrictive defaults)
- CI-auto agent behavior unchanged (has its own permission: allow)

**Validation checklist**:
1. Read operations: `ls`, `cat`, `grep`, `find`, `git status` - no prompts
2. Write operations: `edit file`, `write file` in workspace - no prompts
3. Development tools: `pytest`, `mypy`, `ruff check` - no prompts
4. File operations: `rm file`, `mv file` - prompt required
5. Git workflow: `git add`, `git commit`, `git push` - prompt required
6. Destructive: `rm -rf`, `git push --force` - blocked
7. Scout agent: inherits restrictive defaults - prompts for write operations

---

## Phase 5 - Documentation and Wisdom Capture

**Description**: Document the new permission model and capture lessons learned in project wisdom files.

**Files to modify/create**:
- `.opencode/context/wisdom/patterns.md` (if exists)
- `.opencode/context/wisdom/decisions.md` (if exists)
- `README.md` or `MAINTENANCE.md` (permission model documentation)

**Exit criterion**:
- Permission model documented with clear rationale
- Decision recorded in wisdom/decisions.md explaining the architecture
- Pattern documented in wisdom/patterns.md for per-agent permission profiles
- Maintenance documentation updated with permission management guidance

**Documentation points**:
1. **Architecture Decision**: Why frontmatter-based permissions over global config
2. **Security Model**: Three-layer approach (read/write/destructive)
3. **Pattern**: Per-agent permission profiles with least privilege
4. **Guidelines**: When to use allow/ask/deny
5. **Examples**: Engineer (autonomous), Scout (restrictive), CI-auto (fully autonomous)

**Risks and mitigations**:
- **Risk**: Future contributors may not understand the permission model
- **Mitigation**: Clear documentation with examples and rationale; reference to research sources

---

## Success Criteria

1. **Engineer Autonomy**: Engineer agent can work autonomously on typical development tasks (read, write, edit, test, lint) without prompts
2. **Security Maintained**: Destructive operations and workflow-sensitive operations (git commit/push) still require approval
3. **Clear Architecture**: Permission model is well-documented and follows industry best practices
4. **No Regression**: Other agents (scout, ci-auto) continue to work as expected
5. **Maintainability**: Future permission changes are localized to agent frontmatter, not global config

## Notes

- This plan follows the "safe outputs" model from GitHub Agentic Workflows research
- Permission model aligns with OWASP LLM/Agentic Top 10 security recommendations
- Human verification is preserved for workflow-sensitive operations (git commit/push) to maintain intentional development practices
- The three-layer model (read=allow, write=scoped-allow, destructive=ask/deny) provides intelligence without exposure
