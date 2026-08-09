# Google Cloud Run Deployment

The repository uses one container: Flask serves the compiled React application and the `/api` routes. A managed PostgreSQL instance should be used for persistent cloud data.

## Required configuration

- `DATABASE_URL`: PostgreSQL SQLAlchemy URL, stored as a secret
- `FRONTEND_ORIGINS`: the final Cloud Run HTTPS URL
- Cloud SQL connection or another reachable managed PostgreSQL service

## Deployment outline

1. Create a Google Cloud project and enable Cloud Run, Cloud Build, Artifact Registry, Secret Manager, and Cloud SQL APIs.
2. Create a PostgreSQL Cloud SQL instance and database.
3. Run `schema.sql` against the cloud database, or allow SQLAlchemy to create empty tables for the first demonstration.
4. Store `DATABASE_URL` in Secret Manager; never commit it.
5. Build and deploy from the repository root using the included `Dockerfile`.
6. Allow public access for the capstone demonstration.
7. Set `FRONTEND_ORIGINS` to the exact deployed HTTPS origin.
8. Verify `/health`, create a booking, refresh, update, delete, and review Cloud Run logs.

Example commands must be adapted to the actual project and region:

```bash
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/photos-by-greg
gcloud run deploy photos-by-greg \
  --image REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/photos-by-greg \
  --region REGION \
  --allow-unauthenticated \
  --set-env-vars FRONTEND_ORIGINS=https://YOUR_CLOUD_RUN_URL \
  --set-secrets DATABASE_URL=DATABASE_URL:latest
```

Do not mark the deployment criterion complete until the public application has passed the cloud-result tests in `docs/test-results.md`.
