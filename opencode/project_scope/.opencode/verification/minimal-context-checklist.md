# Minimal-Context Drift Checklist

Run before/after agent policy edits:

1. No bulk-load wording:
   - `rg "Load each skill via|load all domain skills" opencode/global_scope/agents`
   - Expected: no matches

2. Conditional-load wording present:
   - `rg "Start with 0 skills|load 1-2 relevant skills|3rd skill only if blocked" opencode/global_scope/agents`
   - Expected: matches in `implement.md`, `research.md`, `architect.md`

3. AGENTS stays thin:
   - Confirm policy-only sections remain; move details into skills.
