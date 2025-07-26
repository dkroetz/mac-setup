---
id: 
name: 
customer: 
contact: 
airfocus: 
tags:
---
Links: [[Projects MOC]]
Template: [[Template - Project]]

Team:

| Role        | Assigned |
| ----------- | -------- |
| PO          |          |
| Tech Lead   |          |
| SRE         |          |
| UI/UX       |          |
| DEV         |          |
| Stakeholder |          |


## Information



> [!Tip] Insights
> ```dataview
TABLE insight as Insight
FROM "" 
WHERE contains(file.outlinks, [[]]) AND contains(file.tags, "#insight")
SORT file.cday DESC


> [!Example] Notes
> ```dataview
TABLE 
FROM "Notes" 
WHERE contains(file.outlinks, [[]]) AND !contains(file.tags, "#insight")
SORT file.cday DESC



