"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mic, MicOff, Video, VideoOff, X, Loader2 } from "lucide-react";
import { createInstantMeeting } from "@/lib/api";
import { useStore } from "@/lib/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function NewMeetingModal({ open, onClose }: Props) {
  const router = useRouter();
  const { displayName, setDisplayName } = useStore();
  const [name, setName] = useState(displayName || "");
  const [loading, setLoading] = useState(false);

  // Camera preview state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [alwaysPreview] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start camera as soon as modal opens
  useEffect(() => {
    if (!open) return;
    let active = true;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((s) => {
        if (!active) { s.getTracks().forEach((t) => t.stop()); return; }
        setStream(s);
      })
      .catch(() => setStream(null));
    return () => {
      active = false;
    };
  }, [open]);

  // Clean up stream on close
  useEffect(() => {
    if (!open && stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [open, stream]);

  // Wire stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleMic = () => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((p) => !p);
  };

  const toggleVideo = () => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = !videoOn));
    setVideoOn((p) => !p);
  };

  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Please enter your name"); return; }
    setDisplayName(trimmed);
    setLoading(true);
    // Stop the preview stream before navigating
    stream?.getTracks().forEach((t) => t.stop());
    try {
      const meeting = await createInstantMeeting({ title: "Instant Meeting", host_name: trimmed });
      onClose();
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch {
      toast.error("Failed to create meeting. Is the backend running?");
      setLoading(false);
    }
  };

  if (!open) return null;

  const initials = name.trim()
    ? name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div
      onClick={(e) => e.currentTarget === e.target && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Zoom-style preview card */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#1a1a1e",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        {/* Title bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 16px",
            background: "#232328",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#e86c2b" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              {name.trim() ? `${name.trim()}'s Zoom Meeting` : "New Meeting"}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", display: "flex" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Video preview */}
        <div
          style={{
            position: "relative",
            aspectRatio: "16/9",
            background: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Live video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: stream && videoOn ? "block" : "none",
              transform: "scaleX(-1)",
            }}
          />

          {/* Avatar when camera off */}
          {(!stream || !videoOn) && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#1a1a1e",
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "#e86c2b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {initials}
              </div>
            </div>
          )}

          {/* Audio + Video toggle buttons — overlaid on video like Zoom */}
          <div
            style={{
              position: "absolute",
              bottom: 14,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 10,
            }}
          >
            <button
              onClick={toggleMic}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "8px 18px",
                borderRadius: 8,
                background: micOn ? "rgba(30,30,40,0.85)" : "rgba(229,72,77,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "var(--font-sans)",
                backdropFilter: "blur(4px)",
              }}
            >
              {micOn ? <Mic size={18} /> : <MicOff size={18} />}
              Audio
            </button>
            <button
              onClick={toggleVideo}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                padding: "8px 18px",
                borderRadius: 8,
                background: videoOn ? "rgba(30,30,40,0.85)" : "rgba(229,72,77,0.85)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 11,
                fontFamily: "var(--font-sans)",
                backdropFilter: "blur(4px)",
              }}
            >
              {videoOn ? <Video size={18} /> : <VideoOff size={18} />}
              Video
            </button>
          </div>
        </div>

        {/* Device selectors (decorative, like Zoom) */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "10px 14px",
            background: "#141418",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#232328",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            <Mic size={12} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Default Microphone
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#232328",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            <Video size={12} color="rgba(255,255,255,0.5)" />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Default Camera
            </span>
          </div>
        </div>

        {/* Name input + always show checkbox + Start button */}
        <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="text"
            placeholder="Your name (e.g. Rohan R)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            autoFocus
            style={{
              background: "var(--z-bg)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 6,
              padding: "9px 14px",
              color: "#fff",
              fontSize: 14,
              fontFamily: "var(--font-sans)",
              outline: "none",
              width: "100%",
            }}
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <input
              type="checkbox"
              checked={alwaysPreview}
              readOnly
              style={{ accentColor: "#1a6fe0", width: 14, height: 14 }}
            />
            Always show this preview when joining
          </label>

          <button
            onClick={handleStart}
            disabled={loading || !name.trim()}
            style={{
              alignSelf: "flex-end",
              padding: "9px 32px",
              borderRadius: 6,
              background: !name.trim() ? "rgba(26,111,224,0.4)" : "#1a6fe0",
              border: "none",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: name.trim() ? "pointer" : "not-allowed",
              fontFamily: "var(--font-sans)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "background 0.15s",
            }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
