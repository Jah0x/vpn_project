# ---  STAGE 1: deps  ---------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# ⬇️  Копируем всё, что нужно pnpm для решения зависимостей
COPY pnpm-lock.yaml package.json ./

# ⬇️  Копируем манифесты workspace-ов (без исходников —
#     это быстро, и кэш на deps не будет ломаться каждый коммит)
COPY apps/server/package.json apps/server/
# (добавь package.json других пакетов, если надо)

RUN corepack enable && pnpm install --frozen-lockfile
# └── node_modules на корневом уровне

# ---  STAGE 2: билд backend  -------------------------------------
FROM node:20-alpine AS build-backend
WORKDIR /app

# Забираем node_modules из предыдущего слоя
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml \
                 /app/package.json ./

# ⬇️  Копируем реальные исходники после deps-кэша
COPY apps/server ./apps/server
COPY prisma ./prisma

# Генерим Prisma и компилим TypeScript
RUN pnpm --filter "./apps/server" run build:server

# ---  STAGE 3: прод-образ  ---------------------------------------
FROM node:20-alpine
WORKDIR /app/apps/server

COPY --from=build-backend /app/apps/server/dist ./dist
COPY --from=build-backend /app/node_modules ./node_modules
COPY --from=build-backend /app/prisma ./prisma            # если нужно миграциям
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
