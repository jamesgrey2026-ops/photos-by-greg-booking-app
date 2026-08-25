"""Idempotent demonstration data for presentations and development."""

from datetime import date, timedelta

from models import (
    db, Booking, Client, School, YearbookProject, Student, YearbookPage,
    ConnectedProfile, SocialLink, LifeEvent, Gallery, Photo, Product,
    MerchandiseOrder, OrderItem,
)


def first_or_create(model, defaults=None, **lookup):
    record = model.query.filter_by(**lookup).first()
    if record is None:
        record = model(**lookup, **(defaults or {}))
        db.session.add(record)
        db.session.flush()
    return record


def seed_demo_data():
    """Add a complete, repeatable demo story without duplicating records."""
    school = first_or_create(
        School, name="Lincoln Middle School",
        defaults={"coordinator_name": "Avery Johnson", "coordinator_email": "avery@lincoln.example", "enrollment": 520},
    )
    project = first_or_create(
        YearbookProject, school_id=school.id, school_year="2026-2027",
        defaults={"plan": "Professional", "status": "page_review", "total_pages": 72,
                  "final_deadline": date.today() + timedelta(days=120)},
    )

    student_specs = [
        ("Jordan", "Lee", "8", "8A", "received"),
        ("Taylor", "Morgan", "8", "8A", "received"),
        ("Cameron", "Brooks", "7", "7B", "missing"),
        ("Riley", "Davis", "6", "6C", "retake_required"),
    ]
    students = []
    for first, last, grade, homeroom, status in student_specs:
        students.append(first_or_create(
            Student, project_id=project.id, first_name=first, last_name=last,
            defaults={"grade": grade, "homeroom": homeroom, "portrait_status": status},
        ))

    for number, section, assignee, status in [
        (1, "Opening", "Avery Johnson", "approved"),
        (18, "Eighth Grade", "Morgan Smith", "submitted"),
        (42, "Sports", "Chris Bell", "in_progress"),
    ]:
        first_or_create(YearbookPage, project_id=project.id, page_number=number,
                        defaults={"section": section, "assignee": assignee, "status": status})

    profile = first_or_create(
        ConnectedProfile, student_id=students[1].id,
        defaults={"bio": "Class of 2027 · Student leader and aspiring designer",
                  "current_city": "Oak Park, Illinois", "visibility": "classmates", "guardian_consent": True},
    )
    first_or_create(SocialLink, profile_id=profile.id, platform="linkedin",
                    defaults={"url": "https://www.linkedin.com", "verified": True})
    first_or_create(LifeEvent, profile_id=profile.id, title="Accepted a student leadership role",
                    defaults={"description": "Serving the school community.", "event_date": date.today(), "approved": True})

    gallery_specs = [("Graduation Celebration", "Graduation"), ("Family Stories", "Family"),
                     ("Picture Day Highlights", "Schools")]
    galleries = []
    for title, category in gallery_specs:
        galleries.append(first_or_create(Gallery, title=title,
                                         defaults={"gallery_type": "public", "category": category, "published": True}))

    portrait = first_or_create(
        Photo, gallery_id=galleries[0].id, title="Northwestern Graduation Group",
        defaults={"image_url": "/demo/northwestern-graduation-group.jpg", "portfolio_consent": True, "merchandise_allowed": True},
    )
    portrait.image_url = "/demo/northwestern-graduation-group.jpg"
    portrait.portfolio_consent = True
    portrait.merchandise_allowed = True
    second_photo = first_or_create(
        Photo, gallery_id=galleries[0].id, title="Graduation Friends",
        defaults={"image_url": "/demo/graduation-friends.jpg", "portfolio_consent": True, "merchandise_allowed": True},
    )
    second_photo.image_url = "/demo/graduation-friends.jpg"
    second_photo.portfolio_consent = True
    second_photo.merchandise_allowed = True

    family_photo = first_or_create(
        Photo, gallery_id=galleries[1].id, title="Chicago Family Stories",
        defaults={"image_url": "/demo/family-stories-portrait.jpg", "portfolio_consent": True,
                  "merchandise_allowed": True},
    )
    family_photo.image_url = "/demo/family-stories-portrait.jpg"
    family_photo.portfolio_consent = True
    family_photo.merchandise_allowed = True

    picture_day_photo = first_or_create(
        Photo, gallery_id=galleries[2].id, title="Picture Day Class Portrait",
        defaults={"image_url": "/demo/picture-day-class.jpg", "portfolio_consent": True,
                  "merchandise_allowed": True},
    )
    picture_day_photo.image_url = "/demo/picture-day-class.jpg"
    picture_day_photo.portfolio_consent = True
    picture_day_photo.merchandise_allowed = True

    product_specs = [
        ("Classic Photo T-Shirt", "Shirts", 2999),
        ("Premium Photo Hoodie", "Apparel", 5499),
        ("Keepsake Photo Mug", "Gifts", 1899),
        ("Personalized Photo Hat", "Headwear", 2499),
        ("Graduation Photo Cube", "Desk Decor", 2799),
        ("Custom Photo Sticker Pack", "Stickers", 999),
        ("Keepsake Photo Magnet", "Magnets", 1299),
        ("Gallery Canvas Print", "Wall Art", 6999),
    ]
    products = {}
    for name, category, price in product_specs:
        products[name] = first_or_create(Product, name=name,
                                         defaults={"category": category, "price_cents": price, "active": True})

    customer = first_or_create(Client, email="taylor.morgan@example.com",
                               defaults={"name": "Taylor Morgan", "phone": "(312) 555-0147"})
    for session_type, days, status in [("Graduation Portrait", 14, "confirmed"), ("Family Celebration", 28, "pending")]:
        if not Booking.query.filter_by(client_id=customer.id, session_type=session_type).first():
            db.session.add(Booking(client_id=customer.id, session_type=session_type,
                                   preferred_date=date.today() + timedelta(days=days), status=status,
                                   notes="Presentation-ready demo booking"))

    for index, status in enumerate(("ordered", "printing", "out_for_delivery"), start=1):
        email = f"demo.order{index}@example.com"
        if not MerchandiseOrder.query.filter_by(customer_email=email).first():
            product = products["Classic Photo T-Shirt"] if index != 2 else products["Keepsake Photo Mug"]
            order = MerchandiseOrder(customer_name=f"Demo Customer {index}", customer_email=email, status=status)
            order.items.append(OrderItem(product_id=product.id, photo_id=portrait.id, quantity=index,
                                         size="L" if product.category == "Shirts" else "Standard",
                                         color="Black" if product.category == "Shirts" else "White",
                                         unit_price_cents=product.price_cents))
            order.recalculate()
            db.session.add(order)

    db.session.commit()
    return True
