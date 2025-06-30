#!/usr/bin/env bash
set -euo pipefail

DOMAIN="zerologsvpn.com"
LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"
CERT_DIR="$(dirname "$(readlink -f "$0")")/../certs"
REPO_DIR="/opt/vpn_project"

if [ ! -d "$REPO_DIR" ]; then
  sudo git clone https://github.com/Jah0x/vpn_project.git "$REPO_DIR"
fi

sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release openssl git

sudo install -m0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli docker-compose-plugin
sudo systemctl enable --now docker

curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pnpm

if [ ! -f "$REPO_DIR/.env" ]; then
  cat <<EOT | sudo tee "$REPO_DIR/.env"
NODE_ENV=production
SERVER_PORT=4000
VITE_API_BASE_URL=/api
DATABASE_URL=postgresql://vpn:vpn@postgres:5432/vpn
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
EOT
fi

sudo mkdir -p "$REPO_DIR/nginx"
cat <<EOT | sudo tee "$REPO_DIR/nginx/nginx.conf" >/dev/null
events{}
http{
  upstream backend{server backend:4000;}
  upstream frontend{server frontend:8081;}
  server{listen 8081;server_name $DOMAIN;return 301 https://\$host\$request_uri;}
  server{
    listen 443 ssl;
    server_name $DOMAIN;
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    location /api/{
      proxy_pass http://backend/;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }
    location /{
      proxy_pass http://frontend/;
      proxy_set_header Host \$host;
      proxy_set_header X-Real-IP \$remote_addr;
      proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto \$scheme;
    }
  }
}
EOT

cd "$REPO_DIR"

sudo apt install -y certbot
sudo mkdir -p "$CERT_DIR"
sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

echo "▶  Копирую сертификаты в ${CERT_DIR}"
sudo cp -L "${LE_LIVE}/fullchain.pem" "$CERT_DIR/fullchain.pem"
sudo cp -L "${LE_LIVE}/privkey.pem" "$CERT_DIR/privkey.pem"

if [ ! -s "$CERT_DIR/fullchain.pem" ] || [ ! -s "$CERT_DIR/privkey.pem" ]; then
  echo "❌  Сертификаты не скопировались — прерываю установку"; exit 1
fi

docker compose -f /opt/vpn_project/docker-compose.yml pull
docker compose -f /opt/vpn_project/docker-compose.yml up -d --build

(crontab -l 2>/dev/null; echo "0 4 * * * certbot renew --quiet && docker compose -f $REPO_DIR/docker-compose.yml exec nginx nginx -s reload") | crontab -

echo "Setup complete for $DOMAIN"
