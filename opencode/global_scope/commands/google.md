---
description: Search the web and synthesize findings from multiple sources
agent: google
---

Research the following topic using web search:

$ARGUMENTS

## Instructions

1. Assess query complexity (simple/moderate/complex)
2. Handle simple queries directly with websearch/webfetch
3. For moderate/complex queries, delegate to relevant subagents:
   - `@research/news` - Recent events, announcements
   - `@research/blogs` - Tutorials, opinions, community content
   - `@research/docs` - Official documentation, API references
   - `@research/academic` - Research papers, academic publications
   - `@research/code` - Code samples, GitHub repos
4. Synthesize findings with citations
5. Highlight consensus, contradictions, and information gaps
6. Provide confidence levels for key findings
