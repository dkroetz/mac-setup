# Patterns

Reusable patterns and best practices discovered through experience.

---

## Permission Profiles

### Pattern: Layered Context Surfaces

**Problem**: When instructions, project facts, task notes, and lessons all land in one file, context grows quickly and loses signal.

**Solution**: Split durable context by purpose and keep top-level files pointer-based.

**Implementation**:

1. Keep `AGENTS.md` short and navigational.
2. Store durable project facts in `.opencode/context/project-intelligence.md`.
3. Keep in-flight work in `.opencode/context/plans/active/`.
4. Store reusable lessons in `.opencode/context/wisdom/`.
5. Record architecture tradeoffs in `.opencode/context/decisions/` when the rationale matters.

**Benefits**:
- Preserves progressive disclosure
- Reduces prompt bloat in always-read files
- Makes task state and durable knowledge easier to maintain

---

### Pattern: Per-Agent Permission Profile

**Problem**: Different agents need different levels of autonomy. A global permission configuration is too coarse-grained, either too restrictive for productive work or too permissive for safety.

**Solution**: Define permission profiles in each agent's markdown frontmatter, with the global config serving as a restrictive fallback.

**Implementation**:

1. **Define agent role and autonomy level**
   - Engineer: High autonomy for development work
   - Scout: Low autonomy for exploration
   - CI-auto: Full autonomy for automation

2. **Apply three-layer security model**
   ```yaml
   permission:
     # Layer 1: Read operations (broad access)
     bash:
       "ls *": allow
       "cat *": allow
       "git status*": allow
     
     # Layer 2: Write operations (scoped allow)
     edit: allow
     write: allow
     bash:
       "pytest": allow
       "mypy": allow
     
     # Layer 3: Destructive operations (ask/deny)
     bash:
       "rm *": ask
       "git commit *": ask
       "rm -rf*": deny
   ```

3. **Set global config as restrictive fallback**
   ```json
   {
     "permission": {
       "edit": "ask",
       "write": "ask",
       "bash": { "*": "ask" }
     }
   }
   ```

**Examples**:

**Autonomous Development Agent** (Engineer):
```yaml
---
description: Primary development agent
permission:
  edit: allow
  write: allow
  bash:
    "*": deny
    "ls *": allow
    "pytest": allow
    "rm *": ask
    "git commit *": ask
---
```

**Restrictive Exploration Agent** (Scout):
```yaml
---
description: Quick Q&A agent
# Inherits global restrictive defaults
permission:
  task:
    explore: allow
---
```

**Full Automation Agent** (CI-auto):
```yaml
---
description: CI automation agent
permission: allow
---
```

**When to Use**:
- Creating new agents with specific autonomy requirements
- Adjusting existing agent permissions for different trust levels
- Implementing progressive autonomy (Month 1 → Month 3)

**Benefits**:
- Clear separation of concerns (global default vs agent-specific)
- Easy to understand agent capabilities from frontmatter
- Maintains security while enabling productivity
- Follows least privilege principle

**Gotchas**:
- Remember to test permission changes thoroughly
- Document rationale for non-obvious permission choices
- Keep global config restrictive as fallback
- Use `ask` for workflow-sensitive operations, `deny` for destructive

---

## Pattern: Permission Decision Tree

**When deciding allow/ask/deny:**

```
Is operation read-only?
├─ Yes → allow
└─ No → Is operation destructive?
    ├─ Yes → deny
    └─ No → Is operation workflow-sensitive?
        ├─ Yes → ask
        └─ No → Is operation well-tested and deterministic?
            ├─ Yes → allow
            └─ No → ask
```

**Examples**:
- `ls *` → read-only → **allow**
- `pytest` → not read-only, not destructive, not workflow-sensitive, well-tested → **allow**
- `git commit *` → not read-only, not destructive, workflow-sensitive → **ask**
- `rm -rf *` → destructive → **deny**

---

## Pattern: Scoped Write Permissions

**Problem**: Agents need write access to be productive, but unrestricted write access is dangerous.

**Solution**: Allow write operations but scope them to workspace boundaries.

**Implementation**:
1. Allow `edit` and `write` at tool level
2. Implicitly scope to workspace directory
3. Deny operations with `..` or absolute paths outside workspace
4. Require approval for operations outside normal scope

**Example**:
```yaml
permission:
  edit: allow   # Scoped to workspace
  write: allow  # Scoped to workspace
  bash:
    "rm *": ask  # Even in workspace, require approval
```

**Rationale**:
- Agents can be productive (create/edit files)
- System files protected (implicit workspace boundary)
- User still controls destructive operations

---

## Pattern: Git Workflow Preservation

**Problem**: Automating git operations can lead to accidental commits, pushes, or loss of intentional development practices.

**Solution**: Keep git workflow operations as `ask` even for autonomous agents.

**Implementation**:
```yaml
bash:
  # Allow read operations
  "git status*": allow
  "git diff*": allow
  "git log*": allow
  
  # Require approval for workflow operations
  "git add *": ask
  "git commit *": ask
  "git push *": ask
  
  # Block destructive operations
  "git push --force*": deny
  "git reset --hard*": deny
```

**Rationale**:
- Preserves intentional commit practices
- Prevents accidental pushes
- Maintains code review workflows
- Still allows agent to gather git context

**Exception**: CI automation agents may have full git permissions for automated workflows.

---

## Pattern: Development Tool Allowlist

**Problem**: Running tests, linters, and type checkers is routine and safe, but prompting for each run creates friction.

**Solution**: Create an allowlist of development tools that can run without approval.

**Implementation**:
```yaml
bash:
  # Testing
  "pytest": allow
  "pytest *": allow
  "pdm run pytest*": allow
  
  # Type checking
  "mypy": allow
  "mypy *": allow
  "pdm run mypy*": allow
  
  # Linting
  "ruff check": allow
  "ruff check *": allow
  "ruff format": allow
  "ruff format *": allow
  "pdm run ruff*": allow
```

**Rationale**:
- Development tools are well-tested and deterministic
- Running tests/linters is routine and safe
- Reduces friction for iterative development
- Agent can validate its own work autonomously

**When to Extend**:
- Add project-specific validation tools
- Include build commands if deterministic
- Consider package managers if scope is limited

---

## Harness Patterns

### Pattern: Lean AGENTS, Focused Skills

**Problem**: When `AGENTS.md` carries both navigation and full workflow instructions, it grows quickly, becomes harder to maintain, and forces every session to load procedural detail that most tasks do not need.

**Solution**: Keep `AGENTS.md` pointer-based and move repeatable procedures into commands and narrowly scoped skills.

**Implementation**:
1. Keep `AGENTS.md` limited to navigation, stable preferences, and a few global defaults.
2. Put durable project facts in `.opencode/context/project-intelligence.md`.
3. Put repeatable workflows in command files like `commands/plan.md` and `commands/commit.md`.
4. Keep skills metadata-first and procedural so agents load them only when the task actually matches.

**Benefits**:
- Reduces prompt bloat in always-read files
- Makes routing rules easier to keep consistent
- Lowers the chance of stale duplicated instructions

---

### Pattern: Keep Primary Agents Capability-Distinct

**Problem**: Adding multiple primary agents with nearly identical scopes creates routing ambiguity without adding a real capability boundary.

**Solution**: Keep the top-level agent set small and separate them by mode of work, not by tone.

**Implementation**:
1. Use `scout` for ask-oriented Q&A, targeted exploration, and small focused tasks.
2. Use `engineer` for multi-step implementation and delegated execution.
3. Keep higher-autonomy behavior in an explicit experimental surface like `auto`, not as another default primary agent.

**Benefits**:
- Makes agent selection legible
- Preserves a clear escalation path
- Avoids overlapping prompts that drift apart over time

---

### Pattern: Archive Completed Plans Instead of Deleting Them

**Problem**: Planning artifacts are useful after execution, but leaving finished plans in the active folder makes current work harder to trust.

**Solution**: Keep plans in `plans/active/` while work is in flight, then move them to `plans/completed/` when the work lands.

**Implementation**:
1. Create phase-based plan artifacts under `.opencode/context/plans/active/`.
2. Reference those plans from commits, decisions, or maintenance docs while the work is ongoing.
3. Move finished plans into `.opencode/context/plans/completed/` instead of deleting them.

**Benefits**:
- Keeps active planning surfaces truthful
- Preserves historical rationale for later review
- Makes follow-up audits and retrospectives easier

---

### Pattern: Stable Plan-to-Build Contract

**Problem**: If plans describe phases loosely, the build command has to infer too much about validation, checkpoints, and phase boundaries.

**Solution**: Use a stable per-phase contract that the build surface can consume with minimal interpretation.

**Implementation**:
1. Require every phase to include `Files`, `Changes`, `Exit criterion`, `Validation`, and `Human checkpoint`.
2. Write `Validation: None` and `Human checkpoint: None` explicitly when they do not apply.
3. Keep strict sequencing in `Dependencies Between Phases`, not hidden in phase prose.
4. Keep each phase small enough that a build command can execute it without borrowing work from later phases.

**Benefits**:
- Makes phase execution more mechanical and predictable
- Reduces drift between planning and implementation surfaces
- Makes pause-and-resume behavior easier to support

### Pattern: Capture Harness Review Outcomes at the Top Level

**Problem**: Contributors often need to read multiple files to understand the current agent topology, planning contract, and memory model that resulted from the latest harness review.

**Solution**: Add a concise `Harness Review Outcomes` section to `README.md` that lists the agreed defaults with direct references to the deeper documentation.

**Implementation**:
1. Create a dedicated review-outcomes section near the top-level project overview.
2. Summarize the primary agents, planning/build expectations, memory surfaces, and skill-loading rules with inline pointers to `MAINTENANCE.md`, `AGENTS.md`, and the relevant commands/context files.
3. Keep the text brief and update it whenever the review produces a new set of outcomes.

**Benefits**:
- Makes the prevailing strategy discoverable without hunting through every doc.
- Aligns the README with the richer guidance in `MAINTENANCE.md` and `.opencode/context/`.
- Signals which decisions are stable defaults for contributors.

**References**: `README.md: Harness Review Outcomes`, `MAINTENANCE.md`, `.opencode/context/project-intelligence.md`

### Pattern: Contract-Driven Plan Execution

**Problem**: `/build` can drift from `/plan` when phases omit validation instructions or checkpoint cues, forcing the executor to guess approvals or repeat work.

**Solution**: Treat each plan phase as a strict contract by requiring `Files`, `Changes`, `Exit criterion`, `Validation`, and `Human checkpoint`, limit dependencies to strict ordering, and validate the contract before `/build` starts.

**Implementation**:
1. During planning, spell out the files, concrete changes, exit criteria, validation command (or `None`), and exactly what `Human checkpoint` (or `None`) is needed for each phase.
2. Leave `Dependencies Between Phases` for non-negotiable ordering and keep phases small enough that `/build` can execute them independently.
3. `/build` should verify the plan contains all required fields before executing, honor checkpoints, and treat the plan as the authoritative guide for each phase.

**Benefits**:
- Forces planners to think explicitly about validation and approvals.
- Enables `/build` to run mechanically and avoids misinterpretation.
- Makes validation and checkpoint gates inspectable artifacts rather than informal expectations.

**References**: `commands/plan.md`, `commands/build.md`, `MAINTENANCE.md`

---

## Anti-Pattern: Global Permissive Defaults

**Problem**: Setting permissive defaults in global config creates security risk for all agents.

**Anti-Pattern**:
```json
{
  "permission": {
    "edit": "allow",
    "write": "allow",
    "bash": "allow"
  }
}
```

**Why It's Bad**:
- All agents inherit permissive defaults
- New agents start with too much access
- Violates least privilege principle
- Difficult to audit agent capabilities

**Better Approach**:
```json
{
  "permission": {
    "edit": "ask",
    "write": "ask",
    "bash": { "*": "ask" }
  }
}
```

Then grant specific permissions in agent frontmatter.

---

## Anti-Pattern: Overly Broad Bash Patterns

**Problem**: Using wildcards like `"git *": allow` grants too much access.

**Anti-Pattern**:
```yaml
bash:
  "git *": allow
  "npm *": allow
```

**Why It's Bad**:
- Allows `git push --force`, `git reset --hard`
- Allows `npm publish` when you only wanted `npm test`
- Violates least privilege
- Difficult to audit what's actually allowed

**Better Approach**:
```yaml
bash:
  "git status*": allow
  "git diff*": allow
  "git log*": allow
  # Explicitly deny destructive operations
  "git push --force*": deny
```

---

## Pattern Reference Table

| Pattern | Use Case | Example Agents |
|---------|----------|----------------|
| Per-Agent Permission Profile | Different agents need different autonomy | All agents |
| Permission Decision Tree | Deciding allow/ask/deny | Permission design |
| Scoped Write Permissions | Productive but safe file operations | Engineer, Implementer |
| Git Workflow Preservation | Maintain intentional practices | Engineer, Scout |
| Development Tool Allowlist | Reduce friction for routine validation | Engineer, Implementer |

---

## See Also

- **Architecture Decision**: `.opencode/context/wisdom/decisions.md` - Frontmatter-Based Permission Model
- **Implementation**: `agents/engineer.md`, `agents/scout.md`, `agents/ci-auto.md`
- **Documentation**: `MAINTENANCE.md` - Permission Model Architecture
