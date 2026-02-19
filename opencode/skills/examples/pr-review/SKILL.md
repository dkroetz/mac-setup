---
name: pr-review
description: "Guides thorough pull request reviews with security and quality checks"
license: MIT
metadata:
  category: code-review
---

## What I Do
Provide a structured approach to reviewing pull requests for quality, security, and maintainability.

## When to Use Me
- Reviewing pull requests
- Providing constructive feedback
- Identifying potential issues

## Review Checklist

### Code Quality
- [ ] Code follows project style guidelines
- [ ] Functions/methods are appropriately sized
- [ ] Naming is clear and consistent
- [ ] No duplicate code

### Security
- [ ] Input validation present
- [ ] No hardcoded secrets
- [ ] Proper authentication/authorization
- [ ] No SQL injection / XSS risks

### Performance
- [ ] No obvious performance issues
- [ ] Appropriate data structures used
- [ ] Database queries optimized

### Testing
- [ ] Tests cover new functionality
- [ ] Edge cases tested
- [ ] All tests passing

### Documentation
- [ ] Public APIs documented
- [ ] Complex logic explained
- [ ] README updated if needed

## Feedback Format

### Issues
```
**<Severity>**: <Issue description>
**Location**: <file:line>
**Suggestion**: <How to fix>
```

### Severities
- **Blocker**: Must fix before merge
- **Major**: Should fix before merge
- **Minor**: Consider fixing
- **Nit**: Optional improvement
