#!/usr/bin/env bash
set -euo pipefail

# Полная проверка VPN проекта
# Версия: 1.0

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

check_system_requirements() {
    log_header "Проверка системных требований"
    
    local errors=0
    
    # Проверка Docker
    if command -v docker >/dev/null 2>&1; then
        log_success "Docker установлен: $(docker --version)"
    else
        log_error "Docker не установлен"
        ((errors++))
    fi
    
    # Проверка Docker Compose
    if docker compose version >/dev/null 2>&1; then
        log_success "Docker Compose установлен: $(docker compose version)"
    else
        log_error "Docker Compose не установлен"
        ((errors++))
    fi
    
    # Проверка Node.js
    if command -v node >/dev/null 2>&1; then
        log_success "Node.js установлен: $(node --version)"
    else
        log_error "Node.js не установлен"
        ((errors++))
    fi
    
    # Проверка pnpm
    if command -v pnpm >/dev/null 2>&1; then
        log_success "pnpm установлен: $(pnpm --version)"
    else
        log_error "pnpm не установлен"
        ((errors++))
    fi
    
    return $errors
}

check_project_structure() {
    log_header "Проверка структуры проекта"
    
    local errors=0
    local required_files=(
        "package.json"
        "docker-compose.yml"
        ".env.example"
        "apps/main/src/pages/LoginPage.tsx"
        "apps/server/src/routes/auth/hanko.ts"
        "prisma/schema.prisma"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$REPO_DIR/$file" ]; then
            log_success "Найден: $file"
        else
            log_error "Отсутствует: $file"
            ((errors++))
        fi
    done
    
    return $errors
}

check_environment() {
    log_header "Проверка переменных окружения"
    
    local errors=0
    
    if [ ! -f "$REPO_DIR/.env" ]; then
        log_error ".env файл не найден"
        return 1
    fi
    
    source "$REPO_DIR/.env"
    
    local required_vars=(
        "DATABASE_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "HANKO_JWT_SECRET"
        "VITE_HANKO_API_URL"
        "HANKO_WEBAUTHN_RELYING_PARTY_ID"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var:-}" ]; then
            log_success "$var настроен"
        else
            log_error "$var не настроен"
            ((errors++))
        fi
    done
    
    return $errors
}

check_docker_services() {
    log_header "Проверка Docker сервисов"
    
    cd "$REPO_DIR"
    local errors=0
    
    local services=("postgres" "hanko" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker compose ps "$service" | grep -q "Up"; then
            log_success "Сервис $service запущен"
        else
            log_error "Сервис $service не запущен"
            ((errors++))
        fi
    done
    
    return $errors
}

check_api_endpoints() {
    log_header "Проверка API эндпоинтов"
    
    local errors=0
    local endpoints=(
        "http://localhost:4000/health:Backend health"
        "http://localhost:8000/.well-known/hanko/config:Hanko config"
        "http://localhost:80/api/plans:Public plans"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        local endpoint="${endpoint_info%:*}"
        local description="${endpoint_info#*:}"
        
        if curl -s -f "$endpoint" >/dev/null 2>&1; then
            log_success "$description доступен"
        else
            log_error "$description недоступен ($endpoint)"
            ((errors++))
        fi
    done
    
    return $errors
}

check_database_connectivity() {
    log_header "Проверка подключения к базе данных"
    
    cd "$REPO_DIR"
    local errors=0
    
    # Проверка основной БД
    if docker compose exec -T postgres psql -U vpn -d vpn -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "Основная база данных доступна"
    else
        log_error "Основная база данных недоступна"
        ((errors++))
    fi
    
    # Проверка БД Hanko
    if docker compose exec -T postgres psql -U vpn -d hanko -c "SELECT 1;" >/dev/null 2>&1; then
        log_success "База данных Hanko доступна"
    else
        log_error "База данных Hanko недоступна"
        ((errors++))
    fi
    
    return $errors
}

check_ssl_certificates() {
    log_header "Проверка SSL сертификатов"
    
    local errors=0
    local cert_files=("$REPO_DIR/certs/fullchain.pem" "$REPO_DIR/certs/privkey.pem")
    
    for cert_file in "${cert_files[@]}"; do
        if [ -f "$cert_file" ] && [ -s "$cert_file" ]; then
            log_success "Сертификат найден: $(basename "$cert_file")"
        else
            log_warning "Сертификат отсутствует или пуст: $(basename "$cert_file")"
            ((errors++))
        fi
    done
    
    return $errors
}

generate_report() {
    log_header "Генерация отчета"
    
    local report_file="$REPO_DIR/health-check-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Отчет о состоянии VPN проекта ==="
        echo "Дата: $(date)"
        echo "Хост: $(hostname)"
        echo ""
        
        echo "=== Версии ПО ==="
        echo "Docker: $(docker --version 2>/dev/null || echo 'Не установлен')"
        echo "Docker Compose: $(docker compose version 2>/dev/null || echo 'Не установлен')"
        echo "Node.js: $(node --version 2>/dev/null || echo 'Не установлен')"
        echo "pnpm: $(pnpm --version 2>/dev/null || echo 'Не установлен')"
        echo ""
        
        echo "=== Статус сервисов ==="
        cd "$REPO_DIR"
        docker compose ps 2>/dev/null || echo "Docker Compose недоступен"
        echo ""
        
        echo "=== Использование ресурсов ==="
        docker stats --no-stream 2>/dev/null || echo "Docker stats недоступен"
        echo ""
        
        echo "=== Логи последних ошибок ==="
        docker compose logs --tail=10 2>/dev/null | grep -i error || echo "Ошибок не найдено"
        
    } > "$report_file"
    
    log_success "Отчет сохранен: $report_file"
}

main() {
    log_info "Начинаем полную проверку VPN проекта..."
    
    local total_errors=0
    
    check_system_requirements || ((total_errors+=$?))
    check_project_structure || ((total_errors+=$?))
    check_environment || ((total_errors+=$?))
    check_docker_services || ((total_errors+=$?))
    check_api_endpoints || ((total_errors+=$?))
    check_database_connectivity || ((total_errors+=$?))
    check_ssl_certificates || ((total_errors+=$?))
    
    generate_report
    
    echo
    if [ $total_errors -eq 0 ]; then
        log_success "Все проверки пройдены! Проект готов к работе."
    else
        log_error "Обнаружено $total_errors проблем. Проверьте отчет для деталей."
        exit 1
    fi
}

# Проверка существования проекта
if [ ! -d "$REPO_DIR" ]; then
    log_error "Проект не найден в $REPO_DIR"
    log_info "Запустите сначала: ./scripts/install-improved.sh"
    exit 1
fi

main