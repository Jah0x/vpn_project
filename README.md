# VPN Project

Этот репозиторий содержит полный стек сервиса управления VPN. Подробнее о структуре кода смотрите в `docs/`.

## Разработка/Запуск
- Скопируйте `.env.example` в `.env` и при необходимости отредактируйте.
- Запустите сервер командой `npm run start:server` и фронтенд `npm run dev`.
- Исправлена конфигурация nginx: актуальный upstream backend:4000, удалён дублирующий default_type во фронтенд-Nginx.

### ✨ Demo credentials

```
Логин: admin@zerologsvpn.com
Пароль: admin123
```

Для локального запуска выполните:

```
docker compose up -d --build
npm run seed
```

## Сборка

```bash
npm ci            # устанавливает зависимости (axios теперь в prod)
npm run build     # vite build без ошибок
```
