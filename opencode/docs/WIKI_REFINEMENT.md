# Wiki Agent Setup Refinement Report

Date: 2026-06-13

## Scope reviewed

Requested files:

- `agents/librarian.md`
- `agents/subagents/wiki.md`
- `commands/wiki-query.md`
- `commands/wiki-capture.md`
- `commands/wiki-compile.md`
- `commands/wiki-extract.md`
- `commands/wiki-registry.md`
- `/Users/denis/AI_Obsidian/AGENTS.md`

Additional context checked because it affects the setup:

- `agents/scout.md` — because `wiki-query.md` runs through `scout` before calling `@wiki`.
- `opencode.jsonc` — to confirm global default agent and relevant permission/config shape.
- `/Users/denis/AI_Obsidian/Vault/00-Meta/AGENTS.md` — discovered nested pointer; it correctly avoids duplicating the root contract.

## Executive assessment

The setup is close to usable and has a strong architecture: `@wiki` is read-only, `librarian` is write-capable but vault-scoped, commands are thin entry points, and the vault contract is explicit about Karpathy-style compilation, source grounding, index-first navigation, and contradiction preservation.

The biggest remaining risk is not missing instruction coverage; it is instruction drift. Several important policies are specified in two or three places with slightly different behavior. Once the existing knowledge base is moved in, those differences can cause agents to either over-log, under-update the index, mishandle raw-source writes, or produce inconsistent frontmatter.

Recommended final pass before migration:

1. Decide one canonical bookkeeping policy for index/log updates and encode it in the vault `AGENTS.md`; make `librarian` and commands reference it instead of overriding it.
2. Simplify raw-source rules, remove `10-Raw/agent-sessions` as a special category, and avoid over-specifying raw subfolder metadata.
3. Fix frontmatter examples in `AGENTS.md`, especially the duplicate `title` key in the person template and the `ai_generated` default conflict.
4. Remove or reduce duplicated command-level policy text that restates agent policy and can drift.
5. Normalize vault-root/path permission variants between `librarian` and `@wiki`.

## What is working well

- Clear read/write split:
  - `@wiki` is explicitly read-only and denies edit/web/task access.
  - `librarian` is the only vault-write agent and refuses external project edits.
- Index-first model is consistent across `AGENTS.md`, `@wiki`, and command prompts.
- Raw source access is intentionally conservative.
- The project registry is treated as a first-class mapping layer rather than inferred ad hoc from the current directory.
- Contradictions are preserved rather than silently resolved.
- Commands are generally lightweight wrappers around mode-specific agent behavior.
- The nested `Vault/00-Meta/AGENTS.md` is a pointer, not a duplicated policy document; that is good.

## Resolved decisions from grilling

This section records the accepted decisions from the follow-up grilling session. These decisions supersede the earlier recommendations where they differ.

### Authority and scope

- `/Users/denis/AI_Obsidian/AGENTS.md` is the canonical vault contract.
- Agent and command prompts may narrow behavior for safety, but must not independently define schema, bookkeeping, raw-source, lifecycle, privacy, or maintenance policy.
- If an agent prompt and the vault `AGENTS.md` conflict, follow `AGENTS.md` or ask before editing.
- `librarian.md` should include an explicit authority clause saying root `AGENTS.md` is canonical for vault schemas, bookkeeping, raw-source policy, frontmatter, naming, links, privacy, and maintenance rules.
- `agents/subagents/wiki.md` should include a shorter authority clause saying root `AGENTS.md` is canonical and the subagent should report ambiguity rather than guessing.
- Root `AGENTS.md` should stay evergreen and tool-agnostic. It should not include one-time migration details or opencode permission mechanics.
- Keep the short Karpathy/LLM-wiki philosophy because it anchors “compilation beats retrieval,” but keep the rest operational.
- Keep `Vault/00-Meta/AGENTS.md` as an Obsidian pointer note to the root contract; do not duplicate the contract there.
- Keep root `AGENTS.md` outside `Vault/`.

### Commands and agent routing

- Commands should be thin wrappers: target agent, mode/workflow name, command-specific defaults, and `$ARGUMENTS`.
- `/wiki-query` should run directly as `agent: subagents/wiki` with `subtask: true`.
- `/wiki-query` should not mention `@wiki` in the prompt body; it is already running as the wiki subagent.
- `@wiki` remains a subagent, not a primary agent.
- Write commands remain primary `librarian` commands, not subtasks:
  - `/wiki-capture`
  - `/wiki-compile`
  - `/wiki-extract`
  - `/wiki-registry`
- Write command bodies should say things like “Run capture mode...” rather than “Use librarian...”.
- `librarian.md` should keep detailed mode sections because mode behavior belongs there, but it should refer to `AGENTS.md` for canonical schema/bookkeeping/raw policy.

### Vault discovery, cwd, and roots

- Agents should not rely on cwd for vault discovery.
- Vault root comes only from `AI_OBSIDIAN_ROOT` or fallback `/Users/denis/AI_Obsidian`.
- `AI_OBSIDIAN_ROOT` remains optional, but if set it must resolve to a supported root; do not silently fall back from an invalid set value.
- Valid vault roots should be narrow:
  - `/Users/denis/AI_Obsidian`
  - optionally `/Users/denis/Repos/ai-obsidian` if actively used
- Broad roots such as `/Users/denis/Repos/**` and `/Users/denis/Projects/**` may be external project read roots for `librarian`, but not valid vault roots.
- `@wiki` should not infer project context from cwd; project context must be supplied by caller or present in vault notes/registry.
- There is no direct opencode command/agent `cwd` setting; use absolute paths and permissions instead.

### Permissions and protected areas

- `librarian` may inspect external project metadata/docs/source read-only when needed for vault writes, registry mapping, or source-grounded project memory.
- `@wiki` remains vault-only: no external project inspection and no web access.
- `librarian` must not call `@wiki`.
- `librarian` may use read-only support agents (`explore`, `subagents/discoverer`, `subagents/context-auditor`) only for context gathering; never delegate vault writes.
- Broad/risky maintenance should use a read-only context audit first. In `librarian.md`, this can be opencode-specific (`subagents/context-auditor`); root `AGENTS.md` should phrase it generically.
- `.obsidian/**` remains denied.
- Root `/Users/denis/AI_Obsidian/AGENTS.md` should be ask-gated for `librarian`: editable only for explicit vault governance/policy requests, after preview/confirmation.
- `Vault/00-Meta/templates/**` should be ask-gated: templates are editable only when explicitly requested, after preview/confirmation.
- `Vault/10-Raw/**` writes remain permission-level `ask`; raw reads are prompt-restricted, not permission-restricted.
- Add `todowrite: allow` to `librarian`; keep todos only for multi-step/broad maintenance.
- Add `todowrite: deny` to `@wiki` for clarity.
- Leave `question` permission unspecified.
- Keep `@wiki` bash access limited to exactly `printenv AI_OBSIDIAN_ROOT`.
- Keep `librarian` `date *` bash permission as-is.
- Keep opencode path-pattern quirks in agent files, not root `AGENTS.md`, and label them as permission-matching compatibility patterns.

### Web and privacy

- `librarian` keeps `webfetch` for user-provided public URLs and explicit source capture.
- `librarian` should use `websearch` only when explicitly requested; set `websearch: ask` if supported.
- Never include private vault text, project codenames, personal details, or unpublished claims in web queries unless explicitly approved.
- Fetching a user-provided public URL does not need extra confirmation if the user asked to use it.
- Writing fetched content into `10-Raw/**` follows raw-write/archive rules.
- `@wiki` continues to deny all web access.
- Final responses should summarize operationally and list changed files/review needs, but do not need special quoting restrictions for `sensitive: true`; sensitivity is informational metadata in this personal wiki.
- Hard-refuse storing secrets, API keys, passwords, or private tokens. It is okay to store pointers to secret locations, such as “stored in 1Password item X,” without the secret value.

### Bookkeeping, index, and logs

- Use the quieter bookkeeping policy as canonical.
- User knowledge/memory captures go to `60-Daily/**` or project notes.
- Agent operation/audit logs go to `20-Wiki/logs/YYYY-MM/YYYY-MM-DD.md`.
- Simple captures to existing daily/project notes do not update `20-Wiki/index.md` and do not append operation logs.
- Creating a daily note as part of simple capture does not append an operation log.
- Durable page creation appends an operation log and updates the index.
- Durable page deletion/rename/move requires confirmation, appends an operation log, updates the index, and updates links as needed.
- Explicit ingest/synthesis from raw sources appends an operation log.
- Registry changes and new project tracking setup append an operation log.
- Ordinary durable content edits do not append logs by default.
- If an edit only changes index blurb/source count/category because content changed, do not log by default unless it is explicit ingest/synthesis, broad maintenance, or user-requested logging.
- `20-Wiki/index.md` updates when:
  - a durable page is created/deleted/renamed/moved,
  - the page’s index blurb is inaccurate,
  - the source count shown in the index changes,
  - the page belongs in a different index section/category.
- `20-Wiki/index.md` should not include recent logs.
- `20-Wiki/index.md` may include a tiny static `## Utility` section, currently only `[[30-Projects/project-registry]]`.
- Utility links do not use the durable page entry format and do not have source counts.
- Do not include `00-Meta/AGENTS.md` in the index utility section.
- `Sources: N` counts distinct entries in `sources:` plus distinct entries in `source_urls:`. Avoid double-counting the same evidence after archiving a URL into `10-Raw/**`.
- Source summaries that exist should appear in the index; do not create source summaries only to satisfy the index.
- Operation logs use lean frontmatter with `type: operation-log`; they are not durable wiki pages, are not listed in the index, do not need source counts or two wikilinks, and are not used as factual sources except for operation history.
- Operation logs are append-only. Do not delete, reorder, or rewrite historical entries; corrections are appended as new entries.
- Operation logs may set `needs_review: true` only when the logged operation itself needs human review.
- `librarian` final summaries should include changed files, sources used, index/log update status, contradictions/review needs/open questions, and next action. Simple captures can stay brief.

### Raw source policy

- Remove `10-Raw/agent-sessions` from all vault/agent definitions.
- Do not add special long-term migration workflow to root `AGENTS.md`; migration is human-guided with `librarian` step by step.
- Keep raw-source wording generic. Do not enumerate many raw subfolders or hardcode detailed per-category metadata in root `AGENTS.md`.
- A simplified tree should show `10-Raw/` as immutable source documents/imported source material with optional subfolders by source type/project/import.
- Content under `10-Raw/**` is source material. Compile from it into durable notes rather than rewriting raw files in place.
- Newly captured raw Markdown from an external URL/source should include minimal source metadata when practical, e.g. `source_url`, `collected`, and `published` when known.
- Imported/existing raw notes may remain as-is; agents should not add metadata in place unless explicitly asked.
- Raw writes require explicit user intent to save raw material.
- If the user provides source content/URL/artifact and the category/target is clear from the request, `librarian` may choose a conventional filename.
- If target/category/content is ambiguous, ask.
- For ambiguous raw updates, do not crawl raw files to guess the target. Targeted search/read is okay when compiling, when the user gives a raw path/topic, or during an explicitly scoped raw audit.
- Do not rename raw files after capture unless explicitly requested; if a rename is needed, preview it and update citations.
- Do not add backlinks from raw files to source summaries by default.
- For explicit ingest/synthesis from raw sources, `librarian` should read the relevant raw source material. For ordinary capture/compile, raw reads remain targeted and only when needed.
- `@wiki` should prefer compiled notes and inspect raw sources only when durable notes are missing, claims conflict, exact wording/source-level verification is needed, or the caller explicitly asks.

### Source summaries and citations

- Source summaries are mandatory for explicit ingest workflows, but not for every light citation.
- Major/reused raw sources should get source summaries; one-off raw citations can cite raw directly.
- Source summaries require both:
  - `raw_source: "[[10-Raw/...]]"`
  - `sources: ["[[10-Raw/...]]"]`
- `raw_source` records the 1:1 relationship; `sources` supports common source-count/provenance logic.
- If a raw source and its source summary are intentionally renamed/moved, keep `raw_source`, links, citations, and index entry consistent.
- `sources:` is for vault-internal raw/source-summary references.
- `source_urls:` is for external URLs not yet archived, volatile/current docs/pricing pages, or user-provided URL evidence.
- Important durable claims should be captured into `10-Raw/**` first when practical.
- If a page relies mainly on volatile `source_urls:`, consider `needs_review: true` if volatility matters.
- If the user says “compile this URL,” ask whether to archive it to raw first unless the wording clearly says ingest/save raw.

### Frontmatter and controlled vocabulary

- Agent-created durable notes use `ai_generated: true` by default.
- Set `ai_generated: false` only for human-authored notes or when the human explicitly marks a note reviewed/adopted.
- If an agent edits a human-authored note, preserve existing `ai_generated` unless the note becomes substantially agent-authored.
- Daily notes are capture surfaces and use lean daily frontmatter, but include `needs_review`:

```yaml
---
date: YYYY-MM-DD
type: daily
tags: [daily]
projects_touched: []
needs_review: false
---
```

- Operation logs use lean frontmatter:

```yaml
---
date: YYYY-MM-DD
type: operation-log
tags: [operation-log]
needs_review: false
---
```

- Project overview, project decisions, project learnings, person notes, ADRs, area notes, registry, and durable `20-Wiki/**` pages use full durable frontmatter.
- Add controlled vocabulary types:
  - `project-decisions`
  - `project-learnings`
  - `registry`
  - `operation-log`
- Keep `meeting` for occasional standalone meeting notes.
- Keep `policy` for governance/pointer notes.
- Separate operational metadata types (`registry`, `operation-log`) from durable wiki content types.
- Model organizations/products/tools/technologies under `20-Wiki/entities/**` as `type: entity` with `entity_type`, not as top-level `type: organization`.
- Controlled `entity_type` values:
  - `organization`
  - `product`
  - `tool`
  - `technology`
  - `standard`
  - `framework`
  - `library`
  - `protocol`
  - `other`
- Do not add `project_type` yet.
- Fix the person template duplicate `title` key by using `role` for role/title.
- Person notes default to `sensitive: true` and, when agent-created or materially updated, `needs_review: true`.
- `sensitive: true` does not imply `needs_review: true`; they are separate flags.
- Project decisions/learnings use full durable frontmatter with `type: project-decisions` / `type: project-learnings`.
- Registry uses full durable-ish frontmatter with `type: registry`.

### `needs_review` semantics

- `needs_review: true` means the note has at least one unresolved human-review trigger. It is not a quality score.
- Agents may set `needs_review: true` when a trigger is introduced or observed in touched content.
- Agents should preserve `needs_review: true` by default and should not clear it unless the user explicitly asks.
- If evidence appears to resolve a review need, report that and leave `needs_review: true` unchanged unless explicitly told to clear it.
- Accepted triggers include low-confidence/speculative claims, important contradictions, ambiguous sources, agent inference, schema/naming decisions, high-risk legal/medical/financial/security-relevant content, durable unsourced observations/hypotheses/inferences, unclear imported-note provenance, person notes created/materially updated by agents, and durable meeting/person/project summaries created by agents. The `sensitive: true` flag alone is informational and does not itself require `needs_review: true`.
- Daily meeting log entries do not necessarily make the daily note `needs_review: true`; durable extracted summaries do.

### Body contracts and note types

- Keep compact core schema examples inline in `AGENTS.md`; detailed reusable body templates live in `00-Meta/templates/`.
- Keep the full durable wiki body contract inline for `20-Wiki/**` pages:
  - H1
  - 2–3 sentence summary
  - Key Points
  - Details
  - Connections
  - Contradictions
  - Open Questions
  - Sources
- Every durable `20-Wiki/**` page requires `## Sources`, even if empty/unsourced. Unsourced pages should be low confidence and `needs_review: true`.
- Every durable `20-Wiki/**` page keeps explicit `## Contradictions` and `## Open Questions` sections, even if none.
- Do not force the wiki body contract onto project/person/ADR/area notes. Use type-specific body contracts.
- `20-Wiki/**` pages should add at least two meaningful internal wikilinks where possible, but never fake links to satisfy a quota.
- Agents should propose MOCs rather than create them automatically unless explicitly requested.
- Area notes use full durable frontmatter and a hub-like body: Summary, Responsibilities/Scope, Active Projects, Relevant ADRs, Relevant Wiki Notes, People/Stakeholders, Open Questions.
- Person notes use a minimal privacy-aware body: Summary, Context/Relationship, Current Role, Projects/Topics, Preferences/Notes, Follow-ups, Related Notes.
- Factual claims about people should link to where they came from when practical.
- Meetings live inline in daily notes by default. Keep `type: meeting` for explicitly created standalone meeting notes, but do not create standalone meeting notes automatically.
- ADRs remain global under `50-ADRs/**`.
- Create ADRs only for architecture decisions with long-term consequences, cross-project relevance, or meaningful tradeoffs; project-specific tactical decisions stay in project decisions.
- Accepted ADRs are meaning-append-only: typo/link/reference fixes are okay, but meaning-changing edits require explicit request, preview, or a superseding ADR.

### Capture, extraction, and registry behavior

- Default to capture unless the user explicitly asks for durable/wiki/index/project-structure changes.
- Capture language includes “remember,” “save this,” “note this,” “jot this down,” and “keep this in mind.”
- Compile language includes “compile,” “add to wiki,” “make durable,” “update/create wiki page,” “add to index,” “synthesize,” “ingest this source,” and “create project/person/ADR note.”
- If ambiguous and low-risk, capture to the daily note. If durable structure would change, ask.
- `/wiki-capture` may write directly to project decisions/learnings only when content clearly fits the file type and target project is explicit or registry-mapped.
- Daily captures should add `## Extract` candidates only when the item has clear durable potential.
- Daily captures should update `projects_touched` when project context is explicit or registry-mapped; no duplicates.
- If today’s daily note is missing, create the full daily template with the accepted lean frontmatter.
- Use timestamps for daily `## Log` entries; `## Notes` bullets do not need timestamps.
- For implicit project capture, require a confirmed registry mapping. Otherwise use daily note fallback or ask.
- Explicit project-memory intent includes “track this project,” “set up project memory for this repo,” “add this repo/project to the vault,” “create a project note for X,” “create project learnings/decisions for X,” “add X to the project registry,” or “start project memory for X.”
- Generic capture language alone does not create project memory.
- If registry mapping points to a missing project note, ask before creating it.
- Project registry changes append operation logs, update only affected entries, preserve frontmatter, and avoid duplicate keys.

### Bootstrap and missing files

- If `20-Wiki/index.md` is missing:
  - `@wiki` stops and reports the missing path.
  - `librarian` ordinary capture may proceed if target is explicit and safe, but should report the missing index.
  - `librarian` compile/maintenance asks before creating/rebuilding the index.
  - explicit setup/bootstrap may create it after preview/confirmation.
  - never build a whole index from blind crawl unless explicitly asked.
- If `project-registry.md` is missing:
  - not fatal for ordinary capture,
  - `@wiki` project-aware queries answer from explicit named notes if possible or ask for context,
  - registry command asks before creating it,
  - explicit “track this project” previews registry/project entries before confirmation.

### Contradictions and maintenance

- When contradictions are discovered, preserve both claims, attribute each, add a contradiction block when editing a durable note, and set `needs_review: true`.
- Agents should not remove contradiction history.
- Agents should ask before marking a contradiction resolved unless the user explicitly requested contradiction resolution.
- If evidence appears to resolve a contradiction, report possible resolution and leave existing markers/review flags unless explicitly asked.
- Broad maintenance requires explicit scope, preview, and context audit.
- Broad maintenance includes touching more than about five notes, schema/template changes, index rewrites, moves/renames, bulk link repair, folder-wide frontmatter normalization, contradiction-register cleanup, or any operation where mistakes propagate.
- Deletes, renames, moves, and archivals require explicit confirmation. Bulk operations require preview.
- Deterministic narrow broken wikilink fixes may be applied directly only when exactly one target exists, edit scope is narrow, and there is no semantic ambiguity.
- After edits, `librarian` should validate changed frontmatter, changed wikilinks, index/log requirements, duplicate frontmatter keys in touched files, and that edits stayed in allowed targets.
- Automated vault linting is desirable later, but should not block prompt refinement now.

### `@wiki` output behavior

- `@wiki` output should include `Answer/context` and `Evidence`.
- Include `Uncertainty/contradictions` and `Wiki-maintainer follow-up` only when relevant.
- Use Obsidian wikilinks for vault evidence; use paths only when wikilinks are ambiguous or outside normal note naming.
- Do not cite line numbers by default; use them only for exact wording, audit/debug-level evidence, or precise conflict location.
- Label `10-Raw/**` citations as raw/source evidence.
- `@wiki` may recommend concise librarian follow-ups for missing/stale/contradictory/newly durable knowledge, but should not write mini implementation plans.

## High-priority findings

### 1. Bookkeeping policy conflicts between vault `AGENTS.md` and `librarian`

**Where:**

- `/Users/denis/AI_Obsidian/AGENTS.md`
  - `20-Wiki/index.md` says update whenever durable pages are added, renamed, deleted, or substantially changed.
  - Ingest and synthesis workflows require both index updates and daily log appends.
  - Session close protocol says append to the current daily log before finishing a write session.
- `agents/librarian.md`
  - `Bookkeeping Policy` says simple captures do not update index/logs.
  - Durable content edits do not append logs by default.
  - Durable page creation, rename, or move updates the index, but deletion and substantial changes are omitted.
  - Registry changes and explicit log requests append the daily log.
- `commands/wiki-compile.md`, `commands/wiki-extract.md`, and `commands/wiki-registry.md` all defer to `Bookkeeping Policy`, so they inherit whichever interpretation the model chooses.

**Why it matters:**

This is the most important ambiguity. The root vault contract says the log is the audit trail and should be updated broadly; the librarian prompt narrows logging and index updates to reduce noise. Because the root `AGENTS.md` also declares its own precedence above agent defaults, agents may oscillate between the two policies.

Concrete failure modes:

- A durable page is substantially changed but `20-Wiki/index.md` is not refreshed because `librarian` only requires index updates for creation/rename/move.
- A compile/synthesis operation appends a log because `AGENTS.md` says to, while another similar compile does not because `librarian` says durable content edits do not append logs by default.
- Deletes are not covered by `librarian` bookkeeping even though the index contract covers them.

**Recommendation:**

Pick a single canonical policy. My recommendation is to keep the quieter policy, but move it into `/Users/denis/AI_Obsidian/AGENTS.md` so it is truly authoritative:

- Simple capture to existing daily/project notes: no index update, no operation log by default.
- Durable page creation, deletion, rename, or move: update `20-Wiki/index.md` and append an operation log.
- Durable content changes update `20-Wiki/index.md` only when the index entry becomes inaccurate, the source count changes, or the page belongs in a different section/category.
- Registry changes and new project tracking setup: append operation log.
- Explicit ingest/synthesis from raw sources: append operation log.
- Ordinary durable edits: no operation log by default.
- Explicit log request: append operation log.

Then simplify `librarian.md` to say: “Follow the vault `AGENTS.md` bookkeeping policy; if this prompt and `AGENTS.md` differ, `AGENTS.md` wins.”

### 2. Raw-source rules are too specific and include an unwanted `agent-sessions` category

**Where:**

- `/Users/denis/AI_Obsidian/AGENTS.md`
  - `10-Raw/` is called immutable and generally read-only for agents.
  - The raw tree enumerates many source subfolders and gives special treatment to `agent-sessions/`.
  - Agent-generated research has its own detailed metadata rules.
  - Newly captured external/human raw sources are described with a hard metadata convention.
- `agents/librarian.md`
  - Treats all `Vault/10-Raw/**` as source evidence.
  - Requires explicit exact target and exact content for raw writes, with no practical URL/artifact exception.
  - Says to add required source metadata.
  - Denies or asks around all `10-Raw/**` writes via permissions.

**Why it matters:**

The vault contract overfits raw-source categories. The user decided `agent-sessions` should not be a special category at all, and raw sources should be frequent and generic rather than governed by detailed per-category metadata in root `AGENTS.md`.

**Recommendation:**

Simplify the raw rule in both `AGENTS.md` and `librarian.md`:

- Remove `10-Raw/agent-sessions` from all mentions.
- Avoid enumerating many raw subfolders in root policy; allow optional source-type/project/import subfolders.
- Treat all `10-Raw/**` content as source material: compile from it, do not rewrite it in place.
- Newly captured raw Markdown from external URL/source should include minimal source metadata when practical, but imported/existing raw notes may stay as-is.
- Raw writes require explicit user intent. If the user provides a source URL/content/artifact and category/target is clear, the librarian may choose a conventional filename. If category/target/content is ambiguous, ask.
- Keep permission-level `ask` for `10-Raw/**` writes.

### 3. Frontmatter examples conflict with frontmatter rules

**Where:** `/Users/denis/AI_Obsidian/AGENTS.md`

Issues found:

1. Universal frontmatter template defaults `ai_generated: false`, but the rules later say agent-authored durable notes default to `ai_generated: true` and should only flip to false after explicit human review.
2. “Every durable note must have YAML frontmatter” with minimum required fields, but the project, person, ADR, and other per-type examples omit many required universal fields. It is unclear whether those examples are complete templates or only additional type-specific fields.
3. The person note example contains duplicate `title` keys:
   - `title: "Full Name"`
   - `title: "Role"`

**Why it matters:**

Agents follow examples aggressively. These examples can cause invalid or misleading YAML:

- `ai_generated` may be set incorrectly.
- Duplicate YAML keys may overwrite earlier values depending on parser behavior.
- Type-specific notes may be created without `sources`, `related`, `created`, `updated`, `confidence`, or `needs_review` even when the universal contract requires them.

**Recommendation:**

- Change the universal template to make the authorship rule explicit, for example:
  - `ai_generated: true # for agent-created durable notes; false only after human review`
- Fix the person template by replacing the second `title` with `role` or `job_title`.
- Mark type-specific snippets as either:
  - complete frontmatter examples including all required universal fields, or
  - “additional fields layered on top of the universal frontmatter.”
- If daily notes intentionally have a lighter schema, explicitly say daily notes are not durable compiled notes and use the daily-note frontmatter contract instead.

### 4. Authority and precedence are unclear when agent prompts intentionally diverge from `AGENTS.md`

**Where:**

- `/Users/denis/AI_Obsidian/AGENTS.md` instruction precedence section.
- `agents/librarian.md` mode/bookkeeping/raw-source policies.
- Command prompts that restate portions of librarian policy.

**Why it matters:**

The vault contract says the root `AGENTS.md` outranks agent defaults. But `librarian.md` contains policies that look like deliberate refinements of root behavior, especially around logging and raw writes. If those are intended overrides, the precedence contract says they are not overrides. If they are not intended overrides, then the prompts currently conflict.

**Recommendation:**

Use one of these models consistently:

1. **Root contract owns policy.** `AGENTS.md` defines schemas, bookkeeping, raw rules, and permissions. Agent prompts only route modes and restate non-negotiable safety boundaries.
2. **Root contract delegates mode-specific policy.** `AGENTS.md` explicitly says “Mode-specific opencode agent prompts may narrow write/logging behavior for safety and noise reduction.”

I recommend option 1 for migration stability.

Also reconsider this precedence ordering:

```text
2. This AGENTS.md
3. More specific nested AGENTS.md files, if present
```

Most agent ecosystems treat more specific nested instructions as higher priority within their subtree. Your current nested file is only a pointer, so this is not an immediate problem, but future nested policies may behave unexpectedly.

## Medium-priority findings

### 5. Command wrappers duplicate policy that should stay centralized

**Where:** all `commands/wiki-*.md`

Examples:

- Every write command repeats “Follow librarian's Vault Discovery and Startup Protocol.”
- `wiki-capture`, `wiki-compile`, and `wiki-extract` restate bookkeeping/log/index behavior.
- `wiki-compile` and `wiki-extract` restate unsourced/needs-review behavior.
- `wiki-registry` restates registry confirmation and frontmatter behavior.

**Why it matters:**

Some duplication is useful because commands are entry points. But the current wrappers restate enough policy that they can drift from `librarian.md` and root `AGENTS.md`.

**Recommendation:**

Make command prompts thinner:

- Identify the intended mode.
- Pass through `$ARGUMENTS`.
- Add only command-specific defaults, such as “default to today's daily note” for extract.
- Avoid duplicating bookkeeping, raw, frontmatter, and confirmation policy except for one-line references.

Example shape:

```md
Use `librarian` in compile mode for this request. Follow the vault `AGENTS.md` and librarian compile-mode protocol. User request:

$ARGUMENTS
```

### 6. `wiki-query.md` tells `scout` to use `@wiki`, then also says to read vault notes

**Where:** `commands/wiki-query.md`

**Why it matters:**

The command runs under `scout`, whose prompt says to use `@wiki` for private vault lookup. But the command workflow says:

1. Use `@wiki` for vault lookup.
2. Read only targeted vault notes needed for the answer.

This can be read two ways:

- `@wiki` should read targeted notes.
- `scout` should read targeted vault notes after `@wiki` returns.

The first is intended. The second would bypass the dedicated read-only vault agent and may fail or weaken the boundary depending on external-directory permissions.

**Recommendation:**

Change the workflow to make `@wiki` the only vault reader:

```md
Use `@wiki` for all vault reads. Do not read vault files directly from `scout`; ask `@wiki` to inspect targeted notes and return a cited context packet.
```

### 7. Vault-root permission variants are not aligned between `librarian` and `@wiki`

**Where:**

- `agents/librarian.md` permission block.
- `agents/subagents/wiki.md` permission block.

Observed differences:

- `librarian` allows `/Users/denis/AI_Obsidian/**`, `~/Repos/ai-obsidian/**`, `~/Repos/**`, and `~/Projects/**` for external reads.
- `@wiki` allows `/Users/denis/AI_Obsidian/**` and `~/AI_Obsidian/**`, but not `~/Repos/ai-obsidian/**`.
- `librarian` edit permissions include several relative variants, plus `~/Repos/ai-obsidian/Vault/**`, but not an absolute `/Users/denis/Repos/ai-obsidian/Vault/**` variant.
- Some variants such as `Users/denis/AI_Obsidian/Vault/**` omit the leading slash. They may be intentional for relative matching, but they are visually easy to mistake for typos.

**Why it matters:**

Both agents say they prefer `AI_OBSIDIAN_ROOT` and stop if the selected root is outside permitted vault paths. If `AI_OBSIDIAN_ROOT` is set to a repo checkout path, symlink, tilde literal, or alternate absolute path, one agent may work while the other refuses.

**Recommendation:**

Normalize and document the supported roots in one place. If the supported roots are exactly these two, include both consistently in both agents:

- `/Users/denis/AI_Obsidian/**`
- `/Users/denis/Repos/ai-obsidian/**`
- `~/AI_Obsidian/**` if you expect literal tilde-root matching
- `~/Repos/ai-obsidian/**`

Also add a short comment near the odd-looking relative patterns if you keep them, e.g. “relative path variants for opencode permission matching.”

### 8. Bootstrap behavior for a missing index or registry is underspecified for `librarian`

**Where:**

- `agents/librarian.md` startup protocol.
- `agents/subagents/wiki.md` startup protocol and stop rules.
- `commands/wiki-registry.md`.

**Why it matters:**

`@wiki` explicitly says what to do if the expected vault or wiki index is missing. `librarian` says to read the index, but does not specify what to do if it is missing. That matters during initial migration, when `20-Wiki/index.md` or `30-Projects/project-registry.md` may be absent, stale, or intentionally not moved yet.

**Recommendation:**

Add librarian bootstrap rules:

- If `20-Wiki/index.md` is missing and the user requested setup/migration/bootstrap, ask before creating it from the standard template.
- If it is missing during ordinary capture/query-like work, report the missing path and ask.
- If `project-registry.md` is missing during a registry command, ask whether to create it; do not infer a registry structure silently.

### 9. Capture target selection could over-promote routine notes into project records

**Where:**

- `agents/librarian.md` capture mode.
- `commands/wiki-capture.md`.

**Why it matters:**

Capture mode can target daily notes, mapped project notes, project learnings, or project decisions. This is useful, but the boundary between “capture in daily note” and “write to project decisions/learnings” is not fully defined.

Concrete risk: a casual “remember that we might do X” could be filed as a project decision instead of an observation or candidate extract.

**Recommendation:**

Define lightweight routing criteria:

- Daily note: default for rough memory, ambiguous observations, personal notes, and unconfirmed claims.
- Project overview: stable status/goals/risks explicitly tied to a mapped project.
- Project decisions: only explicit decisions with rationale/date/context.
- Project learnings: reusable technical lessons or gotchas from project work.
- Durable wiki: only explicit compile/durable intent or extraction workflow confirmation.

### 10. Web research boundary should explicitly avoid leaking private vault context

**Where:**

- `agents/librarian.md` allows `webfetch` and `websearch`, and says web research only when explicitly asked or when a URL/source needs fetching.
- `/Users/denis/AI_Obsidian/AGENTS.md` privacy section says not to send private vault contents to external services unless approved.

**Why it matters:**

The current rule is mostly safe, but web search queries can accidentally include private project names, personal names, or vault-derived context.

**Recommendation:**

Strengthen `librarian.md`:

- Fetch user-provided public URLs when requested.
- Search the web only when explicitly requested.
- Do not include private vault contents, personal details, project codenames, or unpublished claims in web queries unless the user explicitly approves that exact disclosure.

## Low-priority cleanup findings

### 11. `AGENTS.md` says agents may “Create outputs” without defining outputs

**Where:** `/Users/denis/AI_Obsidian/AGENTS.md`, AI permissions section.

**Why it matters:**

“Create outputs” is broad. It could mean create notes, exports, reports, attachments, or arbitrary files.

**Recommendation:**

Replace it with a narrower phrase, such as:

- “Create vault notes and operation-log entries allowed by this contract.”
- “Create requested in-vault artifacts under the appropriate vault folder.”

### 12. Shell-specific grep tip conflicts with tool-constrained agent operation

**Where:** `/Users/denis/AI_Obsidian/AGENTS.md`, daily log grep tip.

**Why it matters:**

The vault contract contains a command using `grep` and `tail`. Your opencode agents often restrict shell commands and prefer dedicated file/search tools. This is not a functional bug, but agents may try to run a denied command.

**Recommendation:**

Mark it as a human/local-shell tip, or add an agent alternative: use the Grep tool over `20-Wiki/logs/**/*.md` for `^## \[`.

### 13. `wiki-registry.md` has one-off log wording that may not generalize

**Where:** `commands/wiki-registry.md`

**Observation:**

The command says if the registry has `needs_review: true`, any log entry for edits to it must say `Needs human review: Yes`.

**Why it matters:**

This is sensible, but it is narrower than the general frontmatter rule. Any edited note that still has `needs_review: true` should likely be reported/logged similarly, not only the registry.

**Recommendation:**

Move this behavior into `librarian.md` or root `AGENTS.md` as a general rule for operation logs and final summaries.

### 14. The command names are good, but `/wiki-extract` overlaps semantically with `/wiki-compile`

**Where:** `commands/wiki-extract.md`, `commands/wiki-compile.md`

**Why it matters:**

The distinction is understandable after reading the files: extract promotes daily-note material; compile creates durable wiki/project/person/ADR notes from provided/source material. Users may still treat “extract” and “compile” as synonyms.

**Recommendation:**

Make the descriptions even more concrete:

- `/wiki-extract`: “Promote items from daily notes.”
- `/wiki-compile`: “Compile specified source/request into durable pages.”

## Duplicated or similar instruction clusters

Some duplication is intentional defense-in-depth. The issue is whether duplicated text can diverge. This is the current duplication map:

| Cluster | Files | Risk | Recommendation |
| --- | --- | --- | --- |
| Vault discovery and `AI_OBSIDIAN_ROOT` | `librarian.md`, `wiki.md`, all write commands indirectly | Low/medium | Keep in agents; commands should just reference agent protocol. |
| Startup protocol | `AGENTS.md`, `librarian.md`, `wiki.md`, all commands | Medium | Define canonical startup in agents; commands should not restate details. |
| Index-first navigation | `AGENTS.md`, `wiki.md`, `wiki-query.md`, `librarian.md` | Low | Good safety duplication; keep concise. |
| Bookkeeping/index/log policy | `AGENTS.md`, `librarian.md`, `wiki-compile.md`, `wiki-extract.md`, `wiki-capture.md`, `wiki-registry.md` | High | Centralize and reconcile. |
| Raw source rules | `AGENTS.md`, `librarian.md`, `wiki.md` | High | Simplify generic raw policy; remove `agent-sessions` and avoid per-category metadata drift. |
| `needs_review` rules | `AGENTS.md`, `librarian.md`, compile/extract/registry commands | Medium/high | Centralize trigger conditions and logging/final-summary behavior. |
| Project registry confirmation | `librarian.md`, `wiki-registry.md`, `wiki-capture.md`, `wiki.md` | Medium | Keep the registry contract in `librarian.md`/`AGENTS.md`; commands only select mode. |
| Contradiction protocol | `AGENTS.md`, `librarian.md`, `wiki.md` | Low | Good duplication; keep because it applies to both read and write. |
| Read/write boundaries | `scout.md`, `wiki.md`, `librarian.md`, commands | Low | Good duplication; clarify `wiki-query` direct-read ambiguity. |

## Suggested edit sequence before migration

1. **Patch `/Users/denis/AI_Obsidian/AGENTS.md` first.**
   - Fix frontmatter examples.
   - Reconcile bookkeeping.
   - Simplify generic raw-source policy and remove `agent-sessions`.
   - Clarify daily vs durable schema.
   - Narrow “Create outputs.”

2. **Patch `agents/librarian.md` second.**
   - Replace local bookkeeping details with a reference to the canonical vault bookkeeping policy, plus only mode-specific defaults.
   - Update raw rule to remove `agent-sessions` and use generic raw-source wording.
   - Add bootstrap behavior for missing index/registry.
   - Normalize path permission variants.
   - Strengthen web privacy wording.

3. **Patch `agents/subagents/wiki.md` third.**
   - Align supported vault roots with `librarian`.
   - Keep read-only/raw-source behavior, but mirror the generic raw policy.

4. **Patch command prompts last.**
   - Make them thin wrappers.
   - Change `/wiki-query` to run directly as `agent: subagents/wiki` with `subtask: true`.
   - Keep only command-specific defaults.

5. **Restart opencode after agent/command edits.**
   - opencode loads agent and command files at startup; the running session will not reliably pick up prompt/config changes.

## Proposed canonical policy text snippets

These are not applied yet; they are draft wording to reduce future drift.

### Canonical bookkeeping snippet

```md
## Bookkeeping Policy

- Simple captures to existing daily/project notes do not update `20-Wiki/index.md` and do not append operation logs by default.
- Durable page creation appends an operation log and updates `20-Wiki/index.md`.
- Durable page deletion, rename, and move require confirmation, append an operation log, update `20-Wiki/index.md`, and update links as needed.
- Update `20-Wiki/index.md` when an entry's blurb is inaccurate, source count changes, or the page belongs in a different index section/category.
- Explicit ingest/synthesis from raw sources appends the current operation log.
- Registry changes and new project tracking setup append the current operation log.
- Ordinary durable content edits do not append operation logs by default.
- Index-entry-only updates do not append operation logs by default unless part of explicit ingest/synthesis, broad maintenance, or user-requested logging.
- Explicit index or log requests do exactly what was requested.
- Do not add routine logs for ordinary captures, small compiles, or narrow maintenance.
- Do not list recent logs in `20-Wiki/index.md`.
```

### Raw source policy snippet

```md
## Raw Source Policy

Treat `10-Raw/` as evidence, not workspace.

- Use optional subfolders by source type, project, or import batch; do not require a fixed raw taxonomy in this contract.
- Raw files are preserved source material. Compile from them into durable notes instead of rewriting, summarizing, or cleaning them up in place.
- Newly captured raw Markdown from an external URL/source should include minimal source metadata when practical (`source_url`, `collected`, and `published` when known).
- Imported or existing raw notes may remain as-is unless explicitly normalized.
- Raw writes require explicit user intent. If the user provides source content/URL/artifact and the category/target is clear, the agent may choose a conventional filename. If target/category/content is ambiguous, ask.
- Do not mention or create a special `agent-sessions` raw category.
- Prefer compiled `20-Wiki/` and project notes for normal answers; inspect raw material only when source-level evidence is required.
```

### Command wrapper pattern

```md
---
description: <specific user-facing purpose>
agent: librarian
---

Run <capture|compile|maintenance> mode for this request. Follow the vault `AGENTS.md` and your mode protocol.

Request:

$ARGUMENTS
```

For `/wiki-query`, use `agent: subagents/wiki` and `subtask: true` instead of routing through `scout`.

## Bottom line

I would not move the knowledge base in until the high-priority conflicts are implemented in the prompts/contracts. The setup is structurally sound, and the grilling decisions above resolve the biggest policy questions: canonical authority, quiet bookkeeping, generic raw-source handling, command routing, frontmatter schemas, and review semantics.
