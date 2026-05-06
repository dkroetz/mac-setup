# Multi-Agent Coding Patterns Research (May 2026)

## Executive Summary

The industry has converged on **orchestrator-workers with role-based tool restrictions** as the proven pattern for multi-agent coding setups. Claude Code, OpenCode, and Cursor all support this natively. The scout/engineer/architect 3-agent setup is a validated, production-proven pattern used by companies like Hipcamp and frameworks like VBW and Agentic.

**Key principle:** Only ONE agent writes code. All others are read-only. This prevents context pollution and conflicting edits.

**Critical finding:** Model choice explains 28.2% of variance in agent performance; agent architecture only 0.6%. Pick the best model first, optimize architecture second. ([arxiv 2602.22953](https://www.arxiv.org/pdf/2602.22953))

---

## 1. The Converged Pattern

| Role | Model | Permission | Tools |
|------|-------|-----------|-------|
| **Scout/Explorer** | Haiku/Sonnet (cheap, fast) | Read-only | Read, Grep, Glob, WebSearch, MCP |
| **Engineer/Developer** | Sonnet (fast execution) | Full write | Read, Write, Edit, Bash, LSP |
| **Architect/Lead** | Opus (best reasoning) | Read + delegate | Read, Grep, Agent(scout), Agent(engineer) |

**Sources:**
- Hipcamp's "Scout" system: https://www.hipcamp.com/journal/engineering/scout-our-in-house-ai-agent
- VBW (7 agents): https://github.com/swt-labs/vibe-better-with-claude-code-vbw
- Rexeus/Agentic (11 agents): https://github.com/rexeus/agentic
- Anthropic's patterns: https://www.anthropic.com/research/building-effective-agents

---

## 2. Real Configuration Examples

### Claude Code (`.claude/agents/`)

**Scout (read-only researcher):**
```markdown
---
name: scout
description: "Codebase explorer. Use PROACTIVELY before any implementation."
model: sonnet
tools: [Read, Grep, Glob, Bash]
disallowedTools: [Write, Edit]
permissionMode: plan
maxTurns: 15
effort: medium
background: true
---

You are a scout. Explore the codebase, map file structure, find relevant code,
identify patterns and dependencies. Never modify files. Return structured reports.
```

**Engineer (implementation):**
```markdown
---
name: engineer
description: "Implementation specialist. Writes, edits, and tests code."
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
permissionMode: acceptEdits
maxTurns: 50
---

You are an engineer. Implement changes based on plans provided.
Write tests. Run them. Iterate until passing. Follow existing patterns.
```

**Architect (orchestrator + reviewer):**
```markdown
---
name: architect
description: "System designer and orchestrator."
model: opus
tools: [Read, Grep, Glob, Bash, Agent(scout), Agent(engineer)]
permissionMode: default
maxTurns: 50
---

You are the architect. Analyze requirements, design solutions, delegate
exploration to @scout and implementation to @engineer. Review all output.
```

### OpenCode (`.opencode/agents/`)

**Scout:**
```markdown
---
description: Explores codebase without modifications
mode: subagent
model: anthropic/claude-sonnet-4-20250514
steps: 15
permission:
  edit: deny
  write: deny
  bash:
    "git *": allow
    "find *": allow
    "*": deny
---
```

**Architect (primary agent):**
```jsonc
// opencode.json
{
  "default_agent": "architect",
  "agent": {
    "architect": {
      "mode": "primary",
      "model": "anthropic/claude-opus-4-7",
      "steps": 50,
      "permission": {
        "edit": "ask",
        "bash": { "git *": "allow", "*": "ask" },
        "task": { "scout": "allow", "engineer": "allow", "*": "deny" }
      }
    }
  }
}
```

---

## 3. Permission Enforcement (Critical)

| Layer | Mechanism | Survives Context Compaction? |
|-------|-----------|---------------------------|
| **Soft** | System prompt instructions | ❌ No |
| **Hard** | `disallowedTools` in YAML frontmatter | ✅ Yes (runtime-enforced) |

**Always use `disallowedTools` for security boundaries**, not just prompt instructions. The runtime blocks tool calls at the platform level regardless of what the model tries.

### Three-Layer Enforcement Model
1. **Hooks** (deterministic) — linters, type-checkers, pre-commit hooks
2. **Config rules** (advisory) — permission patterns in agent config
3. **Prompt instructions** (ephemeral) — system prompt guidance

Source: [dtx.systems](https://dtx.systems/blog/working-with-ai-coding-agents)

---

## 4. Commands & Workflows

### PR Review Command (Trail of Bits pattern)

```markdown
---
@description Review PR with parallel agents
@arguments $PR_NUMBER: GitHub PR number
---
Run in parallel:
- pr-review-toolkit:code-reviewer (quality)
- pr-review-toolkit:silent-failure-hunter (errors)
- pr-review-toolkit:pr-test-analyzer (coverage)
Merge findings, rank P1-P4, fix P1-P3, commit and push.
```

**Source:** https://github.com/trailofbits/claude-code-config

### Goal-Oriented Commands

- **Codex `/goal`** (v0.128.0): Sets persistent goal; loops autonomously until met or budget exhausted. Enable: `features.goals = true` in config.toml. Supports `/goal pause`, `/goal clear`, status check.
- **VBW `/vbw:vibe`**: Full lifecycle — Scout explores → Architect plans → Dev implements → QA validates
- **Hipcamp `/scout-plan`**: 2-5 discovery subagents → planning subagent on Opus → validators

### Command File Structure
```
.opencode/commands/
├── review.md           → /review
├── plan.md             → /plan
├── scout.md            → /scout
└── dev/
    └── code-review.md  → /dev:code-review
```

---

## 5. Agent Teams (Peer-to-Peer, Feb 2026)

Claude Code Agent Teams:
- Team Lead spawns up to 15 teammates, each with own 1M token context
- Communication via shared task board + `SendMessage`
- Worktree isolation prevents merge conflicts
- Sweet spot: **3-5 teammates**
- Tested with 16 agents building a C compiler (100K lines of Rust)

**Source:** https://code.claude.com/docs/en/agent-teams

---

## 6. Recommended Setup for OpenCode

### Agent Roles

| Agent | Purpose | Model | Can Write Code? | Special Tools |
|-------|---------|-------|----------------|---------------|
| **Scout** | Research, Jira, Databricks, codebase exploration | Sonnet | ❌ No | Jira MCP, Databricks MCP, WebSearch, Azure |
| **Engineer** | Implementation, tests, PRs, plans | Sonnet/Opus | ✅ Yes | Full filesystem + bash + MCP |
| **Architect** | Design decisions, deep reviews, orchestration | Opus | ❌ No (delegates) | Agent(scout), Agent(engineer) |

### Workflow
1. **Architect** receives task → delegates exploration to **Scout**
2. **Scout** researches (Jira tickets, codebase, docs) → returns findings
3. **Architect** designs solution, creates implementation plan
4. **Architect** delegates to **Engineer** with specific plan
5. **Engineer** implements, writes tests, runs them
6. **Architect** reviews output → approves or requests changes

### Key Configuration Decisions
- Use `disallowedTools` (not just prompts) for hard boundaries
- Scout gets MCP servers for Jira/Databricks but `edit: deny`
- Engineer gets NO subagent spawning (`task: { "*": "deny" }`)
- Architect is the ONLY agent that can spawn others
- Use `permissionMode: plan` for read-only agents (platform-enforced)

---

## 7. Industry Timeline (2025-2026)

| Date | Milestone |
|------|-----------|
| Apr 2025 | Google A2A protocol; OpenAI Codex CLI launch |
| Oct 2025 | Cursor 2.0 (8 parallel agents on worktrees) |
| Dec 2025 | Agent Skills open standard (cross-tool) |
| Feb 2026 | Claude Code Agent Teams + Opus 4.6 |
| Mar 2026 | A2A v1.0 (production-ready, 150+ orgs) |
| Apr 2026 | Cursor 3.0 (agent-first IDE); Claude Managed Agents API |

**Key trend:** The developer role is shifting from "code writer" to "agent orchestrator" — managing 3-15 parallel agents, reviewing outputs, steering direction.

---

---

# PART 2: Deep Research — Prompt Engineering, Examples & Anti-Patterns

---

## 8. System Prompt Best Practices for Agents

### Core Principles

| Principle | Detail | Source |
|-----------|--------|--------|
| **Spec > conversation** | Goal + Scope + Context + Acceptance criteria outperforms conversational prompts | [sureprompts.com](https://sureprompts.com/blog/the-complete-guide-to-prompting-ai-coding-agents-2026) |
| **Keep rules under 150 lines** | Models degrade uniformly past ~150-200 instructions | [dtx.systems](https://dtx.systems/blog/working-with-ai-coding-agents) |
| **State outcomes, not implementation** | Agents figure out "how" when given clear "what" | [fieldguidetoai.com](https://fieldguidetoai.com/guides/prompting-ai-agents) |
| **Constraints > instructions** | The agent knows how to code; what it doesn't know is your conventions | [ralphify.co](https://ralphify.co/docs/writing-prompts/) |
| **Keep constraints to 5-8 critical limits** | Over-constraining produces refusal behavior | Multiple sources |

### Chain-of-Thought for Tool-Calling Agents

> **Critical finding:** Brief CoT (8-32 tokens) improves tool-calling by +45%; extended CoT (256 tokens) *degrades* accuracy below no-CoT baseline.

- CoT reduces instruction-following accuracy across 15 models — reasoning diverts focus from constraints ([arxiv 2505.11423](https://arxiv.org/pdf/2505.11423))
- **FR-CoT pattern**: Commit to function name first ("Function: [name] / Key args: [...]") → 0% function hallucination ([arxiv 2604.02155](https://www.arxiv.org/pdf/2604.02155))
- **Optimal CoT length follows inverted U-curve** — more capable models prefer shorter reasoning paths ([arxiv 2502.07266](https://arxiv.org/pdf/2502.07266))

### Reasoning Effort Controls

| Tool | Mechanism | Source |
|------|-----------|--------|
| Claude Code | `/effort low\|medium\|high\|max` — `max` gives unlimited reasoning on Opus | [theplanettools.ai](https://theplanettools.ai/blog/claude-code-leak-512k-lines-everything-hidden) |
| GPT-5.1 | `none` reasoning mode for low-latency; better calibrated to prompt difficulty | [OpenAI cookbook](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide) |
| OpenCode | `reasoning_effort` parameter per agent | opencode docs |

### Agent Identity/Persona Structure

The **OpenAI recommended structure** for agent system prompts:

```
1. Role → Who you are
2. Personality → How you behave (operational, not aesthetic)
3. Goal → What you're trying to achieve
4. Success criteria → How to know you're done
5. Constraints → What you must NOT do
6. Output format → How to structure responses
7. Stop rules → When to stop
```

**Key insight:** "Anchor persona in identity, not rules" — `"You are Morgan, a senior support engineer"` is harder to override than behavioral rules alone. ([engineersofai.com](https://engineersofai.com/docs/ai-engineering/prompt-engineering/System-Prompts-and-Personas))

### Preventing Off-Track Behavior

1. **Define explicit stop conditions** — without them, agents keep "improving" unrelated files
2. **Three-layer enforcement**: Hooks (deterministic) > Config rules (advisory) > Prompt instructions (ephemeral)
3. **Loops come from 3 causes**: ambiguous acceptance criteria, missing context, or tools failing silently
4. **Use typed languages, linters, and tests as guardrails** ([cursor.com](https://cursor.com/blog/agent-best-practices))
5. **"Revert and restart > nudging"** — if agent goes wrong, revert, refine plan, run again

---

## 9. Real AGENTS.md / CLAUDE.md Examples from Public Repos

### Notable CLAUDE.md Files

| Repo | Stars | Key Pattern | URL |
|------|-------|-------------|-----|
| iamfakeguru/claude-md | 911 | Hooks + sub-agents for >5 files; re-read files after 10+ messages | [github](https://github.com/iamfakeguru/claude-md) |
| shanraisshan/claude-code-best-practice | 51K | Path-scoped rules, subagent frontmatter, orchestration workflows | [github](https://github.com/shanraisshan/claude-code-best-practice) |
| jsonresume/jsonresume.org | 231 | Concise project brief — stack, AI SDK version pinning | [github](https://github.com/jsonresume/jsonresume.org/blob/master/CLAUDE.md) |
| yzhao062/anywhere-agents | 166 | Cross-agent portable config; 4-layer precedence; bootstrap script | [github](https://github.com/yzhao062/anywhere-agents/blob/main/CLAUDE.md) |
| abhishekray07/claude-md-templates | 153 | Starter kit for Next.js/TS, Python/FastAPI | [github](https://github.com/abhishekray07/claude-md-templates) |

### AGENTS.md (Universal Standard)

- **[agentsmd/agents.md](https://github.com/agentsmd/agents.md)** — 20K+ ⭐, canonical format, supported by 20+ tools
- **[GitHub Blog: Lessons from 2,500+ repos](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)** — 6 core areas: Commands, testing, project structure, code style, git workflow, boundaries
- **[addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)** — 28K ⭐, Skills = workflows with steps + acceptance criteria

### .cursorrules Collections

- **[PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)** — 39K ⭐, massive curated collection by framework
- **[ivangrynenko/cursorrules](https://github.com/ivangrynenko/cursorrules)** — Security-focused (OWASP Top 10), `.mdc` format

### OpenCode (sst/opencode) Configuration

- **[github.com/sst/opencode](https://github.com/sst/opencode)** — 153K ⭐ (now `anomalyco/opencode`)
- **[opencode.ai/docs/agents/](https://opencode.ai/docs/agents/)** — Full agent docs
- Agent modes: `primary` (Tab to switch), `subagent` (invoked by others)
- Config in `opencode.json` or `.opencode/agents/*.md` with YAML frontmatter
- Permission system: `"bash": {"rg *": "allow", "rm -rf *": "deny"}`
- Built-in agents: Build (full access), Plan (restricted), General (parallel executor), Explore (read-only)

### Leaked/Published Production System Prompts

- **[Claude Code system prompt](https://github.com/asgeirtj/system_prompts_leaks/blob/main/Anthropic/claude-code.md)** — 6-layer priority system, 30+ tools, "megathink"/"ultrathink" modes
- **[System prompts leak repo](https://github.com/asgeirtj/system_prompts_leaks)** — 39K+ ⭐, GPT-5.4, Codex, Claude Code, Gemini CLI, Grok

### Cross-Tool Configuration Comparison

| File | Tool | Scope |
|------|------|-------|
| `CLAUDE.md` | Claude Code | Project + user-level (`~/.claude/CLAUDE.md`) |
| `.cursorrules` / `.cursor/rules/*.mdc` | Cursor | Project root / path-scoped |
| `AGENTS.md` | Codex, Copilot, Gemini CLI, OpenCode, 20+ tools | Universal |
| `.github/copilot-instructions.md` | GitHub Copilot | Repository-wide |
| `opencode.json` + `.opencode/agents/*.md` | OpenCode | Project + global |
| `CONVENTIONS.md` + `.aider.conf.yml` | Aider | Project |

---

## 10. Subagent Delegation Patterns (Deep Dive)

### Anthropic's Documented Patterns

| Pattern | Use Case | Source |
|---------|----------|--------|
| Orchestrator-Workers | Complex tasks with clear subtask decomposition | [anthropic.com/engineering/building-effective-agents](https://anthropic.com/engineering/building-effective-agents) |
| Parallelization | Independent subtasks (e.g., multi-file review) | Same |
| Routing | Classify input → route to specialist | Same |
| Evaluator-Optimizer | Generate → evaluate → refine loop | Same |

### Multi-Agent Research System (Anthropic)
- Lead agent + parallel subagents
- Detailed task descriptions prevent duplication
- Parallel tool calling cut research time 90%
- Source: [anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)

### Claude Code Subagent Specifics
- **Depth=1 limit** — subagents cannot spawn subagents
- Built-in types: Explore (Haiku, read-only), Plan, General-purpose (Sonnet, full access)
- Fork agents inherit parent context for 90% prompt cache discounts
- Source: [docs.anthropic.com/en/docs/claude-code/sub-agents](https://docs.anthropic.com/en/docs/claude-code/sub-agents)

### OpenAI Codex Subagent Patterns
- Built-in: default, worker, explorer
- `max_threads` (default 6), `max_depth` (default 1)
- Append-only for prompt caching; `/compact` for context management
- Source: [developers.openai.com/codex/subagents](https://developers.openai.com/codex/subagents)

### Key Delegation Principles
1. **Isolated context windows** — each subagent gets own context; only summary returns to parent
2. **Restrict tools by role** — reviewers get read-only; builders get full access
3. **Fork agents inherit parent context** for 90% prompt cache discounts (Claude Code)
4. **Max iterations/timeouts** — prevent runaway costs (`maxTurns`, `job_max_runtime_seconds`)
5. **Use Opus for orchestrator, Haiku for workers** — cost optimization
6. **Detailed task descriptions prevent duplication** — be specific about what each subagent should find

---

## 11. PR Review Agent Patterns (Production Data)

### Production Results

| System | Metric | Source |
|--------|--------|--------|
| Claude Code Review | 16% → 54% PRs with substantive feedback; <1% false positive | [jangwook.net](https://jangwook.net/en/blog/en/claude-code-review-multi-agent-pr/) |
| Cursor BugBot | 70% resolution rate, 2M PRs/month | [adwaitx.com](https://www.adwaitx.com/cursor-bugbot-ai-code-review-agent-2026/) |
| Jellyfish + BugBot | +110% PR throughput, -82% PR size, -20% bugs/dev | [Jellyfish](https://test-jellyfish-co.pantheonsite.io/blog/ai-code-review-doubled-pr-throughput/) |
| Cato Networks | 43% of incident-causing PRs flagged, ~7K high/critical issues/month | [Cato](https://www.catonetworks.com/blog/inside-cato-rds-self-evolving-pr-review-agent/) |
| Microsoft | 600K PRs/month, 10-20% faster completion | [gitautoreview.com](https://gitautoreview.com/blog/ai-pr-review-guide) |

### Trail of Bits Security Review
- **[AI-Native Blog Post](https://blog.trailofbits.com/2026/03/31/how-we-made-trail-of-bits-ai-native-so-far/)** — 94 plugins, 201 skills, 84 specialized agents; 15→200 bugs/week
- **[Skills Marketplace](https://github.com/trailofbits/skills)** — 35+ Claude Code plugins for security
- **[Trailmark](https://github.com/trailofbits/trailmark)** — Code graph analysis for attack surface detection
- **[Different](https://github.com/trailofbits/different)** — Agentic variant analysis (finds same bugs in different repos)
- **[MCP Security](https://www.trailofbits.com/mcp/)** — mcp-context-protector, Vulnerable MCP Project

### Review Architecture Patterns
1. **Multi-agent parallel review** (5 agents, each reviewing different aspects) — quality, security, tests, performance, architecture
2. **Two-stage: Generator + Critic** — Cato Networks' self-evolving agent
3. **Builder → Validator chain** — subagent 1 builds, subagent 2 reviews (read-only tools)
4. **Spec-Driven Development** — catches logic inversions invisible in isolation

---

## 12. Planning & Goal-Oriented Patterns

### Codex /goal Command
- Enable: `features.goals = true` in config.toml
- Persistent goal tracking with timer
- `/goal` status check, `/goal pause`, `/goal clear`
- Completion audit validates against defined outcome criteria
- Source: [developers.openai.com/codex/subagents](https://developers.openai.com/codex/subagents)

### Planning Agent Patterns

| Pattern | Description | Source |
|---------|-------------|--------|
| Claude Code Plan Agent | Read-only, creates plans before execution | Claude Code docs |
| Codex `update_plan` tool | Built-in task planning with to-do list tracking | Codex docs |
| CrewAI `planning=True` | Automatic planning phase before crew iteration | [docs.crewai.com](https://docs.crewai.com/) |
| Aider Architect Mode | Expensive model proposes, cheap model edits; SOTA results | [aider.chat](https://aider.chat/docs/usage/modes.html) |

### Aider Architect Mode (Proven Pattern)
- **o1-preview + DeepSeek = 85% on SWE-bench** — architect proposes, editor implements
- Architect sees full context, makes design decisions
- Editor only sees the specific changes to make
- This is the exact scout/engineer split validated at scale

### Self-Correction Patterns
- **SCoRe** (Google DeepMind): Multi-turn RL for self-correction; +15.6% on MATH ([ICLR 2025](https://proceedings.iclr.cc/paper_files/paper/2025/file/871ac99fdc5282d0301934d23945ebaa-Paper-Conference.pdf))
- **ReflexiCoder**: RL internalizes reflection into weights; 94.51% HumanEval, 40% fewer tokens ([arxiv](https://arxiv.org/abs/2603.05863))
- **"Revert and restart > nudging"** — if agent goes wrong, revert, refine plan, run again ([cursor.com](https://cursor.com/blog/agent-best-practices))

---

## 13. MCP & Tool Use Patterns

### MCP Specification
- **[modelcontextprotocol.io](https://modelcontextprotocol.io/specification/latest)** — Latest revision 2025-11-25
- Architecture: Host → Client → Server (1:1 sessions); JSON-RPC 2.0
- Server primitives: Resources (app-controlled), Prompts (user-controlled), Tools (model-controlled)
- SDKs: TypeScript, Python, Rust, Go, Java, Kotlin, C#, Ruby, Swift, PHP

### Tool Design Best Practices
- **Tool descriptions are the most critical component** — helps model understand *when* to use ([promptingguide.ai](https://www.promptingguide.ai/agents/function-calling))
- **CodeCall pattern**: Collapse hundreds of tools into 4 meta-tools (search, describe, execute, invoke) ([agentfront.dev](https://docs.agentfront.dev/frontmcp/plugins/codecall/overview))
- **Dynamic server selection** — agent only sees relevant tools per step
- **Return tool errors as tool execution errors** (not protocol errors) to enable self-correction

### Safety Patterns
- **Trail of Bits MCP security**: mcp-context-protector, TOFU validation, ANSI sanitization ([trailofbits.com/mcp](https://www.trailofbits.com/mcp/))
- **Sandboxing**: Cursor custom VM scheduler; Trail of Bits Dropkit (macOS Seatbelt); systemd cgroups
- **Permission patterns**: OpenCode `"bash": {"rg *": "allow", "rm -rf *": "deny"}`

---

## 14. Multi-Agent Communication Patterns

| Pattern | Description | Source |
|---------|-------------|--------|
| Orchestrator-Workers | Central coordinator decomposes + delegates | [Anthropic](https://anthropic.com/engineering/building-effective-agents) |
| Shared Task List | Peer-to-peer via task board + mailbox | [Claude Agent Teams](https://docs.anthropic.com/en/docs/claude-code/agent-teams) |
| Fan-out/Fan-in | Parallel execution with list-append reducers | [LangGraph](https://docs.langchain.com/langgraph) |
| Swarm | Dynamic agent-initiated handoffs | [AutoGen](https://microsoft-autogen-85.mintlify.app/guides/multi-agent-workflows) |
| Agent-to-Agent via MCP | `ask_smith` tool exposes agent as MCP server | [daily.dev](https://daily.dev/it/blog/we-built-an-org-wide-ai-agent-in-4-days-heres-what-broke-in-the-weeks-after) |

### Context Management Across Agents
- **Conversation compaction**: Codex `/responses/compact` with encrypted items; OpenCode automated compaction
- **Prompt caching**: Append-only preserves prefix matching (Codex); fork agents for 90% cache discounts (Claude Code)
- **Event sourcing**: OpenCode SyncEvent for session replayability
- **Memory persistence**: CLAUDE.md/AGENTS.md for project context; LangGraph Store for cross-thread memory

---

## 15. Agent Evaluation & Model Routing

### When to Use Expensive vs Cheap Models

| Scenario | Model Tier | Rationale |
|----------|-----------|-----------|
| Orchestration, architecture decisions | Opus/GPT-5 | Needs best reasoning |
| Code implementation | Sonnet/GPT-4o | Fast, good enough for execution |
| Exploration, search, simple queries | Haiku/GPT-4o-mini | Cheap, high volume |
| Security review | Opus | Needs deep reasoning about edge cases |

**Key finding:** 60-70% of tasks handled by cheap models; 30-40% escalate. RouteLLM achieves 95% of GPT-4 quality using only 14% of GPT-4 calls (75% cost reduction). ([agents.siddhantkhare.com](https://agents.siddhantkhare.com/31-model-selection/))

### Benchmarks (Current SOTA)
- **SWE-bench Verified**: ~80-88% (Claude Opus 4.6 / GPT-5)
- **SWE-bench Live**: Best only ~13% (reveals overfitting to static benchmarks)
- **SWE-PolyBench**: Agents struggle outside Python

---

## 16. Anti-Patterns & Lessons Learned

### Multi-Agent Failures (Research Data)

| Finding | Source |
|---------|--------|
| 41-86.7% failure rates across 7 frameworks | [UC Berkeley MAST study](https://runcycles.io/blog/multi-agent-coordination-failure-structural-prevention) |
| Unstructured multi-agent networks amplify errors up to 17.2× vs single-agent | DeepMind |
| Diminishing returns beyond ~4 agents | Multiple sources |
| "Context rot": Agent A's degraded output enters Agent B as ground truth | [Redis](https://redis.io/blog/why-multi-agent-llm-systems-fail/) |

### Agent Loop Types & Fixes

| Loop Type | Cause | Fix |
|-----------|-------|-----|
| Tool-call loop | Tool returns error, agent retries same call | Circuit breaker (max 3 retries) |
| Subagent recursion | Subagent spawns subagent | Depth=1 limit (hard) |
| Replan loop | Agent keeps replanning without executing | Force execution after 2 plans |
| Completion-check loop | Agent can't verify completion | Explicit acceptance criteria |

Source: [antigravitylab.net](https://antigravitylab.net/en/articles/agents/antigravity-agent-runaway-loop-prevention-patterns)

### Context Exhaustion
- Tool call loops consume 80% of tokens before useful output
- Even 200K+ windows exhaust in 15-30 agentic steps
- **Fix**: Build compression logic before you need it; ~80% of calls don't need frontier model
- Source: [web3aiblog.com](https://www.web3aiblog.com/blog/why-ai-agent-loses-context-how-to-fix-2026)

### Production Lessons

| Company | Finding | Source |
|---------|---------|--------|
| OpenAI Harness | 1M lines, 0 manually-written code, 1/10th dev time — key was investing in *environment design* | [engineering.fyi](https://www.engineering.fyi/article/harness-engineering-leveraging-codex-in-an-agent-first-world) |
| Kapwing | 108 PRs via Codex in Q1 2026, eliminated bug bash (36 eng-days/quarter saved) | [kapwing.com](https://www.kapwing.com/blog/how-we-achieved-100-adoption-of-ai-coding-agents/) |
| Honest math | ~30% throughput improvement on repeatable tasks, not 10x; review times grew 91% | [vishwas.tech](https://vishwas.tech/blog/the-honest-math-of-coding-with-ai-agents-in-production) |
| METR RCT | Experienced devs took 19% *longer* with AI tools | METR study |
| CodeRabbit | AI-generated code: 40-62% vulnerability rate; 1.7x more issues than human PRs | CodeRabbit report |

### When NOT to Use Multiple Agents
- Simple, single-file changes
- Tasks that fit in one context window
- When latency matters more than quality
- When the task is well-defined and doesn't need exploration

---

## 17. Key Academic Papers

| Paper | Year | Key Finding | URL |
|-------|------|-------------|-----|
| SWE-bench | 2024 | De-facto coding agent benchmark | [swebench.com](https://www.swebench.com/) |
| MAGIS | 2024 | 4-agent framework, 8x improvement over GPT-4 direct | [arxiv](https://arxiv.org/abs/2403.17927) |
| SCoRe | 2025 | Multi-turn RL self-correction, +15.6% MATH | [ICLR](https://proceedings.iclr.cc/paper_files/paper/2025/file/871ac99fdc5282d0301934d23945ebaa-Paper-Conference.pdf) |
| HALO | 2025 | Three-tier hierarchical orchestration, 95.2% HumanEval | [arxiv](https://arxiv.org/abs/2505.13516) |
| Context Engineering Survey | 2025 | 1400+ paper taxonomy of context management | [arxiv](https://arxiv.org/abs/2507.13334) |
| VulnLLM-R | 2025 | 7B reasoning model finds 15 zero-days | [arxiv](https://arxiv.org/abs/2512.07533) |
| Co-RedTeam | 2026 | Multi-agent red-teaming, 60%+ exploitation rate | [arxiv](https://arxiv.org/abs/2602.02164) |
| Scaling Agent Systems | 2025 | When multi-agent outperforms single-agent | [arxiv](https://arxiv.org/abs/2512.08296) |
| General Agent Evaluation | 2026 | Model choice 85x more important than architecture | [arxiv](https://www.arxiv.org/pdf/2602.22953) |
| Brief CoT for Tool-Calling | 2026 | 8-32 token CoT optimal; extended CoT hurts | [arxiv](https://www.arxiv.org/pdf/2604.02155) |
| CoT vs Instruction Following | 2025 | CoT reduces constraint adherence | [arxiv](https://arxiv.org/pdf/2505.11423) |

---

## 18. Top Recommendations (Synthesis)

1. **Start with AGENTS.md** as universal source of truth; generate tool-specific files from it
2. **Use hooks for critical guardrails** (linting, type-checking, blocking destructive commands) — prompts are advisory only
3. **Brief reasoning (8-32 tokens) for tool-calling**; extended reasoning hurts accuracy
4. **Limit to 3-4 agents max** — diminishing returns and error amplification beyond that
5. **Invest in environment design** (custom linters with remediation, test infrastructure) over prompt engineering
6. **Build compression before you need it** — 80% of calls don't need frontier model
7. **Revert and restart > nudging** when agents go off-track
8. **Model choice matters 85x more than architecture** — pick the best model first, optimize architecture second
9. **Anchor agent identity in persona** — harder to override than behavioral rules
10. **Keep system prompts under 150 lines** — quality degrades beyond that

---

## 19. All Sources (Master Reference List)

### Documentation
- Anthropic Claude Code: https://docs.anthropic.com/en/docs/claude-code/
- Anthropic Sub-agents: https://docs.anthropic.com/en/docs/claude-code/sub-agents
- Anthropic Agent Teams: https://docs.anthropic.com/en/docs/claude-code/agent-teams
- OpenCode: https://opencode.ai/docs/agents/
- OpenAI Codex: https://developers.openai.com/codex/subagents
- MCP Spec: https://modelcontextprotocol.io/specification/latest
- CrewAI: https://docs.crewai.com/
- Aider: https://aider.chat/docs/usage/modes.html

### Engineering Blogs
- Anthropic Building Effective Agents: https://anthropic.com/engineering/building-effective-agents
- Anthropic Multi-Agent Research: https://www.anthropic.com/engineering/multi-agent-research-system
- Hipcamp Scout: https://www.hipcamp.com/journal/engineering/scout-our-in-house-ai-agent
- Trail of Bits AI-Native: https://blog.trailofbits.com/2026/03/31/how-we-made-trail-of-bits-ai-native-so-far/
- Cursor Agent Best Practices: https://cursor.com/blog/agent-best-practices
- Kapwing AI Adoption: https://www.kapwing.com/blog/how-we-achieved-100-adoption-of-ai-coding-agents/
- OpenAI Harness: https://www.engineering.fyi/article/harness-engineering-leveraging-codex-in-an-agent-first-world
- Cato Networks PR Agent: https://www.catonetworks.com/blog/inside-cato-rds-self-evolving-pr-review-agent/
- GitHub AGENTS.md Lessons: https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/

### GitHub Repositories
- sst/opencode (153K ⭐): https://github.com/sst/opencode
- agentsmd/agents.md (20K ⭐): https://github.com/agentsmd/agents.md
- addyosmani/agent-skills (28K ⭐): https://github.com/addyosmani/agent-skills
- PatrickJS/awesome-cursorrules (39K ⭐): https://github.com/PatrickJS/awesome-cursorrules
- swt-labs/vbw: https://github.com/swt-labs/vibe-better-with-claude-code-vbw
- rexeus/agentic: https://github.com/rexeus/agentic
- trailofbits/claude-code-config: https://github.com/trailofbits/claude-code-config
- trailofbits/skills: https://github.com/trailofbits/skills
- asgeirtj/system_prompts_leaks (39K ⭐): https://github.com/asgeirtj/system_prompts_leaks
- shanraisshan/claude-code-best-practice (51K ⭐): https://github.com/shanraisshan/claude-code-best-practice
- shakacode/claude-code-commands-skills-agents: https://github.com/shakacode/claude-code-commands-skills-agents

### Prompt Engineering
- OpenAI Prompt Guide: https://developers.openai.com/api/docs/guides/prompt-guidance
- OpenAI Personalities: https://developers.openai.com/cookbook/examples/gpt-5/prompt_personalities
- Prompting Guide (agents): https://www.promptingguide.ai/agents/function-calling
- Sureprompts: https://sureprompts.com/blog/the-complete-guide-to-prompting-ai-coding-agents-2026
- Field Guide to AI: https://fieldguidetoai.com/guides/prompting-ai-agents

### Security
- Trail of Bits MCP: https://www.trailofbits.com/mcp/
- Trail of Bits Trailmark: https://github.com/trailofbits/trailmark
- Trail of Bits Different: https://github.com/trailofbits/different

### Research Papers
- See Section 17 above for full list with URLs

---

## 20. AGENTS.md Best Practices (Deep Dive)

### The Standard

AGENTS.md is a vendor-neutral, Linux Foundation-governed open standard (MIT license, 21K+ stars, 60K+ repos adopted). It's plain Markdown with no required schema — "a README for agents."

- **Spec Repo:** https://github.com/agentsmd/agents.md (21K ⭐)
- **Website:** https://agents.md
- **OpenAI Codex Guide:** https://developers.openai.com/codex/guides/agents-md

### The 6 Core Areas (GitHub Blog, 2,500+ Repos)

**Source:** https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/

| # | Area | What to Include |
|---|------|----------------|
| 1 | **Commands** | Exact shell invocations: `npm test`, `pytest -v`, `npm run build` |
| 2 | **Testing** | Framework, how to run, expectations, coverage |
| 3 | **Project Structure** | File layout, what lives where |
| 4 | **Code Style** | Concrete good/bad examples, naming conventions |
| 5 | **Git Workflow** | Commit practices, PR conventions, branch strategy |
| 6 | **Boundaries** | ✅ Always / ⚠️ Ask first / 🚫 Never |

### Tool Compatibility

| Tool | Native File | Reads AGENTS.md? |
|------|------------|-------------------|
| OpenCode | `AGENTS.md` | ✅ Native |
| OpenAI Codex | `AGENTS.md` | ✅ Primary |
| GitHub Copilot | `.github/copilot-instructions.md` | ✅ Native |
| Claude Code | `CLAUDE.md` | ❌ (use `@AGENTS.md` import) |
| Gemini CLI | `GEMINI.md` | ✅ Via config |
| Cursor | `.cursor/rules/*.mdc` | ✅ Root |
| Amp | `AGENTS.md` | ✅ Native |

### Precedence (Codex)
```
~/.codex/AGENTS.md → project root AGENTS.md → subdirectory AGENTS.md
AGENTS.override.md always wins over AGENTS.md at same level
Combined max: 32 KiB
```

### What to Include vs Exclude

**✅ INCLUDE:**
- Exact executable commands (not descriptions)
- Specific tech stack with versions
- Three-tier boundaries (always/ask/never)
- Code examples of good patterns
- Project structure as quick reference
- PR/commit format requirements

**🚫 EXCLUDE:**
- Prose paragraphs explaining concepts
- Duplicated README content
- Ambiguous directives ("be careful", "use best practices")
- Full documentation (link to `docs/` instead)
- Anything over ~100-200 lines
- Contradictory priorities without explicit ordering

### Real-World Examples

**Vercel Labs `open-agents`** (https://github.com/vercel-labs/open-agents/blob/main/AGENTS.md):
```markdown
## Commands
bun run ci             # REQUIRED: format check, lint, typecheck, tests
## Code Style
- Files: kebab-case, Types: PascalCase, Functions: camelCase
- Never use `any` — use `unknown` and narrow with type guards
## File Organization
- Do NOT append new functionality to the bottom of an existing file.
- Prefer creating a new colocated file for distinct concerns.
```

**Anbeeld's Behavioral AGENTS.md** (https://github.com/Anbeeld/AGENTS.md/blob/main/AGENTS.md):
```markdown
## Priorities (lower number wins)
1. Correctness
2. Evidence
3. Safety
4. Minimal changes
5. Consistency
6. Performance
```

### The Acid Test

> "Ask the agent to recite your build commands. If it can't, your AGENTS.md is too verbose."
> — Blake Crosley (https://blakecrosley.com/blog/agents-md-patterns)

### Additional Sources
- GitHub `gh-aw` Example: https://github.com/github/gh-aw/blob/main/AGENTS.md
- agentsmd.io Best Practices: https://agentsmd.io/agents-md-best-practices
- AgentPatterns.ai Standard: https://agentpatterns.ai/standards/agents-md/
- GitHub awesome-copilot Skill: https://github.com/github/awesome-copilot/blob/main/skills/create-agentsmd/SKILL.md
- Copilot AGENTS.md Changelog: https://github.blog/changelog/2025-08-28-copilot-coding-agent-now-supports-agents-md-custom-instructions/

---

## Information Gaps

- **No public CLAUDE.md from Vercel, Stripe, or Shopify** found in public repos
- **Codex /goal internal architecture** — limited public documentation beyond config flags
- **Long-horizon agent evaluation** (multi-day tasks) — best models under 45% on SWE-bench Pro
- **Cross-language agent performance** — most work/benchmarks are Python-focused
- **Formal cost-benefit analysis** of multi-agent vs single-agent at various scales
- **Token cost benchmarks**: No published data comparing cost of 3-agent vs single-agent workflows
