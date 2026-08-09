"""
Booking API resources.

  GET/POST        /api/bookings        -> BookingListResource
  GET/PUT/DELETE   /api/bookings/<id>   -> BookingResource

Note on design: the frontend booking form collects the client's name,
email, and phone directly (see API_List.md). Rather than requiring the
frontend to already know a client_id, POST /api/bookings looks up a
client by email and creates one if it doesn't exist yet, then links
the new booking to that client via client_id — keeping the database
properly normalized while still matching the original API contract.
"""

from datetime import datetime, date
from flask import current_app, request
from flask_restful import Resource
from models import db, Booking, Client, VALID_STATUSES


def booking_or_404(booking_id):
    return db.session.get(Booking, booking_id)


def parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


class BookingListResource(Resource):
    def get(self):
        """GET /api/bookings — list all bookings."""
        bookings = Booking.query.all()
        return [b.to_dict() for b in bookings], 200

    def post(self):
        """POST /api/bookings — create a booking, looking up or creating the client."""
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return {"error": "Request body must be valid JSON"}, 400

        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip()
        phone = (payload.get("phone") or "").strip() or None
        session_type = (payload.get("sessionType") or "").strip()
        preferred_date_raw = payload.get("preferredDate")
        notes = payload.get("notes")

        # --- validation ---
        errors = {}
        if not name:
            errors["name"] = "name is required"
        if not email:
            errors["email"] = "email is required"
        if not session_type:
            errors["sessionType"] = "sessionType is required"

        preferred_date = parse_date(preferred_date_raw)
        if preferred_date is None:
            errors["preferredDate"] = "preferredDate is required (format: YYYY-MM-DD)"
        elif preferred_date < date.today():
            errors["preferredDate"] = "preferredDate cannot be in the past"

        if errors:
            return {"errors": errors}, 400

        # --- find or create the client ---
        client = Client.query.filter_by(email=email).first()
        if client is None:
            client = Client(name=name, email=email, phone=phone)
            db.session.add(client)
            db.session.flush()  # assigns client.id without a full commit yet

        booking = Booking(
            client_id=client.id,
            session_type=session_type,
            preferred_date=preferred_date,
            notes=notes,
            status="pending",
        )
        try:
            db.session.add(booking)
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Booking creation failed")
            return {"error": "The booking could not be saved. Please try again."}, 500

        return booking.to_dict(), 201


class BookingResource(Resource):
    def get(self, booking_id):
        """GET /api/bookings/<id> — get one booking."""
        booking = booking_or_404(booking_id)
        if booking is None:
            return {"error": "Booking not found"}, 404
        return booking.to_dict(), 200

    def put(self, booking_id):
        """PUT /api/bookings/<id> — update a booking (e.g. status or date)."""
        booking = booking_or_404(booking_id)
        if booking is None:
            return {"error": "Booking not found"}, 404

        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return {"error": "Request body must be valid JSON"}, 400

        if "status" in payload:
            if payload["status"] not in VALID_STATUSES:
                return {"error": f"status must be one of {VALID_STATUSES}"}, 400
            booking.status = payload["status"]

        if "preferredDate" in payload:
            new_date = parse_date(payload["preferredDate"])
            if new_date is None:
                return {"error": "preferredDate must be in format YYYY-MM-DD"}, 400
            if new_date < date.today():
                return {"error": "preferredDate cannot be in the past"}, 400
            booking.preferred_date = new_date

        if "sessionType" in payload:
            session_type = (payload["sessionType"] or "").strip()
            if not session_type:
                return {"error": "sessionType cannot be empty"}, 400
            booking.session_type = session_type

        if "notes" in payload:
            booking.notes = payload["notes"]

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Booking update failed")
            return {"error": "The booking could not be updated. Please try again."}, 500
        return booking.to_dict(), 200

    def delete(self, booking_id):
        """DELETE /api/bookings/<id> — cancel/remove a booking."""
        booking = booking_or_404(booking_id)
        if booking is None:
            return {"error": "Booking not found"}, 404

        try:
            db.session.delete(booking)
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Booking deletion failed")
            return {"error": "The booking could not be deleted. Please try again."}, 500
        return "", 204
