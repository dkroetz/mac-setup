# OpenCode Review Recommendations

Inputs:
- `archive/reviews/global-setup-findings.md`
- `archive/reviews/cross-layer-consistency-matrix.md`
- `~/Projects/futilify/.agents/context/plans/active/futilify-opencode-audit-findings.md`

Review date: 2026-03-03

## Now (0-2 weeks)

1. **Remove mandatory architecture preload in project config**
   - Target: `~/Projects/futilify/.opencode/opencode.json`
   - Why: resolves highest-severity context collision (CL-01 / PRJ-01).
   - Expected impact: lower context overhead and fewer contradictory preflight behaviors.
   - Effort: Low
   - Change risk: Low
   - Rollback: restore original `instructions` entry if retrieval quality unexpectedly drops.

2. **Replace placeholder project architecture document with real architecture**
   - Target: `~/Projects/futilify/.agents/context/architecture.md`
   - Why: current template text can mislead agent reasoning when architecture context is loaded.
   - Expected impact: better cross-module planning accuracy.
   - Effort: Medium
   - Change risk: Low
   - Rollback: keep previous file in git history; reintroduce sections incrementally if needed.

3. **Strengthen `/commit` guardrails**
   - Target: `~/.config/opencode/commands/commit.md`
   - Why: close enforcement gap between skill recommendations and commit command behavior.
   - Expected impact: fewer low-confidence commits and reduced rework.
   - Effort: Low
   - Change risk: Medium (may increase friction slightly).
   - Rollback: fallback to current lightweight commit flow for emergency/quick tasks.

## Near-term (2-6 weeks)

4. **Soften global Python-only AGENTS directives to avoid cross-project collisions**
   - Target: `~/.config/opencode/AGENTS.md`
   - Why: reduce instruction collision in non-Python repositories while preserving project-specific rigor.
   - Expected impact: higher instruction applicability across varied stacks.
   - Effort: Low
   - Change risk: Low
   - Rollback: revert to current language if quality falls in Python-heavy workflows.

5. **Tighten bash allow-list to align with preferred specialized tools**
   - Target: `~/.config/opencode/opencode.json`
   - Why: reduce noisy shell usage and preserve selective autonomy model.
   - Expected impact: improved consistency and lower tool-drift risk.
   - Effort: Low
   - Change risk: Medium (some tasks may prompt for approval more often).
   - Rollback: re-allow individual command patterns based on observed friction data.

6. **Harden reviewer subagent contract**
   - Target: `~/.config/opencode/agents/subagents/reviewer.md`
   - Why: make read-only behavior explicit and deterministic.
   - Expected impact: clearer orchestration and safer delegated review behavior.
   - Effort: Low
   - Change risk: Low
   - Rollback: remove stricter restriction if review capability becomes unnecessarily constrained.

## Later (6-12 weeks)

7. **Add lightweight skill trigger precision checks**
   - Targets: `~/.config/opencode/skills/*/SKILL.md`, benchmark prompt set artifact
   - Why: validate FP/FN rates before adding more skills.
   - Expected impact: improved trigger reliability and reduced misfires.
   - Effort: Medium
   - Change risk: Low
   - Rollback: keep existing skill triggers if test suite is noisy.

8. **Add release-gate checklist for command/prompt/config changes**
   - Targets: `~/.config/opencode/MAINTENANCE.md` (or dedicated release-gate doc)
   - Why: operationalize one-change-at-a-time governance and measurable rollouts.
   - Expected impact: lower regression risk during harness evolution.
   - Effort: Medium
   - Change risk: Low
   - Rollback: use monthly governance rhythm without strict gate if overhead is too high.

## Implementation notes

- Apply changes in the order listed to avoid confounding effects.
- Capture baseline KPI snapshot before item 1.
- Re-check top failure taxonomy after each phase (context miss, prompt conflict, wrong trigger, delegation mismatch, permission friction, validation gap).
