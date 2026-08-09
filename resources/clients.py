"""
Client API resources.

  GET/POST   /api/clients        -> ClientListResource
  GET/PUT/DELETE  /api/clients/<id>  -> ClientResource
"""

from flask import current_app, request
from flask_restful import Resource
from models import db, Client


def client_or_404(client_id):
    client = db.session.get(Client, client_id)
    if client is None:
        return None
    return client


class ClientListResource(Resource):
    def get(self):
        """GET /api/clients — list all clients."""
        clients = Client.query.all()
        return [c.to_dict() for c in clients], 200

    def post(self):
        """POST /api/clients — create a new client."""
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return {"error": "Request body must be valid JSON"}, 400

        name = payload.get("name", "").strip()
        email = payload.get("email", "").strip()
        phone = payload.get("phone", "").strip() if payload.get("phone") else None

        if not name:
            return {"error": "name is required"}, 400
        if not email:
            return {"error": "email is required"}, 400

        if Client.query.filter_by(email=email).first():
            return {"error": "A client with this email already exists"}, 409

        client = Client(name=name, email=email, phone=phone)
        try:
            db.session.add(client)
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Client creation failed")
            return {"error": "The client could not be saved. Please try again."}, 500

        return client.to_dict(), 201


class ClientResource(Resource):
    def get(self, client_id):
        """GET /api/clients/<id> — get one client, including their bookings."""
        client = client_or_404(client_id)
        if client is None:
            return {"error": "Client not found"}, 404
        return client.to_dict(include_bookings=True), 200

    def put(self, client_id):
        """PUT /api/clients/<id> — update a client's contact info."""
        client = client_or_404(client_id)
        if client is None:
            return {"error": "Client not found"}, 404

        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return {"error": "Request body must be valid JSON"}, 400

        if "name" in payload:
            name = (payload["name"] or "").strip()
            if not name:
                return {"error": "name cannot be empty"}, 400
            client.name = name
        if "email" in payload:
            email = (payload["email"] or "").strip()
            if not email:
                return {"error": "email cannot be empty"}, 400
            duplicate = Client.query.filter(Client.email == email, Client.id != client.id).first()
            if duplicate:
                return {"error": "A client with this email already exists"}, 409
            client.email = email
        if "phone" in payload:
            client.phone = payload["phone"]

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Client update failed")
            return {"error": "The client could not be updated. Please try again."}, 500
        return client.to_dict(), 200

    def delete(self, client_id):
        """DELETE /api/clients/<id> — remove a client (and their bookings)."""
        client = client_or_404(client_id)
        if client is None:
            return {"error": "Client not found"}, 404

        try:
            db.session.delete(client)
            db.session.commit()
        except Exception:
            db.session.rollback()
            current_app.logger.exception("Client deletion failed")
            return {"error": "The client could not be deleted. Please try again."}, 500
        return "", 204
