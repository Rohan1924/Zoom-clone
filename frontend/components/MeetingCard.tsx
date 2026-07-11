"use client";

import { Calendar, Clock, Users } from "lucide-react";
import type { Meeting } from "@/lib/types";

interface MeetingCardProps {
  meeting: Meeting;
  onJoin?: (meeting: Meeting) => void;
}

function formatDate(dt?: string | null): string {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  upcoming: {
    bg: "var(--color-primary-tint)",
    color: "var(--color-primary)",
    label: "Upcoming",
  },
  recent: {
    bg: "#f0fdf4",
    color: "var(--color-success)",
    label: "Completed",
  },
  instant: {
    bg: "var(--color-accent-tint)",
    color: "var(--color-accent)",
    label: "Instant",
  },
};

export default function MeetingCard({ meeting, onJoin }: MeetingCardProps) {
  const badge = STATUS_STYLES[meeting.status] ?? STATUS_STYLES.instant;

  return (
    <div
      className="card"
      style={{
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 20px rgba(23,26,35,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      {/* Left: icon + info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: badge.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Calendar size={20} color={badge.color} />
        </div>

        <div style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: 15,
              color: "var(--color-text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {meeting.title}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 4,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "var(--color-text-muted)",
              }}
            >
              <Clock size={12} />
              {meeting.scheduled_time
                ? formatDate(meeting.scheduled_time)
                : "Now"}
            </span>
            {meeting.duration_minutes && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                {meeting.duration_minutes} min
              </span>
            )}
          </div>
          <code
            style={{
              fontSize: 11,
              color: "var(--color-text-faint)",
              marginTop: 2,
              display: "block",
            }}
          >
            {meeting.meeting_id}
          </code>
        </div>
      </div>

      {/* Right: badge + join */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            background: badge.bg,
            color: badge.color,
          }}
        >
          {badge.label}
        </span>
        {onJoin && (
          <button
            className="btn-primary"
            onClick={() => onJoin(meeting)}
            style={{ padding: "7px 14px", fontSize: 13 }}
          >
            <Users size={14} />
            Join
          </button>
        )}
      </div>
    </div>
  );
}
