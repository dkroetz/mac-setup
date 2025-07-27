---
tags:
---
---
> [! Notes]
## Topic
- 
---
> [!Tip] Tasks
## Topic
- [ ]
---
> [!Question] Questions
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
