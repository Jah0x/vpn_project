# Управление тарифами

Модель `Plan` описывает тарифный план подписки.

| Поле     | Тип      | Описание                  |
|----------|--------- |---------------------------|
| id       | string   | идентификатор (cuid)      |
| code     | string   | уникальный код плана      |
| name     | string   | отображаемое название     |
| priceId  | string   | ID цены в Stripe          |
| maxVpns  | int      | сколько VPN разрешено     |
| isActive | boolean  | активен ли план           |
| createdAt| DateTime | время создания            |
| updatedAt| DateTime | время обновления          |

Примеры запросов:

```bash
# список
curl -H "Authorization: Bearer <token>" http://localhost:4000/api/admin/plans

# создание
curl -X POST -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"code":"pro","name":"Pro","priceId":"price_1","maxVpns":5}' \
     http://localhost:4000/api/admin/plans

# обновление
curl -X PUT -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Professional"}' \
     http://localhost:4000/api/admin/plans/<id>

# архивирование
curl -X DELETE -H "Authorization: Bearer <token>" \
     http://localhost:4000/api/admin/plans/<id>
```
