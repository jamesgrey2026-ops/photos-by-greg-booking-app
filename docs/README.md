# Photos by Greg — Production Documentation

| Document control | Value |
|---|---|
| System | Photos by Greg Enhanced Platform |
| Owner | James O. Grey III |
| Version | 1.0 |
| Last verified | August 25, 2026 |
| Environment | Azure production and local development |

Photos by Greg is a full-stack photography operations platform that connects booking, portfolio galleries, yearbook production, customer profiles, consent-aware merchandise, and an administrative CRM in one workflow.

- **Production application:** [Open Photos by Greg](https://photos-by-greg-app.bluewater-75d91b54.westus2.azurecontainerapps.io)
- **Health check:** [View service health](https://photos-by-greg-app.bluewater-75d91b54.westus2.azurecontainerapps.io/health)
- **Source repository:** [jamesgrey2026-ops/photos-by-greg-booking-app](https://github.com/jamesgrey2026-ops/photos-by-greg-booking-app)
- **Support:** [Open a GitHub issue](https://github.com/jamesgrey2026-ops/photos-by-greg-booking-app/issues)

## Table of contents

1. [Production Support and Testing Scenarios](01-production-support-and-testing.md)
2. [System Setup Instructions](02-system-setup.md)
3. [Issue Diagnosis, Research, Resolution, and Sharing](03-issue-diagnosis-and-resolution.md)
4. [System Usage Guide](04-system-usage-guide.md)
5. [Architecture](05-architecture.md)
6. [Deployment Pipeline and Rollback](06-deployment-pipeline.md)
7. [Security Considerations](07-security-considerations.md)

Supplemental project material:

- [Enhanced platform feature notes](enhanced-platform.md)
- [Presentation dry-run script](dry-run-script.md)

## Verification summary

| Evidence | Result | Date |
|---|---:|---|
| Python automated tests | 15 passed | 2026-08-25 |
| React production build | Passed | 2026-08-25 |
| Production `/` | HTTP 200 | 2026-08-25 |
| Production `/health` | HTTP 200, `healthy` | 2026-08-25 |
| Production products, galleries, and dashboard APIs | HTTP 200 | 2026-08-25 |

The test suite is integration-focused: it exercises the Flask API, validation, database persistence, consent gates, ordering, status transitions, and dashboard aggregation. The repository does not yet contain a separate browser-automation suite or isolated React unit-test suite; the manual end-to-end scenarios in the support document cover the primary user journeys.

## Current production boundaries

- The current experience is a capstone demonstration, not a public commerce system.
- Checkout records an order but does not collect payment or contact a carrier.
- Authentication and role-based access control are planned but not implemented.
- Social profiles are user-supplied HTTPS links; the platform does not scrape social networks.
- The AI Photo Assistant creates consent-gated suggestions and requires human approval. Its current behavior should not be represented as an autonomous external AI service.
- Demo photographs are stored with the application image. Production-scale media should move to durable object storage.

