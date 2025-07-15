#!/usr/bin/env bash
set -euo pipefail

# Улучшенный скрипт установки VPN проекта с поддержкой Hanko и Onramper
# Версия: 2.0

DOMAIN="zerologsvpn.com"
REPO_DIR="/opt/vpn_project"
CERT_DIR="$REPO_DIR/certs"
LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   log_error "Этот скрипт должен запускаться с правами root"
   exit 1
fi

log_info "Начинаем установку VPN проекта..."

# Клонирование или обновление репозитория
if [ ! -d "$REPO_DIR" ]; then
    log_info "Клонируем репозиторий..."
    git clone https://github.com/Jah0x/vpn_project.git "$REPO_DIR"
else
    log_info "Обновляем репозиторий..."
    cd "$REPO_DIR"
    git pull
fi

# Установка системных пакетов
log_info "Устанавливаем системные пакеты..."
apt update
apt install -y ca-certificates curl gnupg lsb-release openssl git

# Установка Docker
if ! command -v docker &> /dev/null; then
    log_info "Устанавливаем Docker..."
    install -m0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable" | tee /etc/apt/sources.list.d/docker.list >/dev/null
    apt update
    apt install -y docker-ce docker-ce-cli docker-compose-plugin
    systemctl enable --now docker
    log_success "Docker установлен"
else
    log_info "Docker уже установлен"
fi

# Установка Node.js и pnpm
if ! command -v node &> /dev/null; then
    log_info "Устанавливаем Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_success "Node.js установлен"
else
    log_info "Node.js уже установлен"
fi

if ! command -v pnpm &> /dev/null; then
    log_info "Устанавливаем pnpm..."
    npm install -g pnpm
    log_success "pnpm установлен"
else
    log_info "pnpm уже установлен"
fi

# Создание .env файла
if [ ! -f "$REPO_DIR/.env" ]; then
    log_info "Создаем .env файл..."
    tee "$REPO_DIR/.env" >/dev/null <<EOT
NODE_ENV=production
SERVER_PORT=4000
VITE_API_BASE_URL=/api
DATABASE_URL=postgresql://vpn:vpn@postgres:5432/vpn
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
HANKO_JWT_SECRET=$(openssl rand -hex 32)
VITE_HANKO_API_URL=https://${DOMAIN}/hanko
HANKO_WEBAUTHN_RELYING_PARTY_ID=${DOMAIN}
HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS=https://${DOMAIN},https://tg.${DOMAIN},https://admin.${DOMAIN}
HANKO_CORS_ALLOW_ORIGINS=https://${DOMAIN},https://tg.${DOMAIN},https://admin.${DOMAIN}
ONRAMPER_KEY=
VITE_ONRAMPER_KEY=
ONRAMPER_WEBHOOK_SECRET=
POSTGRES_USER=vpn
POSTGRES_PASSWORD=vpn
LOG_LEVEL=info
LOG_FILE_ENABLED=true
PINO_PRETTY_DISABLE=false
EOT
    log_success ".env файл создан"
else
    log_info ".env файл уже существует"
fi

# Установка зависимостей и сборка
cd "$REPO_DIR"
log_info "Устанавливаем зависимости..."
pnpm install --frozen-lockfile

log_info "Собираем фронтенд..."
pnpm run build

# Создание nginx конфигурации
log_info "Создаем nginx конфигурацию..."
mkdir -p "$REPO_DIR/nginx"
tee "$REPO_DIR/nginx/nginx.conf" >/dev/null <<'EOT'
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

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # Main domain
    server {
        listen 443 ssl;
        server_name ${DOMAIN};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Backend API
        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Hanko authentication API
        location /.well-known/hanko/ {
            proxy_pass http://hanko:8000/.well-known/hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /hanko/ {
            proxy_pass http://hanko:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Public plans endpoint
        location /plans {
            proxy_pass http://backend:4000/api/public/plans;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Frontend
        location / {
            root /usr/share/nginx/html/main/;
            try_files $uri /index.html;
        }
    }

    # Telegram webapp subdomain
    server {
        listen 443 ssl;
        server_name tg.${DOMAIN};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Backend API
        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Hanko authentication API
        location /.well-known/hanko/ {
            proxy_pass http://hanko:8000/.well-known/hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /hanko/ {
            proxy_pass http://hanko:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Telegram webapp frontend
        location / {
            root /usr/share/nginx/html/tg/;
            try_files $uri /index.html;
        }
    }

    # Admin subdomain
    server {
        listen 443 ssl;
        server_name admin.${DOMAIN};

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Backend API
        location /api/ {
            proxy_pass http://backend:4000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Hanko authentication API
        location /.well-known/hanko/ {
            proxy_pass http://hanko:8000/.well-known/hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /hanko/ {
            proxy_pass http://hanko:8000/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Public plans endpoint
        location /plans {
            proxy_pass http://backend:4000/api/public/plans;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin frontend
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

# Получение SSL сертификатов
log_info "Настраиваем SSL сертификаты..."
apt install -y certbot
mkdir -p "$CERT_DIR"

if certbot certonly --standalone -d "$DOMAIN" -d "tg.$DOMAIN" -d "admin.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"; then
    ln -sf "$LE_LIVE/fullchain.pem" "$CERT_DIR/fullchain.pem"
    ln -sf "$LE_LIVE/privkey.pem" "$CERT_DIR/privkey.pem"
    log_success "SSL сертификаты получены"
else
    log_warning "Не удалось получить SSL сертификаты, создаем самоподписанные"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
fi

# Запуск контейнеров
log_info "Запускаем контейнеры..."
cd "$REPO_DIR"
docker compose pull
docker compose up --build -d

# Ожидание запуска сервисов
log_info "Ожидаем запуска сервисов..."
sleep 30

# Перезапуск nginx для применения конфигурации
docker compose restart nginx

# Настройка автообновления сертификатов
log_info "Настраиваем автообновление SSL сертификатов..."
(crontab -l 2>/dev/null; echo "0 4 * * * certbot renew --quiet && docker compose -f $REPO_DIR/docker-compose.yml exec nginx nginx -s reload") | crontab -

log_success "Установка завершена!"
log_info "Доступные URL:"
log_info "  - Основное приложение: https://$DOMAIN"
log_info "  - Telegram webapp: https://tg.$DOMAIN"
log_info "  - Админ панель: https://admin.$DOMAIN"
log_info "  - Hanko API: https://$DOMAIN/hanko"

log_warning "Не забудьте настроить переменные окружения для Onramper в файле $REPO_DIR/.env"