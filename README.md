# Photos by Greg — Full-Stack Studio Management

> The `feature/enhanced-platform-mvp` branch adds the Yearbook SaaS, portfolio/gallery, Stay Connected, merchandise and administration CRM foundation. See [Enhanced Platform MVP](docs/enhanced-platform.md).

Capstone Milestones 3 and 4 for Davis Digital Services. Customers can request photography sessions through a React interface, while studio staff can retrieve bookings, update their status, and delete them. Flask REST APIs validate every operation and SQLAlchemy persists clients and bookings in a normalized relational database.

## Architecture

```text
React UI → Flask REST API → SQLAlchemy → PostgreSQL
```

- **Frontend:** React 19 and Vite
- **Backend:** Flask, Flask-RESTful, Flask-CORS
- **Data:** SQLAlchemy with PostgreSQL; SQLite fallback for local demonstration
- **Production:** Docker, Gunicorn, Google Cloud Run–ready

React never connects directly to the database. In production, Flask serves the compiled React assets and `/api` endpoints from one HTTPS origin.

## Features

- Responsive customer booking form
- Required-field, email, and future-date validation
- Persistent booking dashboard
- Create, retrieve, update, and delete operations
- Loading, success, empty, and controlled failure states
- Duplicate-submit prevention
- Environment-restricted CORS
- Transaction rollback and safe database errors
- Automated API integration tests
- Containerized cloud deployment

## Repository structure

```text
frontend/                 React application and API client
resources/                Flask booking and client endpoints
tests/                    Automated API integration tests
docs/                     Test evidence, debugging log, deployment, dry-run script
app.py                    Flask application factory and route registration
models.py                 SQLAlchemy Client and Booking models
schema.sql                PostgreSQL schema and sample data
API_List.md               REST API contract
Dockerfile                Production multi-stage container
requirements.txt          Python dependencies
```

## Local setup

Prerequisites: Python 3.12+, Node.js 22+, and optionally PostgreSQL.

### Backend

```bash
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Install and start:

```bash
pip install -r requirements.txt
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
python app.py
```

The API runs at `http://localhost:5000`. If `DATABASE_URL` is not set, the application uses a local SQLite database and creates its tables automatically.

### Frontend development server

In another terminal:

```bash
cd frontend
npm install
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

| Variable | Purpose | Local example |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy database connection | `postgresql+psycopg://postgres:password@localhost:5432/studio_management` |
| `FRONTEND_ORIGINS` | Comma-separated CORS allowlist | `http://localhost:5173` |
| `VITE_API_BASE_URL` | Frontend API location during development | `http://localhost:5000/api` |

Real credentials belong only in local environment files or the cloud secret manager. `.env` files are excluded from Git.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET`, `POST` | `/api/bookings` | List or create bookings |
| `GET`, `PUT`, `DELETE` | `/api/bookings/<id>` | Retrieve, update, or delete one booking |
| `GET`, `POST` | `/api/clients` | List or create clients |
| `GET`, `PUT`, `DELETE` | `/api/clients/<id>` | Retrieve, update, or delete one client |
| `GET` | `/health` | Deployment health check |

See `API_List.md` for request and response examples.

## Testing

Run the automated API suite from the repository root:

```bash
python -m unittest discover -s tests -v
```

Build the production frontend:

```bash
cd frontend
npm run build
```

The evidence package is in:

- `docs/test-results.md`
- `docs/troubleshooting.md`
- `docs/cloud-run-deployment.md`
- `docs/dry-run-script.md`

The current automated result is **6 tests passed**. Cloud-result cells must be completed only after testing the public deployment.

## Production container

```bash
docker build -t photos-by-greg .
docker run -p 8080:8080 --env-file .env photos-by-greg
```

Open `http://localhost:8080` and verify `http://localhost:8080/health`.

## Known limitations and next steps

- Administrative actions are not yet protected by authentication or roles.
- Email/calendar confirmations are future enhancements.
- Cloud deployment requires a managed PostgreSQL database and platform secrets.
- Google OAuth was optional for Module 7 and is not claimed as implemented.

## Presentation

Use `docs/dry-run-script.md` for the 7–8 minute Milestone 4 dry run. Demonstrate the deployed React form, database persistence after refresh, status update, invalid input, deletion, Network panel, and one debugging example.
