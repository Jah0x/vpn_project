# AI Module Development Guide

Last updated: 2026-07-05

This guide exists so Codex, ChatGPT, Claude, Gemini or another coding agent can work on SecureSoft without loading the whole project and burning tokens.

## Core rule

One task = one module = one context packet = one PR.

Do not ask an AI agent to "study the whole project and fix everything". Give it a narrow module, exact files, contracts and acceptance checks.

## Recommended local Codex workflow

### 1. Start from the module packet

Before opening code, prepare a short packet:

```md
Task: <one sentence>
Module: <Auth/Billing/VPN Provisioning/Xray Sync/Mobile Push/etc.>
Repo: <owner/repo>
Files to read first:
- <path 1>
- <path 2>
Do not edit:
- <paths or modules>
Expected behavior:
- <bullet>
Acceptance checks:
- <commands>
Docs to update:
- <doc path>
Security constraints:
- no tokens/logs/secrets in output
```

Paste only that packet into the agent. Add code files only when the agent asks for them or when they are listed in the packet.

### 2. Use small-context prompts

Good prompt:

```text
Work only on Billing subscription status in Jah0x/vpn_project.
Read docs/TARGET_ARCHITECTURE.md and the files listed below.
Do not touch frontend styling or XrayAgent.
Add tests and update docs if API response shape changes.
```

Bad prompt:

```text
Study the whole SecureSoft project and improve everything.
```

### 3. Keep the agent inside the module

If the agent wants to edit unrelated files, stop and split the task.

Examples:

- Billing task must not redesign UI.
- Xray sync task must not change payment logic.
- Mobile push task must not change backend subscription schema.
- TV gateway task must not change mobile VPN state machine.

## Standard module contract

Create or update a module doc when a module becomes important:

```md
# Module: <Name>

Owner repo: <repo>
Owner paths: <paths>
Purpose: <why it exists>
Inputs: <API/events/storage>
Outputs: <API/events/storage>
State owner: <DB/table/cache/client storage>
Security constraints: <secrets, auth, redaction>
Tests: <commands>
Run locally: <commands>
Related docs: <links>
Open questions: <list>
```

Recommended location:

```text
docs/modules/<module-name>.md
```

## Context packets by repository

### `Jah0x/vpn_project`

Use for:

- web cabinet;
- server API;
- billing/subscription;
- Hanko auth;
- Telegram webapp;
- admin panel;
- deployment scripts;
- shared product architecture.

Default files to read first:

- `README.md`
- `AGENTS.md`
- `package.json`
- `docs/SECURESOFT_PROJECT_MAP.md`
- `docs/TARGET_ARCHITECTURE.md`
- module-specific files only after that

Default checks:

```bash
pnpm i
pnpm run ci:typecheck
pnpm test
pnpm run build
```

For a narrow backend-only task, prefer:

```bash
pnpm run build:server
pnpm test -- --runInBand
```

### `Jah0x/app.securesoft`

Use for:

- mobile TypeScript core;
- API client contracts;
- VPN state machine;
- metrics queue;
- push/update/security/support modules.

Default files to read first:

- `README.md`
- `MOBILE_APPS_SPEC.md`
- `package.json`
- `src/index.ts`
- one module under `src/modules/`
- matching tests under `tests/`

Default checks:

```bash
npm ci
npm run lint
npm test
npm run build
```

### `Jah0x/XrayAgent`

Use for:

- syncing active subscriptions to Xray;
- webhook/delta/full sync;
- gRPC HandlerService/StatsService;
- agent metrics/health.

Default files to read first:

- `README.md`
- `docs/env.md`
- `docs/sync.md`
- `docs/ports.md`
- `package.json`
- module-specific source files

Default checks:

```bash
npm ci
npm run build
npm test
```

### `Jah0x/Securelink-VIDAA-Browser`

Use for:

- VIDAA HTML5 TV client;
- TV gateway/proxy;
- QR/device-code binding;
- TV remote-control UX.

Default files to read first:

- `README.md`
- `docs/00-spec-overview.md`
- `docs/01-architecture.md`
- backend or tv-client module files for the exact task

Default checks depend on changed area:

```bash
# Backend
cd backend && pytest

# TV client
cd tv-client && npm test && npm run build
```

## Branch and PR rules

Use small branches:

```text
feat/<module>-<short-task>
fix/<module>-<short-task>
docs/<module>-<short-task>
refactor/<module>-<short-task>
```

PR body must include:

```md
## Summary
- ...

## Scope
Module: ...
Touched paths: ...
Not touched: ...

## Checks
- [ ] command/result

## Security
- [ ] no secrets/tokens/logs added
- [ ] auth rules unchanged or documented
- [ ] logs/metrics redacted

## Docs
- [ ] README/docs updated or not needed
```

## Token-saving rules for local AI work

1. Do not paste `package-lock.json`, `pnpm-lock.yaml`, generated files, build outputs or logs unless the error is inside them.
2. Do not paste full folders. Paste file names and the exact file content only when needed.
3. Give the agent the exact test failure first, then only the files involved.
4. Prefer asking for a patch plan before asking for code.
5. Ask for "minimal diff" and "do not reformat unrelated files".
6. Ask the agent to list assumptions before editing.
7. Keep separate chats for separate modules.
8. When switching modules, start a new session and paste the module packet again.

## Security rules for AI agents

Never give an AI agent:

- production `.env`;
- real JWT/access/refresh tokens;
- private keys;
- customer personal data;
- raw VPN traffic;
- real payment webhook payloads with identifiers;
- SSH keys;
- server credentials.

Use redacted examples:

```env
INTERNAL_AGENT_TOKEN=redacted
DATABASE_URL=postgresql://user:password@host:5432/db
JWT_SECRET=redacted
```

## Definition of done for module work

A module change is done when:

- code is limited to the module boundary;
- tests cover happy path and at least one failure path;
- docs/contracts are updated;
- local checks are listed in PR;
- no unrelated formatting churn;
- migration or deployment impact is stated;
- next module is not mixed into the same PR.

## Suggested first cleanup tasks

1. Create `docs/modules/auth.md` from current auth implementation.
2. Create `docs/modules/subscriptions.md` and mark current source of truth for subscription state.
3. Create `docs/modules/vpn-provisioning.md` and define the internal API consumed by `XrayAgent`.
4. Align `app.securesoft` mobile API names with the backend API names.
5. Decide whether `Vpn-v2` is archived, migrated or ignored.
6. Add an OpenAPI/JSON schema source of truth for public and internal APIs.
