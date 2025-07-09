#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="/opt/vpn_project"
LOG_DIR="$REPO_DIR/logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/update_$(date +%F_%H-%M-%S).log"

if command -v docker-compose >/dev/null 2>&1; then
  compose_cmd="docker-compose"
else
  compose_cmd="docker compose"
fi

command -v pnpm >/dev/null 2>&1 || { echo "pnpm not installed" >&2; exit 1; }

exec > >(tee -a "$LOG_FILE") 2>&1

cd "$REPO_DIR"
echo "== $(date) Starting update =="

sudo git fetch --all
sudo git reset --hard origin/main
echo "Repository updated"

pnpm install --frozen-lockfile
pnpm run build

sudo $compose_cmd pull
sudo $compose_cmd up --build -d

sudo certbot renew --quiet
sudo $compose_cmd exec nginx nginx -s reload || true

echo "== $(date) Update complete =="
