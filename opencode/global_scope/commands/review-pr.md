---
description: Review a PR with multi-aspect analysis
agent: architect
subtask: true
---

Review this PR:
$ARGUMENTS

Use referenced files (`@path`) and local git history as needed.

Analyze across these aspects:
1. **Correctness** — Logic errors, edge cases, error handling
2. **Security** — Vulnerabilities, data exposure, auth issues
3. **Performance** — Inefficiencies, scaling concerns
4. **Maintainability** — Complexity, naming, structure
5. **Test coverage** — Are changes adequately tested?

Return severity-tagged findings (critical/major/minor) and a final recommendation: APPROVE, REQUEST_CHANGES, or REJECT.
