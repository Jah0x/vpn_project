#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# ───────────────────────────── helpers ─────────────────────────────

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌  Docker не установлен." >&2; exit 1
  fi
  # major version
  local v
  v=$(docker version --format '{{.Server.Version}}' | cut -d. -f1)
  if [[ -z "$v" || $v -lt 24 ]]; then
    echo "❌  Требуется Docker ≥ 24." >&2; exit 1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    echo "❌  Требуется Docker Compose V2." >&2; exit 1
  fi
}

check_pnpm() {
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "→ pnpm не найден, устанавливаю через corepack"
    corepack enable pnpm@9
  fi
}

setup_env() {
  if [[ ! -f .env ]]; then
    cp .env.example .env
    sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(uuidgen)/" .env
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(uuidgen)/" .env
    echo "✓ Создан дефолтный .env"
  fi
}

check_certs() {
  mkdir -p certs
  if [[ ! -f certs/fullchain.pem || ! -f certs/privkey.pem ]]; then
    echo -e "\n❌  Не найдены certs/fullchain.pem и/или certs/privkey.pem"
    echo "   Получите валидный SSL-сертификат (Let’s Encrypt / ZeroSSL) и"
    echo "   положите файлы в каталог certs/ перед запуском установки."
    exit 1
  fi
}

wait_postgres() {
  until docker compose exec postgres pg_isready -U "${POSTGRES_USER:-vpn}" >/dev/null 2>&1; do
    echo "⌛  Жду готовности Postgres…"; sleep 2
  done
}

health_check() {
  local svc=$1 id
  id=$(docker compose ps -q "$svc")
  if [[ -z $id ]]; then echo "❌  Сервис $svc не запущен"; exit 1; fi
  # если HEALTHCHECK не определён — пропускаем ожидание
  if docker inspect "$id" | grep -q '"Health":'; then
    until [[ "$(docker inspect -f '{{.State.Health.Status}}' "$id")" == "healthy" ]]; do
      echo "⌛  Жду $svc (healthcheck)…"; sleep 2
    done
  fi
}

run_matrix() {
  local out ok=0
  out=$(bash scripts/curl-matrix.sh); echo "$out"
  echo "$out" | grep -Eq 'tg\.zerologsvpn\.com .*telegram.*→ (400|401)' || ok=1
  echo "$out" | grep -Eq 'zerologsvpn\.com .*\/auth\/telegram.*→ 403'      || ok=1
  echo "$out" | grep -Eq 'zerologsvpn\.com .*\/auth\/login.*→ 401'         || ok=1
  echo "$out" | grep -Eq 'tg\.zerologsvpn\.com .*\/auth\/login.*→ 403'     || ok=1
  if (( ok )); then
    echo -e "\e[31mRED ❌  Smoke-тест не пройден. Смотрите логи: pnpm docker:logs\e[0m"
    exit 1
  fi
}

# ───────────────────────────── workflow ────────────────────────────

main() {
  check_docker
  check_pnpm
  setup_env
  check_certs                    # ← сертификаты обязаны быть до compose-старта

  docker compose up -d postgres
  wait_postgres

  pnpm --filter server exec prisma migrate deploy
  pnpm --filter server exec prisma db seed

  pnpm --filter apps/main build
  pnpm --filter apps/tg-webapp build

  docker compose up -d --build backend frontend nginx
  health_check backend
  health_check nginx

  run_matrix
  echo -e "\e[32m✓ Всё поднято! → https://localhost/login\e[0m"
}

main "$@"
