################ build stage ################
FROM node:20-alpine AS build
WORKDIR /app

# установки зависимостей
COPY package.json pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/
RUN corepack enable \
    && pnpm --filter ./... install --frozen-lockfile

# исходники
COPY ./apps/server ./apps/server
COPY prisma ./prisma

# сначала работаем из корня, где есть pnpm-lock.yaml
WORKDIR /app
# тянем только backend-workspace и её зависимости
RUN pnpm install --frozen-lockfile --filter "./apps/server" \
    # билдим
    && pnpm --workspace-root --filter "./apps/server" run build:server \
    # режем лишнее – только production-deps
    && pnpm prune --prod

# после всего — рабочая директория приложения
WORKDIR /app/apps/server

################ runtime stage ################
FROM node:20-alpine
RUN apk add --no-cache openssl ca-certificates

WORKDIR /app
COPY --from=build /app/apps/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/apps/server/openapi.yaml ./openapi.yaml

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
