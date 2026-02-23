# OpenCode Agent Setup - Implementation Plan

## Overview

Implement a lean, global agent architecture for OpenCode following the 3-step workflow: **Research → Plan → Implement**. This setup prioritizes development speed, token efficiency, and multi-model flexibility.

## Target State

10-12 global configuration files in `~/.config/opencode/`:
- 3 Primary Agents (research, plan, implement)
- 5 Subagents (explore-codebase, analyze-code, find-patterns, verify-implementation, research-web)
- 3 Skills (python-project, prefect-flows, docker-infra)
- Updated global `opencode.jsonc`

## File Structure

```
~/.config/opencode/
├── agents/
│   ├── research.md              # Primary: Read-only exploration, spawns subagents
│   ├── plan.md                  # Primary: Interactive planning
│   ├── implement.md             # Primary: Full-access implementation
│   ├── explore-codebase.md      # Subagent: Fast file/code search
│   ├── analyze-code.md          # Subagent: Deep code analysis
│   ├── find-patterns.md         # Subagent: Find existing patterns
│   ├── verify-implementation.md # Subagent: Verify changes
│   └── research-web.md          # Subagent: External docs research
├── skills/
│   ├── python-project/SKILL.md  # Python conventions (ruff, mypy, pdm)
│   ├── prefect-flows/SKILL.md   # Prefect patterns and deployment
│   └── docker-infra/SKILL.md    # Docker compose patterns
└── opencode.jsonc               # Global config with model assignments
```

## Phase 1: Create Primary Agents

### 1.1 research.md
**Purpose**: Read-only codebase exploration with subagent spawning

**Key Features**:
- Mode: primary
- Tools: read-only (no write/edit by default)
- Can spawn up to 3 subagents via Task tool
- Subagents: explore-codebase, analyze-code, find-patterns

**Prompt Structure**:
- Concise research-focused instructions
- Subagent spawning rules (max 3, parallel execution)
- Synthesis guidelines for combining subagent findings

### 1.2 plan.md
**Purpose**: Interactive implementation planning

**Key Features**:
- Mode: primary
- Tools: read-only (no write/edit by default)
- Creates detailed implementation plans
- Asks clarifying questions before planning

**Prompt Structure**:
- Planning workflow steps
- Interactive questioning approach
- Plan format specification (phases, success criteria)

### 1.3 implement.md
**Purpose**: Full-access implementation with verification

**Key Features**:
- Mode: primary
- Tools: full access (write, edit, bash)
- Automatically runs lint/test commands after changes
- References AGENTS.md for project-specific commands

**Prompt Structure**:
- Implementation workflow
- Verification steps (ruff, mypy, pytest, docker build)
- Error handling and retry logic

## Phase 2: Create Subagents

### 2.1 explore-codebase.md
**Purpose**: Fast file and code discovery

**Key Features**:
- Mode: subagent
- Tools: glob, grep, read (read-only)
- Quick file location and content search
- Returns file paths and line numbers

### 2.2 analyze-code.md
**Purpose**: Deep code analysis

**Key Features**:
- Mode: subagent
- Tools: read (read-only)
- Analyzes specific files or components
- Explains how code works without critiquing

### 2.3 find-patterns.md
**Purpose**: Find existing patterns and examples

**Key Features**:
- Mode: subagent
- Tools: glob, grep, read (read-only)
- Searches for similar implementations
- Returns pattern examples with file references

### 2.4 verify-implementation.md
**Purpose**: Verify changes match plan

**Key Features**:
- Mode: subagent
- Tools: read, bash (read-only verification)
- Compares implementation against plan
- Checks success criteria

### 2.5 research-web.md
**Purpose**: External documentation research

**Key Features**:
- Mode: subagent
- Tools: webfetch, websearch (read-only)
- Fetches current docs for libraries/frameworks
- Returns relevant links and summaries

## Phase 3: Create Skills

### 3.1 python-project/SKILL.md
**Content**:
- PDM workflow (pdm install, pdm add, pdm run)
- Ruff linting and formatting
- MyPy type checking
- pytest testing
- src/ layout conventions

### 3.2 prefect-flows/SKILL.md
**Content**:
- Prefect flow definition patterns
- Deployment configuration
- Worker pool setup
- Flow scheduling

### 3.3 docker-infra/SKILL.md
**Content**:
- Docker compose patterns
- Multi-service orchestration
- Environment variable handling
- Build and deployment verification

## Phase 4: Update Global Config

### 4.1 opencode.jsonc Updates

**Agent Definitions**:
- Define all 8 agents with mode, description, tools
- Set model assignments (from global config)
- Configure permissions

**Key Configurations**:
- research: can spawn subagents (task permission)
- plan: read-only for safety
- implement: full access with bash permissions
- All subagents: hidden from UI (hidden: true)

**Skill Permissions**:
- Allow all skills for all agents
- Or configure per-agent as needed

## Phase 5: Testing & Validation

### 5.1 Test Each Agent
- Verify agent loads correctly
- Test subagent spawning (research agent)
- Verify skill loading

### 5.2 Test Workflow
1. Switch to research agent, explore codebase
2. Switch to plan agent, create implementation plan
3. Switch to implement agent, execute plan
4. Verify automatic lint/test execution

## Success Criteria

### Automated Verification:
- [ ] All 8 agent files load without errors
- [ ] All 3 skill files load without errors
- [ ] opencode.jsonc syntax is valid
- [ ] Agents appear in Tab switcher (primary only)
- [ ] Subagents can be invoked via @mention

### Manual Verification:
- [ ] Research agent can spawn subagents
- [ ] Plan agent asks clarifying questions
- [ ] Implement agent runs ruff/mypy after edits
- [ ] Skills provide relevant context when loaded
- [ ] Workflow feels smooth and efficient

## What We're NOT Doing

- No project-specific agents (all global)
- No complex permission restrictions (keep it simple)
- No automatic subagent spawning without user direction
- No extensive documentation in prompts (keep concise)
- No testing framework for agents themselves

## Notes

- All files go to `~/.config/opencode/` (global)
- Models configured in global opencode.jsonc only
- Prompts kept concise to minimize token usage
- Research agent limited to 3 subagents max
- Implement agent follows AGENTS.md conventions from projects
