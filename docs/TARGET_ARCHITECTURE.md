# SecureSoft Target Architecture

Last updated: 2026-07-05

This document defines the intended architecture. It is not a claim that everything is already implemented.

## Architecture principles

1. **Control plane and data plane are separate.** The product/backend decides accounts, subscriptions, devices and permissions. Xray/VPN runtime only receives the resulting access state.
2. **Clients do not build raw VPN configs manually.** Web, mobile and TV clients ask backend APIs for the minimal state/config they need.
3. **Runtime agents are replaceable.** XrayAgent is the first adapter. Future adapters must follow the same internal subscription contract.
4. **Every module is small enough for AI-assisted work.** A module must be documented so Codex/other agents can load only the relevant files.
5. **Sensitive data stays out of logs and AI prompts.** Tokens, JWTs, private keys, raw traffic and real customer identifiers must be redacted.

## Main components

### 1. Control plane: `vpn_project`

Responsibilities:

- account/session/auth integration;
- plan and subscription state;
- user/device ownership;
- admin panel;
- public web cabinet and Telegram webapp;
- API contracts for clients and internal agents;
- billing/payment/onramp integration;
- deployment scripts and operational docs.

Non-responsibilities:

- direct editing of Xray runtime state from frontend code;
- mobile native VPN implementation;
- TV browser rendering internals.

### 2. Mobile core: `app.securesoft`

Responsibilities:

- client auth flow integration;
- device registration and account-scoped storage;
- `POST /vpn/token` client flow;
- VPN session state machine;
- metrics queue and flush;
- push token registration and inbox;
- update policy checks;
- security/support/AI diagnostics boundaries.

Non-responsibilities:

- backend billing decisions;
- production Keychain/Keystore implementation unless native shell is in this repo;
- server-side Xray provisioning.

### 3. Runtime sync: `XrayAgent`

Responsibilities:

- pull active subscriptions from internal API;
- consume subscription delta/webhook events;
- upsert/delete Xray users through gRPC;
- expose health and Prometheus-style metrics;
- keep sync idempotent and recoverable.

Non-responsibilities:

- billing logic;
- UI;
- customer support flows;
- direct public API exposure.

### 4. TV access: `Securelink-VIDAA-Browser`

Responsibilities:

- VIDAA HTML5 app;
- device-code/QR binding;
- TV gateway/proxy behavior;
- TV-specific remote-control UX;
- TV device settings.

Non-responsibilities:

- account billing source of truth;
- raw VPN client implementation on TV OS;
- long-term subscription ownership.

## Target module boundaries in `vpn_project`

| Module | Owns | Does not own | Suggested files/area |
| --- | --- | --- | --- |
| Auth | Hanko/JWT/session lifecycle | Billing, VPN config | `apps/server/src/**auth**`, frontend login pages |
| Accounts | User profile and account state | Payment provider internals | server account routes/services |
| Billing | plans, subscription state, provider webhooks | Xray gRPC writes | server billing/subscription routes/services |
| VPN Provisioning | internal subscription snapshots, UID allocation, config delivery | frontend UI state | server VPN/subscription services, Prisma models |
| Devices | device registration, limits, revocation | Push runtime implementation | server device routes/services |
| Metrics | backend/client/agent observability | business decisions | metrics endpoints, dashboards, logs |
| Admin | plan/user/device management | public user UX | admin app/routes |
| Support/AI Diagnostics | redacted diagnostic summaries | raw logs/tokens/traffic | support routes, diagnostics helpers |

## API contract direction

The product should converge toward these contract families:

### Public client APIs

- `POST /api/auth/hanko`
- `POST /api/auth/refresh`
- `GET /api/account/me`
- `GET /api/subscription/status`
- `POST /api/devices/register`
- `POST /api/vpn/token`
- `POST /api/metrics/client`
- `GET /api/app/version`
- `GET /api/push/inbox`
- `POST /api/push/register`

### Internal APIs for agents

- `GET /internal/subs/active`
- `GET /internal/subs/changes?cursor=...&limit=...`
- `POST /internal/webhooks/register`
- `POST /internal/metrics/agent`

Internal APIs require service tokens and must not be exposed to browsers/mobile clients.

## Critical flows

### Flow A: user login and subscription state

1. User logs in through web/Hanko or mobile auth.
2. Backend creates/refreshes access and refresh tokens.
3. Client requests account/subscription state.
4. UI shows plan, device limit and connect eligibility.

### Flow B: VPN access provisioning

1. Backend determines active subscription/device eligibility.
2. Backend publishes current active subscription snapshot/change stream.
3. XrayAgent pulls changes or receives webhook.
4. XrayAgent idempotently applies users to Xray.
5. Metrics expose sync success/failure.

### Flow C: mobile one-tap connect

1. Mobile authenticates.
2. Mobile registers device.
3. Mobile calls `POST /api/vpn/token` with device/platform/app version.
4. Backend checks subscription/device limits and returns endpoint/auth material.
5. Mobile native bridge connects.
6. Mobile sends redacted metrics.

### Flow D: TV device binding

1. TV app requests `device_code`.
2. User confirms code in personal cabinet.
3. Backend binds TV device to account and issues TV-scoped tokens/settings.
4. TV gateway uses backend state and tunnel/proxy infrastructure.
5. User can revoke TV device from cabinet.

## Data ownership

| Data | Owner | Notes |
| --- | --- | --- |
| Users/accounts | `vpn_project` | Backend DB is authoritative. |
| Subscription plans/state | `vpn_project` | Payment provider events must be normalized here. |
| VPN runtime users | `XrayAgent` mirrors from `vpn_project` | Xray is runtime state, not source of truth. |
| Mobile device id | client + backend device table | Client stores generated id; backend validates/limits. |
| Push tokens | client + backend | Account-scoped; clear on logout/revoke. |
| TV device code/session | TV gateway + backend | Short-lived code, revocable device binding. |
| Metrics | backend/observability | Must be redacted and low-cardinality. |

## Release gates

A change is not ready unless:

- affected module has tests;
- public API changes are documented;
- migrations have rollback notes;
- no secrets are added to docs/logs/tests;
- `pnpm run ci:typecheck` passes for TypeScript changes;
- `pnpm test` or narrower touched test command passes;
- deployment impact is described in the PR.

## Open architecture questions

1. Should mobile native shell live in `app.securesoft` or in separate `mobile-native` repository?
2. Which backend API path names are final for mobile: existing `/api/*` style or current mobile-core draft names?
3. Which repository owns customer-facing support/AI diagnostics UI?
4. Where should shared OpenAPI/JSON schemas live so mobile, TV and agents generate types from one source?
5. Which environment is the official staging environment, and what data is safe for AI-assisted debugging?

Resolve these in issues before large implementation work.
