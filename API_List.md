# Studio Management App — API List
### Photos by Greg | Davis Digital Services | Capstone Milestone 2

This document lists every REST API endpoint planned for the Studio Management App backend, covering the **Bookings** and **Clients** resources. Each entry includes the HTTP method, URL, expected input, and expected output with sample JSON.

---

## Bookings

### 1. Create a Booking
- **Method:** `POST`
- **URL:** `/api/bookings`
- **Description:** Creates a new booking request.

**Sample Input:**
```json
{
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134",
  "sessionType": "Portrait Session",
  "preferredDate": "2026-08-15",
  "notes": "Prefer outdoor location if possible"
}
```

**Sample Output (201 Created):**
```json
{
  "id": 1,
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134",
  "sessionType": "Portrait Session",
  "preferredDate": "2026-08-15",
  "notes": "Prefer outdoor location if possible",
  "status": "pending",
  "createdAt": "2026-07-27T14:32:00Z"
}
```

---

### 2. Get All Bookings
- **Method:** `GET`
- **URL:** `/api/bookings`
- **Description:** Returns a list of all bookings.

**Sample Input:** _None (no request body)_

**Sample Output (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Jordan Rivera",
    "email": "jordan@email.com",
    "sessionType": "Portrait Session",
    "preferredDate": "2026-08-15",
    "status": "pending"
  },
  {
    "id": 2,
    "name": "Alex Chen",
    "email": "alex@email.com",
    "sessionType": "Family Session",
    "preferredDate": "2026-08-20",
    "status": "confirmed"
  }
]
```

---

### 3. Get a Single Booking
- **Method:** `GET`
- **URL:** `/api/bookings/<id>`
- **Description:** Returns details for one specific booking.

**Sample Input:** _None (id passed in URL, e.g. `/api/bookings/1`)_

**Sample Output (200 OK):**
```json
{
  "id": 1,
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134",
  "sessionType": "Portrait Session",
  "preferredDate": "2026-08-15",
  "notes": "Prefer outdoor location if possible",
  "status": "pending",
  "createdAt": "2026-07-27T14:32:00Z"
}
```

**Sample Output (404 Not Found):**
```json
{
  "error": "Booking not found"
}
```

---

### 4. Update a Booking
- **Method:** `PUT`
- **URL:** `/api/bookings/<id>`
- **Description:** Updates an existing booking (e.g. changing status or date).

**Sample Input:**
```json
{
  "status": "confirmed",
  "preferredDate": "2026-08-16"
}
```

**Sample Output (200 OK):**
```json
{
  "id": 1,
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134",
  "sessionType": "Portrait Session",
  "preferredDate": "2026-08-16",
  "notes": "Prefer outdoor location if possible",
  "status": "confirmed",
  "createdAt": "2026-07-27T14:32:00Z"
}
```

---

### 5. Delete a Booking
- **Method:** `DELETE`
- **URL:** `/api/bookings/<id>`
- **Description:** Cancels/removes a booking.

**Sample Input:** _None (id passed in URL)_

**Sample Output (204 No Content):**
```json
{}
```

---

## Clients

### 6. Create a Client
- **Method:** `POST`
- **URL:** `/api/clients`
- **Description:** Creates a new client record.

**Sample Input:**
```json
{
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134"
}
```

**Sample Output (201 Created):**
```json
{
  "id": 1,
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134",
  "createdAt": "2026-07-27T14:32:00Z"
}
```

---

### 7. Get All Clients
- **Method:** `GET`
- **URL:** `/api/clients`
- **Description:** Returns a list of all clients.

**Sample Input:** _None_

**Sample Output (200 OK):**
```json
[
  { "id": 1, "name": "Jordan Rivera", "email": "jordan@email.com" },
  { "id": 2, "name": "Alex Chen", "email": "alex@email.com" }
]
```

---

### 8. Get a Single Client
- **Method:** `GET`
- **URL:** `/api/clients/<id>`
- **Description:** Returns details for one specific client, including their booking history.

**Sample Input:** _None (id passed in URL)_

**Sample Output (200 OK):**
```json
{
  "id": 1,
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-0134",
  "bookings": [
    { "id": 1, "sessionType": "Portrait Session", "preferredDate": "2026-08-16", "status": "confirmed" }
  ]
}
```

---

### 9. Update a Client
- **Method:** `PUT`
- **URL:** `/api/clients/<id>`
- **Description:** Updates a client's contact information.

**Sample Input:**
```json
{
  "phone": "(312) 555-9999"
}
```

**Sample Output (200 OK):**
```json
{
  "id": 1,
  "name": "Jordan Rivera",
  "email": "jordan@email.com",
  "phone": "(312) 555-9999"
}
```

---

### 10. Delete a Client
- **Method:** `DELETE`
- **URL:** `/api/clients/<id>`
- **Description:** Removes a client record.

**Sample Input:** _None (id passed in URL)_

**Sample Output (204 No Content):**
```json
{}
```

---

## Summary Table

| # | Method | Endpoint | Purpose |
|---|--------|----------|---------|
| 1 | POST | `/api/bookings` | Create a booking |
| 2 | GET | `/api/bookings` | List all bookings |
| 3 | GET | `/api/bookings/<id>` | Get one booking |
| 4 | PUT | `/api/bookings/<id>` | Update a booking |
| 5 | DELETE | `/api/bookings/<id>` | Delete a booking |
| 6 | POST | `/api/clients` | Create a client |
| 7 | GET | `/api/clients` | List all clients |
| 8 | GET | `/api/clients/<id>` | Get one client |
| 9 | PUT | `/api/clients/<id>` | Update a client |
| 10 | DELETE | `/api/clients/<id>` | Delete a client |

---

*API development begins in the next module. This document reflects the planned design as of Capstone Milestone 2.*
