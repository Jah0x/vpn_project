FROM node:18-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npx tsc

FROM node:18-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY subs.db ./subs.db
EXPOSE 8080
CMD ["node", "dist/index.js"]
