"""
SQLAlchemy models for the Studio Management App.

These map directly to the clients and bookings tables defined in
schema.sql — same column names, same relationship (a booking belongs
to one client; a client can have many bookings).
"""

from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

VALID_STATUSES = ("pending", "confirmed", "completed", "cancelled")


def utc_now():
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


class Client(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)

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
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)

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


class School(db.Model):
    __tablename__ = "schools"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    coordinator_name = db.Column(db.String(120), nullable=False)
    coordinator_email = db.Column(db.String(150), nullable=False)
    enrollment = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)

    projects = db.relationship("YearbookProject", backref="school", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id, "name": self.name,
            "coordinatorName": self.coordinator_name,
            "coordinatorEmail": self.coordinator_email,
            "enrollment": self.enrollment,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class YearbookProject(db.Model):
    __tablename__ = "yearbook_projects"

    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id", ondelete="CASCADE"), nullable=False)
    school_year = db.Column(db.String(20), nullable=False)
    plan = db.Column(db.String(30), nullable=False, default="Essentials")
    status = db.Column(db.String(30), nullable=False, default="setup")
    total_pages = db.Column(db.Integer, nullable=False, default=72)
    final_deadline = db.Column(db.Date)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)

    students = db.relationship("Student", backref="project", cascade="all, delete-orphan")
    pages = db.relationship("YearbookPage", backref="project", cascade="all, delete-orphan")

    def to_dict(self, include_metrics=True):
        data = {
            "id": self.id, "schoolId": self.school_id,
            "schoolName": self.school.name if self.school else None,
            "schoolYear": self.school_year, "plan": self.plan, "status": self.status,
            "totalPages": self.total_pages,
            "finalDeadline": self.final_deadline.isoformat() if self.final_deadline else None,
        }
        if include_metrics:
            portraits = sum(1 for student in self.students if student.portrait_status == "received")
            approved = sum(1 for page in self.pages if page.status == "approved")
            student_total = len(self.students)
            page_total = self.total_pages or len(self.pages)
            portrait_pct = portraits / student_total * 100 if student_total else 0
            page_pct = approved / page_total * 100 if page_total else 0
            data["metrics"] = {
                "students": student_total, "portraitsReceived": portraits,
                "missingPortraits": student_total - portraits, "pagesApproved": approved,
                "completionPercent": round((portrait_pct + page_pct) / 2),
            }
        return data


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("yearbook_projects.id", ondelete="CASCADE"), nullable=False)
    first_name = db.Column(db.String(80), nullable=False)
    last_name = db.Column(db.String(80), nullable=False)
    grade = db.Column(db.String(20))
    homeroom = db.Column(db.String(60))
    portrait_status = db.Column(db.String(30), nullable=False, default="missing")
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)

    profile = db.relationship("ConnectedProfile", backref="student", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "projectId": self.project_id, "firstName": self.first_name,
                "lastName": self.last_name, "grade": self.grade, "homeroom": self.homeroom,
                "portraitStatus": self.portrait_status}


class YearbookPage(db.Model):
    __tablename__ = "yearbook_pages"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("yearbook_projects.id", ondelete="CASCADE"), nullable=False)
    page_number = db.Column(db.Integer, nullable=False)
    section = db.Column(db.String(100), nullable=False)
    assignee = db.Column(db.String(120))
    status = db.Column(db.String(30), nullable=False, default="assigned")
    due_date = db.Column(db.Date)

    def to_dict(self):
        return {"id": self.id, "projectId": self.project_id, "pageNumber": self.page_number,
                "section": self.section, "assignee": self.assignee, "status": self.status,
                "dueDate": self.due_date.isoformat() if self.due_date else None}


class ConnectedProfile(db.Model):
    __tablename__ = "connected_profiles"

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True)
    bio = db.Column(db.Text)
    current_city = db.Column(db.String(100))
    visibility = db.Column(db.String(30), nullable=False, default="private")
    guardian_consent = db.Column(db.Boolean, nullable=False, default=False)
    updated_at = db.Column(db.DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    social_links = db.relationship("SocialLink", backref="profile", cascade="all, delete-orphan")
    life_events = db.relationship("LifeEvent", backref="profile", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "studentId": self.student_id, "bio": self.bio,
                "currentCity": self.current_city, "visibility": self.visibility,
                "guardianConsent": self.guardian_consent,
                "socialLinks": [link.to_dict() for link in self.social_links],
                "lifeEvents": [event.to_dict() for event in self.life_events]}


class SocialLink(db.Model):
    __tablename__ = "social_links"
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("connected_profiles.id", ondelete="CASCADE"), nullable=False)
    platform = db.Column(db.String(20), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    verified = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {"id": self.id, "platform": self.platform, "url": self.url, "verified": self.verified}


class LifeEvent(db.Model):
    __tablename__ = "life_events"
    id = db.Column(db.Integer, primary_key=True)
    profile_id = db.Column(db.Integer, db.ForeignKey("connected_profiles.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.Date)
    approved = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {"id": self.id, "title": self.title, "description": self.description,
                "eventDate": self.event_date.isoformat() if self.event_date else None, "approved": self.approved}


class Gallery(db.Model):
    __tablename__ = "galleries"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    gallery_type = db.Column(db.String(30), nullable=False, default="private")
    category = db.Column(db.String(50))
    published = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)
    photos = db.relationship("Photo", backref="gallery", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "title": self.title, "galleryType": self.gallery_type,
                "category": self.category, "published": self.published,
                "photos": [photo.to_dict() for photo in self.photos]}


class Photo(db.Model):
    __tablename__ = "photos"
    id = db.Column(db.Integer, primary_key=True)
    gallery_id = db.Column(db.Integer, db.ForeignKey("galleries.id", ondelete="CASCADE"), nullable=False)
    title = db.Column(db.String(150))
    image_url = db.Column(db.String(1000), nullable=False)
    portfolio_consent = db.Column(db.Boolean, nullable=False, default=False)
    merchandise_allowed = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {"id": self.id, "galleryId": self.gallery_id, "title": self.title,
                "imageUrl": self.image_url, "portfolioConsent": self.portfolio_consent,
                "merchandiseAllowed": self.merchandise_allowed}


class Product(db.Model):
    __tablename__ = "products"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price_cents = db.Column(db.Integer, nullable=False)
    active = db.Column(db.Boolean, nullable=False, default=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "category": self.category,
                "priceCents": self.price_cents, "price": round(self.price_cents / 100, 2), "active": self.active}


class MerchandiseOrder(db.Model):
    __tablename__ = "merchandise_orders"
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(120), nullable=False)
    customer_email = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="draft")
    total_cents = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime(timezone=True), default=utc_now)
    items = db.relationship("OrderItem", backref="order", cascade="all, delete-orphan")

    def recalculate(self):
        self.total_cents = sum(item.unit_price_cents * item.quantity for item in self.items)

    def to_dict(self):
        return {"id": self.id, "customerName": self.customer_name, "customerEmail": self.customer_email,
                "status": self.status, "totalCents": self.total_cents, "total": round(self.total_cents / 100, 2),
                "items": [item.to_dict() for item in self.items]}


class OrderItem(db.Model):
    __tablename__ = "order_items"
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("merchandise_orders.id", ondelete="CASCADE"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    photo_id = db.Column(db.Integer, db.ForeignKey("photos.id"))
    quantity = db.Column(db.Integer, nullable=False, default=1)
    size = db.Column(db.String(20))
    color = db.Column(db.String(30))
    unit_price_cents = db.Column(db.Integer, nullable=False)
    product = db.relationship("Product")
    photo = db.relationship("Photo")

    def to_dict(self):
        return {"id": self.id, "productId": self.product_id,
                "productName": self.product.name if self.product else None,
                "photoId": self.photo_id, "quantity": self.quantity, "size": self.size,
                "color": self.color, "unitPriceCents": self.unit_price_cents}
