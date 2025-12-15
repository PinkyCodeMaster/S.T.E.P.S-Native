---
title: Architecture & Governance Optimisation Plan
description: End-to-end plan for scaling the S.T.E.P.S monorepo while staying resilient, fail-safe, and compliant with UK-focused governance.
---

## Intent

Design a calm, recovery-first stack that scales responsibly, never compromises governance, and keeps Bun as the single package/dependency tool. This plan outlines the target architecture, safety guarantees, and implementation roadmap for the Turborepo-based workspace.

## Current Baseline

- **Apps**: `web` (Next.js), `native` (Expo), `server` (Hono API), `fumadocs` (public governance site), `docs` (internal Astro/Starlight tech docs).
- **Packages**: shared config only; no dedicated domain, UI, or infra layers yet.
- **Tooling**: Turborepo orchestrates tasks, Bun (v1.3.4) is the package manager/runtime, isolated linker per `bunfig.toml`.
- **Governance**: `/funadocs` enforced through Fumadocs content; no enforcement hooks in code yet.

## Architecture Pillars

1. **Safety over speed** — features ship only when calm experiences are proven. (Founding Vision, Ethical Charter, Recovery Spec)
2. **UK-specific correctness** — all financial logic sits inside auditable domain packages. (UK Financial Reality Rules)
3. **Fail-safe resilience** — graceful degradation, clear crisis paths, no hard failures cascading to users. (Recovery & Crisis Spec)
4. **Traceable decisions** — every architectural change references the Decision Log template and Governance Matrix. (Decision Log)
5. **Bun-only dependency flow** — contributors use `bun install <pkg>` for any dependency or CLI. (Contributor Guide, Infra hygiene)

## Target Monorepo Layout

```
apps/
  web/            # Calm web client (Next.js)
  native/         # Expo mobile client
  server/         # Hono + Drizzle API
  docs/           # Internal engineering & governance docs (Astro)
  fumadocs/       # Public-facing values/governance site
packages/
  config/         # Shared lint/TypeScript config (existing)
  design-system/  # Shared calm UI primitives (tone-checked)
  domain-uk/      # UC timing, debt ordering, safe-to-spend engines
  recovery/       # State machines + copy for recovery/crisis flows
  infra-core/     # Observability, retries, circuit breakers, feature flags
  tooling/        # Bun scripts, CLI utilities, governance linters
```

Each package exposes type-safe contracts consumed by apps; critical flows (cashflow, recovery, notifications) stay server-backed with offline-friendly caches client-side.

## Platform Capabilities & Safeguards

### Domain & Compliance

- Implement `packages/domain-uk` containing:
  - UC payment scheduler with bank-holiday rules + taper calculator tests.
  - Rent/UC pairing logic (landlord-paid vs claimant-paid) returning safe-to-spend adjustments.
  - Debt ordering service enforcing CCJ override + hardship hints from `debt-handling-priority-rules`.
- Export explanation helpers that surface “estimate” labels plus plain-English copy defined in UX guidelines.

### Recovery & Behavioural Safety

- `packages/recovery` defines deterministic state machines, copy blocks, and Crisis Mode UI contracts referencing Recovery Spec, UX Tone, Behavioural Safety rules.
- Provide UI kit components for “Something went wrong” entry + flows; add test harness verifying banned words/colors.

### Resilience & Observability

- `packages/infra-core` provides:
  - Circuit breaker + retry utilities for API/DB calls.
  - Structured logging facades that redact sensitive data and map to Public Trust commitments.
  - Feature flag + phase gate helpers (Phase gating doc) ensuring optional participation.
  - Health checks exposing fail-safe readiness states for each app.

### Deployment & Environments

- Adopt environment-specific config via `packages/config/env.ts`, injecting secrets with Bun + `.env` files per app; validations performed by Zod (catalog) before boot.
- Enforce safe default fallbacks (read replicas optional, degrade to cached data when API unreachable with explicit “data may be stale” copy).

### API Contract & Data Security

- Expose the server exclusively via Hono REST routes documented in an OpenAPI spec that lives alongside the codebase. The spec auto-generates typed SDKs for the Next.js web app and Expo native client during CI to prevent drift.
- Better Auth issues both end-user JWTs and scoped API keys for service-to-service calls; all requests carry signed tokens validated by middleware before hitting business logic.
- Every OpenAPI schema doubles as runtime validation, ensuring inputs/outputs match expectations and allowing us to redact sensitive fields before they leave the server.
- Highly sensitive financial fields are encrypted at rest, never logged, and only surfaced to clients when explicitly required for UX flows governed by the UK Financial Reality Rules.

## Tooling & Automation

1. **Decision Tracking**
   - Store Decision Log entries inside `apps/docs/src/content/docs/reference/decisions/` using template from `/funadocs`.
   - Pre-commit hook (Bun script) checks for `Decision-ID:` in commit message when touching governed areas.

2. **Governance Matrix Enforcement**
   - Extend `apps/docs` Governance Matrix doc as the single source; build CI job parsing PR descriptions for matching document IDs.
   - Add CODEOWNERS mapping each doc owner to relevant directories.

3. **Bun-Only Policies**
   - Document in `CONTRIBUTING.md` that dependency operations use `bun install` exclusively (no npm/yarn/pnpm).
   - Add lint rule / git hook failing when `package-lock.json` or `yarn.lock` appears.

4. **Testing Strategy**
   - Layered tests: domain unit (Bun test runner) → contract tests (server vs clients) → calm UX snapshots (Playwright/Detox) verifying tone + banned language.
   - Crisis regression suite ensuring “Something went wrong” entry, crisis mode gating, and notification throttling behave per spec.

## Implementation Roadmap

1. **Document & Enforcement Foundations**
   - Finalise Governance Matrix (this doc) inside `apps/docs`; wire PR template + CODEOWNERS.
   - Create Decision Log folder + template automation; update contributor onboarding instructions.

2. **Shared Packages**
   - Scaffold `packages/domain-uk`, `packages/recovery`, `packages/infra-core`, `packages/design-system`, `packages/tooling` via `bun init`.
   - Move existing cross-app utilities (types, schemas) into these packages incrementally.

3. **Resilience Enhancements**
   - Introduce infra-core wrappers around Drizzle + external APIs; configure exponential backoff + fallback responses aligned with Recovery Spec.
   - Implement graceful shutdown + health endpoints per app.

4. **Phase & Feature Flagging**
   - Add central flag service reading from JSON/YAML config committed to repo, split by roadmap phase; clients read via generated TypeScript.
   - Document enabling criteria referencing Phase doc; require Decision Log entry before toggling phase-specific features.

5. **Observability & Calm Feedback**
   - Standardise structured logging, metrics naming, and trace sampling (low volume to avoid stress); ensure logs never leak PII.
   - Build “calm alerting” playbooks: degrade experiences silently first, escalate only when legal/compliance requires.

6. **Ongoing Compliance**
   - Quarterly governance reviews recorded in Decision Log referencing Governance Matrix row numbers.
   - Keep `apps/docs` and `apps/fumadocs` in sync by scripting diff reports.

## Bun Workflow Guidelines

- **Install:** Always run `bun install` at repo root to sync workspace dependencies. For any new package/CLI, use `bun install <pkg>@<version>`.
- **Scripts:** Use Bun scripts for lint/test/dev tasks (already wired via `package.json`). Avoid `npx`; instead, add tools as devDependencies via Bun catalog for deterministic installs.
- **Publishing:** Internal packages remain private; use `bun link` or workspace references. No global npm packages.

## Success Criteria

- Recovery flows, crisis mode, and domain calculations share deterministic logic across apps.
- Any PR referencing behaviour, tone, or governance includes document IDs + Decision Log entry.
- Deployments remain stable under partial outages via infra-core fallbacks.
- Contributors default to Bun workflows; no stray lockfiles.
- Governance audits show 100% mapping coverage using the Governance Matrix.

Adhering to this plan keeps the monorepo scalable, resilient, fail-safe, and ethically aligned with UK regulations and S.T.E.P.S governance.
