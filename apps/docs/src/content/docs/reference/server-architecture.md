---
title: Server Architecture Blueprint
description: Plan for a fail-safe, redundant, UK-compliant backend that respects ownership boundaries.
---

## Mission

Build the server as the single source of truth for business logic, calculations, and data. It exposes only Hono REST endpoints described via OpenAPI and powers the generated SDKs used by web and native clients. The server must survive failure scenarios without leaking sensitive information and must implement UK financial rules exactly as captured in `/funadocs`.

## Core Pillars

1. **Fail-safe first** — degrade gracefully before failing hard, always prefer containment over speed.
2. **Redundant services** — critical subsystems (database, cache, background queue) must have replicas or fallback modes.
3. **UK compliance baked-in** — Universal Credit timing, debt priority, and legal guardrails live on the server and nowhere else.
4. **Immutable contracts** — OpenAPI spec + generated SDK define the only way clients talk to the server.
5. **Auditability** — every user or system action is logged with context, without exposing PII.

## Target Stack (Server Only)

| Concern | Decision | Notes |
| --- | --- | --- |
| Runtime | Hono on Bun | Lightweight, supports edge-style deployments, aligns with existing code.
| API contract | OpenAPI docs generated from route definitions | Checked into repo, versioned per release.
| SDK | Generated TypeScript package under `/sdk` | Imported by web and native; never edited manually.
| Auth | Better Auth (JWT + API keys) | Server verifies tokens; rotates keys via secured admin endpoints.
| Database | PostgreSQL (primary + read replica) | All access via server; migrations gated by Decision Log IDs.
| ORM | Drizzle | Lives inside server; schema definitions never leave the app boundary.
| Cache/queue | Redis | Used for rate limiting, sessions, idempotency keys, and background jobs.
| Background processing | Worker pool using Bun + Redis streams | Handles long-running or retry jobs without blocking requests.
| Logging | Pino + hono-pino | JSON logs, redacting sensitive data, shipped to Better Stack.
| Error tracking | Sentry | Server SDK captures context plus correlation IDs for client reports.
| Push notification dispatch | Webhook fan-out to Expo Push API / APNS / FCM | Triggered only from server background jobs so sensitive logic never leaves the boundary.
| CI/CD | Turbo + Bun scripts run in CI; deploy via blue/green or canary pipeline | Every merge triggers lint, tests, OpenAPI generation, SDK build, and staging deploy before production promotion.

## Reliability & Redundancy

- **Graceful degradation:** If Redis or Sentry is offline, continue serving core routes with warnings logged. If Postgres primary fails, automatically read-only failover to replica and expose calm “data may be delayed” messaging.
- **Circuit breakers:** Wrap outgoing third-party calls with breaker + retry. When circuits open, surface fallback responses that encourage recovery flows rather than raw errors.
- **Health endpoints:** `/health/live` and `/health/ready` check dependencies; infra uses them for rolling deploys.
- **Idempotency tokens:** Required for any state-changing POST/PATCH to prevent duplicate actions when clients retry.
- **Push notification queueing:** Notifications are queued in Redis streams; worker pool retries delivery with exponential backoff so Expo/APNS/FCM hiccups never block user actions.

## Security & Compliance

- **Transport:** HTTPS-only; mutual TLS for background worker communication when feasible.
- **Data protection:** Encrypt sensitive financial fields at rest and scrub them from logs, traces, and errors.
- **Permissions:** Role- and scope-based enforcement at the middleware layer; recovery/crisis overrides logged with justification referencing Founder Safeguards.
- **UK financial rules:** Implement UC taper, housing element handling, debt ordering, and rent risk adjustments centrally. All calculations include metadata describing assumptions so clients can show “estimate” copy.
- **Audit log:** Append-only trail for authentication events, data exports, and crisis actions stored in a separate database schema with write-once permissions.

## Scalability & Deployment

- **Horizontal scaling:** Run multiple Hono instances behind a load balancer; Redis handles shared session/idempotency data while Postgres read replicas absorb report-heavy queries. Sticky sessions are not required because auth tokens are stateless.
- **Background workers:** Separate worker pool processes Redis stream jobs (notifications, letter parsing, report generation). Workers include circuit breakers and concurrency caps to maintain system predictability.
- **Push notifications:** Only the server can schedule notifications. It uses background jobs to send calm, opt-in messages through Expo Push (for native) and Web Push (for browser) respecting behavioural safety rules. All payloads include correlation IDs for audit tracking.
- **CI/CD:** A dedicated pipeline enforces the build order. Steps: lint/tests, generate OpenAPI, fail if spec changed without commit, generate SDK, run integration tests using the SDK, build server image, deploy to staging with automatic smoke tests, require manual approval for production. Rollbacks use blue/green deployments with traffic-splitting to avoid downtime.
- **Infrastructure as Code:** Infra definitions (e.g., Terraform) reference this architecture document, ensuring Postgres replicas, Redis clusters, and monitoring policies are reproducible and reviewable.

## Build Order Enforcement

1. **Server logic:** Implement or update business logic entirely in `apps/server`.
2. **API endpoint:** Add/modify Hono routes and internal handlers.
3. **OpenAPI spec:** Regenerate spec immediately after route updates; commit the spec with the change.
4. **SDK regeneration:** Run the generator to refresh the TypeScript client under `/sdk`; bump version.
5. **Web integration:** Consume the new SDK version inside `apps/web`.
6. **Native integration:** Consume the same SDK inside `apps/native`.
7. **Docs update:** Record the change in `apps/docs` and, if user-facing, in `apps/fumadocs`.

Skipping steps is not allowed. If any step is unclear, stop and request clarification before continuing.

## Next Actions

- Define the OpenAPI generation workflow (likely `bun run openapi:generate`) and store the spec under `apps/server/openapi.json`.
- Decide on Redis + Postgres hosting with replication and document failover procedures.
- Implement auth middleware that validates Better Auth JWTs and API keys before hitting handlers.
- Draft health endpoints and monitoring alarms (Better Stack) referencing this plan.
- Specify the push notification worker design (queues, retry policies) and document calm messaging guidelines.
- Configure CI/CD steps (lint, tests, OpenAPI, SDK, staging deploy, approval gates) and add them to the repo’s pipeline configuration.

Following this blueprint keeps the backend aligned with ownership boundaries, protects sensitive UK household data, and prepares the platform for resilient growth.
