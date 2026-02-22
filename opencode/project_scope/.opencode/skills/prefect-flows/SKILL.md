---
name: prefect-flows
description: Prefect 3.x flow patterns and deployments for futilify.
---

# Prefect Flows (futilify)

## Flow Location

`src/futilify/flows/`

## Deployment

Deployments defined in `deploy/deploy.py`

```bash
make deploy-prefect
```

## Worker Pools

- `vps` - VPS worker
- `homeserver` - Home server worker

## Infrastructure

```bash
make up-prefect    # start Prefect server
make down-prefect  # stop Prefect server
```

## Docker

```bash
make build-flows   # build flows image
make push-flows    # push to GHCR
```
