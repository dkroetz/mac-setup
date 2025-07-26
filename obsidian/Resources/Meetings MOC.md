**Template:** [[Template - Meeting Note]]

> [!multi-column]
> > [!Example] Meeting
> > ```meta-bind-button
> > label: New Meeting
> > hidden: false
> > class: ""
> > tooltip: ""
> > id: ""
> > style: default
> > actions:
> >   - type: templaterCreateNote
> >     templateFile: Resources/Templates/Template - Meeting Note.md
> >     folderPath: Notes
> >     fileName: Meeting
> >     openNote: true
>
> > [!Example] Meeting
> > ```meta-bind-button
> > label: New CS JF
> > hidden: false
> > class: ""
> > tooltip: ""
> > id: ""
> > style: default
> > actions:
> >   - type: templaterCreateNote
> >     templateFile: Resources/Templates/Template - Meeting Note CS JF.md
> >     folderPath: Notes
> >     fileName: Meeting CS JF
> >     openNote: true
>
> > [!Example] Meeting
> > ```meta-bind-button
> > label: New DS Retrospective
> > hidden: false
> > class: ""
> > tooltip: ""
> > id: ""
> > style: default
> > actions:
> >   - type: templaterCreateNote
> >     templateFile: Resources/Templates/Template - Meeting Note DS Retrospective.md
> >     folderPath: Notes
> >     fileName: DS Retrospective
> >     openNote: true
>

> [!Example] Meeting Notes
> ```dataview
TABLE summary as Summary, date as Date
FROM "Notes" where contains(file.outlinks, [[Meetings MOC]])
SORT date DESC, file.ctime DESC





