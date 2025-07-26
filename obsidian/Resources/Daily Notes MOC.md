**Template:** [[Template - Daily Note]]

```meta-bind-button
label: Open Daily Note
hidden: false
class: ""
tooltip: ""
id: ""
style: default
actions:
  - type: command
    command: daily-notes

```
## Daily Notes
```dataview
LIST
FROM "Notes" where contains(file.outlinks, [[Daily Notes MOC]])
SORT date DESC, file.ctime DESC
```

