# Skills Directory

Reusable, on-demand instructions that agents can load via the `skill` tool.

## What Are Skills?

Skills are loaded **on-demand** by agents, unlike agents which are always loaded. Use skills for:
- Workflow-specific instructions (git, PRs, releases)
- Domain knowledge that multiple agents might need
- Large instruction sets that shouldn't always be in context

## Structure

```
skills/
├── _template/
│   └── SKILL.md              # Copy this to create new skills
│
└── examples/
    ├── git-workflow/
    │   └── SKILL.md
    └── pr-review/
        └── SKILL.md
```

## Discovery Locations

OpenCode searches these locations for skills:

| Location | Scope |
|----------|-------|
| `.opencode/skills/*/SKILL.md` | Project-local |
| `~/.config/opencode/skills/*/SKILL.md` | Global |
| `.claude/skills/*/SKILL.md` | Claude-compatible |
| `~/.claude/skills/*/SKILL.md` | Claude-compatible global |

## Creating New Skills

1. Copy `_template/` directory
2. Rename directory (name must match `name` in frontmatter)
3. Edit `SKILL.md` frontmatter and content
4. Skill is auto-discovered

## Naming Rules

- 1-64 characters
- Lowercase alphanumeric with single hyphens
- No leading/trailing hyphens
- No consecutive hyphens
- Must match directory name

Regex: `^[a-z0-9]+(-[a-z0-9]+)*$`

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (1-64 chars) |
| `description` | Yes | Brief description (1-1024 chars) |
| `license` | No | License identifier |
| `compatibility` | No | Compatible platforms |
| `metadata` | No | Custom key-value pairs |

## Permissions

Control skill access in `opencode.json`:

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny",
      "experimental-*": "ask"
    }
  }
}
```

## Skills vs Agents

| Aspect | Skills | Agents |
|--------|--------|--------|
| Loading | On-demand | Always loaded |
| Tool | `skill` tool | Task tool / @mention |
| Use case | Reusable instructions | Specialized assistants |
| Context | Adds to current agent | Separate session |
