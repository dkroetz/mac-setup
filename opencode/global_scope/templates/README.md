# Context Strategy Templates

Templates for implementing Phase 3: Context Strategy with Progressive Disclosure.

## Quick Start

For a new project:

```bash
# Copy AGENTS.md template to your project root
cp ~/.config/opencode/templates/AGENTS.md /path/to/your/project/AGENTS.md

# Copy context structure to .opencode/context
mkdir -p /path/to/your/project/.opencode
cp -r ~/.config/opencode/templates/project-opencode/context /path/to/your/project/.opencode/

# Copy .opencode config
cp ~/.config/opencode/templates/project-opencode/opencode.json /path/to/your/project/.opencode/

# Edit AGENTS.md to customize for your project
```

## What Each File Does

### AGENTS.md (Project Root)

**Purpose**: Table of contents for the agent (~80-100 lines max)

**What to include**:
- 2-3 sentence project description
- Navigation pointers to deeper docs
- Key entry points (config files, main entrypoints)
- Tooling commands
- Gotchas section (only persistent agent confusion)

**What NOT to include**:
- File structure (agent can glob)
- Dependencies (agent reads pyproject.toml)
- Generic patterns (agent already knows them)
- Detailed architecture (that goes in docs/architecture.md)

### .opencode/context/architecture.md

**Purpose**: The "why" behind architectural decisions

**What to include**:
- High-level domain map
- Layer structure and responsibilities
- Data flow diagrams
- External integrations
- Key decisions with rationale
- Constraints

**What NOT to include**:
- Detailed implementation (that's in the code)
- File-by-file descriptions (agent can read code)

### .opencode/context/project-intelligence.md

**Purpose**: Human-harvested implementation patterns (6-question intake)

**What to include**:
- Real tech stack and core workflows
- Canonical API/service and component/module slices
- Naming conventions used by the team
- Quality and security requirements that must be followed
- Codebase references to representative files

**How to create/update**:
- Run `/add-context` for first-time capture
- Run `/add-context --update` when patterns evolve
- Run `/context harvest` to import external `.tmp/*.md` notes

### .opencode/context/decisions/

**Purpose**: Architecture Decision Records (ADRs)

Store numbered ADRs: `001-database-choice.md`, `002-api-design.md`, etc.

Use the template: `.opencode/context/decisions/000-template.md`

### .opencode/context/plans/

**Structure**:
- `active/` - Current work in progress
- `completed/` - Archived plans (for historical context)

Store implementation plans here for complex features.

### .opencode/context/wisdom/

**Purpose**: Accumulated learnings across tasks

Three files:
- `patterns.md` - Useful patterns discovered
- `mistakes.md` - Common mistakes and fixes
- `decisions.md` - Key decisions and rationale

**Important**: Only add genuinely new insights. Don't duplicate what's obvious from code.

### .opencode/opencode.json

**Purpose**: Project-specific OpenCode configuration

The `instructions` array loads files into agent context:

```json
{
  "instructions": [
    ".opencode/context/architecture.md"
  ]
}
```

**Guidelines**:
- Keep this list minimal
- Only include files that are ALWAYS relevant
- For task-specific context, let the agent navigate via AGENTS.md pointers
- For conditional context (e.g., security rules for auth work), use skills instead

## Progressive Disclosure Flow

1. **Agent starts** → Reads AGENTS.md (table of contents)
2. **Agent needs context** → Follows pointer to .opencode/context/architecture.md
3. **Agent needs specifics** → Reads relevant code files
4. **Agent needs project patterns** → Reads .opencode/context/project-intelligence.md
5. **Agent encounters issues** → Checks .opencode/context/wisdom/ for learnings
6. **Agent confused** → Adds entry to AGENTS.md Gotchas (you review and merge ~20%)

## Maintenance

### Weekly (30 min)

Run `/audit` command (Phase 9) to check:
- Is AGENTS.md still accurate?
- Does .opencode/context/architecture.md reflect current state?
- Are wisdom entries still applicable?

### Feedback Hierarchy

When agent makes mistakes, fix in this order:

1. **Fix the codebase** - Better naming, clearer types, missing tests
2. **Fix the tooling** - Better linter rules, stricter types, improved CI
3. **Add a skill** - If mistake is procedural (wrong workflow)
4. **Update AGENTS.md gotchas** - Only if can't fix in code or tooling
5. **Update agent prompt** - Almost never needed

## Research Backing

This approach is based on:

- **OpenAI Harness Engineering**: AGENTS.md as table of contents, progressive disclosure
- **Evaluating AGENTS.md paper**: Developer-written context only +4%, LLM-generated -3%
- **SkillsBench**: Moderate length docs outperform comprehensive ones
- **Theo's Context Management**: Only add persistent mistakes, models find info themselves

## Example Usage

After setup, the agent workflow looks like:

```
User: Add user authentication to the API

Engineer: 
1. Reads AGENTS.md → sees .opencode/context/architecture.md pointer
2. Reads .opencode/context/architecture.md → understands API layer, security requirements
3. Uses @explore to find existing auth patterns
4. Creates plan in .opencode/context/plans/active/2026-03-04-auth-feature-a1b2c3.md
5. Implements step by step
6. Updates .opencode/context/wisdom/ with any new patterns discovered
```

## Success Criteria

- [ ] AGENTS.md is under 100 lines
- [ ] AGENTS.md contains zero discoverable information
- [ ] .opencode/context/architecture.md describes the "why" not the "what"
- [ ] .opencode/opencode.json instructions array is minimal
- [ ] Agent navigates to .opencode/context/ from AGENTS.md pointers
- [ ] Running same task with/without AGENTS.md shows similar or better performance with lean version
