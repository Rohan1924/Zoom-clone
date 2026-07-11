"use client";

import { useEffect, useRef } from "react";
import { MicOff, VideoOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  micOn: boolean;
  cameraOn: boolean;
  displayName: string;
  isLoading: boolean;
  error: string | null;
}

export default function VideoTile({
  stream,
  micOn,
  cameraOn,
  displayName,
  isLoading,
  error,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ME";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        maxHeight: "70vh",
        background: "var(--color-room-tile)",
        borderRadius: 16,
        overflow: "hidden",
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
          display: stream && cameraOn ? "block" : "none",
          transform: "scaleX(-1)", // mirror like Zoom
        }}
      />

      {/* Avatar fallback (loading / camera off / error) */}
      {(!stream || !cameraOn || isLoading) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2f5fff 0%, #7c3aed 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {isLoading ? "…" : initials}
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
            {isLoading
              ? "Starting camera…"
              : error
              ? error
              : "Camera off"}
          </p>
        </div>
      )}

      {/* Name tag */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 14,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          borderRadius: 8,
          padding: "4px 10px",
          color: "#fff",
          fontSize: 13,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {!micOn && <MicOff size={12} color="#ff7b7f" />}
        {displayName || "You"} (You)
      </div>

      {/* Camera-off overlay icon */}
      {!cameraOn && !isLoading && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(229,72,77,0.2)",
            borderRadius: 8,
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: "#ff7b7f",
            fontSize: 12,
          }}
        >
          <VideoOff size={12} />
          Off
        </div>
      )}
    </div>
  );
}
