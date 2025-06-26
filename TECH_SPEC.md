# Технические спецификации VPN Dash

Проект состоит из фронтенда на React (Vite) и бекенда на Express. Все сервисы упакованы в Docker и могут подниматься локально через `docker-compose`. Для продакшена используется Kubernetes, для staging – Fly.io.

## CI/CD & Monitoring

Пайплайн GitHub Actions выполняет lint и тесты, затем собирает и публикует Docker‑образы в GHCR. При пуше в ветку `main` приложения деплоятся на Fly.io. Любая ветка `release/*` запускает обновление образов в Kubernetes.

Мониторинг реализован через Prometheus и Grafana. Бекенд предоставляет endpoint `/metrics` с метриками `http_requests_total` и `process_cpu_seconds_total`. Helm‑chart `prometheus-stack` конфигурируется значениями из каталога `k8s/monitoring/`.
