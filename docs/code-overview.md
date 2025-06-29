# Обзор кода

Этот документ описывает основные модули проекта `vpn_project` и предназначен для быстрого погружения новых разработчиков. Ниже приведены краткие описания файлов и функций серверной части и вспомогательных сервисов.

## Сервер (`server/`)

### `server/src/index.ts`
Запуск HTTP‑сервера Express. Поднимает приложение из `server.ts` и слушает порт из переменной `SERVER_PORT`.

```ts
import { app } from "./server";

const PORT = process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

### `server/src/server.ts`
Основная конфигурация Express:
- подключает CORS, pino‑логирование и защитные middlewares (`securityMiddlewares`);
- инициализирует Prometheus метрики через `metricsMiddleware`;
- монтирует документацию Swagger;
- описывает маршруты `/api/*` (auth, vpn, billing и др.);
- запускает периодическую задачу `retrySubPushQueue` каждые 5 минут.

### `server/src/auth.ts`
Реализует JWT‑аутентификацию и авторизацию.

Функции:
- `signAccessToken(payload)` – выдаёт краткоживущий JWT.
- `signRefreshToken(payload)` – выдаёт refresh JWT.
- `verifyAccessToken(token)` / `verifyRefreshToken(token)` – проверяют токены.
- `authenticateJWT(req,res,next)` – middleware для проверки заголовка `Authorization`.
- `authorizeRoles(...roles)` – ограничение доступа по ролям.
- `ownerOrAdmin(req,res,next)` – проверяет владельца VPN или роль ADMIN.

### `server/src/authRoutes.ts`
REST‑маршруты `/api/auth`:
- `POST /register` – создание пользователя.
- `POST /login` – авторизация и выдача токенов.
- `POST /refresh` – получение нового access‑токена по refresh‑токену.

### `server/src/vpn.ts`
CRUD для VPN‑записей и перезапуск через shell‑скрипт.

Функции роутера:
- `GET /` – список VPN текущего пользователя или всех (для ADMIN).
- `POST /` – создание VPN (проверяется лимит активных VPN).
- `PATCH /:id` – переименование VPN.
- `DELETE /:id` – удаление VPN.
- `POST /restart/:id` – добавляет задачу перезапуска и выполняет `scripts/restart.sh`.

### `server/src/configRoutes.ts`
Работа с конфигурационными файлами VPN.

- `GET /config` – скачивание конфигурации пользователя (при активной подписке).
- `GET /admin/config-template` – чтение шаблона конфигурации (ADMIN).
- `PUT /admin/config-template` – обновление шаблона конфигурации (ADMIN).
- `POST /stripe/webhook` – вебхуки Stripe для генерации файлов конфигурации.

### `server/src/billing.ts`
Интеграция со Stripe.

Маршруты:
- `POST /checkout` – создание сессии оплаты и редирект на форму Stripe.
- `POST /webhook` – обработка событий Stripe (активация/отмена подписки).

### `server/src/subscriptionLink.ts`
Управление шаблоном ссылки на подписку.

- `GET /subscription-url` – возвращает сформированную ссылку по UUID пользователя.
- `GET /admin/subscription-template` – чтение шаблона (ADMIN).
- `PUT /admin/subscription-template` – обновление шаблона (ADMIN).

### `server/src/auditRoutes.ts`
Просмотр и очистка аудиторских логов.

- `GET /admin/audit` – фильтрация логов по действию, пользователю и дате.
- `DELETE /admin/audit/:id` – удаление записи лога.

### `server/src/enforceVpnLimit.ts`
Middleware, проверяющий, что пользователь не превысил лимит активных VPN по подписке.

### `server/src/metrics.ts`
Создание и регистрация Prometheus‑метрик:
- `httpRequestsTotal`, `httpRequestDurationSeconds` – статистика HTTP запросов.
- `dbQueryDurationSeconds` – время выполнения запросов к базе.
- `stripeWebhookTotal` – количество событий Stripe.
- `auditLogsTotal` – количество записей аудита.

### `server/src/metricsMiddleware.ts`
Middleware измеряет время обработки HTTP‑запросов и увеличивает счётчики в `metrics.ts`.

### `server/src/middleware/*`
- `security.ts` – helmet + rate‑limit.
- `audit.ts` – функция `logAction(action, userId?, payload?)` записывает события в таблицу `AuditLog` и увеличивает метрику `auditLogsTotal`.

### `server/src/lib/*`
- `prisma.ts` – инициализация PrismaClient с метриками выполнения запросов.
- `subPush.ts` – отправка строки подписки во внешний сервис. При ошибке запись помещается в очередь `subPushQueue`. Также содержит `retrySubPushQueue()` для повторных попыток.

### `server/src/cli/subQueue.ts`
CLI‑утилита для работы с очередью `subPushQueue`:
- `list` – выводит содержимое очереди.
- `retry` – принудительный запуск `retrySubPushQueue`.
- `flush` – очистка очереди.

### `server/openapi.yaml`
Файл исходной спецификации OpenAPI. Реальные схемы моделей дополняются при запуске через `zod-to-openapi` в `swagger.ts`.

## Скрипты (`scripts/`)
- `restart.sh` – упрощённая симуляция перезапуска VPN. Принимает ID и выводит `restarted <id>`.

## Сервис подписок (`subscription-server/`)
Небольшой сервер на Express для отдачи строк подписки.

### `src/index.ts`
Создаёт приложение, подключает маршруты `add` и `sub`. При запуске напрямую слушает порт `8080` (или из `PORT`).

### `src/routes/add.ts`
- `POST /add` – добавляет или обновляет запись `{ uuid, subString }` в SQLite. Подпись запроса проверяется через заголовок `X-Signature`.

### `src/routes/sub.ts`
- `GET /:uuid` – возвращает строку подписки по UUID или `404`, устанавливает тип `text/plain` и кэш на час.

### `src/db.ts`
Открывает SQLite‑базу `subs.db` и создаёт таблицу `SubscriptionRecord` при первом запуске.

### `src/cli/seed.ts`
Заполняет базу данными из файла `seed.json`.

## Прочее
- Типы в `server/src/types.ts` описывают роли пользователей, статусы VPN и виды аудиторских действий.
- Дополнительные *.d.ts* файлы декларируют отсутствующие типы (`node-cron`, `yamljs`).

---

Документация носит обзорный характер и может быть расширена по мере развития проекта.
