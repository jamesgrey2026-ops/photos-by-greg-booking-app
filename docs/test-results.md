# Milestones 3–4 Test Results

Record the final cloud retest in the Actual Result column before submission.

| ID | Test | Expected result | Local result | Cloud result |
|---|---|---|---|---|
| E2E-01 | Create a valid booking from React | 201 response; booking and client persist | Pass | Pending deployment |
| E2E-02 | Display bookings in dashboard | Stored bookings render in React | Pass | Pending deployment |
| E2E-03 | Update booking status | UI and database show new status | Pass | Pending deployment |
| E2E-04 | Delete a booking | 204 response; card and row removed | Pass | Pending deployment |
| E2E-05 | Omit a required field | Helpful error; no row created | Pass | Pending deployment |
| E2E-06 | Submit a past date | 400 response; no row created | Pass | Pending deployment |
| E2E-07 | Send malformed JSON | Controlled 400 response | Pass | Pending deployment |
| E2E-08 | Refresh after creation | Database record remains | Pass | Pending deployment |
| E2E-09 | Stop or disconnect API | Safe unavailable message | Pass | Pending deployment |
| E2E-10 | Use configured frontend origin | CORS header returned | Pass | Pending deployment |
| E2E-11 | Health check | `/health` returns 200 | Pass | Pending deployment |

Automated backend tests: run `python -m unittest discover -s tests -v`.

Manual frontend sequence: create, refresh, update status, delete, invalid submission, and API-unavailable test. Capture the browser Network panel and database rows during the final demonstration.
