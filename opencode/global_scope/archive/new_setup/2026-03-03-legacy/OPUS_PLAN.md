Agent Harness Plan for OpenCode
Design Principles (derived from research)
Before the phases, these are the non-negotiable design principles drawn from the papers, OpenAI's harness engineering blog, and the Theo transcript:
1. AGENTS.md is a table of contents, not an encyclopedia (OpenAI, AGENTS.md paper). ~100 lines. Points to deeper docs. Never duplicates what the model can find in the codebase.
2. 2-3 focused, human-authored skills beat many generic ones (SkillsBench). Moderate length. Procedural, not descriptive.
3. Enforce via tooling, not instructions (OpenAI). Linters, structural tests, and type checks > telling the agent "always do X."
4. Progressive disclosure (OpenAI). Agents start with a small map and navigate to what they need -- not front-loaded with everything.
5. Read is free, write is gated (your preference + research sweet spot). Discovery/exploration needs zero friction. Modifications get one confirmation.
6. Config-first, plugins when needed (your preference). Markdown agents, SKILL.md, JSON config. TypeScript plugins only for lifecycle hooks that config can't express.
7. Repository knowledge is the system of record (OpenAI). If it's not in the repo, the agent can't see it. Slack convos, mental models, and tribal knowledge must be encoded.
---
Architecture Overview
~/.config/opencode/               # GLOBAL (shared across projects)
├── opencode.json                 # Core config: providers, models, permissions, plugins
├── AGENTS.md                     # Personal global rules (minimal)
├── agents/                       # Agent definitions (markdown)
│   ├── scout.md                  # Agent #1: Light Q&A + discovery
│   ├── engineer.md               # Agent #2: Serious dev work
│   └── auto.md                   # Agent #3: Placeholder for automation
├── skills/                       # Global skills (SKILL.md files)
│   ├── git-workflow/SKILL.md
│   ├── code-quality/SKILL.md
│   └── project-setup/SKILL.md
├── commands/                     # Global custom commands
│   ├── plan.md
│   ├── review.md
│   └── commit.md
└── plugins/                      # Light plugins (TypeScript)
    └── session-notify.ts
<project>/.opencode/              # PROJECT-SPECIFIC (overrides)
├── opencode.json                 # Project config overrides
├── agents/                       # Project-specific agents (if needed)
├── skills/                       # Project-specific skills
│   └── data-pipeline/SKILL.md
└── commands/                     # Project-specific commands
<project>/                        # THE CODEBASE (source of truth)
├── AGENTS.md                     # Lean table of contents (~100 lines)
├── docs/                         # Structured knowledge base
│   ├── architecture.md
│   ├── decisions/
│   └── plans/
└── ... (actual code)
---
Phase 1: Foundation -- A Working Minimal Harness
Goal: Get a functional harness with two agents, basic permissions, and lean context. This is your "day 1" setup that you use immediately.
What you build:
1. Global opencode.json -- Configure your two models (capable model for engineer, cheaper for scout), set global permissions (read=allow, write/edit/bash=ask)
2. Agent #1: scout.md -- Primary agent for questions, light exploration, small fixes. Uses cheaper model. Has full read tools, write/edit/bash set to ask. Low temperature (0.1). Description tells the system: "for questions, exploration, and small changes"
3. Agent #2: engineer.md -- Primary agent for serious dev work. Uses capable model. All tools enabled. Write/edit/bash = ask. Higher step limit. Description: "for complex multi-step development work with planning"
4. Minimal global AGENTS.md -- Personal rules only. Maybe 10-20 lines. Things like "prefer uv for Python dependency management" or "always run type checks after changes"
5. Per-project AGENTS.md template -- A lean ~100 line template following the OpenAI pattern: brief project description, pointer to docs/ structure, pointer to key files (pyproject.toml, etc.), known gotchas section (empty initially)
What you learn: How OpenCode's built-in agents feel, how tab-switching between scout and engineer works, whether the permission model fits your flow.
Dependencies: OpenCode installed, provider API keys configured.
---
Phase 2: Context Strategy -- Progressive Disclosure
Goal: Implement the OpenAI-style "AGENTS.md as table of contents" pattern with a structured docs/ directory for one of your real projects.
What you build:
1. Project AGENTS.md -- Following the research guidelines:
   - ~100 lines max
   - Brief project description (2-3 sentences)
   - Section pointing to docs/ structure
   - Section listing key entry points (main config, schema, etc.)
   - "Gotchas" section for agent-confusing patterns (start empty, populate as you discover issues -- following Theo's approach of letting agents report what confuses them)
   - NO codebase overview, NO file listings, NO dependency enumerations
2. docs/ knowledge base -- Following OpenAI's layout:
   - docs/architecture.md -- Top-level architectural map (domains, layers, data flow)
   - docs/decisions/ -- Decision records for significant choices
   - docs/plans/active/ -- Current work plans
   - docs/plans/completed/ -- Archive of past plans
   - docs/references/ -- External docs/llms.txt files for key dependencies
3. instructions config -- In project opencode.json, use the instructions array to point to relevant docs: ["docs/architecture.md", "CONTRIBUTING.md"]
What you learn: Whether progressive disclosure actually helps vs front-loading context. Does the agent navigate to docs/ on its own? Does it find the right files?
Experiment: Run the same task twice -- once with a fat AGENTS.md, once with the lean version + docs/. Compare token usage and output quality.
---
Phase 3: Skills -- Procedural Knowledge
Goal: Create your first 2-3 human-authored skills based on the SkillsBench findings (2-3 focused skills > many generic ones).
What you build:
1. git-workflow skill -- Global skill in ~/.config/opencode/skills/git-workflow/SKILL.md:
   - How to write commit messages (your conventions)
   - Branch naming patterns
   - When/how to create PRs
   - Common git operations for your workflow
   - Moderate length (the research says ~500-1000 tokens, not comprehensive docs)
2. code-quality skill -- Global skill:
   - Your Python quality stack (ruff, mypy, pytest conventions)
   - How to run checks before committing
   - What "done" looks like (tests pass, types check, linter clean)
   - Error patterns and how to fix them
3. project-setup skill -- Global skill:
   - Your standard Python project scaffold (uv, pyproject.toml, src layout)
   - CI/CD patterns you use
   - Standard directory structure
Key constraint from research: Skills should be procedural ("how to do X"), not declarative ("X exists"). They should apply to a class of problems, not a single instance. Human-authored only -- do NOT use /init to generate them.
What you learn: Does the agent load skills appropriately? Too often? Not enough? Do skills actually help or add noise?
Experiment: Run a coding task with and without skills loaded. Compare the agent's behavior.
---
Phase 4: Custom Commands -- Workflow Shortcuts
Goal: Create commands that encode your most common workflows, reducing prompt engineering overhead.
What you build:
1. /plan command -- Triggers the engineer agent in plan-only mode:
      ---
   description: Create a development plan for a task
   agent: plan
   ---
   Analyze the following task and create a detailed implementation plan.
   Write the plan to docs/plans/active/$1.md
   
   Task: $ARGUMENTS
   
2. /build command -- Executes an active plan:
      ---
   description: Execute an active development plan
   agent: engineer
   ---
   Read the plan at docs/plans/active/$1.md and implement it step by step.
   After completion, move the plan to docs/plans/completed/.
   
   Plan: $ARGUMENTS
   
3. /review command -- Code review focused on your quality standards:
      ---
   description: Review recent changes
   agent: scout
   subtask: true
   ---
   Review the changes in the current git diff. Check for:
   !`git diff --stat`
   Focus on correctness, type safety, and test coverage.
   
4. /commit command -- Smart commit with your git conventions:
      ---
   description: Create a well-structured commit
   agent: scout
   subtask: true
   ---
   !`git diff --cached --stat`
   Create an appropriate commit message following conventional commits.
   
What you learn: Which workflows benefit most from commands vs direct prompting. Whether the /plan -> /build separation feels natural for your workflow.
---
Phase 5: Agent Refinement -- Tuning Based on Experience
Goal: Refine agent definitions based on what you've learned from Phases 1-4. This is where the Theo principle kicks in: observe what goes wrong, then steer.
What you build:
1. Refine scout.md -- Based on usage patterns:
   - Add/remove tool access based on what scout actually needs
   - Tune the prompt based on observed mistakes
   - Consider adding task permissions so scout can delegate to explore subagent
2. Refine engineer.md -- Based on dev workflow:
   - Add planning instructions to the prompt (progressive autonomy: start with plan-review-build)
   - Configure permission.task to control which subagents engineer can invoke
   - Consider adding a custom subagent for specific recurring tasks
3. Update AGENTS.md gotchas section -- By now you'll have discovered patterns that confuse the agents. Add ONLY persistent misunderstandings, not things they can figure out.
4. Refine skills based on usage -- Delete skills that aren't helping. Tighten/loosen the ones that are. Remember: shorter, more focused skills outperform comprehensive ones.
What you learn: Your personal intuition for what needs to be in config vs what the model handles on its own. This is the most important skill you'll build.
---
Phase 6: Light Plugins -- Lifecycle Hooks
Goal: Add TypeScript plugins for things that pure config can't handle.
What you build:
1. Session notification plugin -- Get notified when a long-running task completes:
      export const NotifyPlugin = async ({ $ }) => ({
     event: async ({ event }) => {
       if (event.type === "session.idle") {
         await $`osascript -e 'display notification "Done!" with title "OpenCode"'`
       }
     }
   })
   
2. Env protection plugin -- Prevent reading sensitive files:
      export const EnvProtection = async () => ({
     "tool.execute.before": async (input, output) => {
       if (input.tool === "read" && /\.(env|key|secret)/.test(output.args.filePath)) {
         throw new Error("Sensitive file -- access denied")
       }
     }
   })
   
3. Compaction context plugin (optional) -- Preserve important context during session compaction
What you learn: When plugins add real value vs unnecessary complexity. Whether the hook system is powerful enough for your needs or if you need more.
---
Phase 7: Data/ML Skill + Agent #3 Placeholder
Goal: Add domain-specific skills for your data/AI engineering work and sketch agent #3.
What you build:
1. data-pipeline skill -- Project-specific (in .opencode/skills/):
   - Your pipeline patterns (orchestration, data validation, error handling)
   - Common data engineering idioms for your stack
   - Testing patterns for pipelines
2. ml-workflow skill (if applicable):
   - Experiment tracking conventions
   - Model evaluation patterns
   - Artifact management
3. Agent #3: auto.md -- Placeholder with documentation:
   - Describe the intended purpose (full automation)
   - Set all permissions to allow
   - Add a high step limit
   - Keep the prompt minimal -- this is for future work
   - Disabled by default (disable: true)
What you learn: Whether domain-specific skills in .opencode/skills/ per-project are better than trying to make them global.
---
Phase 8: Iteration and Maintenance
Goal: Establish a maintenance rhythm. The research is clear: stale context files actively hurt performance.
What you build:
1. Maintenance command -- /audit that checks for stale docs:
      ---
   description: Audit context files for staleness
   agent: scout
   subtask: true
   ---
   Check if docs/ and AGENTS.md are still accurate:
   !`git log --oneline -20`
   Compare recent changes against the documentation.
   Flag anything outdated.
   
2. Progressive autonomy for engineer -- As trust builds:
   - Relax permissions for specific commands (e.g., git status = allow)
   - Consider auto-approve for certain file patterns
   - Increase step limits
   - Let the engineer create and execute plans without review for smaller tasks
3. Knowledge capture workflow -- When you discover something the agent keeps getting wrong:
   - First: try to fix it in the codebase (better tests, clearer naming, type hints)
   - Second: if codebase can't solve it, add a gotcha to AGENTS.md
   - Third: if it's a procedural pattern, update a skill
   - Last resort: add it to the agent prompt
---
File Manifest (what gets created, in order)
| Phase | File | Location | Type |
|-------|------|----------|------|
| 1 | opencode.json | ~/.config/opencode/ | Config |
| 1 | AGENTS.md | ~/.config/opencode/ | Rules |
| 1 | scout.md | ~/.config/opencode/agents/ | Agent |
| 1 | engineer.md | ~/.config/opencode/agents/ | Agent |
| 2 | AGENTS.md | <project>/ | Rules |
| 2 | opencode.json | <project>/ | Config |
| 2 | docs/architecture.md | <project>/docs/ | Knowledge |
| 3 | SKILL.md | ~/.config/opencode/skills/git-workflow/ | Skill |
| 3 | SKILL.md | ~/.config/opencode/skills/code-quality/ | Skill |
| 3 | SKILL.md | ~/.config/opencode/skills/project-setup/ | Skill |
| 4 | plan.md | ~/.config/opencode/commands/ | Command |
| 4 | build.md | ~/.config/opencode/commands/ | Command |
| 4 | review.md | ~/.config/opencode/commands/ | Command |
| 4 | commit.md | ~/.config/opencode/commands/ | Command |
| 5 | (refine existing files) | Various | Refinement |
| 6 | session-notify.ts | ~/.config/opencode/plugins/ | Plugin |
| 6 | env-protection.ts | ~/.config/opencode/plugins/ | Plugin |
| 7 | SKILL.md | <project>/.opencode/skills/data-pipeline/ | Skill |
| 7 | auto.md | ~/.config/opencode/agents/ | Agent |
| 8 | audit.md | ~/.config/opencode/commands/ | Command |
