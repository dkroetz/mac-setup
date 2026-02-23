# Minimal-Context Drift Checklist

Run before/after agent policy edits:

1. No duplicated skill-loading policy in primary agent specs:
   - `rg "Start with 0 skills|load 1-2 relevant skills|Load a 3rd skill" opencode/global_scope/agents`
   - Expected: only AGENTS-reference phrasing, no standalone policy blocks

2. Postgres boundary is preserved:
   - `rg "futilify|src/futilify|make migrate" opencode/global_scope/skills/postgres/SKILL.md`
   - Expected: no matches
   - `rg "src/futilify|make migrate-new|make migrate-sql" opencode/project_scope/.opencode/skills/postgres/SKILL.md`
   - Expected: matches

3. AGENTS remains thin policy index:
   - Confirm no long procedural/domain deep-dives in AGENTS files
