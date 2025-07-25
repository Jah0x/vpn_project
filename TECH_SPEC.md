# Технические спецификации VPN Dash

Проект состоит из фронтенда на React (Vite) и бекенда на Express. Все сервисы упакованы в Docker и могут подниматься локально через `docker-compose`. Для продакшена используется Kubernetes, для staging – Fly.io.

## CI/CD & Monitoring

Пайплайн GitHub Actions выполняет lint и тесты, затем собирает и публикует Docker‑образы в GHCR. При пуше в ветку `main` приложения деплоятся на Fly.io. Любая ветка `release/*` запускает обновление образов в Kubernetes.
- lint-test job: Node 18 + PostgreSQL 15 + Prisma migrate

Мониторинг реализован через Prometheus и Grafana. Бекенд предоставляет endpoint `/metrics` c метриками `http_requests_total` и `http_request_duration_seconds`. Helm‑chart `prometheus-stack` конфигурируется значениями из каталога `k8s/monitoring/`, Alertmanager отправляет уведомления в Slack и Telegram.

## Config template editing

Файл шаблона конфигурации VPN хранится в таблице `ConfigTemplate` (см. Prisma schema) и дублируется на диске `server/config-template.json`. Админ может получить и изменить шаблон через `/api/admin/config-template`. После оплаты подписки через Onramper создаётся пользовательский конфиг в `configs/<userId>.json`, подставляя `uuid` пользователя вместо `{{USER_UUID}}`.

## Audit logging
Все действия пользователей (логин, операции с VPN, изменение шаблонов и события оплаты) сохраняются в таблицу `AuditLog`. Маршрут `/api/admin/audit` позволяет просматривать журнал с фильтрами по пользователю и типу действия. Записи можно удалить через `DELETE /api/admin/audit/{id}`.

## Observability
- Все HTTP запросы считаются и измеряются через Prometheus middleware. Метрики доступны без авторизации по `/metrics`.
- Alertmanager настроен на Slack и Telegram, правило `HighErrorRate` срабатывает при доле 5xx >5% в течение 5 минут.
- Дополнительно собираются `db_query_duration_seconds`, `onramper_webhook_total` и `audit_logs_total`.
- Правила Prometheus описаны в `k8s/monitoring/alerts.yaml`.
- Алерты с `severity: critical` отправляются в Slack и Telegram, `warning` — только в Telegram.

## Security hardening
- `helmet` со строгой Content-Security-Policy (`default-src 'self'; img-src 'self' data:; script-src 'self' https://telegram.org; object-src 'none'`), `crossOriginEmbedderPolicy: false`.
- `express-rate-limit` – 100 запросов за 15 минут на IP, исключая `/metrics` и `/health`.

## Database & Prisma
- Используется PostgreSQL 15 и Prisma ORM 5.
- Все модели описаны в `prisma/schema.prisma`.
- Миграции запускаются командой `npm run prisma:migrate`, сиды — `npm run seed`.
- Для локальной разработки БД поднимается через Docker Compose сервис `postgres`.

## Billing
Интеграция с Onramper для обработки платежей через криптовалюты и карты. В `.env` должны быть заданы ключи:
`ONRAMPER_KEY`, `VITE_ONRAMPER_KEY`, `ONRAMPER_WEBHOOK_SECRET`.

Модель `Subscription` хранит активный тариф пользователя и лимит активных VPN. Вебхук `/api/pay/onramper/webhook` обновляет статус подписки при успешной оплате через Onramper.

Создание VPN ограничено middleware `enforceVpnLimit`, которое сравнивает количество VPN пользователя с `maxActiveVpns` из его подписки.

## Subscription Link Delivery

Шаблон ссылки на страницу управления подпиской хранится в таблице `SubscriptionLinkTemplate`.
Пользователь может получить итоговый URL через `/api/subscription-url`, если его подписка активна.
Маркер `{{UUID}}` заменяется на `uuid` пользователя.
Администратор управляет шаблоном через `/api/admin/subscription-template`.

### Subscription push protocol
После успешной оплаты бэкенд отправляет запрос на `subscription-server` с подписью HMAC (заголовок `X-Signature`). При ошибке запись попадает в очередь `SubPushQueue`, которая повторно отправляется крон-задачей каждые 5 минут. Управление очередью через CLI:
`npm run sub:queue:list`, `sub:queue:retry`, `sub:queue:flush`.

## OpenAPI & Swagger

Документация API описана в формате OpenAPI 3.1 (`server/openapi.yaml`).
Локально можно открыть Swagger UI по адресу `/api/docs`.

```bash
curl http://localhost:4000/api/docs
```
