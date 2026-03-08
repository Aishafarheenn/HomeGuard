import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from middleware.db import init_db, get_db_session

from app.users.models import Owner
from app.admin.models import Admin
from app.inspector.models import Inspector
from app.properties.models import Property
from app.inspection.models import (
    InspectionSchedule,
    JobTickets,
    Inspection,
    GeoVerification,
    Checklist,
    InspectionChecklistResults,
    InspectionPackage,
)
from app.notifications.models import Notification
from app.reports.models import Evidence, RedFlag, InspectionReport


def seed_basic_data(db: Session) -> None:
    """
    Insert a small set of demo data into the database.

    This is meant purely for educational/demo purposes.
    It will NOT run if there is already an Owner in the database,
    to avoid creating duplicate records on repeated runs.
    """

    # Simple guard: if we already have owners, assume data was seeded
    if db.query(Owner).count() > 0:
        print("✅ Seed data already present, skipping.")
        return

    # --- Core users ---
    admin = Admin(
        id=uuid.uuid4(),
        full_name="System Admin",
        email="admin@example.com",
        password_hash="hashed-admin-password",
        phone="+10000000000",
    )

    owner = Owner(
        id=uuid.uuid4(),
        full_name="John Doe",
        email="owner@example.com",
        password_hash="hashed-owner-password",
        phone="+19999999999",
        country="Wonderland",
    )

    inspector = Inspector(
        id=uuid.uuid4(),
        full_name="Jane Inspector",
        email="inspector@example.com",
        password_hash="hashed-inspector-password",
        phone="+18888888888",
        status="active",
        admin=admin,
    )

    # --- Property & inspection package ---
    package_basic = InspectionPackage(
        id=uuid.uuid4(),
        name="Basic Safety Check",
        description="Basic safety inspection for a residential property.",
        price=100,
    )

    property_1 = Property(
        id=uuid.uuid4(),
        owner=owner,
        address="123 Demo Street, Sample City",
        latitude=10.1234,
        longitude=20.5678,
    )

    # --- Schedule & job ticket ---
    schedule = InspectionSchedule(
        id=uuid.uuid4(),
        owner=owner,
        property=property_1,
        package=package_basic,
        scheduled_date=None,  # can be updated later
        frequency="once",
        status="scheduled",
    )

    job_ticket = JobTickets(
        id=uuid.uuid4(),
        schedule=schedule,
        inspector=inspector,
        status="assigned",
    )

    # --- Inspection and geo verification ---
    inspection = Inspection(
        id=uuid.uuid4(),
        job_ticket=job_ticket,
        overall_status="pending",
    )

    geo_log = GeoVerification(
        id=uuid.uuid4(),
        inspection=inspection,
        latitude=10.1234,
        longitude=20.5678,
        distance_from_property=0.0,
        verified=True,
    )

    # --- Checklist & results ---
    checklist_item = Checklist(
        id=uuid.uuid4(),
        package=package_basic,
        area_name="Main Entrance",
    )

    checklist_result = InspectionChecklistResults(
        id=uuid.uuid4(),
        inspection=inspection,
        checklist=checklist_item,
        status="ok",
        remark="No issues found.",
    )

    # --- Evidence, red flag, report ---
    evidence = Evidence(
        id=uuid.uuid4(),
        inspection=inspection,
        checklist=checklist_item,
        media_type="photo",
        media_url="https://example.com/evidence/photo1.jpg",
    )

    red_flag = RedFlag(
        id=uuid.uuid4(),
        inspection=inspection,
        category="structure",
        severity="low",
        description="Minor crack in exterior wall.",
    )

    report = InspectionReport(
        id=uuid.uuid4(),
        inspection=inspection,
        report_url="https://example.com/reports/inspection1.pdf",
    )

    # --- Notification example ---
    notification = Notification(
        id=uuid.uuid4(),
        user_id=owner.id,
        user_type="owner",
        message="Your inspection has been scheduled.",
        is_read=False,
        owner=owner,
        status="sent",
    )

    db.add_all(
        [
            admin,
            owner,
            inspector,
            package_basic,
            property_1,
            schedule,
            job_ticket,
            inspection,
            geo_log,
            checklist_item,
            checklist_result,
            evidence,
            red_flag,
            report,
            notification,
        ]
    )


def main() -> None:
    # Ensure database and tables are created
    init_db()

    db = get_db_session()
    try:
        seed_basic_data(db)
        db.commit()
        print("✅ Seed data inserted successfully.")
    except IntegrityError as exc:
        db.rollback()
        print(f"❌ Integrity error while seeding data: {exc}")
    except Exception as exc:
        db.rollback()
        print(f"❌ Unexpected error while seeding data: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

