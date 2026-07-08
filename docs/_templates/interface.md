---
type: interface-spec
id: ui.{{interface-slug}}
status: draft
maturity: 4
tags:
  - interface
related:
  - "[[operations]]"
---

# Interface: {{Interface Name}}

## Actor

TBD

## Purpose

TBD

## Operations Used

- `op.tbd`

## Control Planes Used

- `api.tbd`

## Screen States

| State | Behavior |
|---|---|
| Empty | TBD |
| Loading | TBD |
| Success | TBD |
| Error | TBD |
| Permission denied | TBD |

## Scenarios

```gherkin
Feature: {{Interface Name}}

Scenario: User completes the primary action
  Given required state exists
  When the user performs the primary action
  Then the expected result is visible
```

## Accessibility and Responsiveness

TBD
