---
tags:
---
> [! Notes]
## Topic
- 

---
> [!Tip] Tasks
## Topic
- [ ]

---
> [!multi-column]
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
