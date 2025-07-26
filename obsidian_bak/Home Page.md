
> [!multi-column]
> > [!Example] Meeting
> > Template: [[Template - Meeting Note]]
> > MOC: [[Meetings MOC]]
> > ```meta-bind-button
> > label: New Meeting
> > hidden: false
> > class: ""
> > tooltip: ""
> > id: ""
> > style: default
> > actions:
> >  - type: templaterCreateNote
> >    templateFile: Resources/Templates/Template - Meeting Note.md
> >    folderPath: Notes
> >    fileName: Meeting
> >    openNote: true
>
> > [!Tip] People
> > Template: [[Template - People]]
> > MOC: [[People MOC]]
> > ```meta-bind-button
> > label: Add Person
> > hidden: false
> > class: ""
> > tooltip: ""
> > id: ""
> > style: default
> > actions:
> >  - type: templaterCreateNote
> >    templateFile: Resources/Templates/Template - People.md
> >    folderPath: Notes
> >    fileName: Title
> >    openNote: true
>
> > [!Abstract] Project
> > Template: [[Template - Project]]
> > MOC: [[Projects MOC]]
> > ```meta-bind-button
> > label: New Project
> > hidden: false
> > class: ""
> > tooltip: ""
> > id: ""
> > style: default
> > actions:
> >  - type: templaterCreateNote
> >    templateFile: Resources/Templates/Template - Project.md
> >    folderPath: Notes
> >    fileName: Project Name
> >    openNote: true
> 

> [!Danger] Due today
> ```tasks
due on or before today
not done

> [!Example] Due this week
> ```tasks
due in this week
due after today
not done

> [!Abstract] Open
> ```tasks 
not done

> [!Success] Done
> ```tasks 
done after 2 weeks ago













