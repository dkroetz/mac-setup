**Template:** [[Template - People]]

```meta-bind-button
label: Add Person
hidden: false
class: ""
tooltip: ""
id: ""
style: default
actions:
  - type: templaterCreateNote
    templateFile: Resources/Templates/Template - People.md
    folderPath: Notes
    fileName: Title
    openNote: true
```

> [!Tip] People
> ```dataview
TABLE company as Company, department as Department, role as Role
FROM "Notes" where contains(file.outlinks, [[People MOC]])
SORT company desc, department, name




