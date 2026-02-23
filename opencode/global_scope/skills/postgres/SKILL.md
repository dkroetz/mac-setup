---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migration workflows.
---

# PostgreSQL (Generic)

## Model Pattern

```python
from sqlalchemy.orm import Mapped, mapped_column

class MyModel(Base):
    __tablename__ = "my_table"
    id: Mapped[int] = mapped_column(primary_key=True)
```

## Migrations

- Create migration: `<project migration command>`
- Apply migrations: `<project migration command>`
- Keep migration invocation generic here; project-local skills define concrete commands/paths.
