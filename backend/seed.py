"""
Populates the DB with sample meetings so the dashboard isn't empty on
first run. Safe to re-run -- it only inserts if the meetings table is
still empty.

Usage: python seed.py
"""
from datetime import datetime, timedelta

from database import Base, SessionLocal, engine
import models
from utils.id_generator import generate_meeting_id

Base.metadata.create_all(bind=engine)


def _meeting_id(db) -> str:
    while True:
        candidate = generate_meeting_id()
        if not db.query(models.Meeting).filter_by(meeting_id=candidate).first():
            return candidate


def seed():
    db = SessionLocal()
    try:
        if db.query(models.Meeting).count() > 0:
            print("Meetings already exist -- skipping seed.")
            return

        now = datetime.utcnow()

        upcoming = [
            ("Daily Standup", "Quick sync on blockers", now + timedelta(hours=14), 15),
            ("AI Interview Prep", "Mock technical round", now + timedelta(days=1, hours=3), 60),
            ("Scaler Mock Interview", "System design practice", now + timedelta(days=3), 45),
        ]
        recent = [
            ("Sprint Retro", "What went well / what didn't", now - timedelta(days=1), 30),
            ("Onboarding Call", "Walkthrough of the codebase", now - timedelta(days=2), 45),
        ]

        for title, description, scheduled_time, duration in upcoming + recent:
            meeting = models.Meeting(
                meeting_id=_meeting_id(db),
                title=title,
                description=description,
                scheduled_time=scheduled_time,
                duration_minutes=duration,
            )
            db.add(meeting)
            db.commit()
            db.refresh(meeting)
            db.add(models.Participant(
                meeting_id=meeting.id, display_name="Host", is_host=True
            ))
            db.commit()

        print(f"Seeded {len(upcoming) + len(recent)} meetings.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
