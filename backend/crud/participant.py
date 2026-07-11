from typing import List

from sqlalchemy.orm import Session

import models


def add_participant(
    db: Session, meeting: models.Meeting, display_name: str, is_host: bool = False
) -> models.Participant:
    participant = models.Participant(
        meeting_id=meeting.id, display_name=display_name, is_host=is_host
    )
    db.add(participant)
    db.commit()
    db.refresh(participant)
    return participant


def list_for_meeting(db: Session, meeting: models.Meeting) -> List[models.Participant]:
    return (
        db.query(models.Participant)
        .filter(models.Participant.meeting_id == meeting.id)
        .order_by(models.Participant.joined_at.asc())
        .all()
    )


def get_host_by_name(
    db: Session, meeting: models.Meeting, display_name: str
) -> models.Participant | None:
    """Return the host participant record if display_name matches the meeting host, else None."""
    return (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.display_name == display_name,
            models.Participant.is_host == True,  # noqa: E712
        )
        .first()
    )


def is_meeting_host(db: Session, meeting: models.Meeting, participant_id: str) -> bool:
    """True only if participant_id belongs to a participant of THIS meeting who is host."""
    participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.id == participant_id,
            models.Participant.meeting_id == meeting.id,
        )
        .first()
    )
    return participant is not None and participant.is_host

def mute_all(db: Session, meeting: models.Meeting) -> int:
    """Mute all non-host participants. Returns count of muted participants."""
    participants = (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.is_host == False,  # noqa: E712
        )
        .all()
    )
    for p in participants:
        p.is_muted = True
    db.commit()
    return len(participants)


def remove_participant(
    db: Session, meeting: models.Meeting, participant_id: str
) -> None:
    """Remove a participant from the meeting."""
    participant = (
        db.query(models.Participant)
        .filter(
            models.Participant.meeting_id == meeting.id,
            models.Participant.id == participant_id,
        )
        .first()
    )
    if participant:
        db.delete(participant)
        db.commit()
