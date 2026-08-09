import os
import tempfile
import unittest
from datetime import date, timedelta

from app import create_app
from models import db


class ApiIntegrationTests(unittest.TestCase):
    def setUp(self):
        handle, path = tempfile.mkstemp(suffix=".db")
        os.close(handle)
        self.database_path = path
        os.environ["DATABASE_URL"] = f"sqlite:///{path}"
        os.environ["FRONTEND_ORIGINS"] = "http://localhost:5173"

        self.app = create_app()
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

        self.client = None
        os.unlink(self.database_path)
        os.environ.pop("DATABASE_URL", None)
        os.environ.pop("FRONTEND_ORIGINS", None)
        
    def booking_payload(self):
        return {
            "name": "James Grey",
            "email": "james@example.com",
            "phone": "312-555-0100",
            "sessionType": "Portrait Session",
            "preferredDate": (date.today() + timedelta(days=14)).isoformat(),
            "notes": "Outdoor session",
        }

    def test_health_check(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["status"], "healthy")

    def test_complete_booking_crud_workflow(self):
        created = self.client.post("/api/bookings", json=self.booking_payload())
        self.assertEqual(created.status_code, 201)
        booking_id = created.get_json()["id"]

        listed = self.client.get("/api/bookings")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(len(listed.get_json()), 1)

        updated = self.client.put(f"/api/bookings/{booking_id}", json={"status": "confirmed"})
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.get_json()["status"], "confirmed")

        deleted = self.client.delete(f"/api/bookings/{booking_id}")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(self.client.get(f"/api/bookings/{booking_id}").status_code, 404)

    def test_invalid_booking_does_not_persist(self):
        payload = self.booking_payload()
        payload["email"] = ""
        response = self.client.post("/api/bookings", json=payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.get("/api/bookings").get_json(), [])

    def test_past_date_is_rejected(self):
        payload = self.booking_payload()
        payload["preferredDate"] = (date.today() - timedelta(days=1)).isoformat()
        self.assertEqual(self.client.post("/api/bookings", json=payload).status_code, 400)

    def test_bad_json_is_controlled(self):
        response = self.client.post("/api/bookings", data="not-json", content_type="application/json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.get_json())

    def test_cors_allows_configured_origin(self):
        response = self.client.get("/api/bookings", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5173")


if __name__ == "__main__":
    unittest.main()
