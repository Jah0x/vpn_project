# Журнал разработки

## 2025-06-26
- Добавлена базовая серверная часть на Node.js без сторонних библиотек.
- Реализованы эндпоинты `/api/register`, `/api/login`, `/api/profile`.
- Создан простой тест `server/test/server.test.js`.

## 2025-06-27
- Переписан сервер на Express + TypeScript.
- Добавлена поддержка JWT и таблицы `Vpn`, `Job` (пока в памяти).
- Реализован эндпоинт `POST /api/vpn/restart/:id`.
- Добавлена документация Swagger и тесты на Jest.

## 2025-06-28
- Создан компонент `VpnStatusBadge` и карточка `VpnCard` на TypeScript.
- Добавлены тесты на React Testing Library и обновлён Jest конфиг.

## 2025-06-29
- Реализована JWT‑авторизация с ролями и refresh токенами.
- Добавлены CRUD маршруты `/api/vpn` с проверкой прав.
- Swagger обновлён, примеры тестов на Jest для авторизации и VPN.

## 2025-06-30
- Подключён `react-i18next` и добавлены словари `en` и `ru`.
- Создан переключатель языка и базовая библиотека UI (`Card`, `Button`, `Modal`).
- Настроены Storybook и Cypress со smoke‑тестом смены языка.

## 2025-06-30b
- Подготовлены Dockerfile и docker-compose. Настроен CI/CD с Fly.io и Kubernetes. Добавлен monitoring через Prometheus и Grafana.
## 2025-06-27b
- Реализовано редактирование шаблона конфигурации и генерация файла после оплаты.

## 2025-07-01
- Подключены метрики Prometheus и обновлён Grafana дашборд.
- Настроен Alertmanager (Slack, Telegram) и добавлены правила алертов.
- Усилена безопасность API: rate-limit и secure headers через helmet.

## 2025-07-02
- Переведена база на PostgreSQL и Prisma ORM.
- Введены миграции, сиды и Docker Compose с Postgres.
- Пароли теперь хранятся как bcrypt-хэши.

## 2025-07-03
- Интегрирован Stripe Billing (Checkout + Webhook).
- Добавлена модель `Subscription` и ограничение числа VPN по тарифу.

## 2025-07-04
- Добавлена таблица `SubscriptionLinkTemplate` и сид с дефолтным значением.
- Реализованы эндпойнты для выдачи ссылки на подписку и её редактирования.
- На дашборде появилась кнопка копирования ссылки.
- Обновлены Swagger и техническая документация.

## 2025-07-05
- Создан отдельный сервис `subscription-server` на Express + SQLite.
- Поддержаны эндпойнты `GET /:uuid` и `POST /add`.
- Добавлены Jest-тесты и Dockerfile для нового сервиса.

## 2025-07-06
- Настроен workflow ci.yml с PostgreSQL и Prisma, линт и тесты проходят.
