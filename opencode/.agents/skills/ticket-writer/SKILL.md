---
name: ticket-writer
description: 'Turn rough software-development requests into concise Jira tickets or user stories with lean, outcome-focused acceptance criteria.'
---

# Ticket Writer Skill

Use this skill to turn rough software-development requests into concise Jira tickets or user stories.

## Goal

Produce clear, lean tickets that are easy for a software team to understand and size without becoming bloated.

## Supported ticket types

- `story`
- `task`
- `bug`
- `spike`

## Inputs

Accept either structured inputs or free-form text.

### Structured fields

- `type`: `story | task | bug | spike`
- `summary_hint`: short title hint
- `actor`: optional user or persona
- `outcome`: desired result
- `benefit`: optional reason/value, mainly for stories
- `context`: optional background, max 2 short bullets worth
- `acceptance_style`: `bullets | gwt`
- `max_acceptance_criteria`: default `3`
- `constraints`: optional
- `non_goals`: optional
- `verbosity`: `lean | standard`, default `lean`
- `include_implementation`: default `false`

### Helpful aliases

- `summary` -> `summary_hint`
- `acceptance` or `ac_style` -> `acceptance_style`
- `max_ac` -> `max_acceptance_criteria`

## Defaults

- Default `type` to `task` if unclear.
- Default `acceptance_style` to `bullets`.
- Default `verbosity` to `lean`.
- Default `max_acceptance_criteria` to `3`.
- Default `include_implementation` to `false`.

## Process

1. Extract the minimum useful intent from the input.
2. If a critical detail is missing, ask at most 2 short clarifying questions.
3. Otherwise, create a best-effort draft.
4. Keep the ticket outcome-focused, not solution-focused.
5. Omit any empty or non-essential sections.

## Output format

Always return:

### Summary

One concise line.

### Body

Use the matching pattern:

- `story`: `As a <actor>, I want <outcome>, so that <benefit>.`
- `task`: `Goal: <outcome>.`
- `bug`: `Problem: <current issue>.` and, if clear, `Expected: <desired behavior>.`
- `spike`: `Question: <thing to investigate>.`

### Acceptance Criteria

Use either short bullets or Given/When/Then, based on `acceptance_style`.

### Optional sections

Include only when provided and useful:

- `Constraints`
- `Non-Goals`

## Anti-bloat rules

- Omit empty sections.
- Do not include implementation details unless explicitly requested.
- Do not repeat the summary in the body.
- Keep the default output around 120-150 words total.
- Keep acceptance criteria to 2-3 items unless the user overrides it.
- Prefer concrete outcomes over process language.
- Avoid filler such as `TBD`, `etc.`, or generic boilerplate.
- If the input is already clear, do not ask follow-up questions.

## Quality bar

The ticket should be:

- short enough to skim quickly,
- specific enough to act on,
- generic enough to fit normal software delivery workflows.

## Example input

`type=story actor="workspace admin" outcome="export audit logs" benefit="support compliance reviews" acceptance_style=gwt max_ac=3 constraints="CSV only in v1" verbosity=lean`

## Example output

**Summary**

Export audit logs as CSV

**Body**

As a workspace admin, I want to export audit logs, so that I can support compliance reviews.

**Acceptance Criteria**

- Given I am viewing audit logs, when I export them, then I can download a CSV file.
- Given an export completes, when I open the file, then it includes the visible audit log fields.
- Given v1 scope, when export is used, then only CSV format is available.

**Constraints**

- CSV only in v1
