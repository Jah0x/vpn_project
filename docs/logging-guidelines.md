# Ведение логов установки и сборки

Этот документ описывает как фиксировать результаты команд `pnpm install`, `pnpm build` и других процедур сборки.

1. **Создайте каталог `logs/`** в корне проекта (добавлен в `.gitignore`). В нём будут храниться текстовые файлы логов.
2. **Запуск команд с перенаправлением вывода**
   ```bash
   pnpm install 2>&1 | tee logs/install_$(date +%F).log
   pnpm build 2>&1 | tee logs/build_$(date +%F).log
   ```
   Так сохраняются как стандартный вывод, так и сообщения об ошибках.
3. **Анализ логов**
   - после выполнения команд просматривайте последние строки:
     ```bash
     tail -n 20 logs/install_$(date +%F).log
     ```
   - фиксируйте в `docs/development-log.md` информацию об успешности/ошибках.
4. **Логи сборки Docker**
   - для `docker compose build` также сохраняйте вывод:
     ```bash
     docker compose build 2>&1 | tee logs/docker_build_$(date +%F).log
     ```
   - при возникновении ошибок проверяйте путь к Dockerfile и контекст.
5. **Регулярная очистка**
   - старые лог‑файлы можно архивировать или удалять во избежание засорения репозитория.

6. **Логи Nginx**
   - вывод контейнера `nginx` сохраняем командой
     ```bash
     docker compose logs nginx 2>&1 | tee logs/nginx_$(date +%F).log
     ```

Данные рекомендации помогут отслеживать проблемы и сохранять историю для дальнейшего анализа.
- Перед компиляцией сервера запускайте `prisma generate` и сохраняйте вывод в лог `logs/prisma_generate_<date>.log`.
7. **Миграции в контейнере**
   - При запуске backend выполняется `npx prisma migrate deploy`.
   - Вывод команды фиксируйте:
     ```bash
     docker compose logs backend 2>&1 | tee logs/backend_migrate_$(date +%F).log
     ```
8. **Docker Compose проверка статики**
  - После сборки контейнеров убедитесь в правильном MIME-типе JS:
    ```bash
    curl -sI http://localhost/static/js/main.js | grep -q "Content-Type: application/javascript"
    ```
  - Сообщения о `libssl` и `host not found` в логах считаем ошибкой.
  - При ошибке `host not found in upstream` сверяйте имя сервиса в `nginx.conf` с
    названием контейнера в `docker-compose` или Kubernetes.
  - В логах backend ищем строку `Server listening on` для подтверждения успешного запуска.
  - Ошибка `P1001` в логах означает недоступность PostgreSQL и требует проверки сети и переменных окружения.
 - В логах `nginx` наличие уровня `emerg` (`grep -i "emerg"`) считается критичной ошибкой.
- Для детального анализа запросов сохраните логи nginx в каталоге `logs/nginx`.
  Контейнер примонтирует этот каталог как `/var/log/nginx`, поэтому access и error
  логи можно просматривать обычными средствами:
  ```bash
  tail -f logs/nginx/access.log
  tail -f logs/nginx/error.log
  ```
- Если при сборке появляется сообщение вида "Rollup failed to resolve import"
  проверяйте наличие пакета в package.json и устанавливайте его:
  ```bash
  pnpm add <package>
  ```

9. **Скрипт диагностики**
   - Выполните `./scripts/diagnostics.sh` для запуска линтера, тестов и сборки с сохранением логов.
   - Логи появятся в каталоге `logs/` с суффиксом даты, например `test_2025-07-08_12-00-00.log`.

