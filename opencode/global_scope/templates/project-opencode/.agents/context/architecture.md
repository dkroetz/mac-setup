# Architecture Overview

This document describes the high-level architecture of [Project Name].

## Domain Map

Describe the main domains/bounded contexts in your system.

- **Domain 1**: Brief description
- **Domain 2**: Brief description

## Layer Structure

Describe the architectural layers and their responsibilities.

```
┌─────────────────┐
│   Presentation  │  (API, CLI, UI)
├─────────────────┤
│   Application   │  (Use cases, orchestration)
├─────────────────┤
│     Domain      │  (Business logic, models)
├─────────────────┤
│  Infrastructure │  (DB, external services)
└─────────────────┘
```

## Data Flow

Describe key data flow paths through the system.

```
User Request → API → Service → Repository → Database
```

## External Integrations

List external systems this project integrates with.

- **Service A**: Purpose, API docs link
- **Service B**: Purpose, API docs link

## Key Decisions

Document architectural decisions that aren't obvious from code alone.

### Why [Decision X]?

Explain the reasoning behind significant architectural choices. This is the
"why" not the "what" - things an agent would NOT discover by reading code.

### Why Not [Alternative Y]?

If there were significant alternatives considered, explain why they weren't chosen.

## Constraints

Document hard constraints that affect architectural decisions.

- Performance requirements
- Security requirements
- Compliance requirements
- Technical debt to work around
