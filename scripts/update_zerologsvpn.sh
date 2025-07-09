#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/vpn_project"
LOG_DIR="$REPO_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/update_$(date +%F_%H-%M-%S).log"

exec > >(tee -a "$LOG_FILE") 2>&1

cd "$REPO_DIR"
echo "== $(date) Starting update =="

sudo git pull
echo "Repository updated"

pnpm install --frozen-lockfile
pnpm run build

sudo docker compose pull
sudo docker compose up --build -d

sudo certbot renew --quiet
sudo docker compose exec nginx nginx -s reload || true

echo "== $(date) Update complete =="
