################ build stage ################
FROM node:20-alpine AS build
WORKDIR /app

# установки зависимостей
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
    && pnpm install --frozen-lockfile

# исходники
COPY ./apps/server ./apps/server

WORKDIR /app/apps/server
RUN pnpm run build:server && \
    pnpm prisma generate && \
    pnpm prune --prod

################ runtime stage ################
FROM node:20-alpine
RUN apk add --no-cache openssl ca-certificates

WORKDIR /app
COPY --from=build /app/apps/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/server/prisma ./prisma
COPY --from=build /app/apps/server/openapi.yaml ./openapi.yaml

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
