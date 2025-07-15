#!/usr/bin/env bash
set -euo pipefail

# Скрипт проверки интеграции Hanko
# Версия: 1.0

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

check_env_vars() {
    log_info "Проверяем переменные окружения Hanko..."
    
    if [ ! -f "$REPO_DIR/.env" ]; then
        log_error ".env файл не найден"
        return 1
    fi
    
    source "$REPO_DIR/.env"
    
    local missing_vars=()
    
    [ -z "${HANKO_JWT_SECRET:-}" ] && missing_vars+=("HANKO_JWT_SECRET")
    [ -z "${VITE_HANKO_API_URL:-}" ] && missing_vars+=("VITE_HANKO_API_URL")
    [ -z "${HANKO_WEBAUTHN_RELYING_PARTY_ID:-}" ] && missing_vars+=("HANKO_WEBAUTHN_RELYING_PARTY_ID")
    [ -z "${HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS:-}" ] && missing_vars+=("HANKO_WEBAUTHN_RELYING_PARTY_ORIGINS")
    [ -z "${HANKO_CORS_ALLOW_ORIGINS:-}" ] && missing_vars+=("HANKO_CORS_ALLOW_ORIGINS")
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        log_success "Все переменные окружения Hanko настроены"
        return 0
    else
        log_error "Отсутствуют переменные: ${missing_vars[*]}"
        return 1
    fi
}

check_hanko_service() {
    log_info "Проверяем сервис Hanko..."
    
    cd "$REPO_DIR"
    
    if docker compose ps hanko | grep -q "Up"; then
        log_success "Сервис Hanko запущен"
        
        # Проверяем доступность API
        if curl -s -f http://localhost:8000/.well-known/hanko/config >/dev/null; then
            log_success "Hanko API доступен"
        else
            log_warning "Hanko API недоступен на порту 8000"
        fi
    else
        log_error "Сервис Hanko не запущен"
        return 1
    fi
}

check_database() {
    log_info "Проверяем базу данных Hanko..."
    
    cd "$REPO_DIR"
    
    if docker compose exec -T postgres psql -U vpn -d hanko -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "База данных Hanko доступна"
    else
        log_error "База данных Hanko недоступна"
        return 1
    fi
}

check_frontend_integration() {
    log_info "Проверяем интеграцию фронтенда..."
    
    if [ -f "$REPO_DIR/apps/main/src/pages/LoginPage.tsx" ]; then
        if grep -q "hanko-auth" "$REPO_DIR/apps/main/src/pages/LoginPage.tsx"; then
            log_success "Компонент hanko-auth найден в LoginPage"
        else
            log_warning "Компонент hanko-auth не найден в LoginPage"
        fi
        
        if grep -q "@teamhanko/hanko-elements" "$REPO_DIR/apps/main/src/pages/LoginPage.tsx"; then
            log_success "Импорт Hanko элементов найден"
        else
            log_error "Импорт Hanko элементов не найден"
        fi
    else
        log_error "LoginPage.tsx не найден"
    fi
}

check_backend_integration() {
    log_info "Проверяем интеграцию бэкенда..."
    
    if [ -f "$REPO_DIR/apps/server/src/routes/auth/hanko.ts" ]; then
        log_success "Маршрут аутентификации Hanko найден"
        
        if grep -q "HANKO_JWT_SECRET" "$REPO_DIR/apps/server/src/routes/auth/hanko.ts"; then
            log_success "Проверка JWT секрета настроена"
        else
            log_warning "Проверка JWT секрета может быть не настроена"
        fi
    else
        log_error "Маршрут аутентификации Hanko не найден"
    fi
}

main() {
    log_info "Начинаем проверку интеграции Hanko..."
    
    local errors=0
    
    check_env_vars || ((errors++))
    check_hanko_service || ((errors++))
    check_database || ((errors++))
    check_frontend_integration || ((errors++))
    check_backend_integration || ((errors++))
    
    echo
    if [ $errors -eq 0 ]; then
        log_success "Все проверки пройдены! Hanko интегрирован корректно."
    else
        log_error "Обнаружено $errors проблем с интеграцией Hanko."
        exit 1
    fi
}

# Проверка существования проекта
if [ ! -d "$REPO_DIR" ]; then
    log_error "Проект не найден в $REPO_DIR"
    exit 1
fi

main