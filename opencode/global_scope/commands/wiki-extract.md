---
description: Review daily-note Extract, Decisions, Notes, and Log entries and promote selected material into durable wiki, project, person, or ADR notes
agent: librarian
---

Use `librarian` in compile mode with the daily-note extraction workflow: review daily notes and promote selected material into durable wiki, project, person, or ADR notes.

Workflow:
1. Follow librarian's Vault Discovery and Startup Protocol first.
2. Resolve the requested daily note range. If no date is specified, default to today's daily note under `Vault/60-Daily/`.
3. Inspect `## Extract` first, then relevant `## Decisions`, `## Notes`, and `## Log` entries.
4. Identify candidates worth promoting into durable pages or project records.
5. Ask before promotion unless the user explicitly says to promote/write/apply all obvious items.
6. When promoting, preserve daily-note context with a backlink to the source daily note.
7. Treat daily notes as the source. If the promoted claim is a personal observation rather than external evidence, label it as observation/hypothesis/inference and set `needs_review: true` unless existing evidence verifies it.
8. Follow Bookkeeping Policy for index updates.
9. Follow Bookkeeping Policy for daily log updates.

Extraction request:

$ARGUMENTS
