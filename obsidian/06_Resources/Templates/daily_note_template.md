---
tags: 
date: <% tp.file.creation_date("YYYY-MM-DD") %>
---
Daily Note: [[<% tp.date.now("YYYY-MM-DD") %>]]
<% await tp.file.rename(tp.date.now("YYYY-MM-DD")) %>
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
> [!multi-column]
> > [!Notes] Daily Note
> > `BUTTON[daily-note]`
> 
> > [!Notes] Basic Note
> > `BUTTON[basic-note]`
> 
> >[!Notes] Meeting Note
> > `BUTTON[meeting-note]`

>[!Example] Recently Modified Notes
>```dataview
>TABLE 
>	file.mtime AS "Last Modified"
>FROM ""
>SORT file.mtime desc
>LIMIT 5
>```
