---
description: Compile source-grounded material into durable Obsidian wiki knowledge, usually under 20-Wiki, with citations, links, contradictions, and open questions
agent: librarian
---

Use `librarian` in compile mode.

Compile the user's request into durable vault knowledge, usually under `Vault/20-Wiki/**` unless the request clearly targets project, person, or ADR notes.

Rules:
1. Follow librarian's Vault Discovery and Startup Protocol first.
2. Read targeted existing notes and source material before writing.
3. Prefer source-grounded claims; cite raw/source evidence, existing wiki source summaries, or linked vault notes for factual claims.
4. Add connections, contradictions, open questions, and wikilinks.
5. Follow Bookkeeping Policy for index updates.
6. Follow Bookkeeping Policy for daily log updates.
7. If the material is unsourced but the user explicitly wants it durable, mark it as observation/hypothesis/inference, set low confidence, and set `needs_review: true`.

Compile request:

$ARGUMENTS
