---
title: Prompt Best Practices for OpenCode
description: Comprehensive guide to writing effective prompts, skills, commands, and agents for OpenCode
---

# OpenCode Prompt Best Practices

## 1. Executive Summary

**Key principles for effective OpenCode prompting:**

- Use **H1→H2→H3 hierarchy** only (no H4+ headings)
- Write **action-oriented descriptions** that trigger skills automatically
- Follow **three-stage progressive disclosure**: metadata → SKILL.md body → bundled resources
- Keep **SKILL.md under 100 lines** for optimal context window management
- Use **imperative voice** ("Run tests" not "You should run tests")
- Put **trigger phrases in description frontmatter**, not just body
- Store **bulky content in references/** and **scripts in scripts/**
- Validate **YAML frontmatter** carefully - single-line descriptions only
- Use **XML tags** for structure when they add clarity
- Test skills with **realistic prompts**, not abstract examples

---

## 2. OpenCode Context

### Architecture Overview

OpenCode is an open-source AI coding agent (123k+ GitHub stars) built on a **client/server architecture** with a TUI frontend. It supports 75+ LLM providers via a unified API and is written primarily in TypeScript.

```xml
<architecture>
  <frontend>TUI (Terminal User Interface)</frontend>
  <backend>Client/Server architecture</backend>
  <providers>75+ LLM providers supported</providers>
  <languages>TypeScript (54.7%), MDX (41.2%)</languages>
</architecture>
```

### Three-Stage Skill Loading

OpenCode uses progressive disclosure to manage context windows efficiently:

| Stage | Content | When Loaded | Size |
|-------|---------|-------------|------|
| **1. Metadata** | `name` + `description` | Always visible | ~100 tokens |
| **2. SKILL.md Body** | Full instructions | On `skill({ name: "..." })` | Variable |
| **3. Bundled Resources** | `references/`, `scripts/`, `assets/` | On-demand access | As needed |

**Why this matters:** Only Stage 1 consumes tokens in every conversation. Stages 2-3 load only when the agent explicitly chooses the skill.

### Key Differences from Other Tools

| Feature | OpenCode | Claude Code | Cursor | Aider |
|---------|----------|-------------|---------|--------|
| **Open Source** | ✅ Yes | ❌ No | ❌ No | ✅ Yes |
| **AI Providers** | 75+ (any) | Claude only | Multiple | Any |
| **Interface** | TUI/CLI | Terminal CLI | IDE | Terminal |
| **Skill System** | Native `skill` tool | Native skills | `.cursor/rules` | Not native |
| **AGENTS.md** | Native | CLAUDE.md only | Supported | No |
| **Cost Model** | BYOK | Subscription | Subscription | BYOK |

**OpenCode Advantages:**
- **Provider Agnostic:** Use Claude, GPT, Gemini, local models
- **Open Standard:** AGENTS.md works across OpenCode, Cursor, Codex
- **Skills Ecosystem:** Progressive disclosure keeps context window clean
- **Client/Server:** Run remotely, control from anywhere
- **LSP Integration:** Native language server support

**OpenCode Limitations:**
1. **No AI-Visible Message Injection:** Plugin hooks can't inject reminders into conversation
2. **Skill Auto-Triggering:** Skills don't auto-trigger reliably without explicit mention
3. **Context Once at Startup:** Changes to AGENTS.md require session restart

---

## 3. File Organization

### Directory Structure

```
~/.config/opencode/           # Global config (or .opencode/ for project-local)
├── opencode.json            # Main configuration (JSON/JSONC)
├── tui.json                 # TUI-specific settings
├── AGENTS.md                # Global rules/instructions
├── agents/                  # Agent definitions
│   ├── build.md
│   └── plan.md
├── commands/               # Custom slash commands
│   └── my-command.md
├── skills/                 # Skill definitions
│   └── my-skill/
│       ├── SKILL.md
│       ├── scripts/
│       └── references/
├── plugins/                # JavaScript/TypeScript plugins
├── mcp/                    # MCP server configurations
└── rules/                  # Coding rules
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| **Directories** | Plural preferred | `skills/`, `commands/`, `agents/` |
| **Skill directories** | Must match `name` field exactly | `my-skill/` → `name: my-skill` |
| **SKILL.md** | All caps, exactly | `SKILL.md` (not `Skill.md`) |
| **Skill names** | Lowercase kebab-case | `data-pipeline`, `git-release` |

### Discovery Priority (Local to Global)

1. **Project-local:** `.opencode/skills/<name>/SKILL.md`
2. **Global:** `~/.config/opencode/skills/<name>/SKILL.md`
3. **Claude-compatible:** `.claude/skills/<name>/SKILL.md` (fallback)
4. **Agent-compatible:** `.agents/skills/<name>/SKILL.md` (fallback)

---

## 4. Markdown Structure

### Heading Hierarchy (H1→H2→H3 Only)

**Never use H4 or deeper.** Keep structure flat for better LLM parsing.

❌ **BAD: Deep nesting**
```markdown
# Skill Name
## Section
### Subsection
#### Deep nesting    ← NEVER DO THIS
##### Even deeper   ← ABSOLUTELY NOT
```

✅ **GOOD: Flat hierarchy**
```markdown
# Skill Name

## Section One

### Subsection A

### Subsection B

## Section Two

### Subsection C
```

### Skill Structure Template

```markdown
---
name: skill-name
description: [What the skill does] + [When to use it with trigger phrases]
---

# Skill Name

Brief overview of what this skill enables.

## Primary Workflow

### Step 1: Preparation
Instructions here...

### Step 2: Execution
Instructions here...

## Alternative Approaches

### Option A: Quick method
When speed matters...

### Option B: Thorough method
When accuracy matters...

## Reference Materials

- See `references/advanced.md` for complex scenarios
- See `scripts/helper.py` for automation
```

### Agent Structure Template

```markdown
---
description: What this agent does
mode: primary|subagent|all
temperature: 0.2
steps: 100
permission:
  edit: allow
  bash:
    "*": allow
    "rm *": ask
---

# Agent Name

You are [Agent Name], a specialized assistant for [purpose].

## Role

- Responsibility 1
- Responsibility 2

## Workflow

1. Step one
2. Step two
3. Step three

## Context Strategy

- When to read files
- What to prioritize

## Subagent Delegation

Available subagents:
- **@subagent-name** — When to use
```

### Command Structure Template

```markdown
---
description: What this command does
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

First, gather context:
!`git status`

Then, analyze and act.

Run the appropriate command based on analysis.
```

---

## 5. Frontmatter Standards

### Required Fields

| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `name` | string | 1-64 chars, lowercase kebab-case | Skill identifier, must match directory |
| `description` | string | 1-1024 chars, **single line** | Primary trigger mechanism |

### Optional Fields

| Field | Type | Usage |
|-------|------|-------|
| `license` | string | MIT, Apache-2.0, etc. |
| `compatibility` | string | `opencode` or tool-specific |
| `metadata` | map | Key-value pairs for filtering |

### Name Validation Rules

- Must be 1-64 characters
- Lowercase alphanumeric with single hyphens only: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Cannot start or end with `-`
- No consecutive `--`
- **Must match containing directory name exactly**

### Description Writing Formula

```
[What the skill does] + [When to use it, with specific trigger phrases]
```

❌ **BAD: Vague description**
```yaml
description: A skill for git operations
```

✅ **GOOD: Specific with triggers**
```yaml
description: Create consistent releases and changelogs. Use when preparing a tagged release, drafting release notes from merged PRs, or generating version bump recommendations.
```

### Common Mistakes

❌ **BAD: Multiline description**
```yaml
description: |
  This skill helps with git operations.
  Use it when you need to manage releases.
```

❌ **BAD: XML in description**
```yaml
description: Handle <release> tags and changelogs
```

❌ **BAD: Missing description**
```yaml
---
name: my-skill
---
# Skill content...
```

✅ **GOOD: Single line, specific, no XML**
```yaml
---
name: git-release
description: Create consistent releases and changelogs. Use when preparing a tagged release, drafting release notes from merged PRs, or generating version bump recommendations.
---
```

---

## 6. XML Tags Guide

### When to Use XML

Use XML tags when:
- Structuring data for machine parsing
- Defining available options (skills, agents)
- Creating structured output templates
- Enhancing clarity in complex instructions

### Skill Tool Format

Skills appear to agents in this XML structure:

```xml
<available_skills>
<skill>
  <name>skill-name</name>
  <description>Skill description here</description>
</skill>
<skill>
  <name>another-skill</name>
  <description>Another description</description>
</skill>
</available_skills>
```

### Available XML Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| `<available_skills>` | Skill listing | See above |
| `<workflow>` | Process definition | `<workflow><step>1</step></workflow>` |
| `<example>` | Input/output pairs | `<example><input/><output/></example>` |
| `<context>` | Context blocks | `<context><file/></context>` |

### Best Practices

✅ **DO:**
- Use consistent indentation
- Close all tags properly
- Keep structure flat when possible
- Use descriptive tag names

❌ **DON'T:**
- Nest more than 3 levels deep
- Use XML in YAML frontmatter
- Mix XML with Markdown tables unnecessarily
- Create overly complex schemas

---

## 7. Content Patterns

### Weak vs Strong Examples

#### Example 1: Skill Description

❌ **BAD: Too vague**
```yaml
description: A tool for working with data
```

❌ **BAD: Too narrow**
```yaml
description: Use this when the user says "process my CSV file named data.csv with pandas"
```

✅ **GOOD: Balanced and trigger-rich**
```yaml
description: Clean, transform, and analyze tabular data. Use when working with CSV/Excel files, data pipelines, data validation, or preparing datasets for analysis.
```

#### Example 2: Instruction Voice

❌ **BAD: Passive voice**
```markdown
The tests should be run before committing.
```

❌ **BAD: Second person**
```markdown
You should run the tests before you commit your changes.
```

✅ **GOOD: Imperative voice**
```markdown
Run tests before committing.
```

#### Example 3: Workflow Structure

❌ **BAD: Unstructured narrative**
```markdown
First you need to check if there are any staged changes. If there aren't, you might want to check unstaged changes. Once you find changes, you should review them and then write a commit message.
```

✅ **GOOD: Clear steps**
```markdown
## Check Changes

1. Run `git diff --cached --stat` to check staged changes
2. If none, run `git status --short` for unstaged changes
3. Review changes with `git diff --cached`

## Write Commit

Follow Conventional Commits format: `type(scope): subject`
```

#### Example 4: Reference Usage

❌ **BAD: Inline bulky content**
```markdown
# API Integration

Here is the full OpenAPI specification...

[500 lines of JSON spec]
```

✅ **GOOD: Reference external file**
```markdown
# API Integration

See `references/openapi-spec.md` for complete endpoint documentation.
Focus on these key endpoints:

- POST /api/v1/users - Create user
- GET /api/v1/users/{id} - Retrieve user
```

#### Example 5: Error Handling

❌ **BAD: Vague error guidance**
```markdown
Handle errors appropriately.
```

✅ **GOOD: Specific error patterns**
```markdown
## Error Handling

Distinguish retryable vs fatal errors:

| Error Type | Examples | Action |
|------------|----------|--------|
| Retryable | Network timeout, 503 | Retry with exponential backoff |
| Fatal | Schema violation, 400 | Log to dead-letter queue, continue |

Always include in error logs:
- timestamp
- record_id
- stage
- error_type
```

---

## 8. Skill Design

### Description Writing Formula

The description field is your **primary trigger mechanism**. Write it so an agent can recognize intent from the `available_skills` list alone.

```
[What the skill does] + [When to use it, with specific trigger phrases]
```

**Key principles:**
1. Lead with **action verbs** (Create, Analyze, Validate, Transform)
2. Include **trigger phrases** users actually say
3. Mention **file types** or **domains** when relevant
4. Keep it **under 100 words** for scannability

### Progressive Disclosure Strategy

Structure your skill to load content only when needed:

```
skill-name/
├── SKILL.md (100 lines max)
│   ├── YAML frontmatter
│   ├── Brief overview
│   ├── Core workflow (H2 sections)
│   ├── Pointers to references/
│   └── Pointers to scripts/
├── references/
│   ├── advanced-scenarios.md    # Loaded only for complex cases
│   ├── api-reference.md         # Loaded when implementing
│   └── troubleshooting.md       # Loaded when debugging
└── scripts/
    ├── validate.py              # Executed for validation
    └── generate-report.py       # Executed for reporting
```

### Testing and Validation

#### Create Test Cases

Save to `evals/evals.json`:

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "Create a release for version 2.1.0 with these PRs...",
      "expected_output": "Release notes with conventional commit grouping",
      "files": ["CHANGELOG.md"]
    }
  ]
}
```

#### Test Prompt Quality

❌ **BAD: Abstract test**
```
"Use the git-release skill"
```

✅ **GOOD: Realistic test**
```
"ok so we just merged the auth refactor PR (#234) and the performance fix (#235), can you help me draft a release for v2.1.0? my manager wants it out today and I need to write the changelog"
```

---

## 9. Command Design

### Template Placeholders

| Placeholder | Meaning | Example |
|-------------|---------|---------|
| `$ARGUMENTS` | All arguments as single string | `$ARGUMENTS` → `"file1 file2 --verbose"` |
| `$1`, `$2`, etc. | Individual positional arguments | `$1` → `"file1"` |
| `!command` | Shell command output injection | `!git status` |
| `@filename` | File content inclusion | `@README.md` |

### Command Example

```markdown
---
description: Run tests with coverage
agent: build
model: anthropic/claude-3-5-sonnet-20241022
---

First check test configuration:
!`cat pyproject.toml | grep -A 5 "\\[tool.pytest"`

Run the test suite:
!`python -m pytest --cov=src --cov-report=term-missing`

Analyze failures and suggest fixes for any failing tests.
```

### Argument Handling Patterns

**For simple commands:**
```markdown
---
description: Commit changes with conventional commits
---

Review staged changes:
!`git diff --cached`

Write a commit message following Conventional Commits format.
```

**For commands with arguments:**
```markdown
---
description: Search codebase for patterns
---

Search for pattern: $1

Run:
!`grep -r "$1" --include="*.py" src/`

Present results with file paths and line numbers.
```

---

## 10. Agents Configuration

### AGENTS.md Structure

```markdown
# Project Name

Brief description of the project.

## Navigation

- Architecture overview: `.agents/context/architecture.md`
- Project intelligence: `.agents/context/project-intelligence.md`
- Active plans: `.agents/context/plans/active/`
- Decision records: `.agents/context/decisions/`
- Accumulated wisdom: `.agents/context/wisdom/`

## Context Strategy

- Keep this file lean and pointer-based
- Put stable project facts in `project-intelligence.md`
- Put repeatable procedures in skills, not here

## Tooling

- Package manager: pdm
- Type checker: mypy --strict
- Linter: ruff check && ruff format
- Tests: pytest -x --tb=short

## Gotchas

<!-- Add surprises or inconsistencies here -->
```

### Precedence Rules (Highest to Lowest)

1. Remote config (`.well-known/opencode`)
2. Project `opencode.json`
3. Custom config (`OPENCODE_CONFIG` env var)
4. Global `~/.config/opencode/opencode.json`
5. `.opencode/` directories
6. Inline environment overrides

### Agent Frontmatter Options

| Option | Type | Description |
|--------|------|-------------|
| `description` | string | **Required** - What the agent does |
| `mode` | string | `primary`, `subagent`, or `all` |
| `model` | string | Model override |
| `prompt` | string | System prompt or file reference |
| `temperature` | number | 0.0-1.0 |
| `top_p` | number | 0.0-1.0 |
| `steps` | number | Max agentic iterations |
| `tools` | object | Tool enable/disable map |
| `permission` | object | Tool permissions (ask/allow/deny) |
| `color` | string | UI color |
| `hidden` | boolean | Hide from @ autocomplete |
| `disable` | boolean | Disable the agent |

### Best Practices

✅ **DO:**
- Keep AGENTS.md under 100 lines
- Use pointer-based navigation
- Define tooling standards once
- Add Gotchas section for persistent issues

❌ **DON'T:**
- Put long procedures in AGENTS.md (use skills)
- Repeat information already in skills
- Include transient task history
- Use AGENTS.md as a task tracker

---

## 11. References

### Official Documentation

- **Skills:** https://opencode.ai/docs/skills/
- **Agents:** https://opencode.ai/docs/agents/
- **Commands:** https://opencode.ai/docs/commands/
- **Config:** https://opencode.ai/docs/config/

### Key Research Sources

1. **OpenCode Official Docs** - Skill structure and validation rules
2. **Anthropic Agent Skills Spec** - Open standard for skill format
3. **Community Best Practices** - Description optimization patterns
4. **OpenCode GitHub Repository** - Architecture and implementation details

### Tools Comparison Matrix

| Tool | Skill System | Config Format | Cost Model |
|------|-------------|---------------|------------|
| OpenCode | Native `skill` tool | AGENTS.md + opencode.json | BYOK |
| Claude Code | Native skills | CLAUDE.md | Subscription |
| Cursor | `.cursor/rules` | Settings JSON | Subscription |
| Aider | Not native | None | BYOK |

---

## 12. Quick Reference Card

### Skill Creation Checklist

- [ ] Directory name matches `name` field exactly (kebab-case)
- [ ] SKILL.md in all caps
- [ ] YAML frontmatter starts and ends with `---`
- [ ] `name` field: 1-64 chars, lowercase alphanumeric with hyphens
- [ ] `description` field: 1-1024 chars, single line, no XML
- [ ] Description includes trigger phrases
- [ ] Main body under 100 lines
- [ ] Uses H1→H2→H3 only (no H4+)
- [ ] Bulky content in `references/`
- [ ] Scripts in `scripts/`
- [ ] Imperative voice throughout
- [ ] Tested with realistic prompts

### Command Creation Checklist

- [ ] File in `commands/` directory
- [ ] YAML frontmatter with description
- [ ] Uses `$ARGUMENTS` or `$1`, `$2` for parameters
- [ ] Uses `!command` for shell injection
- [ ] Clear, actionable instructions

### Agent Creation Checklist

- [ ] File in `agents/` directory
- [ ] YAML frontmatter with description (required)
- [ ] Mode specified (`primary`/`subagent`/`all`)
- [ ] Permissions configured appropriately
- [ ] Subagent delegation defined

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Skill not appearing | `SKILL.md` not all caps | Rename to `SKILL.md` |
| Description not parsed | Multiline description | Convert to single line |
| Name validation fails | Invalid characters | Use lowercase kebab-case |
| Directory mismatch | Name doesn't match folder | Rename directory or name field |
| Hidden from agent | `deny` permission | Change to `allow` or `ask` |

### Length Constraints

| Element | Limit |
|---------|-------|
| Skill name | 1-64 characters |
| Description | 1-1024 characters |
| SKILL.md lines | Under 100 (best practice) |
| Bundled files | Under 100 lines each (best practice) |
| Maximum prompt | ~200,000 tokens |

### File Locations (Priority Order)

```
1. .opencode/skills/<name>/SKILL.md
2. ~/.config/opencode/skills/<name>/SKILL.md
3. .claude/skills/<name>/SKILL.md
4. .agents/skills/<name>/SKILL.md
```

---

*Document version: 2026-03-15*
*Based on OpenCode documentation and community best practices*
