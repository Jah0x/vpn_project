# AGENTS.md — SecureSoft AI/Codex working rules

Last updated: 2026-07-05

This file is the entry point for Codex and other AI coding agents working inside `Jah0x/vpn_project`.

## Read first

Before editing code, read these docs in order:

1. `docs/SECURESOFT_PROJECT_MAP.md` — which repository owns which part of SecureSoft.
2. `docs/TARGET_ARCHITECTURE.md` — intended architecture and module boundaries.
3. `docs/AI_MODULE_DEVELOPMENT_GUIDE.md` — token-saving workflow for module-by-module AI development.
4. `README.md` — local run/deploy notes.
5. `package.json` — current commands and package manager.

## Current project facts

- Repository: `Jah0x/vpn_project`.
- Role: main SecureSoft control-plane/product repository.
- Package manager: `pnpm@9.2.0`.
- Node target: Node 20.
- Main app areas:
  - `apps/main` — main React/Vite web app.
  - `apps/tg-webapp` — Telegram webapp.
  - `apps/server` — backend/API.
  - `prisma` — database schema/migrations/seeds.
  - `scripts` — deployment, diagnostics and maintenance scripts.
  - `docs` — architecture, operations and developer docs.

## Important related repositories

- `Jah0x/app.securesoft` — mobile TypeScript core for Android/iOS VPN app.
- `Jah0x/XrayAgent` — syncs subscriptions into Xray through gRPC.
- `Jah0x/Securelink-VIDAA-Browser` — VIDAA Smart TV client and TV gateway.
- `Jah0x/Vpn-v2` — legacy/reference skeleton; do not treat as source of truth unless a migration task says so.

## How AI agents should work

One task must stay inside one module.

Use this format before editing:

```md
Task: <one sentence>
Module: <module name>
Repo: Jah0x/vpn_project
Files to read first:
- <path>
Do not edit:
- <path or module>
Acceptance checks:
- <command>
Security constraints:
- no secrets/tokens/raw user data in logs, docs or tests
```

Do not load the whole repository unless the task is explicitly an architecture audit. Prefer small context packets from `docs/AI_MODULE_DEVELOPMENT_GUIDE.md`.

## Commands

Use the narrowest useful check for the change.

```bash
pnpm i
pnpm run ci:typecheck
pnpm test
pnpm run build
```

For server-only work:

```bash
pnpm run build:server
pnpm test -- --runInBand
```

For frontend-only work:

```bash
pnpm run build:main
pnpm run lint
```

For full smoke where Docker is needed:

```bash
pnpm docker:up
pnpm run curl:matrix
```

## Coding rules

- Keep TypeScript strict and avoid `any` unless the module already requires it and the reason is documented.
- Do not add new UI libraries without explicit approval.
- Do not reformat unrelated files.
- Use Conventional Commits in branch/commit messages.
- Update `README.md` or `docs/` when public API, deploy behavior, environment variables or module ownership changes.
- Add or update tests for every behavior change.

## Security rules

Never commit or paste into AI prompts:

- production `.env` values;
- JWT/access/refresh tokens;
- private keys;
- payment secrets;
- SSH keys;
- raw customer data;
- raw VPN traffic;
- real server credentials.

Logs, metrics, AI diagnostics and support payloads must redact tokens, secrets, private keys and personal identifiers unless there is a documented safe reason.

## PR checklist

Every PR should state:

- module and scope;
- files touched;
- checks run;
- deployment impact;
- rollback/migration notes when relevant;
- docs updated or why docs were not needed;
- security impact.

## When unsure

If a task crosses module boundaries, split it into separate PRs. If ownership is unclear, update `docs/SECURESOFT_PROJECT_MAP.md` or create an architecture issue before coding.
