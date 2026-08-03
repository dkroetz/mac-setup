# Browser Reference

Detailed recipes for `agent-browser`. Read only when the quick workflow in `SKILL.md` is not enough.

## Choosing a wait

- Static page: `agent-browser wait --load domcontentloaded`
- SPA or widget-heavy page: `agent-browser wait --load networkidle`
- Known response text: `agent-browser wait --text "Success"`
- Navigation: `agent-browser wait --url "**/target"`
- Element from a current snapshot: `agent-browser wait @e1`

Avoid bare sleeps unless no page signal exists.

## Scoped reading

After locating a target, avoid full-page snapshots:

```bash
agent-browser snapshot -s "main" -i -c
agent-browser snapshot -s "form" -i -c
agent-browser snapshot -s "dialog" -i -c
agent-browser snapshot -s "[role='dialog']" -i -c
agent-browser snapshot -s "footer" -i -c
```

Useful probes:

```bash
agent-browser get count "button"
agent-browser get count "a[href]"
agent-browser get count "iframe"
agent-browser get count "script[src]"
agent-browser get count "[src]"
```

## Inspect before action

Use this before ambiguous buttons, quick replies, modals, widgets, consent prompts, and navigation-like controls:

```bash
agent-browser get text @e1
agent-browser get html @e1
agent-browser get attr @e1 href
```

If the goal is to understand where an action goes, inspecting `href` can be enough. Do not click follow-up CTAs unless the user asked for deeper exploration.

## Forms

```bash
agent-browser snapshot -s "form" -i -c
agent-browser find label "Email" fill "user@example.com"
agent-browser find placeholder "Search" type "query"
agent-browser find role button click --name "Continue"
```

Ask before submitting forms that create accounts, send messages, purchase, delete, or change settings.

## Chatbots and widgets

For user-requested chatbot/widget interaction:

1. Open the page with `agent-browser`.
2. Find the widget via compact snapshot, semantic text, or button labels.
3. If the widget is missing, check for consent banners or blocked third-party scripts.
4. Accept only the consent needed to complete the requested interaction, or state when broad consent was required.
5. Ask/type/send the requested message.
6. Wait for response text, buttons, URL change, or another concrete signal.
7. Report what was asked and what response/action appeared.

## Eval patterns

Return final expressions; `console.log` output may not be captured.

Links:

```bash
agent-browser eval --stdin <<'EOF'
Array.from(document.querySelectorAll('a[href]')).map(a => ({
  text: a.innerText.trim(),
  href: a.href,
})).filter(x => x.text || x.href)
EOF
```

Iframes/scripts:

```bash
agent-browser eval --stdin <<'EOF'
({
  iframes: Array.from(document.querySelectorAll('iframe')).map(f => ({ src: f.src, id: f.id, title: f.title })),
  scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
})
EOF
```

Visible text sample:

```bash
agent-browser eval --stdin <<'EOF'
Array.from(document.body.querySelectorAll('h1,h2,h3,p,button,a,label,input,textarea'))
  .map(el => el.innerText || el.value || el.getAttribute('aria-label') || '')
  .map(s => s.trim())
  .filter(Boolean)
  .slice(0, 100)
EOF
```

## Screenshots

```bash
agent-browser screenshot
agent-browser screenshot page.png
agent-browser screenshot --full full.png
agent-browser screenshot --annotate
```

Use screenshots for visual layout, image/canvas content, coordinate debugging, or as a deliverable. If screenshots cannot be inspected by the current tooling/model, prefer DOM/text extraction.

## Sessions and tabs

```bash
agent-browser state save ./auth.json
agent-browser --state ./auth.json open https://example.com
AGENT_BROWSER_SESSION_NAME=myapp agent-browser open https://example.com
agent-browser tab
agent-browser tab new
agent-browser tab t2
agent-browser close
agent-browser close --all
```

Close sessions when done unless state should be preserved.

## Troubleshooting

Command missing:

```bash
agent-browser --help
```

Certificate errors:

```bash
agent-browser --ignore-https-errors open https://example.com
```

Unexpected blank/broken page:

```bash
agent-browser get url
agent-browser get title
agent-browser open https://original-url.example
```

If still broken, close and reopen the session.
