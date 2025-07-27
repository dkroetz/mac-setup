> [!multi-column]
> > [!Notes] Daily Note
> > `BUTTON[daily-note]`
> 
> > [!Notes] Basic Note
> > `BUTTON[basic-note]`
> 
> >[!Notes] Meeting Note
> > `BUTTON[meeting-note]`
>
> >[!Notes] People Note
> > `BUTTON[people-note]`
>
> >[!Notes] Project Note
> > `BUTTON[project-note]`
>
> >[!Notes] Area Note
> > `BUTTON[area-note]`
>

> [!Question] Open Questions
> ```tasks
>not done
>tag include #question
>```

> [!Tip] Open Tasks
> ```tasks
>not done
>tags does not include #question
>```

> [!Danger] Due this week
> ```tasks
>tags does not include #question
>due on or after today
>due in this week
>not done

>[!Example] Recently Modified Notes
> ```dataview
> TABLE 
> file.mtime AS modified_on
> FROM ""
> SORT file.mtime desc
> LIMIT 5
> ```
