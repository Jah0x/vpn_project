#!/usr/bin/env bash
# complete (prod + dev) installer for vpn_project — **fully unattended**
# shellcheck disable=SC2086,SC2155
set -euo pipefail
IFS=$'\n\t'

# ───────────────── CONFIG ─────────────────
DOMAIN="zerologsvpn.com"          # основной домен
EMAIL="admin@${DOMAIN}"           # для Let's Encrypt
REPO_DIR="/opt/vpn_project"       # куда кладём репо
CERT_DIR="$REPO_DIR/certs"        # сюда будут ссылаться certbot/self‑signed
ENV_FILE="$REPO_DIR/.env"

# docker‑compose wrapper
compose() {
  docker compose -f "$REPO_DIR/docker-compose.yml" "$@"
}

# ───────────── helper functions ─────────────
C_RESET="\033[0m"; C_RED="\033[1;31m"; C_YEL="\033[1;33m"; C_CYN="\033[1;36m"; C_GRN="\033[1;32m"
header() { echo -e "\n${C_CYN}==> $*${C_RESET}"; }
die()    { echo -e "${C_RED}$*${C_RESET}"; exit 1; }
warn()   { echo -e "${C_YEL}$*${C_RESET}"; }
need_root() { [[ $EUID -eq 0 ]] || die "Run as root (sudo)."; }

install_packages() {
  header "Install system packages"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates curl gnupg lsb-release openssl git software-properties-common >/dev/null
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
    apt-get install -y docker-ce docker-ce-cli docker-compose-plugin >/dev/null
    systemctl enable --now docker
  fi
}

install_node() {
  header "Install Node 20 + pnpm"
  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs >/dev/null
  fi
  if ! command -v pnpm >/dev/null 2>&1; then
    npm install -g pnpm >/dev/null
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

obtain_certs() {
  header "Ensure TLS certificates"
  mkdir -p "$CERT_DIR"

  # Skip if certs already exist
  if [[ -s $CERT_DIR/fullchain.pem && -s $CERT_DIR/privkey.pem ]]; then
    echo "certs already present — skip obtain"
    return 0
  fi

  # Install certbot if missing
  if ! command -v certbot >/dev/null 2>&1; then
    apt-get install -y certbot >/dev/null
  fi

  local LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"
  local CERTBOT_ARGS=( --standalone --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN" -d "tg.$DOMAIN" )

  if certbot certonly "${CERTBOT_ARGS[@]}"; then
    ln -sf "$LE_LIVE/fullchain.pem" "$CERT_DIR/fullchain.pem"
    ln -sf "$LE_LIVE/privkey.pem"  "$CERT_DIR/privkey.pem"
  else
    warn "Let's Encrypt failed — falling back to self‑signed cert"
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
      -keyout  "$CERT_DIR/privkey.pem" \
      -out     "$CERT_DIR/fullchain.pem" \
      -subj "/CN=$DOMAIN"
  fi
}

build_frontend() {
  header "Install deps & build front‑end apps"
  pnpm --dir "$REPO_DIR" install --frozen-lockfile
  pnpm --dir "$REPO_DIR" run build
}

run_migrations() {
  header "Run Prisma migrate + seed"
  # bring up only Postgres first
  compose up -d postgres
  until compose exec -T postgres pg_isready -U vpn -d postgres &>/dev/null; do
    echo " waiting for Postgres …"; sleep 2
  done

  # Helper to reduce repetition
  local RUN=(compose run --rm -T -e CI=true backend)

  # apply migrations (with safe fallback)
  if ! "${RUN[@]}" npx prisma migrate deploy; then
    warn "migrate deploy failed ⇒ resetting schema and re‑applying migrations"
    "${RUN[@]}" sh -c "npx prisma migrate reset --force --skip-seed && npx prisma migrate deploy"
  fi
  "${RUN[@]}" npx prisma db push

  # seed (non‑fatal)
  set +e
  "${RUN[@]}" npx prisma db seed || warn "Seeding failed, but schema is in sync — continue."
  set -e
}

start_stack() {
  header "Build & start all containers"
  compose pull
  compose up -d --build
}

smoke_test() {
  header "Smoke‑test (curl‑matrix)"
  pushd "$REPO_DIR" >/dev/null
  if ./scripts/curl-matrix.sh; then
    echo -e "${C_GRN}✓ stack looks healthy${C_RESET}"
  else
    die "Smoke‑test failed – check logs!"
  fi
  popd >/dev/null
}

schedule_renew() {
  header "Add certbot renew cron"
  ( crontab -l 2>/dev/null; \
    echo "0 4 * * * certbot renew --quiet && docker compose -f $REPO_DIR/docker-compose.yml exec -T nginx nginx -s reload || true" \
  ) | crontab -
}

# ───────────────── main flow ─────────────────
need_root
install_packages
install_docker
install_node
clone_repo
prepare_env
obtain_certs
build_frontend
run_migrations
start_stack
compose restart nginx
smoke_test
schedule_renew

echo -e "\n${C_GRN}✓ Installation complete → https://$DOMAIN/login${C_RESET}"
