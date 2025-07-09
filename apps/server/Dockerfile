################ build stage ################
FROM node:20-alpine AS build
WORKDIR /app


# установки зависимостей
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
    && pnpm install --frozen-lockfile

# исходники
COPY src ./src
COPY prisma ./prisma
COPY openapi.yaml ./openapi.yaml
RUN pnpm run build:server && \
    pnpm prisma generate && \
    pnpm prune --prod

################ runtime stage ################
FROM node:20-alpine
RUN apk add --no-cache openssl ca-certificates

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/openapi.yaml ./openapi.yaml

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
