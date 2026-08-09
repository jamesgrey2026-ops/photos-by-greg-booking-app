# Milestone 4 Dry-Run Script — 7–8 Minutes

## 0:00–0:50 — Business challenge and value

Photos by Greg needs a consistent way to capture client requests and manage photography sessions without relying on disconnected messages or manual tracking. Our full-stack studio management application creates one reliable workflow: customers request a session, staff see the request immediately, and every status change persists in the database. This reduces missed details, makes follow-up easier, and establishes a scalable digital foundation for Davis Digital Services.

## 0:50–1:35 — Architecture

The React interface is the presentation layer. It sends JSON requests to the Flask REST API. Flask validates the request and uses SQLAlchemy to read or write the relational database. The `clients` and `bookings` tables are normalized through a foreign key. The application is packaged in Docker for Google Cloud Run, uses environment-managed configuration, and exposes a health endpoint. React never connects directly to the database.

## 1:35–5:20 — Live demonstration

1. Open the deployed application and identify the public HTTPS address.
2. Submit a booking with a name, email, session type, future date, and notes.
3. Point out the confirmation and the new dashboard card.
4. Refresh the page to prove persistence.
5. Show the successful POST and GET requests in the browser Network panel.
6. Change the booking status from pending to confirmed and show the updated database value.
7. Submit an incomplete form or past date and show that validation prevents an invalid record.
8. Delete the demonstration booking and confirm it disappears.

## 5:20–6:35 — Testing, debugging, and error handling

I tested create, read, update, and delete operations, missing fields, past dates, malformed JSON, missing records, CORS, health checks, persistence, and API availability. One important issue was that the original backend used unrestricted CORS. I replaced it with an environment-driven allowlist for API routes. I also added transaction rollback and safe error responses so a database failure does not expose internal information or leave the session in a failed state. The automated integration suite passes locally, and I repeated the main workflow against the deployed application.

## 6:35–7:20 — Code quality and deployment

The repository separates React components, the API service, Flask resources, SQLAlchemy models, tests, and documentation. Secrets are excluded and represented only by `.env.example` files. A multi-stage Dockerfile builds the React client and runs Flask with Gunicorn. The deployed health endpoint, logs, and HTTPS URL provide operational evidence.

## 7:20–7:40 — Close

This capstone converts a manual booking process into a working, testable, cloud-ready platform. The next logical enhancements are authenticated administration, calendar integration, automated confirmations, and reporting.

Keep the code walkthrough optional. If the live demo runs slowly, skip deletion and show the test-results document instead.
