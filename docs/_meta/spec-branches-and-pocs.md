---
type: guide
id: product.spec-branches-and-pocs
status: active
tags:
  - branches
  - pocs
---

# Spec Branches And POCs

Feature specs may be developed on normal git branches. The main branch is treated as the finalized product source of truth: a feature spec is finalized when its branch is merged into main.

During spec development, the user may ask an agent to create proof-of-concept work to make the spec better. That work should live inside the feature folder, not scattered through the product codebase.

## Feature Branch Workflow

1. Create or switch to a feature/spec branch.
2. Draft or modify `docs/specs/features/{feature-slug}/`.
3. Use POCs when visual, interaction, data-model, or technical exploration would improve the spec.
4. Keep production implementation separate from exploratory POCs.
5. Update `status.md` and `work-log.md`.
6. Merge to main when the spec is accepted.
7. Let the normal goal/loop harness implement finalized specs from main.

## POC Folder Contract

```text
docs/specs/features/{feature-slug}/
  pocs/
    README.md
    {poc-slug}/
      README.md
      notes.md
      artifacts/
      src/
```

POC folders may contain Markdown, images, screenshots, mock data, throwaway code, static HTML, scripts, or other exploratory artifacts.

## POC Rules

- POCs are non-production by default.
- POCs must stay under the feature folder unless the user explicitly asks to promote work into implementation.
- POCs should be small enough to inspect and discard.
- A POC may inform specs, but specs remain the source of truth.
- If a POC changes desired behavior, update the relevant spec files and mark feature state appropriately.
- If production code is modified for a POC, the branch must clearly document that risk and either revert, isolate, or promote the changes before merge.

## Promotion

Promoting a POC means converting useful findings into specs or implementation work:

- Add spec decisions to `state.md`, `operations.md`, `permissions.md`, control planes, interfaces, or acceptance.
- Log decisions in `docs/_meta/decision-log.md` when appropriate.
- Add work-log entries linking the POC to spec changes.
- Create a goal if implementation is needed.

Do not treat a working POC as done product behavior.
