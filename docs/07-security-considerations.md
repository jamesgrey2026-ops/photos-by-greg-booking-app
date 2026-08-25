# 7. Security Considerations

[Back to documentation index](README.md)

## 7.1 Security posture summary

Photos by Greg demonstrates several important controls, but it is not ready for unrestricted public/customer data. The largest open control is authentication and authorization.

| Area | Current control | Remaining work |
|---|---|---|
| Transport | Azure production endpoint uses HTTPS | Add custom-domain certificate policy and HSTS review |
| Deployment identity | GitHub Actions uses Azure OIDC | Reduce RBAC to least privilege; protect production environment |
| Secrets | `.env` excluded; cloud variables/secrets used | Move database secret to Key Vault reference and rotate regularly |
| Database | SQLAlchemy parameterization and transaction rollback | Add migrations, backup-restore drill, private networking, credential rotation |
| CORS | Configured allowlist scoped to `/api/*` | Confirm exact production origins after custom-domain integration |
| Input validation | Booking dates, JSON, order status, photo consent are validated | Add centralized schemas, size limits, rate limiting, and abuse protection |
| Media consent | Separate portfolio/merchandise/analysis gates | Add consent version, timestamp, revocation history, and audit user |
| AI governance | Consent required; suggestions require human approval | Add provider/data-retention review before external model integration |
| Logging | Container/application logs available | Redaction policy, alerts, retention policy, structured correlation IDs |

## 7.2 Data classification

| Classification | Examples | Handling |
|---|---|---|
| Public | Published portfolio covers, business description | May be served publicly after approval |
| Internal | Demo metrics, non-sensitive product configuration | Restrict to staff when authentication exists |
| Personal | Name, email, phone, social link, life event | Collect minimum; restrict access; support correction/deletion |
| Sensitive media | Portraits, school/yearbook images, consent records | Require explicit purpose-specific consent and access controls |
| Secret | Database URL, cloud credentials, tokens | Never log or commit; store in managed secret service |

## 7.3 Consent model

The application separates purposes rather than assuming one blanket image permission:

- portfolio publication;
- merchandise use;
- AI/analysis use.

An image lacking the required consent must not appear as selectable for that workflow. AI suggestions remain drafts until a human records approval. Revocation and deletion workflows should be added before real customer use.

## 7.4 Authentication and authorization gap

The current capstone has no login or role separation. Therefore:

- do not store real customer data beyond the approved demonstration;
- do not expose Admin CRM as a public business system;
- do not add payment credentials;
- treat the production URL as a demo environment.

Before launch, add authenticated roles such as Customer, School Coordinator, Photographer/Editor, Order Fulfillment, and Administrator. Azure Container Apps supports built-in authentication options, but application-level authorization must still protect every API operation.

## 7.5 API and application controls

Required before public launch:

1. Enforce authentication on write endpoints and Admin CRM.
2. Authorize access by role and record ownership.
3. Use a schema validator for all JSON bodies and reject unknown/oversized input.
4. Add CSRF protection if cookie-based sessions are used.
5. Add rate limits to booking, profile, AI, and order endpoints.
6. Add secure headers: CSP, HSTS after HTTPS validation, `X-Content-Type-Options`, and an appropriate referrer policy.
7. Escape/sanitize any future user-generated rich text.
8. Use opaque, nonsequential public identifiers where enumeration would expose customer records.
9. Add audit records for consent, AI approval, order status, and administrative changes.

## 7.6 Cloud and pipeline controls

- Constrain GitHub OIDC federation to the exact repository, branch/environment, and intended audience.
- Grant the deployment identity only ACR push and Container App update rights at the narrowest scope.
- Require pull requests and status checks for `main`.
- Pin third-party GitHub Actions to reviewed versions/commit SHAs.
- Scan Python/npm dependencies and the final container image.
- Keep PostgreSQL off the public network where practical; use private connectivity and TLS.
- Configure backups, retention, and a tested restore procedure.
- Review Log Analytics access and retention; prevent personal data and secrets from entering logs.
- Migrate legacy Container Apps log tables/diagnostic routing in line with [Microsoft's current logging guidance](https://learn.microsoft.com/en-us/azure/container-apps/log-options).

## 7.7 Payment, printing, and delivery boundary

Current checkout is explicitly a demonstration and collects no payment. Any future commerce integration must:

- use a PCI-compliant hosted payment provider rather than storing card data;
- verify webhook signatures and make order creation idempotent;
- separate payment status from printing/delivery status;
- minimize addresses and retention;
- authenticate print-vendor and carrier APIs;
- expose tracking details only to the correct customer/staff role.

The live presentation's ready-made shirt/mug and classmate “driver” are a staged demonstration, not proof of real carrier integration.

## 7.8 Incident response for data or secret exposure

1. Stop the affected workflow/revision or remove public traffic if exposure is active.
2. Rotate the affected credential immediately; deleting it from the newest commit is not sufficient.
3. Review Git history, workflow logs, container logs, and access logs for exposure/use.
4. Remove public artifacts/screenshots containing the value.
5. Notify the project owner and applicable school/business stakeholders.
6. Document scope, timeline, containment, eradication, recovery, and prevention without republishing the secret.
7. Verify new credentials through smoke tests and monitor for recurrence.

## 7.9 Pre-launch security checklist

- [ ] Authentication enabled.
- [ ] Role/record-level authorization tested.
- [ ] Admin CRM protected.
- [ ] Consent creation/revocation/audit implemented.
- [ ] Secrets moved to managed storage and rotated.
- [ ] Database private/TLS configuration verified.
- [ ] Payment/shipping integrations reviewed separately.
- [ ] Rate limits and secure headers enabled.
- [ ] Dependency/container scans clean or risks accepted.
- [ ] Backup restore and revision rollback rehearsed.
- [ ] Privacy notice, retention, deletion, and support processes published.

