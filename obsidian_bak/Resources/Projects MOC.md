**Template:** [[Template - Project]]

```meta-bind-button
label: New Project
hidden: false
class: ""
tooltip: ""
id: ""
style: default
actions:
  - type: templaterCreateNote
    templateFile: Resources/Templates/Template - Project.md
    folderPath: Notes
    fileName: Project Name
    openNote: true
```

> [!Abstract] Projects
> ```dataview
TABLE name as Name, customer as Customer, id as ID
FROM "Notes" where contains(file.outlinks, [[Projects MOC]])
SORT id desc




