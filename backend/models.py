import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Meeting(Base):
    """
    A meeting, either instant or scheduled.

    `id` is the internal primary key (UUID) used for foreign keys.
    `meeting_id` is the public, Zoom-style code (e.g. 823-912-456) that
    users actually type in to join. Keeping these separate means the
    public-facing ID can be short and human-friendly without weakening
    the primary key.

    We deliberately do NOT store a `status` column. Whether a meeting is
    "upcoming" or "recent" is derived from `scheduled_time` vs. now at
    query time (see crud/meeting.py) so the value can never go stale.
    """

    __tablename__ = "meetings"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    scheduled_time = Column(DateTime, nullable=True)  # NULL for instant meetings
    duration_minutes = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    participants = relationship(
        "Participant", back_populates="meeting", cascade="all, delete-orphan"
    )


class Participant(Base):
    """
    A person who has joined a meeting. `is_host` distinguishes the
    creator from later joiners -- there's no auth in this assignment,
    but keeping this normalized means host-only controls (mute all,
    end meeting) can be added later without a schema change.
    """

    __tablename__ = "participants"

    id = Column(String, primary_key=True, default=generate_uuid)
    meeting_id = Column(String, ForeignKey("meetings.id"), nullable=False)
    display_name = Column(String, nullable=False)
    is_host = Column(Boolean, default=False)
    is_muted = Column(Boolean, default=False)
    joined_at = Column(DateTime, default=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="participants")
