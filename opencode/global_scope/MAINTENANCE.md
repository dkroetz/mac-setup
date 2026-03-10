# Maintenance & Refinement Guide

Ongoing practices to keep your agent harness effective and prevent context staleness.

## Weekly Maintenance (30 min)

Run the `/audit` command weekly to check for context staleness:

```bash
/audit
```

Review the output and update:
- AGENTS.md if project description is outdated
- .opencode/context/architecture.md if architecture has changed
- .opencode/context/wisdom/ if entries are no longer applicable

## Progressive Autonomy Playbook

As trust builds with the harness, progressively relax constraints:

This is a staged playbook, not a description of the current repo state. The active topology remains:

- `scout` as the ask-oriented default agent
- `engineer` as the implementation-oriented primary agent
- `auto` as an explicit disabled experiment

### Month 1 (Learning)

**Scout**:
- All writes = ask
- Limited bash commands

**Engineer**:
- All writes = ask
- Review all plans before execution
- Monitor token usage and task duration

**Focus**: Build understanding of agent behavior and quality

### Month 2 (Comfort)

**Scout**:
- Allow safe read-only git commands:
  ```yaml
  permission:
    bash:
      "git status": allow
      "git diff": allow
      "git log": allow
  ```

**Engineer**:
- Allow specific tool patterns:
  ```yaml
  permission:
    bash:
      "pytest *": allow
      "mypy *": allow
      "ruff *": allow
  ```

**Focus**: Reduce friction for validated, safe operations

### Month 3+ (Confidence)

**Consider**:
- Enabling auto agent for specific, well-defined task types
- Adding more skills based on observed patterns
- Relaxing engineer's permissions for well-tested codebases
- Customizing agent prompts based on your workflow

**Focus**: Optimize for your specific needs and trust level

## Permission Model Architecture

The system uses a **frontmatter-based permission model** with per-agent permission profiles, following the principle of least privilege and the "safe outputs" security pattern.

## Context and Memory Surfaces

Keep persistent context separated by purpose:

- `AGENTS.md` - short global preferences and navigation
- `.opencode/context/project-intelligence.md` - durable project facts and canonical operating patterns
- `.opencode/context/plans/active/` - current execution plans
- `.opencode/context/plans/completed/` - historical plans
- `.opencode/context/wisdom/` - reusable lessons, patterns, and non-obvious mistakes
- `.opencode/context/decisions/` - explicit architecture decisions when rationale matters

Guidelines:

- Prefer pointer-based top-level files over large all-in-one context files.
- Put stable cross-task information in `project-intelligence.md`.
- Put task-local detail in plan artifacts.
- Put repeated lessons in `wisdom/` only when they are likely to matter again.
- Add a dedicated decision record when the tradeoff should remain inspectable later.

## Skill Loading Guidelines

Keep dynamic skill loading narrow and metadata-first:

- Maintain a small set of focused skills with clear trigger boundaries.
- Put repeatable procedures in skills, not in broad agent prompts.
- Keep skill descriptions short and routing-friendly.
- Load a skill only when its trigger boundaries clearly match the task.
- Prefer adding a new skill only after a workflow recurs often enough to justify it.
- Prefer sharper frontmatter metadata and caller-owned routing cues over adding more in-file routing prose.

## Plan and Build Contract

Keep `/plan` and `/build` aligned through a stable per-phase contract:

- Every phase should include `Files`, `Changes`, `Exit criterion`, `Validation`, and `Human checkpoint`.
- Use `Validation: None` explicitly when a phase has no meaningful command to run.
- Use `Human checkpoint: None` unless a real approval boundary exists.
- Put strict sequencing only in `Dependencies Between Phases`.
- Keep phases small enough that `/build` can execute one phase at a time without guessing where later work belongs.

### Architecture Decision

**Why frontmatter-based permissions over global config:**

1. **Per-Agent Identity**: Each agent is a distinct identity with its own permission profile
2. **Least Privilege**: Agents get minimum access required for their designated functions
3. **Clear Separation**: Global config = restrictive default, agent frontmatter = scoped autonomy
4. **Maintainability**: Permission changes are localized to agent definitions
5. **Security**: Explicit permission boundaries prevent privilege escalation

### Three-Layer Security Model

The permission model implements a three-layer approach:

#### Layer 1: Read Operations (Broad Access)
- **Strategy**: Allow by default for intelligence gathering
- **Examples**: ls, cat, grep, find, git status, git diff, git log
- **Rationale**: Agents need broad context to make informed decisions

#### Layer 2: Write Operations (Scoped Allow)
- **Strategy**: Allow within workspace boundaries, deny system access
- **Examples**: edit files, write files, pytest, mypy, ruff
- **Rationale**: Productive work requires write access, but scoped to workspace only
- **Constraints**: 
  - No operations outside workspace directory
  - No system file modifications
  - No parent directory access (../)

#### Layer 3: Destructive Operations (Human Verification)
- **Strategy**: Ask or deny to preserve safety
- **Examples**: rm, git commit, git push, git push --force
- **Rationale**: Critical operations require intentional human approval
- **Categories**:
  - **Ask**: Workflow-sensitive (git add, commit, push) - preserve practices
  - **Deny**: Destructive (rm -rf, git push --force) - prevent accidents

### Permission Profiles by Agent

#### Engineer Agent (Autonomous Development)
```yaml
permission:
  edit: allow           # Can edit workspace files
  write: allow          # Can create workspace files
  bash:
    # Read operations
    "ls *": allow
    "cat *": allow
    "git status*": allow
    # Development tools
    "pytest": allow
    "mypy": allow
    "ruff check": allow
    # File operations (safety check)
    "rm *": ask
    "mv *": ask
    # Git workflow (preserve practices)
    "git add *": ask
    "git commit *": ask
    "git push *": ask
    # Destructive (blocked)
    "rm -rf*": deny
    "git push --force*": deny
```

**Use Case**: Primary development agent for complex tasks
**Autonomy Level**: High - can work autonomously on typical tasks
**Human Verification**: Git workflow, destructive operations

#### Scout Agent (Restrictive Exploration)
```yaml
permission:
  # Inherits global defaults
  edit: ask             # Must ask for edits
  write: ask            # Must ask for writes
  bash: ask             # Must ask for bash commands
```

**Use Case**: Quick Q&A and code exploration
**Autonomy Level**: Low - read-only with explicit approval for writes
**Human Verification**: All write operations

#### CI-Auto Agent (Fully Autonomous)
```yaml
permission: allow       # Full permissions
```

**Use Case**: Non-interactive CI automation
**Autonomy Level**: Full - no human verification
**Rationale**: Controlled environment, deterministic tasks, narrow scope

### Guidelines: When to Use Allow/Ask/Deny

#### Use `allow` when:
- Operation is read-only and safe
- Operation is well-tested and deterministic
- Operation scope is limited to workspace
- Operation is frequently needed for productivity
- Example: pytest, mypy, ruff, ls, cat, git status

#### Use `ask` when:
- Operation has workflow implications
- Operation requires human judgment
- Operation should be intentional but allowed
- Operation modifies files but not destructively
- Example: git add, git commit, git push, rm single file, mv

#### Use `deny` when:
- Operation is destructive
- Operation can cause irreversible damage
- Operation should never be automated
- Example: rm -rf, git push --force, git reset --hard

### Modifying Permissions

To modify an agent's permissions:

1. **Edit the agent file**: `agents/<agent-name>.md`
2. **Update the permission frontmatter section**
3. **Test thoroughly** with validation checklist
4. **Document rationale** if changing security posture

Example:
```yaml
---
description: My agent description
mode: primary
permission:
  edit: allow
  bash:
    "my-custom-command": allow
---
```

### Security Best Practices

1. **Start Restrictive**: Begin with ask/deny, relax only when justified
2. **Scope to Workspace**: Never allow operations outside workspace
3. **Preserve Workflow**: Keep git workflow operations as ask
4. **Document Rationale**: Record why permissions were changed
5. **Test Thoroughly**: Validate permission changes don't break agent behavior
6. **Review Regularly**: Periodically audit permissions as part of maintenance

### Research-Based Design

This permission model is informed by 2026 industry research:

- **OWASP LLM/Agentic Top 10**: Security recommendations for autonomous systems
- **Safe Outputs Pattern**: Intelligence without exposure (broad read, narrow write)
- **Least Privilege by Design**: Minimum access required for the task
- **Per-Agent Identity**: Each agent has distinct permission profile
- **Three-Layer Security**: Read/write/destructive separation

Key statistics from research:
- 88% of organizations report AI agent security incidents (State of AI Agent Security 2026)
- Permission boundaries require fundamentally different architecture than RBAC
- Agent identity and scoped credentials are essential for autonomous operation

### Validation Checklist

After modifying permissions, validate:

- [ ] Read operations work without prompts (ls, cat, grep, git status)
- [ ] Write operations in workspace work without prompts (edit, write)
- [ ] Development tools work without prompts (pytest, mypy, ruff)
- [ ] File operations require approval (rm, mv, cp)
- [ ] Git workflow requires approval (git add, commit, push)
- [ ] Destructive operations are blocked (rm -rf, git push --force)
- [ ] Other agents unaffected (scout still restrictive, ci-auto still autonomous)

## The Feedback Hierarchy

When the agent does something wrong, fix it in this order (from Theo's video):

### 1. Fix the Codebase (Best)

**What**: Better naming, clearer types, missing tests, structural improvements

**Why**: Helps ALL future agents AND human developers

**Examples**:
- Rename ambiguous function `process()` → `validateAndTransformUser()`
- Add type hints to clarify expected inputs/outputs
- Add tests for edge cases the agent missed
- Extract complex logic into smaller, well-named functions

### 2. Fix the Tooling (Good)

**What**: Better linter rules, stricter type checking, improved CI

**Why**: Mechanically enforced, impossible to ignore

**Examples**:
- Add ruff rule to catch specific pattern
- Enable stricter mypy settings
- Add pre-commit hook for validation
- Create custom lint rule for project-specific patterns

### 3. Add a Skill (Targeted)

**What**: If mistake is procedural (wrong workflow, missed step)

**Why**: Encodes the correct procedure for future reference

**Examples**:
- Agent forgot to run tests → add to code-quality skill
- Agent used wrong git format → add to git-workflow skill
- Agent missed project-specific step → create new skill

### 4. Update AGENTS.md Gotchas (Last Resort)

**What**: Persistent agent confusion that can't be fixed in code

**Why**: Only for things that genuinely can't be addressed elsewhere

**Guidelines**:
- ~20% of agent-reported gotchas are worth keeping
- ~80% should be fixed in the codebase instead
- Keep this section minimal (<10 entries)

**Example**:
```markdown
## Gotchas

- Our "User" model represents accounts, not people. "Person" model is for individuals.
- The `process_payment()` function has side effects - don't call in tests without mocking.
```

### 5. Update Agent Prompt (Almost Never)

**What**: Changing the agent's system prompt

**Why**: Should rarely be needed if you've done 1-4 correctly

**When to consider**:
- After multiple iterations of 1-4 haven't worked
- For truly project-specific behavioral requirements
- After careful analysis of why the agent is confused

## Success Metrics

Track these to measure harness effectiveness:

### Per-Task Metrics
- **Token usage**: Is it reasonable for task complexity?
- **Task duration**: How long from start to completion?
- **Success rate**: Did the task complete correctly?
- **Iteration count**: How many fix cycles were needed?

### Long-Term Metrics
- **Context growth**: Are AGENTS.md and wisdom/ staying concise?
- **Repeated mistakes**: Are similar issues recurring?
- **Autonomy level**: Can you trust agents with more permissions?
- **Time savings**: Are you spending less time on routine tasks?

## Red Flags

Watch for these signs of context problems:

### Context Rot
- Agent makes obvious mistakes
- Repeatedly forgets information from earlier in session
- Performance degrades in long sessions
- **Fix**: Review and prune context files, use subagents more

### Context Staleness
- Agent references outdated patterns
- Suggestions don't match current codebase
- Architecture.md doesn't reflect reality
- **Fix**: Run `/audit`, update outdated files

### Context Bloat
- AGENTS.md > 100 lines
- Instructions array keeps growing
- Wisdom files have duplicate entries
- **Fix**: Prune redundant info, move details to code/docs

## Maintenance Checklist

### Weekly
- [ ] Run `/audit` and review results
- [ ] Check for repeated agent mistakes
- [ ] Review `/capture` additions to wisdom files
- [ ] Prune any duplicate or obvious wisdom entries

### Monthly
- [ ] Review token usage trends
- [ ] Assess if permissions can be relaxed
- [ ] Check if new skills are needed
- [ ] Update this maintenance guide if needed

### Quarterly
- [ ] Full review of all agent configurations
- [ ] Assess if auto agent should be enabled
- [ ] Review and update architecture.md
- [ ] Archive completed plans older than 3 months

## When Things Go Wrong

### Agent Produces Bad Code
1. Don't just fix it manually
2. Ask: "Why did the agent make this mistake?"
3. Apply feedback hierarchy (1-5)
4. Document the fix in wisdom/mistakes.md if it's a pattern

### Agent Seems Confused
1. Check AGENTS.md gotchas - is this a known issue?
2. Review .opencode/context/ - is information outdated?
3. Consider: is this a codebase clarity problem?
4. Run `/audit` to identify stale context

### Context Growing Too Large
1. Review AGENTS.md - remove discoverable information
2. Check instructions array - only always-relevant files
3. Prune wisdom files - keep only genuinely unique insights
4. Use subagents more to isolate context

### Performance Degrading
1. Check token usage - is it reasonable?
2. Review context size - is it too large?
3. Consider: are you using the right agent for the task?
4. Review: should this be delegated to a subagent?
