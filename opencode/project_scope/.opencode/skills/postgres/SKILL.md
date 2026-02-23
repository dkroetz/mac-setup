---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations for futilify.
---

# PostgreSQL (futilify)

## Models Location

`src/futilify/common/models/`

## Database Connection

`src/futilify/common/config.py`
`src/futilify/common/db.py`

## Migrations

- `make migrate-new msg="description"`
- `make migrate`
- `make migrate-sql`
