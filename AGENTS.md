# AGENTS.MD – Guide for the OpenAI Codex Agent

> **Project:** `vpn_project`
> **Repo:** <https://github.com/Jah0x/vpn_project>
> **Primary goal:** Continue building a full‑stack VPN dashboard without changing the existing visual style (TailwindCSS + React).

### Менеджер пакетов: pnpm v9.2.0 (фиксировано)

---

## 1. What the Agent Should Know

| Topic | Detail |
|-------|--------|
| **Stack** | *Frontend*: React 18 + Vite + TailwindCSS 3/4<br>*Backend*: Node 18 + Express (inside `/server`)<br>*Build tools*: Vite, PostCSS, ESLint, Prettier |
| **Package commands** | `pnpm run dev` – local dev (Vite)<br>`pnpm run format` – Prettier<br>`pnpm run build` – production build<br>`pnpm run start:server` – start Express API |
| **Design system** | Tailwind utility classes only. **Do not** introduce new UI libraries. Re‑use colours, spacing & typography already defined in `tailwind.config.js`. |
| **Folder map** | `/src` – React front‑end<br>`/server` – Express API<br>`/public` – static assets<br>`/docs` – any autogenerated docs |
| **Environment variables** | `.env` (root):
```
VITE_API_BASE_URL=http://localhost:4000/api
SERVER_PORT=4000
NODE_ENV=development
```
(Add new envs with `VITE_` prefix for frontend.) |

---

## 2. Coding Conventions

1. **Naming**  
   * Files: kebab‑case (`vpn-card.tsx`).  
   * React components: PascalCase.  
   * Hooks: `useSomething`.
2. **Imports**  
   Absolute from `src/` using `@/` alias (see `vite.config.ts`).
3. **Styling**  
   Use Tailwind classes; extend only via `tailwind.config.js` → `theme.extend`.
4. **Type safety**  
   Use TypeScript *strict* mode everywhere.
5. **Commits**  
   Conventional Commits (e.g. `feat(api): add VPN status endpoint`).

---

## 3. Typical Tasks for the Agent

| Category | Example prompt the maintainer may give |
|----------|--------------------|
| **Backend** | *“Add a `/api/vpn/restart/:id` POST route that calls the shell script `scripts/restart.sh` with the given ID and returns JSON status.”* |
| **Frontend** | *“Create a `<VpnStatusBadge />` component that shows the status (`online`, `offline`, `warning`) with the existing colour palette.”* |
| **Testing** | *“Write Jest tests to cover the new restart route (happy + error paths).”* |
| **Docs** | *“Generate Swagger docs for all `/api/vpn/*` endpoints and expose them at `/api/docs`.”* |
| **UI** | *"Create `<VpnStatusBadge />` component"* |
| **i18n** | *"Add new locale string"* |
| **DevOps** | *"Deploy to staging via Fly.io"* |

When working on tasks the agent **must**:
- Pass `pnpm run lint` and `pnpm test`.
- Keep 100 % TypeScript coverage for touched files.
- Update README or `/docs` if public API changes.

---

## 4. Clarifying Questions the Agent Should Ask Automatically

1. *Security*: _Is authentication required for this endpoint?_
2. *Data shape*: _What exact JSON schema should the response follow?_
3. *UX copy*: _Provide the Russian & English label text for the new component._

---

## 5. DSL / Function‑calling Interface

If the repo integrates with OpenAI function calls later, follow this schema (example):
```jsonc
{
  "name": "restartVpn",
  "description": "Restart a VPN instance by its internal ID",
  "parameters": {
    "type": "object",
    "properties": {
      "vpnId": {
        "type": "string",
        "description": "Internal MongoID of the VPN"
      }
    },
    "required": ["vpnId"]
  }
}
```
Place schemas in `./server/openai/schemas` for auto‑loading.

---

## 6. How To Run Locally (cheat‑sheet)

```bash
# 1. clone & install
git clone git@github.com:Jah0x/vpn_project.git
cd vpn_project && npm install

# 2. copy env
cp .env.example .env  # then adjust

# 3. start everything
pnpm run start:server &
pnpm run dev
```

---

## 7. Deployment Targets

| Stage | URL | Tool |
|-------|-----|------|
| **Preview** | `*.vercel.app` | Vercel (frontend) |
| **Staging** | `staging.vpn‑dash.io` | Docker, Fly.io |
| **Prod** | `vpn‑dash.io` | Kubernetes cluster |

Deployment triggered by pushing to branches:
- `main` → **Staging**
- `release/*` → **Prod**

---

## 8. Roadmap Snapshot (2025‑Q3 → Q4)

1. Complete **Session management & billing** integration.
2. Containerize VPN orchestrator (WireGuard) with secure secrets.
3. Mobile‑first responsive overhaul.
4. Internationalisation (RU ⇆ EN).  

---

### Last updated: 26 June 2025

