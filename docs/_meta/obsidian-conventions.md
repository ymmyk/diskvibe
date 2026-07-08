---
type: guide
id: product.obsidian-conventions
status: active
tags:
  - obsidian
  - conventions
---

# Obsidian Conventions

This `docs/` folder should work as an Obsidian vault and as plain Markdown in the repository.

## Use

- YAML frontmatter for machine-readable metadata.
- Wikilinks for navigation, such as `[[specs/bootstrap/state]]`.
- Mermaid diagrams for ERDs, state diagrams, and workflow maps.
- Tags for broad grouping, such as `#state`, `#operation`, and `#decision`.
- Backlinks to inspect what features touch an entity, operation, or interface.

## Avoid Requiring

- Obsidian plugins for source-of-truth behavior.
- Canvas files as canonical specs.
- Dataview queries as the only way to understand a document.
- Binary-only artifacts when Markdown can capture the product truth.

## Rule

Obsidian is the human browser. Markdown remains the source format. Agents must be able to work from the repository without opening Obsidian.
