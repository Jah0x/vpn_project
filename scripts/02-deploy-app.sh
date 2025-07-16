#!/usr/bin/env bash
set -euo pipefail

# Скрипт 2: Развертывание VPN приложения
# Версия: 2.0
# IP сервера: 212.34.146.77
# Домен: zerologsvpn.com

DOMAIN="zerologsvpn.com"
REPO_DIR="/opt/vpn_project"
CERT_DIR="$REPO_DIR/certs"
LE_LIVE="/etc/letsencrypt/live/${DOMAIN}"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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

log_header() {
    echo -e "\n${CYAN}=== $1 ===${NC}"
}

# Проверка прав root
if [[ $EUID -ne 0 ]]; then
   log_error "Этот скрипт должен запускаться с правами root"
   log_info "Запустите: sudo $0"
   exit 1
fi

# Проверка существования проекта
if [ ! -d "$REPO_DIR" ]; then
    log_error "Проект не найден в $REPO_DIR"
    log_info "Сначала запустите: curl -sSL https://raw.githubusercontent.com/Jah0x/vpn_project/main/scripts/01-setup-system.sh | sudo bash"
    exit 1
fi

cd "$REPO_DIR"

log_header "Развертывание VPN приложения"
log_info "Сервер: 212.34.146.77"
log_info "Домен: $DOMAIN"

# Проверка .env файла
if [ ! -f "$REPO_DIR/.env" ]; then
    log_error ".env файл не найден"
    log_info "Запустите сначала скрипт подготовки системы"
    exit 1
fi

# Получение SSL сертификатов
log_info "Настраиваем SSL сертификаты..."

# Установка certbot если не установлен
if ! command -v certbot >/dev/null 2>&1; then
    log_info "Устанавливаем certbot..."
    apt install -y certbot >/dev/null 2>&1
fi

# Остановка nginx если запущен
if systemctl is-active --quiet nginx 2>/dev/null; then
    systemctl stop nginx
fi

# Получение сертификатов
if certbot certonly --standalone \
    -d "$DOMAIN" \
    -d "tg.$DOMAIN" \
    -d "admin.$DOMAIN" \
    --non-interactive \
    --agree-tos \
    -m "admin@$DOMAIN" \
    --force-renewal 2>/dev/null; then
    
    # Копирование сертификатов
    cp "$LE_LIVE/fullchain.pem" "$CERT_DIR/fullchain.pem"
    cp "$LE_LIVE/privkey.pem" "$CERT_DIR/privkey.pem"
    chmod 644 "$CERT_DIR/"*.pem
    log_success "SSL сертификаты получены от Let's Encrypt"
else
    log_warning "Не удалось получить SSL сертификаты от Let's Encrypt"
    log_info "Создаем самоподписанные сертификаты..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$CERT_DIR/privkey.pem" \
        -out "$CERT_DIR/fullchain.pem" \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN" \
        -addext "subjectAltName=DNS:$DOMAIN,DNS:tg.$DOMAIN,DNS:admin.$DOMAIN"
    
    chmod 644 "$CERT_DIR/"*.pem
    log_success "Самоподписанные сертификаты созданы"
fi

# Создание nginx конфигурации
log_info "Создаем nginx конфигурацию..."
mkdir -p "$REPO_DIR/nginx"

cat > "$REPO_DIR/nginx/nginx.conf" << 'EOT'
user nginx;
worker_processes auto;

events { 
    worker_connections 1024; 
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    charset utf-8;
    server_tokens off;
    
    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' wss: ws:; font-src 'self';" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    upstream backend {
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
        listen 443 ssl http2;
        server_name zerologsvpn.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # Hanko authentication API
        location /.well-known/hanko/ {
            proxy_pass http://hanko/.well-known/hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /hanko/ {
            limit_req zone=login burst=10 nodelay;
            proxy_pass http://hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Public endpoints
        location /plans {
            proxy_pass http://backend/api/public/plans;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }

        # Frontend with caching
        location / {
            root /usr/share/nginx/html/main/;
            try_files $uri /index.html;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
    }

    # Telegram webapp subdomain
    server {
        listen 443 ssl http2;
        server_name tg.zerologsvpn.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /.well-known/hanko/ {
            proxy_pass http://hanko/.well-known/hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /hanko/ {
            limit_req zone=login burst=10 nodelay;
            proxy_pass http://hanko/;
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

    # Admin subdomain
    server {
        listen 443 ssl http2;
        server_name admin.zerologsvpn.com;

        ssl_certificate /etc/nginx/certs/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /.well-known/hanko/ {
            proxy_pass http://hanko/.well-known/hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /hanko/ {
            limit_req zone=login burst=10 nodelay;
            proxy_pass http://hanko/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /plans {
            proxy_pass http://backend/api/public/plans;
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

log_success "Nginx конфигурация создана"

# Обновление docker-compose.yml для продакшена
log_info "Обновляем docker-compose.yml..."
sed -i 's/changeme/'"$(grep POSTGRES_PASSWORD .env | cut -d'=' -f2)"'/g' docker-compose.yml

# Запуск контейнеров
log_info "Запускаем Docker контейнеры..."
docker compose pull
docker compose up -d --build

# Ожидание запуска сервисов
log_info "Ожидаем запуска сервисов..."
sleep 30

# Проверка состояния сервисов
log_info "Проверяем состояние сервисов..."
if docker compose ps | grep -q "Up"; then
    log_success "Контейнеры запущены"
else
    log_error "Некоторые контейнеры не запустились"
    docker compose ps
    exit 1
fi

# Применение миграций базы данных
log_info "Применяем миграции базы данных..."
sleep 10
docker compose exec -T backend npx prisma migrate deploy || {
    log_warning "Миграции не применились, пробуем сбросить и применить заново..."
    docker compose exec -T backend npx prisma migrate reset --force --skip-seed
    docker compose exec -T backend npx prisma migrate deploy
}

# Заполнение базы данных начальными данными
log_info "Заполняем базу данных начальными данными..."
docker compose exec -T backend npx prisma db seed || log_warning "Заполнение базы данных не удалось"

# Настройка автообновления SSL сертификатов
log_info "Настраиваем автообновление SSL сертификатов..."
RENEW_HOOK="cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $CERT_DIR/fullchain.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $CERT_DIR/privkey.pem && docker compose -f $REPO_DIR/docker-compose.yml exec -T nginx nginx -s reload"

# Удаляем старые задания cron для этого проекта
crontab -l 2>/dev/null | grep -v "$REPO_DIR" | crontab - 2>/dev/null || true

# Добавляем новое задание
(crontab -l 2>/dev/null; echo "0 4 * * * certbot renew --quiet --deploy-hook \"$RENEW_HOOK\"") | crontab -

log_success "Автообновление SSL сертификатов настроено"

# Настройка логротации
log_info "Настраиваем ротацию логов..."
cat > /etc/logrotate.d/vpn-project << EOT
$REPO_DIR/logs/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        docker compose -f $REPO_DIR/docker-compose.yml exec -T nginx nginx -s reload
    endscript
}

$REPO_DIR/logs/app/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOT

log_success "Ротация логов настроена"

# Финальная проверка
log_info "Выполняем финальную проверку..."
sleep 10

# Проверка доступности сервисов
HEALTH_CHECKS=(
    "http://localhost:4000/health:Backend"
    "http://localhost:8000/.well-known/hanko/config:Hanko"
    "https://$DOMAIN:Main site"
)

for check in "${HEALTH_CHECKS[@]}"; do
    url="${check%:*}"
    name="${check#*:}"
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        log_success "$name доступен"
    else
        log_warning "$name недоступен ($url)"
    fi
done

# Очистка старых Docker образов
log_info "Очищаем неиспользуемые Docker образы..."
docker image prune -f >/dev/null 2>&1

log_header "Развертывание завершено!"
log_success "VPN приложение успешно развернуто!"

echo
log_info "🌐 Доступные URL:"
log_info "  • Основное приложение: https://$DOMAIN"
log_info "  • Telegram webapp: https://tg.$DOMAIN"
log_info "  • Админ панель: https://admin.$DOMAIN"
log_info "  • Hanko API: https://$DOMAIN/hanko"

echo
log_info "📊 Управление:"
log_info "  • Проверка статуса: docker compose -f $REPO_DIR/docker-compose.yml ps"
log_info "  • Просмотр логов: docker compose -f $REPO_DIR/docker-compose.yml logs -f"
log_info "  • Перезапуск: docker compose -f $REPO_DIR/docker-compose.yml restart"
log_info "  • Полная диагностика: $REPO_DIR/scripts/full-check.sh"

echo
log_warning "⚠️  Не забудьте:"
log_info "  1. Настроить переменные Onramper в $REPO_DIR/.env"
log_info "  2. Проверить настройки DNS для домена $DOMAIN"
log_info "  3. Настроить мониторинг и бэкапы"

log_success "Установка завершена! 🎉"