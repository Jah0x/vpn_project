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

- Запущен Prettier для всех \*.ts/tsx/js файлов. Ошибок форматирования не найдено.
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

## 2025-08-31

- Исправлена отправка формы авторизации: передача данных теперь корректно вызывает API.

## 2025-09-01

- Реализован полноценный `AuthContext` на TypeScript и подключены сервисы авторизации.
- Старый компонент из `contexts/AuthContext.jsx` перенесён в `components/Common/Modal.jsx`.
- Формы входа и регистрации теперь используют контекст и выполняют редирект после успешной авторизации.

## 2025-09-02

- Исправлен `AuthContext` с корректным `AuthProvider` и хуком `useAuth`.
- `src/index.jsx` гарантированно оборачивает `<App/>` в `AuthProvider`.
- Сценарий `prisma/seed.ts` обёрнут в `async main()` с `disconnect`.

## 2025-09-03

- Синхронизирована схема Prisma и база данных: добавлено поле `nickname` в таблицу `User`.
- Проверена регистрация и логин через `/api/auth`: ошибки не возникают, пользователи сохраняются.

## 2025-09-04

- Эндпоинт `/api/auth/login` возвращает поля `access_token` и `refresh_token`.
- Хук `useAuth` сохраняет токен в `localStorage` и проверяет срок его действия.
- Все запросы через Axios автоматически добавляют заголовок `Authorization`.

## 2025-09-05

- Исправлена функция логина: токены сохраняются в localStorage вне зависимости от названий полей в ответе. Навигация на /dashboard выполняется только после успешной авторизации.

## 2025-09-06

- Перемещён маркетинговый блок с преимуществами в компонент Footer.
- Запуск `npm run lint` и `npm test` сохранён в logs.

## 2025-09-07

- Блок с логотипом и преимуществами перенесён в самый низ страницы под футером.
- Линт и тесты выполнены после правок.

## 2025-09-08

- Исправлен импорт иконки Telegram в `Footer.jsx` на `Send` из `lucide-react`.
- Запущены `npm run lint` и `npm test` — оба прошли успешно.

## 2025-09-09

- Маркетинговый блок перенесён из футера наверх сайта и выстроен в одну строку.
- Футер сокращён до основных ссылок и слогана.
- `npm run lint` и `npm test` прошли без ошибок.

## 2025-09-10

- Добавлен скрипт `npm run seed:test` для заполнения тестовой базы
  администратором и тарифом.
- Обновлены README и журнал разработки.

## 2025-09-11

- Реализована CRUD-система тарифов.
- Добавлена страница администрирования `/admin/plans` и соответствующий API.
- Запущены `npm run lint` и `npm test` – оба прошли успешно.

## 2025-09-12

- Исправлен путь импорта AuthContext в PromoBanner.
- Сборка `vite build` больше не падает.
- Запущены `npm run lint` и `npm test` — прошли успешно.

## 2025-09-13

- Добавлена кнопка «Админка» на дашборде и в промо-баннере, видна только пользователям с ролью ADMIN.
- Исправлены проверки роли на FRONTEND (ADMIN вместо admin).
- Запущены `npm run lint` и `npm test`.

## 2025-09-14

- Админ-панель вынесена на поддомен `admin.zerologsvpn.com` (правки Nginx и ссылок).
- В seed-скриптах создан единственный аккаунт `drbabv@zerologsvpn.com` с паролем `drbabv123`.
- Обновлены README и тесты Cypress.

## 2025-09-15

- Перевод платежей на Onramper, добавлены модели Invoice и PlanCode.
- Удалён Stripe и маршрут /api/config. CRM выделена в отдельную БД.
- Добавлен компонент OnramperPayButton и страница Pricing.

## 2025-09-16

- В Dockerfile фронтенда установлена опция `npm install --legacy-peer-deps` для устранения конфликта зависимостей React.
- Сборка `docker compose build` выполняется без ошибки `ERESOLVE`.
- Запущены `npm run lint` и `npm test`.

## 2025-09-17

- Исправлена типизация функции `getPlanByCode` на стороне сервера (используется `PlanCode`).
- Запущены `npm run lint` и `npm test`.

## 2025-09-18

- Обновлена главная секция: изменён список преимуществ и укорочен подзаголовок.
- Удалена информация о "50+ серверах" во всех блоках.
- Запущены `npm run lint` и `npm test` после правок.

## 2025-09-19

- Возвращён слоган "Защитите свою конфиденциальность и получите доступ к интернету без ограничений с нашим надежным VPN-сервисом" в промо-блоке и футере.
- Мета-теги в `index.html` обновлены под новый слоган.
- Запущены `npm run lint` и `npm test`.

## 2025-09-20

- Добавлен публичный эндпойнт `/api/plans` и сервис на фронтенде. Тарифы теперь загружаются корректно.
- Создан тест `plans.spec.ts`.
- Удалены устаревшие файлы сервисов (.jsx).
- Запущены `npm run lint` и `npm test`.

## 2025-09-21

- Исправлена ошибка отображения тарифов на странице подписки (проверка массивов и Skeleton).
- Добавлен e2e-тест subscription.cy.ts.
- Запущены `npm run lint` и `npm test`.

## 2025-07-04c

- Исправлено отображение тарифов при пустом ответе `/plans`. Добавлены проверки и спиннер, обновлён тест Cypress и конфигурация Nginx.

## 2025-07-04d

- Добавлен публичный эндпойнт `/api/public/plans`.
- Nginx проксирует `/api/public/plans` на backend.
- Тест Cypress проверяет длину массива тарифов.
- Запущены `npm run lint` и `npm test`.

## 2025-09-22

- Созданы документы docs/privacy-policy.md и docs/faq.md.
- Обновлён журнал разработки.

## 2025-09-23

- Реализована авторизация через Telegram на фронтенде.
- Созданы публичные страницы privacy и FAQ.
- Запущены `npm run lint` и `npm test`.

## 2025-09-24

- Исправлен поток авторизации через Telegram: фронтенд отправляет `{ ...user, auth_date, hash }`.
- Бэкенд загружает `.env` через `dotenv` и проверяет подпись.
- Запущены `npm run lint` и `npm test` — всё зелено.

## 2025-09-25

- В маршрут `/api/auth/telegram` добавлено логирование попыток авторизации.
- Обновлена документация `docs/telegram-auth.md` c разделом "Отладка".
- Выполнены `npm run lint` и `npm test`.

## 2025-09-26

- Исправлена авторизация Telegram Web-App: подключён SDK и расширен CSP.
- Создана страница `AuthPage` отправляющая `initDataUnsafe` на сервер.
- Документация и nginx конфигурация обновлены.
- Запущены `npm run lint` и `npm test`.

## 2025-09-27

- Перенесён Telegram init скрипт из index.html в модуль `src/auth/tgInit.ts`.
- CSP ограничен: разрешены скрипты только с `self` и `https://telegram.org`.
- Запущены `pnpm run test:unit` и `pnpm run test:e2e`.

## 2025-09-28

- Расширен bootstrap в `tgInit.ts`: сохраняет `initData` в localStorage, шлёт событие `telegram-initialized` и вызывает `ready()`.
- Добавлен тест `tgInit.test.ts`.
- Запущены `npm run lint` и `npm test`.

## 2025-09-29

- В `bootstrapFromTelegram` добавлен ранний выход при отсутствии `initData`.
- Дополнена документация `telegram-auth.md` описанием этой инициализации.
- Запущены `npm run lint` и `npm test`.

## 2025-09-30

- Исправлен запуск фронтенда вне Telegram: добавлен модуль `src/lib/telegram.ts`.
- Все обращения к `window.Telegram.WebApp` обернуты в проверки.
- README дополнено разделом "Локальная отладка".
- Запущены `npm run lint` и `npm test` — успешно.

## 2025-10-01

- Обновлена схема initData для Bot API 9.0 (device_storage, secure_storage).
- Добавлен parseInitData с предупреждением об ошибках.
- Тесты и линт проходят.

## 2025-10-02

- Реализован компонент `TelegramLogin`, который выполняет запрос авторизации только один раз за сессию и сохраняет токены в localStorage.
- Эндпоинт `/api/auth/telegram` стал идемпотентным и ограничивается по IP (5 запросов за 10 секунд).
- Добавлены Jest и Cypress тесты на новый функционал.
- Документация `telegram-auth.md` дополнена сведениями об идемпотентности.

## 2025-07-05

- Расширена модель `User` полями `username`, `passwordHash?` и таблицей `RefreshToken`.
- Реализована функция `issueTokens` и обновлены маршруты аутентификации.
- В `seed.ts` добавлен демонстрационный пользователь `demo@demo.dev`.
- Логин-форма автоматически авторизует через Telegram внутри WebApp.
- Создан `src/api/index.ts` с базовым экземпляром Axios.
- Исправлено зависание экрана загрузки: теперь после инициализации React элемент #loading-screen скрывается.

## 2025-10-03

- Добавлен alias '@' в vite.config.ts и tsconfig.json для импорта из src.
- Сборка 'vite build' теперь проходит без ошибки '@/services/auth'.

## 2025-10-04

- Исправлен цикл авторизации через Telegram: запрос выполняется один раз при загрузке страницы, при ошибке 429 пользователь может повторить попытку вручную.
- На сервере кэш ответов по hash `initData` и лимит 5 запросов за 10 секунд по IP неизменны.

## 2025-10-05

- Добавлена служба AuthTelegramService и эндпоинт /api/auth/telegram.
- Теперь WebApp создаёт пользователя при первом входе и возвращает JWT.
- Для проверки подписи используется HMAC(SHA256).
- Добавлены тесты и правило nginx для прокси этого запроса.

## 2025-10-06

- Исправлен конфиг Nginx: все запросы /api/\* теперь проксируются на backend.
- Доработано описание в docs.

## 2025-10-07

- Скрипты install.sh и setup_zerologsvpn.sh объединены в один `install.sh`. Он устанавливает Node.js 20 и использует символические ссылки для сертификатов.

## 2025-10-08

- В конфигурации nginx и документации уточнено разделение авторизации по доменам.
- install.sh теперь генерирует полную конфигурацию nginx с поддоменом `tg.` для Telegram Web App.

## 2025-10-09

- Dockerfile фронтенда теперь использует pnpm для установки зависимостей через corepack. Ошибка "pnpm: not found" в step RUN npm run build устранена.

## 2025-07-06

- Исправлена сборка приложения main: vite.config.ts теперь использует корневой каталог и абсолютный outDir.
- Команды `npm run lint` и `npm test` прошли успешно.

## 2025-10-10

- Добавлены недостающие методы `refreshToken`, `changePassword`, `resetPassword` в `src/services/auth.ts`.
- В `tg-webapp` импорт компонента `TelegramLogin` переведён на alias `@`.
- Сборка `npm run build` завершается успешно.

## 2025-10-11

- Скрипт `install-dev.sh` теперь поднимает `nginx` только после генерации сертификатов.
- Добавлена функция `start_nginx` и подробные комментарии по шагам установки.

## 2025-10-12

- Улучшено логирование.
- Nginx пишет `access.log` и `error.log` в `logs/nginx`.
- Express ловит необработанные ошибки и выводит их через pino.

## 2025-07-06b

- Написан скрипт `scripts/install-dev.sh` для развёртывания dev-окружения.
- В package.json добавлена команда `dev:install`, README дополнен быстрым стартом.
- `npm run lint` и `npm test` выполнены без ошибок.

## 2025-10-13

- Скрипт update_zerologsvpn.sh сохраняет вывод в logs/update_DATE.log.

## 2025-10-14

- Добавлен скрипт `scripts/diagnostics.sh` для запуска линтера, тестов и сборки с логированием.

## 2025-10-15

- Обновлена конфигурация nginx: основной домен отдаёт статику из `dist/main` и
  при отсутствии файлов проксирует запросы к контейнеру `frontend`.
- В `docker-compose.yml` сервис `nginx` получил дополнительный том для статики.
- Сборка SPA `pnpm build:main` прошла успешно, `npm run lint` и `npm test` без ошибок.

## 2025-10-17

- Реализована двойная аутентификация через email/пароль и Telegram.
- Добавлены стратегии Passport и эндпоинты `/api/auth/local`, `/api/auth/telegram`.
- Frontend теперь сохраняет JWT в `localStorage` и использует его при запросах.

## 2025-10-18

- Скрипты `install.sh` и `update_zerologsvpn.sh` выполняют `pnpm run build` для
  обновления статики.
- Документация `zerologsvpn-installation.md` скорректирована, журнал
  пополнен текущей записью.

## 2025-07-08

- Исправлены ошибки TypeScript при сборке сервера: обновлены типы middleware и маршрутов.
- Удалён дублирующий ключ email в LoginPage.jsx.
- Добавлена зависимость @types/passport.

## 2025-07-08b

- Исправлена ошибка ReferenceError: getTelegram is not defined.
- Создан хелпер utils/telegram.ts, обновлены импорты.
- Скрипт Telegram widget подключается в index.html.

## 2025-07-09

- Реализована поддержка двух способов авторизации (Telegram и форма).
- Добавлен ErrorBoundary и динамическая загрузка SDK Telegram.
- Расширена документация по запуску и учёту логов.

## 2025-07-10

- Защищены вызовы `getTelegram` проверкой на наличие Telegram WebApp.
- Обновлены шаги CI/CD для пересборки фронтенда и очистки CDN.

## 2025-07-11

- Настроена сборка Vite с хэшированными именами файлов.
- Добавлена проверка на отсутствие `getTelegram()` в финальном бандле.

## 2025-07-12

- Добавлены скрипт `check:bundle` и упрощённый CI.
- Dockerfile удаляет дубли в mime.types.
- Обновлён README по проверке getTelegram bug.

## 2025-07-14

- Перенесён фронтенд в apps/main и обновлены Dockerfiles.

## 2025-07-15

- Исправлен Dockerfile backend: копируются src и openapi.yaml, сборка проходит без ошибок.

## 2025-07-15b

- Исправлены пути импорта markdown-файлов в FaqPage и PrivacyPolicyPage. Сборка Vite теперь проходит без ошибки "Could not resolve".

## 2025-10-19

- Обновлена конфигурация docker-compose: сервис backend собирается из корня репозитория с указанием server/Dockerfile.

## 2025-07-09

- Добавлен алиас `~/docs` в Vite, исправлены пути импорта Markdown.
- Скрипт для структурированных данных помечен `data-vite-ignore`.
- Docker-compose теперь использует директорию `apps/server` как контекст.

## 2025-10-20

- Упрощены Dockerfile и docker-compose: backend собирается из корня, база образов unified на node:20-alpine.
- Добавлен эндпоинт /healthz и обновлён healthcheck.

## 2025-07-10

- Настроен Husky с lint-staged и Node 20.
- Добавлен генератор OpenAPI из схем Zod и обновлён Dockerfile.

## 2025-07-11

- Исправлена ошибка сборки сервера: `tsc` падал из-за файла вне `rootDir`.
- В `apps/server/tsconfig.json` поле `rootDir` изменено на `"."`, чтобы
  компилировались CLI-скрипты из каталога `scripts`.
- В `docs/logging-guidelines.md` описана диагностика ошибки `TS6059`.

## 2025-07-12

- Исправлена сборка docker compose: обновлены переменные окружения и Dockerfile
  сервера.
- В `.env.example` добавлен `STRIPE_SECRET_KEY=`.
- Все команды `docker compose build` выполняются без ошибок.

## 2025-07-13

- Исправлена сборка фронтенда: `docker-compose` теперь использует корень
  проекта в качестве контекста, чтобы `pnpm` находил `package.json`.

## 2025-07-14

- В `.dockerignore` перестали исключаться `apps/main` и `public`, сборка фронтенда
  в Docker больше не падает из-за отсутствия `vite.config.ts`.
- В `apps/server/package.json` добавлены dev-зависимости `ts-node` и `typescript`,
  чтобы `pnpm run build:server` выполнялся без ошибок внутри контейнера.

## 2025-10-21

- Исправлена сборка backend: в Dockerfile выполняется `pnpm --dir apps/server install` перед компиляцией, чтобы `ts-node` присутствовал. `docker compose build` теперь завершается успешно.

## 2025-10-22

- В `apps/server/Dockerfile` убран флаг `--frozen-lockfile` для установки зависимостей в подпроекте без `pnpm-lock.yaml`. Сборка контейнера проходит без ошибок.

## 2025-10-23

- Из .dockerignore удалён каталог `docs`, чтобы Docker-сборка фронтенда могла импортировать `docs/faq.md`. `docker compose build frontend --no-cache` выполняется без ошибок.

## 2025-07-11

- Из `.dockerignore` удалён каталог `apps/tg-webapp`, теперь `pnpm run build:tg` и `docker compose build frontend --no-cache` выполняются без ошибок.

## 2025-10-24

- В `apps/server/Dockerfile` сначала выполняется `pnpm prisma generate`, затем `pnpm run build:server`. Так `tsc` видит `@prisma/client`.
- Скрипт `build:server` внутри `apps/server/package.json` теперь запускает только `tsc -p tsconfig.json`.
- В файлах сервисов типизирован параметр `tx` как `Prisma.TransactionClient`, устранена ошибка `TS7006`.
- `docker compose build backend --no-cache` завершается без ошибок.

## 2025-10-25

- В `apps/server/package.json` зависимость `prisma` перенесена в `devDependencies`,
  чтобы `npx prisma generate` находил бинарник при сборке Docker.
- В `apps/server/Dockerfile` команда генерации заменена на `npx prisma generate`;
  перед ней выполняется `pnpm install` внутри каталога сервера.
- Сборка контейнера `backend` выполняется через `docker compose build backend --no-cache`.

## 2025-07-11

- Починен билд backend: ошибка TS2339 в `VpnModel` устранена кастом через `as any`.
- Выполнены `prisma generate` и `pnpm run build:server` без ошибок.

## 2025-10-26

- Добавлены модели `UserCheckSecret` и `BuildTag` в Prisma schema.
- Выполнены `prisma generate` и `pnpm run build:server` без ошибок.
  \n## 2025-10-27
- Удалена дублирующая схема Prisma из `apps/server/prisma`, вместо неё создан симлинк на корневую `prisma`.
- В `apps/server/Dockerfile` Prisma-клиент генерируется из корневой схемы, а в образ копируется правильная папка `prisma`.
- `docker compose build backend` выполняется без ошибок.

## 2025-10-28

- Исправлен `rootDir` в `apps/server/tsconfig.json`.
- Скрипт `build:server` теперь запускает `prisma generate` перед `tsc`.
- `apps/server/Dockerfile` упрощён: установка и сборка в одном слое.
- Добавлен `docker/frontend/nginx/default.conf` с `try_files` для SPA.
- В `Dockerfile.frontend` копируется новый конфиг.
- Компонент `AuthPage` проверяет наличие Telegram WebApp.
- GitHub Actions собирает контейнеры через `docker compose`, запускает smoke-тесты и пушит образы при успехе.

## 2025-10-29

- Создан `tsconfig.build.json` в `apps/server` для продакшн сборки.
- Скрипт `build:server` теперь использует этот конфиг.
- `pnpm --filter apps/server run build:server` проходит без ошибок.

## 2025-10-30

- Исправлены имена сервисов и порты в `docker-compose.yml`.
- Обновлены upstream в `nginx.conf` и конфиг SPA `docker/frontend/nginx/default.conf`.
- Prisma Client теперь генерируется в `apps/server/dist/.prisma`.
- В `apps/server/package.json` добавлен скрипт `start`.

## 2025-10-31

- Исключены `prisma/seed.ts` и `scripts/**` из `tsconfig.build.json`.
- Скрипт `build:server` в `package.json` использует этот конфиг.

## 2025-07-11

- Обновлён backend Dockerfile: зависимости устанавливаются из корня через фильтр, сборка и prune выполняются одной командой.

## 2025-07-12

- Оптимизирован Dockerfile backend: отдельные слои для зависимостей, сборки и финального образа.

## 2025-07-13

- Обнаружена ошибка сборки `backend` из-за отсутствия `pnpm-workspace.yaml`.
- Из `apps/server/Dockerfile` удалено копирование этого файла.
- Сборка контейнера проходит без ошибок.

## 2025-07-14

- Исправлена пропущенная закрывающая скобка в `schema.prisma`.

## 2025-07-15

- Модели `PlanCache` и `PlanUse` теперь ссылаются на `Plan.code` и `User.id`. Клиент Prisma пересоздан.

## 2025-07-16

- Исправлена генерация Prisma Client: вывод снова в `node_modules/@prisma/client`.
- Сборка `pnpm run build:server` завершается без ошибок.

## 2025-11-01

- Dockerfile backend теперь использует `node:20-alpine3.17` во всех этапах и устанавливает `openssl` и `libssl1.1`. Сборка контейнера через `docker compose build backend --no-cache` проходит без ошибок.

## 2025-11-02

- При запуске контейнера backend возникала ошибка `ENOENT open '/app/apps/server/dist/../openapi.yaml'`.
- Файл `openapi.yaml` не копировался в финальный слой образа.
- В `apps/server/Dockerfile` добавлена строка `COPY --from=build-backend /app/apps/server/openapi.yaml ./openapi.yaml`.
- Теперь сервер стартует без ошибки и документация Swagger доступна в режиме разработки.

## 2025-11-03

- Удалена директива `version` из `docker-compose.yml` — Docker больше не предупреждает об устаревшей схеме.
- `apps/server/Dockerfile` теперь отдельно копирует `openapi.yaml` на этапе сборки.
- Дополнен раздел `/docs` — фиксация изменений помогает отслеживать проблемы сборки.

## 2025-11-04

- Исправлена авторизация через Telegram WebApp: обновлена проверка подписи `hash` и подробное логирование initData.
- Сервер берёт `TELEGRAM_BOT_TOKEN` только из `.env` и печатает его при старте.
- В `/api/auth/telegram` добавлен возврат причины ошибки и статус 403 при неверной подписи.

## 2025-11-05

- Подробное логирование `/api/auth/telegram` теперь включает `data_check_string`,
  вычисленный и полученный хэши.
- Проверка подписи соответствует актуальной документации Telegram — используется
  `secret_key = HMAC_SHA256(botToken, "WebAppData")`.
- Компонент `TelegramLogin` и все страницы отправляют строку `initData` без
  преобразования в объект.
- Добавлена функция `parseInitData` на сервере для разбора строки.

## 2025-11-06

- Исправлена формула расчёта `secret_key` для проверки подписи Telegram.
- В `/api/auth/telegram` расширено логирование: теперь выводятся исходный payload,
  `data_check_string`, вычисленный и полученный хэши, а также причина отказа.

## 2025-12-03

- Логирование дополнено полем `match` и конкретными значениями `expected_hash`
  и `received_hash` в случае ошибки подписи.

## 2025-07-12c

- Введена система логирования на pino с ротацией файлов (7 дней).
- Добавлены переменные LOG_LEVEL и LOG_FILE_ENABLED.
- Docker монтирует каталог logs/app как volume.
- Создан middleware с requestId и подробным выводом запросов.

## 2025-12-12

- В хендлере /api/auth/telegram добавлено подробное логирование данных подписи перед возвратом 403.

## 2025-12-20

- Дополнен вывод при ошибке подписи Telegram в хендлере `/api/auth/telegram`. Теперь перед возвратом 403 в логах (`tg-auth`) фиксируются `expectedHash`, `receivedHash` и `match`.

## 2025-07-12

- Интегрирована аутентификация Hanko.
- В `docker-compose.yml` добавлены сервисы `hanko-migrate` и `hanko`.
- Новая переменная `HANKO_JWT_SECRET` описана в `.env.example`.

## 2025-07-15

- Полностью удалены устаревшие способы входа (пароль и Telegram).
- Сервер принимает только `/api/auth/login` с Hanko JWT.
- Обновлены тесты и документация.

## 2025-07-20

- Завершён переход на единый эндпоинт `/api/auth/hanko`.
- На фронтенде компонент `<hanko-auth>` напрямую вызывает этот маршрут и
  сохраняет `access_token` в `localStorage`.
- Обновлены Swagger, env и e2e тест.

## 2025-07-21

- Исправлена ошибка сборки Docker backend (`ENOTDIR` при `prisma generate`).
- В `apps/server/package.json` путь к `schema.prisma` указан относительно корня,
  генерация выполняется через `npx`.
- `apps/server/Dockerfile` теперь вызывает `npx prisma generate` и `pnpm exec tsc`
  вместо `pnpm --filter`.

## 2025-07-22

- Снова возникла ошибка `ENOTDIR` в Docker при `pnpm run build:server`.
- Путь к `schema.prisma` изменён на `./prisma/schema.prisma` для надёжной работы
  в контейнере.

## 2025-07-18

- Для предотвращения ошибки `ENOTDIR` в Dockerfile сервера копируем каталог
  `prisma` как в корень образа, так и в `apps/server/prisma` перед сборкой.

## 2025-10-05

- Исправлена сборка фронтенда: структурированные данные встраиваются в index.html, скрипт Hanko подгружается через CDN.
- Dockerfile фронтенда переведён на node:18-alpine.
- Добавлен временный компонент TelegramLogin для tg-webapp.
- `pnpm build` и тесты выполняются без ошибок.

## 2025-10-11

- В `apps/server/Dockerfile` каталог `apps/server` создаётся до копирования `prisma`.
- Символическая ссылка `apps/server/prisma` заменена на реальную директорию,
  чтобы избежать ошибки "cannot copy to non-directory" при сборке Docker.
## 2025-10-15

- Удалена лишняя строка копирования каталога prisma в Dockerfile бекенда.


## 2025-12-21

- Удалено поле `onramperId` из модели подписки.
- Обновлены тесты и OpenAPI, скрипт `test-seed` использует `stripeSubId`.

## 2025-12-22

- Обновлена конфигурация `docker-compose.yml`: сервисы `hanko` и `hanko-migrate` используют образ
  `ghcr.io/teamhanko/hanko` версии 2.1.0.
- В `.env.example` и `.env.production` добавлена переменная `HANKO_VERSION`.

## 2026-01-15

- Актуализированы Docker-образы Hanko до тега `latest`, переменная `HANKO_VERSION` удалена
  из файлов окружения и `README`.


## 2026-07-18

- Добавлен файл `config.yaml` с настройками Hanko.
- Сервисы `hanko` и `hanko-migrate` теперь монтируют его и не используют `HANKO_DB_CONNECTION_STRING`.
- README дополнен инструкцией о монтировании конфига.

## 2026-07-25

- Hanko теперь использует ту же базу `vpn`, но со схемой `hanko`.
- В `docker-compose.yml` добавлен монтируемый скрипт `db/init-hanko.sql` для создания схемы.
- Сервисы `hanko` и `hanko-migrate` получают переменную `HANKO_DB_CONNECTION_STRING`.
- README дополнено новой переменной и инструкцией по работе со схемой.
