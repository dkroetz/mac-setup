# From Prompt Chaos to Measured Agent Engineering

## Slide 1 - Title / Positioning

**From Prompt Chaos to Measured Agent Engineering**

How I set up an AI coding-agent framework, validated it on real work, and built a path for what comes next.

Speaker notes:
- This is not a "cool prompt" story.
- This is a systems-engineering story: architecture, controls, and measurable outcomes.
- Goal: show a practical path that skeptical teams can trust.

---

## Slide 2 - The Problem We Actually Had

**Observed team pain (industry + local reality):**
- AI helps ship faster, but can increase rework/churn in non-trivial codebases.
- Prompt-heavy setups become brittle when guidance is duplicated across files.
- Context overload raises cost and lowers focus.
- "Trust the model" is not an operating model for production engineering.

Speaker notes:
- The question was not "can AI write code?".
- The question was "can we get repeatable quality and lower intervention in real repositories?".

---

## Slide 3 - Design Principles (What We Optimized For)

**Non-negotiables:**
1. Keep AGENTS files lean and pointer-based, not encyclopedic.
2. Prefer 2-3 focused human-authored skills over many generic skills.
3. Use progressive disclosure for context.
4. Keep read operations easy; gate writes and risky operations.
5. Enforce with tooling/evals/permissions, not natural language alone.
6. Measure before and after any meaningful harness change.

Speaker notes:
- These came from both research and practical trial.
- We designed for a balanced middle: reliability + speed/cost.

References:
- `archive/OPUS_FINAL_PLAN.md`
- `archive/AGENT_REFINEMENT_PLAN.md`

---

## Slide 4 - Timeline: What Was Done, In Which Order

**Phase timeline (branch history):**
- **Mar 1**: bootstrap/import and stabilization.
- **Mar 2**: first end-to-end harness build (Phases 1-8).
- **Mar 3**: formal refinement pass with human-gated phases (0-7), eval harness, release gate, rollout docs.

**Representative commits:**
- `7556f97` Phase 1 - Harness Foundation
- `bd2f35a` Phase 2 - Custom Subagents
- `1172eb1` Phase 3 - Project template
- `5a19089` Phase 4 - Custom Skills
- `b080216` Phase 5 - Commands
- `af644a1` Phase 7 - Plugins
- `e7dc8c3` Phase 0 & 1 refinement artifacts
- `d86884f` Phase 6 - Agent evals
- `d191ed6` Phase 7 - Report

Speaker notes:
- The important point: this was phased, explicit, and auditable.
- Not one big "prompt dump".

---

## Slide 5 - Architecture We Ended Up With

**Global harness (`~/.config/opencode`):**
- Primary agents: `scout` (fast/light), `engineer` (complex tasks).
- Subagents: `discoverer`, `planner`, `implementer`, `reviewer`, `context-auditor`.
- Skills: `code-quality`, `git-workflow`, `project-setup`.
- Commands: `/plan`, `/build`, `/review`, `/commit`, `/context`, `/audit`, `/capture`.
- Plugins: session notifications + sensitive file protection.

**Project layer (`~/Projects/futilify`):**
- Lean project AGENTS contract.
- `.agents/context/project-intelligence.md` as high-signal baseline.
- Architecture context loaded conditionally, not by default.

Speaker notes:
- This is config-first and markdown-first.
- Easy to inspect, diff, and reason about.

References:
- `archive/agent-refinement-final-report.md`
- `~/Projects/futilify/AGENTS.md`

---

## Slide 6 - The Key Shift: Prompts -> Contracts

**What changed:**
- Reduced prompt overlap with a single source-of-truth matrix.
- Added explicit subagent I/O contracts and forbidden actions.
- Clarified command boundaries to reduce workflow ambiguity.

**Why it matters:**
- Better orchestration predictability.
- Lower instruction collision risk.
- Easier maintenance when the system grows.

References:
- `archive/prompt-responsibility-matrix.md`
- `archive/subagent-contracts.md`
- `archive/skills-eval-report.md`

---

## Slide 7 - Safety and Autonomy Model

**Balanced permission profile:**
- Keep `edit`/`write` gated (`ask`).
- Allow safe, high-frequency checks (`pytest`, `mypy`, `ruff check`, read-only git).
- Keep destructive or broad shell behaviors gated.

Speaker notes:
- This reduced friction where risk is low, without opening unsafe paths.
- Safety posture is policy-backed, not vibe-backed.

Reference:
- `archive/permission-profile-balanced.json`

---

## Slide 8 - Validation System (The Skeptic's Core Ask)

**Built a repeatable eval harness:**
- Benchmark manifest and rubric.
- Deterministic checks + before/after comparison scripts.
- Machine-checkable release gate.

**Gate policy:**
1. No success-rate regression.
2. Token growth <= 10%.
3. Intervention count reduced or stable.

References:
- `agent-evals/README.md`
- `archive/release-gate.md`
- `agent-evals/release-gate.json`

---

## Slide 9 - Pilot Results (futilify)

**Measured deltas:**
- Success rate: **0.833 -> 0.917** (+8.3pp)
- Token total: **17860 -> 16790** (-5.99%)
- Human interventions: **10 -> 5**
- Time to first meaningful edit: **137.1s -> 120.4s**
- Post-first-pass fix rate: **0.417 -> 0.167**
- Release gate: **passed = true**

Speaker notes:
- Better quality and better efficiency at the same time.
- This is what convinced me the approach was operationally viable.

References:
- `agent-evals/results/comparison.json`
- `agent-evals/results/release-gate-result.json`

---

## Slide 10 - Honest Gaps / Open Findings

**Not "done", but controlled:**
- Global findings still flag some collision/safety hardening opportunities.
- `/commit` guardrail enforcement can be tightened further.
- Bash allowlist can be narrowed to align with tool-preference discipline.
- Cross-repo language neutrality in global AGENTS should improve.

Speaker notes:
- A mature system reports its own weaknesses.
- We already have prioritized remediation and rollback guidance.

References:
- `archive/reviews/global-setup-findings.md`
- `archive/reviews/opencode-review-recommendations.md`

---

## Slide 11 - 90-Day Roadmap (What Comes Next)

**0-2 weeks (stabilize):**
- Apply highest-value low-risk recommendations.
- Keep architecture stable; avoid adding new skills/agents.

**2-6 weeks (tune):**
- Skill trigger precision checks (FP/FN tracking).
- Contract hardening + command overlap linting.

**6-12 weeks (controlled expansion):**
- Roll out to 2-3 more repos using same baseline + gate policy.
- Weekly maintenance cadence per repo.

References:
- `archive/rollout-checklist.md`
- `archive/maintenance-playbook.md`
- `POST_IMPLEMENTATION_RESEARCH_AND_RECOMMENDATIONS.md`

---

## Slide 12 - Anticipated Skeptic Questions (With Answers)

**Q1: "Isn't this just prompt engineering theater?"**
- No; behavior is constrained by permissions, command boundaries, tests, and release gates.

**Q2: "Will this create more process overhead than value?"**
- Weekly cadence is lightweight and one-change-at-a-time; pilot showed lower intervention/rework.

**Q3: "What if improvements don't generalize beyond one repo?"**
- That's why Stage 3 rollout explicitly requires multi-repo validation before broad adoption.

**Q4: "How do we avoid lock-in to one person's setup?"**
- Everything is versioned, documented, and reviewable in markdown/config artifacts.

---

## Slide 13 - Call to Action

**Proposal for the team:**
1. Adopt the harness in one additional repo as a controlled pilot.
2. Reuse the same benchmark manifest shape and release gate policy.
3. Review results after 4 weeks, then decide scale-up.

**Decision criterion:**
- If success/intervention/rework trends hold or improve, expand.
- If not, roll back latest refinement set and iterate.

Speaker notes:
- This keeps us empirical, reversible, and low-drama.

---

## Appendix - Source List for References Slide

**Internal artifacts:**
- `archive/AGENT_REFINEMENT_PLAN.md`
- `archive/AGENT_REFINEMENT_EXECUTION_SPEC.md`
- `archive/agent-refinement-final-report.md`
- `archive/baseline-report.md`
- `archive/benchmark-task-set.md`
- `archive/release-gate.md`
- `archive/prompt-responsibility-matrix.md`
- `archive/subagent-contracts.md`
- `archive/skills-eval-report.md`
- `archive/maintenance-playbook.md`
- `archive/rollout-checklist.md`
- `archive/reviews/global-setup-findings.md`
- `archive/reviews/cross-layer-consistency-matrix.md`
- `archive/reviews/opencode-review-recommendations.md`
- `agent-evals/results/comparison.json`
- `agent-evals/results/release-gate-result.json`
- `~/Projects/futilify/AGENTS.md`
- `~/Projects/futilify/.agents/context/project-intelligence.md`

**External references used in plan/research docs:**
- SkillsBench: https://arxiv.org/abs/2602.12670
- Evaluating AGENTS.md / AGENTbench-style context-file study: https://arxiv.org/abs/2602.11988
- Anthropic: Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
- OpenAI Codex AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- OpenAI Codex Skills: https://developers.openai.com/codex/skills
- OpenAI Codex Multi-agents: https://developers.openai.com/codex/concepts/multi-agents
- OpenAI skills + shell tips: https://developers.openai.com/blog/skills-shell-tips
- OpenAI eval skills: https://developers.openai.com/blog/eval-skills
- OpenAI Codex prompting guide: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
