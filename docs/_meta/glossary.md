---
type: glossary
id: product.glossary
status: active
tags:
  - glossary
---

# Glossary

## State

The product source of truth: database schema, entities, relationships, invariants, lifecycle states, derived state, retention, audit requirements, and tenancy boundaries.

## Operation

A domain verb that reads or changes state without transport, permission, or UI assumptions.

## Permission

A policy rule that determines who may invoke an operation and under which constraints.

## Control Plane

A surface or mechanism that invokes, schedules, automates, synchronizes, or exposes operations.

Includes **API**, **IPC / native commands**, **MCP**, webhooks, async workers, scheduled jobs, backfills, and admin commands. Not HTTP-only. Omit planes the product does not use.

## Interface

A human-facing or client-facing experience that uses one or more control planes (web, mobile, desktop shell, CLI, admin).

## Thin Feature

Minimum feature folder (README, status, work-log) plus only files needed for current maturity. See [[thin-feature-path]].

## Evidence

Proof that a goal is done: passing tests, commands run, screenshots, preview or local URLs, seed data, migration results, deployment notes, QA checklist, and known gaps.

## Minor Decision

A reversible agent decision that does not materially alter product behavior, permissions, public contracts, data ownership, billing, destructive actions, compliance, privacy, or security.

## Major Decision

A decision that changes product behavior, state, permissions, public API contracts, user workflows, billing, ownership, retention, privacy, security, or compliance. Major decisions require user approval.
