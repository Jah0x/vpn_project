FROM node:18-alpine AS build
WORKDIR /app

# устанавливаем prod-зависимости точно по lock-файлу
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# дальше исходный код
COPY . .

# сборка production-бандла
RUN npm run build
# --------------------------------------
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
