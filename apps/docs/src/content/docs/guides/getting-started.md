---
title: Team Onboarding
description: Required steps for anyone contributing to the S.T.E.P.S platform.
---

Welcome! This guide keeps every contributor grounded in the founding intent of S.T.E.P.S—calm, recovery-first support for UK households. Finish each step before opening a pull request or design proposal.

## 1. Read the canonical documents

Review the `/funadocs` collection in this order:

1. Founding Vision & Purpose
2. Ethical Product Charter
3. Product Overview & Scope
4. Feature Inventory (Master List)
5. Recovery & Crisis Design Specification
6. UX Principles & Tone of Voice
7. UK Financial Reality Rules
8. Phased Roadmap & Evolution Plan
9. Behavioural Safety Rules
10. Decision Log template & rules

Note any tensions or risks and raise them early. Silence counts as acceptance.

## 2. Configure your environment

- Install dependencies from the repo root with `bun install` (never npm/yarn/pnpm).
- Run `bun run dev` once to ensure Turborepo caches tasks correctly.
- Copy environment examples under each app (e.g., `apps/server/.env.example`) and set realistic local values.
- Use the Astro `docs` app as your local reference for governance and engineering notes.

## 3. Working agreement

- **Document first.** Capture context in the Decision Log referencing the Governance Matrix before writing code.
- **Choose calm defaults.** If a feature might increase stress, pause and gather feedback from product and lived-experience reviewers.
- **No hidden work.** Draft ADRs or PRs in the open so others can apply behavioural safety and recovery reviews.
- **Opt-in power.** Higher-phase or high-risk capabilities remain behind feature flags until the documented readiness criteria are met.

## 4. Safety gates before merging

- Confirm your change references the relevant governance document numbers in the PR description.
- Ensure recovery/crisis flows include tone reviews and snapshots for banned language.
- For infrastructure or data changes, run through the Legal & Regulatory Boundary checklist and note any uncertainty.
- Update affected docs in `apps/docs` or `apps/fumadocs` to keep public and internal sources aligned.

## 5. Support & escalation

- Use the Decision Log to request arbitration when priorities conflict.
- Raise behavioural safety or UX tone concerns immediately—no change is “small” if it risks pressure or shame.
- When unsure, pick the calmer path, document why, and invite review in the next governance check-in.

Completing these steps signals that you understand the stakes of shipping for vulnerable families and that you accept the responsibility to guard calm, clarity, and dignity throughout the engineering process.
