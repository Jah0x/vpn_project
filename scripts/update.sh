#!/usr/bin/env bash
set -euo pipefail

# Скрипт обновления VPN проекта
# Версия: 2.0

REPO_DIR="/opt/vpn_project"

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

# Проверка существования проекта
if [ ! -d "$REPO_DIR" ]; then
    log_error "Проект не найден в $REPO_DIR. Сначала запустите install-improved.sh"
    exit 1
fi

cd "$REPO_DIR"

log_info "Начинаем обновление VPN проекта..."

# Создание бэкапа
BACKUP_DIR="/opt/vpn_project_backup_$(date +%Y%m%d_%H%M%S)"
log_info "Создаем бэкап в $BACKUP_DIR..."
cp -r "$REPO_DIR" "$BACKUP_DIR"
log_success "Бэкап создан"

# Остановка контейнеров
log_info "Останавливаем контейнеры..."
docker compose down

# Обновление кода
log_info "Обновляем код из репозитория..."
git stash push -m "Auto stash before update $(date)"
git pull origin main
log_success "Код обновлен"

# Обновление зависимостей
log_info "Обновляем зависимости..."
pnpm install --frozen-lockfile

# Сборка фронтенда
log_info "Пересобираем фронтенд..."
pnpm run build

# Обновление образов Docker
log_info "Обновляем Docker образы..."
docker compose pull

# Применение миграций базы данных
log_info "Применяем миграции базы данных..."
docker compose up -d postgres
sleep 10
docker compose run --rm backend npx prisma migrate deploy

# Запуск всех сервисов
log_info "Запускаем все сервисы..."
docker compose up -d --build

# Ожидание запуска
log_info "Ожидаем запуска сервисов..."
sleep 30

# Проверка здоровья сервисов
log_info "Проверяем состояние сервисов..."
if docker compose ps | grep -q "Up"; then
    log_success "Сервисы запущены"
else
    log_error "Некоторые сервисы не запустились"
    docker compose ps
    exit 1
fi

# Очистка старых образов
log_info "Очищаем неиспользуемые Docker образы..."
docker image prune -f

log_success "Обновление завершено!"
log_info "Бэкап сохранен в: $BACKUP_DIR"
log_info "Для отката выполните: rm -rf $REPO_DIR && mv $BACKUP_DIR $REPO_DIR && cd $REPO_DIR && docker compose up -d"