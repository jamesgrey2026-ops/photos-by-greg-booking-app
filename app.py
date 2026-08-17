"""
Studio Management App — Backend
Photos by Greg | Davis Digital Services | Capstone Milestone 2

Flask application factory. Creates and configures the Flask app,
initializes the database and REST API, and registers all routes.
"""

import os

from dotenv import load_dotenv
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_restful import Api

from models import db
from resources.bookings import BookingListResource, BookingResource
from resources.clients import ClientListResource, ClientResource
from resources.platform import (
    SchoolListResource, YearbookProjectListResource, YearbookProjectResource,
    StudentListResource, StudentResource, PageListResource, PageResource,
    ProfileListResource, SocialLinkListResource, LifeEventListResource,
    GalleryListResource, PhotoListResource, ProductListResource,
    OrderListResource, AdminDashboardResource,
)
from seed_data import seed_demo_data


def create_app():
    load_dotenv()

    frontend_dist = os.path.join(
        os.path.dirname(__file__),
        "frontend",
        "dist"
    )

    app = Flask(
        __name__,
        static_folder=frontend_dist,
        static_url_path=""
    )

    # Use DATABASE_URL when supplied by Azure or a local .env file.
    # Otherwise, use SQLite for local testing.
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL",
        "sqlite:///studio_management.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    allowed_origins = [
        origin.strip()
        for origin in os.environ.get(
            "FRONTEND_ORIGINS",
            "http://localhost:5173"
        ).split(",")
        if origin.strip()
    ]

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins
            }
        }
    )

    api = Api(app)

    # Booking routes
    api.add_resource(
        BookingListResource,
        "/api/bookings"
    )

    # Enhanced photography, Yearbook SaaS, gallery and commerce routes
    api.add_resource(SchoolListResource, "/api/schools")
    api.add_resource(YearbookProjectListResource, "/api/yearbook-projects")
    api.add_resource(YearbookProjectResource, "/api/yearbook-projects/<int:project_id>")
    api.add_resource(StudentListResource, "/api/students")
    api.add_resource(StudentResource, "/api/students/<int:student_id>")
    api.add_resource(PageListResource, "/api/yearbook-pages")
    api.add_resource(PageResource, "/api/yearbook-pages/<int:page_id>")
    api.add_resource(ProfileListResource, "/api/connected-profiles")
    api.add_resource(SocialLinkListResource, "/api/social-links")
    api.add_resource(LifeEventListResource, "/api/life-events")
    api.add_resource(GalleryListResource, "/api/galleries")
    api.add_resource(PhotoListResource, "/api/photos")
    api.add_resource(ProductListResource, "/api/products")
    api.add_resource(OrderListResource, "/api/orders")
    api.add_resource(AdminDashboardResource, "/api/admin/dashboard")
    api.add_resource(
        BookingResource,
        "/api/bookings/<int:booking_id>"
    )

    # Client routes
    api.add_resource(
        ClientListResource,
        "/api/clients"
    )
    api.add_resource(
        ClientResource,
        "/api/clients/<int:client_id>"
    )

    @app.route("/")
    def index():
        index_file = os.path.join(frontend_dist, "index.html")

        if os.path.exists(index_file):
            return send_from_directory(frontend_dist, "index.html")

        return {"message": "Studio Management API is running."}

    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200

    @app.route("/<path:path>")
    def frontend(path):
        requested_file = os.path.join(frontend_dist, path)
        index_file = os.path.join(frontend_dist, "index.html")

        if os.path.isfile(requested_file):
            return send_from_directory(frontend_dist, path)

        if os.path.exists(index_file):
            return send_from_directory(frontend_dist, "index.html")

        return {"message": "Studio Management API is running."}, 404

    # Create database tables whenever Flask starts, including under
    # Gunicorn on Azure. Existing tables and records are preserved.
    with app.app_context():
        db.create_all()
        if os.environ.get("SEED_DEMO_DATA", "false").lower() == "true":
            seed_demo_data()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
