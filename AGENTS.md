# Agent Instructions

This repository uses the AI Product OS workflow. Agents should build from specs, not from vague feature prose.

## Operating Model

Translate product intent into:

```text
State
Operations
Permissions
Control Planes
Interfaces
Evidence
```

State is the source of truth. Interfaces express user intent. Operations connect the two. Control planes expose operations. Permissions constrain operations. Evidence proves implementation.

## Before Implementing

1. Locate the relevant spec under `docs/specs/`.
2. If the user points at raw intent under `docs/intent/`, read it and convert it into specs before coding.
3. If no spec exists, interview the user using `docs/_meta/interview-flow.md`.
4. Prefer the **thin feature path** (`docs/_meta/thin-feature-path.md`): smallest shape that meets maturity gates.
5. Create control-plane files **only when used**. Omit empty API/MCP/webhook stubs.
6. Log minor decisions in `docs/_meta/decision-log.md` (see `docs/_meta/decision-policy.md`).
7. Record unresolved or major questions in `docs/_meta/open-questions.md`.
8. Do not implement past the maturity gates below.

## Maturity Gates

- Do not implement backend state-changing work before spec maturity Level 2.
- Do not expose operations through control planes before Level 3.
- Do not implement user-facing interfaces before Level 4.
- Do not mark a goal complete before Level 5.

Gates apply to content, not file count. Thin features are valid at L0–2.

## Feature State

Each feature folder owns its current state. Minimum:

```text
docs/specs/features/{feature-slug}/
  README.md
  status.md
  work-log.md
```

When modifying a feature spec, update `status.md` and append to `work-log.md`.

Mark a feature `dirty` when desired behavior changes after implementation, tests fail for expected behavior, user QA finds a mismatch, or the test/run environment no longer supports the feature.

Goals should prioritize features with:

- `implementation_state: not-started`
- `implementation_state: in-progress`
- `implementation_state: dirty`
- `verification_state: failed`
- `verification_state: needs-qa`

## Spec Branches And POCs

Feature specs may be developed on normal git branches. Main is the finalized source of truth once merged.

POCs live under:

```text
docs/specs/features/{feature-slug}/pocs/{poc-slug}/
```

POCs are non-production by default. A working POC is not completed product behavior.

## Decision Policy

Agents may make minor decisions when all are true:

- The decision is reversible.
- It does not materially change product behavior.
- It does not affect permissions, data ownership, billing, public contracts, destructive behavior, compliance, or security posture.
- It follows existing repo conventions.
- It is logged in `docs/_meta/decision-log.md`.

Agents must stop for major decisions affecting state model, permissions, tenancy, public contracts (API/IPC/MCP/webhooks), billing, destructive behavior, retention, privacy, security, compliance, or user-visible workflow semantics.

## Spec Formats

- State: Markdown, Mermaid ERD, entity tables, invariant tables, lifecycle diagrams.
- Operations: operation contracts with inputs, outputs, preconditions, state changes, errors, events, and idempotency.
- Permissions: matrix tables and policy notes.
- Control Planes: only planes used — API, IPC, MCP, webhooks, async, admin commands.
- Interfaces: screen contracts and Gherkin scenarios.
- Evidence: commands, test summaries, screenshots, preview/local URLs, deployment notes, QA checklist, known gaps.

## Intent Notes

`docs/intent/` is the raw user-thinking inbox. Intent notes are not authoritative specs.

When converting intent into specs:

- Preserve the original intent note.
- Create thin or full feature specs under `docs/specs/` as needed.
- Link intent → specs; log decisions and open questions.
- Do not code until the relevant maturity gate is satisfied.

## Goal Completion

At the end of a goal, produce evidence under `docs/loop/`. Update each affected feature `status.md` and `work-log.md`.

## Environment Contract

| Intent | Command |
|---|---|
| install | `just install` |
| test | `just test` |
| check | `just check` |
| preview / QA | `just dev` |
| build | `just build` |
| seed | N/A (optional future `testdata/`) |
| deploy-preview | N/A |

Primary control plane: **IPC** (Tauri). See `docs/specs/bootstrap/`.

## Validation

```bash
bash /Users/will/projects/whalen/SpecOps/scripts/validate-ai-product-os.sh .
```
