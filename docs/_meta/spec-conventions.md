---
type: guide
id: product.spec-conventions
status: active
tags:
  - specs
  - conventions
---

# Spec Conventions

Specs should be human-readable in Obsidian and precise enough for agents to implement from.

## Frontmatter

Use YAML frontmatter:

```yaml
---
type: feature-spec
id: feature.example
status: draft
maturity: 0
owner: product
tags:
  - feature
related: []
---
```

## Stable IDs

Use stable IDs for traceability:

```text
feature.class-scheduling
entity.class-session
inv.booking-capacity
op.create-booking
perm.create-booking.client
api.post-client-bookings
ipc.scan-directory
mcp.create-booking
webhook.booking-created
async.booking-expiration
ui.client-booking
scenario.client-books-class
test.client-books-class
```

## Feature Shape

Use [[thin-feature-path]]: intent-only, thin feature, or full feature. Create control-plane files only when used.

## Formats

| Layer | Format |
|---|---|
| State | Markdown, Mermaid ERD, entity tables, invariant tables, lifecycle diagrams |
| Operations | Markdown operation contracts |
| Permissions | Matrix tables and policy notes |
| API | Endpoint contracts or OpenAPI-style tables |
| MCP | Tool contracts |
| Webhooks | Event contracts with delivery, retries, signatures, idempotency |
| Async | Job contracts with trigger, retry, idempotency, failure handling |
| Interfaces | Gherkin scenarios and screen contracts |
| Evidence | Commands, test summaries, screenshots, preview URLs |

## Feature Status Files

Each feature folder should include:

```text
status.md
work-log.md
```

`status.md` carries the current feature state. `work-log.md` records how the feature got there.

Key states:

```text
spec_state: idea | draft | ready | accepted
implementation_state: not-started | in-progress | implemented | dirty | blocked
verification_state: unverified | automated-pass | needs-qa | user-qa-pass | failed
```

When a feature spec changes after implementation, set `implementation_state: dirty` and add a work-log entry.

## Feature POCs

Exploratory work for a feature belongs under:

```text
docs/specs/features/{feature-slug}/pocs/{poc-slug}/
```

POCs are non-production by default. They may inform specs, but specs remain the source of truth. If a POC changes desired behavior, update the relevant specs, `status.md`, and `work-log.md`.
