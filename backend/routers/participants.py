from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud.meeting as meeting_crud
import crud.participant as participant_crud
import schemas
from database import get_db

# Nested under /meetings/{meeting_id} since a participant only ever makes
# sense in the context of a specific meeting.
router = APIRouter(prefix="/meetings/{meeting_id}", tags=["participants"])


@router.post("/join", response_model=schemas.JoinMeetingResponse, status_code=201)
def join_meeting(
    meeting_id: str,
    payload: schemas.JoinMeetingRequest,
    db: Session = Depends(get_db),
):
    meeting = meeting_crud.get_by_meeting_id(db, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participant = participant_crud.add_participant(
        db, meeting=meeting, display_name=payload.display_name, is_host=False
    )
    return schemas.JoinMeetingResponse(
        meeting=meeting_crud.to_meeting_out(meeting),
        participant=participant,
    )


@router.get("/participants", response_model=List[schemas.ParticipantOut])
def list_participants(meeting_id: str, db: Session = Depends(get_db)):
    meeting = meeting_crud.get_by_meeting_id(db, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    return participant_crud.list_for_meeting(db, meeting)


@router.post("/mute-all", response_model=schemas.MuteAllResponse)
def mute_all_participants(meeting_id: str, db: Session = Depends(get_db)):
    """Host control: mark all non-host participants as muted."""
    meeting = meeting_crud.get_by_meeting_id(db, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    count = participant_crud.mute_all(db, meeting)
    return schemas.MuteAllResponse(muted_count=count)


@router.post("/remove/{participant_id}", status_code=204)
def remove_participant(
    meeting_id: str,
    participant_id: str,
    db: Session = Depends(get_db),
):
    """Host control: remove a participant from the meeting."""
    meeting = meeting_crud.get_by_meeting_id(db, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")

    participant_crud.remove_participant(db, meeting, participant_id)
