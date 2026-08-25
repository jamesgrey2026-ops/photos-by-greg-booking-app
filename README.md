# Photos by Greg — Full-Stack Photography Platform

[![Production](https://img.shields.io/badge/production-Azure%20Container%20Apps-0078D4)](https://photos-by-greg-app.bluewater-75d91b54.westus2.azurecontainerapps.io)

Photos by Greg connects customer booking, consent-aware galleries, yearbook production, customer profiles, personalized merchandise, an AI Photo Assistant, and administrative CRM workflows in one React/Flask application.

- **Live application:** [photos-by-greg-app.bluewater-75d91b54.westus2.azurecontainerapps.io](https://photos-by-greg-app.bluewater-75d91b54.westus2.azurecontainerapps.io)
- **Health check:** [production `/health`](https://photos-by-greg-app.bluewater-75d91b54.westus2.azurecontainerapps.io/health)
- **Complete documentation:** [`/docs`](docs/README.md)

## Architecture

```mermaid
flowchart LR
    B["React browser UI"] -->|HTTPS /api| A["Flask + Gunicorn<br/>Azure Container App"]
    A -->|SQLAlchemy| D["Azure PostgreSQL"]
    G["GitHub Actions"] -->|OIDC + Docker image| A
```

- **Frontend:** React 19 and Vite
- **Backend:** Flask, Flask-RESTful, Flask-CORS, Flask-SQLAlchemy
- **Database:** Azure Database for PostgreSQL; SQLite fallback for local development
- **Runtime:** Multi-stage Docker image and Gunicorn on port 8080
- **Hosting:** Azure Container Apps, Azure Container Registry, Log Analytics/Azure Monitor
- **Delivery:** GitHub Actions with Azure OIDC and revision-based deployment

## Key workflows

- Responsive session booking for individuals, families, schools, organizations, and yearbooks
- Portfolio galleries with publication consent
- Yearbook schools, projects, students, pages, progress, and approvals
- Customer social links and life events
- Merchandise product selection, approved photos, live preview, cart, checkout confirmation, and order status
- Consent-gated AI caption, alt-text, tag, and product suggestions with mandatory human approval
- Admin CRM for bookings, customers, projects, galleries, and orders

## Repository structure

```text
frontend/                 React application, API client, and production assets
resources/                Flask REST resources
tests/                    API/database integration tests
docs/                     Production support, setup, troubleshooting, usage, and architecture
app.py                    Flask application factory and route registration
models.py                 SQLAlchemy domain models
seed_data.py              Idempotent capstone demonstration data
schema.sql                Original PostgreSQL schema reference
API_List.md               REST API contract
Dockerfile                Multi-stage production container
requirements.txt          Python dependencies
```

## Local setup

Prerequisites: Python 3.12+, Node.js 22+, Git, and optionally PostgreSQL/Docker.

### Backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:SEED_DEMO_DATA="true"
python app.py
```

The API runs at `http://127.0.0.1:5000`. Without `DATABASE_URL`, the application uses local SQLite.

### Frontend

In another terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the exact URL printed by Vite, normally `http://localhost:5173`.

See [System Setup Instructions](docs/02-system-setup.md) for PostgreSQL, environment variables, Docker, Azure, secrets, and validation.

## Environment variables

| Variable | Purpose | Local example |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy connection | `postgresql+psycopg://user:password@localhost:5432/studio_management` |
| `FRONTEND_ORIGINS` | API CORS allowlist | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Vite development API root | `http://127.0.0.1:5000/api` |
| `SEED_DEMO_DATA` | Load idempotent capstone records | `true` |

Never commit real credentials. Local `.env` files are excluded from Git; production values belong in managed cloud/repository secrets.

## Testing

```powershell
python -m unittest discover -s tests -v
cd frontend
npm.cmd run build
```

Current verified result: **15 Python tests passed**, the React production build passed, and read-only production smoke checks passed on August 25, 2026. See [Production Support and Testing Scenarios](docs/01-production-support-and-testing.md).

## Production boundaries

- Checkout creates demonstration orders; it does not collect payment or contact a print vendor/carrier.
- Authentication and role-based authorization are not yet implemented.
- Social links are user-supplied URLs, not imported social feeds.
- AI suggestions are consent-gated drafts requiring human approval.
- Demo media ships in the container; durable object storage is future work.

See [Security Considerations](docs/07-security-considerations.md) for the pre-launch requirements.

