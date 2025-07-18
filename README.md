# VPN Project

Этот репозиторий содержит полный стек сервиса управления VPN. Подробнее о структуре кода смотрите в `docs/`.
### Менеджер пакетов: pnpm v9.2.0 (фиксировано)


## 🚀 Быстрая установка на сервер

### Автоматическая установка (рекомендуется)

**Сервер:** 212.34.146.77  
**Домен:** zerologsvpn.com

#### Шаг 1: Подготовка системы
Выполните на чистом Ubuntu сервере:

```bash
curl -sSL https://raw.githubusercontent.com/Jah0x/vpn_project/main/scripts/01-setup-system.sh | sudo bash
```

Этот скрипт:
- Обновит систему и установит необходимые пакеты
- Настроит файрвол (порты 22, 80, 443, 8000)
- Установит Docker, Node.js 20, pnpm
- Клонирует репозиторий в `/opt/vpn_project`
- Установит зависимости и соберет фронтенд
- Создаст `.env` файл с сгенерированными секретами

#### Шаг 2: Развертывание приложения
```bash
sudo /opt/vpn_project/scripts/02-deploy-app.sh
```

Этот скрипт:
- Получит SSL сертификаты от Let's Encrypt
- Настроит nginx с оптимизированной конфигурацией
- Запустит все Docker контейнеры
- Применит миграции базы данных
- Настроит автообновление сертификатов и ротацию логов

### После установки

#### Настройка Onramper (обязательно)
Отредактируйте файл `/opt/vpn_project/.env` и добавьте ключи Onramper:
```bash
sudo nano /opt/vpn_project/.env
```

Добавьте:
```env
ONRAMPER_KEY=your_onramper_api_key
VITE_ONRAMPER_KEY=your_onramper_public_key
ONRAMPER_WEBHOOK_SECRET=your_webhook_secret
```

После изменения перезапустите контейнеры:
```bash
docker compose -f /opt/vpn_project/docker-compose.yml restart
```

#### Проверка работоспособности
```bash
# Полная диагностика системы
sudo /opt/vpn_project/scripts/full-check.sh

# Проверка интеграции Hanko
sudo /opt/vpn_project/scripts/check-hanko.sh
```

#### Доступные URL после установки
- **Основное приложение:** https://zerologsvpn.com
- **Telegram webapp:** https://tg.zerologsvpn.com  
- **Админ панель:** https://admin.zerologsvpn.com
- **Hanko API:** https://zerologsvpn.com/hanko

### Локальная разработка

```bash
pnpm i
docker compose up -d
# конфигурация для Hanko монтируется из `./config.yaml`
```

### Environment variables

```
VITE_API_BASE_URL=/api
SERVER_PORT=8080
DATABASE_URL=postgresql://vpn:changeme@postgres:5432/vpn?schema=public
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

- Сервис `hanko` стартует вместе с `docker compose up` на порту 8000.
- Обязательные переменные окружения в `.env`:
  - `HANKO_JWT_SECRET` - секрет для JWT токенов
  - `VITE_HANKO_API_URL` - URL API Hanko для фронтенда
  - `HANKO_WEBAUTHN_RELYING_PARTY_ID` - домен для WebAuthn
  - `HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS` - разрешенные origins
  - `HANKO_CORS_ALLOW_ORIGINS` - CORS настройки
  - `config.yaml` - путь до конфигурации Hanko, монтируется в контейнер
    через `volumes`.
- Страница `/login` содержит компонент `<hanko-auth>`; после успешного входа браузер отправляет полученный JWT на `/api/auth/hanko` и сохраняет `access_token` в `localStorage`.
- Для проверки интеграции запустите: `./scripts/check-hanko.sh`

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

При POST `/api/auth/hanko` сервер возвращает JSON вида:

```json
{ "access_token": "<JWT>", "refresh_token": "<token>" }
```

`access_token` следует сохранять в `localStorage` и
передавать в заголовке `Authorization: Bearer <JWT>` во все защищённые запросы.

Для локального запуска выполните:

```
docker compose up -d --build
pnpm run seed
```

Для подготовки базы данных к тестированию добавлена отдельная команда
`pnpm run seed:test`. Она создаёт учётную запись администратора
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
docker compose exec backend pnpm run seed
```

Зайдите под учёткой `drbabv@zerologsvpn.com` / `drbabv123` и нажмите кнопку «Админка» (кнопка видна только при роли `ADMIN`). Она ведёт на поддомен `admin.zerologsvpn.com`, откуда доступна работа с тарифами по API `/api/admin/plans`.

## UID pool logic

Для выдачи VPN-конфигов заранее создаётся пул UID в таблице `PreallocatedUid`.
Команда `pnpm run seed` наполняет пул случайными значениями (минимум 100) и
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
сборку фронтенда командой `pnpm run build`.

## Локальная отладка

Запускайте `pnpm run dev` и открывайте `http://localhost:5173`.

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

## 🛠️ Скрипты управления

### Установка на продакшн сервер
- `01-setup-system.sh` - подготовка системы и клонирование репозитория
- `02-deploy-app.sh` - развертывание приложения с SSL и nginx

### Обновление и управление
- `./scripts/update.sh` - обновление проекта с созданием бэкапа

### Диагностика и мониторинг
- `./scripts/full-check.sh` - полная диагностика всех компонентов системы
- `./scripts/check-hanko.sh` - проверка интеграции Hanko
- `./scripts/diagnostics.sh` - запуск линтера, тестов и сборки с логированием
- `./scripts/collect-logs.sh` - сбор логов всех контейнеров
- `./scripts/curl-matrix.sh` - быстрый smoke-тест API

### Управление на сервере
После установки доступны команды:
```bash
# Проверка статуса всех сервисов
sudo /opt/vpn_project/scripts/full-check.sh

# Просмотр логов
docker compose -f /opt/vpn_project/docker-compose.yml logs -f

# Перезапуск сервисов
docker compose -f /opt/vpn_project/docker-compose.yml restart

# Обновление проекта
sudo /opt/vpn_project/scripts/update.sh
```

Все логи сохраняются в каталоге `/opt/vpn_project/logs/`.

### Сбор логов контейнеров

Для объединения логов всех контейнеров выполните:

```bash
./scripts/collect-logs.sh
```

Файл с логами будет создан в каталоге `logs/` и имеет имя вида
`containers_YYYY-MM-DD_HH-MM-SS.log`.

