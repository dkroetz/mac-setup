# Research: OpenCode Agent Setup — Best Practices & Improvement Recommendations

**Date**: 2026-02-22

## Summary

The current 3-agent (Research → Architect → Implement) setup with domain skills and slash commands is well-structured and aligns with community best practices. The main gaps are: (1) the research and architect agents delegate to `@general` for file writing, but `@general` has its **own** permissions (not inherited from the parent), so it can write **anywhere** — defeating write-hardening; (2) OpenCode supports **path-scoped `edit` permissions** via object syntax that aren't being used yet; (3) there's meaningful duplication between `AGENTS.md` and the skill files that costs tokens on every interaction.

---

## Key Findings

### 1. CRITICAL: The `@general` Delegation Loophole

**Current pattern** (`~/.config/opencode/agents/research.md:39-45`, `architect.md:62-68`):
> "On confirmation, delegate to `@general` subagent to write the file"

**The problem**: The `@general` subagent does NOT inherit the parent agent's permissions. It gets its own ruleset:
- Base defaults (`*: allow`)
- Its own overrides (`todoread: deny`, `todowrite: deny`)
- Global user config permissions

**Source**: `opencode/packages/opencode/src/agent/agent.ts:115-129`

So when the research agent (`write: deny`) delegates to `@general`, general can write to **any** path. This undermines write restriction entirely.

**Fix**: Use path-scoped edit permissions directly on the research/architect agents so they can write to their designated directories themselves. Eliminates the delegation complexity.

### 2. Path-Scoped Edit Permissions Exist But Aren't Used

OpenCode supports granular object syntax for permissions:

```yaml
# research.md frontmatter:
permission:
  edit:
    "*": deny
    ".opencode/research/*": allow
  bash: deny
```

**Source**: `opencode/packages/opencode/src/permission/next.ts:46-62`, `packages/web/src/content/docs/permissions.mdx:52-68`

**Important**: Internally, `write`, `edit`, `patch`, and `multiedit` all map to the `edit` permission key (`config.ts:748-757`). Only `edit` needs to be set.

**Evaluation semantics**: Last matching rule wins (`findLast` at `next.ts:236-243`). Put `"*": deny` first, then specific allows.

A blanket `"*": deny` removes the tool from the LLM entirely (not even shown to the model). A path-scoped deny keeps the tool available but blocks specific patterns at runtime.

### 3. Bash Is the Escape Hatch

Even with `edit: deny`, an agent with `bash` access can write via `echo > file`, `tee`, etc. Research and architect already have `bash: deny` — good. But `@general` (which they delegate to) has `bash: allow` — another reason to eliminate the delegation pattern.

### 4. Duplication Between AGENTS.md and Skills

Content that exists in both places:

| Content | AGENTS.md location | Skill file |
|---------|-------------------|------------|
| PDM commands table | lines 33-42 | `python-pdm/SKILL.md:17-26` |
| "After editing" verification | lines 13-19 | `python-pdm/SKILL.md:38-41` |
| Conventions (Python 3.13, line length) | lines 56-59 | `python-pdm/SKILL.md:30-34` |
| Important files | lines 44-52 | `python-pdm/SKILL.md:44-46` |

`AGENTS.md` is **always loaded** into context. Skills are **on-demand**. Duplication means paying tokens twice when skills are loaded, and AGENTS.md is larger than it needs to be.

**Recommendation**: Keep AGENTS.md as a lean index (~60 lines). Move detailed tool-specific instructions into skills.

### 5. Skill Discovery: Global + Project-Local Both Supported

OpenCode scans skills in this order (later wins on name collision):

1. **External global**: `~/.claude/skills/**/SKILL.md`, `~/.agents/skills/**/SKILL.md`
2. **External project**: `.claude/skills/**/SKILL.md`, `.agents/skills/**/SKILL.md`
3. **OpenCode config dirs**: `{.opencode,.config/opencode}/{skill,skills}/**/SKILL.md`
4. **Custom paths**: `skills.paths` array in `opencode.jsonc`
5. **Remote URLs**: `skills.urls` array in `opencode.jsonc`

**Source**: `opencode/packages/opencode/src/skill/skill.ts:45-170`

Project-local skills in `.opencode/skills/<name>/SKILL.md` are auto-discovered and override global skills with the same name. This means:
- **Global skills** (`~/.config/opencode/skills/`) for reusable patterns (python-pdm, git-workflow)
- **Project-local skills** (`.opencode/skills/`) for project-specific patterns (futilify-specific paths, models, flows)

Currently all 3 skills are global but contain futilify-specific paths (e.g., `postgres/SKILL.md:16` → `src/futilify/common/models/`). Consider splitting: generic patterns stay global, project-specific paths move to local skills or local skill overrides.

### 6. `task` Permission Scoping Available But Not Used

Research and architect agents can currently spawn **any** subagent via the `task` tool. This can be scoped:

```yaml
# research.md:
permission:
  task:
    "explore": allow
    "research/*": allow
    "*": deny
```

Prevents the research agent from accidentally spawning implement or other unintended subagents.

### 7. The `implement` Command Has Hardcoded Verification

`commands/implement.md:16-17` hardcodes:
```bash
pdm run ruff check . && pdm run ruff format . && pdm run mypy
```

But `implement.md` agent (line 50) correctly says:
> "Read verification commands from `.opencode/AGENTS.md`"

The command overrides the agent's dynamic behavior. If verification commands change in AGENTS.md, the command file becomes stale.

### 8. `steps` Field Available for Cost Control

OpenCode supports `steps` in agent frontmatter to cap agentic iterations:

```yaml
steps: 50  # cap at 50 tool calls
```

Not currently used. Useful when experimenting with expensive models. Research/architect (read-heavy) could use lower caps than implement.

### 9. `external_directory` Permission for Cross-Project Research

Research agents may need to read files outside the project directory (cross-project research, referencing other repos). The `external_directory` permission controls this:

```yaml
permission:
  external_directory:
    "~/Projects/*": allow
    "~/Repos/*": allow
    "*": ask
```

Default is `ask` (prompts user). Explicitly allowing known directories avoids repeated prompts during research sessions.

### 10. No Model Assignments for Architect/Implement

`opencode.jsonc` only defines models for the research agent family. Architect and implement fall back to the global default. Since you want to experiment with different models per agent, consider making this explicit (or at least documenting the intent).

### 11. Research Output Quality

The existing research output (`futilify/.opencode/research/2026-02-22-browserless-stealth-ad-blocking.md`) follows the template well — structured sections, code references with file:line, architecture notes, open questions. The template is working as intended.

---

## Concrete Recommendations (Priority Order)

### P0: Harden Research/Architect Write Scope

Replace `@general` delegation with path-scoped edit permissions:

**research.md** frontmatter:
```yaml
permission:
  edit:
    "*": deny
    ".opencode/research/*": allow
  bash: deny
```

**architect.md** frontmatter:
```yaml
permission:
  edit:
    "*": deny
    ".opencode/plans/*": allow
  bash: deny
```

Remove the "delegate to @general" sections from both agents. They write directly to their scoped directories.

### P1: Slim Down AGENTS.md

Move duplicated content into skills. AGENTS.md becomes a ~60-line lean index:
- Venv activation (2 lines)
- Verification commands (3 lines)
- Docker build rule (3 lines)
- Quick command table (10 lines)
- Package structure (10 lines)
- Conventions (4 lines)
- Workflow overview (15 lines)
- Skills available + when to load (5 lines)

### P2: Scope `task` Permissions

```yaml
# research.md
permission:
  task:
    "explore": allow
    "research/*": allow
    "*": deny

# architect.md
permission:
  task:
    "explore": allow
    "*": deny

# implement.md — keep broad (needs general for complex tasks)
```

### P3: Add `external_directory` for Research

```yaml
# research.md / architect.md
permission:
  external_directory:
    "~/Projects/*": allow
    "~/Repos/*": allow
    "*": ask
```

### P4: Remove Hardcoded Verification from Command

In `commands/implement.md`, replace hardcoded bash commands with:
```markdown
3. After each phase, run verification commands from `.opencode/AGENTS.md`
```

### P5: Consider `steps` Caps

```yaml
# research.md / architect.md
steps: 30

# implement.md
steps: 80
```

### P6: Split Skills (Global vs Project-Local)

- **Global** (`~/.config/opencode/skills/`): Generic patterns (python-pdm conventions, prefect flow structure, SQLAlchemy model pattern)
- **Project-local** (`.opencode/skills/`): Project-specific paths, model locations, deployment configs

Or: keep global skills generic and let AGENTS.md provide the project-specific path mappings (current approach with dedup from P1).

### P7: Add `codesearch` to Docs Subagent

`agents/research/docs.md` — add `codesearch: true` to tools for better API doc searching.

---

## Architecture Notes

- **Permission evaluation**: Last matching rule wins (`findLast`). Order: `"*": deny` first, then specific allows.
- **`edit` is canonical**: `write`/`edit`/`patch`/`multiedit` all map to `edit` internally.
- **`@general` subagent**: Gets own permissions (base defaults + overrides + global config). Does NOT inherit parent.
- **Session-level permissions**: Appended after agent permissions (highest priority) during subagent creation.
- **Tool removal**: Blanket `"*": deny` removes tool from LLM entirely. Path-scoped deny keeps tool available, blocks specific patterns at runtime.
- **Skill loading order**: Global first, project-local second (project overrides global on name collision).
- **Skill discovery paths**: `.opencode/skills/*/SKILL.md` (project), `~/.config/opencode/skills/*/SKILL.md` (global), plus `.claude/` and `.agents/` compat dirs.

## Open Questions

- What's the right split between global and project-local skills? Keep all 3 global with generic content and override per-project, or make futilify-specific ones local from the start?
- Should `steps` caps be set now or deferred until cost patterns are observed?
- Should research subagents (academic, blogs, code, docs, news) also get `external_directory` permissions for when they need to read local reference repos?
