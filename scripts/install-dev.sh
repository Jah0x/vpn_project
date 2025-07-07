#!/usr/bin/env bash
# complete (prod + dev) installer for vpn_project

set -euo pipefail
IFS=$'\n\t'

# ──────────────── CONFIG ────────────────
DOMAIN="zerologsvpn.com"            # основной домен
EMAIL="admin@${DOMAIN}"             # для Let's Encrypt
REPO_DIR="/opt/vpn_project"         # куда кладём репо
CERT_DIR="$REPO_DIR/certs"          # сюда будут ссылаться certbot‑файлы
ENV_FILE="$REPO_DIR/.env"

# docker‑compose wrapper
compose() {
  docker compose -f "$REPO_DIR/docker-compose.yml" "$@"
}

# ───────────── helper functions ─────────────
header() { echo -e "\n\033[1;36m==> $*\033[0m"; }
die()    { echo -e "\033[1;31m$*\033[0m"; exit 1; }
need_root() { [[ $EUID -eq 0 ]] || die "Run as root (sudo)."; }

install_packages() {
  header "Install system packages"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates curl gnupg lsb-release openssl git software-properties-common
}

install_docker() {
  header "Install Docker + Compose"
  if ! command -v docker >/dev/null 2>&1; then
    install -m0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
      gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli docker-compose-plugin
    systemctl enable --now docker
  fi
}

install_node() {
  header "Install Node 20 + pnpm"
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
  fi
  if ! command -v pnpm >/dev/null 2>&1; then
    npm install -g pnpm
  fi
}

clone_repo() {
  header "Clone / update repository"
  if [[ ! -d $REPO_DIR/.git ]]; then
    git clone https://github.com/Jah0x/vpn_project.git "$REPO_DIR"
  else
    git -C "$REPO_DIR" pull --ff-only
  fi
}

prepare_env() {
  header "Create .env if absent"
  if [[ ! -f $ENV_FILE ]]; then
    cp "$REPO_DIR/.env.example" "$ENV_FILE"
    sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$(uuidgen)/" "$ENV_FILE"
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(uuidgen)/" "$ENV_FILE"
  fi
}

build_frontend() {
  header "Install deps & build front‑end apps"
  pnpm --dir "$REPO_DIR" install --frozen-lockfile
  pnpm --dir "$REPO_DIR" run build
}

run_migrations() {
  header "Run Prisma migrate + seed"
  compose up -d postgres
  until compose exec postgres pg_isready -U vpn -d postgres &>/dev/null; do
    echo "   waiting for Postgres …"; sleep 2
  done
  # apply migrations, fallback to reset
  if ! compose run --rm backend npx prisma migrate deploy; then
    echo "migrate deploy failed ⇒ resetting schema and re‑applying migrations"
    compose run --rm backend sh -c "npx prisma migrate reset --force --skip-seed && npx prisma migrate deploy"
  fi
  # ensure schema is in sync
  compose run --rm backend npx prisma db push
  # seed (non‑fatal)
  set +e
  compose run --rm backend npx prisma db seed
  if [[ $? -ne 0 ]]; then
    echo -e "\033[33m⚠️  Seeding failed, but schema is in sync — continue.\033[0m"
  fi
  set -e
}

start_stack() {
  header "Build & start all containers"
  compose pull
  compose up -d --build
}

obtain_certs() {
  header "Obtain / renew Let's Encrypt certs (zerologsvpn.com + tg)"
  apt-get install -y certbot >/dev/null
  mkdir -p "$CERT_DIR"

  if certbot certificates 2>/dev/null | grep -q "Certificate Name: ${DOMAIN}"; then
    certbot certonly --standalone --non-interactive --agree-tos \
      --cert-name "$DOMAIN" --expand \
      -m "$EMAIL" -d "$DOMAIN" -d "tg.$DOMAIN"
  else
    certbot certonly --standalone --non-interactive --agree-tos \
      -m "$EMAIL" -d "$DOMAIN" -d "tg.$DOMAIN"
  fi

  local LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"
  if [[ ! -f $LE_LIVE/fullchain.pem ]]; then
    die "Certbot failed — certs not found in $LE_LIVE (check logs)"
  fi

  ln -sf "$LE_LIVE/fullchain.pem" "$CERT_DIR/fullchain.pem"
  ln -sf "$LE_LIVE/privkey.pem"  "$CERT_DIR/privkey.pem"
}

smoke_test() {
  header "Smoke‑test (curl‑matrix)"
  pushd "$REPO_DIR" >/dev/null
  if ./scripts/curl-matrix.sh; then
    echo -e "\033[32m✓ stack looks healthy\033[0m"
  else
    echo -e "\033[31mSmoke‑test failed – check logs!\033[0m"
  fi
  popd >/dev/null
}

schedule_renew() {
  header "Add certbot renew cron"
  ( crontab -l 2>/dev/null; \
    echo "0 4 * * * certbot renew --quiet && docker compose -f $REPO_DIR/docker-compose.yml exec nginx nginx -s reload" \
  ) | crontab -
}

# ─────────────── main flow ───────────────
need_root
install_packages
install_docker
install_node
clone_repo
prepare_env
build_frontend
run_migrations
start_stack
obtain_certs
compose restart nginx
smoke_test
schedule_renew

echo -e "\n\033[1;32mInstallation complete! → https://$DOMAIN/login\033[0m"
