# Subscription Server

Сервис предоставляет строку подписки по UUID и позволяет добавлять новые записи.

## Запуск

```bash
npm install
npm run start
```

## Эндпойнты

- `GET /:uuid` – возвращает строку подписки при наличии
- `POST /add` – добавляет или обновляет подписку

## Сидинг

Файл `seed.json` содержит массив записей вида `{ "uuid": "...", "subString": "vless://..." }`.
Команда `npm run seed` добавит их в базу.
