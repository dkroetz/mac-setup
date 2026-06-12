---
description: Inspect or update external project-to-vault project mappings in the private project registry
agent: librarian
---

Use `librarian` in maintenance mode to inspect or update the private project registry.

Target registry after vault discovery:

`${AI_OBSIDIAN_ROOT}/Vault/30-Projects/project-registry.md`

Rules:
1. Follow librarian's Vault Discovery and Startup Protocol, then read the registry.
2. Use registry mappings to connect external working directories and git remotes to vault project notes.
3. If a mapping is missing or ambiguous, ask for confirmation before writing.
4. New project folders under `Vault/30-Projects/{project}/` require explicit user intent.
5. Keep private vault references out of shared external project files.
6. For registry changes, update affected registry content only, preserve frontmatter without duplicate keys, and follow Bookkeeping Policy for index and daily log updates.
7. If the registry has `needs_review: true`, any log entry for edits to it must say `Needs human review: Yes`.

Registry request:

$ARGUMENTS
