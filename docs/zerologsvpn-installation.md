# Установка zerologsvpn.com

Этот документ описывает процесс автоматической установки VPN-сайта на домен `zerologsvpn.com`.

## Подготовка

1. Убедитесь, что сервер использует Ubuntu 22.04+ и имеет права `sudo`.
2. Выполните скрипт `scripts/setup_zerologsvpn.sh`:

```bash
sudo bash scripts/setup_zerologsvpn.sh
```

Скрипт выполнит:
- клонирование репозитория в `/opt/vpn_project`;
- установку Docker, docker-compose, nginx, certbot, Node.js 18, pnpm и PostgreSQL;
- создание файла `.env` с сгенерированными секретами;
- сборку и запуск контейнеров (`docker compose up --build`);
- настройку nginx внутри Docker (роутинг `/` → frontend, `/api` → backend);
- запрос SSL‑сертификата через `certbot` и подключение его к контейнеру;
- добавление cron‑задачи на автоматическое продление сертификата и перезагрузку nginx.

## Обновление

Для последующего обновления используйте скрипт `scripts/update_zerologsvpn.sh`:

```bash
sudo bash scripts/update_zerologsvpn.sh
```

Он подтянет последние изменения из репозитория, пересоберёт образы и перезапустит сервисы, а также обновит сертификаты.
