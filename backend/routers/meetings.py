from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import crud.meeting as meeting_crud
import schemas
from database import get_db

router = APIRouter(prefix="/meetings", tags=["meetings"])


@router.post("/instant", response_model=schemas.MeetingOut, status_code=201)
def create_instant_meeting(
    payload: schemas.MeetingCreateInstant, db: Session = Depends(get_db)
):
    meeting = meeting_crud.create_instant_meeting(db, payload)
    return meeting_crud.to_meeting_out(meeting)


@router.post("/scheduled", response_model=schemas.MeetingOut, status_code=201)
def create_scheduled_meeting(
    payload: schemas.MeetingCreateSchedule, db: Session = Depends(get_db)
):
    meeting = meeting_crud.create_scheduled_meeting(db, payload)
    return meeting_crud.to_meeting_out(meeting)


@router.get("/upcoming", response_model=List[schemas.MeetingOut])
def list_upcoming_meetings(db: Session = Depends(get_db)):
    meetings = meeting_crud.list_upcoming(db)
    return [meeting_crud.to_meeting_out(m) for m in meetings]


@router.get("/recent", response_model=List[schemas.MeetingOut])
def list_recent_meetings(db: Session = Depends(get_db)):
    meetings = meeting_crud.list_recent(db)
    return [meeting_crud.to_meeting_out(m) for m in meetings]


@router.get("/{meeting_id}", response_model=schemas.MeetingOut)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = meeting_crud.get_by_meeting_id(db, meeting_id)
    if meeting is None:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting_crud.to_meeting_out(meeting)
