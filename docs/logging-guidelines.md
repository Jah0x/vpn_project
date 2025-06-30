# Ведение логов установки и сборки

Этот документ описывает как фиксировать результаты команд `npm install`, `npm run build` и других процедур сборки.

1. **Создайте каталог `logs/`** в корне проекта (добавлен в `.gitignore`). В нём будут храниться текстовые файлы логов.
2. **Запуск команд с перенаправлением вывода**
   ```bash
   npm install 2>&1 | tee logs/install_$(date +%F).log
   npm run build 2>&1 | tee logs/build_$(date +%F).log
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
