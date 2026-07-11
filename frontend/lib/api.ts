import axios from "axios";
import type {
  Meeting,
  Participant,
  JoinMeetingResponse,
  CreateInstantPayload,
  CreateScheduledPayload,
  JoinMeetingPayload,
} from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// ── Meetings ─────────────────────────────────────────────────

export async function createInstantMeeting(
  payload: CreateInstantPayload = {}
): Promise<Meeting> {
  const { data } = await api.post<Meeting>("/meetings/instant", payload);
  return data;
}

export async function createScheduledMeeting(
  payload: CreateScheduledPayload
): Promise<Meeting> {
  const { data } = await api.post<Meeting>("/meetings/scheduled", payload);
  return data;
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  const { data } = await api.get<Meeting[]>("/meetings/upcoming");
  return data;
}

export async function getRecentMeetings(): Promise<Meeting[]> {
  const { data } = await api.get<Meeting[]>("/meetings/recent");
  return data;
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  const { data } = await api.get<Meeting>(`/meetings/${meetingId}`);
  return data;
}

// ── Participants ──────────────────────────────────────────────

export async function joinMeeting(
  meetingId: string,
  payload: JoinMeetingPayload
): Promise<JoinMeetingResponse> {
  const { data } = await api.post<JoinMeetingResponse>(
    `/meetings/${meetingId}/join`,
    payload
  );
  return data;
}

export async function getMeetingParticipants(
  meetingId: string
): Promise<Participant[]> {
  const { data } = await api.get<Participant[]>(
    `/meetings/${meetingId}/participants`
  );
  return data;
}

export async function muteAllParticipants(
  meetingId: string,
  hostParticipantId: string
): Promise<{ muted_count: number }> {
  const { data } = await api.post<{ muted_count: number }>(
    `/meetings/${meetingId}/mute-all`,
    { host_participant_id: hostParticipantId }
  );
  return data;
}

export async function removeParticipant(
  meetingId: string,
  participantId: string,
  hostParticipantId: string
): Promise<void> {
  await api.post(`/meetings/${meetingId}/remove/${participantId}`, {
    host_participant_id: hostParticipantId,
  });
}

