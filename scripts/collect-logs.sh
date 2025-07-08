#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="logs"
TIMESTAMP=$(date +%F_%H-%M-%S)
LOG_FILE="${LOG_DIR}/containers_${TIMESTAMP}.log"
mkdir -p "$LOG_DIR"

echo "Сохраняем логи всех контейнеров в $LOG_FILE"

if command -v docker-compose >/dev/null 2>&1; then
  compose_cmd="docker-compose"
else
  compose_cmd="docker compose"
fi

$compose_cmd ps --services | while read -r service; do
  echo "=== $service ===" | tee -a "$LOG_FILE"
  $compose_cmd logs "$service" 2>&1 | tee -a "$LOG_FILE"
  echo -e "\n" >> "$LOG_FILE"
done

echo "\nЛоги сохранены в $LOG_FILE"
