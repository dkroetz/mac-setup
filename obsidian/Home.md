> [!multi-column]
> > [!Notes] Daily Note
> > `BUTTON[daily-note]`
> 
> > [!Notes] Basic Note
> > `BUTTON[basic-note]`
> 
> >[!Notes] Meeting Note
> > `BUTTON[meeting-note]`

>[!Tip] Tasks

> [!multi-column]
>> [!Danger] Due today
>> ```tasks
>>due on or before today
>>not done
>
>> [!Example] Due this week
>> ```tasks
>>due in this week
>>due after today
>>not done
>
>> [!Abstract] Open
>> ```tasks
>>not done
>

>[!Example] Recently Modified Notes
> ```dataview
> TABLE 
> file.mtime AS modified_on
> FROM ""
> SORT file.mtime desc
> LIMIT 5
> ```

