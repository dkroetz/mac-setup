---
date: <% tp.file.creation_date("YYYY-MM-DD") %>
summary: 
tags:
---
Links: [[Meetings MOC]]
Template: [[Template - Meeting Note]]
Daily Note: [[<% tp.date.now("YYYY-MM-DD dddd") %>]]
<% await tp.file.rename(tp.date.now("YYYY-MM-DD") + " " + tp.file.title) %>
## Attendees
- <% tp.file.cursor() %>

## Agenda/Questions
- 

## Notes
- 