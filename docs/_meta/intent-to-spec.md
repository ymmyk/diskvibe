---
type: guide
id: product.intent-to-spec
status: active
tags:
  - intent
  - specs
---

# Intent To Spec

`docs/intent/` is the raw user-thinking inbox. It is where the user can brainstorm, paste notes, collect screenshots, sketch workflows, or write loose product ideas before they are ready to become implementation specs.

Intent notes are not authoritative specs. They are input material for the interview and translation process.

## Workflow

When the user says something like:

```text
Look at docs/intent/class-packages.md and turn this into specs.
```

The agent should:

1. Read the referenced intent note and any directly linked notes.
2. Extract product intent, actors, candidate entities, operations, interfaces, and unclear assumptions.
3. Ask only for major missing decisions that block safe spec creation.
4. Make minor reversible decisions when useful and log them.
5. Create or update specs under `docs/specs/bootstrap/` or `docs/specs/features/{feature-slug}/`.
6. Link the produced specs back to the source intent note.
7. Record unresolved ambiguity in `docs/_meta/open-questions.md`.

## Intent Note Rules

- Raw notes may be messy.
- Notes may include contradictory ideas.
- Notes may include UI-first language.
- Notes should preserve original thinking instead of being overwritten into polished specs.
- Agents should add a short "Spec Translation" section when a note has been converted.

## Conversion Output

Produce the **smallest shape** that matches maturity (see [[thin-feature-path]]):

- Feature overview (`README.md`) plus `status.md` and `work-log.md` (thin minimum).
- State / operations / permissions / control planes / interfaces / acceptance only as needed.
- Control plane files only for planes actually used.

## Source Traceability

Generated specs should include a link back to the originating note:

```yaml
source_intent:
  - "[[intent/class-packages]]"
```
