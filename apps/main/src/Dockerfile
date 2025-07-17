FROM node:20-alpine AS build
WORKDIR /app

# Объявляем ARG для build-time переменной
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.2.0 --activate && pnpm install --frozen-lockfile
COPY . ./

# Важно: Vite забирает VITE_* из окружения во время build!
RUN npm run build

FROM nginx:1.29-alpine AS production
WORKDIR /usr/share/nginx/html
COPY src/nginx.conf /etc/nginx/nginx.conf
RUN awk '!x[$0]++' /etc/nginx/mime.types > /tmp/mime && \
    mv /tmp/mime /etc/nginx/mime.types
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
