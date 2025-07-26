---
tags:
---
Daily Note: [[<% tp.date.now("YYYY-MM-DD") %>]]
<% await tp.file.rename(tp.date.now("YYYY-MM-DD") + " - Basic") %>
---
> [! Notes]
## Topic
- 

---
> [!Example] Tasks
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
>	file.mtime AS modified_on
>FROM ""
>SORT file.mtime desc
>LIMIT 5
>```

