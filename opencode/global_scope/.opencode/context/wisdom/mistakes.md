# Mistakes

Common mistakes and how to avoid them. Focus on non-obvious issues that aren't discoverable from code alone.

---

## Permission Configuration Mistakes

### Mistake: Forgetting Default Deny in Bash Permissions

**What Happened**: When adding bash permissions, forgot to set `"*": deny` as the default, allowing unintended command execution.

**Example**:
```yaml
bash:
  "ls *": allow
  "pytest": allow
  # Missing: "*": deny
```

**Result**: Any command not explicitly listed is allowed by global default.

**Fix**:
```yaml
bash:
  "*": deny  # Default deny all
  "ls *": allow
  "pytest": allow
```

**Prevention**:
- Always start bash permission block with `"*": deny`
- Explicitly list allowed commands
- Review bash permissions before committing

---

### Mistake: Using Overly Broad Git Permissions

**What Happened**: Set `"git *": allow` to reduce friction, accidentally allowed destructive operations.

**Example**:
```yaml
bash:
  "git *": allow  # Too broad!
```

**Result**: Agent could run `git push --force`, `git reset --hard`, etc.

**Fix**: Use explicit allowlist:
```yaml
bash:
  "git status*": allow
  "git diff*": allow
  "git log*": allow
  "git push --force*": deny  # Explicit deny
```

**Prevention**:
- Never use broad wildcards for sensitive tools
- List specific safe operations
- Explicitly deny destructive variants

---

### Mistake: Setting Permissive Global Defaults

**What Happened**: Set global config to `allow` for convenience, creating security risk for all agents.

**Example**:
```json
{
  "permission": {
    "edit": "allow",
    "write": "allow"
  }
}
```

**Result**: Scout agent (intended to be read-only) could edit files.

**Fix**: Keep global config restrictive:
```json
{
  "permission": {
    "edit": "ask",
    "write": "ask"
  }
}
```

Grant permissions in agent frontmatter instead.

**Prevention**:
- Global config = restrictive fallback
- Agent frontmatter = scoped autonomy
- New agents should inherit safe defaults

---

### Mistake: Not Testing Permission Changes

**What Happened**: Modified permissions without testing, broke agent functionality.

**Example**: Removed `"pytest *": allow` thinking it was redundant with `"pytest": allow`.

**Result**: Agent couldn't run `pytest tests/test_file.py` (with arguments).

**Fix**: Always test after permission changes:
1. Read operations: `ls`, `cat`, `git status`
2. Write operations: `edit file`, `write file`
3. Development tools: `pytest path/to/test.py`
4. File operations: `rm file` (should prompt)
5. Git workflow: `git commit` (should prompt)

**Prevention**:
- Run validation checklist after permission changes
- Test both bare commands and commands with arguments
- Verify other agents still work correctly

---

### Mistake: Confusing Task and Tool Permissions

**What Happened**: Set `permission: allow` thinking it only applied to task delegation.

**Example**:
```yaml
permission:
  task:
    explore: allow
  # Missing tool-level permissions
```

**Result**: Agent couldn't use tools (edit, write, bash).

**Fix**: Understand the difference:
```yaml
permission:
  # Tool permissions (edit, write, bash, glob, etc.)
  edit: allow
  write: allow
  bash:
    "ls *": allow
  
  # Task delegation permissions (subagent delegation)
  task:
    explore: allow
    planner: allow
```

**Prevention**:
- Tool permissions = what tools agent can use
- Task permissions = what subagents agent can delegate to
- Both need to be configured appropriately

---

## Security-Related Mistakes

### Mistake: Allowing Operations Outside Workspace

**What Happened**: Didn't consider that write operations might affect files outside workspace.

**Example**: Agent ran `rm -rf ../other-project` by mistake.

**Result**: Deleted files in parent directory.

**Fix**: 
1. Implicitly scope write operations to workspace
2. Deny operations with `..` paths
3. Use `ask` for file operations even in workspace

**Prevention**:
- Assume workspace boundary is enforced at platform level
- Still use `ask` for destructive operations
- Review agent behavior when it accesses parent directories

---

### Mistake: Not Considering Prompt Injection

**What Happened**: Agent with full permissions could be manipulated via malicious input.

**Example**: User pasted code with hidden instructions to delete files.

**Result**: Agent executed unintended destructive operations.

**Fix**:
1. Keep destructive operations as `ask` or `deny`
2. Don't grant full autonomy to agents processing untrusted input
3. Use separate agents with different trust levels

**Prevention**:
- Never use `permission: allow` for agents handling external input
- Keep destructive operations behind human verification
- Consider attack surface when granting permissions

---

## Workflow-Related Mistakes

### Mistake: Automating Git Workflow Operations

**What Happened**: Allowed `git commit *` and `git push *` to reduce friction.

**Result**: 
- Agent made commits without meaningful messages
- Pushed code without review
- Bypassed CI/CD checks

**Fix**: Keep git workflow as `ask`:
```yaml
bash:
  "git add *": ask
  "git commit *": ask
  "git push *": ask
```

**Prevention**:
- Git workflow is intentionally manual
- Preserves code review practices
- Ensures meaningful commit messages
- Allows CI/CD to run before push

**Exception**: CI automation agents may have git permissions for specific workflows.

---

### Mistake: Not Documenting Permission Rationale

**What Happened**: Added permission override without documenting why.

**Result**: Later, couldn't remember if permission was intentional or a mistake.

**Fix**: Document rationale in comments or wisdom files:
```yaml
bash:
  # Allow pytest with arguments for targeted testing
  "pytest *": allow
  
  # Deny force push to prevent history rewriting
  "git push --force*": deny
```

**Prevention**:
- Add comments for non-obvious permission choices
- Update wisdom/decisions.md for architectural changes
- Update wisdom/patterns.md for reusable patterns

---

### Mistake: Running `/build` Without a Validated Plan Contract

**What Happened**: `/build` jumped into execution after seeing a plan whose phases omitted required validation commands or clear human checkpoint reasons, so the agent guessed when to stop and whether the field was complete.

**Result**:
- The agent conflated separate phases, reran validation from later phases, and skipped planned checkpoints.
- Human checkpoints that mattered for risky changes were not honored.
- The entire execution needed follow-up clarification before merging.

**Fix**:
1. Stop and ask for clarification whenever a plan phase lacks `Files`, `Changes`, `Exit criterion`, `Validation`, or `Human checkpoint`.
2. Update the plan so each phase explicitly lists the validation command (or `Validation: None`) and the checkpoint reason (or `Human checkpoint: None`).
3. Only run `/build` once the plan satisfies the contract described in `commands/plan.md`.

**Prevention**:
- Treat the plan as a contract: run the pre-flight checklist in `commands/build.md` before executing.
- Keep `Dependencies Between Phases` for strict ordering only so `/build` can execute each phase independently.
- Use explicit `Validation: None`/`Human checkpoint: None` when appropriate so the executor never fills in the blanks.

---

## Maintenance-Related Mistakes

### Mistake: Not Reviewing Permissions Regularly

**What Happened**: Permissions accumulated over time without review.

**Result**: Agents had more access than needed (violated least privilege).

**Fix**: Add to maintenance checklist:
- Weekly: Review recent permission changes
- Monthly: Audit agent permissions for necessity
- Quarterly: Full permission model review

**Prevention**:
- Track permission changes in commit messages
- Review permissions as part of `/audit` workflow
- Question any permission that's not obviously necessary

---

### Mistake: Copying Permissions Between Agents

**What Happened**: Copied engineer permissions to scout agent for convenience.

**Result**: Scout (intended to be read-only) could edit files.

**Fix**: Each agent needs its own permission profile based on role:
- Engineer: High autonomy for development
- Scout: Low autonomy for exploration
- CI-auto: Full autonomy for automation

**Prevention**:
- Design permission profile for each agent's role
- Don't copy-paste without understanding implications
- Test each agent independently after permission changes

---

## Harness Documentation Mistakes

### Mistake: Letting `AGENTS.md` Accumulate Procedural Bulk

**What Happened**: Navigation, durable project facts, and step-by-step workflow instructions started to collapse into the same top-level file.

**Result**:
- Always-loaded context became noisier
- Routing guidance drifted away from the actual commands and skills
- Durable facts and task procedures were harder to separate

**Fix**:
1. Keep `AGENTS.md` short and pointer-based.
2. Move stable project facts into `.opencode/context/project-intelligence.md`.
3. Move repeatable workflows into commands and focused skills.

**Prevention**:
- Treat `AGENTS.md` as navigation, not a handbook
- Add pointers before adding detail
- Put long procedures in the surface that owns the workflow

---

### Mistake: Duplicating Workflow Guidance Across Commands and Skills

**What Happened**: Commit guidance lived in both `commands/commit.md` and `skills/git-workflow/SKILL.md`.

**Result**:
- Instructions drifted out of sync
- The agent had multiple places to look for one workflow
- Obsolete guidance stayed around longer than the command that replaced it

**Fix**: Centralize commit behavior in `commands/commit.md` and remove the duplicate skill.

**Prevention**:
- Give one surface clear ownership of each workflow
- Use skills for reusable procedures, not copies of command instructions
- Delete superseded guidance instead of leaving it as a fallback

---

### Mistake: Staging Unstaged Work Without Explicit Approval

**What Happened**: The commit helper could stage all unstaged files as part of the flow without a clear user approval gate.

**Result**:
- Git intent became less explicit
- Unrelated local work could be swept into a commit
- The helper violated the repo's manual commit expectations

**Fix**: Require approval before staging unstaged files and stop if there is still nothing staged.

**Prevention**:
- Check `git diff --cached` first
- Treat staging as a workflow-sensitive action
- Ask before broad staging operations even in helper commands

---

## Pattern Recognition

### Signs You Might Be Making Permission Mistakes

- ✗ Using broad wildcards (`"git *"`, `"npm *"`)
- ✗ Setting permissive global defaults
- ✗ Not testing after permission changes
- ✗ Copying permissions between agents
- ✗ Automating git workflow operations
- ✗ Not documenting rationale
- ✗ Allowing operations outside workspace scope
- ✗ Not considering prompt injection risk
- ✗ Skipping regular permission audits

### Good Practices

- ✓ Start with `"*": deny` and explicitly allow
- ✓ Keep global config restrictive
- ✓ Test thoroughly after changes
- ✓ Design per-agent profiles
- ✓ Preserve git workflow as `ask`
- ✓ Document non-obvious choices
- ✓ Scope to workspace boundaries
- ✓ Consider security implications
- ✓ Review permissions regularly

---

## See Also

- **Patterns**: `.opencode/context/wisdom/patterns.md` - Permission profile patterns
- **Decisions**: `.opencode/context/wisdom/decisions.md` - Architecture decisions
- **Documentation**: `MAINTENANCE.md` - Permission Model Architecture
- **Validation**: MAINTENANCE.md - Validation Checklist
