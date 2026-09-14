---
name: browser
description: Browse websites, extract information, fill forms, click through pages, and take screenshots. Use when tasks need live web interaction, JavaScript-rendered pages, authentication/session flows, form filling, scraping, website testing, visual inspection, or when the user asks to click, type, submit, or interact with a site.
---

# Browser

Use `agent-browser` for stateful Chromium automation. Sessions persist across commands, so pages, cookies, tabs, and refs can carry over until you navigate or close the session.

## Quick start

For direct interaction requests — click, type, ask a chatbot, submit, test a page — start with `agent-browser`:

```bash
agent-browser open https://example.com
agent-browser wait --load domcontentloaded
agent-browser snapshot -i -c
agent-browser click @e1
agent-browser wait --text "Success"
agent-browser snapshot -i -c
```

For read-only/static questions, use `webfetch` or `websearch` first. Use screenshots only when DOM/text inspection cannot answer the task.

## Core rules

- **Match the tool to the task:** static read-only → `webfetch`; unknown/current source → `websearch`; live interaction/JS/forms/auth/testing → `agent-browser`.
- **Scope after finding the target:** once a modal, widget, form, table, or content area is found, avoid whole-page snapshots. Use scoped snapshots, targeted `get`, `find`, `wait`, or `eval`.
- **Inspect before clicking:** before clicking popups, consent banners, widgets, CTAs, quick replies, nav controls, or anything that may submit/navigate, inspect with `get html`, `get text`, or `get attr href`.
- **Wait for signals:** after actions, wait for specific text, URL, element, or load state. Avoid polling with repeated full-page snapshots.
- **Stop when done:** once the requested interaction and observed response are complete, report back. Do not click follow-up CTAs or explore adjacent flows unless asked.
- **Keep errors visible:** do not hide stderr (`2>/dev/null`) while debugging. Hidden errors cause repeated failed commands.
- **Use screenshots deliberately:** only take screenshots if visual evidence is needed, the current tooling/model can inspect them, or the screenshot path is the deliverable.

## Essential commands

```bash
agent-browser open https://example.com
agent-browser snapshot -i -c
agent-browser snapshot -s "form" -i -c
agent-browser get text @e1
agent-browser get html @e1
agent-browser get attr @e1 href
agent-browser click @e1
agent-browser fill @e2 "value"
agent-browser press Enter
agent-browser wait --text "Done"
agent-browser wait --load networkidle
```

Refs like `@e1` are ephemeral. Re-snapshot after navigation, submit, dialog changes, reloads, or dynamic re-renders.

## Semantic find

Use semantic locators when the target is obvious. Syntax: `agent-browser find <strategy> <query> <action> [options]`.

```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@example.com"
agent-browser find placeholder "Search" type "query"
```
Do not omit the action.

## Eval rules

Use `eval` for structured extraction or when snapshots are too large. Return the final value; do not rely on `console.log`. Convert NodeLists with `Array.from(...)` before `.map`.

```bash
agent-browser eval --stdin <<'EOF'
Array.from(document.querySelectorAll('a[href]')).slice(0, 20).map(a => ({
  text: a.innerText.trim(),
  href: a.href,
}))
EOF
```

Prefer direct `agent-browser ...` commands in restricted shell environments. Avoid pipes, redirects, heredocs, and command chaining unless the environment supports them.

## Recovery

If the page becomes blank, broken, stuck, or navigates unexpectedly:

```bash
agent-browser get url
agent-browser get title
agent-browser open https://original-url.example
```

If the session still behaves incorrectly, run `agent-browser close` and reopen. For certificate errors, retry with `agent-browser --ignore-https-errors open https://example.com`.

## More examples

See [REFERENCE.md](REFERENCE.md) for detailed command recipes, scoped extraction patterns, consent-gated widgets, screenshots, tabs, and troubleshooting.
