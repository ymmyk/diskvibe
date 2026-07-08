---
type: guide
id: product.goal-loop
status: active
tags:
  - loop
  - goals
---

# Goal Loop

The loop folder is operational memory for AI work. It is not the product spec itself.

## Structure

```text
docs/loop/
  current-goal.md
  backlog.md
  blockers.md
  runs/
    YYYY-MM-DD-goal-slug/
      goal.md
      plan.md
      progress.md
      evidence.md
      deployment.md
      qa-checklist.md
      open-questions.md
```

## Evidence Rule

A completion claim is not enough. Record commands, tests, seed/reset (if any), preview/local URL, screenshots when UI changed, known gaps, and QA checklist.

## Environment Contract

Map these intents to **this repo's** real commands:

| Intent | SaaS default | Desktop / local example |
|---|---|---|
| reset | `just reset` | Clear cache / N/A |
| seed | `just seed` | `testdata/` fixtures |
| test | `just test` | package / cargo tests |
| preview | `just deploy-preview` | `just dev` / local run |

Document the actual mapping in goal evidence. Do not invent SaaS commands for desktop products.
