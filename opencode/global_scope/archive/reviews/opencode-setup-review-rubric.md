# OpenCode Setup Review Rubric

## Purpose

Provide a consistent, evidence-driven rubric for reviewing OpenCode harness quality across global and project layers.

Baseline reference: `POST_IMPLEMENTATION_RESEARCH_AND_RECOMMENDATIONS.md`

## Scoring model

- **Status**: `PASS`, `WARN`, `FAIL`
- **Severity**: `S0` (none), `S1` (low), `S2` (medium), `S3` (high)
- **Confidence**: `High`, `Medium`, `Low`
- **Evidence requirement**: each rating must include file path and line reference.

## Evaluation dimensions

1. **Prompt clarity and collision risk**
   - Check for concise, non-overlapping directives across global prompt, agent prompt, and command layers.
   - `PASS`: directives are role-centric, mostly non-duplicative, and precedence is clear.
   - `WARN`: duplication exists but does not routinely conflict.
   - `FAIL`: repeated conflicting rules likely cause instruction collisions.
   - Baseline mapping: sections 2.1, 4.1, 5.1.

2. **Context strategy quality**
   - Check for progressive disclosure, pointer-style AGENTS, and minimal mandatory preload.
   - `PASS`: minimal always-load context with targeted retrieval guidance.
   - `WARN`: context is mostly good but includes stale placeholders or unnecessary preload.
   - `FAIL`: broad read-all preflight or large low-signal mandatory context.
   - Baseline mapping: sections 2.2, 4.2, 5.2.

3. **Command boundary clarity**
   - Check overlap among `/plan`, `/build`, `/review`, `/commit`, `/context`, `/capture`, `/audit`, `/add-context`.
   - `PASS`: responsibilities are explicit and non-overlapping.
   - `WARN`: minor overlap exists but user intent remains recoverable.
   - `FAIL`: major overlap likely triggers wrong workflow.
   - Baseline mapping: sections 3B.3, 5.3.

4. **Skills portfolio quality**
   - Check number of skills, trigger boundaries, and procedural specificity.
   - `PASS`: small curated set with clear use/do-not-use boundaries.
   - `WARN`: boundaries exist but are partially ambiguous or inconsistent with stack.
   - `FAIL`: generic umbrella skills or frequent trigger ambiguity.
   - Baseline mapping: sections 2.3, 4.3.

5. **Subagent contract quality**
   - Check if subagents have clear input expectations, output schema, and forbidden actions.
   - `PASS`: concise contracts, explicit outputs, permissions aligned to role.
   - `WARN`: contracts exist but output shape or constraints are incomplete.
   - `FAIL`: weak or inconsistent contracts likely to degrade orchestration.
   - Baseline mapping: sections 2.4, 3B.2, 4.4.

6. **Permission and safety posture**
   - Check selective autonomy, secret protections, destructive command gating.
   - `PASS`: low-risk operations are streamlined and risky operations gated.
   - `WARN`: policy is mostly safe but has friction or minor mismatch.
   - `FAIL`: unsafe broad access or excessive friction without justification.
   - Baseline mapping: sections 2.5, 4.5, 5.6.

7. **Validation and eval rigor**
   - Check whether behavior enforcement relies on tooling and measurable checks, not prompts alone.
   - `PASS`: clear validation/eval path with release-gate thinking.
   - `WARN`: partial checks exist but KPI/eval loop is weak.
   - `FAIL`: no reliable measurement loop.
   - Baseline mapping: sections 1.5-1.6, 4.6, 6, 7.

8. **Governance and maintenance operability**
   - Check weekly/biweekly/monthly cadence, pruning, and issue taxonomy workflow.
   - `PASS`: cadence and ownership are clear, practical, and measurable.
   - `WARN`: cadence exists but lacks explicit artifacts or owners.
   - `FAIL`: ad-hoc maintenance with no operational discipline.
   - Baseline mapping: sections 3, 7, 9.

## Reporting template

For each finding:

- **ID**: `GLB-01`, `PRJ-03`, etc.
- **Dimension**:
- **Status/Severity**:
- **Evidence**: `path:line`
- **Impact**:
- **Recommendation**:
- **Effort**: `Low`/`Medium`/`High`
- **Risk of change**: `Low`/`Medium`/`High`

## Severity guidelines

- **S3**: likely to cause recurring failures, unsafe actions, or major reliability loss.
- **S2**: meaningful quality/reliability drag but manageable with workarounds.
- **S1**: low-impact improvement opportunity.
- **S0**: no issue.
