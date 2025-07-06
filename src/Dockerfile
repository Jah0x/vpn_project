FROM node:20-alpine AS build
WORKDIR /app

# Объявляем ARG для build-time переменной
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . ./

# Важно: Vite забирает VITE_* из окружения во время build!
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
COPY src/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
