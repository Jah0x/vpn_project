###########################  build stage  ###########################
FROM node:18-alpine AS build
WORKDIR /app

# 1) ДО установки node-модулей тянем совместимость OpenSSL 1.1
RUN apk add --no-cache libssl1.1-compat              # <-- главное отличие

# 2) PNPM + deps
COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install

# 3) исходники + Prisma
COPY server ./server
COPY prisma ./prisma
RUN npx prisma generate
RUN pnpm run build:server
RUN pnpm prune --prod

###########################  runtime stage  ###########################
FROM node:18-alpine
WORKDIR /app

# 4) runtime-образу тоже нужен libssl1.1
RUN apk add --no-cache libssl1.1-compat              # <-- ещё раз

COPY --from=build /app/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/index.js"]
