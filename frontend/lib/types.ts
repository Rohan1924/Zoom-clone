// TypeScript types — mirror the FastAPI Pydantic schemas exactly

export interface Meeting {
  id: string;
  meeting_id: string;
  title: string;
  description?: string | null;
  scheduled_time?: string | null;
  duration_minutes?: number | null;
  invite_link: string;
  status: "instant" | "upcoming" | "recent";
  created_at: string;
}

export interface Participant {
  id: string;
  display_name: string;
  is_host: boolean;
  is_muted: boolean;
  joined_at: string;
}


export interface JoinMeetingResponse {
  meeting: Meeting;
  participant: Participant;
}

// Request payloads
export interface CreateInstantPayload {
  title?: string;
  host_name?: string;
}

export interface CreateScheduledPayload {
  title: string;
  description?: string;
  scheduled_time: string; // ISO string
  duration_minutes: number;
  host_name?: string;
}

export interface JoinMeetingPayload {
  display_name: string;
}
