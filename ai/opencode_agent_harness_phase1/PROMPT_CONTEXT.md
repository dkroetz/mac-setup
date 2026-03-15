# Prompt 1

i want to improve my agent setup and development workflow in opencode.
i watched a video (https://www.youtube.com/watch?v=rmvDxxNubIg) about context/harness engineering, which is transcribed here: @dev/harness_engineering_transcript.txt
i could find parts of the mentioned prompts in this repo, but not all
(this is the speakers own ai agent application - i'm just interested in the prompt workflow)
https://github.com/humanlayer/humanlayer
i cloned the repo for you to look into the files in .claude at /Users/denis/Repos/humanlayer/ for inspiration and quicker code lookup.

I want to implement his idea of the 3 step implementation approach, Research, Plan, Implement. For this i want to define 3 Primary Agents for Opencode and their respective subagents/skills.
Opencode references:

- https://github.com/anomalyco/opencode
- https://opencode.ai/docs

i cloned the repo for you here: /Users/denis/Repos/opencode for quicker code lookup if required.

i want to start of with a lean approach, so lets focus on the main functionalities which i want to build on top of (3 primary, x subagents, x skills - maybe 10-12 .md files max)
the main codebase i will be working in is here: ~/Projects/futilify/ make yourself familiar with all relevant files.
this is a personal project for me to learn, so we don't want extensive overengineering or testing but focus on dev speed/convenience as well as non-extensive token generation through too many markdown files.
i'm planning to play with a lot of different models from different providers (from proprietary to open source/open weight)

all agents currently defined in opencode or this mac-setup repo should be ignored - they are from a different context where i have been playing.

Help me define the agents, subagents and skills as defined above, ask any clarification question you need.

After clarification, write <MODEL_NAME>\_PLAN.md

# Prompt 2 - All

i asked 2 other AIs the same thing and they wrote their output to

< added reference to Plan outputs from other 2 models>

Review those plans and compare them with yours.
Pick a combination of the best pieces from each, explain pros/cons and write a <MODEL_NAME>\_REVIEWED_PLAN.md
If you are not sure whats a better choice, ask me.

## Q/A - GLM

Q: What type of skills should we create?
A: Domain skills for futilify
Q: Should we include the detailed testing/validation section from KIMI's plan?
A: Keep brief (Recommended)

## Q/A - Kimi

Q: Subagents: GLM5's approach uses OpenCode's built-in @explore subagent instead of custom ones. This is simpler but less specialized. Do you want:

- Option A: Custom subagents (more control, more files)
- Option B: Use built-in @explore only (simpler, fewer files)
  A: I want Option B
  Q: Skills: GLM5 suggests methodology skills (how to research/plan) vs domain skills (python/prefect knowledge). Do you want:
- Option A: Domain skills (python-project, prefect-flows, docker-infra)
- Option B: Methodology skills (research-method, planning-method)
- Option C: Both (more files but comprehensive)
  A: Domain Skills
  Q: Output files: GLM5 creates .research/research.md and .research/plan.md in each project. Do you want this documentation pattern, or should agents just output to chat?
  A: i want to create these outputs, but i think they should reside in each projects .opencode/ folder
  Q: File count: GLM5's 5 files is very lean. My 11 files might be over-engineered. What's your preference for the trade-off between flexibility and simplicity?
  A: i think 11 files are fine, my initial gut feeling was between 10-12

## Q/A - Minimax

Q: For subagents: should we use opencode's built-in @explore or create custom .md files? GLM5 recommends built-in.
A: @explore built-in (Recommended)
Q: Target file count: balanced (10-12) or comprehensive (14) or ultra-lean (<8)?
A: 10-12 files (Recommended)
Q: Where should research and plan outputs be saved?
A: .opencode/ subdirs (Recommended)

# Prompt 3 - All

i have additional context from Q/A between me and the other agents - incorporate that into the reviewed plan.

< added Q/A from other 2 models>

# Prompt 4 - All

i'm in the process of planning out my opencode setup. for this, i tasked 3 ai agents to help me plan it out.
you can find prompt context as well as the review files in @dev/
start with looking at @dev/PROMPT_CONTEXT.md - then continue from there

Give me a review of the <MODEL_NAME>\_REVIEWED_PLAN.md files and point out key differences (if there are any).
Then tell me what you think is the best plan - this will be the one we will implement later.

if you have any last improvements for the plan you picked, list them here.

# Result

## Minimax

My Recommendation: GLM_REVIEWED_PLAN.md
It's the most comprehensive and aligns best with:

1. User preferences (Q/A incorporated)
2. Domain skills only (no methodology - keeps file count lean at 10)
3. Global agents + local outputs (reusable agents, project-specific docs)
4. Explicit permissions (edit: deny for research/plan - critical for workflow)
5. Clear output templates for both research and plan files

Suggested Improvements for GLM Plan

1. Add explicit permission controls - Already has edit: deny for research/plan, but implement could be more specific (allow bash, deny destructive ops)
2. Consider adding command files like MINIMAX has - if you want /research, /plan, /implement slash commands for quick access
3. Skills consolidation: Consider merging postgres-docker into python-project since Docker infra is often part of the Python project setup - reduces to 2 skills
4. Add a simple README in .opencode/ explaining the workflow for future you
   The GLM plan strikes the best balance between completeness and simplicity while adhering to your 10-12 file guideline.

## Kimi

My Recommendation: GLM's Plan
Why GLM wins:

1. Correct location: Global agents in ~/.config/opencode/ is the right approach - agents should be reusable across projects, only outputs should be project-local
2. No unnecessary commands: MINIMAX adds /research, /plan, /implement commands which are redundant when you have Tab-switchable agents
3. Right skill count: 3 domain skills is exactly what you asked for (KIMI adds 2 methodology skills you said you didn't want)
4. Better skill naming: python-pdm/, prefect-flows/, postgres-docker/ is more specific and follows OpenCode's SKILL.md convention properly
5. Most detailed: Has complete output file format templates, clear workflow diagrams, and comprehensive "What NOT to do" sections from Humanlayer

Minor Improvements for GLM's Plan

1. Remove opencode.jsonc reference (line 28) - you said you want to play with different models, so hardcoding in jsonc isn't needed
2. Add .opencode/plans/ to gitignore explicitly (line 277 only mentions research)
3. Clarify skill loading: Add explicit skill() tool calls in agent definitions since that's how OpenCode loads skills
4. Add agent model flexibility: Since you're testing multiple providers, add a note that models can be swapped per agent
   The GLM plan is the most complete, follows your constraints best, and has the clearest implementation path.

## GLM

Recommendation: GLM_REVIEWED_PLAN.md
It's the most aligned with your Q/A decisions:

- ✅ Built-in @explore only
- ✅ Domain skills only (python-pdm, prefect-flows, postgres-docker)
- ✅ Output in .opencode/research/ and .opencode/plans/
- ✅ 10-12 files target
- ✅ Detailed output templates for consistency
- ✅ Clear implementation order

Suggested Improvements for GLM Plan

1. Add AGENTS.md update step - GLM mentions it stays as project conventions but doesn't include updating it with workflow documentation (MINIMAX does this better)
2. Consider postgres-docker → just postgres - The skill covers SQLAlchemy/Alembic primarily, "postgres-docker" might be misleading since it's more about DB patterns than Docker
3. Add explicit skill loading syntax - The plan doesn't show exactly how agents load skills (e.g., via skill() tool or references)
4. Missing .gitkeep files - Research/plans directories should have .gitkeep to be tracked in git (mentioned but not in implementation order)
   Want me to incorporate these improvements into the final plan when we implement?

# Final Prompt - GLM

I asked the other agents the same question and got the same answer - GLM Plan is the way to go.
Here are the last refinements that you should incorporate into into MINIMAX_FINAL_PLAN.md

1. Add AGENTS.md update step - GLM mentions it stays as project conventions but doesn't include updating it with workflow documentation (MINIMAX does this better)
2. Consider postgres-docker → just postgres - The skill covers SQLAlchemy/Alembic primarily, "postgres-docker" might be misleading since it's more about DB patterns than Docker
3. Add explicit skill loading syntax - The plan doesn't show exactly how agents load skills (e.g., via skill() tool or references)
   Please look up best practices for opencode skill loading before suggesting something.
4. Missing .gitkeep files - Research/plans directories should have .gitkeep to be tracked in git (mentioned but not in implementation order)
5. Add explicit permission controls - Already has edit: deny for research/plan, but implement could be more specific (allow bash, deny destructive ops)
6. Consider adding command files like MINIMAX has - if you want /research, /plan, /implement slash commands for quick access.
   Please look up if this exists in opencode before adding to the plan
7. Clear output templates for both research and plan files
