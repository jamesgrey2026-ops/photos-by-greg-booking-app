# 2. System Setup Instructions

[Back to documentation index](README.md)

These instructions start from a clean developer machine and separate frontend, backend, database, container, and cloud setup.

## 2.1 Prerequisites

| Tool/service | Supported baseline | Validation command |
|---|---|---|
| Windows 10/11, macOS, or Linux | Current supported release | OS settings or `uname -a` |
| Git | 2.40+ | `git --version` |
| Python | 3.12 recommended | `python --version` |
| Node.js | 22 recommended | `node --version` |
| npm | Bundled with Node | `npm --version` or Windows `npm.cmd --version` |
| PostgreSQL | 14+ for production-like local setup | `psql --version` |
| Docker Desktop/Engine | Current stable, optional | `docker --version` |
| Azure CLI | Current stable, deployment operators only | `az --version` |

On Windows PowerShell, execution policy may block `npm.ps1`. Use `npm.cmd` for the commands in this guide; changing the machine-wide execution policy is not required.

## 2.2 Clone and enter the repository

```powershell
git clone https://github.com/jamesgrey2026-ops/photos-by-greg-booking-app.git
cd photos-by-greg-booking-app
git switch main
git pull origin main
```

Confirm:

```powershell
git status -sb
```

Expected: `main` tracks `origin/main` and the working tree is clean.

## 2.3 Configuration and secrets

Copy `.env.example` to `.env` locally. Never commit `.env`.

| Variable | Local example | Purpose |
|---|---|---|
| `DATABASE_URL` | `sqlite:///studio_management.db` or a PostgreSQL SQLAlchemy URL | Database connection |
| `FRONTEND_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | CORS allowlist for `/api/*` |
| `SEED_DEMO_DATA` | `true` for rehearsals; `false` for normal production | Loads idempotent capstone demo records |
| `VITE_API_BASE_URL` | `http://127.0.0.1:5000/api` | Frontend API root in Vite development |

Example PostgreSQL URL:

```text
postgresql+psycopg://APP_USER:APP_PASSWORD@DB_HOST:5432/studio_management?sslmode=require
```

Store real production values in Azure Container App environment variables/secrets and GitHub repository secrets. Do not place credentials in Markdown, screenshots, shell history, source, or pull-request descriptions.

## 2.4 Backend setup

From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

macOS/Linux activation:

```bash
source .venv/bin/activate
```

Start Flask:

```powershell
$env:SEED_DEMO_DATA="true"
python app.py
```

Expected local URL: `http://127.0.0.1:5000`.

Validate in a second terminal:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/health
```

Expected: a response with status `healthy`.

## 2.5 Frontend setup

Open another terminal at the repository root:

```powershell
cd frontend
npm.cmd install
```

Create `frontend/.env.local` with:

```text
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

Start Vite:

```powershell
npm.cmd run dev
```

Open the exact URL printed by Vite, normally `http://localhost:5173`. If that port is occupied, Vite may select `5174`; update `FRONTEND_ORIGINS` to match and restart Flask.

Validation:

1. The left navigation shows Booking, Portfolio, Yearbook, Stay Connected, Merchandise, and Admin CRM.
2. Browser console has no uncaught exception.
3. Network requests to `/api` return 2xx responses.
4. Products and approved photos appear under Merchandise when demo seeding is enabled.

## 2.6 Database setup

### Option A — SQLite for the fastest local start

Remove `DATABASE_URL` or set it to the repository's SQLite development value. Flask-SQLAlchemy creates the required tables at startup through `db.create_all()`.

SQLite is suitable for a single-developer demonstration. It is not the production database.

### Option B — local PostgreSQL

Create a database and a least-privilege application user:

```sql
CREATE USER photos_app WITH PASSWORD 'replace-with-a-local-only-password';
CREATE DATABASE studio_management OWNER photos_app;
```

Set `DATABASE_URL` to the local PostgreSQL SQLAlchemy URL, then start `python app.py`. The application creates its SQLAlchemy-managed tables on startup.

Important: `schema.sql` documents the original booking schema and is useful for reference, but the enhanced platform contains additional SQLAlchemy models. Use the running application's model metadata for the complete current schema.

Validate:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/products
Invoke-RestMethod http://127.0.0.1:5000/api/admin/dashboard
```

Both should return JSON without a database exception.

## 2.7 Build and automated tests

Backend tests from the repository root:

```powershell
python -m unittest discover -s tests -v
```

Expected current result: **15 tests passed**.

Frontend production build:

```powershell
cd frontend
npm.cmd run build
cd ..
```

Expected: Vite completes and writes `frontend/dist`.

## 2.8 Local production container

Build from the repository root:

```powershell
docker build -t photos-by-greg:local .
```

Run with a local environment file:

```powershell
docker run --rm -p 8080:8080 --env-file .env photos-by-greg:local
```

Validate:

```powershell
Invoke-RestMethod http://localhost:8080/health
```

The multi-stage Dockerfile builds the React bundle with Node 22 and runs Flask/Gunicorn on Python 3.12. The same container serves both the frontend and `/api`, eliminating a production cross-origin hop.

## 2.9 Azure production setup

Required resources:

1. Resource group
2. Azure Container Registry
3. Azure Container Apps Environment
4. Azure Container App with external ingress on port `8080`
5. Azure Database for PostgreSQL Flexible Server
6. Log Analytics workspace
7. GitHub OIDC/federated deployment identity

Current resource names are listed in [Production Support](01-production-support-and-testing.md#12-production-inventory).

Set the Container App environment variables:

- `DATABASE_URL` — reference a secret, not a literal displayed in documentation.
- `FRONTEND_ORIGINS` — production origin if cross-origin clients are introduced.
- `SEED_DEMO_DATA=true` only for the capstone demonstration. Change to `false` after the expo when demonstration records are no longer needed.

The GitHub workflow expects Azure identity/tenant/subscription values as repository secrets and uses OIDC. The exact secret values must remain hidden. The deployment identity requires only the scopes needed to push to ACR and update the Container App.

## 2.10 Deployment

Normal release path:

1. Create a feature branch.
2. Run backend tests and the React production build.
3. Push the branch and open a pull request.
4. Review the diff and merge to `main`.
5. GitHub Actions authenticates to Azure through OIDC.
6. The workflow builds a commit-tagged image, pushes it to ACR, and deploys a new Container App revision.
7. Run the post-deployment smoke checklist.

See [Deployment Pipeline and Rollback](06-deployment-pipeline.md) for release operations.

## 2.11 Setup completion checklist

- [ ] `git status -sb` is clean.
- [ ] Python dependencies install without error.
- [ ] `npm.cmd install` completes without vulnerabilities requiring immediate action.
- [ ] `/health` returns healthy.
- [ ] 15 Python tests pass.
- [ ] Vite production build passes.
- [ ] Booking, Portfolio, Merchandise, and Admin CRM render.
- [ ] A test merchandise order appears in Admin CRM.
- [ ] No secret exists in Git history or console screenshots.

