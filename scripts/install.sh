#!/usr/bin/env bash
set -euo pipefail

DOMAIN="zerologsvpn.com"
REPO_DIR="/opt/vpn_project"
CERT_DIR="$REPO_DIR/certs"
LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"

if [ ! -d "$REPO_DIR" ]; then
  sudo git clone https://github.com/Jah0x/vpn_project.git "$REPO_DIR"
fi

sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release openssl git

sudo install -m0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli docker-compose-plugin
sudo systemctl enable --now docker

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pnpm

cd "$REPO_DIR"
pnpm install --frozen-lockfile
pnpm run build

if [ ! -f "$REPO_DIR/.env" ]; then
  sudo tee "$REPO_DIR/.env" >/dev/null <<EOT
NODE_ENV=production
SERVER_PORT=4000
VITE_API_BASE_URL=/api
DATABASE_URL=postgresql://vpn:vpn@postgres:5432/vpn
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
HANKO_JWT_SECRET=$(openssl rand -hex 32)
VITE_HANKO_API_URL=https://${DOMAIN}:8000
HANKO_WEBAUTHN_RELYING_PARTY_ID=${DOMAIN}
HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS=https://${DOMAIN},https://tg.${DOMAIN},https://admin.${DOMAIN}
HANKO_CORS_ALLOW_ORIGINS=https://${DOMAIN},https://tg.${DOMAIN},https://admin.${DOMAIN}
ONRAMPER_KEY=
VITE_ONRAMPER_KEY=
ONRAMPER_WEBHOOK_SECRET=
EOT
fi

sudo mkdir -p "$REPO_DIR/nginx"
sudo tee "$REPO_DIR/nginx/nginx.conf" >/dev/null <<'EOT'
user nginx;
worker_processes auto;

events { worker_connections 1024; }

http {
    include /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;
    charset utf-8;
    server_tokens off;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Server "" always;
    add_header Content-Security-Policy "script-src 'self' https://telegram.org" always;

    upstream api {
        server backend:4000;
    }

    upstream frontend {
        server frontend:8081;
    }

    upstream hanko {
        server hanko:8000;
    }

    resolver 127.0.0.11 valid=30s;

    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    server {
        listen 80;
        server_name admin.${DOMAIN};
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name ${DOMAIN};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /plans {
            proxy_pass http://backend:4000/api/public/plans;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            root /usr/share/nginx/html/main/;
            try_files $uri /index.html;
        }
    }

    server {
        listen 443 ssl;
        server_name tg.${DOMAIN};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            root /usr/share/nginx/html/tg/;
            try_files $uri /index.html;
        }
    }

    server {
        listen 443 ssl;
        server_name admin.${DOMAIN};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /plans {
            proxy_pass http://backend:4000/api/public/plans;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOT

cd "$REPO_DIR"

sudo docker compose pull
sudo docker compose up --build -d

sudo apt install -y certbot
sudo mkdir -p "$CERT_DIR"
sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"
sudo ln -sf "$LE_LIVE/fullchain.pem" "$CERT_DIR/fullchain.pem"
sudo ln -sf "$LE_LIVE/privkey.pem" "$CERT_DIR/privkey.pem"

sudo docker compose restart nginx

(crontab -l 2>/dev/null; echo "0 4 * * * certbot renew --quiet && docker compose -f $REPO_DIR/docker-compose.yml exec nginx nginx -s reload") | crontab -

echo "Setup complete for $DOMAIN"
