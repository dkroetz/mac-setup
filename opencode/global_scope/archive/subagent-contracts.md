# Subagent Contracts

Date: 2026-03-03
Phase: 2 (Subagent Normalization)

## Permission Boundaries

| Subagent | edit | write | bash | Boundary intent |
|---|---|---|---|---|
| `discoverer` | deny | deny | deny | Read-only discovery via non-writing tools |
| `context-auditor` | deny | deny | deny | Read-only context validation |
| `planner` | deny | deny | deny | Plan generation only |
| `reviewer` | deny | deny | default | Quality review only; no file mutation |
| `implementer` | allowed by parent gates | allowed by parent gates | allowed by parent gates | Focused implementation with normal validation |

Notes:
- `discoverer`, `planner`, and `context-auditor` are explicitly no-write/no-edit.
- `reviewer` is explicitly no-write/no-edit.
- `implementer` is the only writing subagent and remains constrained by existing parent permission gates.

## I/O Contracts

### `discoverer`
- **Input**: task goal, scope, likely modules, required context paths
- **Output**: `Relevant files`, `Observed patterns`, `Constraints`, `Open questions`
- **Non-goals**: no implementation and no file writes

### `context-auditor`
- **Input**: task summary, consulted context list, project constraints
- **Output**: `Coverage status`, `Missing context`, `Unnecessary context`, `Recommended preflight`
- **Non-goals**: no implementation and no file writes

### `planner`
- **Input**: discovery findings and target outcome
- **Output**: numbered implementation steps with files, validation, complexity, risks, dependencies
- **Non-goals**: no code edits and no file writes

### `implementer`
- **Input**: one scoped plan step and acceptance criteria
- **Output**: `SUCCESS`, `PARTIAL`, or `FAILED` plus changed-surface notes and validation result
- **Non-goals**: avoid unrelated refactors or broad speculative changes

### `reviewer`
- **Input**: diff or changed-files context and review focus
- **Output**: `PASS`, `NEEDS_FIX`, or `REJECT` with actionable findings
- **Non-goals**: no implementation and no file writes
