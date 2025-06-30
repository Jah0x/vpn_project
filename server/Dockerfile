#################### build stage ####################
FROM node:18-slim AS build
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install

# исходники
COPY server ./server
COPY prisma ./prisma
COPY server/openapi.yaml ./openapi.yaml    

RUN npx prisma generate
RUN pnpm run build:server
RUN pnpm prune --prod

################### runtime stage ###################
FROM node:18-slim
WORKDIR /app

# бинарники + модуль
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/openapi.yaml ./openapi.yaml   

EXPOSE 4000
CMD ["node", "dist/index.js"]
