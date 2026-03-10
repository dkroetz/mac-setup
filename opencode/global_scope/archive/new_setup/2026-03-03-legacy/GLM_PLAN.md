Your Implementation Plan
Based on your requirements:
- 2 agents: Heavy developer (discover-plan-implement) + optional light assistant
- Configurable modes: Strict vs ultrawork autonomy
- Dynamic context: Minimal pre-configuration, discovery-based
- OpenCode native: agents/ directory with frontmatter
- Single model first: Add multi-model later
- Priority: Core orchestration first
---
Phase 1: Foundation (Understanding & Setup)
Step 1.1: Deep Dive into OpenCode Agent System
Goal: Understand OpenCode's native agent architecture
Actions:
1. Read OpenCode's agent documentation thoroughly
2. Examine example agents in the OpenCode repo
3. Understand frontmatter configuration options
4. Test the /agent command with existing agents
5. Document how agent loading works (when/where context is injected)
Deliverable: notes/opencode-agents-understanding.md with:
- Agent loading mechanism
- Frontmatter schema
- Context injection points
- Tool availability per agent
- How to create custom agents
Time: 2-3 hours  
Learning Value: HIGH - This is your foundation
---
Step 1.2: Analyze Your Current Workflow
Goal: Document your ideal discover-plan-implement workflow
Actions:
1. Pick a recent complex task you completed
2. Break it down into phases (discover, plan, implement, validate)
3. Identify decision points where you'd want human approval
4. Note what context you needed at each phase
5. Define what "done" looks like for each phase
Deliverable: notes/workflow-analysis.md with:
- Phase definitions
- Decision/approval points
- Context requirements per phase
- Success criteria per phase
- Example task walked through
Time: 1-2 hours  
Learning Value: HIGH - Clarity before building
---
Step 1.3: Design Your Agent Configuration Schema
Goal: Define the structure for your 2 agents
Actions:
1. Design frontmatter schema for both agents:
   - light.md: Quick assistant
   - heavy.md: Full workflow orchestrator
2. Define autonomy modes in frontmatter (strict/ultrawork)
3. Plan context discovery strategy
4. Define tool restrictions per agent
5. Create initial empty agent files
Deliverable: 
agents/
├── light.md          # Quick assistant (future)
├── heavy.md          # Full workflow orchestrator
└── README.md         # Documentation
Time: 1 hour  
Learning Value: MEDIUM - Sets structure
---
Phase 2: Core Orchestration (Heavy Developer Agent)
Step 2.1: Create Heavy Agent - Discover Phase
Goal: Implement the discovery/orchestration agent
Actions:
1. Create agents/heavy.md with frontmatter:
      ---
   name: heavy
   description: Full discover-plan-implement workflow
   mode: orchestrator
   tools: [read, glob, grep, bash, task, websearch, codesearch]
   autonomy_modes:
     - strict: [plan_approval, step_approval]
     - balanced: [plan_approval]
     - ultrawork: []
   ---
   2. Write the agent prompt focusing on:
   - Task classification (bug/feature/refactor/explore)
   - Context discovery strategy
   - When to spawn subagents
3. Implement discover logic:
   - Find relevant files
   - Understand codebase structure
   - Identify dependencies
4. Test with a simple task
Deliverable: Working discover phase that:
- Classifies tasks
- Finds relevant context dynamically
- Reports findings to user
Time: 3-4 hours  
Learning Value: HIGH - Core orchestration logic
---
Step 2.2: Add Planning Capability
Goal: Implement structured planning with approval gates
Actions:
1. Add planning section to agents/heavy.md:
   - Break down into atomic subtasks
   - Identify dependencies
   - Estimate complexity
   - Define success criteria
2. Create plan template:
       Plan: [Task Name]
   
 Context Discovered
   - [What was found]
   
    Approach
   - [High-level strategy]
   
    Subtasks
   1. [Subtask 1] - [dependencies] - [files to modify]
   2. [Subtask 2] - [dependencies] - [files to modify]
   
    Risks & Mitigations
   - [Risk 1]: [Mitigation]
   
    Approval Required
   - [ ] Plan looks good
   - [ ] Ready to implement
   3. Add approval gate logic based on autonomy mode
4. Test planning with a medium-complexity task
Deliverable: Planning system with:
- Structured plan output
- Approval gates (configurable)
- Clear subtask breakdown
Time: 2-3 hours  
Learning Value: HIGH - Planning is critical
---
Step 2.3: Implement Execution Phase
Goal: Add implementation with step-by-step execution
Actions:
1. Extend agents/heavy.md with execution logic:
   - Execute subtasks in order
   - Handle dependencies
   - Track progress
   - Validate after each step
2. Add execution template:
       Executing: [Subtask Name]
   
 Changes
   - [File]: [What changed]
   
    Validation
   - [ ] Tests pass
   - [ ] Types check
   - [ ] Lint clean
   
    Next
   - [What's next]
   3. Implement validation hooks:
   - Run tests after changes
   - Type checking
   - Linting
4. Add step approval (if in strict mode)
5. Test with a real feature implementation
Deliverable: Execution system with:
- Sequential subtask execution
- Built-in validation
- Progress tracking
- Approval gates
Time: 3-4 hours  
Learning Value: HIGH - This is where work happens
---
Step 2.4: Add Wisdom Accumulation
Goal: Learn from each task to improve future tasks
Actions:
1. Create context/wisdom/ directory structure:
      context/wisdom/
   ├── patterns/
   │   ├── auth.md
   │   ├── api.md
   │   └── database.md
   ├── mistakes/
   │   └── [task-slug].md
   └── decisions/
       └── [task-slug].md
   2. Add wisdom capture to agents/heavy.md:
   - After each task, capture:
     - Patterns discovered
     - Mistakes made
     - Decisions taken
3. Create wisdom injection system:
   - Load relevant wisdom before planning
   - Use for similar future tasks
4. Test wisdom accumulation across 2-3 tasks
Deliverable: Wisdom system that:
- Captures learnings automatically
- Injects relevant wisdom for new tasks
- Improves over time
Time: 2-3 hours  
Learning Value: MEDIUM - Long-term improvement
---
Phase 3: Dynamic Context System
Step 3.1: Implement Context Discovery
Goal: Dynamic context loading based on task (research-backed)
Actions:
1. Create context/discovery.md with discovery rules:
       Context Discovery Rules
   
 When to Load Context
   - Only when agent can't find information via tools
   - After initial discover phase
   - Before planning
   
    What to Load
   - Project-specific patterns (if task matches)
   - Relevant wisdom (if similar past task)
   - External docs (only if using unfamiliar library)
   
    What NOT to Load
   - Generic coding patterns (model knows)
   - File structure (discover via glob)
   - Tool documentation (model knows)
   2. Implement lazy loading in agents/heavy.md:
   - Check if context needed
   - Load minimal required context
   - Use MVI principle (<200 lines)
3. Create context templates for common patterns
4. Test context loading efficiency
Deliverable: Dynamic context system with:
- Need-based loading
- Minimal context (<200 lines per load)
- Measurable token reduction
Time: 2-3 hours  
Learning Value: HIGH - Research-backed optimization
---
Step 3.2: Create Pattern Library
Goal: Curated patterns for common tasks (not auto-generated)
Actions:
1. Create context/patterns/ structure:
      context/patterns/
   ├── authentication.md
   ├── api-design.md
   ├── database.md
   ├── testing.md
   └── error-handling.md
   2. Write 3-5 core patterns (manually curated):
   - Your preferred auth pattern
   - Your API design pattern
   - Your testing pattern
3. Each pattern should be:
   - <150 lines
   - Procedural (how-to, not what)
   - Project-specific (not generic)
4. Test pattern loading with matching tasks
Deliverable: Pattern library with:
- 3-5 curated patterns
- Clear loading triggers
- Proven usefulness
Time: 2-3 hours  
Learning Value: MEDIUM - Reusable patterns
---
Phase 4: Autonomy Modes & Safety
Step 4.1: Implement Autonomy Modes
Goal: Configurable strict/balanced/ultrawork modes
Actions:
1. Define mode behaviors in agents/heavy.md:
      modes:
     strict:
       - require_plan_approval: true
       - require_step_approval: true
       - max_files_per_step: 1
       - timeout_per_step: 5m
     balanced:
       - require_plan_approval: true
       - require_step_approval: false
       - max_files_per_step: 3
       - timeout_per_step: 10m
     ultrawork:
       - require_plan_approval: false
       - require_step_approval: false
       - max_files_per_step: 10
       - timeout_per_step: 30m
   2. Add mode switching logic:
   - Via command: /mode strict
   - Via frontmatter default
   - Per-task override
3. Implement approval prompts:
   - Plan approval: "Review plan before executing?"
   - Step approval: "Proceed with subtask?"
4. Test all three modes with same task
Deliverable: Working autonomy modes with:
- Clear mode differences
- Easy switching
- Appropriate approvals
Time: 2-3 hours  
Learning Value: HIGH - Safety vs speed balance
---
Step 4.2: Add Safety Checks
Goal: Prevent common mistakes
Actions:
1. Create context/safety-rules.md:
       Safety Rules
   
 Never Do
   - Commit secrets
   - Delete without confirmation
   - Modify .env files
   - Change database schemas without plan
   
    Always Do
   - Run tests after changes
   - Check types
   - Lint code
   - Create backup before large changes
   
    Warning Triggers
   - >5 files modified
   - Changes to auth
   - Changes to database
   - Changes to config
   2. Integrate safety checks into execution phase
3. Add warning prompts for triggers
4. Test safety system with risky operations
Deliverable: Safety system with:
- Hard blocks (never do)
- Soft warnings (check with user)
- Automatic validations
Time: 2-3 hours  
Learning Value: HIGH - Prevent disasters
---
Phase 5: Light Assistant Agent (Optional)
Step 5.1: Create Light Agent
Goal: Quick assistant for simple tasks
Actions:
1. Create agents/light.md:
      ---
   name: light
   description: Quick assistant for simple tasks
   mode: assistant
   tools: [read, glob, grep, bash]
   restrictions:
     - no_file_creation
     - max_3_files_modified
     - no_complex_planning
   ---
   2. Write prompt focusing on:
   - Quick answers
   - Simple edits
   - Code explanations
   - No complex orchestration
3. Add restrictions:
   - Max 3 files modified
   - No planning phase
   - Direct execution
4. Test with simple tasks
Deliverable: Working light agent for:
- Quick questions
- Simple refactors
- Code explanations
Time: 1-2 hours  
Learning Value: MEDIUM - Complementary to heavy
---
Phase 6: Testing & Refinement
Step 6.1: End-to-End Testing
Goal: Validate entire system with real tasks
Actions:
1. Create test task suite:
   - 1 simple bug fix
   - 1 medium feature
   - 1 complex refactor
   - 1 exploration task
2. Run each task through heavy agent:
   - Test all autonomy modes
   - Validate context loading
   - Check wisdom accumulation
   - Verify safety checks
3. Document:
   - Token usage per task
   - Time to completion
   - Approval frequency
   - Success rate
4. Identify bottlenecks
Deliverable: Test report with:
- Performance metrics
- Pain points identified
- Improvement opportunities
Time: 3-4 hours  
Learning Value: HIGH - Real-world validation
---
Step 6.2: Iteration & Polish
Goal: Refine based on testing
Actions:
1. Address top 3 pain points from testing
2. Optimize context loading:
   - Reduce token usage
   - Improve relevance
3. Improve planning:
   - Better subtask breakdown
   - More accurate estimates
4. Enhance wisdom accumulation:
   - Better pattern recognition
   - More useful captures
5. Document lessons learned
Deliverable: Refined harness with:
- Documented improvements
- Clear next steps
- Usage guide
Time: 2-3 hours  
Learning Value: HIGH - Practical experience
---
Phase 7: Documentation & Future Prep
Step 7.1: Create Usage Documentation
Goal: Document how to use your harness
Actions:
1. Create harness-guide.md:
   - Agent descriptions
   - When to use each agent
   - Autonomy mode guide
   - Context system explanation
   - Common patterns
2. Create context/README.md:
   - How context works
   - How to add patterns
   - How wisdom accumulates
3. Create examples/ with:
   - Example tasks
   - Example plans
   - Example executions
4. Test documentation with fresh eyes
Deliverable: Complete documentation with:
- Clear usage guide
- Examples
- Best practices
Time: 2-3 hours  
Learning Value: MEDIUM - Future reference
---
Step 7.2: Plan Multi-Model Expansion (Future)
Goal: Document how to add multi-model support later
Actions:
1. Research category-based routing (from OmO)
2. Design category schema:
      categories:
     quick: [haiku, flash]
     deep: [sonnet, gpt-5]
     visual: [gemini-pro]
   3. Document integration points:
   - Where to add model selection
   - How to handle fallbacks
   - How to measure model performance
4. Create migration plan:
   - Step 1: Single model (current)
   - Step 2: Task-based routing
   - Step 3: Category-based routing
Deliverable: Multi-model expansion plan with:
- Clear phases
- Integration points
- Migration strategy
Time: 1-2 hours  
Learning Value: LOW - Future planning
---
Implementation Order & Time Estimates
Total Estimated Time: 35-45 hours
Critical Path (Do First):
1. Step 1.1: OpenCode Agent Understanding (2-3h)
2. Step 2.1: Heavy Agent - Discover (3-4h)
3. Step 2.2: Planning (2-3h)
4. Step 2.3: Execution (3-4h)
5. Step 4.1: Autonomy Modes (2-3h)
Total Critical Path: 12-17 hours
High Value (Do Second):
6. Step 3.1: Context Discovery (2-3h)
7. Step 4.2: Safety Checks (2-3h)
8. Step 6.1: Testing (3-4h)
9. Step 6.2: Iteration (2-3h)
Total High Value: 9-13 hours
Nice to Have (Do Later):
10. Step 1.2: Workflow Analysis (1-2h)
11. Step 1.3: Config Schema (1h)
12. Step 2.4: Wisdom Accumulation (2-3h)
13. Step 3.2: Pattern Library (2-3h)
14. Step 5.1: Light Agent (1-2h)
15. Step 7.1: Documentation (2-3h)
16. Step 7.2: Multi-Model Plan (1-2h)
Total Nice to Have: 10-16 hours
---
Success Criteria
You'll know your harness is working when:
1. Orchestration: Heavy agent successfully discovers→plans→implements a medium feature
2. Context Efficiency: Token usage <50% of baseline (no pre-loaded context)
3. Autonomy Control: Can switch between strict and ultrawork modes easily
4. Safety: No disasters in ultrawork mode (safety checks work)
5. Wisdom: Second similar task is faster than first (wisdom helps)
6. Maintainability: Can add/modify agents without touching core code
---
Key Principles to Remember
1. Start minimal - Don't over-engineer early
2. Measure everything - Token usage, time, success rate
3. Iterate based on data - Not assumptions
4. Keep context lean - MVI principle always
5. Trust dynamic discovery - Models are good at finding info
6. Human-in-the-loop for learning - Not just safety
7. Document as you go - Future you will thank present you
