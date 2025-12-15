---
title: Platform Capability Map
description: Defines which runtimes own each cross-cutting concern and which tools we standardise on.
---

The table below shows where each major platform capability lives, which tools we use, and any governance constraints to remember while implementing. Every dependency must be added with `bun install` scoped to the relevant workspace.

| Capability | Tooling | Responsible surfaces | Notes |
| --- | --- | --- | --- |
| HTTP server runtime | Hono (apps/server) | Server API | Lightweight edge-ready framework; all business logic remains recovery-safe per ethical charter. |
| API interface & SDKs | Hono REST routes + OpenAPI spec → generated TS SDKs | Server API (spec), Web & Native clients (SDK consumption) | Expose routes via OpenAPI; auto-generate typed clients for Next.js & Expo during CI to prevent drift and prepare for trusted partner access later. |
| Logging pipeline | `pino`, `hono-pino`, `pino-pretty` (dev only) | Server API (structured logs) | Use JSON logs in production; pretty output only for local dev. Mask PII per Public Trust commitments. |
| Client & server error tracking | Sentry SDKs | Web (Next.js), Native (Expo), Server (Hono) | Capture context-rich errors with opt-in sampling; redact sensitive data; mirror Recovery & Crisis messaging when surfacing user-visible errors. |
| Uptime & incident monitoring | Better Stack | Fumadocs site, Server API, (optionally Web) | Configure calm alerting tiers so noise does not create stress; incidents must follow Decision Log + Recovery escalation playbook. |
| Caching / queueing | Redis (managed) | Server API only | Use for rate limiting, session caching, and background jobs; all cache misses must degrade gracefully. |
| Authentication | Better Auth | Server auth service, Web app, Native app | Server holds authority; clients consume tokens issued via Better Auth; recovery logic pauses auth-related prompts during crises. |
| Data layer | Drizzle ORM + PostgreSQL | Server API | Drizzle migrations run via Bun scripts (`bun run db:*`); Postgres holds single source of truth; apply UK-specific calculations inside `packages/domain-uk`. |
| UI system | shadcn/ui (with calm theming) | Web app only | Build components that align with UX Principles & Tone; avoid pressure-based patterns. |
| Mobile styling | Expo + Tailwind NativeWind stack (TBD) | Native app | Mirror shadcn tokens where sensible; maintain accessible defaults. |
| Documentation | Fumadocs (public), Starlight (internal) | apps/fumadocs, apps/docs | Keep governance docs in sync; automation compares content. |

## Implementation phases

1. **Server logging + caching**
   - Add `pino`, `hono-pino`, `pino-pretty` to `apps/server` via `bun install`.
   - Configure structured log middleware and mask sensitive fields.
   - Provision Redis and wrap with graceful fallbacks for cache misses/timeouts.

2. **Observability**
   - Install Sentry SDKs for server, web, native; centralise DSN config via environment variables validated in `packages/config`.
   - Configure Better Stack monitors for server API and `apps/fumadocs`; document alert policies in Decision Log.

3. **Auth & data**
   - Integrate Better Auth in server, expose typed hooks/packages for web/native clients.
   - Finalise Drizzle schema governance (migrations referencing Decision IDs) and ensure Postgres connection pooling respects fail-safe limits.

4. **Experience layer**
   - Adopt shadcn/ui in web app with tokens aligning to UX calm palette.
   - Define native styling approach mirroring the same tone without new pressure cues.

Track each addition in the Decision Log, citing this reference and the Governance Matrix row numbers it reinforces. |

## Data protection & API security

- **Transport layer:** All clients communicate with the server over HTTPS only. Native apps pin certificates where possible.
- **Auth & tokens:** Better Auth issues JWTs for user sessions; machine-to-machine calls (e.g., background workers, monitoring) receive scoped API keys also issued via Better Auth. Keys include roles (read-only, write, crisis-override) enforced by Hono middleware.
- **Spec-driven validation:** OpenAPI schemas double as runtime validators—requests/responses are validated server-side to prevent malformed payloads and reduce injection risk.
- **Field-level safeguards:** Highly sensitive values (benefit IDs, debt reference numbers, account balances) are encrypted at rest, redacted in logs, and never leave the server unmasked. SDKs expose helper methods that intentionally omit those fields unless explicitly required.
- **Audit logging:** All auth events (token issuance, API key rotation, failed auth attempts) are written to an append-only audit trail stored separately from application logs, supporting Public Trust & Founder Safeguards requirements.
- **Graceful degradation:** If auth/Redis/Sentry infrastructure is unavailable, the server falls back to cached public content and informs clients with calm messaging—never exposing raw errors.
- **Future partner access:** When trusted partners consume the API, the OpenAPI spec plus Better Auth-issued partner keys enforce rate limits, scopes, and monitoring hooks via Better Stack so any anomaly is caught quickly.
