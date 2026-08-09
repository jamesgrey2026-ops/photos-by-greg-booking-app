# Debugging and Code Revision Log

## Issue 1 — Frontend could not exist as an end-to-end workflow

- **Observed problem:** The Milestone 2 repository contained REST endpoints but no React client.
- **Root cause:** The earlier milestone scope covered backend API and database development only.
- **Revision:** Added a Vite/React frontend with a booking form, database-backed dashboard, status updates, deletion, loading states, duplicate-submit prevention, and safe errors.
- **Retest:** The production build succeeds and the CRUD workflow passes the API integration suite.

## Issue 2 — CORS was unrestricted

- **Observed problem:** `CORS(app)` allowed every origin.
- **Root cause:** Development configuration had not been hardened for deployment.
- **Revision:** Added `FRONTEND_ORIGINS` configuration and restricted CORS to `/api/*`.
- **Retest:** The configured-origin automated test passes.

## Issue 3 — Database failures could leave the session unusable

- **Observed problem:** Write endpoints committed without exception handling or rollback.
- **Root cause:** The first API version implemented the happy path only.
- **Revision:** Wrapped create, update, and delete commits in controlled exception handling with `db.session.rollback()` and safe client messages.
- **Retest:** Normal CRUD and negative validation tests pass; internal details are not returned.

## Issue 4 — Production frontend/API routing

- **Observed problem:** A browser deployment needed both the compiled React application and Flask API at stable HTTPS URLs.
- **Root cause:** Local development normally uses separate ports.
- **Revision:** Added a multi-stage Docker build. Flask serves the compiled React assets, and React uses same-origin `/api` requests in production.
- **Retest:** Local frontend build passes. Complete the Cloud Run public-URL test after deployment.
