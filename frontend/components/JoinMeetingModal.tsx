"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ChevronDown } from "lucide-react";
import Modal from "@/components/Modal";
import { getMeeting } from "@/lib/api";
import { useStore } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function JoinMeetingModal({ open, onClose }: Props) {
  const router = useRouter();
  const { displayName, setDisplayName } = useStore();
  const [meetingId, setMeetingId] = useState("");
  const [name, setName] = useState(displayName || "");
  const [noAudio, setNoAudio] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    const id = meetingId.trim();
    const nm = name.trim();
    if (!id) { toast.error("Enter a meeting ID"); return; }
    if (!nm) { toast.error("Enter your name"); return; }
    setDisplayName(nm);
    setLoading(true);
    try {
      await getMeeting(id);
      onClose();
      router.push(`/meeting/${id}?noAudio=${noAudio}&noVideo=${noVideo}`);
    } catch {
      toast.error("Meeting not found. Check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Join meeting">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Meeting ID — dropdown-style input like Zoom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--z-bg)",
            border: "2px solid var(--z-blue)",
            borderRadius: 8,
            padding: "0 12px",
            height: 44,
          }}
        >
          <input
            type="text"
            placeholder="Meeting ID or personal link name"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--z-text)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              letterSpacing: "0.5px",
            }}
          />
          <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
        </div>

        {/* Name input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--z-bg)",
            border: "1px solid var(--z-border-strong)",
            borderRadius: 8,
            padding: "0 12px",
            height: 44,
          }}
        >
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--z-text)",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "2px 0" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--z-text-muted)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={noAudio}
              onChange={(e) => setNoAudio(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--z-blue)", cursor: "pointer" }}
            />
            Don&apos;t connect to audio
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--z-text-muted)",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={noVideo}
              onChange={(e) => setNoVideo(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--z-blue)", cursor: "pointer" }}
            />
            Turn off my video
          </label>
        </div>

        {/* Buttons row */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 4,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 6,
              background: "var(--z-surface-2)",
              border: "1px solid var(--z-border-strong)",
              color: "var(--z-text-muted)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={loading || !meetingId.trim()}
            style={{
              padding: "8px 24px",
              borderRadius: 6,
              background: !meetingId.trim() ? "rgba(26,111,224,0.4)" : "var(--z-blue)",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: meetingId.trim() ? "pointer" : "not-allowed",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Join
          </button>
        </div>
      </div>
    </Modal>
  );
}
