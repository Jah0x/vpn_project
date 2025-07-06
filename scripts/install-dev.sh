#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

check_docker() {
  if ! docker --version >/dev/null 2>&1; then
    echo "Docker not installed."
    exit 1
  fi
  local v
  v=$(docker version --format '{{.Server.Version}}' | cut -d. -f1)
  if [[ -z "$v" || $v -lt 24 ]]; then
    echo "Require Docker >= 24" >&2
    exit 1
  fi
  if ! docker compose version >/dev/null 2>&1; then
    echo "Docker Compose V2 required" >&2
    exit 1
  fi
}

check_pnpm() {
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "pnpm not found, installing via corepack"
    corepack enable pnpm@9
  fi
}

setup_env() {
  if [ ! -f .env ]; then
    cp .env.example .env
    sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(uuidgen)/" .env
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(uuidgen)/" .env
    echo "Создан дефолтный .env"
  fi
}

setup_certs() {
  mkdir -p certs
  if [ ! -f certs/fullchain.pem ] || [ ! -f certs/privkey.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -subj "/CN=localhost" \
      -keyout certs/privkey.pem -out certs/fullchain.pem
    chmod 600 certs/privkey.pem
  fi
}

wait_postgres() {
  until docker compose exec postgres pg_isready -U vpn >/dev/null 2>&1; do
    echo "Waiting for Postgres..."
    sleep 2
  done
}

health_check() {
  local service=$1
  local id
  id=$(docker compose ps -q "$service")
  until [ "$(docker inspect -f '{{.State.Health.Status}}' "$id")" = "healthy" ]; do
    echo "Waiting for $service..."
    sleep 2
  done
}

run_matrix() {
  local out
  out=$(bash scripts/curl-matrix.sh)
  echo "$out"
  local ok=0
  echo "$out" | grep -Eq 'tg\.zerologsvpn\.com .*telegram\s+→\s+(400|401)' || ok=1
  echo "$out" | grep -Eq 'zerologsvpn\.com\s+POST\s+/api/auth/telegram\s+→\s+403' || ok=1
  echo "$out" | grep -Eq 'zerologsvpn\.com\s+POST\s+/api/auth/login\s+→\s+401' || ok=1
  echo "$out" | grep -Eq 'tg\.zerologsvpn\.com\s+POST\s+/api/auth/login\s+→\s+403' || ok=1
  if [ $ok -ne 0 ]; then
    echo -e "\e[31mRED ❌\e[0m"
    echo "Смотрите логи: pnpm docker:logs"
    return 1
  fi
}

main() {
  check_docker
  check_pnpm
  setup_env
  setup_certs

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

  echo -e "\e[32mEverything is up! → https://localhost/login\e[0m"
}

main "$@"
