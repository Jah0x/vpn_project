# VPN Project

Этот репозиторий содержит полный стек сервиса управления VPN. Подробнее о структуре кода смотрите в `docs/`.

## Quick start

```bash
pnpm i
docker compose up -d
```

### Environment variables

```
VITE_API_BASE_URL=/api
SERVER_PORT=8080
DATABASE_URL=postgresql://vpn:changeme@postgres:5432/vpn?schema=public
STRIPE_SECRET_KEY=
```

## Логирование

В разработке используется `pino-pretty`, в продакшене — `pino-file-rotate`.
Все файлы располагаются в каталоге `/app/logs` и имеют имя вида
`app-YYYY-MM-DD.log`.

Основные переменные окружения:

- `LOG_LEVEL` — уровень логирования (`info`, `debug`, `error`).
- `LOG_FILE_ENABLED` — включение записи в файл (`true` по умолчанию).
- `PINO_PRETTY_DISABLE` — отключить форматирование вывода в консоль.

Если `LOG_FILE_ENABLED=false` или `PINO_PRETTY_DISABLE=true`,
логи выводятся только в stdout без красивого форматирования.
Изменения переменных вступают в силу после перезапуска сервиса.

Swagger docs: [http://localhost:80/api/docs](http://localhost:80/api/docs)

## Разработка/Запуск
- Скопируйте `.env.example` в `.env` и при необходимости отредактируйте.
- Запустите сервер командой `pnpm start:server`.
- Фронт запускается командой `pnpm --filter apps/main dev`.

Для учёта логов в процессе разработки используйте рекомендации из
[`docs/logging-guidelines.md`](docs/logging-guidelines.md).

### Hanko auth setup

- Сервис `hanko` стартует вместе с `docker compose up`.
- Укажите `HANKO_JWT_SECRET` в `.env` для проверки подписи токенов.
- Вход через Hanko доступен на странице логина и реагирует на событие `hankoAuthFlowCompleted`.

### ✨ Demo credentials

```
Логин: drbabv@zerologsvpn.com
Пароль: drbabv123
```

### Схема БД

```
User --1:M RefreshToken
User --1:M Vpn
```

### API: логин

При POST `/api/auth/login` сервер теперь возвращает JSON вида:

```json
{ "access_token": "<JWT>", "refresh_token": "<token>" }
```

`access_token` следует сохранять в `localStorage` под ключом `auth_token` и
передавать в заголовке `Authorization: Bearer <JWT>` во все защищённые запросы.

Для локального запуска выполните:

```
docker compose up -d --build
npm run seed
```

Для подготовки базы данных к тестированию добавлена отдельная команда
`npm run seed:test`. Она создаёт учётную запись администратора
```
Логин: Admin
Пароль: Admin123!
```
и тарифный план с id `pro` на этого пользователя.

## Администрирование

Тарифные планы можно управлять из админ‑панели:

```bash
docker compose up -d
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

Зайдите под учёткой `drbabv@zerologsvpn.com` / `drbabv123` и нажмите кнопку «Админка» (кнопка видна только при роли `ADMIN`). Она ведёт на поддомен `admin.zerologsvpn.com`, откуда доступна работа с тарифами по API `/api/admin/plans`.

## UID pool logic

Для выдачи VPN-конфигов заранее создаётся пул UID в таблице `PreallocatedUid`.
Команда `npm run seed` наполняет пул случайными значениями (минимум 100) и
использует первый свободный UID для администратора. При авторизации пользователь получает свободный UID из этого пула.
Если свободных значений нет, сервер возвращает ошибку `NO_UID_AVAILABLE`.

Таблица `PreallocatedUid` описывает статус каждого заранее сгенерированного UID:

| Поле       | Тип       | Назначение                                              |
|----------- |-----------|---------------------------------------------------------|
| `id`       | `Int`     | первичный ключ, автоинкремент                           |
| `uuid`     | `String`  | уникальный идентификатор для использования в VPN-конфиге|
| `isFree`   | `Boolean` | свободен ли UID для выдачи                              |
| `assignedAt`| `DateTime?` | время, когда UID был закреплён за пользователем       |
| `userId`   | `String?` | ссылка на пользователя, которому выдан UID             |

## Troubleshooting

### Пустая страница подписки

Если при переходе на `/subscription` отображается пустой экран,
проверьте ответ API `/api/public/plans` в DevTools. Он должен быть массивом.
При отсутствии данных убедитесь, что backend запущен и прокси‑настройка
Nginx корректно перенаправляет запросы к серверу. После правок перезапустите
сборку фронтенда командой `npm run build`.

## Локальная отладка

Запускайте `npm run dev` и открывайте `http://localhost:5173`.

## Дополнительные материалы
- [Политика конфиденциальности](docs/privacy-policy.md)
- [FAQ](docs/faq.md)

## CI / Проверка локально

```bash
pnpm docker:up          # поднимает nginx+backend для локал-теста
pnpm run curl:matrix    # быстрый smoke-тест
```


## Деплой фронтенда

После обновления кода на сервере необходимо пересобрать контейнер и очистить CDN:

```bash
docker compose up -d --build frontend
curl -X POST $CDN_PURGE_URL
```

## Диагностика

Для запуска линтера, тестов и сборки с сохранением логов выполните:

```bash
./scripts/diagnostics.sh
```

Все логи сохраняются в каталоге `logs/`.

### Сбор логов контейнеров

Для объединения логов всех контейнеров выполните:

```bash
./scripts/collect-logs.sh
```

Файл с логами будет создан в каталоге `logs/` и имеет имя вида
`containers_YYYY-MM-DD_HH-MM-SS.log`.

