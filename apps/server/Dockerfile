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

WORKDIR /app/apps/server
RUN pnpm --filter ./... install --frozen-lockfile
RUN pnpm run build:server && pnpm prune --prod

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
