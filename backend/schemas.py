from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------- Requests ----------

class MeetingCreateInstant(BaseModel):
    title: str = "Instant Meeting"
    host_name: str = "Host"


class MeetingCreateSchedule(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_time: datetime
    duration_minutes: int = Field(gt=0, default=30)
    host_name: str = "Host"


class JoinMeetingRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=50)

class HostAction(BaseModel):
    host_participant_id: str = Field(
        ..., description="Caller's own participant_id, verified server-side against is_host"
    )


# ---------- Responses ----------

class ParticipantOut(BaseModel):
    id: str
    display_name: str
    is_host: bool
    is_muted: bool = False
    joined_at: datetime

    class Config:
        from_attributes = True


class MuteAllResponse(BaseModel):
    muted_count: int


class MeetingOut(BaseModel):
    id: str
    meeting_id: str
    title: str
    description: Optional[str] = None
    scheduled_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    invite_link: str
    status: str  # "instant" | "upcoming" | "recent" -- computed, never stored
    created_at: datetime

    class Config:
        from_attributes = True


class MeetingWithParticipants(MeetingOut):
    participants: List[ParticipantOut] = []


class JoinMeetingResponse(BaseModel):
    meeting: MeetingOut
    participant: ParticipantOut


class ErrorResponse(BaseModel):
    detail: str
