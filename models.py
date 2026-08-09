"""
SQLAlchemy models for the Studio Management App.

These map directly to the clients and bookings tables defined in
schema.sql — same column names, same relationship (a booking belongs
to one client; a client can have many bookings).
"""

from datetime import datetime, date
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

VALID_STATUSES = ("pending", "confirmed", "completed", "cancelled")


class Client(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    bookings = db.relationship(
        "Booking", backref="client", cascade="all, delete-orphan"
    )

    def to_dict(self, include_bookings=False):
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_bookings:
            data["bookings"] = [b.to_dict(include_client=False) for b in self.bookings]
        return data


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(
        db.Integer, db.ForeignKey("clients.id", ondelete="CASCADE"), nullable=False
    )
    session_type = db.Column(db.String(50), nullable=False)
    preferred_date = db.Column(db.Date, nullable=False)
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, include_client=True):
        data = {
            "id": self.id,
            "clientId": self.client_id,
            "sessionType": self.session_type,
            "preferredDate": self.preferred_date.isoformat() if self.preferred_date else None,
            "notes": self.notes,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
        if include_client and self.client:
            data["name"] = self.client.name
            data["email"] = self.client.email
        return data
