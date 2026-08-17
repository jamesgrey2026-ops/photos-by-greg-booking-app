"""REST resources for the enhanced Photos by Greg platform MVP."""

from datetime import datetime
from urllib.parse import urlparse

from flask import request
from flask_restful import Resource

from models import (
    db, Booking, Client, School, YearbookProject, Student, YearbookPage,
    ConnectedProfile, SocialLink, LifeEvent, Gallery, Photo, Product,
    MerchandiseOrder, OrderItem,
)


def payload_or_error():
    payload = request.get_json(silent=True)
    return payload if isinstance(payload, dict) else None


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


class SchoolListResource(Resource):
    def get(self):
        return [school.to_dict() for school in School.query.order_by(School.name).all()], 200

    def post(self):
        data = payload_or_error()
        required = ("name", "coordinatorName", "coordinatorEmail")
        if data is None:
            return {"error": "Request body must be valid JSON"}, 400
        if any(not str(data.get(field, "")).strip() for field in required):
            return {"error": "name, coordinatorName and coordinatorEmail are required"}, 400
        school = School(name=data["name"].strip(), coordinator_name=data["coordinatorName"].strip(),
                        coordinator_email=data["coordinatorEmail"].strip(), enrollment=int(data.get("enrollment") or 0))
        db.session.add(school)
        db.session.commit()
        return school.to_dict(), 201


class YearbookProjectListResource(Resource):
    def get(self):
        return [project.to_dict() for project in YearbookProject.query.order_by(YearbookProject.id.desc()).all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("schoolId") or not data.get("schoolYear"):
            return {"error": "schoolId and schoolYear are required"}, 400
        if db.session.get(School, data["schoolId"]) is None:
            return {"error": "School not found"}, 404
        project = YearbookProject(school_id=data["schoolId"], school_year=str(data["schoolYear"]).strip(),
                                  plan=data.get("plan", "Essentials"), total_pages=int(data.get("totalPages") or 72),
                                  final_deadline=parse_date(data.get("finalDeadline")))
        db.session.add(project)
        db.session.commit()
        return project.to_dict(), 201


class YearbookProjectResource(Resource):
    def get(self, project_id):
        project = db.session.get(YearbookProject, project_id)
        return (project.to_dict(), 200) if project else ({"error": "Project not found"}, 404)

    def put(self, project_id):
        project = db.session.get(YearbookProject, project_id)
        data = payload_or_error()
        if project is None:
            return {"error": "Project not found"}, 404
        if data is None:
            return {"error": "Request body must be valid JSON"}, 400
        for key, attr in (("status", "status"), ("plan", "plan")):
            if key in data:
                setattr(project, attr, str(data[key]).strip())
        db.session.commit()
        return project.to_dict(), 200


class StudentListResource(Resource):
    def get(self):
        query = Student.query
        if request.args.get("projectId"):
            query = query.filter_by(project_id=request.args["projectId"])
        return [student.to_dict() for student in query.order_by(Student.last_name).all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("projectId") or not data.get("firstName") or not data.get("lastName"):
            return {"error": "projectId, firstName and lastName are required"}, 400
        if db.session.get(YearbookProject, data["projectId"]) is None:
            return {"error": "Project not found"}, 404
        student = Student(project_id=data["projectId"], first_name=data["firstName"].strip(),
                          last_name=data["lastName"].strip(), grade=data.get("grade"),
                          homeroom=data.get("homeroom"), portrait_status=data.get("portraitStatus", "missing"))
        db.session.add(student)
        db.session.commit()
        return student.to_dict(), 201


class StudentResource(Resource):
    def put(self, student_id):
        student = db.session.get(Student, student_id)
        data = payload_or_error()
        if student is None:
            return {"error": "Student not found"}, 404
        if data is None:
            return {"error": "Request body must be valid JSON"}, 400
        if "portraitStatus" in data:
            if data["portraitStatus"] not in ("missing", "received", "retake_required"):
                return {"error": "Invalid portraitStatus"}, 400
            student.portrait_status = data["portraitStatus"]
        for key, attr in (("grade", "grade"), ("homeroom", "homeroom")):
            if key in data:
                setattr(student, attr, data[key])
        db.session.commit()
        return student.to_dict(), 200


class PageListResource(Resource):
    def get(self):
        query = YearbookPage.query
        if request.args.get("projectId"):
            query = query.filter_by(project_id=request.args["projectId"])
        return [page.to_dict() for page in query.order_by(YearbookPage.page_number).all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("projectId") or not data.get("pageNumber") or not data.get("section"):
            return {"error": "projectId, pageNumber and section are required"}, 400
        page = YearbookPage(project_id=data["projectId"], page_number=int(data["pageNumber"]),
                            section=data["section"].strip(), assignee=data.get("assignee"),
                            due_date=parse_date(data.get("dueDate")), status=data.get("status", "assigned"))
        db.session.add(page)
        db.session.commit()
        return page.to_dict(), 201


class PageResource(Resource):
    def put(self, page_id):
        page = db.session.get(YearbookPage, page_id)
        data = payload_or_error()
        if page is None:
            return {"error": "Page not found"}, 404
        if data is None:
            return {"error": "Request body must be valid JSON"}, 400
        if "status" in data:
            if data["status"] not in ("assigned", "in_progress", "submitted", "changes_requested", "approved"):
                return {"error": "Invalid page status"}, 400
            page.status = data["status"]
        db.session.commit()
        return page.to_dict(), 200


class ProfileListResource(Resource):
    def get(self):
        return [profile.to_dict() for profile in ConnectedProfile.query.all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("studentId"):
            return {"error": "studentId is required"}, 400
        if ConnectedProfile.query.filter_by(student_id=data["studentId"]).first():
            return {"error": "Student already has a profile"}, 409
        profile = ConnectedProfile(student_id=data["studentId"], bio=data.get("bio"),
                                   current_city=data.get("currentCity"), visibility=data.get("visibility", "private"),
                                   guardian_consent=bool(data.get("guardianConsent", False)))
        db.session.add(profile)
        db.session.commit()
        return profile.to_dict(), 201


class SocialLinkListResource(Resource):
    def post(self):
        data = payload_or_error()
        if data is None or data.get("platform") not in ("instagram", "facebook", "linkedin"):
            return {"error": "platform must be instagram, facebook or linkedin"}, 400
        parsed = urlparse(data.get("url", ""))
        if parsed.scheme != "https" or not parsed.netloc:
            return {"error": "A valid HTTPS profile URL is required"}, 400
        link = SocialLink(profile_id=data["profileId"], platform=data["platform"], url=data["url"])
        db.session.add(link)
        db.session.commit()
        return link.to_dict(), 201


class LifeEventListResource(Resource):
    def post(self):
        data = payload_or_error()
        if data is None or not data.get("profileId") or not data.get("title"):
            return {"error": "profileId and title are required"}, 400
        event = LifeEvent(profile_id=data["profileId"], title=data["title"].strip(),
                          description=data.get("description"), event_date=parse_date(data.get("eventDate")),
                          approved=bool(data.get("approved", False)))
        db.session.add(event)
        db.session.commit()
        return event.to_dict(), 201


class GalleryListResource(Resource):
    def get(self):
        query = Gallery.query
        if request.args.get("published") == "true":
            query = query.filter_by(published=True)
        return [gallery.to_dict() for gallery in query.order_by(Gallery.id.desc()).all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("title"):
            return {"error": "title is required"}, 400
        gallery = Gallery(title=data["title"].strip(), gallery_type=data.get("galleryType", "private"),
                          category=data.get("category"), published=bool(data.get("published", False)))
        db.session.add(gallery)
        db.session.commit()
        return gallery.to_dict(), 201


class PhotoListResource(Resource):
    def post(self):
        data = payload_or_error()
        if data is None or not data.get("galleryId") or not data.get("imageUrl"):
            return {"error": "galleryId and imageUrl are required"}, 400
        photo = Photo(gallery_id=data["galleryId"], title=data.get("title"), image_url=data["imageUrl"],
                      portfolio_consent=bool(data.get("portfolioConsent", False)),
                      merchandise_allowed=bool(data.get("merchandiseAllowed", False)))
        db.session.add(photo)
        db.session.commit()
        return photo.to_dict(), 201


class ProductListResource(Resource):
    def get(self):
        return [product.to_dict() for product in Product.query.filter_by(active=True).order_by(Product.name).all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("name") or not data.get("priceCents"):
            return {"error": "name and priceCents are required"}, 400
        product = Product(name=data["name"].strip(), category=data.get("category", "merchandise"),
                          price_cents=int(data["priceCents"]))
        db.session.add(product)
        db.session.commit()
        return product.to_dict(), 201


class OrderListResource(Resource):
    def get(self):
        return [order.to_dict() for order in MerchandiseOrder.query.order_by(MerchandiseOrder.id.desc()).all()], 200

    def post(self):
        data = payload_or_error()
        if data is None or not data.get("customerName") or not data.get("customerEmail") or not data.get("items"):
            return {"error": "customerName, customerEmail and items are required"}, 400
        order = MerchandiseOrder(customer_name=data["customerName"].strip(),
                                 customer_email=data["customerEmail"].strip(), status="payment_pending")
        db.session.add(order)
        for item_data in data["items"]:
            product = db.session.get(Product, item_data.get("productId"))
            if product is None:
                db.session.rollback()
                return {"error": "Product not found"}, 404
            photo_id = item_data.get("photoId")
            photo = db.session.get(Photo, photo_id) if photo_id else None
            if photo_id and (photo is None or not photo.merchandise_allowed):
                db.session.rollback()
                return {"error": "Selected photo is not authorized for merchandise"}, 403
            order.items.append(OrderItem(product_id=product.id, photo_id=photo_id,
                                         quantity=max(1, int(item_data.get("quantity", 1))),
                                         size=item_data.get("size"), color=item_data.get("color"),
                                         unit_price_cents=product.price_cents))
        order.recalculate()
        db.session.commit()
        return order.to_dict(), 201


class AdminDashboardResource(Resource):
    def get(self):
        projects = YearbookProject.query.all()
        missing = sum(project.to_dict()["metrics"]["missingPortraits"] for project in projects)
        awaiting = YearbookPage.query.filter(YearbookPage.status.in_(("submitted", "changes_requested"))).count()
        revenue = db.session.query(db.func.coalesce(db.func.sum(MerchandiseOrder.total_cents), 0)).scalar()
        return {
            "totalCustomers": Client.query.count(), "totalBookings": Booking.query.count(),
            "pendingBookings": Booking.query.filter_by(status="pending").count(),
            "schools": School.query.count(), "activeYearbookProjects": len(projects),
            "missingPortraits": missing, "pagesAwaitingApproval": awaiting,
            "publishedGalleries": Gallery.query.filter_by(published=True).count(),
            "merchandiseOrders": MerchandiseOrder.query.count(),
            "merchandiseRevenueCents": int(revenue),
        }, 200
