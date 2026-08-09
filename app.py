"""
Studio Management App — Backend
Photos by Greg | Davis Digital Services | Capstone Milestone 2

Flask application factory. Creates and configures the Flask app,
initializes the database and REST API, and registers all routes.
"""

import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_restful import Api
from dotenv import load_dotenv

from models import db
from resources.clients import ClientListResource, ClientResource
from resources.bookings import BookingListResource, BookingResource


def create_app():
    load_dotenv()
    frontend_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
    app = Flask(__name__, static_folder=frontend_dist, static_url_path="")

    # Database connection string.
    # For local development against pgAdmin/PostgreSQL, set DATABASE_URL
    # in a .env file, e.g.:
    #   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/studio_management
    #
    # Falls back to SQLite so the app can run out-of-the-box for quick testing.
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///studio_management.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    allowed_origins = [
        origin.strip()
        for origin in os.environ.get(
            "FRONTEND_ORIGINS", "http://localhost:5173"
        ).split(",")
        if origin.strip()
    ]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    api = Api(app)

    # Bookings routes
    api.add_resource(BookingListResource, "/api/bookings")
    api.add_resource(BookingResource, "/api/bookings/<int:booking_id>")

    # Clients routes
    api.add_resource(ClientListResource, "/api/clients")
    api.add_resource(ClientResource, "/api/clients/<int:client_id>")

    @app.route("/")
    def index():
        if os.path.exists(os.path.join(frontend_dist, "index.html")):
            return send_from_directory(frontend_dist, "index.html")
        return {"message": "Studio Management API is running."}

    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200

    @app.route("/<path:path>")
    def frontend(path):
        requested_file = os.path.join(frontend_dist, path)
        if os.path.isfile(requested_file):
            return send_from_directory(frontend_dist, path)
        return send_from_directory(frontend_dist, "index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # creates tables if they don't exist yet (SQLite fallback)
    app.run(debug=True, port=5000)
