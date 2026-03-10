# Global Setup Findings (`~/.config/opencode`)

Rubric reference: `archive/reviews/opencode-setup-review-rubric.md`
Baseline reference: `POST_IMPLEMENTATION_RESEARCH_AND_RECOMMENDATIONS.md`
Review date: 2026-03-03

## Dimension scorecard

1. Prompt clarity and collision risk: `WARN (S2)`
2. Context strategy quality: `PASS (S0)`
3. Command boundary clarity: `PASS (S0)`
4. Skills portfolio quality: `PASS (S0)`
5. Subagent contract quality: `WARN (S1)`
6. Permission and safety posture: `WARN (S2)`
7. Validation and eval rigor: `WARN (S2)`
8. Governance and maintenance operability: `PASS (S1)`

## Findings

### GLB-01
- **Dimension**: Prompt clarity and collision risk
- **Status/Severity**: `WARN / S2`
- **Evidence**:
  - `AGENTS.md:7`
  - `AGENTS.md:8`
  - `AGENTS.md:10`
- **Impact**: Global AGENTS enforces Python-specific validation for all projects; this can conflict with non-Python repos and create avoidable instruction collisions.
- **Recommendation**: Scope language/tooling directives by project type or move strict Python quality rules into project AGENTS/skills only when applicable.
- **Effort**: Low
- **Risk of change**: Low

### GLB-02
- **Dimension**: Permission and safety posture
- **Status/Severity**: `WARN / S2`
- **Evidence**:
  - `opencode.json:10`
  - `opencode.json:14`
  - `opencode.json:15`
  - `opencode.json:38`
- **Impact**: Allowed bash patterns include broad shell commands (`grep *`, `find *`, `head *`) that increase drift from preferred specialized tools and may increase noisy exploration.
- **Recommendation**: Tighten allow-list to high-frequency, low-risk commands that align with desired tool use, and keep broad shell patterns gated.
- **Effort**: Low
- **Risk of change**: Low

### GLB-03
- **Dimension**: Validation and eval rigor
- **Status/Severity**: `WARN / S2`
- **Evidence**:
  - `commands/commit.md:12`
  - `commands/commit.md:16`
  - `skills/git-workflow/SKILL.md:41`
  - `skills/code-quality/SKILL.md:22`
- **Impact**: `/commit` command does not require quality gates before commit, while skills document those checks; this weakens enforcement and can permit lower-confidence commits.
- **Recommendation**: Update `/commit` command to run or verify lint/type/test checks before committing, with skip rationale only when explicitly requested.
- **Effort**: Low
- **Risk of change**: Medium

### GLB-04
- **Dimension**: Subagent contract quality
- **Status/Severity**: `WARN / S1`
- **Evidence**:
  - `agents/subagents/reviewer.md:5`
  - `agents/subagents/reviewer.md:8`
  - `agents/subagents/reviewer.md:20`
- **Impact**: Reviewer subagent denies edit/write but does not explicitly deny bash; output format is defined, but forbidden actions are only partially explicit.
- **Recommendation**: Add explicit `bash: deny` in reviewer permissions and optional concise output schema fields for deterministic orchestration.
- **Effort**: Low
- **Risk of change**: Low

### GLB-05
- **Dimension**: Permission and safety posture
- **Status/Severity**: `WARN / S1`
- **Evidence**:
  - `plugins/env-protection.ts:5`
  - `plugins/env-protection.ts:6`
- **Impact**: Sensitive-path regex is useful but narrow (case-sensitive extension match and limited naming variants), which may miss some sensitive files.
- **Recommendation**: Harden sensitive-file matching (case-insensitive and broader pattern set) and add minimal tests/examples for blocked paths.
- **Effort**: Medium
- **Risk of change**: Low

### GLB-06
- **Dimension**: Command boundary clarity
- **Status/Severity**: `PASS / S0`
- **Evidence**:
  - `commands/plan.md:8`
  - `commands/build.md:8`
  - `commands/context.md:8`
  - `commands/add-context.md:8`
- **Impact**: Command responsibilities are clearly delineated with explicit "use when" and "do not use when" boundaries.
- **Recommendation**: Keep as-is; retain periodic boundary audits.
- **Effort**: None
- **Risk of change**: None

### GLB-07
- **Dimension**: Skills portfolio quality
- **Status/Severity**: `PASS / S0`
- **Evidence**:
  - `skills/git-workflow/SKILL.md:8`
  - `skills/code-quality/SKILL.md:8`
  - `skills/project-setup/SKILL.md:8`
- **Impact**: Skill set is intentionally small and each skill has trigger boundaries and procedural guidance.
- **Recommendation**: Keep current count stable and tune based on measured trigger precision only.
- **Effort**: None
- **Risk of change**: None

### GLB-08
- **Dimension**: Governance and maintenance operability
- **Status/Severity**: `PASS / S1`
- **Evidence**:
  - `MAINTENANCE.md:5`
  - `MAINTENANCE.md:176`
  - `MAINTENANCE.md:184`
  - `MAINTENANCE.md:190`
- **Impact**: Weekly/monthly/quarterly rhythm is documented and practical.
- **Recommendation**: Add explicit KPI snapshot artifact location to improve traceability.
- **Effort**: Low
- **Risk of change**: Low

## Global summary

The global harness is well-structured and close to best-practice alignment. Main improvement opportunities are reducing cross-project prompt collisions (Python-global directives), tightening shell permission patterns, and turning commit quality guidance into stronger enforced workflow.
