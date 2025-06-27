FROM node:18-alpine AS build
# TODO: configure log rotation via external agent (e.g., Vector/Fluent-bit)
WORKDIR /app
COPY package.json ./
RUN npm install
COPY server ./server
COPY prisma ./prisma
RUN npm run build:server
RUN npm prune --production

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]
