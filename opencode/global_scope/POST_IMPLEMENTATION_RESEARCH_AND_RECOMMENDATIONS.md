# Post-Implementation Research and Recommendations

This document summarizes what to do after implementing the refinement plan and distills practical research-backed guidance on coding-agent behavior, context building, skills, and agent configuration.

---

## 1) Executive Takeaways

1. Keep the system simple and legible. Reliability usually drops when prompts, skills, and context layers overlap or conflict.
2. Context quality beats context quantity. Short, precise, retrieval-friendly context generally outperforms large mandatory preload bundles.
3. A small set of strong skills (human-authored, procedural, bounded trigger scope) is better than many generic skills.
4. Use subagents to isolate noisy work (exploration/log triage/test output) from the main decision thread.
5. Enforce behavior with tooling and gates (lint/tests/evals/permissions), not only with natural-language instructions.
6. Evaluate continuously. Prompt and config changes should be treated like code changes with measurable regression checks.

---

## 2) What Research Suggests About Coding Agent Behavior

## 2.1 Prompting and behavior control

- Long prompts with many prohibitions and duplicate rules increase instruction collision risk.
- Models follow high-priority constraints better when instructions are:
  - concise,
  - non-overlapping,
  - tied to concrete tool behavior,
  - and reinforced by validation steps.
- "Do not do X" works best when paired with a positive alternative ("Use Y instead") and tooling guardrails.

Implication:
- Keep primary agent prompts role-based and brief.
- Move workflows to skills/commands; move enforcement to tests/lints/permissions.

## 2.2 Context management and degradation

- As sessions accumulate logs and intermediate artifacts, context pollution/rot risk increases.
- Performance tends to degrade when the main thread carries too much low-signal detail.
- Progressive disclosure (small map -> targeted retrieval) is more stable than up-front bulk context loading.

Implication:
- Keep AGENTS/context files pointer-oriented.
- Use subagents for heavy read/search/test tasks, return summaries to main thread.
- Use compaction/summarization patterns for long trajectories.

## 2.3 Skills effectiveness

- Curated, moderate-length, procedural skills have measurable upside.
- Auto-generated or generic skills show weak gains and can add noise.
- Trigger quality depends heavily on clear name/description boundaries.

Implication:
- Keep a small skill portfolio.
- Explicitly include "use when" and "do not use when" in each skill.
- Evaluate trigger precision with positive/negative prompt sets.

## 2.4 Multi-agent orchestration

- Delegation helps when subtasks are separable and mostly read-heavy.
- Write-heavy parallel edits can add merge/conflict overhead.
- Subagent output contracts matter: predictable output shape improves orchestration.

Implication:
- Use parallelism for exploration and analysis.
- Keep implementation mostly single-threaded or tightly scoped.

## 2.5 Autonomy and permissioning

- Overly strict permission prompts reduce throughput; fully open write/bash raises safety and drift risk.
- Selective autonomy (allow safe repetitive commands, gate risky actions) is a robust middle ground.

Implication:
- Keep write/edit/destructive ops gated.
- Allow read-only git/discovery and quality commands where safe.

---

## 3) Recommended Next Steps After Current Implementation

## Phase A (Now -> 2 weeks): Stabilize and measure

1. Freeze architecture for one short cycle
- Avoid adding new agents/skills immediately.
- Focus on observing real usage traces.

2. Run benchmark set and collect data
- Re-run baseline tasks from pre-implementation.
- Capture:
  - completion success,
  - intervention count,
  - elapsed time,
  - token usage,
  - post-hoc fixes.

3. Build issue taxonomy
- Tag failures as one of:
  - context miss,
  - prompt conflict,
  - wrong skill trigger,
  - over/under delegation,
  - permission friction,
  - validation gap.

4. Ship only high-confidence fixes
- Prioritize changes that resolve repeated failures (>= 3 occurrences).

## Phase B (2 -> 6 weeks): Tune triggers and contracts

1. Skill trigger precision pass
- For each skill create 10-20 prompt cases:
  - positives (should trigger),
  - negatives (should not trigger).
- Track false-positive and false-negative rates.

2. Subagent contract hardening
- Ensure each subagent has:
  - clear input expectations,
  - strict output schema,
  - explicit forbidden actions.
- Add simple response templates where useful.

3. Command de-duplication
- Ensure `/plan`, `/build`, `/review`, `/commit`, `/context`, `/audit`, `/capture` have non-overlapping responsibilities.

4. Permission profile optimization
- Keep balanced defaults.
- Relax only where friction is frequent and risk is low.

## Phase C (6 -> 12 weeks): Controlled expansion

1. Add at most one new subagent only if data justifies it
- Candidate: `context-auditor` if stale/contradictory context remains a top failure source.

2. Add at most one new skill only if repeated procedure failures persist
- Avoid growing skill count without clear measured gains.

3. Introduce release gates for prompt/config changes
- No prompt/skill/command change merges without eval delta report.

---

## 4) Practical Recommendations by Layer

## 4.1 Primary agent prompts

Do:
- Keep prompts short, role-centric, and action-oriented.
- Define delegation criteria and completion criteria.
- Prefer positive directives over extensive prohibitions.

Avoid:
- Embedding detailed workflows already encoded in commands/skills.
- Repeating the same instruction in global + project + command layers.

## 4.2 Project context files (AGENTS + context docs)

Do:
- Keep AGENTS as a navigation/index file.
- Store architecture "why" in architecture docs.
- Keep gotchas limited to persistent, high-cost confusion.

Avoid:
- Mandatory read-all preflight constraints.
- Discoverable code facts duplicated in docs.

## 4.3 Skills

Do:
- Keep each skill single-purpose.
- Include explicit boundaries and deterministic steps.
- Keep moderate length and concrete outputs.

Avoid:
- Generic umbrella skills ("do everything").
- Trigger descriptions that overlap heavily.

## 4.4 Subagents

Do:
- Use read-only subagents for exploration/planning/review where possible.
- Require concise structured outputs from subagents.
- Keep write-capable subagents focused on one logical unit.

Avoid:
- Parallel write-heavy subtasks with unclear ownership.

## 4.5 Permissions and safety

Do:
- Keep destructive commands explicitly gated.
- Allow low-risk repetitive commands for speed.
- Keep secret-file protections and path-based safeguards.

Avoid:
- Global broad allow policies without task-level constraints.

## 4.6 Validation and evals

Do:
- Treat harness changes like software releases.
- Use deterministic checks + rubric checks.
- Keep benchmark suite stable and versioned.

Avoid:
- Prompt tweaks based purely on anecdotal one-off sessions.

---

## 5) Common Failure Modes and Mitigations

1. Prompt collisions
- Symptom: agent alternates between conflicting instructions.
- Fix: create single source of truth matrix and remove duplicates.

2. Context bloat
- Symptom: slower runs, weaker focus, rising token costs.
- Fix: reduce always-loaded context; route retrieval via pointers/subagents.

3. Skill over-triggering
- Symptom: wrong procedural workflow activated.
- Fix: tighten description boundaries and add negative trigger tests.

4. Under-delegation
- Symptom: main agent overloaded with noisy exploration logs.
- Fix: delegate read-heavy tasks to discoverer/reviewer style agents.

5. Over-delegation
- Symptom: fragmented workflow and slow coordination.
- Fix: keep small subagent set and clear invocation criteria.

6. Permission drag
- Symptom: repetitive asks for safe commands.
- Fix: selective allow-list for safe/high-frequency commands.

---

## 6) Suggested KPI Dashboard

Track weekly and monthly:

- Success rate by task type (bugfix/feature/refactor/review)
- Median time to first meaningful edit
- Median total task duration
- Input/output/reasoning token trend
- Human intervention rate (asks/blockers per task)
- Rework rate (changes requiring second corrective pass)
- Skill trigger precision (FP/FN per skill)
- Subagent usage quality (invocation usefulness score)

Target direction over 4-8 weeks:

- Success: up or stable
- Time: down
- Tokens: down or stable with quality gains
- Interventions: down
- Rework: down

---

## 7) Suggested Governance Rhythm

Weekly (30 min)
- Run `/audit` on active project contexts.
- Review top 3 failed traces.
- Make at most one harness change (prompt/skill/command).

Biweekly (60 min)
- Run benchmark subset and compare against last checkpoint.
- Update risk register and failure taxonomy counts.

Monthly (90 min)
- Full benchmark run.
- Evaluate whether any new skill/subagent is warranted.
- Prune stale context and obsolete commands.

---

## 8) What Not To Do Next

- Do not add many new skills/subagents immediately after rollout.
- Do not enforce broad "read everything first" rules globally.
- Do not replace tooling validation with prompt-only constraints.
- Do not optimize solely for token reduction at the cost of correctness.
- Do not modify multiple control layers at once without eval checkpoints.

---

## 9) 90-Day Suggested Roadmap

Days 1-14
- Stabilize current setup.
- Collect baseline vs post-implementation deltas.

Days 15-45
- Fix top recurring failure class.
- Tune skill triggers and subagent output contracts.

Days 46-90
- Introduce one controlled expansion (if justified by data).
- Lock release gates and maintenance cadence.

---

## 10) Source Notes

Primary references used for this recommendation set:

- SkillsBench (effect of curated skills and structure):
  - `https://arxiv.org/abs/2602.12670`
- AGENTbench / AGENTS context-file effects:
  - `https://arxiv.org/abs/2602.11988`
- Anthropic engineering guidance for effective agents:
  - `https://www.anthropic.com/engineering/building-effective-agents`
- OpenAI Codex docs (AGENTS.md, skills, multi-agents):
  - `https://developers.openai.com/codex/guides/agents-md`
  - `https://developers.openai.com/codex/skills`
  - `https://developers.openai.com/codex/concepts/multi-agents`
- OpenAI practical guidance (skills/evals/long-running workflows):
  - `https://developers.openai.com/blog/skills-shell-tips`
  - `https://developers.openai.com/blog/eval-skills`
  - `https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide`

---

## 11) Final Recommendation

You are at the right stage to shift from architecture changes to operational excellence.

For the next cycle, prioritize:

1. measurement discipline,
2. trigger/contract tuning,
3. minimal-change maintenance,
4. one-change-at-a-time rollouts with human gates.

This is the fastest path to higher reliability without reintroducing complexity.
