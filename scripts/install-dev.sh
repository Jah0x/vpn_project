#!/usr/bin/env bash
# complete (prod + dev) installer for vpn_project — **fully unattended**
# shellcheck disable=SC2086,SC2155
set -euo pipefail
IFS=$'\n\t'

################################################################################
#  CONFIGURATION                                                                #
################################################################################

DOMAIN="zerologsvpn.com"            # основной домен
EMAIL="admin@${DOMAIN}"             # почта для Let's Encrypt
REPO_DIR="/opt/vpn_project"         # куда клонируем репозиторий
CERT_DIR="$REPO_DIR/certs"          # bind‑mount для nginx
ENV_FILE="$REPO_DIR/.env"

compose() {
  docker compose -f "$REPO_DIR/docker-compose.yml" "$@"
}

################################################################################
#  UTILS                                                                        #
################################################################################
C_RESET="\033[0m"; C_RED="\033[1;31m"; C_YEL="\033[1;33m"; C_CYN="\033[1;36m"; C_GRN="\033[1;32m"
header() { echo -e "\n${C_CYN}==> $*${C_RESET}"; }
die()    { echo -e "${C_RED}$*${C_RESET}"; exit 1; }
warn()   { echo -e "${C_YEL}$*${C_RESET}"; }
need_root() { [[ $EUID -eq 0 ]] || die "Run as root (sudo)."; }

################################################################################
#  STEP 1. SYSTEM PRE‑REQUISITES                                                #
################################################################################
install_packages() {
  header "Install base packages"
  apt-get update -qq
  DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates curl gnupg lsb-release openssl git software-properties-common uuid-runtime >/dev/null
}

install_docker() {
  header "Install Docker + Compose"
  if ! command -v docker >/dev/null 2>&1; then
    install -m0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
      https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
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
  command -v pnpm >/dev/null 2>&1 || npm install -g pnpm >/dev/null
}

################################################################################
#  STEP 2. SOURCE CODE + ENV                                                    #
################################################################################
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

################################################################################
#  STEP 3. TLS CERTIFICATES                                                     #
################################################################################
obtain_certs() {
  header "Ensure TLS certificates"
  mkdir -p "$CERT_DIR"

  # 3.1  Clean leftovers (symlinks or 0‑byte files)
  for f in fullchain.pem privkey.pem; do
    [[ -L $CERT_DIR/$f || ! -s $CERT_DIR/$f ]] && rm -f "$CERT_DIR/$f"
  done

  # 3.2  If real files already exist – skip
  if [[ -s $CERT_DIR/fullchain.pem && -s $CERT_DIR/privkey.pem ]]; then
    echo "✓ Valid certs already present"
    return 0
  fi

  # 3.3  Install certbot if missing
  command -v certbot >/dev/null 2>&1 || apt-get install -y certbot >/dev/null

  local LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"
  local CERTBOT_ARGS=(--standalone --non-interactive --agree-tos -m "$EMAIL" -d "$DOMAIN" -d "tg.$DOMAIN")

  if certbot certonly "${CERTBOT_ARGS[@]}"; then
    cp "$LE_LIVE/fullchain.pem" "$CERT_DIR/fullchain.pem"
    cp "$LE_LIVE/privkey.pem"   "$CERT_DIR/privkey.pem"
    chmod 644 "$CERT_DIR/"*.pem
    echo "✓ Let’s Encrypt issued certs"
  else
    warn "Let’s Encrypt failed — generating self‑signed pair"
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
      -keyout "$CERT_DIR/privkey.pem" \
      -out    "$CERT_DIR/fullchain.pem" \
      -subj "/CN=$DOMAIN"
  fi
}

################################################################################
#  STEP 4. FRONTEND BUILD                                                       #
################################################################################
build_frontend() {
  header "Install deps & build frontend"
  pnpm --dir "$REPO_DIR" install --frozen-lockfile

  # auto‑approve build scripts (pnpm v10)
  pnpm --dir "$REPO_DIR" exec pnpm approve-builds --yes >/dev/null 2>&1 || true

  pnpm --dir "$REPO_DIR" run build

  # guarantee index.html in dist root to avoid nginx rewrite loop
  if [[ -f "$REPO_DIR/dist/main/index.html" ]]; then
    cp -f "$REPO_DIR/dist/main/index.html" "$REPO_DIR/dist/index.html"
  fi
}

################################################################################
#  STEP 5. DATABASE MIGRATIONS                                                  #
################################################################################
run_migrations() {
  header "Run Prisma migrations & seed"

  compose up -d postgres
  until compose exec -T postgres pg_isready -U vpn -d postgres &>/dev/null; do
    echo " waiting for Postgres …"; sleep 2
  done

  local RUN=(compose run --rm -T -e CI=true backend)

  if ! "${RUN[@]}" npx prisma migrate deploy; then
    warn "migrate deploy failed – resetting & redeploying"
    "${RUN[@]}" sh -c "npx prisma migrate reset --force --skip-seed && npx prisma migrate deploy"
  fi
  "${RUN[@]}" npx prisma db push

  set +e; "${RUN[@]}" npx prisma db seed || warn "Seeding failed"; set -e
}

################################################################################
#  STEP 6. START STACK                                                          #
################################################################################
start_stack() {
  header "Start all containers"
  compose pull
  compose up -d --build
}

################################################################################
#  OPTIONAL: SMOKE TEST                                                         #
################################################################################
smoke_test() {
  header "Smoke‑test"
  if [[ -x "$REPO_DIR/scripts/curl-matrix.sh" ]]; then
    pushd "$REPO_DIR" >/dev/null
    ./scripts/curl-matrix.sh || warn "Smoke‑test failed, check logs"
    popd >/dev/null
  fi
}

################################################################################
#  CRON RENEW                                                                   #
################################################################################
schedule_renew() {
  header "Schedule certbot renew"
  local HOOK="cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem $CERT_DIR/fullchain.pem && cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem $CERT_DIR/privkey.pem && docker compose -f $REPO_DIR/docker-compose.yml exec -T nginx nginx -s reload || true"
  (crontab -l 2>/dev/null; echo "0 4 * * * certbot renew --quiet --deploy-hook \"$HOOK\"") | crontab -
}

################################################################################
#  MAIN FLOW                                                                    #
################################################################################
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
compose restart nginx || true
smoke_test
schedule_renew

echo -e "\n${C_GRN}✓ Installation complete → https://${DOMAIN}/login${C_RESET}"
