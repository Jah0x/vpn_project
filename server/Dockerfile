################ build stage ################
FROM node:18-bullseye AS build
WORKDIR /app

# зависимости
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# исходники
COPY server ./server
COPY prisma ./prisma
COPY server/openapi.yaml ./openapi.yaml
RUN pnpm run build:server
RUN pnpm prisma generate

################ runtime stage ################
FROM node:18-bullseye
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends libssl1.1 ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app .
RUN mv server/dist ./dist

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/index.js"]
