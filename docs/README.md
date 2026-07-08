---
type: vault-home
id: product.docs-home
status: active
tags:
  - product
  - specs
---

# Product Specs

This folder is an Obsidian-compatible product vault and the source of truth for AI-assisted development.

**Product:** DiskVibe — local desktop disk usage analyzer (Tauri).  
**Baseline:** [[specs/bootstrap/README|Bootstrap specs]] reconstructed from code.  
**Futures:** [[intent/README|Intent inbox]].

Start here:

- [[_meta/product-map|Product Map]]
- [[_meta/bootstrap-guide|Bootstrap Guide]]
- [[_meta/glossary|Glossary]]
- [[_meta/spec-conventions|Spec Conventions]]
- [[_meta/thin-feature-path|Thin Feature Path]]
- [[_meta/interview-flow|Interview Flow]]
- [[_meta/intent-to-spec|Intent To Spec]]
- [[_meta/feature-state|Feature State]]
- [[_meta/spec-branches-and-pocs|Spec Branches And POCs]]
- [[_meta/decision-policy|Decision Policy]]
- [[_meta/maturity-model|Maturity Model]]
- [[_meta/control-planes|Control Planes]]
- [[_meta/goal-loop|Goal Loop]]
- [[_meta/obsidian-conventions|Obsidian Conventions]]
- [[_meta/decision-log|Decision Log]]
- [[_meta/open-questions|Open Questions]]
- [[_meta/scaffold-version|Scaffold Version]]
- [[specs/bootstrap/README|Bootstrap Specs]]
- [[intent/README|Intent Inbox]]
- [[loop/README|Goal Loop]]

## Product Truth Layers

```text
State
  Source of truth: entities, relationships, invariants, lifecycle, derived state.

Operations
  Domain verbs that read or change state without UI, transport, or permission assumptions.

Permissions
  Who may invoke operations and under what constraints.

Control Planes
  Only planes used: API, IPC, MCP, webhooks, async, admin commands.

Interfaces
  Web, mobile, desktop, admin, client, and other user-facing experiences.

Evidence
  Tests, commands, screenshots, preview or local URLs, QA notes, and known gaps.
```

Prefer [[_meta/thin-feature-path|thin features]]. Omit unused control-plane stubs.
