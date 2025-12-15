---
title: Native Architecture Blueprint
description: Plan for the Expo/React Native client that consumes the SDK while supporting offline-first, calm mobile experiences.
---

## Mission

Deliver a mobile experience that remains calm, offline-capable, and aligned with UK-specific rules by consuming the generated SDK. The native app owns mobile UI, offline handling, local persistence, OS integrations, push notifications, and client-side UX validation. All core business logic stays on the server.

## Core Principles

1. **SDK-only networking** — all API interactions use the generated SDK; no ad-hoc fetch calls.
2. **Offline-first** — cache recent responses securely, surface clear offline states, and queue mutations until connectivity returns.
3. **Calm mobile UI** — styling mirrors web tone without sharing code; avoid haptics/vibrations that induce stress.
4. **Secure local storage** — encrypt sensitive data on device, expire caches quickly, never store server-side secrets.
5. **Push notification discipline** — all notifications originate from the server; app handles user consent, mute controls, and context-specific routing.

## Stack Decisions

| Concern | Decision | Notes |
| --- | --- | --- |
| Framework | Expo + React Native | Managed workflow for consistency.
| Navigation | Expo Router | Mirrors web routes for familiarity.
| Styling | NativeWind/Tailwind + custom tokens | Tokens aligned with UX docs; defined locally.
| State/query | TanStack Query + Zustand (for UI state) | Query layer wraps SDK and handles caching/offline queues.
| Offline storage | SecureStore (iOS), EncryptedSharedPreferences (Android) via expo-secure-store | Stores tokens, cached responses, queued mutations.
| Push notifications | Expo Notifications API | Tokens registered with server; server decides delivery.
| Error tracking | Sentry React Native | Captures exceptions with device context (anonymised).
| Deep linking | Expo Router config | Ensures notifications and external links land on correct screens.

## Offline & Sync Strategy

- SDK responses cached with timestamps; stale caches labeled clearly (“Updated 2 hours ago”).
- Mutations enqueue locally with idempotency keys; worker flushes queue when online.
- Connectivity watcher displays calm banner when offline and auto-retries in background.

## Theming & Accessibility

- Light/dark tokens defined in native app using CSS-like variables; respects system preference.
- Ensure text sizes scale with OS accessibility settings; test with Dynamic Type/Large Text.
- Avoid haptics or vibration for errors unless explicitly aiding accessibility.

## Push Notification Flow

1. User opts in → Expo push token sent to server via SDK.
2. Server stores token with scopes (marketing disabled by default).
3. Server worker sends only calm, recovery-supportive notifications.
4. App receives notification → routes user to context screen via Expo Router.
5. User can mute categories; preferences synced to server via SDK.

## CI/CD Touchpoints

- Pipeline installs SDK, runs lint/tests (including Detox/E2E), builds release artifacts (EAS), and verifies offline flows via automated tests.
- Distribution via EAS (internal testing) before App Store/Play Store release; release notes reference Decision Log IDs for governed features.

## Next Actions

1. Import generated SDK package into native app and build shared query hooks.
2. Configure TanStack Query persister with encrypted storage.
3. Set up Expo Notifications permissions flow + token registration endpoint via SDK.
4. Implement offline mutation queue respecting idempotency keys issued by server.
5. Document UX validation vs. server validation boundaries in future updates.

This blueprint keeps the native client production-ready, resilient, and aligned with the ownership boundaries.
