---
type: control-plane-spec
id: webhooks.{{feature-slug}}
status: draft
maturity: 3
tags:
  - control-plane
  - webhooks
related:
  - "[[operations]]"
---

# Webhooks: {{Feature Name}}

## Event Index

| Event | Stable ID | Direction | Trigger | Operation |
|---|---|---|---|---|
| TBD | `webhook.tbd` | outbound | TBD | `op.tbd` |

## `webhook.tbd`

Direction: inbound/outbound

Trigger: TBD

Payload:

| Field | Type | Required | Notes |
|---|---|---:|---|
| `event_id` | text | yes | Stable across retries. |
| TBD | TBD | yes | TBD |

Security/signature: TBD

Idempotency key: `event_id`

Delivery guarantee: at-least-once / at-most-once / exactly-once-effect

Retry policy: TBD

Dead-letter behavior: TBD

Ordering expectations: TBD

Observability: TBD
