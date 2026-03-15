# HomeGuard – Production Deployment Checklist

Use this checklist when deploying HomeGuard to a production environment.

## Backend

1. **Environment variables** (copy from `backend/.env.example` to `backend/.env`; never commit `.env`):
   - **ENV** = `production`
   - **SECRET_KEY** = long random string (e.g. `openssl rand -hex 32`)
   - **DATABASE_URL** = production database URL (e.g. PostgreSQL)
   - **CORS_ORIGINS** = comma-separated allowed frontend origins (e.g. `https://app.yourdomain.com`)
   - **LOG_LEVEL** = `WARNING` or `ERROR` (optional)
   - **ACCESS_TOKEN_EXPIRE_MINUTES**, **ALGORITHM** as needed

2. **Database**:
   - Run migrations: from `backend/`, `alembic upgrade head` (or `python migrate.py upgrade head` if using the helper script).
   - Ensure the database is created and reachable.

3. **Run the API** (no reload in production):
   ```bash
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8001
   ```
   Or use a process manager (systemd, supervisord) or container (Docker).

4. **Health check**: Configure your load balancer or orchestrator to hit `GET /health`; the API returns `{"status": "ok"}`.

## Frontend

1. **Environment**:
   - Create `frontend/.env` from `frontend/.env.example`.
   - Set **VITE_API_URL** to your production API URL (e.g. `https://api.yourdomain.com`). Do not leave the default `http://localhost:8001` for production builds.

2. **Build**:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

3. **Serve** the contents of `frontend/dist/` with a static file server or reverse proxy (e.g. nginx, or the same host as the API). Ensure the SPA fallback is configured so all routes serve `index.html`.

## Summary

| Item | Action |
|------|--------|
| Backend ENV | Set to `production` |
| Backend SECRET_KEY | Set to a strong random value |
| Backend DATABASE_URL | Set to production DB |
| Backend CORS_ORIGINS | Set to frontend origin(s) |
| Backend migrations | Run `alembic upgrade head` |
| Backend process | Run uvicorn without `--reload` |
| Frontend VITE_API_URL | Set to production API URL |
| Frontend build | Run `npm run build` and serve `dist/` |

See [WORKFLOW.md](WORKFLOW.md) for application workflow and [backend/HomeGuard_Database_Design.md](backend/HomeGuard_Database_Design.md) for the data model.
