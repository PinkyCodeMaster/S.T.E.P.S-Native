---
title: Web Architecture Blueprint
description: Plan for the Next.js + shadcn/ui client that consumes the generated SDK while staying calm, accessible, and UK-safe.
---

## Mission

Deliver a calm, recovery-first web experience that renders trusted information from the server via the generated SDK. The web app owns UI logic, routing, client-side state, UX validation, and platform-native styling (light/dark themes). All correctness remains on the server.

## Core Principles

1. **SDK-only data access** — every API call goes through the generated TypeScript SDK; no fetch wrappers.
2. **Calm design system** — shadcn/ui components themed for light + dark modes with behavioural safety constraints.
3. **Accessibility + resilience** — progressive enhancement, graceful loading states, offline messaging when API unreachable.
4. **Separation of concerns** — UI state + UX validation in web; business logic stays server-side.
5. **Observability without stress** — capture client errors (Sentry) with opt-in sampling and calm user messaging.

## Stack Decisions

| Concern | Decision | Notes |
| --- | --- | --- |
| Framework | Next.js 16 App Router | Server components for data-heavy screens, client components for interactions.
| Styling | Tailwind v4 + shadcn/ui | Custom theme tokens for light/dark; tokens live in web app only.
| Theming | CSS variables + `next-themes` | Respect OS preference, allow manual toggle; maintain calm palette.
| State | React Server Components + client hooks (Zustand/TanStack Query TBD) | Query hooks wrap SDK calls, handle retries + UX loading.
| Forms | React Hook Form + Zod (UX validation only) | Field-level UX checks; final validation occurs server-side.
| Routing | App Router segments aligned with product flows | Recovery entry points always accessible.
| Data access | Generated SDK from `/sdk` | Auto-updated per server release; version pinned in `package.json`.
| Error tracking | Sentry browser SDK | Captures user-facing issues with anonymised context + correlation IDs.
| Feature flags | Remote config fetched via SDK (read-only) | Aligns with Roadmap phases; no local overrides.

## shadcn/ui Strategy

- Generate components within `apps/web` only; no cross-app sharing.
- Wrap shadcn primitives in domain-specific components that enforce calm copy, limited color usage, and accessible interactions.
- Define theme tokens reflecting light/dark palettes referenced in UX docs; tokens are duplicated for native to maintain familiarity but not shared code.

## Light & Dark Mode

- Use CSS variables to define `--color-bg`, `--color-text`, etc., with high accessibility contrast.
- Default to user OS preference; provide toggle stored in local storage.
- Ensure dark mode never relies on harsh reds or flashing indicators; focus on muted teals/greens per behavioural safety rules.

## Data Flow & Error Handling

1. User navigates → RSC fetch triggers SDK call (server-side) using user token from cookies.
2. Response hydrated to client component; any mutation uses SDK mutation hooks with optimistic UI optional but reversible.
3. On API failure, show calm fallback (“We’re having trouble – your plan is safe”) and log error to Sentry with correlation ID.
4. Offline detection triggers banner telling users data may be stale; encourage retry without pressure.

## Push Notifications & Real-time Updates

- Web receives push notifications via browser push only when user opts in; server issues them via background jobs.
- For real-time state (e.g., new letters), poll via SDK with ETag caching; websockets only if necessary and behind SDK helpers.

## CI/CD Touchpoints

- Pipeline installs SDK, runs lint/tests, builds Next.js app, runs Lighthouse/Pa11y audits for accessibility, and deploys to staging before production.
- Visual regression tests ensure shadcn theme changes don’t introduce stress-inducing colors or layouts.

## Next Actions

1. Import generated SDK package into `apps/web` and scaffold data fetching hooks.
2. Install shadcn/ui + Tailwind v4, define theme tokens for light/dark in `apps/web`.
3. Wire `next-themes` for mode toggling and persist preference.
4. Configure Sentry + Better Stack RUM (if used) with calm sampling rates.
5. Document UX validation vs. server validation boundaries in this doc’s future update.

Following this blueprint keeps the web client production-ready, calm, and compliant while respecting repository boundaries.
