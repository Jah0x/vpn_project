#!/usr/bin/env bash
set -e

REPO_DIR="/opt/vpn_project"
cd "$REPO_DIR"

sudo git pull
echo "Repository updated"

sudo docker compose pull
sudo docker compose up --build -d

sudo certbot renew --quiet
sudo docker compose exec nginx nginx -s reload

echo "Update complete"
