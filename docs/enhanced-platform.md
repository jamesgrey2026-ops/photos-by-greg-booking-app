# Enhanced Photos by Greg Platform MVP

The enhancement branch expands the original booking application into connected customer, school and staff experiences while preserving booking CRUD.

## Application areas

- **Book a Session** — existing dynamic photography intake and booking dashboard.
- **Portfolio** — published galleries with portfolio-use permission.
- **Yearbook SaaS** — school onboarding, projects, rosters, portraits, pages and calculated progress.
- **Stay Connected** — opt-in profiles, social links, life events and visibility settings.
- **Merchandise** — products and photo-based orders requiring merchandise authorization.
- **Admin CRM** — live metrics calculated from database records.

## Enhanced API routes

| Route | Methods | Purpose |
|---|---|---|
| `/api/schools` | GET, POST | List and onboard schools |
| `/api/yearbook-projects` | GET, POST | List and create projects |
| `/api/yearbook-projects/:id` | GET, PUT | View progress and update workflow |
| `/api/students` | GET, POST | Filter or add roster records |
| `/api/students/:id` | PUT | Update portrait status |
| `/api/yearbook-pages` | GET, POST | Filter or create pages |
| `/api/yearbook-pages/:id` | PUT | Update page approval status |
| `/api/connected-profiles` | GET, POST | List and create opt-in profiles |
| `/api/social-links` | POST | Add validated HTTPS social links |
| `/api/life-events` | POST | Add moderated life events |
| `/api/galleries` | GET, POST | List or create galleries |
| `/api/photos` | POST | Add photo metadata and permissions |
| `/api/products` | GET, POST | List or create products |
| `/api/orders` | GET, POST | Create and review orders |
| `/api/admin/dashboard` | GET | Return calculated CRM metrics |

## Demonstration data

Set `SEED_DEMO_DATA=true` only in a demonstration or development environment. The idempotent seed creates one school workspace, example roster and page statuses, an opt-in profile, gallery categories and merchandise products. Production should leave this setting false.

## MVP safety boundaries

- Social profiles are submitted HTTPS links; the application does not scrape social networks.
- Life events require approval before publication.
- Merchandise orders reject photographs without merchandise authorization.
- Portfolio and merchandise permissions are separate.
- Authentication, role authorization, school isolation, production image storage and payment integration remain required before real-customer deployment.
