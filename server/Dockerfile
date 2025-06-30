FROM node:18-alpine AS build
# TODO: configure log rotation via external agent (e.g., Vector/Fluent-bit)
WORKDIR /app

# Install dependencies with pnpm
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Application sources
COPY server ./server
COPY prisma ./prisma

# Generate Prisma client before compiling
RUN npx prisma generate
RUN pnpm run build:server

# Remove dev dependencies
RUN pnpm prune --prod

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/index.js"]
