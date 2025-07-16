#!/usr/bin/env bash
set -euo pipefail

# Скрипт 1: Подготовка системы и клонирование репозитория
# Версия: 2.0
# IP сервера: 212.34.146.77
# Домен: zerologsvpn.com

DOMAIN="zerologsvpn.com"
REPO_URL="https://github.com/Jah0x/vpn_project.git"
REPO_DIR="/opt/vpn_project"

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

log_header "Подготовка системы для VPN проекта"
log_info "Сервер: 212.34.146.77"
log_info "Домен: $DOMAIN"

# Обновление системы
log_info "Обновляем систему..."
apt update -qq
apt upgrade -y -qq

# Установка базовых пакетов
log_info "Устанавливаем базовые пакеты..."
DEBIAN_FRONTEND=noninteractive apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    openssl \
    git \
    software-properties-common \
    uuid-runtime \
    wget \
    unzip \
    htop \
    nano \
    ufw \
    fail2ban >/dev/null 2>&1

log_success "Базовые пакеты установлены"

# Настройка файрвола
log_info "Настраиваем файрвол..."
ufw --force reset >/dev/null 2>&1
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1
ufw allow ssh >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
ufw allow 8000/tcp >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1
log_success "Файрвол настроен"

# Установка Docker
if ! command -v docker >/dev/null 2>&1; then
    log_info "Устанавливаем Docker..."
    install -m0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    apt update -qq
    DEBIAN_FRONTEND=noninteractive apt install -y docker-ce docker-ce-cli docker-compose-plugin >/dev/null 2>&1
    systemctl enable --now docker
    log_success "Docker установлен: $(docker --version)"
else
    log_info "Docker уже установлен: $(docker --version)"
fi

# Установка Node.js 20
if ! command -v node >/dev/null 2>&1 || [[ $(node --version | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
    log_info "Устанавливаем Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
    DEBIAN_FRONTEND=noninteractive apt install -y nodejs >/dev/null 2>&1
    log_success "Node.js установлен: $(node --version)"
else
    log_info "Node.js уже установлен: $(node --version)"
fi

# Установка pnpm
if ! command -v pnpm >/dev/null 2>&1; then
    log_info "Устанавливаем pnpm..."
    npm install -g pnpm >/dev/null 2>&1
    log_success "pnpm установлен: $(pnpm --version)"
else
    log_info "pnpm уже установлен: $(pnpm --version)"
fi

# Клонирование репозитория
log_info "Клонируем репозиторий..."
if [ -d "$REPO_DIR" ]; then
    log_warning "Директория $REPO_DIR уже существует"
    read -p "Удалить и клонировать заново? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$REPO_DIR"
        git clone "$REPO_URL" "$REPO_DIR"
        log_success "Репозиторий переклонирован"
    else
        log_info "Обновляем существующий репозиторий..."
        cd "$REPO_DIR"
        git pull origin main
        log_success "Репозиторий обновлен"
    fi
else
    git clone "$REPO_URL" "$REPO_DIR"
    log_success "Репозиторий клонирован"
fi

# Установка зависимостей проекта
log_info "Устанавливаем зависимости проекта..."
cd "$REPO_DIR"
pnpm install --frozen-lockfile

log_success "Зависимости установлены"

# Создание базового .env файла
if [ ! -f "$REPO_DIR/.env" ]; then
    log_info "Создаем .env файл..."
    cp "$REPO_DIR/.env.example" "$REPO_DIR/.env"
    
    # Генерация секретов
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    HANKO_JWT_SECRET=$(openssl rand -hex 32)
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    
    # Обновление .env файла
    sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$REPO_DIR/.env"
    sed -i "s/^JWT_REFRESH_SECRET=.*/JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET/" "$REPO_DIR/.env"
    sed -i "s/^HANKO_JWT_SECRET=.*/HANKO_JWT_SECRET=$HANKO_JWT_SECRET/" "$REPO_DIR/.env"
    sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" "$REPO_DIR/.env"
    sed -i "s/^VITE_HANKO_API_URL=.*/VITE_HANKO_API_URL=https:\/\/$DOMAIN\/hanko/" "$REPO_DIR/.env"
    sed -i "s/^HANKO_WEBAUTHN_RELYING_PARTY_ID=.*/HANKO_WEBAUTHN_RELYING_PARTY_ID=$DOMAIN/" "$REPO_DIR/.env"
    sed -i "s/^HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS=.*/HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS=https:\/\/$DOMAIN,https:\/\/tg.$DOMAIN,https:\/\/admin.$DOMAIN/" "$REPO_DIR/.env"
    sed -i "s/^HANKO_CORS_ALLOW_ORIGINS=.*/HANKO_CORS_ALLOW_ORIGINS=https:\/\/$DOMAIN,https:\/\/tg.$DOMAIN,https:\/\/admin.$DOMAIN/" "$REPO_DIR/.env"
    sed -i "s/changeme/$POSTGRES_PASSWORD/g" "$REPO_DIR/.env"
    
    log_success ".env файл создан с сгенерированными секретами"
else
    log_info ".env файл уже существует"
fi

# Сборка фронтенда
log_info "Собираем фронтенд..."
pnpm run build
log_success "Фронтенд собран"

# Создание директорий
log_info "Создаем необходимые директории..."
mkdir -p "$REPO_DIR/certs"
mkdir -p "$REPO_DIR/logs/nginx"
mkdir -p "$REPO_DIR/logs/app"
log_success "Директории созданы"

# Установка прав доступа
chown -R root:root "$REPO_DIR"
chmod +x "$REPO_DIR/scripts/"*.sh

log_header "Подготовка системы завершена!"
log_success "Система готова к развертыванию приложения"
log_info "Следующий шаг: запустите скрипт развертывания:"
log_info "  sudo $REPO_DIR/scripts/02-deploy-app.sh"
log_warning "Не забудьте настроить переменные Onramper в $REPO_DIR/.env перед развертыванием"