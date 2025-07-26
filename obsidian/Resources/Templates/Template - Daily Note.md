---
date: <% tp.file.creation_date("YYYY-MM-DD") %>
---
Links: [[Daily Notes MOC]]
Template: [[Template - Daily Note]]

## 📝 Notes
- <% tp.file.cursor() %>

## 📋 Tasks
- 

---
### Notes created today
```dataview
List 
FROM "Notes"
WHERE file.cday = date("<%tp.date.now("YYYY-MM-DD")%>") 
SORT file.ctime desc
```

### Notes last touched today
```dataview
List 
FROM "Notes"
WHERE file.mday = date("<%tp.date.now("YYYY-MM-DD")%>")
SORT file.mtime desc
```
