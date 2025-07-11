# ── STAGE 1: deps ────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# ▾ Файлы, необходимые pnpm, чтобы посчитать граф зависимостей
COPY pnpm-lock.yaml package.json ./

# ▾ Манифесты пакетов-workspace-ов (без исходников)
COPY apps/server/package.json apps/server/
#  (добавьте сюда package.json остальных пакетов, если нужно)

# Устанавливаем зависимости
RUN corepack enable && pnpm install --frozen-lockfile
# └─ node_modules поселились на корневом уровне /app

# ── STAGE 2: build-backend ───────────────────────────────────────
FROM node:20-alpine AS build-backend
WORKDIR /app

# ←  ОБЯЗАТЕЛЬНО: в каждом новом FROM нужно снова включить Corepack
RUN corepack enable                 # или: npm i -g pnpm@8

# Забираем готовые node_modules и lock-файлы
COPY --from=deps /app/node_modules   ./node_modules
COPY --from=deps /app/pnpm-lock.yaml /app/package.json ./

# ▾ Копируем реальные исходники после deps-кэша
COPY apps/server ./apps/server
COPY prisma      ./prisma

# Генерируем Prisma и компилируем TypeScript
RUN pnpm --filter "./apps/server" run build:server

# ── STAGE 3: prod ────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app/apps/server

# Минимально — только скомпилированный билд + зависимости рантайма
COPY --from=build-backend /app/apps/server/dist ./dist
COPY --from=build-backend /app/node_modules     ./node_modules
COPY --from=build-backend /app/prisma           ./prisma   # если нужны миграции

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
