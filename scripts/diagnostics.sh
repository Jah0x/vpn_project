#!/usr/bin/env bash
set -euo pipefail

LOG_DIR="logs"
TIMESTAMP=$(date +%F_%H-%M-%S)
mkdir -p "$LOG_DIR"

run() {
  local name="$1"; shift
  local log_file="${LOG_DIR}/${name}_${TIMESTAMP}.log"
  echo "=== $name ===" | tee "$log_file"
  "$@" 2>&1 | tee -a "$log_file"
}

run lint npm run lint
run test npm test
run e2e npm run test:e2e
run build npm run build

echo "\nЛоги сохранены в $LOG_DIR"
