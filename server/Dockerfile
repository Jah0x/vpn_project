#################### build stage ####################
FROM node:18-bullseye AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# исходники
COPY server ./server
COPY prisma ./prisma
COPY server/openapi.yaml ./openapi.yaml    

RUN pnpm run build:server
RUN pnpm prune --prod

################### runtime stage ###################
FROM node:18-bullseye
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends libssl1.1 ca-certificates && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# бинарники + модуль
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/openapi.yaml ./openapi.yaml
RUN corepack enable && pnpm prisma generate

EXPOSE 4000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
