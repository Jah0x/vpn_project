#!/usr/bin/env bash
set -e

DOMAIN="zerologsvpn.com"
REPO_DIR="/opt/vpn_project"
CERT_DIR="$REPO_DIR/certs"

# 1. Clone repository
if [ ! -d "$REPO_DIR" ]; then
  sudo git clone https://github.com/Jah0x/vpn_project.git "$REPO_DIR"
fi

# 2. Install dependencies
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot postgresql postgresql-contrib curl
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pnpm
sudo systemctl enable --now postgresql

# 3. Create .env
if [ ! -f "$REPO_DIR/.env" ]; then
  cat <<EOT | sudo tee "$REPO_DIR/.env"
NODE_ENV=production
SERVER_PORT=4000
VITE_API_BASE_URL=/api
DATABASE_URL=postgresql://vpn:vpn@localhost:5432/vpn
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
EOT
fi

# 4. Start containers
cd "$REPO_DIR"
sudo docker compose up --build -d

# 5. Nginx config inside container
sudo mkdir -p "$CERT_DIR"
cat <<EOT | sudo tee "$REPO_DIR/nginx/nginx.conf" >/dev/null
user nginx;
worker_processes auto;

events { worker_connections 1024; }

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    sendfile        on;
    keepalive_timeout  65;

    upstream backend {
        server backend:4000;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;
        server_name $DOMAIN;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name $DOMAIN;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass http://frontend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOT

# 6. Obtain SSL certificates
sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos -m admin@$DOMAIN
sudo ln -sf /etc/letsencrypt/live/$DOMAIN/fullchain.pem "$CERT_DIR/fullchain.pem"
sudo ln -sf /etc/letsencrypt/live/$DOMAIN/privkey.pem "$CERT_DIR/privkey.pem"

sudo docker compose restart nginx

# 7. Cron for certificate renewal
(crontab -l 2>/dev/null; echo "0 4 * * * certbot renew --quiet && docker compose -f $REPO_DIR/docker-compose.yml exec nginx nginx -s reload") | crontab -

echo "Setup complete for $DOMAIN"
