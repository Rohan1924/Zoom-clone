import os
from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

import models
import schemas
from utils.id_generator import generate_meeting_id

# The frontend origin is only needed to build a shareable invite link.
# We compute the link on the fly rather than storing it in the DB, so it
# never goes stale if the deployed domain changes.
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


def _unique_meeting_id(db: Session) -> str:
    """Keeps generating a 9-digit code until it finds one not already used."""
    while True:
        candidate = generate_meeting_id()
        exists = db.query(models.Meeting).filter(
            models.Meeting.meeting_id == candidate
        ).first()
        if not exists:
            return candidate


def _status_for(meeting: models.Meeting) -> str:
    """Derives a status label from scheduled_time instead of storing one."""
    if meeting.scheduled_time is None:
        return "instant"
    if meeting.scheduled_time >= datetime.utcnow():
        return "upcoming"
    return "recent"


def to_meeting_out(meeting: models.Meeting) -> schemas.MeetingOut:
    return schemas.MeetingOut(
        id=meeting.id,
        meeting_id=meeting.meeting_id,
        title=meeting.title,
        description=meeting.description,
        scheduled_time=meeting.scheduled_time,
        duration_minutes=meeting.duration_minutes,
        invite_link=f"{FRONTEND_URL}/meeting/{meeting.meeting_id}",
        status=_status_for(meeting),
        created_at=meeting.created_at,
    )


def create_instant_meeting(
    db: Session, payload: schemas.MeetingCreateInstant
) -> models.Meeting:
    meeting = models.Meeting(
        meeting_id=_unique_meeting_id(db),
        title=payload.title,
        scheduled_time=None,
        duration_minutes=None,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    host = models.Participant(
        meeting_id=meeting.id, display_name=payload.host_name, is_host=True
    )
    db.add(host)
    db.commit()

    return meeting


def create_scheduled_meeting(
    db: Session, payload: schemas.MeetingCreateSchedule
) -> models.Meeting:
    meeting = models.Meeting(
        meeting_id=_unique_meeting_id(db),
        title=payload.title,
        description=payload.description,
        scheduled_time=payload.scheduled_time,
        duration_minutes=payload.duration_minutes,
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)

    # The scheduler is treated as the host so the frontend can grant them
    # host controls the moment they join their own meeting later.
    host = models.Participant(
        meeting_id=meeting.id, display_name=payload.host_name, is_host=True
    )
    db.add(host)
    db.commit()

    return meeting


def get_by_meeting_id(db: Session, meeting_id: str) -> Optional[models.Meeting]:
    return db.query(models.Meeting).filter(
        models.Meeting.meeting_id == meeting_id
    ).first()


def list_upcoming(db: Session, limit: int = 20) -> List[models.Meeting]:
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.scheduled_time != None)  # noqa: E711
        .filter(models.Meeting.scheduled_time >= datetime.utcnow())
        .order_by(models.Meeting.scheduled_time.asc())
        .limit(limit)
        .all()
    )


def list_recent(db: Session, limit: int = 20) -> List[models.Meeting]:
    return (
        db.query(models.Meeting)
        .filter(
            (models.Meeting.scheduled_time == None)  # noqa: E711
            | (models.Meeting.scheduled_time < datetime.utcnow())
        )
        .order_by(models.Meeting.created_at.desc())
        .limit(limit)
        .all()
    )
