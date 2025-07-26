---
date: <% tp.file.creation_date("YYYY-MM-DD") %>
insight: 
tags:
---
Links: [[Meetings MOC]], <% tp.file.cursor() %>
Template: [[Template - Insight Note]]

<% await tp.file.rename(tp.date.now("YYYY-MM-DD") + " " + tp.file.title) %>
## Notes
- 