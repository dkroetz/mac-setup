Agent Harness Implementation Plan (OpenCode Native)
Architecture Summary
Core Principle: Harness = Agent Definitions + MCP Tools + Custom Commands
- Agents: Markdown files with frontmatter (.opencode/agents/)
- Orchestration: Custom commands (/harness-ask, /harness-build)
- Approval Gates: MCP tools using built-in question tool
- Context: Dynamic loading via MCP with file-based registry
- State: File-based persistence in .opencode/harness-state/
---
Phase 1: Project Structure & Agent Definitions
Duration: 2-3 days  
Learning Goal: Understand opencode's agent system and why minimal context works
Step 1.1: Create Directory Structure
your-project/
├── .opencode/
│   ├── agents/
│   │   ├── quick-agent.md
│   │   ├── build-agent.md
│   │   └── subagents/
│   │       ├── discoverer.md
│   │       ├── planner.md
│   │       ├── implementer.md
│   │       └── reviewer.md
│   ├── commands/
│   │   ├── harness-ask.ts
│   │   └── harness-build.ts
│   ├── mcp/
│   │   └── harness-server/
│   │       ├── index.ts
│   │       ├── tools/
│   │       │   ├── approval-gate.ts
│   │       │   ├── context-loader.ts
│   │       │   └── state-manager.ts
│   │       └── package.json
│   └── harness-state/          # File-based state
│       ├── approvals/
│       ├── context-cache/
│       └── registry.yaml       # Available context types
└── AGENTS.md                   # OPTIONAL: Only for consistent failures
Why this structure?
- Keeps harness logic isolated in .opencode/
- File-based state survives restarts
- Easy to version control (except state/ which is gitignored)
Step 1.2: Create QuickAgent
File: .opencode/agents/quick-agent.md
---
description: "Lightweight agent for Q&A and single-file changes"
model: openai/gpt-5.1-codex-mini
tools:
  - read
  - grep
  - edit
  - bash
subagents:
  - explore
permissions:
  auto_approve: true
---
You are QuickAgent, a fast, lightweight assistant for simple tasks.
 Capabilities
- Answer questions about the codebase
- Make single-file changes
- Explain code and patterns
 Guidelines
1. Keep responses concise
2. For single-file changes: verify file exists, make minimal changes
3. If task requires multiple files or complex coordination, escalate:
   - Say: "This requires BuildAgent. Run: /harness-build [task]"
4. Always run tests/linting after changes if available
 Context
{{dynamic_context}}
 Escalation Triggers
- Multiple file modifications needed
- Database schema changes
- Complex refactoring (>50 lines)
- Unclear requirements (need clarification)
What you'll learn:
- Frontmatter schema (model, tools, subagents, permissions)
- How to define escalation criteria
- Dynamic context injection placeholder
Step 1.3: Create BuildAgent
File: .opencode/agents/build-agent.md
---
description: "Serious development with discover-plan-implement workflow"
model: openai/gpt-5.3-codex
tools:
  - read
  - grep
  - task          # For spawning subagents
  - harness-approval-gate   # Custom MCP tool (Phase 2)
  - harness-context-loader  # Custom MCP tool (Phase 2)
subagents:
  - discoverer
  - planner
  - implementer
  - reviewer
permissions:
  auto_approve: false
---
You are BuildAgent, a senior developer for complex tasks.
 Workflow (STRICT ORDER)
 Phase 1: Discovery
1. Spawn discoverer subagent: `/task agent=discoverer description="Explore codebase for: [task]"`
2. Review findings
3. Call harness-approval-gate with:
   - phase: "discovery"
   - findings: [discoverer output]
4. If rejected: Ask user for clarification, restart discovery
5. If approved: Proceed to Phase 2
 Phase 2: Planning
1. Load relevant context: Call harness-context-loader with task description
2. Spawn planner subagent with discovery findings + loaded context
3. Review plan
4. Call harness-approval-gate with:
   - phase: "planning"
   - plan: [planner output]
5. If rejected: Revise plan with user feedback
6. If approved: Proceed to Phase 3
 Phase 3: Implementation
1. For each step in plan:
   - Spawn implementer subagent with step details
   - Wait for completion
   - Verify step (tests, linting)
2. After all steps: Proceed to Phase 4
 Phase 4: Validation
1. Spawn reviewer subagent to validate all changes
2. Report results to user
 Guidelines
- NEVER skip approval gates
- One logical change per implementer spawn
- Always verify before marking complete
- If stuck for >3 attempts, escalate to user
What you'll learn:
- Multi-phase workflow definition
- How to use custom MCP tools in agent instructions
- Subagent orchestration patterns
Step 1.4: Create Subagents
Discoverer (.opencode/agents/subagents/discoverer.md):
---
description: "Read-only codebase exploration"
model: openai/gpt-5.1-codex-mini
tools:
  - read
  - grep
  - glob
permissions:
  write: false
---
Explore the codebase to understand: {{task}}
Report findings in this format:
1. **Relevant Files**: List files that relate to the task
2. **Existing Patterns**: Code patterns that should be followed
3. **Dependencies**: External libraries/modules involved
4. **Constraints**: Technical limitations or requirements
5. **Risks**: Potential issues or complications
Be thorough but concise. Do not write code.
Planner (.opencode/agents/subagents/planner.md):
---
description: "Creates detailed implementation plans"
model: openai/gpt-5.3-codex
tools:
  - read
  - todo
---
Create an implementation plan for: {{task}}
Based on discovery findings:
{{discovery_findings}}
 Output Format (JSON)
{
  "steps": [
    {
      "id": 1,
      "description": "Step description",
      "files_to_modify": ["path/to/file"],
      "files_to_create": ["path/to/new/file"],
      "validation": "How to verify this step"
    }
  ],
  "estimated_complexity": "low|medium|high",
  "risks": ["Potential issue 1", "Potential issue 2"]
}
Implementer (.opencode/agents/subagents/implementer.md):
---
description: "Implements one logical unit of work"
model: openai/gpt-5.3-codex
tools:
  - read
  - edit
  - bash
---
Implement this step: {{step}}
Context:
- Task: {{task}}
- Discovery: {{discovery_findings}}
- Loaded Context: {{dynamic_context}}
 Guidelines
1. Follow existing code patterns
2. Make minimal, focused changes
3. Run tests/linting after changes
4. If tests fail, fix before reporting complete
5. Report: SUCCESS, PARTIAL (with blockers), or FAILED (with reason)
Reviewer (.opencode/agents/subagents/reviewer.md):
---
description: "Reviews implementation quality"
model: openai/gpt-5.1-codex-mini
tools:
  - read
  - diff
  - bash
---
Review all changes made for: {{task}}
 Checklist
- [ ] Code correctness
- [ ] Security issues
- [ ] Test coverage (if tests exist)
- [ ] Style consistency
- [ ] No unintended side effects
 Report Format
{
  "verdict": "PASS|NEEDS_FIX|REJECT",
  "issues": [
    {
      "severity": "critical|warning|note",
      "location": "file:line",
      "description": "Issue description"
    }
  ],
  "recommendations": ["Suggested improvement 1"]
}
Step 1.5: Create Context Registry
File: .opencode/harness-state/registry.yaml
# Context Registry
# Define available context types that can be dynamically loaded
version: "1.0"
last_updated: "2026-03-02"
contexts:
  # Language-specific patterns
  - id: python-patterns
    type: patterns
    path: contexts/python-patterns.md
    triggers:
      keywords: [".py", "python", "fastapi", "django", "flask"]
      file_patterns: ["*.py"]
    auto_load: false
    description: "Python coding patterns and conventions"
  - id: typescript-patterns
    type: patterns
    path: contexts/typescript-patterns.md
    triggers:
      keywords: [".ts", "typescript", "react", "node"]
      file_patterns: ["*.ts", "*.tsx"]
    auto_load: false
    description: "TypeScript/React patterns"
  # Security rules (always important)
  - id: security-critical
    type: rules
    path: contexts/security.md
    triggers:
      keywords: ["auth", "password", "token", "secret", "encrypt", "sql"]
    auto_load: true
    description: "Security rules that must always be followed"
  # Testing patterns
  - id: testing-patterns
    type: patterns
    path: contexts/testing.md
    triggers:
      keywords: ["test", "spec", "pytest", "jest", "vitest"]
      file_patterns: ["*test*", "*spec*"]
    auto_load: false
    description: "Testing conventions"
  # Architecture documentation
  - id: architecture
    type: documentation
    path: contexts/architecture.md
    triggers:
      keywords: ["architecture", "design", "structure"]
    auto_load: false
    description: "High-level architecture overview"
# Future: Vector DB configuration
vector_db:
  enabled: false
  provider: pgvector
  connection: ""
  embedding_model: ""
What you'll learn:
- How to define trigger conditions for context
- The difference between auto_load and on-demand
- Structure for future vector DB upgrade
Success Criteria
- [ ] All agent files created with proper frontmatter
- [ ] Can explain why each agent has specific tools
- [ ] Context registry defines clear trigger conditions
- [ ] No AGENTS.md bloat at project root (research-backed)
---
Phase 2: MCP Tools Implementation
Duration: 3-4 days  
Learning Goal: How to extend opencode with custom tools
Step 2.1: Set Up MCP Server Structure
File: .opencode/mcp/harness-server/package.json
{
  name: harness-mcp-server,
  version: 1.0.0,
  type: module,
  scripts: {
    build: tsc,
    start: node dist/index.js
  },
  dependencies: {
    @modelcontextprotocol/sdk: ^1.0.0,
    yaml: ^2.3.0,
    zod: ^3.22.0
  },
  devDependencies: {
    @types/node: ^20.0.0,
    typescript: ^5.0.0
  }
}
File: .opencode/mcp/harness-server/tsconfig.json
{
  compilerOptions: {
    target: ES2022,
    module: Node16,
    moduleResolution: Node16,
    outDir: ./dist,
    rootDir: ./src,
    strict: true,
    esModuleInterop: true,
    skipLibCheck: true
  }
}
Step 2.2: Implement Approval Gate Tool
File: .opencode/mcp/harness-server/src/tools/approval-gate.ts
import { z } from 'zod';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
const ApprovalGateSchema = z.object({
  phase: z.enum(['discovery', 'planning']),
  content: z.string().describe('Findings or plan to display for approval'),
  task_id: z.string().describe('Unique task identifier'),
});
type ApprovalGateInput = z.infer<typeof ApprovalGateSchema>;
interface ApprovalState {
  task_id: string;
  phase: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  user_response?: string;
}
const STATE_DIR = '.opencode/harness-state/approvals';
export function initializeApprovalGate() {
  // Ensure state directory exists
  if (!existsSync(STATE_DIR)) {
    mkdirSync(STATE_DIR, { recursive: true });
  }
}
export async function handleApprovalGate(args: ApprovalGateInput): Promise<string> {
  const { phase, content, task_id } = ApprovalGateSchema.parse(args);
  
  // Create state file
  const state: ApprovalState = {
    task_id,
    phase,
    content,
    status: 'pending',
    timestamp: new Date().toISOString(),
  };
  
  const stateFile = join(STATE_DIR, `${task_id}-${phase}.json`);
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
  
  // Format output for display
  const display = `
═══════════════════════════════════════════════════════════
🚦 APPROVAL REQUIRED: ${phase.toUpperCase()}
═══════════════════════════════════════════════════════════
${content}
═══════════════════════════════════════════════════════════
Options:
  - Type 'yes' or 'approve' to continue
  - Type 'no' or 'reject' to cancel
  - Provide feedback to revise
═══════════════════════════════════════════════════════════
`;
  
  // Return formatted string that opencode will display
  // The agent will then use the question tool or prompt user
  return display;
}
export function recordApproval(task_id: string, phase: string, approved: boolean, feedback?: string): void {
  const stateFile = join(STATE_DIR, `${task_id}-${phase}.json`);
  
  if (!existsSync(stateFile)) {
    throw new Error(`No pending approval found for task ${task_id} phase ${phase}`);
  }
  
  const state: ApprovalState = JSON.parse(readFileSync(stateFile, 'utf-8'));
  state.status = approved ? 'approved' : 'rejected';
  state.user_response = feedback;
  
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}
export function getApprovalStatus(task_id: string, phase: string): ApprovalState | null {
  const stateFile = join(STATE_DIR, `${task_id}-${phase}.json`);
  
  if (!existsSync(stateFile)) {
    return null;
  }
  
  return JSON.parse(readFileSync(stateFile, 'utf-8'));
}
What you'll learn:
- MCP tool schema definition with Zod
- File-based state persistence
- Structured approval tracking
Step 2.3: Implement Context Loader Tool
File: .opencode/mcp/harness-server/src/tools/context-loader.ts
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { join } from 'path';
const ContextLoaderSchema = z.object({
  task: z.string().describe('Task description to determine relevant context'),
  force_reload: z.boolean().optional().default(false),
});
type ContextLoaderInput = z.infer<typeof ContextLoaderSchema>;
interface ContextRegistry {
  contexts: Array<{
    id: string;
    type: string;
    path: string;
    triggers: {
      keywords?: string[];
      file_patterns?: string[];
    };
    auto_load: boolean;
    description: string;
  }>;
}
const REGISTRY_PATH = '.opencode/harness-state/registry.yaml';
const CONTEXT_BASE = '.opencode/';
export async function handleContextLoader(args: ContextLoaderInput): Promise<string> {
  const { task, force_reload } = ContextLoaderSchema.parse(args);
  
  // Load registry
  if (!existsSync(REGISTRY_PATH)) {
    return 'Error: Context registry not found. Run harness initialization.';
  }
  
  const registry: ContextRegistry = parse(readFileSync(REGISTRY_PATH, 'utf-8'));
  
  // Determine which contexts are relevant
  const relevantContexts = findRelevantContexts(task, registry);
  
  // Load context content
  const loadedContexts = relevantContexts.map(ctx => {
    const fullPath = join(CONTEXT_BASE, ctx.path);
    if (!existsSync(fullPath)) {
      return null;
    }
    
    const content = readFileSync(fullPath, 'utf-8');
    return {
      id: ctx.id,
      type: ctx.type,
      description: ctx.description,
      content: truncateIfNeeded(content),
    };
  }).filter(Boolean);
  
  // Format for agent consumption
  const output = loadedContexts.map(ctx => `
## ${ctx.id}
Type: ${ctx.type}
Description: ${ctx.description}
${ctx.content}
`).join('\n---\n');
  
  return output || 'No relevant context found.';
}
function findRelevantContexts(task: string, registry: ContextRegistry) {
  const taskLower = task.toLowerCase();
  
  return registry.contexts.filter(ctx => {
    // Auto-load contexts are always included
    if (ctx.auto_load) return true;
    
    // Check keyword triggers
    if (ctx.triggers.keywords) {
      return ctx.triggers.keywords.some(keyword => 
        taskLower.includes(keyword.toLowerCase())
      );
    }
    
    return false;
  });
}
function truncateIfNeeded(content: string, maxLength: number = 2000): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '\n... [truncated]';
}
What you'll learn:
- Keyword-based context matching (Phase 5 upgrades to semantic)
- Dynamic content loading
- Content truncation for token management
Step 2.4: Implement State Manager Tool
File: .opencode/mcp/harness-server/src/tools/state-manager.ts
import { z } from 'zod';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
const StateManagerSchema = z.object({
  operation: z.enum(['get', 'set', 'list']),
  key: z.string().optional(),
  value: z.any().optional(),
  namespace: z.string().default('default'),
});
type StateManagerInput = z.infer<typeof StateManagerSchema>;
const STATE_BASE = '.opencode/harness-state/';
export function initializeStateManager() {
  if (!existsSync(STATE_BASE)) {
    mkdirSync(STATE_BASE, { recursive: true });
  }
}
export async function handleStateManager(args: StateManagerInput): Promise<string> {
  const { operation, key, value, namespace } = StateManagerSchema.parse(args);
  
  const namespacePath = join(STATE_BASE, namespace);
  
  if (!existsSync(namespacePath)) {
    mkdirSync(namespacePath, { recursive: true });
  }
  
  switch (operation) {
    case 'get':
      return getState(namespacePath, key!);
    case 'set':
      return setState(namespacePath, key!, value);
    case 'list':
      return listState(namespacePath);
    default:
      return `Error: Unknown operation ${operation}`;
  }
}
function getState(namespacePath: string, key: string): string {
  const filePath = join(namespacePath, `${key}.json`);
  
  if (!existsSync(filePath)) {
    return `null`;
  }
  
  return readFileSync(filePath, 'utf-8');
}
function setState(namespacePath: string, key: string, value: any): string {
  const filePath = join(namespacePath, `${key}.json`);
  writeFileSync(filePath, JSON.stringify(value, null, 2));
  return `State saved: ${key}`;
}
function listState(namespacePath: string): string {
  // Implementation for listing keys
  return '[]';
}
Step 2.5: Create MCP Server Entry Point
File: .opencode/mcp/harness-server/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { handleApprovalGate, initializeApprovalGate } from './tools/approval-gate.js';
import { handleContextLoader } from './tools/context-loader.js';
import { handleStateManager, initializeStateManager } from './tools/state-manager.js';
// Initialize
initializeApprovalGate();
initializeStateManager();
// Create server
const server = new Server(
  {
    name: 'harness-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'harness-approval-gate',
        description: 'Display findings or plan and request human approval',
        inputSchema: {
          type: 'object',
          properties: {
            phase: {
              type: 'string',
              enum: ['discovery', 'planning'],
              description: 'Which phase to gate',
            },
            content: {
              type: 'string',
              description: 'Content to display for approval',
            },
            task_id: {
              type: 'string',
              description: 'Unique task identifier',
            },
          },
          required: ['phase', 'content', 'task_id'],
        },
      },
      {
        name: 'harness-context-loader',
        description: 'Dynamically load relevant context for a task',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              description: 'Task description',
            },
            force_reload: {
              type: 'boolean',
              description: 'Force reload from disk',
            },
          },
          required: ['task'],
        },
      },
      {
        name: 'harness-state-manager',
        description: 'Manage persistent state across sessions',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['get', 'set', 'list'],
            },
            key: {
              type: 'string',
            },
            value: {},
            namespace: {
              type: 'string',
            },
          },
          required: ['operation'],
        },
      },
    ],
  };
});
// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result: string;
    
    switch (name) {
      case 'harness-approval-gate':
        result = await handleApprovalGate(args as any);
        break;
      case 'harness-context-loader':
        result = await handleContextLoader(args as any);
        break;
      case 'harness-state-manager':
        result = await handleStateManager(args as any);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});
// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Harness MCP server running on stdio');
}
main().catch(console.error);
Step 2.6: Register MCP Server
Add to .opencode/opencode.json:
{
  mcpServers: {
    harness: {
      command: node,
      args: [.opencode/mcp/harness-server/dist/index.js],
      env: {}
    }
  }
}
Build the server:
cd .opencode/mcp/harness-server
npm install
npm run build
Success Criteria
- [ ] MCP server builds without errors
- [ ] All three tools registered and callable
- [ ] State persists across opencode restarts
- [ ] Can manually test each tool via opencode
---
Phase 3: Custom Commands
Duration: 2-3 days  
Learning Goal: How to create workflow commands
Step 3.1: Create Harness-Ask Command
File: .opencode/commands/harness-ask.ts
import type { Command } from 'opencode';
const command: Command = {
  name: 'harness-ask',
  description: 'Quick Q&A and single-file changes',
  
  async run({ args, agent }) {
    const question = args.join(' ');
    
    if (!question) {
      return {
        type: 'text',
        text: 'Usage: /harness-ask [your question]',
      };
    }
    
    // Determine if this should escalate to BuildAgent
    const escalationTriggers = [
      'create', 'build', 'implement', 'add feature',
      'multiple files', 'complex', 'refactor',
    ];
    
    const shouldEscalate = escalationTriggers.some(trigger => 
      question.toLowerCase().includes(trigger)
    );
    
    if (shouldEscalate) {
      return {
        type: 'text',
        text: `This looks like a complex task. Use: /harness-build ${question}`,
      };
    }
    
    // Spawn QuickAgent with the question
    return {
      type: 'agent',
      agent: 'quick-agent',
      prompt: question,
    };
  },
};
export default command;
Step 3.2: Create Harness-Build Command
File: .opencode/commands/harness-build.ts
import type { Command } from 'opencode';
const command: Command = {
  name: 'harness-build',
  description: 'Complex development with approval gates',
  
  async run({ args, agent }) {
    const task = args.join(' ');
    
    if (!task) {
      return {
        type: 'text',
        text: 'Usage: /harness-build [task description]',
      };
    }
    
    // Generate task ID
    const taskId = `task-${Date.now()}`;
    
    // Spawn BuildAgent with task context
    return {
      type: 'agent',
      agent: 'build-agent',
      prompt: `Task ID: ${taskId}
      
Complete the following task following the workflow:
1. Run discovery phase
2. Request approval on findings
3. Create implementation plan
4. Request approval on plan
5. Implement step by step
6. Validate results
Task: ${task}`,
    };
  },
};
export default command;
Step 3.3: Create Harness-Approve Command (Fallback)
File: .opencode/commands/harness-approve.ts
import type { Command } from 'opencode';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
const APPROVAL_DIR = '.opencode/harness-state/approvals';
const command: Command = {
  name: 'harness-approve',
  description: 'Approve or reject pending approval gates',
  
  async run({ args }) {
    const [taskId, phase, decision, ...feedbackParts] = args;
    const feedback = feedbackParts.join(' ');
    
    if (!taskId || !phase || !decision) {
      // List pending approvals
      if (!existsSync(APPROVAL_DIR)) {
        return {
          type: 'text',
          text: 'No pending approvals.',
        };
      }
      
      const files = readdirSync(APPROVAL_DIR);
      const pending = files
        .map(f => {
          const content = readFileSync(join(APPROVAL_DIR, f), 'utf-8');
          const state = JSON.parse(content);
          return state.status === 'pending' ? state : null;
        })
        .filter(Boolean);
      
      if (pending.length === 0) {
        return {
          type: 'text',
          text: 'No pending approvals.',
        };
      }
      
      return {
        type: 'text',
        text: pending.map(p => 
          `Task: ${p.task_id}\nPhase: ${p.phase}\nUse: /harness-approve ${p.task_id} ${p.phase} [yes|no] [feedback]`
        ).join('\n\n'),
      };
    }
    
    // Process approval
    const validDecisions = ['yes', 'approve', 'no', 'reject'];
    if (!validDecisions.includes(decision.toLowerCase())) {
      return {
        type: 'text',
        text: `Invalid decision: ${decision}. Use: yes, approve, no, or reject`,
      };
    }
    
    const approved = ['yes', 'approve'].includes(decision.toLowerCase());
    
    // Update state file
    const stateFile = join(APPROVAL_DIR, `${taskId}-${phase}.json`);
    if (!existsSync(stateFile)) {
      return {
        type: 'text',
        text: `No pending approval found for task ${taskId} phase ${phase}`,
      };
    }
    
    const state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    state.status = approved ? 'approved' : 'rejected';
    state.user_response = feedback;
    
    // Write back
    const fs = await import('fs');
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
    
    return {
      type: 'text',
      text: approved 
        ? `✅ Approved ${phase} for task ${taskId}. Agent will continue.`
        : `❌ Rejected ${phase} for task ${taskId}. Agent will revise or ask for clarification.`,
    };
  },
};
export default command;
Success Criteria
- [ ] /harness-ask routes to QuickAgent
- [ ] /harness-build spawns BuildAgent with task ID
- [ ] /harness-approve works for manual approval
- [ ] Escalation detection works for simple cases
---
Phase 4: Context Files (Minimal)
Duration: 1-2 days  
Learning Goal: What to include (and exclude) based on research
Step 4.1: Create Security Context
File: .opencode/contexts/security.md
 Security Rules
These are non-negotiable security requirements.
 Input Validation
- Always validate user input with schemas (Zod, Pydantic, etc.)
- Never trust frontend validation alone
- Sanitize all inputs before database queries
 Secrets Management
- Never commit secrets to git
- Use environment variables for all secrets
- Rotate secrets regularly
 SQL Injection Prevention
- Always use parameterized queries
- Never concatenate user input into SQL
- Use ORM methods when available
 Authentication
- Use established libraries (Passport, Auth0, etc.)
- Hash passwords with bcrypt/Argon2 (not MD5/SHA1)
- Implement rate limiting on auth endpoints
- Use JWT with secure, httpOnly cookies
If unsure about security, escalate to user.
Why this works:
- Only rules that prevent common failures
- No project-specific details (those are discoverable)
- Short enough to not bloat context
Step 4.2: Create Python Patterns Context (Optional)
File: .opencode/contexts/python-patterns.md
 Python Patterns
 Project Structure
- Use `src/` layout for packages
- Tests in `tests/` directory
- Configuration in `pyproject.toml`
 Type Hints
- Always use type hints for function signatures
- Use `Optional` for nullable types
- Import from `typing` module
 Error Handling
- Use specific exceptions, not bare `except:`
- Log errors with context before raising
- Provide helpful error messages to users
 Testing
- Use pytest
- Name tests: `test_[function_name]_[scenario]`
- Use fixtures for shared setup
Step 4.3: Create Architecture Context (If Needed)
Only create if you have specific architectural constraints that aren't obvious from the code:
 Architecture Notes
 Critical Context
- We use Clean Architecture pattern
- Domain logic in `domain/`, infrastructure in `infra/`
- Never import from infra into domain
 Database Migrations
- Use Alembic for migrations
- Always create downgrade scripts
- Test migrations on staging before prod
Success Criteria
- [ ] Context files are <100 lines each
- [ ] Only contain non-obvious rules
- [ ] Triggers in registry.yaml match content
- [ ] Can explain why each piece of context exists
---
Phase 5: Testing & Integration
Duration: 2-3 days  
Learning Goal: End-to-end validation
Step 5.1: Test QuickAgent
Test Cases:
1. Simple Q&A: "How does auth work?"
2. Single-file fix: "Fix the typo in utils.py"
3. Escalation: "Create a new feature" → Should suggest /harness-build
Step 5.2: Test BuildAgent Workflow
Test Cases:
1. Discovery approval gate
   - Run /harness-build "Add user authentication"
   - Verify discovery findings displayed
   - Approve/reject and observe behavior
2. Planning approval gate
   - After approving discovery
   - Verify plan displayed
   - Approve/reject and observe
3. Full workflow
   - Complete end-to-end task
   - Verify implementation follows plan
   - Check reviewer output
Step 5.3: Test Context Loading
Test Cases:
1. Auto-load security context for auth tasks
2. Load Python patterns for .py files
3. No context for simple Q&A
4. Verify token efficiency
Step 5.4: Monitor & Log
Check .opencode/harness-state/:
- Approval states saved correctly
- Context cache working
- Task IDs tracked
---
Phase 6: Vector DB Upgrade Path
Duration: 2-3 days (future)  
Learning Goal: Semantic context retrieval
Step 6.1: Design pgvector Schema
-- contexts table
CREATE TABLE harness_contexts (
    id SERIAL PRIMARY KEY,
    context_id VARCHAR(255) UNIQUE,
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
-- similarity search
CREATE INDEX ON harness_contexts USING ivfflat (embedding vector_cosine_ops);
Step 6.2: Upgrade Context Loader
Modify context-loader.ts:
// Check if vector DB enabled in registry
if (registry.vector_db?.enabled) {
  // Use pgvector for semantic search
  const embedding = await createEmbedding(task);
  const results = await querySimilar(embedding, limit=3);
  return formatResults(results);
} else {
  // Fall back to keyword matching
  return keywordMatching(task, registry);
}
Step 6.3: Migration Script
Create script to:
1. Embed all context files
2. Store in pgvector
3. Update registry to enable vector DB
---
Final Success Criteria
- [ ] QuickAgent: Handles Q&A and single-file changes autonomously
- [ ] BuildAgent: Full discover→plan→implement with 2 approval gates
- [ ] Subagents: Properly specialized (discoverer, planner, implementer, reviewer)
- [ ] Context: Dynamic loading with keyword matching (upgradeable to vector DB)
- [ ] State: File-based persistence working
- [ ] Research Alignment: No bloat, minimal context, fresh subagent context
- [ ] Maintainable: Clear structure, easy to customize
---
Key Design Decisions (Documented)
1. No root AGENTS.md: Research shows 20%+ cost increase without benefit
2. Two approval gates: Catch errors early (discovery) and validate approach (planning)
3. Dynamic context: Only load what's needed, when needed (MVI principle)
4. File-based state: Simple, survives restarts, easy to inspect
5. Keyword matching now: Easy to upgrade to semantic search later
6. Subagent architecture: Fresh context beats accumulated context (Anthropic research)
