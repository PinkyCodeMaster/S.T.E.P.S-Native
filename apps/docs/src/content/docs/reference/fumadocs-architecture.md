---
title: Fumadocs Architecture Blueprint
description: Plan for the public governance site powered by Fumadocs/Next.js.
---

## Mission

Provide a public, always-up-to-date location for the `/funadocs` governance documents so contributors and the community can hold the product accountable. Fumadocs must remain calm, accessible, and transparent, mirroring the canonical guidelines without exposing internal-only details.

## Core Principles

1. **Single source of truth** — the content under `apps/fumadocs/content/docs` mirrors `/funadocs` and is version-controlled.
2. **No proprietary logic** — Fumadocs hosts content and UX only; no business logic or calculations.
3. **Calm UX** — tone matches the Ethical Product Charter and UX Principles.
4. **Transparency** — surface last-updated timestamps, document history, and decision log references.
5. **Observability** — monitor uptime/performance using Better Stack; Sentry captures errors.

## Stack

| Concern | Decision | Notes |
| --- | --- | --- |
| Framework | Next.js + Fumadocs (MDX) | Already configured; MDX content per document.
| Styling | Tailwind/shadcn theme tuned for calm palette | Matches tone of voice.
| Search | Built-in Fumadocs search API | Indexed content only; no user data.
| Deployment | Static export / edge | Keeps costs low, resilience high.
| Monitoring | Better Stack + Sentry | Watch for downtime, record client errors.

## Content Governance

- Each governance doc maps 1:1 with MDX files under `apps/fumadocs/content/docs`.
- Contributors update both `/funadocs` canonical files and Fumadocs MDX together; discrepancies flagged during review.
- Decision Log references link to `apps/docs` entries for internal context.

## Accessibility & UX

- Provide clear navigation, breadcrumbs, and summaries; never use urgency or flashing colors.
- Include “Last updated” metadata on each page, referencing commit history.
- Offer downloadable versions (PDF/Plain text) for accessibility where feasible.

## Observability & Reliability

- Fumadocs deployments monitored by Better Stack; alerts match calm escalation policy.
- Sentry captures rendering/runtime errors; anonymised metrics determine if pages fail to load.
- Health check endpoint (static) returns version info for monitoring.

## Next Actions

1. Add metadata (last updated, document owners) to each MDX file.
2. Configure Better Stack monitors for the public site.
3. Ensure Fumadocs build process validates MDX structure and links to internal docs when necessary.
