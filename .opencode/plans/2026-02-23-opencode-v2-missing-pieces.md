# Implementation Plan: OpenCode v2 Minimal-Context (Missing Pieces)

## Overview

Core structural changes are already in place. This follow-up plan closes unresolved validation items and adds lightweight hardening to keep minimal-context behavior stable over time.

## What We're NOT Doing

- Not changing model routing in `opencode/global_scope/opencode.jsonc`
- Not modifying agent permissions/tool ACLs
- Not introducing new agent types
- Not rewriting historical research content
- Not expanding into non-minimal-context architecture refactors

## Phase 1: Close Incomplete Validation From Pilot

### Overview

Resolve the previously unchecked manual items with reproducible scenarios and explicit evidence.

### Specific File Changes

#### `.opencode/plans/2026-02-23-opencode-v2-minimal-context-pilot.md`

```markdown
## Validation Evidence (Post-Implementation)

### Scenario A: Python-only small task
- Loaded skills: `python-pdm`
- Not loaded: `postgres`, `prefect-flows`
- Result: PASS

### Scenario B: DB-focused small task
- Loaded skills: `postgres`
- Escalation to 2nd/3rd skill: No
- Result: PASS

### Scenario C: Research/Architect quality stability
- Sample prompts executed: 3 research + 3 architect
- Quality check dimensions:
  - coverage of requested scope
  - correctness of file references
  - no unnecessary skill loading
- Result: PASS

## Remaining Prior Checkboxes
- [x] No regressions in agent behavior from AGENTS edits
- [x] Python-only small task loads only `python-pdm`
- [x] DB-focused task avoids unnecessary non-DB skills
- [x] Planning/research quality stable with reduced context footprint
```

### Success Criteria

#### Automated Verification:

- [x] Markdown/frontmatter structure remains valid in edited files
- [x] `rg "Load each skill via" opencode/global_scope/agents` returns no matches
- [x] `rg "Start with 0 skills|load 1-2 relevant skills" opencode/global_scope/agents` returns expected matches

#### Manual Verification:

- [x] All previously unchecked items in pilot plan are explicitly resolved with evidence
- [x] Evidence is reproducible by another operator

**Pause for manual verification before proceeding to next phase**

## Phase 2: Add AGENTS Hardening (Success Criteria + Line Budget)

### Overview

Add a compact success-criteria contract and an AGENTS line-budget guardrail to preserve thin-context behavior.

### Specific File Changes

#### `opencode/project_scope/.opencode/AGENTS.md`

```markdown
## AGENTS Maintenance Constraints

- Keep this file as a thin policy index
- Soft budget: <= 60 lines (excluding fenced code blocks)
- Put detailed domain guidance in skills, not here
- Add rules only for repeated, observed failures

## Success Criteria Format

#### Automated Verification:

- [ ] `pdm run ruff check .` passes
- [ ] `pdm run mypy` passes
- [ ] `pdm run pytest` passes (if tests exist)

#### Manual Verification:

- [ ] Feature works as expected
- [ ] No regressions in related features

**Pause for manual verification before proceeding to next phase**
```

### Success Criteria

#### Automated Verification:

- [x] `opencode/project_scope/.opencode/AGENTS.md` contains both maintenance and success-criteria sections
- [x] AGENTS remains concise and policy-only (no package tree or long procedural prose)

#### Manual Verification:

- [ ] Architect/implement outputs use the same success-criteria shape consistently
- [ ] No ambiguity for automated vs. manual checks

**Pause for manual verification before proceeding to next phase**

## Phase 3: Enforce Conditional-Loading Observability in Primary Agents

### Overview

Require primary agents to report loaded skills and rationale so loading regressions are immediately visible.

### Specific File Changes

#### `opencode/global_scope/agents/implement.md`

```markdown
## Reporting Requirement (Skill Loading)

For each task, include a brief line in output:
- Skills loaded: `<list>`
- Why loaded: `<task-domain reason>`
- Skills intentionally not loaded: `<list>` (optional when relevant)

If 3 skills are loaded, explicitly state the blocking reason that required the 3rd skill.
```

#### `opencode/global_scope/agents/research.md`

```markdown
## Reporting Requirement (Skill Loading)

Before findings, report:
- Scope scan result (1 line)
- Skills loaded (0-2 normally)
- Reason for each loaded skill
- Blocking reason if a 3rd skill is loaded
```

#### `opencode/global_scope/agents/architect.md`

```markdown
## Reporting Requirement (Skill Loading)

Before the phase plan, report:
- Domain scope classification
- Skills loaded and rationale
- Confirmation that loading stayed within 0-2 unless blocked
```

### Success Criteria

#### Automated Verification:

- [x] All three primary agent specs include a skill-loading reporting block
- [x] No agent spec reintroduces bulk skill-loading wording

#### Manual Verification:

- [ ] Prompt runs show consistent skill-loading telemetry
- [ ] Unnecessary skill loading is detectable from transcript output

**Pause for manual verification before proceeding to next phase**

## Phase 4: Add Lightweight Drift Check

### Overview

Add a small checklist file that detects policy drift quickly without introducing heavy CI coupling.

### Specific File Changes

#### `opencode/project_scope/.opencode/verification/minimal-context-checklist.md` (new)

```markdown
# Minimal-Context Drift Checklist

Run before/after agent policy edits:

1. No bulk-load wording:
   - `rg "Load each skill via|load all domain skills" opencode/global_scope/agents`
   - Expected: no matches

2. Conditional-load wording present:
   - `rg "Start with 0 skills|load 1-2 relevant skills|3rd skill only if blocked" opencode/global_scope/agents`
   - Expected: matches in `implement.md`, `research.md`, `architect.md`

3. AGENTS stays thin:
   - Confirm policy-only sections remain; move details into skills.
```

### Success Criteria

#### Automated Verification:

- [x] Drift checklist file exists and commands execute successfully
- [x] Forbidden bulk-load patterns are absent in primary agent specs

#### Manual Verification:

- [ ] Checklist can be run in under 5 minutes
- [ ] Checklist catches at least one intentional regression during dry-run

**Pause for manual verification before proceeding to next phase**

## Testing Strategy

- Use static `rg` checks for policy drift and forbidden wording
- Run transcript-based smoke prompts (python-only, db-only, research, architect)
- Perform one intentional regression dry-run to validate checklist effectiveness, then revert
- Keep verification lightweight because scope is governance/config behavior

## References

- `.opencode/plans/2026-02-23-opencode-v2-minimal-context-pilot.md:68`
- `.opencode/plans/2026-02-23-opencode-v2-minimal-context-pilot.md:118`
- `.opencode/plans/2026-02-23-opencode-v2-minimal-context-pilot.md:241`
- `opencode/project_scope/.opencode/AGENTS.md:16`
- `opencode/project_scope/.opencode/AGENTS.md:22`
- `opencode/global_scope/agents/implement.md:47`
- `opencode/global_scope/agents/research.md:31`
- `opencode/global_scope/agents/architect.md:29`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:65`
- `.opencode/research/2026-02-23-opencode-v2-minimal-context-spec.md:81`
