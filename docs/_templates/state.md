---
type: state-spec
id: state.{{feature-slug}}
status: draft
maturity: 1
tags:
  - state
related:
  - "[[{{feature-slug}}]]"
---

# State: {{Feature Name}}

## ERD

```mermaid
erDiagram
  %% Replace with feature entities and relationships.
  ENTITY_A ||--o{ ENTITY_B : relates
  ENTITY_A {
    uuid id PK
    timestamptz created_at
  }
  ENTITY_B {
    uuid id PK
    uuid entity_a_id FK
    timestamptz created_at
  }
```

## Entities

| Entity | Stable ID | Purpose | Owner | Lifecycle |
|---|---|---|---|---|
| TBD | `entity.tbd` | TBD | TBD | TBD |

## Invariants

| ID | Rule | Enforcement |
|---|---|---|
| `inv.tbd` | TBD | TBD |

## Derived State

| Name | Definition | Source entities |
|---|---|---|
| TBD | TBD | TBD |

## Lifecycle

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> Active
  Active --> Archived
```

## Retention and Audit

TBD

## Tenancy and Ownership

TBD
