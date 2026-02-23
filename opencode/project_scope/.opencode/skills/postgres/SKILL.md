---
name: postgres
description: PostgreSQL with SQLAlchemy 2.x and Alembic migrations for futilify.
---

# PostgreSQL (futilify)

Project-local override of the global `postgres` skill for futilify-specific DB paths and migration workflow.

## Models Location

`src/futilify/common/models/`

## Database Connection

`src/futilify/common/config.py`
`src/futilify/common/db.py`

## Migrations

- `make migrate-new msg="description"`
- `make migrate`
- `make migrate-sql`
