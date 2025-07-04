FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
# Используем legacy-peer-deps для обхода конфликтов зависимостей React
RUN npm install --legacy-peer-deps
COPY . ./
RUN npm run build

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist .
# Копируем пользовательский конфиг Nginx с SPA-fallback
COPY src/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
