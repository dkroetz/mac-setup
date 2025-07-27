---
tags: 
date: <% tp.file.creation_date("YYYY-MM-DD") %>
---
Daily Note: [[<% tp.date.now("YYYY-MM-DD") %>]]
<% await tp.file.rename(tp.date.now("YYYY-MM-DD") + " - Meeting") %>
---
# Agenda
- 
---
# Notes
## Topic
- 
---
# Tasks
## Topic
- [ ]
---
# Questions
## Topic
- [ ]
---
<% await tp.file.include("[[template_skeleton_footer]]") %>