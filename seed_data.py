"""Idempotent demonstration data for presentations and development."""

from datetime import date, timedelta

from models import (
    db, School, YearbookProject, Student, YearbookPage, ConnectedProfile,
    SocialLink, LifeEvent, Gallery, Product,
)


def seed_demo_data():
    """Create a small, realistic demo dataset once."""
    if School.query.first() is not None:
        return False

    school = School(
        name="Lincoln Middle School",
        coordinator_name="Avery Johnson",
        coordinator_email="avery@lincoln.example",
        enrollment=520,
    )
    project = YearbookProject(
        school=school,
        school_year="2026-2027",
        plan="Professional",
        status="page_review",
        total_pages=72,
        final_deadline=date.today() + timedelta(days=120),
    )
    students = [
        Student(project=project, first_name="Jordan", last_name="Lee", grade="8", homeroom="8A", portrait_status="received"),
        Student(project=project, first_name="Taylor", last_name="Morgan", grade="8", homeroom="8A", portrait_status="received"),
        Student(project=project, first_name="Cameron", last_name="Brooks", grade="7", homeroom="7B", portrait_status="missing"),
        Student(project=project, first_name="Riley", last_name="Davis", grade="6", homeroom="6C", portrait_status="retake_required"),
    ]
    pages = [
        YearbookPage(project=project, page_number=1, section="Opening", assignee="Avery Johnson", status="approved"),
        YearbookPage(project=project, page_number=18, section="Eighth Grade", assignee="Morgan Smith", status="submitted"),
        YearbookPage(project=project, page_number=42, section="Sports", assignee="Chris Bell", status="in_progress"),
    ]
    profile = ConnectedProfile(
        student=students[1], bio="Class of 2027 · Student leader and aspiring designer",
        current_city="Oak Park, Illinois", visibility="classmates", guardian_consent=True,
    )
    profile.social_links.append(SocialLink(platform="linkedin", url="https://www.linkedin.com", verified=True))
    profile.life_events.append(LifeEvent(title="Accepted a student leadership role", description="Serving the school community.", event_date=date.today(), approved=True))

    galleries = [
        Gallery(title="Senior Portraits", gallery_type="public", category="Portraits", published=True),
        Gallery(title="Family Stories", gallery_type="public", category="Family", published=True),
        Gallery(title="Picture Day Highlights", gallery_type="public", category="Schools", published=True),
    ]
    products = [
        Product(name="Classic Photo T-Shirt", category="Shirts", price_cents=2999),
        Product(name="Premium Photo Hoodie", category="Apparel", price_cents=5499),
        Product(name="Keepsake Photo Mug", category="Gifts", price_cents=1899),
        Product(name="Gallery Canvas Print", category="Wall Art", price_cents=6999),
    ]

    db.session.add_all([school, *pages, profile, *galleries, *products])
    db.session.commit()
    return True
