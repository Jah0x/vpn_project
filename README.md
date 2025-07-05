# VPN Project

Этот репозиторий содержит полный стек сервиса управления VPN. Подробнее о структуре кода смотрите в `docs/`.

## Разработка/Запуск
- Скопируйте `.env.example` в `.env` и при необходимости отредактируйте.
- Укажите переменную `TELEGRAM_BOT_TOKEN` для проверки подписи от Telegram.
- Запустите сервер командой `npm run start:server` и фронтенд `npm run dev`.
- Исправлена конфигурация nginx: актуальный upstream backend:4000, удалён дублирующий default_type во фронтенд-Nginx.

### ✨ Demo credentials

```
Логин: drbabv@zerologsvpn.com
Пароль: drbabv123
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
использует первый свободный UID для администратора. При регистрации или
авторизации через Telegram пользователь получает свободный UID из этого пула.
Если свободных значений нет, сервер возвращает ошибку `NO_UID_AVAILABLE`.

## Troubleshooting

### Пустая страница подписки

Если при переходе на `/subscription` отображается пустой экран,
проверьте ответ API `/api/public/plans` в DevTools. Он должен быть массивом.
При отсутствии данных убедитесь, что backend запущен и прокси‑настройка
Nginx корректно перенаправляет запросы к серверу. После правок перезапустите
сборку фронтенда командой `npm run build`.

## Дополнительные материалы
- [Политика конфиденциальности](docs/privacy-policy.md)
- [FAQ](docs/faq.md)
