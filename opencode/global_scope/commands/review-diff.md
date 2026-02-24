---
description: Review current git diff
agent: review
---
Review the current branch changes using:

# Unstaged changes
!`git status --short`
!`git diff --stat`
!`git diff`

# Staged changes
!`git diff --cached --stat`
!`git diff --cached`

Return findings by severity and a merge recommendation.
