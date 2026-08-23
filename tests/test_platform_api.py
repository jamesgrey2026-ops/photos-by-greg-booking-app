import os
import tempfile
import unittest
from datetime import date, timedelta

from app import create_app
from models import db


class EnhancedPlatformTests(unittest.TestCase):
    def setUp(self):
        handle, path = tempfile.mkstemp(suffix=".db")
        os.close(handle)
        self.database_path = path
        os.environ["DATABASE_URL"] = f"sqlite:///{path}"
        self.app = create_app()
        self.app.config.update(TESTING=True)
        self.client = self.app.test_client()

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()
        os.unlink(self.database_path)
        os.environ.pop("DATABASE_URL", None)

    def create_school_project(self):
        school = self.client.post("/api/schools", json={
            "name": "Lincoln Middle School", "coordinatorName": "Avery Johnson",
            "coordinatorEmail": "avery@lincoln.example", "enrollment": 520,
        }).get_json()
        project = self.client.post("/api/yearbook-projects", json={
            "schoolId": school["id"], "schoolYear": "2026-2027", "plan": "Professional",
            "totalPages": 72, "finalDeadline": (date.today() + timedelta(days=180)).isoformat(),
        }).get_json()
        return school, project

    def test_yearbook_progress_updates_from_students_and_pages(self):
        _, project = self.create_school_project()
        student = self.client.post("/api/students", json={
            "projectId": project["id"], "firstName": "Jordan", "lastName": "Lee",
            "grade": "8", "portraitStatus": "missing",
        }).get_json()
        page = self.client.post("/api/yearbook-pages", json={
            "projectId": project["id"], "pageNumber": 1, "section": "Eighth Grade",
            "status": "submitted",
        }).get_json()
        self.client.put(f"/api/students/{student['id']}", json={"portraitStatus": "received"})
        self.client.put(f"/api/yearbook-pages/{page['id']}", json={"status": "approved"})
        updated = self.client.get(f"/api/yearbook-projects/{project['id']}").get_json()
        self.assertEqual(updated["metrics"]["portraitsReceived"], 1)
        self.assertEqual(updated["metrics"]["pagesApproved"], 1)

    def test_stay_connected_profile_social_link_and_life_event(self):
        _, project = self.create_school_project()
        student = self.client.post("/api/students", json={
            "projectId": project["id"], "firstName": "Taylor", "lastName": "Morgan",
        }).get_json()
        profile = self.client.post("/api/connected-profiles", json={
            "studentId": student["id"], "bio": "Class of 2027", "visibility": "classmates",
            "guardianConsent": True,
        }).get_json()
        link = self.client.post("/api/social-links", json={
            "profileId": profile["id"], "platform": "linkedin",
            "url": "https://www.linkedin.com/in/taylor-morgan",
        })
        event = self.client.post("/api/life-events", json={
            "profileId": profile["id"], "title": "Started college", "approved": True,
        })
        self.assertEqual(link.status_code, 201)
        self.assertEqual(event.status_code, 201)
        saved = self.client.get("/api/connected-profiles").get_json()[0]
        self.assertEqual(saved["socialLinks"][0]["platform"], "linkedin")
        self.assertEqual(saved["lifeEvents"][0]["title"], "Started college")

    def test_merchandise_order_requires_authorized_photo(self):
        gallery = self.client.post("/api/galleries", json={"title": "Family Session"}).get_json()
        photo = self.client.post("/api/photos", json={
            "galleryId": gallery["id"], "imageUrl": "https://example.com/family.jpg",
            "merchandiseAllowed": True,
        }).get_json()
        product = self.client.post("/api/products", json={
            "name": "Classic Photo T-Shirt", "category": "shirts", "priceCents": 2999,
        }).get_json()
        order = self.client.post("/api/orders", json={
            "customerName": "James Grey", "customerEmail": "james@example.com",
            "items": [{"productId": product["id"], "photoId": photo["id"],
                       "quantity": 2, "size": "XL", "color": "Black"}],
        })
        self.assertEqual(order.status_code, 201)
        self.assertEqual(order.get_json()["totalCents"], 5998)
        self.assertEqual(order.get_json()["status"], "ordered")

    def test_merchandise_order_advances_through_production(self):
        gallery = self.client.post("/api/galleries", json={"title": "Graduation"}).get_json()
        photo = self.client.post("/api/photos", json={
            "galleryId": gallery["id"], "imageUrl": "/demo/graduation.png",
            "portfolioConsent": True, "merchandiseAllowed": True,
        }).get_json()
        product = self.client.post("/api/products", json={
            "name": "Keepsake Photo Mug", "category": "Gifts", "priceCents": 1899,
        }).get_json()
        order = self.client.post("/api/orders", json={
            "customerName": "Taylor Morgan", "customerEmail": "taylor@example.com",
            "items": [{"productId": product["id"], "photoId": photo["id"], "quantity": 1,
                       "size": "Standard", "color": "White"}],
        }).get_json()
        for status in ("printing", "out_for_delivery", "delivered"):
            response = self.client.put(f"/api/orders/{order['id']}", json={"status": status})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.get_json()["status"], status)

    def test_merchandise_cart_accepts_multiple_products_and_purple_shirt(self):
        gallery = self.client.post("/api/galleries", json={"title": "Graduation Cart"}).get_json()
        photo = self.client.post("/api/photos", json={
            "galleryId": gallery["id"], "imageUrl": "/demo/graduation-cart.jpg",
            "portfolioConsent": True, "merchandiseAllowed": True,
        }).get_json()
        shirt = self.client.post("/api/products", json={
            "name": "Classic Photo T-Shirt", "category": "Shirts", "priceCents": 2999,
        }).get_json()
        mug = self.client.post("/api/products", json={
            "name": "Keepsake Photo Mug", "category": "Gifts", "priceCents": 1899,
        }).get_json()
        response = self.client.post("/api/orders", json={
            "customerName": "Taylor Morgan", "customerEmail": "taylor@example.com",
            "items": [
                {"productId": shirt["id"], "photoId": photo["id"], "quantity": 2,
                 "size": "XL", "color": "Northwestern Purple"},
                {"productId": mug["id"], "photoId": photo["id"], "quantity": 1,
                 "size": "Standard", "color": "White"},
            ],
        })
        self.assertEqual(response.status_code, 201)
        order = response.get_json()
        self.assertEqual(len(order["items"]), 2)
        self.assertEqual(order["totalCents"], 7897)
        self.assertEqual(order["items"][0]["color"], "Northwestern Purple")

    def test_ai_photo_assistant_requires_consent_and_human_approval(self):
        gallery = self.client.post("/api/galleries", json={"title": "Graduation", "category": "Graduation"}).get_json()
        blocked = self.client.post("/api/photos", json={
            "galleryId": gallery["id"], "imageUrl": "/blocked.png",
            "portfolioConsent": False, "merchandiseAllowed": True,
        }).get_json()
        self.assertEqual(self.client.post(f"/api/photos/{blocked['id']}/analyze").status_code, 403)

        approved = self.client.post("/api/photos", json={
            "galleryId": gallery["id"], "title": "Graduation Portrait", "imageUrl": "/approved.png",
            "portfolioConsent": True, "merchandiseAllowed": True,
        }).get_json()
        analysis = self.client.post(f"/api/photos/{approved['id']}/analyze")
        self.assertEqual(analysis.status_code, 200)
        self.assertEqual(analysis.get_json()["status"], "pending_review")
        human_review = self.client.put(f"/api/photos/{approved['id']}/analysis", json={"status": "approved"})
        self.assertEqual(human_review.status_code, 200)
        self.assertEqual(human_review.get_json()["status"], "approved")

    def test_dashboard_aggregates_platform_activity(self):
        self.create_school_project()
        dashboard = self.client.get("/api/admin/dashboard")
        self.assertEqual(dashboard.status_code, 200)
        self.assertEqual(dashboard.get_json()["schools"], 1)
        self.assertEqual(dashboard.get_json()["activeYearbookProjects"], 1)


if __name__ == "__main__":
    unittest.main()
