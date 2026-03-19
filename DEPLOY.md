# Dokploy — Deploy Guide

Each service is deployed as a separate application in Dokploy.
Repository: monorepo, one GitHub repo for all services.

---

## Backend (FastAPI)

| Field | Value |
|-------|-------|
| **Dockerfile Path** | `backend/Dockerfile` |
| **Docker Context Path** | `backend` |
| **Port** | `8000` |

**Volume (обязательно):**
```
/app/uploads  →  /your-host-path/backend-uploads
```

**Environment variables:**
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
SECRET_KEY=...
RABBITMQ_URL=amqp://user:pass@host:5672/
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

---

## Frontend (Next.js)

| Field | Value |
|-------|-------|
| **Dockerfile Path** | `frontend/Dockerfile` |
| **Docker Context Path** | `frontend` |
| **Port** | `3000` |

**Environment variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
UPLOADS_ORIGIN=https://your-backend-domain.com
```

---

## Telegram Bot

| Field | Value |
|-------|-------|
| **Dockerfile Path** | `telegram-bot/Dockerfile` |
| **Docker Context Path** | `telegram-bot` |
| **Port** | — (не нужен) |

**Environment variables:**
```
BOT_TOKEN=...
API_URL=https://your-backend-domain.com/api
```

---

## Email Service

| Field | Value |
|-------|-------|
| **Dockerfile Path** | `email-service/Dockerfile` |
| **Docker Context Path** | `email-service` |
| **Port** | — (не нужен) |

**Environment variables:**
```
RABBITMQ_URL=amqp://user:pass@host:5672/
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

---

## Порядок деплоя

1. **Backend** — первым (создаёт таблицы через `alembic upgrade head`)
2. **Email Service** — после backend
3. **Telegram Bot** — после backend
4. **Frontend** — последним (нужен `NEXT_PUBLIC_API_URL` от backend)
