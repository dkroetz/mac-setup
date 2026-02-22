---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations for futilify.
---

# PostgreSQL (futilify)

## Models Location

`src/futilify/common/models/`

## Model Pattern

```python
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from futilify.common.models.base import Base

class MyModel(Base):
    __tablename__ = "my_table"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
```

## Database Connection

Configured in `src/futilify/common/config.py`
Engine/session in `src/futilify/common/db.py`

## Migrations

| Task | Command |
|------|---------|
| Create migration | `make migrate-new msg="description"` |
| Apply migrations | `make migrate` |
| Preview SQL | `make migrate-sql` |

## Docker

Local Postgres via docker-compose:
```bash
make up-postgres    # start
make down-postgres  # stop
```
