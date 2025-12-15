---
title: Governance Matrix
description: Map the canonical S.T.E.P.S governance documents to concrete engineering and delivery checks.
---

This matrix links every `/funadocs` governance document to day-to-day engineering checks so architectural or delivery work inside the S.T.E.P.S monorepo remains accountable to the founding rules. Treat it as a living index: whenever a change request emerges, reference the relevant row, apply the required safeguards, and record proof in the Decision Log.

## How to Use This Matrix

1. Identify the planned change (scope, UX, data, recovery, infrastructure, rollout, etc.).
2. Locate the governing document(s) in the table.
3. Convert the listed obligations into requirements for design, code, reviews, and testing. If a safeguard is missing, add it before merging.
4. Capture the rationale and compliance evidence inside the Decision Log entry or PR template.
5. When documents appear to conflict, defer to the Ethical Product Charter, Recovery & Crisis spec, and Behavioural Safety Rules—in that order—and record the trade-off.

## Document Obligations & Engineering Checks

| # | Governance document | Key obligations | Engineering / process checks | Primary repo touchpoints |
| - | ------------------- | --------------- | ---------------------------- | ------------------------ |
| 1 | Founding Vision & Purpose | Calm, recovery-first companion; success measured in reduced stress and clearer decisions. | Require ADR/PR summaries to state how the change reduces stress or increases clarity; reject metrics-driven features that sacrifice calm. | ADRs, README narrative, UX copy review. |
| 2 | Ethical Product Charter | Non-negotiable guardrails for monetisation, behaviour, data, safeguarding, AI. | Add an “Ethics” checkbox to PR templates; reviewers confirm no paywalls, dark patterns, or coercive AI; secure storage only. | `.github/pull_request_template`, UX components, backend policy modules. |
| 3 | Product Overview & Scope | Defines in-scope problem space; no drift into banking/credit. | Tag issues with scope categories; CI warns if feature directories not in the Feature Inventory are added without approval. | Issue templates, Turborepo config, feature flags. |
| 4 | Feature Inventory | Authoritative list of features, their phase, and alignment. | Update inventory before coding; enforce Decision Log ID references when creating new feature folders or toggles; tests assert locked phases stay disabled. | `apps/*/features`, shared domain packages, Decision Log folder. |
| 5 | Recovery & Crisis Design Spec | “Something went wrong” entry, crisis mode, de-escalation copy rules. | Snapshot tests for recovery UI copy; integration tests verifying crisis mode hides non-essential UI; QA checklist for every recovery touch. | `apps/native`, `apps/web`, recovery state machines. |
| 6 | UX Principles & Tone | Calm, plain-English tone; banned words; neurodiverse support. | Maintain lintable glossary rejecting words like “urgent/failure”; enforce “one-decision-per-screen”; require copy review for user-facing text. | Localization files, design system components. |
| 7 | UK Financial Reality Rules | Accurate UC modelling, UK calendars, rent/UC handling, debt priority messaging. | Centralise calculations inside `packages/domain-uk`; unit tests cover UC taper, bank holidays, safe-to-spend; label uncertain results as estimates. | `packages/domain-uk`, scheduling services. |
| 8 | Phased Roadmap & Evolution Plan | Features gated by phase readiness; later-phase features optional. | Feature flags keyed to roadmap phases; CI ensures higher-phase modules check configuration before rendering; release notes cite phase criteria. | Feature-flag service, release process docs. |
| 9 | Behavioural Safety Rules | Ban fear/shame mechanics; maintain user control and consent. | Automated UI checks for colors/keywords; behavioural-safety reviewer required for nudges/notifications; notification service enforces frequency caps. | UX components, notification scheduler, gamification modules. |
| 10 | Decision Log | Record context, options, ethics, reversibility for major choices. | Store entries under `/apps/docs/src/content/docs/reference/decisions`; commit hooks require Decision ID references in major PRs. | Decision Log docs, PR template. |
| 11 | Contributor Onboarding Guide | Mandatory reading order; encourages challenge and restraint. | Update onboarding automation to prompt reading acknowledgements; embed guide link in `CONTRIBUTING.md`. | `CONTRIBUTING.md`, onboarding scripts. |
| 12 | Founder Safeguards & Power Limits | Limits unilateral decisions; cooling-off periods; dual approvals for high-risk change. | Workflow automation adds required delays to monetisation/data/AI PRs; CODEOWNERS enforce multi-approver merges. | Issue tracker workflow, CODEOWNERS. |
| 13 | Future Ethics Review | Hard gates for AI, open banking, consolidation. | Add `ethics-review-required` label; require attached review artefact before enabling high-power modules; deployment scripts block without artefact. | Infra toggles, ADR repository. |
| 14 | Public Trust & Transparency | Transparent commitments (no shame, free help, data honesty). | Update changelog “User-facing promises” section whenever behaviour or data usage changes; ensure in-app settings link to commitments. | In-app docs module, website content. |
| 15 | Legal & Regulatory Boundary Statement | Clarifies non-advice role; UK-only scope; disclaimers for uncertainty. | UI components display legal disclaimers; compliance review for flows that could imply regulated advice; tests ensure warnings show when modelling uncertain. | UI disclaimers, backend explanation services. |
| 16 | S.T.E.P.S Framework Definition | Defines stage meanings and movement rules. | Domain model stores user-declared step; analytics cannot auto-promote; UX must request consent before suggesting a new step. | Domain schemas, progress indicators. |
| 17 | Debt Handling & Priority Rules | Snowball defaults, CCJ override, hardship templates, flagged future methods. | Deterministic debt ordering service with CCJ override; library of hardship templates; mark experimental features `enabled: false` until governance review. | Debt planning package, template storage. |
| 18 | Behaviour + Tone Cross-refs | Recovery spec + Behavioural Safety + UX interplay. | Any recovery/tone PR cites these docs in description and QA plan; CI warns when keywords missing. | PR template, QA checklist. |

## Enforcement & Review

- **Ownership:** Assign a maintainer per document; PRs affecting a governed area require their approval.
- **Automation:** Extend CI to parse PR descriptions for referenced document IDs; fail builds when required references are missing.
- **Audits:** Run quarterly governance audits comparing shipped work to this matrix; record findings via the Decision Log template.
- **Updates:** When `/funadocs` change, update this matrix in the same PR and summarise deltas for contributors.

Missing references or safeguards should block merges until mitigations are documented.
