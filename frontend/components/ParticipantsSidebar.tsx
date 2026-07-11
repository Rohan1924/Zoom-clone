"use client";

import { Users, Crown } from "lucide-react";
import type { Participant } from "@/lib/types";

interface Props {
  participants: Participant[];
  loading: boolean;
}

export default function ParticipantsSidebar({ participants, loading }: Props) {
  return (
    <div
      style={{
        background: "var(--color-room-tile)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Users size={16} color="rgba(255,255,255,0.5)" />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(255,255,255,0.7)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Participants
        </span>
        <span
          style={{
            marginLeft: "auto",
            padding: "2px 8px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {participants.length}
        </span>
      </div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" }}>
            Loading…
          </p>
        ) : participants.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textAlign: "center" }}>
            No participants yet
          </p>
        ) : (
          participants.map((p) => {
            const initials = p.display_name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: p.is_host
                      ? "linear-gradient(135deg, #ff7a45 0%, #ff5b20 100%)"
                      : "linear-gradient(135deg, #2f5fff 0%, #7c3aed 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.display_name}
                  </p>
                </div>
                {p.is_host && (
                  <span title="Host">
                    <Crown size={14} color="#ffb800" />
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
