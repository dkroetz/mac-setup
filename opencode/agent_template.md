---
# ═══════════════════════════════════════════════════════════════════════════
# AGENT TEMPLATE - Copy this file and customize for your agent
# File name becomes agent name: `my-agent.md` → invoke as `@my-agent`
# ═══════════════════════════════════════════════════════════════════════════

# ─── REQUIRED ─────────────────────────────────────────────────────────────
description: "<1-2 sentences describing what this agent does and when to use it>"

# ─── AGENT TYPE ───────────────────────────────────────────────────────────
# primary  = Tab-switchable, handles main conversation
# subagent = Invoked via @mention or Task tool by other agents
# all      = Can be used as both (default)
mode: primary | subagent | all

# ─── MODEL CONFIGURATION ──────────────────────────────────────────────────
# Format: <provider>/<model-id>
# Examples: anthropic/claude-sonnet-4-20250514, openai/gpt-4o, opencode/glm-5-free
model: <provider>/<model-id>

# Temperature: 0.0 = deterministic, 1.0 = creative
# Recommended: 0.1-0.2 for code/analysis, 0.5-0.7 for creative tasks
temperature: 0.2

# Top P: Alternative to temperature for controlling diversity
# Range: 0.0-1.0, lower = more focused
# top_p: 0.9

# ─── BEHAVIOR LIMITS ──────────────────────────────────────────────────────
# Max agentic iterations before forced text response (controls cost)
# steps: 10

# Disable agent entirely
# disable: false

# ─── SYSTEM PROMPT ────────────────────────────────────────────────────────
# Can be inline below, or reference external file:
# prompt: "{file:./prompts/my-agent.txt}"
prompt: |
  <Your system prompt here. Be specific about:>
  - What the agent should do
  - What it should NOT do
  - How it should format responses
  - When to delegate to other agents

# ─── TOOL ACCESS ──────────────────────────────────────────────────────────
# true = enabled, false = disabled
# Omitted tools inherit from global config
tools:
  write: true      # Create new files
  edit: true       # Modify existing files
  bash: true       # Run shell commands
  glob: true       # Find files by pattern
  grep: true       # Search file contents
  read: true       # Read files/directories
  webfetch: true   # Fetch URLs
  websearch: true  # Web search
  codesearch: true # Code/API search
  task: true       # Invoke subagents
  skill: true      # Load skills
  # Wildcards for MCP tools:
  # "mymcp_*": false

# ─── PERMISSIONS ──────────────────────────────────────────────────────────
# ask   = Prompt user for approval
# allow = Execute without asking
# deny  = Block entirely
permission:
  edit: ask
  bash:
    "*": ask                    # Default for all commands
    "git status*": allow        # Specific allowlist
    "git diff*": allow
    "git log*": allow
    "npm run*": allow
  webfetch: ask
  task:
    "*": deny                   # Restrict subagent invocation
    "allowed-subagent": allow   # Whitelist specific subagents
    "team-*": allow             # Glob patterns supported

# ─── VISUAL ───────────────────────────────────────────────────────────────
# Hex color or theme color: primary, secondary, accent, success, warning, error, info
color: "#4A90D9"

# Hide from @ autocomplete (subagents only)
# hidden: false

# ─── PROVIDER-SPECIFIC OPTIONS ────────────────────────────────────────────
# Pass-through to provider, varies by model. Examples:
# reasoningEffort: low | medium | high    # OpenAI reasoning models
# textVerbosity: low | medium | high
---

<!-- System prompt content continues below frontmatter -->

## Role
<Define the agent's role and expertise>

## Responsibilities
- <Primary responsibility 1>
- <Primary responsibility 2>

## Constraints
- <What this agent should NOT do>
- <Limitations to respect>

## Output Format
<How responses should be structured>

## Delegation
<When and how to invoke other agents>
- `@subagent-name` for <specific task>
