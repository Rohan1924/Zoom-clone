"use client";

import { Mic, MicOff, Video, VideoOff, Link, PhoneOff } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  micOn: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  inviteLink: string;
  meetingId: string;
  onLeave: () => void;
}

export default function BottomToolbar({
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  inviteLink,
  meetingId,
  onLeave,
}: Props) {
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      style={{
        background: "var(--color-room-bar)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Meeting ID */}
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          Meeting ID
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "1px",
            fontFamily: "monospace",
          }}
        >
          {meetingId}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10 }}>
        {/* Mic */}
        <button
          className={`toolbar-btn${!micOn ? " danger" : ""}`}
          onClick={onToggleMic}
          title={micOn ? "Mute" : "Unmute"}
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          <span>{micOn ? "Mute" : "Unmute"}</span>
        </button>

        {/* Camera */}
        <button
          className={`toolbar-btn${!cameraOn ? " danger" : ""}`}
          onClick={onToggleCamera}
          title={cameraOn ? "Stop Video" : "Start Video"}
        >
          {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          <span>{cameraOn ? "Stop Video" : "Start Video"}</span>
        </button>

        {/* Copy link */}
        <button className="toolbar-btn" onClick={copyLink} title="Copy invite link">
          <Link size={20} />
          <span>Copy Link</span>
        </button>
      </div>

      {/* Leave */}
      <button className="btn-danger" onClick={onLeave} style={{ padding: "9px 20px" }}>
        <PhoneOff size={16} />
        Leave
      </button>
    </div>
  );
}
