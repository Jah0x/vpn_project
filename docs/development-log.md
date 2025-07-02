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

## 2025-07-07
- Введены middleware security (helmet с CSP, глобальный rate-limit).
- Обновлены Swagger и TECH_SPEC.

## 2025-07-08
- Реализован аудит действий, secure push подписок и новые метрики.

## 2025-07-09
- Начата рефакторизация визуального слоя.
- В конфиг Tailwind добавлены дизайн-токены (шкала отступов 8pt).

## 2025-07-10
- Запущен Prettier для всех *.ts/tsx/js файлов. Ошибок форматирования не найдено.
- Проверена строгая конфигурация TypeScript. Компиляция проходит без ошибок.

## 2025-07-11
- Проверена установка зависимостей: `npm install` завершилась без ошибок, но есть предупреждения и 13 уязвимостей.
- Попытка `npm run build` завершилась ошибкой: не найден `index.html` в корне (он лежит в `public/`).
- Добавлены рекомендации по ведению логов установки и сборки (`docs/logging-guidelines.md`).

## 2025-07-12
- Перенесён `index.html` в корень проекта для корректной работы `vite build`.
- Обновлён `tailwind.config.js` (указан путь `./index.html`).

## 2025-07-13
- Исправлена конфигурация docker-compose: backend теперь собирается из каталога ./server. Ошибка "server/Dockerfile/Dockerfile" больше не возникает.

## 2025-07-14
- Обновлён Dockerfile сервера: удалена зависимость от package-lock.json, используется `npm install --production`.
- docker-compose снова собирает backend из корня проекта (`context: .`). Ошибка пути больше не проявляется.

## 2025-07-15
- При попытке сборки обнаружилось повторное возникновение ошибки `server/Dockerfile/Dockerfile`.
- Контекст сборки backend снова задан как `./server`, Dockerfile указан явно (`Dockerfile`).

## 2025-07-16
- Исправлена конфигурация: контекст сборки backend снова указывает на корень проекта,
  Dockerfile задаётся как `server/Dockerfile`.
- Теперь `docker compose build` выполняется без ошибок копирования `package.json`.

## 2025-07-17
- Исправлен `src/Dockerfile`: шаг копирования `package.json` не падaет при отсутствии `package-lock.json`.
- `docker-compose build frontend` теперь проходит без ошибок.

## 2025-07-18
- Скорректированы Dockerfile'ы `src` и `subscription-server`: вместо `npm ci` теперь используется `npm install`.
- Файл `package-lock.json` по-прежнему не хранится в репозитории, сборка образов проходит без ошибок.

## 2025-07-19
- Обновлен Dockerfile сервера: для компиляции устанавливаются dev-зависимости, затем выполняется `npm prune --production`. Сборка проходит без ошибок типов.

## 2025-07-20
- Исправлена ошибка "URI malformed" при сборке Vite: удалены placeholder `%PUBLIC_URL%` в `index.html`.
- Установлены плагины `@tailwindcss/forms` и `@tailwindcss/typography` для корректной сборки.

## 2025-07-21
- Добавлен шаблон `crm/index.html` для отдельной CRM версии фронтенда.

## 2025-07-22
- Исправлены типы в серверных файлах (`subQueue.ts`, `configRoutes.ts`, `prisma.ts`).
- Проверена сборка сервера (`npm run build:server`) — ошибок нет.
## 2025-07-23
- Обновлена команда `build:server`: перед компиляцией выполняется `prisma generate` для корректной генерации клиента.
- Запущены `npm run lint` и `npm test` — тесты не прошли из-за проблем в окружении.

## 2025-07-24
- В Dockerfile сервера добавлена копия каталога `prisma`, чтобы `npm run build:server` видел `schema.prisma`.
- Запущены `npm run lint` и `npm test`: lint прошёл без ошибок, тесты завершились с ошибками.

## 2025-07-27
- Установлены типы `@types/node-cron` и `@types/yamljs` для корректной сборки сервера.
- При запуске `npm run start:server` без настроенных переменных окружения Stripe сервер завершается с ошибкой.
- Для локального тестирования достаточно прописать фиктивные ключи в `.env`.

## 2025-07-28
- Добавлены правки для корректного SPA-fallback в Nginx и проброса порта 80.
- Обновлён `DATABASE_URL` в `.env.example` для соответствия `docker-compose`.
- Запуск контейнера `frontend` проверяем командой `docker compose up -d frontend`.


## 2025-07-29
- Добавлена общая документация `docs/code-overview.md` с описанием серверных модулей и сервисов.

## 2025-07-30
- Заменили бинарный `favicon.ico` на текстовый `favicon.svg` и обновили Nginx конфигурацию для отдачи иконки без 404.
- Обновили `index.html`, убрав неиспользуемые ссылки на иконки.

## 2025-07-31
- Исправлена строка `COPY` в `src/Dockerfile`: путь к `nginx.conf` указан как `src/nginx.conf`.
- Сборка контейнера `frontend` снова проходит без ошибок.


## 2025-08-01
- Создан файл `.dockerignore` для исключения `node_modules` и лишних файлов из контекста Docker.

## 2025-08-02
- Перешли с Traefik на Nginx. Добавлен сервис `nginx` в `docker-compose.yml` и новая конфигурация `nginx/nginx.conf`.
- Обновлена документация по логированию и журнал разработки.

## 2025-08-03
- Добавлены скрипты установки и обновления сайта zerologsvpn.com.
- Создан документ docs/zerologsvpn-installation.md с пошаговой инструкцией.

## 2025-08-04
- Перевели HTTP-порт сервиса с 80 на 8081 во всех конфигурациях Docker и Nginx.

## 2025-08-05
- Исправлены Dockerfile и docker-compose для корректного запуска командой
  `docker compose up --build -d`.
- Backend теперь копирует каталог `prisma`, выполняет `npx prisma generate` и
  использует `pnpm` для сборки.
- Frontend снова слушает порт 80, Nginx проксирует на него и отдаёт сертификат
  Let\'s Encrypt из `./certs`.
- В `docker-compose.yml` добавлена общая сеть `app`, все сервисы подключены к
  ней. Nginx зависит от backend и frontend.
- Обновлён пример `.env` и документация.
## 2025-08-06
- Добавлен `server/package.json` с командой `build:server`.
- Dockerfile сервера теперь использует `pnpm run build:server`.


## 2025-08-07
- Исправлен Dockerfile сервера: на этапе runtime копируется каталог `prisma` для корректной работы `npx prisma`.

## 2025-08-08
- Добавлен скрипт `scripts/install.sh` для установки проекта.
- Сертификаты Let's Encrypt копируются в каталог `./certs` до запуска контейнеров.


## 2025-08-09
- Исправлены HTTP заголовки для статики и удалены устаревшие preload-ссылки.

## 2025-08-10
- Обновлена конфигурация Nginx: исправлены MIME-типы для js/css,
  добавлено кэширование каталога `/static`, скрыт заголовок `Server` и
  включён `X-Content-Type-Options: nosniff`.


## 2025-06-30
- Исправлен `index.html`: добавлен `<script type="module" src="/src/index.jsx"></script>` для корректной загрузки React-приложения.


## 2025-08-11
- Переименован главный файл в `src/index.jsx` и обновлён `index.html` для сборки Vite.


## 2025-08-12
- Исправлена ошибка сборки: `@import` перенесён в начало `src/index.css` для корректной работы PostCSS.
- Файл `src/services/VPNService.js` переименован в `.jsx` для корректной обработки JSX кодом Vite.


## 2025-08-13
- Файлы сервисов переименованы с `.js` на `.jsx` для корректной сборки Vite.

## 2025-08-14
- Заменена иконка Telegram на `SiTelegram` из `react-icons`.
- Пакет `react-icons` установлен через `pnpm add`.
- Ошибка сборки о недостающем экспорте Telegram исчезла, но Vite сообщает о проблеме с `useAuth`.

## 2025-08-15
- Реализованы `AuthContext` и `ToastContext` с экспортом `useAuth` и `useToast`. Исправлена сборка Vite.

## 2025-08-16
- Исправлена отдача статики: nginx теперь использует mime.types и fallback index.html.
- Обновлены Dockerfile и compose: backend устанавливает libssl1.1, выполняет `pnpm prisma generate`, добавлен healthcheck.
- Все сервисы переведены на сеть `vpn_project`.


## 2025-08-17
- Переведён backend Dockerfile на образ node:18-bullseye, libssl1.1 ставится на этапе runtime.
- Обновлены конфигурации Nginx: корректные MIME-типы и SPA fallback.
- docker-compose собирает backend из каталога ./server.

## 2025-08-18
- Исправлены Dockerfile и docker-compose для корректной сборки на Debian 11.
- Добавлен .dockerignore в каталог server.
- Workflow CI проверяет MIME типы статики и отсутствие ошибок libssl/libhost.

## 2025-08-19
- Исправлены пути сборки backend и env-файл в docker-compose.
- Dockerfile сервера копирует исходники из корня.
- В CI добавлена проверка docker-test.

## 2025-08-20
- Исправлен upstream Nginx: сервис frontend теперь указывается по имени из docker-compose.
## 2025-08-21
- Исправлена ошибка `host not found in upstream 'frontend:80'`.
- Сервис nginx и frontend подключены к единой сети `app` в docker-compose.
- В конфигурацию nginx добавлена строка `resolver 127.0.0.11 valid=30s;`.
- В CI добавлена отдельная проверка логов nginx сразу после запуска контейнеров.

## 2025-08-22
- Исправлена сборка backend: `dist/index.js` копируется в корень образа.
- В `docker-compose.yml` добавлен `sleep 10` перед миграцией и обновлён `healthcheck`.
- Обновлена документация по логированию контейнеров и сетей.

## 2025-08-23
- Добавлена проверка `Server listening` и отсутствия `emerg` в CI.
- Файл `docker-compose.yml` переведён на единый network `app`.
- `.env.example` теперь содержит параметры PostgreSQL и корректный `DATABASE_URL`.
- В документацию по логам добавлены рекомендации по ошибке `P1001` и уровню `emerg`.

## 2025-08-24
- Исправлен healthcheck Postgres в `docker-compose.yml`: теперь используется `pg_isready -U $POSTGRES_USER -d postgres` и заданы переменные `POSTGRES_USER`/`POSTGRES_PASSWORD`.
- Обновлён `.env.example` и CI, добавлена проверка здоровья Postgres.

## 2025-08-25
- Исправлен healthcheck backend и обновлена команда запуска в docker-compose.
- Добавлен маршрут `GET /` в Express для проверки контейнера.
- Сгенерирована миграция Prisma с таблицей `SubPushQueue`.

## 2025-08-26
- Добавлена проверка занятого порта при запуске сервера (EADDRINUSE) и подробное сообщение об ошибке.


## 2025-08-27
- Обновлён nginx.conf: сервисы переименованы в vpn-api и vpn-frontend, ошибка `host not found in upstream` устранена.

## 2025-08-28
- Исправлена конфигурация nginx: актуальный upstream backend:4000, удалён дублирующий `default_type` во фронтенд-Nginx.
\n## 2025-08-29\n- Исправлена валидация логина, подключен API авторизации. Добавлен сид админ-пользователя и e2e тесты.\n

## 2025-08-30
- Добавлена зависимость axios для корректной сборки фронтенда.
